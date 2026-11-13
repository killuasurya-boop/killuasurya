import type { Metadata } from 'next';
import { PageHero } from '@/components/public/PageHero';
import { Note, pageStyles as s } from '@/components/public/blocks';
import { ScrollReveal } from '@/components/motion/ScrollReveal';

export const metadata: Metadata = { title: 'Syarat & Ketentuan — KILLUASURYA.TECH', robots: { index: false } };

/** DRAFT — plain-language summary pending Owner/legal review. Not indexed until approved. */
export default function Page() {
  return (
    <>
      <PageHero kicker="Legal" title="Syarat &" highlight="Ketentuan" body={<p>Ringkasan dalam bahasa sederhana.</p>} />
      <ScrollReveal className={s.section} style={{ paddingTop: 0 }} aria-label="Syarat & Ketentuan">
        <div className="container" style={{ maxWidth: 820, display: 'grid', gap: 24 }}>
          <div data-reveal><Note>DRAF — belum ditinjau secara hukum. Dokumen final akan menggantikan halaman ini setelah disetujui Owner.</Note></div>
          <section data-reveal><h2 className={s.cardTitle}>Informasi di situs</h2><p className={s.cardBody}>Isi situs bersifat informasi umum. Harga merupakan estimasi dan tidak mengikat sebelum penawaran final disetujui.</p></section>
          <section data-reveal><h2 className={s.cardTitle}>Penawaran & kontrak</h2><p className={s.cardBody}>Ruang lingkup, deliverable, jumlah revisi, jadwal, dan pembayaran ditetapkan dalam penawaran dan kontrak tertulis untuk setiap proyek.</p></section>
          <section data-reveal><h2 className={s.cardTitle}>Biaya pihak ketiga</h2><p className={s.cardBody}>Biaya media iklan, lisensi, API, domain, hosting, perjalanan, dan pajak ditagihkan terpisah dan dijelaskan pada penawaran.</p></section>
          <section data-reveal><h2 className={s.cardTitle}>Tanpa jaminan hasil</h2><p className={s.cardBody}>Kami tidak menjanjikan konten viral, peringkat pertama di mesin pencari, atau kenaikan penjualan tertentu.</p></section>
          <section data-reveal><h2 className={s.cardTitle}>Demo</h2><p className={s.cardBody}>Agency OS dan Portal Klien di situs ini adalah demo berisi data contoh.</p></section>
        </div>
      </ScrollReveal>
    </>
  );
}
