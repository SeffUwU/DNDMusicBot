import { Dirent } from 'fs';
import * as fsPromises from 'fs/promises';
import { resolve } from 'path';
import { FSType } from 'sharedTypes/sharedTypes';

const fileFilter = (allowDir: boolean) => (el: Dirent) => {
  if (!el.isDirectory()) {
    const fileType = el.name.split('.').pop();

    return fileType === 'mp3';
  }

  return allowDir && true;
};
export default class FileManagerService {
  static async getAudioFilesAndSubDirectories(path: string) {
    const files = await fsPromises.readdir(path, { withFileTypes: true });

    const filtered = files.filter(fileFilter(true));

    const ready = await Promise.all(
      filtered.map(async (el) => {
        if (!el.isDirectory()) {
          return {
            name: el.name,
            directory: false,
          };
        }

        const innerFiles = (
          await fsPromises.readdir(resolve(path, `./${el.name}`), {
            withFileTypes: true,
          })
        ).filter(fileFilter(false));

        return {
          name: el.name,
          directory: true,
          files: innerFiles.map((file) => ({
            name: file.name,
            directory: false,
          })),
        };
      })
    );

    return ready;
  }
}
