import { useEffect, useState } from 'react';
import { shortGuild } from 'renderer/types/types';

export default function BotContainer({
  currentGuilds,
  setCurrentGuilds,
  isBotStarted,
}: {
  currentGuilds: shortGuild[];
  setCurrentGuilds: React.Dispatch<React.SetStateAction<shortGuild[]>>;
  isBotStarted: boolean;
}) {
  const [selectedGuild, setSelectedGuild] = useState<string | null>(null);
  const [selectedVoice, setSelectedVoice] = useState<string | null>(null);

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
        className="file-element"
        style={{ width: '90%', alignSelf: 'center' }}
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
          width: '90%',
          alignSelf: 'center',
          backgroundColor: '#D3D3D3',
        }}
        onClick={() => setSelectedGuild(null)}
        key={guild?.id}
      >
        НАЗАД
      </button>,
    ];

    for (const [_id, channel] of guild?.channels) {
      components.push(
        <button
          className="button-26 button-width-90"
          key={channel.id}
          onClick={joinVoice(channel.id)}
          style={{ width: '90%', alignSelf: 'center' }}
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
            width: '0.8em',
            height: '0.8em',
            backgroundColor: isBotStarted ? 'green' : 'red',
            margin: '0.25em',
            borderRadius: '50px',
          }}
        ></div>
        Current bot status:
        <span style={{ color: isBotStarted ? 'green' : 'gray' }}>
          {isBotStarted ? 'running' : ' not running'}
        </span>
        <button className="button-26" role="button" onClick={refreshGuilds}>
          REFRESH GUILDS
        </button>
      </div>
      <div className="file-holder">
        {!selectedGuild ? showGuilds() : showVoiceChannels()}
      </div>
    </div>
  );
}
