'use client';

import Link from 'next/link';
import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { DemoNote, PageHeader, Panel } from '../ui';
import { calKinds, type CalEvent } from '@/lib/calendar';
import { bezier, duration } from '@/motion/tokens';
import p from '../pages.module.css';
import c from './calendar.module.css';

const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
const iso = (y: number, m: number, d: number) => `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

/** Team calendar built from task deadlines, project start/target dates and client material deadlines. */
export function CalendarScreen({ events, today, demo }: { events: CalEvent[]; today: string; demo?: boolean }) {
  const [ty, tm, td] = today.split('-').map(Number);
  const [ym, setYm] = useState({ y: ty, m: tm - 1 });
  const [dir, setDir] = useState(1);
  const [sel, setSel] = useState<string | null>(today);
  const first = (new Date(ym.y, ym.m, 1).getDay() + 6) % 7; // Monday-first
  const days = new Date(ym.y, ym.m + 1, 0).getDate();
  const go = (d: number) => { setDir(d); setYm(({ y, m }) => { const n = m + d; return { y: y + Math.floor(n / 12), m: (n + 12) % 12 }; }); setSel(null); };
  const on = (date: string) => events.filter((e) => e.date === date);
  const monthCount = events.filter((e) => e.date.startsWith(iso(ym.y, ym.m, 1).slice(0, 7))).length;
  const upcoming = events.filter((e) => e.date >= today).slice(0, 6);
  const list = sel ? on(sel) : [];

  return (
    <div className={p.stack}>
      <PageHeader title="Kalender" highlight="Tim" sub="Deadline tugas, jadwal terbit, approval, mulai/target proyek, dan tenggat bahan klien — langsung dari data kerja." />
      {demo && <DemoNote>Mode demo: kalender diisi dari tugas &amp; proyek contoh.</DemoNote>}
      <div className={p.main2}>
        <Panel title={`${months[ym.m]} ${ym.y} · ${monthCount} jadwal`} icon={<CalendarDays size={18} />} action={
          <div className={p.row}>
            <button type="button" className={c.nav} onClick={() => go(-1)} aria-label="Bulan sebelumnya"><ChevronLeft size={18} aria-hidden="true" /></button>
            <button type="button" className={c.nav} onClick={() => { setDir(1); setYm({ y: ty, m: tm - 1 }); setSel(today); }} aria-label="Kembali ke hari ini" style={{ width: 'auto', padding: '0 12px', borderRadius: 999, fontWeight: 700, fontSize: 13 }}>Hari ini</button>
            <button type="button" className={c.nav} onClick={() => go(1)} aria-label="Bulan berikutnya"><ChevronRight size={18} aria-hidden="true" /></button>
          </div>}>
          <div className={c.legend}>{Object.entries(calKinds).map(([k, v]) => <span key={k}><i className={c[k]} aria-hidden="true" />{v}</span>)}</div>
          <div className={c.week} aria-hidden="true">{['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map((d) => <span key={d}>{d}</span>)}</div>
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div key={`${ym.y}-${ym.m}`} className={c.grid} aria-label={`${months[ym.m]} ${ym.y}`} role="group" initial={{ opacity: 0, x: dir * 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: dir * -30 }} transition={{ duration: duration.toggle, ease: bezier.out }}>
              {Array.from({ length: first }).map((_, i) => <span key={`e${i}`} />)}
              {Array.from({ length: days }).map((_, i) => {
                const d = i + 1; const date = iso(ym.y, ym.m, d); const ev = on(date);
                const isToday = ym.y === ty && ym.m === tm - 1 && d === td;
                return (
                  <button key={d} type="button" className={`${c.day} ${isToday ? c.today : ''}`} aria-pressed={sel === date} onClick={() => setSel(date)}>
                    <span className={c.num}>{d}<span className="sr-only"> {months[ym.m]}{isToday ? ', hari ini' : ''}{ev.length ? `, ${ev.length} jadwal` : ''}</span></span>
                    <span className={c.dots}>{ev.slice(0, 5).map((e, k) => <i key={k} className={c[e.kind]} aria-hidden="true" />)}</span>
                    <span className={c.labels}>{ev.slice(0, 2).map((e, k) => <small key={k} className={e.late ? c.lateLabel : undefined}>{e.title}</small>)}{ev.length > 2 && <small>+{ev.length - 2} lagi</small>}</span>
                  </button>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </Panel>
        <div className={p.stack}>
          <Panel title={sel ? new Date(`${sel}T00:00:00`).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' }) : 'Pilih tanggal'} icon={<CalendarDays size={18} />}>
            <ul className={p.list}>
              {list.map((e, i) => <EventRow key={i} e={e} />)}
              {!list.length && <li className={p.muted}>Tidak ada jadwal.</li>}
            </ul>
          </Panel>
          <Panel title="Berikutnya">
            <ul className={p.list}>
              {upcoming.map((e, i) => <EventRow key={i} e={e} showDate />)}
              {!upcoming.length && <li className={p.muted}>Belum ada jadwal ke depan.</li>}
            </ul>
          </Panel>
        </div>
      </div>
    </div>
  );
}

function EventRow({ e, showDate }: { e: CalEvent; showDate?: boolean }) {
  return (
    <li>
      <Link href={e.href} className={`${p.listItem} ${c.evLink}`} style={{ gridTemplateColumns: 'auto 1fr' }}>
        <i className={`${c.dotLg} ${c[e.kind]}`} aria-hidden="true" />
        <span>{e.title}<small>{showDate ? `${new Date(`${e.date}T00:00:00`).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} · ` : ''}{calKinds[e.kind]} · {e.meta}{e.late ? ' · terlambat' : ''}</small></span>
      </Link>
    </li>
  );
}
