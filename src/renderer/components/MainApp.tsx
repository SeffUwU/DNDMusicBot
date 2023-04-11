import { ChangeEvent, useEffect, useState } from 'react';
import { PlayerSettingsType, shortGuild } from 'renderer/types/types';
import BotContainer from './BotContainer';
import FileContainer from './FileContainer';

import { useElectronHandler } from 'renderer/customHooks';
import * as MyImage from './../assets/bot_avi.jpg';

export default function MainApp() {
  const [currentGuilds, setCurrentGuilds] = useState<shortGuild[]>([]);
  const [isBotStarted, setBotStarted] = useState<boolean>(false);

  const [playerSettings, setPlayerSettings] = useState<PlayerSettingsType>({
    repeat: false,
    autoplay: true,
  });

  useElectronHandler('MAIN_PROCESS_ERROR', (data: any) => {
    // This is mainly for debugging reasons.
    console.error(data);
  });

  useElectronHandler('BOT_START', () => {
    setBotStarted(true);
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
      {/* <div className="custom-title-bar">
        <div>_</div>
        <div>[]</div>
        <div>X</div>
      </div> */}
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
          <FileContainer playerSettings={playerSettings} />
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
