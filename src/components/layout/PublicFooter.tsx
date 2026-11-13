import Link from 'next/link';
import { founderPortfolio, instagram, waLink, whatsapp } from '@/content/site';
import { services } from '@/content/services';
import { BrandLogo } from './BrandLogo';
import s from './footer.module.css';

export function PublicFooter() {
  return (
    <footer className={s.footer}>
      <div className={`container ${s.grid}`}>
        <div className={s.brand}>
          <BrandLogo priority={false} />
          <p>Digital Growth Agency • Creative Studio • Business Technology Platform. Bagian dari ekosistem SURYA.dev.</p>
        </div>
        <nav aria-label="Layanan">
          <h2 className={s.h}>Layanan</h2>
          <ul>{services.map((sv) => <li key={sv.slug}><Link href={`/services/${sv.slug}`}>{sv.title}</Link></li>)}</ul>
        </nav>
        <nav aria-label="Perusahaan">
          <h2 className={s.h}>Perusahaan</h2>
          <ul>
            <li><Link href="/portfolio">Portofolio</Link></li>
            <li><Link href="/case-studies">Studi Kasus</Link></li>
            <li><Link href="/process">Proses Kerja</Link></li>
            <li><Link href="/about">Tentang</Link></li>
            <li><Link href="/faq">FAQ</Link></li>
            <li><Link href="/insights">Insights</Link></li>
            <li><Link href="/privacy">Privasi</Link></li>
            <li><Link href="/terms">Ketentuan</Link></li>
          </ul>
        </nav>
        <nav aria-label="Mulai">
          <h2 className={s.h}>Mulai</h2>
          <ul>
            <li><Link href="/pricing">Pricing</Link></li>
            <li><Link href="/build-your-package">Rancang Paket</Link></li>
            <li><Link href="/contact">Smart Brief</Link></li>
            <li><a href={waLink()} target="_blank" rel="noopener noreferrer">WhatsApp {whatsapp.display}</a></li>
            <li><Link href="/login">Login Workspace</Link></li>
            <li><Link href="/os">Agency OS (demo)</Link></li>
          </ul>
        </nav>
      </div>
      <div className={`container ${s.bottom}`}>
        <span>© {new Date().getFullYear()} KILLUASURYA.TECH · Instagram {instagram.handle} · <a href={founderPortfolio} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline' }}>Portofolio Founder (SURYA.dev)</a></span>
        <span className={s.note}>Pratinjau frontend — formulir &amp; login belum terhubung ke backend.</span>
      </div>
    </footer>
  );
}
