import { ChangeEvent, useMemo, useState } from 'react';
import { MemoryRouter as Router } from 'react-router-dom';
import './App.css';
import MainApp from './components/MainApp';
import { YTDLComponent } from './components/YTDL';
import { TopBar } from './components/topBar/TopBar';
import { useElectronHandler, useElectronState } from './customHooks';
import { getLanguageLocaleFn } from './helpers/helpers';
import { PlayerSettingsType, allowedLocale } from './types/types';

export default function App() {
  const [language, setLanguage] = useState<allowedLocale>('en');
  const [playerSettings, setPlayerSettings] = useState<PlayerSettingsType>({
    repeat: false,
    autoplay: true,
    shuffle: false,
  });

  useElectronHandler(
    'MISSING_TOKEN_ERR',
    () => alert(getTranslation('noTokenAlert')),
    [language]
  );

  const getTranslation = useMemo(
    () => getLanguageLocaleFn(language),
    [language]
  );

  const onSettingChange =
    (setting: string) => (event: ChangeEvent<HTMLInputElement>) => {
      setPlayerSettings((prev) => ({
        ...prev,
        [setting]: event.target.checked,
      }));
    };

  const botStarted = useElectronState('BOT_STARTED', false);

  const drillThruProps = {
    getTranslation,
    onSettingChange,
    playerSettings,
    setLanguage,
    botStarted,
  };

  // WOW! This is trash.. is this how i keep them from unmounting?
  return (
    <Router>
      <TopBar {...drillThruProps} />
      <MainApp path="/" {...drillThruProps} />
      <YTDLComponent {...drillThruProps} />
    </Router>
  );
}
