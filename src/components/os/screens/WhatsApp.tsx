'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Check, Lock, MessageCircle, ShieldCheck, UserX } from 'lucide-react';
import { Button, useToast } from '@/components/motion';
import { CountUp, DemoNote, FlowChevrons, PageHeader, Panel, StatusPill } from '../ui';
import { waSegments, waTemplates } from '@/fixtures/os.demo';
import { opsFlows } from '@/content/services';
import { bezier, duration } from '@/motion/tokens';
import p from '../pages.module.css';

const steps = ['Segmen', 'Consent check', 'Template & preview', 'Owner approval', 'Jadwal'];

/** PRD §10C — consent-based campaign studio. Real sending is disabled in this preview. */
export function WhatsAppScreen() {
  const toast = useToast();
  const [i, setI] = useState(0);
  const [seg, setSeg] = useState(0);
  const [tpl, setTpl] = useState(waTemplates[0].id);
  const [approved, setApproved] = useState(false);
  const s = waSegments[seg];
  const t = waTemplates.find((x) => x.id === tpl)!;
  const canNext = i === 1 ? s.eligible > 0 : i === 3 ? approved : true;

  return (
    <div className={p.stack}>
      <PageHeader title="WhatsApp" highlight="Consent Campaign" sub="Segmen dari CRM → cek consent & opt-out → template disetujui → approval Owner → jadwal sesuai provider." />
      <DemoNote>Studio ini pratinjau. Pengiriman ke WhatsApp nonaktif — tidak ada pesan yang dikirim.</DemoNote>
      <Panel title="Alur Kampanye" icon={<MessageCircle size={18} />}>
        <FlowChevrons label="Alur WhatsApp consent" steps={opsFlows[3].steps.map((label) => ({ label, decision: label.startsWith('Consent') }))} />
        <p className={p.muted} style={{ margin: '8px 0 0', color: 'var(--coral-ink)' }}>{opsFlows[3].loop}</p>
      </Panel>

      <div className={p.main2}>
        <Panel title={`Langkah ${i + 1}: ${steps[i]}`} icon={<ShieldCheck size={18} />}>
          <ol aria-label="Langkah kampanye" style={{ listStyle: 'none', margin: '0 0 18px', padding: 0, display: 'grid', gridTemplateColumns: `repeat(${steps.length}, 1fr)`, gap: 6 }}>
            {steps.map((st, k) => <li key={st} style={{ height: 6, borderRadius: 3, background: k <= i ? 'var(--lime)' : 'var(--grid)', transition: 'background-color 220ms' }} title={st} />)}
          </ol>
          <AnimatePresence mode="wait">
            <motion.div key={i} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: duration.toggle, ease: bezier.out }} style={{ display: 'grid', gap: 14, minHeight: 220 }}>
              {i === 0 && (
                <fieldset style={{ border: 0, margin: 0, padding: 0, display: 'grid', gap: 10 }}>
                  <legend className={p.muted} style={{ marginBottom: 8 }}>Pilih segmen dari CRM</legend>
                  {waSegments.map((w, k) => (
                    <label key={w.name} className={p.listItem} style={{ gridTemplateColumns: 'auto 1fr auto', border: `1.5px solid ${seg === k ? 'var(--purple)' : 'var(--border)'}`, cursor: 'pointer' }}>
                      <input type="radio" name="seg" checked={seg === k} onChange={() => setSeg(k)} />
                      <span>{w.name}<small>{w.total.toLocaleString('id-ID')} kontak</small></span>
                      <span className={p.tag}>{w.eligible} eligible</span>
                    </label>
                  ))}
                </fieldset>
              )}
              {i === 1 && (
                <div className={p.g2}>
                  <div className={p.listItem} style={{ gridTemplateColumns: 'auto 1fr', background: 'var(--raised)' }}><ShieldCheck size={28} color="var(--success)" aria-hidden="true" /><span><strong style={{ fontSize: 28 }}><CountUp value={s.eligible} /></strong><small>Eligible — punya consent & tidak opt-out</small></span></div>
                  <div className={p.listItem} style={{ gridTemplateColumns: 'auto 1fr', background: 'var(--raised)' }}><UserX size={28} color="var(--coral)" aria-hidden="true" /><span><strong style={{ fontSize: 28 }}><CountUp value={s.excluded} /></strong><small>Dikecualikan otomatis</small></span></div>
                  {s.eligible === 0 && <p style={{ gridColumn: '1 / -1', margin: 0, color: 'var(--coral-ink)', fontWeight: 600 }}>Kontak tidak memenuhi syarat penerima kampanye. Periksa persetujuan komunikasi dan pilihan kategori pesan.</p>}
                </div>
              )}
              {i === 2 && (
                <div className={p.g2}>
                  <div style={{ display: 'grid', gap: 10 }}>
                    {waTemplates.map((w) => (
                      <label key={w.id} className={p.listItem} style={{ gridTemplateColumns: 'auto 1fr auto', border: `1.5px solid ${tpl === w.id ? 'var(--purple)' : 'var(--border)'}`, cursor: 'pointer' }}>
                        <input type="radio" name="tpl" checked={tpl === w.id} onChange={() => setTpl(w.id)} />
                        <span>{w.name}<small>{w.category}</small></span><StatusPill status={w.status === 'Draft' ? 'Draft' : 'Approved'} />
                      </label>
                    ))}
                  </div>
                  <div style={{ background: 'var(--raised)', borderRadius: 20, padding: 16, display: 'grid', alignContent: 'start', gap: 8 }} aria-label="Pratinjau pesan">
                    <span className={p.muted}>Pratinjau</span>
                    <motion.div key={t.id} initial={{ opacity: 0, y: 10, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} style={{ justifySelf: 'start', maxWidth: '90%', padding: '10px 12px', borderRadius: '14px 14px 14px 4px', background: 'var(--surface)', border: '1px solid var(--border)', fontSize: 14, lineHeight: 1.5 }}>{t.body.replace('{{nama}}', 'Budi').replace('{{nomor}}', 'QT-00187')}</motion.div>
                  </div>
                </div>
              )}
              {i === 3 && (
                <div style={{ display: 'grid', gap: 12, justifyItems: 'start' }}>
                  <p style={{ margin: 0 }}>Kampanye <strong>{t.name}</strong> ke <strong>{s.eligible}</strong> kontak eligible ({s.name}).</p>
                  <AnimatePresence mode="wait">
                    {approved ? (
                      <motion.span key="ok" initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className={p.row} style={{ color: 'var(--success-ink)', fontWeight: 700 }}><Check size={20} aria-hidden="true" />Disetujui Owner (demo)</motion.span>
                    ) : (
                      <motion.div key="btn" exit={{ opacity: 0 }}><Button onClick={() => { setApproved(true); toast({ tone: 'success', title: 'Approval Owner tercatat (demo)', body: 'Pada produksi disimpan dengan actor, waktu, dan versi template.' }); }} icon={<ShieldCheck size={18} />}>Setujui sebagai Owner</Button></motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
              {i === 4 && (
                <div style={{ display: 'grid', gap: 12 }}>
                  <div className={p.row}>
                    <label className={p.muted}>Tanggal <input type="date" className={p.select} defaultValue="2026-11-20" /></label>
                    <label className={p.muted}>Jam <input type="time" className={p.select} defaultValue="09:00" /></label>
                  </div>
                  <Button disabled icon={<Lock size={18} />}>Jadwalkan via Official API (nonaktif)</Button>
                  <p className={p.muted} style={{ margin: 0 }}>Pengiriman nyata memerlukan WhatsApp Business Platform resmi (D-07) dan backend. Tombol sengaja dinonaktifkan di pratinjau.</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
          <div className={p.between} style={{ marginTop: 18 }}>
            <Button variant="tertiary" onClick={() => setI((x) => x - 1)} disabled={i === 0}>Kembali</Button>
            {i < steps.length - 1 && <Button onClick={() => (canNext ? setI((x) => x + 1) : toast({ tone: 'error', title: i === 1 ? 'Tidak ada penerima eligible' : 'Butuh approval Owner', body: 'Langkah berikutnya terkunci.' }))} arrow aria-disabled={!canNext}>Lanjut</Button>}
          </div>
        </Panel>
        <Panel title="Ringkasan" icon={<MessageCircle size={18} />}>
          <dl style={{ display: 'grid', gridTemplateColumns: '110px 1fr', gap: '8px 10px', margin: 0, fontSize: 14 }}>
            <dt className={p.muted}>Segmen</dt><dd style={{ margin: 0 }}>{s.name}</dd>
            <dt className={p.muted}>Eligible</dt><dd style={{ margin: 0 }}>{s.eligible}</dd>
            <dt className={p.muted}>Template</dt><dd style={{ margin: 0 }}>{t.name}</dd>
            <dt className={p.muted}>Approval</dt><dd style={{ margin: 0 }}>{approved ? 'Disetujui (demo)' : 'Belum'}</dd>
            <dt className={p.muted}>Provider</dt><dd style={{ margin: 0 }}><StatusPill status="Belum terhubung" /></dd>
          </dl>
        </Panel>
      </div>
    </div>
  );
}
