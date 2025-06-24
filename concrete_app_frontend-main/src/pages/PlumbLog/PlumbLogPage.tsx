import React, { useState, useCallback, useEffect } from 'react';

import { useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';

import { WeightIndicatorComponent } from 'ui/WeightIndicatorComponent'
import { ButtonComponent } from 'ui/ButtonComponent';
import { Pagination } from 'ui/PaginationComponent'
import { SelectComponent } from 'ui/SelectComponentAntd'
import { getCompaniesData, getIndependentWeighingsData, getMaterialsData } from 'store/features/apiSlice'

import s from './index.module.scss'
import { completeUncompleteTypes, pageSize, formatAPIDateTime } from 'constDatas';
import { RangePickerComponent } from 'ui/RangePickerComponent';

import dayjs from 'dayjs';
import { useWindowSize } from 'ui/UseWindowSizeComponent';
import { FilterIcon } from 'assets/icons/FilterIcon';
import { FilterComponent } from './components/FilterComponent';

export const PlumbLogPage = () => {
    const todayStart = dayjs().startOf('day');
    const todayEnd = dayjs().endOf('day');
    const [data, setData] = useState<any>([]);
    const [plumbLogStatus, setPlumbLogStatus] = useState('Все');
    const [sellerCompany, setSellerCompany] = useState('Все');
    const [material, setMaterial] = useState('Все');
    const [selectedDates, setSelectedDates] = useState([todayStart, todayEnd]);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(0);
    const [sellerCompanyItems, setSellerCompanyItems] = useState<any>([]);
    const [materialItems, setMaterialItems] = useState<any>([]);
    const [viewFilterComponent, setViewFilterComponent] = useState(false);

    const navigate = useNavigate();
    const dispatch = useDispatch();
    const location = useLocation();
    const isMobile = useWindowSize();

    const searchParams = new URLSearchParams(location.search);
    const queryDateFrom = searchParams.get('date_from');
    const queryDateTo = searchParams.get('date_to');
    const queryIsFinished = searchParams.get('is_finished');
    const querySellerCompanyName = searchParams.get('seller_company');
    const queryMaterialName = searchParams.get('material');
    const queryCurrentPage = searchParams.get('current_page');

    const getIndependentWeighings = useCallback(async () => {
        const fromDate = dayjs(selectedDates[0]).startOf('day').toDate();
        const toDate = dayjs(selectedDates[1]).endOf('day').toDate();
        const response = await dispatch(getIndependentWeighingsData({
            from_date: selectedDates[0] ? formatAPIDateTime(fromDate) : null,
            to_date: selectedDates[1] ? formatAPIDateTime(toDate) : null,
            limit: !isMobile ? pageSize : null,
            order_attribute: 'is_finished',
            is_desc: false,
        }));
        const responseData = response?.payload?.data || [];
        setData(responseData);

        const calculatedTotalPages = Math.ceil(response?.payload?.total / pageSize) || 1;
        setTotalPages(calculatedTotalPages);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch, isMobile]);

    const getSellerCompanies = useCallback(async () => {
        const response = await dispatch(getCompaniesData({ company_function: 'Поставщик' }));
        const responseData = response?.payload?.data || []
        const allOption = { name: 'Все' };
        const itemsWithAll = [allOption, ...responseData];
        setSellerCompanyItems(itemsWithAll);
    }, [dispatch]);

    const getMaterials = useCallback(async () => {
        const response = await dispatch(getMaterialsData({ is_for_independent: true }));
        const responseData = response?.payload?.data || []
        const allOption = { name: 'Все' };
        const itemsWithAll = [allOption, ...responseData];
        setMaterialItems(itemsWithAll);
    }, [dispatch]);

    const handlePageChange = async (pageNumber: any) => {
        const isFinishedValue = plumbLogStatus === 'Завершенные' ? true : plumbLogStatus === 'Незавершенные' ? false : null;
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
            const newOffset = (pageNumber - 1) * pageSize;
            const response = await dispatch(getIndependentWeighingsData({
                from_date: selectedDates[0] ? formatAPIDateTime(selectedDates[0]) : null,
                to_date: selectedDates[1] ? formatAPIDateTime(selectedDates[1]) : null,
                limit: pageSize,
                offset: newOffset,
                seller_id: sellerCompanyItems.find((item: any) => item.name === sellerCompany)?.id,
                material_id: materialItems.find((item: any) => item.name === material)?.id,
                is_finished: isFinishedValue,
                order_attribute: 'is_finished',
                is_desc: false,
            }));
            setData(response?.payload?.data);
        }
    };

    const handleIsFinishedChange = async (value: any) => {
        let isFinishedValue = value === 'Завершенные' ? true : value === 'Незавершенные' ? false : null;
        const response = await dispatch(getIndependentWeighingsData({
            from_date: selectedDates && selectedDates?.[0] ? formatAPIDateTime(selectedDates?.[0]) : null,
            to_date: selectedDates && selectedDates?.[0] ? formatAPIDateTime(selectedDates?.[1]) : null,
            seller_id: sellerCompanyItems.find((item: any) => item.name === sellerCompany)?.id,
            material_id: materialItems.find((item: any) => item.name === material)?.id,
            is_finished: isFinishedValue,
            order_attribute: 'is_finished',
            is_desc: false,
        }));
        const weighingsData = response?.payload?.data;

        let calculatedTotalPages = Math.ceil(response?.payload?.total / pageSize) || 1;
        if (calculatedTotalPages === 0) { calculatedTotalPages = 1; }
        setTotalPages(calculatedTotalPages);

        setData(weighingsData);
    }

    const handleDateChange = async (dates: any) => {
        let isFinishedValue = plumbLogStatus === 'Завершенные' ? true : plumbLogStatus === 'Незавершенные' ? false : null;
        let fromDate = dayjs(dates?.[0]).startOf('day').toDate();
        let toDate = dayjs(dates?.[1]).endOf('day').toDate();

        const response = await dispatch(getIndependentWeighingsData({
            from_date: formatAPIDateTime(fromDate),
            to_date: formatAPIDateTime(toDate),
            seller_id: sellerCompanyItems.find((item: any) => item.name === sellerCompany)?.id,
            material_id: materialItems.find((item: any) => item.name === material)?.id,
            is_finished: isFinishedValue,
            order_attribute: 'is_finished',
            is_desc: false,
        }));
        const weighingsData = response?.payload?.data;

        let calculatedTotalPages = Math.ceil(response?.payload?.total / pageSize) || 1;
        if (calculatedTotalPages === 0) { calculatedTotalPages = 1; }
        setTotalPages(calculatedTotalPages);

        setData(weighingsData);
    };

    const handleSellerCompanyChange = async (value: any) => {
        let isFinishedValue = plumbLogStatus === 'Завершенные' ? true : plumbLogStatus === 'Незавершенные' ? false : null;

        const response = await dispatch(getIndependentWeighingsData({
            seller_id: sellerCompanyItems.find((item: any) => item.name === value)?.id,
            material_id: materialItems.find((item: any) => item.name === material)?.id,
            from_date: selectedDates && selectedDates?.[0] ? formatAPIDateTime(selectedDates?.[0]) : null,
            to_date: selectedDates && selectedDates?.[1] ? formatAPIDateTime(selectedDates?.[1]) : null,
            is_finished: isFinishedValue,
            order_attribute: 'is_finished',
            is_desc: false,
        }));
        const weighingsData = response?.payload?.data;

        let calculatedTotalPages = Math.ceil(response?.payload?.total / pageSize) || 1;
        if (calculatedTotalPages === 0) { calculatedTotalPages = 1; }
        setTotalPages(calculatedTotalPages);

        setData(weighingsData);
    }

    const handleMaterialChange = async (value: any) => {
        let isFinishedValue = plumbLogStatus === 'Завершенные' ? true : plumbLogStatus === 'Незавершенные' ? false : null;
        const response = await dispatch(getIndependentWeighingsData({
            material_id: materialItems.find((item: any) => item.name === value)?.id,
            seller_id: sellerCompanyItems.find((item: any) => item.name === sellerCompany)?.id,
            from_date: selectedDates && selectedDates?.[0] ? formatAPIDateTime(selectedDates?.[0]) : null,
            to_date: selectedDates && selectedDates?.[1] ? formatAPIDateTime(selectedDates?.[1]) : null,
            is_finished: isFinishedValue,
            order_attribute: 'is_finished',
            is_desc: false,
        }));
        const weighingsData = response?.payload?.data;

        let calculatedTotalPages = Math.ceil(response?.payload?.total / pageSize) || 1;
        if (calculatedTotalPages === 0) { calculatedTotalPages = 1; }
        setTotalPages(calculatedTotalPages);

        setData(weighingsData);
    }

    const handleApplyQueryFiltering = useCallback(async (dates: any, is_finished: any, material: any, seller_company: any) => {
        if (materialItems.length === 0 || sellerCompanyItems.length === 0) return;
        let isFinishedValue = is_finished === 'Завершенные' ? true : is_finished === 'Незавершенные' ? false : null;
        setCurrentPage(Number(queryCurrentPage));
        const newOffset = (Number(queryCurrentPage) - 1) * pageSize;
        const response = await dispatch(getIndependentWeighingsData({
            material_id: materialItems.find((item: any) => item.name === material)?.id,
            seller_id: sellerCompanyItems.find((item: any) => item.name === seller_company)?.id,
            from_date: dates && dates?.[0] ? formatAPIDateTime(dates?.[0]) : null,
            to_date: dates && dates?.[1] ? formatAPIDateTime(dates?.[1]) : null,
            offset: newOffset,
            is_finished: isFinishedValue,
            order_attribute: 'is_finished',
            is_desc: false,
        }));
        const weighingsData = response?.payload?.data;
        let calculatedTotalPages = Math.ceil(response?.payload?.total / pageSize) || 1;
        if (calculatedTotalPages === 0) { calculatedTotalPages = 1; }
        setTotalPages(calculatedTotalPages);
        setData(weighingsData);
    }, [dispatch, queryCurrentPage, materialItems, sellerCompanyItems]);

    const RenderMobileComponent = () => (
        <>
            {viewFilterComponent ? (
                <FilterComponent
                    popup={viewFilterComponent}
                    setPopup={setViewFilterComponent}
                    selectedDates={selectedDates}
                    setSelectedDates={setSelectedDates}
                    handleDateChange={handleDateChange}
                    sellerCompanyItems={sellerCompanyItems}
                    sellerCompany={sellerCompany}
                    setSellerCompany={setSellerCompany}
                    handleSellerCompanyChange={handleSellerCompanyChange}
                    materialItems={materialItems}
                    material={material}
                    setMaterial={setMaterial}
                    handleMaterialChange={handleMaterialChange}
                />
            ) : (
                <>
                    <div className={`${s.toolbar} df fdr pa w100`} style={{ gap: '12px' }}>
                        <SelectComponent
                            placeholder={'Статус отвеса'}
                            items={completeUncompleteTypes}
                            state={plumbLogStatus}
                            doSome={handleIsFinishedChange}
                            width={'20vh'}
                            height={"48px"}
                            setState={setPlumbLogStatus}
                            loadingText={'Нет данных...'}
                        />
                        <div className={`${s.filterBlock} df aic jcc`} onClick={() => { setViewFilterComponent(true); }}>
                            <FilterIcon />
                        </div>
                    </div>
                    <div className={`${s.mobileContentBlock} df fdc posr`} style={{ gap: '16px' }}>
                        <div className='df fdr jcsb aic'>
                            <span className="fz18">Перечень отвесов</span>
                            <ButtonComponent
                                width='120px'
                                height='36px'
                                text="Добавить"
                                onClick={(e: any) => { navigate('/main/plumblog/add') }}
                                disabled={false}
                                variant='primary'
                            />
                        </div>
                        {data && data?.weighings?.map((item: any, index: any) => (
                            <div className={`${s.dataMobileBlock} df fdc`}
                                onClick={() => navigate(`${item?.is_finished ? 'view' : 'edit'}/${item?.id}?${selectedDates && selectedDates[0] ? `date_from=${formatAPIDateTime(selectedDates[0])}&` : ''}${selectedDates && selectedDates[1] ? `date_to=${formatAPIDateTime(selectedDates[1])}&` : ''}is_finished=${plumbLogStatus}&seller_company=${sellerCompany}&material=${material}&current_page=${currentPage}`)}
                                key={index}>
                                <div className='df fdc' style={{ gap: '6px' }}>
                                    <div className="df fdr jcsb">
                                        <span className='fz16 cg-2 w50'>{item?.seller_company?.company_type} {item?.seller_company?.name}</span>
                                        <span className='fz16 cg w50 tar'>МБ: {item?.material?.name || '-'}</span>
                                    </div>
                                    <div style={{ borderBottom: '1px solid #bdbdbd' }} />
                                    <div className="df fdr jcsb">
                                        <span className='fz16 cg-2 w70'>{item?.client_company?.company_type} {item?.client_company?.name}</span>
                                        <span className='fz16 cg-2'>ID: {item?.id}</span>
                                    </div>
                                    <div className="df fdc">
                                        <span className='fz16 cg-2'>{item?.transport?.plate_number || '-'}</span>
                                    </div>
                                    <div className="df fdr jcsb">
                                        <div className="df fdr">
                                            <span className='fz16 cg'>Тара: </span>
                                            <span className='fz16 cg'>{item?.tare_weight || '-'}</span>
                                        </div>
                                        <div className="df fdr">
                                            <span className='fz16 cg'>Брутто: </span>
                                            <span className='fz16 cg'>{item?.brutto_weight || '-'}</span>
                                        </div>
                                        <div className="df fdr">
                                            <span className='fz16 cg'>Нетто: </span>
                                            <span className='fz16 cg'>{item?.netto_weight || '-'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        <div className={`${s.bottomStatisticsBlock} df aic jcsb`}>
                            <span className='fz18 cg'>{data?.total_tare || 0}</span>
                            <span className='fz18 cg'>{data?.total_brutto || 0}</span>
                            <span className='fz18 cg'>{data?.total_clean || 0}</span>
                        </div>
                    </div>
                </>

            )}
        </>
    );

    const RenderDesktopComponent = () => (
        <>
            <div className="df fdr jcsb aib">
                <span className="fz28">Журнал отвесов</span>
                <WeightIndicatorComponent />
            </div>

            <div className={`${s.contentBlock} df fdc`}>
                <div className='df aic jcsb'>
                    <span className='fz20 fw600'>Перечень отвесов</span>
                    <div className={`${s.actionBlock} df`}>
                        <RangePickerComponent
                            height={'48px'}
                            width={'37vh'}
                            state={selectedDates}
                            setState={setSelectedDates}
                            doSome={handleDateChange}
                            format={'DD/MM/YYYY'}
                        />
                        <SelectComponent
                            placeholder={'Статус отвеса'}
                            items={completeUncompleteTypes}
                            state={plumbLogStatus}
                            doSome={handleIsFinishedChange}
                            width={'17vh'}
                            height={"48px"}
                            setState={setPlumbLogStatus}
                            loadingText={'Нет данных...'}
                        />
                        <SelectComponent
                            placeholder={'Поставщик'}
                            items={sellerCompanyItems}
                            state={sellerCompany}
                            setState={setSellerCompany}
                            doSome={handleSellerCompanyChange}
                            width={'17vh'}
                            height={"48px"}
                            loadingText={'Нет данных...'}
                        />
                        <SelectComponent
                            placeholder={'Материал'}
                            items={materialItems}
                            state={material}
                            setState={setMaterial}
                            doSome={handleMaterialChange}
                            width={'17vh'}
                            height={"48px"}
                            loadingText={'Нет данных...'}
                        />
                        <ButtonComponent
                            height='48px'
                            width={'17vh'}
                            text="Добавить отвес"
                            onClick={() => { navigate('/main/plumblog/add') }}
                            disabled={false}
                            variant='primary'
                        />
                    </div>
                </div>
                <div className={`${s.row} df jcsb aic fz18 fw500`}>
                    <span className='w10'>ID</span>
                    <span className='w20'>Поставщик</span>
                    <span className='w20'>Заказчик</span>
                    <span className='w10'>Материал</span>
                    <span className='w10'>Гос.номер</span>
                    <span className='w10'>Тара</span>
                    <span className='w10'>Брутто</span>
                    <span className='w10'>Нетто</span>
                </div>

                <div className='posr'>
                    {data && data?.weighings?.map((item: any, index: any) => (
                        <div className={`${s.secondrow} cp df jcsb aic fz16`}
                            onClick={() => navigate(`${item?.is_finished ? 'view' : 'edit'}/${item?.id}?${selectedDates && selectedDates[0] ? `date_from=${formatAPIDateTime(dayjs(selectedDates[0]).startOf('day'))}&` : ''}${selectedDates && selectedDates[1] ? `date_to=${formatAPIDateTime(dayjs(selectedDates[1]).endOf('day'))}&` : ''}is_finished=${plumbLogStatus}&seller_company=${sellerCompany}&material=${material}&current_page=${currentPage}`)}
                            key={index}>
                            <span className='w10'>{item?.id}</span>
                            <span className='w20'>{item?.seller_company?.company_type} {item?.seller_company?.name}</span>
                            <span className='w20'>{item?.client_company?.company_type} {item?.client_company?.name}</span>
                            <span className='w10 textellipsis'>{item?.material?.name || '-'}</span>
                            <span className='w10'>{item?.transport?.plate_number || '-'}</span>
                            <span className='w10'>{item?.tare_weight || '-'}</span>
                            <span className='w10'>{item?.brutto_weight || '-'}</span>
                            <span className='w10'>{item?.netto_weight || '-'}</span>
                        </div>
                    ))}

                    <div className={`${s.bottomStatisticsBlock} df aic`}>
                        <span className='fz18 w10 cg'>{data?.total_tare || 0}</span>
                        <span className='fz18 w10 cg'>{data?.total_brutto || 0}</span>
                        <span className='fz18 w10 cg'>{data?.total_clean || 0}</span>
                    </div>
                </div>


            </div>
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                prevButtonText="Назад"
                nextButtonText="Вперед"
            />
        </>
    )

    useEffect(() => {
        if (queryIsFinished && querySellerCompanyName && queryMaterialName) {
            queryDateFrom && queryDateTo && setSelectedDates([dayjs(queryDateFrom), dayjs(queryDateTo)]);
            setPlumbLogStatus(queryIsFinished);
            setSellerCompany(querySellerCompanyName);
            setMaterial(queryMaterialName);
            handleApplyQueryFiltering([queryDateFrom, queryDateTo], queryIsFinished, queryMaterialName, querySellerCompanyName);
        }
    }, [queryIsFinished, querySellerCompanyName, queryMaterialName, queryDateFrom, queryDateTo, handleApplyQueryFiltering]);

    useEffect(() => {
        if (!queryIsFinished && !querySellerCompanyName && !queryMaterialName) {
            getIndependentWeighings();
        }
        getSellerCompanies();
        getMaterials();
    }, [getIndependentWeighings, getSellerCompanies, getMaterials, queryIsFinished, queryMaterialName, querySellerCompanyName]);

    return (
        <div className='main'>
            {isMobile ? RenderMobileComponent() : RenderDesktopComponent()}
        </div>
    )
}