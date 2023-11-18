import {
  NoSubscriberBehavior,
  VoiceConnection,
  VoiceConnectionStatus,
  createAudioPlayer,
  createAudioResource,
  entersState,
  joinVoiceChannel,
} from '@discordjs/voice';
import { Client, Collection, Guild, GuildBasedChannel } from 'discord.js';

import { BrowserWindow, app } from 'electron';
import fluentFfmpeg, { FfmpegCommand } from 'fluent-ffmpeg';
import { normalize } from 'path';
import { stream } from 'play-dl';
import { PassThrough, Readable } from 'stream';
import ytdl from 'ytdl-core';

const FfmpegPath = require('ffmpeg-static');

if (app.isPackaged) {
  fluentFfmpeg.setFfmpegPath(
    FfmpegPath.replace('app.asar', 'app.asar.unpacked')
  );
} else {
  fluentFfmpeg.setFfmpegPath(FfmpegPath);
}

console.log('\x1b[36m%s\x1b[0m', '$$ffmpeg path:', FfmpegPath);

/**
 * DiscordClientInteraction. A static class which provides methods to interact with discord and local FS
 */
export class DiscordClientInteraction {
  private static client: Client;
  private static currentVoiceConnection: VoiceConnection;
  private static audioPlayer = createAudioPlayer({
    behaviors: {
      noSubscriber: NoSubscriberBehavior.Play,
    },
  });
  private static isPlaying: boolean = false;
  private static currentFfmpegCommand: FfmpegCommand | null;
  private static currentOpenStream: PassThrough | null;
  public static mainWindow: BrowserWindow;
  public static currentOpenYTDLStream: Readable;
  public static getClientId() {
    if (!this.client?.user?.id) {
      this.emitRenderError('Discord client is not set', true);
      return;
    }
    return this.client.user.id;
  }
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

    return this.client.guilds.cache.get(id);
  }

  public static joinVoice(guildId: string, id: string) {
    this.isClientSet();

    if (this.currentVoiceConnection) {
      this.currentVoiceConnection.removeAllListeners();
      this.currentVoiceConnection.disconnect();
      this.currentVoiceConnection.destroy();
    }

    const guild = this.getGuildById(guildId);

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

      this.currentVoiceConnection = connection;
    });

    connection.on(VoiceConnectionStatus.Disconnected, async () => {
      try {
        await Promise.race([
          entersState(connection, VoiceConnectionStatus.Signalling, 5_000),
          entersState(connection, VoiceConnectionStatus.Connecting, 5_000),
        ]);
      } catch (error) {
        if (this.currentVoiceConnection) {
          this.currentVoiceConnection.removeAllListeners();
          this.currentVoiceConnection.disconnect();
          this.currentVoiceConnection.destroy();
        }
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
  public static playSound(soundPath?: string) {
    // how the hell do i do it???
    // i want to know...
    if (soundPath && this.currentFfmpegCommand) {
      this.currentFfmpegCommand
        .complexFilter([
          `[0:a]asetpts=PTS-STARTPTS,aresample=async=1[a0]`,
          `[1:a]apad[a1]`,
          `[a0][a1]amix=inputs=2`,
        ])
        .input(soundPath)
        .run();
      return;
    }
  }
  public static playResource(path: string, seekTime: number = 0) {
    try {
      path = String(normalize(path));
      if (this.currentFfmpegCommand) {
        this.currentFfmpegCommand.kill('');
        this.currentFfmpegCommand = null;
      }

      if (this.currentOpenStream) {
        this.currentOpenStream.removeAllListeners();
        this.currentOpenStream.destroy();
        this.audioPlayer.stop(true);
      }

      this.currentOpenStream = new PassThrough({ autoDestroy: true });

      const newResource = createAudioResource(this.currentOpenStream);

      let maxDuration: number = Math.round(newResource.playbackDuration / 1000);

      this.currentFfmpegCommand = fluentFfmpeg()
        .input(path)
        .setStartTime(seekTime ?? 0)

        .noVideo()
        .format('mp3')
        .output(this.currentOpenStream, { end: true })
        .on('codecData', (data) => {
          const split = data.duration.split(':');
          const hours = Number(split[0]);
          const minutes = Number(split[1]);
          const seconds = Number(split[2]);

          maxDuration = Math.round(hours * 60 * 60 + minutes * 60 + seconds);

          this.audioPlayer.play(newResource);
          this.isPlaying = true;
          this.emitRender('RESOURCE_STARTED', {
            maxDuration,
            seek: seekTime ?? 0,
          });

          this.emitRender('RESOURCE_PAUSED', true);
        })
        .on('error', (err: any) => {
          // Weird, but I couldn't get it to close properly...
          if (err.code === 'ERR_STREAM_PREMATURE_CLOSE') {
            return;
          }
          console.error(err);
          this.emitRenderError(
            new Error(`Error creating stream for file: ${path} `)
          );
        })
        .on('start', () => {});

      this.currentFfmpegCommand.run();
    } catch (err) {
      console.error(err);
      this.emitRenderError(
        new Error(`Couldn't play the resource! ${(err as Error).message}`)
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

  public static emitRender(event: string, data: any) {
    this.mainWindow.webContents.send(event, data);
  }

  public static emitRenderError(data: any, useToast = false) {
    if (useToast) {
      this.emitRender('ERROR_TOAST', data);
      return;
    }
    this.emitRender('MAIN_PROCESS_ERROR', data);
  }

  public static emitRenderInfo(title: string, description: string) {
    this.emitRender('INFO_TOAST', { description, title });
  }

  public static async playYtDLAudio(url: string, newDuration: number = 0) {
    if (this.currentFfmpegCommand) {
      this.currentFfmpegCommand?.kill('');
      this.currentFfmpegCommand = null;
    }

    if (this.currentOpenStream) {
      this.audioPlayer.stop(true);
      this.currentOpenStream.end();
    }

    if (this.currentOpenYTDLStream) {
      this.currentOpenYTDLStream.destroy();
    }

    this.currentOpenStream = new PassThrough({ autoDestroy: true });

    const ytstream = await stream(url, {
      discordPlayerCompatibility: true,
      seek: newDuration,
    });

    const ytInfo = await ytdl.getBasicInfo(url);

    const newResource = createAudioResource(ytstream.stream, {
      inputType: ytstream.type,
    });

    this.audioPlayer.play(newResource);

    this.emitRender('YT_META', {
      lengthSeconds: ytInfo.videoDetails.lengthSeconds,
      link: url,
      title: ytInfo.videoDetails.title,
    });
  }
}
