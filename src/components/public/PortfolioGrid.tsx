'use client';

import Image from 'next/image';
import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { AnimatedTabs, HoverLiftCard } from '@/components/motion';
import { evidenceLabel, portfolio, portfolioTabs } from '@/content/portfolio';
import { bezier, duration } from '@/motion/tokens';
import s from './page.module.css';

/** Filterable grid with Motion layout transitions. Tilt is applied only on fine pointers. */
export function PortfolioGrid() {
  const [tab, setTab] = useState('all');
  const reduce = useReducedMotion();
  const items = portfolio.filter((p) => tab === 'all' || p.category === tab);

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reduce || e.pointerType !== 'mouse') return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    e.currentTarget.style.transform = `perspective(900px) rotateX(${(-y * 6).toFixed(2)}deg) rotateY(${(x * 6).toFixed(2)}deg)`;
  };
  const onLeave = (e: React.PointerEvent<HTMLDivElement>) => { e.currentTarget.style.transform = ''; };

  return (
    <div style={{ display: 'grid', gap: 24 }}>
      <AnimatedTabs label="Filter portofolio" tabs={portfolioTabs} value={tab} onChange={setTab} />
      <motion.ul layout className={s.grid2} style={{ listStyle: 'none', margin: 0, padding: 0 }} aria-live="polite">
        <AnimatePresence mode="popLayout">
          {items.map((p) => (
            <motion.li key={p.slug} layout initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: duration.modal, ease: bezier.out }}>
              <div onPointerMove={onMove} onPointerLeave={onLeave} style={{ transition: 'transform 180ms var(--ease-out)', height: '100%' }}>
                <HoverLiftCard as="article" className={s.card} style={{ height: '100%' }}>
                  <div style={{ display: 'grid', placeItems: 'center', background: 'var(--raised)', borderRadius: 16, aspectRatio: '16 / 9' }}>
                    <Image src={`/assets/killuasurya/creative/04_OBJECTS/${p.object}`} alt="" width={150} height={150} />
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    <span className={s.pill}>{p.industry}</span>
                    <span className={`${s.pill} ${p.evidence === 'verified' ? s.pillLime : s.pillPurple}`}>{evidenceLabel[p.evidence]}</span>
                  </div>
                  <h3 className={`display ${s.cardTitle}`}>{p.title}</h3>
                  <p className={s.cardBody}>{p.summary}</p>
                </HoverLiftCard>
              </div>
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>
    </div>
  );
}
