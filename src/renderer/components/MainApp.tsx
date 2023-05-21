import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import {
  PlayerSettingsType,
  allowedLocale,
  shortGuild,
} from 'renderer/types/types';
import BotContainer from './BotContainer';
import FileContainer from './FileContainer';

import { useElectronHandler } from 'renderer/customHooks';
import * as MyImage from './../assets/bot_avi.jpg';
import StartBotScreen from './startBotScreen';
import { getLanguageLocaleFn } from 'renderer/helpers/helpers';

export default function MainApp() {
  const [currentGuilds, setCurrentGuilds] = useState<shortGuild[]>([]);
  const [isBotStarted, setBotStarted] = useState<boolean>(false);
  const [language, setLanguage] = useState<allowedLocale>('en');

  const [playerSettings, setPlayerSettings] = useState<PlayerSettingsType>({
    repeat: false,
    autoplay: true,
  });

  const getTranslation = useMemo(
    () => getLanguageLocaleFn(language),
    [language]
  );

  useElectronHandler('MAIN_PROCESS_ERROR', (data: any) => {
    // This is mainly for debugging reasons.
    console.error(data);
  });

  useElectronHandler('BOT_START', () => {
    setBotStarted(true);
  });

  useElectronHandler(
    'MISSING_TOKEN_ERR',
    () => alert(getTranslation('noTokenAlert')),
    [language]
  );

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
      <div className="top-bar-space-between">
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
              <span className="unselectable">
                {getTranslation('repeatSong')}
              </span>
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
              <span className="unselectable">{getTranslation('autoPlay')}</span>
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
        <div className="lang-select-container">
          <button className="langSelect" onClick={() => setLanguage('ru')}>
            RUS
          </button>
          <button className="langSelect" onClick={() => setLanguage('en')}>
            ENG
          </button>
        </div>
      </div>
      {isBotStarted ? (
        <div className="main-container">
          <FileContainer
            playerSettings={playerSettings}
            getTranslation={getTranslation}
          />
          <BotContainer
            currentGuilds={currentGuilds}
            setCurrentGuilds={setCurrentGuilds}
            isBotStarted={isBotStarted}
            getTranslation={getTranslation}
          />
        </div>
      ) : (
        <StartBotScreen getTranslation={getTranslation} />
      )}
    </>
  );
}
