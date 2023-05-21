import { locale } from 'renderer/locale/locale';
import { allowedLocale, localeKeys } from 'renderer/types/types';

export function padNum(
  num: number | string,
  padTo: number = 2,
  padWith: string = '0'
) {
  return String(num).padStart(padTo, padWith);
}

export function getLanguageLocaleFn(lang: allowedLocale) {
  return (key: localeKeys) => {
    return locale[lang][key];
  };
}
