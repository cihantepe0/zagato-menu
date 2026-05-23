'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      if (password === 'zagato2024') {
        localStorage.setItem('zagato_admin_token', 'authenticated');
        router.push('/admin/dashboard');
      } else {
        setError('Geçersiz şifre. Lütfen tekrar deneyin.');
        setLoading(false);
      }
    }, 400);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at top, #1a0a08 0%, #080604 60%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px',
      fontFamily: "'Outfit', sans-serif",
    }}>
      <div style={{
        width: '100%', maxWidth: 380,
        background: 'linear-gradient(160deg, #13100c 0%, #0c0906 100%)',
        border: '1px solid rgba(201,168,76,0.2)',
        borderRadius: 20,
        padding: '48px 36px',
        boxShadow: '0 24px 80px rgba(0,0,0,0.6), 0 0 60px rgba(201,168,76,0.05)',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ position: 'relative', width: 200, height: 80, margin: '0 auto' }}>
            <Image src="/logo.png" alt="Zagato Palazzo" fill style={{ objectFit: 'contain' }} priority />
          </div>
          <div style={{
            width: 60, height: 1,
            background: 'linear-gradient(to right, transparent, rgba(201,168,76,0.4), transparent)',
            margin: '16px auto 0',
          }} />
        </div>

        <h1 style={{
          fontFamily: "'Cinzel', serif", fontSize: '1rem', fontWeight: 700,
          color: '#c9a84c', letterSpacing: 4, textAlign: 'center',
          marginBottom: 8, textTransform: 'uppercase',
        }}>Admin Paneli</h1>
        <p style={{
          fontSize: '0.78rem', color: 'rgba(240,234,216,0.45)',
          textAlign: 'center', marginBottom: 32, letterSpacing: 0.5,
        }}>Yönetim paneline giriş yapın</p>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{
              display: 'block', fontSize: '0.7rem', letterSpacing: 2,
              color: 'rgba(201,168,76,0.6)', textTransform: 'uppercase',
              marginBottom: 8, fontFamily: "'Outfit', sans-serif",
            }}>Şifre</label>
            <input
              type="password"
              id="admin-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{
                width: '100%', padding: '14px 16px',
                background: 'rgba(201,168,76,0.04)',
                border: '1px solid rgba(201,168,76,0.2)',
                borderRadius: 10, color: '#f0ead8',
                fontSize: '1rem', outline: 'none',
                transition: 'border-color 0.25s',
                fontFamily: "'Outfit', sans-serif",
              }}
              onFocus={e => e.target.style.borderColor = 'rgba(201,168,76,0.5)'}
              onBlur={e => e.target.style.borderColor = 'rgba(201,168,76,0.2)'}
            />
          </div>

          {error && (
            <div style={{
              padding: '10px 14px',
              background: 'rgba(200,50,50,0.1)',
              border: '1px solid rgba(200,50,50,0.3)',
              borderRadius: 8, color: '#ff6b6b',
              fontSize: '0.8rem',
            }}>{error}</div>
          )}

          <button
            type="submit"
            id="login-submit"
            disabled={loading}
            style={{
              padding: '15px',
              background: loading ? 'rgba(201,168,76,0.2)' : 'linear-gradient(135deg, #c9a84c, #a07820)',
              border: 'none', borderRadius: 10,
              color: loading ? 'rgba(201,168,76,0.5)' : '#080604',
              fontSize: '0.85rem', fontWeight: 700,
              letterSpacing: 2, textTransform: 'uppercase',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.25s',
              fontFamily: "'Cinzel', serif",
            }}
          >
            {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>
      </div>
    </div>
  );
}
