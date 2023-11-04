import { useLocation } from 'react-router-dom';
import './YTDL.css';
import LinkButton from './buttons/LinkButton.component';
import { useMemo, useState } from 'react';
import { useElectronHandler, useElectronState } from 'renderer/customHooks';
import { YTMetaType } from 'sharedTypes/sharedTypes';
import { formatTime, padNum } from 'renderer/helpers/helpers';

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
  const [_ci, setCurrentInterval] = useState<null | NodeJS.Timer>(null);

  const [searchValue, setSearchValue] = useState('');
  const [videoInfo, setVideoInfo] = useState<YTMetaType>({
    title: '',
    lengthSeconds: 0,
    link: '',
  });

  const [currentDuration, setCurrentDuration] = useState(0);
  const savedLinks = useElectronState<YTMetaType[]>('SAVED_LINK', []);

  useElectronHandler('YT_META', (info: YTMetaType) => {
    setVideoInfo({ ...info });
    setCurrentInterval((prev) => {
      prev && clearInterval(prev);
      setCurrentDuration(0);
      return setInterval(() => {
        setCurrentDuration((prev) => {
          if (prev + 1 > videoInfo.lengthSeconds) {
            return videoInfo.lengthSeconds;
          }

          return prev + 1;
        });
      }, 1000);
    });
  });

  const location = useLocation();

  const handlePlay = (linkOverride?: string) => () => {
    window.electron.playYTLink(linkOverride ?? searchValue);
  };

  const handleTimeSkip = (e: any) => {
    const newDuration = Number(e.target.value);

    window.electron.playYTLink(searchValue, newDuration);
  };

  const handleSaveLink = () => {
    const { link, title } = videoInfo;
    if (!link || !title) {
      return;
    }

    window.electron.saveLink(videoInfo);
  };

  const handleRemoveLink = (link: string) => () => {
    window.electron.removeLink(link);
  };

  const playbackValue = useMemo(() => {
    const hours = Math.floor(currentDuration / 60 / 60);
    const hoursSeconds = hours * 60 * 60;
    const minutes = Math.floor((currentDuration - hoursSeconds) / 60);
    const seconds = Math.floor(currentDuration - hoursSeconds - minutes * 60);

    return `${padNum(hours)}:${padNum(minutes)}:${padNum(seconds)}`;
  }, [currentDuration]);

  return (
    <div
      style={{
        display: location.pathname === '/ytdl' ? 'flex' : 'none',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
      }}
      key="ytdl"
    >
      <div key="search-bar" className="search-bar">
        <input
          type="text"
          onChange={(e) => setSearchValue(e.target.value)}
          value={searchValue}
        />
        <LinkButton onClick={handlePlay()}>PLAY</LinkButton>
        <LinkButton onClick={handleSaveLink}>SAVE</LinkButton>
      </div>
      {/* <input
        style={{
          width: '90%',
          alignSelf: 'center',
        }}
        type="range"
        className="duration-slider"
        min={0}
        max={videoInfo.lengthSeconds}
        value={currentDuration}
        onChange={(e) => {
          setCurrentDuration(Number(e.target.value));
        }}
        onMouseUp={handleTimeSkip}
      /> */}
      <span
        style={{
          display: 'inline-block',
          alignSelf: 'center',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          height: '32px',
          textOverflow: 'ellipsis',
        }}
      >
        {videoInfo.title}
      </span>
      <span style={{ alignSelf: 'center' }}>{playbackValue}</span>
      <div key="saved-links" className="saved-links-container">
        {savedLinks.map(({ title, link, lengthSeconds }) => {
          return (
            <div className="yt-btn">
              <a
                className={`link-button yt-link`}
                style={
                  videoInfo.link === link
                    ? { backgroundColor: 'rgb(33, 150, 243' }
                    : {}
                }
                onClick={handlePlay(link)}
              >
                {title + ` (${formatTime(lengthSeconds)})`}
              </a>
              <button onClick={handleRemoveLink(link)}>X</button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
