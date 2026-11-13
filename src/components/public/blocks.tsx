import { AlertTriangle, BarChart3, Cpu, Layers, MonitorSmartphone, Palette } from 'lucide-react';
import type { IllustratedName } from '@/components/icons/Illustrated';
import { Doodle } from '@/components/doodle/Doodle';
import type { Service } from '@/content/services';
import s from './page.module.css';

/** Illustrated (animated) icon per service line. */
export const serviceArt: Record<Service['icon'], IllustratedName> = { growth: 'growth', creative: 'creative', website: 'website', system: 'system', ai: 'ai' };
export const serviceIcons = { growth: BarChart3, creative: Palette, website: MonitorSmartphone, system: Layers, ai: Cpu } satisfies Record<Service['icon'], unknown>;

export function SectionHead({ title, sub, id }: { title: React.ReactNode; sub?: React.ReactNode; id?: string }) {
  return (
    <div className={s.sectionHead} data-reveal>
      <Doodle name="doodle_crown" size={42} draw />
      <div>
        <h2 id={id} className={`display ${s.h2}`}>{title}</h2>
        {sub && <p className={s.sub}>{sub}</p>}
      </div>
    </div>
  );
}

export function Note({ children }: { children: React.ReactNode }) {
  return (
    <p className={s.note} role="note">
      <AlertTriangle size={18} aria-hidden="true" />
      <span>{children}</span>
    </p>
  );
}

export function FlowStrip({ steps, loop, label }: { steps: readonly string[]; loop?: string; label: string }) {
  return (
    <div>
      <ol className={s.flow} aria-label={label}>
        {steps.map((st) => (
          <li key={st} className={`${s.flowStep} ${st.trim().endsWith('?') ? s.flowDecision : ''}`} data-reveal>{st}</li>
        ))}
      </ol>
      {loop && <p className={s.flowLoop}>{loop}</p>}
    </div>
  );
}

export { s as pageStyles };
