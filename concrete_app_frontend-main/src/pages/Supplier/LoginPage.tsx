import React, { useState } from 'react';
import api from '../../api';

const SupplierLoginPage = ({ onLogin }: { onLogin: (user: any) => void }) => {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await api.post('http://localhost:8000/api/auth/login', { username: login, password });
      const token = res.data?.data?.access_token;
      // Получаем профиль пользователя
      const profile = await api.get('/api/users/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (profile.data?.data?.role?.name !== 'Поставщик') {
        setError('Доступ только для поставщиков!');
        return;
      }
      localStorage.setItem('supplier_token', token);
      onLogin(profile.data.data);
    } catch (err) {
      setError('Неверный логин или пароль');
    }
  };

  return (
    <div style={{ maxWidth: 320, margin: '80px auto', padding: 24, border: '1px solid #eee', borderRadius: 8 }}>
      <h2>Вход для поставщика</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Логин"
          value={login}
          onChange={e => setLogin(e.target.value)}
          style={{ width: '100%', marginBottom: 12, padding: 8 }}
        />
        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={e => setPassword(e.target.value)}
          style={{ width: '100%', marginBottom: 12, padding: 8 }}
        />
        <button type="submit" style={{ width: '100%', padding: 8 }}>Войти</button>
      </form>
      {error && <div style={{ color: 'red', marginTop: 12 }}>{error}</div>}
    </div>
  );
};

export default SupplierLoginPage; 