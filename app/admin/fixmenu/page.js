'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const S = {
  page: { fontFamily: "'Outfit', sans-serif", background: '#080604', minHeight: '100vh', color: '#f0ead8' },
  header: {
    position: 'sticky', top: 0, zIndex: 50,
    background: 'rgba(8,6,4,0.97)', backdropFilter: 'blur(12px)',
    borderBottom: '1px solid rgba(201,168,76,0.2)',
    padding: '0 20px', display: 'flex', alignItems: 'center',
    justifyContent: 'space-between', height: 60,
  },
  card: {
    background: 'linear-gradient(135deg, #13100c 0%, #0c0906 100%)',
    border: '1px solid rgba(201,168,76,0.15)',
    borderRadius: 14, padding: 20, marginBottom: 14,
  },
  input: {
    width: '100%', padding: '10px 14px',
    background: 'rgba(201,168,76,0.04)',
    border: '1px solid rgba(201,168,76,0.18)',
    borderRadius: 8, color: '#f0ead8',
    fontSize: '0.88rem', outline: 'none',
    fontFamily: "'Outfit', sans-serif",
  },
  label: {
    display: 'block', fontSize: '0.65rem', letterSpacing: 2,
    color: 'rgba(201,168,76,0.55)', textTransform: 'uppercase', marginBottom: 6,
  },
  btn: (variant = 'primary') => ({
    padding: '9px 18px', borderRadius: 8, cursor: 'pointer',
    fontSize: '0.8rem', fontWeight: 600, letterSpacing: 0.5,
    fontFamily: "'Outfit', sans-serif",
    background: variant === 'primary'
      ? 'linear-gradient(135deg, #c9a84c, #a07820)'
      : variant === 'danger'
      ? 'rgba(200,50,50,0.15)'
      : 'rgba(201,168,76,0.1)',
    border: variant === 'primary'
      ? 'none'
      : variant === 'danger'
      ? '1px solid rgba(200,50,50,0.3)'
      : '1px solid rgba(201,168,76,0.3)',
    color: variant === 'primary' ? '#080604' : variant === 'danger' ? '#ff6b6b' : '#c9a84c',
    transition: 'all 0.2s',
  }),
};

export default function FixMenuAdmin() {
  const router = useRouter();
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('zagato_admin_token');
    if (!token) { router.push('/admin'); return; }

    fetch('/api/fixmenu')
      .then(r => r.json())
      .then(d => { setSections(d.sections || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [router]);

  const flash = (m) => { setMsg(m); setTimeout(() => setMsg(''), 3000); };

  const updateSection = (si, field, val) =>
    setSections(s => s.map((sec, i) => i === si ? { ...sec, [field]: val } : sec));

  const updateItem = (si, ii, val) =>
    setSections(s => s.map((sec, i) => i !== si ? sec : {
      ...sec, items: sec.items.map((it, j) => j === ii ? val : it)
    }));

  const addItem = (si) =>
    setSections(s => s.map((sec, i) => i !== si ? sec : { ...sec, items: [...sec.items, ''] }));

  const removeItem = (si, ii) =>
    setSections(s => s.map((sec, i) => i !== si ? sec : {
      ...sec, items: sec.items.filter((_, j) => j !== ii)
    }));

  const addSection = () =>
    setSections(s => [...s, { label: '', label_en: '', items: [''] }]);

  const removeSection = (si) => {
    if (!confirm('Bu bölümü silmek istiyor musunuz?')) return;
    setSections(s => s.filter((_, i) => i !== si));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/fixmenu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sections }),
      });
      const result = await res.json();
      flash(result.success ? '✓ Kaydedildi' : '✗ Hata oluştu');
    } catch { flash('✗ Bağlantı hatası'); }
    setSaving(false);
  };

  if (loading) return (
    <div style={{ ...S.page, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontFamily: "'Cinzel', serif", color: '#c9a84c', letterSpacing: 4 }}>Yükleniyor...</div>
    </div>
  );

  return (
    <div style={S.page}>
      {/* Header */}
      <header style={S.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/admin/dashboard" style={{
            width: 34, height: 34, border: '1px solid rgba(201,168,76,0.2)',
            borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#c9a84c', textDecoration: 'none', fontSize: '1rem',
          }}>←</Link>
          <div>
            <div style={{ fontFamily: "'Cinzel', serif", fontSize: '0.88rem', color: '#c9a84c', letterSpacing: 2 }}>
              Fix Menü Yönetimi
            </div>
            <div style={{ fontSize: '0.68rem', color: 'rgba(240,234,216,0.35)' }}>{sections.length} bölüm</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {msg && (
            <span style={{
              fontSize: '0.78rem', padding: '5px 10px', borderRadius: 6,
              color: msg.startsWith('✓') ? '#4ade80' : '#ff6b6b',
              background: msg.startsWith('✓') ? 'rgba(74,222,128,0.1)' : 'rgba(255,107,107,0.1)',
              border: `1px solid ${msg.startsWith('✓') ? 'rgba(74,222,128,0.3)' : 'rgba(255,107,107,0.3)'}`,
            }}>{msg}</span>
          )}
          <button onClick={handleSave} disabled={saving} style={S.btn('primary')}>
            {saving ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
        </div>
      </header>

      {/* Content */}
      <div style={{ padding: '28px 20px 100px', maxWidth: 720, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: '1.3rem', color: '#c9a84c', letterSpacing: 3 }}>
              Fix Menü
            </h1>
            <p style={{ color: 'rgba(240,234,216,0.4)', fontSize: '0.8rem', marginTop: 4 }}>
              Bölümleri ve içerikleri düzenleyin.
            </p>
          </div>
          <button onClick={addSection} style={S.btn('secondary')}>+ Bölüm Ekle</button>
        </div>

        {sections.map((section, si) => (
          <div key={si} style={S.card}>
            {/* Section header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ fontFamily: "'Cinzel', serif", fontSize: '0.85rem', color: '#c9a84c', letterSpacing: 2 }}>
                Bölüm {si + 1}
              </div>
              <button onClick={() => removeSection(si)} style={S.btn('danger')}>Sil</button>
            </div>

            {/* Section labels */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div>
                <label style={S.label}>Bölüm Adı (TR)</label>
                <input
                  value={section.label}
                  onChange={e => updateSection(si, 'label', e.target.value)}
                  placeholder="ör. Ara Sıcak"
                  style={S.input}
                  onFocus={e => e.target.style.borderColor = 'rgba(201,168,76,0.5)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(201,168,76,0.18)'}
                />
              </div>
              <div>
                <label style={S.label}>Bölüm Adı (EN)</label>
                <input
                  value={section.label_en}
                  onChange={e => updateSection(si, 'label_en', e.target.value)}
                  placeholder="ör. Hot Starter"
                  style={S.input}
                  onFocus={e => e.target.style.borderColor = 'rgba(201,168,76,0.5)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(201,168,76,0.18)'}
                />
              </div>
            </div>

            {/* Items */}
            <label style={S.label}>İçerikler</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {section.items.map((item, ii) => (
                <div key={ii} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input
                    value={item}
                    onChange={e => updateItem(si, ii, e.target.value)}
                    placeholder="ör. Humus"
                    style={{ ...S.input, flex: 1 }}
                    onFocus={e => e.target.style.borderColor = 'rgba(201,168,76,0.5)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(201,168,76,0.18)'}
                  />
                  <button
                    onClick={() => removeItem(si, ii)}
                    style={{
                      width: 32, height: 32, flexShrink: 0,
                      border: '1px solid rgba(200,50,50,0.25)',
                      borderRadius: 7, background: 'transparent',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="#ff6b6b" strokeWidth="2">
                      <path d="M18 6L6 18M6 6l12 12"/>
                    </svg>
                  </button>
                </div>
              ))}
              <button
                onClick={() => addItem(si)}
                style={{
                  padding: '8px', borderRadius: 8, cursor: 'pointer',
                  border: '1px dashed rgba(201,168,76,0.25)',
                  background: 'transparent', color: 'rgba(201,168,76,0.5)',
                  fontSize: '0.78rem', transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(201,168,76,0.5)'; e.currentTarget.style.color = '#c9a84c'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(201,168,76,0.25)'; e.currentTarget.style.color = 'rgba(201,168,76,0.5)'; }}
              >
                + İçerik Ekle
              </button>
            </div>
          </div>
        ))}

        {sections.length === 0 && (
          <div style={{
            textAlign: 'center', padding: '60px 20px',
            border: '1px dashed rgba(201,168,76,0.2)', borderRadius: 14,
            color: 'rgba(240,234,216,0.3)',
          }}>
            Henüz bölüm yok.<br />
            <button onClick={addSection} style={{ ...S.btn('secondary'), marginTop: 16 }}>
              + İlk Bölümü Ekle
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
