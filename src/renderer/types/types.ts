import { VoiceChannel } from 'discord.js';
import { ChangeEvent } from 'react';
import { locale } from 'renderer/locale/locale';

export type shortGuild = {
  id: string;
  name: string;
  channels: Map<string, VoiceChannel> | null;
};

export type PlayerSettingsType = {
  repeat: boolean;
  autoplay: boolean;
  shuffle: boolean;
};

export type allowedLocale = 'en' | 'ru';
export type localeKeys = keyof (typeof locale)[allowedLocale];
export type getTranslationFn = (key: localeKeys) => string;

export type DrillThruProps = {
  getTranslation: getTranslationFn;
  onSettingChange: (
    setting: string
  ) => (event: ChangeEvent<HTMLInputElement>) => void;
  playerSettings: PlayerSettingsType;
  setLanguage: React.Dispatch<React.SetStateAction<allowedLocale>>;
  botStarted: boolean;
};

export type TBotInfo =
  | {
      avatarUrl: null;
      name: null;
      id: null;
      isBot: boolean;
      isSet: false;
    }
  | {
      avatarUrl: string | null;
      name: string;
      id: string;
      isBot: boolean;
      isSet: true;
    };

export type EventArgs = {
  filePaths?: string[];
};

export type SelectedFolderType = {
  folderIndex: null | number;
  isInFolder: boolean;
};
export type PlayBackType = {
  isPaused: boolean;
  currentFile: string;
  min: number;
  max: number;
  value: number;
};
