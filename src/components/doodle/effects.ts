'use client';

import { gsap, prepareDraw } from '@/motion/gsap';
import { duration, ease, stagger, distance } from '@/motion/tokens';

/**
 * Reusable doodle motion effects. All operate on ORIGINAL SVG assets:
 *  - stroke draw via stroke-dashoffset when the SVG has separate stroked paths;
 *  - otherwise transform / opacity on the whole asset (never redrawn).
 * Every function returns a timeline/tween so callers can place it inside a master timeline.
 */

/** CrownDraw / ArrowDraw / CheckDraw / ScribbleReveal — draw each stroked path in order. */
export function drawOn(root: Element | null, opts: { dur?: number; each?: number } = {}) {
  const tl = gsap.timeline();
  if (!root) return tl;
  const paths = prepareDraw(root);
  gsap.set(root, { opacity: 1 });
  const fills = Array.from(root.querySelectorAll<SVGElement>('path, circle, ellipse, rect')).filter((el) => !paths.includes(el as SVGGeometryElement));
  if (paths.length) {
    tl.to(paths, { strokeDashoffset: 0, duration: opts.dur ?? duration.draw, ease: ease.draw, stagger: opts.each ?? 0.12 });
  }
  if (fills.length) tl.from(fills, { opacity: 0, duration: 0.25, ease: ease.out }, paths.length ? '<0.15' : 0);
  return tl;
}

/** StarPop — scale/rotate pop on whole asset. */
export function pop(targets: gsap.TweenTarget, delayEach = stagger.doodle) {
  return gsap.fromTo(
    targets,
    { scale: 0, rotate: -25, opacity: 0, transformOrigin: '50% 50%' },
    { scale: 1, rotate: 0, opacity: 1, duration: 0.45, ease: ease.backOut, stagger: delayEach },
  );
}

/** LightningPulse — short, finite pulse (never an endless flicker). */
export function pulse(target: gsap.TweenTarget, repeat = 2) {
  return gsap.to(target, { scale: 1.08, duration: 0.22, ease: ease.inOut, yoyo: true, repeat: repeat * 2 - 1, transformOrigin: '50% 50%' });
}

/** FloatingDecor / MascotIdle — gentle float + tiny rotation, paused by caller when off-screen. */
export function floatIdle(target: gsap.TweenTarget, opts: { y?: number; rotate?: number; dur?: number; delay?: number } = {}) {
  const tl = gsap.timeline({ repeat: -1, yoyo: true, delay: opts.delay ?? 0 });
  tl.to(target, { y: -(opts.y ?? distance.idleFloat), rotate: opts.rotate ?? distance.idleRotate, duration: opts.dur ?? 2, ease: ease.idle });
  return tl;
}

/** SquiggleMotion — draw, then a small finite wiggle on the whole asset. */
export function squiggleFlow(root: Element | null, cycles = 2) {
  const tl = drawOn(root);
  if (!root) return tl;
  tl.to(root, { x: 4, rotate: 3, duration: 0.3, ease: ease.inOut, yoyo: true, repeat: cycles * 2 - 1 });
  return tl;
}
