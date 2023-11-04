import { locale } from '../locale/locale';
import { allowedLocale, localeKeys } from '../types/types';

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

export function formatTime(time: number, includeMs: boolean = false) {
  const hours = Math.floor(time / 60 / 60);
  const hoursSeconds = hours * 60 * 60;
  const minutes = Math.floor((time - hoursSeconds) / 60);
  const seconds = Math.floor(time - hoursSeconds - minutes * 60);

  return `${padNum(hours)}:${padNum(minutes)}:${padNum(seconds)}${
    includeMs ? ':00' : ''
  }`;
}
