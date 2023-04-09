const { REST, Routes } = require('discord.js');
import {
  CacheType,
  ChatInputCommandInteraction,
  Client,
  Interaction,
} from 'discord.js';
import fs from 'node:fs';
import path from 'node:path';

const commands: any[] = [];
// Grab all the command files from the commands directory you created earlier
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file: any) => file.endsWith('.js'));

// Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  commands.push(command.data.toJSON());
}

// Construct and prepare an instance of the REST module

// and deploy your commands!
export const deployCommands = async (
  clientId: string,
  token: string,
  client: Client<true>
) => {
  const rest = new REST().setToken(token);

  try {
    console.log(
      `Started refreshing ${commands.length} application (/) commands.`
    );

    // The put method is used to fully refresh all commands in the guild with the current set
    const data = await rest.put(Routes.applicationCommands(clientId), {
      body: commands,
    });

    console.log(
      `Successfully reloaded ${data.length} application (/) commands.`
    );
  } catch (error) {
    // And of course, make sure you catch and log any errors!
    console.error(error);
  }
};

function roll(sides: number) {
  var randomNumber = Math.floor(Math.random() * sides) + 1;
  return randomNumber;
}

function matchMod(testStr: string) {
  return testStr.match(/\d+d\d+\+\d+/)?.[0] as string;
}
function matchNonMod(testStr: string) {
  return testStr.match(/\d+d\d+/)?.[0] as string;
}
function matchSingle(testStr: string) {
  return testStr.match(/d\d+/)?.[0] as string;
}
function matchSingleMod(testStr: string) {
  return testStr.match(/d\d+\+\d+/)?.[0] as string;
}

const funnyDictionary = [
  'Say Gex!',
  'Почитай синтаксис',
  'Круто! Только писать надо по типу: 1d20+3',
  'У тебя почти почти получилось..',
  'rm -rf /',
  'Ой..',
];

const funnyReply = () => funnyDictionary[roll(funnyDictionary.length - 1) - 1];
export const commandHandlers = {
  roll: (interaction: ChatInputCommandInteraction<CacheType>) => {
    // try {
    const m = interaction.options.getString('input');

    if (!m) {
      interaction.reply({ content: 'Дай пж параметр!' });
      return;
    }

    if (matchMod(m)) {
      const matched = matchMod(m);

      const [count, rest] = matched.split('d');
      const [sides, mod] = rest.split('+');

      const results: any[] = Array.apply(null, Array(Number(count)));

      results.forEach((_v, idx) => {
        results[idx] = roll(Number(sides));
      });
      interaction.reply({
        content: `${matched}:\n${results.join(' + ')} + ${mod} = ${
          results.reduce((acc, val) => acc + val, 0) + Number(mod)
        }`,
      });
      return;
    }

    if (matchNonMod(m)) {
      const matched = matchNonMod(m);

      const [count, sides] = matched.split('d');

      const results: any[] = Array.apply(null, Array(Number(count)));

      results.forEach((_v, idx) => {
        results[idx] = roll(Number(sides));
      });
      interaction.reply({
        content: `${matched}:\n${results.join(' + ')} = ${results.reduce(
          (acc, val) => acc + val,
          0
        )}`,
      });
      return;
    }

    if (matchSingleMod(m)) {
      const matched = matchSingleMod(m);
      console.log(matched);
      const [message, mod] = matched.split('+');

      const rolled = roll(Number(message.replace('d', '')));
      interaction.reply({
        content: `${message}+${mod}:\n${rolled} + ${mod} = ${
          rolled + Number(mod)
        }`,
      });
      return;
    }

    if (matchSingle(m)) {
      const matched = matchSingle(m);

      const sides = Number(matched.replace('d', ''));

      interaction.reply({ content: `d${sides} = ${roll(sides)}` });
      return;
    }

    interaction.reply({ content: funnyReply() });
  },
};
