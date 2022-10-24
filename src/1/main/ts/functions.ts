import { BrowserWindow, dialog } from 'electron';

export const musicDialog = async (mainWindow: BrowserWindow) => {
  const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'],
  });

  if (canceled) return;

  mainWindow.webContents.send('DIR_CHANGE', { filePaths });
};
