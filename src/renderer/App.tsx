import {
  MemoryRouter as Router,
  Route,
  Routes,
  useNavigate,
  useLocation,
} from 'react-router-dom';
import './App.css';
import MainApp from './components/MainApp';
import { ChangeEvent, useMemo, useState } from 'react';
import { PlayerSettingsType, allowedLocale } from './types/types';
import { getLanguageLocaleFn } from './helpers/helpers';
import { useElectronHandler } from './customHooks';
import { YTDLComponent } from './components/YTDL';
import { TopBar } from './components/topBar/TopBar';

export default function App() {
  const [language, setLanguage] = useState<allowedLocale>('en');
  const [playerSettings, setPlayerSettings] = useState<PlayerSettingsType>({
    repeat: false,
    autoplay: true,
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

  const drillThruProps = {
    getTranslation,
    onSettingChange,
    playerSettings,
    setLanguage,
  };

  // WOW! This is trash.. is this how do keep them from unmounting?
  return (
    <Router>
      <TopBar {...drillThruProps} />
      <MainApp path="/" {...drillThruProps} />
      <YTDLComponent {...drillThruProps} />
    </Router>
  );
}
