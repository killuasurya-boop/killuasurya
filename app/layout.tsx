import type { Metadata, Viewport } from 'next';
import { AuthHashBridge } from '@/components/auth/AuthHashBridge';
import { Inter, Knewave } from 'next/font/google';
import { ThemeProvider } from '@/components/layout/ThemeProvider';
import { siteUrl, whatsapp } from '@/content/site';
import './globals.css';

// Fonts approved by Owner. Source verified: Google Fonts (SIL Open Font License), self-hosted by next/font.
const knewave = Knewave({ weight: '400', subsets: ['latin'], display: 'swap', variable: '--font-knewave' });
const inter = Inter({ subsets: ['latin'], display: 'swap', variable: '--font-inter' });

const description = 'Digital agency untuk UMKM dan bisnis lokal: digital marketing, konten kreatif, website, dan sistem bisnis (kasir, stok, laporan) — dikerjakan satu tim.';
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'KILLUASURYA.TECH — Digital Growth Agency',
  description,
  alternates: { canonical: './' },
  openGraph: { type: 'website', locale: 'id_ID', siteName: 'KILLUASURYA.TECH', title: 'KILLUASURYA.TECH — Digital Growth Agency', description, images: [{ url: '/assets/killuasurya/mascot/hero-thumbs-up.png', width: 1600, height: 1257, alt: 'Maskot KILLUASURYA.TECH' }] },
  twitter: { card: 'summary_large_image', title: 'KILLUASURYA.TECH — Digital Growth Agency', description },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#0A0B13' },
    { media: '(prefers-color-scheme: light)', color: '#F7F7FC' },
  ],
};

// Runs before paint: enables motion pre-states only when JS runs and motion is allowed.
// Organization schema — only verifiable facts (name, URL, official WhatsApp). No ratings, address or counts.
const orgSchema = JSON.stringify({ '@context': 'https://schema.org', '@type': 'Organization', name: 'KILLUASURYA.TECH', url: siteUrl, logo: `${siteUrl}/assets/killuasurya/brand/logo-killuasurya-tech.png`, contactPoint: { '@type': 'ContactPoint', contactType: 'sales', telephone: `+${whatsapp.number}`, availableLanguage: 'id' } });
const motionGate = `try{if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches){document.documentElement.classList.add('motion-ok')}}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${knewave.variable} ${inter.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: motionGate }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: orgSchema }} />
      </head>
      <body>
        <a className="skip-link" href="#main">Lewati ke konten</a>
        <ThemeProvider>{children}</ThemeProvider>
        <AuthHashBridge enabled={!!process.env.NEXT_PUBLIC_SUPABASE_URL} />
      </body>
    </html>
  );
}
