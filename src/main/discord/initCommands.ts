import { Client, REST, Routes, SlashCommandBuilder } from 'discord.js';
import { DiscordClientInteraction } from './discordClientInteractionClass';

// Construct and prepare an instance of the REST module

// and deploy your commands!
export const deployCommands = async (
  clientId: string,
  token: string,
  client: Client<true>
) => {
  const commands: any[] = [];

  const commandArr = [
    {
      data: new SlashCommandBuilder()
        .setName('roll')
        .setDescription('Rolls cube!')
        .addStringOption((option: any) =>
          option
            .setName('input')
            .setDescription(
              'Syntax: {diceNum}d{dice}+{mod} Example: 1d20, 2d6+4'
            )
        ),
    },
  ];

  for (const obj of commandArr) {
    commands.push(obj.data.toJSON());
  }

  const rest = new REST().setToken(token);

  try {
    console.log(
      `Started refreshing ${commands.length} application (/) commands.`
    );

    const data: any = await rest.put(Routes.applicationCommands(clientId), {
      body: commands,
    });

    console.log(
      `Successfully reloaded ${data.length} application (/) commands.`
    );
  } catch (error) {
    console.error(error);
    DiscordClientInteraction.emitRenderError(error);
  }
};
