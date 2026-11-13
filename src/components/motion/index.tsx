'use client';

import { createContext, useCallback, useContext, useEffect, useId, useRef, useState } from 'react';
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring } from 'motion/react';
import { ChevronDown, Monitor, Moon, Sun, X } from 'lucide-react';
import { useTheme } from 'next-themes';
import { bezier, distance, duration, spring, inViewOnce } from '@/motion/tokens';
import styles from './motion.module.css';

export { Button } from './Button';
export { styles as motionStyles };

/* ---------------- HoverLiftCard ---------------- */
export function HoverLiftCard({ children, className, interactive = true, as = 'div', ...rest }: React.HTMLAttributes<HTMLElement> & { interactive?: boolean; as?: 'div' | 'article' | 'li' }) {
  const reduce = useReducedMotion();
  const Comp = motion[as];
  return (
    <Comp
      className={`${styles.card} ${interactive ? styles.cardInteractive : ''} ${className ?? ''}`}
      data-spot={interactive ? '' : undefined}
      whileHover={reduce || !interactive ? undefined : { y: distance.cardLift, transition: { duration: duration.hover, ease: bezier.out } }}
      {...(rest as object)}
    >
      {children}
    </Comp>
  );
}

/* ---------------- MagneticButton (desktop pointer only) ---------------- */
export function MagneticButton({ children, strength = 0.25 }: { children: React.ReactNode; strength?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduce = useReducedMotion();
  const x = useSpring(useMotionValue(0), { stiffness: 300, damping: 20 });
  const y = useSpring(useMotionValue(0), { stiffness: 300, damping: 20 });
  const onMove = (e: React.PointerEvent) => {
    if (reduce || e.pointerType !== 'mouse' || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * strength);
    y.set((e.clientY - (r.top + r.height / 2)) * strength);
  };
  const reset = () => { x.set(0); y.set(0); };
  return (
    <motion.span ref={ref} style={{ x, y, display: 'inline-flex' }} onPointerMove={onMove} onPointerLeave={reset}>
      {children}
    </motion.span>
  );
}

/* ---------------- AnimatedThemeSwitch ---------------- */
const themeOptions = [
  { value: 'light', label: 'Light', Icon: Sun },
  { value: 'dark', label: 'Dark', Icon: Moon },
  { value: 'system', label: 'System', Icon: Monitor },
] as const;

export function AnimatedThemeSwitch() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const current = mounted ? theme ?? 'dark' : 'dark';
  return (
    <div role="radiogroup" aria-label="Tema tampilan" className={styles.switch}>
      {themeOptions.map(({ value, label, Icon }) => (
        <button key={value} type="button" role="radio" aria-checked={current === value} className={styles.switchBtn} onClick={() => setTheme(value)}>
          {current === value && <motion.span layoutId="theme-pill" className={styles.switchPill} transition={spring} />}
          <Icon size={16} aria-hidden="true" />
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}

/* ---------------- Focus trap + Esc for overlays ---------------- */
function useOverlay(open: boolean, onClose: () => void, panel: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    const el = panel.current;
    const focusables = () => Array.from(el?.querySelectorAll<HTMLElement>('a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])') ?? []);
    requestAnimationFrame(() => focusables()[0]?.focus());
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab') {
        const f = focusables();
        if (!f.length) return;
        if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
      }
    };
    document.addEventListener('keydown', onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = overflow; prev?.focus(); };
  }, [open, onClose, panel]);
}

/* ---------------- AnimatedDrawer (mobile nav / detail drawer) ---------------- */
export function AnimatedDrawer({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  useOverlay(open, onClose, ref);
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div key="ov" className={styles.overlay} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: duration.modal }} onClick={onClose} />
          <motion.div
            key="dr" ref={ref} role="dialog" aria-modal="true" aria-label={title} className={styles.drawer}
            initial={reduce ? { opacity: 0 } : { x: '100%' }} animate={reduce ? { opacity: 1 } : { x: 0 }} exit={reduce ? { opacity: 0 } : { x: '100%' }}
            transition={{ duration: duration.modal, ease: bezier.out }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong style={{ fontSize: 18 }}>{title}</strong>
              <button type="button" className={`${styles.iconBtn} ${styles.iconBtnGhost}`} onClick={onClose} aria-label="Tutup">
                <X size={20} aria-hidden="true" />
              </button>
            </div>
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ---------------- AnimatedModal ---------------- */
export function AnimatedModal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const titleId = useId();
  useOverlay(open, onClose, ref);
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div key="ov" className={styles.overlay} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div
            key="md" ref={ref} role="dialog" aria-modal="true" aria-labelledby={titleId} className={styles.modal}
            initial={{ opacity: 0, scale: 0.96, x: '-50%', y: '-46%' }} animate={{ opacity: 1, scale: 1, x: '-50%', y: '-50%' }} exit={{ opacity: 0, scale: 0.97, x: '-50%', y: '-48%' }}
            transition={{ duration: duration.modal, ease: bezier.out }}
          >
            <h2 id={titleId} style={{ margin: '0 0 12px', fontSize: 20 }}>{title}</h2>
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ---------------- AnimatedAccordion ---------------- */
export function AnimatedAccordion({ items }: { items: { q: string; a: React.ReactNode }[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const base = useId();
  return (
    <div>
      {items.map((it, i) => {
        const isOpen = open === i;
        return (
          <div key={it.q} className={styles.accItem}>
            <h3 style={{ margin: 0 }}>
              <button type="button" className={styles.accTrigger} aria-expanded={isOpen} aria-controls={`${base}-p${i}`} id={`${base}-t${i}`} onClick={() => setOpen(isOpen ? null : i)}>
                {it.q}
                <ChevronDown className={styles.accChevron} size={20} aria-hidden="true" />
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div id={`${base}-p${i}`} role="region" aria-labelledby={`${base}-t${i}`} className={styles.accPanel}
                  initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: duration.toggle, ease: bezier.out }}>
                  <div style={{ padding: '0 4px 16px' }}>{it.a}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

/* ---------------- AnimatedTabs ---------------- */
export function AnimatedTabs({ tabs, value, onChange, label }: { tabs: { id: string; label: string }[]; value: string; onChange: (id: string) => void; label: string }) {
  const group = useId();
  const onKey = (e: React.KeyboardEvent, i: number) => {
    const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (!d) return;
    const next = tabs[(i + d + tabs.length) % tabs.length];
    onChange(next.id);
    (e.currentTarget.parentElement?.querySelector(`[data-tab="${next.id}"]`) as HTMLElement | null)?.focus();
  };
  return (
    <div role="tablist" aria-label={label} className={styles.tabs}>
      {tabs.map((t, i) => (
        <button key={t.id} type="button" role="tab" data-tab={t.id} aria-selected={value === t.id} tabIndex={value === t.id ? 0 : -1} className={styles.tab} onClick={() => onChange(t.id)} onKeyDown={(e) => onKey(e, i)}>
          {value === t.id && <motion.span layoutId={`${group}-pill`} className={styles.tabPill} transition={spring} />}
          <span>{t.label}</span>
        </button>
      ))}
    </div>
  );
}

/* ---------------- AnimatedProgress ---------------- */
export function AnimatedProgress({ value, label }: { value: number; label: string }) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className={styles.progress} role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={v}>
      <motion.div className={styles.progressBar} initial={{ scaleX: 0 }} whileInView={{ scaleX: v / 100 }} viewport={inViewOnce} transition={{ duration: 0.6, ease: bezier.out }} />
    </div>
  );
}

/* ---------------- AnimatedTooltip ---------------- */
export function AnimatedTooltip({ label, children }: { label: string; children: React.ReactElement }) {
  const [show, setShow] = useState(false);
  const id = useId();
  return (
    <span className={styles.tipWrap} onPointerEnter={() => setShow(true)} onPointerLeave={() => setShow(false)} onFocus={() => setShow(true)} onBlur={() => setShow(false)} aria-describedby={id}>
      {children}
      <AnimatePresence>
        {show && (
          <motion.span id={id} role="tooltip" className={styles.tip} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }} transition={{ duration: duration.hover }}>
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}

/* ---------------- AnimatedToast ---------------- */
type Toast = { id: number; tone: 'success' | 'error' | 'info'; title: string; body?: string };
const ToastCtx = createContext<(t: Omit<Toast, 'id'>) => void>(() => {});
export const useToast = () => useContext(ToastCtx);
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);
  const push = useCallback((t: Omit<Toast, 'id'>) => {
    const id = Date.now() + Math.random();
    setItems((s) => [...s, { ...t, id }]);
    setTimeout(() => setItems((s) => s.filter((x) => x.id !== id)), 4500);
  }, []);
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className={styles.toastRegion} role="status" aria-live="polite">
        <AnimatePresence>
          {items.map((t) => (
            <motion.div key={t.id} layout className={styles.toast} data-tone={t.tone} initial={{ opacity: 0, y: 16, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, x: 40 }} transition={{ duration: duration.modal, ease: bezier.out }}>
              <div><strong style={{ display: 'block' }}>{t.title}</strong>{t.body && <span style={{ color: 'var(--muted)', fontSize: 14 }}>{t.body}</span>}</div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastCtx.Provider>
  );
}
