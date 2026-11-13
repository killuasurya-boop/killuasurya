import type { Metadata } from 'next';
import { CheckCircle2 } from 'lucide-react';
import { PageHero } from '@/components/public/PageHero';
import { FlowStrip, SectionHead, pageStyles as s } from '@/components/public/blocks';
import { ScrollReveal } from '@/components/motion/ScrollReveal';
import { Button, HoverLiftCard } from '@/components/motion';
import { opsFlows, team } from '@/content/services';
import { EcosystemSection } from '@/components/home/Sections';

export const metadata: Metadata = { title: 'Tentang & Proses — KILLUASURYA.TECH' };

const principles = [
  'Eksekusi dan bukti — tanpa janji viral, ranking #1, atau penjualan pasti naik.',
  'Setiap paket memiliki deliverable terukur, revisi, dan bukti selesai.',
  'Kampanye pelanggan hanya berbasis izin (consent) dan jalur resmi.',
  'Harga transparan: biaya pihak ketiga dipisahkan pada penawaran.',
];

export default function AboutPage() {
  return (
    <>
      <PageHero kicker="Tentang & Proses" title="Your business deserves more than" highlight="just marketing." mascot body={<p>KILLUASURYA.TECH adalah agency digital marketing dan aplikasi kerja, bagian dari ekosistem SURYA.dev. Satu partner untuk Creative, Digital Growth, Customer Program, dan Business Technology.</p>}>
        <div className={s.ctaRow}><Button href="/contact" arrow>Hubungi Kami</Button><Button href="/case-studies" variant="secondary">Lihat Flowchart</Button></div>
      </PageHero>
      <ScrollReveal className={s.section} aria-labelledby="pr-title">
        <div className="container">
          <SectionHead id="pr-title" title="Prinsip kerja" />
          <HoverLiftCard interactive={false} className={s.card} data-reveal>
            <ul className={s.list}>{principles.map((p) => <li key={p}><CheckCircle2 size={18} aria-hidden="true" />{p}</li>)}</ul>
          </HoverLiftCard>
        </div>
      </ScrollReveal>
      <EcosystemSection />
      <ScrollReveal className={s.section} aria-labelledby="prod-title">
        <div className="container">
          <SectionHead id="prod-title" title="Proses produksi konten" sub="Siapa mengerjakan apa — dari strategi sampai analitik." />
          <FlowStrip label="Alur produksi konten" steps={opsFlows[1].steps} loop={opsFlows[1].loop} />
          <ul className={s.grid3} style={{ listStyle: 'none', margin: '32px 0 0', padding: 0 }}>
            {team.map((m) => (
              <HoverLiftCard key={m.name} as="li" className={s.card} data-reveal>
                <h3 className={`display ${s.cardTitle}`}>{m.name}</h3>
                <span className={`${s.pill} ${s.pillPurple}`} style={{ alignSelf: 'flex-start' }}>{m.role}</span>
                <p className={s.cardBody}>{m.focus}</p>
              </HoverLiftCard>
            ))}
          </ul>
        </div>
      </ScrollReveal>
    </>
  );
}
