import { useCallback, useState, useEffect,  } from 'react';
import { useDispatch } from 'react-redux';
import { useLocation, useNavigate, useParams } from 'react-router-dom';


import { getDriverDataById, patchIsActiveChangeDriverData, putEditDriverData } from 'store/features/apiSlice'

import { WeightIndicatorComponent } from 'ui/WeightIndicatorComponent'
import { InputComponent } from 'ui/InputComponent';
import { ButtonComponent } from 'ui/ButtonComponent';

import s from './index.module.scss'
import { useWindowSize } from 'ui/UseWindowSizeComponent';

export const DriverEditPage = () => {
    const { id } = useParams<{ id: string }>();
    const [name, setName] = useState('');
    const [isActive, setIsActive] = useState(false);
    const [isDisabled, setIsDisabled] = useState(true);
    const [responseError, setResponseError] = useState('');

    const navigate = useNavigate();
    const dispatch = useDispatch();
    const location = useLocation();
    const isMobile = useWindowSize();

    const searchParams = new URLSearchParams(location.search);
    const queryIsActive = searchParams.get('is_active') ? searchParams.get('is_active') : true;
    const querySearchValue = searchParams.get('search_value');
    const queryCurrentPage = searchParams.get('current_page');

    const getDriver = useCallback(async () => {
        const obj = {
            id: id,
        }
        const request = await dispatch(getDriverDataById(obj));
        const data = request?.payload?.data;
        setName(data?.name);
        setIsActive(data?.is_active);
    }, [dispatch, id]);

    const editHandler = async () => {
        setIsDisabled(true);
        const obj: any = {
            id: id,
            name: name,
        }
        const response = await dispatch(putEditDriverData(obj))
        if (response?.payload?.message === 'ok') {
            setIsDisabled(false);
            navigate(`/main/lists/drivers?is_active=${queryIsActive}${querySearchValue !== 'null' ? `&search_value=${querySearchValue}` : ''}&current_page=${queryCurrentPage}`)
        } else if (response?.error?.message.includes('401')) {
            setResponseError('Недостаточно прав для выполнения этого запроса.')
            return
        } else if (response?.error?.message.includes('403')) {
            setResponseError('Недостаточно прав для выполнения этого запроса.')
            return
        } else {
            setResponseError('Ошибка сервера')
            return
        }
    }

    const disableEnableHandler = async (is_active: boolean) => {
        const obj: any = {
            id: id,
            is_active: is_active
        }
        const response = await dispatch(patchIsActiveChangeDriverData(obj))
        if (response?.payload?.message === 'ok') {
            getDriver();
        } else if (response?.error?.message.includes('401')) {
            setResponseError('Недостаточно прав для выполнения этого запроса.');
            return
        } else if (response?.error?.message.includes('403')) {
            setResponseError('Недостаточно прав для выполнения этого запроса.');
            return
        } else if (response?.error?.message.includes('404')) {
            setResponseError('Водитель уже существует.');
            return
        }  else if (response?.error?.message.includes('400')) {
            setResponseError('Некорректный запрос. Пожалуйста, убедитесь, что введенные данные соответствуют требованиям и повторите попытку.');
            return
        } else {
            setResponseError('Ошибка сервера');
            return
        }
    }

    useEffect(() => {
        if (name !== '' && isActive) setIsDisabled(false);
        else setIsDisabled(true);
    }, [name, isActive]);

    useEffect(() => {
        getDriver();
    }, [getDriver]);

 return (
    <div className='main'>
        {isMobile &&
            <div className={`${s.toolbar} df fdr pa w100`}/>
        }
        {!isMobile &&
            <div className="df fdr jcsb aib">
                <span className="fz28">Справочники - Редактировать водителя</span>
                <WeightIndicatorComponent/>
            </div>
        }

        <div className={`${s.contentBlock} df fdc`}>
            <div className={`${s.titleBlock} df jcsb`}>
                <div className='df fdc' style={{gap: '6px'}}>
                    <span className='fw600 fz20'>Редактировать водителя</span>
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
                <span className="fw600">Данные водителя</span>
                <div className={`${s.inputBlock} df fdr`}>
                    <InputComponent
                        type='default'
                        placeholder='Наименование'
                        state={name}
                        setState={setName}
                    />
                </div>
            </div>
            <div className={`${s.actionButtons} df fdr w50`}>
                <ButtonComponent 
                    width='100%'
                    height='48px'
                    text="Сохранить изменения" 
                    onClick={(e: any) => {
                        editHandler();
                    }}
                    disabled={isDisabled} 
                    variant='primary'
                />
                <ButtonComponent 
                    width='100%'
                    height='48px'
                    text="Вернуться назад" 
                    onClick={(e:any) => {navigate(`/main/lists/drivers?is_active=${queryIsActive}${querySearchValue !== 'null' ? `&search_value=${querySearchValue}` : ''}&current_page=${queryCurrentPage}`)}}
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