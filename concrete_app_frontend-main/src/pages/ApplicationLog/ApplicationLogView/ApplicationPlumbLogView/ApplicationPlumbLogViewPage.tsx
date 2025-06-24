import { useState, useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import ReactDOMServer from 'react-dom/server';

import { WeightIndicatorComponent } from 'ui/WeightIndicatorComponent'
import { InputComponent } from 'ui/InputComponent';
import { SelectComponent } from 'ui/SelectComponentAntd'
import { ButtonComponent } from 'ui/ButtonComponent';

import { getVehicleData, getDependentWeighingDataById, getConstructionsData, getConcreteMixingPlantData, putUpdateFinishedDependentWeighingByIdData, getDriversData, getPhotosData } from 'store/features/apiSlice'

import { formatDateTime, numberRegex, photoLimit } from 'constDatas';
import { TTHComponent } from './components/TTHComponent';
import { ChangeWeighingPopup } from './components/ChangeWeighing';
import { RemoveWeighingPopup } from './components/RemoveWeighingPopup';
import { EditWeighingPopup } from 'pages/PlumbLog/PlumbLogView/components/EditWeighingPopup';
import { CloseIcon } from 'assets/icons/Close';
import { BsuStatisticsComponent } from 'ui/BsuStatisticsComponent';

import s from './index.module.scss'
import { ProgressBarComponent } from 'ui/ProgressBarComponent';
import { ConfirmSendSMS } from './components/ConfirmSendSms';
import { ToggleSwitchComponent } from 'ui/ToggleSwitchComponent';

export const ApplicationPlumbLogViewPage = () => {
    const { id } = useParams<{ id: string }>();
    const [tareWeight, setTareWeight] = useState('');
    const [bruttoWeight, setBruttoWeight] = useState('');
    const [nettoWeight, setNettoWeight] = useState('');
    const [cleanWeight, setCleanWeight] = useState('');
    const [sellerCompany, setSellerCompany] = useState(null);
    const [sellerCompanyType, setSellerCompanyType] = useState('');
    const [clientCompanyType, setClientCompanyType] = useState('');
    const [clientCompany, setClientCompany] = useState(null);
    const [material, setMaterial] = useState(null);
    const [driver, setDriver] = useState(null);
    const [object, setObject] = useState(null);
    const [construction, setConstruction] = useState(null);
    const [cubature, setCubature] = useState('');
    const [plomb, setPlomb] = useState('');
    const [coneDraft, setConeDraft] = useState('');
    const [bsuNumber, setBsuNumber] = useState(null);
    const [transport, setTransport] = useState(null);
    const [firstAt, setFirstAt] = useState('');
    const [firstOperator, setFirstOperator] = useState('');
    const [secondAt, setSecondAt] = useState('');
    const [secondOperator, setSecondOperator] = useState('');
    const [description, setDescription] = useState('');
    const [isActive, setIsActive] = useState(false);
    const [isDisabled, setIsDisabled] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [photo, setPhoto] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [searchValue, setSearchValue] = useState('');
    const [realizedCubature, setRealizedCubature] = useState(0);
    const [loadingCubature, setLoadingCubature] = useState(0);
    const [remainCubature, setRemainCubature] = useState(0);
    const [logistic, setLogistic] = useState(true);

    const [responseError, setResponseError] = useState('');

    const [viewChangeWeighingPopup, setViewChangeWeighingPopup] = useState(false);
    const [viewRemoveWeighingPopup, setViewRemoveWeighingPopup] = useState(false);
    const [viewWeighingPopup, setViewWeighingPopup] = useState(false);
    const [viewConfirmSendSmsPopup, setViewConfirmSendSmsPopup] = useState(false);

    const [constructionItems, setConstructionItems] = useState<any>([]);
    const [vehicleItems, setVehicleItems] = useState<any>([]);
    const [driverItems, setDriverItems] = useState<any>([]);
    const [bsuItems, setBsuItems] = useState<any>([]);
    const [photoItems, setPhotoItems] = useState<any>([]);

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const protocol = window.location.protocol;
    const host = window.location.host;

    const getDependentWeighing = useCallback(async () => {
        const obj = {
            id: id,
        }
        const request = await dispatch(getDependentWeighingDataById(obj));
        const data = request?.payload?.data
        setTareWeight(data?.tare_weight)
        setBruttoWeight(data?.brutto_weight)
        setSellerCompany(data?.seller_company?.name);
        setClientCompany(data?.client_company?.name);
        setMaterial(data?.material?.name);
        setFirstAt(data?.first_at);
        setFirstOperator(data?.first_operator?.fullname);
        setSecondAt(data?.second_at);
        setSecondOperator(data?.second_operator?.fullname);
        setNettoWeight(data?.netto_weight);
        setCleanWeight(data?.clean_weight);
        setIsActive(data?.is_active);
        setSellerCompanyType(data?.seller_company?.company_type);
        setClientCompanyType(data?.client_company?.company_type);
        setConeDraft(data?.cone_draft);
        setTransport(data?.transport?.plate_number);
        setConstruction(data?.construction?.name);
        setDescription(data?.adjust_note || '');
        setCubature(data?.cubature);
        setObject(data?.object?.name || null);
        setBsuNumber(data?.concrete_mixing_plant?.name);
        setPlomb(data?.plomba || '');
        setDriver(data?.driver?.name || null);
        setPhoto(data?.photo || null);
        setSearchValue(data?.transport?.plate_number || '');
        setRealizedCubature(data?.request_realized_cubature);
        setLoadingCubature(data?.request_loading_cubature);
        setRemainCubature(data?.request_remain_cubature);
    }, [dispatch, id]);

    const editHandler = async () => {
        setIsDisabled(true);

        const fieldsToCheck: any = {
            id: id,
            tare_weight: Number(tareWeight),
            brutto_weight: Number(bruttoWeight),
            request_id: id,
            cubature: cubature ? cubature.toString().replace(/,/g, '.') : cubature,
            cone_draft: coneDraft,
            construction_id: constructionItems.find((item: any) => item.name === construction)?.id,
            driver_id: driverItems.find((item: any) => item.name === driver)?.id || null,
            plomba: plomb,
            transport_id: !searchValue ? vehicleItems.find((item: any) => item.plate_number === transport)?.id : null,
            plate_number_input: searchValue ? searchValue : null,
            concrete_mixing_plant_id: bsuItems.find((item: any) => item.name === bsuNumber)?.id,
            photo_id: photo ? photo?.id : photoItems[currentIndex]?.id,
        }

        const obj = Object.entries(fieldsToCheck).reduce((acc: any, [key, value]) => {
            if (value !== '' && value !== null && value !== undefined && value !== 0) {
                acc[key] = value;
            }
            return acc;
        }, {});

        const response = await dispatch(putUpdateFinishedDependentWeighingByIdData(obj))
        if (response?.payload?.message === 'ok' || response?.payload?.statusCode === 200) {
            setIsDisabled(false);
            navigate('/main/application-log/');
        } else if (response?.error?.message.includes('401') || response?.error?.message.includes('403')) {
            setResponseError('Недостаточно прав для выполнения этого запроса.');
        } else if (response?.error?.message.includes('400')) {
            setResponseError('Некорректный запрос. Пожалуйста, убедитесь, что введенные данные соответствуют требованиям и повторите попытку.');
            return
        } else {
            setResponseError(response.payload.error.message || 'Ошибка сервера');
            return
        }
    }

    const getVehicles = useCallback(async () => {
        const request = await dispatch(getVehicleData());
        setVehicleItems(request?.payload?.data);
        setIsLoading(false);
    }, [dispatch]);

    const getConstructions = useCallback(async () => {
        const request = await dispatch(getConstructionsData());
        setConstructionItems(request?.payload?.data);
    }, [dispatch]);

    const getDrivers = useCallback(async () => {
        const request = await dispatch(getDriversData({ is_active: true }));
        setDriverItems(request?.payload?.data);
    }, [dispatch]);

    const getBSU = useCallback(async () => {
        const request = await dispatch(getConcreteMixingPlantData());
        setBsuItems(request?.payload?.data);
    }, [dispatch]);

    const printTTH = () => {
        const obj = {
            id: id,
            seller_company: sellerCompany,
            client_company: clientCompany,
            plate_number: transport,
            driver_name: driverItems.find((item: any) => item.name === driver)?.name,
            material_name: material,
            brutto: (parseInt(bruttoWeight) / 1000).toFixed(2),
            tare: (parseInt(tareWeight) / 1000).toFixed(2),
            netto: cleanWeight,
            first_at: firstAt,
            first_operator: firstOperator,
            second_at: secondAt,
            second_operator: secondOperator,
            carrier_name: vehicleItems.find((item: any) => item?.plate_number === transport)?.carrier?.name || '-',
            seller_company_type: sellerCompanyType,
            client_company_type: clientCompanyType,
            clean_weight: (parseInt(cleanWeight) / 1000).toFixed(2),
            second_brutto: (parseInt(bruttoWeight) / 1000).toFixed(3),
            cubature: cubature,
            object_name: object,
            plomb: plomb,
            logistic_type: logistic,
        }
        const htmlContent = ReactDOMServer.renderToString(<TTHComponent weighData={obj} />);

        const newWindow = window.open('', '_blank');
        if (newWindow) {
            newWindow.document.write(htmlContent);
            newWindow.document.write('<style>@page { size: landscape; margin: 0; }</style>');
            newWindow.document.write(`
            <style>
                body {font-family: Times New Roman; font-size: 14px; padding: 30px; text-wrap: nowrap;} 
                ul { list-style-type: none; padding: 0; margin: 0; } 
                .df { display: flex; } 
                .fdr { flex-direction: row; } 
                .aic { align-items: center; } 
                .fdc { flex-direction: column; } 
                .jcsa { justify-content: space-around; } 
                .jcse { justify-content: space-evenly; } 
                .jcsb { justify-content: space-between; } 
                hr { border: 0.1px solid #000; margin: 0; } 
                .custom-table{border-collapse:collapse}
                .custom-table th,.custom-table td{border:1px solid black;padding:12px; text-align:center;} 
                th{font-weight: 500; font-size: 10px;} 
                .truckTable{border-collapse:collapse}.truckTable th,.truckTable td{border:1px solid black; text-align:center; font-size: 12px;} th{font-weight: 500; font-size: 10px;}  
                .rightMainBlockTable{border-collapse:collapse}.rightMainBlockTable th,.rightMainBlockTable 
                td{border:1px solid black; text-align:center; padding: 6px; width: 50px; font-size: 12px;} 
                th{font-weight: 500; font-size: 10px;} 
                
                .underline-extended { position: relative; } 
                .underline-extended::before { content: ""; position: absolute; bottom: 0; left: 0; width: 20em; border-bottom: 1px solid black; }
    
                .underline-extended-first { position: relative; } 
                .underline-extended-first::before { content: ""; position: absolute; bottom: 0; left: 0; width: 60em; border-bottom: 1px solid black; }
                
                .underline-extended-second { position: relative; } 
                .underline-extended-second::before { content: ""; position: absolute; bottom: 0; left: 0; width: 25em; border-bottom: 1px solid black; }

                .underline-extended-third { position: relative; } 
                .underline-extended-third::before { content: ""; position: absolute; bottom: 0; left: 0; width: 10em; border-bottom: 1px solid black; }

                .underline-extended-customer { position: relative; } 
                .underline-extended-customer::before { content: ""; position: absolute; bottom: 0; left: 0; width: 57.4em; border-bottom: 1px solid black; }

                .underline-extended-driver-name { position: relative; } 
                .underline-extended-driver-name::before { content: ""; position: absolute; bottom: 0; left: 0; width: 10em; border-bottom: 1px solid black; }

                .underline-extended-shipper { position: relative; } 
                .underline-extended-shipper::before { content: ""; position: absolute; bottom: 0; left: 0; width: 59.5em; border-bottom: 1px solid black; }
                
                .underline-extended-loading-point { position: relative; } 
                .underline-extended-loading-point::before { content: ""; position: absolute; bottom: 0; left: 0; width: 21em; border-bottom: 1px solid black; }
                
                .underline-extended-plomb { position: relative; } 
                .underline-extended-plomb::before { content: ""; position: absolute; bottom: 15px; left: 0; width: 6em; border-bottom: 1px solid black; }

                .underline-extended-truck-delivered { position: relative; } 
                .underline-extended-truck-delivered::before { content: ""; position: absolute; bottom: 0; left: 0; width: 10em; border-bottom: 1px solid black; }

            </style>`);

            newWindow.document.close();

            newWindow.onafterprint = function () {
                newWindow.close();
            };
            setTimeout(() => {
                newWindow.print();
            }, 500)
        }
    }

    const handleTransportChange = async (value: any) => {
        const transport = vehicleItems.find((item: any) => item.plate_number === value);
        setDriver(transport?.driver?.name || null);
    }

    const handleClick = async () => {
        setPhoto(null);
        if (photoItems.length === 0) {
            const request = await dispatch(getPhotosData({ limit: photoLimit }));
            setPhotoItems(request?.payload?.data);
        }
    };

    const handleChangeClick = () => {
        setCurrentIndex(currentIndex === photoItems.length - 1 ? 0 : currentIndex + 1);
    };

    const handleRemoveImage = () => {
        setPhotoItems([]);
        setPhoto(null);
    }

    useEffect(() => {
        if (!isActive) setIsDisabled(true);
        else setIsDisabled(false);
    }, [isActive]);

    useEffect(() => {
        getVehicles();
        getDependentWeighing();
        getConstructions();
        getBSU();
        getDrivers();
    }, [getVehicles, getDependentWeighing, getConstructions, getBSU, getDrivers]);

    return (
        <div className='main'>
            {viewChangeWeighingPopup &&
                <ChangeWeighingPopup
                    requestID={id}
                    popup={viewChangeWeighingPopup}
                    setPopup={setViewChangeWeighingPopup}
                    refreshData={getDependentWeighing}
                />
            }
            {viewRemoveWeighingPopup &&
                <RemoveWeighingPopup
                    requestID={id}
                    popup={viewRemoveWeighingPopup}
                    setPopup={setViewRemoveWeighingPopup}
                    refreshData={getDependentWeighing}
                />
            }
            {viewWeighingPopup &&
                <EditWeighingPopup
                    weighingID={id}
                    oldTareWeight={tareWeight}
                    oldBruttoWeight={bruttoWeight}
                    oldFirstOperator={firstOperator}
                    oldSecondOperator={secondOperator}
                    oldFirstAt={firstAt}
                    oldSecondAt={secondAt}
                    oldDescription={description}
                    popup={viewWeighingPopup}
                    setPopup={setViewWeighingPopup}
                    refreshData={getDependentWeighing}
                />}
            {viewConfirmSendSmsPopup &&
                <ConfirmSendSMS
                    weighingID={id}
                    popup={viewConfirmSendSmsPopup}
                    setPopup={setViewConfirmSendSmsPopup}
                    refreshData={getDependentWeighing}
                />
            }
            <div className={`${s.headerBlock} df jcsb aie`}>
                <BsuStatisticsComponent width='70%' />
                <WeightIndicatorComponent />
            </div>

            <div className={`${s.contentBlock} df fdc`}>
                <div className='df fdr jcsb'>
                    <div className={`${s.titleBlock} df fdc`}>
                        <span className='fw600 fz20'>Отвес ID:{id}</span>
                        <span className='fz16'>Заполните данные и выполните необходимое действие</span>
                    </div>
                    <ButtonComponent
                        width='262px'
                        height='48px'
                        text="Сохранить данные"
                        onClick={(e: any) => {
                            editHandler();
                        }}
                        disabled={isDisabled}
                        variant='primary'
                    />
                </div>

                <div className={`${s.infoBlock} df jcsb`}>
                    <div className='df fdc w100'>
                        <div className={`${s.leftBlock} df jcsb`}>
                            <div className={`${s.totalInformationBlock} df fdc w100`}>
                                <span className="fw600">Общие данные</span>
                                <div className={`${s.totalInformationFields} df fdc`}>
                                    <SelectComponent
                                        placeholder={'Поставщик*'}
                                        disabled
                                        state={sellerCompany}
                                        width={'40vh'}
                                        height={'50px'}
                                        setState={setSellerCompany}
                                        loadingText={'Нет данных...'}
                                    />
                                    <SelectComponent
                                        placeholder={'Заказчик*'}
                                        disabled
                                        state={clientCompany}
                                        width={'40vh'}
                                        height={'50px'}
                                        setState={setClientCompany}
                                        loadingText={'Нет данных...'}
                                    />
                                    <SelectComponent
                                        placeholder={'Материал*'}
                                        disabled
                                        state={material}
                                        width={'40vh'}
                                        height={'50px'}
                                        setState={setMaterial}
                                        loadingText={'Нет данных...'}
                                    />
                                    <SelectComponent
                                        placeholder={'Объект*'}
                                        disabled
                                        state={object}
                                        width={'40vh'}
                                        height={'50px'}
                                        setState={setObject}
                                        loadingText={'Нет данных...'}
                                    />
                                    <ProgressBarComponent
                                        is_finished={false}
                                        realized_cubature={realizedCubature}
                                        loading_cubature={loadingCubature}
                                        remain_cubature={remainCubature}
                                        height={'48px'}
                                    />
                                </div>
                            </div>

                            <div className={`${s.vehicleInfoBlock} df fdc w100`}>
                                <span className="fw600">Данные по транспорту</span>
                                {photo ? (
                                    <div className={s.imagePlace} onClick={handleClick}>
                                        <img
                                            className={s.image}
                                            src={`${protocol}//api.${host}/media/${photo?.filename}`}
                                            alt=""
                                        />
                                        <div className={s.closeImageIcon} onClick={handleRemoveImage}>
                                            <CloseIcon />
                                        </div>
                                    </div>
                                ) : (
                                    photoItems.length !== 0 ? (
                                        <div className={s.imagePlace} onClick={handleChangeClick}>
                                            <img
                                                className={s.image}
                                                src={`${protocol}//api.${host}/media/${photoItems[currentIndex]?.filename}`}
                                                alt=""
                                            />
                                            <div className={s.closeImageIcon} onClick={handleRemoveImage}>
                                                <CloseIcon />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className={s.emptyImagePlace} onClick={handleClick}></div>
                                    )
                                )}
                                <div className={`${s.driverNameBlock} df`}>
                                    <div className="df fdc">
                                        <SelectComponent
                                            placeholder={'ФИО водителя*'}
                                            items={driverItems}
                                            state={driver}
                                            maxWidth={'230px'}
                                            height={'50px'}
                                            setState={setDriver}
                                            loadingText={'Нет данных...'}
                                        />
                                    </div>
                                    <div className="df fdc">
                                        <label className='fz14'>Перевозчик</label>
                                        <span className='fz16'>{vehicleItems.find((item: any) => item?.plate_number === transport)?.carrier?.name || '-'}</span>
                                    </div>
                                </div>
                                <div className='df fdc'>
                                    <SelectComponent
                                        placeholder={'Гос.номер транспорта*'}
                                        items={vehicleItems}
                                        state={transport}
                                        height={'50px'}
                                        setState={setTransport}
                                        doSome={handleTransportChange}
                                        searchValue={searchValue}
                                        setSearchValue={setSearchValue}
                                        loadingText={'Нет данных...'}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className={`${s.otherBlock} df fdc`}>
                            <span className="fw600">Прочее</span>
                            <div className={`${s.otherInputBlock} df fdc`}>
                                <div className="df fdr" style={{ gap: '10px' }}>
                                    <InputComponent
                                        type='default'
                                        placeholder='Кубатура'
                                        state={cubature}
                                        setState={setCubature}
                                    />
                                    <InputComponent
                                        type='default'
                                        placeholder='Пломба'
                                        state={plomb}
                                        setState={setPlomb}
                                        regex={numberRegex}
                                        errortext={'Некорректное значение'}
                                        onKeyDown={(e: any) => {
                                            if (!numberRegex.test(e.key)) {
                                                e.preventDefault();
                                            }
                                        }}
                                    />
                                </div>
                                <div className="df fdr">
                                    <InputComponent
                                        type='default'
                                        placeholder='Осадка конуса'
                                        state={coneDraft}
                                        setState={setConeDraft}
                                    />
                                </div>
                                <div className="df fdr">
                                    <SelectComponent
                                        placeholder={'Конструкция'}
                                        items={constructionItems}
                                        state={construction}
                                        height={'50px'}
                                        setState={setConstruction}
                                        loadingText={'Нет данных...'}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={`${s.monitoringDataBlock} df fdc w50`}>
                        <span className="fw600">Данные по мониторингу</span>

                        <div className={`${s.monitoringDataFieldsBlock} df fdc`}>
                            <div className="df fdc">
                                <label className='fz14'>Дата-время первого взвешивания</label>
                                <span className='fz16'>{firstAt ? formatDateTime(firstAt) : '-'}</span>
                            </div>
                            <div className="df fdc">
                                <label className='fz14'>Оператор первого взвешивания</label>
                                <span className='fz16'>{firstOperator || '-'}</span>
                            </div>
                            <div className="df fdc">
                                <label className='fz14'>Дата-время второго взвешивания</label>
                                <span className='fz16'>{secondAt ? formatDateTime(secondAt) : '-'}</span>
                            </div>
                            <div className="df fdc">
                                <label className='fz14'>Оператор второго взвешивания</label>
                                <span className='fz16'>{secondOperator || '-'}</span>
                            </div>
                        </div>


                        <span className="fw600">Данные по весу</span>
                        <div className={`${s.driverNameBlock} df fdr`}>
                            <div className="df fdc">
                                <label className='fz14'>Тара</label>
                                <span className='fz16'>{tareWeight || '-'}</span>
                            </div>
                            <div className="df fdc">
                                <label className='fz14'>Брутто</label>
                                <span className='fz16'>{bruttoWeight || '-'}</span>
                            </div>
                        </div>
                        <div className={`${s.driverNameBlock} df fdr`}>
                            <div className="df fdc">
                                <label className='fz14'>Нетто</label>
                                <span className='fz16'>{nettoWeight || '-'}</span>
                            </div>
                        </div>

                        <div className="df fdc">
                            <div className={`df fdc`} style={{ gap: '20px' }}>
                                <SelectComponent
                                    placeholder={'Номер БСУ'}
                                    items={bsuItems}
                                    state={bsuNumber}
                                    height={'50px'}
                                    setState={setBsuNumber}
                                    loadingText={'Нет данных...'}
                                />
                                {clientCompanyType && clientCompanyType === 'ЧЛ' &&
                                    <ToggleSwitchComponent
                                        placeholder={logistic ? 'Самовывоз' : 'Доставка'}
                                        state={logistic}
                                        setState={setLogistic}
                                    />
                                }
                            </div>
                        </div>
                    </div>
                </div>
                {responseError !== '' && (
                    <span style={{ color: '#EB5757', fontSize: '14px', margin: '10px 0 0 12px' }}>{responseError}</span>
                )}
                <div className={`${s.actionButtons} df`}>
                    <ButtonComponent
                        width='100%'
                        height='48px'
                        text="Распечатать ТТН"
                        onClick={(e: any) => { printTTH() }}
                        disabled={isLoading}
                        variant='primary'
                    />
                    <ButtonComponent
                        width='100%'
                        height='48px'
                        text="Редактировать"
                        onClick={(e: any) => { setViewWeighingPopup(true) }}
                        disabled={false}
                        variant='secondary'
                    />
                    <ButtonComponent
                        width='100%'
                        height='48px'
                        text="Изменить привязку"
                        onClick={(e: any) => setViewChangeWeighingPopup(true)}
                        disabled={false}
                        variant='secondary'
                    />
                    <ButtonComponent
                        width='100%'
                        height='48px'
                        text="Telegram SMS"
                        onClick={(e: any) => { setViewConfirmSendSmsPopup(true) }}
                        disabled={false}
                        variant='secondary'
                    />
                    <ButtonComponent
                        width='100%'
                        height='48px'
                        text="Удалить отвес"
                        onClick={(e: any) => { setViewRemoveWeighingPopup(true) }}
                        disabled={false}
                        variant='removeButton'
                    />
                    <ButtonComponent
                        width='100%'
                        height='48px'
                        text="Вернуться назад"
                        onClick={(e: any) => { navigate('/main/application-log') }}
                        disabled={false}
                        variant='secondary'
                    />
                </div>
            </div>
        </div>
    )
}