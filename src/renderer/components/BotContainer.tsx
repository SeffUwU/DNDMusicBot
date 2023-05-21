import { useEffect, useState } from 'react';
import { useElectronState } from 'renderer/customHooks';
import { getTranslationFn, shortGuild } from 'renderer/types/types';

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
  const currentVoiceChannel = useElectronState<shortGuild>('VOICE_CHANGED', {
    id: '',
    name: '',
    channels: null,
  });

  useEffect(() => {
    if (!selectedGuild || !selectedVoice) {
      return;
    }

    window.electron.connectVoice(selectedGuild, selectedVoice);
  }, [selectedVoice]);

  function showGuilds() {
    if (!currentGuilds?.length) {
      return;
    }
    return currentGuilds.map((guild) => (
      <button
        className="button-26 button-width-90"
        style={{ alignSelf: 'center', borderColor: 'gold' }}
        key={guild.id}
        onClick={() => setSelectedGuild(guild.id)}
      >
        {guild.name}
      </button>
    ));
  }

  async function refreshGuilds() {
    const guilds = await window.electron.fetchGuilds();

    setCurrentGuilds(guilds);
  }

  function showVoiceChannels() {
    if (!selectedGuild) {
      return;
    }
    const guild = currentGuilds.find((guild) => guild.id === selectedGuild);

    const components: JSX.Element[] = [
      <button
        className="button-26 button-width-90"
        style={{
          alignSelf: 'center',
          backgroundColor: '#3e485a',
        }}
        onClick={() => setSelectedGuild(null)}
        key={guild?.id}
      >
        {getTranslation('goBack')}
      </button>,
    ];

    for (const [_id, channel] of guild?.channels) {
      components.push(
        <button
          className="button-26 button-width-90"
          key={channel.id}
          onClick={joinVoice(channel.id)}
          style={{
            width: '90%',
            alignSelf: 'center',
            backgroundColor:
              currentVoiceChannel.id === channel.id ? '#6495ED' : undefined,
          }}
        >
          {channel.name}
        </button>
      );
    }

    return components;
  }

  function joinVoice(id: string) {
    return () => {
      setSelectedVoice(id);
    };
  }

  return (
    <div className="width33p file-container">
      <div className="top-bar-container" style={{ alignItems: 'center' }}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'flex-start',
          }}
        >
          <div
            style={{
              width: '0.8em',
              height: '0.8em',
              backgroundColor: isBotStarted ? 'green' : 'red',
              margin: '0.25em',
              borderRadius: '50px',
            }}
          ></div>
          <span style={{ color: 'white', marginInline: '5px' }}>Status:</span>
          <span style={{ color: isBotStarted ? 'green' : 'gray' }}>
            {isBotStarted ? ' Running ' : ' Not Running '}
          </span>
        </div>
        <button className="button-26" role="button" onClick={refreshGuilds}>
          {getTranslation('refreshGuilds')}
        </button>
      </div>
      <div className="file-holder">
        {!selectedGuild ? showGuilds() : showVoiceChannels()}
      </div>
    </div>
  );
}
