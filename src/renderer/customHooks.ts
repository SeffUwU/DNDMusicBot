import { Channels } from 'main/preload';
import { useState } from 'react';

export const useElectronState = function <T>(
  eventName: Channels,
  initialState: T
) {
  const [state, setState] = useState(initialState);

  window.electron.ipcRenderer.on(eventName, (val) => {
    setState(val);
  });

  return state;
};

export const useElectronHandler = function <T>(eventName: Channels, cb: any) {
  window.electron.ipcRenderer.on(eventName, cb);
};
