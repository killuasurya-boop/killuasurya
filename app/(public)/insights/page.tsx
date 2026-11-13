import type { Metadata } from 'next';
import { PageHero } from '@/components/public/PageHero';
import { Note, SectionHead, pageStyles as s } from '@/components/public/blocks';
import { ScrollReveal } from '@/components/motion/ScrollReveal';
import { AnimatedAccordion, Button } from '@/components/motion';
import { faqs } from '@/content/services';

export const metadata: Metadata = { title: 'Insights & FAQ — KILLUASURYA.TECH' };

export default function InsightsPage() {
  return (
    <>
      <PageHero kicker="Insights & FAQ" title="Belajar, lalu" highlight="bertumbuh" body={<p>Artikel edukasi dan jawaban atas pertanyaan yang paling sering kami terima.</p>}>
        <Note>Artikel insight belum dipublikasikan — konten akan ditambahkan setelah disetujui Owner.</Note>
      </PageHero>
      <ScrollReveal className={s.section} aria-labelledby="faq-title">
        <div className="container" style={{ maxWidth: 880 }}>
          <SectionHead id="faq-title" title="FAQ" />
          <div data-reveal><AnimatedAccordion items={faqs.map((f) => ({ q: f.q, a: f.a }))} /></div>
          <div className={s.ctaRow} style={{ marginTop: 32 }} data-reveal><Button href="/contact" arrow>Mulai Konsultasi</Button></div>
        </div>
      </ScrollReveal>
    </>
  );
}
