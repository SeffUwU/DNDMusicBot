import { DrillThruProps } from 'renderer/types/types';
import FileContainer from './FileContainer';

import { useLocation } from 'react-router-dom';
import { useElectronHandler } from 'renderer/customHooks';
import StartBotScreen from './startBotScreen';

export default function MainApp({
  getTranslation,
  onSettingChange,
  playerSettings,
  setLanguage,
  path,
  botStarted,
}: DrillThruProps & { path: string }) {
  const location = useLocation();

  useElectronHandler('MAIN_PROCESS_ERROR', (data: any) => {
    // This is mainly for debugging reasons.
    console.error(data);
  });

  return (
    <div
      style={{
        display: location.pathname === path ? 'flex' : 'none',
        width: '100%',
        height: '100%',
      }}
    >
      {botStarted ? (
        <div className="main-container">
          <FileContainer
            playerSettings={playerSettings}
            getTranslation={getTranslation}
            onSettingChange={onSettingChange}
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
