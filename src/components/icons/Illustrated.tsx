import s from './icons.module.css';

/**
 * Bespoke illustrated icons — Electric Doodle "sticker" style (ink outline, flat brand fills, hard offset shadow).
 * Hand-built SVG, each with its own micro-animation: plays once when it scrolls into view and again whenever the
 * surrounding card (`[data-ai-host]`) is hovered or focused. Pattern reference: hover-triggered animated icon sets
 * (lucide-animated, Itshover) — implementation and artwork are original. Decorative: always aria-hidden.
 */
export type IllustratedName = 'growth' | 'creative' | 'website' | 'system' | 'ai' | 'chat' | 'shield' | 'pin';

const INK = '#151522';
const art: Record<IllustratedName, React.ReactNode> = {
  growth: (
    <>
      <rect x="6" y="8" width="52" height="48" rx="10" fill="#fff" stroke={INK} strokeWidth="3" />
      <rect className={s.bar1} x="15" y="34" width="9" height="14" rx="2.5" fill="#8238F5" stroke={INK} strokeWidth="2.5" />
      <rect className={s.bar2} x="27.5" y="27" width="9" height="21" rx="2.5" fill="#49B7FF" stroke={INK} strokeWidth="2.5" />
      <rect className={s.bar3} x="40" y="19" width="9" height="29" rx="2.5" fill="#C7F60C" stroke={INK} strokeWidth="2.5" />
      <path className={s.trace} pathLength={1} d="M13 30 L25 22 L33 25 L50 12" fill="none" stroke="#FC7158" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <path className={s.tip} d="M44 11 L51 11 L51 18" fill="none" stroke="#FC7158" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  creative: (
    <>
      <rect x="7" y="20" width="50" height="34" rx="8" fill="#FF7AC6" stroke={INK} strokeWidth="3" />
      <g className={s.clap}>
        <path d="M7 20 L52 9 a3 3 0 0 1 3.6 2.2 L57 17 L9 28 Z" fill="#fff" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
        <path d="M18 17.5 L24 24.5 M30 14.6 L36 21.6 M42 11.7 L48 18.7" stroke={INK} strokeWidth="3" strokeLinecap="round" />
      </g>
      <path className={s.play} d="M27 31 L40 38 L27 45 Z" fill="#fff" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      <path className={s.spark} d="M53 40 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2 Z" fill="#C7F60C" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
    </>
  ),
  website: (
    <>
      <rect x="5" y="9" width="54" height="42" rx="8" fill="#fff" stroke={INK} strokeWidth="3" />
      <path d="M5 21 H59" stroke={INK} strokeWidth="3" />
      <circle cx="13" cy="15" r="2" fill="#FC7158" /><circle cx="20" cy="15" r="2" fill="#C7F60C" /><circle cx="27" cy="15" r="2" fill="#49B7FF" />
      <rect className={s.block} x="12" y="27" width="20" height="17" rx="3" fill="#8238F5" stroke={INK} strokeWidth="2.5" />
      <path className={s.lines} pathLength={1} d="M38 29 H52 M38 35 H52 M38 41 H47" stroke={INK} strokeWidth="3" strokeLinecap="round" />
      <circle className={s.ripple} cx="42" cy="46" r="6" fill="none" stroke="#C7F60C" strokeWidth="3" />
      <path className={s.cursor} d="M42 44 L42 59 L46.5 55 L50 61.5 L53.5 59.8 L50 53.5 L56 53 Z" fill="#C7F60C" stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
    </>
  ),
  system: (
    <>
      <path className={s.layer3} d="M32 34 L56 44 L32 54 L8 44 Z" fill="#49B7FF" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      <path className={s.layer2} d="M32 23 L56 33 L32 43 L8 33 Z" fill="#8238F5" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      <path className={s.layer1} d="M32 10 L56 20 L32 30 L8 20 Z" fill="#C7F60C" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      <path className={s.node} d="M32 15.5 l1.6 3 3.2 .5 -2.3 2.2 .6 3.3 -3.1 -1.6 -3.1 1.6 .6 -3.3 -2.3 -2.2 3.2 -.5 Z" fill="#fff" stroke={INK} strokeWidth="1.8" strokeLinejoin="round" />
    </>
  ),
  ai: (
    <>
      <path className={s.pins} d="M22 6 V14 M32 6 V14 M42 6 V14 M22 50 V58 M32 50 V58 M42 50 V58 M6 22 H14 M6 32 H14 M6 42 H14 M50 22 H58 M50 32 H58 M50 42 H58" stroke={INK} strokeWidth="3" strokeLinecap="round" />
      <rect x="14" y="14" width="36" height="36" rx="8" fill="#49B7FF" stroke={INK} strokeWidth="3" />
      <rect className={s.core} x="23" y="23" width="18" height="18" rx="5" fill="#C7F60C" stroke={INK} strokeWidth="2.5" />
      <path className={s.bolt} d="M33.5 26 L28.5 33 H32 L30.5 38 L35.5 31 H32 Z" fill={INK} />
    </>
  ),
  chat: (
    <>
      <path d="M10 12 H54 a6 6 0 0 1 6 6 V38 a6 6 0 0 1 -6 6 H30 L18 55 V44 H10 a6 6 0 0 1 -6 -6 V18 a6 6 0 0 1 6 -6 Z" fill="#C7F60C" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      <circle className={s.dot1} cx="21" cy="28" r="3.5" fill={INK} /><circle className={s.dot2} cx="32" cy="28" r="3.5" fill={INK} /><circle className={s.dot3} cx="43" cy="28" r="3.5" fill={INK} />
    </>
  ),
  shield: (
    <>
      <path className={s.shieldBody} d="M32 6 L54 14 V30 C54 44 44 53 32 58 C20 53 10 44 10 30 V14 Z" fill="#8238F5" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      <path className={s.check} pathLength={1} d="M21 31 L29 39 L43 23" fill="none" stroke="#C7F60C" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  pin: (
    <>
      <ellipse className={s.shadow} cx="32" cy="55" rx="14" ry="4" fill={INK} opacity=".25" />
      <g className={s.drop}>
        <path d="M32 6 C20 6 12 15 12 26 C12 39 26 49 32 54 C38 49 52 39 52 26 C52 15 44 6 32 6 Z" fill="#FC7158" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
        <circle cx="32" cy="26" r="8" fill="#fff" stroke={INK} strokeWidth="3" />
      </g>
    </>
  ),
};

export function Illustrated({ name, size = 56, className }: { name: IllustratedName; size?: number; className?: string }) {
  return (
    <span className={`${s.ill} ${s['i_' + name]} ${className ?? ''}`} data-ai aria-hidden="true" style={{ width: size, height: size }}>
      <svg viewBox="0 0 64 64" width={size} height={size} focusable="false">{art[name]}</svg>
    </span>
  );
}
