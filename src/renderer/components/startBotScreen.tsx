import { getTranslationFn } from 'renderer/types/types';
import './startBotScreen.css';
import { useState } from 'react';
import { useElectronState } from 'renderer/customHooks';
import {
  Button,
  Checkbox,
  Flex,
  FormLabel,
  Input,
  Text,
} from '@chakra-ui/react';

const SHOW_WARNING_TIMEOUT_TIME = 15000; // 15 seconds

export default function StartBotScreen({
  getTranslation,
}: {
  getTranslation: getTranslationFn;
}) {
  const [token, setToken] = useState('');
  const [saveToken, setSaveToken] = useState(true);
  const [isLoading, setLoading] = useState(false);
  const [isTooLong, setTooLong] = useState(false);
  const isTokenError = useElectronState('TOKEN_ERROR', false);

  if (isLoading && !isTokenError) {
    !isTooLong &&
      setTimeout(() => {
        setTooLong(true);
      }, SHOW_WARNING_TIMEOUT_TIME);

    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          alignSelf: 'center',
          width: '100%',
          height: '50%',
        }}
      >
        <div className="lds-dual-ring" style={{ marginBottom: '40px' }}></div>
        <span>{getTranslation('loading')}</span>
        {isTooLong && (
          <Flex flexDir={'column'} gap={16} align={'center'}>
            <Text maxW={'4xl'}>{getTranslation('tooLongWarning')}</Text>{' '}
            <Button
              w={'md'}
              onClick={() => {
                setTooLong(false);
                setLoading(false);
              }}
            >
              {getTranslation('goBack')}
            </Button>
          </Flex>
        )}
      </div>
    );
  }

  return (
    <Flex flexDir={'column'} justify={'center'}>
      <Text textAlign={'center'} mb={2} fontSize={'2xl'}>
        {getTranslation('botStartMsg')}
      </Text>
      <Flex flexDir={'column'}>
        <FormLabel w="100%">
          {getTranslation('tokenKeyword')}
          <Input
            color="white"
            placeholder="Set your token.."
            onChange={(e) => setToken(e.target.value)}
            value={token}
          />
        </FormLabel>
      </Flex>
      <FormLabel display={'flex'} alignItems={'center'}>
        <Checkbox
          type="checkbox"
          checked={saveToken}
          onChange={(e) => setSaveToken(e.target.checked)}
          mr={2}
        />
        <Text>Save token?</Text>
      </FormLabel>
      <Flex mt={4} gap={4} justifyContent={'space-between'}>
        <Button
          variant={'functional'}
          onClick={() => {
            window.electron.startWithToken(token, saveToken);
            setLoading(true);
          }}
        >
          {getTranslation('startBot')}
        </Button>

        {!isTokenError && (
          <Button
            variant={'functional'}
            bg="green.400"
            onClick={() => {
              window.electron.startWithSavedToken();
              setLoading(true);
            }}
          >
            {getTranslation('startBotSaved')}
          </Button>
        )}
      </Flex>
    </Flex>
  );
}
