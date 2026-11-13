import Image from 'next/image';
import Link from 'next/link';
import s from './header.module.css';

/**
 * Official KILLUASURYA.TECH logo (Owner file, delivered 12 Nov 2026 — D-04 resolved).
 * Source: assets-src/logo-killuasurya-tech-original.png (1672×941, dark background).
 * Served: brand/logo-killuasurya-tech.png — only the flat background keyed to transparent + cropped;
 * letterforms, colours, sticker outline, crown and sparkles are untouched. Same file for Dark & Light.
 */
export function BrandLogo({ priority = true }: { priority?: boolean }) {
  return (
    <Link href="/" className={s.logo} aria-label="KILLUASURYA.TECH — Beranda">
      <Image
        src="/assets/killuasurya/brand/logo-killuasurya-tech.png"
        alt="KILLUASURYA.TECH"
        width={1597}
        height={506}
        priority={priority}
        sizes="200px"
        className={s.logoImg}
      />
    </Link>
  );
}
