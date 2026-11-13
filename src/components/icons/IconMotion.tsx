'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

/**
 * One observer for every animated icon on the page (mounted once per shell).
 * - `[data-ai-draw]` line icons: strokes are normalised (pathLength=1) and drawn when they enter the viewport.
 * - `[data-ai]` icons get `data-seen` on first view, which plays their intro animation once.
 * Nothing is hidden without JS or with reduced motion (the pre-state is only applied here, under `.motion-ok`).
 */
export function IconMotion() {
  const path = usePathname();
  useEffect(() => {
    if (!document.documentElement.classList.contains('motion-ok') || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { (e.target as HTMLElement).dataset.seen = '1'; io.unobserve(e.target); } });
    }, { rootMargin: '100000px 0px -8% 0px' });   // anything already scrolled past counts as seen
    const prep = () => {
      document.querySelectorAll<HTMLElement>('[data-ai]:not([data-ai-ready])').forEach((el) => {
        el.dataset.aiReady = '1';
        if (el.hasAttribute('data-ai-draw')) {
          el.querySelectorAll<SVGGeometryElement>('path, circle, rect, line, polyline, ellipse').forEach((g, i) => {
            g.setAttribute('pathLength', '1');
            g.style.setProperty('--i', String(Math.min(i, 6)));
          });
        }
        io.observe(el);
      });
    };
    // Never compete with hydration / hero timeline: scan when the main thread is idle, at most every 400ms.
    const ric = (window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }).requestIdleCallback;
    const idle = (fn: () => void) => (ric ? ric(fn, { timeout: 1200 }) : setTimeout(fn, 200));
    let queued = false;
    const schedule = () => { if (queued) return; queued = true; setTimeout(() => idle(() => { queued = false; prep(); }), 400); };
    idle(prep);
    const mo = new MutationObserver(schedule);    // icons rendered later (tabs, drawers, route changes)
    mo.observe(document.body, { childList: true, subtree: true });
    return () => { io.disconnect(); mo.disconnect(); };
  }, [path]);
  return null;
}
