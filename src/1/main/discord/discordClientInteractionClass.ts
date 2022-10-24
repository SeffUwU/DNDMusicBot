import { Client, Guild } from 'discord.js';
import {
  entersState,
  joinVoiceChannel,
  VoiceConnection,
  VoiceConnectionStatus,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
} from '@discordjs/voice';
import * as fs from 'fs';

import ffmpeg from 'ffmpeg';

export class DiscordClientInteraction {
  private static client: Client;
  private static currentVoiceConnection: VoiceConnection;

  private static audioPlayer = createAudioPlayer();
  private static isPlaying: boolean = false;

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

  public static playResource(path: string) {
    try {
      const newResource = createAudioResource(path);

      this.audioPlayer.play(newResource);
      this.isPlaying = true;
    } catch (err) {
      console.log(err);
      throw new Error(`couldn\'t play the resource! ${(err as Error).message}`);
    }
  }

  public static isClientSet() {
    if (!this.client) {
      throw new Error('Client is not set!');
    }

    return true;
  }
}
