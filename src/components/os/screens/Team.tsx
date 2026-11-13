'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { ShieldAlert, Users } from 'lucide-react';
import { Avatar, DemoNote, PageHeader, Panel, osUi } from '../ui';
import { raci, team, type MemberId } from '@/fixtures/os.demo';
import { stagger } from '@/motion/tokens';
import p from '../pages.module.css';

const legend = { R: 'Mengerjakan', A: 'Penanggung jawab / approval', C: 'Konsultasi', I: 'Informasi' };

export function TeamScreen() {
  const [focus, setFocus] = useState<MemberId | null>(null);
  return (
    <div className={p.stack}>
      <PageHeader title="Tim &" highlight="Akses" sub="Peran operasional & RACI sesuai Team Playbook V4. Kontrol akses di halaman ini hanya demonstrasi UI." />
      <DemoNote>Enforcement hak akses wajib di API/backend — tampilan ini tidak mengamankan apa pun.</DemoNote>
      <div className={p.g3} style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        {team.map((m, i) => (
          <motion.button key={m.id} type="button" onClick={() => setFocus(focus === m.id ? null : m.id)} aria-pressed={focus === m.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * stagger.card }} whileHover={{ y: -3 }}
            style={{ all: 'unset', boxSizing: 'border-box', cursor: 'pointer', display: 'grid', gap: 8, justifyItems: 'start', padding: 16, borderRadius: 20, background: 'var(--surface)', border: `1.5px solid ${focus === m.id ? 'var(--lime)' : 'var(--border)'}`, boxShadow: 'var(--shadow-card)' }}>
            <Avatar id={m.id} size={44} /><strong>{m.name}</strong><span className={p.muted}>{m.role}</span>
          </motion.button>
        ))}
      </div>
      <Panel title="RACI Inti" icon={<Users size={18} />} pad={false}>
        <div className={osUi.tableWrap} tabIndex={0} role="region" aria-label="Tabel (dapat digeser)">
          <table className={osUi.table}>
            <thead><tr><th>Aktivitas</th>{team.map((m) => <th key={m.id} style={{ textAlign: 'center', color: focus === m.id ? 'var(--text)' : undefined }}>{m.name}</th>)}</tr></thead>
            <tbody>{raci.map((r) => (
              <tr key={r.activity}><td>{r.activity}</td>
                {team.map((m) => {
                  const v = r.r[m.id]; const strong = v.includes('A') || v.includes('R');
                  return <td key={m.id} style={{ textAlign: 'center', opacity: focus && focus !== m.id ? 0.35 : 1, transition: 'opacity 180ms' }}><span className={p.tag} style={strong ? { background: v.includes('A') ? 'var(--purple)' : 'var(--lime)', color: v.includes('A') ? '#fff' : 'var(--on-lime)' } : undefined}>{v}</span></td>;
                })}
              </tr>))}
            </tbody>
          </table>
        </div>
        <p className={p.muted} style={{ padding: '12px 18px', margin: 0 }}>{Object.entries(legend).map(([k, v]) => `${k} = ${v}`).join(' · ')}</p>
      </Panel>
      <Panel title="Aksi sensitif yang dibatasi" icon={<ShieldAlert size={18} />}>
        <ul className={p.list}>
          <li className={p.listItem} style={{ gridTemplateColumns: '1fr' }}>Roby — tidak publish tanpa approval</li>
          <li className={p.listItem} style={{ gridTemplateColumns: '1fr' }}>Ojak — tidak menghapus footage final</li>
          <li className={p.listItem} style={{ gridTemplateColumns: '1fr' }}>Ares — tidak mengganti file approved diam-diam</li>
          <li className={p.listItem} style={{ gridTemplateColumns: '1fr' }}>Bima — tidak mengubah ad spend tanpa approval</li>
          <li className={p.listItem} style={{ gridTemplateColumns: '1fr' }}>Surya — tetap butuh verifikasi akhir transaksi dan aksi berisiko</li>
        </ul>
      </Panel>
    </div>
  );
}
