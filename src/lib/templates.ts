import type { StageId } from './workflow';

/**
 * Project templates. A template = (1) the materials the client must hand over BEFORE the clock starts and
 * (2) the work plan, counted in working days from the day all required materials are in.
 * Lesson from the Owner's real "landing page acara akhir tahun" gig: 3 days of work, but it stalled waiting for
 * logo, documents and the event concept — so the 3-day clock only starts once the client's materials are in
 * (or the Owner decides to go with "Rencana B" for an item).
 */
export type MaterialStatus = 'missing' | 'sent' | 'received' | 'fallback';
export type MaterialFile = { id: string; name: string; size: number };
export type Material = { id: string; label: string; detail: string; fallback: string | null; required: boolean; status: MaterialStatus; note: string; files?: MaterialFile[] };
export const MAX_UPLOAD = 20 * 1024 * 1024;
export const fmtSize = (n: number) => (n >= 1048576 ? `${(n / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);
export type TeamRole = 'owner' | 'planner' | 'production' | 'editor' | 'publisher';
export type PlanTask = { title: string; stage: StageId; role: TeamRole; day: number; checklist: string[]; client?: boolean };
export type Template = { id: string; name: string; summary: string; workdays: number; materials: Omit<Material, 'id' | 'status' | 'note'>[]; plan: PlanTask[] };

export const materialStatus: Record<MaterialStatus, { label: string; tone: string }> = {
  missing: { label: 'Belum ada', tone: 'bad' },
  sent: { label: 'Klien bilang sudah kirim — cek', tone: 'warn' },
  received: { label: 'Diterima', tone: 'good' },
  fallback: { label: 'Pakai Rencana B', tone: 'info' },
};
export const roleName: Record<TeamRole, string> = { owner: 'Owner', planner: 'Planner (Roby)', production: 'Production (Ojak)', editor: 'Editor (Ares)', publisher: 'Publisher (Bima)' };

export const templates: Template[] = [
  {
    id: 'landing-event',
    name: 'Landing Page Acara (3 hari kerja)',
    summary: 'Satu halaman untuk acara/gigs: info acara, rundown, pengisi acara, tiket/pendaftaran, lokasi, kontak.',
    workdays: 3,
    materials: [
      { label: 'Tanggal, jam & lokasi acara (+ link Google Maps)', detail: 'Info inti. Tanpa ini halaman tidak bisa tayang.', fallback: null, required: true },
      { label: 'Logo acara / brand', detail: 'PNG latar transparan atau file vektor (AI/SVG/PDF).', fallback: 'Logo teks sementara dari nama acara, diganti saat file asli masuk.', required: true },
      { label: 'Konsep & tema acara', detail: 'Nama acara, tagline, warna/nuansa, target pengunjung.', fallback: 'Kami usulkan 2 arah tema, klien pilih satu (±15 menit).', required: true },
      { label: 'Rundown / alur acara', detail: 'Jadwal sesi dari awal sampai selesai.', fallback: 'Tampilkan "Rundown segera diumumkan" + tanggal & lokasi.', required: true },
      { label: 'Tiket / cara daftar & kontak panitia', detail: 'Harga, kuota, link/form daftar, nomor WA panitia.', fallback: 'Tombol "Daftar via WhatsApp" ke nomor panitia.', required: true },
      { label: 'Dokumen pendukung (proposal/TOR, S&K)', detail: 'Bahan untuk teks "Tentang acara" dan FAQ.', fallback: 'Kami tulis ringkasan, klien cukup menyetujui.', required: false },
      { label: 'Pengisi acara / bintang tamu', detail: 'Nama + foto (minimal 800px).', fallback: 'Bagian disembunyikan sampai data ada.', required: false },
      { label: 'Foto / video / aset visual', detail: 'Dokumentasi acara sebelumnya atau foto venue.', fallback: 'Ilustrasi/foto bebas lisensi sesuai tema.', required: false },
      { label: 'Logo sponsor / partner', detail: 'PNG transparan.', fallback: 'Bagian disembunyikan sampai data ada.', required: false },
      { label: 'Domain', detail: 'Akses domain klien, atau setuju pakai subdomain kami.', fallback: 'Tayang di subdomain sementara.', required: false },
    ],
    plan: [
      { day: 1, stage: 'planning', role: 'planner', title: 'Struktur halaman & copywriting', checklist: ['Urutan section: hero, tentang, rundown, pengisi acara, tiket, lokasi, FAQ, kontak', 'Headline + tombol ajakan (CTA)', 'Teks tiap section dari bahan klien', 'Tandai bagian yang memakai Rencana B'] },
      { day: 1, stage: 'prep', role: 'production', title: 'Siapkan aset visual', checklist: ['Rapikan logo (versi terang & gelap)', 'Pilih & kompres foto (WebP < 300 KB)', 'Warna & font dari konsep acara', 'Gambar share WhatsApp/IG 1200×630'] },
      { day: 2, stage: 'production', role: 'owner', title: 'Desain & build halaman', checklist: ['Semua section sesuai struktur', 'Rapi di HP 360px sampai desktop', 'Animasi ringan', 'Lighthouse mobile ≥ 80'] },
      { day: 2, stage: 'production', role: 'owner', title: 'Tombol daftar/WA, peta & SEO dasar', checklist: ['Tombol daftar/WA panitia jalan', 'Google Maps lokasi', 'Judul, deskripsi & gambar share', 'Uji dengan data uji'] },
      { day: 3, stage: 'production', role: 'owner', client: true, title: 'Cek akhir, approval klien & tayang', checklist: ['Tanggal/jam/lokasi sama persis dengan bahan klien', 'Uji di Android & iPhone, semua tombol jalan', 'Kirim link pratinjau ke klien (tombol "Kirim ke klien")', 'Revisi maksimal 1 putaran, dikumpulkan dalam 1 pesan', 'Domain/subdomain + HTTPS, catat URL tayang'] },
    ],
  },
  {
    id: 'content-monthly',
    name: 'Konten Media Sosial Bulanan (20 hari kerja)',
    summary: 'Kalender konten → produksi → editing 2 batch dengan approval klien → terjadwal → laporan bulanan.',
    workdays: 20,
    materials: [
      { label: 'Logo & panduan brand', detail: 'Logo PNG/vektor, warna, font, contoh konten yang disukai.', fallback: 'Kami susun gaya visual dari logo + feed yang ada, klien setujui.', required: true },
      { label: 'Produk/layanan & harga yang ditonjolkan bulan ini', detail: 'Daftar + harga + keunggulan singkat.', fallback: null, required: true },
      { label: 'Promo & tanggal penting bulan ini', detail: 'Promo, event, hari besar, jam operasional khusus.', fallback: 'Kalender memakai momen umum; promo ditambahkan saat ada.', required: true },
      { label: 'Akses akun media sosial', detail: 'Undang tim kami sebagai kolaborator/admin di Meta Business Suite atau TikTok. Jangan kirim kata sandi.', fallback: 'Konten dikirim ke klien untuk diposting sendiri.', required: true },
      { label: 'Jadwal & lokasi shooting', detail: 'Tanggal, jam, alamat, kontak di lokasi.', fallback: 'Memakai foto/video dari klien + desain grafis.', required: true },
      { label: 'Foto/video yang sudah ada', detail: 'Stok foto produk, tempat, tim (link Google Drive).', fallback: 'Produksi seluruhnya saat shooting.', required: false },
      { label: 'Hal yang boleh & tidak boleh', detail: 'Kata/tema yang dihindari, klaim yang tidak boleh dipakai.', fallback: 'Mengikuti aturan platform + persetujuan klien per batch.', required: false },
    ],
    plan: [
      { day: 1, stage: 'planning', role: 'planner', client: true, title: 'Kalender konten & ide bulan ini', checklist: ['Riset tren & kompetitor', 'Pilar konten + jumlah sesuai paket', 'Hook/judul tiap konten', 'Kirim kalender ke klien untuk disetujui'] },
      { day: 4, stage: 'prep', role: 'production', title: 'Persiapan shooting', checklist: ['Shot list dari kalender', 'Alat: kamera, lighting, audio', 'Konfirmasi lokasi & jam ke klien', 'Properti & talent'] },
      { day: 6, stage: 'production', role: 'production', title: 'Shooting / produksi', checklist: ['Ambil semua shot di shot list', 'Backup file hari itu juga', 'Catat shot tambahan yang kurang'] },
      { day: 8, stage: 'editing', role: 'editor', client: true, title: 'Editing batch 1 (konten minggu 1–2)', checklist: ['Edit sesuai brand', 'Caption + hashtag', 'Kirim pratinjau batch ke klien', 'Revisi maksimal 1 putaran'] },
      { day: 13, stage: 'editing', role: 'editor', client: true, title: 'Editing batch 2 (konten minggu 3–4)', checklist: ['Edit sesuai brand', 'Caption + hashtag', 'Kirim pratinjau batch ke klien', 'Revisi maksimal 1 putaran'] },
      { day: 20, stage: 'reporting', role: 'owner', title: 'Laporan bulanan & rencana bulan depan', checklist: ['Tarik data dari platform (bukan perkiraan)', 'Konten terbaik & alasannya', 'Rekomendasi bulan depan', 'Kirim laporan ke klien'] },
    ],
  },
];
export const templateById = (id: string | null | undefined) => templates.find((t) => t.id === id) ?? null;

/** Add n working days (Mon–Fri). Day 1 of a plan = the start date itself (moved to Monday if it falls on a weekend). */
export function addWorkdays(start: string, n: number): string {
  const d = new Date(`${start}T00:00:00Z`);
  const work = () => d.getUTCDay() !== 0 && d.getUTCDay() !== 6;
  while (!work()) d.setUTCDate(d.getUTCDate() + 1);
  for (let k = 0; k < n; ) { d.setUTCDate(d.getUTCDate() + 1); if (work()) k++; }
  return d.toISOString().slice(0, 10);
}
export const dueFor = (start: string, day: number) => addWorkdays(start, day - 1);
export const daysBetween = (a: string, b: string) => Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86400000);

export function kitState(m: Material[]) {
  const req = m.filter((x) => x.required);
  const ok = (x: Material) => x.status === 'received' || x.status === 'fallback';
  return {
    reqTotal: req.length, reqReady: req.filter(ok).length, ready: req.every(ok),
    missing: m.filter((x) => !ok(x)), blockers: req.filter((x) => !ok(x) && !x.fallback), fallbacks: m.filter((x) => x.status === 'fallback'),
  };
}

export const fmtDate = (d: string) => new Date(`${d}T00:00:00`).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' });

/** Ready-to-send WhatsApp reminder listing only what is still missing (required first). */
export function reminderText(p: { client: string; name: string; materialsDue: string | null; workdays: number }, m: Material[]) {
  const miss = kitState(m).missing.filter((x) => x.status !== 'sent').sort((a, b) => Number(b.required) - Number(a.required));
  const lines = miss.map((x, i) => `${i + 1}. ${x.label}${x.required ? ' (wajib)' : ''} — ${x.detail}`);
  return [
    `Halo ${p.client}, untuk ${p.name} kami masih menunggu bahan berikut:`,
    '', ...lines, '',
    `Pengerjaan ${p.workdays} hari kerja kami mulai begitu bahan wajib lengkap${p.materialsDue ? `; mohon dikirim paling lambat ${fmtDate(p.materialsDue)}` : ''}.`,
    'File bisa dikirim lewat chat ini atau link Google Drive. Terima kasih!',
  ].join('\n');
}
