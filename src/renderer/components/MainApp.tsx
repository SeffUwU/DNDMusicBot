import { app } from 'electron';
import { useEffect, useMemo, useState } from 'react';
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

    window.electron.ipcRenderer.on('ERROR_HANDLE', (...args) => {
      alert(args);
    });
  }, []);

  async function checkBotStarted() {
    const status = await window.electron.isClientSet();

    if (status == !isBotStarted) {
      setBotStarted(status);
    }
  }
  const renderLogo = useMemo(
    () => (
      <div className="top-logo">
        <span>H010's personal DND bot!</span>
      </div>
    ),
    []
  );
  return (
    <>
      {/* {renderLogo} */}
      <div className="top-bar-control">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            marginRight: '10px',
            marginLeft: '5px',
          }}
        >
          <img className="botLogo" src={MyImage.default} />
        </div>
        <button>Music Control</button>
        <button>Bot Control</button>
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
