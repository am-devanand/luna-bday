import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, useInView, useAnimation, type Variants } from 'framer-motion';
import './MusicPlayer.css';

const AUDIO_SRC = '/music/perfect.mp3';

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/* ─── Animated elapsed counter — counts up in real time ──── */
function ElapsedCounter({ currentTime, isPlaying }: { currentTime: number; isPlaying: boolean }) {
  const [display, setDisplay] = useState('0:00');
  const rafRef = useRef<number>(0);
  const lastRef = useRef(0);

  useEffect(() => {
    if (!isPlaying) {
      setDisplay(formatTime(currentTime));
      return;
    }

    const tick = () => {
      /* Pull directly from audio — smoother than state updates */
      const now = performance.now();
      if (now - lastRef.current > 200) {
        setDisplay(formatTime(currentTime));
        lastRef.current = now;
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [currentTime, isPlaying]);

  return <span className="vinyl__elapsed">{display}</span>;
}

const headingVariants: Variants = {
  hidden: { opacity: 0, x: -30 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.1 } },
};

const vinylVariants: Variants = {
  hidden: { opacity: 0, y: -60, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 100,
      damping: 14,
      mass: 0.8,
      delay: 0.25,
    },
  },
};

const infoVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.5 } },
};

const progressVariants: Variants = {
  hidden: { opacity: 0, scaleX: 0.8, transformOrigin: 'left' },
  visible: { opacity: 1, scaleX: 1, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.6 } },
};

const buttonVariants: Variants = {
  hidden: { opacity: 0, scale: 0.5 },
  visible: { opacity: 1, scale: 1, transition: { type: 'spring' as const, stiffness: 200, damping: 12, delay: 0.75 } },
};

export default function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-80px' });
  const vinylControls = useAnimation();

  /* ── Rotation state for label counter-spin ── */
  const rotationRef = useRef(0);
  const spinRafRef = useRef<number>(0);
  const [labelRotation, setLabelRotation] = useState(0);

  /* Smooth continuous rotation via RAF (not Framer for the label) */
  useEffect(() => {
    if (!isPlaying) return;

    let lastTime = performance.now();
    const spin = (now: number) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;
      rotationRef.current += 36 * dt; /* ~36 deg/s ≈ one full turn per 10s */
      setLabelRotation(-rotationRef.current); /* counter-rotate */
      spinRafRef.current = requestAnimationFrame(spin);
    };
    spinRafRef.current = requestAnimationFrame(spin);
    return () => cancelAnimationFrame(spinRafRef.current);
  }, [isPlaying]);

  /* Reset label rotation when stopped */
  useEffect(() => {
    if (isPlaying) return;
    rotationRef.current = 0;
    /* Smoothly ease back to 0 */
    const el = labelRef.current;
    if (!el) return;
    el.style.transition = 'transform 1s cubic-bezier(0.22, 1, 0.36, 1)';
    el.style.transform = 'translate(-50%, -50%) rotate(0deg)';
    const timer = setTimeout(() => { el.style.transition = ''; }, 1000);
    return () => clearTimeout(timer);
  }, [isPlaying]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || error) return;
    if (audio.paused) {
      audio.play().catch(() => { setError('Audio unavailable'); setIsPlaying(false); });
      setIsPlaying(true);
      /* Vinyl accelerates with momentum */
      vinylControls.start({
        rotate: 360,
        transition: { duration: 8, ease: 'linear', repeat: Infinity, repeatType: 'loop' },
      });
    } else {
      audio.pause();
      setIsPlaying(false);
      /* Vinyl decelerates with inertia */
      vinylControls.start({
        rotate: 0,
        transition: { duration: 1.5, ease: [0.25, 0.1, 0.25, 1] },
      });
    }
  }, [error, vinylControls]);

  const handleTimeUpdate = useCallback(() => {
    const audio = audioRef.current;
    if (audio) setCurrentTime(audio.currentTime);
  }, []);

  const handleLoadedMetadata = useCallback(() => {
    const audio = audioRef.current;
    if (audio && isFinite(audio.duration)) setDuration(audio.duration);
  }, []);

  const handleEnded = useCallback(() => {
    setIsPlaying(false);
    setCurrentTime(0);
  }, []);

  const handleError = useCallback(() => {
    setError('Audio unavailable');
    setIsPlaying(false);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' && e.target === document.body) {
        e.preventDefault();
        togglePlay();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay]);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <section className="music-player" ref={sectionRef} aria-label="Music player" data-cursor-label="">
      <audio
        ref={audioRef}
        src={AUDIO_SRC}
        preload="metadata"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        onError={handleError}
      />

      <motion.h2
        className="music-player__heading"
        variants={headingVariants}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
      >
        ON REPEAT
      </motion.h2>
      <motion.p
        className="music-player__subtitle"
        variants={headingVariants}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
      >
        The song that is ours
      </motion.p>

      <motion.aside
        className="music-player__dedication"
        variants={headingVariants}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
      >
        <p className="music-player__dedication-title">On repeat, for Luna</p>
        <p className="music-player__dedication-sub">Perfect by Ed Sheeran — the song that always finds its way back to us. Pressed here as SIDE 19.</p>
        <p className="music-player__dedication-cue">press play when…</p>
      </motion.aside>

      {error ? (
        <p className="music-player__error">{error}</p>
      ) : (
        <motion.div
          className="vinyl"
          variants={vinylVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          <div className="vinyl__turntable">
            {/* Tonearm shadow — cast on turntable surface */}
            <div className={`vinyl__tonearm-shadow ${isPlaying ? 'vinyl__tonearm--playing' : ''}`} />
            {/* Tonearm */}
            <div className={`vinyl__tonearm ${isPlaying ? 'vinyl__tonearm--playing' : ''}`} />

            {/* Vinyl record */}
            <div
              className="vinyl__record"
              onClick={togglePlay}
              data-cursor-label={isPlaying ? 'PAUSE' : 'PLAY'}
              role="button"
              tabIndex={0}
              aria-label={isPlaying ? 'Pause' : 'Play'}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); togglePlay(); } }}
            >
              <motion.div
                className="vinyl__record-spin"
                animate={vinylControls}
              >
                <div className="vinyl__grooves" />
                {/* Center label — counter-rotates to stay readable */}
                <div
                  ref={labelRef}
                  className="vinyl__label"
                  style={{ transform: `translate(-50%, -50%) rotate(${labelRotation}deg)` }}
                >
                  <span className="vinyl__label-text">SIDE 19</span>
                  <span className="vinyl__label-sub">For Luna</span>
                </div>
              </motion.div>
            </div>

            {/* Reflection overlay */}
            <div className={`vinyl__shine ${isPlaying ? 'vinyl__shine--active' : ''}`} />
          </div>

          <motion.div
            className="vinyl__info"
            variants={infoVariants}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
          >
            <h3 className="vinyl__track-name">Perfect</h3>
            <p className="vinyl__artist">Ed Sheeran</p>
            <ElapsedCounter currentTime={currentTime} isPlaying={isPlaying} />
          </motion.div>

          <motion.div
            className="vinyl__progress"
            variants={progressVariants}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
          >
            <div className="vinyl__progress-track">
              <div className="vinyl__progress-fill" style={{ width: `${progress}%` }} />
              <div
                className={`vinyl__progress-dot ${isPlaying ? 'vinyl__progress-dot--active' : ''}`}
                style={{ left: `${progress}%` }}
              />
            </div>
            <div className="vinyl__progress-time">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </motion.div>

          <motion.button
            className="vinyl__play-btn"
            onClick={togglePlay}
            aria-label={isPlaying ? 'Pause' : 'Play'}
            type="button"
            variants={buttonVariants}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
          >
            {isPlaying ? (
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" width="20" height="20">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" width="20" height="20">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </motion.button>
        </motion.div>
      )}
    </section>
  );
}
