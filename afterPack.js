// Removes unused locales.
exports.default = async function (n) {
  var a = require('fs'),
    l = n.appOutDir + '/locales/';
  a.readdir(l, function (n, t) {
    if (t && t.length)
      for (var c = 0, e = t.length; c < e; c++)
        null === t[c].match(/en-US\.pak/) && a.unlinkSync(l + t[c]);
  });

  // a.rmSync(
  //   l + '../resources/app.asar.unpacked/node_modules/ffmpeg-static/ffmpeg.exe'
  // );
  // a.copyFileSync(
  //   './ffmpeg-slim.exe', // << very questionable xd
  //   l + '../resources/app.asar.unpacked/node_modules/ffmpeg-static/ffmpeg.exe'
  // );
};
