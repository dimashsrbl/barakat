import { useState, useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import ReactDOMServer from 'react-dom/server';

import { WeightIndicatorComponent } from 'ui/WeightIndicatorComponent'
import { InputComponent } from 'ui/InputComponent';
import { SelectComponent } from 'ui/SelectComponentAntd'
import { ButtonComponent } from 'ui/ButtonComponent';

import { putUpdateFinishedIndependentWeighingByIdData, getIndependentWeighingDataById, getCompaniesData, getMaterialsData, getVehicleData, getPhotosData, getDriversData } from 'store/features/apiSlice'

import s from './index.module.scss'
import { formatDateTime, numberRegex, photoLimit } from 'constDatas';
import { WeighingAct } from './components/WeighingActComponent';
import { TTHComponent } from './components/TTHComponent';
import { RemovePlumbLogWeighingPopup } from './components/RemovePlumbLogWeighingPopup';
import { EditWeighingPopup } from './components/EditWeighingPopup';
import { ReturnPlumbLogWeighingPopup } from './components/ReturnPlumbLogWeighingPopup';
import { CloseIcon } from 'assets/icons/Close';
import { CaretIcon } from 'assets/icons/CaretIcon';

export const PlumbLogViewPage = () => {
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
    const [siloNumber, setSiloNumber] = useState('');
    const [transport, setTransport] = useState(null);
    const [weediness, setWeediness] = useState('');
    const [docWeight, setDocWeight] = useState('');
    const [bagDetails, setBagDetails] = useState('');
    const [firstAt, setFirstAt] = useState('');
    const [firstOperator, setFirstOperator] = useState('');
    const [secondAt, setSecondAt] = useState('');
    const [secondOperator, setSecondOperator] = useState('');
    const [description, setDescription] = useState('');
    const [isActive, setIsActive] = useState(false);
    const [isReturn, setIsReturn] = useState(false);
    const [isDisabled, setIsDisabled] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [photo, setPhoto] = useState<any>(null);
    const [searchValue, setSearchValue] = useState('');

    const [responseError, setResponseError] = useState('');

    const [sellerCompanyItems, setSellerCompanyItems] = useState<any>([]);
    const [clientCompanyItems, setClientCompanyItems] = useState<any>([]);
    const [materialItems, setMaterialItems] = useState<any>([]);
    const [vehicleItems, setVehicleItems] = useState<any>([]);
    const [driverItems, setDriverItems] = useState<any>([]);

    const [viewRemoveWeighingPopup, setViewRemoveWeighingPopup] = useState(false);
    const [viewWeighingPopup, setViewWeighingPopup] = useState(false);
    const [viewReturnWeighingPopup, setViewReturnWeighingPopup] = useState(false);
    const [photoItems, setPhotoItems] = useState<any>([]);

    const navigate = useNavigate();
    const dispatch = useDispatch();
    const location = useLocation();

    const protocol = window.location.protocol;
    const host = window.location.host;

    const searchParams = new URLSearchParams(location.search);

    const queryDateFrom = searchParams.get('date_from');
    const queryDateTo = searchParams.get('date_to');
    const queryIsFinished = searchParams.get('is_finished');
    const querySellerCompanyName = searchParams.get('seller_company');
    const queryMaterialName = searchParams.get('material');
    const queryCurrentPage = searchParams.get('current_page');

    const getIndependentWeighing = useCallback(async () => {
        const obj = {
            id: id,
          }
        const request = await dispatch(getIndependentWeighingDataById(obj));
        const data = request?.payload?.data
        setTareWeight(data?.tare_weight)
        setBruttoWeight(data?.brutto_weight)
        setSellerCompany(data?.seller_company?.name);
        setClientCompany(data?.client_company?.name);
        setMaterial(data?.material?.name);
        setTransport(data?.transport?.plate_number);
        setSiloNumber(data?.silo_number|| '');
        setFirstAt(data?.first_at);
        setFirstOperator(data?.first_operator?.fullname);
        setSecondAt(data?.second_at);
        setSecondOperator(data?.second_operator?.fullname);
        setWeediness(data?.weediness|| '');
        setDocWeight(data?.doc_weight|| '');
        setNettoWeight(data?.netto_weight);
        setCleanWeight(data?.clean_weight);
        setIsActive(data?.is_active);
        setIsReturn(data?.is_return);
        setBagDetails(data?.bag_details);
        setDescription(data?.adjust_note);
        setSellerCompanyType(data?.seller_company?.company_type);
        setClientCompanyType(data?.client_company?.company_type);
        setDriver(data?.driver?.name || null);
        setPhoto(data?.photo);
        setSearchValue(data?.transport?.plate_number || '');
    }, [dispatch, id]);

    const editHandler = async () => {
        setIsDisabled(true);

        const fieldsToCheck: any = {
            id: id,
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
            photo_id: photo ? photo?.id : photoItems[currentIndex]?.id,
            plate_number_input: searchValue ? searchValue : null,
            bag_details: bagDetails,
        }

        const obj = Object.entries(fieldsToCheck).reduce((acc:any, [key, value]) => {
            if (value !== '' && value !== null && value !== undefined && value !== 0) {
                acc[key] = value;
            }
            return acc;
        }, {});

        const response = await dispatch(putUpdateFinishedIndependentWeighingByIdData(obj))
        if (response?.payload?.message === 'ok' || response?.payload?.statusCode === 200) {
            setIsDisabled(false);
            navigate('/main/plumblog/');
        } else if (response?.error?.message.includes('401') || response?.error?.message.includes('403')) {
            setResponseError('Недостаточно прав для выполнения этого запроса.');
        } else if (response?.error?.message.includes('400')) {
            setResponseError('Некорректный запрос. Пожалуйста, убедитесь, что введенные данные соответствуют требованиям и повторите попытку.');
            return
        }  else {
            setResponseError(response?.payload?.error?.message || 'Ошибка сервера');
            return
        }
    }

    const getDrivers = useCallback(async () => {
        const request = await dispatch(getDriversData({is_active: true}));
        setDriverItems(request?.payload?.data);
    }, [dispatch]);

    const getSellerCompanies = useCallback(async () => {
        const request = await dispatch(getCompaniesData({company_function: 'Поставщик'}));
        setSellerCompanyItems(request?.payload?.data);
    }, [dispatch]);

    const getClientCompanies = useCallback(async () => {
        const request = await dispatch(getCompaniesData({company_function: 'Заказчик'}));
        setClientCompanyItems(request?.payload?.data);
    }, [dispatch]);

    const getMaterials = useCallback(async () => {
        const request = await dispatch(getMaterialsData({is_for_independent: true}));
        setMaterialItems(request?.payload?.data);
    }, [dispatch]);

    const getVehicles = useCallback(async () => {
        const request = await dispatch(getVehicleData());
        setVehicleItems(request?.payload?.data);
    }, [dispatch]);

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
            netto: cleanWeight,
            first_at: firstAt,
            first_operator: firstOperator,
            second_at: secondAt,
            second_operator: secondOperator,
            carrier_name: vehicleItems.find((item: any) => item.plate_number === transport)?.carrier?.name || '-',
            silo_number: siloNumber,
            bag_details: bagDetails,
            seller_company_type: sellerCompanyType,
            client_company_type: clientCompanyType
        }
        const htmlContent = ReactDOMServer.renderToString(<WeighingAct weighData={obj} />);

        const newWindow = window.open('', '_blank');
        if (newWindow) {
            newWindow.document.write(htmlContent);
            newWindow.document.write('<style>@page { margin: 0; }</style>');
            newWindow.document.write('<style>body {font-family: Arial; font-size: 16px; padding: 30px;} ul { list-style-type: none; padding: 0; margin: 0; } .df { display: flex; } .fdr { flex-direction: row; } .fdc { flex-direction: column; } .aic { align-items: center; } .jcsa { justify-content: space-around; } .jcse { justify-content: space-evenly; } hr { border: 1px dashed #ccc; margin: 10px 0; } .custom-table{border-collapse:collapse}.custom-table th,.custom-table td{border:1px solid black;padding:3px; text-align:center;} th{font-weight: 500;}</style>'); // Пример встроенных стилей
            newWindow.document.close();

            newWindow.onafterprint = function () {
                newWindow.close();
            };
            setTimeout(() => {
                newWindow.print();
            }, 100)
        }
      }

      const printTTH = () => {
        const obj = {
            id: id,
            seller_company: sellerCompany,
            client_company: clientCompany,
            plate_number: transport || searchValue,
            driver_name: driverItems.find((item: any) => item.name === driver)?.name,
            material_name: material,
            brutto: (parseInt(bruttoWeight) / 1000).toFixed(2),
            tare: (parseInt(tareWeight) / 1000).toFixed(2),
            netto: cleanWeight,
            first_at: firstAt,
            first_operator: firstOperator,
            second_at: secondAt,
            second_operator: secondOperator,
            carrier_name: vehicleItems.find((item: any) => item.plate_number === transport)?.carrier?.name || '-',
            silo_number: siloNumber,
            bag_details: bagDetails,
            seller_company_type: sellerCompanyType,
            client_company_type: clientCompanyType,
            clean_weight: (parseInt(cleanWeight) / 1000).toFixed(2),
            second_brutto: (parseInt(bruttoWeight) / 1000).toFixed(3)
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
                .underline-extended::before { content: ""; position: absolute; bottom: -3px; left: 0; width: 20em; border-bottom: 1px solid black; }
    
                .underline-extended-first { position: relative; } 
                .underline-extended-first::before { content: ""; position: absolute; bottom: -3px; left: 0; width: 60em; border-bottom: 1px solid black; }
                
                .underline-extended-second { position: relative; } 
                .underline-extended-second::before { content: ""; position: absolute; bottom: -3px; left: 0; width: 25em; border-bottom: 1px solid black; }

                .underline-extended-third { position: relative; } 
                .underline-extended-third::before { content: ""; position: absolute; bottom: -3px; left: 0; width: 20em; border-bottom: 1px solid black; }
            </style>`);
            newWindow.document.close();

            newWindow.onafterprint = function () {
                newWindow.close();
            };
            setTimeout(() => {
                newWindow.print();
            }, 100)
        }
      }

    const handleClick = async () => {
        setPhoto(null);
        if (photoItems.length === 0) {
            const request = await dispatch(getPhotosData({limit: photoLimit}));
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

    const handleTransportChange = async (value: any) => {
        const transport = vehicleItems.find((item: any) => item.plate_number === value);
        setDriver(transport?.driver?.name || null);
    }

    useEffect(() => {
        if (!isActive) setIsDisabled(true);
        else setIsDisabled(false);
    }, [isActive]);

    useEffect(() => {
        getSellerCompanies();
        getClientCompanies();
        getMaterials();
        getVehicles();
        getIndependentWeighing();
        getDrivers();
    }, [getSellerCompanies, getClientCompanies, getMaterials, getVehicles, getIndependentWeighing, getDrivers]);

 return (
    <div className='main'>
        {viewRemoveWeighingPopup && 
            <RemovePlumbLogWeighingPopup 
                requestID={id}
                popup={viewRemoveWeighingPopup} 
                setPopup={setViewRemoveWeighingPopup} 
                refreshData={getIndependentWeighing}
        /> }
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
                oldBagDetails={bagDetails}
                popup={viewWeighingPopup} 
                setPopup={setViewWeighingPopup} 
                refreshData={getIndependentWeighing}
        /> }
        {viewReturnWeighingPopup && 
            <ReturnPlumbLogWeighingPopup 
                requestID={id}
                popup={viewReturnWeighingPopup} 
                setPopup={setViewReturnWeighingPopup} 
                refreshData={getIndependentWeighing}
        /> }
        <div className={`${s.headerBlock} df jcsb aib`}>
            <div className={`${s.breadCrumbBlock} df aic`} style={{gap: '12px'}}>
                <span className="fz24 cg cp" onClick={() => navigate('/main/plumblog')}>Журнал отвесов</span> 
                <CaretIcon/> 
                <span className="fz28">Просмотр отвеса</span>
            </div>
            <WeightIndicatorComponent/>
        </div>

        <div className={`${s.contentBlock} df fdc`}>
            <div className='df fdr jcsb'>
                <div className={`${s.titleBlock} df fdc`}>
                    <span className='fw600 fz20'>Отвес ID:{id}</span>
                    {isReturn && <span className='fw600 fz16'>Возврат</span>}
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
                                        <div className={`${s.imagePlace} w100`} onClick={handleChangeClick}>
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
                                        <div className={`${s.emptyImagePlace} w100`} onClick={handleClick}></div>
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
                            </div>
                        </div>

                    <div className={`${s.otherBlock} df fdc`}>
                    <span className="fw600">Прочее</span>
                    <div className={`${s.otherInputBlock} df fdr`}>
                        <InputComponent
                            type="default"
                            placeholder="Номер силоса (К)"
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
                            height={"50px"}
                            setState={setTransport}
                            doSome={handleTransportChange}
                            searchValue={searchValue}
                            setSearchValue={setSearchValue}
                            loadingText={'Нет данных...'}
                        />
                    </div>
                    <div>
                        <InputComponent
                            type='default'
                            isDisabled={true}
                            placeholder='Количество мешков'
                            state={bagDetails}
                            setState={setBagDetails}
                        />
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
                        <div className="df fdc">
                            <label className='fz14'>Чистый вес</label>
                            <span className='fz16'>{cleanWeight || '-'}</span>
                        </div>
                    </div>
                    
                    <div className="df fdc">
                        <div className={`${s.totalInformationFields} df fdc`}>
                            <InputComponent
                                type="default"
                                placeholder="Сорность (%)*"
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
                                type="default"
                                placeholder="Вес по документам"
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
                {responseError !== '' && (
                    <span style={{ color: '#EB5757', fontSize: '14px', margin: '10px 0 0 12px' }}>{responseError}</span>
                )}
            <div className={`${s.actionButtons} df`}>
                    <ButtonComponent 
                        width='100%'
                        height='48px'
                        text="Распечатать ТТН" 
                        onClick={(e:any) => {printTTH()}}
                        disabled={false} 
                        variant='primary'
                    />
                    <ButtonComponent 
                        width='100%'
                        height='48px'
                        text="Распечатать акт" 
                        onClick={(e:any) => {printWeighingAct()}}
                        disabled={false} 
                        variant='primary'
                    />
                    <ButtonComponent 
                        width='100%'
                        height='48px'
                        text="Вернуться назад" 
                        onClick={(e:any) => {navigate(`/main/plumblog?${queryDateFrom ? `date_from=${queryDateFrom}&` : ''}${queryDateTo ? `date_to=${queryDateTo}&` : ''}is_finished=${queryIsFinished}&seller_company=${querySellerCompanyName}&material=${queryMaterialName}&current_page=${queryCurrentPage}`)}}
                        disabled={false} 
                        variant='secondary'
                    />
                    <ButtonComponent 
                        width='100%'
                        height='48px'
                        text="Редактировать" 
                        onClick={(e:any) => {setViewWeighingPopup(true)}}
                        disabled={false} 
                        variant='secondary'
                    />
                    <ButtonComponent 
                        width='100%'
                        height='48px'
                        text="Возврат" 
                        onClick={(e:any) => {setViewReturnWeighingPopup(true)}}
                        disabled={false} 
                        variant='secondary'
                    />
                    <ButtonComponent 
                        width='100%'
                        height='48px'
                        text="Удалить отвес" 
                        onClick={(e:any) => {setViewRemoveWeighingPopup(true)}}
                        disabled={false} 
                        variant='removeButton'
                    />
                </div>
        </div>
    </div>
 )
}