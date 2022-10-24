import { app } from 'electron';
import { useEffect, useState } from 'react';
import { shortGuild } from 'renderer/types/types';
import BotContainer from './BotContainer';
import FileContainer from './FileContainer';

import * as MyImage from './../assets/bot_avi.jpg';

type EventArgs = {
  filePaths?: string[];
};

export default function MainApp() {
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [currentGuilds, setCurrentGuilds] = useState<shortGuild[]>([]);
  const [isBotStarted, setBotStarted] = useState<boolean>(false);

  useEffect(() => {
    checkBotStarted();

    window.electron.ipcRenderer.on('BOT_START', (args) => {
      setBotStarted(true);
    });

    window.electron.ipcRenderer.on('DIR_CHANGE', (args) => {
      if ((args as EventArgs)?.filePaths) {
        setCurrentPath((args as EventArgs).filePaths as string[]);
      }
    });
  }, []);

  async function checkBotStarted() {
    const status = await window.electron.isClientSet();

    if (status == !isBotStarted) {
      setBotStarted(status);
    }
  }

  return (
    <>
      <div className="top-logo">
        <span>H010's personal DND bot!</span>
        <img className="botLogo" src={MyImage.default} />
      </div>
      {isBotStarted ? (
        <div className="main-container">
          <FileContainer currentPath={currentPath} />
          <BotContainer
            currentGuilds={currentGuilds}
            setCurrentGuilds={setCurrentGuilds}
            isBotStarted={isBotStarted}
          />
        </div>
      ) : (
        <>
          <h1>Сначала запусти бота! UwU</h1>
        </>
      )}
    </>
  );
}
