import { useCallback, useRef, useState } from 'react';
import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion';
import PhotoLightbox from './PhotoLightbox';
import './FiveFrames.css';

/* ─── Photo data ─────────────────────────────────────── */
const PHOTO_FILES = [
  {
    file: 'frame-01',
    width: 720,
    height: 1600,
    variants: [480, 720],
    alt: 'Luna in a pink floral dress, smiling against a wall of green leaves',
  },
  {
    file: 'frame-02',
    width: 899,
    height: 1599,
    variants: [480, 899],
    alt: 'A black-and-white portrait of Luna smiling inside a heart-shaped frame',
  },
  {
    file: 'frame-03',
    width: 899,
    height: 1599,
    variants: [480, 899],
    alt: 'Luna in a lilac tee and patterned headband, smiling softly at the camera',
  },
  {
    file: 'frame-04',
    width: 721,
    height: 1600,
    variants: [480, 720],
    alt: 'Luna in a red shirt, smiling with her head tilted',
  },
  {
    file: 'frame-05',
    width: 899,
    height: 1599,
    variants: [480, 899],
    alt: 'A black-and-white close-up of Luna laughing, a pink hibiscus beside her face',
  },
];

const PHOTOS = PHOTO_FILES.map(({ file, width, height, variants, alt }) => {
  const base = `/images/luna/${file}`;
  return {
    src: `${base}.jpg`,
    srcSet: variants.map((w) => `${base}-${w}w.avif ${w}w`).join(', '),
    width,
    height,
    alt,
  };
});

/* ─── Responsive AVIF image (JPEG fallback) ──────────── */
function FrameImage({
  photo,
  sizes,
  className = '',
  style,
  draggable,
}: {
  photo: (typeof PHOTOS)[number];
  sizes: string;
  className?: string;
  style?: React.CSSProperties;
  draggable?: boolean;
}) {
  return (
    <picture>
      <source type="image/avif" srcSet={photo.srcSet} sizes={sizes} />
      <img
        src={photo.src}
        alt={photo.alt}
        className={className}
        style={style}
        draggable={draggable}
        loading="lazy"
        width={photo.width}
        height={photo.height}
      />
    </picture>
  );
}

/* ─── Frame metadata (warm dedications; `tone` preserves mobile styling hooks) ─ */
const FRAMES = [
  { tone: 'cinematic', num: '01', title: 'The smile that feels like home', subtitle: 'First of five' },
  { tone: 'editorial', num: '02', title: 'Kindness, framed', subtitle: 'Second of five' },
  { tone: 'develop', num: '03', title: 'That smile I know by heart', subtitle: 'Third of five' },
  { tone: 'film', num: '04', title: 'Red looks good on you', subtitle: 'Fourth of five' },
  { tone: 'widescreen', num: '05', title: 'My favourite, in black & white', subtitle: 'Last of five' },
];

/* Short stories for the card backs and the lightbox. Adapted from the
   gallery notes written for Luna — no invented anecdotes. */
const STORIES = [
  'Your signature warm smile — the kind that tells people they are safe around you.',
  'A quiet, thoughtful gaze. You feel things deeply, and you carry so much care for others.',
  'The headband selfie. Graceful in the most casual moments, without even trying.',
  'The warm look you give when you are listening closely. You are a rare listener, Luna.',
  'The black-and-white frame with the pink hibiscus — your love for nature’s small, simple details.',
];

/* ─── Frame caption ──────────────────────────────── */
function FrameCaption({
  num,
  title,
  subtitle,
  className = '',
}: {
  num: string;
  title: string;
  subtitle: string;
  className?: string;
}) {
  return (
    <div className={`five-frame__caption ${className}`}>
      <span className="five-frame__caption-num">{num}</span>{' '}
      <span className="five-frame__caption-divider" />
      <span className="five-frame__caption-title">{title}</span>{' '}
      <span className="five-frame__caption-subtitle">{subtitle}</span>
    </div>
  );
}

/* ─── Shared frame wrapper ───────────────────────────── */
function FrameSection({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`five-frame ${className}`}>
      <div className="five-frame__sticky">
        {children}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   FRAME 01 — FULL-BLEED CINEMATIC
   ═══════════════════════════════════════════════════════ */
function FrameCinematic({
  photo,
  scrollYProgress,
  onClick,
}: {
  photo: (typeof PHOTOS)[number];
  scrollYProgress: MotionValue<number>;
  onClick: () => void;
}) {
  const enter = useTransform(scrollYProgress, [0.08, 0.18], [0, 1]);
  const barHeight = useTransform(enter, [0, 1], ['14vh', '10vh']);
  const imgScale = useTransform(enter, [0, 1], [1.08, 1.02]);
  const vignetteOpacity = useTransform(enter, [0.6, 1], [0, 0.5]);
  const borderOpacity = useTransform(enter, [0.7, 1], [0, 1]);
  const captionOpacity = useTransform(enter, [0.7, 1], [0, 1]);
  const captionY = useTransform(enter, [0.7, 1], [12, 0]);

  return (
    <FrameSection className="five-frame--cinematic">
      <motion.div
        className="five-frame__bar five-frame__bar--top"
        style={{ height: barHeight }}
      />
      <motion.div
        className="five-frame__bar five-frame__bar--bottom"
        style={{ height: barHeight }}
      />

      <button
        type="button"
        className="five-frame__cinematic-frame"
        onClick={onClick}
        data-cursor-label="VIEW"
        aria-label="Open photo 1 of 5"
      >
        <picture>
          <source type="image/avif" srcSet={photo.srcSet} sizes="100vw" />
          <motion.img
            src={photo.src}
            alt={photo.alt}
            className="five-frame__img five-frame__img--cinematic"
            style={{ scale: imgScale }}
            loading="lazy"
            width={photo.width}
            height={photo.height}
          />
        </picture>
        <motion.div className="five-frame__cinematic-vignette" style={{ opacity: vignetteOpacity }} />
        <motion.div className="five-frame__cinematic-border" style={{ opacity: borderOpacity }} />
      </button>

      <motion.div
        className="five-frame__caption-wrap five-frame__caption-wrap--light"
        style={{ opacity: captionOpacity, y: captionY }}
      >
        <FrameCaption {...FRAMES[0]} />
      </motion.div>
    </FrameSection>
  );
}

/* ═══════════════════════════════════════════════════════
   FRAME 02 — EDITORIAL PRINT (single photograph, no split)
   ═══════════════════════════════════════════════════════ */
function FrameEditorial({
  photo,
  scrollYProgress,
  onClick,
}: {
  photo: (typeof PHOTOS)[number];
  scrollYProgress: MotionValue<number>;
  onClick: () => void;
}) {
  const enter = useTransform(scrollYProgress, [0.22, 0.32], [0, 1]);
  const photoOpacity = useTransform(enter, [0, 0.6], [0, 1]);
  const photoScale = useTransform(enter, [0, 1], [0.97, 1]);
  const captionOpacity = useTransform(enter, [0.7, 1], [0, 1]);
  const captionY = useTransform(enter, [0.7, 1], [12, 0]);

  return (
    <FrameSection className="five-frame--editorial">
      <button
        type="button"
        className="five-frame__spread"
        onClick={onClick}
        data-cursor-label="VIEW"
        aria-label="Open photo 2 of 5"
      >
        <motion.div
          className="five-frame__editorial-photo"
          style={{ opacity: photoOpacity, scale: photoScale }}
        >
          <FrameImage photo={photo} sizes="(min-width: 900px) 900px, 90vw" className="five-frame__img five-frame__editorial-img" draggable={false} />
        </motion.div>
      </button>

      <motion.div
        className="five-frame__caption-wrap"
        style={{ opacity: captionOpacity, y: captionY }}
      >
        <FrameCaption {...FRAMES[1]} />
      </motion.div>
    </FrameSection>
  );
}

/* ═══════════════════════════════════════════════════════
   FRAME 03 — DARKROOM DEVELOP
   ═══════════════════════════════════════════════════════ */
function FrameDevelop({
  photo,
  scrollYProgress,
  onClick,
}: {
  photo: (typeof PHOTOS)[number];
  scrollYProgress: MotionValue<number>;
  onClick: () => void;
}) {
  const enter = useTransform(scrollYProgress, [0.36, 0.46], [0, 1]);
  const brightness = useTransform(enter, [0, 0.4, 1], [3, 1.8, 1]);
  const warmth = useTransform(enter, [0, 0.5, 1], [0.3, 0.6, 1]);
  const grainOpacity = useTransform(enter, [0, 0.3, 1], [0.25, 0.15, 0]);
  const developOverlay = useTransform(enter, [0, 0.3, 0.7, 1], [0.95, 0.6, 0.2, 0]);
  const captionOpacity = useTransform(enter, [0.7, 1], [0, 1]);
  const captionY = useTransform(enter, [0.7, 1], [12, 0]);

  return (
    <FrameSection className="five-frame--develop">
      <button
        type="button"
        className="five-frame__develop-container"
        onClick={onClick}
        data-cursor-label="VIEW"
        aria-label="Open photo 3 of 5"
      >
        <motion.div
          className="five-frame__develop-image"
          style={{
            filter: useTransform(
              [brightness, warmth] as const,
              ([b, w]) => `brightness(${b}) saturate(${w})`
            ),
          }}
        >
          <FrameImage photo={photo} sizes="(min-width: 700px) 700px, 80vw" className="five-frame__img" draggable={false} />
        </motion.div>
        <motion.div className="five-frame__develop-overlay" style={{ opacity: developOverlay }} />
        <motion.div className="five-frame__develop-grain" style={{ opacity: grainOpacity }} />
        <div className="five-frame__develop-border" />
      </button>

      <motion.div
        className="five-frame__caption-wrap five-frame__caption-wrap--light"
        style={{ opacity: captionOpacity, y: captionY }}
      >
        <FrameCaption {...FRAMES[2]} />
      </motion.div>
    </FrameSection>
  );
}

/* ═══════════════════════════════════════════════════════
   FRAME 04 — FILM STRIP / LIGHT LEAK
   ═══════════════════════════════════════════════════════ */
function FrameFilm({
  photo,
  scrollYProgress,
  onClick,
}: {
  photo: (typeof PHOTOS)[number];
  scrollYProgress: MotionValue<number>;
  onClick: () => void;
}) {
  const enter = useTransform(scrollYProgress, [0.50, 0.60], [0, 1]);
  const rotate = useTransform(enter, [0, 1], [2.5, 0]);
  const yOffset = useTransform(enter, [0, 1], [30, 0]);
  const leakOpacity = useTransform(enter, [0.3, 0.6, 1], [0, 0.35, 0]);
  const borderOpacity = useTransform(enter, [0.5, 1], [0, 1]);
  const glowOpacity = useTransform(enter, [0, 0.3], [0.15, 0]);
  const captionOpacity = useTransform(enter, [0.7, 1], [0, 1]);
  const captionY = useTransform(enter, [0.7, 1], [12, 0]);

  return (
    <FrameSection className="five-frame--film">
      <motion.button
        type="button"
        className="five-frame__film-container"
        style={{ rotate, y: yOffset }}
        onClick={onClick}
        data-cursor-label="VIEW"
        aria-label="Open photo 4 of 5"
      >
        <motion.div className="five-frame__film-glow" style={{ opacity: glowOpacity }} />

        <div className="five-frame__sprockets five-frame__sprockets--left">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={`sprocket-l-${i}`} className="five-frame__sprocket" />
          ))}
        </div>

        <div className="five-frame__film-photo">
          <FrameImage photo={photo} sizes="100vw" className="five-frame__img" draggable={false} />
          <motion.div className="five-frame__film-leak" style={{ opacity: leakOpacity }} />
        </div>

        <div className="five-frame__sprockets five-frame__sprockets--right">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={`sprocket-r-${i}`} className="five-frame__sprocket" />
          ))}
        </div>

        <motion.div className="five-frame__film-border" style={{ opacity: borderOpacity }} />
      </motion.button>

      <motion.div
        className="five-frame__caption-wrap five-frame__caption-wrap--light"
        style={{ opacity: captionOpacity, y: captionY }}
      >
        <FrameCaption {...FRAMES[3]} />
      </motion.div>
    </FrameSection>
  );
}

/* ═══════════════════════════════════════════════════════
   FRAME 05 — CINEMASCOPE REVEAL
   ═══════════════════════════════════════════════════════ */
function FrameCinemaScope({
  photo,
  scrollYProgress,
  onClick,
}: {
  photo: (typeof PHOTOS)[number];
  scrollYProgress: MotionValue<number>;
  onClick: () => void;
}) {
  const enter = useTransform(scrollYProgress, [0.64, 0.74], [0, 1]);
  const clipTop = useTransform(enter, [0, 1], ['48%', '0%']);
  const clipBottom = useTransform(enter, [0, 1], ['48%', '0%']);
  const saturate = useTransform(enter, [0, 1], [0.4, 1]);
  const hueRotate = useTransform(enter, [0, 1], [15, 0]);
  const topBar = useTransform(enter, [0, 0.3], ['44vh', '0vh']);
  const bottomBar = useTransform(enter, [0, 0.3], ['44vh', '0vh']);
  const scanlineOpacity = useTransform(enter, [0.8, 1], [0.06, 0]);
  const captionOpacity = useTransform(enter, [0.7, 1], [0, 1]);
  const captionY = useTransform(enter, [0.7, 1], [12, 0]);

  return (
    <FrameSection className="five-frame--scope">
      <motion.div
        className="five-frame__scope-bar five-frame__scope-bar--top"
        style={{ height: topBar }}
      />
      <motion.div
        className="five-frame__scope-bar five-frame__scope-bar--bottom"
        style={{ height: bottomBar }}
      />

      <button
        type="button"
        className="five-frame__scope-container"
        onClick={onClick}
        data-cursor-label="VIEW"
        aria-label="Open photo 5 of 5"
      >
        <motion.div
          className="five-frame__scope-image"
          style={{
            clipPath: useTransform(
              [clipTop, clipBottom] as const,
              ([t, b]) => `inset(${t} 0 ${b} 0)`
            ),
            filter: useTransform(
              [saturate, hueRotate] as const,
              ([s, h]) => `saturate(${s}) hue-rotate(${h}deg)`
            ),
          }}
        >
          <FrameImage photo={photo} sizes="100vw" className="five-frame__img" draggable={false} />
        </motion.div>
        <motion.div className="five-frame__scope-scanlines" style={{ opacity: scanlineOpacity }} />
      </button>

      <motion.div
        className="five-frame__caption-wrap five-frame__caption-wrap--light"
        style={{ opacity: captionOpacity, y: captionY }}
      >
        <FrameCaption {...FRAMES[4]} />
      </motion.div>
    </FrameSection>
  );
}

/* ─── Section heading ────────────────────────────────── */
function SectionHeading() {
  return (
    <div className="five-frames__header">
      <span className="five-frames__eyebrow">For Luna</span>
      <h2 className="five-frames__title">Five Frames</h2>
      <div className="five-frames__divider">
        <span className="five-frames__divider-line" />
        <span className="five-frames__divider-dot" />
        <span className="five-frames__divider-line" />
      </div>
      <p className="five-frames__subtitle">
        Five photographs, kept with light — one for every version of you I adore.
      </p>
    </div>
  );
}

/* ─── Footer note ────────────────────────────────────── */
function SectionFooter() {
  return (
    <div className="five-frames__footer">
      <div className="five-frames__footer-line" />
      <p className="five-frames__footer-text">That&apos;s all five.</p>
    </div>
  );
}

/* ═══ Main component ════════════════════════════════════ */
export default function FiveFrames() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [flipped, setFlipped] = useState<number | null>(null);

  const handlePhotoClick = useCallback((index: number) => setLightboxIndex(index), []);
  const handleClose = useCallback(() => setLightboxIndex(null), []);
  const handlePrev = useCallback(
    () => setLightboxIndex((prev) => (prev !== null ? Math.max(0, prev - 1) : null)),
    [],
  );
  const handleNext = useCallback(
    () =>
      setLightboxIndex((prev) =>
        prev !== null ? Math.min(PHOTOS.length - 1, prev + 1) : null,
      ),
    [],
  );

  /* ── Mobile: stacked cards ── */
  const isMobile =
    typeof window !== 'undefined' && window.innerWidth < 768;

  if (isMobile) {
    return (
      <section className="five-frames" ref={sectionRef} aria-label="Five photo frames">
        <SectionHeading />

        <div className="five-cards">
          {PHOTOS.map((photo, i) => {
            const frame = FRAMES[i];
            const isFlipped = flipped === i;

            return (
              <div
                key={i}
                className={`five-card five-card--${frame.tone}${isFlipped ? ' is-flipped' : ''}`}
              >
                <div className="five-card__inner">
                  {/* ── Front: photograph + caption ── */}
                  <div
                    className="five-card__face five-card__face--front"
                    aria-hidden={isFlipped}
                    inert={isFlipped}
                  >
                    <button
                      type="button"
                      className="five-card__open"
                      onClick={() => handlePhotoClick(i)}
                      aria-label={`Open photo ${i + 1} of 5: ${frame.title}`}
                    >
                      <span className="five-card__media">
                        <FrameImage photo={photo} sizes="100vw" className="five-card__img" />
                        <span className="five-card__scrim" aria-hidden="true" />
                      </span>
                    </button>

                    <div className="five-card__caption five-frame__caption--mobile five-frame__caption--light">
                      <FrameCaption {...frame} />
                    </div>

                    <button
                      type="button"
                      className="five-card__story-btn"
                      onClick={() => setFlipped(i)}
                      aria-label={`Read the story behind photo ${i + 1}`}
                    >
                      the story
                    </button>
                  </div>

                  {/* ── Back: the story ── */}
                  <div
                    className="five-card__face five-card__face--back"
                    aria-hidden={!isFlipped}
                    inert={!isFlipped}
                  >
                    <div className="five-card__back-head">
                      <span className="five-card__back-num">{frame.num}</span>
                      <span className="five-card__back-eyebrow">the story</span>
                    </div>

                    <p className="five-card__story">{STORIES[i]}</p>

                    <div className="five-card__back-actions">
                      <button
                        type="button"
                        className="five-card__back-primary"
                        onClick={() => {
                          setFlipped(null);
                          handlePhotoClick(i);
                        }}
                      >
                        View the photo
                      </button>
                      <button
                        type="button"
                        className="five-card__back-ghost"
                        onClick={() => setFlipped(null)}
                      >
                        Back to the frame
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <SectionFooter />

        {lightboxIndex !== null && (
          <PhotoLightbox
            photos={PHOTOS}
            captions={STORIES}
            selectedIndex={lightboxIndex}
            onClose={handleClose}
            onPrev={handlePrev}
            onNext={handleNext}
          />
        )}
      </section>
    );
  }

  /* ══ Desktop: sticky scroll frames ═══════════════════ */
  return (
    <section className="five-frames" ref={sectionRef} aria-label="Five photo frames">
      <SectionHeading />

      <FrameCinematic
        photo={PHOTOS[0]}
        scrollYProgress={scrollYProgress}
        onClick={() => handlePhotoClick(0)}
      />
      <FrameEditorial
        photo={PHOTOS[1]}
        scrollYProgress={scrollYProgress}
        onClick={() => handlePhotoClick(1)}
      />
      <FrameDevelop
        photo={PHOTOS[2]}
        scrollYProgress={scrollYProgress}
        onClick={() => handlePhotoClick(2)}
      />
      <FrameFilm
        photo={PHOTOS[3]}
        scrollYProgress={scrollYProgress}
        onClick={() => handlePhotoClick(3)}
      />
      <FrameCinemaScope
        photo={PHOTOS[4]}
        scrollYProgress={scrollYProgress}
        onClick={() => handlePhotoClick(4)}
      />

      <SectionFooter />

      {lightboxIndex !== null && (
        <PhotoLightbox
          photos={PHOTOS}
          captions={STORIES}
          selectedIndex={lightboxIndex}
          onClose={handleClose}
          onPrev={handlePrev}
          onNext={handleNext}
        />
      )}
    </section>
  );
}
