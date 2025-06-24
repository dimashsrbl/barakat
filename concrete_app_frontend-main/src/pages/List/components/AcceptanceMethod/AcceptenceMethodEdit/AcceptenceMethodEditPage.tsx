import { useCallback, useEffect, useState } from 'react';

import { WeightIndicatorComponent } from 'ui/WeightIndicatorComponent'
import { InputComponent } from 'ui/InputComponent';
import { ButtonComponent } from 'ui/ButtonComponent';

import s from './index.module.scss'
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { getAcceptanceMethodDataById, getReceiveMethodTypesData, patchIsActiveChangeAcceptanceMethodData, putEditAcceptanceMethodData } from 'store/features/apiSlice';
import { useDispatch } from 'react-redux';
import { SelectComponent } from 'ui/SelectComponentAntd';
import { useWindowSize } from 'ui/UseWindowSizeComponent';

export const AcceptenceMethodEditPage = () => {
    const { id } = useParams<{ id: string }>();
    const [name, setName] = useState('');
    const [type, setType] = useState(null);
    const [description, setDescription] = useState('');
    const [isDisabled, setIsDisabled] = useState(true);
    const [isActive, setIsActive] = useState(false);
    const [responseError, setResponseError] = useState('');

    const [receiveMethodItems, setReceiveMethodTypeItems] = useState<any>([]);

    const navigate = useNavigate();
    const dispatch = useDispatch();
    const location = useLocation();
    const isMobile = useWindowSize();

    const searchParams = new URLSearchParams(location.search);
    const queryIsActive = searchParams.get('is_active') ? searchParams.get('is_active') : true;
    const querySearchValue = searchParams.get('search_value');
    const queryCurrentPage = searchParams.get('current_page');

    const getAcceptanceMethod = useCallback(async () => {
        const obj = {
            receive_method_id: id,
        }
        const response = await dispatch(getAcceptanceMethodDataById(obj));
        const data = response?.payload?.data;
        setName(data?.name);
        setDescription(data?.description);
        setType(data?.receive_method_type?.name);
        setIsActive(data?.is_active);
    }, [dispatch, id]);

    const getReceiveMethodTypes = useCallback(async () => {
        const response = await dispatch(getReceiveMethodTypesData());
        setReceiveMethodTypeItems(response?.payload?.data);
    }, [dispatch]);

    const editHandler = async () => {
        setIsDisabled(true);
        const obj: any = {
            receive_method_id: id,
            name: name,
            receive_method_type_id: receiveMethodItems.find((item: any) => item.name === type)?.id,
            description: description
        }
        const response = await dispatch(putEditAcceptanceMethodData(obj))
        if (response?.payload?.message === 'ok') {
            setIsDisabled(false);
            navigate(`/main/lists/acceptance-method?is_active=${queryIsActive}${querySearchValue !== 'null' ? `&search_value=${querySearchValue}` : ''}&current_page=${queryCurrentPage}`)
        } else if (response?.error?.message.includes('401')) {
            setResponseError('Недостаточно прав для выполнения этого запроса.')
            return
        } else if (response?.error?.message.includes('403')) {
            setResponseError('Недостаточно прав для выполнения этого запроса.')
            return
        } else if (response?.error?.message.includes('404')) {
            setResponseError('Способ приемки уже существует.');
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
            id: id,
            is_active: is_active
        }
        const response = await dispatch(patchIsActiveChangeAcceptanceMethodData(obj))
        if (response?.payload?.message === 'ok') {
            getAcceptanceMethod();
        } else if (response?.error?.message.includes('401')) {
            setResponseError('Недостаточно прав для выполнения этого запроса.');
            return
        } else if (response?.error?.message.includes('403')) {
            setResponseError('Недостаточно прав для выполнения этого запроса.');
            return
        } else if (response?.error?.message.includes('404')) {
            setResponseError('Способ приемки уже существует.');
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
        if (name !== '') setIsDisabled(false);
        else setIsDisabled(true);
    }, [name]);

    useEffect(() => {
        if (!isActive) setIsDisabled(true);
        else setIsDisabled(false);
    }, [isActive]);

    useEffect(() => {
        getAcceptanceMethod();
        getReceiveMethodTypes();
    }, [getAcceptanceMethod, getReceiveMethodTypes]);

 return (
    <div className='main'>
        {isMobile &&
            <div className={`${s.toolbar} df fdr pa w100`}/>
        }
        {!isMobile &&
            <div className="df fdr jcsb aib">
                <span className="fz28">Справочники - Редактировать способ приемки</span>
                <WeightIndicatorComponent/>
            </div>
        }

        <div className={`${s.contentBlock} df fdc`}>
        <div className={`${s.titleBlock} df jcsb`}>
            <div className='df fdc' style={{gap: '6px'}}>
                <span className='fw600 fz20'>Редактировать способ приемки</span>
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
                <span className="fw600">Данные о способе приемки</span>
                <div className={`${s.inputBlock} df`}>
                    <InputComponent
                        type="default"
                        placeholder="Наименование"
                        state={name}
                        setState={setName}
                    />
                    <SelectComponent
                        placeholder={'Тип'}
                        items={receiveMethodItems}
                        state={type}
                        height={"50px"}
                        setState={setType}
                        loadingText={'Нет данных...'}
                    />
                </div>
            </div>

            <div className={`${s.additionalBlock} df fdc`}>
                <span className="fw600">Дополнительная информация</span>
                <div className="df fdr">
                    <InputComponent
                        type="textarea"
                        placeholder="Примечание"
                        state={description}
                        setState={setDescription}
                    />
                </div>
            </div>
            <div className={`${s.actionButtons} df fdr w50`}>
                <ButtonComponent 
                    width='100%'
                    height='48px'
                    text="Сохранить изменения" 
                    onClick={(e:any) => {
                        editHandler();
                    }}
                    disabled={isDisabled} 
                    variant='primary'
                />
                <ButtonComponent 
                    width='100%'
                    height='48px'
                    text="Вернуться назад" 
                    onClick={(e:any) => {navigate(`/main/lists/acceptance-method?is_active=${queryIsActive}${querySearchValue !== 'null' ? `&search_value=${querySearchValue}` : ''}&current_page=${queryCurrentPage}`)}}
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