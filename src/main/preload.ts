import { contextBridge, ipcRenderer, IpcRendererEvent, shell } from 'electron';
import { YTMetaType } from 'sharedTypes/sharedTypes';
const { clipboard } = require('electron');

export type Channels = string;

contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    sendMessage(channel: Channels, args: unknown[]) {
      ipcRenderer.send(channel, args);
    },
    on(channel: Channels, func: (...args: unknown[]) => void) {
      const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
        func(...args);
      ipcRenderer.on(channel, subscription);

      return () => ipcRenderer.removeListener(channel, subscription);
    },
    once(channel: Channels, func: (...args: unknown[]) => void) {
      ipcRenderer.once(channel, (_event, ...args) => func(...args));
    },
  },
  getFileList: (path: string) => ipcRenderer.invoke('getFileList', path),
  fetchGuilds: () => ipcRenderer.invoke('fetchGuilds'),
  connectVoice: (guildId: string, voiceId: string) => {
    ipcRenderer.invoke('connectVoice', { guildId, voiceId });
  },
  togglePause: () => ipcRenderer.invoke('togglePause'),
  playResource: (path: string, seek?: number) =>
    ipcRenderer.invoke('playResource', { path, seek }),
  playSound: (path: string) => ipcRenderer.invoke('playSound', { path }),
  isClientSet: () => ipcRenderer.invoke('isClientSet'),
  startWithToken: (token: string, saveToken: boolean) =>
    ipcRenderer.invoke('startWithToken', token, saveToken),
  startWithSavedToken: () => ipcRenderer.invoke('startSaved'),
  quit: () => ipcRenderer.invoke('userEvent:exit-app'),
  fetchLocalBotInfo: () => ipcRenderer.invoke('fetchLocalBotInfo'),
  openMusicFolderDialog: () => ipcRenderer.invoke('openMusicFolderDialog'),
  playYTLink: (link: string, newDuration?: number) =>
    ipcRenderer.invoke('userEvent:playYTLink', link, newDuration),
  saveLink: (info: YTMetaType) =>
    ipcRenderer.invoke('userEvent:saveLink', info),
  removeLink: (link: string) =>
    ipcRenderer.invoke('userEvent:removeLink', link),
  copyInviteURL: () => ipcRenderer.invoke('userEvent:copyInviteURL'),
  openLink: (link: string) => {
    shell.openExternal(link);
  },
});
