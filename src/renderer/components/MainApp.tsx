import { useEffect, useState } from 'react';
import { DrillThruProps, shortGuild } from 'renderer/types/types';
import BotContainer from './BotContainer';
import FileContainer from './FileContainer';

import { useElectronHandler } from 'renderer/customHooks';
import StartBotScreen from './startBotScreen';
import { useLocation } from 'react-router-dom';

export default function MainApp({
  getTranslation,
  onSettingChange,
  playerSettings,
  setLanguage,
  path,
}: DrillThruProps & { path: string }) {
  const [currentGuilds, setCurrentGuilds] = useState<shortGuild[]>([]);
  const [isBotStarted, setBotStarted] = useState<boolean>(false);
  const location = useLocation();

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

  return (
    <div
      style={{
        display: location.pathname === path ? 'flex' : 'none',
        width: '100%',
        height: '100%',
      }}
    >
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
        <div className="main-container">
          <StartBotScreen getTranslation={getTranslation} />
        </div>
      )}
    </div>
  );
}
