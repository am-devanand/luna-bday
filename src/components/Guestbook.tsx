import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import './Guestbook.css';

/* ─── Data ────────────────────────────────────────────────── */

type Wish = { name: string; message: string; ts: number };

/* Four wishes, written for Swethaaa and kept here for good. */
const WISHES: Wish[] = [
  {
    name: 'Dev',
    message:
      'Happy nineteenth, Swethaaa. I hope this little corner of the internet reminds you how loved you are — today, and on every ordinary day after.',
    ts: new Date('2026-11-06T09:00:00').getTime(),
  },
  {
    name: 'Dev',
    message:
      'To your health — may you always have a strong body, a calm heart and a long, full life ahead of you.',
    ts: new Date('2026-11-06T09:01:00').getTime(),
  },
  {
    name: 'Dev',
    message:
      'To your studies and your future — may every door you knock on open, and every dream you chase find its way back to you.',
    ts: new Date('2026-11-06T09:02:00').getTime(),
  },
  {
    name: 'Dev',
    message:
      'To God — may He answer every wish you have ever whispered, and surprise you with the ones you never said out loud.',
    ts: new Date('2026-11-06T09:03:00').getTime(),
  },
];

const formatDate = (ts: number) =>
  new Date(ts).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

/* ─── Entrance variants ────────────────────────────────── */
const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const listVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.2 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
  },
};

/* ── Wax Seal — XIX stamp mark ── */
function WaxSeal() {
  return (
    <span className="guestbook__seal-text" aria-hidden="true">XIX</span>
  );
}

export default function Guestbook() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-60px' });

  return (
    <section
      ref={sectionRef}
      className="guestbook"
      aria-label="Wish wall for Swethaaa"
    >
      <motion.div
        className="guestbook__wall"
        variants={cardVariants}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
      >
        <div className="guestbook__seal">
          <motion.div
            className="guestbook__seal-icon"
            initial={{ scale: 0, rotate: -30 }}
            animate={isInView ? { scale: 1, rotate: 0 } : {}}
            transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.15 }}
          >
            <WaxSeal />
          </motion.div>
        </div>

        <h2 className="guestbook__heading">Wish Wall</h2>
        <p className="guestbook__subtitle">Four wishes, kept for Swethaaa</p>

        <div className="guestbook__divider" aria-hidden="true">
          <span className="guestbook__divider-line" />
          <span className="guestbook__divider-dot" />
          <span className="guestbook__divider-line" />
        </div>

        <motion.ul
          className="guestbook__wall-list"
          variants={listVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          {WISHES.map((wish) => (
            <motion.li
              key={`${wish.ts}-${wish.name}`}
              className="guestbook__wall-item"
              variants={itemVariants}
            >
              <div className="guestbook__wall-head">
                <p className="guestbook__wall-name">{wish.name}</p>
                <span className="guestbook__wall-date">{formatDate(wish.ts)}</span>
              </div>
              <p className="guestbook__wall-message">{wish.message}</p>
            </motion.li>
          ))}
        </motion.ul>
      </motion.div>
    </section>
  );
}
