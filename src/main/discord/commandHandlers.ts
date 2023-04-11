import { CacheType, ChatInputCommandInteraction } from 'discord.js';

function roll(sides: number) {
  var randomNumber = Math.floor(Math.random() * sides) + 1;
  return randomNumber;
}

function matchMod(testStr: string) {
  return testStr.match(/\d+d\d+\+\d+/i)?.[0] as string;
}
function matchNonMod(testStr: string) {
  return testStr.match(/\d+d\d+/i)?.[0] as string;
}
function matchSingle(testStr: string) {
  return testStr.match(/d\d+/i)?.[0] as string;
}
function matchSingleMod(testStr: string) {
  return testStr.match(/d\d+\+\d+/i)?.[0] as string;
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

const moreThan100Msg = (count: number) => {
  return count > 100 ? 'count>100\n' : '';
};

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

      const results: any[] = Array.apply(
        null,
        Array(Math.min(Number(count), 100))
      );

      results.forEach((_v, idx) => {
        results[idx] = roll(Number(sides));
      });
      interaction.reply({
        content: `${moreThan100Msg(Number(count))}${Math.min(
          Number(count),
          100
        )}d${sides}+${mod}:\n${results.join(' + ')} + ${mod} = ${
          results.reduce((acc, val) => acc + val, 0) + Number(mod)
        }`,
      });
      return;
    }

    if (matchNonMod(m)) {
      const matched = matchNonMod(m);

      const [count, sides] = matched.split('d');

      const results: any[] = Array.apply(
        null,
        Array(Math.min(Number(count), 100))
      );

      results.forEach((_v, idx) => {
        results[idx] = roll(Number(sides));
      });
      interaction.reply({
        content: `${moreThan100Msg(Number(count))}${Math.min(
          Number(count),
          100
        )}d${sides}:\n${results.join(' + ')} = ${results.reduce(
          (acc, val) => acc + val,
          0
        )}`,
      });
      return;
    }

    if (matchSingleMod(m)) {
      const matched = matchSingleMod(m);
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
