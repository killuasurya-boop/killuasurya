import type { Metadata } from 'next';
import { PageHero } from '@/components/public/PageHero';
import { pageStyles as s } from '@/components/public/blocks';
import { ScrollReveal } from '@/components/motion/ScrollReveal';
import { AnimatedAccordion, Button } from '@/components/motion';
import { WhatsAppButton } from '@/components/layout/WhatsAppButton';
import { faqs } from '@/content/services';

export const metadata: Metadata = { title: 'FAQ — KILLUASURYA.TECH', description: 'Jawaban atas pertanyaan yang paling sering ditanyakan calon klien: harga, biaya iklan, proses, dan portal klien.' };

const schema = JSON.stringify({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) });

export default function FaqPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: schema }} />
      <PageHero kicker="FAQ" title="Pertanyaan yang sering" highlight="ditanyakan" body={<p>Belum menemukan jawabannya? Tanya langsung — kami balas di jam kerja.</p>}>
        <div className={s.ctaRow}><WhatsAppButton topic="pertanyaan saya" /><Button href="/contact" variant="secondary" arrow>Isi Smart Brief</Button></div>
      </PageHero>
      <ScrollReveal className={s.section} aria-label="Daftar pertanyaan">
        <div className="container" style={{ maxWidth: 880 }}><div data-reveal><AnimatedAccordion items={faqs.map((f) => ({ q: f.q, a: f.a }))} /></div></div>
      </ScrollReveal>
    </>
  );
}
