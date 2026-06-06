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

    // Fetch all categories (lightweight, no images) for save context
    // AND fetch the specific category with images for editing
    Promise.all([
      fetch('/api/menu').then(r => r.json()),
      fetch(`/api/menu/${categoryId}`).then(r => r.json()),
    ])
      .then(([allData, catWithImages]) => {
        setAllData(allData);
        const cat = allData.find(c => c.id === categoryId);
        if (cat) {
          setCategory(cat);
          // Use catWithImages.items (has img field) if available
          const fullItems = catWithImages?.items || cat.items || [];
          setItems(JSON.parse(JSON.stringify(fullItems)));
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [categoryId, router]);

  const updateItem = (index, field, value) => {
    setItems(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const addNewItem = () => {
    setItems(prev => [...prev, { name: '', desc: '', price: '', img: null }]);
    // Scroll to bottom after adding
    setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }), 100);
  };

  const removeItem = (index) => {
    if (!confirm('Bu ürünü silmek istediğinizden emin misiniz?')) return;
    setItems(prev => prev.filter((_, i) => i !== index));
  };

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

  const removeImage = (index) => {
    updateItem(index, 'img', null);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Fetch full data (with images) first, then merge our edited items
      const fullData = await fetch('/api/menu?full=1').then(r => r.json()).catch(() => allData);
      const saveData = Array.isArray(fullData) ? fullData : allData;
      const newAllData = saveData.map(cat =>
        cat.id === categoryId ? { ...cat, items } : cat
      );
      const res = await fetch('/api/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAllData),
      });
      const result = await res.json();
      if (result.success) {
        setAllData(newAllData.map(cat => ({ ...cat, items: cat.items.map(({ img, ...rest }) => rest) })));
        setSaveMsg('✓ Kaydedildi');
      } else {
        setSaveMsg('✗ Kaydetme başarısız');
      }
    } catch {
      setSaveMsg('✗ Bağlantı hatası');
    }
    setSaving(false);
    setTimeout(() => setSaveMsg(''), 3000);
  };

  // ── Styles ──
  const S = {
    page: { fontFamily: "'Outfit', sans-serif", background: '#080604', minHeight: '100vh', color: '#f0ead8' },
    header: {
      position: 'sticky', top: 0, zIndex: 50,
      background: 'rgba(8,6,4,0.97)', backdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(201,168,76,0.2)',
      padding: '0 20px', display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', height: 60, gap: 12,
    },
    saveBtn: (disabled) => ({
      padding: '9px 20px',
      background: disabled ? 'rgba(201,168,76,0.2)' : 'linear-gradient(135deg, #c9a84c, #a07820)',
      border: 'none', borderRadius: 8,
      color: disabled ? 'rgba(8,6,4,0.4)' : '#080604',
      fontSize: '0.82rem', fontWeight: 700, letterSpacing: 1,
      cursor: disabled ? 'not-allowed' : 'pointer',
      fontFamily: "'Cinzel', serif", transition: 'all 0.25s',
    }),
    card: {
      background: 'linear-gradient(135deg, #13100c 0%, #0c0906 100%)',
      border: '1px solid rgba(201,168,76,0.15)',
      borderRadius: 14, padding: 20, marginBottom: 14,
    },
    label: {
      display: 'block', fontSize: '0.68rem', letterSpacing: 2,
      color: 'rgba(201,168,76,0.55)', textTransform: 'uppercase', marginBottom: 6,
    },
    input: {
      width: '100%', padding: '11px 14px',
      background: 'rgba(201,168,76,0.04)',
      border: '1px solid rgba(201,168,76,0.18)',
      borderRadius: 8, color: '#f0ead8',
      fontSize: '0.9rem', outline: 'none',
      fontFamily: "'Outfit', sans-serif", transition: 'border-color 0.2s',
    },
  };

  if (loading) return (
    <div style={{ ...S.page, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontFamily: "'Cinzel', serif", color: '#c9a84c', letterSpacing: 4 }}>Yükleniyor...</div>
    </div>
  );

  if (!category) return (
    <div style={{ ...S.page, padding: 40 }}>
      <p style={{ color: '#ff6b6b' }}>Kategori bulunamadı.</p>
      <Link href="/admin/dashboard" style={{ color: '#c9a84c' }}>← Geri Dön</Link>
    </div>
  );

  return (
    <div style={S.page}>
      {/* Header */}
      <header style={S.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/admin/dashboard" style={{
            width: 34, height: 34,
            border: '1px solid rgba(201,168,76,0.2)',
            borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#c9a84c', textDecoration: 'none', fontSize: '1rem',
          }}>←</Link>
          <div>
            <div style={{ fontFamily: "'Cinzel', serif", fontSize: '0.85rem', color: '#c9a84c', letterSpacing: 2 }}>
              {category.category}
            </div>
            <div style={{ fontSize: '0.68rem', color: 'rgba(240,234,216,0.35)' }}>
              {items.length} ürün
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {saveMsg && (
            <span style={{
              fontSize: '0.78rem',
              color: saveMsg.startsWith('✓') ? '#4ade80' : '#ff6b6b',
              padding: '5px 10px',
              background: saveMsg.startsWith('✓') ? 'rgba(74,222,128,0.1)' : 'rgba(255,107,107,0.1)',
              borderRadius: 6,
              border: `1px solid ${saveMsg.startsWith('✓') ? 'rgba(74,222,128,0.3)' : 'rgba(255,107,107,0.3)'}`,
            }}>{saveMsg}</span>
          )}
          <button onClick={handleSave} disabled={saving} style={S.saveBtn(saving)}>
            {saving ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
        </div>
      </header>

      {/* Content */}
      <div style={{ padding: '28px 20px 100px', maxWidth: 780, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: '1.3rem', fontWeight: 700, color: '#c9a84c', letterSpacing: 3, marginBottom: 4 }}>
              {category.category}
            </h1>
            <p style={{ color: 'rgba(240,234,216,0.4)', fontSize: '0.8rem' }}>
              Ürün adı, açıklama, fiyat ve fotoğraf düzenleyin.
            </p>
          </div>
          <button
            onClick={addNewItem}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 18px',
              border: '1px solid rgba(201,168,76,0.35)',
              borderRadius: 10,
              background: 'rgba(201,168,76,0.07)',
              color: '#c9a84c', cursor: 'pointer',
              fontSize: '0.82rem', fontWeight: 600,
              letterSpacing: 0.5, whiteSpace: 'nowrap',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(201,168,76,0.14)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(201,168,76,0.07)'}
          >
            <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="#c9a84c" strokeWidth="2">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            Yeni Ürün Ekle
          </button>
        </div>

        {items.length === 0 && (
          <div style={{
            textAlign: 'center', padding: '60px 20px',
            border: '1px dashed rgba(201,168,76,0.2)', borderRadius: 14,
            color: 'rgba(240,234,216,0.3)', fontSize: '0.9rem',
          }}>
            Bu kategoride henüz ürün yok.<br/>
            <button onClick={addNewItem} style={{
              marginTop: 16, padding: '10px 20px',
              background: 'rgba(201,168,76,0.1)',
              border: '1px solid rgba(201,168,76,0.3)',
              borderRadius: 8, color: '#c9a84c',
              cursor: 'pointer', fontSize: '0.82rem',
            }}>+ İlk ürünü ekle</button>
          </div>
        )}

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
            onDelete={() => removeItem(index)}
            styles={S}
          />
        ))}

        {/* Add button at bottom too */}
        {items.length > 0 && (
          <button
            onClick={addNewItem}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              width: '100%', padding: '14px',
              border: '1px dashed rgba(201,168,76,0.25)',
              borderRadius: 14, background: 'transparent',
              color: 'rgba(201,168,76,0.5)', cursor: 'pointer',
              fontSize: '0.85rem', transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(201,168,76,0.5)'; e.currentTarget.style.color = '#c9a84c'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(201,168,76,0.25)'; e.currentTarget.style.color = 'rgba(201,168,76,0.5)'; }}
          >
            <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            Yeni Ürün Ekle
          </button>
        )}
      </div>
    </div>
  );
}

function ItemEditor({ item, index, categoryId, uploadingIndex, onUpdate, onImageUpload, onRemoveImage, onDelete, styles: S }) {
  const fileInputRef = useRef(null);
  const isUploading = uploadingIndex === index;
  const isNew = !item.name && !item.desc && !item.price && !item.img;

  return (
    <div style={{
      ...S.card,
      border: isNew ? '1px solid rgba(201,168,76,0.35)' : '1px solid rgba(201,168,76,0.15)',
      animation: isNew ? 'fadeIn 0.3s ease' : 'none',
    }}>
      <style>{`@keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }`}</style>

      {/* Header row */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18,
        paddingBottom: 14, borderBottom: '1px solid rgba(201,168,76,0.1)',
      }}>
        <div style={{
          width: 28, height: 28, borderRadius: '50%',
          background: 'rgba(201,168,76,0.1)',
          border: '1px solid rgba(201,168,76,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: "'Cinzel', serif", fontSize: '0.75rem',
          color: '#c9a84c', fontWeight: 700, flexShrink: 0,
        }}>{index + 1}</div>
        <h3 style={{
          fontFamily: "'Cinzel', serif", fontSize: '0.88rem',
          color: isNew ? 'rgba(201,168,76,0.5)' : '#e8cc7a',
          letterSpacing: 1, fontWeight: 700, flex: 1,
        }}>{item.name || 'Yeni Ürün'}</h3>
        <button
          onClick={onDelete}
          title="Ürünü sil"
          style={{
            width: 30, height: 30,
            border: '1px solid rgba(200,50,50,0.2)',
            borderRadius: 6, background: 'transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', transition: 'all 0.2s', flexShrink: 0,
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(200,50,50,0.15)'; e.currentTarget.style.borderColor = 'rgba(200,50,50,0.4)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(200,50,50,0.2)'; }}
        >
          <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="#ff6b6b" strokeWidth="2">
            <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>
          </svg>
        </button>
      </div>

      {/* Form grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        {/* Name - full width */}
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={S.label}>Ürün Adı *</label>
          <input
            value={item.name || ''}
            onChange={e => onUpdate('name', e.target.value)}
            placeholder="ör. Izgara Somon"
            style={S.input}
            onFocus={e => e.target.style.borderColor = 'rgba(201,168,76,0.5)'}
            onBlur={e => e.target.style.borderColor = 'rgba(201,168,76,0.18)'}
          />
        </div>

        {/* Description - full width */}
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={S.label}>Açıklama</label>
          <textarea
            value={item.desc || ''}
            onChange={e => onUpdate('desc', e.target.value)}
            rows={2}
            placeholder="İçindekiler veya sunum bilgisi..."
            style={{ ...S.input, resize: 'vertical', minHeight: 58 }}
            onFocus={e => e.target.style.borderColor = 'rgba(201,168,76,0.5)'}
            onBlur={e => e.target.style.borderColor = 'rgba(201,168,76,0.18)'}
          />
        </div>

        {/* Price */}
        <div>
          <label style={S.label}>Fiyat (₺)</label>
          <input
            value={item.price || ''}
            onChange={e => onUpdate('price', e.target.value)}
            placeholder="ör. 450"
            style={S.input}
            onFocus={e => e.target.style.borderColor = 'rgba(201,168,76,0.5)'}
            onBlur={e => e.target.style.borderColor = 'rgba(201,168,76,0.18)'}
          />
        </div>

        {/* Photo */}
        <div>
          <label style={S.label}>Fotoğraf</label>
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
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <div style={{
                width: 68, height: 68, borderRadius: 8,
                border: '1px solid rgba(201,168,76,0.3)',
                overflow: 'hidden', flexShrink: 0,
              }}>
                <img src={item.img} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7, flex: 1 }}>
                <button onClick={() => fileInputRef.current?.click()} style={{
                  padding: '7px 10px', borderRadius: 7,
                  border: '1px solid rgba(201,168,76,0.25)',
                  background: 'transparent', color: '#c9a84c',
                  fontSize: '0.72rem', cursor: 'pointer',
                }}>Değiştir</button>
                <button onClick={onRemoveImage} style={{
                  padding: '7px 10px', borderRadius: 7,
                  border: '1px solid rgba(200,50,50,0.3)',
                  background: 'transparent', color: '#ff6b6b',
                  fontSize: '0.72rem', cursor: 'pointer',
                }}>Kaldır</button>
              </div>
            </div>
          ) : (
            <div
              onClick={() => !isUploading && fileInputRef.current?.click()}
              style={{
                height: 68, border: '1px dashed rgba(201,168,76,0.22)',
                borderRadius: 8,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: 4,
                cursor: isUploading ? 'wait' : 'pointer',
                background: isUploading ? 'rgba(201,168,76,0.05)' : 'transparent',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => !isUploading && (e.currentTarget.style.borderColor = 'rgba(201,168,76,0.5)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(201,168,76,0.22)')}
            >
              {isUploading ? (
                <div style={{ fontSize: '0.72rem', color: '#c9a84c' }}>Yükleniyor...</div>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="rgba(201,168,76,0.4)" strokeWidth="1.5">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
                  </svg>
                  <span style={{ fontSize: '0.68rem', color: 'rgba(201,168,76,0.4)' }}>Fotoğraf yükle</span>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
