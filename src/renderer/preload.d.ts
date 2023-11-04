import { Channels } from 'main/preload';
import { shortGuild } from './types/types';
import { FSType, YTMetaType } from 'sharedTypes/sharedTypes';

declare global {
  interface Window {
    electron: {
      ipcRenderer: {
        sendMessage(channel: Channels, args: unknown[]): void;
        on(channel: Channels, func: (...args: any[]) => void): () => void;
        once(channel: Channels, func: (...args: unknown[]) => void): void;
      };
      getFileList: (path: string) => Promise<FSType[]>;
      fetchGuilds: () => Promise<shortGuild[]>;
      connectVoice: (guildId: string, voiceId: string) => Promise<boolean>;
      togglePause: () => void;
      playResource: (path: string, seek?: number) => void;
      isClientSet: () => Promise<boolean>;
      startWithToken: (token: string, saveToken: boolean) => void;
      startWithSavedToken: () => void;
      quit: () => void;
      fetchLocalBotInfo: () => void;
      openMusicFolderDialog: () => void;
      playYTLink: (link: string, newDuration?: number) => void;
      saveLink: (info: YTMetaType) => void;
      removeLink: (link: string) => void;
      copyInviteURL: () => void;
      openLink: (link: string) => void;
    };
  }
}

export {};
