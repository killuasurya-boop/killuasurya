import Image from 'next/image';
import { Illustrated } from '@/components/icons/Illustrated';
import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowRight } from 'lucide-react';
import { PageHero } from '@/components/public/PageHero';
import { FlowStrip, Note, SectionHead, pageStyles as s, serviceArt, serviceIcons } from '@/components/public/blocks';
import { ScrollReveal } from '@/components/motion/ScrollReveal';
import { Button, HoverLiftCard } from '@/components/motion';
import { WhatsAppButton } from '@/components/layout/WhatsAppButton';
import { contractLines, opsFlows, services, thirdPartyCosts } from '@/content/services';

export const metadata: Metadata = { title: 'Layanan — KILLUASURYA.TECH', description: 'Digital Growth, Creative Studio, Website, Custom Business System, dan AI & Automation.' };

export default function ServicesPage() {
  return (
    <>
      <PageHero
        kicker="Layanan"
        title="Satu partner untuk"
        highlight="tumbuh digital"
        mascot
        body={<p>Dari strategi konten, iklan dan pelanggan, hingga website serta sistem operasional — kami membantu bisnis membangun ekosistem digital yang lebih terhubung.</p>}
      >
        <div className={s.ctaRow}>
          <Button href="/contact" arrow>Konsultasikan Bisnis Anda</Button>
          <WhatsAppButton topic="layanan" variant="secondary" />
          <Button href="/build-your-package" variant="secondary">Rancang Paket</Button>
        </div>
      </PageHero>

      <ScrollReveal className={s.section} aria-labelledby="svc-title">
        <div className="container">
          <SectionHead id="svc-title" title="Pilih Solusi" sub="Lima lini layanan. Setiap paket memiliki deliverable terukur, revisi, dan bukti selesai yang jelas." />
          <div className={s.grid3}>
            {services.map((sv) => {
              const Icon = serviceIcons[sv.icon];
              return (
                <HoverLiftCard key={sv.slug} as="article" className={s.card} data-reveal data-ai-host>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                    <Illustrated name={serviceArt[sv.icon]} size={54} />
                    <Image src={`/assets/killuasurya/creative/04_OBJECTS/${sv.object}`} alt="" width={84} height={84} />
                  </div>
                  <h3 className={`display ${s.cardTitle}`}>{sv.title}</h3>
                  <span className={s.pill} style={{ alignSelf: 'flex-start' }}>{sv.model}</span>
                  <p className={s.cardBody}>{sv.headline} {sv.body}</p>
                  <Link href={`/services/${sv.slug}`} className={s.pill + ' ' + s.pillLime} style={{ alignSelf: 'flex-start', minHeight: 44, padding: '0 18px', marginTop: 'auto' }}>
                    {sv.cta} <ArrowRight size={16} aria-hidden="true" />
                  </Link>
                </HoverLiftCard>
              );
            })}
          </div>
        </div>
      </ScrollReveal>

      <ScrollReveal className={s.section} aria-labelledby="contract-title">
        <div className="container">
          <SectionHead id="contract-title" title="Yang dijual vs. bukti selesai" sub="Setiap layanan punya deliverable terukur — bukan janji otomatis." />
          <div className={s.tableWrap} data-reveal tabIndex={0} role="region" aria-label="Tabel (dapat digeser)">
            <table className={s.table}>
              <thead><tr><th scope="col">Lini</th><th scope="col">Masalah yang diselesaikan</th><th scope="col">Bukti selesai</th></tr></thead>
              <tbody>{contractLines.map((c) => <tr key={c.line}><th scope="row" style={{ textAlign: 'left', padding: '14px 16px' }}>{c.line}</th><td>{c.problem}</td><td>{c.proof}</td></tr>)}</tbody>
            </table>
          </div>
          <div style={{ marginTop: 16 }} data-reveal>
            <Note>Dipisahkan pada quotation: {thirdPartyCosts.join(', ')}.</Note>
          </div>
        </div>
      </ScrollReveal>

      <ScrollReveal className={s.section} aria-labelledby="flow-title">
        <div className="container">
          <SectionHead id="flow-title" title="Alur Kerja Lead-to-Project" sub="Dari brief sampai retensi, dengan approval Owner sebelum penawaran dikirim." />
          <FlowStrip label="Alur Lead-to-Project" steps={opsFlows[0].steps} loop={opsFlows[0].loop} />
        </div>
      </ScrollReveal>
    </>
  );
}
