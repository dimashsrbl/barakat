import { useEffect, useState } from 'react';
import { useLocation, useNavigate, Outlet } from 'react-router-dom';

import { WeightIndicatorComponent } from 'ui/WeightIndicatorComponent';
import { ButtonComponent } from 'ui/ButtonComponent';
import { SelectComponent } from 'ui/SelectComponentAntd';

import s from './index.module.scss';
import { isActiveTypes } from 'constDatas';
import { useWindowSize } from 'ui/UseWindowSizeComponent';
import { InputComponent } from 'ui/InputComponent';

export const ListPage = () => {
    const [isActive, setIsActive] = useState('Активные');
    const [searchValue, setSearchValue] = useState('');

    const navigate = useNavigate();
    const url = useLocation();
    const location = useLocation();
    const isMobile: boolean = useWindowSize();

    const searchParams = new URLSearchParams(location.search);
    const queryIsActive:any = searchParams.get('is_active');
    const querySearchValue = searchParams.get('search_value') || '';

    const handleIsActiveChange = async (value: string) => {
        const currentUrl = window.location.href;
        const url = new URL(currentUrl);
        const params: any = new URLSearchParams(url.search);
        let isActiveValue = value === 'Активные' ? true : false;
        params.set('is_active', isActiveValue);
        const newUrl = `${url.pathname}?${params.toString()}`;
        navigate(newUrl);
    }

    useEffect(() => {
        if (queryIsActive) {
          setIsActive(JSON.parse(queryIsActive) ? 'Активные' : 'Неактивные');
        }
    
        if (querySearchValue) {
          setSearchValue(querySearchValue);
        }
      }, [queryIsActive, querySearchValue]);

      useEffect(() => {
        const timerId = setTimeout(() => {
          const currentUrl = window.location.href;
          const url = new URL(currentUrl);
          const params = new URLSearchParams(url.search);
    
          if (searchValue) {
            params.set('search_value', searchValue);
          } else {
            params.delete('search_value');
          }
    
          const newUrl = `${url.pathname}?${params.toString()}`;
    
          navigate(newUrl);
        }, 500);
    
        return () => clearTimeout(timerId);
      }, [searchValue, navigate]);
    

    const handleClickAddButton = (urlPathName: string) => {
        if (urlPathName === '/main/lists') {
            return navigate('companies/add')
        } else if (urlPathName === '/main/lists/objects') {
            return navigate('objects/add')
        } else if (urlPathName === '/main/lists/materials') {
            return navigate('materials/add')
        } else if (urlPathName === '/main/lists/constructions') {
            return navigate('constructions/add') 
        } else if (urlPathName === '/main/lists/acceptance-method') {
            return navigate('acceptance-method/add')
        } else if (urlPathName === '/main/lists/carrier') {
            return navigate('carrier/add')
        } else if (urlPathName === '/main/lists/vehicle') {
            return navigate('vehicle/add')
        } else if (urlPathName === '/main/lists/drivers') {
            return navigate('drivers/add')
        }
    }

    const RenderMobileComponent = () => (
        <>
        <div className={`${s.toolbar} df fdr pa w100`} style={{gap: '12px'}}>
            <SelectComponent
                placeholder={'Все'}
                items={isActiveTypes}
                doSome={handleIsActiveChange}
                state={isActive}
                width={"130px"}
                height={"48px"}
                setState={setIsActive}
                loadingText={'Нет данных...'}
            />
            <InputComponent
                type='default'
                width={"150px"}
                placeholder='Поиск'
                state={searchValue}
                setState={setSearchValue}
            />
        </div>
        <div className={`${s.mobileContentBlock} df fdc`}>
        <div className='df fdr jcsb aic'>
            <span className="fz18">Справочники</span>
            <ButtonComponent 
                width='120px'
                height='36px'
                text="Добавить" 
                onClick={(e:any) => {handleClickAddButton(url.pathname)}}
                disabled={false} 
                variant='primary'
            />
        </div>

        <div className={`${s.mobileButtonsBlock} df aic fz16`}>
                <button
                    className={s.mobileBarButton}
                    disabled={false}
                    onClick={() => { navigate('/main/lists'); setIsActive('Активные');}}
                    style={{
                        borderBottom: url.pathname === "/main/lists" ? '2px solid #2F80ED' : '2px solid #E0E0E0',
                        color: url.pathname === "/main/lists" ? '#2F80ED' : '',
                    }}>
                    Компании
                </button>
                <button
                    className={s.mobileBarButton}
                    disabled={false}
                    style={{
                        borderBottom: url.pathname.includes("objects") ? '2px solid #2F80ED' : '2px solid #E0E0E0',
                        color: url.pathname === "/main/lists/objects" ? '#2F80ED' : '',
                    }}
                    onClick={() => { navigate('/main/lists/objects'); setIsActive('Активные'); }}
                >
                    Объекты
                </button>
                <button
                    className={s.mobileBarButton}
                    disabled={false}
                    style={{
                        borderBottom: url.pathname.includes("materials") ? '2px solid #2F80ED' : '2px solid #E0E0E0',
                        color: url.pathname === "/main/lists/materials" ? '#2F80ED' : '',
                    }}
                    onClick={() => { navigate('/main/lists/materials'); setIsActive('Активные'); }}
                >
                    Материалы
                </button>
                <button
                    className={s.mobileBarButton}
                    disabled={false}
                    style={{
                        borderBottom: url.pathname.includes("constructions") ? '2px solid #2F80ED' : '2px solid #E0E0E0',
                        color: url.pathname === "/main/lists/constructions" ? '#2F80ED' : '',
                    }}
                    onClick={() => { navigate('/main/lists/constructions'); setIsActive('Активные'); }}
                >
                    Конструкция
                </button>
                <button
                    className={s.mobileBarButton}
                    disabled={false}
                    style={{
                        borderBottom: url.pathname.includes("acceptance-method") ? '2px solid #2F80ED' : '2px solid #E0E0E0',
                        color: url.pathname === "/main/lists/acceptance-method" ? '#2F80ED' : '',
                    }}
                    onClick={() => { navigate('/main/lists/acceptance-method'); setIsActive('Активные'); }}
                >
                    Способ приемки
                </button>
                <button
                    className={s.mobileBarButton}
                    disabled={false}
                    style={{
                        borderBottom: url.pathname.includes("carrier") ? '2px solid #2F80ED' : '2px solid #E0E0E0',
                        color: url.pathname === "/main/lists/carrier" ? '#2F80ED' : '',
                    }}
                    onClick={() => { navigate('/main/lists/carrier'); setIsActive('Активные'); }}
                >
                    Перевозчик
                </button>
                <button
                    className={s.mobileBarButton}
                    disabled={false}
                    style={{
                        borderBottom: url.pathname.includes("vehicle") ? '2px solid #2F80ED' : '2px solid #E0E0E0',
                        color: url.pathname === "/main/lists/vehicle" ? '#2F80ED' : '',
                    }}
                    onClick={() => { navigate('/main/lists/vehicle'); setIsActive('Активные'); }}
                >
                    Транспорт
                </button>
                <button
                    className={s.mobileBarButton}
                    disabled={false}
                    style={{
                        borderBottom: url.pathname.includes("drivers") ? '2px solid #2F80ED' : '2px solid #E0E0E0',
                        color: url.pathname === "/main/lists/drivers" ? '#2F80ED' : '',
                    }}
                    onClick={() => { navigate('/main/lists/drivers'); setIsActive('Активные'); }}
                >
                    Водители
                </button>
        </div>

        <Outlet />
        </div>
        </>
    )

    const RenderDesktopComponent = () => (
        <>
        <div className="df fdr jcsb aib">
            <span className="fz28">Справочники</span>
            <WeightIndicatorComponent />
        </div>

        <div className={`${s.contentBlock} df fdc`}>
            <div className={`${s.topBlock} df fdr aic jcsb`}>
                <div className={`${s.buttonsBlock} df aic fz16 w40`}>
                    <button
                        className={s.barButton}
                        disabled={false}
                        onClick={() => { navigate('/main/lists'); setIsActive('Активные'); setSearchValue('');}}
                        style={{
                            borderBottom: url.pathname === "/main/lists" ? '2px solid #2F80ED' : '2px solid #E0E0E0',
                            color: url.pathname === "/main/lists" ? '#2F80ED' : '',
                        }}>
                        Компании
                    </button>
                    <button
                        className={s.barButton}
                        disabled={false}
                        style={{
                            borderBottom: url.pathname.includes("objects") ? '2px solid #2F80ED' : '2px solid #E0E0E0',
                            color: url.pathname === "/main/lists/objects" ? '#2F80ED' : '',
                        }}
                        onClick={() => { navigate('/main/lists/objects'); setIsActive('Активные'); setSearchValue(''); }}
                    >
                        Объекты
                    </button>
                    <button
                        className={s.barButton}
                        disabled={false}
                        style={{
                            borderBottom: url.pathname.includes("materials") ? '2px solid #2F80ED' : '2px solid #E0E0E0',
                            color: url.pathname === "/main/lists/materials" ? '#2F80ED' : '',
                        }}
                        onClick={() => { navigate('/main/lists/materials'); setIsActive('Активные'); setSearchValue(''); }}
                    >
                        Материалы
                    </button>
                    <button
                        className={s.barButton}
                        disabled={false}
                        style={{
                            borderBottom: url.pathname.includes("constructions") ? '2px solid #2F80ED' : '2px solid #E0E0E0',
                            color: url.pathname === "/main/lists/constructions" ? '#2F80ED' : '',
                        }}
                        onClick={() => { navigate('/main/lists/constructions'); setIsActive('Активные'); setSearchValue(''); }}
                    >
                        Конструкция
                    </button>
                    <button
                        className={s.barButton}
                        disabled={false}
                        style={{
                            borderBottom: url.pathname.includes("acceptance-method") ? '2px solid #2F80ED' : '2px solid #E0E0E0',
                            color: url.pathname === "/main/lists/acceptance-method" ? '#2F80ED' : '',
                        }}
                        onClick={() => { navigate('/main/lists/acceptance-method'); setIsActive('Активные'); setSearchValue(''); }}
                    >
                        Способ приемки
                    </button>
                    <button
                        className={s.barButton}
                        disabled={false}
                        style={{
                            borderBottom: url.pathname.includes("carrier") ? '2px solid #2F80ED' : '2px solid #E0E0E0',
                            color: url.pathname === "/main/lists/carrier" ? '#2F80ED' : '',
                        }}
                        onClick={() => { navigate('/main/lists/carrier'); setIsActive('Активные'); setSearchValue(''); }}
                    >
                        Перевозчик
                    </button>
                    <button
                        className={s.barButton}
                        disabled={false}
                        style={{
                            borderBottom: url.pathname.includes("vehicle") ? '2px solid #2F80ED' : '2px solid #E0E0E0',
                            color: url.pathname === "/main/lists/vehicle" ? '#2F80ED' : '',
                        }}
                        onClick={() => { navigate('/main/lists/vehicle'); setIsActive('Активные'); setSearchValue(''); }}
                    >
                        Транспорт
                    </button>
                    <button
                        className={s.barButton}
                        disabled={false}
                        style={{
                            borderBottom: url.pathname.includes("drivers") ? '2px solid #2F80ED' : '2px solid #E0E0E0',
                            color: url.pathname === "/main/lists/drivers" ? '#2F80ED' : '',
                        }}
                        onClick={() => { navigate('/main/lists/drivers'); setIsActive('Активные'); setSearchValue(''); }}
                    >
                        Водители
                    </button>
                </div>

                <div className={`${s.actionBlock} df w60`}>
                    <SelectComponent
                        placeholder={'Все'}
                        items={isActiveTypes}
                        doSome={handleIsActiveChange}
                        state={isActive}
                        height={"48px"}
                        setState={setIsActive}
                        loadingText={'Нет данных...'}
                    />
                    <InputComponent
                        type='default'
                        placeholder='Поиск'
                        state={searchValue}
                        setState={setSearchValue}
                    />
                    <ButtonComponent 
                        height='48px'
                        text="Добавить" 
                        onClick={(e:any) => {handleClickAddButton(url.pathname)}}
                        disabled={false} 
                        variant='primary'
                    />
                </div>
            </div>

            <Outlet />
        </div>
        </>
    )

    return (
        <div className='main'>
        {isMobile ? RenderMobileComponent() : RenderDesktopComponent()}
        </div>
    )
}