'use client';

import { useRef } from 'react';
import { gsap, ScrollTrigger, useGSAP } from '@/motion/gsap';
import { distance, duration, ease, mq, stagger } from '@/motion/tokens';
import { drawOn } from '@/components/doodle/effects';

/**
 * Section-level storytelling wrapper.
 * - [data-reveal] children: batched stagger reveal (y + opacity) when entering viewport.
 * - [data-draw] doodles / [data-line] SVG connectors: stroke draw-on when entering viewport.
 * - [data-parallax="<px>"]: light parallax, desktop only.
 * Reduced motion: nothing hidden (CSS pre-state is gated by .motion-ok), no ScrollTriggers created.
 * All triggers are scoped and reverted on unmount (no leaks between routes).
 */
export function ScrollReveal({ children, className, id, as: Tag = 'section', ...rest }: React.HTMLAttributes<HTMLElement> & { as?: 'section' | 'div' }) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const root = ref.current;
      if (!root) return;
      const mm = gsap.matchMedia();
      mm.add(mq.motion, () => {
        const items = gsap.utils.toArray<HTMLElement>('[data-reveal]', root);
        gsap.set(items, { y: distance.revealY, opacity: 0 });
        ScrollTrigger.batch(items, {
          start: 'top 88%',
          once: true,
          onEnter: (batch) => gsap.to(batch, { y: 0, opacity: 1, duration: duration.cardReveal, ease: ease.out, stagger: stagger.card, overwrite: true }),
        });

        gsap.utils.toArray<HTMLElement>('[data-draw], [data-line]', root).forEach((el) => {
          gsap.set(el, { opacity: 0 });
          ScrollTrigger.create({ trigger: el, start: 'top 85%', once: true, onEnter: () => { drawOn(el, { dur: el.hasAttribute('data-line') ? 1.1 : duration.draw }); } });
        });
      });
      mm.add(mq.full, () => {
        gsap.utils.toArray<HTMLElement>('[data-parallax]', root).forEach((el) => {
          const px = Number(el.dataset.parallax) || 40;
          gsap.fromTo(el, { y: px }, { y: -px, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 0.6 } });
        });
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <Tag ref={ref as React.Ref<HTMLElement & HTMLDivElement>} className={className} id={id} {...rest}>
      {children}
    </Tag>
  );
}
