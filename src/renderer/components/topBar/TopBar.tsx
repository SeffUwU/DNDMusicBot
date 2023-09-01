import { useState } from 'react';
import { DrillThruProps, shortGuild } from 'renderer/types/types';
import BotContainer from '../BotContainer';
import { BurgerButton } from '../buttons/BurgerButton.component';
import LinkButton from '../buttons/LinkButton.component';
import './TopBar.css';
import { useElectronHandler } from 'renderer/customHooks';

export const TopBar = ({
  getTranslation,
  onSettingChange,
  playerSettings,
  setLanguage,
  botStarted,
}: DrillThruProps) => {
  const [leftMenuVisible, setLeftMenuVisible] = useState(false);
  const [rightMenuVisible, setRightMenuVisible] = useState(false);
  const [currentGuilds, setCurrentGuilds] = useState<shortGuild[]>([]);

  useElectronHandler('FOLDER_CHANGED', () => {
    setLeftMenuVisible(false);
  });

  return (
    <div className="top-bar-space-between">
      <div
        className={`burger-menu-menu ${
          !leftMenuVisible ? 'menu-slid-left' : ''
        }`}
      >
        <h2 className="menu-title">Navigate:</h2>
        <LinkButton path="/">Files</LinkButton>
        <LinkButton path="/ytdl">Youtube</LinkButton>
        <LinkButton path="/">SoundBoard (SOON)</LinkButton>
        <h2 className="menu-title">Language:</h2>
        <LinkButton onClick={() => setLanguage('ru')}>Russian</LinkButton>
        <LinkButton onClick={() => setLanguage('en')}>English</LinkButton>
        <h2 className="menu-title">Settings</h2>
        <LinkButton onClick={() => window.electron.openMusicFolderDialog()}>
          CHANGE FOLDER
        </LinkButton>
        <LinkButton onClick={() => window.electron.quit()}>EXIT</LinkButton>
      </div>
      <div className="top-bar-control">
        <BurgerButton onClick={() => setLeftMenuVisible(!leftMenuVisible)} />
        <h1>H010's music bot</h1>
        <BurgerButton onClick={() => setRightMenuVisible(!rightMenuVisible)} />
      </div>
      <div
        className={`burger-menu-menu discord-menu ${
          !rightMenuVisible ? 'menu-slid-right' : ''
        }`}
      >
        <BotContainer
          isBotStarted={botStarted}
          {...{ currentGuilds, setCurrentGuilds, getTranslation }}
        />
      </div>
    </div>
  );
};
