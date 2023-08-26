import { useLocation } from 'react-router-dom';
import { TopBar } from './topBar/TopBar';

export const YTDLComponent = ({
  getTranslation,
  onSettingChange,
  playerSettings,
  setLanguage,
}: {
  getTranslation: any;
  onSettingChange: any;
  playerSettings: any;
  setLanguage: any;
}) => {
  const location = useLocation();
  return (
    <div
      style={{
        display: location.pathname === '/ytdl' ? 'flex' : 'none',
        width: '100%',
        height: '100%',
      }}
    >
      TEST
    </div>
  );
};
