'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { MessageCircle } from 'lucide-react';
import { bezier, duration } from '@/motion/tokens';
import { waLink, waTopics } from '@/content/site';
import s from './floating.module.css';

/** Pages that already are the contact/auth flow — no floating button there. */
const HIDDEN_ON = ['/login', '/client/login', '/reset-password', '/forgot-password', '/set-password'];

/** Floating WhatsApp click-to-chat button (wa.me). Appears after the first screen; message is prefilled per page. */
export function FloatingContact() {
  const path = usePathname();
  const reduce = useReducedMotion();
  const [show, setShow] = useState(false);

  useEffect(() => {
    let raf = 0;
    const check = () => { raf = 0; setShow(window.scrollY > Math.min(window.innerHeight * 0.8, 640)); };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(check); };
    check();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { window.removeEventListener('scroll', onScroll); if (raf) cancelAnimationFrame(raf); };
  }, []);

  if (HIDDEN_ON.some((p) => path === p)) return null;

  const wa = waLink(waTopics.find(([prefix]) => path.startsWith(prefix))?.[1]);
  const label = 'Chat WhatsApp';

  return (
    <AnimatePresence>
      {show && (
        <motion.a
          key="fab"
          href={wa}
          target="_blank"
          rel="noopener noreferrer"
          className={s.fab}
          initial={reduce ? false : { opacity: 0, y: 16, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={reduce ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, y: 16, scale: 0.9 }}
          transition={{ duration: duration.modal, ease: bezier.out }}
          whileHover={reduce ? undefined : { y: -2 }}
          whileTap={reduce ? undefined : { scale: 0.96 }}
        >
          <span className={s.icon}><MessageCircle size={20} aria-hidden="true" /></span>
          <span className={s.text}>{label}</span>
        </motion.a>
      )}
    </AnimatePresence>
  );
}
