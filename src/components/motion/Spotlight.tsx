'use client';

import { useEffect } from 'react';

/**
 * Cursor spotlight for cards marked `[data-spot]` (public site only): one delegated pointer listener writes the
 * pointer position into CSS variables; the glow itself is pure CSS (globals.css). Mouse/pen only, no layout work.
 */
export function Spotlight() {
  useEffect(() => {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    let raf = 0, last: PointerEvent | null = null;
    const apply = () => {
      raf = 0;
      const el = (last?.target as Element | null)?.closest?.('[data-spot]') as HTMLElement | null;
      if (!el || !last) return;
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', `${last.clientX - r.left}px`);
      el.style.setProperty('--my', `${last.clientY - r.top}px`);
    };
    const move = (e: PointerEvent) => { last = e; if (!raf) raf = requestAnimationFrame(apply); };
    document.addEventListener('pointermove', move, { passive: true });
    return () => { document.removeEventListener('pointermove', move); if (raf) cancelAnimationFrame(raf); };
  }, []);
  return null;
}
