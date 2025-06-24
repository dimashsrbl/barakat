import { WeightIndicatorComponent } from "ui/WeightIndicatorComponent";

import { CaretIcon } from "assets/icons/CaretIcon";
import { ButtonComponent } from "ui/ButtonComponent";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { SelectComponent } from "ui/SelectComponentAntd";
import { completeUncompleteTypes, parseDate, parseDateWithoutTime, parseTimeWithoutSecond, sortingTypes } from "constDatas";
import { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import {getDependentWeighingsData, getRequestDataById, patchCloseRequestData } from "store/features/apiSlice";

import s from './index.module.scss'
import { DisableWeighingPopup } from "./ApplicationPlumbLogView/components/DisableWeighingPopup";
import { useWindowSize } from "ui/UseWindowSizeComponent";
import { ProgressBarComponent } from "ui/ProgressBarComponent";

export const ApplicationLogView = () => {
    const { id } = useParams<{ id: string }>();
    const [data, setData] = useState<any>([]);
    const [dependentWeighings, setDependentWeighings] = useState<any>([])
    const [plumbLogStatus, setPlumbLogStatus] = useState('Все');
    const [sorting, setSorting] = useState('От старых к новым');
    
    const [responseError, setResponseError] = useState('');

    const [viewDisableWeighingPopup, setViewDisableWeighingPopup] = useState(false);

    const navigate = useNavigate();
    const dispatch = useDispatch();
    const isMobile: boolean = useWindowSize();
    const location = useLocation();

    const searchParams = new URLSearchParams(location.search);

    const queryDate = searchParams.get('date');
    const queryIsApplicationPlan = searchParams.get('is_application_plan');
    const queryMaterial = searchParams.get('material');
    const queryObject = searchParams.get('object');
    const queryVehicle = searchParams.get('vehicle');

    const getApplicationLog = useCallback(async () => {
        const obj = {
            id: id,
          }
        const request = await dispatch(getRequestDataById(obj));
        const data = request?.payload?.data;
        setData(data);
    }, [dispatch, id]);

    const getDependentWeighings = useCallback(async () => {
        const response = await dispatch(getDependentWeighingsData({request_id: id, limit: 100}));
        const responseData = response?.payload?.data || []
        setDependentWeighings(responseData);
    }, [dispatch, id]);

    const handleIsFinishedChange = async (value: any) => {
        let isFinishedValue = value === 'Завершенные' ? true : value === 'Незавершенные' ? false : null;
        const response = await dispatch(getDependentWeighingsData({request_id: id, is_finished: isFinishedValue}));
        const weighingsData = response?.payload?.data;
        setDependentWeighings(weighingsData);
    }

    const handleIsDescChange = async (is_desc: any) => {
        let isDescValue = is_desc === 'От старых к новым' ? false : true;
        const response = await dispatch(getDependentWeighingsData({request_id: id, is_desc: isDescValue}));
        const weighingsData = response?.payload?.data;
        setDependentWeighings(weighingsData);
    }

    const finishEarlyHandler = async () => {
        setResponseError('');
        const obj: any = {
            id: id,
        }
        const response = await dispatch(patchCloseRequestData(obj));
        if (response?.payload?.message === 'ok') {
            navigate('/main/application-log');
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
        <div className={`${s.mobileContentBlock} df fdc`} style={{gap: '16px'}}>
            <div className='df fdr jcsb aic'>
                <span className="fz18">Перечень отвесов</span>
                {!isMobile &&
                    <ButtonComponent 
                        width='120px'
                        height='36px'
                        text="Добавить" 
                        onClick={(e:any) => {navigate('/main/plumblog/add')}}
                        disabled={false} 
                        variant='primary'
                    />
                }
            </div>
            {dependentWeighings && dependentWeighings.map((item:any, index:any) => (
                <div className={`${s.dataMobileBlock} df fdc`}
                    style={{border: item?.is_finished ? '1px solid #219653' : 'none', borderRadius: item?.is_finished ? '6px' : 'none'}}
                    onClick={() => item?.is_finished ? navigate(`/main/application-log/view-plumb/${item?.id}`) : navigate(`edit/${item?.id}`)}
                    key={index}>
                    <div className='df fdc' style={{gap: '6px'}}>
                        <div className="df fdr jcsb">
                            <div className="df fdr" style={{gap: '6px'}}>
                                <span className='fz16 cg'>ID: {item?.id}</span>
                                <span className='fz16 cg-2'>{item?.transport?.plate_number || '-'}</span>
                            </div>
                            <span className='fz16 cg'>БСУ №{item?.concrete_mixing_plant?.name || '-'} - {item?.cubature || '-'} куб.</span>
                        </div>
                        <div style={{borderBottom: '1px solid #bdbdbd' }}/>
                        <div className="df fdr jcsb">
                            <span>{parseDate(item?.first_at)}</span>
                            <span>{parseDate(item?.[0]?.second_at)}</span>
                        </div>
                        <div className="df fdr jcsb">
                            <div className="df fdr fww">
                                <span className='fz16 cg'>Тара: </span>
                                <span className='fz16 cg'>{item?.tare_weight || '-'}</span>
                            </div>
                            <div className="df fdr fww">
                                <span className='fz16 cg'>Брутто: </span>
                                <span className='fz16 cg'>{item?.brutto_weight || '-'}</span>
                            </div>
                            <div className="df fdr fww">
                                <span className='fz16 cg'>Нетто: </span>
                                <span className='fz16 cg'>{item?.netto_weight || '-'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )

    const RenderDesktopComponent = () => (
        <div className='df fdc' style={{gap: '16px'}}>
            <div className='df aic jcsb'>
                <span className='fz20 fw600'>Журнал отвесов</span>
                <div className={`${s.actionBlock} df w50`}>
                    <SelectComponent
                        placeholder={'Статус отвеса'}
                        items={completeUncompleteTypes}
                        state={plumbLogStatus}
                        doSome={handleIsFinishedChange}
                        height={"48px"}
                        setState={setPlumbLogStatus}
                        loadingText={'Нет данных...'}
                    />
                    <SelectComponent
                        placeholder={'Сортировка'}
                        items={sortingTypes}
                        doSome={handleIsDescChange}
                        state={sorting}
                        height={"48px"}
                        setState={setSorting}
                        loadingText={'Нет данных...'}
                    />
                </div>
            </div>
            
            <div className={`${s.row} df jcsb aic fz18 fw500`}>
                <span className='w5'>ID</span>
                <span className='w15'>Гос.номер</span>
                <span className='w30'>Дата и время</span>
                <span className='w10'>Номер БСУ</span>
                <span className='w10'>Кубатура</span>
                <span className='w10'>Тара</span>
                <span className='w10'>Брутто</span>
                <span className='w10'>Нетто</span>
            </div>
            
            {dependentWeighings && dependentWeighings.map((item:any, index:any) => (
                <div className={`${s.secondrow} cp df jcsb aic fz16`}
                    key={index}
                    style={{border: item?.is_finished ? '1px solid #219653' : 'none', borderRadius: item?.is_finished ? '6px' : 'none'}}
                    onClick={() => item?.is_finished ? navigate(`/main/application-log/view-plumb/${item?.id}`) : navigate(`edit/${item?.id}`)}>
                    <span className='w5'>{item?.id}</span>
                    <span className='w15'>{item?.transport?.plate_number || '-'}</span>
                    <div className="df fdr w30">
                        <span className="w40">{parseDate(item?.first_at)}</span>
                        <span className="df w10">|</span>
                        <span className="w40">{item?.is_finished ? parseDate(item?.second_at) : '-'}</span>
                    </div>
                    <span className='w10'>{item?.concrete_mixing_plant?.name || '-'}</span>
                    <span className='w10'>{item?.cubature || '-'}</span>
                    <span className='w10'>{item?.tare_weight || '-'}</span>
                    <span className='w10'>{item?.brutto_weight || '-'}</span>
                    <span className='w10'>{item?.netto_weight || '-'}</span>
                </div>
            ))}
        </div>
    )

    useEffect(() => {
        getApplicationLog();
        getDependentWeighings();
    }, [getApplicationLog, getDependentWeighings])

    return (
        <div className='main'>
        {viewDisableWeighingPopup && 
            <DisableWeighingPopup 
                requestID={id}
                popup={viewDisableWeighingPopup} 
                setPopup={setViewDisableWeighingPopup} 
                refreshData={getApplicationLog}
            /> 
        }
        {isMobile && 
            <div className={`${s.toolbar} df fdr pa w100`}/>
        }
        {!isMobile && 
            <div className="df fdr jcsb aib">
                <div className="df fdr aic" style={{gap: '12px'}}>
                    {queryIsApplicationPlan ? (
                        <span className="fz24 cg cp" onClick={() => navigate(`/main/application-plan?date=${queryDate}`)}>
                            План заявок
                        </span>
                    ) : (
                        <span className="fz24 cg cp" onClick={() => navigate(`/main/application-log${queryMaterial && queryObject && queryVehicle ? `?material=${queryMaterial}&object=${queryObject}&vehicle=${queryVehicle}` : ''}`)}>
                            Журнал заявок
                        </span>
                    )}

                    <CaretIcon/> 
                    <span className="fz28">Просмотр заявки</span>
                </div>
                <WeightIndicatorComponent/>
            </div>
        }
        <div className={`${s.contentBlock} df fdc`}>
            <div className='df fdr jcsb'>
                <div className={`${s.titleBlock} df fdc`}>
                    <span className='fw600 fz20'>Заявка №{data?.id}</span>
                    <span className='fz16'>Ознакомьтесь с данными, при необходимости выберите нужный вариант</span>
                </div>
            </div>

            <div className={`${s.layersBlock} df`}>
                <div className={`${s.grayLayer} df fdc`}>
                    <div>
                        <span className="fw500 fz16">Общие данные</span>
                    </div>
                    <div className="df fdc" style={{gap: '12px'}}>
                        <div className="df fdr jcsb">
                            <span className="cg fz14 w30">Поставщик</span>
                            <span className="fz16 cg-2 w70 tar">{data?.seller_company?.company_type} {data?.seller_company?.name || '-'}</span>
                        </div>
                        <div className="df fdr jcsb">
                            <span className="cg fz14 w30">Заказчик</span>
                            <span className="fz16 cg-2 w70 tar">{data?.client_company?.company_type} {data?.client_company?.name || '-'}</span>
                        </div>
                        <div className="df fdr jcsb">
                            <span className="cg fz14 w20">Объект</span>
                            <span className="fz16 cg-2 w80 tar">{data?.object?.name || '-'}</span>
                        </div>
                        <div className="df fdr jcsb">
                            <span className="cg fz14 w30">Материал</span>
                            <span className="fz16 cg-2 w70 tar">{data?.material?.name || '-'}</span>
                        </div>
                        <div className="df fdr jcsb">
                            <span className="cg fz14 w50">Автор заявки</span>
                            <span className="fz16 cg-2 w50 tar">{data?.created_by_instance?.fullname || '-'}</span>
                        </div>
                    </div>
                    <hr style={{borderBottom: '1px solid #828282'}}/>
                    <div>
                        <span className="fw500 fz16">Логистика отгрузки</span>
                    </div>
                    <div className="df fdc" style={{gap: '12px'}}>
                        <div className="df fdr jcsb">
                            <span className="cg fz14">Интервал погрузки</span>
                            <span className="fz16 cg-2">{data?.interval || '-'} минут</span>
                        </div>
                        <div className="df fdr jcsb">
                            <span className="cg fz14">Дата доставки</span>
                            <span className="fz16 cg-2">{parseDateWithoutTime(data?.purpose_start) || '-'}</span>
                        </div>
                        <div className="df fdr jcsb">
                            <span className="cg fz14">Время подачи бетона на объект</span>
                            <span className="fz16 cg-2">{parseTimeWithoutSecond(data?.purpose_start) || '-'}</span>
                        </div>
                    </div>
                </div>

                <div className={`${s.grayLayer} df fdc w100`}>
                    <div>
                        <span className="fw500 fz16">Прогресс отгрузки</span>
                    </div>
                    <div className="df fdc" style={{gap: '12px'}}>
                        <div className="df fdr jcsb">
                            <span className="cg fz14">Отгружено</span>
                            <span className="fz16 cg-2">{data?.realized_cubature || '-'}</span>
                        </div>
                        <div className="df fdr jcsb">
                            <span className="cg fz14">На погрузке</span>
                            <span className="fz16 cg-2">{data?.loading_cubature || '-'}</span>
                        </div>
                        <div className="df fdr jcsb">
                            <span className="cg fz14">Осталось</span>
                            <span className="fz16 cg-2">{data?.remain_cubature || '-'}</span>
                        </div>
                        <div className="df fdr jcsb">
                            <span className="cg fz14">Целевая кубатура</span>
                            <span className="fz16 cg-2">
                                {data?.purpose_cubature !== data?.initial_purpose_cubature
                                    ? `${data?.purpose_cubature}(${data?.initial_purpose_cubature})`
                                    : data?.purpose_cubature || '-'}
                            </span>                        
                        </div>
                        <ProgressBarComponent 
                            is_finished={data?.is_finished} 
                            realized_cubature={data?.realized_cubature} 
                            loading_cubature={data?.loading_cubature} 
                            remain_cubature={data?.remain_cubature}
                            height={'48px'}
                        />
                    </div>
                    <hr style={{borderBottom: '1px solid #828282'}}/>
                    <div className="df fdc" style={{gap: '12px'}}>
                        <div className="df fdr jcsb">
                            <span className="cg fz14 w50">Осадка конуса</span>
                            <span className="fz16 cg-2 w50 tar">{data?.cone_draft_default || '-'}</span>
                        </div>
                        <div className="df fdr jcsb">
                            <span className="cg fz14 w30">Конструкция</span>
                            <span className="fz16 cg-2 w70 tar">{data?.construction?.name || '-'}</span>
                        </div>
                        <div className="df fdr jcsb">
                            <span className="cg fz14 w50">Способ приемки</span>
                            <span className="fz16 cg-2 w50 tar">{data?.receive_method?.name || '-'}</span>
                        </div>
                        <div className="df fdr jcsb">
                            <span className="cg fz14 w50">Примечание</span>
                            <span className="fz16 cg-2 w50 tar">{data?.description || '-'}</span>
                        </div>
                    </div>
                </div>

                <div className={`${s.grayLayer} df fdc h100`}>
                    <div>
                        <span className="fw500 fz16">Действия над заявкой</span>
                    </div>
                    {!isMobile &&
                    <ButtonComponent 
                        height='54px'
                        text="Добавить новое взвешивание" 
                        onClick={() => {navigate('add')}}
                        disabled={false}
                        variant='primary'
                    />
                    }
                    <ButtonComponent 
                        height='54px'
                        text="Редактировать заявку" 
                        onClick={() => {navigate(`/main/application-plan/edit/${id}`)}}
                        disabled={false}
                        variant='primary'
                    />
                    {!data?.is_finished && 
                        <ButtonComponent 
                            height='54px'
                            text="Завершить досрочно" 
                            onClick={() => {finishEarlyHandler()}}
                            disabled={false}
                            variant='secondary'
                        />
                    }

                    {data?.is_active ? (
                        <ButtonComponent 
                            height='54px'
                            text="Деактивировать" 
                            onClick={() => {setViewDisableWeighingPopup(true)}}
                            disabled={false}
                            variant='removeButton'
                        />
                    ) : (
                        <></>
                    )}


                </div>
            </div>
            {responseError !== '' && (
                <span style={{ color: '#EB5757', fontSize: '14px', margin: '10px 0 0 12px' }}>{responseError}</span>
            )}
            <hr style={{borderBottom: '1px solid #828282'}}/>
            {isMobile ? RenderMobileComponent() : RenderDesktopComponent()}
        </div>
    </div>
    )
}