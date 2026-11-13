import type { Metadata } from 'next';
import { PageHero } from '@/components/public/PageHero';
import { SetPasswordForm } from '@/components/public/SetPasswordForm';
import { pageStyles as s } from '@/components/public/blocks';

export const metadata: Metadata = { title: 'Buat Kata Sandi — KILLUASURYA.TECH', robots: { index: false } };
export default function Page() {
  return (
    <>
      <PageHero title="Buat" highlight="Kata Sandi" body={<p>Pilih kata sandi untuk akun Anda (minimal 10 karakter).</p>} />
      <section className={s.section} style={{ paddingTop: 0 }}><div className="container"><SetPasswordForm /></div></section>
    </>
  );
}
