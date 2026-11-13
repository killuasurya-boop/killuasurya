import type { Metadata } from 'next';
import { PageHero } from '@/components/public/PageHero';
import { ResetForm } from '@/components/public/ResetForm';
import { pageStyles as s } from '@/components/public/blocks';

export const metadata: Metadata = { title: 'Lupa Kata Sandi — KILLUASURYA.TECH', robots: { index: false } };
export default function Page() {
  return (
    <>
      <PageHero title="Atur Ulang" highlight="Kata Sandi" body={<p>Masukkan email akun Anda untuk menerima tautan atur ulang.</p>} />
      <section className={s.section} style={{ paddingTop: 0 }}><div className="container"><ResetForm /></div></section>
    </>
  );
}
