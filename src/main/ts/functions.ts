import { BrowserWindow, dialog } from 'electron';
import { DiscordClientInteraction } from '../discord/discordClientInteractionClass';

export const musicDialog = async (mainWindow: BrowserWindow) => {
  const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'],
  });

  if (canceled) return;

  DiscordClientInteraction.emitRender('DIR_CHANGE', { filePaths });
  DiscordClientInteraction.emitRender('FOLDER_CHANGED', null);
};
