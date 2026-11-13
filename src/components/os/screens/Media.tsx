'use client';

import Image from 'next/image';
import { useRef, useState } from 'react';
import { AnimatePresence, LayoutGroup, motion } from 'motion/react';
import { Image as ImageIcon, UploadCloud } from 'lucide-react';
import { AnimatedModal, AnimatedTabs, Button, useToast } from '@/components/motion';
import { DemoNote, PageHeader, Panel, StatusPill } from '../ui';
import { media } from '@/fixtures/os.demo';
import { bezier, duration } from '@/motion/tokens';
import p from '../pages.module.css';

type Asset = (typeof media)[number];

export function MediaScreen() {
  const toast = useToast();
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [type, setType] = useState('all');
  const [open, setOpen] = useState<Asset | null>(null);
  const [upload, setUpload] = useState<number | null>(null);
  const [drag, setDrag] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const list = media.filter((m) => type === 'all' || m.type === type);

  const simulate = (name: string) => {
    setUpload(0);
    let v = 0;
    const id = setInterval(() => { v += 20; setUpload(v); if (v >= 100) { clearInterval(id); setTimeout(() => setUpload(null), 400); toast({ tone: 'info', title: 'Upload hanya simulasi', body: `${name} tidak diunggah — storage belum terhubung (D-14).` }); } }, 160);
  };

  return (
    <div className={p.stack}>
      <PageHeader title="Media Library /" highlight="Asset Center" sub="Aset kreatif dengan versi, status approval, dan hak penggunaan." />
      <DemoNote>Daftar aset contoh; thumbnail memakai ilustrasi objek dari asset library.</DemoNote>
      <Panel>
        <label onDragOver={(e) => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)} onDrop={(e) => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files[0]; if (f) simulate(f.name); }}
          style={{ display: 'grid', placeItems: 'center', gap: 8, padding: 24, borderRadius: 16, border: `2px dashed ${drag ? 'var(--lime)' : 'var(--border-strong)'}`, background: drag ? 'color-mix(in srgb, var(--raised) 80%, var(--lime))' : 'var(--raised)', cursor: 'pointer', textAlign: 'center', transition: 'all 180ms' }}>
          <motion.span animate={drag ? { y: -4, scale: 1.1 } : { y: 0, scale: 1 }}><UploadCloud size={32} aria-hidden="true" /></motion.span>
          <strong>Seret file ke sini atau pilih file</strong>
          <span className={p.muted}>PNG, JPG, MP4, PDF, SVG · simulasi (tidak diunggah)</span>
          <input ref={input} type="file" className="sr-only" onChange={(e) => e.target.files?.[0] && simulate(e.target.files[0].name)} />
          <AnimatePresence>{upload !== null && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ width: 'min(320px, 100%)' }} role="progressbar" aria-valuenow={upload} aria-valuemin={0} aria-valuemax={100} aria-label="Progres upload (simulasi)">
              <div className={p.progress}><motion.span animate={{ scaleX: upload / 100 }} transition={{ duration: 0.15 }} style={{ background: 'var(--lime)' }} /></div>
            </motion.div>)}
          </AnimatePresence>
        </label>
      </Panel>

      <Panel title="Semua Aset" icon={<ImageIcon size={18} />} action={
        <div className={p.row}>
          <AnimatedTabs label="Filter tipe" value={type} onChange={setType} tabs={[{ id: 'all', label: 'Semua' }, { id: 'Gambar', label: 'Gambar' }, { id: 'Video', label: 'Video' }, { id: 'Dokumen', label: 'Dokumen' }]} />
          <AnimatedTabs label="Tampilan" value={view} onChange={(v) => setView(v as 'grid' | 'list')} tabs={[{ id: 'grid', label: 'Grid' }, { id: 'list', label: 'List' }]} />
        </div>}>
        <LayoutGroup>
          <motion.ul layout style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 12, gridTemplateColumns: view === 'grid' ? 'repeat(auto-fill, minmax(190px, 1fr))' : '1fr' }}>
            <AnimatePresence initial={false}>
              {list.map((a) => (
                <motion.li key={a.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: duration.modal, ease: bezier.out }}>
                  <motion.button type="button" layoutId={`asset-${a.id}`} onClick={() => setOpen(a)} whileHover={{ y: -3 }} style={{ all: 'unset', boxSizing: 'border-box', width: '100%', cursor: 'pointer', display: 'grid', gridTemplateColumns: view === 'grid' ? '1fr' : '72px 1fr auto', gap: 10, alignItems: 'center', padding: 10, borderRadius: 16, background: 'var(--surface)', border: '1px solid var(--border)' }}>
                    <span style={{ display: 'grid', placeItems: 'center', aspectRatio: view === 'grid' ? '4 / 3' : '1', borderRadius: 12, background: 'var(--raised)' }}><Image src={`/assets/killuasurya/creative/04_OBJECTS/${a.object}`} alt="" width={view === 'grid' ? 96 : 48} height={view === 'grid' ? 96 : 48} /></span>
                    <span style={{ display: 'grid', gap: 2, minWidth: 0 }}><strong style={{ fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.name}</strong><small className={p.muted}>{a.type} · {a.size} · v{a.version}</small></span>
                    <StatusPill status={a.status} />
                  </motion.button>
                </motion.li>
              ))}
            </AnimatePresence>
          </motion.ul>
        </LayoutGroup>
      </Panel>

      <AnimatedModal open={!!open} onClose={() => setOpen(null)} title={open?.name ?? ''}>
        {open && (
          <div style={{ display: 'grid', gap: 12 }}>
            <div style={{ display: 'grid', placeItems: 'center', aspectRatio: '16 / 9', borderRadius: 16, background: 'var(--raised)' }}><Image src={`/assets/killuasurya/creative/04_OBJECTS/${open.object}`} alt="" width={140} height={140} /></div>
            <div className={p.row}><StatusPill status={open.status} /><span className={p.tag}>{open.id}</span><span className={p.tag}>Versi {open.version}</span></div>
            <p className={p.muted} style={{ margin: 0 }}>Riwayat versi, hak penggunaan, dan proyek terkait tersedia setelah storage terhubung.</p>
            <div className={p.row} style={{ justifyContent: 'flex-end' }}><Button variant="tertiary" onClick={() => setOpen(null)}>Tutup</Button></div>
          </div>
        )}
      </AnimatedModal>
    </div>
  );
}
