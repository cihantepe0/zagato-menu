'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from '../admin.module.css';

export default function AdminDashboard() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.push('/admin');
      return;
    }

    fetch('/api/menu')
      .then(res => res.json())
      .then(data => {
        setCategories(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch menu:', err);
        setLoading(false);
      });
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    router.push('/admin');
  };

  if (loading) return <div className={styles.adminContainer}>Yükleniyor...</div>;

  return (
    <div className={styles.adminContainer}>
      <header className={styles.adminHeader}>
        <h1 className={styles.adminTitle}>Menü Yönetimi</h1>
        <button onClick={handleLogout} className={styles.cancelBtn}>Çıkış Yap</button>
      </header>

      <div className={styles.categoryGrid}>
        {categories.map((cat) => (
          <Link key={cat.id} href={`/admin/edit/${cat.id}`} className={styles.categoryCard}>
            <div className={styles.cardHeader}>
              <span className={styles.catId}>#{cat.id}</span>
            </div>
            <h2 className={styles.catName}>{cat.category}</h2>
            <p className={styles.catSub}>{cat.subCategory}</p>
            <div className={styles.itemCount}>
              <span>
                {(() => {
                  let count = 0;
                  if (cat.items) count += cat.items.length;
                  if (cat.subSections) {
                    cat.subSections.forEach(sub => {
                      if (sub.items) count += sub.items.length;
                    });
                  }
                  return count;
                })()} Ürün
              </span>
              <span style={{color: '#c9a86a'}}>Düzenle →</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
