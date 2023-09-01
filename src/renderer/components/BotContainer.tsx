import { useEffect, useState } from 'react';
import { useElectronState } from 'renderer/customHooks';
import { TBotInfo, getTranslationFn, shortGuild } from 'renderer/types/types';
import BotLogo from '../assets/bot_avi.jpg';
import LoadingIcon from '../assets/loading.gif';
import LinkButton from './buttons/LinkButton.component';

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
    return currentGuilds.map((guild) => (
      <LinkButton onClick={() => setSelectedGuild(guild.id)}>
        {guild.name}
      </LinkButton>
    ));
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
      <LinkButton onClick={() => setSelectedGuild(null)}>
        {getTranslation('goBack')} ↰
      </LinkButton>,
    ];

    for (const [_id, channel] of guild?.channels) {
      components.push(
        <LinkButton
          additionalStyle={
            channel.id === currentVoiceChannel.id
              ? { backgroundColor: '#2196f3' }
              : undefined
          }
          onClick={joinVoice(channel.id)}
        >
          {channel.name}
          {currentlyLoading === channel.id && (
            <img className="loading-small" src={LoadingIcon} />
          )}
        </LinkButton>
      );
    }

    return components;
  }
  const BotInfoCont = () => {
    if (!botInfo.isSet) {
      return <></>;
    }

    return (
      <div className="bot-status-container">
        <div className="bot-avi-container">
          <img
            src={botInfo.avatarUrl ?? BotLogo}
            style={isBotStarted ? { borderColor: '#50c878' } : {}}
          />
        </div>
        <div className="bot-info-container">
          <p>{botInfo.name}</p>
        </div>
      </div>
    );
  };
  return (
    <>
      <LinkButton>CHANGE TOKEN</LinkButton>
      <BotInfoCont />

      {isBotStarted && <h2 className="menu-title">Select your channels</h2>}
      {isBotStarted && !selectedGuild ? showGuilds() : showVoiceChannels()}
    </>
  );
}
