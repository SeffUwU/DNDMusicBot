import { ChangeEvent } from 'react';
import { locale } from 'renderer/locale/locale';

export type shortGuild = {
  id: string;
  name: string;
  channels: any;
};

export type PlayerSettingsType = {
  repeat: boolean;
  autoplay: boolean;
};

export type allowedLocale = 'en' | 'ru';
export type localeKeys = keyof typeof locale[allowedLocale];
export type getTranslationFn = (key: localeKeys) => string;

export type DrillThruProps = {
  getTranslation: getTranslationFn;
  onSettingChange: (
    setting: string
  ) => (event: ChangeEvent<HTMLInputElement>) => void;
  playerSettings: PlayerSettingsType;
  setLanguage: React.Dispatch<React.SetStateAction<allowedLocale>>;
};
