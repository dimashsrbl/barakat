import React, { useState, useEffect } from 'react';
import api from '../../api';
import { useDispatch, useSelector } from 'react-redux';
import { getCurrentUserData, selectUser } from '../../store/features/apiSlice';
import styles from './supplierForm.module.scss';

const SupplierCreateCarrierPage = () => {
  const [name, setName] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const rawUser = useSelector(selectUser);
  const user = typeof rawUser === 'string' ? JSON.parse(rawUser) : rawUser;

  useEffect(() => {
    dispatch(getCurrentUserData());
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
      await api.post('/api/carrier/create', {
        name,
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('supplier_token')}` }
      });
      setSuccess('Перевозчик успешно добавлен!');
      setName('');
    } catch (e: any) {
      setError(e?.response?.data?.detail || 'Ошибка добавления перевозчика');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.formBg}>
      <form className={styles.formCard} onSubmit={handleSubmit}>
        <h2 className={styles.title}>Создать перевозчика</h2>
        <div className={styles.field}>
          <label>Название перевозчика:</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            className={styles.input}
            required
          />
        </div>
        <button type="submit" className={styles.button} disabled={loading}>{loading ? 'Добавление...' : 'Добавить перевозчика'}</button>
        {success && <div className={styles.success}>{success}</div>}
        {error && <div className={styles.error}>{error}</div>}
      </form>
    </div>
  );
};

export default SupplierCreateCarrierPage; 