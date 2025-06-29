import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import styles from './supplierLayout.module.scss';
import { ApplicationPlanIcon } from '../../assets/icons/ApplicationPlanIcon';
import { BriefcaseIcon } from '../../assets/icons/Briefcase';
import { PeopleIcon } from '../../assets/icons/PeopleIcon';
import { ABSIcon } from '../../assets/icons/ABSIcon';

const menu = [
  { text: 'Создать заявку', url: '/supplier/create-request', icon: <ApplicationPlanIcon /> },
  { text: 'Создать машину', url: '/supplier/create-transport', icon: <BriefcaseIcon /> },
  { text: 'Создать перевозчика', url: '/supplier/create-carrier', icon: <PeopleIcon /> },
  { text: 'Накладные', url: '/supplier/invoices', icon: <ABSIcon /> },
];

const SupplierLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('supplier_token');
    navigate('/supplier/login');
  };

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.logo}>Кабинет поставщика</div>
        <ul className={styles.menu}>
          {menu.map(item => (
            <li key={item.url} className={location.pathname === item.url ? styles.active : ''}>
              <Link to={item.url} className={styles.menuLink}>
                <span className={styles.icon}>{item.icon}</span>
                <span>{item.text}</span>
              </Link>
            </li>
          ))}
        </ul>
        <button className={styles.logout} onClick={handleLogout}>Выйти</button>
      </aside>
      <main className={styles.content}>
        <Outlet />
      </main>
    </div>
  );
};

export default SupplierLayout; 