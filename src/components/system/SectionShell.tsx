import type { ElementType, HTMLAttributes, ReactNode } from 'react';
import './SectionShell.css';

export type SectionTone = 'ivory' | 'blush' | 'champagne' | 'ink' | 'none';
export type SectionWidth = 'prose' | 'editorial' | 'gallery' | 'full';

interface SectionShellProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
  /** Accessible name — renders the section as a landmark region. */
  label?: string;
  as?: ElementType;
  tone?: SectionTone;
  width?: SectionWidth;
  /** Remove vertical padding (for full-bleed cinematic chapters). */
  flush?: boolean;
  children: ReactNode;
}

/**
 * Shared section frame for the v2 chapters. It owns the vertical rhythm,
 * gutter and content width so new sections feel like chapters of one book
 * rather than a stack of pages.
 */
export default function SectionShell({
  label,
  as: Tag = 'section',
  tone = 'none',
  width = 'editorial',
  flush = false,
  className = '',
  children,
  ...rest
}: SectionShellProps) {
  const classes = [
    'section-shell',
    `section-shell--${width}`,
    flush ? 'section-shell--flush' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Tag className={classes} data-tone={tone} aria-label={label} {...rest}>
      <div className="section-shell__inner">{children}</div>
    </Tag>
  );
}
