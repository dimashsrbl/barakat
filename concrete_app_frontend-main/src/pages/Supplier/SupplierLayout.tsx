import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';

const menu = [
  { text: 'Создать заявку', url: '/supplier/create-request' },
  { text: 'Создать машину', url: '/supplier/create-transport' },
  { text: 'Создать перевозчика', url: '/supplier/create-carrier' },
  { text: 'Накладные', url: '/supplier/invoices' },
];

const SupplierLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('supplier_token');
    navigate('/supplier/login');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <nav style={{ width: 220, background: '#f7f7f7', padding: 24, borderRight: '1px solid #eee' }}>
        <h3 style={{ marginBottom: 32 }}>Кабинет поставщика</h3>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {menu.map(item => (
            <li key={item.url} style={{ marginBottom: 18 }}>
              <Link
                to={item.url}
                style={{
                  color: location.pathname === item.url ? '#2F80ED' : '#222',
                  fontWeight: location.pathname === item.url ? 700 : 400,
                  textDecoration: 'none',
                  fontSize: 18,
                }}
              >
                {item.text}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <main style={{ flex: 1, padding: 32 }}>
        <button onClick={handleLogout} style={{ position: 'absolute', top: 16, right: 16, padding: 8, background: '#eee', border: '1px solid #ccc', borderRadius: 6, cursor: 'pointer' }}>
          Выйти
        </button>
        <Outlet />
      </main>
    </div>
  );
};

export default SupplierLayout; 