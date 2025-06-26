import React, { useState, useEffect } from 'react';
import api from '../../api';
import { useDispatch, useSelector } from 'react-redux';
import { getCurrentUserData, selectUser } from '../../store/features/apiSlice';

const SupplierCreateCarrierPage = () => {
  const [name, setName] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const dispatch = useDispatch();
  const rawUser = useSelector(selectUser);
  const user = typeof rawUser === 'string' ? JSON.parse(rawUser) : rawUser;

  useEffect(() => {
    dispatch(getCurrentUserData());
  }, [dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!user || user.role?.name !== 'Поставщик') {
      setError('Недостаточно прав для выполнения этого запроса.');
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
    }
  };

  return (
    <div style={{ maxWidth: 400 }}>
      <h2>Создать перевозчика</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 16 }}>
          <label>Название перевозчика:</label><br />
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            style={{ width: '100%', padding: 8 }}
            required
          />
        </div>
        <button type="submit" style={{ width: '100%', padding: 10 }}>Добавить перевозчика</button>
      </form>
      {success && <div style={{ color: 'green', marginTop: 16 }}>{success}</div>}
      {error && <div style={{ color: 'red', marginTop: 16 }}>{error}</div>}
    </div>
  );
};

export default SupplierCreateCarrierPage; 