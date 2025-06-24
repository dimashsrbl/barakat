import React, { useCallback, useState, useEffect,  } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';

import { WeightIndicatorComponent } from 'ui/WeightIndicatorComponent'
import { InputComponent } from 'ui/InputComponent';
import { SelectComponent } from 'ui/SelectComponentAntd'
import { ButtonComponent } from 'ui/ButtonComponent';

import { getUserDataById, putEditUserData, getRolesData, patchIsActiveChangeUserData } from 'store/features/apiSlice'

import s from './index.module.scss'
import { useWindowSize } from 'ui/UseWindowSizeComponent';

export const UserEditPage = () => {
    const { id } = useParams<{ id: string }>();
    const [fullName, setFullName] = useState('');
    const [login, setLogin] = useState('');
    const [role, setRole] = useState(null);
    const [password, setPassword] = useState('');
    const [repeatPassword, setRepeatPassword] = useState('');
    const [note, setNote] = useState('');
    const [roleItems, setRoleItems] = useState<any>([]);
    const [isActive, setIsActive] = useState(false);
    const [isDisabled, setIsDisabled] = useState(true);
    const [responseError, setResponseError] = useState('');

    const loginRegex = /^[a-zA-Z0-9._]+$/;

    const navigate = useNavigate();
    const dispatch = useDispatch();
    const isMobile: boolean = useWindowSize();

    const getRoles = useCallback(async () => {
        const response = await dispatch(getRolesData());
        setRoleItems(response?.payload?.data)
    }, [dispatch]);

    const getUser = useCallback(async () => {
        const obj = {
            user_id: id,
          }
        const usersRequest = await dispatch(getUserDataById(obj));
        const userData = usersRequest?.payload?.data
        setFullName(userData?.fullname || '');
        setLogin(userData?.login);
        setRole(userData?.role?.name);
        setNote(userData?.description || '');
        setIsActive(userData?.is_active);
    }, [dispatch, id]);

    const editHandler = async () => {
        setIsDisabled(true);

        const obj: any = {
            user_id: id,
            login: login.trim(),
            password: password,
            fullname: fullName,
            description: note,
            role_id: roleItems.find((item: any) => item.name === role)?.id
        }
        const response = await dispatch(putEditUserData(obj))
        if (response?.payload?.message === 'ok') {
            setIsDisabled(false);
            navigate('/main/users');
        } else if (response?.error?.message.includes('401')) {
            setResponseError('Недостаточно прав для выполнения этого запроса.');
            return
        } else if (response?.error?.message.includes('404')) {
            setResponseError('Пользователь уже существует.');
            return
        } else if (response?.error?.message.includes('403')) {
            setResponseError('Недостаточно прав для выполнения этого запроса.');
            return
        } else if (response?.error?.message.includes('400')) {
            setResponseError('Некорректный запрос. Пожалуйста, убедитесь, что введенные данные соответствуют требованиям и повторите попытку.');
            return
        } else {
            setResponseError('Ошибка сервера');
            return
        }
    }

    const disableEnableHandler = async (is_active: boolean) => {
        const obj: any = {
            user_id: id,
            is_active: is_active
        }
        const response = await dispatch(patchIsActiveChangeUserData(obj))
        if (response?.payload?.message === 'ok') {
            getUser();
        } else if (response?.error?.message.includes('401')) {
            setResponseError('Недостаточно прав для выполнения этого запроса.');
            return
        } else if (response?.error?.message.includes('403')) {
            setResponseError('Недостаточно прав для выполнения этого запроса.');
            return
        } else {
            setResponseError('Ошибка сервера');
            return
        }
    }

    useEffect(() => {
        if (fullName !== '' && login !== '' && role !== null) setIsDisabled(false);
        else setIsDisabled(true);
    }, [fullName, login, role]);

    useEffect(() => {
        if (!isActive) setIsDisabled(true);
        else setIsDisabled(false);
    }, [isActive]);

    useEffect(() => {
        getUser();
        getRoles();
    }, [getUser, getRoles]);

 return (
    <div className='main'>
        {isMobile && 
            <div className={`${s.toolbar} df fdr pa w100`}/>
        }
        
        {!isMobile &&
            <div className="df fdr jcsb aib">
                <span className="fz28">Пользователи - Редактировать пользователя</span>
                <WeightIndicatorComponent/>
            </div>
        }

        <div className={`${s.contentBlock} df fdc`}>
            <div className={`${s.titleBlock} df jcsb`}>
                <div className='df fdc' style={{gap: '6px'}}>
                    <span className='fz20 fw600'>Редактировать пользователя</span>
                    <span className='fz16'>Измените данные и нажмите кнопку “Сохранить изменения”</span>
                </div>
                {isActive ? (
                    <ButtonComponent 
                    width='200px'
                    height='48px'
                    text="Деактивировать"
                    onClick={() => {disableEnableHandler(!isActive)}}
                    disabled={false} 
                    variant='deactivateButton'
                />
                ) : (
                    <ButtonComponent 
                    width='200px'
                    height='48px'
                    text='Активировать'
                    onClick={() => {disableEnableHandler(!isActive)}}
                    disabled={false} 
                    variant='activateButton'
                />  
                )}
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
                        regex={loginRegex}
                        errortext={'Некорректное значение'}
                        onKeyDown={(e: React.KeyboardEvent) => {
                            if (!loginRegex.test(e.key)) {
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
                <div className="df fdr">
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
                            setIs={false}
                            errortext={["Пароль должен состоять из мин. 6-10 символов", "Пароли не совпадают", "Некорректное значение"]}
                            regex={loginRegex}
                            onKeyDown={(e: React.KeyboardEvent) => {
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
                    text='Сохранить изменения' 
                    onClick={(e: any) => {
                        editHandler();
                    }}
                    disabled={isDisabled} 
                    variant='primary'
                />
                <ButtonComponent 
                    width='100%'
                    height='48px'
                    text='Вернуться назад' 
                    onClick={(e:any) => {navigate('/main/users')}}
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