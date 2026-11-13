import type { Metadata } from 'next';
import { PageHero } from '@/components/public/PageHero';
import { pageStyles as s } from '@/components/public/blocks';
import { PackageBuilder } from '@/components/public/PackageBuilder';

export const metadata: Metadata = { title: 'Rancang Paket — KILLUASURYA.TECH' };

export default function BuildYourPackagePage() {
  return (
    <>
      <PageHero kicker="Package Builder" title="Rancang" highlight="paket Anda" body={<p>Pilih paket, layanan, add-on, durasi dan kompleksitas. Hasilnya menjadi permintaan penawaran — bukan harga final.</p>} />
      <section className={s.section} style={{ paddingTop: 0 }}>
        <div className="container"><PackageBuilder /></div>
      </section>
    </>
  );
}
