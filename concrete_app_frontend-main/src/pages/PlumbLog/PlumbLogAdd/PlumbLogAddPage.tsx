import { useState, useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';

import { WeightIndicatorComponent } from 'ui/WeightIndicatorComponent'
import { InputComponent } from 'ui/InputComponent';
import { SelectComponent } from 'ui/SelectComponentAntd'
import { ButtonComponent } from 'ui/ButtonComponent';

import { postAddIndependentWeighingsData, getCompaniesData, getMaterialsData, getVehicleData, getPhotosData, getDriversData } from 'store/features/apiSlice'

import s from './index.module.scss'
import { CaretIcon } from 'assets/icons/CaretIcon';
import { numberRegex, photoLimit } from 'constDatas';
import { CloseIcon } from 'assets/icons/Close';

export const PlumbLogAddPage = () => {
    const [tareWeight, setTareWeight] = useState('');
    const [bruttoWeight, setBruttoWeight] = useState('');
    const [sellerCompany, setSellerCompany] = useState(null);
    const [clientCompany, setClientCompany] = useState(null);
    const [material, setMaterial] = useState(null);
    const [driver, setDriver] = useState<any>(null);
    const [siloNumber, setSiloNumber] = useState('');
    const [transport, setTransport] = useState<any>(null);
    const [weediness, setWeediness] = useState('');
    const [docWeight, setDocWeight] = useState('');
    const [bagDetails, setBagDetails] = useState('');
    const [currentWeigh, setCurrentWeigh] = useState('');
    const [isDisabled, setIsDisabled] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [searchValue, setSearchValue] = useState('');

    const [sellerCompanyItems, setSellerCompanyItems] = useState<any>([]);
    const [clientCompanyItems, setClientCompanyItems] = useState<any>([]);
    const [materialItems, setMaterialItems] = useState<any>([]);
    const [vehicleItems, setVehicleItems] = useState<any>([]);
    const [driverItems, setDriverItems] = useState<any>([]);
    const [photoItems, setPhotoItems] = useState<any>([]);

    const [responseError, setResponseError] = useState('');

    const navigate = useNavigate();
    const dispatch = useDispatch();
    const location = useLocation();

    const protocol = window.location.protocol;
    const host = window.location.host;

    const searchParams = new URLSearchParams(location.search);

    const queryTransportPlateNumber = searchParams.get('plate_number');

    const addHandler = async () => {
        setIsDisabled(true);

        const fieldsToCheck = {
            tare_weight: Number(tareWeight),
            brutto_weight: Number(bruttoWeight),
            seller_company_id: sellerCompanyItems.find((item: any) => item.name === sellerCompany)?.id,
            client_company_id: clientCompanyItems.find((item: any) => item.name === clientCompany)?.id,
            material_id: materialItems.find((item: any) => item.name === material)?.id,
            transport_id: !searchValue ? vehicleItems.find((item: any) => item.plate_number === transport)?.id : null,
            driver_id: driverItems.find((item: any) => item.name === driver)?.id || null,
            doc_weight: Number(docWeight),
            weediness: Number(weediness),
            silo_number: Number(siloNumber),
            photo_id: photoItems[currentIndex]?.id,
            plate_number_input: searchValue ? searchValue : null,
            bag_details: bagDetails
        };

        const obj = Object.entries(fieldsToCheck).reduce((acc: any, [key, value]) => {
            if (value !== '' && value !== null && value !== undefined && value !== 0) {
                acc[key] = value;
            }
            return acc;
        }, {});

        const response = await dispatch(postAddIndependentWeighingsData(obj));
        if (response?.payload?.message === 'ok' || response?.payload?.statusCode === 200) {
            navigate(`/main/plumblog/edit/${response?.payload?.data?.id}`);
            setIsDisabled(false);
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

    const getPhotos = useCallback(async () => {
        const request = await dispatch(getPhotosData({ limit: photoLimit }));
        setPhotoItems(request?.payload?.data);
    }, [dispatch]);

    const getDrivers = useCallback(async () => {
        const request = await dispatch(getDriversData({ is_active: true }));
        setDriverItems(request?.payload?.data);
    }, [dispatch]);

    const getSellerCompanies = useCallback(async () => {
        const request = await dispatch(getCompaniesData({ company_function: 'Поставщик' }));
        setSellerCompanyItems(request?.payload?.data);
    }, [dispatch]);

    const getClientCompanies = useCallback(async () => {
        const request = await dispatch(getCompaniesData({ company_function: 'Заказчик' }));
        setClientCompanyItems(request?.payload?.data);
    }, [dispatch]);

    const getMaterials = useCallback(async () => {
        const request = await dispatch(getMaterialsData({ is_for_independent: true }));
        setMaterialItems(request?.payload?.data);
    }, [dispatch]);

    const getVehicles = useCallback(async () => {
        const request = await dispatch(getVehicleData());
        setVehicleItems(request?.payload?.data);
    }, [dispatch]);

    const handleWeightChange = (newWeight: any) => {
        setCurrentWeigh(newWeight);
    };

    const tareWeighButton = () => {
        setBruttoWeight('');
        setTareWeight(currentWeigh);
    };

    const bruttoWeighButton = () => {
        setTareWeight('');
        setBruttoWeight(currentWeigh);
    };

    const handleClick = () => {
        setCurrentIndex(currentIndex === photoItems.length - 1 ? 0 : currentIndex + 1);
    };

    const handleRemoveImage = () => {
        setPhotoItems([]);
    }

    const handleTransportChange = async (value: any) => {
        const transport = vehicleItems.find((item: any) => item.plate_number === value);
        setDriver(transport?.driver?.name || null);
    }

    useEffect(() => {
        if (sellerCompany !== null && clientCompany !== null && material !== null && (transport !== null || searchValue !== '') && (tareWeight !== '' || bruttoWeight) !== '') setIsDisabled(false);
        else setIsDisabled(true);
    }, [sellerCompany, clientCompany, material, transport, bruttoWeight, tareWeight, searchValue]);

    useEffect(() => {
        if (!queryTransportPlateNumber || vehicleItems.length === 0) return;

        const transport = vehicleItems.find((item: any) => item.plate_number === queryTransportPlateNumber);
        if (transport) {
            setTransport(queryTransportPlateNumber);
            setDriver(transport.driver?.name || null);
        }
    }, [queryTransportPlateNumber, vehicleItems]);

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
        getSellerCompanies();
        getClientCompanies();
        getMaterials();
        getVehicles();
        getPhotos();
        getDrivers();
    }, [getSellerCompanies, getClientCompanies, getMaterials, getVehicles, getPhotos, getDrivers]);


    return (
        <div className='main'>
            <div className={`${s.headerBlock} df jcsb aib`}>
                <div className={`${s.breadCrumbBlock} df aic`} style={{ gap: '12px' }}>
                    <span className="fz24 cg cp" onClick={() => navigate('/main/plumblog')}>Журнал отвесов</span>
                    <CaretIcon />
                    <span className="fz28">Первое взвешивание отвеса</span>
                </div>
                <WeightIndicatorComponent onWeightChange={handleWeightChange} />
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
                                        items={sellerCompanyItems}
                                        state={sellerCompany}
                                        width={'40vh'}
                                        height={'50px'}
                                        setState={setSellerCompany}
                                        loadingText={'Нет данных...'}
                                    />
                                    <SelectComponent
                                        placeholder={'Заказчик*'}
                                        items={clientCompanyItems}
                                        state={clientCompany}
                                        width={'40vh'}
                                        height={'50px'}
                                        setState={setClientCompany}
                                        loadingText={'Нет данных...'}
                                    />
                                    <SelectComponent
                                        placeholder={'Материал*'}
                                        items={materialItems}
                                        state={material}
                                        width={'40vh'}
                                        height={'50px'}
                                        setState={setMaterial}
                                        loadingText={'Нет данных...'}
                                    />
                                </div>
                            </div>

                            <div className={`${s.vehicleInfoBlock} df fdc w100`}>
                                <span className="fw600">Данные по транспорту</span>
                                {photoItems && photoItems[currentIndex]?.filename ? (
                                    <div className={`${s.imagePlace} w100`} onClick={handleClick}>
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
                                    <div className={`${s.emptyImagePlace} w100`}></div>
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
                                        <span className='fz16'>{vehicleItems?.find((item: any) => item?.plate_number === transport)?.carrier?.name || '-'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className={`${s.otherBlock} df fdc`}>
                            <span className="fw600">Прочее</span>
                            <div className={`${s.otherInputBlock} df`}>
                                <InputComponent
                                    type='default'
                                    placeholder='Номер силоса (К)'
                                    state={siloNumber}
                                    setState={setSiloNumber}
                                    regex={numberRegex}
                                    errortext={'Некорректное значение'}
                                    onKeyDown={(e: any) => {
                                        if (!numberRegex.test(e.key)) {
                                            e.preventDefault();
                                        }
                                    }}
                                />
                                <SelectComponent
                                    placeholder={'Гос.номер транспорта*'}
                                    items={vehicleItems}
                                    state={transport}
                                    height={'50px'}
                                    doSome={handleTransportChange}
                                    setState={setTransport}
                                    searchValue={searchValue}
                                    setSearchValue={setSearchValue}
                                    loadingText={'Нет данных...'}
                                />
                            </div>
                            <div>
                                <InputComponent
                                    type='default'
                                    placeholder='Количество мешков'
                                    state={bagDetails}
                                    setState={setBagDetails}
                                />
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
                                    onClick={() => { navigate('/main/plumblog') }}
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
                                onClick={() => { tareWeighButton() }}
                                variant='primary'
                            />
                            <ButtonComponent
                                width='100%'
                                height='48px'
                                text="Взвесить брутто"
                                onClick={() => { bruttoWeighButton() }}
                                variant='primary'
                            />
                        </div>
                        <div className={`${s.driverNameBlock} df fdr`}>
                            <div className="df fdc">
                                <label className='fz14'>Нетто</label>
                                <span className='fz16'>-</span>
                            </div>
                            <div className="df fdc">
                                <label className='fz14'>Чистый вес</label>
                                <span className='fz16'>-</span>
                            </div>
                        </div>

                        <div className="df fdc">
                            <div className={`${s.totalInformationFields} df fdc`}>
                                <InputComponent
                                    type='default'
                                    placeholder='Сорность (%)*'
                                    state={weediness}
                                    setState={setWeediness}
                                    regex={numberRegex}
                                    errortext={'Некорректное значение'}
                                    onKeyDown={(e: any) => {
                                        if (!numberRegex.test(e.key)) {
                                            e.preventDefault();
                                        }
                                    }}
                                />
                                <InputComponent
                                    type='default'
                                    placeholder='Вес по документам'
                                    state={docWeight}
                                    setState={setDocWeight}
                                    regex={numberRegex}
                                    errortext={'Некорректное значение'}
                                    onKeyDown={(e: any) => {
                                        if (!numberRegex.test(e.key)) {
                                            e.preventDefault();
                                        }
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}