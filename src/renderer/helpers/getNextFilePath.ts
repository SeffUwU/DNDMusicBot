import { PlayBackType, SelectedFolderType } from 'renderer/types/types';
import { FSType } from 'sharedTypes/sharedTypes';

export function getNextFilePath(
  selectedFolder: SelectedFolderType,
  fileList: FSType[],
  filesOnly: FSType[],
  playback: PlayBackType,
  playAudio: any
) {
  let path = null;

  if (selectedFolder.folderIndex !== null) {
    const foundFolder = fileList[selectedFolder.folderIndex];

    if (foundFolder.directory) {
      const currentFileName = playback.currentFile.replace(
        `${foundFolder.name}/`,
        ''
      );
      const currentFileIdx = foundFolder.files.findIndex(
        (file) => file.name === currentFileName
      );

      const nextFileIdx = (currentFileIdx + 1) % foundFolder.files.length;

      if (
        fileList[selectedFolder.folderIndex]?.name &&
        foundFolder.files[nextFileIdx]?.name
      ) {
        path = `${fileList[selectedFolder.folderIndex].name}/${
          foundFolder.files[nextFileIdx].name
        }`;
      }
    }
  } else {
    const currentFileIdx = filesOnly.findIndex(
      (file) => file.name === playback.currentFile
    );
    const nextFileIdx = (currentFileIdx + 1) % filesOnly.length;

    path = filesOnly[nextFileIdx]?.name;
  }

  if (path) {
    playAudio(path)();
  }
}
