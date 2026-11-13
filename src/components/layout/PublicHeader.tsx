'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { LogIn, Menu } from 'lucide-react';
import { loginHref, nav } from '@/content/site';
import { WhatsAppButton } from './WhatsAppButton';
import { AnimatedDrawer, AnimatedThemeSwitch, Button, motionStyles } from '@/components/motion';
import { BrandLogo } from './BrandLogo';
import { spring } from '@/motion/tokens';
import s from './header.module.css';

/** PublicHeader — anchor navbar styling; structure per Master Prompt V5: links, Login Workspace, lime "Konsultasi" (WhatsApp), menu button. */
export function PublicHeader() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`${s.header} ${scrolled ? s.scrolled : ''}`} data-hero="nav">
      <div className={`container ${s.row}`}>
        <BrandLogo />
        <nav aria-label="Navigasi utama" className={s.nav}>
          <ul className={s.links}>
            {nav.map((n) => {
              const active = path.startsWith(n.href);
              return (
                <li key={n.href}>
                  <Link href={n.href} className={s.link} aria-current={active ? 'page' : undefined}>
                    {n.label}
                    {active && <motion.span layoutId="nav-underline" className={s.underline} transition={reduce ? { duration: 0 } : spring} />}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className={s.actions}>
          <Link href={loginHref} className={s.login}><LogIn size={18} aria-hidden="true" /><span>Login Workspace</span></Link>
          <WhatsAppButton size="sm" className={s.consult}>Konsultasi</WhatsAppButton>
          <button type="button" className={motionStyles.iconBtn} aria-label="Buka menu" aria-expanded={open} onClick={() => setOpen(true)}>
            <Menu size={22} aria-hidden="true" />
          </button>
        </div>
      </div>
      <AnimatedDrawer open={open} onClose={() => setOpen(false)} title="Menu">
        <nav aria-label="Navigasi menu">
          <ul className={s.drawerLinks}>
            {nav.map((n) => (
              <li key={n.href}>
                <Link href={n.href} className={s.drawerLink} onClick={() => setOpen(false)} aria-current={path === n.href ? 'page' : undefined}>
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div>
          <p className={s.drawerLabel}>Tema tampilan</p>
          <AnimatedThemeSwitch />
        </div>
        <Button href={loginHref} variant="secondary" icon={<LogIn size={18} aria-hidden="true" />} onClick={() => setOpen(false)}>Login Workspace</Button>
        <WhatsAppButton>Konsultasi WhatsApp</WhatsAppButton>
      </AnimatedDrawer>
    </header>
  );
}
