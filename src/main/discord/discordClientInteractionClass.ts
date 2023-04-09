import {
  VoiceConnection,
  VoiceConnectionStatus,
  createAudioPlayer,
  createAudioResource,
  entersState,
  joinVoiceChannel,
} from '@discordjs/voice';
import { Client, Collection, Guild, GuildBasedChannel } from 'discord.js';

import { BrowserWindow } from 'electron';
import fluentFfmpeg, { FfmpegCommand } from 'fluent-ffmpeg';
import { PassThrough } from 'stream';

var pathToFfmpeg = require('ffmpeg-static');
fluentFfmpeg.setFfmpegPath(pathToFfmpeg);

export class DiscordClientInteraction {
  private static client: Client;
  private static currentVoiceConnection: VoiceConnection;
  private static audioPlayer = createAudioPlayer();
  private static isPlaying: boolean = false;
  private static currentFfmpegCommand: FfmpegCommand | null;
  private static currentOpenStream: PassThrough | null;
  public static mainWindow: BrowserWindow;

  public static setClient(setClient: Client) {
    if (this.client) {
      throw new Error('Client is already set!');
    }

    this.client = setClient;
  }

  public static getGuilds(): {
    id: string;
    name: string;
    channels: Collection<string, GuildBasedChannel>;
  }[] {
    this.isClientSet();

    return this.client.guilds.cache.map((guild) => {
      const { id, name, channels } = guild;
      const fetchedChannels = channels.cache.filter(
        (channel) => channel.type === 2
      );
      return { id, name, channels: fetchedChannels };
    });
  }

  public static async fetchGuilds() {
    this.isClientSet();
    const fetched = await this.client.guilds.fetch();

    const fetched2 = await Promise.all(
      fetched.map(async (guild) => {
        const { id, name, channels } = await guild.fetch();
        const fetchedChannels = channels.cache.filter(
          (channel) => channel.type === 2
        );
        return { id, name, channels: fetchedChannels };
      })
    );

    return fetched2;
  }

  public static getGuildById(id: string): Guild | undefined {
    this.isClientSet();

    return this.client.guilds.cache.find((guild) => guild.id === id);
  }

  public static joinVoice(guildId: string, id: string) {
    this.isClientSet();

    if (this.currentVoiceConnection) {
      this.currentVoiceConnection.disconnect();
      this.currentVoiceConnection.destroy();
    }

    const guild = this.client.guilds.cache.get(guildId);

    if (!guild) {
      throw new Error('This channel does not exist.');
    }

    const channel = guild.channels.cache.get(id);

    if (!channel) {
      throw new Error('This channel does not exist.');
    }

    const connection = joinVoiceChannel({
      guildId: guild.id,
      channelId: channel.id,
      adapterCreator: guild.voiceAdapterCreator,
    });

    connection.removeAllListeners();

    connection.once(VoiceConnectionStatus.Ready, () => {
      console.log('Connected to voice! ');

      connection.subscribe(this.audioPlayer);
      const { name, id, ...rest } = channel;
      this.emitRender('VOICE_CHANGED', { name, id });

      this.audioPlayer.removeAllListeners();

      this.audioPlayer.on('error', (err) => {
        console.log(err);
        this.emitRenderError(new Error(`AudioPlayer error: ${err}`));
      });
    });

    connection.on(VoiceConnectionStatus.Disconnected, async () => {
      try {
        await Promise.race([
          entersState(connection, VoiceConnectionStatus.Signalling, 5_000),
          entersState(connection, VoiceConnectionStatus.Connecting, 5_000),
        ]);
      } catch (error) {
        connection.removeAllListeners();
        connection.destroy();
      }
    });

    return true;
  }

  public static togglePause() {
    if (this.isPlaying) {
      this.audioPlayer.pause();
      this.isPlaying = false;
    } else {
      this.audioPlayer.unpause();
      this.isPlaying = true;
    }

    this.mainWindow.webContents.send('RESOURCE_PAUSED', this.isPlaying);
  }

  public static playResource(path: string, seekTime: number = 0) {
    try {
      fluentFfmpeg(path).ffprobe((err, data) => {
        if (err) {
          console.log(err);
          this.emitRenderError(
            new Error(
              `Error probing file: ${path}. \nThis may be because file lacks metadata or is not probable. `
            )
          );
        }

        if (this.currentFfmpegCommand) {
          this.currentFfmpegCommand.kill('');
          this.currentFfmpegCommand = null;
        }

        if (this.currentOpenStream) {
          this.audioPlayer.stop(true);
          this.currentOpenStream.end();
        }

        this.currentOpenStream = new PassThrough({ autoDestroy: true });

        const maxDuration = Number(data.format.duration);
        const newResource = createAudioResource(this.currentOpenStream);

        this.currentFfmpegCommand = fluentFfmpeg(path)
          .setStartTime(seekTime ?? 0) // <-- making sure it's 0
          .format('mp3')
          .output(this.currentOpenStream, { end: true })
          .on('error', (err: Error) => {
            // Weird. but i couldn't get it to close properly..
            if (err.message === 'Error: Output stream error: Premature close') {
              return;
            }
            this.emitRenderError(
              new Error(`Error creating stream for file: ${path} `)
            );
          });

        this.currentFfmpegCommand.run();

        this.audioPlayer.play(newResource);
        this.isPlaying = true;

        this.emitRender('RESOURCE_STARTED', {
          maxDuration,
          seek: seekTime,
        });
        this.emitRender('RESOURCE_PAUSED', true);
      });
    } catch (err) {
      console.log(err);
      this.emitRenderError(
        new Error(`couldn\'t play the resource! ${(err as Error).message}`)
      );
    }
  }

  public static isClientSet(bool?: boolean) {
    if (!this.client) {
      if (bool) {
        return false;
      }

      throw new Error('Client is not set!');
    }

    return true;
  }

  private static emitRender(event: string, data: any) {
    this.mainWindow.webContents.send(event, data);
  }

  private static emitRenderError(data: any) {
    this.emitRender('MAIN_PROCESS_ERROR', data);
  }
}
