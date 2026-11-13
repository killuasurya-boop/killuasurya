import Image from 'next/image';
import { Illustrated } from '@/components/icons/Illustrated';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';
import { PageHero } from '@/components/public/PageHero';
import { Note, SectionHead, pageStyles as s, serviceArt, serviceIcons } from '@/components/public/blocks';
import { ScrollReveal } from '@/components/motion/ScrollReveal';
import { Button, HoverLiftCard } from '@/components/motion';
import { WhatsAppButton } from '@/components/layout/WhatsAppButton';
import { quotationDisclaimer, services } from '@/content/services';

export function generateStaticParams() {
  return services.map((sv) => ({ slug: sv.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const sv = services.find((x) => x.slug === slug);
  return sv ? { title: `${sv.title} — KILLUASURYA.TECH`, description: sv.body } : {};
}

export default async function ServiceDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const sv = services.find((x) => x.slug === slug);
  if (!sv) notFound();
  const Icon = serviceIcons[sv.icon];
  const others = services.filter((x) => x.slug !== sv.slug).slice(0, 3);

  return (
    <>
      <PageHero
        kicker={`Layanan · ${sv.model}`}
        title={sv.title.split(' ').slice(0, -1).join(' ') || sv.title}
        highlight={sv.title.split(' ').length > 1 ? sv.title.split(' ').slice(-1)[0] : undefined}
        body={<><p><strong style={{ color: 'var(--text)' }}>{sv.headline}</strong></p><p>{sv.body}</p></>}
        aside={
          <HoverLiftCard interactive={false} className={s.card} style={{ alignItems: 'center', textAlign: 'center' }}>
            <Illustrated name={serviceArt[sv.icon]} size={54} />
            <Image src={`/assets/killuasurya/creative/04_OBJECTS/${sv.object}`} alt="" width={200} height={200} />
            <span className={s.pill}>{sv.short}</span>
          </HoverLiftCard>
        }
      >
        <div className={s.ctaRow}>
          <Button href={`/contact?service=${sv.slug}`} arrow>{sv.cta}</Button>
          <WhatsAppButton topic={sv.title} variant="secondary" />
          <Button href="/pricing" variant="secondary">Lihat Paket</Button>
        </div>
      </PageHero>

      <ScrollReveal className={s.section} aria-labelledby="scope-title">
        <div className="container">
          <SectionHead id="scope-title" title="Ruang lingkup" sub="Contoh pekerjaan yang dapat dimasukkan ke paket. Detail final ditetapkan di quotation." />
          <div className={s.grid2}>
            <HoverLiftCard interactive={false} className={s.card} data-reveal>
              <ul className={s.list}>{sv.items.map((it) => <li key={it}><CheckCircle2 size={18} aria-hidden="true" />{it}</li>)}</ul>
            </HoverLiftCard>
            <div style={{ display: 'grid', gap: 16, alignContent: 'start' }}>
              <div data-reveal><Note>{sv.guardrail}</Note></div>
              <div data-reveal><Note>{quotationDisclaimer}</Note></div>
            </div>
          </div>
        </div>
      </ScrollReveal>

      <ScrollReveal className={s.section} aria-labelledby="other-title">
        <div className="container">
          <SectionHead id="other-title" title="Layanan lainnya" />
          <div className={s.grid3}>
            {others.map((o) => {
              const OI = serviceIcons[o.icon];
              return (
                <HoverLiftCard key={o.slug} as="article" className={s.card} data-reveal data-ai-host>
                  <Illustrated name={serviceArt[o.icon]} size={54} />
                  <h3 className={`display ${s.cardTitle}`}>{o.title}</h3>
                  <p className={s.cardBody}>{o.short}</p>
                  <Button href={`/services/${o.slug}`} variant="secondary" size="sm" arrow>{o.cta}</Button>
                </HoverLiftCard>
              );
            })}
          </div>
        </div>
      </ScrollReveal>
    </>
  );
}
