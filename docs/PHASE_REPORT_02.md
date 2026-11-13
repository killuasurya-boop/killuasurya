# KILLUASURYA.TECH — Laporan Fase 02: Halaman Publik (12 Nov 2026)

Lingkup: frontend + motion. Semua formulir dan login **tidak terhubung ke backend** dan diberi label `DATA DEMO` / `UI DEMO`.

## Route yang dibangun
URL mengikuti sitemap PRD V4 §05; label navbar mengikuti gambar referensi.

| Route | Referensi | Konten & sumber | Motion |
|---|---|---|---|
| `/` | Anchor showcase | (Fase 01) | Hero timeline, scroll storytelling |
| `/services` | Growth Board-2 + PRD §03/§03.7/§27 | 5 lini layanan, tabel "dijual vs bukti selesai", biaya pihak ketiga, flow Lead-to-Project | Split headline, underline draw, crown draw, card stagger + hover lift |
| `/services/[slug]` ×5 | PRD §03.1–03.5 | Ruang lingkup, guardrail, disclaimer quotation, layanan lain | Sama |
| `/portfolio` | PRD §12/§12A | Kartu ekosistem dengan **label bukti** (Konsep / Kode tersedia · belum UAT), tabel solusi industri | Tabs (layoutId), filter dengan layout transition, tilt pointer (mouse saja) |
| `/case-studies` | Growth Board-2 "Flowchart Operasional" | 4 flow persis FLOWCHART_MERMAID + tim & peran (Team Playbook) | Flow step stagger, decision node lime |
| `/pricing` | PRD §04/§09.1 | 7 paket (START…ENTERPRISE), harga = "Konsultasi untuk Penawaran", FAQ | Accordion height, card reveal |
| `/build-your-package` | PRD §09.1 | Paket, layanan, add-on, durasi, kompleksitas → diteruskan ke Smart Brief | Choice card tick, progress bar, chip layout, toast |
| `/contact` | PRD §08.1 + komponen 34 stepper | Smart Brief 8 langkah + consent + ringkasan | Step slide (arah maju/mundur), indikator aktif lime, shake validasi, check-burst draw saat sukses |
| `/about`, `/insights` | PRD §27, Team Playbook | Prinsip kerja, proses produksi, FAQ | Reveal |
| `/login`, `/client/login`, `/reset-password` | Board "Login ke Ekosistem" (03.09.12-1) | Google, email, password (toggle), ingat saya, lupa sandi, magic link, akses sesuai peran | Card enter, error shake, loading button, toast "belum terhubung" |

## Kejujuran data & guardrail (diterapkan)
- Tidak ada harga, KPI, nama klien, testimoni, atau hasil yang dikarang. Harga menunggu rate card Owner (D-05); portofolio menunggu izin publikasi (D-11).
- Smart Brief sukses menampilkan **referensi pratinjau `DEMO-xxxxx`** dan teks bahwa data tidak terkirim.
- Login: tombol Google/magic link/masuk memunculkan toast "belum terhubung". Kartu "Aman & Terkendali" tidak mengklaim enkripsi aktif (deviasi teks dari referensi "Aman & Tercaya … enkripsi") karena belum ada backend.
- Reset password tidak membocorkan keberadaan akun (PRD §13A.4).
- WhatsApp resmi TBD (D-03) → semua CTA ke `/contact`. Kebijakan privasi TBD (D-15) → dicatat di langkah persetujuan.

## Visual & functional QA (terukur)
Bukti: `docs/qa/phase02/*.jpg` (Dark/Light × 1440/390 untuk 12 route) + `flow-brief-success.png`.

| Pemeriksaan | Hasil |
|---|---|
| 12 route × Dark/Light × 1440/768/390: HTTP error, page error, console error | PASS (0) |
| Horizontal overflow | PASS setelah perbaikan tabs portfolio (2px di 390) |
| Elemen tersangkut opacity 0 setelah scroll | PASS (0) |
| Smart Brief: validasi per langkah, email salah, tujuan/layanan wajib, consent wajib, ringkasan, sukses demo | PASS |
| Smart Brief: fokus pindah ke field pertama setiap langkah | PASS (diperbaiki: sebelumnya fokus hilang ke body) |
| Package Builder: preselect `?package=GROW`, toast belum lengkap, handoff query ke `/contact` | PASS |
| Login: validasi, toggle kata sandi, loading → toast belum terhubung | PASS |
| Tabs portofolio: navigasi panah keyboard + filter | PASS |
| Reduced motion | PASS (pre-state hanya aktif bila motion diizinkan) |
| Build / typecheck | PASS — 20 halaman statis, First Load JS 213–222 kB |

### Deviasi / NEEDS_REVIEW
- Halaman publik selain Home dan Login **tidak punya mockup per halaman** di folder referensi; layout diturunkan dari sistem desain (anchor, Growth Board, Login board) — perlu review Owner.
- Kartu fitur login tampil 2×2 (referensi 1×4) karena lebar kolom.
- Studi Kasus memakai route `/case-studies` (tidak ada di sitemap PRD, tetapi ada di navbar referensi).
- Struktur Home: tetap di `app/page.tsx` + `PublicShell` (tidak dipindah) agar tidak perlu menghapus file di folder Owner.

## Berikutnya
Agency OS: shell + sidebar, Owner Dashboard, CRM & pipeline, quotation, project/kanban, content production, media library, calendar, publishing control, WhatsApp consent studio, reporting, team & roles, settings, client portal — semua dengan fixture berlabel DATA DEMO.
