# KILLUASURYA.TECH — Frontend Motion · Laporan Fase 01 (12 Nov 2026)

Lingkup: frontend + motion saja. Tidak ada backend, API, database, auth server, env produksi, atau deploy.
Aset asli di `PRD/` dan `UI/` **tidak disentuh**; semua aset di `public/` adalah salinan.

## Keputusan Owner yang diterapkan
| Item | Keputusan | Implementasi |
|---|---|---|
| Karakter | Karakter asli, pose hero 04/05 sesuai referensi | **Update 12 Nov:** PNG transparan resolusi tinggi dari Owner (1600×1257 Dark/thumbs-up, 1600×1280 Light/idea) dipakai apa adanya (md5 di `ASSET_REGISTRY.json`). Fallback otomatis: PNG yang tertanam di SVG 04/05. Tidak ada redraw/warna/proporsi diubah. |
| Animasi karakter | Floating, transform, parallax saja | Masuk sebagai satu kesatuan (y/scale/opacity), idle float ±6px rotate ≤0.8°, parallax scrub desktop. **Tidak ada** animasi wajah/anggota tubuh (tidak ada layer terpisah). |
| Doodle/ornamen/panah/objek | SVG asli | Markup SVG asli disalin verbatim ke `src/assets/doodles.generated.ts` (generator: `scripts/sync-assets.mjs`) agar path aslinya bisa di-draw (stroke-dashoffset). |
| Logo resmi | File resmi dari Owner (12 Nov) | **RESOLVED (D-04)** — `assets-src/logo-killuasurya-tech-original.png` (asli, tidak diubah). Turunan untuk web: hanya background gelap polos dijadikan transparan + crop → `public/assets/killuasurya/brand/logo-killuasurya-tech.png`. Huruf, warna, outline, crown, sparkle tidak diubah. Satu file untuk Dark & Light. |
| Typography | Knewave (display) + Inter (UI) | `next/font/google` (sumber terverifikasi: Google Fonts, OFL), self-host, `display: swap`. |
| Token | Nilai master prompt | `app/globals.css` — Dark/Light satu struktur, hanya warna/elevasi/glow berbeda. |

## Checklist fase
- [x] Audit aset (125 SVG, 18 PNG, PRD) — lihat canvas audit.
- [x] Motion tokens (`src/motion/tokens.ts`) + GSAP setup dengan cleanup `useGSAP`/`matchMedia`.
- [x] Komponen reusable: Button (primary/secondary/tertiary, loading), MagneticButton, HoverLiftCard, AnimatedThemeSwitch, AnimatedDrawer, AnimatedModal, AnimatedAccordion, AnimatedTabs, AnimatedProgress, AnimatedTooltip, Toast, ScrollReveal.
- [x] SVG doodle effects: drawOn (crown/arrow/check/scribble), pop, pulse, floatIdle, squiggleFlow.
- [x] Hero cinematic timeline 00–09 (Home).
- [x] Scroll storytelling Home: Modul & Layanan, Diagram Ekosistem (flow 1 persis), Alur Lead-to-Project (flow 2 persis + loop revisi), CTA konsultasi.
- [x] Dual Foundation Dark/Light + System, tanpa flash.
- [x] Responsif 1440/1024/768/390/360 tanpa horizontal overflow.
- [ ] Halaman publik lain (layanan, portfolio, pricing, brief, kontak, auth) — fase berikut.
- [ ] Agency OS (dashboard, CRM, quotation, project, content, publishing, WA, media, settings, portal) — fase berikut.

## Visual QA (Home hero, terukur dengan side-by-side vs anchor @1440)
Bukti: `docs/qa/cmp_dark.png`, `docs/qa/cmp_light.png`, dan screenshot per viewport `docs/qa/hero-*.png`.

| Elemen | Status | Catatan deviasi |
|---|---|---|
| Struktur nav, urutan link, CTA pill lime, tombol menu ungu | PASS | Ikon "Konsultasi" generik (WhatsApp nomor TBD D-03 → CTA ke /kontak). |
| Logo | PASS dengan deviasi | Logo resmi terpasang. Referensi Light memakai varian logo berwarna gelap yang belum tersedia; saat ini satu varian (outline sticker gelap) untuk kedua tema. |
| Headline 3 baris, "Future!" lime (Dark) / highlight lime (Light) | PASS dengan deviasi | Knewave lebih tebal dari brush font di gambar referensi (font disetujui Owner). |
| Underline lime | PASS dengan deviasi | Memakai `06_flat_lime_underline.svg` dari Owner (datar, tanpa panah), draw-on kiri→kanan. Ketebalan mengikuti rasio asset (27/1200) → lebih tipis dari sapuan kuas di referensi. Light: highlight lime (sesuai referensi). |
| Subjudul, 2 CTA, 5 kapabilitas 1 baris | PASS | Ikon kapabilitas: Lucide outline (bukan aset Owner). |
| Maskot Dark/Light + bubble | PASS | Pose & karakter asli resolusi 1600px — tajam di DPR 2. Fringe warna tipis pada tepi PNG berasal dari file sumber (tidak diubah). |
| Crown di hero | PASS | Pada referensi crown/zig-zag menyatu di art maskot; tidak ditambah crown duplikat. Crown draw dipakai di judul section. |
| Reduced motion | PASS | 0 elemen tersembunyi, tidak ada ScrollTrigger dibuat. |
| Keyboard | PASS | Skip link → logo → nav → Konsultasi → menu; drawer: fokus ke tombol Tutup, trap Tab, Esc menutup & fokus kembali. |
| Console / overflow | PASS | Hanya 404 prefetch untuk route yang belum dibangun. Perbaikan 12 Nov: slab dekoratif disembunyikan ≤1023px (sebelumnya menutupi tombol sekunder di 768), baris kapabilitas nowrap hanya ≥1280px (sebelumnya terpotong di 1024). |
| Build / typecheck | PASS | `next build` + `tsc --noEmit` lulus. First Load JS `/` 219 kB. |

Belum diukur: LCP/INP/CLS Lighthouse dan FPS (direncanakan di Phase 10). Tidak ada klaim pixel-perfect.

## Menjalankan
```bash
cd web
npm install
npm run dev            # http://localhost:3000
npm run build && npm start
# QA screenshot (opsional): npm i -D playwright && npx playwright install chromium && node qa/shoot.cjs
```
`npm run assets:sync` menyalin ulang aset dari `../UI/komponen` (read-only, tidak menimpa sumber).
