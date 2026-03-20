'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './admin.module.css';

import Image from 'next/image';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = (e) => {
    e.preventDefault();
    // Simple password check for demonstration
    if (password === 'shamrock2024') {
      localStorage.setItem('admin_token', 'authenticated');
      router.push('/admin/dashboard');
    } else {
      setError('Geçersiz şifre. Lütfen tekrar deneyin.');
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        <div className={styles.adminLogoWrapper}>
          <Image src="/logo.png" alt="SHAMROCK" width={200} height={53} priority className={styles.adminLogo} />
        </div>
        <h1 className={styles.loginTitle}>ADMIN</h1>
        <p className={styles.loginSubtitle}>Yönetim Paneline Giriş Yapın</p>
        
        <form onSubmit={handleLogin} className={styles.loginForm}>
          <div className={styles.inputGroup}>
            <label htmlFor="password">Şifre</label>
            <input 
              type="password" 
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          
          {error && <p className={styles.errorMessage}>{error}</p>}
          
          <button type="submit" className={styles.loginButton}>Giriş Yap</button>
        </form>
      </div>
    </div>
  );
}
