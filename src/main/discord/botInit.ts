import { Client, Events, GatewayIntentBits } from 'discord.js';
import { BrowserWindow } from 'electron';
import * as fs from 'fs';
import { homedir } from 'os';
import { commandHandlers } from './commandHandlers';
import { DiscordClientInteraction } from './discordClientInteractionClass';
import { deployCommands } from './initCommands';

let botStartedInterval: ReturnType<typeof setInterval> | undefined;

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

    client.once(Events.ClientReady, async (connectedClient) => {
      DiscordClientInteraction.setClient(connectedClient);

      await deployCommands(connectedClient.user.id, token, connectedClient);

      connectedClient.on(Events.InteractionCreate, (interaction) => {
        if (!interaction.isChatInputCommand()) return;
        switch (interaction.commandName) {
          case 'roll':
            commandHandlers['roll'](interaction);
            break;
        }
      });
      const botInfo = {
        avatarUrl: connectedClient.user.avatarURL(),
        name: connectedClient.user.username,
        id: connectedClient.user.id,
        isBot: connectedClient.user.bot,
        isSet: true,
      };

      const home = homedir();
      const folder = home + '/Documents/h010MusicBot';

      fs.writeFileSync(folder + '/bot-info.json', JSON.stringify(botInfo));

      DiscordClientInteraction.emitRender('BOT_STARTED', true);
      DiscordClientInteraction.emitRender('BOT_INFO', botInfo);

      botStartedInterval = setInterval(
        () => DiscordClientInteraction.emitRender('BOT_STARTED', true),
        2000
      );
    });
    client.on(Events.Error, () => {
      clearInterval(botStartedInterval);
      DiscordClientInteraction.emitRender('BOT_STARTED', false);
    });
    client.login(token);
  } catch (err) {
    console.error(err);
    mainWindow.webContents.send('ERROR_HANDLE', err);
  }
}

function randomInteger(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
