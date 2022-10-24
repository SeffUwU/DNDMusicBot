import * as fsPromises from 'fs/promises';

export default class FileManagerService {
  static async getAudioFilesList(path: string) {
    return await fsPromises.readdir(path);
  }
}
