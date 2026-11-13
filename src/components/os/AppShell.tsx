'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import type { Note } from '@/server/data';
import { LogOut, Bell, ChevronDown, ChevronsLeft, ChevronsRight, CornerDownLeft, Menu, Moon, Search, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { AnimatedDrawer, ToastProvider } from '@/components/motion';
import { activity } from '@/fixtures/os.demo';
import { bezier, duration, spring } from '@/motion/tokens';
import { mobileNavFor, navFor, osRoutes } from './nav';
import { IconMotion } from '@/components/icons/IconMotion';
import { signOut } from '@/server/actions/auth';
import s from './shell.module.css';

/** Live mode = Supabase env present (public values, inlined at build). Shows the sign-out control. */
const live = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
const isActive = (path: string, href: string) => (href === '/os' ? path === '/os' : path.startsWith(href));

function NavList({ collapsed, onNavigate, role }: { collapsed?: boolean; onNavigate?: () => void; role: string }) {
  const path = usePathname();
  const reduce = useReducedMotion();
  const sections = navFor(role);
  const [more, setMore] = useState(false);
  useEffect(() => { if (sections.some((sec) => sec.collapsible && sec.items.some((it) => isActive(path, it.href)))) setMore(true); }, [path]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <nav aria-label="Navigasi Agency OS" className={s.nav}>
      {sections.map((sec) => (
        <div key={sec.section} className={s.navSection}>
          {sec.collapsible
            ? <button type="button" className={s.navMore} aria-expanded={more} onClick={() => setMore((v) => !v)} title={collapsed ? sec.section : undefined}><span className={s.navMoreText}>{sec.section}</span><ChevronDown size={16} aria-hidden="true" className={s.navChevron} /></button>
            : <p className={s.navLabel} aria-hidden={collapsed || undefined}>{collapsed ? '•' : sec.section}</p>}
          {(!sec.collapsible || more) && <ul>
            {sec.items.map((it) => {
              const active = isActive(path, it.href);
              return (
                <li key={it.href}>
                  <Link href={it.href} className={s.navItem} aria-current={active ? 'page' : undefined} onClick={onNavigate} title={collapsed ? it.label : undefined}>
                    {active && <motion.span layoutId={onNavigate ? 'os-active-m' : 'os-active'} className={s.navActive} transition={reduce ? { duration: 0 } : spring} />}
                    <it.icon size={20} aria-hidden="true" className={s.navIcon} />
                    <span className={s.navText}>{it.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>}
        </div>
      ))}
    </nav>
  );
}

function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const [q, setQ] = useState('');
  const [i, setI] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const list = useMemo(() => osRoutes.filter((r) => r.label.toLowerCase().includes(q.toLowerCase())), [q]);
  useEffect(() => { if (open) { setQ(''); setI(0); requestAnimationFrame(() => input.current?.focus()); } }, [open]);
  const go = (href: string) => { onClose(); router.push(href); };
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div className={s.cmdOverlay} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div role="dialog" aria-modal="true" aria-label="Cari halaman" className={s.cmd} initial={{ opacity: 0, y: -12, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: duration.modal, ease: bezier.out }}
            onKeyDown={(e) => {
              if (e.key === 'Escape') onClose();
              if (e.key === 'ArrowDown') { e.preventDefault(); setI((x) => Math.min(x + 1, list.length - 1)); }
              if (e.key === 'ArrowUp') { e.preventDefault(); setI((x) => Math.max(x - 1, 0)); }
              if (e.key === 'Enter' && list[i]) go(list[i].href);
            }}>
            <div className={s.cmdInput}>
              <Search size={18} aria-hidden="true" />
              <input ref={input} value={q} onChange={(e) => { setQ(e.target.value); setI(0); }} placeholder="Cari halaman Agency OS…" aria-label="Cari halaman" role="combobox" aria-expanded="true" aria-controls="cmd-list" aria-activedescendant={list[i] ? `cmd-${i}` : undefined} />
              <kbd>Esc</kbd>
            </div>
            <ul id="cmd-list" role="listbox" className={s.cmdList}>
              {list.map((r, k) => (
                <li key={r.href} id={`cmd-${k}`} role="option" aria-selected={k === i} className={s.cmdItem} onMouseEnter={() => setI(k)} onClick={() => go(r.href)}>
                  <r.icon size={18} aria-hidden="true" /><span>{r.label}</span><small>{r.section}</small>{k === i && <CornerDownLeft size={14} aria-hidden="true" />}
                </li>
              ))}
              {!list.length && <li className={s.cmdEmpty}>Tidak ada hasil untuk “{q}”.</li>}
            </ul>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [m, setM] = useState(false);
  useEffect(() => setM(true), []);
  const dark = !m || resolvedTheme === 'dark';
  return (
    <button type="button" className={s.iconBtn} onClick={() => setTheme(dark ? 'light' : 'dark')} aria-label={dark ? 'Ganti ke tema terang' : 'Ganti ke tema gelap'}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.span key={dark ? 'd' : 'l'} initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: duration.toggle }} style={{ display: 'grid' }}>
          {dark ? <Moon size={19} aria-hidden="true" /> : <Sun size={19} aria-hidden="true" />}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}

const SEEN = 'ks_notif_seen';
function Notifications({ notes }: { notes?: Note[] }) {
  const [open, setOpen] = useState(false);
  const [seen, setSeen] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { try { setSeen(localStorage.getItem(SEEN) ?? ''); } catch { /* storage blocked: every note counts as new */ } }, []);
  useEffect(() => {
    if (!open) return;
    const off = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', off); document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('mousedown', off); document.removeEventListener('keydown', esc); };
  }, [open]);
  const live = !!notes;
  const unread = live ? notes.filter((n) => n.iso > seen).length : 1;
  const toggle = () => {
    setOpen((v) => !v);
    if (live && notes.length && !open) { const top = notes[0].iso; try { localStorage.setItem(SEEN, top); } catch { /* ignore */ } setTimeout(() => setSeen(top), 1500); }
  };
  return (
    <div ref={ref} className={s.popWrap}>
      <button type="button" className={s.iconBtn} aria-label={live ? `Notifikasi${unread ? `, ${unread} baru` : ''}` : 'Notifikasi (demo)'} aria-expanded={open} aria-haspopup="true" onClick={toggle}>
        <Bell size={19} aria-hidden="true" />{unread > 0 && <span className={s.dot} aria-hidden="true" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div className={s.pop} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: duration.hover }}>
            <p className={s.popHead}>Notifikasi {!live && <span className="demo-badge">DATA DEMO</span>}</p>
            {live ? (
              notes.length ? <ul>{notes.map((n) => <li key={n.id} className={n.iso > seen ? s.unread : undefined}><Link href={n.href} onClick={() => setOpen(false)}><strong>{n.title}</strong><small>{n.meta} · {n.at}</small></Link></li>)}</ul>
                : <p className={s.popEmpty}>Belum ada kabar baru dalam 14 hari terakhir.</p>
            ) : <ul>{activity.map((a) => <li key={a.title}><strong>{a.title}</strong><small>{a.meta} · {a.time}</small></li>)}</ul>}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Agency OS shell — calmer motion than the public site (no parallax, short transitions). */
/** Screens that read/write the database in live mode; every other screen still shows fixtures and keeps the DATA DEMO badge. */
const LIVE_SCREENS = ['/os/tasks', '/os/crm', '/os/team', '/os/quotations', '/os/projects', '/os/content', '/os/calendar'];
const LIVE_EXACT = ['/os'];

export function AppShell({ children, user, notes }: { children: React.ReactNode; user?: { name: string; role: string; roleId?: string; demo?: boolean }; notes?: Note[] }) {
  const roleId = user?.roleId ?? 'owner';   // not signed in (demo preview) → Owner view
  const path = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [cmd, setCmd] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    try { setCollapsed(localStorage.getItem('os-sidebar') === '1'); } catch { /* storage unavailable */ }
    const onKey = (e: KeyboardEvent) => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setCmd((v) => !v); } };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  const toggle = useCallback(() => setCollapsed((c) => { try { localStorage.setItem('os-sidebar', c ? '0' : '1'); } catch { /* ignore */ } return !c; }), []);

  return (
    <ToastProvider>
      <IconMotion />
      <div className={`${s.shell} ${collapsed ? s.collapsed : ''}`}>
        <motion.aside className={s.sidebar} animate={{ width: collapsed ? 84 : 272 }} transition={reduce ? { duration: 0 } : { duration: duration.toggle, ease: bezier.out }} aria-label="Sidebar">
          <div className={s.brand}>
            <Link href="/os" aria-label="Agency OS — Dashboard" className={s.brandLink}>
              <Image src="/assets/killuasurya/brand/logo-killuasurya-tech.png" alt="KILLUASURYA.TECH" width={1597} height={506} className={s.logo} priority />
            </Link>
            {!collapsed && <span className={s.version}>Agency OS · preview</span>}
          </div>
          <NavList collapsed={collapsed} role={roleId} />
          <button type="button" className={s.collapseBtn} onClick={toggle} aria-label={collapsed ? 'Perluas sidebar' : 'Ciutkan sidebar'} aria-expanded={!collapsed}>
            {collapsed ? <ChevronsRight size={18} aria-hidden="true" /> : <><ChevronsLeft size={18} aria-hidden="true" /> <span>Ciutkan</span></>}
          </button>
        </motion.aside>

        <div className={s.main}>
          <header className={s.topbar}>
            <button type="button" className={`${s.iconBtn} ${s.menuBtn}`} aria-label="Buka menu" onClick={() => setDrawer(true)}><Menu size={20} aria-hidden="true" /></button>
            <button type="button" className={s.search} onClick={() => setCmd(true)} aria-keyshortcuts="Control+K Meta+K">
              <Search size={18} aria-hidden="true" /><span>Cari lead, proyek, klien, atau halaman…</span><kbd aria-hidden="true">⌘K</kbd>
            </button>
            <div className={s.topActions}>
              {!(user && !user.demo && (LIVE_EXACT.includes(path) || LIVE_SCREENS.some((r) => path.startsWith(r)))) && <span className="demo-badge" title="Angka & status di layar ini adalah data contoh">DATA DEMO</span>}
              <Notifications notes={notes} />
              <ThemeToggle />
              <div className={s.user}>
                <span className={s.avatar} aria-hidden="true">{(user?.name ?? 'SU').slice(0, 2).toUpperCase()}</span>
                <span className={s.userText}><strong>{user?.name ?? 'Surya'}</strong><small>{user?.role ?? 'Owner (demo)'}</small></span>
              </div>
              {user && <form action={signOut}><button type="submit" className={s.iconBtn} aria-label="Keluar"><LogOut size={19} aria-hidden="true" /></button></form>}
            </div>
          </header>
          <main id="main" className={s.content}>
            <motion.div key={path} initial={reduce ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: duration.modal, ease: bezier.out }}>
              {children}
            </motion.div>
          </main>
        </div>

        <nav className={s.bottomNav} aria-label="Navigasi cepat">
          {mobileNavFor(roleId).map((it) => {
            const href = it.href;
            const active = isActive(path, href);
            return (
              <Link key={href} href={href} className={s.bottomItem} aria-current={active ? 'page' : undefined}>
                {active && <motion.span layoutId="os-bottom" className={s.bottomActive} transition={spring} />}
                <it.icon size={20} aria-hidden="true" /><span>{it.label.length <= 9 ? it.label : it.label.split(' ')[0]}</span>
              </Link>
            );
          })}
          <button type="button" className={s.bottomItem} onClick={() => setDrawer(true)} aria-label="Semua menu"><Menu size={20} aria-hidden="true" /><span>Menu</span></button>
        </nav>

        <AnimatedDrawer open={drawer} onClose={() => setDrawer(false)} title="Agency OS">
          <NavList onNavigate={() => setDrawer(false)} role={roleId} />
        </AnimatedDrawer>
        <CommandPalette open={cmd} onClose={() => setCmd(false)} />
      </div>
    </ToastProvider>
  );
}
