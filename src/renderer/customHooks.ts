import { Channels } from 'main/preload';
import { useEffect, useState } from 'react';

export const useElectronState = function <T>(
  eventName: Channels,
  initialState: T
) {
  const [state, setState] = useState(initialState);

  useEffect(() => {
    const clearListener = window.electron.ipcRenderer.on(eventName, (val) => {
      setState(val);
    });

    return () => clearListener();
  }, []);

  return state;
};

export const useElectronHandler = function <T>(
  eventName: Channels,
  cb: any,
  dependency?: any[]
) {
  useEffect(() => {
    const clearListener = window.electron.ipcRenderer.on(eventName, cb);

    return () => clearListener();
  }, [dependency]);
};
