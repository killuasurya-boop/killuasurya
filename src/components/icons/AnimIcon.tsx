import type { LucideIcon } from 'lucide-react';
import s from './icons.module.css';

export type Fx = 'wiggle' | 'bounce' | 'spin' | 'pulse' | 'nudge' | 'tilt';

/**
 * Line icon (lucide) with a professional micro-interaction: the strokes draw themselves once when the icon
 * scrolls into view, and the icon reacts (`fx`) when its card (`[data-ai-host]`) or the icon itself is hovered/focused.
 * `tile` renders the Electric Doodle sticker tile (flat colour, ink outline, hard shadow).
 */
export function AnimIcon({ icon: Icon, fx = 'wiggle', size = 22, tile, color, className }: { icon: LucideIcon; fx?: Fx; size?: number; tile?: boolean; color?: string; className?: string }) {
  return (
    <span className={`${s.ai} ${s['fx_' + fx]} ${tile ? s.tile : ''} ${className ?? ''}`} data-ai data-ai-draw aria-hidden="true" style={color ? ({ ['--c' as string]: color }) : undefined}>
      <Icon size={size} aria-hidden="true" />
    </span>
  );
}
