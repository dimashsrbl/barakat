import { WeightIndicatorComponent } from "ui/WeightIndicatorComponent"

import s from './index.module.scss'
import { SelectComponent } from "ui/SelectComponentAntd"
import { useLocation, useNavigate } from "react-router-dom"
import { useCallback, useEffect, useState } from "react"
import { parseTimeWithoutSecond } from "constDatas"
import { useDispatch } from "react-redux"
import { getApplicationsData, getDependentWeighingsData, getMaterialsData, getObjectsData, getVehicleData, patchCloseRequestData } from "store/features/apiSlice"
import { ABSIcon } from "assets/icons/ABSIcon"
import { BellIcon } from "assets/icons/BellIcon"

import dayjs from 'dayjs';
import { useWindowSize } from "ui/UseWindowSizeComponent"
import { BsuStatisticsComponent } from "ui/BsuStatisticsComponent"
import { GrayCaretDown } from "assets/icons/GrayCaretDown"
import { GrayCaretUp } from "assets/icons/GrayCaretUp"
import { ButtonComponent } from "ui/ButtonComponent"
import { DisableWeighingPopup } from "./ApplicationLogView/ApplicationPlumbLogView/components/DisableWeighingPopup"
import { AttentionIcon } from "assets/icons/AttentionIcon"
import { ActiveAttentionIcon } from "assets/icons/ActiveAttentionIcon"

import config from 'config.json'
import { ProgressBarComponent } from "ui/ProgressBarComponent"
import { GreenBellIcon } from "assets/icons/GreenBellIcon"
import { ApplicationLogFilterComponent } from "./components/ApplicationLogFilterComponent"
import { FilterIcon } from "assets/icons/FilterIcon"
import { CaretIcon } from "assets/icons/CaretIcon"

export const ApplicationLogPage = () => {
    const [data, setData] = useState<any>([]);
    const [material, setMaterial] = useState('Все');
    const [object, setObject] = useState('Все');
    const [vehicle, setVehicle] = useState('Все');
    const [requestID, setRequestID] = useState('');
    const [dependentWeighings, setDependentWeighings] = useState([]);

    const [responseError, setResponseError] = useState('');

    const [objectItems, setObjectItems] = useState<any>([]);
    const [materialItems, setMaterialItems] = useState<any>([]);
    const [vehicleItems, setVehicleItems] = useState<any>([]);

    const [selectedRow, setSelectedRow] = useState(null);
    const [viewDisableWeighingPopup, setViewDisableWeighingPopup] = useState(false);
    const [viewInfoBlock, setViewInfoBlock] = useState(false);
    const [viewFilterComponent, setViewFilterComponent] = useState(false);
    const [selectedRowDescription, setSelectedRowDescription] = useState(null);

    const today = dayjs().format('D MMMM');

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const isMobile: boolean = useWindowSize();
    const location = useLocation();

    const searchParams = new URLSearchParams(location.search);

    const queryMaterial = searchParams.get('material');
    const queryObject = searchParams.get('object');
    const queryVehicle = searchParams.get('vehicle');

    const getApplicationLog = useCallback(async () => {
        const response = await dispatch(getApplicationsData({ limit: 200 }));
        const responseData = response?.payload?.data || [];
        setData(responseData);
    }, [dispatch]);

    const getDependentWeighings = useCallback(async (request_id: any) => {
        const response = await dispatch(getDependentWeighingsData({
            request_id: request_id,
            order_attribute: 'is_finished',
            is_desc: false
        }));
        const responseData = response?.payload?.data || []
        setDependentWeighings(responseData);
    }, [dispatch]);

    const getObjects = useCallback(async () => {
        const response = await dispatch(getObjectsData({ is_for_requests: true }));
        const responseData = response?.payload?.data || []
        const allOption = { name: 'Все' };
        const itemsWithAll = [allOption, ...responseData];
        setObjectItems(itemsWithAll);
    }, [dispatch]);

    const getMaterials = useCallback(async () => {
        const response = await dispatch(getMaterialsData({ is_for_requests: true }));
        const responseData = response?.payload?.data || []
        const allOption = { name: 'Все' };
        const itemsWithAll = [allOption, ...responseData];
        setMaterialItems(itemsWithAll);
    }, [dispatch]);

    const getVehicles = useCallback(async () => {
        const response = await dispatch(getVehicleData({ is_for_requests: true }));
        const responseData = response?.payload?.data || []
        const allOption = { name: 'Все' };
        const itemsWithAll = [allOption, ...responseData];
        setVehicleItems(itemsWithAll);
    }, [dispatch]);

    const handleSelectRow = (index: any, request_id: any) => {
        if (selectedRow === index) {
            setSelectedRowDescription(null);
            setSelectedRow(null);
        } else {
            setSelectedRowDescription(null);
            setDependentWeighings([]);
            getDependentWeighings(request_id);
            setSelectedRow(index);
        }
    }

    const handleSelectRowDescription = (index: any) => {
        if (selectedRowDescription === index) {
            setSelectedRowDescription(null);
        } else {
            setSelectedRowDescription(index);
        }
    }

    const handleMaterialChange = async (value: any) => {
        const response = await dispatch(getApplicationsData({
            material_id: materialItems.find((item: any) => item.name === value)?.id,
            object_id: objectItems.find((item: any) => item.name === object)?.id,
            transport_id: vehicleItems.find((item: any) => item.plate_number === vehicle)?.id,
        }));
        const weighingsData = response?.payload?.data;
        setData(weighingsData);
    }

    const handleObjectChange = async (value: any) => {
        const response = await dispatch(getApplicationsData({
            object_id: objectItems.find((item: any) => item.name === value)?.id,
            material_id: materialItems.find((item: any) => item.name === material)?.id,
            transport_id: vehicleItems.find((item: any) => item.plate_number === vehicle)?.id,
        }));
        const weighingsData = response?.payload?.data;
        setData(weighingsData);
    }

    const handleVehicleChange = async (value: any) => {
        const response = await dispatch(getApplicationsData({
            transport_id: vehicleItems.find((item: any) => item.plate_number === value)?.id,
            material_id: materialItems.find((item: any) => item.name === material)?.id,
            object_id: objectItems.find((item: any) => item.name === object)?.id,
        }));
        const weighingsData = response?.payload?.data;
        setData(weighingsData);
    }

    const handleApplyQueryFiltering = useCallback(async (material: any, object: any, vehicle: any) => {
        if (materialItems.length > 0 && objectItems.length > 0 && vehicleItems.length > 0) {
            const response = await dispatch(getApplicationsData({
                material_id: materialItems.find((item: any) => item.name === material)?.id,
                object_id: objectItems.find((item: any) => item.name === object)?.id,
                transport_id: vehicleItems.find((item: any) => item.plate_number === vehicle)?.id,
            }));
            const responseData = response?.payload?.data;
            setData(responseData);
        }
    }, [dispatch, materialItems, objectItems, vehicleItems]);

    const finishEarlyHandler = async (request_id: any) => {
        setResponseError('');
        const obj: any = {
            id: request_id,
        }
        const response = await dispatch(patchCloseRequestData(obj));
        if (response?.payload?.message === 'ok') {
            getApplicationLog();
            getDependentWeighings(request_id);
        } else if (response?.error?.message.includes('401')) {
            setResponseError('Недостаточно прав для выполнения этого запроса.');
            return
        } else if (response?.error?.message.includes('403')) {
            setResponseError('Недостаточно прав для выполнения этого запроса.');
            return
        } else if (response?.payload?.status === 400) {
            setResponseError(response?.payload?.message);
            return
        } else {
            setResponseError('Ошибка сервера');
            return
        }
    }

    const RenderMobileComponent = () => (
        <>
            {viewFilterComponent ? (
                <ApplicationLogFilterComponent
                    popup={viewFilterComponent}
                    setPopup={setViewFilterComponent}
                    materialItems={materialItems}
                    material={material}
                    setMaterial={setMaterial}
                    handleMaterialChange={handleMaterialChange}
                    objectItems={objectItems}
                    object={object}
                    setObject={setObject}
                    handleObjectChange={handleObjectChange}
                    vehicleItems={vehicleItems}
                    vehicle={vehicle}
                    setVehicle={setVehicle}
                    handleVehicleChange={handleVehicleChange}
                />
            ) : (
                <>
                    <div className={`${s.toolbar} df fdr pa w100`} style={{ gap: '12px' }}>
                        <div className={`${s.filterBlock} df aic jcc`} onClick={() => { setViewFilterComponent(true); }} >
                            <FilterIcon />
                        </div>
                    </div>
                    <div className={`${s.mobileContentBlock} df fdc`} style={{ gap: '16px' }}>
                        <BsuStatisticsComponent height={'40px'} />
                        <div className='df fdr jcsb aic'>
                            <span className="fz18">Журнал заявок <br />на {dayjs().format('DD.MM.YYYY')} г.</span>
                        </div>
                        <div className="df fdc" style={{ gap: '8px' }}>
                            <span className="fz16 cg-2">Общая кубатура - {data?.loading_cubature + data?.realized_cubature + data?.remain_cubature || 0} куб.</span>
                            <ProgressBarComponent
                                height={'48px'}
                                is_finished={false}
                                realized_cubature={data?.realized_cubature}
                                loading_cubature={data?.loading_cubature}
                                remain_cubature={data?.remain_cubature}
                            />
                        </div>
                        {data && data?.requests?.map((item: any, index: any) => (
                            <div className={`${s.dataMobileBlock} df fdc`}
                                onClick={() => { handleSelectRow(index, item?.id) }}
                                key={index}>
                                <div className='df fdc' style={{ gap: '12px' }}>
                                    <div className="df fdr jcsb">
                                        <div className="df fdr aic" style={{ gap: '8px' }}>
                                            <div className="df fdr aic" style={{ gap: '10px' }}>
                                                <div className={`${s.rowItem} df fdc`}>
                                                    <div className="df fdr aic" style={{ gap: '8px' }}>
                                                        {item?.is_active ? (
                                                            <>
                                                                {!item?.is_finished && item?.by_call ? (
                                                                    <>
                                                                        <div>
                                                                            <GreenBellIcon />
                                                                        </div>
                                                                        <div className={`${s.rowItem} df fdc`}>
                                                                            <span className='fz18 cg-2 fw400'>{parseTimeWithoutSecond(item?.purpose_start) || '-'}</span>
                                                                        </div>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        {item?.is_abs === 'Не прочитано' && item?.is_call !== 'Не прочитано' &&
                                                                            <>
                                                                                <div>
                                                                                    <ABSIcon />
                                                                                </div>
                                                                                <div className={`${s.rowItem} df fdc`}>
                                                                                    <span className='fz18 cg-2 fw400'>{parseTimeWithoutSecond(item?.purpose_start) || '-'}</span>
                                                                                </div>
                                                                            </>
                                                                        }
                                                                        {item?.is_call === 'Не прочитано' && item?.is_abs !== 'Не прочитано' &&
                                                                            <>
                                                                                <div>
                                                                                    <BellIcon />
                                                                                </div>
                                                                                <div className={`${s.rowItem} df fdc`}>
                                                                                    <span className='fz18 cg-2 fw400'>{parseTimeWithoutSecond(item?.purpose_start) || '-'}</span>
                                                                                </div>
                                                                            </>
                                                                        }
                                                                        {item?.is_call === 'Не прочитано' && item?.is_abs === 'Не прочитано' &&
                                                                            <>
                                                                                <div>
                                                                                    <BellIcon />
                                                                                </div>
                                                                                <div className={`${s.rowItem} df fdc`}>
                                                                                    <span className='fz18 cg-2 fw400'>{parseTimeWithoutSecond(item?.purpose_start) || '-'}</span>
                                                                                </div>
                                                                            </>
                                                                        }
                                                                        {item?.is_call !== 'Не прочитано' && item?.is_abs !== 'Не прочитано' &&
                                                                            <>
                                                                                <div className={`${s.layer} ${item?.is_finished ? s.green : s.yellow}`} />
                                                                                <div className='df fdc'>
                                                                                    <span className='fz18 fw500'>{parseTimeWithoutSecond(item?.purpose_start) || '-'}</span>
                                                                                </div>
                                                                            </>
                                                                        }
                                                                    </>
                                                                )}
                                                            </>
                                                        ) : (
                                                            <>
                                                                <div className={`${s.layer} ${s.red}`} />
                                                                <div className='df fdc'>
                                                                    <span className='fz18 fw500'>{parseTimeWithoutSecond(item?.purpose_start) || '-'}</span>
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="df fdc tar">
                                                <span className="fz18 fw500">{item?.client_company?.company_type} {item?.client_company?.name || '-'}</span>
                                            </div>
                                        </div>
                                        <div className='df aic jcfe w5'>
                                            {selectedRow === index ? <GrayCaretUp /> : <GrayCaretDown />}
                                        </div>
                                    </div>
                                    <div style={{ borderBottom: '1px solid #bdbdbd' }} />
                                    <div className="df fdc" style={{ gap: '8px' }}>
                                        <div className="df fdr jcsb">
                                            <span className='fz16 cg-2 w50'>МБ: {item?.material?.name || '-'}</span>
                                            <span className='fz16 cg-2'>Кубатура: {item?.purpose_cubature || '-'}</span>
                                        </div>
                                        <ProgressBarComponent
                                            is_finished={item?.is_finished}
                                            realized_cubature={item?.realized_cubature}
                                            loading_cubature={item?.loading_cubature}
                                            remain_cubature={item?.remain_cubature}
                                            height={'36px'}
                                        />
                                    </div>
                                    {selectedRow === index && (
                                        <>
                                            <div className={`${s.actionSelectedBlock} df fdr`} style={{ gap: '16px' }}>
                                                <ButtonComponent
                                                    height='44px'
                                                    text="Открыть заявку"
                                                    onClick={() => { navigate(`view/${item?.id}?material=${material}&object=${object}&vehicle=${vehicle}`) }}
                                                    disabled={false}
                                                    variant='secondary'
                                                />
                                            </div>
                                            <div style={{ borderBottom: '1px solid #bdbdbd' }} />
                                            {responseError !== '' && (
                                                <span style={{ color: '#EB5757', fontSize: '14px', margin: '10px 0 0 12px' }}>{responseError}</span>
                                            )}

                                            <div className="df fdc posr" style={{ gap: '12px' }}>
                                                <div className={`${s.requestWeighingsDropdown} ${selectedRow === index ? s.selected : ''} w100 df fdr fz16 jcsb aic`}>
                                                    <span className="fz16 cg-2">Журнал отвесов</span>
                                                    <CaretIcon />
                                                </div>

                                                <div className={`${s.dependentWeighingMobileBlock} df fdc`} style={{ gap: '12px' }}>
                                                    {dependentWeighings && dependentWeighings.map((weighing_item: any, weighing_index: any) => (
                                                        <div className={`${s.dependentWeighingMobileBlockItem} df fdc`} key={weighing_index}
                                                            onClick={() => navigate(`${weighing_item?.is_finished ? `/main/application-log/view-plumb/${weighing_item?.id}` : `view/${item?.id}/edit/${weighing_item?.id}`}`)}>
                                                            <div className="df fdr jcsb" style={{ gap: '6px' }}>
                                                                <div className="df fdr" style={{ gap: '6px' }}>
                                                                    <span className="fz16 cg">ID: {weighing_item?.id}</span>
                                                                    <span className="fz16 cg-2">{weighing_item?.transport?.plate_number}</span>
                                                                </div>
                                                                <div>
                                                                    <span className="fz16 cg">БСУ №{weighing_item?.concrete_mixing_plant?.name} - {weighing_item?.cubature || '-'} куб.</span>
                                                                </div>
                                                            </div>
                                                            <div style={{ borderBottom: '1px solid #bdbdbd' }} />
                                                            <div className="df fdc" style={{ gap: '8px' }}>
                                                                <div className="df fdr jcsb">
                                                                    <span className="fz14 cg-2">{parseTimeWithoutSecond(weighing_item?.first_at)}</span>
                                                                    <span className="fz14 cg-2">{weighing_item?.is_finished ? parseTimeWithoutSecond(weighing_item?.second_at) : '-'}</span>
                                                                </div>
                                                                <div className="df fdr jcsb">
                                                                    <span className="fz14 cg">Тара: {weighing_item?.tare_weight || '-'}</span>
                                                                    <span className="fz14 cg">Брутто: {weighing_item?.brutto_weight || '-'}</span>
                                                                    <span className="fz14 cg">Нетто: {weighing_item?.netto_weight || '-'}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </>
    );

    const RenderDesktopComponent = () => (
        <>
            {viewDisableWeighingPopup &&
                <DisableWeighingPopup
                    requestID={requestID}
                    popup={viewDisableWeighingPopup}
                    setPopup={setViewDisableWeighingPopup}
                    refreshData={getApplicationLog}
                />
            }
            <div className="df fdr jcsb aib">
                <div className="df fdc">
                    <span className="fz28">{today}</span>
                </div>
                <div className="df fdc w55">
                    <BsuStatisticsComponent />
                </div>
                <div className="df fdc w25">
                    <WeightIndicatorComponent />
                </div>
            </div>

            <div className={`${s.contentBlock} df fdc`}>
                <div className={`${s.actionBlock} df fdr aic`}>
                    <SelectComponent
                        placeholder={'Материал'}
                        items={materialItems}
                        state={material}
                        setState={setMaterial}
                        doSome={handleMaterialChange}
                        width={'25vh'}
                        height={"48px"}
                        loadingText={'Нет данных...'}
                    />
                    <SelectComponent
                        placeholder={'Объект'}
                        items={objectItems}
                        state={object}
                        setState={setObject}
                        doSome={handleObjectChange}
                        width={'25vh'}
                        height={"48px"}
                        loadingText={'Нет данных...'}
                    />
                    <SelectComponent
                        placeholder={'Транспорт'}
                        items={vehicleItems}
                        state={vehicle}
                        setState={setVehicle}
                        doSome={handleVehicleChange}
                        width={'25vh'}
                        height={"48px"}
                        loadingText={'Нет данных...'}
                    />
                    <div className={`${s.generalProgressBar} df jcc aic w50`}>
                        {data?.realized_cubature !== 0 && (
                            <div className={`${s.greenProgress} fz14`} style={{ width: `${(data?.realized_cubature / (data?.realized_cubature + data?.loading_cubature + data?.remain_cubature)) * 100 + 5}%` }}>
                                <span className={s.progressText}>{`${data?.realized_cubature}`}</span>
                            </div>
                        )}
                        {data?.loading_cubature !== 0 && (
                            <div className={`${s.yellowProgress} fz14`} style={{ width: `${(data?.loading_cubature / (data?.realized_cubature + data?.loading_cubature + data?.remain_cubature)) * 100 + 5}%` }}>
                                <span className={s.progressText}>{`${data?.loading_cubature}`}</span>
                            </div>
                        )}
                        {data?.remain_cubature !== 0 && (
                            <div className={`${s.grayProgress} fz14`} style={{ width: `${(data?.remain_cubature / (data?.realized_cubature + data?.loading_cubature + data?.remain_cubature)) * 100 + 5}%` }}>
                                <span className={s.progressText}>{`${data?.remain_cubature}`}</span>
                            </div>
                        )}
                    </div>
                    <div className="posr">
                        <div className="df aic cp" onClick={() => { setViewInfoBlock(prevState => !prevState); }}>
                            {viewInfoBlock ? <ActiveAttentionIcon /> : <AttentionIcon />}
                        </div>
                        {viewInfoBlock &&
                            <div className={`${s.infoBlockDropdown} df fdc`}>
                                <span className="fz16 fw600 cg">Общая кубатура на текущий день: <span style={{ color: '#2F80ED' }}>{data?.loading_cubature + data?.realized_cubature + data?.remain_cubature || 0} куб.</span></span>
                                <div className="df fdr aic" style={{ gap: '8px' }}>
                                    <div className={`${s.layer} ${s.green}`} />
                                    <span className="fz14">Отгруженная кубатура</span>
                                </div>
                                <div className="df fdr aic" style={{ gap: '8px' }}>
                                    <div className={`${s.layer} ${s.yellow}`} />
                                    <span className="fz14">Кубатура на отгрузке</span>
                                </div>
                                <div className="df fdr aic" style={{ gap: '8px' }}>
                                    <div className={`${s.layer} ${s.gray}`} />
                                    <span className="fz14">Остаточная кубатура</span>
                                </div>
                            </div>
                        }
                    </div>
                </div>

                <div className={`${s.row} df jcsb aic fz18 fw500`}>
                    <span className='w5'></span>
                    <span className='w10'></span>
                    <span className='w20'>Заказчик</span>
                    <span className='w20'>Объект</span>
                    <span className='w10'>МБ</span>
                    <span className='w10'>Куб.</span>
                    <span className='w20'>Прогресс</span>
                    <span className="w5"></span>
                </div>
                
                <div>
                {data && data?.requests?.map((item: any, index: any) => (
                    <div className={`${s.selectedRow} ${selectedRow === index ? s.selected : ''} df fdc`} key={index} style={{ gap: '20px' }}>
                        <div className={`${s.secondrow} ${selectedRow === index ? s.selected : ''} cp df jcsb aic fz16 posr`} onClick={() => handleSelectRow(index, item?.id)}>
                            <div className='df aic w5' onClick={(e) => { e.stopPropagation(); handleSelectRowDescription(index); }}>
                                {selectedRowDescription === index ? <ActiveAttentionIcon /> : item?.description !== '' && <AttentionIcon />}
                            </div>
                            {selectedRowDescription === index &&
                                <div className={`${s.descriptionBlockDropdown} df fdc`}>
                                    <span className="fz16 fw600 cg">Примечание:</span>
                                    <span style={{ color: '#2F80ED' }}>{item?.description || 'Нет'}</span>
                                </div>
                            }
                            <div className='df fdr aic w10' style={{ gap: '8px' }}>
                                {item?.is_active ? (
                                    <>
                                        {!item?.is_finished && item?.by_call ?
                                            (
                                                <>
                                                    <div>
                                                        <GreenBellIcon />
                                                    </div>
                                                    <div className={`${s.rowItem} df fdc`}>
                                                        <span className='fz16 cg-2 fw400'>{parseTimeWithoutSecond(item?.purpose_start) || '-'}</span>
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    {item?.is_abs === 'Не прочитано' && item?.is_call !== 'Не прочитано' &&
                                                        <>
                                                            <div>
                                                                <ABSIcon />
                                                            </div>
                                                            <div className={`${s.rowItem} df fdc`}>
                                                                <span className='fz16 cg-2 fw400'>{parseTimeWithoutSecond(item?.purpose_start) || '-'}</span>
                                                            </div>
                                                        </>
                                                    }
                                                    {item?.is_call === 'Не прочитано' && item?.is_abs !== 'Не прочитано' &&
                                                        <>
                                                            <div>
                                                                <BellIcon />
                                                            </div>
                                                            <div className={`${s.rowItem} df fdc`}>
                                                                <span className='fz16 cg-2 fw400'>{parseTimeWithoutSecond(item?.purpose_start) || '-'}</span>
                                                            </div>
                                                        </>
                                                    }
                                                    {item?.is_call === 'Не прочитано' && item?.is_abs === 'Не прочитано' &&
                                                        <>
                                                            <div>
                                                                <BellIcon />
                                                            </div>
                                                            <div className={`${s.rowItem} df fdc`}>
                                                                <span className='fz16 cg-2 fw400'>{parseTimeWithoutSecond(item?.purpose_start) || '-'}</span>
                                                            </div>
                                                        </>
                                                    }
                                                    {item?.is_call !== 'Не прочитано' && item?.is_abs !== 'Не прочитано' &&
                                                        <>
                                                            <div className={`${s.layer} ${item?.is_finished ? s.green : s.yellow}`} />
                                                            <div className='df fdc jcc'>
                                                                <span className='fz16 cg-2 fw400'>{parseTimeWithoutSecond(item?.purpose_start) || '-'}</span>
                                                            </div>
                                                        </>
                                                    }
                                                </>
                                            )}
                                    </>
                                ) : (
                                    <>
                                        <div className={`${s.layer} ${s.red}`} />
                                        <div className='df fdc jcc'>
                                            <span className='fz16 cg-2 fw400'>{parseTimeWithoutSecond(item?.purpose_start) || '-'}</span>
                                        </div>
                                    </>
                                )}
                            </div>


                            <span className={`fz16 w20 ${selectedRow === index ? '' : 'textellipsis'}`}>
                                {item?.client_company?.company_type} {item?.client_company?.name || '-'}
                            </span>
                            <span className={`fz16 cg w20 ${selectedRow === index ? '' : 'textellipsis'}`}>
                                {item?.object?.name || '-'}
                            </span>
                            <span className={`fz16 cg w10 ${selectedRow === index ? '' : 'textellipsis'}`}>
                                {item?.material?.name || '-'}
                            </span>

                            <span className={`w10 fz16 cg`}>
                                {item?.purpose_cubature || '-'}
                            </span>
                            <div className={`${s.progressBar} df jcc aic w20`}>
                                {item?.is_finished ? (
                                    <div className={`${s.greenProgress} fz14`} style={{ width: `${(item?.realized_cubature / (item?.realized_cubature + item?.loading_cubature + item?.remain_cubature)) * 100 + 5}%` }}>
                                        <span className={s.progressText}>{`${item?.realized_cubature}`}</span>
                                    </div>
                                ) : (
                                    <>
                                        {item?.realized_cubature !== 0 && (
                                            <div className={`${s.greenProgress} fz14`} style={{ width: `${(item?.realized_cubature / (item?.realized_cubature + item?.loading_cubature + item?.remain_cubature)) * 100 + 5}%` }}>
                                                <span className={s.progressText}>{`${item?.realized_cubature}`}</span>
                                            </div>
                                        )}
                                        {item?.loading_cubature !== 0 && (
                                            <div className={`${s.yellowProgress} fz14`} style={{ width: `${(item?.loading_cubature / (item?.realized_cubature + item?.loading_cubature + item?.remain_cubature)) * 100 + 5}%` }}>
                                                <span className={s.progressText}>{`${item?.loading_cubature}`}</span>
                                            </div>
                                        )}
                                        {item?.remain_cubature !== 0 && (
                                            <div className={`${s.grayProgress} fz14`} style={{ width: `${(item?.remain_cubature / (item?.realized_cubature + item?.loading_cubature + item?.remain_cubature)) * 100 + 5}%` }}>
                                                <span className={s.progressText}>{`${item?.remain_cubature}`}</span>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                            <div className='df aic jcfe w5'>
                                {selectedRow === index ? <GrayCaretUp /> : <GrayCaretDown />}
                            </div>
                        </div>
                        {selectedRow === index && (
                            <>
                                <div className={`${s.actionSelectedBlock} df fdr`} style={{ gap: '16px' }}>
                                    <ButtonComponent
                                        height='44px'
                                        text="Новый отвес"
                                        onClick={() => { navigate(`view/${item?.id}/add`) }}
                                        disabled={false}
                                        variant='primary'
                                    />
                                    <ButtonComponent
                                        height='44px'
                                        text="Редактировать заявку"
                                        onClick={() => { navigate(`/main/application-log/edit/${item?.id}`) }}
                                        disabled={false}
                                        variant='primary'
                                    />
                                    <ButtonComponent
                                        height='44px'
                                        text="Завершить досрочно"
                                        onClick={() => { finishEarlyHandler(item?.id) }}
                                        disabled={false}
                                        variant='secondary'
                                    />
                                    <ButtonComponent
                                        height='44px'
                                        text="Деактивировать"
                                        onClick={() => { setRequestID(item?.id); setViewDisableWeighingPopup(true) }}
                                        disabled={false}
                                        variant='removeButton'
                                    />
                                    <ButtonComponent
                                        height='44px'
                                        text="Открыть заявку"
                                        onClick={() => { navigate(`view/${item?.id}?material=${material}&object=${object}&vehicle=${vehicle}`) }}
                                        disabled={false}
                                        variant='secondary'
                                    />
                                </div>
                                {responseError !== '' && (
                                    <span style={{ color: '#EB5757', fontSize: '14px', margin: '10px 0 0 12px' }}>{responseError}</span>
                                )}

                                <div className="df fdc posr">
                                    <div className={`${s.requestWeighingsDropdown} ${selectedRow === index ? s.selected : ''} w100 df fdr fz16`}>
                                        <span className='w10'>ID</span>
                                        <span className='w15'>Гос.номер</span>
                                        <span className='w20'>Время</span>
                                        <span className='w15'>Номер БСУ</span>
                                        <span className='w10'>Кубатура</span>
                                        <span className='w10'>Тара</span>
                                        <span className="w10">Брутто</span>
                                        <span className="w10">Нетто</span>
                                    </div>

                                    {dependentWeighings && dependentWeighings.map((weighing_item: any, weighing_index: any) => (
                                        <div className={`${s.requestWeighingsSecondrow} cp df jcsb aic fz16 cg-2`}
                                            onClick={() => navigate(`${weighing_item?.is_finished ? `/main/application-log/view-plumb/${weighing_item?.id}` : `view/${item?.id}/edit/${weighing_item?.id}`}`)}
                                            key={weighing_index}>
                                            <span className='w10'>{weighing_item?.id || '-'}</span>
                                            <span className='w15'>{weighing_item?.transport?.plate_number}</span>
                                            <div className="df fdr w20">
                                                <span className="w30">{parseTimeWithoutSecond(weighing_item?.first_at)}</span>
                                                <span className="w10">|</span>
                                                <span className="w30">{weighing_item?.is_finished ? parseTimeWithoutSecond(weighing_item?.second_at) : '-'}</span>
                                            </div>
                                            <span className='w15'>{weighing_item?.concrete_mixing_plant?.name || '-'}</span>
                                            <span className='w10'>{weighing_item?.cubature || '-'}</span>
                                            <span className='w10'>{weighing_item?.tare_weight || '-'}</span>
                                            <span className='w10'>{weighing_item?.brutto_weight || '-'}</span>
                                            <span className='w10'>{weighing_item?.netto_weight || '-'}</span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                ))}
                </div>

            </div>
        </>
    )

    useEffect(() => {
        const intervalId = setInterval(async () => {
            if (queryMaterial && queryObject && queryVehicle) {
                handleApplyQueryFiltering(queryMaterial, queryObject, queryVehicle)
            } else {
                getApplicationLog()
            }
        }, config.get_application_log_interval);
        return () => clearInterval(intervalId);
    }, [dispatch, getApplicationLog, handleApplyQueryFiltering, queryMaterial, queryObject, queryVehicle]);


    useEffect(() => {
        if (queryMaterial && queryObject && queryVehicle) {
            setMaterial(queryMaterial);
            setObject(queryObject);
            setVehicle(queryVehicle);
            handleApplyQueryFiltering(queryMaterial, queryObject, queryVehicle);
        }
    }, [queryMaterial, queryObject, queryVehicle, handleApplyQueryFiltering])

    useEffect(() => {
        if (!queryMaterial && !queryObject && !queryVehicle) {
            getApplicationLog();
        }
        getObjects();
        getMaterials();
        getVehicles();
    }, [queryMaterial, queryObject, queryVehicle, getApplicationLog, getObjects, getMaterials, getVehicles]);

    return (
        <div className='main'>
            {isMobile ? RenderMobileComponent() : RenderDesktopComponent()}
        </div>
    )
}