/* eslint import/prefer-default-export: off */
import { FfmpegCommand } from 'fluent-ffmpeg';
import path from 'path';
import internal, { PassThrough } from 'stream';
import { URL } from 'url';

export function resolveHtmlPath(htmlFileName: string) {
  if (process.env.NODE_ENV === 'development') {
    const port = process.env.PORT || 1212;
    const url = new URL(`http://localhost:${port}`);
    url.pathname = htmlFileName;
    return url.href;
  }
  return `file://${path.resolve(__dirname, '../renderer/', htmlFileName)}`;
}

export function mergeAudioFiles(
  ffmpeg: FfmpegCommand,
  bgMusic: internal.Readable,
  additive: internal.Readable,
  outputStream: PassThrough,
  startTime: string // '00:00:00'
) {
  return ffmpeg
    .addInput(bgMusic)
    .addInput(additive)
    .complexFilter([
      {
        filter: 'amix',
        inputs: ['0:0', '1:0'],
      },
    ])
    .outputOptions('-y')
    .output(outputStream)
    .setStartTime(startTime)
    .on('error', function (err) {
      console.log(err);
    })
    .on('end', function () {
      return 'ok';
    })
    .run();
}
