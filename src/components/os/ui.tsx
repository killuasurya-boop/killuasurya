'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { motion, useInView, useReducedMotion } from 'motion/react';
import { ArrowDownRight, ArrowUpRight, Inbox } from 'lucide-react';
import { Doodle } from '@/components/doodle/Doodle';
import { drawOn } from '@/components/doodle/effects';
import { bezier, duration, stagger, inViewOnce } from '@/motion/tokens';
import { rupiahShort, team, type MemberId } from '@/fixtures/os.demo';
import s from './ui.module.css';

/* ---------- Page header (marker title + crown draw) ---------- */
export function PageHeader({ title, highlight, sub, actions, children }: { title: string; highlight?: string; sub?: string; actions?: React.ReactNode; children?: React.ReactNode }) {
  const crown = useRef<HTMLSpanElement>(null);
  const reduce = useReducedMotion();
  useEffect(() => { if (!reduce && crown.current) drawOn(crown.current, { each: 0.06 }); }, [reduce]);
  return (
    <div className={s.header}>
      <div className={s.headerCopy}>
        <h1 className={`display ${s.h1}`}>
          {title} {highlight && <span className={s.hl}>{highlight}</span>}
          <Doodle name="doodle_crown" size={46} ref={crown} className={s.crown} />
        </h1>
        {sub && <p className={s.sub}>{sub}</p>}
      </div>
      {actions && <div className={s.actions}>{actions}</div>}
      {children}
    </div>
  );
}

/* ---------- Panel ---------- */
export function Panel({ title, icon, action, children, className, id, pad = true }: { title?: React.ReactNode; icon?: React.ReactNode; action?: React.ReactNode; children: React.ReactNode; className?: string; id?: string; pad?: boolean }) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, inViewOnce);
  const reduce = useReducedMotion();
  return (
    <motion.section ref={ref} id={id} className={`${s.panel} ${pad ? '' : s.noPad} ${className ?? ''}`} initial={reduce ? false : { opacity: 0, y: 16 }} animate={inView || reduce ? { opacity: 1, y: 0 } : undefined} transition={{ duration: duration.cardReveal, ease: bezier.out }} aria-label={typeof title === 'string' ? title : undefined}>
      {title && (
        <header className={s.panelHead}>
          <h2 className={s.panelTitle}>{icon}{title}</h2>
          {action}
        </header>
      )}
      {children}
    </motion.section>
  );
}

/* ---------- Count-up number (only from fixture values) ---------- */
export function CountUp({ value, format = (n: number) => n.toLocaleString('id-ID') }: { value: number; format?: (n: number) => string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const reduce = useReducedMotion();
  const [n, setN] = useState(reduce ? value : 0);
  useEffect(() => {
    if (!inView || reduce) { setN(value); return; }
    let raf = 0; const t0 = performance.now(); const d = 900;
    const tick = (t: number) => { const p = Math.min(1, (t - t0) / d); setN(Math.round(value * (1 - Math.pow(1 - p, 3)))); if (p < 1) raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, reduce, value]);
  return <span ref={ref}><span aria-hidden="true">{format(n)}</span><span className="sr-only">{format(value)}</span></span>;
}

/* ---------- Sparkline (single series → no legend; title names it) ---------- */
export function Sparkline({ data, color = 'var(--c1)' }: { data: readonly number[]; color?: string }) {
  const w = 80, h = 28, max = Math.max(...data), min = Math.min(...data);
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - 3 - ((v - min) / (max - min || 1)) * (h - 6)}`).join(' ');
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden="true" className={s.spark}>
      <motion.polyline points={pts} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={inViewOnce} transition={{ duration: 0.9, ease: bezier.out }} />
    </svg>
  );
}

export function KpiCard({ label, value, delta, spark, currency, icon }: { label: string; value: number; delta?: number; spark?: readonly number[]; currency?: boolean; icon?: React.ReactNode }) {
  const up = (delta ?? 0) >= 0;
  return (
    <motion.div className={s.kpi} whileHover={{ y: -3 }} transition={{ duration: duration.hover }}>
      {icon && <span className={s.kpiIcon} aria-hidden="true">{icon}</span>}
      <div className={s.kpiBody}>
        <p className={s.kpiValue}><CountUp value={value} format={currency ? rupiahShort : undefined} /></p>
        <p className={s.kpiLabel}>{label}</p>
      </div>
      <div className={s.kpiSide}>
        {delta !== undefined && (
          <span className={`${s.delta} ${up ? s.up : s.down}`}>
            {up ? <ArrowUpRight size={14} aria-hidden="true" /> : <ArrowDownRight size={14} aria-hidden="true" />}
            {up ? '+' : ''}{delta}%<span className="sr-only"> dibanding periode sebelumnya</span>
          </span>
        )}
        {spark && <Sparkline data={spark} />}
      </div>
    </motion.div>
  );
}

/* ---------- Status pill: tone + text (never colour alone) ---------- */
const toneOf: Record<string, string> = {
  NEW: 'info', REVIEWING: 'info', QUALIFIED: 'purple', DISCOVERY: 'purple', QUOTING: 'warn', PROPOSAL_SENT: 'warn', NEGOTIATION: 'warn', WON: 'good', LOST: 'bad', NURTURE: 'muted',
  DRAFT: 'muted', INTERNAL_REVIEW: 'warn', APPROVED: 'good', SENT: 'info', VIEWED: 'info', ACCEPTED: 'good', REVISE: 'warn', DECLINED: 'bad', EXPIRED: 'muted',
  SCHEDULED: 'info', AWAITING_APPROVAL: 'warn', MANUAL_TASK: 'purple', FAILED: 'bad', QUEUED: 'muted', PUBLISHED: 'good',
  EDITING: 'purple', SHOOTING: 'purple', SCRIPT_READY: 'info', CLIENT_REVIEW: 'warn',
  'On Track': 'good', 'Perlu Perhatian': 'warn', Terlambat: 'bad', Review: 'info', Selesai: 'good', Approved: 'good', Draft: 'muted',
  'Belum terhubung': 'muted', Ya: 'good', Sebagian: 'warn', Manual: 'purple',
};
const labelOf: Record<string, string> = {
  NEW: 'Baru', REVIEWING: 'Ditinjau', QUALIFIED: 'Qualified', DISCOVERY: 'Discovery', QUOTING: 'Quoting', PROPOSAL_SENT: 'Proposal terkirim', NEGOTIATION: 'Negosiasi', WON: 'Won', LOST: 'Lost', NURTURE: 'Nurture',
  INTERNAL_REVIEW: 'Review internal', AWAITING_APPROVAL: 'Menunggu approval', MANUAL_TASK: 'Tugas manual', FAILED: 'Gagal · rekonsiliasi', QUEUED: 'Antrian', SCHEDULED: 'Terjadwal', SCRIPT_READY: 'Script siap', CLIENT_REVIEW: 'Review klien', EDITING: 'Editing', SHOOTING: 'Shooting', REVISE: 'Revisi', ACCEPTED: 'Diterima', SENT: 'Terkirim', DRAFT: 'Draft', APPROVED: 'Disetujui',
};
export function StatusPill({ status }: { status: string }) {
  const tone = toneOf[status] ?? 'muted';
  return <span className={`${s.pill} ${s['t_' + tone]}`}><i aria-hidden="true" />{labelOf[status] ?? status}</span>;
}

export function Avatar({ id, size = 32 }: { id: MemberId; size?: number }) {
  const m = team.find((t) => t.id === id)!;
  return <span className={s.avatar} style={{ width: size, height: size, ['--ac' as string]: m.color }} title={`${m.name} — ${m.role}`}><span aria-hidden="true">{m.initials}</span><span className="sr-only">{m.name}</span></span>;
}

/* ---------- Flow chevrons (Lead-to-Project etc.) ---------- */
export function FlowChevrons({ steps, active, label }: { steps: readonly { label: string; count?: number; unit?: string; decision?: boolean }[]; active?: number; label: string }) {
  const reduce = useReducedMotion();
  return (
    <ol className={s.chev} aria-label={label} tabIndex={0}>
      {steps.map((st, i) => (
        <motion.li key={st.label} className={`${s.chevItem} ${st.decision ? s.chevDecision : ''} ${active === i ? s.chevActive : ''}`} initial={reduce ? false : { opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 + i * stagger.os, duration: duration.cardReveal, ease: bezier.out }}>
          <span className={s.chevLabel}>{st.label}</span>
          {st.count !== undefined && <span className={s.chevCount}><strong>{st.count}</strong> {st.unit}</span>}
        </motion.li>
      ))}
    </ol>
  );
}

/* ---------- Donut with legend + hover ---------- */
export function Donut({ data, center, label }: { data: readonly { label: string; value: number }[]; center: string; label: string }) {
  const total = data.reduce((a, b) => a + b.value, 0);
  const [hover, setHover] = useState<number | null>(null);
  const r = 46, c = 2 * Math.PI * r;
  let acc = 0;
  return (
    <div className={s.donutWrap}>
      <svg viewBox="0 0 120 120" className={s.donut} role="img" aria-label={`${label}: ${data.map((d) => `${d.label} ${d.value}`).join(', ')}`}>
        <circle cx="60" cy="60" r={r} fill="none" stroke="var(--grid)" strokeWidth="14" />
        {data.map((d, i) => {
          const frac = d.value / total; const gap = 2 / c; const len = Math.max(0, frac - gap);
          const el = (
            <motion.circle key={d.label} cx="60" cy="60" r={r} fill="none" stroke={`var(--c${i + 1})`} strokeWidth={hover === i ? 18 : 14} strokeDasharray={`${len * c} ${c}`} strokeDashoffset={-acc * c} transform="rotate(-90 60 60)"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, delay: 0.2 + i * 0.08, ease: bezier.out }}
              onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} style={{ cursor: 'pointer', transition: 'stroke-width 150ms' }} />
          );
          acc += frac;
          return el;
        })}
        <text x="60" y="58" textAnchor="middle" className={s.donutNum}>{hover !== null ? data[hover].value : center}</text>
        <text x="60" y="74" textAnchor="middle" className={s.donutSub}>{hover !== null ? data[hover].label : label}</text>
      </svg>
      <ul className={s.legend}>
        {data.map((d, i) => (
          <li key={d.label} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} data-on={hover === i || undefined}>
            <i style={{ background: `var(--c${i + 1})` }} aria-hidden="true" />{d.label}<strong>{d.value}</strong><small>{Math.round((d.value / total) * 100)}%</small>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------- Line chart: crosshair + tooltip, legend + direct end labels ---------- */
export function LineChart({ labels, series, height = 220, label }: { labels: string[]; series: { key: string; label: string; data: number[]; color: string }[]; height?: number; label: string }) {
  const id = useId();
  const w = 600, h = height, pad = { l: 36, r: 56, t: 14, b: 26 };
  const max = Math.ceil(Math.max(...series.flatMap((x) => x.data)) / 50) * 50;
  const x = (i: number) => pad.l + (i / (labels.length - 1)) * (w - pad.l - pad.r);
  const y = (v: number) => pad.t + (1 - v / max) * (h - pad.t - pad.b);
  const [hi, setHi] = useState<number | null>(null);
  const ticks = useMemo(() => [0, 0.2, 0.4, 0.6, 0.8, 1].map((t) => Math.round(max * t)), [max]);
  const onMove = (e: React.PointerEvent<SVGRectElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * (w - pad.l - pad.r);
    setHi(Math.max(0, Math.min(labels.length - 1, Math.round((px / (w - pad.l - pad.r)) * (labels.length - 1)))));
  };
  return (
    <div className={s.chart}>
      <ul className={s.legendRow} aria-hidden="true">{series.map((sr) => <li key={sr.key}><i style={{ background: sr.color }} />{sr.label}</li>)}</ul>
      <svg viewBox={`0 0 ${w} ${h}`} className={s.lineSvg} role="img" aria-labelledby={`${id}-t`}>
        <title id={`${id}-t`}>{label}</title>
        {ticks.map((t) => (<g key={t}><line x1={pad.l} x2={w - pad.r} y1={y(t)} y2={y(t)} stroke="var(--grid)" /><text x={pad.l - 8} y={y(t) + 4} textAnchor="end" className={s.axis}>{t}</text></g>))}
        {labels.map((l, i) => <text key={l} x={x(i)} y={h - 6} textAnchor="middle" className={s.axis}>{l}</text>)}
        {series.map((sr) => (
          <g key={sr.key}>
            <motion.path d={sr.data.map((v, i) => `${i ? 'L' : 'M'}${x(i)},${y(v)}`).join(' ')} fill="none" stroke={sr.color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={inViewOnce} transition={{ duration: 1.1, ease: bezier.out }} />
            <text x={x(sr.data.length - 1) + 8} y={y(sr.data[sr.data.length - 1]) + 4} className={s.endLabel}>{sr.label} {sr.data[sr.data.length - 1]}</text>
          </g>
        ))}
        {hi !== null && (
          <g pointerEvents="none">
            <line x1={x(hi)} x2={x(hi)} y1={pad.t} y2={h - pad.b} stroke="var(--border-strong)" strokeDasharray="3 3" />
            {series.map((sr) => <circle key={sr.key} cx={x(hi)} cy={y(sr.data[hi])} r={5} fill={sr.color} stroke="var(--surface)" strokeWidth={2} />)}
          </g>
        )}
        <rect x={pad.l} y={pad.t} width={w - pad.l - pad.r} height={h - pad.t - pad.b} fill="transparent" onPointerMove={onMove} onPointerLeave={() => setHi(null)} />
      </svg>
      {hi !== null && (
        <div className={s.tip} style={{ left: `${(x(hi) / w) * 100}%` }} role="status">
          <strong>Tgl {labels[hi]}</strong>
          {series.map((sr) => <span key={sr.key}><i style={{ background: sr.color }} />{sr.label}: {sr.data[hi]}</span>)}
        </div>
      )}
      <details className={s.tableView}><summary>Lihat sebagai tabel</summary>
        <table><thead><tr><th>Tanggal</th>{series.map((sr) => <th key={sr.key}>{sr.label}</th>)}</tr></thead>
          <tbody>{labels.map((l, i) => <tr key={l}><td>{l}</td>{series.map((sr) => <td key={sr.key}>{sr.data[i]}</td>)}</tr>)}</tbody></table>
      </details>
    </div>
  );
}

/* ---------- Horizontal bar list (single measure → single hue) ---------- */
export function BarList({ data, unit = '', max }: { data: readonly { label: string; value: number }[]; unit?: string; max?: number }) {
  const m = max ?? Math.max(...data.map((d) => d.value));
  return (
    <ul className={s.bars}>
      {data.map((d, i) => (
        <li key={d.label}>
          <span className={s.barLabel}>{d.label}</span>
          <span className={s.barTrack}><motion.span className={s.barFill} initial={{ scaleX: 0 }} whileInView={{ scaleX: d.value / m }} viewport={inViewOnce} transition={{ duration: 0.7, delay: i * 0.05, ease: bezier.out }} /></span>
          <span className={s.barVal}>{d.value}{unit}</span>
        </li>
      ))}
    </ul>
  );
}

export function EmptyState({ title, body, action }: { title: string; body: string; action?: React.ReactNode }) {
  return (
    <div className={s.empty}>
      <Inbox size={36} aria-hidden="true" />
      <strong>{title}</strong>
      <p>{body}</p>
      {action}
    </div>
  );
}

export function Skeleton({ h = 16, w = '100%' }: { h?: number; w?: number | string }) {
  return <span className={s.skeleton} style={{ height: h, width: w }} aria-hidden="true" />;
}

export function DemoNote({ children }: { children: React.ReactNode }) {
  return <p className={s.demoNote}><span className="demo-badge">DATA DEMO</span>{children}</p>;
}

export { s as osUi };
