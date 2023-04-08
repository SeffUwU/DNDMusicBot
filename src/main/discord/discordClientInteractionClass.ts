import {
  VoiceConnection,
  VoiceConnectionStatus,
  createAudioPlayer,
  createAudioResource,
  entersState,
  joinVoiceChannel,
} from '@discordjs/voice';
import { Client, Guild } from 'discord.js';

import { BrowserWindow } from 'electron';
import fluentFfmpeg from 'fluent-ffmpeg';
import { PassThrough } from 'stream';
var pathToFfmpeg = require('ffmpeg-static');
fluentFfmpeg.setFfmpegPath(pathToFfmpeg);
export class DiscordClientInteraction {
  private static client: Client;
  private static currentVoiceConnection: VoiceConnection;
  public static mainWindow: BrowserWindow;
  private static audioPlayer = createAudioPlayer();
  private static isPlaying: boolean = false;
  private static currentlyPlayed: string;

  public static setClient(setClient: Client) {
    if (this.client) {
      throw new Error('Client is already set!');
    }

    this.client = setClient;
  }

  public static getGuilds(): { id: string; name: string }[] {
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

    connection.once(VoiceConnectionStatus.Ready, () => {
      console.log('Connected to voice! ');

      connection.subscribe(this.audioPlayer);

      this.audioPlayer.on('error', (err) => {
        console.log(err);
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
      return;
    }

    this.audioPlayer.unpause();
    this.isPlaying = true;
  }

  public static playResource(path: string, seekTime: number = 0) {
    try {
      const ps = new PassThrough();
      let maxDuration;

      fluentFfmpeg(path).ffprobe((err, data) => {
        maxDuration = Number(data.format.duration);

        fluentFfmpeg(path)
          .setStartTime(seekTime)
          .format('mp3')
          .output(ps, { end: true })
          .on('error', (err) => {
            console.error('FFMPEG ERROR', err);
          })
          .run();

        const newResource = createAudioResource(ps);

        this.audioPlayer.play(newResource);
        this.isPlaying = true;
        console.log(
          111,
          path !== this.currentlyPlayed,
          path,
          this.currentlyPlayed
        );
        path !== this.currentlyPlayed &&
          this.mainWindow.webContents.send('RESOURCE_STARTED', {
            maxDuration,
          });
        this.currentlyPlayed = path;
      });
    } catch (err) {
      console.log(err);
      throw new Error(`couldn\'t play the resource! ${(err as Error).message}`);
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
}
