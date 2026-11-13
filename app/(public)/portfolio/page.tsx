import type { Metadata } from 'next';
import { PageHero } from '@/components/public/PageHero';
import { Note, SectionHead, pageStyles as s } from '@/components/public/blocks';
import { PortfolioGrid } from '@/components/public/PortfolioGrid';
import { ScrollReveal } from '@/components/motion/ScrollReveal';
import { Button } from '@/components/motion';
import { industries } from '@/content/portfolio';

export const metadata: Metadata = { title: 'Portofolio — KILLUASURYA.TECH', description: 'Studi kasus, visual, tantangan, solusi dan status verifikasi yang transparan.' };

export default function PortfolioPage() {
  return (
    <>
      <PageHero kicker="Portofolio" title="Lihat apa yang" highlight="kami kerjakan" body={<p>Studi kasus, visual, tantangan, solusi dan status verifikasi yang transparan.</p>}>
        <Note>Konten portofolio sedang diaudit izin publikasinya (D-11). Setiap kartu memakai label bukti — tidak ada nama klien, hasil, atau angka yang belum diverifikasi.</Note>
      </PageHero>
      <ScrollReveal className={s.section} aria-labelledby="pf-title">
        <div className="container">
          <SectionHead id="pf-title" title="Ekosistem & Studi Kasus" sub="Referensi dari ekosistem SURYA.dev — status sesuai bukti yang tersedia." />
          <div data-reveal><PortfolioGrid /></div>
        </div>
      </ScrollReveal>
      <ScrollReveal className={s.section} aria-labelledby="ind-title">
        <div className="container">
          <SectionHead id="ind-title" title="Solusi per industri" sub="Komposisi modul yang ditawarkan — dirancang setelah discovery." />
          <div className={s.tableWrap} data-reveal tabIndex={0} role="region" aria-label="Tabel (dapat digeser)">
            <table className={s.table}>
              <thead><tr><th scope="col">Industri</th><th scope="col">Komposisi modul</th></tr></thead>
              <tbody>{industries.map((i) => <tr key={i.name}><th scope="row" style={{ textAlign: 'left', padding: '14px 16px' }}>{i.name}</th><td>{i.modules}</td></tr>)}</tbody>
            </table>
          </div>
          <div className={s.ctaRow} style={{ marginTop: 24 }} data-reveal>
            <Button href="/contact" arrow>Buat Proyek Serupa</Button>
            <Button href="/case-studies" variant="secondary">Lihat Cara Kerja</Button>
          </div>
        </div>
      </ScrollReveal>
    </>
  );
}
