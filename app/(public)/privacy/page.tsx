import type { Metadata } from 'next';
import { PageHero } from '@/components/public/PageHero';
import { Note, pageStyles as s } from '@/components/public/blocks';
import { ScrollReveal } from '@/components/motion/ScrollReveal';

export const metadata: Metadata = { title: 'Kebijakan Privasi — KILLUASURYA.TECH', robots: { index: false } };

/** DRAFT — plain-language summary pending Owner/legal review. Not indexed until approved. */
export default function Page() {
  return (
    <>
      <PageHero kicker="Legal" title="Kebijakan" highlight="Privasi" body={<p>Ringkasan dalam bahasa sederhana.</p>} />
      <ScrollReveal className={s.section} style={{ paddingTop: 0 }} aria-label="Kebijakan Privasi">
        <div className="container" style={{ maxWidth: 820, display: 'grid', gap: 24 }}>
          <div data-reveal><Note>DRAF — belum ditinjau secara hukum. Dokumen final akan menggantikan halaman ini setelah disetujui Owner.</Note></div>
          <section data-reveal><h2 className={s.cardTitle}>Data yang kami kumpulkan</h2><p className={s.cardBody}>Data yang Anda isi sendiri di formulir konsultasi (Smart Brief): nama, kontak, profil usaha, dan kebutuhan. Saat ini formulir di situs pratinjau belum mengirim data ke server.</p></section>
          <section data-reveal><h2 className={s.cardTitle}>Tujuan penggunaan</h2><p className={s.cardBody}>Menghubungi Anda terkait konsultasi dan penawaran yang Anda minta. Kami tidak mengirim promosi tanpa izin (consent) Anda.</p></section>
          <section data-reveal><h2 className={s.cardTitle}>WhatsApp</h2><p className={s.cardBody}>Tombol WhatsApp membuka aplikasi WhatsApp Anda (click-to-chat). Percakapan mengikuti kebijakan privasi WhatsApp.</p></section>
          <section data-reveal><h2 className={s.cardTitle}>Izin & penarikan izin</h2><p className={s.cardBody}>Anda dapat meminta kami berhenti menghubungi atau menghapus data Anda kapan saja melalui WhatsApp resmi kami.</p></section>
          <section data-reveal><h2 className={s.cardTitle}>Pelacakan</h2><p className={s.cardBody}>Situs ini belum memasang analytics atau cookie pelacak. Jika nanti dipasang, kami akan meminta persetujuan Anda terlebih dahulu.</p></section>
        </div>
      </ScrollReveal>
    </>
  );
}
