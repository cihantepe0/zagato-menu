'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import styles from '../../admin.module.css';

export default function ItemEditor() {
  const { id } = useParams();
  const router = useRouter();
  const [menuData, setMenuData] = useState([]);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.push('/admin');
      return;
    }

    fetch('/api/menu')
      .then(res => res.json())
      .then(data => {
        setMenuData(data);
        const cat = data.find(c => c.id.toString() === id.toString());
        setCategory(cat);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch menu:', err);
        setLoading(false);
      });
  }, [id, router]);

  const handleSave = async (e) => {
    e.preventDefault();
    const newMenuData = menuData.map(c => c.id.toString() === id.toString() ? category : c);
    
    try {
      const res = await fetch('/api/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMenuData)
      });
      if (res.ok) {
        alert('Değişiklikler başarıyla kaydedildi!');
        router.push('/admin/dashboard');
      } else {
        alert('Kaydetme işlemi başarısız oldu.');
      }
    } catch (err) {
      alert('Bir hata oluştu.');
    }
  };

  const updateItem = (index, field, value) => {
    const newItems = [...(category.items || [])];
    newItems[index] = { ...newItems[index], [field]: value };
    setCategory({ ...category, items: newItems });
  };

  const updateSubItem = (subIndex, itemIndex, field, value) => {
    const newSubSections = [...category.subSections];
    const newItems = [...newSubSections[subIndex].items];
    newItems[itemIndex] = { ...newItems[itemIndex], [field]: value };
    newSubSections[subIndex] = { ...newSubSections[subIndex], items: newItems };
    setCategory({ ...category, subSections: newSubSections });
  };

  const updateSubItemPrice = (subIndex, itemIndex, pIndex, value) => {
    const newSubSections = [...category.subSections];
    const newItems = [...newSubSections[subIndex].items];
    const newPrices = [...newItems[itemIndex].prices];
    newPrices[pIndex] = value;
    newItems[itemIndex] = { ...newItems[itemIndex], prices: newPrices };
    newSubSections[subIndex] = { ...newSubSections[subIndex], items: newItems };
    setCategory({ ...category, subSections: newSubSections });
  };

  const addItem = () => {
    const newItem = { name: 'Yeni Ürün', subName: '', price: '0TL', description: '' };
    setCategory({ ...category, items: [...(category.items || []), newItem] });
  };

  const addSubItem = (subIndex) => {
    const newItem = { name: 'Yeni Ürün', subName: '', price: '0TL', description: '' };
    const newSubSections = [...category.subSections];
    newSubSections[subIndex].items = [...(newSubSections[subIndex].items || []), newItem];
    setCategory({ ...category, subSections: newSubSections });
  };

  const removeItem = (index) => {
    const newItems = (category.items || []).filter((_, i) => i !== index);
    setCategory({ ...category, items: newItems });
  };

  const removeSubItem = (subIndex, itemIndex) => {
    const newSubSections = [...category.subSections];
    newSubSections[subIndex].items = newSubSections[subIndex].items.filter((_, i) => i !== itemIndex);
    setCategory({ ...category, subSections: newSubSections });
  };

  if (loading) return <div className={styles.adminContainer}>Yükleniyor...</div>;
  if (!category) return <div className={styles.adminContainer}>Kategori bulunamadı.</div>;

  return (
    <div className={styles.adminContainer}>
      <header className={styles.adminHeader}>
        <h1 className={styles.adminTitle}>{category.category} Düzenle</h1>
        <button onClick={() => router.push('/admin/dashboard')} className={styles.cancelBtn}>Geri Dön</button>
      </header>

      <form onSubmit={handleSave} className={styles.editorContainer}>
        <div className={styles.formGroup}>
          <label>Kategori Adı (Türkçe)</label>
          <input 
            type="text" 
            value={category.category} 
            onChange={(e) => setCategory({ ...category, category: e.target.value })} 
          />
        </div>
        
        <div className={styles.formGroup}>
          <label>Kategori Adı (İngilizce)</label>
          <input 
            type="text" 
            value={category.subCategory} 
            onChange={(e) => setCategory({ ...category, subCategory: e.target.value })} 
          />
        </div>

        <div className={styles.formGroup}>
          <label>Hizalama (layoutAlign)</label>
          <select 
            value={category.layoutAlign || 'left'} 
            onChange={(e) => setCategory({ ...category, layoutAlign: e.target.value })}
          >
            <option value="left">Sol</option>
            <option value="right">Sağ</option>
          </select>
        </div>

        <h3 style={{marginTop: '3rem', marginBottom: '1.5rem'}}>Ürün Listesi</h3>
        
        {/* Standard Items */}
        {category.items && category.items.length > 0 && category.items.map((item, index) => (
          <div key={`item-${index}`} className={styles.itemEditor}>
            <button type="button" onClick={() => removeItem(index)} className={styles.removeBtn}>Sil</button>
            <div className={styles.formGroup}>
              <label>Ürün Adı</label>
              <input type="text" value={item.name} onChange={(e) => updateItem(index, 'name', e.target.value)} />
            </div>
            <div className={styles.formGroup}>
              <label>Alt İsim / İngilizce</label>
              <input type="text" value={item.subName} onChange={(e) => updateItem(index, 'subName', e.target.value)} />
            </div>
            <div className={styles.formGroup}>
              <label>Fiyat</label>
              <input type="text" value={item.price} onChange={(e) => updateItem(index, 'price', e.target.value)} />
            </div>
            <div className={styles.formGroup}>
              <label>Açıklama</label>
              <textarea rows="2" value={item.description} onChange={(e) => updateItem(index, 'description', e.target.value)} />
            </div>
          </div>
        ))}

        {/* SubSections (Beers, Wines, etc) */}
        {category.subSections && category.subSections.map((sub, sIndex) => (
          <div key={`sub-${sIndex}`} className={styles.subSectionEditor}>
            <h4 className={styles.subTitle}>{sub.title}</h4>
            {sub.items.map((item, iIndex) => (
              <div key={`sub-item-${sIndex}-${iIndex}`} className={styles.itemEditor}>
                <button type="button" onClick={() => removeSubItem(sIndex, iIndex)} className={styles.removeBtn}>Sil</button>
                <div className={styles.formGroup}>
                  <label>Ürün Adı</label>
                  <input type="text" value={item.name} onChange={(e) => updateSubItem(sIndex, iIndex, 'name', e.target.value)} />
                </div>
                {item.prices ? (
                  <div className={styles.priceGrid}>
                    {item.prices.map((p, pIndex) => (
                      <div key={pIndex} className={styles.formGroup}>
                        <label>Fiyat ({sub.columns ? sub.columns[pIndex] : `Sütun ${pIndex+1}`})</label>
                        <input type="text" value={p} onChange={(e) => updateSubItemPrice(sIndex, iIndex, pIndex, e.target.value)} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={styles.formGroup}>
                    <label>Fiyat</label>
                    <input type="text" value={item.price} onChange={(e) => updateSubItem(sIndex, iIndex, 'price', e.target.value)} />
                  </div>
                )}
                <div className={styles.formGroup}>
                  <label>Açıklama</label>
                  <textarea rows="2" value={item.description} onChange={(e) => updateSubItem(sIndex, iIndex, 'description', e.target.value)} />
                </div>
              </div>
            ))}
            <button type="button" onClick={() => addSubItem(sIndex)} className={styles.addItemBtn}>+ {sub.title} Bölümüne Ekle</button>
          </div>
        ))}

        {category.items && <button type="button" onClick={addItem} className={styles.saveBtn} style={{background: '#333', color: '#fff', marginBottom: '2rem'}}>+ Yeni Ürün Ekle</button>}

        <div className={styles.actionRow}>
          <button type="submit" className={styles.saveBtn}>Değişiklikleri Kaydet</button>
          <button type="button" onClick={() => router.push('/admin/dashboard')} className={styles.cancelBtn}>İptal</button>
        </div>
      </form>
    </div>
  );
}
