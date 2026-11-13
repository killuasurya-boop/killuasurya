/** Public-site copy taken from the Owner's reference boards (anchor + ecosystem board) and PRD V4 flowcharts. */

/** Labels follow the reference navbar; URLs follow PRD V4 §05 sitemap. */
export const nav = [
  { href: '/services', label: 'Layanan' },
  { href: '/portfolio', label: 'Portofolio' },
  { href: '/process', label: 'Proses' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/contact', label: 'Kontak' },
] as const;
export const loginHref = '/login';

/** Form route (Smart Brief). WhatsApp CTAs use `waLink()` below. */
export const consultHref = '/contact';

export const capabilities = [
  { key: 'marketing', label: ['Marketing', '& Growth'], color: '#B78CFF' },
  { key: 'creative', label: ['Creative', 'Production'], color: '#FF7AC6' },
  { key: 'website', label: ['Website', '& Experience'], color: '#49B7FF' },
  { key: 'custom', label: ['Custom', 'Business System'], color: '#C7F60C' },
  { key: 'ai', label: ['AI &', 'Automation'], color: '#49B7FF' },
] as const;

export const modules = [
  {
    key: 'website',
    title: 'Website Marketing',
    tag: 'Grow & Convert',
    body: 'Website profesional yang cepat, menarik, dan terarah untuk marketing & penjualan.',
    tint: 'var(--tint-lavender)',
    accent: '#8238F5',
    plain: 'Sederhananya: website dan kampanye digital yang mendatangkan calon pembeli.',
    features: ['Website Company', 'Landing Page', 'Digital Campaign', 'Tracking & Optimization'],
    object: '22_object_laptop.svg',
  },
  {
    key: 'os',
    title: 'Agency OS',
    tag: 'Kelola & Kolaborasi',
    body: 'Sistem operasional agency yang rapi, efisien, dan terintegrasi.',
    tint: 'var(--tint-lime)',
    accent: '#6E8F00',
    plain: 'Sederhananya: cara kami mengelola pekerjaan Anda — progresnya bisa Anda pantau.',
    features: ['Manajemen Project', 'Manajemen Tim', 'Manajemen Klien', 'Produksi & Reporting'],
    object: '26_object_analytics_dashboard.svg',
  },
  {
    key: 'custom',
    title: 'Custom Business Systems',
    tag: 'Bangun Sesuai Kebutuhan',
    body: 'Pengembangan sistem, aplikasi, dan otomasi proses bisnis yang tailor-made.',
    tint: 'var(--tint-sky)',
    accent: '#1D7FC4',
    plain: 'Sederhananya: aplikasi kasir, stok, dan laporan sesuai cara kerja bisnis Anda.',
    features: ['Sistem Operasional', 'Integrasi & Otomasi', 'Manajemen Data', 'Solusi Kustom'],
    object: '28_object_connected_workflow.svg',
  },
] as const;

/** FLOWCHART_MERMAID.md — Ekosistem (exact nodes). Unit status must be verified before marketing claims. */
export const ecosystem = {
  parent: { title: 'SURYA.dev', sub: 'Portal induk' },
  units: [
    { title: 'Garage Coffee / Garage OS', sub: 'Studi kasus ekosistem', tint: 'var(--tint-peach)' },
    { title: 'Desain Aja Dulu', sub: 'Studi kasus ekosistem', tint: 'var(--tint-sky)' },
    { title: 'TM 87 Farm', sub: 'Studi kasus ekosistem', tint: 'var(--tint-mint)' },
    { title: 'KILLUASURYA.TECH', sub: 'Agency digital & aplikasi kerja', tint: 'var(--tint-lavender)', primary: true },
  ],
  children: ['Website Marketing', 'Agency OS', 'Custom Business Systems'],
} as const;

/** FLOWCHART_MERMAID.md — Lead-to-Project (exact order + revision loop back to Discovery & Estimate). */
export const leadFlow = [
  'Website / Ads / Referral',
  'Smart Brief + Consent',
  'CRM Qualification',
  'Discovery & Estimate',
  'Quotation + Owner Approval',
  'Client Accept?',
  'Contract / Onboarding',
  'Project + Tasks',
  'Delivery / Review',
  'Reporting / Retention',
] as const;

/**
 * Home — "Kenapa KILLUASURYA.TECH". Each point restates an existing commitment (About principles,
 * PRD §03.7 proof-of-done, §27 copy, FAQ) — no new claims, numbers or testimonials.
 */
export const whyUs = [
  { icon: 'layers', title: 'Satu partner, satu tim', body: 'Creative, Digital Growth, Customer Program, dan Business Technology dikerjakan satu tim — tanpa oper-operan vendor.', color: '#B78CFF' },
  { icon: 'proof', title: 'Bukti, bukan janji', body: 'Setiap paket punya deliverable terukur, siklus revisi, dan bukti selesai. Tanpa janji viral, ranking #1, atau penjualan pasti naik.', color: '#C7F60C' },
  { icon: 'price', title: 'Harga transparan', body: 'Biaya pihak ketiga — iklan, lisensi, API, domain & hosting — dipisahkan dan dijelaskan di penawaran.', color: '#49B7FF' },
  { icon: 'consent', title: 'Berbasis izin & jalur resmi', body: 'Kampanye pelanggan hanya ke kontak yang memberi izin, lewat jalur resmi, dengan approval Owner.', color: '#FF7AC6' },
] as const;

/**
 * Home — client-facing summary of the Lead-to-Project flow above (same order, grouped; `from` lists the
 * exact flowchart nodes each step covers). The full 10-step flow stays on /case-studies.
 */
export const clientSteps = [
  { title: 'Ceritakan kebutuhan', body: 'Isi Smart Brief dan beri izin kontak — kami tidak menghubungi tanpa persetujuan.', from: ['Smart Brief + Consent'] },
  { title: 'Discovery & estimasi', body: 'Kami pelajari bisnis dan tujuan Anda, lalu menyusun ruang lingkup dan estimasi.', from: ['CRM Qualification', 'Discovery & Estimate'] },
  { title: 'Penawaran & kontrak', body: 'Penawaran rinci disetujui Owner. Perlu revisi? Kembali ke discovery sampai pas.', from: ['Quotation + Owner Approval', 'Client Accept?', 'Contract / Onboarding'] },
  { title: 'Produksi & review', body: 'Pekerjaan berjalan sebagai proyek dan task; Anda me-review dan menyetujui hasilnya.', from: ['Project + Tasks', 'Delivery / Review'] },
  { title: 'Laporan & tumbuh', body: 'Laporan berkala dan rencana langkah berikutnya untuk pertumbuhan jangka panjang.', from: ['Reporting / Retention'] },
] as const;

/** Packages highlighted on Home (codes from PRD §04 `packages`); full list on /pricing. */
export const homePackages = ['START', 'GROW', 'BUILD'] as const;

/**
 * Official contact (Owner, Master Prompt V5). WhatsApp = click-to-chat only (wa.me) — no API, no automated sending.
 * Instagram handle is listed but NOT linked until the Owner confirms the profile URL.
 */
export const whatsapp = { number: '6281396186251', display: '0813-9618-6251', message: 'Halo KILLUASURYA.TECH, saya ingin konsultasi.' };
export const instagram = { handle: '@killua_surya2', url: null as string | null };
export const founderPortfolio = 'https://suryadev.click/';

/** wa.me link with a prefilled message, e.g. waLink('Website & Experience'). */
export const waLink = (topic?: string) =>
  `https://wa.me/${whatsapp.number}?text=${encodeURIComponent(topic ? `Halo KILLUASURYA.TECH, saya ingin konsultasi tentang ${topic}.` : whatsapp.message)}`;

/** Topic for the floating button's prefilled message, by path prefix. */
export const waTopics: [string, string][] = [
  ['/services/digital-marketing', 'Digital Growth'], ['/services/creative-studio', 'Creative Studio'], ['/services/website-development', 'Website & Experience'],
  ['/services/business-systems', 'Custom Business System'], ['/services/ai-automation', 'AI & Automation'], ['/services', 'layanan'],
  ['/solusi', 'solusi untuk jenis usaha saya'], ['/pricing', 'paket & harga'], ['/build-your-package', 'paket & harga'], ['/portfolio', 'portofolio'], ['/process', 'proses kerja'],
];

/** Canonical site URL for metadata/sitemap. Set NEXT_PUBLIC_SITE_URL at deploy time; the fallback is the brand domain. */
export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://killuasurya.tech').replace(/\/$/, '');
