import type { HTMLAttributes, ReactNode } from 'react';
import './GlassCard.css';

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  /** `paper` = warm opaque sheet; `glass` = translucent overlay. */
  material?: 'paper' | 'glass';
  /** Adds a 1px champagne rule along the top edge. */
  gilt?: boolean;
}

/**
 * One material per object: glass belongs to overlays and controls, paper to
 * readable content. Do not nest the two.
 */
export default function GlassCard({
  children,
  material = 'paper',
  gilt = false,
  className = '',
  ...rest
}: GlassCardProps) {
  return (
    <div
      className={['glass-card', `glass-card--${material}`, gilt ? 'glass-card--gilt' : '', className]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {children}
    </div>
  );
}
