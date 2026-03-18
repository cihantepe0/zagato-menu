'use client';

import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import styles from './Header.module.css';

export default function Header({ categories, onNavigate }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.logo}>SHAMROCK</div>
        <button className={styles.menuButton} onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={32} /> : <Menu size={32} />}
        </button>
      </div>

      {isOpen && (
        <nav className={styles.overlay}>
          <ul className={styles.navList}>
            {categories.map((cat, index) => (
              <li key={index} className={styles.navItem}>
                <button 
                  onClick={() => {
                    onNavigate(cat.id);
                    setIsOpen(false);
                  }}
                  className={styles.navButton}
                >
                  <span className={styles.mainName}>{cat.name}</span>
                  {cat.subName && <span className={styles.subName}>{cat.subName}</span>}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
