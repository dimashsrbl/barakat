import { BookIcon } from 'assets/icons/Book'
import { FilesIcon } from 'assets/icons/Files'
import { ListIcon } from 'assets/icons/List'
import { PeopleIcon } from 'assets/icons/PeopleIcon'
import { WeightJournalIcon } from 'assets/icons/WeightJournal'
import { ProfileBtn } from 'ui/ProfileBtn';
import { BurgerIcon } from 'assets/icons/BurgerIcon'
import { Link, useLocation } from 'react-router-dom'
import { useCallback, useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { getCurrentUserData } from 'store/features/apiSlice'
import { ApplicationPlanIcon } from 'assets/icons/ApplicationPlanIcon'

import s from './index.module.scss'

export const SideBar = () => {
    const url = useLocation();
    const [isSidebarVisible, setIsSidebarVisible] = useState(false);

    const dispatch = useDispatch();
  
    // data of our nav btns
    const navigateBtns = [
      { icon: <BookIcon />, text: 'Журнал заявок', url: '/main/application-log' },
      { icon: <ApplicationPlanIcon />, text: 'План заявок', url: '/main/application-plan' },
      { icon: <WeightJournalIcon />, text: 'Журнал отвесов', url: '/main/plumblog' },
      { icon: <PeopleIcon />, text: 'Пользователи', url: '/main/users' },
      { icon: <ListIcon />, text: 'Справочники', url: '/main/lists' },
      { icon: <FilesIcon />, text: 'Отчеты', url: '/main/reports' },
    ];

  
    const updateLocalStorage = (key: string, value: any) => {
        const serializedValue = typeof value === 'object' ? JSON.stringify(value) : value;
        localStorage.setItem(key, serializedValue);
    };
  
    const getUser = useCallback(async () => {
      const requestData = await dispatch(getCurrentUserData());
      updateLocalStorage('userfullname', requestData?.payload?.data?.fullname);
      updateLocalStorage('userrole', requestData?.payload?.data?.role?.name);
    }, [dispatch]);
  
    useEffect(() => {
      getUser();
    }, [getUser]);
    
    const handleMenuItemClick = () => {
      setIsSidebarVisible(false);
    };
  
    return (
      <div className={s.container}>
        <div>
          <button className={`${s.mobilenavbtn}  ${!isSidebarVisible ? '' : s.hidden}`} onClick={() => setIsSidebarVisible(!isSidebarVisible)}>
            <BurgerIcon />
          </button>
        </div>
        <div className={`${s.main} ${isSidebarVisible ? '' : s.hidden}`}>

          <div className={`${s.LogoBlock} fz14 tac cp ttuc fw700`}>
              Concrete.app
          </div>
          
          <hr />
    
          <div className={`${s.list} df fdc`}>
            {navigateBtns.map((item, index) => {
              return (
                  <Link
                    to={item.url}
                    className={`${s.item} df aic fz16`}
                    key={index}
                    onClick={handleMenuItemClick}
                    style={{ color: url.pathname.includes(item.url) ? '#2F80ED' : '', fontWeight: url.pathname.includes(item.url) ? '600' : '400' }}
                  >
                    {item.icon}
                      <span style={{ marginLeft: '8px' }}>{item.text}</span>
                  </Link>
              );
            })}
          </div>
            <ProfileBtn />
        </div>
      </div>
    );
  };