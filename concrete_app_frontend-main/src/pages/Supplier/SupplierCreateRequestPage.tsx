import React, { useEffect, useState } from 'react';
import api from '../../api';

const SupplierCreateRequestPage = () => {
  const [transports, setTransports] = useState<{id: number, plate_number: string, carrier_id: number}[]>([]);
  const [materials, setMaterials] = useState([]);
  const [transportId, setTransportId] = useState('');
  const [materialId, setMaterialId] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Получить свои машины
    api.get('/api/transport/my', {
      headers: { Authorization: `Bearer ${localStorage.getItem('supplier_token')}` }
    })
      .then(res => setTransports(res.data.data))
      .catch(() => setError('Ошибка загрузки машин'));
    // Получить материалы
    api.get('/api/material?is_active=true', {
      headers: { Authorization: `Bearer ${localStorage.getItem('supplier_token')}` }
    })
      .then(res => setMaterials(res.data.data))
      .catch(() => setError('Ошибка загрузки материалов'));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');
    try {
      await api.post('/api/inert_request/create', {
        transport_id: Number(transportId),
        material_id: Number(materialId),
        carrier_id: transports.find((t: any) => t.id === Number(transportId))?.carrier_id,
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('supplier_token')}` }
      });
      setSuccess('Заявка успешно создана!');
      setTransportId(''); setMaterialId('');
    } catch (e: any) {
      setError(e?.response?.data?.detail || 'Ошибка создания заявки');
    }
  };

  return (
    <div style={{ maxWidth: 400 }}>
      <h2>Создать заявку</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 16 }}>
          <label>Машина:</label><br />
          <select value={transportId} onChange={e => setTransportId(e.target.value)} style={{ width: '100%', padding: 8 }} required>
            <option value="">Выберите машину</option>
            {transports.map((t: any) => (
              <option key={t.id} value={t.id}>{t.plate_number}</option>
            ))}
          </select>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label>Материал:</label><br />
          <select value={materialId} onChange={e => setMaterialId(e.target.value)} style={{ width: '100%', padding: 8 }} required>
            <option value="">Выберите материал</option>
            {materials.map((m: any) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>
        <button type="submit" style={{ width: '100%', padding: 10 }}>Создать заявку</button>
      </form>
      {success && <div style={{ color: 'green', marginTop: 16 }}>{success}</div>}
      {error && <div style={{ color: 'red', marginTop: 16 }}>{error}</div>}
    </div>
  );
};

export default SupplierCreateRequestPage; 