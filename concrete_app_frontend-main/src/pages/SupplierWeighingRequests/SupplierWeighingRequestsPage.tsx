import React, { useEffect, useState } from 'react';
import api from '../../api';

const SupplierWeighingRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/api/inert_request/all_with_status')
      .then(res => {
        setRequests(res.data);
        setLoading(false);
      })
      .catch(err => {
        setError('Ошибка загрузки заявок');
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <h2>Заявки на отвесы от поставщиков</h2>
      {loading && <div>Загрузка...</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {!loading && !error && (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 16 }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #ccc', padding: 8 }}>Гос. номер</th>
              <th style={{ border: '1px solid #ccc', padding: 8 }}>Перевозчик</th>
              <th style={{ border: '1px solid #ccc', padding: 8 }}>Материал</th>
              <th style={{ border: '1px solid #ccc', padding: 8 }}>Дата создания</th>
              <th style={{ border: '1px solid #ccc', padding: 8 }}>Статус</th>
              <th style={{ border: '1px solid #ccc', padding: 8 }}>Компания</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((req: any) => (
              <tr key={req.id}>
                <td style={{ border: '1px solid #ccc', padding: 8 }}>{req.plate_number}</td>
                <td style={{ border: '1px solid #ccc', padding: 8 }}>{req.carrier}</td>
                <td style={{ border: '1px solid #ccc', padding: 8 }}>{req.material}</td>
                <td style={{ border: '1px solid #ccc', padding: 8 }}>{new Date(req.created_at).toLocaleString()}</td>
                <td style={{ border: '1px solid #ccc', padding: 8 }}>{req.status}</td>
                <td style={{ border: '1px solid #ccc', padding: 8 }}>{req.company || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default SupplierWeighingRequestsPage; 