/** Service catalogue — copy sourced from PRD V4 §03 (katalog), §04 (paket), §05 (sitemap), §27 (copywriting). */

export type Service = {
  slug: string;
  title: string;
  short: string;
  headline: string;
  body: string;
  model: string;
  cta: string;
  icon: 'growth' | 'creative' | 'website' | 'system' | 'ai';
  color: string;
  object: string;
  items: string[];
  guardrail: string;
};

export const services: Service[] = [
  {
    slug: 'digital-marketing',
    title: 'Digital Growth',
    short: 'Social, SEO, Ads, Google Maps',
    headline: 'Strategi yang terukur, bukan sekadar posting rutin.',
    body: 'Rencanakan konten, pilih kanal, evaluasi insight dan optimasi kampanye sesuai tujuan bisnis.',
    model: 'Managed / recurring',
    cta: 'Audit Marketing',
    icon: 'growth',
    color: '#B78CFF',
    object: '26_object_analytics_dashboard.svg',
    items: [
      'Facebook: Page, kalender post, Reels, Story, katalog & promosi produk',
      'Instagram: feed, carousel, Reels, Stories, Highlights, laporan insight',
      'TikTok & YouTube: video vertikal, editing, publishing terjadwal, SEO metadata',
      'Meta / Google / TikTok Ads: audit, kreatif, budget cap, optimasi & reporting',
      'Google Business Profile / Maps: optimasi profil, foto, Q&A, review autentik',
      'SEO, GEO & Content Search: audit teknis, struktur halaman, structured data',
      'Marketing Operations: kalender, brief, approval, analytics, dokumentasi',
    ],
    guardrail: 'Biaya media iklan ditagih terpisah. Tidak menjanjikan ranking #1 atau tampil pasti di jawaban AI.',
  },
  {
    slug: 'creative-studio',
    title: 'Creative Studio',
    short: 'Konten dan branding',
    headline: 'Satu ide, satu workflow, satu standar kualitas.',
    body: 'Dari script hingga publikasi, pekerjaan tim dipantau dengan status dan approval yang jelas.',
    model: 'Project / retainer',
    cta: 'Brief Konten',
    icon: 'creative',
    color: '#FF7AC6',
    object: '24_object_clapperboard.svg',
    items: [
      'Brand strategy & graphic design',
      'Flyer, carousel, packaging',
      'Foto dan video produk, shooting on-site',
      'Reels, motion graphics, 2D/3D, animasi logo',
      'Podcast, kampanye kreatif, live production, event content',
    ],
    guardrail: 'Setiap paket menetapkan jumlah deliverable, format, durasi, siklus revisi, hak penggunaan, dan biaya tambahan.',
  },
  {
    slug: 'website-development',
    title: 'Website & Experience',
    short: 'Landing page hingga aplikasi',
    headline: 'Halaman yang dirancang untuk konversi.',
    body: 'Landing page, company profile, katalog, e-commerce, booking, microsite, portal pelanggan, dan PWA.',
    model: 'Project / maintenance',
    cta: 'Konsultasi Website',
    icon: 'website',
    color: '#49B7FF',
    object: '22_object_laptop.svg',
    items: [
      'Landing page & company profile',
      'Katalog, e-commerce, booking, microsite',
      'Portal pelanggan & PWA',
      'Integrasi CRM, analytics, dan SEO teknis',
      'Maintenance, monitoring, backup, pembaruan (layanan terpisah)',
    ],
    guardrail: 'Selesai = UAT, URL aktif, dan checklist akses diserahkan.',
  },
  {
    slug: 'business-systems',
    title: 'Custom Business System',
    short: 'POS, CRM, ERP, WMS, AI',
    headline: 'Aplikasi bisnis dibuat mengikuti proses perusahaan Anda.',
    body: 'POS, CRM, ERP, WMS dan AI dibangun modular sesuai kebutuhan yang terukur.',
    model: 'Project + support',
    cta: 'Diskusi Sistem',
    icon: 'system',
    color: '#C7F60C',
    object: '28_object_connected_workflow.svg',
    items: [
      'POS, CRM, ERP, WMS',
      'Finance & Accounting, Cash/Shift, HRIS & Payroll, Attendance',
      'Project Management, Sales & Quotation, Inventory & Purchasing',
      'Production/KDS, Membership & Loyalty, Reservation',
      'Approval & Audit, BI & Analytics, Multi-Branch, AI Agent/MCP',
    ],
    guardrail: 'Tidak semua modul dibangun untuk setiap pelanggan — dimulai dari discovery dan PRD proyek klien.',
  },
  {
    slug: 'ai-automation',
    title: 'AI & Automation',
    short: 'Otomasi bisnis terkontrol',
    headline: 'Otomasi yang membantu, tetap dalam kendali Anda.',
    body: 'Asisten SOP internal, AI Sales Copilot, ringkasan lead, alert deadline, integrasi API dan laporan otomatis.',
    model: 'Discovery / project',
    cta: 'Audit Workflow',
    icon: 'ai',
    color: '#49B7FF',
    object: '29_object_shield_verified.svg',
    items: [
      'Asisten SOP internal & AI Sales Copilot',
      'Ringkasan lead, rekomendasi konten, alert deadline',
      'AI Business Analyst & laporan otomatis',
      'Integrasi API, webhook/MCP, workflow approval',
    ],
    guardrail: 'Read-only by default pada data sensitif; aksi tulis memiliki role, verifikasi, audit trail, dan approval.',
  },
];

/** PRD §04 — commercial products. Prices stay "Konsultasi untuk Penawaran" until the Owner rate card exists (D-05). */
export const packages = [
  { code: 'START', name: 'Local Presence', who: 'UMKM', mechanism: 'Setup + retainer ringan', measure: 'Data profil lengkap, konten terbit, permintaan kontak' },
  { code: 'GROW', name: 'Omnichannel Content', who: 'SMB', mechanism: 'Retainer + deliverable bulanan', measure: 'Output konten dan prospek terukur', featured: true },
  { code: 'PERFORM', name: 'Ads & Lead', who: 'SMB / medium', mechanism: 'Fee strategi & optimasi + belanja iklan terpisah', measure: 'CPL, konversi prospek, pipeline' },
  { code: 'CREATE', name: 'Creative Production', who: 'Semua', mechanism: 'Per konten / shooting day / proyek', measure: 'Kuantitas dan kualitas deliverable' },
  { code: 'BUILD', name: 'Website', who: 'Semua', mechanism: 'SOW + milestone + maintenance opsional', measure: 'Website teruji & diterima' },
  { code: 'SYSTEM', name: 'Custom Business Software', who: 'Medium / enterprise', mechanism: 'Discovery + modul + integrasi + support', measure: 'UAT proses, reliabilitas dan penerimaan' },
  { code: 'ENTERPRISE', name: 'Growth & Technology Partnership', who: 'Enterprise', mechanism: 'Proposal khusus', measure: 'KPI per workstream dalam kontrak' },
] as const;

export const thirdPartyCosts = ['Biaya media iklan', 'Lisensi Metricool', 'API WhatsApp', 'Domain & hosting', 'Perjalanan shooting', 'Pajak'];

export const quotationDisclaimer = 'Harga merupakan estimasi dan tidak mengikat sebelum penawaran final disetujui.';

/** PRD §03.7 — what is sold vs. proof of done. */
export const contractLines = [
  { line: 'Local Growth', problem: 'Sulit ditemukan pelanggan sekitar', proof: 'URL profil, checklist, analytics tersedia' },
  { line: 'Content Retainer', problem: 'Konten tidak konsisten', proof: 'Konten final, approval, post URL' },
  { line: 'Paid Ads', problem: 'Biaya iklan tidak terukur', proof: 'Campaign ID, anggaran disetujui, laporan provider' },
  { line: 'WhatsApp CRM', problem: 'Leads hilang dan tidak ditindaklanjuti', proof: 'Rekaman consent, task dan log komunikasi' },
  { line: 'Website', problem: 'Tidak ada halaman konversi', proof: 'UAT, URL, checklist akses' },
  { line: 'Custom System', problem: 'Operasional terpisah dan manual', proof: 'Acceptance test, dokumen serah-terima' },
];

/** TEAM_RACI_AND_PLAYBOOK.md */
export const team = [
  { name: 'Surya', role: 'Owner, Strategist, Ads Lead, Client Solutions', focus: 'Discovery, approval, onboarding, strategi, budget, analitik' },
  { name: 'Roby', role: 'Creative Planner & Talent', focus: 'Riset tren, ide, hook, script, storyboard, talent' },
  { name: 'Ojak', role: 'Production Equipment & Shoot Setup', focus: 'Kamera, lighting, audio, lokasi, handoff file capture' },
  { name: 'Ares', role: 'Media Editor', focus: 'Editing video/audio/motion, subtitle, QC, versioning' },
  { name: 'Bima', role: 'Social Publisher & Metricool Operator', focus: 'Scheduling, publish, log bukti, triage error' },
];

/** FLOWCHART_MERMAID.md — operational flows (labels exact). */
export const opsFlows = [
  { key: 'lead', title: 'Lead-to-Project', sub: 'Sales & Delivery', steps: ['Website / Ads / Referral', 'Smart Brief + Consent', 'CRM Qualification', 'Discovery & Estimate', 'Quotation + Owner Approval', 'Client Accept?', 'Contract / Onboarding', 'Project + Tasks', 'Delivery / Review', 'Reporting / Retention'], loop: 'Revisi → Discovery & Estimate' },
  { key: 'content', title: 'Content Production', sub: 'Tim Kreatif', steps: ['Surya — Strategy', 'Roby — Idea / Script / Talent', 'Ojak — Equipment / Setup', 'Shoot', 'Ares — Editing / QC', 'Surya/Client Approve?', 'Bima — Scheduling / Publishing', 'Surya — Analytics / Ads'], loop: 'Revisi → Ares · Analytics → kembali ke Strategy' },
  { key: 'publish', title: 'Social Publishing', sub: 'Metricool', steps: ['Approved content version', 'Platform feature supported?', 'Queue with idempotency', 'Metricool/API submit', 'Verified published?', 'PUBLISHED'], loop: 'Tidak didukung → Manual publish task · Gagal → Error / Reconciliation' },
  { key: 'wa', title: 'WhatsApp Consent', sub: 'WA Business', steps: ['Segment from CRM', 'Consent and opt-out check', 'Approved template + preview', 'Owner approval', 'Provider-compliant scheduling', 'Official WhatsApp API', 'Delivery webhooks and opt-out', 'Campaign report'], loop: 'Not eligible → Exclude recipient' },
] as const;

export const faqs = [
  { q: 'Apakah harga di website sudah final?', a: 'Belum. Harga merupakan estimasi dan tidak mengikat sebelum penawaran final disetujui setelah discovery.' },
  { q: 'Apakah biaya iklan sudah termasuk paket?', a: 'Tidak. Biaya media iklan, lisensi Metricool, API WhatsApp, domain, hosting, perjalanan shooting, dan pajak dipisahkan dan dijelaskan pada quotation.' },
  { q: 'Apakah KILLUASURYA.TECH menjamin ranking #1 Google atau konten viral?', a: 'Tidak. Kami menekankan eksekusi dan bukti yang terukur — tanpa janji viral, peringkat satu, atau penjualan pasti naik.' },
  { q: 'Bagaimana kampanye WhatsApp dikirim?', a: 'Hanya kepada kontak yang memberi izin, melalui jalur resmi WhatsApp Business Platform bila akses tersedia, dengan approval Owner sebelum dijadwalkan.' },
  { q: 'Apakah klien bisa melihat progres proyek?', a: 'Ya, melalui Client Portal (invite-only) untuk memantau milestone, deliverable, approval, dan status dokumen milik klien tersebut.' },
];
