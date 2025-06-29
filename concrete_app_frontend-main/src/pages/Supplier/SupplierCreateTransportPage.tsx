import React, { useEffect, useState } from 'react';
import api from '../../api';
import { useDispatch, useSelector } from 'react-redux';
import { getCurrentUserData, selectUser } from '../../store/features/apiSlice';
import styles from './supplierForm.module.scss';

const SupplierCreateTransportPage = () => {
  const [carriers, setCarriers] = useState<{id: number, name: string}[]>([]);
  const [plateNumber, setPlateNumber] = useState('');
  const [carrierId, setCarrierId] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const rawUser = useSelector(selectUser);
  const user = typeof rawUser === 'string' ? JSON.parse(rawUser) : rawUser;

  useEffect(() => {
    dispatch(getCurrentUserData());
    // Получить своих перевозчиков
    api.get('/api/carrier/my', {
      headers: { Authorization: `Bearer ${localStorage.getItem('supplier_token')}` }
    })
      .then(res => setCarriers(res.data.data))
      .catch(() => setError('Ошибка загрузки перевозчиков'));
  }, [dispatch]);

  useEffect(() => {
    console.log('user:', user);
  }, [user]);

  if (!user || !user.role || !user.role.name) {
    return <div>Загрузка данных пользователя...</div>;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess(''); setLoading(true);
    if (!user || user.role?.name !== 'Поставщик') {
      setError('Недостаточно прав для выполнения этого запроса.');
      setLoading(false);
      return;
    }
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.formBg}>
      <form className={styles.formCard} onSubmit={handleSubmit}>
        <h2 className={styles.title}>Создать машину</h2>
        <div className={styles.field}>
          <label>Гос. номер:</label>
          <input
            type="text"
            value={plateNumber}
            onChange={e => setPlateNumber(e.target.value)}
            className={styles.input}
            required
          />
        </div>
        <div className={styles.field}>
          <label>Перевозчик:</label>
          <select value={carrierId} onChange={e => setCarrierId(e.target.value)} className={styles.input} required>
            <option value="">Выберите перевозчика</option>
            {carriers.map((c: any) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <button type="submit" className={styles.button} disabled={loading || !user || user.role?.name !== 'Поставщик'}>
          {loading ? 'Добавление...' : 'Добавить машину'}
        </button>
        {success && <div className={styles.success}>{success}</div>}
        {error && <div className={styles.error}>{error}</div>}
      </form>
    </div>
  );
};

export default SupplierCreateTransportPage; 