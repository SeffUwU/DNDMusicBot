import { Client, Events, GatewayIntentBits } from 'discord.js';
import { BrowserWindow, IpcMain, ipcMain } from 'electron';
import { DiscordClientInteraction } from './discordClientInteractionClass';
import { deployCommands } from './initCommands';
import { commandHandlers } from './commandHandlers';

export default function botInit(token: string, mainWindow: BrowserWindow) {
  try {
    if (DiscordClientInteraction.isClientSet(true)) {
      return;
    }
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

    client.once(Events.ClientReady, async (c) => {
      DiscordClientInteraction.setClient(c);

      await deployCommands('1033073461842690150', token, c);

      c.on(Events.InteractionCreate, (interaction) => {
        if (!interaction.isChatInputCommand()) return;
        switch (interaction.commandName) {
          case 'roll':
            commandHandlers['roll'](interaction);
            break;
        }
      });

      mainWindow.webContents.send('BOT_START', {
        guilds: DiscordClientInteraction.getGuilds(),
      });
    });

    client.login(token);
  } catch (err) {
    mainWindow.webContents.send('ERROR_HANDLE', err);
  }
}

function randomInteger(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
