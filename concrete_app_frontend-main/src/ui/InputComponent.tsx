import { useEffect, useState } from 'react';
import { PasswordHideIcon } from 'assets/icons/PasswordHide';
import { PasswordOpenIcon } from 'assets/icons/PasswordOpen'
import { UserIcon } from 'assets/icons/User'
import { XCircle } from 'assets/icons/XCircle'
import { WarningCircle } from 'assets/icons/WarningCircle'
import InputMask from 'react-input-mask';

interface Props {
  type: string;
  placeholder?: string | string[] | any;
  icon?: boolean;
  autocomplete?: string;
  state?: any;
  setState?: any;
  repeat?: any;
  setRepeat?: any;
  regex?: any;
  errortext?: string | string[] | any;
  gap?: string;
  setIs?: any;
  width?: string;
  maxWidth?: string;
  maxLength?: number;
  onKeyDown?: any;
  isDisabled?: boolean
}

const PasswordToggle = ({ hide, setHide, onClick }: any) => (
  <div className='cp' onClick={onClick}>
    {hide ? <PasswordOpenIcon /> : <PasswordHideIcon />}
  </div>
);

export const InputComponent = ({
  type,
  placeholder,
  icon = true,
  autocomplete = 'on',
  state = '',
  setState,
  regex = '',
  errortext,
  repeat = '',
  setRepeat,
  gap,
  setIs,
  width = '100%',
  maxWidth,
  maxLength = 100,
  onKeyDown,
  isDisabled,
}: Props) => {
  const [hide, setHide] = useState(true);
  const [hide2, setHide2] = useState(true);
  const [error, setError] = useState(false);
  const [error2, setError2] = useState(false);
  const [focused, setFocused] = useState(false);

  const handleFocus = () => {
      setFocused(true);
  };

  const handleBlur = () => {
      setFocused(false);
  };

  const handleClearClick = () => {
    setState('');
    setError(false);
    setError2(false);
  };

  const handleErrorIcon = () => (error || error2 ? <WarningCircle /> : <XCircle />);

  useEffect(() => {
    if (state === '') {
      if (setIs) setIs(() => false);
      setError(false);
      return;
    }

    if (repeat !== '') {
      if (repeat === '') {
        if (setIs) setIs(() => false);
        setError2(false);
        return;
      }
    }

    if (regex === '') if (setIs) setIs(true);

    if (regex && state !== null) {
      if (regex.test(state)) {
        setError(false);
        if (setIs) setIs(true);
      } else if (state !== '' || repeat !== '') {
        setError(true);
        if (setIs) setIs(false);
      }
    }
  }, [state, repeat, regex, setIs]);

  useEffect(() => {
    if (setIs && repeat !== '') {
      if (repeat !== state) {
        setError2(true);
        setIs(false);
      } else {
        setError2(false);
        setIs(true);
      }
    }
  }, [repeat, state, setIs]);

  return (
    <div style={{ width: width, maxWidth: maxWidth}}>
      {type !== 'repeatpassword' && (
        <div
          className="df w100 aic"
          style={{
            borderRadius: '6px',
            border: '1px solid #E0E0E0',
            padding: '14px 10px',
            background: '#fff',
            height: type === 'textarea' ? '128px' : 'auto',
            overflowY: type === 'textarea' ? 'auto' : 'visible'
          }}
        >
      {type === 'user' && (
        <>
          {icon && <UserIcon />}
          {autocomplete === 'off' ? (
            <form autoComplete='off'>
            <label className={`fw500 fz16 w100 ct ${focused ? 'focused' : ''} ${!state ? 'empty' : ''} ${!state || state.length === 0 ? 'empty' : 'not-empty'}`}>
              {placeholder}
                <input
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  className="fw500 fz16 w100"
                  style={{ width: width }}
                  type="text"
                  maxLength={maxLength}
                  onKeyDown={onKeyDown}
                />
              </label>
            </form>
          ) : (
            <label className={`fw500 fz16 w100 ct ${focused ? 'focused' : ''} ${!state || state.length === 0 ? 'empty' : 'not-empty'}`}>
              {placeholder}
              <input
                value={state}
                onChange={(e) => setState(e.target.value)}
                onFocus={handleFocus}
                onBlur={handleBlur}
                className="fw500 fz16 w100"
                style={{ width: width }}
                type="text"
                maxLength={maxLength}
                onKeyDown={onKeyDown}
              />
            </label>
          )}
          {state && (
            <div
              className={`cp aic`}
              onClick={() => {
                setState('');
                setFocused(false);
              }}
              style={{ width: '24px', height: '24px', flexShrink: '0' }}
            >
                <div
                  className={`cp aic`}
                  onClick={handleClearClick}
                  style={{ width: '24px', height: '24px', flexShrink: '0' }}
                >
                  {error ? handleErrorIcon() : <XCircle />}
                </div>
            </div>
          )}
        </>
      )}


          {type === 'password' && (
            <>
              <PasswordToggle hide={hide} setHide={() => setHide(!hide)} onClick={() => setHide(!hide)} />
              {autocomplete === 'off' ? (
                <form autoComplete='off'>
                  <input
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="fw500 fz16 w100"
                    type={hide ? 'password' : 'text'}
                    autoComplete={autocomplete}
                    placeholder={`${placeholder}*`}
                    maxLength={maxLength}
                    onKeyDown={onKeyDown}
                  />
                </form>
              ) : (            
              <label className={`fw500 fz16 w100 ct ${focused ? 'focused' : ''} ${!state || state.length === 0 ? 'empty' : 'not-empty'}`}>
              {placeholder}
              <input                 
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="fw500 fz16 w100"
                  type={hide ? 'password' : 'text'}
                  autoComplete={autocomplete}
                  maxLength={maxLength}
                  onKeyDown={onKeyDown}
                />
                </label>
              )}
          {state && (
            <div
              className={`cp aic`}
              onClick={() => {
                setState('');
                setFocused(false);
              }}
              style={{ width: '24px', height: '24px', flexShrink: '0' }}
            >
                <div
                  className={`cp aic`}
                  onClick={handleClearClick}
                  style={{ width: '24px', height: '24px', flexShrink: '0' }}
                >
                  {error ? handleErrorIcon() : <XCircle />}
                </div>
            </div>
          )}
            </>
          )}

          {type === 'default' && (
            <>
              {autocomplete === 'off' ? (
                <form autoComplete='off'>
                <label className={`db fw500 fz16 w100 ct ${focused ? 'focused' : ''} ${!state || state.length === 0 ? 'empty' : 'not-empty'}`}>
                {placeholder}
                <input    
                    value={state}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    onChange={(e) => setState(e.target.value)}
                    className="fw500 fz16 w100"
                    type="text"
                    autoComplete={autocomplete}
                    maxLength={maxLength}
                    onKeyDown={onKeyDown}
                  />
                  </label>
                </form>
              ) : (
                <label className={`db fw500 fz16 w100 ct ${focused ? 'focused' : ''} ${!state || state.length === 0 ? 'empty' : 'not-empty'}`}>
                {placeholder}
                <input    
                  value={state}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  disabled={isDisabled}
                  onChange={(e) => setState(e.target.value)}
                  className="fw500 fz16 w100"
                  type="text"
                  autoComplete={autocomplete}
                  maxLength={maxLength}
                  onKeyDown={onKeyDown}
                />
                </label>
              )}
            </>
          )}

          {type === 'textarea' && (
            <>
              {autocomplete === 'off' ? (
                <form autoComplete='off'>
                <label 
                  className={`db fw500 fz16 w100 ct ${focused ? 'focused' : ''} ${!state || state.length === 0 ? 'empty' : 'not-empty'}`}
                  style={{marginBottom: "auto"}}
                >
                {placeholder}
                <input    
                    value={state}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    onChange={(e) => setState(e.target.value)}
                    className="fw500 fz16 w100"
                    type="text"
                    autoComplete={autocomplete}
                    maxLength={maxLength}
                    onKeyDown={onKeyDown}
                  />
                  </label>
                </form>
              ) : (
                <label 
                  className={`db fw500 fz16 w100 ct ${focused ? 'focused' : ''} ${!state || state.length === 0 ? 'empty' : 'not-empty'}`}
                  style={{marginBottom: "auto"}}
                >
                {placeholder}
                <input    
                  value={state}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  onChange={(e) => setState(e.target.value)}
                  className="fw500 fz16 w100"
                  type="text"
                  autoComplete={autocomplete}
                  maxLength={maxLength}
                  onKeyDown={onKeyDown}
                />
                </label>
              )}
            </>
          )}

          {type === 'phone' && (
            <>
              <label className={`db fw500 fz16 w100 ct ${focused ? 'focused' : ''} ${!state || state.length === 0 ? 'empty' : 'not-empty'}`}>
              {placeholder}
                <InputMask
                mask="+7 (999) 999-99-99"
                value={state}
                alwaysShowMask
                onFocus={handleFocus}
                onBlur={handleBlur}
                onChange={(e:any) => setState(e.target.value)}
                className="fw500 fz16 w100"
                onKeyDown={onKeyDown}
                />
              </label>
            </>
          )}
        </div>
      )}
      {type === 'repeatpassword' && (
        <div className='df' style={{ gap: gap }}>
          <div
            className="df w100 aic"
            style={{
              borderRadius: '6px',
              border: '1px solid #E0E0E0',
              padding: '10px 10px',
            }}
          >
            <PasswordToggle hide={hide} setHide={() => setHide(!hide)} onClick={() => setHide(!hide)} />
            {autocomplete === 'off' ? (
              <form autoComplete='off'>
                <input  
                  value={state}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  onChange={(e) => setState(e.target.value)}
                  className="fw500 fz16 w100"
                  type={hide ? 'password' : 'text'}
                  style={{"marginLeft": "8px"}}
                  placeholder={placeholder[0]}
                  maxLength={maxLength}
                  onKeyDown={onKeyDown}
                />
              </form>
            ) : (
              <input  
                value={state}
                onFocus={handleFocus}
                onBlur={handleBlur}
                onChange={(e) => setState(e.target.value)}
                className="fw500 fz16 w100"
                type={hide ? 'password' : 'text'}
                style={{"marginLeft": "8px"}}
                maxLength={maxLength}
                onKeyDown={onKeyDown}
                placeholder={placeholder[0]}
              />
            )}
          </div>
          {error && (
            <span style={{ color: '#EB5757', fontSize: '14px', marginLeft: '8px' }}>{errortext[0]}</span>
          )}
          <div
            className="df w100 aic"
            style={{
              borderRadius: '6px',
              border: '1px solid #E0E0E0',
              padding: '10px 10px',
            }}
          >
            <PasswordToggle hide={hide2} setHide={() => setHide2(!hide2)} onClick={() => setHide2(!hide2)} />
            {autocomplete === 'off' ? (
              <form autoComplete='off'>

              <input  
                  value={repeat}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  onChange={(e) => setRepeat(e.target.value)}
                  className="fw500 fz16 w100"
                  type={hide2 ? 'password' : 'text'}
                  style={{marginLeft: "8px"}}
                  placeholder={placeholder[1]}
                  maxLength={maxLength}
                  onKeyDown={onKeyDown}
                />
              </form>
            ) : (
              <label className={`db fw500 fz16 w100 ct ${focused ? 'focused' : ''} ${repeat.length === 0 ? 'empty' : 'not-empty'}`}>
              {placeholder[1]}
              <input  
                value={repeat}
                onFocus={handleFocus}
                onBlur={handleBlur}
                onChange={(e) => setRepeat(e.target.value)}
                className="fw500 fz16 w100"
                type={hide2 ? 'password' : 'text'}
                maxLength={maxLength}
                onKeyDown={onKeyDown}
              />
              </label>
            )}
          </div>
          {error2 && (
            <span style={{ color: '#EB5757', fontSize: '14px', marginLeft: '8px' }}>{errortext[1]}</span>
          )}
        </div>
      )}
      {(error && type !== 'repeatpassword') && (
        <span style={{ color: '#EB5757', fontSize: '14px', marginLeft: '8px' }}>{errortext}</span>
      )}
    </div>
  );
};
