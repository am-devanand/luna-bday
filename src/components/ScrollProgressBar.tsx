import { useRef } from 'react';
import { motion, useMotionValueEvent, useScroll, useSpring, useTransform } from 'framer-motion';
import './ScrollProgressBar.css';

export default function ScrollProgressBar() {
  const { scrollYProgress } = useScroll();
  const springProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    mass: 0.5,
  });

  /* XIX appears only at the very end */
  const showXIX = useTransform(scrollYProgress, [0.92, 0.96], [0, 1]);

  /* Finale: fire once per page load at the very bottom */
  const finaleFired = useRef(false);
  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    if (!finaleFired.current && v >= 0.985) {
      finaleFired.current = true;
      window.dispatchEvent(new CustomEvent('luna:finale'));
    }
  });

  return (
    <>
      <motion.div
        className="scroll-progress-bar"
        style={{ scaleX: springProgress }}
      />
      <motion.div
        className="scroll-progress-bar__xix"
        style={{ opacity: showXIX }}
        aria-hidden="true"
      >
        XIX
      </motion.div>
    </>
  );
}
