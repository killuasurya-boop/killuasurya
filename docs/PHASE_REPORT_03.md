# KILLUASURYA.TECH — Laporan Fase 03: Agency OS (12 Nov 2026)

Lingkup: frontend + motion. Seluruh Agency OS memakai **fixture lokal `src/fixtures/os.demo.ts`** dan menampilkan label **DATA DEMO**. Tidak ada backend, API provider, database, auth server, atau deploy.

## Route
| Route | Referensi | Isi | Motion utama |
|---|---|---|---|
| `/os` | Agency OS Dashboard-1 | Hero Lead-to-Project + maskot asli, 4 KPI, alur 10 tahap (persis flowchart), pipeline Kanban/Tabel, donut progres, aktivitas, funnel, tren, layanan | KPI count-up, sparkline draw, chevron stagger, tab layout pill, chart draw + crosshair |
| `/os/operations` | Agency OS Dashboard-4 | 6 KPI, 3 workflow (Content, Publishing, WhatsApp — persis flowchart), proyek aktif, integrasi, 3 tabel | Chevron stagger, progress bar reveal |
| `/os/crm` | 02.39.13-2 | Tabel sortable + filter + pencarian, tampilan Pipeline, drawer detail, ubah status | Row layout transition, kartu pindah kolom (layoutId), drawer slide, toast |
| `/os/quotations` | Board-3 / anchor | Daftar, detail item, stepper status §09.2, approval Owner (modal), unduh PDF | Detail slide, stepper scale, modal, loading button |
| `/os/projects` | anchor kanban | Kartu proyek + board tugas drag & drop (mouse/touch/keyboard) | Drag overlay lift + glow, drop animation, kolom highlight |
| `/os/content` | 02.39.14-3 | Alur produksi, workspace dengan progres 8 tahap, approval/revisi | Stage track fill, approval card transition |
| `/os/publishing` | 02.39.15-4 | Alur publikasi, antrian + idempotency, matriks kemampuan, provider | Retry spinner (hasil jujur: tidak dijalankan) |
| `/os/whatsapp` | 02.39.16-5 | Studio 5 langkah: segmen → consent → template/preview → approval Owner → jadwal (kirim nonaktif) | Step slide, count-up eligible, bubble preview, approval check |
| `/os/reports` | Dashboard-4 / Board-2 | KPI, tren, funnel, distribusi, layanan; tab Ads Control (empty state jujur) | Chart draw, bar grow |
| `/os/calendar` | 02.39.14-3 | Kalender bulan + panel detail | Month slide, day hover/selected glow |
| `/os/media` | 03.09.13-2 | Upload zone (simulasi), filter tipe, Grid/List, modal pratinjau | Grid↔List layout transition, drop-zone pulse, progress |
| `/os/team` | Team Playbook V4 | Kartu tim, RACI persis, aksi sensitif | Fokus kolom RACI |
| `/os/settings` | 03.09.17-5 | Profil, tema Dual Foundation, notifikasi (switch), integrasi | Switch spring, theme pill |
| `/portal` | Audit Board-2 / PRD §11 | Milestone, deliverable + approval, invoice (scope 1 klien) | Timeline line draw, milestone stagger |

Shell: sidebar collapse/expand (tersimpan per browser), indikator aktif lime (anchor), command palette ⌘K/Ctrl+K, notifikasi, toggle tema, bottom nav + drawer di mobile.

## Guardrail yang diterapkan
- Nama klien di fixture fiktif; unit ekosistem nyata (Garage Coffee/OS, Desain Aja Dulu, TM 87 Farm) **tidak** dipakai sebagai klien palsu.
- Semua integrasi = **Belum terhubung** (referensi menampilkan "Terhubung" → deviasi yang disengaja, aturan 7).
- Status WON di CRM dijaga: butuh bukti kontrak (PRD §08.2). Retry publikasi tidak pernah menampilkan "berhasil". Pengiriman WhatsApp nonaktif. PDF/upload hanya simulasi dengan pesan jujur.
- Avatar tim memakai inisial — tidak membuat varian maskot per orang (referensi menampilkan karakter per anggota yang tidak tersedia sebagai aset).
- Kontrol akses di Tim & Akses dinyatakan sebagai demonstrasi UI.

## Chart & aksesibilitas
- Palet kategorikal divalidasi dengan `dataviz/validate_palette.js`: Light **PASS semua**; Dark PASS CVD/normal-vision/kontras, **pengecualian lightness-band** pada slot 1 karena lime brand `#C7F60C` dikunci untuk fidelitas — semua seri memiliki legend + label langsung.
- Line chart: crosshair + tooltip, legend, label ujung, "Lihat sebagai tabel". Donut: legend dengan nilai & persen. Status selalu teks + warna.
- Kanban keyboard: Spasi untuk ambil, ←/→ lompat satu kolom (coordinate getter khusus), Spasi untuk lepas, dengan pengumuman screen reader.

## QA (terukur)
| Pemeriksaan | Hasil |
|---|---|
| 14 route × Dark/Light × 1440/1024/768/390: error, overflow, elemen tersangkut | PASS (setelah perbaikan) |
| Perbaikan: chevron tidak muncul di kontainer scroll horizontal (whileInView → animate on mount) | Diperbaiki |
| Perbaikan: overflow 393px di CRM 390px — teks `sr-only` di tabel ber-scroll memakai html sebagai containing block | Diperbaiki (`tableWrap { position: relative }`, juga di halaman publik) |
| Perbaikan: KPI terlalu sempit (nilai Rupiah menabrak sparkline) | Layout KPI 2 baris |
| Interaksi: ⌘K navigasi, WA terkunci bila 0 eligible, CRM drawer + Esc + WON guard + empty state, approval quotation, kanban keyboard ke "Selesai", switch, sidebar collapse 84px, mobile bottom nav + drawer | PASS (`qa/os-flows.cjs`, 0 page error) |
| Build / typecheck | PASS — 36 halaman statis; First Load JS Agency OS 208–234 kB |

### Deviasi / NEEDS_REVIEW
- Ilustrasi karakter per anggota tim, foto thumbnail konten, dan ikon brand platform (Instagram, TikTok, dll.) di referensi tidak tersedia sebagai aset → diganti inisial, ilustrasi objek SVG asli, dan teks.
- Warna aktif sidebar mengikuti anchor (lime), bukan biru seperti Dashboard-1.
- Belum diukur: Lighthouse LCP/INP/CLS & FPS (Phase 10).
