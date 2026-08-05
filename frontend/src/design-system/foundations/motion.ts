import type { Variants, Transition } from 'framer-motion';

/** Standard spring for user-initiated interactions. */
export const spring: Transition = { type: 'spring', stiffness: 520, damping: 34, mass: 0.7 };

/** Smooth easing for ambient / system motion. */
export const smooth: Transition = { duration: 0.22, ease: [0.05, 0.7, 0.1, 1] };

export const fadeRise: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: smooth },
  exit: { opacity: 0, y: 4, transition: { duration: 0.14, ease: [0.3, 0, 1, 1] } },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.97 },
  visible: { opacity: 1, scale: 1, transition: smooth },
  exit: { opacity: 0, scale: 0.98, transition: { duration: 0.14 } },
};

export const staggerParent: Variants = {
  visible: { transition: { staggerChildren: 0.025 } },
};
