'use client';

import Image from 'next/image';
import { useRef } from 'react';
import { gsap, SplitText, useGSAP } from '@/motion/gsap';
import { distance, ease, mq, stagger } from '@/motion/tokens';
import { Doodle } from '@/components/doodle/Doodle';
import { drawOn, floatIdle } from '@/components/doodle/effects';
import s from './page.module.css';

type Props = {
  kicker?: string;
  title: string;
  highlight?: string;
  body?: React.ReactNode;
  /** Right-hand content (feature cards, mascot, etc.). */
  aside?: React.ReactNode;
  /** Show the Owner's original mascot pair (Dark: thumbs-up, Light: idea). */
  mascot?: boolean;
  children?: React.ReactNode;
};

/**
 * Sub-page hero — follows the reference sub-page headers (e.g. "Login ke Ekosistem KILLUASURYA.TECH",
 * "Ecosystem / Batch Overview"): marker headline, lime underline under the highlight, crown doodle, description.
 */
export function PageHero({ kicker, title, highlight, body, aside, mascot, children }: Props) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const q = gsap.utils.selector(el);
      const mm = gsap.matchMedia();
      mm.add(mq.motion, () => {
        const h1 = q('h1')[0];
        const split = h1 ? SplitText.create(h1, { type: 'words', mask: 'words', wordsClass: 'split-word' }) : null;
        const tl = gsap.timeline({ defaults: { ease: ease.out } });
        if (h1) { gsap.set(h1, { opacity: 1 }); tl.from(split!.words, { yPercent: 110, duration: 0.5, stagger: stagger.word }, 0.1); }
        tl.add(drawOn(q('[data-ph="underline"]')[0]), 0.55);
        tl.add(drawOn(q('[data-ph="crown"]')[0], { each: 0.08 }), 0.7);
        tl.fromTo(q('[data-ph="fade"]'), { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.45, stagger: 0.06 }, 0.5);
        tl.fromTo(q('[data-ph="aside"] > *'), { opacity: 0, y: distance.revealY }, { opacity: 1, y: 0, duration: 0.45, stagger: stagger.card }, 0.6);
        const idle = q('[data-ph="mascot"]').length ? floatIdle(q('[data-ph="mascot"]'), { y: 5, rotate: 0.6, dur: 2.2, delay: 1.2 }) : null;
        return () => { split?.revert(); idle?.kill(); };
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} className={s.hero}>
      <Doodle name="doodle_organic_blob" size={190} className={s.heroBlob} />
      <div className={`container ${s.heroGrid} ${aside || mascot ? '' : s.heroSingle}`}>
        <div className={s.heroCopy}>
          {kicker && <p className={s.kicker} data-ph="fade">{kicker}</p>}
          <div className={s.titleWrap}>
            <Doodle name="doodle_crown" size={64} className={s.heroCrown} data-ph="crown" />
            <h1 className={`display ${s.h1}`} data-hero="fade">
              {title}{' '}
              {highlight && (
                <span className={s.hl}>
                  {highlight}
                  <Doodle name="flat_lime_underline" size="100%" style={{ width: '104%', height: 'auto', aspectRatio: '1200 / 160' }} className={s.hlLine} data-ph="underline" />
                </span>
              )}
            </h1>
          </div>
          {body && <div className={s.lead} data-ph="fade">{body}</div>}
          {children && <div data-ph="fade">{children}</div>}
        </div>
        {(aside || mascot) && (
          <div className={s.heroAside} data-ph="aside">
            {aside}
            {mascot && (
              <div className={s.mascot} data-ph="mascot">
                <Image src="/assets/killuasurya/mascot/hero-thumbs-up.png" alt="" width={1600} height={1257} className={s.mascotDark} sizes="(max-width: 767px) 80vw, 420px" priority />
                <Image src="/assets/killuasurya/mascot/hero-idea-thinking.png" alt="" width={1600} height={1280} className={s.mascotLight} sizes="(max-width: 767px) 80vw, 420px" />
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
