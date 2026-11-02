import { useCallback, useEffect, useRef, useState } from 'react';
import ConfettiBurst from './magic/ConfettiBurst';
import Eyebrow from './system/Eyebrow';
import VoiceNote from './system/VoiceNote';
import { useBlowDetection } from '../hooks/useBlowDetection';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import { WISH_VOICE } from '../content/wishVoice';
import './CandleWish.css';

const KEEPSAKE_KEY = 'luna-keepsakes-v1';

/* Preview the reserved slot before the real recording arrives: open the site
   with ?wishvoice=1 and the block renders with an existing note as a stand-in. */
function readWishVoice() {
  if (
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).has('wishvoice')
  ) {
    return { ...WISH_VOICE, ready: true, src: '/audio/voice-note-02.mp3', approx: 14 };
  }
  return WISH_VOICE;
}

type WishStatus = 'lit' | 'sealed';

interface CandleKeepsake {
  id: string;
  kind: 'candle';
  label: string;
  ts: number;
}

/* Five slim candles on the top tier. Muted wax tints, not party-shop neon. */
const CANDLES = [
  { left: '14%', wax: '#D9A39B', delay: '0s' },
  { left: '32%', wax: '#E6C58F', delay: '0.35s' },
  { left: '50%', wax: '#F2E4D2', delay: '0.7s' },
  { left: '68%', wax: '#B9C7B4', delay: '1.05s' },
  { left: '86%', wax: '#C7BBD3', delay: '1.4s' },
];

export default function CandleWish() {
  const [status, setStatus] = useState<WishStatus>('lit');
  const [wishVoice] = useState(readWishVoice);
  const [burstKey, setBurstKey] = useState(0);
  const [wishVisible, setWishVisible] = useState(false);
  const [puffActive, setPuffActive] = useState(false);
  const [burstOrigin, setBurstOrigin] = useState({ x: 0.5, y: 0.5 });

  const statusRef = useRef<WishStatus>('lit');
  const cakeRef = useRef<HTMLButtonElement>(null);
  const wishRef = useRef<HTMLDivElement>(null);
  const timersRef = useRef<number[]>([]);
  const reduceMotion = usePrefersReducedMotion();

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  /* Keep the sealed message in view without hijacking the scroll position. */
  useEffect(() => {
    if (!wishVisible) return;
    const id = window.setTimeout(() => {
      wishRef.current?.scrollIntoView({
        behavior: reduceMotion ? 'auto' : 'smooth',
        block: 'nearest',
      });
    }, 120);
    return () => window.clearTimeout(id);
  }, [reduceMotion, wishVisible]);

  useEffect(
    () => () => {
      timersRef.current.forEach((id) => window.clearTimeout(id));
    },
    [],
  );

  const lit = status === 'lit';
  const sealed = status === 'sealed';

  const blowOut = useCallback(() => {
    if (statusRef.current !== 'lit') return;
    statusRef.current = 'sealed';

    const rect = cakeRef.current?.getBoundingClientRect();
    if (rect) {
      setBurstOrigin({
        x: (rect.left + rect.width / 2) / window.innerWidth,
        y: (rect.top + rect.height * 0.42) / window.innerHeight,
      });
    }

    setPuffActive(true);
    setStatus('sealed');
    setBurstKey((k) => k + 1);

    timersRef.current.push(
      window.setTimeout(() => setPuffActive(false), 700),
      window.setTimeout(() => setWishVisible(true), 650),
    );

    if (reduceMotion) {
      timersRef.current.push(window.setTimeout(() => setBurstKey(0), 200));
    }

    const entry: CandleKeepsake = {
      id: `candle-${Date.now()}`,
      kind: 'candle',
      label: 'A birthday wish for Swethaaa',
      ts: Date.now(),
    };
    try {
      const raw = localStorage.getItem(KEEPSAKE_KEY);
      const parsed: unknown = raw ? JSON.parse(raw) : [];
      const next = Array.isArray(parsed) ? [...parsed, entry] : [entry];
      localStorage.setItem(KEEPSAKE_KEY, JSON.stringify(next));
    } catch {
      /* Storage unavailable — the wish still happens. */
    }
    window.dispatchEvent(new CustomEvent('luna:keepsake', { detail: entry }));
  }, [reduceMotion]);

  const { state: micState, start: startMic, stop: stopMic } = useBlowDetection({
    onBlow: blowOut,
  });

  const relight = useCallback(() => {
    stopMic();
    setBurstKey(0);
    setWishVisible(false);
    setStatus('lit');
    statusRef.current = 'lit';
  }, [stopMic]);

  const micNote = (() => {
    switch (micState) {
      case 'requesting':
        return 'Asking the browser for microphone access…';
      case 'listening':
        return 'I’m listening. Blow gently toward your mic.';
      case 'denied':
        return 'Microphone is blocked — tap the cake instead.';
      case 'error':
        return 'Microphone isn’t available here — tap the cake instead.';
      default:
        return '';
    }
  })();

  return (
    <section className={`cw cw--${status}`} aria-label="Candle wish ritual">
      <div className="cw__inner">
        <Eyebrow className="cw__eyebrow">Make a wish</Eyebrow>
        <h2 className="cw__headline">Light a Wish for Swethaaa</h2>
        <p className="cw__subline">
          Five candles for nineteen years of you. Tap the cake — or use your microphone and blow.
        </p>

        <div className="cw__stage">
          <div className={`cw__glow${lit ? ' cw__glow--lit' : ''}`} aria-hidden="true" />
          {puffActive && <div className="cw__puff" aria-hidden="true" />}

          <button
            ref={cakeRef}
            type="button"
            className="cw__cake"
            onClick={blowOut}
            disabled={!lit}
            aria-label={lit ? 'Blow out the candles by tapping the cake' : 'The candles are out'}
          >
            <div className="cake">
              <div className="cake__shadow" aria-hidden="true" />
              <div className="cake__plate" aria-hidden="true" />

              {/* ── Tier 1 — bottom ── */}
              <div className="cake__tier cake__tier--1" aria-hidden="true">
                <div className="cake__body" />
                <div className="cake__frosting" />
                <div className="cake__top" />
                <div className="cake__bead" />
                <span className="cake__script">Happy Birthday Swethaaa</span>
              </div>

              {/* ── Tier 2 — middle ── */}
              <div className="cake__tier cake__tier--2" aria-hidden="true">
                <div className="cake__body" />
                <div className="cake__frosting" />
                <div className="cake__top" />
                <div className="cake__bead" />
                <div className="cake__seal">
                  <span>19</span>
                </div>
              </div>

              {/* ── Tier 3 — top ── */}
              <div className="cake__tier cake__tier--3" aria-hidden="true">
                <div className="cake__body" />
                <div className="cake__frosting" />
                <div className="cake__top" />
                <div className="cake__bead" />
              </div>

              <div className="cake__candles" aria-hidden="true">
                {CANDLES.map((candle, i) => (
                  <span
                    key={candle.left}
                    className="cake__candle"
                    style={
                      {
                        left: candle.left,
                        '--wax': candle.wax,
                        '--flicker-delay': candle.delay,
                        '--smoke-delay': `${i * 0.16}s`,
                      } as React.CSSProperties
                    }
                  >
                    <span className="cake__flame" />
                    <span className="cake__smoke" />
                    <span className="cake__wick" />
                    <span className="cake__stick" />
                  </span>
                ))}
              </div>
            </div>
          </button>
        </div>

        <div className="cw__controls">
          {lit && (
            <>
              <button
                type="button"
                className={`cw__mic${micState === 'listening' ? ' cw__mic--listening' : ''}`}
                onClick={
                  micState === 'listening' || micState === 'requesting' ? stopMic : startMic
                }
                aria-pressed={micState === 'listening'}
              >
                <svg viewBox="0 0 20 20" width="15" height="15" aria-hidden="true" focusable="false">
                  <rect x="7" y="2" width="6" height="10" rx="3" fill="currentColor" />
                  <path
                    d="M4.5 9.5a5.5 5.5 0 0 0 11 0M10 15v3"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
                {micState === 'requesting'
                  ? 'Cancel'
                  : micState === 'listening'
                    ? 'Stop listening'
                    : 'Use microphone'}
              </button>
              <span className="cw__hint">or tap the cake</span>
            </>
          )}

          {sealed && (
            <button type="button" className="cw__relight" onClick={relight}>
              light them again
            </button>
          )}
        </div>

        <p className="cw__mic-note" aria-live="polite">
          {micNote}
        </p>

        {wishVisible && (
          <div ref={wishRef} className="cw__wish-stack">
            <div className="cw__wish" role="status" aria-live="polite">
              <span className="cw__wish-kicker">Wish sealed</span>
              <p className="cw__wish-title">Happy nineteenth, my Swethaaa.</p>
              <p className="cw__wish-sub">
                Nineteen years of you — and I would still choose every single one.
              </p>
              <span className="cw__wish-sign">always, Dev</span>
            </div>

            {wishVoice.ready && (
              <div className="cw__wish-voice">
                <span className="cw__wish-voice-kicker">one more thing</span>
                <p className="cw__wish-voice-lead">{wishVoice.lead}</p>
                <VoiceNote
                  src={wishVoice.src}
                  approx={wishVoice.approx}
                  title={wishVoice.title}
                  className="cw__wish-voice-player"
                />
              </div>
            )}
          </div>
        )}
      </div>

      {burstKey > 0 && !reduceMotion && (
        <ConfettiBurst
          key={burstKey}
          level="celebration"
          originX={burstOrigin.x}
          originY={burstOrigin.y}
          onComplete={() => setBurstKey((current) => (current === burstKey ? 0 : current))}
        />
      )}
    </section>
  );
}
