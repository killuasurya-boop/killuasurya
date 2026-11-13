/**
 * DATA DEMO — Agency OS fixtures.
 * Every name, number and status below is fictional illustration for UI preview only.
 * Real ecosystem units (Garage Coffee/Garage OS, Desain Aja Dulu, TM 87 Farm) are deliberately NOT used
 * as fake clients. Integrations are "Belum terhubung" until verified (master prompt rule 7).
 */

export const DEMO_PERIOD = '1–30 Nov 2026 (contoh)';

export const team = [
  { id: 'surya', name: 'Surya', role: 'Owner · Strategy · Approval', initials: 'SU', color: 'var(--c2)' },
  { id: 'roby', name: 'Roby', role: 'Idea · Script · Talent', initials: 'RO', color: 'var(--c4)' },
  { id: 'ojak', name: 'Ojak', role: 'Equipment · Shoot', initials: 'OJ', color: 'var(--c3)' },
  { id: 'ares', name: 'Ares', role: 'Editing · QC', initials: 'AR', color: 'var(--c5)' },
  { id: 'bima', name: 'Bima', role: 'Scheduling · Publishing', initials: 'BI', color: 'var(--c1)' },
] as const;
export type MemberId = (typeof team)[number]['id'];

export const kpis = [
  { key: 'leads', label: 'Lead aktif', value: 128, delta: 24, spark: [12, 18, 15, 22, 27, 25, 31, 36] },
  { key: 'projects', label: 'Proyek berjalan', value: 32, delta: 18, spark: [20, 22, 21, 24, 26, 27, 30, 32] },
  { key: 'done', label: 'Proyek selesai', value: 24, delta: 33, spark: [8, 10, 12, 14, 16, 18, 21, 24] },
  { key: 'pipeline', label: 'Nilai pipeline', value: 425_800_000, delta: 27, currency: true, spark: [180, 210, 260, 250, 300, 340, 390, 425] },
] as const;

/** Lead-to-Project stage counts — labels exact from FLOWCHART_MERMAID.md */
export const leadStages = [
  { key: 'new', label: 'Website / Ads / Referral', count: 128, unit: 'Lead' },
  { key: 'brief', label: 'Smart Brief + Consent', count: 112, unit: 'Brief' },
  { key: 'qualified', label: 'CRM Qualification', count: 96, unit: 'Qualified' },
  { key: 'discovery', label: 'Discovery & Estimate', count: 64, unit: 'Diskusi' },
  { key: 'quote', label: 'Quotation + Owner Approval', count: 48, unit: 'Quotation' },
  { key: 'accept', label: 'Client Accept?', count: 38, unit: 'Disetujui', decision: true },
  { key: 'contract', label: 'Contract / Onboarding', count: 36, unit: 'Kontrak' },
  { key: 'project', label: 'Project + Tasks', count: 32, unit: 'Proyek' },
  { key: 'delivery', label: 'Delivery / Review', count: 28, unit: 'Review' },
  { key: 'report', label: 'Reporting / Retention', count: 24, unit: 'Retensi' },
] as const;

/** PRD §08.2 lead lifecycle */
export const leadStatuses = ['NEW', 'REVIEWING', 'QUALIFIED', 'DISCOVERY', 'QUOTING', 'PROPOSAL_SENT', 'NEGOTIATION', 'WON', 'LOST', 'NURTURE'] as const;
export type LeadStatus = (typeof leadStatuses)[number];

export const leads = [
  { id: 'L-1042', company: 'PT. Maju Bersama', service: 'Website & Marketing', source: 'Website', status: 'NEW' as LeadStatus, owner: 'surya' as MemberId, consent: true, value: 45_000_000, updated: '3 jam lalu', next: 'Hubungi PIC untuk discovery' },
  { id: 'L-1041', company: 'Bumi Rasa Coffee', service: 'Konten & Ads', source: 'Instagram Ads', status: 'REVIEWING' as LeadStatus, owner: 'surya' as MemberId, consent: true, value: 18_000_000, updated: '5 jam lalu', next: 'Review brief' },
  { id: 'L-1039', company: 'Klinik Sehat Plus', service: 'Website & Sistem', source: 'Referral', status: 'QUALIFIED' as LeadStatus, owner: 'surya' as MemberId, consent: true, value: 62_000_000, updated: '8 jam lalu', next: 'Jadwalkan discovery' },
  { id: 'L-1036', company: 'CV. Sinar Motor', service: 'Iklan & Lead Gen', source: 'Google Ads', status: 'DISCOVERY' as LeadStatus, owner: 'surya' as MemberId, consent: true, value: 27_500_000, updated: 'Kemarin', next: 'Kirim estimasi' },
  { id: 'L-1031', company: 'Toko Langit', service: 'Marketplace & Ads', source: 'Website', status: 'QUOTING' as LeadStatus, owner: 'surya' as MemberId, consent: false, value: 15_000_000, updated: 'Kemarin', next: 'Susun quotation' },
  { id: 'L-1028', company: 'PT. Delta Inovasi', service: 'Sistem Operasional', source: 'Referral', status: 'PROPOSAL_SENT' as LeadStatus, owner: 'surya' as MemberId, consent: true, value: 120_000_000, updated: '2 hari lalu', next: 'Follow up proposal' },
  { id: 'L-1022', company: 'Kopi Dalam Kota', service: 'Produksi Konten', source: 'TikTok', status: 'NEGOTIATION' as LeadStatus, owner: 'surya' as MemberId, consent: true, value: 22_000_000, updated: '3 hari lalu', next: 'Negosiasi scope' },
  { id: 'L-1017', company: 'Ruang Karya', service: 'Branding & Konten', source: 'Referral', status: 'WON' as LeadStatus, owner: 'surya' as MemberId, consent: true, value: 35_000_000, updated: '5 hari lalu', next: 'Onboarding' },
  { id: 'L-1012', company: 'Sehat Selalu', service: 'Website & Booking', source: 'Website', status: 'NURTURE' as LeadStatus, owner: 'surya' as MemberId, consent: true, value: 30_000_000, updated: '1 minggu lalu', next: 'Kirim edukasi' },
  { id: 'L-1008', company: 'Anugerah Print', service: 'Sistem Workshop', source: 'Event', status: 'LOST' as LeadStatus, owner: 'surya' as MemberId, consent: true, value: 48_000_000, updated: '2 minggu lalu', next: '—' },
];

/** PRD §09.2 quotation states */
export const quotations = [
  { id: 'QT-00187', client: 'PT. Maju Bersama', title: 'Website Company + Campaign', amount: 45_000_000, status: 'INTERNAL_REVIEW', version: 2, valid: '30 Nov 2026', items: [['Website company profile', 1, 28_000_000], ['Landing page campaign', 1, 9_000_000], ['Setup tracking & analytics', 1, 8_000_000]] as [string, number, number][] },
  { id: 'QT-00186', client: 'Kopi Dalam Kota', title: 'Retainer Konten 3 bulan', amount: 28_000_000, status: 'SENT', version: 1, valid: '28 Nov 2026', items: [['Video Reels (8/bulan)', 3, 7_000_000], ['Laporan bulanan', 3, 1_000_000], ['Shooting day', 2, 2_500_000]] as [string, number, number][] },
  { id: 'QT-00185', client: 'Ruang Karya', title: 'Branding & Konten', amount: 12_500_000, status: 'ACCEPTED', version: 1, valid: '20 Nov 2026', items: [['Brand kit', 1, 7_500_000], ['Carousel (10)', 1, 5_000_000]] as [string, number, number][] },
  { id: 'QT-00184', client: 'PT. Delta Inovasi', title: 'Sistem Operasional (Discovery)', amount: 120_000_000, status: 'DRAFT', version: 1, valid: '—', items: [['Discovery & PRD proyek', 1, 15_000_000], ['Modul inventory', 1, 55_000_000], ['Modul approval & laporan', 1, 50_000_000]] as [string, number, number][] },
  { id: 'QT-00181', client: 'Sehat Selalu', title: 'Website Booking', amount: 30_000_000, status: 'REVISE', version: 3, valid: '15 Nov 2026', items: [['Website booking', 1, 24_000_000], ['Integrasi WhatsApp click-to-chat', 1, 6_000_000]] as [string, number, number][] },
];
export const quoteFlow = ['DRAFT', 'INTERNAL_REVIEW', 'APPROVED', 'SENT', 'VIEWED', 'ACCEPTED'] as const;

export type TaskCol = 'todo' | 'progress' | 'review' | 'done';
export const kanbanCols: { id: TaskCol; label: string }[] = [
  { id: 'todo', label: 'To Do' },
  { id: 'progress', label: 'Proses' },
  { id: 'review', label: 'Review' },
  { id: 'done', label: 'Selesai' },
];
export const tasks = [
  { id: 'T-311', title: 'Website katalog — wireframe', project: 'PROJ-0321', col: 'todo' as TaskCol, owner: 'surya' as MemberId, due: '14 Nov', priority: 'Tinggi' },
  { id: 'T-312', title: 'Sesi packaging — moodboard', project: 'PROJ-0320', col: 'todo' as TaskCol, owner: 'roby' as MemberId, due: '15 Nov', priority: 'Sedang' },
  { id: 'T-305', title: 'Shooting konten produk', project: 'PROJ-0320', col: 'progress' as TaskCol, owner: 'ojak' as MemberId, due: '14 Nov', priority: 'Tinggi' },
  { id: 'T-306', title: 'Website landing — slicing', project: 'PROJ-0321', col: 'progress' as TaskCol, owner: 'surya' as MemberId, due: '16 Nov', priority: 'Sedang' },
  { id: 'T-299', title: 'Final revisi video Reels', project: 'PROJ-0318', col: 'review' as TaskCol, owner: 'ares' as MemberId, due: '13 Nov', priority: 'Tinggi' },
  { id: 'T-300', title: 'Siap launch landing page', project: 'PROJ-0321', col: 'review' as TaskCol, owner: 'bima' as MemberId, due: '17 Nov', priority: 'Rendah' },
  { id: 'T-290', title: 'Brand kit diserahkan', project: 'PROJ-0315', col: 'done' as TaskCol, owner: 'roby' as MemberId, due: '10 Nov', priority: 'Sedang' },
];
export const projects = [
  { id: 'PROJ-0321', name: 'Website Perusahaan', client: 'PT. Maju Bersama', progress: 75, status: 'On Track' },
  { id: 'PROJ-0320', name: 'Produksi Konten Q4', client: 'Kopi Dalam Kota', progress: 60, status: 'Perlu Perhatian' },
  { id: 'PROJ-0318', name: 'Kampanye Ads', client: 'Bumi Rasa Coffee', progress: 40, status: 'On Track' },
  { id: 'PROJ-0315', name: 'Branding', client: 'Ruang Karya', progress: 100, status: 'Selesai' },
];
export const projectStatus = [
  { label: 'On Track', value: 19 },
  { label: 'Perlu Perhatian', value: 6 },
  { label: 'Terlambat', value: 3 },
  { label: 'Review', value: 4 },
];

/** Content Production stages (Team Playbook / flowchart 3) */
export const contentStages = ['Strategy', 'Idea / Script', 'Equipment / Setup', 'Shoot', 'Editing / QC', 'Approval', 'Scheduling / Publishing', 'Analytics'] as const;
export const contentItems = [
  { id: 'CNT-2047', title: 'Promo Akhir Tahun — Reels', client: 'Bumi Rasa Coffee', stage: 'Editing / QC', pic: 'ares' as MemberId, due: '14 Nov', format: 'Video Reels', status: 'EDITING' },
  { id: 'CNT-2046', title: 'Behind the Scene Shoot', client: 'Kopi Dalam Kota', stage: 'Shoot', pic: 'ojak' as MemberId, due: '15 Nov', format: 'Video YouTube', status: 'SHOOTING' },
  { id: 'CNT-2044', title: 'Tips Desain Brand UMKM', client: 'Ruang Karya', stage: 'Idea / Script', pic: 'roby' as MemberId, due: '16 Nov', format: 'Carousel', status: 'SCRIPT_READY' },
  { id: 'CNT-2041', title: 'Testimoni Klien — Batch 1', client: 'Klinik Sehat Plus', stage: 'Approval', pic: 'surya' as MemberId, due: '17 Nov', format: 'Video Reels', status: 'CLIENT_REVIEW' },
  { id: 'CNT-2039', title: 'Edukasi Konten Branding', client: 'PT. Maju Bersama', stage: 'Scheduling / Publishing', pic: 'bima' as MemberId, due: '18 Nov', format: 'Carousel', status: 'SCHEDULED' },
];

export const media = [
  { id: 'AS-901', name: 'KV_Campaign_Future_v3.png', type: 'Gambar', size: '2,4 MB', version: 3, status: 'Approved', object: '27_object_asset_folder.svg' },
  { id: 'AS-899', name: 'Mockup_Website_01.jpg', type: 'Gambar', size: '1,8 MB', version: 1, status: 'Review', object: '22_object_laptop.svg' },
  { id: 'AS-897', name: 'BTS_Produksi_Konten.mp4', type: 'Video', size: '86 MB', version: 2, status: 'Approved', object: '24_object_clapperboard.svg' },
  { id: 'AS-895', name: 'Logo_Klien_Primary.svg', type: 'Logo', size: '24 KB', version: 1, status: 'Approved', object: '29_object_shield_verified.svg' },
  { id: 'AS-893', name: 'Template_Proposal_v2.pptx', type: 'Dokumen', size: '4,1 MB', version: 2, status: 'Draft', object: '27_object_asset_folder.svg' },
  { id: 'AS-890', name: 'Foto_Tim_Creative.jpg', type: 'Gambar', size: '3,2 MB', version: 1, status: 'Review', object: '23_object_camera.svg' },
  { id: 'AS-886', name: 'Overlay_Streaming.png', type: 'Gambar', size: '640 KB', version: 1, status: 'Approved', object: '26_object_analytics_dashboard.svg' },
  { id: 'AS-881', name: 'Brand_Guideline_v1.pdf', type: 'Dokumen', size: '6,7 MB', version: 1, status: 'Approved', object: '28_object_connected_workflow.svg' },
];

export const calendarEvents = [
  { day: 3, title: 'Shoot — Kopi Dalam Kota', kind: 'shoot' },
  { day: 7, title: 'Deadline revisi Reels', kind: 'deadline' },
  { day: 10, title: 'Publikasi Carousel', kind: 'publish' },
  { day: 14, title: 'Shoot produk', kind: 'shoot' },
  { day: 14, title: 'Publikasi Reels', kind: 'publish' },
  { day: 16, title: 'Review klien', kind: 'review' },
  { day: 19, title: 'Publikasi YouTube', kind: 'publish' },
  { day: 24, title: 'Deadline laporan', kind: 'deadline' },
  { day: 27, title: 'Kampanye WA (draft)', kind: 'review' },
] as const;

/** PRD §10B.3 publishing job states — nothing here was sent to any platform. */
export const publishQueue = [
  { id: 'PUB-551', content: 'Promo Akhir Tahun — Reels', platform: 'Instagram', when: '14 Nov, 10:00', status: 'SCHEDULED' },
  { id: 'PUB-550', content: 'Behind The Scene — Shoot', platform: 'YouTube', when: '14 Nov, 15:00', status: 'AWAITING_APPROVAL' },
  { id: 'PUB-548', content: 'Tips Desain Brand — Carousel', platform: 'LinkedIn', when: '15 Nov, 09:00', status: 'MANUAL_TASK' },
  { id: 'PUB-545', content: 'Layanan Agency — Ads', platform: 'Facebook', when: '15 Nov, 13:00', status: 'FAILED' },
  { id: 'PUB-540', content: 'Edukasi Branding', platform: 'TikTok', when: '12 Nov, 19:30', status: 'QUEUED' },
];
export const capability = [
  { platform: 'Instagram Feed', support: 'Ya', note: 'Gambar, carousel, caption (cek ulang saat integrasi)' },
  { platform: 'Instagram Reels', support: 'Ya', note: 'Video, cover, caption' },
  { platform: 'TikTok', support: 'Sebagian', note: 'Tergantung akses API akun' },
  { platform: 'YouTube', support: 'Ya', note: 'Video, judul, deskripsi, thumbnail' },
  { platform: 'LinkedIn', support: 'Manual', note: 'Manual publish task' },
  { platform: 'Google Business Profile', support: 'Sebagian', note: 'Post/update bila eligible' },
];

export const waSegments = [
  { name: 'Pelanggan aktif', total: 482, eligible: 455, excluded: 27 },
  { name: 'Leads potensial', total: 1240, eligible: 0, excluded: 1240 },
  { name: 'Prospek follow-up', total: 87, eligible: 61, excluded: 26 },
];
export const waTemplates = [
  { id: 'TPL-12', name: 'Promo_Q4_v2', category: 'Marketing', status: 'Disetujui (contoh)', body: 'Halo {{nama}}, ada promo layanan konten untuk bisnis Anda bulan ini. Balas STOP untuk berhenti menerima pesan.' },
  { id: 'TPL-10', name: 'Reminder_Proposal', category: 'Utility', status: 'Draft', body: 'Halo {{nama}}, proposal {{nomor}} masih menunggu tinjauan Anda. Balas STOP untuk berhenti.' },
];

export const trend = {
  labels: ['1', '5', '9', '13', '17', '21', '25', '29'],
  series: [
    { key: 'leads', label: 'Leads', data: [22, 35, 48, 60, 82, 110, 150, 208], color: 'var(--c1)' },
    { key: 'deal', label: 'Deal', data: [4, 6, 9, 12, 18, 24, 31, 42], color: 'var(--c2)' },
  ],
};
export const funnel = [
  { label: 'Lead masuk', value: 128 },
  { label: 'Qualified', value: 96 },
  { label: 'Quotation', value: 48 },
  { label: 'Proyek aktif', value: 32 },
];
export const topServices = [
  { label: 'Produksi Konten', value: 32 },
  { label: 'Website & Web App', value: 24 },
  { label: 'Digital Marketing (Ads)', value: 18 },
  { label: 'Sistem Operasional', value: 14 },
  { label: 'Branding & Creative', value: 12 },
];
export const activity = [
  { icon: 'check', title: 'Quotation QT-00185 disetujui klien', meta: 'Ruang Karya · Rp 12.500.000', time: '10:24' },
  { icon: 'project', title: 'PROJ-0321 progres 75%', meta: 'Website Perusahaan', time: '09:47' },
  { icon: 'brief', title: 'Brief baru dari website', meta: 'Klinik Sehat Plus · Website', time: '09:12' },
  { icon: 'wa', title: 'Kampanye WA menunggu approval Owner', meta: 'Promo_Q4_v2 · 455 eligible', time: 'Kemarin' },
  { icon: 'report', title: 'Laporan mingguan siap ditinjau', meta: 'Periode 3–9 Nov', time: 'Kemarin' },
] as const;

export const integrations = [
  { name: 'Metricool', desc: 'Perencanaan & publikasi lintas platform', status: 'Belum terhubung' },
  { name: 'WhatsApp Business Platform', desc: 'Kampanye berbasis izin (jalur resmi)', status: 'Belum terhubung' },
  { name: 'Meta (Instagram/Facebook)', desc: 'Insight & ads', status: 'Belum terhubung' },
  { name: 'Google Analytics 4', desc: 'Analitik website', status: 'Belum terhubung' },
  { name: 'TikTok', desc: 'Publikasi & insight', status: 'Belum terhubung' },
  { name: 'YouTube', desc: 'Publikasi video', status: 'Belum terhubung' },
];

/** RACI from TEAM_RACI_AND_PLAYBOOK.md (exact). */
export const raci: { activity: string; r: Record<MemberId, string> }[] = [
  { activity: 'Brief klien / penetapan scope', r: { surya: 'A/R', roby: 'C', ojak: 'I', ares: 'I', bima: 'I' } },
  { activity: 'Ide, script, content pillar', r: { surya: 'A', roby: 'R', ojak: 'C', ares: 'C', bima: 'C' } },
  { activity: 'Equipment & shooting setup', r: { surya: 'I', roby: 'C', ojak: 'A/R', ares: 'C', bima: 'I' } },
  { activity: 'Shooting / talent', r: { surya: 'A', roby: 'R', ojak: 'R', ares: 'C', bima: 'I' } },
  { activity: 'Editing & QC', r: { surya: 'A', roby: 'C', ojak: 'C', ares: 'R', bima: 'I' } },
  { activity: 'Caption, hook, CTA final', r: { surya: 'A', roby: 'R', ojak: 'I', ares: 'C', bima: 'C' } },
  { activity: 'Kalender & platform publishing', r: { surya: 'A', roby: 'C', ojak: 'I', ares: 'C', bima: 'R' } },
  { activity: 'Penanganan gagal posting', r: { surya: 'A', roby: 'C', ojak: 'I', ares: 'C', bima: 'R' } },
  { activity: 'Ads plan / budget / optimasi', r: { surya: 'A/R', roby: 'C', ojak: 'I', ares: 'C', bima: 'C' } },
  { activity: 'Report konten dan pembelajaran', r: { surya: 'A/R', roby: 'C', ojak: 'I', ares: 'C', bima: 'R' } },
  { activity: 'Quotation, kontrak, onboarding', r: { surya: 'A/R', roby: 'I', ojak: 'I', ares: 'I', bima: 'I' } },
];

/** Client portal (one demo client, scope = own data only). */
export const portal = {
  client: 'PT. Maju Bersama',
  project: 'Website Perusahaan',
  milestones: [
    { label: 'Discovery & PRD proyek', status: 'done' },
    { label: 'Desain UI', status: 'done' },
    { label: 'Development', status: 'current' },
    { label: 'UAT bersama klien', status: 'todo' },
    { label: 'Go-live & handover', status: 'todo' },
  ],
  deliverables: [
    { name: 'Wireframe v2.pdf', status: 'Disetujui' },
    { name: 'Desain UI Homepage', status: 'Menunggu approval Anda' },
    { name: 'Staging URL', status: 'Belum tersedia' },
  ],
  invoices: [
    { id: 'INV-DEMO-01', label: 'Termin 1 (DP)', status: 'Lunas (contoh)' },
    { id: 'INV-DEMO-02', label: 'Termin 2', status: 'Belum jatuh tempo' },
  ],
};

export const rupiah = (n: number) => 'Rp ' + n.toLocaleString('id-ID');
export const rupiahShort = (n: number) => (n >= 1e9 ? `Rp ${(n / 1e9).toFixed(2).replace('.', ',')} M` : n >= 1e6 ? `Rp ${(n / 1e6).toFixed(1).replace('.', ',')} JT` : rupiah(n));
