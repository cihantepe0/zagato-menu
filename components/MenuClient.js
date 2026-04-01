"use client";

import { useRef, useState, useEffect } from 'react';
import Header from '@/components/Header';
import Image from 'next/image';
import styles from '@/app/page.module.css';

export default function MenuClient({ initialData }) {
  const [menuData, setMenuData] = useState(initialData || []);
  const sectionRefs = useRef({});

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
    <>
      <Header 
        categories={navigationCategories} 
        onNavigate={scrollToSection} 
      />
      
      <div className={styles.menuWrapper}>
        {menuData.map((section, index) => (
          <section 
            key={section.id} 
            className={`${styles.menuPage} ${section.id === 31 ? styles.nargilePage : ''}`}
            ref={(el) => (sectionRefs.current[section.id] = el)}
          >
            <div className={styles.backgroundImageWrapper}>
              <Image 
                src={section.backgroundImage} 
                alt={section.category} 
                className={`${styles.backgroundImage} ${section.id === 31 ? styles.nargileImage : ''}`}
                width={section.id === 31 ? 1200 : 1200}
                height={section.id === 31 ? 8894 : 800}
                priority={index < 2} // Preload first two images
                sizes="(max-width: 768px) 100vw, 1200px" // Optimized sizes
              />
              {section.priceOverlays && (
                <div className={styles.priceOverlaysWrapper}>
                  {section.priceOverlays.map((overlay) => (
                    <div 
                      key={overlay.id} 
                      className={`${styles.priceTag} ${overlay.name === 'AQUA MENTHA' ? styles.aquaMenthaBox : ''}`}
                      style={{ 
                        '--top': overlay.top, 
                        '--left': overlay.left,
                        '--mobile-top': overlay.mobileTop || overlay.top,
                        '--mobile-left': overlay.mobileLeft || overlay.left,
                        ...(overlay.fontSize ? { fontSize: overlay.fontSize } : {})
                      }}
                    >
                      {overlay.price}
                    </div>
                  ))}
                </div>
              )}
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

              {(section.items?.length > 0 || section.subSections?.length > 0) && (
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
                        <div className={styles.headersRow}>
                          <div className={styles.itemInfo}></div>
                          <div className={styles.columnPrices}>
                            {section.columns.map((col, cIndex) => (
                              <div key={cIndex} className={styles.columnHeader}>{col}</div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {section.subSections ? (
                        section.subSections.map((sub, sIndex) => (
                          <div key={sIndex} className={styles.subSection}>
                            {sub.title && <div className={styles.subSectionTitle}>{sub.title}</div>}
                            {sub.items.map((item, itemIndex) => (
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
                                      <div key={pIndex} className={styles.columnPrice}>
                                        {p ? (p.includes('TL') ? p.replace('TL', '') : p) : '-'}
                                      </div>
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
                                  <div key={pIndex} className={styles.columnPrice}>
                                    {p ? (p.includes('TL') ? p.replace('TL', '') : p) : '-'}
                                  </div>
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
              )}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
