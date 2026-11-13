import { Layers, MonitorSmartphone, ShieldCheck, Users } from 'lucide-react';
import { PageHero } from './PageHero';
import { LoginCard } from './LoginCard';
import { pageStyles as s } from './blocks';
import { ScrollReveal } from '@/components/motion/ScrollReveal';
import { HoverLiftCard } from '@/components/motion';

const features = [
  { icon: MonitorSmartphone, title: 'Workspace Access', body: 'Kelola proyek & tim secara terpusat.', color: '#B78CFF' },
  { icon: Users, title: 'Client Portal', body: 'Pantau progres, approval, dan dokumen klien.', color: '#49B7FF' },
  { icon: Layers, title: 'Agency OS', body: 'Operasional, CRM, produksi, hingga pelaporan.', color: '#FC7158' },
  { icon: ShieldCheck, title: 'Aman & Terkendali', body: 'MFA Owner, batas sesi & throttling — aktif setelah backend terhubung.', color: '#C7F60C' },
];

/** Reference: "Login ke Ekosistem KILLUASURYA.TECH" board. */
export function LoginPage({ variant }: { variant: 'staff' | 'client' }) {
  return (
    <>
      <PageHero
        title={variant === 'client' ? 'Login Portal Klien' : 'Login ke Ekosistem'}
        highlight="KILLUASURYA.TECH"
        body={<p>Satu akun, akses ke Workspace, Client Portal, dan Agency OS untuk mengelola proyek, klien, dan bisnis digital Anda.</p>}
        aside={
          <ul className={s.grid2} style={{ listStyle: 'none', margin: 0, padding: 0, gap: 12 }}>
            {features.map((f) => (
              <HoverLiftCard key={f.title} as="li" className={s.featureCard} style={{ flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <f.icon size={34} color={f.color} aria-hidden="true" />
                <div><h2>{f.title}</h2><p>{f.body}</p></div>
              </HoverLiftCard>
            ))}
          </ul>
        }
      />
      <ScrollReveal className={s.section} style={{ paddingTop: 0 }} aria-label="Formulir login">
        <div className="container" style={{ maxWidth: 1120 }}>
          <div data-reveal><LoginCard variant={variant} /></div>
        </div>
      </ScrollReveal>
    </>
  );
}
