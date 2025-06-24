import React, { useState, useCallback, useEffect  } from 'react';

import { useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';

import { Pagination } from 'ui/PaginationComponent'
import { getVehicleData } from 'store/features/apiSlice'

import s from './index.module.scss'
import { pageSize } from 'constDatas';
import { useWindowSize } from 'ui/UseWindowSizeComponent';

export const Vehicle = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const location = useLocation();
    const isMobile: boolean = useWindowSize();

    const searchParams = new URLSearchParams(location.search);
    const isActive = searchParams.get('is_active') ? searchParams.get('is_active') : true;
    const searchValue = searchParams.get('search_value');
    const queryCurrentPage: any = searchParams.get('current_page');

    const [data, setData] = useState([])
    const [currentPage, setCurrentPage] = useState(queryCurrentPage ? Number(queryCurrentPage) : 1);
    const [totalPages, setTotalPages] = useState<number>(0);

    const getVehicles = useCallback(async () => {
        let newOffset = 0;
        
        if (currentPage > 1) {
            newOffset = (currentPage - 1) * pageSize;
        }

        if (isActive && !Number(queryCurrentPage)) {
            newOffset = 0;
            setCurrentPage(1);
        }

        const response = await dispatch(getVehicleData({limit: !isMobile ? pageSize : null, is_active: isActive, plate_number: searchValue, offset: newOffset}));
        const responseData = response?.payload?.data || []
        setData(responseData);

        // Pagination Total Pages Calculate
        let calculatedTotalPages = Math.ceil(response?.payload?.total / pageSize) || 1;
        if (calculatedTotalPages === 0) {calculatedTotalPages = 1;}
        setTotalPages(calculatedTotalPages);

        // eslint-disable-next-line
    }, [dispatch, isActive, isMobile, searchValue]);

    useEffect(() => {
        if (searchValue) {
            setCurrentPage(1);
        }
    }, [searchValue])

    const handlePageChange = async (pageNumber: any) => {
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
            const newOffset = (pageNumber - 1) * pageSize;
            const response = await dispatch(getVehicleData({
                limit: pageSize, 
                offset: newOffset,
                is_active: isActive,
                name: searchValue,
            }));
            setData(response?.payload?.data);
        }
    };

    const RenderMobileComponent = () => (
        <div className={`${s.mobileContentBlock} df fdc`} style={{gap: '16px'}}>
            {data && data.map((item:any, index:any) => (
                <div className={`${s.dataMobileBlock} df fdc`}
                    onClick={() => navigate(`edit/${item?.id}?is_active=${isActive}&search_value=${searchValue}&current_page=${currentPage}`)}
                    key={index}>
                    <div className='df fdc' style={{gap: '6px'}}>
                        <span className='fz16 cg-2'>{item?.plate_number || '-'}</span>
                        <div className="df fdr jcsb">
                            <span className='fz16 cg'>{item?.driver?.name || '-'}</span>
                            <span className='fz16 cg'>{item?.carrier?.name || '-'}</span>
                        </div>
                    </div>
                    <div style={{borderBottom: '1px solid #bdbdbd' }}/>
                    <div className='df fdr jcsb'>
                        <span className='fz14 cg-2 w50'>Тара: { item?.tare || '-' }</span>
                        <span className='fz14 cg-2'>Погрешность: { item?.admissible_error || '-' }</span>
                    </div>
                </div>
            ))}
        </div>
    );

    const RenderDesktopComponent = () => (
        <>
        <div className={`${s.contentBlock} df fdc`}>
            <div className={`${s.row} df jcsb aic fz18 fw500`}>
              <span className='w30'>Гос.номер</span>
              <span className='w30'>ФИО водителя</span>
              <span className='w30'>Тара</span>
              <span className='w30'>Погрешность, %</span>
              <span className='w30'>Перевозчик</span>
              <span className='w30'>Примечание</span>
            </div>

            {data && data.map((item:any, index:any) => (
                <div className={`${s.secondrow} cp df jcsb aic fz16`} 
                onClick={() => {navigate(`edit/${item?.id}?is_active=${isActive}&search_value=${searchValue}&current_page=${currentPage}`)}}
                key={index}>
                    <span className='w30'>{item?.plate_number || '-'}</span>
                    <span className='w30'>{item?.driver?.name || '-'}</span>
                    <span className='w30'>{item?.tare || '-'}</span>
                    <span className='w30'>{item?.admissible_error || '-'}</span>
                    <span className='w30'>{item?.carrier?.name}</span>
                    <span className='w30'>-</span>
                </div>
            ))}

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
        getVehicles()
    }, [getVehicles]);

 return (
    <>
        {isMobile ? RenderMobileComponent() : RenderDesktopComponent()}
    </>
 )
}