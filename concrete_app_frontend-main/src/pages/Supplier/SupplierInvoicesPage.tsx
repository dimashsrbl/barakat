import React, { useEffect, useState } from 'react';
import api from '../../api';
import { useDispatch, useSelector } from 'react-redux';
import { getCurrentUserData, selectUser } from '../../store/features/apiSlice';

const SupplierInvoicesPage = () => {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const dispatch = useDispatch();
  const rawUser = useSelector(selectUser);
  const user = typeof rawUser === 'string' ? JSON.parse(rawUser) : rawUser;

  useEffect(() => {
    dispatch(getCurrentUserData());
    api.get('/api/inert_request/my_invoices', {
      headers: { Authorization: `Bearer ${localStorage.getItem('supplier_token')}` }
    })
      .then(res => { setInvoices(res.data.data); setLoading(false); })
      .catch(() => { setError('Ошибка загрузки накладных'); setLoading(false); });
  }, [dispatch]);

  const handleDownload = (invoicePath: string) => {
    window.open(`/${invoicePath}`, '_blank');
  };

  if (!user || user.role?.name !== 'Поставщик') {
    return <div style={{ color: 'red' }}>Недостаточно прав для просмотра этой страницы.</div>;
  }

  return (
    <div>
      <h2>Мои накладные</h2>
      {loading && <div>Загрузка...</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {!loading && !error && (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 16 }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #ccc', padding: 8 }}>Номер заявки</th>
              <th style={{ border: '1px solid #ccc', padding: 8 }}>Гос. номер</th>
              <th style={{ border: '1px solid #ccc', padding: 8 }}>Материал</th>
              <th style={{ border: '1px solid #ccc', padding: 8 }}>Дата</th>
              <th style={{ border: '1px solid #ccc', padding: 8 }}>Статус</th>
              <th style={{ border: '1px solid #ccc', padding: 8 }}>Накладная</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv: any) => (
              <tr key={inv.id}>
                <td style={{ border: '1px solid #ccc', padding: 8 }}>{inv.request_id}</td>
                <td style={{ border: '1px solid #ccc', padding: 8 }}>{inv.plate_number}</td>
                <td style={{ border: '1px solid #ccc', padding: 8 }}>{inv.material}</td>
                <td style={{ border: '1px solid #ccc', padding: 8 }}>
                  {(() => {
                    const dateStr = inv.date || inv.created_at;
                    if (!dateStr) return '-';
                    // Добавляем Z, если нет смещения
                    const iso = dateStr.endsWith('Z') ? dateStr : dateStr + 'Z';
                    const d = new Date(iso);
                    return isNaN(d.getTime()) ? '-' : d.toLocaleString();
                  })()}
                </td>
                <td style={{ border: '1px solid #ccc', padding: 8 }}>{inv.status}</td>
                <td style={{ border: '1px solid #ccc', padding: 8 }}>
                  {inv.invoice_path ? (
                    <button onClick={() => handleDownload(inv.invoice_path)}>Скачать</button>
                  ) : (
                    '—'
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default SupplierInvoicesPage; 