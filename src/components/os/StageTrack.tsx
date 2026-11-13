import { Check } from 'lucide-react';
import type { StageId, Status } from '@/lib/workflow';
import s from './stagetrack.module.css';

/** The production path every content task follows. Short labels for the track. */
export const track: { id: StageId; short: string; role: string }[] = [
  { id: 'planning', short: 'Ide & Konsep', role: 'planner' },
  { id: 'prep', short: 'Persiapan', role: 'production' },
  { id: 'production', short: 'Produksi', role: 'planner' },
  { id: 'editing', short: 'Editing', role: 'editor' },
  { id: 'owner', short: 'Approval', role: 'owner' },
  { id: 'scheduling', short: 'Jadwal', role: 'publisher' },
  { id: 'publishing', short: 'Terbit', role: 'publisher' },
  { id: 'reporting', short: 'Laporan', role: 'owner' },
];
export const stageIndex = (stage: string) => Math.max(0, track.findIndex((t) => t.id === stage));
export const nextStage = (stage: string) => track[stageIndex(stage) + 1];

/**
 * "Where is this work?" — the full path with the current stage highlighted.
 * `compact` = dot track for list rows. Screen readers get "Tahap X dari 8: <nama>".
 */
export function StageTrack({ stage, status, compact, nextWho }: { stage: string; status: Status; compact?: boolean; nextWho?: string }) {
  const cur = stageIndex(stage);
  const allDone = status === 'completed';
  const label = `Tahap ${cur + 1} dari ${track.length}: ${track[cur].short}`;
  if (compact) {
    return (
      <span className={s.mini} role="img" aria-label={label} title={label}>
        {track.map((t, i) => <i key={t.id} className={allDone || i < cur ? s.done : i === cur ? s.now : ''} />)}
      </span>
    );
  }
  const nxt = nextStage(stage);
  return (
    <div className={s.wrap}>
      <ol className={s.track} aria-label="Posisi di alur kerja">
        {track.map((t, i) => {
          const state = allDone || i < cur ? 'done' : i === cur ? 'now' : 'todo';
          return (
            <li key={t.id} className={s[state]} aria-current={state === 'now' ? 'step' : undefined}>
              <span className={s.dot}>{state === 'done' ? <Check size={12} strokeWidth={3} aria-hidden="true" /> : i + 1}</span>
              <span className={s.lbl}>{t.short}</span>
              <span className="sr-only">{state === 'done' ? ' (selesai)' : state === 'now' ? ' (sekarang)' : ''}</span>
            </li>
          );
        })}
      </ol>
      {!allDone && nxt && <p className={s.next}>Setelah tahap ini: <strong>{nxt.short}</strong>{nextWho ? <> oleh <strong>{nextWho}</strong></> : null}</p>}
    </div>
  );
}
