import { ipcRenderer } from 'electron/renderer';
import { useEffect, useMemo, useState } from 'react';
import { useElectronState } from 'renderer/customHooks';

export default function FileContainer({
  currentPath,
}: {
  currentPath: string[];
}) {
  const [fileList, setFileList] = useState<string[]>([]);
  const [playback, setPlayback] = useState({
    isPaused: false,
    currentFile: '',
    min: 0,
    max: 100,
    value: 0,
  });

  const [_ci, setCurrentInterval] = useState<null | NodeJS.Timer>(null);

  const pausedState = useElectronState('RESOURCE_PAUSED', false);

  useEffect(() => {
    if (Math.ceil(playback.value) === 0 || Math.ceil(playback.max) === 0) {
      return;
    }

    if (Math.ceil(playback.value) >= playback.max) {
      const currentFileIdx = fileList.findIndex(
        (val) => val === playback.currentFile
      );

      const nextFileIdx =
        currentFileIdx + 1 > fileList.length - 1 ? 0 : currentFileIdx + 1;

      playAudio(fileList[nextFileIdx])();
    }
  }, [playback.value, playback.max]);

  useEffect(() => {
    window.electron.ipcRenderer.on(
      'RESOURCE_STARTED',
      ({ maxDuration, seek }) => {
        setPlayback((prev) => ({
          ...prev,
          value: seek ?? 0,
          max: Math.ceil(maxDuration),
        }));

        setCurrentInterval((prev) => {
          prev && clearInterval(prev);

          return setInterval(() => {
            setPlayback((prev) => {
              return {
                ...prev,
                value: prev.isPaused
                  ? prev.value
                  : Math.min(prev.value + 1, prev.max),
              };
            });
          }, 1000);
        });
      }
    );
  }, []);

  useEffect(() => {
    if (!currentPath) return;
    getFileList(currentPath[0]);
  }, [currentPath]);

  async function getFileList(path: string) {
    if (!path) return;

    const files = await window.electron.getFileList(path);

    setFileList(
      files.filter((name) => {
        return ['mp3'].indexOf(name.split('.').pop() ?? '') >= 0;
      })
    );
  }

  function playAudio(file: string, seek?: number) {
    return () => {
      setPlayback((prev) => ({
        ...prev,
        currentFile: file,
      }));

      window.electron.playResource(`${currentPath}/${file}`, seek);
    };
  }

  const showFiles = useMemo(() => {
    const components: JSX.Element[] = Array.from({ length: fileList.length });

    components.forEach((_name, index: number) => {
      components[index] = (
        <button
          className="button-26 button-width-90"
          style={{
            background:
              playback.currentFile === fileList[index] ? '#6495ED' : '#282c34',
            color: 'white',
          }}
          key={fileList[index]}
          onClick={playAudio(fileList[index])}
        >
          {fileList[index]}
        </button>
      );
    });

    return components;
  }, [currentPath, fileList, playback.currentFile]);

  const sliderOnChange = (e: any) => {
    setPlayback({ ...playback, value: Number(e.target.value) });
  };

  const sliderOnMouseUp = () => {
    playAudio(playback.currentFile, playback.value)();
  };

  const handlePause = () => {
    setPlayback((prev) => ({ ...prev, isPaused: !prev.isPaused }));
    window.electron.togglePause();
  };

  return (
    <div className="width33p file-container">
      <div className="top-bar-container">
        <button
          className="button-26"
          role="button"
          onClick={() => getFileList(currentPath[0])}
        >
          RESCAN
        </button>
        <div className="duration-container">
          <input
            type="range"
            className="duration-slider"
            min={playback.min}
            max={playback.max}
            value={playback.value}
            onChange={sliderOnChange}
            onMouseUp={sliderOnMouseUp}
          />
          <span style={{ color: 'white' }}>{`${Math.floor(
            playback.value / 60
          )}:${String(
            playback.value - Math.floor(playback.value / 60) * 60
          ).padStart(2, '0')}`}</span>
        </div>
        <button
          className="button-26"
          style={{ width: '96px' }}
          role="button"
          onClick={handlePause}
        >
          {pausedState ? '⏸' : '⏵'}
        </button>
      </div>
      <div className="file-holder">{showFiles}</div>
    </div>
  );
}
