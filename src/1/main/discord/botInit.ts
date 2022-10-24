import { Client, Events, GatewayIntentBits } from 'discord.js';
import { BrowserWindow, IpcMain } from 'electron';
import { DiscordClientInteraction } from './discordClientInteractionClass';

export default function botInit(
  token: string,
  ipcMain: IpcMain,
  mainWindow: BrowserWindow
) {
  const client = new Client({
    intents: [
      GatewayIntentBits.DirectMessages,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessageReactions,
      GatewayIntentBits.GuildVoiceStates,
    ],
  });

  client.setMaxListeners(0);

  client.once(Events.ClientReady, (c) => {
    DiscordClientInteraction.setClient(c);

    mainWindow.webContents.send('BOT_START', {
      guilds: DiscordClientInteraction.getGuilds(),
    });
  });

  // !roll (this is not the command but i just parse the actual message....)
  client.on('messageCreate', (m) => {
    try {
      if (m.author.bot) return;

      if (m.content[0] !== '!') {
        return;
      }

      if (m.content.slice(1, 6) !== 'roll ') {
        return;
      }

      let prompt = m.content.slice(6, m.content.length);

      if (!prompt.length || !prompt) {
        throw new Error('Пиши нормально..');
      }

      let cubeTimes = 1;

      if ((prompt[0] as unknown as number) >= 0) {
        cubeTimes += parseInt(prompt);
        prompt = prompt.slice(
          parseInt(prompt).toString().length,
          prompt.length
        );
      }

      prompt = prompt.slice(1, prompt.length);

      let results: number[] = [];

      let i = 0;

      do {
        const rng = randomInteger(1, parseInt(prompt));

        results.push(Number(rng));
        i++;
      } while (i < cubeTimes - 1);

      let mod = prompt.split('+');

      let sum = results.reduce((acc, val) => acc + Number(val));

      if (mod.length >= 2) {
        sum += parseInt(mod[1]);
      }

      // Hope you love reading this uwu
      m.channel.send(`Ваш результат:
      ${
        results.length >= 2
          ? `${results.join('+')}${mod[1] ? `+${mod[1]}` : ''}=${sum}`
          : results[0] === 20
          ? `${results[0]}!!`
          : `${results[0]}`
      }`);
    } catch (err) {
      m.channel.send((err as Error).message);
    }
  });

  client.login(token);

  // Handlers below
  ipcMain.handle('fetchGuilds', async (event, ...args) => {
    const guilds = await DiscordClientInteraction.fetchGuilds();

    return guilds;
  });

  ipcMain.handle('connectVoice', async (event, ...args) => {
    const params: { guildId: string; voiceId: string } = args[0];

    DiscordClientInteraction.joinVoice(params.guildId, params.voiceId);

    return true;
  });

  ipcMain.handle('playResource', async (event, ...args) => {
    const params: { path: string } = args[0];

    DiscordClientInteraction.playResource(params.path);

    return true;
  });

  ipcMain.handle('togglePause', async (event, ...args) => {
    DiscordClientInteraction.togglePause();

    return true;
  });
}

function randomInteger(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
