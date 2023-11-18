// Sketchy af xd, but since im using electron i NEED to specify,
// the location of the static-ffmpeg on systems that don't have it installed.
// Fortunately, discord have the ability to used the ffmpeg-static package!
// Unfortunately, ffmpeg-static points to a static location of the file, before packing.
// so its something something in the words of 'app.asar/node_modules/ffmpeg..'
// which is an invalid path in a packed application! Neat! So we manualy.. replace
// the path in sources...
const replace = require('replace-in-file');

exports.default = async function (n) {
  console.log(
    '\u001b[32m Replacing string in sources of discord. (beforePack.js)'
  );
  const options = {
    //Single file
    files: 'release/app/node_modules/prism-media/src/core/FFmpeg.js',

    //Replacement to make (string or regex)
    from: /require\('ffmpeg-static'\)(?![\s\S]*?\.replace\([\s\S]*?\))/g,
    to: `require('ffmpeg-static').replace('app.asar', 'app.asar.unpacked')`,
  };
  try {
    await replace(options);
    console.log(
      '\u001b[32m Successfully replaced string in discord sources. (beforePack.js)'
    );
  } catch (err) {
    console.error(
      'Failed replacing string in sources of discord (beforePack.js)'
    );
    console.error(err);
  }

  // a.rmSync(
  //   l + '../resources/app.asar.unpacked/node_modules/ffmpeg-static/ffmpeg.exe'
  // );
  // a.copyFileSync(
  //   './ffmpeg-slim.exe', // << very questionable xd
  //   l + '../resources/app.asar.unpacked/node_modules/ffmpeg-static/ffmpeg.exe'
  // );
};
