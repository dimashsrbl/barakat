import { useState, useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';

import { WeightIndicatorComponent } from 'ui/WeightIndicatorComponent'
import { InputComponent } from 'ui/InputComponent';
import { SelectComponent } from 'ui/SelectComponentAntd'
import { ButtonComponent } from 'ui/ButtonComponent';

import { getVehicleData, getConstructionsData, getDependentWeighingDataById, putFinishDependentWeighingsData, getConcreteMixingPlantData, getDriversData, getPhotosData } from 'store/features/apiSlice'

import { formatDateTime, numberRegex, photoLimit } from 'constDatas';

import { ChangeBSUCubaturePopup } from './components/ChangeBSUCubaturePopup';
import { RemoveWeighingPopup } from '../ApplicationPlumbLogView/components/RemoveWeighingPopup';
import { AlertComponent } from 'ui/AlertComponent';
import ReactDOMServer from 'react-dom/server';
import { ApplicationLogWeighingAct } from './components/WeighingActComponent';
import { CloseIcon } from 'assets/icons/Close';
import { BsuStatisticsComponent } from 'ui/BsuStatisticsComponent';
import { ProgressBarComponent } from 'ui/ProgressBarComponent';

import s from './index.module.scss'
import { ChangeWeighingPopup } from '../ApplicationPlumbLogView/components/ChangeWeighing';

export const ApplicationPlumbLogEditPage = () => {
    const { id } = useParams<{ id: string }>();
    const [tareWeight, setTareWeight] = useState('');
    const [bruttoWeight, setBruttoWeight] = useState('');
    const [nettoWeight, setNettoWeight] = useState('');
    const [sellerCompany, setSellerCompany] = useState(null);
    const [clientCompany, setClientCompany] = useState(null);
    const [sellerCompanyType, setSellerCompanyType] = useState('');
    const [clientCompanyType, setClientCompanyType] = useState('');
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
    const [currentWeigh, setCurrentWeigh] = useState('');
    const [overloadNetto, setOverloadNetto] = useState<any>(0);
    const [underloadNetto, setUnderloadNetto] = useState<any>(0);
    const [materialDensity, setMaterialDensity] = useState<any>(0);
    const [isTareWeighButtonDisabled, setIsTareWeighButtonDisabled] = useState(false);
    const [isBruttoWeighButtonDisabled, setIsBruttoWeighButtonDisabled] = useState(false);
    const [isDisabled, setIsDisabled] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [photo, setPhoto] = useState<any>(null);
    const [searchValue, setSearchValue] = useState('');
    const [realizedCubature, setRealizedCubature] = useState(0);
    const [loadingCubature, setLoadingCubature] = useState(0);
    const [remainCubature, setRemainCubature] = useState(0);

    const [responseError, setResponseError] = useState('');

    const [constructionItems, setConstructionItems] = useState<any>([]);
    const [vehicleItems, setVehicleItems] = useState<any>([]);
    const [driverItems, setDriverItems] = useState<any>([]);
    const [bsuItems, setBsuItems] = useState<any>([]);
    const [photoItems, setPhotoItems] = useState<any>([]);

    const [viewBSUPopup, setViewBSUPopup] = useState(false);
    const [viewRemoveWeighingPopup, setViewRemoveWeighingPopup] = useState(false);

    const [showOverloadAlert, setShowOverloadAlert] = useState(false);
    const [showUnderloadAlert, setShowUnderloadAlert] = useState(false);
    const [viewChangeWeighingPopup, setViewChangeWeighingPopup] = useState(false);

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
        if (data?.tare_weight) setIsTareWeighButtonDisabled(true);
        if (data?.brutto_weight) setIsBruttoWeighButtonDisabled(true);
        setTareWeight(data?.tare_weight || '')
        setBruttoWeight(data?.brutto_weight || '')
        setSellerCompany(data?.seller_company?.name || null);
        setClientCompany(data?.client_company?.name || null);
        setSellerCompanyType(data?.seller_company?.company_type || null);
        setClientCompanyType(data?.client_company?.company_type || null);
        setMaterial(data?.material?.name || null);
        setMaterialDensity(data?.material?.density || null)
        setTransport(data?.transport?.plate_number || null);
        setFirstAt(data?.first_at || '');
        setFirstOperator(data?.first_operator?.fullname || '');
        setSecondAt(data?.second_at || '');
        setSecondOperator(data?.second_operator?.fullname || '');
        setNettoWeight(data?.netto_weight || '');
        setConeDraft(data?.cone_draft || '');
        setConstruction(data?.construction?.name || null);
        setCubature(data?.cubature || '');
        setPlomb(data?.plomba || '');
        setObject(data?.object?.name || null);
        setBsuNumber(data?.concrete_mixing_plant?.name || null);
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
            concrete_mixing_plant_id: bsuItems.find((item: any) => item.name === bsuNumber)?.id,
            plomba: plomb,
            transport_id: !searchValue ? vehicleItems.find((item: any) => item.plate_number === transport)?.id : null,
            plate_number_input: searchValue ? searchValue : null,
            photo_id: photo ? photo?.id : photoItems[currentIndex]?.id,
        }

        const obj = Object.entries(fieldsToCheck).reduce((acc: any, [key, value]) => {
            if (value !== '' && value !== null && value !== undefined && value !== 0) {
                acc[key] = value;
            }
            return acc;
        }, {});

        const response = await dispatch(putFinishDependentWeighingsData(obj))
        if (response?.payload?.message === 'ok' || response?.payload?.statusCode === 200) {
            setIsDisabled(false);
            navigate(`/main/application-log/view-plumb/${id}`);
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
    }, [dispatch]);

    const getConstructions = useCallback(async () => {
        const request = await dispatch(getConstructionsData());
        setConstructionItems(request?.payload?.data);
    }, [dispatch]);

    const getBSU = useCallback(async () => {
        const request = await dispatch(getConcreteMixingPlantData());
        setBsuItems(request?.payload?.data);
    }, [dispatch]);

    const getDrivers = useCallback(async () => {
        const request = await dispatch(getDriversData({ is_active: true }));
        setDriverItems(request?.payload?.data);
    }, [dispatch]);

    const handleWeightChange = (newWeight: any) => {
        setCurrentWeigh(newWeight);
    };

    const handleTransportChange = async (value: any) => {
        const transport = vehicleItems.find((item: any) => item.plate_number === value);
        setDriver(transport?.driver?.name || null);
    }

    const nettoCleanWeight = (tareWeightNumber: string, bruttoWeightNumber: string) => {
        const bruttoWeightNum = Number(bruttoWeightNumber);
        const tareWeightNum = Number(tareWeightNumber);
        const nettoWeight = Math.ceil(bruttoWeightNum - tareWeightNum);
        setNettoWeight(`${nettoWeight}`);
        return nettoWeight;
    };

    const tareWeighButton = () => {
        setTareWeight(currentWeigh);
        nettoCleanWeight(currentWeigh, bruttoWeight);
    };

    const bruttoWeighButton = () => {
        setBruttoWeight(currentWeigh);
        const currentNetto = nettoCleanWeight(tareWeight, currentWeigh);
        if (currentNetto !== null && currentNetto !== undefined && cubature && materialDensity) {
            const nettoToCubatureRatio = Number(currentNetto) / Number(cubature);
            if (nettoToCubatureRatio > materialDensity * 1.03) {
                setOverloadNetto(Math.abs(Number(currentNetto) - Number(cubature) * materialDensity));
                setShowOverloadAlert(true);
            } else if (nettoToCubatureRatio < materialDensity * 0.97) {
                setUnderloadNetto(Math.abs(Number(currentNetto) - Number(cubature) * materialDensity));
                setShowUnderloadAlert(true);
            }
        }
    };


    const handleCloseOverloadAlert = () => {
        setShowOverloadAlert(false);
    };

    const handleCloseUnderloadAlert = () => {
        setShowUnderloadAlert(false);
    };

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

    const printWeighingAct = () => {
        const obj = {
            id: id,
            seller_company: sellerCompany,
            client_company: clientCompany,
            plate_number: transport,
            driver_name: driverItems.find((item: any) => item.name === driver)?.name,
            material_name: material,
            brutto: bruttoWeight,
            tare: tareWeight,
            netto: nettoWeight,
            first_at: firstAt,
            first_operator: firstOperator,
            second_at: secondAt,
            second_operator: secondOperator,
            carrier_name: vehicleItems.find((item: any) => item.plate_number === transport)?.carrier?.name || '-',
            seller_company_type: sellerCompanyType,
            client_company_type: clientCompanyType,
            cone_draft: coneDraft,
            construction_name: constructionItems.find((item: any) => item.name === construction)?.name || '-',
            bsu_number: bsuNumber,
            object_name: object,
            cubature: cubature
        }
        const htmlContent = ReactDOMServer.renderToString(<ApplicationLogWeighingAct weighData={obj} />);

        const newWindow = window.open('', '_blank');
        if (newWindow) {
            newWindow.document.write(htmlContent);
            newWindow.document.write('<style>@page { margin: 0; }</style>');
            newWindow.document.write('<style>body {font-family: Arial; font-size: 16px; padding: 30px;} ul { list-style-type: none; padding: 0; margin: 0; } .df { display: flex; } .fdr { flex-direction: row; } .fdc { flex-direction: column; } .aic { align-items: center; } .jcsa { justify-content: space-around; } .jcsb { justify-content: space-between; } .jcse { justify-content: space-evenly; } hr { margin: 10px 0; } .custom-table{border-collapse:collapse}.custom-table th,.custom-table td{border:1px solid black;padding:3px; text-align:center;} th{font-weight: 500;}</style>'); // Пример встроенных стилей
            newWindow.document.close();

            newWindow.onafterprint = function () {
                newWindow.close();
            };
            setTimeout(() => {
                newWindow.print();
            }, 100)
        }
    }

    useEffect(() => {
        if (sellerCompany !== null &&
            clientCompany !== null &&
            bsuNumber !== null &&
            cubature !== '' &&
            material !== null &&
            plomb !== '' &&
            (transport !== null || searchValue !== '') &&
            bruttoWeight !== '' &&
            tareWeight !== '') setIsDisabled(false);
        else setIsDisabled(true);
    }, [sellerCompany, clientCompany, bsuNumber, cubature, plomb, material, transport, bruttoWeight, tareWeight, searchValue]);

    useEffect(() => {
        getVehicles();
        getDependentWeighing();
        getConstructions();
        getBSU();
        getDrivers();
    }, [getVehicles, getDependentWeighing, getConstructions, getBSU, getDrivers]);

    return (
        <div className='main'>
            {viewBSUPopup &&
                <ChangeBSUCubaturePopup
                    weighingID={id}
                    oldCubature={cubature}
                    oldBSUNumber={bsuNumber}
                    popup={viewBSUPopup}
                    setPopup={setViewBSUPopup}
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
            {viewChangeWeighingPopup &&
                <ChangeWeighingPopup
                    requestID={id}
                    popup={viewChangeWeighingPopup}
                    setPopup={setViewChangeWeighingPopup}
                    refreshData={getDependentWeighing}
                />
            }
            {showOverloadAlert && <AlertComponent message={`Перегруз по нетто на ${overloadNetto} кг`} onClose={handleCloseOverloadAlert} />}
            {showUnderloadAlert && <AlertComponent message={`Недогруз по нетто на ${underloadNetto} кг`} onClose={handleCloseUnderloadAlert} />}

            <div className={`${s.headerBlock} df jcsb aie`}>
                <BsuStatisticsComponent width='70%' />
                <WeightIndicatorComponent onWeightChange={handleWeightChange} />
            </div>

            <div className={`${s.contentBlock} df fdc`}>
                <div className={`${s.titleBlock} df fdc`}>
                    <span className='fw600 fz20'>Отвес ID:{id}</span>
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
                                        state={sellerCompany}
                                        disabled
                                        width={'40vh'}
                                        height={'50px'}
                                        setState={setSellerCompany}
                                        loadingText={'Нет данных...'}
                                    />
                                    <SelectComponent
                                        placeholder={'Заказчик*'}
                                        state={clientCompany}
                                        disabled
                                        width={'40vh'}
                                        height={'50px'}
                                        setState={setClientCompany}
                                        loadingText={'Нет данных...'}
                                    />
                                    <SelectComponent
                                        placeholder={'Материал*'}
                                        state={material}
                                        disabled
                                        width={'40vh'}
                                        height={'50px'}
                                        setState={setMaterial}
                                        loadingText={'Нет данных...'}
                                    />
                                    <SelectComponent
                                        placeholder={'Объект*'}
                                        state={object}
                                        disabled
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
                                <div className="df fdr" style={{ gap: '10px' }}>
                                    <InputComponent
                                        type='default'
                                        placeholder='Кубатура'
                                        state={cubature}
                                        setState={setCubature}
                                    // regex={numberRegex}
                                    // errortext={'Некорректное значение'}
                                    // onKeyDown={(e: any) => {
                                    //     if (!numberRegex.test(e.key)) {
                                    //         e.preventDefault();
                                    //     }
                                    // }}
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
                        <div className={`${s.weightButtonsBlock} df fdr`}>
                            <ButtonComponent
                                width='100%'
                                height='48px'
                                text='Взвесить тару'
                                disabled={isTareWeighButtonDisabled}
                                onClick={() => { tareWeighButton() }}
                                variant='primary'
                            />
                            <ButtonComponent
                                width='100%'
                                height='48px'
                                text='Взвесить брутто'
                                disabled={isBruttoWeighButtonDisabled}
                                onClick={(e: any) => { bruttoWeighButton() }}
                                variant='primary'
                            />
                        </div>
                        <div className={`${s.driverNameBlock} df fdr`}>
                            <div className="df fdc">
                                <label className='fz14'>Нетто</label>
                                <span className='fz16'>{nettoWeight || '-'}</span>
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
                <div className={`${s.actionButtons} df w100`}>
                    <ButtonComponent
                        width='100%'
                        height='48px'
                        text="Сохранить данные"
                        onClick={(e: any) => {
                            editHandler();
                        }}
                        disabled={isDisabled}
                        variant='primary'
                    />
                    <ButtonComponent
                        width='100%'
                        height='48px'
                        text="Распечатать АВ"
                        onClick={(e: any) => { printWeighingAct() }}
                        disabled={false}
                        variant='primary'
                    />
                    <ButtonComponent
                        width='100%'
                        height='48px'
                        text="Вернуться назад"
                        onClick={(e: any) => { navigate(`/main/application-log`) }}
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
                        text="Удалить отвес"
                        onClick={(e: any) => { setViewRemoveWeighingPopup(true) }}
                        disabled={false}
                        variant='removeButton'
                    />
                    <ButtonComponent
                        width='100%'
                        height='48px'
                        text="Изменить БСУ и Куб."
                        onClick={(e: any) => { setViewBSUPopup(true) }}
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