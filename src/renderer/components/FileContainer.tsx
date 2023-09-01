import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { useElectronHandler, useElectronState } from 'renderer/customHooks';
import { padNum } from 'renderer/helpers/helpers';
import { PlayerSettingsType, getTranslationFn } from 'renderer/types/types';
import { FSType } from 'sharedTypes/sharedTypes';
import LinkButton from './buttons/LinkButton.component';

type EventArgs = {
  filePaths?: string[];
};

type SelectedFolderType = {
  folderIndex: null | number;
  isInFolder: boolean;
};

const BackButton = ({ onPress, text }: { onPress: any; text: string }) => {
  return (
    <button
      className="file-element"
      style={{
        color: 'white',
        display: 'flex',
        flexDirection: 'row',
        backgroundColor: '#3e485a',
      }}
      key={'back-btn'}
      onClick={onPress}
    >
      <span>{text}</span>
    </button>
  );
};

export default function FileContainer({
  playerSettings,
  getTranslation,
  onSettingChange,
}: {
  playerSettings: PlayerSettingsType;
  getTranslation: getTranslationFn;
  onSettingChange: (
    setting: string
  ) => (event: ChangeEvent<HTMLInputElement>) => void;
}) {
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [fileList, setFileList] = useState<FSType[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<SelectedFolderType>({
    folderIndex: null,
    isInFolder: false,
  });
  const [playback, setPlayback] = useState({
    isPaused: false,
    currentFile: '',
    min: 0,
    max: 100,
    value: 0,
  });

  const [_ci, setCurrentInterval] = useState<null | NodeJS.Timer>(null);

  const pausedState = useElectronState('RESOURCE_PAUSED', false);

  useElectronHandler('DIR_CHANGE', (args: EventArgs) => {
    if (args?.filePaths) {
      setCurrentPath((args as EventArgs).filePaths as string[]);
    }
  });

  useEffect(() => {
    // This is is a big mess.. as is most of this app! So i guess this is fine.. TODO: REWRITE
    if (Math.ceil(playback.value) === 0 || Math.ceil(playback.max) === 0) {
      return;
    }

    if (Math.ceil(playback.value) >= playback.max) {
      if (playerSettings.repeat) {
        playAudio(playback.currentFile)();
        return;
      }

      if (!playerSettings.autoplay) {
        handlePause();
        return;
      }

      const filesOnly = fileList.filter((el) => !el.directory);

      let path: string;

      // SO! Instead of being smart i wrote this assshittery.
      // In short: This if statement decides if were working with mp3 files of
      // the directory! If we are! We are setting the path accordingly!
      // don't mind the double nextFileIdx and currentFileIdx. They are block scoped.
      //
      // july 10 2023 upd: wow this truly is assshittery..
      if (selectedFolder.folderIndex !== null) {
        const foundFolder = fileList[selectedFolder.folderIndex];

        if (!foundFolder.directory) {
          return;
        }

        const currentFileIdx = foundFolder.files.findIndex(
          (file) =>
            file.name ===
            playback.currentFile.replace(`${foundFolder.name}/`, '')
        );

        const nextFileIdx =
          currentFileIdx + 1 > foundFolder.files.length - 1
            ? 0
            : currentFileIdx + 1;
        if (
          fileList[selectedFolder.folderIndex]?.name &&
          foundFolder.files[nextFileIdx]?.name
        ) {
          path = `${fileList[selectedFolder.folderIndex].name}/${
            foundFolder.files[nextFileIdx].name
          }`;
        }
      } else {
        const currentFileIdx = filesOnly.findIndex(
          (file) => file.name === playback.currentFile
        );

        const nextFileIdx =
          currentFileIdx + 1 > filesOnly.length - 1 ? 0 : currentFileIdx + 1;

        path = filesOnly[nextFileIdx]?.name;
      }

      path! && playAudio(path)();
    }
  }, [playback.value, playback.max]);

  useElectronHandler(
    'RESOURCE_STARTED',
    ({ maxDuration, seek }: { maxDuration: number; seek: number }) => {
      setPlayback((prev) => ({
        ...prev,
        value: seek ?? 0,
        max: Math.ceil(maxDuration),
      }));

      setCurrentInterval((prev) => {
        prev && clearInterval(prev);

        return setInterval(() => {
          setPlayback((prev) => {
            return {
              ...prev,
              value: prev.isPaused
                ? prev.value
                : Math.min(prev.value + 1, prev.max),
            };
          });
        }, 1000);
      });
    }
  );

  useEffect(() => {
    if (!currentPath) return;
    getFileList(currentPath[0]);
  }, [currentPath]);

  async function getFileList(path: string) {
    if (!path) return;

    const files = await window.electron.getFileList(path);
    const sortedByDirectoriesFirst = files.sort((el) =>
      el.directory ? -1 : 1
    );

    setFileList(sortedByDirectoriesFirst);
  }

  function playAudio(file: string, seek?: number) {
    return () => {
      setPlayback((prev) => ({
        ...prev,
        currentFile: file,
        isPaused: false,
      }));

      window.electron.playResource(`${currentPath}/${file}`, seek);
    };
  }

  const showSelectableElements = useMemo(() => {
    // This whole thing is a mess! too bad! TODO: REWRITE
    const components: JSX.Element[] = Array.from({ length: fileList.length });

    const selectedElementComponentFn = (element: FSType, index: number) => {
      // this is a mess but i do not care ;)
      const path =
        selectedFolder.folderIndex !== null
          ? `${fileList[selectedFolder.folderIndex].name}/${element.name}`
          : element.name;

      const destinedColor = element.directory
        ? '#D7C68F'
        : playback.currentFile === path
        ? '#6495ED'
        : undefined;

      components[index] = (
        <button
          className={`file-element ${element.directory && 'directory'}`}
          style={{
            background: destinedColor,
            color: element.directory ? '#354757' : 'white',
            display: 'flex',
            flexDirection: 'row',
          }}
          key={element.name}
          onClick={
            element.directory
              ? () =>
                  setSelectedFolder({ folderIndex: index, isInFolder: true })
              : playAudio(path)
          }
        >
          <span>{element.name}</span>
        </button>
      );
    };

    if (selectedFolder.folderIndex !== null) {
      // In case we have a folder currently selected
      // We draw the "go back btn" and MP3 files in the directory. (If there are any)
      const foundFolder = fileList[selectedFolder.folderIndex];

      if (foundFolder.directory) {
        if (selectedFolder.isInFolder) {
          foundFolder.files.forEach(selectedElementComponentFn);
        }

        return [
          <BackButton
            onPress={() =>
              setSelectedFolder({ folderIndex: null, isInFolder: false })
            }
            text={getTranslation('goBack')}
          />,
          ...components,
        ];
      }

      setSelectedFolder({ folderIndex: null, isInFolder: false });

      return components;
    }

    fileList.forEach(selectedElementComponentFn);

    return components;
  }, [
    currentPath,
    fileList,
    playback.currentFile,
    selectedFolder,
    getTranslation,
  ]);

  const sliderOnChange = (e: any) => {
    setPlayback({ ...playback, value: Number(e.target.value) });
  };

  const sliderOnMouseUp = () => {
    playAudio(playback.currentFile, playback.value)();
  };

  function handlePause() {
    setPlayback((prev) => ({ ...prev, isPaused: !prev.isPaused }));
    window.electron.togglePause();
  }

  const playbackValue = useMemo(() => {
    const { value } = playback;

    const hours = Math.floor(value / 60 / 60);
    const hoursSeconds = hours * 60 * 60;
    const minutes = Math.floor((value - hoursSeconds) / 60);
    const seconds = Math.floor(value - hoursSeconds - minutes * 60);

    return `${padNum(hours)}:${padNum(minutes)}:${padNum(seconds)}`;
  }, [playback]);

  return (
    <div className="file-container">
      <div className="top-bar-container">
        <LinkButton
          additionalStyle={{ backgroundColor: '#1652f0' }}
          onClick={() => getFileList(currentPath[0])}
        >
          {getTranslation('rescan')}
        </LinkButton>
        <div className="duration-container">
          <div className="slider-container">
            <input
              type="range"
              className="duration-slider"
              min={playback.min}
              max={playback.max}
              value={playback.value}
              onChange={sliderOnChange}
              onMouseUp={sliderOnMouseUp}
            />
          </div>
          <div className="slider-controls">
            <div>
              <span style={{ color: 'white' }} className="unselectable">
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

              <span
                style={{ marginLeft: '10px', color: 'white' }}
                className="unselectable"
              >
                {getTranslation('autoPlay')}
              </span>
              <label className="switch unselectable">
                <input
                  type="checkbox"
                  checked={playerSettings.autoplay}
                  onChange={onSettingChange('autoplay')}
                />
                <span className="slider round"></span>
              </label>

              <span
                style={{ marginLeft: '10px', color: 'white' }}
                className="unselectable"
              >
                {getTranslation('shuffle')}
              </span>
              <label className="switch unselectable">
                <input
                  type="checkbox"
                  checked={playerSettings.shuffle}
                  onChange={onSettingChange('shuffle')}
                />
                <span className="slider round"></span>
              </label>
            </div>

            <div className="time-info-container">
              <span style={{ color: 'white' }}>{playbackValue}</span>
            </div>
          </div>
        </div>
        <LinkButton
          additionalStyle={{ backgroundColor: '#1652f0' }}
          onClick={handlePause}
        >
          {pausedState ? '⏸' : '⏵'}
        </LinkButton>
      </div>
      <div className="file-holder">
        {showSelectableElements.length ? (
          showSelectableElements
        ) : (
          <LinkButton
            onClick={() => window.electron.openMusicFolderDialog()}
            additionalStyle={{ margin: '10px' }}
          >
            CHANGE FOLDER
          </LinkButton>
        )}
      </div>
    </div>
  );
}
