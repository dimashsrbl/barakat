import { useState, useCallback, useEffect } from 'react';

import { useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';

import { Pagination } from 'ui/PaginationComponent'
import { getCompaniesData } from 'store/features/apiSlice'

import s from './index.module.scss'
import { pageSize } from 'constDatas';
import { useWindowSize } from 'ui/UseWindowSizeComponent';

export const Companies = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const location = useLocation();
    const isMobile = useWindowSize();

    const searchParams = new URLSearchParams(location.search);
    const isActive = searchParams.get('is_active') ? searchParams.get('is_active') : true;
    const searchValue:any = searchParams.get('search_value');
    const queryCurrentPage: any = searchParams.get('current_page');

    const [data, setData] = useState([]);
    const [currentPage, setCurrentPage] = useState(queryCurrentPage ? Number(queryCurrentPage) : 1);
    const [totalPages, setTotalPages] = useState<number>(0);
    

    const getCompanies = useCallback(async () => {
        let newOffset = 0;
        
        if (currentPage > 1) {
            newOffset = (currentPage - 1) * pageSize;
        }

        if (isActive && !Number(queryCurrentPage)) {
            newOffset = 0;
            setCurrentPage(1);
        }

        const response = await dispatch(getCompaniesData(
            {
                limit: !isMobile ? pageSize : null, 
                is_active: isActive, 
                name: searchValue, 
                offset: newOffset
            }));
        const responseData = response?.payload?.data;
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
            const response = await dispatch(getCompaniesData({
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
                    onClick={() => navigate(`companies/edit/${item?.id}?is_active=${isActive}&search_value=${searchValue}&current_page=${currentPage}`)}
                    key={index}>
                    <div className='df fdc' style={{gap: '6px'}}>
                        <span className='fz16 cg-2'>{item?.name || '-'}</span>
                        <div className="df fdr jcsb">
                            <span className='fz16 cg'>{item?.company_func}</span>
                            <span className='fz16 cg'>{item?.company_type}</span>
                        </div>
                    </div>
                    <div style={{borderBottom: '1px solid #bdbdbd' }}/>
                    <div className='df fdr'>
                        <span className='fz14 cg-2 w50'>{ item?.contact_number }</span>
                    </div>
                </div>
            ))}
        </div>
    );

    const RenderDesktopComponent = () => (
        <>
        <div className={`${s.contentBlock} df fdc`}>
            <div className={`${s.row} df jcsb aic fz18 fw500`}>
              <span className='w20'>Наименование</span>
              <span className='w20'>Функция</span>
              <span className='w20'>БИН</span>
              <span className='w20'>Тип</span>
              <span className='w20'>Номер контактного лица</span>
            </div>
            
            {data && data.map((item:any, index:any) => (
                <div className={`${s.secondrow} cp df jcsb aic fz16`} 
                onClick={() => {navigate(`companies/edit/${item?.id}?is_active=${isActive}&search_value=${searchValue}&current_page=${currentPage}`)}}
                key={index}>
                    <span className='w20'>{item?.name}</span>
                    <span className='w20'>{item?.company_func}</span>
                    <span className='w20'>{item?.bin || '-'}</span>
                    <span className='w20'>{item?.company_type}</span>
                    <span className='w20'>{item?.contact_number || '-'}</span>
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
    );

    useEffect(() => {
        getCompanies();
    }, [getCompanies])

 return (
    <>
        {isMobile ? RenderMobileComponent() : RenderDesktopComponent()}
    </>
 )
}