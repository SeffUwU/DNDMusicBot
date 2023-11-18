import {
  Button,
  Flex,
  IconButton,
  Slide,
  Text,
  useDisclosure,
  useOutsideClick,
} from '@chakra-ui/react';
import { useRef, useState } from 'react';
import { RxHamburgerMenu } from 'react-icons/rx';
import { useNavigate } from 'react-router-dom';
import { useElectronHandler } from 'renderer/customHooks';
import { DrillThruProps, shortGuild } from 'renderer/types/types';
import BotContainer from '../BotContainer';

export const TopBar = ({
  getTranslation,
  setLanguage,
  botStarted,
}: DrillThruProps) => {
  const {
    isOpen: isOpenLeft,
    onToggle: onToggleLeft,
    onClose: onCloseLeft,
  } = useDisclosure();
  const {
    isOpen: isOpenRight,
    onToggle: onToggleRight,
    onClose: onCloseRight,
  } = useDisclosure();
  const [currentGuilds, setCurrentGuilds] = useState<shortGuild[]>([]);
  const [controlHovered, setControlHovered] = useState(false);
  const [currentMenuHovered, setCurrentMenuHovered] = useState<
    'left' | 'right' | 'none'
  >('none');

  const closeLeftIfOpen = () => {
    if (!controlHovered) {
      if (currentMenuHovered !== 'right') {
        onCloseLeft();
      }
      if (currentMenuHovered === 'none') {
        onCloseRight();
      }
    }
  };

  const closeRightIfOpen = () => {
    if (!controlHovered) {
      if (currentMenuHovered !== 'left') {
        onCloseRight();
      }
      if (currentMenuHovered === 'none') {
        onCloseLeft();
      }
    }
  };

  useElectronHandler('FOLDER_CHANGED', () => {
    closeLeftIfOpen();
    closeRightIfOpen;
  });

  const navigator = useNavigate();
  const leftRef = useRef(null);
  const rightRef = useRef(null);

  useOutsideClick({
    ref: leftRef,
    handler: closeLeftIfOpen,
  });
  useOutsideClick({
    ref: rightRef,
    handler: closeRightIfOpen,
  });
  return (
    <>
      <Flex
        key="top-bar"
        w="100%"
        justify="space-between"
        align={'center'}
        h={14}
        bg="gray.900"
        pointerEvents={'all'}
      >
        <IconButton
          zIndex={3}
          ml={4}
          bg="gray.600"
          p={0}
          color={'white'}
          onClick={onToggleLeft}
          onMouseEnter={() => setControlHovered(true)}
          onMouseLeave={() => setControlHovered(false)}
          _hover={{ cursor: 'pointer' }}
          aria-label="Left menu"
          icon={<RxHamburgerMenu />}
        />
        <Flex
          userSelect={'none'}
          color="white"
          css="-webkit-app-region: drag;"
          textAlign={'center'}
          display={'flex'}
          justifyContent={'center'}
          align={'center'}
          h={14}
          flex={1}
        >
          <Text>H010's music bot</Text>
        </Flex>
        <IconButton
          zIndex={3}
          mr={4}
          bg="gray.600"
          p={0}
          color={'white'}
          onClick={onToggleRight}
          onMouseEnter={() => setControlHovered(true)}
          onMouseLeave={() => setControlHovered(false)}
          _hover={{ cursor: 'pointer' }}
          aria-label="Left menu"
          icon={<RxHamburgerMenu />}
        />
      </Flex>
      <Flex
        justify={'space-between'}
        h="s"
        w="100%"
        bg="gray.900"
        css="-webkit-app-region: drag;"
      >
        <Slide
          delay={0}
          key="left"
          in={isOpenLeft}
          direction="left"
          style={{
            zIndex: 2,
            width: 'calc(100% - 384px)',
            pointerEvents: 'none',
          }}
        >
          <Flex
            w="64"
            h="100%"
            bg="gray.900"
            flexDir="column"
            pt="12"
            px="4"
            justifyContent={'space-between'}
            ref={leftRef}
            pb={4}
            shadow={'md'}
            onMouseEnter={() => setCurrentMenuHovered('left')}
            onMouseLeave={() => setCurrentMenuHovered('none')}
            pointerEvents={'all'}
          >
            <Flex flexDir={'column'}>
              <Text>{getTranslation('navigatorKeyword')}</Text>
              <Button variant={'primary'} my="1" onClick={() => navigator('/')}>
                {getTranslation('filesTab')}
              </Button>
              <Button
                variant={'primary'}
                my="1"
                onClick={() => navigator('/ytdl')}
              >
                {getTranslation('youtubeTab')}
              </Button>
              {/* <Button path="/">SoundBoard (SOON)</Button> */}
              <Text>{getTranslation('languageKeyword')}</Text>
              <Button
                variant={'primary'}
                my="1"
                onClick={() => setLanguage('ru')}
              >
                Russian
              </Button>
              <Button
                variant={'primary'}
                my="1"
                onClick={() => setLanguage('en')}
              >
                English
              </Button>
              <Text>{getTranslation('settingsKeyword')}</Text>
              <Button
                variant={'primary'}
                my="1"
                onClick={window.electron.openMusicFolderDialog}
              >
                {getTranslation('changeFolderBtn')}
              </Button>
            </Flex>
            <Button variant={'red'} my="1" onClick={window.electron.quit}>
              {getTranslation('appExit')}
            </Button>
          </Flex>
        </Slide>
        <Slide
          key="right"
          delay={0}
          direction="right"
          in={isOpenRight}
          style={{
            zIndex: 2,
            width: 'calc(100% - 256px)',
            pointerEvents: 'none',
          }}
        >
          <Flex
            minW="96"
            h="100%"
            bg="gray.900"
            flexDir="column"
            pt="12"
            px="4"
            position={'absolute'}
            right={0}
            ref={rightRef}
            shadow={'md'}
            onMouseEnter={() => setCurrentMenuHovered('right')}
            onMouseLeave={() => setCurrentMenuHovered('none')}
            pointerEvents={'all'}
          >
            <BotContainer
              isBotStarted={botStarted}
              {...{ currentGuilds, setCurrentGuilds, getTranslation }}
            />
          </Flex>
        </Slide>
      </Flex>
    </>
  );
};
