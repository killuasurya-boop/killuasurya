import type { Metadata } from 'next';
import { PageHero } from '@/components/public/PageHero';
import { Note, pageStyles as s } from '@/components/public/blocks';
import { SmartBrief } from '@/components/public/SmartBrief';

export const metadata: Metadata = { title: 'Konsultasi & Smart Brief — KILLUASURYA.TECH', description: 'Ceritakan tantangan, tujuan dan kapasitas; kami bantu menyusun opsi pekerjaan.' };

export default function ContactPage() {
  return (
    <>
      <PageHero kicker="Hubungi · Smart Brief" title="Bangun sistem pertumbuhan yang" highlight="relevan" body={<p>Ceritakan tantangan, tujuan dan kapasitas; kami bantu menyusun opsi pekerjaan.</p>}>
        <Note>Nomor WhatsApp resmi belum ditetapkan (D-03). Gunakan Smart Brief di bawah — formulir ini masih pratinjau dan belum mengirim data.</Note>
      </PageHero>
      <section className={s.section} style={{ paddingTop: 0 }}>
        <div className="container" style={{ maxWidth: 1040 }}><SmartBrief /></div>
      </section>
    </>
  );
}
