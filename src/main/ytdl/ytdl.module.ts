import ytdl from 'ytdl-core';

export class YtDlModule {
  static createStream(url: string, options: ytdl.downloadOptions) {
    return ytdl(url, { filter: 'videoandaudio', ...options });
  }
}
