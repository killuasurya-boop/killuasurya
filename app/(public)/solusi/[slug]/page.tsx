import type { Metadata } from 'next';
import { Illustrated } from '@/components/icons/Illustrated';
import { notFound } from 'next/navigation';
import { CheckCircle2, HelpCircle } from 'lucide-react';
import { PageHero } from '@/components/public/PageHero';
import { Note, SectionHead, pageStyles as s, serviceArt, serviceIcons } from '@/components/public/blocks';
import { ScrollReveal } from '@/components/motion/ScrollReveal';
import { Button, HoverLiftCard } from '@/components/motion';
import { solutions } from '@/content/marketing';
import { packages, quotationDisclaimer, services } from '@/content/services';

export function generateStaticParams() {
  return solutions.map((x) => ({ slug: x.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const x = solutions.find((v) => v.slug === slug);
  return x ? { title: `Solusi ${x.name} — KILLUASURYA.TECH`, description: x.intro } : {};
}

/** Industry solution page — modules are the PRD §12 composition; nothing is built until discovery confirms scope. */
export default async function SolutionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const x = solutions.find((v) => v.slug === slug);
  if (!x) notFound();
  const pkg = packages.find((p) => p.code === x.pkg);
  const svcs = x.services.map((sl) => services.find((sv) => sv.slug === sl)!).filter(Boolean);
  const others = solutions.filter((v) => v.slug !== x.slug);
  const brief = `/contact?package=${x.pkg}&service=${x.services[0]}&quiz=${encodeURIComponent(`Solusi ${x.name}`)}`;

  return (
    <>
      <PageHero kicker="Solusi per jenis usaha" title="Solusi untuk" highlight={x.name} mascot body={<p>{x.intro}</p>}>
        <div className={s.ctaRow}><Button href={brief} arrow>Konsultasi untuk {x.name}</Button><Button href="/os" variant="secondary">Coba demo sistem</Button></div>
      </PageHero>

      <ScrollReveal className={s.section} aria-labelledby="sp-title">
        <div className="container">
          <SectionHead id="sp-title" title="Terdengar familiar?" sub="Situasi yang sering kami dengar dari pemilik usaha sejenis." />
          <ul className={s.grid3} style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {x.pains.map((p) => (
              <HoverLiftCard key={p} as="li" className={s.card} data-reveal>
                <HelpCircle size={28} aria-hidden="true" style={{ color: 'var(--purple-ink)' }} />
                <h3 className={s.cardTitle} style={{ fontSize: 18, lineHeight: 1.4 }}>{p}</h3>
              </HoverLiftCard>
            ))}
          </ul>
        </div>
      </ScrollReveal>

      <ScrollReveal className={s.section} aria-labelledby="sm-title">
        <div className="container">
          <SectionHead id="sm-title" title="Modul yang biasa dipakai" sub="Dipilih sesuai kebutuhan — tidak semua modul harus dibangun sekaligus." />
          <HoverLiftCard interactive={false} className={s.card} data-reveal>
            <ul className={s.list} style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
              {x.modules.map((m) => <li key={m}><CheckCircle2 size={18} aria-hidden="true" />{m}</li>)}
            </ul>
            {pkg && <p className={s.cardBody}>Paket yang biasanya sesuai: <strong style={{ color: 'var(--text)' }}>{pkg.code} — {pkg.name}</strong> ({pkg.mechanism}).</p>}
          </HoverLiftCard>
          <div data-reveal style={{ marginTop: 16 }}><Note>Dimulai dari discovery dan PRD proyek Anda. {quotationDisclaimer}</Note></div>
        </div>
      </ScrollReveal>

      <ScrollReveal className={s.section} aria-labelledby="ss-title">
        <div className="container">
          <SectionHead id="ss-title" title="Layanan pendukung" />
          <ul className={s.grid3} style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {svcs.map((sv) => {
              const Icon = serviceIcons[sv.icon];
              return (
                <HoverLiftCard key={sv.slug} as="li" className={s.card} data-reveal data-ai-host>
                  <Illustrated name={serviceArt[sv.icon]} size={54} />
                  <h3 className={`display ${s.cardTitle}`}>{sv.title}</h3>
                  <p className={s.cardBody}>{sv.headline}</p>
                  <Button href={`/services/${sv.slug}`} variant="secondary" size="sm" arrow style={{ marginTop: 'auto', alignSelf: 'flex-start' }}>Lihat {sv.title}</Button>
                </HoverLiftCard>
              );
            })}
          </ul>
        </div>
      </ScrollReveal>

      <ScrollReveal className={s.section} aria-labelledby="so-title">
        <div className="container">
          <SectionHead id="so-title" title="Jenis usaha lain" />
          <div className={s.ctaRow} data-reveal>
            {others.map((o) => <Button key={o.slug} href={`/solusi/${o.slug}`} variant="secondary" size="sm">{o.name}</Button>)}
          </div>
        </div>
      </ScrollReveal>
    </>
  );
}
