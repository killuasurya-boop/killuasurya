'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { Bell, Building2, Link2, Palette } from 'lucide-react';
import { AnimatedThemeSwitch, Button, useToast } from '@/components/motion';
import { TextField } from '@/components/form/fields';
import { DemoNote, PageHeader, Panel, StatusPill } from '../ui';
import { integrations } from '@/fixtures/os.demo';
import p from '../pages.module.css';

function Toggle({ label, on, onChange }: { label: string; on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" role="switch" aria-checked={on} onClick={() => onChange(!on)} className={p.between} style={{ all: 'unset', boxSizing: 'border-box', display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', minHeight: 48, cursor: 'pointer', gap: 12 }}>
      <span style={{ fontSize: 14 }}>{label}</span>
      <span style={{ width: 48, height: 28, borderRadius: 14, padding: 3, background: on ? 'var(--lime)' : 'var(--raised)', display: 'flex', justifyContent: on ? 'flex-end' : 'flex-start', transition: 'background-color 200ms' }} aria-hidden="true">
        <motion.span layout transition={{ type: 'spring', stiffness: 500, damping: 32 }} style={{ width: 22, height: 22, borderRadius: '50%', background: on ? 'var(--on-lime)' : 'var(--muted)' }} />
      </span>
    </button>
  );
}

export function SettingsScreen() {
  const toast = useToast();
  const [name, setName] = useState('KILLUASURYA.TECH');
  const [email, setEmail] = useState('');
  const [err, setErr] = useState('');
  const [notif, setNotif] = useState({ project: true, approval: true, publish: false, wa: false });
  const save = () => {
    if (email && !/^\S+@\S+\.\S+$/.test(email)) { setErr('Format email belum benar.'); return; }
    setErr(''); toast({ tone: 'success', title: 'Tersimpan di pratinjau', body: 'Pengaturan belum dikirim ke server (DATA DEMO).' });
  };
  return (
    <div className={p.stack}>
      <PageHeader title="Pengaturan /" highlight="Control Panel" sub="Profil perusahaan, tema Dual Foundation, notifikasi, dan status integrasi." />
      <DemoNote>Perubahan di halaman ini tidak disimpan ke server.</DemoNote>
      <div className={p.g2}>
        <Panel title="Profil Perusahaan" icon={<Building2 size={18} />}>
          <div style={{ display: 'grid', gap: 14 }}>
            <TextField label="Nama perusahaan" value={name} onChange={(e) => setName(e.target.value)} />
            <TextField label="Email bisnis" type="email" value={email} onChange={(e) => { setEmail(e.target.value); setErr(''); }} error={err} placeholder="Belum diisi (TBD)" />
            <TextField label="Nomor WhatsApp resmi" value="" disabled placeholder="TBD — keputusan Owner D-03" />
            <Button onClick={save} arrow>Simpan</Button>
          </div>
        </Panel>
        <Panel title="Preferensi Tema — Dual Foundation" icon={<Palette size={18} />}>
          <p className={p.muted} style={{ marginTop: 0 }}>Struktur sama; hanya warna, elevasi, dan glow yang berubah.</p>
          <AnimatedThemeSwitch />
        </Panel>
        <Panel title="Notifikasi" icon={<Bell size={18} />}>
          <Toggle label="Update proyek" on={notif.project} onChange={(v) => setNotif((n) => ({ ...n, project: v }))} />
          <Toggle label="Permintaan approval" on={notif.approval} onChange={(v) => setNotif((n) => ({ ...n, approval: v }))} />
          <Toggle label="Status publikasi" on={notif.publish} onChange={(v) => setNotif((n) => ({ ...n, publish: v }))} />
          <Toggle label="Kampanye WhatsApp" on={notif.wa} onChange={(v) => setNotif((n) => ({ ...n, wa: v }))} />
        </Panel>
        <Panel title="Integrasi" icon={<Link2 size={18} />} id="integrasi">
          <ul className={p.list}>{integrations.map((i) => <li key={i.name} className={p.listItem} style={{ gridTemplateColumns: '1fr auto' }}><span>{i.name}<small>{i.desc}</small></span><StatusPill status={i.status} /></li>)}</ul>
        </Panel>
      </div>
    </div>
  );
}
