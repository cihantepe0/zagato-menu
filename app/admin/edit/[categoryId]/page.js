'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

export default function EditCategory() {
  const { categoryId } = useParams();
  const router = useRouter();

  const [allData, setAllData] = useState([]);
  const [category, setCategory] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [uploadingIndex, setUploadingIndex] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('zagato_admin_token');
    if (!token) { router.push('/admin'); return; }

    fetch('/api/menu')
      .then(r => r.json())
      .then(data => {
        setAllData(data);
        const cat = data.find(c => c.id === categoryId);
        if (cat) {
          setCategory(cat);
          setItems(JSON.parse(JSON.stringify(cat.items || [])));
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [categoryId, router]);

  // Update a single field in an item
  const updateItem = (index, field, value) => {
    setItems(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  // Handle image file upload
  const handleImageUpload = async (index, file) => {
    if (!file) return;
    setUploadingIndex(index);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('categoryId', categoryId);
      formData.append('itemIndex', index);

      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const result = await res.json();

      if (result.url) {
        updateItem(index, 'img', result.url);
        setSaveMsg('✓ Fotoğraf yüklendi');
        setTimeout(() => setSaveMsg(''), 2500);
      } else {
        setSaveMsg('✗ Yükleme başarısız');
        setTimeout(() => setSaveMsg(''), 2500);
      }
    } catch {
      setSaveMsg('✗ Yükleme hatası');
      setTimeout(() => setSaveMsg(''), 2500);
    }
    setUploadingIndex(null);
  };

  // Remove image from item
  const removeImage = (index) => {
    updateItem(index, 'img', null);
  };

  // Save all changes
  const handleSave = async () => {
    setSaving(true);
    try {
      const newAllData = allData.map(cat =>
        cat.id === categoryId ? { ...cat, items } : cat
      );
      const res = await fetch('/api/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAllData),
      });
      const result = await res.json();
      if (result.success) {
        setAllData(newAllData);
        setSaveMsg('✓ Değişiklikler kaydedildi');
      } else {
        setSaveMsg('✗ Kaydetme başarısız');
      }
    } catch {
      setSaveMsg('✗ Bağlantı hatası');
    }
    setSaving(false);
    setTimeout(() => setSaveMsg(''), 3000);
  };

  const s = {
    page: {
      fontFamily: "'Outfit', sans-serif",
      background: '#080604',
      minHeight: '100vh',
      color: '#f0ead8',
    },
    header: {
      position: 'sticky', top: 0, zIndex: 50,
      background: 'rgba(8,6,4,0.95)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(201,168,76,0.2)',
      padding: '0 24px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      height: 64, gap: 12,
    },
    saveBtn: {
      padding: '10px 20px',
      background: saving ? 'rgba(201,168,76,0.2)' : 'linear-gradient(135deg, #c9a84c, #a07820)',
      border: 'none', borderRadius: 8,
      color: saving ? 'rgba(8,6,4,0.5)' : '#080604',
      fontSize: '0.82rem', fontWeight: 700, letterSpacing: 1,
      cursor: saving ? 'not-allowed' : 'pointer',
      fontFamily: "'Cinzel', serif",
      transition: 'all 0.25s',
    },
    card: {
      background: 'linear-gradient(135deg, #13100c 0%, #0c0906 100%)',
      border: '1px solid rgba(201,168,76,0.15)',
      borderRadius: 16, padding: 24, marginBottom: 16,
    },
    label: {
      display: 'block', fontSize: '0.68rem', letterSpacing: 2,
      color: 'rgba(201,168,76,0.55)', textTransform: 'uppercase',
      marginBottom: 6,
    },
    input: {
      width: '100%', padding: '11px 14px',
      background: 'rgba(201,168,76,0.04)',
      border: '1px solid rgba(201,168,76,0.18)',
      borderRadius: 8, color: '#f0ead8',
      fontSize: '0.9rem', outline: 'none',
      fontFamily: "'Outfit', sans-serif",
      transition: 'border-color 0.2s',
    },
  };

  if (loading) return (
    <div style={{ ...s.page, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontFamily: "'Cinzel', serif", color: '#c9a84c', letterSpacing: 4 }}>Yükleniyor...</div>
    </div>
  );

  if (!category) return (
    <div style={{ ...s.page, padding: 40 }}>
      <p style={{ color: '#ff6b6b' }}>Kategori bulunamadı.</p>
      <Link href="/admin/dashboard" style={{ color: '#c9a84c' }}>← Geri Dön</Link>
    </div>
  );

  return (
    <div style={s.page}>
      {/* Header */}
      <header style={s.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link href="/admin/dashboard" style={{
            width: 36, height: 36,
            border: '1px solid rgba(201,168,76,0.2)',
            borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#c9a84c', textDecoration: 'none', fontSize: '1rem',
          }}>←</Link>
          <div>
            <div style={{ fontFamily: "'Cinzel', serif", fontSize: '0.85rem', color: '#c9a84c', letterSpacing: 2 }}>
              {category.category}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'rgba(240,234,216,0.35)' }}>
              {items.length} ürün
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {saveMsg && (
            <span style={{
              fontSize: '0.8rem',
              color: saveMsg.startsWith('✓') ? '#4ade80' : '#ff6b6b',
              padding: '6px 12px',
              background: saveMsg.startsWith('✓') ? 'rgba(74,222,128,0.1)' : 'rgba(255,107,107,0.1)',
              borderRadius: 6, border: `1px solid ${saveMsg.startsWith('✓') ? 'rgba(74,222,128,0.3)' : 'rgba(255,107,107,0.3)'}`,
            }}>{saveMsg}</span>
          )}
          <button onClick={handleSave} disabled={saving} style={s.saveBtn}>
            {saving ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
        </div>
      </header>

      {/* Items */}
      <div style={{ padding: '32px 24px 60px', maxWidth: 800, margin: '0 auto' }}>
        <h1 style={{
          fontFamily: "'Cinzel', serif", fontSize: '1.4rem', fontWeight: 700,
          color: '#c9a84c', letterSpacing: 3, marginBottom: 8,
        }}>{category.category}</h1>
        <p style={{ color: 'rgba(240,234,216,0.4)', fontSize: '0.82rem', marginBottom: 32 }}>
          Ürün adı, açıklama, fiyat ve fotoğrafları düzenleyin.
        </p>

        {items.map((item, index) => (
          <ItemEditor
            key={index}
            item={item}
            index={index}
            categoryId={categoryId}
            uploadingIndex={uploadingIndex}
            onUpdate={(field, value) => updateItem(index, field, value)}
            onImageUpload={(file) => handleImageUpload(index, file)}
            onRemoveImage={() => removeImage(index)}
            styles={s}
          />
        ))}
      </div>
    </div>
  );
}

function ItemEditor({ item, index, categoryId, uploadingIndex, onUpdate, onImageUpload, onRemoveImage, styles: s }) {
  const fileInputRef = useRef(null);
  const isUploading = uploadingIndex === index;

  return (
    <div style={s.card}>
      {/* Item number */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20,
        paddingBottom: 16, borderBottom: '1px solid rgba(201,168,76,0.1)',
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: '50%',
          background: 'rgba(201,168,76,0.1)',
          border: '1px solid rgba(201,168,76,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: "'Cinzel', serif", fontSize: '0.8rem',
          color: '#c9a84c', fontWeight: 700, flexShrink: 0,
        }}>{index + 1}</div>
        <h3 style={{
          fontFamily: "'Cinzel', serif", fontSize: '0.95rem',
          color: '#e8cc7a', letterSpacing: 1, fontWeight: 700,
        }}>{item.name}</h3>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* Name */}
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={s.label}>Ürün Adı</label>
          <input
            value={item.name || ''}
            onChange={e => onUpdate('name', e.target.value)}
            style={s.input}
            onFocus={e => e.target.style.borderColor = 'rgba(201,168,76,0.45)'}
            onBlur={e => e.target.style.borderColor = 'rgba(201,168,76,0.18)'}
          />
        </div>

        {/* Description */}
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={s.label}>Açıklama</label>
          <textarea
            value={item.desc || ''}
            onChange={e => onUpdate('desc', e.target.value)}
            rows={2}
            style={{ ...s.input, resize: 'vertical', minHeight: 60 }}
            onFocus={e => e.target.style.borderColor = 'rgba(201,168,76,0.45)'}
            onBlur={e => e.target.style.borderColor = 'rgba(201,168,76,0.18)'}
          />
        </div>

        {/* Price */}
        <div>
          <label style={s.label}>Fiyat (₺)</label>
          <input
            value={item.price || ''}
            onChange={e => onUpdate('price', e.target.value)}
            style={s.input}
            placeholder="850"
            onFocus={e => e.target.style.borderColor = 'rgba(201,168,76,0.45)'}
            onBlur={e => e.target.style.borderColor = 'rgba(201,168,76,0.18)'}
          />
        </div>

        {/* Photo upload */}
        <div>
          <label style={s.label}>Fotoğraf</label>

          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={e => {
              if (e.target.files?.[0]) onImageUpload(e.target.files[0]);
              e.target.value = '';
            }}
          />

          {item.img ? (
            /* Preview + remove */
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <div style={{
                width: 72, height: 72, borderRadius: 8,
                border: '1px solid rgba(201,168,76,0.3)',
                overflow: 'hidden', flexShrink: 0,
              }}>
                <img src={item.img} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    padding: '8px 12px', borderRadius: 7,
                    border: '1px solid rgba(201,168,76,0.25)',
                    background: 'transparent', color: '#c9a84c',
                    fontSize: '0.75rem', cursor: 'pointer', letterSpacing: 0.5,
                  }}
                >Değiştir</button>
                <button
                  onClick={onRemoveImage}
                  style={{
                    padding: '8px 12px', borderRadius: 7,
                    border: '1px solid rgba(200,50,50,0.3)',
                    background: 'transparent', color: '#ff6b6b',
                    fontSize: '0.75rem', cursor: 'pointer',
                  }}
                >Kaldır</button>
              </div>
            </div>
          ) : (
            /* Upload area */
            <div
              onClick={() => !isUploading && fileInputRef.current?.click()}
              style={{
                height: 72, border: '1px dashed rgba(201,168,76,0.25)',
                borderRadius: 8,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: 4,
                cursor: isUploading ? 'wait' : 'pointer',
                transition: 'border-color 0.2s',
                background: isUploading ? 'rgba(201,168,76,0.05)' : 'transparent',
              }}
              onMouseEnter={e => !isUploading && (e.currentTarget.style.borderColor = 'rgba(201,168,76,0.5)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(201,168,76,0.25)')}
            >
              {isUploading ? (
                <div style={{ fontSize: '0.75rem', color: '#c9a84c', letterSpacing: 1 }}>Yükleniyor...</div>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke="rgba(201,168,76,0.4)" strokeWidth="1.5">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
                  </svg>
                  <span style={{ fontSize: '0.7rem', color: 'rgba(201,168,76,0.4)', letterSpacing: 0.5 }}>
                    Fotoğraf yükle
                  </span>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
