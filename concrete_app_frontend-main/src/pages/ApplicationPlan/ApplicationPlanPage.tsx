import { WeightIndicatorComponent } from "ui/WeightIndicatorComponent"

import s from './index.module.scss'
import { ButtonComponent } from "ui/ButtonComponent"
import { useLocation, useNavigate } from "react-router-dom"
import { useCallback, useEffect, useState } from "react"
import { formatAPIDateTime, parseTimeWithoutSecond } from "constDatas"
import { useDispatch } from "react-redux"
import { getApplicationsData } from "store/features/apiSlice"
import { DatePickerComponent } from "ui/DatePickerComponent"

import dayjs from 'dayjs';
import { useWindowSize } from "ui/UseWindowSizeComponent"
import { ProgressBarComponent } from "ui/ProgressBarComponent"
import ReactDOMServer from "react-dom/server"
import { ApplicationPlanReport } from "./components/ApplicationPlanReportComponent"
import { ActiveAttentionIcon } from "assets/icons/ActiveAttentionIcon"
import { AttentionIcon } from "assets/icons/AttentionIcon"

export const ApplicationPlanPage = () => {
    const todayStart = dayjs().startOf('day');
    const [data, setData] = useState<any>([]);
    const [applicationPlanDate, setApplicationPlanDate] = useState<any>([dayjs(todayStart, 'DD/MM/YYYY')]);
    const [selectedRowDescription, setSelectedRowDescription] = useState(null);

    const navigate = useNavigate();
    const dispatch = useDispatch();
    const isMobile: boolean = useWindowSize();
    const location = useLocation();

    const searchParams = new URLSearchParams(location.search);

    const queryDate = searchParams.get('date');

    const getApplicationPlan = useCallback(async () => {
        const response = await dispatch(getApplicationsData({
            date: formatAPIDateTime(applicationPlanDate),
            order_attribute: 'purpose_start',
            is_desc: false
        }));
        const responseData = response?.payload?.data || []
        setData(responseData);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch, isMobile]);

    const handleDateChange = async (date: any) => {
        const response = await dispatch(getApplicationsData({
            date: formatAPIDateTime(date),
            order_attribute: 'purpose_start',
            is_desc: false
        }));
        const weighingsData = response?.payload?.data;
        setData(weighingsData);
    }

    const handleApplyQueryFiltering = useCallback(async (date: any) => {
        const response = await dispatch(getApplicationsData({
            date: date ? date : null,
            order_attribute: 'purpose_start',
            is_desc: false
        }));
        const responseData = response?.payload?.data;
        setData(responseData);
    }, [dispatch]);

    const handleSelectRowDescription = (index: any) => {
        if (selectedRowDescription === index) {
            setSelectedRowDescription(null);
        } else {
            setSelectedRowDescription(index);
        }
    }

    const printApplicationPlanList = (data: any) => {
        const obj = {
            application_plan_date: formatAPIDateTime(applicationPlanDate),
            data: data,
        }
        const htmlContent = ReactDOMServer.renderToString(<ApplicationPlanReport applicationData={obj} />);

        const newWindow = window.open('', '_blank');
        if (newWindow) {
            newWindow.document.write(htmlContent);
            newWindow.document.write('<style>@page { size: landscape; margin: 0; }</style>');
            newWindow.document.write('<style>body {font-family: Arial; font-size: 16px; padding: 30px;} ul { list-style-type: none; padding: 0; margin: 0; } .df { display: flex; } .fdr { flex-direction: row; } .fdc { flex-direction: column; } .aic { align-items: center; } .jcsa { justify-content: space-around; } .jcse { justify-content: space-evenly; } hr { border: 1px dashed #ccc; margin: 10px 0; } .custom-table{border-collapse:collapse}.custom-table th,.custom-table td{border:1px solid black;padding:3px; text-align:center;} th{font-weight: 500;} .greyBackground {background: #808080 !important}</style>');
            newWindow.document.close();

            newWindow.onafterprint = function () {
                newWindow.close();
            };
            setTimeout(() => {
                newWindow.print();
            }, 300)
        }
        return
    }

    const RenderMobileComponent = () => (
        <>
            <div className={`${s.toolbar} df fdr pa w100`} style={{ gap: '12px' }}>
                <div className="df fdr aic" style={{ gap: '12px' }}>
                    <DatePickerComponent
                        placeholder='Дата'
                        showTime={false}
                        height={'48px'}
                        format={'DD/MM/YYYY'}
                        doSome={handleDateChange}
                        state={applicationPlanDate}
                        setState={setApplicationPlanDate}
                    />
                </div>
            </div>
            <div className={`${s.mobileContentBlock} df fdc`} style={{ gap: '16px' }}>
                <div className='df fdr jcsb aic'>
                    <span className="fz18">План заявок <br />на {dayjs(applicationPlanDate).format('DD.MM.YYYY') || '-'} г.</span>
                    <ButtonComponent
                        width='120px'
                        height='36px'
                        text="Добавить"
                        onClick={(e: any) => { navigate('/main/application-plan/add') }}
                        disabled={false}
                        variant='primary'
                    />
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
                        onClick={() => navigate(`/main/application-log/view/${item?.id}`)}
                        key={index}>
                        <div className='df fdc' style={{ gap: '6px' }}>
                            <div className="df fdr jcsb">
                                <div className="df fdr aic" style={{ gap: '10px' }}>
                                    <div className={`${s.layer} ${item?.is_active ? item?.is_finished ? s.green : s.yellow : s.red}`}></div>
                                    <div className="df fdc">
                                        <span className="fz18 fw500">{parseTimeWithoutSecond(item?.purpose_start) || '-'}</span>
                                    </div>
                                </div>

                                <div className="df fdc tar">
                                    <span className="fz18 fw500">{item?.client_company?.company_type} {item?.client_company?.name || '-'}</span>
                                    <span className="fz16 cg">Заявка №{item?.id}</span>
                                </div>
                            </div>
                            <div style={{ borderBottom: '1px solid #bdbdbd' }} />
                            <div className="df fdc" style={{ gap: '8px' }}>
                                <div className="df fdr jcsb">
                                    <span className='fz16 cg-2 w50'>{item?.object?.name || '-'}</span>
                                    <span className='fz16 cg-2'>СП: {item?.receive_method?.name || '-'}</span>
                                </div>
                                <div className="df fdr jcsb">
                                    <span className='fz16 cg-2 w50'>МБ: {item?.material?.name || '-'}</span>
                                    <span className='fz16 cg-2'>Кубатура: {item?.purpose_cubature || '-'}</span>
                                </div>
                                <div className="df fdr jcsb">
                                    <span className='fz16 cg-2'>ИО: {item?.interval || '-'} минут</span>
                                    <span className='fz16 cg-2 w50 tar'>К: {item?.construction?.name || '-'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );

    const RenderDesktopComponent = () => (
        <>
            <div className="df fdr jcsb aib">
                <span className="fz28">План заявок на {dayjs(applicationPlanDate).format('D MMMM YYYY') || '-'} г.</span>
                <WeightIndicatorComponent />
            </div>

            <div className={`${s.contentBlock} df fdc`}>
                <div className='df aic jcsb'>
                    <div className={`${s.actionBlock} df w100`}>
                        <DatePickerComponent
                            placeholder='Дата'
                            showTime={false}
                            height={'48px'}
                            format={'DD/MM/YYYY'}
                            doSome={handleDateChange}
                            state={applicationPlanDate}
                            setState={setApplicationPlanDate}
                        />
                        <ProgressBarComponent
                            is_finished={false}
                            realized_cubature={data?.realized_cubature}
                            loading_cubature={data?.loading_cubature}
                            remain_cubature={data?.remain_cubature}
                            height={'48px'}
                        />
                        <ButtonComponent
                            height='48px'
                            text="Распечатать"
                            width={"20%"}
                            onClick={() => { printApplicationPlanList(data) }}
                            disabled={false}
                            variant='primary'
                        />
                        <ButtonComponent
                            height='48px'
                            width={"20%"}
                            text="Добавить заявку"
                            onClick={() => { navigate('/main/application-plan/add') }}
                            disabled={false}
                            variant='primary'
                        />
                    </div>
                </div>

                <div className={`${s.row} df jcsb aic fz18 fw500`}>
                    <span className='w5'></span>
                    <span className='w10'></span>
                    <span className='w25'>Заказчик</span>
                    <span className='w20'>Объект</span>
                    <span className='w20'>МБ</span>
                    <span className='w20'>Куб.</span>
                </div>

                {data && data?.requests?.map((item: any, index: any) => (
                    <div className={`${s.selectedRow} df fdc`} key={index} style={{ gap: '20px' }} onClick={() => navigate(`/main/application-plan/view/${item?.id}?date=${formatAPIDateTime(applicationPlanDate)}&is_application_plan=${true}`)}>
                        <div className={`${s.secondrow} cp df jcsb aic fz16 posr`}>
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
                                <div className={`${s.layer} ${item?.is_active ? item?.is_finished ? s.green : s.yellow : s.red}`}></div>
                                <div className='df fdc jcc'>
                                    <span className='fz16 cg-2 fw400'>{parseTimeWithoutSecond(item?.purpose_start) || '-'}</span>
                                </div>
                            </div>
                            <span className={`w25 fz16 textellipsis`}>{item?.client_company?.company_type} {item?.client_company?.name || '-'}</span>
                            <span className={`w20 fz16 cg textellipsis`}>{item?.object?.name || '-'}</span>
                            <span className={`w20 fz16 cg textellipsis`}>{item?.material?.name || '-'}</span>
                            <span className={`w20 fz16 cg`}>{item?.purpose_cubature || '-'}</span>
                        </div>
                    </div>
                ))}

            </div>
        </>
    )

    useEffect(() => {
        if (queryDate) {
            setApplicationPlanDate(dayjs(queryDate));
            handleApplyQueryFiltering(queryDate);
        } else {
            getApplicationPlan();
        }
    }, [getApplicationPlan, handleApplyQueryFiltering, queryDate]);

    return (
        <div className='main'>
            {isMobile ? RenderMobileComponent() : RenderDesktopComponent()}
        </div>
    )
}