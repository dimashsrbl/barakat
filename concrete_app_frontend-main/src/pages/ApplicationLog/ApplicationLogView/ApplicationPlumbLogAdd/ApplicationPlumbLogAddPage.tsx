import { useState, useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';

import { WeightIndicatorComponent } from 'ui/WeightIndicatorComponent'
import { InputComponent } from 'ui/InputComponent';
import { SelectComponent } from 'ui/SelectComponentAntd'
import { ButtonComponent } from 'ui/ButtonComponent';

import { getVehicleData, getConstructionsData, postAddDependentWeighingsData, getRequestDataById, getConcreteMixingPlantData, getDriversData, getPhotosData } from 'store/features/apiSlice'

import { AlertComponent } from 'ui/AlertComponent';
import { numberRegex, photoLimit } from 'constDatas';
import { CloseIcon } from 'assets/icons/Close';
import { BsuStatisticsComponent } from 'ui/BsuStatisticsComponent';
import { ProgressBarComponent } from 'ui/ProgressBarComponent';

import s from './index.module.scss'

export const ApplicationPlumbLogAddPage = () => {
    const { id } = useParams<{ id: string }>();
    const [tareWeight, setTareWeight] = useState('');
    const [bruttoWeight, setBruttoWeight] = useState('');
    const [sellerCompany, setSellerCompany] = useState(null);
    const [clientCompany, setClientCompany] = useState(null);
    const [object, setObject] = useState(null);
    const [material, setMaterial] = useState(null);
    const [driver, setDriver] = useState(null);
    const [construction, setConstruction] = useState(null);
    const [cubature, setCubature] = useState('');
    const [plomb, setPlomb] = useState('');
    const [coneDraft, setConeDraft] = useState('');
    const [bsuNumber, setBsuNumber] = useState(null);
    const [transport, setTransport] = useState<any>(null);
    const [currentWeigh, setCurrentWeigh] = useState('');
    const [overloadTare, setOverloadTare] = useState<any>(0);
    const [isDisabled, setIsDisabled] = useState(true);
    const [isWeighButtonDisabled, setIsWeighButtonDisabled] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [searchValue, setSearchValue] = useState('');
    const [realizedCubature, setRealizedCubature] = useState(0);
    const [loadingCubature, setLoadingCubature] = useState(0);
    const [remainCubature, setRemainCubature] = useState(0);

    const [vehicleItems, setVehicleItems] = useState<any>([]);
    const [driverItems, setDriverItems] = useState<any>([]);
    const [constructionItems, setConstructionItems] = useState<any>([]);
    const [bsuItems, setBsuItems] = useState<any>([]);
    const [photoItems, setPhotoItems] = useState<any>([]);

    const [responseError, setResponseError] = useState('');

    const [showAlert, setShowAlert] = useState(false);

    const navigate = useNavigate();
    const dispatch = useDispatch();
    
    const protocol = window.location.protocol;
    const host = window.location.host;

    const addHandler = async () => {
        setIsDisabled(true);

        const fieldsToCheck = {
            tare_weight: Number(tareWeight),
            brutto_weight: Number(bruttoWeight),
            request_id: id,
            cubature: cubature ? cubature.toString().replace(/,/g, '.') : cubature,
            cone_draft: coneDraft,
            construction_id: constructionItems.find((item: any) => item.name === construction)?.id,
            driver_id: driverItems.find((item: any) => item.name === driver)?.id || null,
            plomba: plomb,
            transport_id: !searchValue ? vehicleItems.find((item: any) => item.plate_number === transport)?.id : null,
            concrete_mixing_plant_id: bsuItems.find((item: any) => item.name === bsuNumber)?.id,
            plate_number_input: searchValue ? searchValue : null,
            photo_id: photoItems[currentIndex]?.id,
        };
    
        const obj = Object.entries(fieldsToCheck).reduce((acc:any, [key, value]) => {
            if (value !== '' && value !== null && value !== undefined && value !== 0) {
                acc[key] = value;
            }
            return acc;
        }, {});
    
        const responseData = await dispatch(postAddDependentWeighingsData(obj));
        if (responseData?.payload?.message === 'ok' || responseData?.payload?.statusCode === 200) {
            navigate(`/main/application-log/view/${id}/edit/${responseData?.payload?.data?.id}`);
            setIsDisabled(false);
        } else if (responseData?.error?.message.includes('401') || responseData?.error?.message.includes('403')) {
            setResponseError('Недостаточно прав для выполнения этого запроса.');
        } else if (responseData?.error?.message.includes('400')) {
            setResponseError('Некорректный запрос. Пожалуйста, убедитесь, что введенные данные соответствуют требованиям и повторите попытку.');
            return
        } else {
            setResponseError(responseData.payload.error.message || 'Ошибка сервера');
            return
        }
    }

    const getRequest = useCallback(async () => {
        const obj = {
            id: id,
          }
        const request = await dispatch(getRequestDataById(obj));
        const data = request?.payload?.data;
        setClientCompany(data?.client_company?.name || null);
        setSellerCompany(data?.seller_company?.name || null);
        setMaterial(data?.material?.name || null);
        setObject(data?.object?.name || null);
        setConeDraft(data?.cone_draft_default || '');
        setConstruction(data?.construction?.name || null);
        setRealizedCubature(data?.realized_cubature);
        setLoadingCubature(data?.loading_cubature);
        setRemainCubature(data?.remain_cubature);
    }, [dispatch, id]);

    const getPhotos = useCallback(async () => {
        const request = await dispatch(getPhotosData({limit: photoLimit}));
        setPhotoItems(request?.payload?.data);
    }, [dispatch]);

    const getVehicles = useCallback(async () => {
        const request = await dispatch(getVehicleData());
        setVehicleItems(request?.payload?.data);
    }, [dispatch]);

    const getDrivers = useCallback(async () => {
        const request = await dispatch(getDriversData({is_active: true}));
        setDriverItems(request?.payload?.data);
    }, [dispatch]);
    
    const getConstructions = useCallback(async () => {
        const request = await dispatch(getConstructionsData());
        setConstructionItems(request?.payload?.data);
    }, [dispatch]);

    const getBSU = useCallback(async () => {
        const request = await dispatch(getConcreteMixingPlantData());
        setBsuItems(request?.payload?.data);
    }, [dispatch]);

    const handleWeightChange = (newWeight: any) => {
        setCurrentWeigh(newWeight);
    };

    const tareWeighButton = () => {
        setBruttoWeight('');
        const transportTare = vehicleItems.find((item: any) => item.plate_number === transport)?.tare
        const transportAdmissibleError = vehicleItems.find((item: any) => item.plate_number === transport)?.admissible_error
        if (transportTare && transportAdmissibleError) {
            if (Number(currentWeigh) > Number(transportTare) * (1 + transportAdmissibleError / 100)) {
                setOverloadTare(Number(currentWeigh) - Number(transportTare));
                setShowAlert(true);
            }
        }
        setTareWeight(currentWeigh);
    };

    const bruttoWeighButton = () => {
        setTareWeight('');
        setBruttoWeight(currentWeigh);
    };

    const handleCloseAlert = () => {
        setShowAlert(false);
    };

    const handleTransportChange = async (value: any) => {
        const transport = vehicleItems.find((item: any) => item.plate_number === value);
        setDriver(transport?.driver?.name || null);
    }

    const handleClick = () => {
        setCurrentIndex(currentIndex === photoItems.length - 1 ? 0 : currentIndex + 1);
    };

    const handleRemoveImage = () => {
        setPhotoItems([]);
    }

    useEffect(() => {
        const lastTransportFromUtility = localStorage.getItem('lastTransportFromUtility');
        if (lastTransportFromUtility) {
            try {
                const parsedTransport = JSON.parse(lastTransportFromUtility);
                if (parsedTransport && parsedTransport.plate_number) {
                    setTransport(parsedTransport.plate_number);
                    setSearchValue(parsedTransport.plate_number);
                    setDriver(parsedTransport.driver?.name || null);
                }
            } catch (error) {
                console.error('Error parsing JSON:', error);
            }
        }
    }, []);

    useEffect(() => {
        if (sellerCompany !== null && clientCompany !== null && bsuNumber !== null && cubature !== '' && (transport !== null || searchValue !== '') && (tareWeight !== '' || bruttoWeight) !== '') setIsDisabled(false);
        else setIsDisabled(true);
    }, [sellerCompany, clientCompany, bsuNumber, cubature, transport, bruttoWeight, tareWeight, searchValue]);
    
    useEffect(() => {
        if (transport !== null || searchValue !== '') setIsWeighButtonDisabled(false);
        else setIsWeighButtonDisabled(true);
    }, [transport, searchValue]);


    useEffect(() => {
        getVehicles();
        getConstructions();
        getRequest();
        getBSU();
        getDrivers();
        getPhotos();
    }, [getVehicles, getConstructions, getRequest, getBSU, getDrivers, getPhotos]);


 return (
    <div className='main'>
        {showAlert && <AlertComponent message={`Проверьте чистоту бочки АБС, перегруз на ${overloadTare} кг`} onClose={handleCloseAlert} />}
        <div className={`${s.headerBlock} df jcsb aie`}>
            <BsuStatisticsComponent width='70%'/>
            <WeightIndicatorComponent onWeightChange={handleWeightChange}/>
        </div>

        <div className={`${s.contentBlock} df fdc`}>
            <div className={`${s.titleBlock} df fdc`}>
                <span className='fw600 fz20'>Новый отвес</span>
                <span className='fz16'>Заполните данные и выполните необходимое действие</span>
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
                                {photoItems && photoItems[currentIndex]?.filename ? (
                                    <div className={s.imagePlace} onClick={handleClick}>
                                        <img 
                                            className={s.image} 
                                            src={`${protocol}//api.${host}/media/${photoItems[currentIndex].filename}`} 
                                            alt="" 
                                        />
                                        <div className={s.closeImageIcon} onClick={handleRemoveImage}>
                                            <CloseIcon />
                                        </div>
                                    </div>
                                ) : (
                                    <div className={s.emptyImagePlace}></div>
                                )}
                                <div className={`${s.driverNameBlock} df fdr`}>
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
                                        <span className='fz16'>{vehicleItems?.find((item: any) => item?.plate_number === transport)?.carrier?.name || '-'}</span>
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
                            <div className="df fdr" style={{gap: '10px'}}>
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
                    {responseError !== '' && (
                        <span style={{ color: '#EB5757', fontSize: '14px', margin: '10px 0 0 12px' }}>{responseError}</span>
                    )}
                    <div className={`${s.actionButtons} df fdr w70`}>
                        <ButtonComponent 
                            width='100%'
                            height='48px'
                            text="Сохранить данные" 
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
                            onClick={() => {navigate('/main/application-log')}}
                            disabled={false} 
                            variant='secondary'
                        />
                    </div>
                </div>
            </div>

                    <div className={`${s.monitoringDataBlock} df fdc w50`}>
                    <span className="fw600">Данные по мониторингу</span>

                    <div className={`${s.monitoringDataFieldsBlock} df fdc`}>
                        <div className="df fdc">
                            <label className='fz14'>Дата-время первого взвешивания</label>
                            <span className='fz16'>-</span>
                        </div>
                        <div className="df fdc">
                            <label className='fz14'>Оператор первого взвешивания</label>
                            <span className='fz16'>-</span>
                        </div>
                        <div className="df fdc">
                            <label className='fz14'>Дата-время второго взвешивания</label>
                            <span className='fz16'>-</span>
                        </div>
                        <div className="df fdc">
                            <label className='fz14'>Оператор второго взвешивания</label>
                            <span className='fz16'>-</span>
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
                    <div className={`${s.weightButtonsBlock} df fdr`}>
                        <ButtonComponent 
                            width='100%'
                            height='48px'
                            text="Взвесить тару" 
                            onClick={() => {tareWeighButton()}}
                            variant='primary'
                            disabled={isWeighButtonDisabled}
                        />
                        <ButtonComponent 
                            width='100%'
                            height='48px'
                            text="Взвесить брутто" 
                            onClick={() => {bruttoWeighButton()}}
                            variant='primary'
                            disabled={isWeighButtonDisabled}
                        />
                    </div>
                    <div className={`${s.driverNameBlock} df fdr`}>
                        <div className="df fdc">
                            <label className='fz14'>Нетто</label>
                            <span className='fz16'>-</span>
                        </div>
                    </div>
                    
                    <div className="df fdc">
                        <div className={`${s.totalInformationFields} df fdc`}>
                            <SelectComponent
                                placeholder={'Номер БСУ'}
                                items={bsuItems}
                                state={bsuNumber}
                                height={'50px'}
                                setState={setBsuNumber}
                                loadingText={'Нет данных...'}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
 )
}