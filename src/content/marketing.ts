/**
 * Marketing content for Home + /solusi. Rules (unchanged): no invented numbers, clients, testimonials or
 * guaranteed outcomes. Problems come from PRD §03.7 (`contractLines`), industry modules from PRD §12
 * (`industries`), packages from PRD §04. Situations are phrased as questions, never as claims.
 */

/** PRD §03.7 problems, in the customer's words → the service line that addresses each. */
export const painPoints = [
  { icon: 'map', problem: 'Bisnis sulit ditemukan pelanggan sekitar?', answer: 'Profil Google Maps, SEO lokal, dan media sosial dirapikan supaya mudah dicari.', service: 'Digital Growth', href: '/services/digital-marketing', color: '#B78CFF' },
  { icon: 'calendar', problem: 'Konten jarang posting dan tidak konsisten?', answer: 'Kalender konten, produksi foto & video, sampai jadwal terbit dikerjakan satu tim.', service: 'Creative Studio', href: '/services/creative-studio', color: '#FF7AC6' },
  { icon: 'ads', problem: 'Sudah pasang iklan, tapi hasilnya tidak jelas?', answer: 'Anggaran disetujui di awal, kampanye dipantau, dan laporannya dari data platform iklan.', service: 'Digital Growth', href: '/services/digital-marketing', color: '#49B7FF' },
  { icon: 'chat', problem: 'Calon pembeli bertanya lalu hilang begitu saja?', answer: 'Setiap prospek dicatat dan ditindaklanjuti lewat CRM — hanya dengan izin pelanggan.', service: 'Custom Business System', href: '/services/business-systems', color: '#C7F60C' },
  { icon: 'page', problem: 'Belum punya halaman untuk jualan online?', answer: 'Landing page, company profile, katalog, atau toko online yang dirancang untuk konversi.', service: 'Website & Experience', href: '/services/website-development', color: '#49B7FF' },
  { icon: 'ops', problem: 'Kasir, stok, dan laporan masih dicatat manual?', answer: 'Aplikasi kasir, stok, dan laporan dibuat mengikuti cara kerja bisnis Anda.', service: 'Custom Business System', href: '/services/business-systems', color: '#FC7158' },
] as const;

/** PRD §12 industry compositions → /solusi/[slug]. `modules` are the exact PRD module lists. */
export const solutions = [
  { slug: 'cafe-restoran', name: 'Cafe / Restoran', short: 'Kasir, dapur, stok', icon: 'coffee', pkg: 'SYSTEM',
    intro: 'Dari pesanan di meja sampai laporan harian — satu alur yang rapi untuk tim kasir, waiter, dapur, dan bar.',
    pains: ['Pesanan sering tertukar antara kasir, dapur, dan bar?', 'Stok bahan sulit dipantau dan sering selisih?', 'Tutup kasir harian makan waktu lama?'],
    modules: ['POS', 'Waiter', 'Kitchen/bar tickets', 'WMS', 'Cash closing', 'CRM', 'Analytics'], services: ['business-systems', 'digital-marketing', 'creative-studio'] },
  { slug: 'retail-toko', name: 'Retail / Toko', short: 'POS, barcode, stok', icon: 'store', pkg: 'SYSTEM',
    intro: 'Penjualan, barang, dan pelanggan tercatat di satu tempat — dari kasir sampai supplier.',
    pains: ['Stok di rak dan di catatan sering berbeda?', 'Sulit tahu barang mana yang paling laku?', 'Pelanggan lama jarang kembali?'],
    modules: ['POS', 'SKU', 'Barcode', 'Supplier', 'Inventory', 'Loyalty'], services: ['business-systems', 'digital-marketing', 'website-development'] },
  { slug: 'printshop-workshop', name: 'Printshop / Workshop', short: 'Order, desain, produksi', icon: 'printer', pkg: 'SYSTEM',
    intro: 'Dari penawaran sampai invoice — setiap pekerjaan punya status, approval desain, dan jadwal mesin yang jelas.',
    pains: ['Order menumpuk dan sulit dilacak statusnya?', 'Revisi desain bolak-balik lewat chat?', 'Jadwal mesin dan stok bahan sering bentrok?'],
    modules: ['Quotation', 'Work order', 'Desain approval', 'Stok bahan', 'Jadwal mesin', 'Invoice'], services: ['business-systems', 'website-development', 'creative-studio'] },
  { slug: 'distributor', name: 'Distributor', short: 'Order, gudang, kirim', icon: 'truck', pkg: 'SYSTEM',
    intro: 'Sales order, pembelian, gudang, dan pengiriman terhubung — tanpa rekap ulang di banyak file.',
    pains: ['Sales order masih direkap manual?', 'Stok antar gudang sulit dipantau?', 'Pengiriman dan tagihan sering tidak sinkron?'],
    modules: ['Sales order', 'Procurement', 'Warehouse', 'Transfer', 'Delivery', 'Finance'], services: ['business-systems', 'ai-automation', 'website-development'] },
  { slug: 'jasa-agency', name: 'Jasa / Agency', short: 'CRM, proyek, invoice', icon: 'briefcase', pkg: 'GROW',
    intro: 'Prospek, penawaran, proyek, dan tagihan dalam satu alur — klien bisa memantau progresnya sendiri.',
    pains: ['Prospek dan penawaran tersebar di banyak chat?', 'Progres proyek sulit dipantau klien?', 'Waktu kerja tim dan tagihan tidak tercatat rapi?'],
    modules: ['CRM', 'Quotation', 'Proyek', 'Task', 'Time tracking', 'Invoice', 'Client portal'], services: ['business-systems', 'digital-marketing', 'website-development'] },
  { slug: 'peternakan-pertanian', name: 'Peternakan / Pertanian', short: 'Produksi, biaya, laporan', icon: 'sprout', pkg: 'SYSTEM',
    intro: 'Kegiatan harian, inventaris, dan biaya produksi tercatat — laporan siap kapan pun dibutuhkan.',
    pains: ['Catatan produksi harian masih di buku?', 'Biaya pakan dan operasional sulit dihitung?', 'Laporan baru bisa dibuat di akhir bulan?'],
    modules: ['Operasional produksi', 'Inventaris', 'Pencatatan kegiatan', 'Biaya', 'Laporan'], services: ['business-systems', 'ai-automation', 'digital-marketing'] },
  { slug: 'multi-cabang', name: 'Multi-cabang', short: 'Semua cabang, satu dashboard', icon: 'network', pkg: 'ENTERPRISE',
    intro: 'Setiap cabang berjalan dengan aturan yang sama, dan pusat melihat semuanya dalam satu dashboard.',
    pains: ['Data tiap cabang dikirim dengan format berbeda?', 'Sulit membandingkan performa antar cabang?', 'Hak akses karyawan belum diatur jelas?'],
    modules: ['Multi-location', 'Role governance', 'Konsolidasi', 'Dashboard pusat'], services: ['business-systems', 'ai-automation', 'digital-marketing'] },
] as const;
export type Solution = (typeof solutions)[number];

/** Quiz — "Cek kebutuhan bisnis Anda". The goal decides the package (PRD §04 codes); other answers travel to the Smart Brief. */
export const quiz = {
  goals: [
    { id: 'lokal', label: 'Lebih mudah ditemukan pelanggan sekitar', pkg: 'START', service: 'digital-marketing' },
    { id: 'konten', label: 'Konten media sosial rutin & konsisten', pkg: 'GROW', service: 'digital-marketing' },
    { id: 'iklan', label: 'Iklan dan prospek yang terukur', pkg: 'PERFORM', service: 'digital-marketing' },
    { id: 'produksi', label: 'Foto, video, atau desain untuk brand', pkg: 'CREATE', service: 'creative-studio' },
    { id: 'website', label: 'Website atau toko online', pkg: 'BUILD', service: 'website-development' },
    { id: 'sistem', label: 'Kasir, stok, dan operasional yang rapi', pkg: 'SYSTEM', service: 'business-systems' },
  ],
  scales: [
    { id: 'mulai', label: 'Baru mulai / usaha sendiri' },
    { id: 'tim', label: 'Sudah berjalan, punya tim kecil' },
    { id: 'cabang', label: 'Beberapa cabang atau tim besar' },
  ],
} as const;
