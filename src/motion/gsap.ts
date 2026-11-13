'use client';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { useGSAP } from '@gsap/react';

let registered = false;
if (typeof window !== 'undefined' && !registered) {
  gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);
  registered = true;
}

/** Prepare every <path>/<line>/<polyline>/<circle> in an SVG for a stroke draw-on. Returns the elements. */
export function prepareDraw(root: Element | null): SVGGeometryElement[] {
  if (!root) return [];
  const els = Array.from(root.querySelectorAll<SVGGeometryElement>('path, line, polyline, circle, ellipse, rect')).filter(
    (el) => el.getAttribute('stroke') && el.getAttribute('stroke') !== 'none',
  );
  els.forEach((el) => {
    const len = typeof el.getTotalLength === 'function' ? el.getTotalLength() : 0;
    if (!len) return;
    el.style.strokeDasharray = `${len}`;
    el.style.strokeDashoffset = `${len}`;
  });
  return els;
}

export { gsap, ScrollTrigger, SplitText, useGSAP };
