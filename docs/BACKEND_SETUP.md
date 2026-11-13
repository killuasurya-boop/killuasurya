# Backend setup — Supabase (P0-B langkah 1)

Status: kode siap, **belum terhubung** sampai Owner membuat proyek Supabase. Tanpa env, situs tetap berjalan dalam **mode demo** seperti sebelumnya.

## Yang sudah dibuat & diuji
Diuji end-to-end terhadap **Supabase lokal** (Docker) dengan pengguna uji — `tests/live/live.spec.ts`, 10/10 lulus:
tanpa login tidak bisa buka `/os` & `/portal` · sandi salah ditolak · Smart Brief tersimpan sebagai lead · editor hanya melihat tugasnya dan tidak bisa approve · Owner approve → serah terima ke publisher, riwayat utuh · Published wajib tautan · klien hanya melihat proyeknya dan tidak bisa masuk workspace · tautan reset → buat kata sandi baru → login · form lead dibatasi (maks. 3/jam per pengirim, 40/jam total; insert langsung ditolak) · penawaran: draft → disetujui → diterima klien → jadi proyek (total dihitung server, item terkunci setelah disetujui).

| Bagian | File |
|---|---|
| Skema + Row Level Security + audit | `supabase/migrations/0001_init.sql` |
| Transisi alur kerja di server (`task_transition`) | `supabase/migrations/0002_workflow.sql` |
| Gerbang lead anti-spam, alur penawaran, penawaran → proyek | `supabase/migrations/0003_leads_quotes.sql` |
| Template proyek + daftar bahan klien + jam kerja yang baru jalan saat bahan lengkap | `supabase/migrations/0004_project_templates.sql` |
| Persetujuan klien di Portal (Setujui / Minta revisi) + "Selesai" untuk sub-tugas template | `supabase/migrations/0005_client_approval.sql` |
| Upload file bahan klien (Storage bucket privat `project-files`, maks. 20 MB) | `supabase/migrations/0006_project_files.sql` |
| Merapatkan hak akses anon pada tabel bahan & file | `supabase/migrations/0007_harden_anon.sql` |
| Proteksi route | `middleware.ts` |
| Login, logout, lupa sandi | `src/server/actions/auth.ts` |
| Data & aksi (tugas, lead, tim) | `src/server/data.ts`, `src/server/actions/tasks.ts`, `leads.ts` |

**Layar yang LIVE saat backend aktif:** Dashboard (`/os`), Produksi Konten (`/os/content`), Tugas & Approval (`/os/tasks`), CRM leads (`/os/crm`), Quotation (`/os/quotations`), Proyek & Tugas (`/os/projects`), Tim & Akses (`/os/team`), Portal Klien (`/portal`), login/logout/buat kata sandi.
**Masih DATA DEMO (berlabel):** Operations, Publishing, WhatsApp, Laporan, Media, Settings. (Kalender & notifikasi sudah memakai data nyata.)

**Belum diuji terhadap proyek Supabase cloud milik Owner** (belum dibuat) — termasuk pengiriman email undangan/reset.

## Akun demo (mode demo, tanpa backend)
Selama `.env.local` kosong, `/login` menampilkan 6 akun demo (Owner, Roby, Ojak, Ares, Bima, Klien — sandi `demo12345`) untuk mencoba alur login dan tampilan per peran dengan data contoh. Kode ini **tidak aktif** begitu Supabase terhubung (`src/lib/demo-accounts.ts`, cabang demo di `signIn`).

## Langkah Owner (± 15 menit)
1. Buat proyek di supabase.com (region Singapore).
2. SQL Editor → jalankan `0001_init.sql`, `0002_workflow.sql`, `0003_leads_quotes.sql`, `0004_project_templates.sql`, `0005_client_approval.sql`, `0006_project_files.sql`, lalu `0007_harden_anon.sql` (berurutan). 0006 juga membuat bucket Storage `project-files` (privat) — tidak perlu dibuat manual. Yang sudah pernah dijalankan tidak perlu diulang.
3. Authentication → Sign In / Providers → Email: **matikan "Allow new users to sign up"** (staf hanya lewat undangan). Authentication → URL Configuration: isi Site URL.
4. Authentication → Users → **Add user → Create new user**: isi email + kata sandi Anda, centang Auto Confirm. Lalu di SQL Editor jadikan Owner:
   `update public.profiles set role = 'owner', full_name = 'Surya' where id = (select id from auth.users where email = 'EMAIL_ANDA');`
   Staf dan klien ditambahkan dengan cara yang sama (atau Invite), lalu perannya diatur dari **Tim & Akses** di workspace. Klien dihubungkan ke proyeknya lewat tabel `client_members`.
4b. Authentication → Email Templates — agar tautan undangan & reset membuka halaman "Buat Kata Sandi" di situs, ganti tautan pada template **Invite user** dan **Reset password** menjadi:
   `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=invite` (Invite) dan `…&type=recovery` (Reset).
5. Project Settings → API: salin **Project URL** dan **anon / publishable key** ke file `.env.local` (lihat `.env.example`). **Jangan** masukkan `service_role` key ke mana pun di proyek ini, dan jangan kirim key lewat chat.
6. `npm run build && npm run start`, lalu coba login.

## Uji lokal (opsional, butuh Docker)
```bash
npx supabase start          # menjalankan Supabase lokal + migrasi
# buat pengguna uji *@test.local + peran (lihat tests/live/live.spec.ts), build dengan env lokal, lalu:
npx next start -p 3200
npx playwright test -c playwright.live.config.ts
```
Jangan pernah mengarahkan tes ini ke proyek produksi.

## Belum dikerjakan
- Menyambungkan layar yang masih DATA DEMO (Operasional, Publishing, WhatsApp, Laporan, Media). Kalender & notifikasi sudah live. Publishing/WhatsApp/Ads butuh akses resmi pihak ketiga.
- Board proyek live bersifat tampilan (klik kartu → detail tugas); perpindahan status lewat aksi alur kerja, bukan drag bebas.
- Kirim penawaran otomatis ke email/WA klien (PDF sudah bisa diunduh; Owner mengirim sendiri).
- Undangan staf/klien dari UI (butuh fungsi server dengan kunci admin — sengaja belum dibuat), notifikasi, 
- Anti-spam dasar sudah ada (honeypot, waktu isi minimum, batas per jam). CAPTCHA (mis. Turnstile) bisa ditambah bila spam masih lolos. Opsional: set `LEAD_HASH_SALT` di `.env.local`.
- Login Google dan magic link (tombolnya masih "belum terhubung").

## Status proyek cloud (13 Nov 2026)
- Proyek Supabase **killuasurya-tech** (organisasi GARAGE WORKSPACE, paket Free, region Singapore `ap-southeast-1`), URL `https://xbkdepprinqwbuvpqtkm.supabase.co`.
- Migrasi 0001–0007 sudah dijalankan di SQL Editor dan dicek: 14/14 tabel ber-RLS, bucket `project-files` privat + 3 policy, fungsi alur kerja lengkap. Dari luar (kunci publik): semua tabel ditolak, insert prospek langsung ditolak, `submit_lead` menolak tanpa persetujuan.
- Auth → URL Configuration: Site URL `http://localhost:3000`, Redirect `http://localhost:3000/**`. **Saat domain produksi siap**: ganti Site URL ke domain itu dan tambahkan `https://<domain>/**`.
- Template email terkunci sampai SMTP sendiri dipasang. Aplikasi sudah menangani link email bawaan Supabase (sesi di `#access_token…` → halaman Buat Kata Sandi; link kedaluwarsa → Lupa Kata Sandi). Email bawaan Supabase dibatasi jumlahnya per jam — pasang SMTP (mis. Resend/Brevo) sebelum mengundang banyak orang.
- `.env.local` (hanya URL + anon key + garam acak) ada di folder `web` dan salinan lokal laptop; tercakup `.gitignore`. Kunci service_role tidak dipakai dan tidak disimpan di mana pun.
- Akun Owner: Authentication → Users → **Add user → Send invitation** ke email Owner → buka email → buat kata sandi → lalu di SQL Editor: `update public.profiles set role = 'owner', full_name = 'Surya' where id = (select id from auth.users where email = '<email owner>');`
