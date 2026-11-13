# KILLUASURYA.TECH — Laporan Fase 04: Playwright QA (Phase 10) — 12 Nov 2026

Suite otomatis berbasis **@playwright/test 1.63** + **@axe-core/playwright 4.14** di `tests/e2e/`. Semua pengujian berjalan pada build produksi (`next build && next start`).

## Cara menjalankan
```bash
npm install
npx playwright install chromium firefox webkit   # sekali, bila browser belum ada
npm run build
npm run test:e2e        # smoke + a11y + interaksi + motion + visual (5 viewport Chromium)
npm run test:xbrowser   # Firefox + WebKit (desktop & iPhone) — ditambahkan di pass final
npm run test:perf       # Web Vitals & FPS, 1 worker (hasil lab)
npm run test:report     # buka laporan HTML (qa/playwright-report)
npm run test:visual -- --update-snapshots=all   # perbarui baseline visual SECARA SENGAJA
```

## Matriks proyek
| Proyek | Viewport | Isi |
|---|---|---|
| desktop-1440 | 1440×900 | semua spec |
| laptop-1024 | 1024×768 | @layout |
| tablet-768 | 768×1024, touch | @layout, @visual |
| mobile-390 | Pixel 7, 390×844 | @layout, @visual, @mobile, @a11y |
| mobile-360 | Pixel 7, 360×780 | @layout |
| perf | 1440×900 | perf.spec, 1 worker (`npm run test:perf`) |
| firefox-1440 / webkit-1440 | 1440×900 | semua kecuali @visual & @a11y |
| webkit-iphone | iPhone 14 | @layout, @mobile |

## Spec
| File | Cakupan |
|---|---|
| `smoke.spec.ts` | 31 route × Dark/Light × 5 viewport: HTTP < 400, tema benar, `<main>` & `h1` tampil, scroll-through, **tanpa horizontal overflow**, **tanpa elemen tersangkut opacity 0**, tanpa page/console error; satu `h1` + `<title>` per route |
| `a11y.spec.ts` | axe WCAG 2.0/2.1/2.2 A+AA pada 31 route × 2 tema × (1440, 390); gagal bila ada pelanggaran serious/critical. Keyboard: skip link, focus ring ≥2px, target ≥44px |
| `interactions.spec.ts` | Drawer (focus trap, Esc, kembali fokus), theme switch tanpa layout shift + persist setelah reload, Smart Brief end-to-end, Package Builder → Brief, login jujur, tabs portofolio (panah), Ctrl+K, CRM (drawer/WON guard/empty), approval quotation, kanban keyboard, WA terkunci, retry publikasi tidak palsu, integrasi tidak pernah "Terhubung", sidebar collapse persist, bottom nav mobile |
| `motion.spec.ts` | Reduced motion (semua konten hero opacity 1 seketika), tanpa JavaScript (halaman publik terbaca), timeline hero selesai (underline dashoffset 0), idle berhenti saat hero di luar viewport, perpindahan route berulang tanpa error & heap terbatas |
| `visual.spec.ts` | Baseline screenshot 5 layar × 2 tema × 3 viewport (`tests/e2e/__screenshots__/`), toleransi 2% |
| `perf.spec.ts` | LCP, CLS, INP-proxy, long task (normal & 4× CPU), FPS intro hero & scroll |

## Hasil akhir
- **Suite utama: 488 lulus, 0 gagal**, 1 dilewati (tes bottom-nav khusus mobile di proyek desktop — memang dirancang).
- **Perf: 7/7 lulus.**

| Route | LCP | CLS | INP~ | 4× CPU: LCP / CLS / INP~ |
|---|---|---|---|---|
| `/` | 1288 ms | 0.000 | 72 ms | 1376 ms / 0.000 / 96 ms |
| `/services` | 196 ms | 0.000 | 80 ms | 364 ms / 0.000 / 96 ms |
| `/contact` | 304 ms | 0.000 | 72 ms | 432 ms / 0.000 / 88 ms |
| `/login` | 320 ms | 0.000 | 48 ms | 544 ms / 0.000 / 80 ms |
| `/os` | 516 ms | 0.000 | 176 ms | 660 ms / 0.000 / 96 ms |
| `/os/projects` | 348 ms | 0.000 | 64 ms | 640 ms / 0.000 / 96 ms |
| FPS hero | intro rata-rata 58 fps (frame terburuk 50 ms) · scroll 60 fps | | | |

Catatan: angka lab di localhost (Chromium headless, tanpa throttling jaringan). Data lapangan dari pengguna nyata akan berbeda; ukur ulang setelah deploy.

## Bug nyata yang ditemukan Playwright & diperbaiki
| # | Temuan | Perbaikan |
|---|---|---|
| 1 | axe: kontras teks kurang di tema Light (badge DATA DEMO, pill status, delta KPI, catatan coral, consent "Ya") — 32 halaman | Token baru `--coral-ink` / `--success-ink` per tema; pill status & prioritas digelapkan untuk Light |
| 2 | axe critical: kalender memakai `role=grid/gridcell` tanpa baris | Tombol hari biasa + `aria-pressed`, info event via teks sr-only |
| 3 | axe: `aria-label` pada `<span>` (angka KPI) dan label tombol tidak memuat teks yang terlihat (search, kalender, media, tombol Maju/Mundur CRM) | Teks sr-only, label sesuai teks terlihat |
| 4 | axe: area scroll horizontal (tabel, chevron flow, kanban, stepper) tidak bisa difokus keyboard | `tabIndex=0` + `role=region` + label |
| 5 | axe (mobile): tombol search tanpa nama karena teks disembunyikan `display:none` | Teks disembunyikan visual (sr-only), tetap terbaca screen reader |
| 6 | Perf: INP 216 ms saat membuka menu — `backdrop-filter: blur` pada overlay | Blur dihapus → INP 72 ms |
| 7 | Perf: CLS 0.109 di `/contact` — Smart Brief dirender klien saja karena `useSearchParams` + Suspense | Form di-render server; prefill query dibaca setelah mount → CLS 0 (juga Package Builder) |
| 8 | Layout: overflow 38 px di 1024 pada Home (doodle loop di section proses) | Doodle hanya tampil ≥1200 px |
| 9 | Donut chart kadang tersangkut opacity 0 (whileInView pada elemen SVG) | Animasi saat mount |
| 10 | Footer link 32 px | Target 44 px |

## Batasan
- Tidak menjalankan Lighthouse penuh atau pengukuran di perangkat fisik/jaringan lambat.
- Uji visual membandingkan terhadap baseline implementasi; perbandingan terhadap gambar referensi Owner tetap via `docs/qa/cmp_*.png` (Fase 01).
- Lintas browser & Lighthouse: lihat `docs/FINAL_REPORT.md` (pass final).
