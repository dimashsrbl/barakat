import React, { useEffect, useState } from 'react';
import api from '../../api';

const SupplierCreateTransportPage = () => {
  const [carriers, setCarriers] = useState<{id: number, name: string}[]>([]);
  const [plateNumber, setPlateNumber] = useState('');
  const [carrierId, setCarrierId] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Получить своих перевозчиков
    api.get('/api/carrier/my', {
      headers: { Authorization: `Bearer ${localStorage.getItem('supplier_token')}` }
    })
      .then(res => setCarriers(res.data.data))
      .catch(() => setError('Ошибка загрузки перевозчиков'));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');
    try {
      await api.post('/api/transport/create', {
        plate_number: plateNumber,
        carrier_id: Number(carrierId),
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('supplier_token')}` }
      });
      setSuccess('Машина успешно добавлена!');
      setPlateNumber(''); setCarrierId('');
    } catch (e: any) {
      setError(e?.response?.data?.detail || 'Ошибка добавления машины');
    }
  };

  return (
    <div style={{ maxWidth: 400 }}>
      <h2>Создать машину</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 16 }}>
          <label>Гос. номер:</label><br />
          <input
            type="text"
            value={plateNumber}
            onChange={e => setPlateNumber(e.target.value)}
            style={{ width: '100%', padding: 8 }}
            required
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label>Перевозчик:</label><br />
          <select value={carrierId} onChange={e => setCarrierId(e.target.value)} style={{ width: '100%', padding: 8 }} required>
            <option value="">Выберите перевозчика</option>
            {carriers.map((c: any) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <button type="submit" style={{ width: '100%', padding: 10 }}>Добавить машину</button>
      </form>
      {success && <div style={{ color: 'green', marginTop: 16 }}>{success}</div>}
      {error && <div style={{ color: 'red', marginTop: 16 }}>{error}</div>}
    </div>
  );
};

export default SupplierCreateTransportPage; 