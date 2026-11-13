'use client';

import Image from 'next/image';
import { AnimIcon } from '@/components/icons/AnimIcon';
import { Illustrated } from '@/components/icons/Illustrated';
import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ArrowLeft, ArrowRight, Briefcase, CheckCircle2, Coffee, FileText, LayoutDashboard, Network, Printer, RotateCcw, Sprout, Store, Truck } from 'lucide-react';
import { ScrollReveal } from '@/components/motion/ScrollReveal';
import { Button, HoverLiftCard } from '@/components/motion';
import { bezier, duration } from '@/motion/tokens';
import { painPoints, quiz, solutions } from '@/content/marketing';
import { packages } from '@/content/services';
import { SectionTitle } from './Sections';
import s from './marketing.module.css';

const painArt = { map: 'pin', calendar: 'creative', ads: 'growth', chat: 'chat', page: 'website', ops: 'system' } as const;
export const solutionIcons = { coffee: Coffee, store: Store, printer: Printer, truck: Truck, briefcase: Briefcase, sprout: Sprout, network: Network } as const;

/* SECTION A2 — "Masalah apa yang Anda alami?" (PRD §03.7 problems → service line) */
export function PainSection() {
  return (
    <ScrollReveal className={s.section} id="masalah" aria-labelledby="pain-title">
      <div className="container">
        <SectionTitle kicker="Pilih yang paling mirip dengan kondisi bisnis Anda — kami tunjukkan jalan keluarnya.">
          <span id="pain-title">Masalah apa yang Anda alami?</span>
        </SectionTitle>
        <ul className={s.pains}>
          {painPoints.map((p) => {
            return (
              <li key={p.problem} data-reveal>
                <a href={p.href} className={s.pain} style={{ ['--c' as string]: p.color }} data-ai-host data-spot>
                  <Illustrated name={painArt[p.icon]} size={72} />
                  <strong className={s.painQ}>{p.problem}</strong>
                  <span className={s.painA}>{p.answer}</span>
                  <span className={s.painLink}>{p.service} <ArrowRight size={16} aria-hidden="true" /></span>
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </ScrollReveal>
  );
}

/* SECTION B1 — "Cocok untuk bisnis Anda" (PRD §12 industries → /solusi/[slug]) */
export function IndustriesSection() {
  return (
    <ScrollReveal className={s.section} id="industri" aria-labelledby="ind-title">
      <div className="container">
        <SectionTitle kicker="Setiap jenis usaha punya kebutuhan berbeda. Pilih yang paling dekat dengan bisnis Anda.">
          <span id="ind-title">Cocok untuk bisnis Anda</span>
        </SectionTitle>
        <ul className={s.inds}>
          {solutions.map((x) => {
            const Icon = solutionIcons[x.icon];
            return (
              <li key={x.slug} data-reveal>
                <a href={`/solusi/${x.slug}`} className={s.ind} data-ai-host>
                  <span className={s.indIcon}><AnimIcon icon={Icon} size={26} fx="bounce" /></span>
                  <strong>{x.name}</strong>
                  <small>{x.short}</small>
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </ScrollReveal>
  );
}

/* SECTION B4 — "Lihat sendiri sistemnya": real screenshot of the Agency OS preview (demo data) + live demo links */
export function DemoSection() {
  return (
    <ScrollReveal className={s.section} id="demo" aria-labelledby="demo-title">
      <div className="container">
        <div className={s.demo} data-reveal>
          <div className={s.demoCopy}>
            <span className={s.badge}>Bisa dicoba langsung</span>
            <h2 id="demo-title" className={`display ${s.demoTitle}`}>Jangan cuma percaya kata-kata — <span className={s.hi}>coba sendiri.</span></h2>
            <p>Buka demo sistem kerja kami: dashboard, CRM, proyek, produksi konten, sampai portal klien. Semua angka di dalamnya adalah data contoh.</p>
            <ul className={s.demoList}>
              <li><LayoutDashboard size={18} aria-hidden="true" /><span><strong>Agency OS</strong> — cara tim kami mengelola pekerjaan Anda</span></li>
              <li><FileText size={18} aria-hidden="true" /><span><strong>Portal Klien</strong> — yang Anda lihat sebagai klien: progres, approval, dokumen</span></li>
            </ul>
            <div className={s.demoBtns}>
              <Button href="/os" arrow>Coba demo Agency OS</Button>
              <Button href="/portal" variant="secondary">Lihat Portal Klien</Button>
            </div>
          </div>
          <a href="/os" className={s.frame} data-parallax="16">
            <span className={s.frameBar}><i aria-hidden="true" /><i aria-hidden="true" /><i aria-hidden="true" /><em>Buka demo Agency OS · DATA DEMO</em></span>
            <Image src="/assets/killuasurya/screens/os-dashboard-dark.png" alt="Tampilan dashboard Agency OS berisi data contoh" width={1440} height={900} className={s.shotDark} sizes="(max-width: 1023px) 92vw, 620px" />
            <Image src="/assets/killuasurya/screens/os-dashboard-light.png" alt="Tampilan dashboard Agency OS berisi data contoh" width={1440} height={900} className={s.shotLight} sizes="(max-width: 1023px) 92vw, 620px" />
          </a>
        </div>
      </div>
    </ScrollReveal>
  );
}

/* SECTION D1 — Quiz "Cek kebutuhan bisnis Anda" → package recommendation → Smart Brief (prefilled) */
export function QuizSection() {
  const reduce = useReducedMotion();
  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState<string | null>(null);
  const [ind, setInd] = useState<string | null>(null);
  const [scale, setScale] = useState<string | null>(null);

  const g = quiz.goals.find((x) => x.id === goal);
  const sol = solutions.find((x) => x.slug === ind);
  const sc = quiz.scales.find((x) => x.id === scale);
  const pkg = packages.find((p) => p.code === g?.pkg);
  const big = scale === 'cabang';
  const reset = () => { setStep(0); setGoal(null); setInd(null); setScale(null); };
  const briefHref = g && pkg ? `/contact?package=${pkg.code}&service=${g.service}&quiz=${encodeURIComponent([g.label, sol?.name ?? 'Lainnya', sc?.label ?? '-'].join('|'))}` : '/contact';

  const steps = [
    { q: 'Apa yang paling ingin Anda capai sekarang?', opts: quiz.goals.map((x) => ({ id: x.id, label: x.label })), val: goal, set: setGoal },
    { q: 'Jenis usaha Anda?', opts: [...solutions.map((x) => ({ id: x.slug, label: x.name })), { id: 'lainnya', label: 'Lainnya' }], val: ind, set: setInd },
    { q: 'Seberapa besar bisnis Anda saat ini?', opts: quiz.scales.map((x) => ({ id: x.id, label: x.label })), val: scale, set: setScale },
  ] as const;
  const cur = steps[step];
  const anim = reduce ? {} : { initial: { opacity: 0, x: 24 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -24 }, transition: { duration: duration.modal, ease: bezier.out } };

  return (
    <ScrollReveal className={s.section} id="cek-kebutuhan" aria-labelledby="quiz-title">
      <div className="container">
        <div className={s.quiz} data-reveal>
          <div className={s.quizHead}>
            <span className={s.badge}>3 pertanyaan · ± 30 detik</span>
            <h2 id="quiz-title" className={`display ${s.quizTitle}`}>Bingung mulai dari mana? <span className={s.hi}>Cek kebutuhan bisnis Anda.</span></h2>
            <p>Jawab tiga pertanyaan singkat, lalu lihat paket yang paling sesuai. Tanpa perlu isi data diri.</p>
          </div>
          <div className={s.quizBody} aria-live="polite">
            {step < 3 && (
              <div className={s.progress} role="progressbar" aria-label="Kemajuan cek kebutuhan" aria-valuemin={0} aria-valuemax={3} aria-valuenow={step}>
                <span style={{ transform: `scaleX(${(step + 1) / 3})` }} />
              </div>
            )}
            <AnimatePresence mode="wait" initial={false}>
              {cur ? (
                <motion.fieldset key={step} className={s.qset} {...anim}>
                  <legend className={s.q}><small>Pertanyaan {step + 1} dari 3</small>{cur.q}</legend>
                  <div className={s.opts}>
                    {cur.opts.map((o) => (
                      <button key={o.id} type="button" className={s.opt} aria-pressed={cur.val === o.id} onClick={() => { cur.set(o.id); setStep(step + 1); }}>
                        {o.label}
                      </button>
                    ))}
                  </div>
                  {step > 0 && <button type="button" className={s.back} onClick={() => setStep(step - 1)}><ArrowLeft size={16} aria-hidden="true" /> Kembali</button>}
                </motion.fieldset>
              ) : (
                <motion.div key="result" className={s.result} {...anim}>
                  <p className={s.resultKicker}>Rekomendasi awal untuk Anda</p>
                  <div className={s.resultHead}>
                    <span className={s.code}>{pkg?.code}</span>
                    <h3 className={`display ${s.resultTitle}`}>{pkg?.name}</h3>
                  </div>
                  <ul className={s.resultList}>
                    <li><CheckCircle2 size={18} aria-hidden="true" /><span><strong>Cara kerja:</strong> {pkg?.mechanism}</span></li>
                    <li><CheckCircle2 size={18} aria-hidden="true" /><span><strong>Yang diukur:</strong> {pkg?.measure}</span></li>
                    {sol && <li><CheckCircle2 size={18} aria-hidden="true" /><span><strong>Untuk {sol.name}:</strong> <a href={`/solusi/${sol.slug}`} className={s.link}>lihat solusi khusus</a></span></li>}
                    {big && <li><CheckCircle2 size={18} aria-hidden="true" /><span>Untuk beberapa cabang atau tim besar, tersedia juga <strong>ENTERPRISE</strong> dengan proposal khusus.</span></li>}
                  </ul>
                  <p className={s.resultNote}>Ini rekomendasi awal, bukan penawaran. Harga dan ruang lingkup ditetapkan setelah discovery.</p>
                  <div className={s.demoBtns}>
                    <Button href={briefHref} arrow>Lanjut konsultasi paket ini</Button>
                    <button type="button" className={s.back} onClick={reset}><RotateCcw size={16} aria-hidden="true" /> Ulangi</button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </ScrollReveal>
  );
}
