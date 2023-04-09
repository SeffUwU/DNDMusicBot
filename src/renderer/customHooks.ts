import { Channels } from 'main/preload';
import { useEffect, useState } from 'react';

export const useElectronState = function <T>(
  eventName: Channels,
  initialState: T
) {
  const [state, setState] = useState(initialState);

  useEffect(() => {
    window.electron.ipcRenderer.on(eventName, (val) => {
      setState(val);
    });
  }, []);

  return state;
};

export const useElectronHandler = function <T>(
  eventName: Channels,
  cb: any,
  dependency?: any[]
) {
  useEffect(() => {
    const eventClearer = window.electron.ipcRenderer.on(eventName, cb);
    () => eventClearer;
  }, [dependency]);
};
