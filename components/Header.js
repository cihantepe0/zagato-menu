'use client';

import { X } from 'lucide-react';
import { useState } from 'react';
import styles from './Header.module.css';
import Image from 'next/image';

export default function Header({ categories, onNavigate }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.logo}>
          <Image src="/logo.png" alt="SHAMROCK" width={150} height={40} priority className={styles.logoImage} />
        </div>
        <button className={styles.menuButton} onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? (
            <X size={32} />
          ) : (
            <Image src="/menuicon.png" alt="Menu" width={32} height={32} className={styles.menuIcon} />
          )}
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
