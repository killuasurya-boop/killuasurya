'use client';

import { forwardRef } from 'react';
import { doodles, type DoodleName } from '@/assets/doodles.generated';

type Props = {
  name: DoodleName;
  size: number | string;
  className?: string;
  style?: React.CSSProperties;
  /** Marks the doodle for draw-on (stroke) animation by a parent timeline. */
  draw?: boolean;
} & Omit<React.HTMLAttributes<HTMLSpanElement>, 'children'>;

/**
 * Renders an ORIGINAL Owner SVG doodle inline (markup copied verbatim by scripts/sync-assets.mjs)
 * so its own paths can be animated. Purely decorative: hidden from assistive tech.
 */
export const Doodle = forwardRef<HTMLSpanElement, Props>(function Doodle({ name, size, className, style, draw, ...rest }, ref) {
  return (
    <span
      ref={ref}
      aria-hidden="true"
      className={`doodle ${className ?? ''}`}
      data-doodle={name}
      data-draw={draw ? '' : undefined}
      style={{ width: size, height: size, ...style }}
      dangerouslySetInnerHTML={{ __html: doodles[name] }}
      {...rest}
    />
  );
});
