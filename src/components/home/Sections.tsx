'use client';

import Image from 'next/image';
import { ArrowRight, BadgeCheck, BarChart3, Briefcase, CheckCircle2, Code2, Database, FolderKanban, Globe, Layers, LayoutTemplate, Megaphone, Monitor, ReceiptText, Settings2, ShieldCheck, Users, Workflow, Zap } from 'lucide-react';
import { Doodle } from '@/components/doodle/Doodle';
import { ScrollReveal } from '@/components/motion/ScrollReveal';
import { AnimatedAccordion, Button, HoverLiftCard } from '@/components/motion';
import { serviceArt } from '@/components/public/blocks';
import { AnimIcon } from '@/components/icons/AnimIcon';
import { Illustrated } from '@/components/icons/Illustrated';
import { clientSteps, consultHref, ecosystem, homePackages, modules, whyUs } from '@/content/site';
import { faqs, packages, quotationDisclaimer, services } from '@/content/services';
import { evidenceLabel, portfolio } from '@/content/portfolio';
import { WhatsAppButton } from '@/components/layout/WhatsAppButton';
import s from './sections.module.css';

const featureIcons: Record<string, React.ComponentType<{ size?: number; 'aria-hidden'?: boolean }>> = {
  'Website Company': Globe, 'Landing Page': LayoutTemplate, 'Digital Campaign': Megaphone, 'Tracking & Optimization': BarChart3,
  'Manajemen Project': FolderKanban, 'Manajemen Tim': Users, 'Manajemen Klien': Briefcase, 'Produksi & Reporting': BarChart3,
  'Sistem Operasional': Settings2, 'Integrasi & Otomasi': Workflow, 'Manajemen Data': Database, 'Solusi Kustom': Code2,
};
const moduleIcons = { website: Monitor, os: Layers, custom: Code2 } as const;

export function SectionTitle({ children, kicker }: { children: React.ReactNode; kicker?: string }) {
  return (
    <div className={s.titleRow} data-reveal>
      <Doodle name="doodle_crown" size={44} draw />
      <div>
        <h2 className={`display ${s.h2}`}>{children}</h2>
        {kicker && <p className={s.kicker}>{kicker}</p>}
      </div>
    </div>
  );
}

/* SECTION B — Modul & Layanan (ecosystem board, bottom row) */
export function ModulesSection() {
  return (
    <ScrollReveal className={s.section} id="layanan" aria-labelledby="modules-title">
      <div className="container">
        <SectionTitle kicker="Tiga modul utama untuk mempercepat pertumbuhan bisnis dengan teknologi, kreativitas, dan sistem yang terintegrasi.">
          <span id="modules-title">Modul &amp; Layanan KILLUASURYA.TECH</span>
        </SectionTitle>
        <div className={s.modules}>
          {modules.map((m) => {
            const Icon = moduleIcons[m.key];
            return (
              <HoverLiftCard key={m.key} as="article" className={s.module} style={{ ['--tint' as string]: m.tint, ['--accent' as string]: m.accent }} data-reveal>
                <div className={s.moduleHead}>
                  <span className={s.moduleIcon}><Icon size={30} aria-hidden /></span>
                  <div>
                    <h3 className={`display ${s.moduleTitle}`}>{m.title}</h3>
                    <span className={s.moduleTag}>{m.tag}</span>
                  </div>
                  <Image src={`/assets/killuasurya/creative/04_OBJECTS/${m.object}`} alt="" width={112} height={112} className={s.moduleObj} />
                </div>
                <p className={s.moduleBody}>{m.body}</p>
                <p className={s.modulePlain}>{m.plain}</p>
                <ul className={s.features}>
                  {m.features.map((f) => {
                    const FI = featureIcons[f] ?? Zap;
                    return <li key={f}><FI size={18} aria-hidden />{f}</li>;
                  })}
                </ul>
                <a href="/services" className={s.moduleLink} aria-label={`Lihat detail ${m.title}`}><ArrowRight size={20} aria-hidden="true" /></a>
              </HoverLiftCard>
            );
          })}
        </div>

        {/* Five service lines (the same five capabilities shown in the hero) — each links to its detail page. */}
        <h3 className={`display ${s.subHead}`} data-reveal>Lima lini layanan</h3>
        <ul className={s.services5}>
          {services.map((sv) => {
            return (
              <li key={sv.slug} data-reveal>
                <a href={`/services/${sv.slug}`} className={s.svc} data-ai-host>
                  <Illustrated name={serviceArt[sv.icon]} size={46} />
                  <span className={s.svcText}><strong>{sv.title}</strong><small>{sv.short}</small></span>
                  <ArrowRight size={18} aria-hidden="true" className={s.svcArrow} />
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </ScrollReveal>
  );
}

/* SECTION B2 — Kenapa KILLUASURYA.TECH (existing commitments, no new claims) */
const whyFx = { layers: 'bounce', proof: 'pulse', price: 'wiggle', consent: 'tilt' } as const;
const whyIcons = { layers: Layers, proof: BadgeCheck, price: ReceiptText, consent: ShieldCheck } as const;
export function WhySection() {
  return (
    <ScrollReveal className={s.section} id="kenapa" aria-labelledby="why-title">
      <div className="container">
        <SectionTitle kicker="Yang kami pegang di setiap proyek.">
          <span id="why-title">Kenapa KILLUASURYA.TECH?</span>
        </SectionTitle>
        <ul className={s.why}>
          {whyUs.map((w) => {
            const Icon = whyIcons[w.icon];
            return (
              <HoverLiftCard key={w.title} as="li" className={s.whyCard} data-reveal data-ai-host>
                <AnimIcon icon={Icon} size={26} tile color={w.color} fx={whyFx[w.icon]} />
                <h3 className={`display ${s.whyTitle}`}>{w.title}</h3>
                <p className={s.whyBody}>{w.body}</p>
              </HoverLiftCard>
            );
          })}
        </ul>
      </div>
    </ScrollReveal>
  );
}

/* SECTION B3 — Portofolio pilihan (honest evidence labels, D-11) */
export function WorkSection() {
  return (
    <ScrollReveal className={s.section} id="portofolio" aria-labelledby="work-title">
      <div className="container">
        <div className={s.headRow}>
          <SectionTitle kicker="Sistem dan unit ekosistem yang kami bangun. Label menunjukkan status bukti sebenarnya.">
            <span id="work-title">Portofolio pilihan</span>
          </SectionTitle>
          <div data-reveal><Button href="/portfolio" variant="secondary" size="sm" arrow>Lihat semua</Button></div>
        </div>
        <ul className={s.work}>
          {portfolio.slice(0, 3).map((p) => (
            <HoverLiftCard key={p.slug} as="li" className={s.workCard} data-reveal>
              <div className={s.workArt}><Image src={`/assets/killuasurya/creative/04_OBJECTS/${p.object}`} alt="" width={120} height={120} /></div>
              <div className={s.workPills}>
                <span className={s.pill}>{p.industry}</span>
                <span className={`${s.pill} ${s.pillPurple}`}>{evidenceLabel[p.evidence]}</span>
              </div>
              <h3 className={`display ${s.workTitle}`}>{p.title}</h3>
              <p className={s.workBody}>{p.summary}</p>
            </HoverLiftCard>
          ))}
        </ul>
        <p className={s.note} data-reveal>Belum ada studi kasus klien yang disetujui untuk publikasi — nama klien, angka, dan hasil akan tampil setelah disetujui.</p>
      </div>
    </ScrollReveal>
  );
}

/* SECTION C — Diagram Ekosistem (FLOWCHART_MERMAID: Ekosistem, exact nodes) */
export function EcosystemSection() {
  return (
    <ScrollReveal className={s.section} id="ekosistem" aria-labelledby="eco-title">
      <div className="container">
        <SectionTitle kicker="Alur hubungan portal, unit bisnis, dan modul layanan dalam ekosistem.">
          <span id="eco-title">Diagram Ekosistem</span>
        </SectionTitle>
        <div className={s.ecoCard} data-reveal>
          <div className={s.ecoParent} data-reveal>
            <Monitor size={28} aria-hidden="true" />
            <div><strong className="display">{ecosystem.parent.title}</strong><span>{ecosystem.parent.sub}</span></div>
          </div>
          <svg className={s.ecoLines} viewBox="0 0 1000 60" preserveAspectRatio="none" aria-hidden="true" data-line>
            <path d="M500 0 V28 M125 28 H875 M125 28 V60 M375 28 V60 M625 28 V60 M875 28 V60" stroke="#C7F60C" strokeWidth="3" fill="none" vectorEffect="non-scaling-stroke" />
          </svg>
          <ol className={s.ecoUnits}>
            {ecosystem.units.map((u) => (
              <li key={u.title} className={`${s.ecoUnit} ${'primary' in u && u.primary ? s.ecoPrimary : ''}`} style={{ ['--tint' as string]: u.tint }} data-reveal>
                <strong className="display">{u.title}</strong>
                <span>{u.sub}</span>
              </li>
            ))}
          </ol>
          <svg className={`${s.ecoLines} ${s.ecoLines2}`} viewBox="0 0 1000 60" preserveAspectRatio="none" aria-hidden="true" data-line>
            <path d="M875 0 V28 M375 28 H875 M375 28 V60 M625 28 V60 M875 28 V60" stroke="#C7F60C" strokeWidth="3" fill="none" vectorEffect="non-scaling-stroke" />
          </svg>
          <ol className={s.ecoChildren}>
            {ecosystem.children.map((c) => (
              <li key={c} className={s.ecoChild} data-reveal><strong className="display">{c}</strong></li>
            ))}
          </ol>
          <p className={s.note}>Status unit ekosistem merupakan referensi studi kasus dan menunggu verifikasi publikasi (D-11).</p>
        </div>
      </div>
    </ScrollReveal>
  );
}

/* SECTION D — Cara kerja: client-facing grouping of the Lead-to-Project flowchart (same order);
   the exact 10-node flow (with the revision loop) lives on /case-studies. */
export function ProcessSection() {
  return (
    <ScrollReveal className={s.section} id="proses" aria-labelledby="process-title">
      <div className="container">
        <SectionTitle kicker="Lima langkah dari obrolan pertama sampai laporan — terukur dan transparan.">
          <span id="process-title">Cara kerja kami</span>
        </SectionTitle>
        <div className={s.flow5}>
          <svg className={s.flowLine} viewBox="0 0 1000 8" preserveAspectRatio="none" aria-hidden="true" data-line>
            <path d="M0 4 H1000" stroke="#8238F5" strokeWidth="4" fill="none" vectorEffect="non-scaling-stroke" />
          </svg>
          <ol className={s.flowSteps}>
            {clientSteps.map((st, i) => (
              <li key={st.title} className={s.flowStep} data-reveal>
                <span className={s.flowNo}>{i + 1}</span>
                <h3 className={s.flowTitle}>{st.title}</h3>
                <p className={s.flowBody}>{st.body}</p>
              </li>
            ))}
          </ol>
        </div>
        <p className={s.note} data-reveal>
          Ringkasan dari alur Lead-to-Project 10 tahap. <a href="/case-studies" className={s.inlineLink}>Lihat alur lengkap</a>
        </p>
      </div>
    </ScrollReveal>
  );
}

/* SECTION D2 — Paket teaser (PRD §04; prices stay "Konsultasi untuk Penawaran", D-05) */
export function PackagesSection() {
  const list = homePackages.map((code) => packages.find((p) => p.code === code)!).filter(Boolean);
  return (
    <ScrollReveal className={s.section} id="paket" aria-labelledby="pkg-title">
      <div className="container">
        <div className={s.headRow}>
          <SectionTitle kicker={`Mulai dari yang paling sesuai. ${packages.length} paket tersedia — dari UMKM sampai enterprise.`}>
            <span id="pkg-title">Paket populer</span>
          </SectionTitle>
          <div data-reveal><Button href="/pricing" variant="secondary" size="sm" arrow>Semua paket</Button></div>
        </div>
        <ul className={s.pkgs}>
          {list.map((p) => {
            const featured = 'featured' in p && p.featured;
            return (
              <HoverLiftCard key={p.code} as="li" className={`${s.pkg} ${featured ? s.pkgFeatured : ''}`} data-reveal>
                <div className={s.workPills}>
                  <span className={`${s.pill} ${s.pillLime}`}>{p.code}</span>
                  <span className={s.pill}>{p.who}</span>
                  {featured && <span className={`${s.pill} ${s.pillPurple}`}>Unggulan</span>}
                </div>
                <h3 className={`display ${s.workTitle}`}>{p.name}</h3>
                <p className={s.pkgPrice}>Konsultasi untuk Penawaran</p>
                <ul className={s.pkgList}>
                  <li><CheckCircle2 size={18} aria-hidden="true" /><span>{p.mechanism}</span></li>
                  <li><CheckCircle2 size={18} aria-hidden="true" /><span>Pengukuran: {p.measure}</span></li>
                </ul>
                <Button href={`/build-your-package?package=${p.code}`} variant={featured ? 'primary' : 'secondary'} size="sm" arrow>Pilih {p.code}</Button>
              </HoverLiftCard>
            );
          })}
        </ul>
        <p className={s.note} data-reveal>{quotationDisclaimer} Bingung memilih? <a href="/build-your-package" className={s.inlineLink}>Rancang paket sendiri</a></p>
      </div>
    </ScrollReveal>
  );
}

/* SECTION D3 — FAQ singkat (same answers as /insights) */
export function FaqSection() {
  return (
    <ScrollReveal className={s.section} id="faq" aria-labelledby="faq-title">
      <div className={`container ${s.faqWrap}`}>
        <SectionTitle kicker="Jawaban singkat untuk pertanyaan yang paling sering kami terima.">
          <span id="faq-title">Pertanyaan umum</span>
        </SectionTitle>
        <div data-reveal><AnimatedAccordion items={faqs.map((f) => ({ q: f.q, a: f.a }))} /></div>
        <p className={s.note} data-reveal><a href="/faq" className={s.inlineLink}>Lihat semua FAQ</a></p>
      </div>
    </ScrollReveal>
  );
}

/* SECTION E — Consultation CTA */
export function ConsultSection() {
  return (
    <ScrollReveal className={s.section} id="konsultasi" aria-labelledby="cta-title">
      <div className="container">
        <div className={s.cta} data-reveal>
          <div className={s.ctaCopy}>
            <h2 id="cta-title" className={`display ${s.ctaTitle}`}>
              Siap tumbuh <span className={s.ctaHi}>bareng?</span>
            </h2>
            <p>Chat langsung lewat WhatsApp, atau ceritakan kebutuhan Anda lewat Smart Brief. Tim kami akan menyiapkan discovery &amp; estimasi.</p>
            <div className={s.ctaBtns}>
              <WhatsAppButton />
              <Button href={consultHref} variant="secondary" arrow>Isi Smart Brief</Button>
            </div>
          </div>
          <div className={s.ctaArt} data-parallax="24">
            <Doodle name="doodle_check_burst" size={84} className={s.ctaBurst} draw />
            <Doodle name="arrow_curved" size={110} className={s.ctaArrow} draw />
            <Image src="/assets/killuasurya/mascot/hero-idea-thinking.png" alt="" width={1600} height={1280} className={s.ctaMascot} sizes="(max-width: 767px) 80vw, 380px" />
          </div>
        </div>
      </div>
    </ScrollReveal>
  );
}
