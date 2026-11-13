'use client';

import Image from 'next/image';
import { AnimIcon } from '@/components/icons/AnimIcon';
import { useRef } from 'react';
import { BarChart3, Cpu, Layers, MonitorSmartphone, Palette } from 'lucide-react';
import { gsap, ScrollTrigger, SplitText, useGSAP } from '@/motion/gsap';
import { distance, ease, mq, stagger } from '@/motion/tokens';
import { Doodle } from '@/components/doodle/Doodle';
import { drawOn, floatIdle, pop } from '@/components/doodle/effects';
import { Button, MagneticButton } from '@/components/motion';
import { capabilities, loginHref } from '@/content/site';
import { WhatsAppButton } from '@/components/layout/WhatsAppButton';
import s from './hero.module.css';

const capFx = { marketing: 'bounce', creative: 'wiggle', website: 'tilt', custom: 'bounce', ai: 'pulse' } as const;
const capIcons = { marketing: BarChart3, creative: Palette, website: MonitorSmartphone, custom: Layers, ai: Cpu } as const;

/**
 * Home hero — reproduces the anchor "Dual Foundation UI Kit Showcase" hero.
 * Character art: Owner's ORIGINAL high-res transparent PNG mascots (1600px, delivered 12 Nov 2026; poses 04/05):
 *   Dark  → hero-thumbs-up.png  (anchor dark hero pose)
 *   Light → hero-idea-thinking.png (anchor light hero pose)
 * The character is animated ONLY as a whole (translate / scale / tiny rotate). No face/limb animation:
 * the asset has no separate layers.
 */
export function Hero() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const q = gsap.utils.selector(el);
      const mm = gsap.matchMedia();

      mm.add(mq.motion, () => {
        let split: SplitText | null = null;
        const tl = gsap.timeline({ defaults: { ease: ease.out } });

        // 00 — foundation
        tl.fromTo(q('[data-h="bg"]'), { opacity: 0 }, { opacity: 1, duration: 0.3 }, 0);
        // 01 — organic purple shapes
        tl.fromTo(q('[data-h="blob"]'), { opacity: 0, scale: 0.9, x: (i) => (i % 2 ? 60 : -60) }, { opacity: 1, scale: 1, x: 0, duration: 0.6, stagger: 0.08 }, 0.15);
        // 02 — logo slot / nav (official logo, subtle reveal)
        tl.fromTo('[data-hero="nav"]', { opacity: 0, y: -12 }, { opacity: 1, y: 0, duration: 0.4 }, 0.3);
        // 03 — headline staggered word reveal
        const h1 = q('h1')[0];
        if (h1) {
          split = SplitText.create(h1, { type: 'words', mask: 'words', wordsClass: 'split-word' });
          gsap.set(h1, { opacity: 1 });
          tl.from(split.words, { yPercent: 110, duration: 0.55, stagger: stagger.word }, 0.5);
        }
        // 05 — character enters as a whole: CSS keyframe `heroCharIn` (hero.module.css) from first paint,
        //      so the LCP image is not gated on JS (it now lands just before the headline words).
        tl.fromTo(q('[data-h="bubble"]'), { opacity: 0, scale: 0.6, rotate: -18 }, { opacity: 1, scale: 1, rotate: -9, duration: 0.5, ease: ease.backOut }, 1.3);
        // 04 — lime underline: Owner's flat underline SVG (06_flat_lime_underline), stroke drawn left→right
        tl.add(drawOn(q('[data-h="underline"]')[0]), 1.2);
        // 06 — crown: in the anchor the hero crown/zigzag is part of the ORIGINAL mascot art,
        //      so it enters with the character (no duplicate SVG crown drawn on top).
        // 07 — accent dots pop (anchor ornaments)
        tl.add(pop(q('[data-h="pop"]')), 1.7);
        tl.fromTo(q('[data-h="sub"]'), { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.4 }, 1.4);
        // 08 — CTAs with spring-like ease
        tl.fromTo(q('[data-h="cta"]'), { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.5, ease: ease.backOut, stagger: 0.08 }, 2.1);
        tl.fromTo(q('[data-h="cap"]'), { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.35, stagger: 0.05 }, 2.2);

        // 09 — idle: whole-character float + tiny rotation, paused when hero is off-screen
        const idle = floatIdle(q('[data-h="char-idle"]'), { y: distance.idleFloat, rotate: 0.8, dur: 2.2 }).pause();
        const decoIdle = floatIdle(q('[data-h="pop"]'), { y: 4, rotate: 4, dur: 1.8 }).pause();
        // Start idle only if the hero is still on screen (the intro can finish after a fast scroll-away
        // on slow devices); otherwise onEnterBack starts it later.
        tl.call(() => { if (st.isActive && !document.hidden) { idle.play(); decoIdle.play(); } }, undefined, 2.6);
        const st = ScrollTrigger.create({
          trigger: el, start: 'top top', end: 'bottom top',
          onLeave: () => { idle.pause(); decoIdle.pause(); },
          onEnterBack: () => { if (tl.progress() === 1) { idle.play(); decoIdle.play(); } },
        });
        const onVis = () => (document.hidden ? (idle.pause(), decoIdle.pause()) : st.isActive && tl.progress() === 1 && (idle.play(), decoIdle.play()));
        document.addEventListener('visibilitychange', onVis);

        return () => { split?.revert(); document.removeEventListener('visibilitychange', onVis); };
      });

      // Section A — hero recedes with light parallax (desktop only, no pin, no scroll hijack)
      mm.add(mq.full, () => {
        gsap.to(q('[data-h="char-wrap"]'), { yPercent: 10, ease: 'none', scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: 0.6 } });
        gsap.to(q('[data-h="copy"]'), { yPercent: -6, opacity: 0.4, ease: 'none', scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: 0.6 } });
        gsap.to(q('[data-h="blob"]'), { y: (i) => (i % 2 ? -50 : 40), ease: 'none', scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: 0.8 } });
      });
      mm.add(mq.tablet, () => {
        gsap.to(q('[data-h="char-wrap"]'), { yPercent: 5, ease: 'none', scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: 0.6 } });
      });

      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} className={s.hero} aria-labelledby="hero-title">
      <div className={s.bg} data-h="bg" aria-hidden="true" />
      <div className={s.decor} aria-hidden="true">
        <Doodle name="doodle_organic_blob" size={260} className={`${s.blob} ${s.blobTL}`} data-h="blob" />
        <Doodle name="doodle_organic_blob" size={200} className={`${s.blob} ${s.blobBL}`} data-h="blob" />
        <span className={`${s.dot} ${s.dotA}`} data-h="blob" />
        <span className={`${s.dot} ${s.dotB}`} data-h="blob" />
        <span className={s.slab} data-h="blob" />
      </div>

      <div className={`container ${s.grid}`}>
        <div className={s.copy} data-h="copy">
          <h1 id="hero-title" className={`display ${s.title}`} data-hero="fade">
            <span className={s.line}>Grow Your Brand</span>{' '}
            <span className={s.line}>Connect Your Business</span>{' '}
            <span className={s.line}>
              Build Your{' '}
              <span className={s.future}>
                Future!
                <Doodle name="flat_lime_underline" size="100%" style={{ width: '108%', height: 'auto', aspectRatio: '1200 / 160' }} className={s.underlineSvg} data-h="underline" />
              </span>
            </span>
          </h1>
          <p className={s.sub} data-h="sub">
            Digital Growth Agency <span className={s.sep}>•</span> Creative Studio <span className={s.sep}>•</span>
            <br />
            Business Technology Platform
          </p>
          {/* Plain-language value line (not on the anchor board): who it is for + what they get. */}
          <p className={s.plain} data-h="sub">
            Kami bantu UMKM dan bisnis lokal <strong>lebih mudah ditemukan</strong>, punya <strong>konten yang rutin</strong>, dan <strong>operasional yang rapi</strong> — dikerjakan satu tim.
          </p>
          <div className={s.ctas}>
            <span data-h="cta" className={s.ctaMain}><MagneticButton><WhatsAppButton /></MagneticButton></span>
            <span data-h="cta"><Button href="/services" variant="secondary" arrow>Lihat Layanan</Button></span>
          </div>
          <a href={loginHref} className={s.workspace} data-h="sub">Sudah jadi klien atau tim? <strong>Masuk Workspace</strong></a>
          <ul className={s.caps} aria-label="Lima kapabilitas utama">
            {capabilities.map((c) => {
              const Icon = capIcons[c.key];
              return (
                <li key={c.key} className={s.cap} data-h="cap" data-ai-host>
                  <span className={s.capIcon} style={{ color: c.color }}><AnimIcon icon={Icon} size={20} fx={capFx[c.key]} /></span>
                  <span>{c.label[0]}<br />{c.label[1]}</span>
                </li>
              );
            })}
          </ul>
        </div>

        <div className={s.stage} data-h="char-wrap">
          <div className={s.bubble} data-h="bubble" aria-hidden="true">
            <span className={`display ${s.bubbleDark}`}>Let&apos;s Build<br />Something<br />Awesome!</span>
            <span className={`display ${s.bubbleLight}`}>Ideas<br />Design<br />Build<br />Grow!</span>
          </div>
          <span className={`${s.dot} ${s.dotC}`} data-h="pop" aria-hidden="true" />
          <span className={`${s.dot} ${s.dotD}`} data-h="pop" aria-hidden="true" />
          <div className={s.char} data-h="char">
            <div data-h="char-idle" className={s.charIdle}>
              <Image src="/assets/killuasurya/mascot/hero-thumbs-up.png" alt="Maskot KILLUASURYA mengacungkan jempol di depan laptop" width={1600} height={1257} priority fetchPriority="high" className={s.mascotDark} sizes="(max-width: 767px) 88vw, 600px" />
              <Image src="/assets/killuasurya/mascot/hero-idea-thinking.png" alt="Maskot KILLUASURYA berpikir dengan ide lampu di depan laptop" width={1600} height={1280} className={s.mascotLight} sizes="(max-width: 767px) 88vw, 600px" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
