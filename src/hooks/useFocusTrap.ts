import { useEffect, type RefObject } from 'react';

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'textarea:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

function focusableWithin(node: HTMLElement): HTMLElement[] {
  return Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter((el) => {
    if (el.hasAttribute('hidden') || el.getAttribute('aria-hidden') === 'true') return false;
    return el.getClientRects().length > 0;
  });
}

/**
 * Trap focus inside an overlay, close on Escape, and restore focus + scroll on
 * exit. Pass a stable `onClose` (useCallback) to avoid re-running the effect.
 */
export function useFocusTrap(
  ref: RefObject<HTMLElement | null>,
  active: boolean,
  onClose: () => void,
): void {
  useEffect(() => {
    if (!active) return;
    const node = ref.current;
    if (!node) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const hadTabIndex = node.hasAttribute('tabindex');
    if (!hadTabIndex) node.setAttribute('tabindex', '-1');

    const focusFirst = () => {
      const [first] = focusableWithin(node);
      (first ?? node).focus({ preventScroll: true });
    };
    const raf = requestAnimationFrame(focusFirst);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== 'Tab') return;

      const items = focusableWithin(node);
      if (items.length === 0) {
        event.preventDefault();
        node.focus({ preventScroll: true });
        return;
      }

      const current = document.activeElement as HTMLElement | null;
      const index = current ? items.indexOf(current) : -1;

      if (event.shiftKey && index <= 0) {
        event.preventDefault();
        items[items.length - 1].focus({ preventScroll: true });
      } else if (!event.shiftKey && index === items.length - 1) {
        event.preventDefault();
        items[0].focus({ preventScroll: true });
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKeyDown);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      if (!hadTabIndex) node.removeAttribute('tabindex');
      previouslyFocused?.focus?.({ preventScroll: true });
    };
  }, [active, onClose, ref]);
}
