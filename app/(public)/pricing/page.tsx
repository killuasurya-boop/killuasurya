import type { Metadata } from 'next';
import { CheckCircle2 } from 'lucide-react';
import { PageHero } from '@/components/public/PageHero';
import { Note, SectionHead, pageStyles as s } from '@/components/public/blocks';
import { ScrollReveal } from '@/components/motion/ScrollReveal';
import { AnimatedAccordion, Button, HoverLiftCard } from '@/components/motion';
import { WhatsAppButton } from '@/components/layout/WhatsAppButton';
import { faqs, packages, quotationDisclaimer, thirdPartyCosts } from '@/content/services';

export const metadata: Metadata = { title: 'Pricing & Rate Card — KILLUASURYA.TECH', description: 'Paket jelas. Ruang lingkup transparan.' };

export default function PricingPage() {
  return (
    <>
      <PageHero kicker="Pricing & Rate Card" title="Paket jelas." highlight="Scope transparan." body={<p>Susun kebutuhan, perkirakan biaya dan terima proposal setelah discovery.</p>}>
        <div className={s.ctaRow}><Button href="/build-your-package" arrow>Rancang Paket</Button><WhatsAppButton topic="paket & harga" variant="secondary">Tanya harga via WhatsApp</WhatsAppButton></div>
      </PageHero>

      <ScrollReveal className={s.section} aria-labelledby="pk-title">
        <div className="container">
          <SectionHead id="pk-title" title="Struktur paket" sub="Harga ditampilkan sebagai “Konsultasi untuk Penawaran” sampai rate card Owner ditetapkan (D-05)." />
          <ul className={s.grid4} style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {packages.map((p) => (
              <HoverLiftCard key={p.code} as="li" className={s.card} data-reveal style={'featured' in p && p.featured ? { borderColor: 'var(--purple)', boxShadow: 'var(--glow-purple), var(--shadow-card)' } : undefined}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                  <span className={`${s.pill} ${s.pillLime}`}>{p.code}</span>
                  <span className={s.pill}>{p.who}</span>
                </div>
                <h3 className={`display ${s.cardTitle}`}>{p.name}</h3>
                <p style={{ margin: 0, fontWeight: 700, color: 'var(--purple-ink)' }}>Konsultasi untuk Penawaran</p>
                <ul className={s.list}>
                  <li><CheckCircle2 size={18} aria-hidden="true" /><span><strong>Mekanisme:</strong> {p.mechanism}</span></li>
                  <li><CheckCircle2 size={18} aria-hidden="true" /><span><strong>Pengukuran:</strong> {p.measure}</span></li>
                </ul>
                <Button href={`/build-your-package?package=${p.code}`} variant="secondary" size="sm" arrow style={{ marginTop: 'auto' }}>Pilih {p.code}</Button>
              </HoverLiftCard>
            ))}
          </ul>
          <div style={{ display: 'grid', gap: 12, marginTop: 24 }}>
            <div data-reveal><Note>{quotationDisclaimer}</Note></div>
            <div data-reveal><Note>Baris terpisah pada penawaran: {thirdPartyCosts.join(', ')}.</Note></div>
          </div>
        </div>
      </ScrollReveal>

      <ScrollReveal className={s.section} aria-labelledby="faq-title">
        <div className="container" style={{ maxWidth: 880 }}>
          <SectionHead id="faq-title" title="Pertanyaan umum" />
          <div data-reveal><AnimatedAccordion items={faqs.map((f) => ({ q: f.q, a: f.a }))} /></div>
        </div>
      </ScrollReveal>
    </>
  );
}
