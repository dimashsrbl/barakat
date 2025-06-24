import { useState, useCallback, useEffect, } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { WeightIndicatorComponent } from 'ui/WeightIndicatorComponent';
import { ButtonComponent } from 'ui/ButtonComponent';
import { Pagination } from 'ui/PaginationComponent';
import { SelectComponent } from 'ui/SelectComponentAntd';
import { isActiveTypes, pageSize } from 'constDatas';

import { getUsersData } from 'store/features/apiSlice';

import s from './index.module.scss';
import { useWindowSize } from 'ui/UseWindowSizeComponent';

export const UserPage = () => {
    const [usersData, setUsersData] = useState([]);
    const [isActive, setIsActive] = useState('Активные');
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(0);

    const navigate = useNavigate();
    const dispatch = useDispatch();
    const isMobile: boolean = useWindowSize();

    const getUsers = useCallback(async () => {
        const response = await dispatch(getUsersData({limit: !isMobile ? pageSize : null}));
        const userData = response?.payload?.data || [];
        setUsersData(userData);

        // Pagination Total Pages Calculate
        let calculatedTotalPages = Math.ceil(response?.payload?.total / pageSize) || 1;
        if (calculatedTotalPages === 0) {calculatedTotalPages = 1;}
        setTotalPages(calculatedTotalPages);
    }, [dispatch, isMobile]);

    useEffect(() => {
        getUsers();
    }, [getUsers]);

    const handleIsActiveChange = async (value: any) => {
        let isActiveValue = value === 'Активные' ? true : false;
        const response = await dispatch(getUsersData({is_active: isActiveValue, limit: pageSize}));
        const userData = response?.payload?.data;
        setUsersData(userData);
        
        // Pagination Total Pages Calculate
        let calculatedTotalPages = Math.ceil(response?.payload?.total / pageSize) || 1;
        if (calculatedTotalPages === 0) {calculatedTotalPages = 1;}
        setTotalPages(calculatedTotalPages);
    }

    const handlePageChange = async (pageNumber: any) => {
        let isActiveValue = isActive === 'Активные' ? true : false;
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
            const newOffset = (pageNumber - 1) * pageSize;
            const response = await dispatch(getUsersData({
                limit: pageSize, 
                offset: newOffset,
                is_active: isActiveValue
            }));
            setUsersData(response?.payload?.data);
        }
    };

    const RenderMobileComponent = () => (
        <>
        <div className={`${s.toolbar} df fdr pa w100`}>
            <SelectComponent
                    placeholder={'Все'}
                    items={isActiveTypes}
                    doSome={handleIsActiveChange}
                    state={isActive}
                    width={"140px"}
                    height={"48px"}
                    setState={setIsActive}
                    loadingText={'Нет данных...'}
            />
        </div>
        <div className={`${s.mobileContentBlock} df fdc`} style={{gap: '16px'}}>

        <div className='df fdr jcsb aic'>
            <span className="fz18">Пользователи</span>
            <ButtonComponent 
                width='120px'
                height='36px'
                text="Добавить" 
                onClick={(e:any) => {navigate('/main/users/add')}}
                disabled={false} 
                variant='primary'
            />
        </div>
        {usersData && usersData.map((item:any, index:any) => (
            <div className={`${s.dataMobileBlock} df fdc`} 
                onClick={() => navigate(`edit/${item?.id}`)}
                key={index}>
                <div className='df fdc' style={{gap: '6px'}}>
                    <span className='fz16 cg-2'>{item?.fullname || '-'}</span>
                    <span className='fz16 cg'>{item?.login}</span>
                </div>
                <div style={{borderBottom: '1px solid #bdbdbd' }}/>
                <div className='df fdr jcsb'>
                    <span className='fz14 cg-2 w50'>{ item?.role?.name }</span>
                    <span className='fz14 cg-2'>Не беспокоить</span>
                </div>
            </div>
        ))}
        </div>
        </>
    )

    const RenderDesktopComponent = () => (
                    <>
            <div className="df fdr jcsb aib">
                <span className="fz28">Пользователи</span>
                <WeightIndicatorComponent/>
            </div>
            <div className={`${s.contentBlock} df fdc`}>
                <div className='df aic jcsb'>
                    <span className='fz20 fw600'>Перечень сотрудников</span>
                    <div className={`${s.actionBlock} df`}>
                        <SelectComponent
                            placeholder={'Все'}
                            items={isActiveTypes}
                            doSome={handleIsActiveChange}
                            state={isActive}
                            height={"48px"}
                            setState={setIsActive}
                            loadingText={'Нет данных...'}
                        />
                        <ButtonComponent 
                            width='144px'
                            height='48px'
                            text="Добавить" 
                            onClick={(e:any) => {navigate('/main/users/add')}}
                            disabled={false} 
                            variant='primary'
                        />
                    </div>
                </div>
                <div className={`${s.row} df jcsb aic fz18 fw500`}>
                    <span className='w30'>ФИО</span>
                    <span className='w30'>Логин</span>
                    <span className='w20'>Роль</span>
                    <span className='w20'>Примечание</span>
                </div>
                {usersData && usersData.map((item:any, index:any) => (
                    <div className={`${s.secondrow} cp df jcsb aic fz16`} 
                        onClick={() => navigate(`edit/${item?.id}`)}
                        key={index}>
                        <span className='w30'>{item?.fullname || '-'}</span>
                        <span className='w30'>{item?.login}</span>
                        <span className='w20'>{item?.role?.name}</span>
                        <span className='w20'>{item?.description || '-'}</span>
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

 return (
    <div className='main'>
        {isMobile ? RenderMobileComponent() : RenderDesktopComponent()}
    </div>
 )
}