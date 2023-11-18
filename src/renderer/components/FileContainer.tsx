import { Button, Flex, IconButton, Switch, Text } from '@chakra-ui/react';
import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { BiPause, BiPlay } from 'react-icons/bi';
import { useElectronHandler, useElectronState } from 'renderer/customHooks';
import { padNum } from 'renderer/helpers/helpers';
import {
  EventArgs,
  PlayBackType,
  PlayerSettingsType,
  SelectedFolderType,
  getTranslationFn,
} from 'renderer/types/types';
import { FSType } from 'sharedTypes/sharedTypes';
import LinkButton from './buttons/LinkButton.component';
import { getNextFilePath } from 'renderer/helpers/getNextFilePath';

const BackButton = ({ onPress, text }: { onPress: any; text: string }) => {
  return (
    <Flex
      h="36"
      w="48"
      key={'back.btn'}
      borderStyle={'solid'}
      borderColor={'gray.600'}
      borderWidth={1}
      borderRadius={'md'}
      overflow={'hidden'}
      _hover={{
        cursor: 'pointer',
        bg: '#ccc',
      }}
      style={{
        color: 'white',
        display: 'flex',
        flexDirection: 'row',
        backgroundColor: '#3e485a',
      }}
      justify={'center'}
      align={'center'}
      onClick={onPress}
    >
      <Text p={2} fontSize={'xl'}>
        {text}
      </Text>
    </Flex>
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
  const [playback, setPlayback] = useState<PlayBackType>({
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
    const current = Math.ceil(playback.value);
    const max = Math.ceil(playback.max);

    if (current === 0 || max === 0) {
      return;
    }

    if (current >= max) {
      if (playerSettings.repeat) {
        playAudio(playback.currentFile)();
      } else if (!playerSettings.autoplay) {
        handlePause();
      } else {
        const filesOnly = fileList.filter((el) => !el.directory);
        getNextFilePath(
          selectedFolder,
          fileList,
          filesOnly,
          playback,
          playAudio
        );
      }
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
        if (prev) {
          clearInterval(prev);
        }

        return setInterval(() => {
          setPlayback((prev) => ({
            ...prev,
            value: prev.isPaused
              ? prev.value
              : Math.min(prev.value + 1, prev.max),
          }));
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
        <Flex
          bg={destinedColor}
          h="36"
          w="48"
          key={element.name}
          borderStyle={'solid'}
          borderColor={'gray.600'}
          borderWidth={1}
          borderRadius={'md'}
          overflow={'hidden'}
          color={element.directory ? 'black' : 'white'}
          _hover={{
            cursor: 'pointer',
            bg: '#ccc',
            color: element.directory ? 'black' : 'black',
          }}
          fontSize={'xl'}
          p={2}
          wordBreak={'break-word'}
          onClick={
            element.directory
              ? () =>
                  setSelectedFolder({ folderIndex: index, isInFolder: true })
              : playAudio(path)
          }
        >
          {element.name}
        </Flex>
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
    <Flex flexDir="column" w="8xl" ml={'auto'} mr="auto">
      <Flex px={4} pb={1}>
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
          <Flex justify="space-between" w="full">
            <Flex align={'center'} gap={2}>
              <Text fontSize={'xl'} userSelect={'none'}>
                {getTranslation('repeatSong')}
              </Text>
              <Switch
                checked={playerSettings.repeat}
                onChange={onSettingChange('repeat')}
              />
              <Text fontSize={'xl'} userSelect={'none'}>
                {getTranslation('autoPlay')}
              </Text>
              <Switch
                checked={playerSettings.autoplay}
                onChange={onSettingChange('autoplay')}
              />

              {/* <Text fontSize={'xl'} userSelect={'none'}>
                {getTranslation('shuffle')}
              </Text>
              <Switch
                checked={playerSettings.shuffle}
                onChange={onSettingChange('shuffle')}
              /> */}
            </Flex>

            <Flex justify="center">
              <Text>{playbackValue}</Text>
            </Flex>
          </Flex>
        </div>
        <IconButton
          aria-label="PAUSE/PLAY"
          as={playback.isPaused ? BiPlay : BiPause}
          color="white"
          bg="Highlight"
          size={'md'}
          onClick={handlePause}
          _hover={{
            bg: 'white',
            color: 'black',
            cursor: 'pointer',
          }}
        />
      </Flex>
      <Flex w="full" alignSelf={'center'} px={4} mt={2} justify={'center'}>
        <Flex flexWrap={'wrap'} gap={2}>
          {showSelectableElements.length ? (
            showSelectableElements
          ) : (
            <LinkButton onClick={() => window.electron.openMusicFolderDialog()}>
              {getTranslation('changeFolderBtn')}
            </LinkButton>
          )}
        </Flex>
      </Flex>
    </Flex>
  );
}
