import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { postUserData, setToken } from 'store/features/apiSlice';
import { useNavigate } from 'react-router-dom';

import s from './index.module.scss';
import { InputComponent } from 'ui/InputComponent';
import { ButtonComponent } from 'ui/ButtonComponent';

export const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorApi, setErrorApi] = useState('');
  const [isDisabled, setIsDisabled] = useState(true);
  const loginRegex = /^[a-zA-Z0-9._\s]+$/;

  const dispatch: any = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const authToken = localStorage.getItem('authtoken');
    if (authToken) {
      navigate('/main/plumblog')
    }
  }, [navigate]);

  useEffect(() => {
    setErrorApi('');
  }, [username, password]);

  useEffect(() => {
    setIsDisabled(!(password !== '' && username !== ''));
  }, [password, username]);

  const registerHandler = async (event: React.FormEvent) => {
    event.preventDefault();
    const userObj = {
      username,
      password,
    };

    try {
      const response = await dispatch(postUserData(userObj));
      if (response?.payload?.message === 'ok') {
        const token = response?.payload?.data?.access_token;
        dispatch(setToken(token));
        localStorage.setItem('authtoken', token);
        localStorage.setItem('username', userObj.username);
        navigate('/main/application-log');
      } else if (response?.error?.message.includes('400')) {
        setErrorApi('Вы ввели неверный логин или пароль');
      }
      else {
        setErrorApi('Ошибка сервера');
      }
    } catch (error) {
      localStorage.removeItem("authtoken");
      localStorage.removeItem("username");
      console.error(error);
    }
  };

  return (
    <div className={`${s.main} df aic jcc fdc`}>

        <div className={`${s.LogoBlock} tac cp ttuc fw700`}>
            Concrete.app
        </div>

        <div className={`${s.loginBlock} w100 df fdc aic`}>
          <span className="fw700 fz24">Авторизуйтесь</span>
          <form className="w100 df fdc aic" style={{ gap: '20px' }}>
            <InputComponent
              type="user"
              placeholder="Логин"
              regex={loginRegex}
              state={username}
              setState={setUsername}
              onKeyDown={(e: React.KeyboardEvent) => {
                if (e.key === 'Enter') {
                    registerHandler(e);
                } else if (!e.key.match(loginRegex)) {
                  e.preventDefault();
                }
              }}
            />
            <div className="df fdc aifs w100">
              <InputComponent
                type="password"
                placeholder="Пароль"
                regex={loginRegex}
                state={password}
                setState={setPassword}
                onKeyDown={(e: React.KeyboardEvent) => {
                  if (e.key === 'Enter') {
                      registerHandler(e);
                  } else if (!e.key.match(loginRegex)) {
                    e.preventDefault();
                  }
                }}
              />
              {errorApi !== '' && (
                <span style={{ color: '#EB5757', fontSize: '14px', margin: '10px 0 0 12px' }}>{errorApi}</span>
              )}
            </div>
            <ButtonComponent 
            text="Войти" 
            onClick={(e:any) => {
                registerHandler(e)
            }}
            disabled={isDisabled} 
            variant='primary'/>
          </form>
            <div className={`${s.bottom} df aic`}>
                <p className="tac fz14" style={{ color: '#4F4F4F' }}>
                    Нажимая на кнопку “Войти” Вы соглашаетесь с <span className='tdu cp'>Правилами пользования</span>
                </p>
            </div>
        </div>
        
    </div>
  );
};
