import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, useInView, type Variants } from 'framer-motion';
import ConfettiBurst from './magic/ConfettiBurst';
import './Guestbook.css';

/* ── Config ── */
/* Formspree endpoint is env-configurable: set VITE_FORMSPREE_ENDPOINT in your
.env / build env (e.g. VITE_FORMSPREE_ENDPOINT=https://formspree.io/f/xxxx).
   It is read at submit time. DEMO MODE: when unset, submit is faked locally —
   the wish is sealed to the on-device wall with confetti, no network call. */
const NAME_MIN_LENGTH = 2;
const MESSAGE_MIN_LENGTH = 3;
const MESSAGE_MAX_LENGTH = 500;

type FormStatus = 'idle' | 'submitting' | 'success' | 'error';
type FieldName = 'name' | 'message';
type FieldErrors = Record<FieldName, string | null>;
type FieldTouched = Record<FieldName, boolean>;

type Wish = { name: string; message: string; ts: number; localOnly: boolean };

const WISH_STORAGE_KEY = 'luna-wishes-v1';
const WALL_MAX_ENTRIES = 50;

/* One wish is already here, from the person who built the site. */
const DEFAULT_WISHES: Wish[] = [
  {
    name: 'Dev',
    message:
      'Happy nineteenth, Luna. I hope this little corner of the internet reminds you how loved you are — today, and on every ordinary day after.',
    ts: new Date('2026-11-06T09:00:00').getTime(),
    localOnly: false,
  },
];

/* Load persisted wishes — try/catch with the default wish as a fallback */
const loadWishes = (): Wish[] => {
  try {
    const raw = localStorage.getItem(WISH_STORAGE_KEY);
    if (!raw) return DEFAULT_WISHES;
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? (parsed as Wish[]) : DEFAULT_WISHES;
  } catch {
    return DEFAULT_WISHES;
  }
};

/* ── Validation (pure, module scope) ── */
const validateName = (value: string): string | null => {
  const trimmed = value.trim();
  if (trimmed.length === 0) return 'Please tell us your name.';
  if (trimmed.length < NAME_MIN_LENGTH) return 'Your name needs at least 2 characters.';
  return null;
};

const validateMessage = (value: string): string | null => {
  const trimmed = value.trim();
  if (trimmed.length === 0) return 'Please write a little wish.';
  if (trimmed.length < MESSAGE_MIN_LENGTH) return 'Your wish needs at least 3 characters.';
  if (trimmed.length > MESSAGE_MAX_LENGTH) return `Keep your wish under ${MESSAGE_MAX_LENGTH} characters.`;
  return null;
};

const validateField = (field: FieldName, value: string): string | null =>
  field === 'name' ? validateName(value) : validateMessage(value);

/* ── Field state helpers (pure, module scope) ── */
const isFocused = (id: string, focusedField: string | null) => focusedField === id;
const isFilled = (val: string) => val.length > 0;
const fieldClass = (id: string, val: string, focusedField: string | null) =>
  `guestbook__field${isFocused(id, focusedField) ? ' guestbook__field--focused' : ''}${isFilled(val) ? ' guestbook__field--filled' : ''}`;

/* ── Entrance variants ────────────────────────────────── */
const cardVariants: Variants = {
  hidden: { opacity: 0, y: 40, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

const fieldVariants = (i: number): Variants => ({
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: 0.2 + i * 0.1 },
  },
});

const submitVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: 0.45 },
  },
};

/* ── Wax Seal — XIX stamp mark ── */
function WaxSeal() {
  return (
    <span className="guestbook__seal-text" aria-hidden="true">XIX</span>
  );
}

export default function Guestbook() {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<FormStatus>('idle');
  const [confettiKey, setConfettiKey] = useState(0);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({ name: null, message: null });
  const [touched, setTouched] = useState<FieldTouched>({ name: false, message: false });
  const [wishes, setWishes] = useState<Wish[]>(() => loadWishes());

  /* Persist every sealed wish locally — wall addition, never replaces endpoint POST */
  const persistWish = useCallback((wish: Wish) => {
    setWishes(prev => {
      const next = [wish, ...prev];
      try {
        localStorage.setItem(WISH_STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* storage unavailable — wall still shows the entry for this session */
      }
      return next;
    });
  }, []);
  const [ripples, setRipples] = useState<{ x: number; y: number; key: number }[]>([]);
  const sectionRef = useRef<HTMLElement>(null);
  const submitRef = useRef<HTMLButtonElement>(null);
  const rippleTimers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const submittingRef = useRef(false);
  const isInView = useInView(sectionRef, { once: true, margin: '-60px' });

  /* ── Submit ripple ── */
  const handleRipple = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    const btn = submitRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const key = Date.now();
    setRipples(prev => [...prev, { x, y, key }]);
    const timer = setTimeout(() => setRipples(prev => prev.filter(r => r.key !== key)), 600);
    rippleTimers.current.push(timer);
  }, []);

  /* ── Cleanup ripple timers on unmount ── */
  useEffect(() => {
    const timers = rippleTimers.current;
    return () => timers.forEach(clearTimeout);
  }, []);

  /* ── Field change / blur: validate touched fields live ── */
  const handleFieldChange = (field: FieldName) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = e.target.value;
      if (field === 'name') setName(value);
      else setMessage(value);
      if (touched[field]) {
        setFieldErrors(prev => ({ ...prev, [field]: validateField(field, value) }));
      }
    };

  const handleFieldBlur = (field: FieldName) => () => {
    setFocusedField(null);
    setTouched(prev => ({ ...prev, [field]: true }));
    const value = field === 'name' ? name : message;
    setFieldErrors(prev => ({ ...prev, [field]: validateField(field, value) }));
  };

  /* ── Submit handler — guarded against double submission ── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submittingRef.current) return;

    const nameError = validateName(name);
    const messageError = validateMessage(message);
    setTouched({ name: true, message: true });
    setFieldErrors({ name: nameError, message: messageError });
    if (nameError || messageError) return;

    submittingRef.current = true;
    setStatus('submitting');

    const trimmedName = name.trim();
    const trimmedMessage = message.trim();

    try {
      const endpoint = import.meta.env.VITE_FORMSPREE_ENDPOINT as string | undefined;
      if (!endpoint) {
        /* Demo mode: no endpoint — fake a sealed wish locally. */
        await new Promise((resolve) => setTimeout(resolve, 900));
        persistWish({ name: trimmedName, message: trimmedMessage, ts: Date.now(), localOnly: true });
        setConfettiKey((prev) => prev + 1);
        setStatus('success');
        return;
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmedName, message: trimmedMessage }),
      });

      if (res.ok) {
        persistWish({ name: trimmedName, message: trimmedMessage, ts: Date.now(), localOnly: false });
        setConfettiKey(prev => prev + 1);
        setStatus('success');
      } else {
        persistWish({ name: trimmedName, message: trimmedMessage, ts: Date.now(), localOnly: true });
        setStatus('error');
      }
    } catch {
      persistWish({ name: trimmedName, message: trimmedMessage, ts: Date.now(), localOnly: true });
      setStatus('error');
    } finally {
      submittingRef.current = false;
    }
  };

  /* ── Reset form (after success — "Send another") ── */
  const handleReset = () => {
    submittingRef.current = false;
    setName('');
    setMessage('');
    setFieldErrors({ name: null, message: null });
    setTouched({ name: false, message: false });
    setStatus('idle');
  };

  /* ── Retry (after error — back to form, keep input) ── */
  const handleRetry = () => {
    submittingRef.current = false;
    setStatus('idle');
  };

  return (
    <section
      ref={sectionRef}
      className="guestbook"
      aria-label="Leave a birthday wish for Luna"
    >
      <motion.div
        className="guestbook__inner"
        variants={cardVariants}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
      >
        {/* Wax seal ornament */}
        <div className="guestbook__seal">
          <motion.div
            className="guestbook__seal-icon"
            initial={{ scale: 0, rotate: -30 }}
            animate={isInView ? { scale: 1, rotate: 0 } : {}}
            transition={{ type: 'spring' as const, stiffness: 200, damping: 12, delay: 0.15 }}
          >
            <WaxSeal />
          </motion.div>
        </div>

        <h2 className="guestbook__heading">Leave a Wish</h2>
        <p className="guestbook__subtitle">Write something for Luna</p>

        {/* Decorative divider */}
        <div className="guestbook__divider" aria-hidden="true">
          <span className="guestbook__divider-line" />
          <span className="guestbook__divider-dot" />
          <span className="guestbook__divider-line" />
        </div>

        {/* ── Success State ── */}
        {status === 'success' && (
          <div className="guestbook__success" role="status">
            {confettiKey > 0 && <ConfettiBurst key={confettiKey} level="small" />}
            <svg
              className="guestbook__checkmark"
              width="56"
              height="56"
              viewBox="0 0 56 56"
              fill="none"
              aria-hidden="true"
            >
              <circle cx="28" cy="28" r="26" stroke="currentColor" strokeWidth="2.5" />
              <path
                d="M18 28l7 7 13-13"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p className="guestbook__success-text">
              Your wish has been sealed. She will love it.
            </p>
            <button
              type="button"
              className="guestbook__reset-btn"
              onClick={handleReset}
            >
              Send another
            </button>
          </div>
        )}

        {/* ── Error State ── */}
        {status === 'error' && (
          <div className="guestbook__error" role="alert">
            <p className="guestbook__error-text">
              Couldn&apos;t send your wish. Check your connection and try again.
            </p>
            <button
              type="button"
              className="guestbook__reset-btn"
              onClick={handleRetry}
            >
              Try again
            </button>
          </div>
        )}

        {/* ── Form ── */}
        {(status === 'idle' || status === 'submitting') && (
          <form className="guestbook__form" onSubmit={handleSubmit} noValidate>
            {/* Name field */}
            <motion.div
              className={fieldClass('guestbook-name', name, focusedField)}
              variants={fieldVariants(0)}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
            >
              <label htmlFor="guestbook-name" className="guestbook__label">
                Your name
              </label>
              <div className="guestbook__input-wrap">
                <input
                  id="guestbook-name"
                  className="guestbook__input"
                  type="text"
                  name="name"
                  placeholder="..."
                  value={name}
                  onChange={handleFieldChange('name')}
                  onFocus={() => setFocusedField('guestbook-name')}
                  onBlur={handleFieldBlur('name')}
                  required
                  disabled={status === 'submitting'}
                  autoComplete="name"
                  aria-invalid={touched.name && !!fieldErrors.name}
                  aria-describedby={
                    touched.name && fieldErrors.name ? 'guestbook-name-error' : undefined
                  }
                />
              </div>
              {touched.name && fieldErrors.name && (
                <p id="guestbook-name-error" className="guestbook__field-error" role="alert">
                  {fieldErrors.name}
                </p>
              )}
            </motion.div>

            {/* Message field */}
            <motion.div
              className={fieldClass('guestbook-message', message, focusedField)}
              variants={fieldVariants(1)}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
            >
              <label htmlFor="guestbook-message" className="guestbook__label">
                Your birthday wish
              </label>
              <div className="guestbook__input-wrap">
                <textarea
                  id="guestbook-message"
                  className="guestbook__textarea"
                  name="message"
                  placeholder="Write your wish here..."
                  value={message}
                  onChange={handleFieldChange('message')}
                  onFocus={() => setFocusedField('guestbook-message')}
                  onBlur={handleFieldBlur('message')}
                  required
                  disabled={status === 'submitting'}
                  rows={5}
                  maxLength={MESSAGE_MAX_LENGTH}
                  aria-invalid={touched.message && !!fieldErrors.message}
                  aria-describedby={
                    touched.message && fieldErrors.message ? 'guestbook-message-error' : undefined
                  }
                />
              </div>
              {touched.message && fieldErrors.message && (
                <p id="guestbook-message-error" className="guestbook__field-error" role="alert">
                  {fieldErrors.message}
                </p>
              )}
            </motion.div>

            {/* Decorative divider before submit */}
            <div className="guestbook__form-divider" aria-hidden="true">
              <span className="guestbook__form-divider-line" />
            </div>

            {/* Submit button — stamped letter style */}
            <motion.div
              variants={submitVariants}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
            >
              <button
                ref={submitRef}
                type="submit"
                className="guestbook__submit"
                disabled={status === 'submitting'}
                aria-busy={status === 'submitting'}
                onClick={handleRipple}
              >
                {/* Ripple effects */}
                {ripples.map(r => (
                  <span
                    key={r.key}
                    className="guestbook__submit-ripple"
                    style={{ left: r.x, top: r.y, width: 20, height: 20 }}
                  />
                ))}
                {status === 'submitting' ? (
                  <span className="guestbook__submit-loading">
                    <span className="guestbook__spinner" aria-hidden="true" />
                    Sealing...
                  </span>
                ) : (
                  'Seal & Send'
                )}
              </button>
            </motion.div>
          </form>
        )}
      </motion.div>

      {/* Local wish wall — every sealed wish kept on this device */}
      <motion.div
        className="guestbook__wall"
        variants={cardVariants}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
      >
        <h3 className="guestbook__wall-heading">Wish Wall</h3>
        <p className="guestbook__wall-subtitle">Kept wishes, newest first</p>
        {wishes.length === 0 ? (
          <p className="guestbook__wall-empty">No wishes yet — seal the first one ↑</p>
        ) : (
          <>
            <ul className="guestbook__wall-list">
              {[...wishes]
                .sort((a, b) => b.ts - a.ts)
                .slice(0, WALL_MAX_ENTRIES)
                .map(wish => (
                  <li key={`${wish.ts}-${wish.name}`} className="guestbook__wall-item">
                    <p className="guestbook__wall-name">{wish.name}</p>
                    <p className="guestbook__wall-message">{wish.message}</p>
                    <p className="guestbook__wall-meta">
                      <span className="guestbook__wall-date">
                        {new Date(wish.ts).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                      {wish.localOnly && (
                        <span className="guestbook__wall-tag">kept on this device ✓</span>
                      )}
                    </p>
                  </li>
                ))}
            </ul>
            {wishes.length > WALL_MAX_ENTRIES && (
              <p className="guestbook__wall-note">showing latest 50</p>
            )}
          </>
        )}
      </motion.div>
    </section>
  );
}
