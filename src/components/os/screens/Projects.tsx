'use client';

import { useState } from 'react';
import { DndContext, DragOverlay, KeyboardCode, KeyboardSensor, PointerSensor, useDraggable, useDroppable, useSensor, useSensors, type DragEndEvent, type DragStartEvent, type KeyboardCoordinateGetter } from '@dnd-kit/core';
import { motion } from 'motion/react';
import { CalendarClock, FolderKanban, GripVertical } from 'lucide-react';
import { useToast } from '@/components/motion';
import { Avatar, DemoNote, PageHeader, Panel, StatusPill } from '../ui';
import { kanbanCols, projects, tasks as seed, type TaskCol } from '@/fixtures/os.demo';
import { bezier, inViewOnce } from '@/motion/tokens';
import { KitDemo } from '../kit/KitDemo';
import p from '../pages.module.css';
import k from './kanban.module.css';

type Task = (typeof seed)[number];

/** Keyboard: ←/→ jump a whole column (not 25px), so a task can reach any column in ≤3 presses. */
const columnJump: KeyboardCoordinateGetter = (event, { context: { droppableRects, collisionRect } }) => {
  if (!collisionRect) return undefined;
  const dir = event.code === KeyboardCode.Right ? 1 : event.code === KeyboardCode.Left ? -1 : 0;
  if (!dir) return undefined;
  event.preventDefault();
  const cx = collisionRect.left + collisionRect.width / 2;
  const cols = [...droppableRects.values()].sort((a, b) => a.left - b.left);
  const target = dir > 0 ? cols.find((r) => r.left + r.width / 2 > cx + 4) : [...cols].reverse().find((r) => r.left + r.width / 2 < cx - 4);
  if (!target) return undefined;
  return { x: target.left + target.width / 2 - collisionRect.width / 2, y: target.top + 48 };
};

function Card({ t, overlay }: { t: Task; overlay?: boolean }) {
  return (
    <div className={`${k.card} ${overlay ? k.overlay : ''}`}>
      <div className={p.between}><span className={p.tag}>{t.project}</span><span className={`${k.prio} ${k['p' + t.priority]}`}>{t.priority}</span></div>
      <strong className={k.title}>{t.title}</strong>
      <div className={p.between}><span className={p.row} style={{ gap: 6, fontSize: 12, color: 'var(--muted)' }}><CalendarClock size={14} aria-hidden="true" />{t.due}</span><Avatar id={t.owner} size={28} /></div>
    </div>
  );
}

function DraggableCard({ t }: { t: Task }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: t.id });
  return (
    <motion.div layout layoutId={t.id} ref={setNodeRef} className={k.dragWrap} style={{ opacity: isDragging ? 0.35 : 1 }} transition={{ duration: 0.25, ease: bezier.out }}>
      <button type="button" className={k.handle} {...listeners} {...attributes} aria-label={`Seret tugas ${t.title}. Tekan spasi lalu panah untuk memindahkan.`}><GripVertical size={16} aria-hidden="true" /></button>
      <Card t={t} />
    </motion.div>
  );
}

function Column({ id, label, children, count }: { id: TaskCol; label: string; children: React.ReactNode; count: number }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <section ref={setNodeRef} className={`${k.col} ${isOver ? k.over : ''}`} aria-label={`${label}, ${count} tugas`}>
      <header className={k.colHead}><span>{label}</span><span className={p.tag}>{count}</span></header>
      <div className={k.colBody}>{children}</div>
    </section>
  );
}

export function ProjectsScreen({ demoRole = 'owner' }: { demoRole?: 'owner' | 'staff' } = {}) {
  const toast = useToast();
  const [items, setItems] = useState<Task[]>(seed);
  const [active, setActive] = useState<Task | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }), useSensor(KeyboardSensor, { coordinateGetter: columnJump }));

  const onStart = (e: DragStartEvent) => setActive(items.find((t) => t.id === e.active.id) ?? null);
  const onEnd = (e: DragEndEvent) => {
    setActive(null);
    const to = e.over?.id as TaskCol | undefined;
    if (!to) return;
    setItems((list) => list.map((t) => (t.id === e.active.id ? { ...t, col: to } : t)));
    const t = items.find((x) => x.id === e.active.id);
    if (t && t.col !== to) toast({ tone: 'success', title: `Dipindah ke ${kanbanCols.find((c) => c.id === to)?.label}`, body: `${t.title} (DATA DEMO)` });
  };

  return (
    <div className={p.stack}>
      <PageHeader title="Proyek &" highlight="Tugas" sub="Kanban tugas lintas proyek. Seret kartu dengan mouse/touch, atau fokus ke pegangan lalu Spasi + panah untuk keyboard." />
      <DemoNote>Proyek dan tugas fiktif. Perpindahan kolom tidak disimpan.</DemoNote>
      <KitDemo who={demoRole} />
      <div className={p.g2} style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
        {projects.map((pr) => (
          <Panel key={pr.id}>
            <div className={p.between}><span className={p.tag}>{pr.id}</span><StatusPill status={pr.status} /></div>
            <p style={{ margin: '10px 0 2px', fontWeight: 700 }}>{pr.name}</p>
            <p className={p.muted} style={{ margin: '0 0 10px' }}>{pr.client}</p>
            <div className={p.progress} role="progressbar" aria-label={`Progres ${pr.name}`} aria-valuenow={pr.progress} aria-valuemin={0} aria-valuemax={100}>
              <motion.span initial={{ scaleX: 0 }} whileInView={{ scaleX: pr.progress / 100 }} viewport={inViewOnce} transition={{ duration: 0.7, ease: bezier.out }} />
            </div>
            <p className={p.muted} style={{ margin: '6px 0 0', textAlign: 'right' }}>{pr.progress}%</p>
          </Panel>
        ))}
      </div>
      <Panel title="Board Tugas" icon={<FolderKanban size={18} />}>
        <DndContext sensors={sensors} onDragStart={onStart} onDragEnd={onEnd} onDragCancel={() => setActive(null)}
          accessibility={{ announcements: {
            onDragStart: ({ active: a }) => `Mengambil tugas ${a.id}.`,
            onDragOver: ({ over }) => (over ? `Di atas kolom ${over.id}.` : 'Tidak di atas kolom.'),
            onDragEnd: ({ over }) => (over ? `Dilepas di kolom ${over.id}.` : 'Dibatalkan.'),
            onDragCancel: () => 'Dibatalkan.',
          } }}>
          <div className={k.board} tabIndex={0} role="region" aria-label="Board tugas (dapat digeser)">
            {kanbanCols.map((c) => {
              const list = items.filter((t) => t.col === c.id);
              return <Column key={c.id} id={c.id} label={c.label} count={list.length}>{list.map((t) => <DraggableCard key={t.id} t={t} />)}</Column>;
            })}
          </div>
          <DragOverlay dropAnimation={{ duration: 220, easing: 'cubic-bezier(0.22,1,0.36,1)' }}>{active ? <Card t={active} overlay /> : null}</DragOverlay>
        </DndContext>
      </Panel>
    </div>
  );
}
