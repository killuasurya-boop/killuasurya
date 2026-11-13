/** Motion tokens — single source for GSAP and Motion for React. Seconds (GSAP/Motion units). */
export const duration = {
  tap: 0.12,
  hover: 0.18,
  toggle: 0.22,
  modal: 0.28,
  cardReveal: 0.42,
  sectionReveal: 0.6,
  draw: 0.6,
} as const;

export const stagger = { os: 0.04, card: 0.06, doodle: 0.08, word: 0.06 } as const;

export const ease = {
  out: 'power3.out',
  inOut: 'power2.inOut',
  draw: 'power2.inOut',
  idle: 'sine.inOut',
  backOut: 'back.out(1.6)',
} as const;

/** Bezier equivalents for Motion for React / CSS. */
export const bezier = {
  out: [0.22, 1, 0.36, 1] as const,
  inOut: [0.65, 0, 0.35, 1] as const,
};

export const spring = { type: 'spring', stiffness: 420, damping: 30, mass: 0.8 } as const;

export const distance = {
  buttonLift: -2,
  cardLift: -4,
  revealY: 24,
  heroCharacterY: 40,
  idleFloat: 6,
  idleRotate: 1.5,
  tiltMax: 6,
} as const;

/** Breakpoint media queries used by gsap.matchMedia for responsive motion profiles. */
export const mq = {
  full: '(min-width: 1024px) and (prefers-reduced-motion: no-preference)',
  tablet: '(min-width: 768px) and (max-width: 1023px) and (prefers-reduced-motion: no-preference)',
  mobile: '(max-width: 767px) and (prefers-reduced-motion: no-preference)',
  motion: '(prefers-reduced-motion: no-preference)',
  reduced: '(prefers-reduced-motion: reduce)',
} as const;

/**
 * In-view options for one-shot reveals. The huge TOP root margin makes anything the user has already
 * scrolled PAST count as "in view", so a jump (anchor link, End key, scroll before hydration) can never
 * leave content stuck in its hidden pre-state above the viewport.
 */
export const inViewOnce = { once: true, margin: '100000px 0px -40px 0px' } as const;
