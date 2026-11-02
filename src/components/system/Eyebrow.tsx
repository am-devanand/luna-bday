import type { ReactNode } from 'react';

interface EyebrowProps {
  children: ReactNode;
  className?: string;
  as?: 'p' | 'span' | 'div';
}

/** Small uppercase label. Never body copy — decorative context only. */
export default function Eyebrow({ children, className = '', as: Tag = 'p' }: EyebrowProps) {
  return <Tag className={`eyebrow ${className}`.trim()}>{children}</Tag>;
}
