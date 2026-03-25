'use client';

import Header from '@/components/Header';
import { useRef, useState, useEffect } from 'react';
import styles from '@/app/page.module.css';
import Image from 'next/image';

export default function Home() {
  const [menuData, setMenuData] = useState([]);
  const [loading, setLoading] = useState(true);
  const sectionRefs = useRef({}); 

  useEffect(() => {
    fetch('/api/menu')
      .then(res => res.json())
      .then(data => {
        setMenuData(data);
        setLoading(false);
      });
  }, []);

  const scrollToSection = (id) => {
    const element = sectionRefs.current[id];
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  if (loading) {
    return (
      <main className={styles.container}>
        <div className={styles.loadingWrapper}>
          <div className={styles.spinner}></div>
        </div>
      </main>
    );
  }

  // Group unique categories for navigation
  const navigationCategories = [];
  const seenCategories = new Set();

  menuData.forEach(section => {
    if (!seenCategories.has(section.category)) {
      navigationCategories.push({
        id: section.id,
        name: section.category,
        subName: section.subCategory
      });
      seenCategories.add(section.category);
    }
  });

  return (
    <main className={styles.container}>
      <Header 
        categories={navigationCategories} 
        onNavigate={scrollToSection} 
      />
      
      <div className={styles.menuWrapper}>
        {menuData.map((section, index) => (
          <section 
            key={section.id} 
            className={styles.menuPage}
            ref={(el) => (sectionRefs.current[section.id] = el)} // Store ref by section.id
          >
            <div className={styles.backgroundImageWrapper}>
              <Image 
                src={section.backgroundImage} 
                alt={section.category} 
                className={styles.backgroundImage}
                width={1200}
                height={800}
                priority={index === 0}
                loading={index === 0 ? undefined : "lazy"}
              />
            </div>

            <div className={`${styles.contentOverlay} ${
              section.layoutAlign === 'center' ? styles.alignCenter : 
              section.layoutAlign === 'right' ? styles.alignRight : 
              styles.alignLeft
            }`}>
              <div className={styles.categoryHeader}>
                <h2 className={styles.categoryTitle}>{section.category}</h2>
                <h3 className={styles.categorySubTitle}>{section.subCategory}</h3>
              </div>

              <div className={styles.itemsCardWrapper}>
                {section.layoutType === 'quad-grid' ? (
                  <div className={styles.quadGridWrapper}>
                    {section.subSections.map((sub, sIndex) => {
                      const posClass = sIndex === 0 ? styles.cardNW : 
                                       sIndex === 1 ? styles.cardEC : 
                                       sIndex === 2 ? styles.cardWC : 
                                       styles.cardSE;
                      return (
                        <div key={sIndex} className={`${styles.itemsCard} ${posClass}`}>
                          {sub.title && (
                            <div className={styles.subSectionTitle}>{sub.title}</div>
                          )}
                          {sub.items.map((item, itemIndex) => (
                            <div key={itemIndex} className={styles.menuItem}>
                              <div className={styles.itemInfo}>
                                <div className={styles.itemNameRow}>
                                  <span className={styles.itemName}>{item.name}</span>
                                  {item.subName && <span className={styles.itemSubName}>{item.subName}</span>}
                                </div>
                                {item.description && <p className={styles.itemDescription}>{item.description}</p>}
                              </div>
                              <div className={styles.itemPrice}>
                                {item.price && item.price.includes('TL') ? (
                                  <span>{item.price.replace('TL', '')}<small>TL</small></span>
                                ) : item.price}
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className={styles.itemsCard}>
                    {section.layoutType === 'columns' && (
                    <div className={styles.columnHeaders}>
                      <div className={styles.spacer}></div>
                      <div className={styles.headersRow}>
                        {section.columns.map((col, cIndex) => (
                          <span key={cIndex} className={styles.columnHeader}>{col}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {section.subSections ? (
                    section.subSections.map((sub, subIndex) => (
                      <div key={subIndex} className={styles.subSection}>
                        {sub.title && (
                          <div className={styles.subSectionTitle}>{sub.title}</div>
                        )}
                        {sub.layoutType === 'columns' && (
                          <div className={styles.headersRow}>
                            <div className={styles.spacer}></div>
                            <div className={styles.columnHeaders}>
                              {sub.columns.map((col, i) => (
                                <div key={i} className={styles.columnHeader}>{col}</div>
                              ))}
                            </div>
                          </div>
                        )}
                        {sub.items.map((item, itemIndex) => (
                          <div key={itemIndex} className={styles.menuItem}>
                            <div className={styles.itemInfo}>
                              <div className={styles.itemNameRow}>
                                <span className={styles.itemName}>{item.name}</span>
                                {item.subName && <span className={styles.itemSubName}>{item.subName}</span>}
                              </div>
                              {item.description && <p className={styles.itemDescription}>{item.description}</p>}
                            </div>
                            {sub.layoutType === 'columns' ? (
                              <div className={styles.columnPrices}>
                                {item.prices.map((p, pIndex) => (
                                  <div key={pIndex} className={styles.columnPrice}>{p || '-'}</div>
                                ))}
                              </div>
                            ) : (
                              <div className={styles.itemPrice}>
                                {item.price && item.price.includes('TL') ? (
                                  <span>{item.price.replace('TL', '')}<small>TL</small></span>
                                ) : item.price}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ))
                  ) : (
                    section.items.map((item, itemIndex) => (
                      <div key={itemIndex} className={styles.menuItem}>
                        <div className={styles.itemInfo}>
                          <div className={styles.itemNameRow}>
                            <span className={styles.itemName}>{item.name}</span>
                            {item.subName && <span className={styles.itemSubName}>{item.subName}</span>}
                          </div>
                          {item.description && <p className={styles.itemDescription}>{item.description}</p>}
                        </div>
                        {section.layoutType === 'columns' ? (
                          <div className={styles.columnPrices}>
                            {item.prices.map((p, pIndex) => (
                              <div key={pIndex} className={styles.columnPrice}>{p || '-'}</div>
                            ))}
                          </div>
                        ) : (
                          <div className={styles.itemPrice}>
                            {item.price && item.price.includes('TL') ? (
                              <span>{item.price.replace('TL', '')}<small>TL</small></span>
                            ) : item.price}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                  </div>
                )}
              </div>
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
