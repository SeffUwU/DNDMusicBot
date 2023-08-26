import { DrillThruProps } from 'renderer/types/types';
import * as MyImage from './../../assets/bot_avi.jpg';
import './TopBar.css';
import LinkButton from '../buttons/LinkButton.component';

export const TopBar = ({
  getTranslation,
  onSettingChange,
  playerSettings,
  setLanguage,
}: DrillThruProps) => {
  return (
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
          <img className="botLogo unselectable" src={MyImage.default} />
        </div>
        <div className="link-list">
          <LinkButton path="/">Files</LinkButton>
          <LinkButton path="/ytdl">Youtube</LinkButton>
          <LinkButton path="/">SoundBoard (SOON)</LinkButton>
        </div>
        {/* <div
          style={{
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div className="top-bar-param">
            <span className="unselectable">{getTranslation('repeatSong')}</span>
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
        </div> */}
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
  );
};
