'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'motion/react';
import { ChoiceCard, SelectField, TextArea } from '@/components/form/fields';
import { AnimatedProgress, Button, HoverLiftCard, useToast } from '@/components/motion';
import { packages, quotationDisclaimer, services, thirdPartyCosts } from '@/content/services';
import { serviceIcons } from './blocks';
import { bezier, duration } from '@/motion/tokens';
import s from './page.module.css';

const addOns = ['Maintenance & monitoring', 'Laporan bulanan', 'Shooting day tambahan', 'Integrasi CRM', 'Pelatihan tim', 'Setup WhatsApp CRM (berbasis izin)'];
const durations = [{ value: '', label: 'Pilih durasi' }, { value: 'project', label: 'Sekali proyek' }, { value: '3', label: '3 bulan' }, { value: '6', label: '6 bulan' }, { value: '12', label: '12 bulan' }];
const complexity = [{ value: '', label: 'Pilih kompleksitas' }, { value: 'low', label: 'Rendah' }, { value: 'mid', label: 'Sedang' }, { value: 'high', label: 'Tinggi' }];

/**
 * Package Builder (PRD §09.1). Collects selections only — NO price is computed because the Owner
 * rate card (D-05) does not exist yet. Output is an estimate request handed to the Smart Brief.
 */
export function PackageBuilder() {
  const router = useRouter();
  const toast = useToast();
  const [pkg, setPkg] = useState('');
  useEffect(() => { const p = new URLSearchParams(window.location.search).get('package'); if (p) setPkg(p); }, []);
  const [svc, setSvc] = useState<string[]>([]);
  const [adds, setAdds] = useState<string[]>([]);
  const [dur, setDur] = useState('');
  const [cx, setCx] = useState('');
  const [notes, setNotes] = useState('');

  const toggle = (list: string[], set: (v: string[]) => void) => (v: string, on: boolean) => set(on ? [...list, v] : list.filter((x) => x !== v));
  const done = useMemo(() => [pkg, svc.length, dur, cx].filter(Boolean).length, [pkg, svc, dur, cx]);
  const ready = done === 4;

  const submit = () => {
    if (!ready) { toast({ tone: 'error', title: 'Lengkapi pilihan dulu', body: 'Paket, layanan, durasi dan kompleksitas wajib dipilih.' }); return; }
    const q = new URLSearchParams({ package: pkg, services: svc.join(','), duration: dur, complexity: cx });
    toast({ tone: 'info', title: 'Lanjut ke Smart Brief', body: 'Pilihan paket dibawa ke formulir konsultasi.' });
    router.push(`/contact?${q.toString()}`);
  };

  return (
    <div className={s.builder}>
      <div style={{ display: 'grid', gap: 32 }}>
        <fieldset className={s.fieldset}>
          <legend className={s.legend}>1. Paket</legend>
          <div className={s.grid2}>
            {packages.map((p) => <ChoiceCard key={p.code} type="radio" name="package" value={p.code} checked={pkg === p.code} onChange={(v) => setPkg(v)} title={`${p.code} — ${p.name}`} description={p.mechanism} />)}
          </div>
        </fieldset>
        <fieldset className={s.fieldset}>
          <legend className={s.legend}>2. Layanan</legend>
          <div className={s.grid2}>
            {services.map((sv) => { const I = serviceIcons[sv.icon]; return <ChoiceCard key={sv.slug} name="services" value={sv.slug} checked={svc.includes(sv.slug)} onChange={toggle(svc, setSvc)} title={sv.title} description={sv.short} icon={<I size={22} />} />; })}
          </div>
        </fieldset>
        <fieldset className={s.fieldset}>
          <legend className={s.legend}>3. Add-on (opsional)</legend>
          <div className={s.grid2}>{addOns.map((a) => <ChoiceCard key={a} name="addons" value={a} checked={adds.includes(a)} onChange={toggle(adds, setAdds)} title={a} />)}</div>
        </fieldset>
        <fieldset className={s.fieldset}>
          <legend className={s.legend}>4. Durasi & kompleksitas</legend>
          <div className={s.grid2}>
            <SelectField label="Durasi" required value={dur} onChange={(e) => setDur(e.target.value)} options={durations} />
            <SelectField label="Kompleksitas" required value={cx} onChange={(e) => setCx(e.target.value)} options={complexity} />
          </div>
          <div style={{ marginTop: 16 }}><TextArea label="Catatan kebutuhan" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Platform, volume, jadwal, atau batasan khusus" /></div>
        </fieldset>
      </div>

      <aside className={s.summary} aria-label="Ringkasan paket">
        <HoverLiftCard interactive={false} className={s.card}>
          <h2 className="display" style={{ margin: 0, fontSize: 24 }}>Ringkasan</h2>
          <AnimatedProgress value={(done / 4) * 100} label="Kelengkapan pilihan" />
          <p style={{ margin: 0, fontSize: 13, color: 'var(--muted)' }}>{done}/4 pilihan wajib lengkap</p>
          <dl className={s.dl}>
            <dt>Paket</dt><dd>{pkg || '—'}</dd>
            <dt>Layanan</dt>
            <dd>
              <AnimatePresence initial={false}>
                {svc.length ? svc.map((x) => (
                  <motion.span key={x} layout initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: duration.hover, ease: bezier.out }} className={s.pill} style={{ marginRight: 6, marginBottom: 6 }}>
                    {services.find((v) => v.slug === x)?.title}
                  </motion.span>
                )) : '—'}
              </AnimatePresence>
            </dd>
            <dt>Add-on</dt><dd>{adds.length ? adds.join(', ') : '—'}</dd>
            <dt>Durasi</dt><dd>{durations.find((d) => d.value === dur)?.label && dur ? durations.find((d) => d.value === dur)!.label : '—'}</dd>
            <dt>Estimasi</dt><dd><strong style={{ color: 'var(--purple-ink)' }}>Menunggu rate card Owner</strong></dd>
          </dl>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--muted)' }}>{quotationDisclaimer} Terpisah: {thirdPartyCosts.join(', ')}.</p>
          <Button onClick={submit} arrow aria-disabled={!ready}>Ajukan Penawaran</Button>
        </HoverLiftCard>
      </aside>
    </div>
  );
}
