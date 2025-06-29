import React, { useEffect, useState } from 'react';
import api from '../../api';
import { useDispatch, useSelector } from 'react-redux';
import { getCurrentUserData, selectUser } from '../../store/features/apiSlice';
import styles from './supplierForm.module.scss';

const SupplierCreateRequestPage = () => {
  const [transports, setTransports] = useState<{id: number, plate_number: string, carrier_id: number}[]>([]);
  const [materials, setMaterials] = useState([]);
  const [transportId, setTransportId] = useState('');
  const [materialId, setMaterialId] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const rawUser = useSelector(selectUser);
  const user = typeof rawUser === 'string' ? JSON.parse(rawUser) : rawUser;

  useEffect(() => {
    dispatch(getCurrentUserData());
    // Получить свои машины
    api.get('/api/transport/my', {
      headers: { Authorization: `Bearer ${localStorage.getItem('supplier_token')}` }
    })
      .then(res => setTransports(res.data.data))
      .catch(() => setError('Ошибка загрузки машин'));
    // Получить материалы
    api.get('/api/material?is_active=true&is_for_independent=true', {
      headers: { Authorization: `Bearer ${localStorage.getItem('supplier_token')}` }
    })
      .then(res => setMaterials(res.data.data))
      .catch(() => setError('Ошибка загрузки материалов'));
  }, [dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess(''); setLoading(true);
    if (!user || user.role?.name !== 'Поставщик') {
      setError('Недостаточно прав для выполнения этого запроса.');
      setLoading(false);
      return;
    }
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.formBg}>
      <form className={styles.formCard} onSubmit={handleSubmit}>
        <h2 className={styles.title}>Создать заявку</h2>
        <div className={styles.field}>
          <label>Машина:</label>
          <select value={transportId} onChange={e => setTransportId(e.target.value)} className={styles.input} required>
            <option value="">Выберите машину</option>
            {transports.map((t: any) => (
              <option key={t.id} value={t.id}>{t.plate_number}</option>
            ))}
          </select>
        </div>
        <div className={styles.field}>
          <label>Материал:</label>
          <select value={materialId} onChange={e => setMaterialId(e.target.value)} className={styles.input} required>
            <option value="">Выберите материал</option>
            {materials.map((m: any) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>
        <button type="submit" className={styles.button} disabled={loading}>{loading ? 'Создание...' : 'Создать заявку'}</button>
        {success && <div className={styles.success}>{success}</div>}
        {error && <div className={styles.error}>{error}</div>}
      </form>
    </div>
  );
};

export default SupplierCreateRequestPage; 