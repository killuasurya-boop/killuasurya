/**
 * Portfolio entries. D-11: no case study is cleared for publication yet, so every entry carries an
 * honest evidence label (PRD §12A: implemented in code / tested / production-verified / concept).
 * No client names, revenue, screenshots or results are shown until the Owner approves them.
 */
export type Evidence = 'concept' | 'implemented' | 'tested' | 'verified';
export const evidenceLabel: Record<Evidence, string> = {
  concept: 'Konsep',
  implemented: 'Kode tersedia · belum UAT',
  tested: 'Teruji',
  verified: 'Terverifikasi produksi',
};

export const portfolio = [
  { slug: 'garage-os', title: 'Garage Coffee / Garage OS', category: 'system', industry: 'F&B / Coffee', summary: 'Sistem operasional F&B: POS, waiter, kitchen/bar ticket, WMS, finance, CRM. Ditampilkan sebagai simulasi alur operasional.', evidence: 'implemented' as Evidence, object: '28_object_connected_workflow.svg' },
  { slug: 'desain-aja-dulu', title: 'Desain Aja Dulu', category: 'creative', industry: 'Jasa desain kreatif', summary: 'Unit ekosistem jasa desain kreatif & aset visual.', evidence: 'concept' as Evidence, object: '27_object_asset_folder.svg' },
  { slug: 'tm-87-farm', title: 'TM 87 Farm', category: 'system', industry: 'Peternakan / Pertanian', summary: 'Operasional produksi, inventaris, pencatatan kegiatan, biaya dan laporan.', evidence: 'concept' as Evidence, object: '26_object_analytics_dashboard.svg' },
  { slug: 'killuasurya-agency-os', title: 'KILLUASURYA Agency OS', category: 'website', industry: 'Jasa / Agency', summary: 'CRM, quotation, proyek, task, produksi konten, publishing control, dan client portal.', evidence: 'concept' as Evidence, object: '22_object_laptop.svg' },
] as const;

export const portfolioTabs = [
  { id: 'all', label: 'Semua' },
  { id: 'system', label: 'Business System' },
  { id: 'creative', label: 'Creative' },
  { id: 'website', label: 'Website & OS' },
];

/** PRD §12 — industry solution compositions. */
export const industries = [
  { name: 'Cafe / Restoran', modules: 'POS, waiter, kitchen/bar tickets, WMS, cash closing, CRM, analytics' },
  { name: 'Retail / Toko', modules: 'POS, SKU, barcode, supplier, inventory, loyalty' },
  { name: 'Printshop / Workshop', modules: 'Quotation, work order, desain approval, stok bahan, jadwal mesin, invoice' },
  { name: 'Distributor', modules: 'Sales order, procurement, warehouse, transfer, delivery, finance' },
  { name: 'Jasa / Agency', modules: 'CRM, quotation, proyek, task, time tracking, invoice, client portal' },
  { name: 'Peternakan / Pertanian', modules: 'Operasional produksi, inventaris, pencatatan kegiatan, biaya, laporan' },
  { name: 'Multi-branch', modules: 'Multi-location, role governance, konsolidasi dan dashboard pusat' },
];
