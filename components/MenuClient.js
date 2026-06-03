'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

// SVG Icons for categories
const icons = {
  starter: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 2l1 10h16l1-10M8 12v10m8-10v10M5 22h14"/>
      <circle cx="12" cy="7" r="3"/>
    </svg>
  ),
  salad: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <ellipse cx="12" cy="15" rx="9" ry="5"/>
      <path d="M3 15c0-4 4-9 9-9s9 5 9 9"/>
      <path d="M9 9c0-3 1.5-5 3-7"/>
    </svg>
  ),
  hot: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 2c0 6-6 6-6 12a6 6 0 0012 0c0-6-6-6-6-12z"/>
      <path d="M12 12c0 3-3 3-3 6a3 3 0 006 0c0-3-3-3-3-6z"/>
    </svg>
  ),
  burger: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 12h18M3 16h18M7 8a5 5 0 0110 0"/>
      <path d="M5 16v2a2 2 0 002 2h10a2 2 0 002-2v-2"/>
    </svg>
  ),
  chicken: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M20 10c0 6-4 10-8 10S4 16 4 10c0-3 2-6 4-7l1 3c1-2 3-3 3-3s2 1 3 3l1-3c2 1 4 4 4 7z"/>
      <path d="M9 17c1 1 2 1 3 1"/>
    </svg>
  ),
  pasta: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 15c0 3 9 5 9 5s9-2 9-5"/>
      <path d="M3 11c0 3 9 5 9 5s9-2 9-5"/>
      <ellipse cx="12" cy="8" rx="9" ry="3"/>
    </svg>
  ),
  pizza: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 2L2 20h20L12 2z"/>
      <path d="M12 2v18"/>
      <circle cx="9" cy="12" r="1" fill="currentColor"/>
      <circle cx="15" cy="14" r="1" fill="currentColor"/>
    </svg>
  ),
  steak: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M6 12c0-4 2-8 6-8s6 4 6 8-2 6-6 6-6-2-6-6z"/>
      <path d="M3 18h18M6 20h12"/>
    </svg>
  ),
  fish: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M2 12s4-6 10-6 10 6 10 6-4 6-10 6S2 12 2 12z"/>
      <path d="M20 6l2-4M20 18l2 4"/>
      <circle cx="10" cy="12" r="1.5" fill="currentColor"/>
    </svg>
  ),
  dessert: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 11c0-4.4 4-8 9-8s9 3.6 9 8"/>
      <path d="M3 11h18v2a9 9 0 01-18 0v-2z"/>
      <path d="M12 13v8M8 21h8"/>
    </svg>
  ),
  share: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="18" cy="5" r="3"/>
      <circle cx="6" cy="12" r="3"/>
      <circle cx="18" cy="19" r="3"/>
      <path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98"/>
    </svg>
  ),
  drink: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M8 2h8l-2 9H10L8 2zM10 11l-2 11h8l-2-11"/>
      <path d="M7 6h10"/>
    </svg>
  ),
};


export default function MenuClient({ initialData, fixMenuData }) {
  const [menuData, setMenuData] = useState(initialData || []);
  const [activeCategory, setActiveCategory] = useState(initialData?.[0]?.id || 'baslangic');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [lang, setLang] = useState('tr');
  const listRef = useRef(null);
  const navRef = useRef(null);
  const loadedCats = useRef(new Set()); // track which categories have images loaded

  // Fetch images only for the active category (lazy, on-demand)
  useEffect(() => {
    if (loadedCats.current.has(activeCategory)) return; // already loaded
    loadedCats.current.add(activeCategory);

    fetch(`/api/menu/${activeCategory}`)
      .then(r => r.json())
      .then(catData => {
        if (!catData?.items) return;
        setMenuData(prev => prev.map(c =>
          c.id === activeCategory
            ? { ...c, items: catData.items }
            : c
        ));
      })
      .catch(() => {});
  }, [activeCategory]);

  // Helper: pick correct language field
  const t = (item, field) => {
    if (lang === 'en') return item[`${field}_en`] || item[field] || '';
    return item[field] || '';
  };
  const currentCategory = menuData.find(c => c.id === activeCategory) || menuData[0];

  const switchCategory = (id) => {
    if (id === activeCategory || animating) return;
    setAnimating(true);
    if (listRef.current) listRef.current.style.opacity = '0';
    setTimeout(() => {
      setActiveCategory(id);
      setAnimating(false);
      if (listRef.current) {
        listRef.current.style.opacity = '1';
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 220);
    // Scroll nav to active button
    setTimeout(() => {
      const activeBtn = navRef.current?.querySelector(`[data-id="${id}"]`);
      if (activeBtn) activeBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }, 50);
  };

  const closeDrawer = () => setDrawerOpen(false);

  return (
    <div style={{ maxWidth: '480px', margin: '0 auto', minHeight: '100vh', position: 'relative' }}>

      {/* ── HERO HEADER ── */}
      <header style={{
        position: 'relative',
        background: 'radial-gradient(ellipse at top, #2a0d0d 0%, #120606 40%, #080604 100%)',
        padding: '20px 20px 24px',
        textAlign: 'center',
        overflow: 'hidden',
      }}>
        {/* side glows */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse at -10% 60%, rgba(100,10,10,0.35) 0%, transparent 55%), radial-gradient(ellipse at 110% 60%, rgba(100,10,10,0.35) 0%, transparent 55%)',
        }} />

        {/* Top bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, position: 'relative', zIndex: 1 }}>
          <button
            id="hamburger-btn"
            onClick={() => setDrawerOpen(true)}
            aria-label="Menü"
            style={{
              width: 40, height: 40,
              border: '1px solid rgba(201,168,76,0.25)',
              borderRadius: '50%',
              background: 'rgba(201,168,76,0.06)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', transition: 'background 0.3s',
              color: '#c9a84c',
            }}
          >
            <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="#c9a84c" strokeWidth="2">
              <path d="M3 12h18M3 6h18M3 18h18"/>
            </svg>
          </button>

          {/* TR / EN toggle */}
          <button
            onClick={() => setLang(l => l === 'tr' ? 'en' : 'tr')}
            style={{
              width: 40, height: 40,
              border: '1px solid rgba(201,168,76,0.25)',
              borderRadius: '50%',
              background: 'rgba(201,168,76,0.06)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', transition: 'all 0.25s',
              fontFamily: "'Outfit', sans-serif",
              fontSize: '0.62rem', fontWeight: 700,
              letterSpacing: 1, color: '#c9a84c',
            }}
            aria-label="Language"
          >
            {lang === 'tr' ? 'EN' : 'TR'}
          </button>
        </div>

        {/* Ornament */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 8, position: 'relative', zIndex: 1 }}>
          <span style={{ display: 'block', height: 1, width: 50, background: 'linear-gradient(to right, transparent, rgba(201,168,76,0.25))' }} />
          <svg viewBox="0 0 24 24" width={14} height={14} fill="#c9a84c" style={{ opacity: 0.6 }}>
            <path d="M12 2l2 7h7l-5.5 4 2 7L12 16l-5.5 4 2-7L3 9h7z"/>
          </svg>
          <span style={{ display: 'block', height: 1, width: 50, background: 'linear-gradient(to left, transparent, rgba(201,168,76,0.25))' }} />
        </div>

        {/* Brand Logo */}
        <div style={{ position: 'relative', zIndex: 1, width: 280, height: 120, margin: '0 auto' }}>
          <Image src="/logo.png" alt="Zagato Palazzo" fill style={{ objectFit: 'contain' }} priority />
        </div>

        <p style={{
          marginTop: 12, fontSize: '0.72rem', letterSpacing: 3,
          color: 'rgba(240,234,216,0.5)', textTransform: 'uppercase',
          fontFamily: "'Outfit', sans-serif", fontWeight: 300,
          position: 'relative', zIndex: 1,
        }}>{lang === 'tr' ? 'İyi Yemek\u00a0·\u00a0İyi Müzik' : 'Fine Dining\u00a0·\u00a0Fine Music'}</p>
      </header>

      {/* ── FIX MENÜ ── */}
      <FixMenu lang={lang} fixMenuData={fixMenuData} />

      {/* ── CATEGORY NAV ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(8,6,4,0.92)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(201,168,76,0.2)',
      }}>
        <div
          ref={navRef}
          style={{
            display: 'flex',
            overflowX: 'auto',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {menuData.map(cat => (
            <button
              key={cat.id}
              data-id={cat.id}
              onClick={() => switchCategory(cat.id)}
              style={{
                flex: '0 0 auto',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                padding: '14px 18px 12px',
                background: 'transparent', border: 'none',
                cursor: 'pointer', position: 'relative',
                transition: 'all 0.25s',
                minWidth: 70,
              }}
            >
              {/* Active indicator line */}
              <div style={{
                position: 'absolute', bottom: 0, left: '10%', right: '10%',
                height: 2, background: '#c9a84c',
                borderRadius: 1,
                transform: cat.id === activeCategory ? 'scaleX(1)' : 'scaleX(0)',
                transition: 'transform 0.3s ease',
              }} />
              <div style={{
                width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: cat.id === activeCategory ? '#c9a84c' : 'rgba(240,234,216,0.35)',
                transition: 'color 0.25s',
              }}>
                <div style={{ width: 22, height: 22 }}>{icons[cat.icon]}</div>
              </div>
              <span style={{
                fontSize: '0.6rem', fontWeight: 500, letterSpacing: '0.8px',
                textTransform: 'uppercase',
                color: cat.id === activeCategory ? '#c9a84c' : 'rgba(240,234,216,0.35)',
                whiteSpace: 'nowrap',
                transition: 'color 0.25s',
                fontFamily: "'Outfit', sans-serif",
              }}>{lang === 'en' ? (cat.category_en || cat.category) : cat.category}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* ── MAIN CONTENT ── */}
      <main>
        {/* Section Title */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
          padding: '28px 20px 20px',
        }}>
          <div style={{ flex: 1, height: 1, background: 'linear-gradient(to right, transparent, rgba(201,168,76,0.25))' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <svg viewBox="0 0 24 24" width={16} height={16} fill="#c9a84c" style={{ opacity: 0.5 }}>
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
            <h2 style={{
              fontFamily: "'Cinzel', serif", fontSize: '1.1rem', fontWeight: 700,
              letterSpacing: 3, color: '#c9a84c', textTransform: 'uppercase', whiteSpace: 'nowrap',
            }}>{lang === 'en' ? (currentCategory?.category_en || currentCategory?.category) : currentCategory?.category}</h2>
            <svg viewBox="0 0 24 24" width={16} height={16} fill="#c9a84c" style={{ opacity: 0.5, transform: 'scaleX(-1)' }}>
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </div>
          <div style={{ flex: 1, height: 1, background: 'linear-gradient(to left, transparent, rgba(201,168,76,0.25))' }} />
        </div>

        {/* Menu List */}
        <div
          ref={listRef}
          style={{
            padding: '0 16px 16px',
            transition: 'opacity 0.25s ease',
          }}
        >
          {(currentCategory?.items || []).map((item, i) => (
            <MenuItem key={i} item={item} index={i} lang={lang} />
          ))}
        </div>

        {/* KDV Note */}
        <div style={{
          textAlign: 'center', padding: '16px 20px',
          color: 'rgba(240,234,216,0.55)', fontSize: '0.72rem', letterSpacing: 1,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
        }}>
          <span style={{ flex: 1, height: 1, display: 'block', background: 'linear-gradient(to right, transparent, rgba(201,168,76,0.2))' }} />
          {lang === 'tr' ? 'Fiyatlarımıza KDV dahildir' : 'All prices include VAT'}
          <span style={{ flex: 1, height: 1, display: 'block', background: 'linear-gradient(to left, transparent, rgba(201,168,76,0.2))' }} />
        </div>


      </main>

      {/* ── HAMBURGER DRAWER ── */}
      {/* Overlay */}
      <div
        onClick={closeDrawer}
        style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(4px)',
          opacity: drawerOpen ? 1 : 0,
          pointerEvents: drawerOpen ? 'all' : 'none',
          transition: 'opacity 0.35s ease',
        }}
      />
      {/* Drawer */}
      <div style={{
        position: 'fixed', top: 0, left: 0, height: '100%',
        width: 280, zIndex: 210,
        background: 'linear-gradient(160deg, #100a06 0%, #080604 100%)',
        borderRight: '1px solid rgba(201,168,76,0.2)',
        transform: drawerOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.35s cubic-bezier(0.4,0,0.2,1)',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
      }}>
        {/* Drawer header */}
        <div style={{
          padding: '28px 24px 20px',
          borderBottom: '1px solid rgba(201,168,76,0.15)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div style={{ width: 90, height: 36, position: 'relative' }}>
            <Image src="/logo.png" alt="Zagato Palazzo" fill style={{ objectFit: 'contain' }} />
          </div>
          <button
            onClick={closeDrawer}
            style={{
              width: 36, height: 36,
              border: '1px solid rgba(201,168,76,0.2)',
              borderRadius: '50%', background: 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: '#c9a84c',
            }}
          >
            <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="#c9a84c" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Drawer Category List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 0' }}>
          <div style={{ padding: '8px 24px 12px', fontSize: '0.65rem', letterSpacing: 2, color: 'rgba(201,168,76,0.45)', textTransform: 'uppercase', fontFamily: "'Outfit', sans-serif" }}>
            {lang === 'tr' ? 'Menü Kategorileri' : 'Menu Categories'}
          </div>
          {menuData.map((cat, i) => (
            <button
              key={cat.id}
              onClick={() => { switchCategory(cat.id); closeDrawer(); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 14,
                width: '100%', padding: '14px 24px',
                background: cat.id === activeCategory ? 'rgba(201,168,76,0.08)' : 'transparent',
                border: 'none',
                borderLeft: cat.id === activeCategory ? '2px solid #c9a84c' : '2px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.2s',
                textAlign: 'left',
              }}
            >
              <div style={{ width: 22, height: 22, color: cat.id === activeCategory ? '#c9a84c' : 'rgba(240,234,216,0.4)', flexShrink: 0, transition: 'color 0.2s' }}>
                {icons[cat.icon]}
              </div>
              <div>
                <div style={{
                  fontFamily: "'Cinzel', serif", fontSize: '0.85rem', fontWeight: 600,
                  color: cat.id === activeCategory ? '#c9a84c' : '#f0ead8',
                  letterSpacing: 1, transition: 'color 0.2s',
                }}>{lang === 'en' ? (cat.category_en || cat.category) : cat.category}</div>
                <div style={{ fontSize: '0.7rem', color: 'rgba(240,234,216,0.4)', marginTop: 2 }}>
                  {cat.items?.length} {lang === 'en' ? 'items' : 'ürün'}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Drawer footer */}
        <div style={{
          padding: '20px 24px',
          borderTop: '1px solid rgba(201,168,76,0.15)',
          fontSize: '0.7rem', color: 'rgba(201,168,76,0.5)',
          letterSpacing: 1, textAlign: 'center',
          fontFamily: "'Outfit', sans-serif",
        }}>
          — SINCE 2020 —
        </div>
      </div>
    </div>
  );
}

// Single menu item component with animation
function MenuItem({ item, index, lang }) {
  const name = lang === 'en' ? (item.name_en || item.name) : item.name;
  const desc = lang === 'en' ? (item.desc_en || item.desc) : item.desc;
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 14,
      padding: '16px 0',
      borderBottom: '1px dashed rgba(201,168,76,0.2)',
      opacity: 0,
      animation: `slideIn 0.5s ease ${index * 0.07}s forwards`,
    }}>
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Image */}
      <div style={{
        flexShrink: 0, width: 90, height: 90,
        borderRadius: 8, overflow: 'hidden',
        border: '1px solid rgba(201,168,76,0.25)',
        background: item.img ? 'transparent' : 'linear-gradient(135deg, #1a1410, #100d09)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {item.img ? (
          <img
            src={item.img}
            alt={item.name}
            loading="lazy"
            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
            onMouseEnter={e => e.target.style.transform = 'scale(1.08)'}
            onMouseLeave={e => e.target.style.transform = 'scale(1)'}
          />
        ) : (
          <svg viewBox="0 0 24 24" width={30} height={30} fill="none" stroke="rgba(201,168,76,0.25)" strokeWidth="1">
            <path d="M3 3l18 18M3 8l4-4h10l4 4v10M3 8v10a2 2 0 002 2h14"/>
          </svg>
        )}
      </div>

      {/* Body */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 5 }}>
        <div style={{
          fontFamily: "'Cinzel', serif", fontSize: '0.95rem', fontWeight: 700,
          color: '#e8cc7a', letterSpacing: 1, textTransform: 'uppercase', lineHeight: 1.2,
        }}>{name}</div>
        <div style={{
          fontSize: '0.8rem', color: 'rgba(240,234,216,0.55)', fontWeight: 300, lineHeight: 1.5,
        }}>{desc}</div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
          <span style={{
            fontFamily: "'Cinzel', serif", fontSize: '1.1rem', fontWeight: 600,
            color: '#c9a84c', letterSpacing: 1,
          }}>{item.price} ₺</span>
        </div>
      </div>
    </div>
  );
}

// ── FIX MENÜ COMPONENT ────────────────────────────────────────────
function FixMenu({ lang, fixMenuData }) {
  const [open, setOpen] = useState(false);

  if (!fixMenuData?.sections?.length) return null;

  const sections = fixMenuData.sections.map(sec => ({
    label: lang === 'en' ? (sec.label_en || sec.label) : sec.label,
    items: sec.items || [],
  }));

  const content = {
    title: lang === 'en' ? 'Fixed Menu' : 'Fix Menü',
    subtitle: lang === 'en' ? "Today's Set Menu" : 'Günün Sabit Menüsü',
    toggle_open: lang === 'en' ? 'View Menu' : 'Menüyü Gör',
    toggle_close: lang === 'en' ? 'Close' : 'Kapat',
    sections,
  };

  return (
    <div style={{
      margin: '0 16px 4px',
      background: 'linear-gradient(135deg, rgba(201,168,76,0.06) 0%, rgba(8,6,4,0.9) 100%)',
      border: '1px solid rgba(201,168,76,0.3)',
      borderRadius: 16,
      overflow: 'hidden',
    }}>
      {/* Header row */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', padding: '14px 18px',
          background: 'transparent', border: 'none', cursor: 'pointer',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* fork-knife icon */}
          <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="#c9a84c" strokeWidth="1.5">
            <path d="M3 2v7c0 1.1.9 2 2 2h1v11h2V11h1a2 2 0 002-2V2h-2v5H7V2H5v5H4V2H3zM19 2c-1.7 0-3 2-3 5v4h2v9h2V2h-1z"/>
          </svg>
          <div style={{ textAlign: 'left' }}>
            <div style={{
              fontFamily: "'Cinzel', serif", fontSize: '0.95rem', fontWeight: 700,
              color: '#c9a84c', letterSpacing: 2,
            }}>{content.title}</div>
            <div style={{ fontSize: '0.65rem', color: 'rgba(240,234,216,0.4)', letterSpacing: 1, marginTop: 1 }}>
              {content.subtitle}
            </div>
          </div>
        </div>
        <div style={{
          fontSize: '0.68rem', color: '#c9a84c', letterSpacing: 1,
          fontFamily: "'Outfit', sans-serif", fontWeight: 600,
          display: 'flex', alignItems: 'center', gap: 4,
        }}>
          {open ? content.toggle_close : content.toggle_open}
          <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="#c9a84c" strokeWidth="2"
            style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}>
            <path d="M6 9l6 6 6-6"/>
          </svg>
        </div>
      </button>

      {/* Expanded content */}
      <div style={{
        maxHeight: open ? 800 : 0,
        overflow: 'hidden',
        transition: 'max-height 0.4s cubic-bezier(0.4,0,0.2,1)',
      }}>
        <div style={{
          borderTop: '1px solid rgba(201,168,76,0.15)',
          padding: '16px 18px 20px',
          display: 'flex', flexDirection: 'column', gap: 16,
        }}>
          {content.sections.map((section, si) => (
            <div key={si}>
              {/* Section label */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10,
              }}>
                <div style={{ height: 1, width: 20, background: 'rgba(201,168,76,0.4)' }} />
                <span style={{
                  fontFamily: "'Cinzel', serif", fontSize: '0.7rem', fontWeight: 700,
                  color: '#c9a84c', letterSpacing: 2, textTransform: 'uppercase',
                }}>{section.label}</span>
                <div style={{ flex: 1, height: 1, background: 'rgba(201,168,76,0.15)' }} />
              </div>
              {/* Items */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 10px' }}>
                {section.items.map((item, ii) => (
                  <span key={ii} style={{
                    fontSize: '0.8rem', color: 'rgba(240,234,216,0.8)',
                    fontFamily: "'Outfit', sans-serif", fontWeight: 300,
                    display: 'flex', alignItems: 'center', gap: 5,
                  }}>
                    <span style={{ color: 'rgba(201,168,76,0.4)', fontSize: '0.55rem' }}>◆</span>
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
          {/* Note */}
          <div style={{
            marginTop: 4, paddingTop: 12,
            borderTop: '1px solid rgba(201,168,76,0.1)',
            fontSize: '0.65rem', color: 'rgba(240,234,216,0.3)',
            fontFamily: "'Outfit', sans-serif", letterSpacing: 0.5, textAlign: 'center',
          }}>
            {lang === 'tr' ? 'Tüm fiyatlara KDV dahildir' : 'All prices include VAT'}
          </div>
        </div>
      </div>
    </div>
  );
}
