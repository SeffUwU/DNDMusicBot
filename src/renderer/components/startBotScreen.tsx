import { getTranslationFn } from 'renderer/types/types';
import './startBotScreen.css';
import { useState } from 'react';

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

  if (isLoading) {
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
          height: '50%',
        }}
      >
        <div className="lds-dual-ring" style={{ marginBottom: '40px' }}></div>
        <span>{getTranslation('loading')}</span>
        {isTooLong && (
          <span
            style={{
              width: '400px',
              textAlign: 'center',
              marginTop: '40px',
              fontSize: '18px',
            }}
          >
            {getTranslation('tooLongWarning')}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="start-bot-container">
      <h1 style={{ marginBottom: '60px' }}>{getTranslation('botStartMsg')}</h1>
      <div>
        <span>{getTranslation('useYourToken')}</span>
        <div className="input-container">
          <div className="form__group field">
            <input
              type="input"
              className="form__field"
              placeholder="Name"
              name="name"
              id="name"
              onChange={(e) => setToken(e.target.value)}
            />
            <label htmlFor="name" className="form__label">
              {getTranslation('tokenKeyword')}
            </label>
          </div>
        </div>
      </div>
      <div style={{ marginTop: '25px' }}>
        <input
          type="checkbox"
          id="saveToken"
          checked={saveToken}
          onChange={(e) => setSaveToken(e.target.checked)}
        />
        <label htmlFor="saveToken">{getTranslation('saveTokenQ')}</label>
      </div>
      <button
        className="button-26"
        style={{ marginTop: '25px', width: '300px' }}
        onClick={() => {
          window.electron.startWithToken(token, saveToken);
          setLoading(true);
        }}
      >
        {getTranslation('startBot')}
      </button>

      <button
        className="button-26"
        style={{
          marginTop: '25px',
          width: '300px',
          backgroundColor: 'green',
          borderColor: 'greenyellow',
        }}
        onClick={() => {
          window.electron.startWithSavedToken();
          setLoading(true);
        }}
      >
        {getTranslation('startBotSaved')}
      </button>
    </div>
  );
}
