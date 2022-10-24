import { ipcRenderer } from 'electron/renderer';
import { useEffect, useMemo, useState } from 'react';

export default function FileContainer({
  currentPath,
}: {
  currentPath: string[];
}) {
  const [fileList, setFileList] = useState<string[]>([]);

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
  function playAudio(file: string) {
    return () => {
      window.electron.playResource(`${currentPath}/${file}`);
    };
  }
  const showFiles = useMemo(() => {
    const components: JSX.Element[] = Array.from({ length: fileList.length });

    components.forEach((_name, index: number) => {
      components[index] = (
        <button
          className="button-26 button-width-90"
          key={fileList[index]}
          onClick={playAudio(fileList[index])}
        >
          {fileList[index]}
        </button>
      );
    });

    return components;
  }, [currentPath, fileList]);
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

        <button
          className="button-26"
          role="button"
          onClick={() => window.electron.togglePause()}
        >
          PAUSE
        </button>
      </div>
      <div className="file-holder">{showFiles}</div>
    </div>
  );
}
