import { useState, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { WeightIndicatorComponent } from 'ui/WeightIndicatorComponent';
import { InputComponent } from 'ui/InputComponent';
import { SelectComponent } from 'ui/SelectComponentAntd';
import { ButtonComponent } from 'ui/ButtonComponent';
import { useWindowSize } from 'ui/UseWindowSizeComponent';

import { postAddUserData, getRolesData } from 'store/features/apiSlice';

import s from './index.module.scss';

export const UserAddPage = () => {
    const [fullName, setFullName] = useState('')
    const [login, setLogin] = useState('')
    const [password, setPassword] = useState('');
    const [role, setRole] = useState(null);
    const [roleItems, setRoleItems] = useState<any>([]);
    const [repeatPassword, setRepeatPassword] = useState('');
    const [note, setNote] = useState('');
    const [isDisabled, setIsDisabled] = useState(true);
    const [isPassword, setIsPassword] = useState(false);
    const [responseError, setResponseError] = useState('');
    
    const loginRegex = /^[a-zA-Z0-9._]+$/;

    const navigate = useNavigate();
    const dispatch = useDispatch();
    const isMobile: boolean = useWindowSize();
    
    const getRoles = useCallback(async () => {
        const response = await dispatch(getRolesData());
        setRoleItems(response?.payload?.data)
    }, [dispatch]);

    const addHandler = async () => {
        setIsDisabled(true);

        const obj: any = {
            login: login.trim(),
            password: password,
            fullname: fullName,
            description: note,
            role_id: roleItems.find((item: any) => item.name === role)?.id
        }
        const response = await dispatch(postAddUserData(obj))
        if (response?.payload?.message === 'ok') {
            setIsDisabled(false);
            navigate('/main/users');
        } else if (response?.error?.message.includes('401')) {
            setResponseError('Недостаточно прав для выполнения этого запроса.')
            return
        } else if (response?.error?.message.includes('404')) {
            setResponseError('Пользователь уже существует.');
            return
        } else if (response?.error?.message.includes('403')) {
            setResponseError('Недостаточно прав для выполнения этого запроса.')
            return
        } else if (response?.error?.message.includes('400')) {
            setResponseError('Некорректный запрос. Пожалуйста, убедитесь, что введенные данные соответствуют требованиям и повторите попытку.');
            return
        } else {
            setResponseError('Ошибка сервера')
            return
        }
    }

    useEffect(() => {
        if (fullName !== '' && login !== '' && role !== null && isPassword) setIsDisabled(false);
        else setIsDisabled(true);
    }, [fullName, login, role, isPassword]);

    useEffect(() => {
        getRoles();
    }, [getRoles]);

 return (
    <div className='main'>
        {isMobile && 
            <div className={`${s.toolbar} df fdr pa w100`}/>
        }
        {!isMobile &&
            <div className="df fdr jcsb aib">
                <span className="fz28">Пользователи - Добавить пользователя</span>
                <WeightIndicatorComponent/>
            </div>
        }

        <div className={`${s.contentBlock} df fdc`}>
            <div className={`${s.titleBlock} df fdc`}>
                <span className='fw600 fz20'>Добавить нового пользователя</span>
                <span className='fz16'>Введите данные и нажмите кнопку “Добавить пользователя”</span>
            </div>
            <div className={`${s.personalBlock} df fdc`}>
                <span className="fw600">Персональные данные</span>
                <div className={`${s.inputBlock} df`}>
                    <InputComponent
                        type="default"
                        placeholder="Введите ФИО"
                        state={fullName}
                        setState={setFullName}
                    />
                    <InputComponent
                        type="default"
                        placeholder="Создайте логин"
                        state={login}
                        setState={setLogin}
                        errortext={'Некорректное значение'}
                        regex={loginRegex}
                        onKeyDown={(e: React.KeyboardEvent) => {
                            if (!e.key.match(loginRegex)) {
                                e.preventDefault();
                            }
                        }}
                    />
                    <SelectComponent
                        placeholder={'Выберите роль'}
                        items={roleItems}
                        state={role}
                        setState={setRole}
                        height={"50px"}
                        loadingText={'Нет данных...'}
                    />
                </div>
            </div>

            <div className={`${s.securityBlock} df fdc`}>
                <span className="fw600">Безопасность</span>
                <div className={`${s.passwordInput} df`}>
                    <InputComponent
                            type={"repeatpassword"}
                            placeholder={["Создайте пароль", "Подтвердите пароль"]}
                            icon={true}
                            state={password}
                            setState={setPassword}
                            repeat={repeatPassword}
                            setRepeat={setRepeatPassword}
                            gap={"15px"}
                            autocomplete={"off"}
                            setIs={setIsPassword}
                            errortext={["Пароль должен состоять из мин. 6-10 символов", "Пароли не совпадают"]}
                            regex={loginRegex}
                            onKeyDown={(e: any) => {
                                if (!loginRegex.test(e.key)) {
                                    e.preventDefault();
                                }
                            }}
                        />
                </div>
            </div>

            <div className={`${s.additionalBlock} df fdc`}>
                <span className="fw600">Дополнительная информация</span>
                <div className="df fdr">
                    <InputComponent
                        type="textarea"
                        placeholder="Примечание"
                        state={note}
                        setState={setNote}
                    />
                </div>
            </div>
            <div className={`${s.actionButtons} df fdr w50`}>
                <ButtonComponent 
                    width='100%'
                    height='48px'
                    text="Добавить пользователя" 
                    onClick={(e: any) => {
                        addHandler();
                    }}
                    disabled={isDisabled} 
                    variant='primary'
                />
                <ButtonComponent 
                    width='100%'
                    height='48px'
                    text="Вернуться назад" 
                    onClick={() => {navigate('/main/users')}}
                    disabled={false} 
                    variant='secondary'
                />
            </div>
            {responseError !== '' && (
                <span style={{ color: '#EB5757', fontSize: '14px', margin: '10px 0 0 12px' }}>{responseError}</span>
            )}
        </div>
    </div>
 )
}