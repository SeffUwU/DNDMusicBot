# H010's DnDMusicBot

This is an electron-react-boilerplate "fork" which i built this bot control program on.

This is a Discord bot control program which allows to play mp3 files saved locally on your drive. You can manually control what Server and Channel the bot is in and manually select mp3 files to play.

![alt text](./preview.png)

H010 is our DM and he gave me this idea.. thus why it is called H010's DnDMusicBot

## Make it dev:

```bash
cd ./app
npm i
cd ./release/app
npm i
cd ..
npm start
```

## Make it

```bash
# DO THE "Make It Dev"
npm run package
```

Then navigate to ./release/build/

You will find all the files

# Releases:

### I only started to document these on release 0.2.1.. So.. dont expect much..

### 0.2.1:

- Lots of errors and memory leakage fixes.
- 1 level subfoler scan + mp3 files included in the subfolder for organization of playable files.
- ffmpeg/ffprobe are now bundled in the installation file
- Changed design a bit
- Autoplay and Repeat slider toggle. (Repeat will take priority)
