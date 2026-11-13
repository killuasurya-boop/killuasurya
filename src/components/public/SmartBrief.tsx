'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { submitLead } from '@/server/actions/leads';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Building2, Mail, Phone, User } from 'lucide-react';
import { Checkbox, ChoiceCard, SelectField, TextArea, TextField } from '@/components/form/fields';
import { Button, HoverLiftCard } from '@/components/motion';
import { Doodle } from '@/components/doodle/Doodle';
import { drawOn } from '@/components/doodle/effects';
import { services } from '@/content/services';
import { serviceIcons } from './blocks';
import { bezier, duration } from '@/motion/tokens';
import s from './brief.module.css';

/** PRD §08.1 — 8 progressive steps. */
const steps = ['Identitas', 'Profil usaha', 'Tujuan', 'Layanan', 'Kebutuhan', 'Budget & timeline', 'Privasi', 'Ringkasan'];
const goals = ['Awareness', 'Lead', 'Transaksi', 'Sistem operasional', 'Produksi konten'];
const channels = [{ value: '', label: 'Pilih kanal' }, { value: 'whatsapp', label: 'WhatsApp' }, { value: 'email', label: 'Email' }, { value: 'phone', label: 'Telepon' }];
const industries = [{ value: '', label: 'Pilih industri' }, ...['F&B / Cafe', 'Retail', 'Printshop / Workshop', 'Distributor', 'Jasa / Agency', 'Peternakan / Pertanian', 'Pendidikan', 'Lainnya'].map((v) => ({ value: v, label: v }))];
const budgets = [{ value: '', label: 'Pilih kisaran' }, ...['Belum tahu', '< Rp5 juta', 'Rp5–15 juta', 'Rp15–50 juta', '> Rp50 juta'].map((v) => ({ value: v, label: v }))];
const timelines = [{ value: '', label: 'Pilih timeline' }, ...['Secepatnya', '1 bulan', '1–3 bulan', '> 3 bulan', 'Fleksibel'].map((v) => ({ value: v, label: v }))];

type Data = {
  company: string; pic: string; channel: string; contact: string;
  industry: string; location: string; links: string;
  goals: string[]; services: string[];
  needs: string; platforms: string; schedule: string;
  budget: string; timeline: string;
  consent: boolean; promo: boolean;
};

export function SmartBrief() {
  const reduce = useReducedMotion();
  const headingId = useId();
  const [i, setI] = useState(0);
  const [dir, setDir] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState<string | null>(null);
  const [demo, setDemo] = useState(true);
  const [busy, setBusy] = useState(false);
  const [hp, setHp] = useState('');            // honeypot: real visitors never see or fill this
  const started = useRef(0);
  useEffect(() => { started.current = Date.now(); }, []);
  const panel = useRef<HTMLDivElement>(null);
  const burst = useRef<HTMLSpanElement>(null);
  const [d, setD] = useState<Data>({
    company: '', pic: '', channel: '', contact: '', industry: '', location: '', links: '',
    goals: [], services: [], needs: '',
    platforms: '', schedule: '', budget: '', timeline: '', consent: false, promo: false,
  });
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const svc = q.get('services')?.split(',').filter(Boolean) ?? (q.get('service') ? [q.get('service')!] : []);
    const pkg = q.get('package');
    // from the Home quiz: ?package=…&quiz=<tujuan>|<jenis usaha>|<skala>
    const quizNote = q.get('quiz');
    const note = quizNote ? `Paket: ${pkg ?? '-'} · Hasil cek kebutuhan: ${quizNote.split('|').join(' · ')}\n` : pkg ? `Paket: ${pkg} · Durasi: ${q.get('duration') ?? '-'} · Kompleksitas: ${q.get('complexity') ?? '-'}\n` : null;
    if (svc.length || note) setD((x) => ({ ...x, services: svc.length ? svc : x.services, needs: note ?? x.needs }));
  }, []);
  const set = <K extends keyof Data>(k: K, v: Data[K]) => { setD((x) => ({ ...x, [k]: v })); setErrors((e) => ({ ...e, [k]: '' })); };
  const toggle = (k: 'goals' | 'services') => (v: string, on: boolean) => set(k, on ? [...d[k], v] : d[k].filter((x) => x !== v));

  const validate = (step: number) => {
    const e: Record<string, string> = {};
    if (step === 0) {
      if (!d.company.trim()) e.company = 'Nama usaha wajib diisi.';
      if (!d.pic.trim()) e.pic = 'Nama PIC wajib diisi.';
      if (!d.channel) e.channel = 'Pilih kanal kontak.';
      if (!d.contact.trim()) e.contact = 'Kontak wajib diisi.';
      else if (d.channel === 'email' && !/^\S+@\S+\.\S+$/.test(d.contact)) e.contact = 'Format email belum benar.';
      else if (d.channel !== 'email' && !/^[+\d][\d\s-]{7,}$/.test(d.contact)) e.contact = 'Masukkan nomor yang valid.';
    }
    if (step === 2 && !d.goals.length) e.goals = 'Pilih minimal satu tujuan.';
    if (step === 3 && !d.services.length) e.services = 'Pilih minimal satu layanan.';
    if (step === 4 && d.needs.trim().length < 10) e.needs = 'Ceritakan kebutuhan Anda (min. 10 karakter).';
    if (step === 6 && !d.consent) e.consent = 'Persetujuan pemrosesan data diperlukan untuk merespons permintaan.';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const go = (n: number) => { navigated.current = true; setDir(n > i ? 1 : -1); setI(n); };
  const next = () => { if (validate(i)) go(i + 1); };
  const submit = () => {
    if (!validate(6)) { go(6); return; }
    setBusy(true);
    submitLead({ name: `${d.pic} — ${d.company}`, contact: `${d.channel}: ${d.contact}`, business: [d.industry, d.location].filter(Boolean).join(' · '), services: d.services, needs: [d.goals.join(', '), d.needs, d.platforms, d.schedule, d.timeline].filter(Boolean).join('\n'), budget: d.budget, consent: d.consent, website: hp, startedAt: started.current })
      .then((r) => {
        if (!r.ok) { setErrors((e) => ({ ...e, submit: r.reason === 'rate' ? 'Terlalu banyak kiriman dalam satu jam. Coba lagi nanti atau hubungi kami lewat WhatsApp.' : 'Brief belum terkirim. Periksa koneksi lalu coba lagi, atau hubungi kami lewat WhatsApp.' })); return; }
        setDemo(r.demo);
        setSent(r.demo ? `DEMO-${Math.random().toString(36).slice(2, 7).toUpperCase()}` : r.ref ?? 'TERKIRIM');
      })
      .catch(() => setErrors((e) => ({ ...e, submit: 'Brief belum terkirim. Coba lagi atau hubungi kami lewat WhatsApp.' })))
      .finally(() => setBusy(false));
  };

  const navigated = useRef(false);
  const focusFirst = () => { if (navigated.current) panel.current?.querySelector<HTMLElement>('input, select, textarea')?.focus({ preventScroll: true }); };
  useEffect(() => { if (sent && burst.current && !reduce) drawOn(burst.current); }, [sent, reduce]);

  if (sent) {
    return (
      <HoverLiftCard interactive={false} className={s.success} role="status" aria-live="polite">
        <Doodle name="doodle_check_burst" size={120} ref={burst} />
        {demo && <span className="demo-badge">DATA DEMO · tidak terkirim</span>}
        <h2 className="display" style={{ margin: 0, fontSize: 30 }}>Brief tersimpan di pratinjau</h2>
        <p>Pada versi produksi pesan ini menjadi: “Permintaan Anda berhasil dicatat. Nomor referensi: {'{lead_reference}'}.” Saat ini formulir belum terhubung ke backend, sehingga data <strong>tidak dikirim</strong> ke tim.</p>
        <p className={s.ref}>Referensi pratinjau: <code>{sent}</code></p>
        <Button onClick={() => { setSent(null); go(0); }} variant="secondary">Isi brief baru</Button>
      </HoverLiftCard>
    );
  }

  const variants = {
    enter: (dd: number) => (reduce ? { opacity: 0 } : { opacity: 0, x: dd * 40 }),
    center: { opacity: 1, x: 0 },
    exit: (dd: number) => (reduce ? { opacity: 0 } : { opacity: 0, x: dd * -40 }),
  };

  return (
    <div className={s.wrap}>
      <ol className={s.stepper} aria-label="Langkah Smart Brief">
        {steps.map((st, k) => (
          <li key={st} className={s.step} data-state={k < i ? 'done' : k === i ? 'current' : 'todo'}>
            <button type="button" onClick={() => k < i && go(k)} disabled={k > i} aria-current={k === i ? 'step' : undefined} className={s.stepBtn}>
              <span className={s.stepNo}>{k < i ? '✓' : k + 1}</span>
              <span className={s.stepLabel}>{st}</span>
            </button>
            {k === i && <motion.span layoutId="brief-active" className={s.stepLine} transition={{ duration: duration.toggle, ease: bezier.out }} />}
          </li>
        ))}
      </ol>

      <HoverLiftCard interactive={false} className={s.panel}>
        <form noValidate onSubmit={(e) => { e.preventDefault(); if (i < 7) next(); else submit(); }} aria-labelledby={headingId}>
          <div className={s.panelHead}>
            <p className={s.count}>Langkah {i + 1} dari {steps.length}</p>
            <h2 id={headingId} className="display" style={{ margin: 0, fontSize: 26 }}>{steps[i]}</h2>
          </div>
          <div className={s.viewport}>
            <AnimatePresence mode="wait" custom={dir} initial={false}>
              <motion.div key={i} ref={panel} custom={dir} variants={variants} initial="enter" animate="center" exit="exit" onAnimationComplete={(def) => def === 'center' && focusFirst()} transition={{ duration: duration.toggle, ease: bezier.out }} className={s.fields}>
                {i === 0 && (<>
                  <TextField label="Nama perusahaan / toko" required icon={<Building2 size={18} />} value={d.company} onChange={(e) => set('company', e.target.value)} error={errors.company} autoComplete="organization" />
                  <TextField label="Nama PIC" required icon={<User size={18} />} value={d.pic} onChange={(e) => set('pic', e.target.value)} error={errors.pic} autoComplete="name" />
                  <SelectField label="Kanal kontak pilihan" required value={d.channel} onChange={(e) => set('channel', e.target.value)} options={channels} error={errors.channel} />
                  <TextField label={d.channel === 'email' ? 'Email' : 'Nomor kontak'} required type={d.channel === 'email' ? 'email' : 'tel'} icon={d.channel === 'email' ? <Mail size={18} /> : <Phone size={18} />} value={d.contact} onChange={(e) => set('contact', e.target.value)} error={errors.contact} autoComplete={d.channel === 'email' ? 'email' : 'tel'} />
                </>)}
                {i === 1 && (<>
                  <SelectField label="Industri" value={d.industry} onChange={(e) => set('industry', e.target.value)} options={industries} />
                  <TextField label="Lokasi layanan (opsional)" value={d.location} onChange={(e) => set('location', e.target.value)} />
                  <TextField label="Website / media sosial saat ini (opsional)" value={d.links} onChange={(e) => set('links', e.target.value)} placeholder="https://…" className={s.full} />
                </>)}
                {i === 2 && (
                  <fieldset className={s.full} style={{ border: 0, padding: 0, margin: 0 }} aria-describedby={errors.goals ? 'goals-err' : undefined}>
                    <legend className="sr-only">Tujuan</legend>
                    <div className={s.choices}>{goals.map((g) => <ChoiceCard key={g} name="goals" value={g} checked={d.goals.includes(g)} onChange={toggle('goals')} title={g} />)}</div>
                    {errors.goals && <p id="goals-err" role="alert" className={s.err}>{errors.goals}</p>}
                  </fieldset>
                )}
                {i === 3 && (
                  <fieldset className={s.full} style={{ border: 0, padding: 0, margin: 0 }} aria-describedby={errors.services ? 'svc-err' : undefined}>
                    <legend className="sr-only">Layanan</legend>
                    <div className={s.choices}>{services.map((sv) => { const I = serviceIcons[sv.icon]; return <ChoiceCard key={sv.slug} name="services" value={sv.slug} checked={d.services.includes(sv.slug)} onChange={toggle('services')} title={sv.title} description={sv.short} icon={<I size={22} />} />; })}</div>
                    {errors.services && <p id="svc-err" role="alert" className={s.err}>{errors.services}</p>}
                  </fieldset>
                )}
                {i === 4 && (<>
                  <div className={s.full}><TextArea label="Kebutuhan & contoh proyek" value={d.needs} onChange={(e) => set('needs', e.target.value)} error={errors.needs} /></div>
                  <TextField label="Platform (opsional)" value={d.platforms} onChange={(e) => set('platforms', e.target.value)} placeholder="Instagram, TikTok, website…" />
                  <TextField label="Jadwal / tenggat (opsional)" value={d.schedule} onChange={(e) => set('schedule', e.target.value)} />
                </>)}
                {i === 5 && (<>
                  <SelectField label="Kisaran anggaran (preferensi)" value={d.budget} onChange={(e) => set('budget', e.target.value)} options={budgets} hint="Bukan kewajiban angka presisi." />
                  <SelectField label="Timeline" value={d.timeline} onChange={(e) => set('timeline', e.target.value)} options={timelines} />
                </>)}
                {i === 6 && (
                  <div className={s.full} style={{ display: 'grid', gap: 16 }}>
                    <Checkbox checked={d.consent} onChange={(v) => set('consent', v)} error={errors.consent}>Saya setuju data ini diproses untuk merespons permintaan konsultasi. <span style={{ color: 'var(--coral-ink)' }}>*</span></Checkbox>
                    <Checkbox checked={d.promo} onChange={(v) => set('promo', v)}>Saya bersedia menerima info promosi (opsional, dapat berhenti kapan saja).</Checkbox>
                    <p className={s.legal}>Kebijakan privasi sedang ditinjau legal (D-15) dan akan ditautkan sebelum produksi.</p>
                  </div>
                )}
                {i === 7 && (
                  <dl className={`${s.full} ${s.review}`}>
                    <dt>Usaha</dt><dd>{d.company} · {d.pic}</dd>
                    <dt>Kontak</dt><dd>{channels.find((c) => c.value === d.channel)?.label}: {d.contact}</dd>
                    <dt>Industri</dt><dd>{d.industry || '—'}</dd>
                    <dt>Tujuan</dt><dd>{d.goals.join(', ')}</dd>
                    <dt>Layanan</dt><dd>{d.services.map((x) => services.find((v) => v.slug === x)?.title).join(', ')}</dd>
                    <dt>Kebutuhan</dt><dd style={{ whiteSpace: 'pre-wrap' }}>{d.needs}</dd>
                    <dt>Budget</dt><dd>{d.budget || '—'} · {d.timeline || '—'}</dd>
                    <dt>Persetujuan</dt><dd>Pemrosesan: Ya · Promosi: {d.promo ? 'Ya' : 'Tidak'}</dd>
                  </dl>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
          <div className={s.actions}>
            <Button variant="tertiary" onClick={() => go(i - 1)} disabled={i === 0}>Kembali</Button>
            {i < 7 ? <Button type="submit" arrow>Lanjutkan</Button> : <Button type="submit" arrow loading={busy}>Kirim Brief</Button>}
            {errors.submit && <p role="alert" className={s.err}>{errors.submit}</p>}
            <div aria-hidden="true" style={{ position: 'absolute', left: -9999, width: 1, height: 1, overflow: 'hidden' }}><label>Website<input tabIndex={-1} autoComplete="off" name="website" value={hp} onChange={(e) => setHp(e.target.value)} /></label></div>
          </div>
        </form>
      </HoverLiftCard>
    </div>
  );
}
