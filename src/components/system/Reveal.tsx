import type { ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** Seconds. Keep ≤ 0.35 so content never feels withheld. */
  delay?: number;
  /** Travel distance in px. */
  y?: number;
  once?: boolean;
}

/**
 * The single scroll-reveal used by v2 chapters: opacity + short rise, played
 * once, disabled entirely under `prefers-reduced-motion`.
 */
export default function Reveal({ children, className, delay = 0, y = 24, once = true }: RevealProps) {
  const reduce = useReducedMotion();

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: '-80px' }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
