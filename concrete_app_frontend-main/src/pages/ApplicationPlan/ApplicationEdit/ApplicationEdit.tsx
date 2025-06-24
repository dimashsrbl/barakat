import { CaretIcon } from "assets/icons/CaretIcon";
import { useNavigate, useParams } from "react-router-dom"
import { WeightIndicatorComponent } from "ui/WeightIndicatorComponent"

import s from './index.module.scss'
import { InputComponent } from "ui/InputComponent";
import { SelectComponent } from "ui/SelectComponentAntd";
import { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { getAcceptanceMethodData, getCompaniesData, getConstructionsData, getMaterialsData, getObjectsData, getRequestDataById, patchIsActiveChangeRequestData, putRequestDataById } from "store/features/apiSlice";
import { DatePickerComponent } from "ui/DatePickerComponent";
import { TimePickerComponent } from "ui/TimePickerComponent";
import { ButtonComponent } from "ui/ButtonComponent";

import dayjs from "dayjs";
import { formatAPIDateTime, numberRegex } from "constDatas";
import { AlertComponent } from "ui/AlertComponent";
import { useWindowSize } from "ui/UseWindowSizeComponent";
import { ToggleSwitchComponent } from "ui/ToggleSwitchComponent";

export const ApplicationEditPage = () => {
    const { id } = useParams<{ id: string }>();
    const [sellerCompany, setSellerCompany] = useState(null);
    const [clientCompany, setClientCompany] = useState(null);
    const [object, setObject] = useState(null);
    const [material, setMaterial] = useState(null);
    const [purposeCubature, setPurposeCubature] = useState('');
    const [interval, setInterval] = useState('');
    const [deliveryDate, setDeliveryDate] = useState<any>(null);
    const [deliveryTime, setDeliveryTime] = useState<any>(null);
    const [acceptanceMethod, setAcceptanceMethod] = useState(null);
    const [construction, setConstruction] = useState(null);
    const [coneDraft, setConeDraft] = useState('');
    const [description, setDescription] = useState('');
    const [isActive, setIsActive] = useState(false);
    const [isDisabled, setIsDisabled] = useState(true);
    const [byCall, setByCall] = useState(false);
    const [autoSendTelegram, setAutoSendTelegram] = useState(false);

    const [responseError, setResponseError] = useState('');

    const [sellerCompanyItems, setSellerCompanyItems] = useState<any>([]);
    const [clientCompanyItems, setClientCompanyItems] = useState<any>([]);
    const [objectItems, setObjectItems] = useState<any>([]);
    const [materialItems, setMaterialItems] = useState<any>([]);
    const [acceptanceMethodItems, setAcceptanceMethodItems] = useState<any>([]);
    const [constructionItems, setConstructionItems] = useState<any>([]);

    const [showAlert, setShowAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');

    const navigate = useNavigate();
    const dispatch = useDispatch();
    const isMobile: boolean = useWindowSize();

    const editHandler = async () => {
        setIsDisabled(true);
        const dateOnly = dayjs(deliveryDate).format('YYYY-MM-DD');
        const timeOnly = dayjs(deliveryTime).format('HH:mm:ss');
        const combinedDateTime = `${dateOnly}${timeOnly}`;

        const obj: any = {
            id: id,
            interval: Number(interval),
            purpose_cubature: purposeCubature ? purposeCubature.toString().replace(/,/g, '.') : purposeCubature,
            purpose_start: formatAPIDateTime(combinedDateTime),
            receive_method_id: acceptanceMethodItems.find((item: any) => item.name === acceptanceMethod)?.id,
            seller_company_id: sellerCompanyItems.find((item: any) => item.name === sellerCompany)?.id,
            client_company_id: clientCompanyItems.find((item: any) => item.name === clientCompany)?.id,
            material_id: materialItems.find((item: any) => item.name === material)?.id,
            construction_id: constructionItems.find((item: any) => item.name === construction)?.id,
            cone_draft_default: coneDraft,
            object_id: objectItems.find((item: any) => item.name === object)?.id,
            by_call: byCall,
            auto_send_telegram: autoSendTelegram,
            description: description,
        }
        const response = await dispatch(putRequestDataById(obj));
        if (response?.payload?.message === 'ok') {
            setIsDisabled(false);
            navigate(`/main/application-log/view/${id}`);
        } else if (response?.error?.message.includes('401')) {
            setResponseError('Недостаточно прав для выполнения этого запроса.')
            return
        } else if (response?.error?.message.includes('403')) {
            setResponseError('Недостаточно прав для выполнения этого запроса.')
            return
        } else if (response?.error?.message.includes('404')) {
            setResponseError('Заявка уже существует.');
            return
        } else if (response?.error?.message.includes('400')) {
            setResponseError('Некорректный запрос. Пожалуйста, убедитесь, что введенные данные соответствуют требованиям и повторите попытку.');
            return
        } else {
            setResponseError('Ошибка сервера.')
            return
        }
    }

    const getRequest = useCallback(async () => {
        const obj = {
            id: id,
        }
        const request = await dispatch(getRequestDataById(obj));
        const data = request?.payload?.data;
        setSellerCompany(data?.seller_company?.name);
        setClientCompany(data?.client_company?.name);
        setObject(data?.object?.name);
        setMaterial(data?.material?.name);
        setPurposeCubature(data?.purpose_cubature || '');
        setInterval(data?.interval || '');
        setDeliveryDate(dayjs(data?.purpose_start));
        setDeliveryTime(dayjs(data?.purpose_start));
        setAcceptanceMethod(data?.receive_method?.name);
        setConstruction(data?.construction?.name);
        setConeDraft(data?.cone_draft_default || '');
        setIsActive(data?.is_active);
        setByCall(data?.by_call);
        setDescription(data?.description || '');
        setAutoSendTelegram(data?.auto_send_telegram || false);
    }, [dispatch, id]);

    const getSellerCompanies = useCallback(async () => {
        const request = await dispatch(getCompaniesData({ company_function: 'Наша' }));
        setSellerCompanyItems(request?.payload?.data);
    }, [dispatch]);

    const getClientCompanies = useCallback(async () => {
        const request = await dispatch(getCompaniesData({ company_function: 'Заказчик' }));
        setClientCompanyItems(request?.payload?.data);
    }, [dispatch]);

    const getAcceptanceMethod = useCallback(async () => {
        const request = await dispatch(getAcceptanceMethodData());
        setAcceptanceMethodItems(request?.payload?.data);
    }, [dispatch]);

    const getConstruction = useCallback(async () => {
        const request = await dispatch(getConstructionsData());
        setConstructionItems(request?.payload?.data);
    }, [dispatch]);

    const handleChangeClientCompany = useCallback(async (clientCompany: any, old_object: any, old_material: any) => {
        const company = clientCompanyItems.find((item: any) => item.name === clientCompany);
        if (!company) return;
    
        if (company.is_debtor) {
            setObject(null);
            setMaterial(null);
            setObjectItems([]);
            setMaterialItems([]);
            setIsDisabled(true);
            setAlertMessage(company.debtor_note);
            setShowAlert(true);
            return;
        }
    
        const request = await dispatch(getObjectsData({ company_id: company.id }));
        const responseData = request?.payload?.data || [];
        setObjectItems(responseData);
        
        if (responseData.length > 0 && responseData[0]?.name !== null) {
            const materialRequest = await dispatch(getMaterialsData({ object_id: responseData[0]?.id }));
            setMaterialItems(materialRequest?.payload?.data || []);
            if (!old_material) {
                setMaterial(null);
            }
            if (!old_object) {
                setObject(responseData[0]?.name || null);
            }
        } else {
            setMaterialItems([]);
            setMaterial(null);
            setObject(null);
        }

    }, [dispatch, clientCompanyItems]);
    
    const handleChangeObject = useCallback(async (object: any) => {
        const object_id = objectItems.find((item: any) => item.name === object)?.id
        if (!object_id) return;
        if (object_id) {
            const request = await dispatch(getMaterialsData({ object_id: object_id }));
            setMaterialItems(request?.payload?.data);
        } else {
            setMaterial(null);
        }

    }, [dispatch, objectItems])

    useEffect(() => {
        handleChangeClientCompany(clientCompany, object, material);
    }, [clientCompany, material, object, handleChangeClientCompany])

    const handleCloseAlert = () => {
        setShowAlert(false);
    };

    const disableEnableHandler = async (is_active: boolean) => {
        setResponseError('');
        const obj: any = {
            id: id,
            is_active: is_active
        }
        const response = await dispatch(patchIsActiveChangeRequestData(obj))
        if (response?.payload?.message === 'ok') {
            getRequest();
        } else if (response?.error?.message.includes('401')) {
            setResponseError('Недостаточно прав для выполнения этого запроса.');
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

    useEffect(() => {
        if ((clientCompany !== null && !clientCompanyItems.find((item: any) => item.name === clientCompany)?.is_debtor) &&
            object !== null &&
            material !== null &&
            purposeCubature !== '' &&
            interval !== '' &&
            deliveryDate !== null &&
            deliveryTime !== null &&
            acceptanceMethod !== null &&
            construction !== null && isActive) setIsDisabled(false);
        else setIsDisabled(true);
    }, [clientCompanyItems, clientCompany, isActive, object, material, purposeCubature, interval, deliveryDate, deliveryTime, acceptanceMethod, construction]);

    useEffect(() => {
        getSellerCompanies();
        getClientCompanies();
        getAcceptanceMethod();
        getConstruction();
        getRequest();
    }, [getSellerCompanies, getClientCompanies, getAcceptanceMethod, getConstruction, getRequest])

    return (
        <div className='main'>
            {showAlert && <AlertComponent message={`Запрещена отгрузка по данной компании, так как она имеет статус должника: ${alertMessage}`} onClose={handleCloseAlert} />}
            {isMobile && 
                <div className={`${s.toolbar} df fdr pa w100`}/>
            }
            {!isMobile && 
                <div className="df fdr jcsb aib">
                    <div className="df fdr aic" style={{ gap: '12px' }}>
                        <span className="fz24 cg cp" onClick={() => navigate('/main/application-plan')}>План заявок</span>
                        <CaretIcon />
                        <span className="fz28">Редактировать заявку</span>
                    </div>
                    <WeightIndicatorComponent />
                </div>
            }
            <div className={`${s.contentBlock} df fdc`}>
                <div className={`${s.titleBlock} df jcsb`}>
                    <div className='df fdc' style={{gap: '6px'}}>
                        <span className='fw600 fz20'>Заявка №{id}</span>
                        <span className='fz16'>Измените данные и нажмите кнопку “Сохранить изменения”</span>
                    </div>
                    {isActive ? (
                        <ButtonComponent
                            width='200px'
                            height='48px'
                            text="Деактивировать"
                            onClick={() => { disableEnableHandler(!isActive) }}
                            disabled={false}
                            variant='deactivateButton'
                        />
                    ) : (
                        <ButtonComponent
                            width='200px'
                            height='48px'
                            text='Активировать'
                            onClick={() => { disableEnableHandler(!isActive) }}
                            disabled={false}
                            variant='activateButton'
                        />
                    )}
                </div>

                <div className={`${s.personalBlock} df fdc`}>
                    <span className="fw600">Общие данные</span>
                    <div className={`${s.inputBlock} df`}>
                        <SelectComponent
                            placeholder={'Поставщик*'}
                            items={sellerCompanyItems}
                            state={sellerCompany}
                            maxWidth={'356px'}
                            height={'50px'}
                            setState={setSellerCompany}
                            loadingText={'Нет данных...'}
                        />
                        <SelectComponent
                            placeholder={'Заказчик*'}
                            items={clientCompanyItems}
                            state={clientCompany}
                            doSome={handleChangeClientCompany}
                            maxWidth={'356px'}
                            height={'50px'}
                            setState={setClientCompany}
                            loadingText={'Нет данных...'}
                        />
                    </div>

                    <div className={`${s.inputBlock} df`}>
                        <SelectComponent
                            placeholder={'Объект*'}
                            items={objectItems}
                            state={object}
                            doSome={handleChangeObject}
                            maxWidth={'356px'}
                            height={'50px'}
                            setState={setObject}
                            loadingText={'Нет данных...'}
                        />
                        <SelectComponent
                            placeholder={'Материал*'}
                            items={materialItems}
                            state={material}
                            maxWidth={'356px'}
                            height={'50px'}
                            setState={setMaterial}
                            loadingText={'Нет данных...'}
                        />
                    </div>
                </div>

                <div className={`${s.personalBlock} df fdc`}>
                    <span className="fw600">Логистика отгрузки</span>
                    <div className={`${s.inputBlock} df`}>
                        <InputComponent
                            type='default'
                            placeholder='Целевая кубатура, м3*'
                            state={purposeCubature}
                            maxWidth={'356px'}
                            setState={setPurposeCubature}
                        />
                        <InputComponent
                            type='default'
                            placeholder='Интервал погрузки*'
                            state={interval}
                            maxWidth={'356px'}
                            setState={setInterval}
                            regex={numberRegex}
                            errortext={'Некорректное значение'}
                            onKeyDown={(e: any) => {
                                if (!numberRegex.test(e.key)) {
                                    e.preventDefault();
                                }
                            }}
                        />
                        <ToggleSwitchComponent 
                            placeholder={'По звонку'} 
                            state={byCall} 
                            setState={setByCall}
                        />
                    </div>

                    <div className={`${s.inputBlock} df`}>
                        <DatePickerComponent
                            placeholder='Дата доставки'
                            height={'56px'}
                            maxWidth={'356px'}
                            format={'DD/MM/YYYY'}
                            state={deliveryDate}
                            setState={setDeliveryDate}
                        />
                        <TimePickerComponent
                            placeholder="Время подачи бетона на объект"
                            maxWidth={'356px'}
                            state={deliveryTime}
                            setState={setDeliveryTime}
                        />
                    </div>
                </div>

                <div className={`${s.personalBlock} df fdc`}>
                    <span className="fw600">Технические аспекты</span>
                    <div className={`${s.inputBlock} df`}>
                        <SelectComponent
                            placeholder={'Способ приемки'}
                            items={acceptanceMethodItems}
                            state={acceptanceMethod}
                            maxWidth={'356px'}
                            height={'50px'}
                            setState={setAcceptanceMethod}
                            loadingText={'Нет данных...'}
                        />
                        <SelectComponent
                            placeholder={'Конструкция*'}
                            items={constructionItems}
                            state={construction}
                            maxWidth={'356px'}
                            height={'50px'}
                            setState={setConstruction}
                            loadingText={'Нет данных...'}
                        />
                    </div>

                    <div className={`${s.inputBlock} df`}>
                        <InputComponent
                            type='default'
                            placeholder='Укажите осадку конуса*'
                            state={coneDraft}
                            maxWidth={'356px'}
                            setState={setConeDraft}
                        />
                        <InputComponent
                            type='default'
                            placeholder='Примечание'
                            maxWidth={'400px'}
                            state={description}
                            setState={setDescription}
                        />
                    </div>

                    <div className={`${s.inputBlock} df`}>
                        <ToggleSwitchComponent
                            placeholder={'Автоотправка Телеграм'}
                            state={autoSendTelegram}
                            setState={setAutoSendTelegram}
                        />
                    </div>
                </div>
                {responseError !== '' && (
                    <span style={{ color: '#EB5757', fontSize: '14px', margin: '10px 0 0 12px' }}>{responseError}</span>
                )}
                <div className={`${s.actionButtons} df fdr w70`}>
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
                        onClick={() => { navigate(`/main/application-log/view/${id}`) }}
                        disabled={false}
                        variant='secondary'
                    />
                </div>
            </div>
        </div>
    )
}