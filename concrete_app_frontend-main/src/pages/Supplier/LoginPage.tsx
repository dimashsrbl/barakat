import React, { useState } from 'react';
import api from '../../api';
import styles from './supplierLogin.module.scss';

const SupplierLoginPage = ({ onLogin }: { onLogin: (user: any) => void }) => {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('http://localhost:8000/api/auth/login', { username: login, password });
      const token = res.data?.data?.access_token;
      // Получаем профиль пользователя
      const profile = await api.get('/api/users/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (profile.data?.data?.role?.name !== 'Поставщик') {
        setError('Доступ только для поставщиков!');
        setLoading(false);
        return;
      }
      localStorage.setItem('supplier_token', token);
      onLogin(profile.data.data);
    } catch (err) {
      setError('Неверный логин или пароль');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginBg}>
      <form className={styles.loginCard} onSubmit={handleSubmit}>
        <h2 className={styles.title}>Вход для поставщика</h2>
        <input
          type="text"
          placeholder="Логин"
          value={login}
          onChange={e => setLogin(e.target.value)}
          className={styles.input}
        />
        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className={styles.input}
        />
        <button type="submit" className={styles.button} disabled={loading}>
          {loading ? 'Вход...' : 'Войти'}
        </button>
        {error && <div className={styles.error}>{error}</div>}
      </form>
    </div>
  );
};

export default SupplierLoginPage; 