import type { Metadata } from 'next';
import { PageHero } from '@/components/public/PageHero';
import { FlowStrip, SectionHead, pageStyles as s } from '@/components/public/blocks';
import { ScrollReveal } from '@/components/motion/ScrollReveal';
import { Button, HoverLiftCard } from '@/components/motion';
import { opsFlows, team } from '@/content/services';

export const metadata: Metadata = { title: 'Studi Kasus & Cara Kerja — KILLUASURYA.TECH' };

export default function CaseStudiesPage() {
  return (
    <>
      <PageHero kicker="Studi Kasus" title="Flowchart" highlight="Operasional" body={<p>Empat alur kerja inti yang dipakai di setiap proyek — Lead-to-Project, Content Production, Social Publishing, dan WhatsApp Consent.</p>} />
      {opsFlows.map((f) => (
        <ScrollReveal key={f.key} className={s.section} aria-labelledby={`flow-${f.key}`} style={{ paddingTop: 24, paddingBottom: 24 }}>
          <div className="container">
            <HoverLiftCard interactive={false} className={s.card} data-reveal>
              <SectionHead id={`flow-${f.key}`} title={f.title} sub={f.sub} />
              <FlowStrip label={f.title} steps={f.steps} loop={f.loop} />
            </HoverLiftCard>
          </div>
        </ScrollReveal>
      ))}
      <ScrollReveal className={s.section} aria-labelledby="team-title">
        <div className="container">
          <SectionHead id="team-title" title="Tim & peran" sub="Peran operasional sesuai Team Playbook V4." />
          <ul className={s.grid3} style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {team.map((m) => (
              <HoverLiftCard key={m.name} as="li" className={s.card} data-reveal>
                <h3 className={`display ${s.cardTitle}`}>{m.name}</h3>
                <span className={`${s.pill} ${s.pillPurple}`} style={{ alignSelf: 'flex-start' }}>{m.role}</span>
                <p className={s.cardBody}>{m.focus}</p>
              </HoverLiftCard>
            ))}
          </ul>
          <div className={s.ctaRow} style={{ marginTop: 24 }} data-reveal><Button href="/contact" arrow>Mulai Konsultasi</Button></div>
        </div>
      </ScrollReveal>
    </>
  );
}
