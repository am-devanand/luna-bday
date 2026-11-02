import { useEffect, useRef, useCallback } from 'react';

interface CursorState {
  x: number;
  y: number;
  isHovering: boolean;
  label: string;
  isClicking: boolean;
}

export function useCustomCursor() {
  const stateRef = useRef<CursorState>({
    x: 0, y: 0, isHovering: false, label: '', isClicking: false,
  });
  const dotRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);

  const isTouchDevice = useCallback(() => {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }, []);

  useEffect(() => {
    if (isTouchDevice()) return;

    /* Create cursor elements */
    const dot = document.createElement('div');
    dot.className = 'custom-cursor-dot';
    dot.style.cssText = `
      position: fixed; width: 6px; height: 6px;
      background: var(--gold, #C8A46B); border-radius: 50%;
      pointer-events: none; z-index: 99999;
      transform: translate(-50%, -50%);
      transition: opacity 0.15s ease;
    `;
    document.body.appendChild(dot);
    dotRef.current = dot;

    const ring = document.createElement('div');
    ring.className = 'custom-cursor-ring';
    ring.style.cssText = `
      position: fixed; width: 24px; height: 24px;
      border: 1.5px solid #2E2A27; border-radius: 50%;
      pointer-events: none; z-index: 99998;
      transform: translate(-50%, -50%);
      transition: transform 0.15s ease, width 0.2s ease, height 0.2s ease,
                  border-color 0.2s ease, opacity 0.15s ease;
    `;
    document.body.appendChild(ring);
    ringRef.current = ring;

    const label = document.createElement('div');
    label.className = 'custom-cursor-label';
    label.style.cssText = `
      position: fixed; pointer-events: none; z-index: 99997;
      font-family: Inter, sans-serif; font-size: 10px;
      letter-spacing: 0.1em; text-transform: uppercase;
      color: var(--gold, #C8A46B);
      opacity: 0; transition: opacity 0.2s ease;
      transform: translate(8px, -8px);
    `;
    document.body.appendChild(label);

    /* Hide default cursor */
    document.body.style.cursor = 'none';

    /* Mouse move handler */
    const handleMouse = (e: MouseEvent) => {
      stateRef.current.x = e.clientX;
      stateRef.current.y = e.clientY;
      dot.style.left = `${e.clientX}px`;
      dot.style.top = `${e.clientY}px`;
      ring.style.left = `${e.clientX}px`;
      ring.style.top = `${e.clientY}px`;
      label.style.left = `${e.clientX}px`;
      label.style.top = `${e.clientY}px`;

      /* Check for interactive elements under cursor */
      const target = e.target as HTMLElement;
      const cursorLabel = target?.closest('[data-cursor-label]')?.getAttribute('data-cursor-label');
      const isInteractive = target?.matches('a, button, [data-cursor]') ||
        !!target?.closest('a, button, [data-cursor]');

      if (cursorLabel) {
        ring.style.width = '32px';
        ring.style.height = '32px';
        ring.style.borderColor = 'var(--gold, #C8A46B)';
        label.textContent = cursorLabel;
        label.style.opacity = '1';
      } else if (isInteractive) {
        ring.style.width = '32px';
        ring.style.height = '32px';
        ring.style.borderColor = 'var(--gold, #C8A46B)';
        label.style.opacity = '0';
      } else {
        ring.style.width = '24px';
        ring.style.height = '24px';
        ring.style.borderColor = '#2E2A27';
        label.style.opacity = '0';
      }
    };

    /* Click burst — 3 tiny gold specks */
    const handleClick = (e: MouseEvent) => {
      for (let i = 0; i < 3; i++) {
        const spec = document.createElement('div');
        const angle = (i / 3) * Math.PI * 2 + Math.random() * 0.5;
        const dist = 12 + Math.random() * 10;
        spec.style.cssText = `
          position: fixed; width: 2px; height: 2px;
          background: var(--gold, #C8A46B); border-radius: 50%;
          pointer-events: none; z-index: 99996;
          left: ${e.clientX}px; top: ${e.clientY}px;
          transition: all 0.4s ease-out; opacity: 1;
        `;
        document.body.appendChild(spec);
        requestAnimationFrame(() => {
          spec.style.transform = `translate(${Math.cos(angle) * dist}px, ${Math.sin(angle) * dist}px)`;
          spec.style.opacity = '0';
        });
        setTimeout(() => spec.remove(), 500);
      }
    };

    window.addEventListener('mousemove', handleMouse, { passive: true });
    window.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('mousemove', handleMouse);
      window.removeEventListener('click', handleClick);
      dot.remove();
      ring.remove();
      label.remove();
      document.body.style.cursor = '';
    };
  }, [isTouchDevice]);

  return null;
}
