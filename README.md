# KILLUASURYA.TECH — Website + Agency OS + Portal Klien

Satu aplikasi Next.js untuk tiga hal:

- **Website publik** (Electric Doodle UI, tema gelap/terang): layanan, solusi per industri, paket, proses, FAQ, Smart Brief (form prospek dengan anti-spam).
- **Agency OS** (`/os`) untuk tim: Hari Ini, Tugas & alur kerja 8 tahap, Pipeline Konten, Proyek dengan template + bahan klien, Kalender, Penjualan (prospek → penawaran + PDF → proyek), Tim & Akses, notifikasi.
- **Portal Klien** (`/portal`): progres proyek, unggah bahan, setujui / minta revisi, unduh penawaran.

## Stack
Next.js 15 (App Router) · React 19 · TypeScript · CSS Modules · GSAP + Motion · Supabase (Postgres + RLS, Auth, Storage) · pdf-lib · Playwright.

## Menjalankan
```bash
npm install
npm run build && npm run start      # http://localhost:3000
```
- **Tanpa `.env.local`** → **mode demo**: data contoh berlabel DATA DEMO, akun demo di halaman login (sandi `demo12345`), tidak ada yang tersimpan.
- **Dengan `.env.local`** → **mode live** (Supabase). Salin `.env.example`, isi `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Kunci *service_role* tidak dipakai aplikasi ini — jangan pernah menaruhnya di repo.

## Database
Jalankan semua SQL di `supabase/migrations/` menurut urutan nama: `0001` … `0007`, lalu `20261115190835_harden_inactive_accounts.sql` dan `20261115203528_atomic_project_creation.sql` (SQL Editor Supabase atau CLI lokal). Instalasi yang sudah menjalankan 0001–0007 cukup menerapkan migrasi tambahan. Terapkan migrasi sebelum versi aplikasi yang memakainya dirilis. Semua tabel ber-RLS; aturan alur kerja ditegakkan di database (fungsi `task_transition`, `client_decide`, `project_start`, dll.). Panduan lengkap: [`docs/BACKEND_SETUP.md`](docs/BACKEND_SETUP.md).

## Tes
```bash
npm test                 # unit keamanan + migrasi/RLS PostgreSQL terisolasi (tanpa Docker/cloud)
npm run typecheck
npm run test:e2e          # mode demo, 5 ukuran layar (layout, a11y/axe, visual, interaksi)
npx playwright test -c playwright.live.config.ts   # mode live terhadap Supabase LOKAL (Docker) — jangan ke produksi
npm run check:deployment -- https://staging.example.com # pemeriksaan GET read-only, mengharuskan mode live
```

## Catatan
- Panduan kerja dan skill proyek: [`AGENTS.md`](AGENTS.md). Status pembenahan, bukti uji, batasan, dan migrasi tambahan: [`docs/PROJECT_HEALTH.md`](docs/PROJECT_HEALTH.md).
- Urutan rilis, rollback dan matriks UAT: [`docs/RELEASE_READINESS.md`](docs/RELEASE_READINESS.md).
- Aset brand (logo, maskot) adalah milik KILLUASURYA.TECH.
- Laporan audit & keputusan: `docs/AUDIT_V5.md`, `docs/FINAL_REPORT.md`.
