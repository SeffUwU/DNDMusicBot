import { useEffect, useMemo, useState } from 'react';
import { useElectronHandler, useElectronState } from 'renderer/customHooks';
import { padNum } from 'renderer/helpers/helpers';
import { PlayerSettingsType, getTranslationFn } from 'renderer/types/types';
import { FSType } from 'sharedTypes/sharedTypes';

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
      className="button-26 button-width-90"
      style={{
        color: 'white',
        display: 'flex',
        flexDirection: 'row',
        backgroundColor: '#3e485a',
      }}
      key={'back'}
      onClick={onPress}
    >
      <span>{text}</span>
    </button>
  );
};

export default function FileContainer({
  playerSettings,
  getTranslation,
}: {
  playerSettings: PlayerSettingsType;
  getTranslation: getTranslationFn;
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
      // dont mind the double nextFileIdx and currentFileIdx. They are block scoped.
      if (selectedFolder.folderIndex !== null) {
        const foundFolder = fileList[selectedFolder.folderIndex];
        if (!foundFolder.directory) {
          return;
        }

        const currentFileIdx = foundFolder.files.findIndex(
          (val) =>
            val.name ===
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
          console.log(11, path);
        }
      } else {
        const currentFileIdx = filesOnly.findIndex(
          (val) => val.name === playback.currentFile
        );

        const nextFileIdx =
          currentFileIdx + 1 > filesOnly.length - 1 ? 0 : currentFileIdx + 1;

        path = filesOnly[nextFileIdx]?.name;
        console.log(11, path);
      }

      path! && playAudio(path)();
    }
  }, [playback.value, playback.max]);

  useElectronHandler(
    'RESOURCE_STARTED',
    ({ maxDuration, seek }: { maxDuration: number; seek: number }) => {
      console.log(maxDuration, seek);
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
    console.log(444, file);
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
          className="button-26 button-width-90"
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
          {element.directory && <div style={{ marginRight: '4px' }}>📁</div>}
          <span>{element.name}</span>
        </button>
      );
    };

    if (selectedFolder.folderIndex !== null) {
      // In case we have a folder currently selected
      // We draw back btn and MP3 files in the directory. (If there are any)
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
    <div className="width33p file-container">
      <div className="top-bar-container">
        <button
          className="button-26"
          role="button"
          onClick={() => getFileList(currentPath[0])}
        >
          {getTranslation('rescan')}
        </button>
        <div className="duration-container">
          <input
            type="range"
            className="duration-slider"
            min={playback.min}
            max={playback.max}
            value={playback.value}
            onChange={sliderOnChange}
            onMouseUp={sliderOnMouseUp}
          />
          <span style={{ color: 'white' }}>{playbackValue}</span>
        </div>
        <button
          className="button-26"
          style={{ width: '96px' }}
          role="button"
          onClick={handlePause}
        >
          {pausedState ? '⏸' : '⏵'}
        </button>
      </div>
      <div className="file-holder">{showSelectableElements}</div>
    </div>
  );
}
