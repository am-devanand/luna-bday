import { useCallback, useId, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import './ModalSheet.css';

interface ModalSheetProps {
  open: boolean;
  onClose: () => void;
  /** Visible heading; the sheet wires `aria-labelledby` for you. */
  title: string;
  /** Hide the built-in title row when the content supplies its own header. */
  hideTitle?: boolean;
  tone?: 'paper' | 'night';
  className?: string;
  children: ReactNode;
}

/**
 * Focus-trapped sheet used for gifts, bottles and full-screen photographs.
 * Renders in a portal, closes on Escape / backdrop, restores focus and scroll.
 */
export default function ModalSheet({
  open,
  onClose,
  title,
  hideTitle = false,
  tone = 'paper',
  className = '',
  children,
}: ModalSheetProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const reduce = useReducedMotion();

  const close = useCallback(() => onClose(), [onClose]);
  useFocusTrap(panelRef, open, close);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="modal-sheet"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0 : 0.24, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="modal-sheet__backdrop" aria-hidden="true" />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={hideTitle ? undefined : titleId}
            aria-label={hideTitle ? title : undefined}
            className={['modal-sheet__panel', `modal-sheet__panel--${tone}`, className]
              .filter(Boolean)
              .join(' ')}
            initial={reduce ? false : { opacity: 0, y: 28, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 18, scale: 0.99 }}
            transition={{ duration: reduce ? 0 : 0.34, ease: [0.22, 1, 0.36, 1] }}
          >
            <button type="button" className="modal-sheet__close" onClick={close} aria-label="Close">
              <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true" focusable="false">
                <path
                  d="M4 4l12 12M16 4L4 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                />
              </svg>
            </button>

            {!hideTitle && <h2 className="modal-sheet__title" id={titleId}>{title}</h2>}
            <div className="modal-sheet__body">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
