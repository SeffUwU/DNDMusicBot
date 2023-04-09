import { ChangeEvent, useEffect, useState } from 'react';
import { PlayerSettingsType, shortGuild } from 'renderer/types/types';
import BotContainer from './BotContainer';
import FileContainer from './FileContainer';

import * as MyImage from './../assets/bot_avi.jpg';
import { useElectronHandler } from 'renderer/customHooks';

type EventArgs = {
  filePaths?: string[];
};

export default function MainApp() {
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [currentGuilds, setCurrentGuilds] = useState<shortGuild[]>([]);
  const [isBotStarted, setBotStarted] = useState<boolean>(false);

  const [playerSettings, setPlayerSettings] = useState<PlayerSettingsType>({
    repeat: false,
    autoplay: true,
  });

  useElectronHandler('BOT_START', () => {
    setBotStarted(true);
  });

  useElectronHandler('DIR_CHANGE', (args: EventArgs) => {
    if (args?.filePaths) {
      setCurrentPath((args as EventArgs).filePaths as string[]);
    }
  });

  useEffect(() => {
    checkBotStarted();
  }, []);

  async function checkBotStarted() {
    const status = await window.electron.isClientSet();

    if (status == !isBotStarted) {
      setBotStarted(status);
    }
  }

  const onSettingChange =
    (setting: string) => (event: ChangeEvent<HTMLInputElement>) => {
      setPlayerSettings((prev) => ({
        ...prev,
        [setting]: event.target.checked,
      }));
    };

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
            paddingRight: '10px',
            paddingLeft: '5px',
          }}
        >
          <span className="unselectable">H010's MusicBot</span>
          <img className="botLogo unselectable" src={MyImage.default} />
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div className="top-bar-param">
            <span className="unselectable">ПОВТОР ПЕСНИ</span>
            <label className="switch unselectable">
              <input
                type="checkbox"
                checked={playerSettings.repeat}
                onChange={onSettingChange('repeat')}
              />
              <span className="slider round"></span>
            </label>
          </div>

          <div className="top-bar-param">
            <span className="unselectable">АВТОПРОИГРЫВАНИЕ</span>
            <label className="switch unselectable">
              <input
                type="checkbox"
                checked={playerSettings.autoplay}
                onChange={onSettingChange('autoplay')}
              />
              <span className="slider round"></span>
            </label>
          </div>
        </div>
      </div>
      {isBotStarted ? (
        <div className="main-container">
          <FileContainer
            currentPath={currentPath}
            playerSettings={playerSettings}
          />
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
