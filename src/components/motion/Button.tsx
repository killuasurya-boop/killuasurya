'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowRight, Loader2 } from 'lucide-react';
import { duration, distance, bezier } from '@/motion/tokens';
import styles from './motion.module.css';

type Variant = 'primary' | 'secondary' | 'tertiary';
type Common = {
  variant?: Variant;
  arrow?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  size?: 'md' | 'sm';
  children: React.ReactNode;
  className?: string;
};
type AsLink = Common & { href: string } & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'children'>;
type AsButton = Common & { href?: undefined } & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'>;

const MotionLink = motion.create(Link);

/** AnimatedPrimaryButton / AnimatedSecondaryButton — one component, semantic <a> or <button>. */
export function Button(props: AsLink | AsButton) {
  const { variant = 'primary', arrow, loading, icon, size = 'md', children, className, ...rest } = props;
  const reduce = useReducedMotion();
  const motionProps = reduce
    ? {}
    : {
        whileHover: { y: distance.buttonLift, transition: { duration: duration.hover, ease: bezier.out } },
        whileTap: { scale: 0.97, y: 0, transition: { duration: duration.tap } },
      };
  const cls = `${styles.btn} ${styles[variant]} ${size === 'sm' ? styles.sm : ''} ${className ?? ''}`;
  const content = (
    <>
      {loading ? <Loader2 className={styles.spin} size={18} aria-hidden="true" /> : icon}
      <span>{children}</span>
      {arrow && !loading && <ArrowRight className={styles.arrow} size={18} aria-hidden="true" />}
    </>
  );

  if ('href' in rest && rest.href !== undefined) {
    const { href, ...a } = rest as AsLink;
    return (
      <MotionLink href={href} className={cls} {...motionProps} {...(a as object)}>
        {content}
      </MotionLink>
    );
  }
  const b = rest as AsButton;
  return (
    <motion.button type={b.type ?? 'button'} className={cls} aria-busy={loading || undefined} disabled={b.disabled || loading} {...motionProps} {...(b as object)}>
      {content}
    </motion.button>
  );
}
