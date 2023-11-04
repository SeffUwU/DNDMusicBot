import {
  Box,
  Button,
  Flex,
  Icon,
  IconButton,
  Image,
  Link,
  Text,
  Tooltip,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { BiCopy } from 'react-icons/bi';
import { IoIosArrowBack } from 'react-icons/io';
import { RxExternalLink } from 'react-icons/rx';
import { useElectronState } from 'renderer/customHooks';
import { TBotInfo, getTranslationFn, shortGuild } from 'renderer/types/types';
import BotLogo from '../assets/bot_avi.jpg';
import LoadingIcon from '../assets/loading.gif';

export default function BotContainer({
  currentGuilds,
  setCurrentGuilds,
  isBotStarted,
  getTranslation,
}: {
  currentGuilds: shortGuild[];
  setCurrentGuilds: React.Dispatch<React.SetStateAction<shortGuild[]>>;
  isBotStarted: boolean;
  getTranslation: getTranslationFn;
}) {
  const [selectedGuild, setSelectedGuild] = useState<string | null>(null);
  const [selectedVoice, setSelectedVoice] = useState<string | null>(null);
  const [currentlyLoading, setCurrentlyLoading] = useState<string | null>(null);

  const currentVoiceChannel = useElectronState<shortGuild>('VOICE_CHANGED', {
    id: '',
    name: '',
    channels: null,
  });

  const botInfo = useElectronState<TBotInfo>('BOT_INFO', {
    avatarUrl: null,
    id: null,
    isBot: false,
    name: null,
    isSet: false,
  });

  useEffect(() => {
    window.electron.fetchLocalBotInfo();
  }, []);

  useEffect(() => {
    isBotStarted && !currentGuilds.length && refreshGuilds();
  }, [isBotStarted]);

  useEffect(() => {
    if (!selectedGuild || !selectedVoice) {
      return;
    }

    window.electron.connectVoice(selectedGuild, selectedVoice);
  }, [selectedVoice]);

  useEffect(() => {
    setCurrentlyLoading(null);
  }, [currentVoiceChannel]);

  function showGuilds() {
    if (!currentGuilds?.length) {
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '22%',
          }}
        >
          <div
            className="lds-dual-ring-small"
            style={{ marginBottom: '40px' }}
          ></div>
        </div>
      );
    }

    return currentGuilds.map((guild) => {
      const hasActiveVC = guild.channels?.has(currentVoiceChannel.id);
      return (
        <Button
          bg={hasActiveVC ? 'green.400' : undefined}
          variant={'primary'}
          onClick={() => setSelectedGuild(guild.id)}
        >
          {guild.name}
        </Button>
      );
    });
  }

  async function refreshGuilds() {
    const guilds = await window.electron.fetchGuilds();

    setCurrentGuilds(guilds);
  }

  function joinVoice(id: string) {
    return () => {
      setCurrentlyLoading(id);
      setSelectedVoice(id);
    };
  }

  function showVoiceChannels() {
    if (!selectedGuild) {
      return;
    }

    const guild = currentGuilds.find((guild) => guild.id === selectedGuild);
    const components: JSX.Element[] = [
      <Button
        variant="primary"
        display="flex"
        justifyContent="flex-start"
        bg={'gray.600'}
        onClick={() => setSelectedGuild(null)}
      >
        <Icon as={IoIosArrowBack} /> {getTranslation('goBack')}
      </Button>,
    ];

    for (const [_id, channel] of guild?.channels!) {
      components.push(
        <Button
          variant={'primary'}
          bg={channel.id === currentVoiceChannel.id ? 'green.400' : undefined}
          onClick={joinVoice(channel.id)}
          display="flex"
          justifyContent={'space-between'}
          key={_id}
        >
          {channel.name}
          {currentlyLoading == channel.id && <Image src={LoadingIcon} h={6} />}
        </Button>
      );
    }

    return components;
  }
  const BotInfoCont = () => {
    if (!botInfo.isSet) {
      return <></>;
    }

    return (
      <Flex
        bg="gray.800"
        p={4}
        borderStyle={'solid'}
        borderWidth={1}
        borderColor={isBotStarted ? '#50c878' : 'red.5s00'}
        borderRadius={'md'}
        flexDir={'column'}
        mt={4}
      >
        <Flex gap={4}>
          <Box position="relative">
            <Tooltip
              label="Copy invite URL"
              position={'absolute'}
              top={-10}
              right={'-60px'}
            >
              <span>
                <IconButton
                  top={0}
                  right={-1}
                  position={'absolute'}
                  isRound
                  size={'xs'}
                  as={BiCopy}
                  p={1}
                  aria-label="Copy invite URL"
                  zIndex={4}
                  _hover={{
                    cursor: 'pointer',
                  }}
                  onClick={() => window.electron.copyInviteURL()}
                />
              </span>
            </Tooltip>
            <Image
              h={16}
              borderRadius={'full'}
              src={botInfo.avatarUrl ?? BotLogo}
              borderStyle={'solid'}
              borderWidth={1}
              borderColor={isBotStarted ? '#50c878' : 'red.5s00'}
            />
          </Box>
          <Box>
            <Text
              w={64}
              fontSize={'xl'}
              textOverflow="ellipsis"
              overflow={'hidden'}
              whiteSpace={'nowrap'}
            >
              {botInfo.name}
            </Text>
            <Link
              color="white"
              display={'flex'}
              flexDir={'row'}
              alignItems={'center'}
              whiteSpace={'pre-wrap'}
              onClick={() => {
                window.electron.openLink(
                  'https://github.com/SeffUwU/DNDMusicBot#set-up-your-own-bot'
                );
              }}
            >
              How to setup your bot? <RxExternalLink />
            </Link>
          </Box>
        </Flex>
        {!isBotStarted && (
          <Button
            mt={4}
            variant={'primary'}
            onClick={() => {
              window.electron.startWithSavedToken();
            }}
          >
            START WITH SAVED TOKEN
          </Button>
        )}
      </Flex>
    );
  };
  return (
    <Flex gap={4} flexDir="column">
      {/* <LinkButton>CHANGE TOKEN</LinkButton> */}
      <BotInfoCont />

      {isBotStarted && (
        <Flex justify="space-between">
          <Text className="menu-title">
            {getTranslation('selectBotChannel')}
          </Text>
          <Button variant={'functional'} onClick={refreshGuilds}>
            REFRESH
          </Button>
        </Flex>
      )}
      {isBotStarted && !selectedGuild ? showGuilds() : showVoiceChannels()}
    </Flex>
  );
}
