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
