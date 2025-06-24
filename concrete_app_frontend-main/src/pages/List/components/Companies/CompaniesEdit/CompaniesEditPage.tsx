import React, { useCallback, useState, useEffect,  } from 'react';
import { useDispatch } from 'react-redux';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { WeightIndicatorComponent } from 'ui/WeightIndicatorComponent'
import { InputComponent } from 'ui/InputComponent';
import { SelectComponent } from 'ui/SelectComponentAntd'
import { ButtonComponent } from 'ui/ButtonComponent';

import { getCompaniesDataById, putEditCompaniesData, patchIsActiveChangeCompanyData } from 'store/features/apiSlice'

import { companyTypes, companyFunctionConst } from 'constDatas'

import s from './index.module.scss'
import { ShipmentSuspensionPopup } from './components/ShipmentSuspensionPopup';
import { ShipmentResumptionPopup } from './components/ShipmentResumptionPopup';
import { useWindowSize } from 'ui/UseWindowSizeComponent';

export const CompaniesEditPage = () => {
    const { id } = useParams<{ id: string }>();
    const [name, setName] = useState('');
    const [companyType, setCompanyType] = useState(null);
    const [companyFunction, setCompanyFunction] = useState(null);
    const [number, setNumber] = useState('');
    const [bin, setBin] = useState('');
    const [isActive, setIsActive] = useState(false);
    const [isDisabled, setIsDisabled] = useState(true);
    const [isDebtor, setIsDebtor] = useState(false);

    const [responseError, setResponseError] = useState('');
    
    const [viewShipmentSuspensionPopup, setViewShipmentSuspensionPopup] = useState(false);
    const [viewShipmentResumptionPopup, setViewShipmentResumptionPopup] = useState(false);

    const navigate = useNavigate();
    const dispatch = useDispatch();
    const location = useLocation();
    const isMobile = useWindowSize();

    const searchParams = new URLSearchParams(location.search);
    const queryIsActive = searchParams.get('is_active') ? searchParams.get('is_active') : true;
    const querySearchValue = searchParams.get('search_value');
    const queryCurrentPage = searchParams.get('current_page');

    const getCompany = useCallback(async () => {
        const obj = {
            company_id: id,
          }
        const request = await dispatch(getCompaniesDataById(obj));
        const data = request?.payload?.data;
        setName(data?.name);
        setCompanyType(data?.company_type);
        setCompanyFunction(data?.company_func);
        setNumber(data?.contact_number);
        setBin(data?.bin || '');
        setIsActive(data?.is_active);
        setIsDebtor(data?.is_debtor);
    }, [dispatch, id]);

    const editHandler = async () => {
        setIsDisabled(true);
        const obj: any = {
            company_id: id,
            name: name,
            company_type: companyType,
            bin: bin,
            company_func: companyFunction,
            contact_number: number,
        }
        const response = await dispatch(putEditCompaniesData(obj))
        if (response?.payload?.message === 'ok') {
            setIsDisabled(false);
            navigate(`/main/lists?is_active=${queryIsActive}${querySearchValue !== 'null' ? `&search_value=${querySearchValue}` : ''}&current_page=${queryCurrentPage}`)
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
        const response = await dispatch(patchIsActiveChangeCompanyData(obj))
        if (response?.payload?.message === 'ok') {
            getCompany();
        } else if (response?.error?.message.includes('401')) {
            setResponseError('Недостаточно прав для выполнения этого запроса.');
            return
        } else if (response?.error?.message.includes('403')) {
            setResponseError('Недостаточно прав для выполнения этого запроса.');
            return
        } else if (response?.error?.message.includes('404')) {
            setResponseError('Компания уже существует.');
            return
        } else if (response?.error?.message.includes('400')) {
            setResponseError('Некорректный запрос. Пожалуйста, убедитесь, что введенные данные соответствуют требованиям и повторите попытку.');
            return
        } else {
            setResponseError('Ошибка сервера');
            return
        }
    }

    useEffect(() => {
        if (name !== '' && companyType !== null && companyFunction !== null && number !== '') setIsDisabled(false);
        else setIsDisabled(true);
    }, [name, companyType, companyFunction, number]);

    useEffect(() => {
        if (!isActive) setIsDisabled(true);
        else setIsDisabled(false);
    }, [isActive]);

    useEffect(() => {
        getCompany();
    }, [getCompany]);

 return (
    <div className='main'>
        {viewShipmentSuspensionPopup && 
            <ShipmentSuspensionPopup 
                companyID={id}
                popup={viewShipmentSuspensionPopup} 
                setPopup={setViewShipmentSuspensionPopup} 
                refreshData={getCompany}
        /> }
        {viewShipmentResumptionPopup && 
            <ShipmentResumptionPopup 
                companyID={id}
                popup={viewShipmentResumptionPopup} 
                setPopup={setViewShipmentResumptionPopup} 
                refreshData={getCompany}
        /> }
        {isMobile &&
            <div className={`${s.toolbar} df fdr pa w100`}/>
        }
        {!isMobile &&
            <div className="df fdr jcsb aib">
                <span className="fz28">Справочники - Редактировать компанию</span>
                <WeightIndicatorComponent/>
            </div>
        }

        <div className={`${s.contentBlock} df fdc`}>
            <div className={`${s.titleBlock} df jcsb`}>
                <div className='df fdc' style={{gap: '6px'}}>
                    <span className='fw600 fz20'>Редактировать компанию</span>
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
                <span className="fw600">Данные компании</span>
                <div className={`${s.inputBlock} df`}>
                    <InputComponent
                        type="default"
                        placeholder="Наименование"
                        state={name}
                        setState={setName}
                        width='100%'
                    />
                    <InputComponent
                        type="default"
                        placeholder="БИН"
                        state={bin}
                        width='100%'
                        setState={setBin}
                        onKeyDown={(e: React.KeyboardEvent) => ""}
                    />
                    <SelectComponent
                        placeholder={'Тип'}
                        items={companyTypes}
                        state={companyType}
                        setState={setCompanyType}
                        loadingText={'Нет данных...'}
                    />
                </div>
                <div className={`${s.inputBlock} df`}>
                    <SelectComponent
                        placeholder={'Функция'}
                        items={companyFunctionConst}
                        state={companyFunction}
                        setState={setCompanyFunction}
                        loadingText={'Нет данных...'}
                    />
                    <InputComponent
                        type="phone"
                        width='100%'
                        placeholder="Номер контактного лица"
                        state={number}
                        setState={setNumber}
                    />
                </div>
            </div>

            <div className={`${s.actionButtons} df w80`}>
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
                {isDebtor ? (
                    <ButtonComponent 
                        width='100%'
                        height='48px'
                        text="Возобновление отгрузки" 
                        onClick={(e: any) => {
                            setViewShipmentResumptionPopup(true);
                        }}
                        disabled={isDisabled} 
                        variant='activateButton'
                    />
                    ) : (
                    <ButtonComponent 
                        width='100%'
                        height='48px'
                        text="Приостановка отгрузки" 
                        onClick={(e: any) => {
                            setViewShipmentSuspensionPopup(true);
                        }}
                        disabled={isDisabled} 
                        variant='deactivateButton'
                    />
                )}
                <ButtonComponent 
                    width='100%'
                    height='48px'
                    text="Вернуться назад" 
                    onClick={(e:any) => {navigate(`/main/lists?is_active=${queryIsActive}${querySearchValue !== 'null' ? `&search_value=${querySearchValue}` : ''}&current_page=${queryCurrentPage}`)}}
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