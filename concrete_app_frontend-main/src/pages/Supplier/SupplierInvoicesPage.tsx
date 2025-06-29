import React, { useEffect, useState } from 'react';
import api from '../../api';
import { useDispatch, useSelector } from 'react-redux';
import { getCurrentUserData, selectUser } from '../../store/features/apiSlice';
import styles from './supplierInvoices.module.scss';

const statusColors: Record<string, string> = {
  'Завершено': styles.statusDone,
  'В пути': styles.statusWay,
  'Ожидание лаборатории': styles.statusLab,
  'Сделан первый отвес': styles.statusFirst,
  'Не приехал': styles.statusMissed,
};

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

  const handleDownload = async (invoicePath: string) => {
    const weighingId = invoicePath.split('_')[1]?.split('.')[0];
    if (weighingId) {
      const token = localStorage.getItem('supplier_token');
      const response = await fetch(`http://localhost:8000/api/report/weighing_act/${weighingId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `act_${weighingId}.xlsx`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      } else {
        alert('Ошибка скачивания: ' + response.status);
      }
    } else {
      window.open(`http://localhost:8000/${invoicePath}`, '_blank');
    }
  };

  if (!user || user.role?.name !== 'Поставщик') {
    return <div className={styles.error}>Недостаточно прав для просмотра этой страницы.</div>;
  }

  return (
    <div className={styles.invoicesBg}>
      <div className={styles.invoicesCard}>
        <h2 className={styles.title}>Мои накладные</h2>
        {loading && <div className={styles.loading}>Загрузка...</div>}
        {error && <div className={styles.error}>{error}</div>}
        {!loading && !error && (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Номер заявки</th>
                  <th>Гос. номер</th>
                  <th>Материал</th>
                  <th>Дата</th>
                  <th>Статус</th>
                  <th>Накладная</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv: any) => (
                  <tr key={inv.id}>
                    <td>{inv.request_id}</td>
                    <td>{inv.plate_number}</td>
                    <td>{inv.material}</td>
                    <td>
                      {(() => {
                        const dateStr = inv.date || inv.created_at;
                        if (!dateStr) return '-';
                        const iso = dateStr.endsWith('Z') ? dateStr : dateStr + 'Z';
                        const d = new Date(iso);
                        return isNaN(d.getTime()) ? '-' : d.toLocaleString();
                      })()}
                    </td>
                    <td>
                      <span className={statusColors[inv.status] || styles.statusDefault}>{inv.status}</span>
                    </td>
                    <td>
                      {inv.invoice_path ? (
                        <button className={styles.downloadBtn} onClick={() => handleDownload(inv.invoice_path)}>Скачать</button>
                      ) : (
                        <span className={styles.noInvoice}>—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SupplierInvoicesPage; 