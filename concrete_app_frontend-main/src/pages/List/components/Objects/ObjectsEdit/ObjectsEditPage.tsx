import React, { useCallback, useEffect, useState } from 'react';

import { WeightIndicatorComponent } from 'ui/WeightIndicatorComponent'
import { InputComponent } from 'ui/InputComponent';
import { SelectComponent } from 'ui/SelectComponentAntd'
import { ButtonComponent } from 'ui/ButtonComponent';

import s from './index.module.scss'
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { getCompaniesData, getMaterialTypesData, getObjectsDataById, patchIsActiveChangeObjectsData, putEditObjectsData } from 'store/features/apiSlice';
import { SelectMultipleComponent } from 'ui/SelectMultipleComponent';
import { useWindowSize } from 'ui/UseWindowSizeComponent';

export const ObjectsEditPage = () => {
    const { id } = useParams<{ id: string }>();
    const [name, setName] = useState('');
    const [company, setCompany] = useState(null);
    const [materialType, setMaterialType] = useState<any>([]);
    const [address, setAddress] = useState('');
    const [isActive, setIsActive] = useState(false);
    const [contactNumber, setContactNumber] = useState('');
    const [telegramID, setTelegramID] = useState('');
    const [isDisabled, setIsDisabled] = useState(true);
    const [responseError, setResponseError] = useState('');

    const [materialTypeItems, setMaterialTypeItems] = useState<any>([]);
    const [companyItems, setCompanyItems] = useState<any>([]);

    const navigate = useNavigate();
    const dispatch = useDispatch();
    const location = useLocation();
    const isMobile = useWindowSize();

    const searchParams = new URLSearchParams(location.search);
    const queryIsActive = searchParams.get('is_active') ? searchParams.get('is_active') : true;
    const querySearchValue = searchParams.get('search_value');
    const queryCurrentPage = searchParams.get('current_page');

    const getObject = useCallback(async () => {
        const obj = {
            object_id: id,
        }
        const request = await dispatch(getObjectsDataById(obj));
        const data = request?.payload?.data;
        setName(data?.name);
        setCompany(data?.company?.name);
        setMaterialType(data?.material_types.map((material:any) => material.name));
        setAddress(data?.address);
        setContactNumber(data?.contact_number);
        setTelegramID(data?.chat_id);
        setIsActive(data?.is_active);
    }, [dispatch, id]);
    
    const getMaterialTypes = useCallback(async () => {
        const response = await dispatch(getMaterialTypesData({is_for_dependent: true}));
        setMaterialTypeItems(response?.payload?.data);
    }, [dispatch]);

    const getCompanies = useCallback(async () => {
        const request = await dispatch(getCompaniesData());
        setCompanyItems(request?.payload?.data);
    }, [dispatch]);

    const editHandler = async () => {
        let allMaterialsIds: any[] = [];

        allMaterialsIds = materialType
          .map((material: any) => materialTypeItems.find((item: any) => item.name === material))
          .filter((foundItem: any) => foundItem)
          .map((foundItem: any) => foundItem.id);
        
        const materialArray = JSON.stringify(allMaterialsIds);

        setIsDisabled(true);

        const obj: any = {
            object_id: id,
            name: name,
            address: address,
            contact_number: contactNumber,
            chat_id: telegramID,
            company_id: companyItems.find((item: any) => item.name === company)?.id,
            material_type_ids: JSON.parse(materialArray),
        }

        const response = await dispatch(putEditObjectsData(obj))
        if (response?.payload?.message === 'ok') {
            setIsDisabled(false);
            navigate(`/main/lists/objects?is_active=${queryIsActive}${querySearchValue !== 'null' ? `&search_value=${querySearchValue}` : ''}&current_page=${queryCurrentPage}`)
        } else if (response?.error?.message.includes('401')) {
            setResponseError('Недостаточно прав для выполнения этого запроса.')
            return
        } else if (response?.error?.message.includes('403')) {
            setResponseError('Недостаточно прав для выполнения этого запроса.')
            return
        } else if (response?.error?.message.includes('404')) {
            setResponseError('Объект уже существует.');
            return
        } else if (response?.error?.message.includes('400')) {
            setResponseError('Некорректный запрос. Пожалуйста, убедитесь, что введенные данные соответствуют требованиям и повторите попытку.');
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
        const response = await dispatch(patchIsActiveChangeObjectsData(obj))
        if (response?.payload?.message === 'ok') {
            getObject();
        } else if (response?.error?.message.includes('401')) {
            setResponseError('Недостаточно прав для выполнения этого запроса.');
            return
        } else if (response?.error?.message.includes('403')) {
            setResponseError('Недостаточно прав для выполнения этого запроса.');
            return
        } else if (response?.error?.message.includes('404')) {
            setResponseError('Объект уже существует.');
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
        if (name !== '' && materialType.length !== 0 && company !== null) setIsDisabled(false);
        else setIsDisabled(true);
    }, [name, materialType, company]);
    
    useEffect(() => {
        if (!isActive) setIsDisabled(true);
        else setIsDisabled(false);
    }, [isActive]);

    useEffect(() => {
        getObject();
        getMaterialTypes();
        getCompanies();
    }, [getObject, getMaterialTypes, getCompanies]);

 return (
    <div className='main'>
        {isMobile &&
            <div className={`${s.toolbar} df fdr pa w100`}/>
        }
        {!isMobile && 
            <div className="df fdr jcsb aib">
                <span className="fz28">Справочники - Редактировать объект</span>
                <WeightIndicatorComponent/>
            </div>  
        }


        <div className={`${s.contentBlock} df fdc`}>
        <div className={`${s.titleBlock} df jcsb`}>
                <div className='df fdc' style={{gap: '6px'}}>
                <span className='fw600 fz20'>Редактировать объект</span>
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
                <span className="fw600">Данные объекта</span>
                <div className={`${s.inputBlock} df`}>
                    <InputComponent
                        type="default"
                        placeholder="Наименование"
                        state={name}
                        setState={setName}
                    />
                    <SelectComponent
                        placeholder={'Компания'}
                        items={companyItems}
                        state={company}
                        height={"50px"}
                        setState={setCompany}
                        loadingText={'Нет данных...'}
                    />
                </div>
                <div className={`${s.inputBlock} df`}>
                    <SelectMultipleComponent
                        placeholder={'Типы бетона'}
                        items={materialTypeItems}
                        state={materialType}
                        minHeight={'50px'}
                        setState={setMaterialType}
                        loadingText={'Нет данных...'}
                    />
                </div>
            </div>

            <div className={`${s.additionalBlock} df fdc`}>
                <span className="fw600">Контактные данные</span>
                <div className={`${s.inputBlock} df`}>
                    <InputComponent
                        type="default"
                        placeholder="Адрес"
                        state={address}
                        setState={setAddress}
                    />
                    <InputComponent
                        type="phone"
                        placeholder="Номер контактного лица"
                        state={contactNumber}
                        setState={setContactNumber}
                    />
                    <InputComponent
                        type="default"
                        placeholder="ID telegram чата"
                        state={telegramID}
                        setState={setTelegramID}
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
                    onClick={(e:any) => {
                        navigate(`/main/lists/objects?is_active=${queryIsActive}${querySearchValue !== 'null' ? `&search_value=${querySearchValue}` : ''}&current_page=${queryCurrentPage}`)
                    }}
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