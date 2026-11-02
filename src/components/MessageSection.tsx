import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import './MessageSection.css';

export default function MessageSection() {
  const [phase, setPhase] = useState<'envelope' | 'opening' | 'letter'>('envelope');
  const [sealBreaking, setSealBreaking] = useState(false);
  const [sealRing, setSealRing] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-60px' });

  const handleOpen = useCallback(() => {
    if (phase !== 'envelope') return;
    setPhase('opening');
    setSealBreaking(true);
    setSealRing(true);
    /* Slower transition — seal breaks, then flap opens, then letter slides up */
    setTimeout(() => {
      setPhase('letter');
    }, 1600);
  }, [phase]);

  /* ── Envelope landing — desk drop ── */
  const envelopeLanding = {
    hidden: { opacity: 0, y: -60, rotate: -1 },
    visible: {
      opacity: 1,
      y: 0,
      rotate: 0,
      transition: {
        type: 'spring' as const,
        stiffness: 80,
        damping: 10,
        mass: 1.2,
        delay: 0.1,
      },
    },
  };

  return (
    <article className="message-section" ref={sectionRef} aria-label="Birthday message">
      <div className="message-section__inner">
        <AnimatePresence mode="wait">
          {phase !== 'letter' ? (
            <motion.div
              key="envelope"
              className={`message-envelope ${phase === 'opening' ? 'message-envelope--open' : ''}`}
              variants={envelopeLanding}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="message-envelope__body">
                <div className="message-envelope__fold-line message-envelope__fold-line--left" aria-hidden="true" />
                <div className="message-envelope__fold-line message-envelope__fold-line--right" aria-hidden="true" />
                <div className="message-envelope__interior" aria-hidden="true" />

                <div className="message-envelope__flap-wrapper" aria-hidden="true">
                  <div className="message-envelope__flap" />
                  <div className="message-envelope__flap-inner" />
                </div>

                <button
                  type="button"
                  className={`message-envelope__seal ${sealBreaking ? 'message-envelope__seal--breaking' : ''}`}
                  onClick={handleOpen}
                  aria-label="Open envelope"
                  data-cursor-label="OPEN"
                >
                  <span className="message-envelope__seal-emblem">L</span>
                </button>

                <div className={`message-envelope__seal-ring ${sealRing ? 'message-envelope__seal-ring--active' : ''}`} aria-hidden="true" />

                <div className="message-envelope__stamp" aria-hidden="true">
                  <div className="message-envelope__stamp-perf" />
                  <span>19</span>
                </div>

                <div className="message-envelope__content">
                  <p className="message-envelope__address">For Luna</p>
                  <p className="message-envelope__address-sub">A birthday letter, sealed with love</p>
                  <p className="message-envelope__address-line">Open when ready</p>
                  <button
                    type="button"
                    className="message-envelope__open-btn"
                    onClick={handleOpen}
                    aria-label="Open envelope"
                  >
                    OPEN
                  </button>
                  <span className="message-envelope__annotation" aria-hidden="true">
                    open
                  </span>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="letter"
              className="message-letter"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="message-letter__paper">
                <div className="message-section__ornament" aria-hidden="true" />
                <h2 className="message-section__heading">For Luna</h2>
                <p className="message-section__text">
                  Hi Luna,
                </p>
                <p className="message-section__text">
                  Nineteen. My favourite person is nineteen today, and I still
                  find it hard to believe that a simple reply to a story —{' '}
                  <em>&ldquo;Congratsss 🥳 ❤️&rdquo;</em> — was the beginning of
                  all this. Then you asked if I was okay, and somehow that one
                  act of kindness turned into the best part of every day.
                </p>
                <p className="message-section__text">
                  I think about the little things more than you know. The way you
                  say <em>&ldquo;thangam&rdquo;</em> and{' '}
                  <em>&ldquo;chellam&rdquo;</em> in your voice notes. The way you
                  pray at chapel and then worry about everyone else. The way you
                  tease me about my selfies and still look at me like I am
                  something worth keeping. You make distance feel small.
                </p>
                <p className="message-section__text">
                  And I will never forget the ring. You bought it on February 13,
                  before either of us had said the words, and had my name carved
                  into it. You were already choosing me in secret. So today, on
                  your birthday, I want to choose you out loud, again and again.
                </p>
                <p className="message-section__text message-section__text--quote">
                  &ldquo;Now we&apos;re in long distance, but in the future I
                  don&apos;t even want a singleeeee inchhhh gap between you and
                  me.&rdquo;
                </p>
                <p className="message-section__text">
                  That is my wish for us too. No gap, no hurry, no doubt. Just you
                  and me, growing up and growing closer, with God at the centre
                  and a lifetime of ordinary mornings ahead. I hope today feels
                  gentle. I hope you feel celebrated. And if any part of you feels
                  heavy, put it down for a while — I am right here.
                </p>
                <p className="message-section__text message-section__text--sign">
                  Happy nineteenth, my Luna. With all my heart, always,<br />
                  <span className="message-section__signature">Dev</span>
                </p>
                <div className="message-section__ornament" aria-hidden="true" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </article>
  );
}
