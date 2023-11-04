import { DrillThruProps } from 'renderer/types/types';
import FileContainer from './FileContainer';

import { useLocation } from 'react-router-dom';
import { useElectronHandler } from 'renderer/customHooks';
import StartBotScreen from './startBotScreen';
import { Flex, useToast } from '@chakra-ui/react';

export default function MainApp({
  getTranslation,
  onSettingChange,
  playerSettings,
  setLanguage,
  path,
  botStarted,
}: DrillThruProps & { path: string }) {
  const location = useLocation();
  const toast = useToast();
  useElectronHandler('MAIN_PROCESS_ERROR', (data: any) => {
    // This is mainly for debugging reasons.
    console.error(data);
  });

  useElectronHandler('ERROR_TOAST', (data: any) => {
    // This is mainly for debugging reasons.
    toast({
      status: 'error',
      title: 'An error occurred',
      description: data,
      isClosable: true,
    });
  });

  useElectronHandler('INFO_TOAST', (data: any) => {
    // This is mainly for debugging reasons.
    toast({
      status: 'info',
      title: data.title,
      description: data.description,
      isClosable: true,
    });
  });
  return (
    <Flex
      w="100%"
      height="100%"
      display={location.pathname === path ? undefined : 'none'}
    >
      {botStarted ? (
        <FileContainer
          playerSettings={playerSettings}
          getTranslation={getTranslation}
          onSettingChange={onSettingChange}
        />
      ) : (
        <div className="main-container">
          <StartBotScreen getTranslation={getTranslation} />
        </div>
      )}
    </Flex>
  );
}
