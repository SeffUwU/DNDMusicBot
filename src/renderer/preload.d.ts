import { Channels } from 'main/preload';
import { shortGuild } from './types/types';

declare global {
  interface Window {
    electron: {
      ipcRenderer: {
        sendMessage(channel: Channels, args: unknown[]): void;
        on(
          channel: Channels,
          func: (...args: any[]) => void
        ): (() => void) | undefined;
        once(channel: Channels, func: (...args: unknown[]) => void): void;
      };
      getFileList: (path: string) => Promise<string[]>;
      fetchGuilds: () => Promise<shortGuild[]>;
      connectVoice: (guildId: string, voiceId: string) => Promise<boolean>;
      togglePause: () => void;
      playResource: (path: string) => void;
      isClientSet: () => Promise<boolean>;
    };
  }
}

export {};
