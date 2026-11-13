'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import s from './screens/tasks.module.css';

/** "Penjualan" = one place: Prospek → Penawaran (→ Proyek). Two screens, one tab bar. */
export function SalesTabs() {
  const path = usePathname();
  const tabs = [{ href: '/os/crm', label: '1 · Prospek' }, { href: '/os/quotations', label: '2 · Penawaran' }, { href: '/os/projects', label: '3 · Jadi proyek' }];
  return (
    <nav aria-label="Alur penjualan" className={s.salesTabs}>
      {tabs.map((t) => <Link key={t.href} href={t.href} aria-current={path.startsWith(t.href) ? 'page' : undefined}>{t.label}</Link>)}
    </nav>
  );
}
