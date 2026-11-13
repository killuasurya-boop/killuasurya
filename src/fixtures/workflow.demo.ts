import type { MemberId } from './os.demo';
import type { StageId, Task as BaseTask } from '@/lib/workflow';

type Task = Omit<BaseTask, 'code' | 'checklist'> & { checklist: { text: string; done: boolean }[] };

/**
 * DATA DEMO — team workflow (Master Prompt V5 §Phase 3). Nothing here is real client data.
 * Stages are the V5 production flow; the default PIC per stage is configurable (Owner can reassign any task).
 */
export const DEMO_TODAY = '2026-11-12';

/** Default PIC per stage in the demo (in live mode the database picks the first active member with the matching role). */
export const demoStagePic: Record<StageId, MemberId> = { planning: 'roby', prep: 'ojak', production: 'roby', editing: 'ares', owner: 'surya', client: 'surya', scheduling: 'bima', publishing: 'bima', reporting: 'surya' };

const raw: Task[] = [
  { id: 'T-201', title: 'Reels "Menu Baru" — konsep & script', desc: 'Riset ide, hook, dan script 30 detik untuk peluncuran menu.', client: 'Klien Demo A (F&B)', project: 'Konten November', stage: 'planning', status: 'progress', pic: 'roby', due: '2026-11-12', priority: 'Tinggi',
    checklist: [{ text: 'Riset tren & referensi', done: true }, { text: 'Hook + script', done: false }, { text: 'Brief produksi', done: false }], files: ['referensi-menu.pdf'], comments: [{ by: 'surya', text: 'Fokus ke menu signature, durasi maksimal 30 detik.', at: '11 Nov 09.10' }], history: [{ at: '10 Nov 14.00', by: 'surya', text: 'Tugas dibuat dan ditugaskan ke Roby' }, { at: '11 Nov 08.30', by: 'roby', text: 'Status: Ready → In Progress' }] },
  { id: 'T-202', title: 'Shooting produk — persiapan alat', desc: 'Kamera, lighting, audio, dan lokasi untuk shooting Kamis.', client: 'Klien Demo A (F&B)', project: 'Konten November', stage: 'prep', status: 'blocked', pic: 'ojak', due: '2026-11-13', priority: 'Tinggi', blocker: 'Lokasi belum dikonfirmasi klien',
    checklist: [{ text: 'Kamera & lensa', done: true }, { text: 'Lighting', done: true }, { text: 'Konfirmasi lokasi', done: false }], files: [], comments: [], history: [{ at: '11 Nov 10.00', by: 'ojak', text: 'Ditandai Blocked: lokasi belum dikonfirmasi klien' }] },
  { id: 'T-203', title: 'Carousel edukasi — editing', desc: 'Edit 6 slide carousel sesuai brand kit.', client: 'Klien Demo B (Retail)', project: 'Konten November', stage: 'editing', status: 'revision', pic: 'ares', due: '2026-11-11', priority: 'Sedang',
    checklist: [{ text: 'Layout 6 slide', done: true }, { text: 'Perbaiki warna slide 3', done: false }, { text: 'Export & upload preview', done: false }], files: ['carousel-v1.png'], comments: [{ by: 'surya', text: 'Slide 3 terlalu gelap, logo terpotong.', at: '10 Nov 16.20' }], history: [{ at: '10 Nov 15.00', by: 'ares', text: 'Preview v1 dikirim untuk review' }, { at: '10 Nov 16.20', by: 'surya', text: 'Revisi diminta → kembali ke Editing (riwayat v1 disimpan)' }] },
  { id: 'T-204', title: 'Video testimoni — approval Owner', desc: 'Preview final menunggu persetujuan sebelum dijadwalkan.', client: 'Klien Demo B (Retail)', project: 'Konten November', stage: 'owner', status: 'review', pic: 'surya', due: '2026-11-12', priority: 'Tinggi',
    checklist: [{ text: 'Cek durasi & subtitle', done: true }, { text: 'Cek musik berlisensi', done: true }], files: ['testimoni-v2.mp4'], comments: [{ by: 'ares', text: 'Sudah revisi subtitle sesuai catatan.', at: '12 Nov 08.05' }], history: [{ at: '12 Nov 08.05', by: 'ares', text: 'Preview v2 dikirim untuk approval' }] },
  { id: 'T-205', title: 'Feed promo akhir pekan — jadwal', desc: 'Jadwalkan 3 posting yang sudah disetujui.', client: 'Klien Demo A (F&B)', project: 'Konten November', stage: 'scheduling', status: 'ready', pic: 'bima', due: '2026-11-13', priority: 'Sedang',
    checklist: [{ text: 'Caption & hashtag', done: true }, { text: 'Jadwalkan di kalender', done: false }], files: ['promo-1.png', 'promo-2.png', 'promo-3.png'], comments: [], history: [{ at: '11 Nov 17.00', by: 'surya', text: 'Disetujui → diteruskan ke Bima untuk penjadwalan' }] },
  { id: 'T-206', title: 'Reels behind the scene — publish', desc: 'Terbitkan sesuai jadwal dan catat tautannya.', client: 'Klien Demo C (Jasa)', project: 'Konten November', stage: 'publishing', status: 'scheduled', pic: 'bima', due: '2026-11-14', priority: 'Rendah',
    checklist: [{ text: 'Terjadwal', done: true }, { text: 'Catat tautan publikasi', done: false }], files: ['bts-final.mp4'], comments: [], history: [{ at: '11 Nov 13.00', by: 'bima', text: 'Status: Ready → Scheduled (14 Nov 18.00)' }] },
  { id: 'T-207', title: 'Laporan konten Oktober', desc: 'Ringkasan performa dan rekomendasi bulan berikutnya.', client: 'Klien Demo C (Jasa)', project: 'Laporan Bulanan', stage: 'reporting', status: 'progress', pic: 'surya', due: '2026-11-15', priority: 'Sedang',
    checklist: [{ text: 'Tarik data platform', done: false }, { text: 'Tulis insight', done: false }], files: [], comments: [], history: [{ at: '09 Nov 10.00', by: 'surya', text: 'Tugas dibuat' }] },
  { id: 'T-208', title: 'Foto produk katalog — editing', desc: 'Retouch 20 foto produk untuk katalog.', client: 'Klien Demo B (Retail)', project: 'Katalog Produk', stage: 'editing', status: 'waiting', pic: 'ares', due: '2026-11-16', priority: 'Rendah',
    checklist: [{ text: 'Terima file mentah', done: false }, { text: 'Retouch', done: false }], files: [], comments: [], history: [{ at: '11 Nov 09.00', by: 'surya', text: 'Menunggu hasil shooting (T-202)' }] },
  { id: 'T-209', title: 'Landing page promo — approval klien', desc: 'Pratinjau dikirim ke klien; menunggu Setujui atau Minta revisi dari Portal.', client: 'Klien Demo A (F&B)', project: 'Landing Promo', stage: 'client', status: 'review', pic: 'surya', due: '2026-11-13', priority: 'Sedang', previewUrl: 'https://example.com/pratinjau-demo', needsClient: true, sub: true,
    checklist: [{ text: 'Cek akhir di HP', done: true }, { text: 'Kirim link pratinjau', done: true }], files: [], comments: [], history: [{ at: '12 Nov 15.00', by: 'surya', text: 'Dikirim ke klien untuk persetujuan (link pratinjau dicatat)' }] },
];

/** Normalised for the UI: code = id, checklist items get stable ids. */
export const workflowTasks: BaseTask[] = raw.map((t) => ({ ...t, code: t.id, checklist: t.checklist.map((c, i) => ({ ...c, id: `${t.id}-${i}` })) }));
