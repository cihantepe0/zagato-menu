'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

const iconMap = {
  starter: '🥗',
  salad: '🥙',
  main: '🥩',
  share: '🍽️',
  drink: '🍹',
  dessert: '🍮',
};

export default function AdminDashboard() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('zagato_admin_token');
    if (!token) { router.push('/admin'); return; }

    fetch('/api/menu')
      .then(res => res.json())
      .then(data => { setCategories(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('zagato_admin_token');
    router.push('/admin');
  };

  const sharedStyle = {
    fontFamily: "'Outfit', sans-serif",
    background: '#080604',
    minHeight: '100vh',
    color: '#f0ead8',
  };

  if (loading) return (
    <div style={{ ...sharedStyle, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontFamily: "'Cinzel', serif", color: '#c9a84c', letterSpacing: 4 }}>Yükleniyor...</div>
    </div>
  );

  return (
    <div style={sharedStyle}>
      {/* Header */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(8,6,4,0.95)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(201,168,76,0.2)',
        padding: '0 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: 64,
      }}>
        <div style={{ position: 'relative', width: 120, height: 48 }}>
          <Image src="/logo.png" alt="Zagato Palazzo" fill style={{ objectFit: 'contain' }} priority />
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Link href="/" target="_blank" style={{
            padding: '8px 16px',
            border: '1px solid rgba(201,168,76,0.25)',
            borderRadius: 8, color: '#c9a84c',
            fontSize: '0.78rem', letterSpacing: 1,
            textDecoration: 'none', fontFamily: "'Outfit', sans-serif",
          }}>
            Menüyü Gör ↗
          </Link>
          <button onClick={handleLogout} style={{
            padding: '8px 16px',
            background: 'rgba(200,50,50,0.15)',
            border: '1px solid rgba(200,50,50,0.3)',
            borderRadius: 8, color: '#ff6b6b',
            fontSize: '0.78rem', letterSpacing: 1,
            cursor: 'pointer', fontFamily: "'Outfit', sans-serif",
          }}>
            Çıkış Yap
          </button>
        </div>
      </header>

      {/* Page Title */}
      <div style={{ padding: '40px 24px 24px' }}>
        <h1 style={{
          fontFamily: "'Cinzel', serif", fontSize: '1.6rem', fontWeight: 700,
          color: '#c9a84c', letterSpacing: 3, marginBottom: 8,
        }}>Menü Yönetimi</h1>
        <p style={{ color: 'rgba(240,234,216,0.45)', fontSize: '0.85rem' }}>
          Bir kategoriye tıklayarak ürünleri ve fotoğrafları düzenleyebilirsiniz.
        </p>
      </div>

      {/* Category Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: 16, padding: '0 24px 40px',
      }}>
        {categories.map(cat => (
          <Link key={cat.id} href={`/admin/edit/${cat.id}`} style={{ textDecoration: 'none' }}>
            <div style={{
              background: 'linear-gradient(135deg, #13100c 0%, #0c0906 100%)',
              border: '1px solid rgba(201,168,76,0.15)',
              borderRadius: 16, padding: '24px',
              cursor: 'pointer', transition: 'all 0.25s',
              position: 'relative', overflow: 'hidden',
            }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'rgba(201,168,76,0.4)';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(201,168,76,0.08)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'rgba(201,168,76,0.15)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,168,76,0.06), transparent)', pointerEvents: 'none' }} />
              
              <div style={{ fontSize: '2rem', marginBottom: 12 }}>{iconMap[cat.icon] || '🍴'}</div>
              <h2 style={{
                fontFamily: "'Cinzel', serif", fontSize: '1.05rem', fontWeight: 700,
                color: '#e8cc7a', letterSpacing: 2, marginBottom: 4,
              }}>{cat.category}</h2>
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                marginTop: 16, paddingTop: 16,
                borderTop: '1px solid rgba(201,168,76,0.1)',
              }}>
                <span style={{ fontSize: '0.8rem', color: 'rgba(240,234,216,0.45)' }}>
                  {cat.items?.length || 0} ürün
                </span>
                <span style={{ fontSize: '0.8rem', color: '#c9a84c', letterSpacing: 1 }}>
                  Düzenle →
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
