import type { Metadata } from 'next';
import { PageHero } from '@/components/public/PageHero';
import { FlowStrip, SectionHead, pageStyles as s } from '@/components/public/blocks';
import { ScrollReveal } from '@/components/motion/ScrollReveal';
import { Button } from '@/components/motion';
import { WhatsAppButton } from '@/components/layout/WhatsAppButton';
import { ProcessSection } from '@/components/home/Sections';
import { opsFlows } from '@/content/services';

export const metadata: Metadata = { title: 'Proses Kerja — KILLUASURYA.TECH', description: 'Tahapan kerja dari konsultasi pertama sampai laporan: terukur, transparan, dan dengan approval yang jelas.' };

export default function ProcessPage() {
  return (
    <>
      <PageHero kicker="Our Process" title="Cara kami" highlight="bekerja" mascot body={<p>Setiap pekerjaan punya penanggung jawab, status, dan approval yang jelas — dari obrolan pertama sampai laporan.</p>}>
        <div className={s.ctaRow}><WhatsAppButton topic="proses kerja" /><Button href="/contact" variant="secondary" arrow>Isi Smart Brief</Button></div>
      </PageHero>
      <ProcessSection />
      {opsFlows.map((f) => (
        <ScrollReveal key={f.key} className={s.section} aria-labelledby={`pf-${f.key}`}>
          <div className="container">
            <SectionHead id={`pf-${f.key}`} title={f.title} sub={f.sub} />
            <FlowStrip label={`Alur ${f.title}`} steps={f.steps} loop={f.loop} />
          </div>
        </ScrollReveal>
      ))}
    </>
  );
}
