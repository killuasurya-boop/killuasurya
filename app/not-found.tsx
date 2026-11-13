import type { Metadata } from 'next';
import Image from 'next/image';
import { PublicShell } from '@/components/layout/PublicShell';
import { Button } from '@/components/motion';
import { WhatsAppButton } from '@/components/layout/WhatsAppButton';

export const metadata: Metadata = { title: 'Halaman tidak ditemukan — KILLUASURYA.TECH', robots: { index: false } };

export default function NotFound() {
  return (
    <PublicShell>
      <section className="container" style={{ minHeight: '70vh', display: 'grid', placeItems: 'center', textAlign: 'center', padding: '64px 16px' }}>
        <div style={{ display: 'grid', gap: 20, justifyItems: 'center', maxWidth: 560 }}>
          <Image src="/assets/killuasurya/mascot/hero-idea-thinking.png" alt="" width={1600} height={1280} style={{ width: 'min(320px, 70vw)', height: 'auto' }} priority />
          <p style={{ margin: 0, fontWeight: 800, color: 'var(--purple-ink)', letterSpacing: 1 }}>404</p>
          <h1 className="display" style={{ margin: 0, fontSize: 'clamp(30px, 4vw, 46px)', lineHeight: 1.15 }}>Halaman ini belum ada</h1>
          <p style={{ margin: 0, color: 'var(--muted)', lineHeight: 1.6 }}>Tautannya mungkin salah atau halamannya sudah dipindah. Kembali ke beranda atau langsung tanya kami.</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
            <Button href="/" arrow>Kembali ke Beranda</Button>
            <WhatsAppButton variant="secondary" />
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
