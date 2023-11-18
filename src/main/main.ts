/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import { app, BrowserWindow, clipboard, ipcMain, shell } from 'electron';
import * as fs from 'fs';
import { homedir } from 'os';
import path from 'path';
import botInit from './discord/botInit';
import { DiscordClientInteraction } from './discord/discordClientInteractionClass';
import FileManagerService from './fileManager.service';
import MenuBuilder from './menu';
import { musicDialog } from './ts/functions';
import { resolveHtmlPath } from './util';
import { YTMetaType } from 'sharedTypes/sharedTypes';

let mainWindow: BrowserWindow | null = null;

ipcMain.handle('getFileList', async (event, ...args) => {
  const list = await FileManagerService.getAudioFilesAndSubDirectories(
    args[0] as string
  );

  return list;
});

ipcMain.handle('startWithToken', async (event, token, saveToken) => {
  if (saveToken) {
    var home = homedir();
    var folder = home + '/Documents/h010MusicBot';

    fs.writeFileSync(folder + '/token.txt', token, {});
  }

  botInit(token, mainWindow as BrowserWindow);
});

ipcMain.handle('startSaved', async () => {
  var home = homedir();
  var folder = path.join(home, 'Documents', 'h010MusicBot');
  const tokenPath = path.join(folder, 'token.txt');

  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder, { recursive: true });
  }

  if (!fs.existsSync(tokenPath)) {
    fs.writeFileSync(tokenPath, '');
  }

  const token = String(fs.readFileSync(tokenPath));

  if (!token.length) {
    (mainWindow as BrowserWindow).webContents.send('MISSING_TOKEN_ERR');
    DiscordClientInteraction.emitRender('TOKEN_ERROR', true);
    return;
  }

  botInit(token, mainWindow as BrowserWindow);
});

ipcMain.handle('isClientSet', async (event, ...args) => {
  try {
    return DiscordClientInteraction.isClientSet();
  } catch (err) {
    return false;
  }
});

// Handlers below
ipcMain.handle('fetchGuilds', async (event, ...args) => {
  const guilds = await DiscordClientInteraction.fetchGuilds();

  return guilds;
});

ipcMain.handle('connectVoice', async (event, ...args) => {
  const params: { guildId: string; voiceId: string } = args[0];

  DiscordClientInteraction.joinVoice(params.guildId, params.voiceId);

  return true;
});

ipcMain.handle('playResource', async (event, ...args) => {
  const params: { path: string; seek: number } = args[0];
  console.log(args);
  DiscordClientInteraction.playResource(params.path, params.seek);

  return true;
});

ipcMain.handle('playSound', async (event, ...args) => {
  const params: { path: string } = args[0];
  DiscordClientInteraction.playSound(params.path);

  return true;
});

ipcMain.handle('togglePause', async (event, ...args) => {
  DiscordClientInteraction.togglePause();

  return true;
});

ipcMain.handle('userEvent:exit-app', async (event, ...args) => {
  app.quit();
});

ipcMain.handle('fetchLocalBotInfo', () => {
  const home = homedir();
  const folder = home + '/Documents/h010MusicBot';
  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder, { recursive: true });
  }

  const botInfoJSON =
    fs.existsSync(folder + '/bot-info.json') &&
    fs.readFileSync(folder + '/bot-info.json');

  const savedLinksJson =
    fs.existsSync(folder + '/saved-links.json') &&
    fs.readFileSync(folder + '/saved-links.json');

  botInfoJSON &&
    DiscordClientInteraction.emitRender(
      'BOT_INFO',
      JSON.parse(String(botInfoJSON))
    );

  savedLinksJson &&
    DiscordClientInteraction.emitRender(
      'SAVED_LINK',
      JSON.parse(String(savedLinksJson))
    );
});

ipcMain.handle('openMusicFolderDialog', () => {
  return musicDialog(mainWindow!);
});

ipcMain.handle(
  'userEvent:playYTLink',
  (event, link: string, newDuration?: number) => {
    DiscordClientInteraction.playYtDLAudio(link, newDuration);
  }
);

ipcMain.handle('userEvent:saveLink', (event, info: YTMetaType) => {
  const home = homedir();

  const folder = home + '/Documents/h010MusicBot';

  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder, { recursive: true });
  }

  const savedLinksJson =
    fs.existsSync(folder + '/saved-links.json') &&
    fs.readFileSync(folder + '/saved-links.json');

  if (!savedLinksJson) {
    fs.writeFileSync(folder + '/saved-links.json', JSON.stringify([info]));
    DiscordClientInteraction.emitRender('SAVED_LINK', [info]);

    return;
  }

  const savedLinks: YTMetaType[] = JSON.parse(String(savedLinksJson));

  savedLinks.push(info);

  fs.writeFileSync(folder + '/saved-links.json', JSON.stringify(savedLinks));

  DiscordClientInteraction.emitRender('SAVED_LINK', savedLinks);
});

ipcMain.handle('userEvent:removeLink', (event, toRemoveLink: string) => {
  const home = homedir();

  const folder = home + '/Documents/h010MusicBot';

  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder, { recursive: true });
  }

  const savedLinksJson =
    fs.existsSync(folder + '/saved-links.json') &&
    fs.readFileSync(folder + '/saved-links.json');

  if (!savedLinksJson) {
    return;
  }
  const savedLinks: YTMetaType[] = JSON.parse(String(savedLinksJson));

  const withRemovedLink = savedLinks.filter(({ link }) => {
    return link !== toRemoveLink;
  });

  fs.writeFileSync(
    folder + '/saved-links.json',
    JSON.stringify(withRemovedLink)
  );

  DiscordClientInteraction.emitRender('SAVED_LINK', withRemovedLink);
});
ipcMain.handle('userEvent:copyInviteURL', () => {
  const clientId = DiscordClientInteraction.getClientId();
  clipboard.writeText(
    `https://discord.com/api/oauth2/authorize?client_id=${clientId}&permissions=274881054720&scope=bot`
  );
  DiscordClientInteraction.emitRenderInfo(
    'Link copied',
    'Link copied to clipboard'
  );
});
if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (isDebug) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    frame: true,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
      nodeIntegration: true,
    },
    titleBarStyle: 'hidden',
  });

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  // new AppUpdater();

  DiscordClientInteraction.mainWindow = mainWindow;
};

app.commandLine.appendSwitch('lang', 'en-US');

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app
  .whenReady()
  .then(() => {
    createWindow();

    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);
