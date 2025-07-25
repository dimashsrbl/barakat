import React, { useCallback, useEffect, useState } from 'react';

import { WeightIndicatorComponent } from 'ui/WeightIndicatorComponent'
import { InputComponent } from 'ui/InputComponent';
import { SelectComponent } from 'ui/SelectComponentAntd'
import { ButtonComponent } from 'ui/ButtonComponent';

import s from './index.module.scss'
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { getConstructionTypesData, getConstructionsDataById, patchIsActiveChangeConstructionsData, putEditConstructionsData } from 'store/features/apiSlice';
import { useWindowSize } from 'ui/UseWindowSizeComponent';

export const ConstructionsEditPage = () => {
    const { id } = useParams<{ id: string }>();
    const [name, setName] = useState('');
    const [type, setType] = useState(null);
    const [description, setDescription] = useState('');
    const [isDisabled, setIsDisabled] = useState(true);
    const [isActive, setIsActive] = useState(false);
    const [responseError, setResponseError] = useState('');

    const [constructionTypeItems, setConstructionTypeItems] = useState<any>([]);

    const navigate = useNavigate();
    const dispatch = useDispatch();
    const location = useLocation();
    const isMobile = useWindowSize();

    const searchParams = new URLSearchParams(location.search);
    const queryIsActive = searchParams.get('is_active') ? searchParams.get('is_active') : true;
    const querySearchValue = searchParams.get('search_value');
    const queryCurrentPage = searchParams.get('current_page');

    const getConstructionTypes = useCallback(async () => {
        const response = await dispatch(getConstructionTypesData());
        setConstructionTypeItems(response?.payload?.data);
    }, [dispatch]);

    const getConstruction = useCallback(async () => {
        const obj = {
            construction_id: id,
        }
        const response = await dispatch(getConstructionsDataById(obj));
        const data = response?.payload?.data;
        setName(data?.name);
        setType(data?.construction_type?.name);
        setDescription(data?.description);
        setIsActive(data?.is_active);
    }, [dispatch, id]);

    const editHandler = async () => {
        setIsDisabled(true);
        const obj: any = {
            construction_id: id,
            name: name,
            construction_type_id: constructionTypeItems.find((item: any) => item.name === type)?.id,
            description: description
        }
        const response = await dispatch(putEditConstructionsData(obj));
        if (response?.payload?.message === 'ok') {
            setIsDisabled(false);
            navigate(`/main/lists/constructions?is_active=${queryIsActive}${querySearchValue !== 'null' ? `&search_value=${querySearchValue}` : ''}&current_page=${queryCurrentPage}`)
        } else if (response?.error?.message.includes('401')) {
            setResponseError('Недостаточно прав для выполнения этого запроса.')
            return
        } else if (response?.error?.message.includes('403')) {
            setResponseError('Недостаточно прав для выполнения этого запроса.')
            return
        } else if (response?.error?.message.includes('404')) {
            setResponseError('Конструкция уже существует.');
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
        const response = await dispatch(patchIsActiveChangeConstructionsData(obj))
        if (response?.payload?.message === 'ok') {
            getConstruction();
        } else if (response?.error?.message.includes('401')) {
            setResponseError('Недостаточно прав для выполнения этого запроса.');
            return
        } else if (response?.error?.message.includes('403')) {
            setResponseError('Недостаточно прав для выполнения этого запроса.');
            return
        } else if (response?.error?.message.includes('404')) {
            setResponseError('Конструкция уже существует.');
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
        if (name !== '' && type !== null) setIsDisabled(false);
        else setIsDisabled(true);
    }, [name, type]);

    useEffect(() => {
        if (!isActive) setIsDisabled(true);
        else setIsDisabled(false);
    }, [isActive]);

    useEffect(() => {
        getConstruction();
        getConstructionTypes()
    }, [getConstruction, getConstructionTypes]);

 return (
    <div className='main'>
        {isMobile &&
            <div className={`${s.toolbar} df fdr pa w100`}/>
        }
        {!isMobile &&
            <div className="df fdr jcsb aib">
                <span className="fz28">Справочники - Редактировать конструкцию</span>
                <WeightIndicatorComponent/>
            </div>
        }

        <div className={`${s.contentBlock} df fdc`}>
            <div className={`${s.titleBlock} df jcsb`}>
                <div className='df fdc' style={{gap: '6px'}}>
                    <span className='fw600 fz20'>Редактировать конструкцию</span>
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
                <span className="fw600">Данные конструкции</span>
                <div className={`${s.inputBlock} df`}>
                <InputComponent
                        type="default"
                        placeholder="Наименование"
                        state={name}
                        setState={setName}
                    />
                    <SelectComponent
                        placeholder={'Тип'}
                        items={constructionTypeItems}
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
                    onClick={(e:any) => {navigate(`/main/lists/constructions?is_active=${queryIsActive}${querySearchValue !== 'null' ? `&search_value=${querySearchValue}` : ''}&current_page=${queryCurrentPage}`)}}
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