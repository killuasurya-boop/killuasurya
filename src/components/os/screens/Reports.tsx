'use client';

import { useState } from 'react';
import { BarChart3, Megaphone, PieChart, TrendingUp } from 'lucide-react';
import { AnimatedTabs } from '@/components/motion';
import { BarList, DemoNote, Donut, EmptyState, KpiCard, LineChart, PageHeader, Panel } from '../ui';
import { funnel, projectStatus, topServices, trend } from '@/fixtures/os.demo';
import p from '../pages.module.css';

export function ReportsScreen() {
  const [tab, setTab] = useState('overview');
  return (
    <div className={p.stack}>
      <PageHeader title="Laporan &" highlight="Insight" sub="Baseline dulu, target kemudian — metrik didefinisikan jelas sebelum dipakai mengambil keputusan (PRD §18)." actions={<AnimatedTabs label="Jenis laporan" value={tab} onChange={setTab} tabs={[{ id: 'overview', label: 'Overview' }, { id: 'ads', label: 'Ads Control' }]} />} />
      <DemoNote>Grafik memakai data contoh. Data provider (Meta, Google, TikTok, Metricool) belum terhubung.</DemoNote>
      {tab === 'overview' ? (
        <>
          <div className={p.kpis}>
            <KpiCard label="Leads (bulan ini)" value={208} delta={24} spark={trend.series[0].data} icon={<TrendingUp size={22} />} />
            <KpiCard label="Deal" value={42} delta={18} spark={trend.series[1].data} icon={<BarChart3 size={22} />} />
            <KpiCard label="Proyek aktif" value={32} delta={12} icon={<PieChart size={22} />} />
            <KpiCard label="Konten terbit" value={48} delta={33} icon={<Megaphone size={22} />} />
          </div>
          <Panel title="Tren Leads & Deal (30 hari)" icon={<TrendingUp size={18} />}>
            <LineChart label="Tren leads dan deal (data demo)" labels={trend.labels} series={trend.series} height={260} />
          </Panel>
          <div className={p.g3}>
            <Panel title="Funnel" icon={<BarChart3 size={18} />}><BarList data={funnel} /></Panel>
            <Panel title="Distribusi Proyek" icon={<PieChart size={18} />}><Donut data={projectStatus} center="32" label="Proyek" /></Panel>
            <Panel title="Layanan Diminati" icon={<BarChart3 size={18} />}><BarList data={topServices} unit="%" max={40} /></Panel>
          </div>
        </>
      ) : (
        <Panel title="Ads Control" icon={<Megaphone size={18} />}>
          <EmptyState title="Belum ada data iklan" body="Ads Control menampilkan campaign ID, anggaran yang disetujui, dan laporan provider setelah akun iklan terhubung. Perubahan budget selalu butuh approval Owner." />
        </Panel>
      )}
    </div>
  );
}
