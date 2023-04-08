import { Client, Events, GatewayIntentBits } from 'discord.js';
import { BrowserWindow, IpcMain, ipcMain } from 'electron';
import { DiscordClientInteraction } from './discordClientInteractionClass';

export default function botInit(token: string, mainWindow: BrowserWindow) {
  try {
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
  } catch (err) {
    mainWindow.webContents.send('ERROR_HANDLE', err);
  }
}

function randomInteger(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
