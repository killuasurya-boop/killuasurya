# KILLUASURYA.TECH — AUDIT V5 (12 Nov 2026) · AUDIT MODE

Dasar: Master Prompt V5. Audit atas repository `web/` (Next.js 15.5 App Router, TypeScript, React 19, CSS Modules + token, GSAP, Motion, dnd-kit, next-themes). **Belum ada perubahan kode pada fase ini.**
Status singkat: **frontend lengkap dan teruji (517 tes Chromium lulus; a11y 100), backend = 0%.** Semua data workspace adalah fixture berlabel DATA DEMO.

Legenda: `[x]` selesai & terverifikasi · `[~]` sebagian · `[ ]` belum · `[!]` terblokir

---

## 1. Audit UI/UX aktual — temuan

| # | Lokasi | Masalah | Dampak | Rekomendasi | Prio | Verifikasi |
|---|---|---|---|---|---|---|
| A1 | `src/components/layout/PublicHeader.tsx` | Tidak ada tombol **Login Workspace** di navbar/drawer; login hanya di footer | Tim & klien sulit masuk | Tambah "Login Workspace" (desktop + drawer mobile) → `/login` | P0 | Tes: tombol terlihat di 1440 & 390, menuju `/login` |
| A2 | `src/content/site.ts` (`whatsapp.number = null`) | CTA WhatsApp belum aktif; semua CTA ke Smart Brief | Kanal kontak utama Indonesia tidak tersedia | Pasang `6281396186251`; pesan otomatis per layanan/halaman; hero, layanan, pricing, floating | P0 | Tes: href `wa.me/6281396186251?text=…` per halaman |
| A3 | Footer, `/contact` | Instagram belum ada | Kehilangan bukti sosial | Tambah `@killua_surya2` **setelah tautan diverifikasi** | P0 `[!]` | Owner konfirmasi URL profil |
| A4 | `app/` | Tidak ada `middleware.ts`, sesi, atau API; `/os/*` dan `/portal` **terbuka publik** | Aman saat ini hanya karena isinya data demo; **tidak boleh diisi data nyata** | Auth server + proteksi route + RBAC di server sebelum data nyata | P0 | Tes: akses `/workspace` tanpa sesi → redirect `/login` |
| A5 | `LoginCard.tsx`, `ResetForm.tsx` | Form login/reset hanya UI (jujur: "belum terhubung") | Tidak ada yang bisa login | Sambungkan ke auth; tambah `/forgot-password`, logout, redirect per role | P0 | E2E login → dashboard → logout |
| A6 | `src/fixtures/os.demo.ts` | Seluruh workspace (CRM, quotation, proyek, konten, publishing, WA, laporan) memakai fixture; perubahan hilang saat reload | Belum bisa dipakai kerja | Database + server actions; hapus label DATA DEMO hanya setelah data nyata | P0 | Data bertahan setelah reload & antar pengguna |
| A7 | `app/os/*` | Route workspace bernama `/os`; V5 meminta `/workspace` | Inkonsistensi URL | Tambah `/workspace` (redirect dari `/os`) | P1 | 308 `/os` → `/workspace` |
| A8 | `app/` | Tidak ada `not-found.tsx` (404 bawaan Next) | 404 tidak konsisten brand | Halaman 404 Electric Doodle | P1 | Buka URL acak |
| A9 | `app/` | Tidak ada `sitemap.ts`, `robots.ts`, Open Graph, schema JSON-LD; metadata per halaman minim | SEO & pratinjau tautan lemah | Metadata lengkap, OG image, schema Organization/Service/FAQ | P1 | Lighthouse SEO; uji rich results |
| A10 | Sitemap publik | Belum ada: UI/UX & Branding, F&B Solutions (Garage OS), Our Process, FAQ tersendiri, Privacy, Terms | Funnel & kepatuhan belum lengkap | Tambah halaman (lihat §3) | P1 | Smoke test route baru |
| A11 | `app/layout.tsx` | Favicon belum ada (404) | Best Practices 96; tab tanpa ikon | Butuh ikon persegi resmi | P1 `[!]` | Lighthouse BP 100 |
| A12 | Workspace | Belum ada: Task Detail lengkap (komentar, lampiran, riwayat, checklist), Timeline view, Team Workload view, Approval Center, My Tasks, 12 status standar V5 | Tim belum bisa bekerja hanya dari dashboard | Bangun di Fase 3–4 | P0/P1 | E2E alur konten end-to-end |
| A13 | `/os/team` | Role hanya tampilan RACI; tidak configurable | Penugasan tidak bisa diubah Owner | Role & penugasan di database | P1 | Owner mengubah PIC; izin ikut berubah |
| A14 | Home (mobile) | Lighthouse performance mobile 78 (halaman panjang) | Muat lebih lambat di HP murah | Lazy-load section bawah, pecah bundle | P2 | Lighthouse mobile ≥ 90 |
| A15 | Tracking | Tidak ada analytics/consent banner | Konversi tidak terukur | Analytics + persetujuan privasi (butuh ACC produksi) | P2 | Event CTA tercatat setelah consent |
| A16 | Header/hero vs V5 | Navbar V5 (SERVICES · PORTFOLIO · PROCESS · PRICING · CONTACT · LOGIN · KONSULTASI) dan CTA hero V5 berbeda dari gambar anchor yang sebelumnya wajib ditiru | Konflik instruksi | **Keputusan Owner** (lihat §11) | P0 | — |

Yang sudah baik dan **dipertahankan**: design system & token Dual Foundation, komponen motion reusable, hero sinematik, 31+ route responsif, a11y WCAG 2.2 AA, reduced motion, CLS 0, suite Playwright (Chromium/Firefox/WebKit).

## 2. Fitur tersedia vs belum

| Area | UI | Fungsi nyata |
|---|---|---|
| Website publik (Home, Layanan ×5, Solusi ×7, Portofolio, Studi Kasus, Pricing, Rancang Paket, Kontak, Tentang, Insights) | [x] | [x] statis |
| Smart Brief + consent, kuis kebutuhan | [x] | [~] validasi klien saja; tidak tersimpan/terkirim |
| WhatsApp CTA | [~] | [ ] menunggu pemasangan nomor |
| Login / reset / client login | [x] | [ ] |
| Dashboard Owner, Operations | [x] | [ ] data demo |
| CRM pipeline, Quotation + approval | [x] | [ ] data demo |
| Proyek + Kanban (drag, keyboard) | [x] | [ ] tidak persisten |
| Produksi konten, Kalender, Media | [x] | [ ] |
| Publishing (Metricool), WhatsApp campaign, Ads | [x] | [ ] **belum terhubung** (ditampilkan jujur) |
| Laporan & chart | [x] | [ ] data demo |
| Tim & RACI, Settings | [x] | [ ] |
| Client Portal | [x] | [ ] tanpa isolasi akses |
| RBAC, audit log, notifikasi, upload file | [ ] | [ ] |

## 3. Sitemap final (usulan)

**Publik:** `/` · `/services` · `/services/digital-marketing` · `/services/website-development` · `/services/business-systems` · `/services/creative-studio` (UI/UX & Branding) · `/services/ai-automation` · **`/solusi/fnb`** (F&B, studi kasus Garage OS) + `/solusi/[jenis-usaha]` · `/portfolio` · `/case-studies` · `/pricing` · `/build-your-package` · **`/process`** · `/about` · `/contact` · **`/faq`** · `/insights` · **`/privacy`** · **`/terms`** · **404**
**Auth:** `/login` · **`/forgot-password`** · `/reset-password` · `/client/login`
**Workspace (privat):** **`/workspace`** (dashboard per role) · `/workspace/tasks` · `/workspace/projects/[id]` · `/workspace/crm` · `/workspace/quotations` · `/workspace/content` · `/workspace/calendar` · `/workspace/publishing` · `/workspace/approvals` · `/workspace/media` · `/workspace/reports` · `/workspace/team` · `/workspace/settings`
**Portal klien (privat):** `/portal` · `/portal/projects/[id]`
(tebal = baru)

## 4. User flow marketing

Iklan/IG/Google/Referral → Home → (kartu masalah · jenis usaha · kuis) → halaman layanan/solusi → **WhatsApp (pesan otomatis sesuai layanan)** atau Smart Brief + consent → CRM: New Lead → Contacted → Qualified → Consultation → Proposal → Negotiation → Won/Lost → (Won) Project Created → undangan Portal Klien.

## 5. Workflow tim (default; PIC bisa diubah Owner)

| Tahap | PIC default | Status masuk → keluar | Serah terima ke |
|---|---|---|---|
| Client Inquiry → CRM Lead → Smart Brief | Surya | New → Qualified | Surya |
| Quotation → Client Approval | Surya | Draft → Approved | — |
| Project Created | Surya | Ready | Roby |
| Content Planning (riset, konsep, copy, kalender, brief) | Roby | In Progress → Ready | Ojak |
| Production Preparation (alat, lokasi, checklist) | Ojak | Waiting → Ready / Blocked | Tim produksi |
| Content Production | Roby + Ojak | In Progress | Ares |
| Editing | Ares | In Progress → Review | Surya |
| Internal Review → Owner Approval | Surya | Review → Approved / Revision Required (kembali ke Ares/Roby, riwayat tetap) | Klien / Bima |
| Client Approval (bila perlu) | Klien | Review → Approved / Revision Required | Bima |
| Scheduling → Publishing | Bima | Scheduled → Published (hanya setelah tautan publikasi dicatat) | Surya |
| Analytics → Reporting → Completion | Surya | Completed | — |

Setiap tahap: PIC, deadline, status, prioritas, checklist, file, komentar, riwayat, tanggal selesai, notifikasi ke PIC berikutnya. Status tambahan otomatis: **Overdue** (lewat deadline), **Blocked** (ditandai PIC).

## 6. Role-permission matrix (ditegakkan di server)

| Kemampuan | Owner | Planner (Roby) | Production (Ojak) | Editor (Ares) | Publisher (Bima) | Klien |
|---|---|---|---|---|---|---|
| Lihat semua proyek | ✔ | ditugaskan | ditugaskan | ditugaskan | ditugaskan | miliknya |
| CRM & lead | ✔ | – | – | – | – | – |
| Quotation: buat / setujui | ✔ / ✔ | – | – | – | – | lihat & setujui miliknya |
| Buat & tugaskan task | ✔ | tahapnya | – | – | – | – |
| Ubah status tahap sendiri | ✔ | ✔ | ✔ | ✔ | ✔ | – |
| Upload file / preview | ✔ | ✔ | ✔ | ✔ | ✔ | feedback |
| Approval konten | ✔ | – | – | – | – | bila diminta |
| Jadwal & publish | ✔ | – | – | – | ✔ | – |
| Anggaran, Ads, laporan bisnis | ✔ | – | – | – | – | laporan proyeknya |
| Kelola tim, role, undangan | ✔ | – | – | – | – | – |
| Audit log | ✔ | – | – | – | – | – |

## 7. Inventaris komponen dashboard

| Komponen V5 | Status | Catatan |
|---|---|---|
| Project Overview, Project Progress | [x] UI | `/os`, `/os/projects` |
| Content Production Pipeline | [x] UI | `/os/content` |
| Upcoming Schedule (kalender) | [x] UI | `/os/calendar` |
| Activity Feed, Notifications | [~] | popover demo |
| Marketing Performance, chart | [x] UI | `/os/reports` |
| Kanban, List | [x] UI | drag + keyboard |
| **My Tasks** | [ ] | per pengguna login |
| **Team Workload** | [ ] | |
| **Today's Deadlines** | [ ] | |
| **Approval Center** | [~] | tersebar di quotation/konten |
| **Timeline view** | [ ] | |
| **Smart Task Detail** (drawer) | [ ] | komentar, lampiran, riwayat, checklist, aksi per role |
| **Quick Actions** | [~] | ⌘K navigasi saja |
| 12 status standar + ikon + warna | [~] | pill ada; perlu disatukan |
| Skeleton, empty, error state | [~] | skeleton & empty ada; error state perlu |

## 8. Spesifikasi animasi

- **Publik (sinematik):** hero timeline (ada), text reveal (ada), parallax ringan (ada), draw-on SVG (ada), scroll storytelling (ada), magnetic CTA terbatas (ada), page transition halus (tambah), image reveal (tambah).
- **3D hero (Three.js):** *tidak direkomendasikan sebagai default* — maskot adalah PNG 2D tanpa layer; 3D menambah ±150 kB+ dan menurunkan skor mobile yang sudah 78. Opsi: scene 3D ringan hanya desktop, lazy-load, fallback gambar. **Keputusan Owner.**
- **Workspace (produktif):** count-up, transisi status, drag feedback, drawer, toast, skeleton, sidebar collapse (semua ada); approval success feedback (tambah). Durasi ≤ 280 ms, tanpa parallax.
- Wajib: transform/opacity saja, `prefers-reduced-motion`, CLS 0, keyboard tetap berfungsi.

## 9. Struktur folder & route (usulan)

```
app/(public)/…            halaman marketing
app/(auth)/login|forgot-password|reset-password|client/login
app/(workspace)/workspace/…   privat staf (middleware + cek role di server)
app/(portal)/portal/…         privat klien (scope per klien)
app/api/…                 webhook & route handler
src/components/{motion,layout,public,os,form,doodle}   (tetap)
src/content/              copy marketing (tetap)
src/server/{auth,db,actions,permissions}               (baru)
src/fixtures/             hanya untuk mode demo publik
```
Stack aktual **bukan Tailwind** (CSS Modules + token). Rekomendasi: **tidak migrasi ke Tailwind** — tidak menambah nilai dan berisiko regresi pada 33 route yang sudah teruji.

## 10. Rencana implementasi bertahap

| Fase | Isi | Butuh |
|---|---|---|
| **P0-A (frontend) — SELESAI 12 Nov** | [x] Navbar V5 (Layanan · Portofolio · Proses · Pricing · Kontak · Login Workspace · Konsultasi) + drawer · [x] WhatsApp 6281396186251 di hero/layanan/pricing/CTA/footer/floating + pesan otomatis per halaman · [x] 404 · [x] `/forgot-password` (UI) · [x] `/process` · [x] `/workspace` → `/os` (sementara) · [~] Instagram: handle tampil di footer, **belum ditautkan** (menunggu URL terverifikasi) · Uji: Chromium 543 lulus + 5 kegagalan yang sudah diperbaiki & diuji ulang (1 bug nyata: tombol Konsultasi menutupi tombol menu di HP pada beberapa halaman; 4 baseline visual diperbarui), 43 uji lintas browser terarah lulus | ACC + keputusan §11 no. 1 |
| **P0-B (backend inti)** | [ ] Database + auth (undangan staf, login, sesi, logout) · [ ] middleware & RBAC server · [ ] audit log · [ ] task/proyek/status persisten · [ ] Task Detail, My Tasks, Approval Center | Keputusan stack & akun layanan (§11 no. 2) |
| **P1** | [ ] Lead capture → CRM nyata · [ ] quotation & portal klien terisolasi · [ ] halaman F&B/Process/FAQ/Privacy/Terms · [ ] SEO (metadata, OG, schema, sitemap) · [ ] Timeline & Workload view | Konten legal & studi kasus Garage OS dari Owner |
| **P2** | [ ] Optimasi performa mobile · [ ] page transition · [ ] laporan lanjutan · [ ] integrasi Metricool/Ads resmi (bila akses tersedia) · [ ] analytics + consent | Akun/API pihak ketiga, ACC produksi |

Setiap fase ditutup dengan: typecheck, build, Playwright (navigasi, auth, izin per role, workflow E2E, responsif, reduced motion), axe, Lighthouse, cek console.

## 11. Keputusan yang dibutuhkan dari Owner

1. **Navbar & hero:** ikuti V5 (menu SERVICES · PORTFOLIO · PROCESS · PRICING · CONTACT · LOGIN WORKSPACE · KONSULTASI; CTA "Explore Services" + "Konsultasi WhatsApp") walau berbeda dari gambar anchor? Usulan: **ya**, gaya visual anchor tetap.
2. **Backend:** V5 membuka ruang lingkup backend (sebelumnya dilarang). Usulan stack: **Supabase** (PostgreSQL + Auth + Storage + Row Level Security). Perlu: persetujuan, dan Owner membuat proyek Supabase sendiri (saya tidak membuat akun atau memasukkan kredensial).
3. **3D hero:** lewati (usulan), atau versi ringan desktop saja.
4. **Tailwind:** tetap CSS Modules (usulan), atau migrasi.
5. **Instagram:** konfirmasi URL profil `@killua_surya2`.
6. **Bahan dari Owner:** favicon persegi, fitur Garage OS yang sudah aktif vs pengembangan vs konsep, teks Privacy/Terms (atau izin saya buatkan draf untuk ditinjau), alamat/kota usaha.

## 12. Progres 12 Nov (lanjutan, frontend saja)
- [x] **Tugas & Approval** (`/os/tasks`): My Tasks, deadline hari ini, Approval Center, Beban Tim, Timeline, Smart Task Detail (checklist, lampiran, komentar, riwayat, ubah PIC oleh Owner, aksi per peran), 12 status V5 (Overdue dihitung dari deadline; Published wajib tautan; revisi kembali ke Editing tanpa menghapus riwayat). **DATA DEMO, belum tersimpan** — "Lihat sebagai" hanya simulasi; izin nyata menunggu backend.
- [x] SEO dasar: metadata + Open Graph, schema Organization & FAQPage, `sitemap.xml` (25 URL), `robots.txt` (workspace/portal/login tidak diindeks). Domain kanonik: `NEXT_PUBLIC_SITE_URL` (default `https://killuasurya.tech`) — konfirmasi Owner.
- [x] Halaman `/faq`; `/privacy` dan `/terms` sebagai **DRAF** (noindex, berlabel belum ditinjau hukum).
- Uji: Chromium 605 lulus / 0 gagal (37 route × 2 tema × 5 viewport + a11y + interaksi); uji terarah WebKit lulus.
- [!] Tetap terblokir: backend (keputusan + proyek Supabase), URL Instagram, favicon, status fitur Garage OS, teks legal final.

## 13. Progres 13 Nov — backend inti + sistem ikon animasi
- [x] Backend (Supabase): skema + RLS + alur kerja + anti-spam + penawaran (`supabase/migrations/0001–0003`). Uji live lokal 10/10 (`tests/live`). Layar live: Dashboard, Tugas & Approval, Produksi Konten, CRM, Quotation, Proyek, Tim & Akses, Portal Klien, login/reset. **Belum diuji di proyek cloud Owner.**
- [x] Sistem ikon animasi (`src/components/icons/`): 8 ikon ilustrasi orisinal gaya stiker Electric Doodle (growth, creative, website, system, ai, chat, shield, pin) dengan animasi masing-masing; ikon garis (lucide) menggambar diri saat masuk layar dan bereaksi saat kartu di-hover. Referensi pola: lucide-animated, Itshover (implementasi & gambar orisinal). Maskot dan logo tidak disentuh.
- [x] Motion tambahan: progress bar scroll (CSS scroll-driven), sorotan kursor pada kartu, entrance daftar tugas, count-up KPI. Semua mati pada `prefers-reduced-motion`.
- Performa: Lighthouse Home desktop 99, mobile ±75 (sebelumnya 78; halaman lebih panjang + lebih banyak animasi), `/os` mobile 89, CLS 0, a11y 100.

## 14. Penyederhanaan workflow (13 Nov, disetujui Owner)
- [x] Menu per peran: Owner 7 item (Hari Ini, Tugas, Pipeline Konten, Proyek, Penjualan, Tim & Akses, Pengaturan) + grup **Pratinjau (data contoh)** tertutup; staf 4 item (Hari Ini, Tugas Saya, Pipeline Konten, Proyek). Semua halaman lama tetap ada (⌘K mencari semuanya). Dashboard referensi pindah ke `/os/overview`.
- [x] **Hari Ini** (`/os`): daftar "kerjakan sekarang" diurutkan (terlambat → blocked → deadline hari ini → revisi), satu tombol langkah berikutnya per tugas; Owner: "Perlu keputusan Anda" (approval, prospek baru, penawaran berjalan) + "Tim hari ini"; panduan "Mulai dari sini" saat belum ada tugas (live).
- [x] **Peta tahap** di detail tugas (8 tahap, posisi sekarang, "Setelah tahap ini: … oleh …") dan versi mini di daftar.
- [x] **Penjualan**: tab 1 Prospek → 2 Penawaran → 3 Jadi proyek.
- Uji: Chromium 636 lulus / 0 gagal; live (Supabase lokal) 10/10.
- Berikutnya (butuh input Owner): template proyek dari contoh proyek nyata.

## 15. Template proyek + bahan klien (13 Nov, dari cerita Owner)
Kasus nyata: landing page acara akhir tahun, pengerjaan 3 hari, macet menunggu data klien (logo, dokumen, konsep/alur acara).
- [x] Template **Landing Page Acara (3 hari kerja)** (`src/lib/templates.ts`): 10 bahan klien (5 wajib), masing-masing dengan format yang diminta dan **Rencana B**; 7 tugas terjadwal Hari 1–3 dengan PIC per peran + checklist.
- [x] **Jam kerja baru jalan saat bahan wajib lengkap** (diterima atau Rencana B). Tombol "Mulai hitung 3 hari kerja" → deadline semua tugas dihitung (hari kerja, Sabtu/Minggu dilewati). Bahan yang memakai Rencana B otomatis jadi tugas "Ganti Rencana B dengan bahan asli".
- [x] **Pesan pengingat WhatsApp** siap kirim (hanya bahan yang kurang + tenggat).
- [x] **Portal klien**: daftar bahan + status jam kerja; klien menekan "Sudah saya kirim" (+ catatan/link Drive).
- [x] **Hari Ini (Owner)**: blok "Menunggu bahan klien" (yang kurang, tenggat lewat berapa hari).
- [x] Server: `0004_project_templates.sql` — tabel `project_materials` + RLS; staf hanya menandai diterima, Rencana B hanya Owner (trigger); klien hanya lewat `material_mark_sent`; `project_start` menolak bila bahan wajib belum lengkap.
- Template berikutnya ditambah di `src/lib/templates.ts` (cukup daftar bahan + rencana per hari).

## 16. Persetujuan klien di Portal (13 Nov)
- [x] Owner: aksi **Kirim ke klien** (wajib link pratinjau) dari tugas yang sedang dikerjakan atau sedang di-review → tahap Client Approval.
- [x] Klien (Portal): kartu **Perlu persetujuan Anda** → Buka pratinjau / **Setujui** (→ Scheduling, Publisher) / **Minta revisi** dengan catatan (→ Revisi, Editing). Putaran revisi dihitung; lebih dari 1 ditandai "di luar paket" untuk Owner.
- [x] Owner melihat "Menunggu persetujuan klien" di Hari Ini; catatan klien tampil di detail tugas.
- [x] Sub-tugas template ditutup PIC dengan **Selesai** (tanpa putaran approval). Tugas akhir template (`needs_client`) wajib lewat klien.
- [x] Template Landing Page Acara: Hari 3 kini satu tugas "Cek akhir, approval klien & tayang" yang mengalir ke klien lalu ke Bima.
- [x] Server (`0005_client_approval.sql`): `client_decide` hanya untuk klien pemilik proyek; staf tidak bisa Kirim ke klien; tugas yang butuh klien tidak bisa "Selesai" langsung.
- Uji live 12/12 (termasuk alur revisi → setujui → Bima).

## 17. PDF penawaran, upload file, template konten bulanan (13 Nov)
- [x] **PDF penawaran** (`/api/quotations/[id]/pdf`, pdf-lib): logo, nomor, klien, item, total, catatan, ketentuan, kontak WA. Watermark DRAFT untuk draf dan "DATA DEMO" di mode demo. Live: dibaca dengan sesi pengguna (RLS) — Owner, atau klien pemilik untuk penawaran terkirim/diterima/revisi; staf 404, tanpa login 401. Tombol Unduh PDF di Penjualan dan Portal.
- [x] **Upload file bahan** (Portal klien + Proyek tim): maks. 20 MB, jenis file dibatasi (gambar, PDF, AI/EPS, ZIP, video, Office). Upload klien → bahan "dikirim, cek"; upload tim → "Diterima". Unduh lewat link bertanda tangan 60 detik. Storage RLS: klien hanya proyeknya sendiri (diuji: 403 untuk proyek lain).
- [x] Template **Konten Media Sosial Bulanan (20 hari kerja)**: 7 bahan (5 wajib; akses akun lewat undangan kolaborator, bukan kata sandi), 6 tugas (kalender → approval klien, persiapan, shooting, editing batch 1 & 2 → approval klien, laporan bulanan).
- Uji live 13/13.

## 18. Notifikasi & Kalender dari data nyata (13 Nov)
- [x] **Lonceng notifikasi** (live): perubahan pada tugas saya oleh orang lain (Owner: semua tugas) dalam 14 hari + bahan yang baru dikirim klien. Klik → langsung ke tugas/proyek. Titik "baru" hilang setelah dibuka (diingat per browser). Mode demo tetap memakai contoh berlabel DATA DEMO.
- [x] **Kalender** dipindah ke menu Kerja (Owner & staf), isinya dari data kerja: deadline tugas, jadwal terbit, approval, mulai & target proyek template, tenggat bahan klien. Item terlambat ditandai; setiap item membuka tugas/proyeknya. Tidak ada event karangan.
- Uji live 13/13.
