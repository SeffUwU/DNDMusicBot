import { getTranslationFn } from 'renderer/types/types';
import './startBotScreen.css';
import { useState } from 'react';

export default function StartBotScreen({
  getTranslation,
}: {
  getTranslation: getTranslationFn;
}) {
  const [token, setToken] = useState('');
  const [saveToken, setSaveToken] = useState(true);

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
        <label htmlFor="saveToken">Сохранить токен?</label>
      </div>
      <button
        className="button-26"
        style={{ marginTop: '25px', width: '300px' }}
        onClick={() => {
          window.electron.startWithToken(token, saveToken);
        }}
      >
        {getTranslation('startBot')}
      </button>
    </div>
  );
}
