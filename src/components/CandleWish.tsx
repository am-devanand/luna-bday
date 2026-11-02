import { useCallback, useEffect, useRef, useState } from 'react';
import ConfettiBurst from './magic/ConfettiBurst';
import './CandleWish.css';

const KEEPSAKE_KEY = 'luna-keepsakes-v1';

type WishStatus = 'lit' | 'sealed';

interface CandleKeepsake {
  id: string;
  kind: 'candle';
  label: string;
  ts: number;
}

/* Five top-cake candles — evenly spaced on Tier 3 */
const TOP_CANDLES = [
  { x: 124, color: '#E78AA5' },
  { x: 142, color: '#7FB8E0' },
  { x: 160, color: '#D9A83E' },
  { x: 178, color: '#7FCBA1' },
  { x: 196, color: '#A894DC' },
];

/* Floating ambient balloons */
const BALLOONS = [
  { left: '4%',  top: '0%',  color: '#F2A7BB', delay: '0s',   duration: '7s'   },
  { left: '18%', top: '6%',  color: '#A9D3EE', delay: '1.2s', duration: '8.2s' },
  { left: '74%', top: '2%',  color: '#F4D98B', delay: '0.6s', duration: '7.6s' },
  { left: '88%', top: '10%', color: '#BFE3CF', delay: '2s',   duration: '8.8s' },
  { left: '50%', top: '0%',  color: '#CFC2EA', delay: '2.8s', duration: '7.3s' },
];

/* Ambient floating mini candles */
const FLOATERS = [
  { left: '1%',  top: '38%', color: '#E78AA5', delay: '0s',   duration: '5.2s' },
  { left: '90%', top: '30%', color: '#7FB8E0', delay: '1.4s', duration: '6.1s' },
  { left: '82%', top: '65%', color: '#D9A83E', delay: '2.6s', duration: '5.7s' },
];

export default function CandleWish() {
  const [status, setStatus] = useState<WishStatus>('lit');
  const [burstKey, setBurstKey] = useState(0);
  const [wishVisible, setWishVisible] = useState(false);
  const [puffActive, setPuffActive] = useState(false);

  const statusRef = useRef<WishStatus>('lit');
  useEffect(() => { statusRef.current = status; }, [status]);

  const lit = status === 'lit';
  const sealed = status === 'sealed';

  const blowOut = useCallback(() => {
    if (statusRef.current !== 'lit') return;
    setPuffActive(true);
    setTimeout(() => setPuffActive(false), 600);
    setTimeout(() => {
      setStatus('sealed');
      setBurstKey((k) => k + 1);
      setTimeout(() => setWishVisible(true), 800);
    }, 350);

    const entry: CandleKeepsake = {
      id: `candle-${Date.now()}`,
      kind: 'candle',
      label: 'A birthday wish for Luna',
      ts: Date.now(),
    };
    try {
      const raw = localStorage.getItem(KEEPSAKE_KEY);
      const parsed: unknown = raw ? JSON.parse(raw) : [];
      const next = Array.isArray(parsed) ? [...parsed, entry] : [entry];
      localStorage.setItem(KEEPSAKE_KEY, JSON.stringify(next));
    } catch { /* Storage unavailable */ }
    window.dispatchEvent(new CustomEvent('luna:keepsake', { detail: entry }));
  }, []);

  const relight = useCallback(() => {
    setBurstKey(0);
    setWishVisible(false);
    setStatus('lit');
  }, []);

  return (
    <section className={`cw cw--${status}`} aria-label="Candle wish ritual">
      <div className="cw__inner">
        <h2 className="cw__headline">Light a Wish for Luna</h2>
        <p className="cw__subline">
          Five candles for nineteen years of you — tap the cake, close your eyes, and make a wish.
        </p>

        <div className="cw__scene">
          {/* Ambient candle glow on scene when lit */}
          <div className={`cw__scene-glow${lit ? ' cw__scene-glow--lit' : ''}`} aria-hidden="true" />
          {/* Puff ripple on blow */}
          {puffActive && <div className="cw__puff" aria-hidden="true" />}

          {/* Balloons */}
          <div className="cw__balloons" aria-hidden="true">
            {BALLOONS.map((b, bi) => (
              <span
                key={`${b.left}-${b.top}`}
                className="cw__balloon"
                style={{
                  left: b.left,
                  top: b.top,
                  '--balloon': b.color,
                  animationDelay: b.delay,
                  animationDuration: b.duration,
                } as React.CSSProperties}
              >
                <svg viewBox="0 0 40 72" width={bi === 0 ? 40 : bi === 3 ? 28 : 34} height={bi === 0 ? 72 : bi === 3 ? 50 : 62} aria-hidden="true" opacity={bi === 3 ? 0.75 : 1}>
                  <defs>
                    <radialGradient id={`bgrad${bi}`} cx="35%" cy="28%" r="75%">
                      <stop offset="0%" stopColor="#fff" stopOpacity="0.6" />
                      <stop offset="100%" stopColor={b.color} stopOpacity="0" />
                    </radialGradient>
                  </defs>
                  <ellipse cx="20" cy="18" rx="14" ry="17" fill={b.color} />
                  <ellipse cx="20" cy="18" rx="14" ry="17" fill={`url(#bgrad${bi})`} />
                  <path d="M13 7 C10.5 10.5 9.5 15 11 20" fill="none" stroke="#FFFDF7" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />
                  <path d="M17 34 L23 34 L20 39 Z" fill={b.color} />
                  <ellipse cx="20" cy="36.5" rx="3" ry="1.4" fill="#8A7468" opacity="0.6" />
                  <path d="M20 39 C26 44 14 48 20 54 C26 60 14 63 20 68" fill="none" stroke="#8A7468" strokeWidth="1.2" />
                </svg>
              </span>
            ))}
          </div>

          {/* Floating mini candles */}
          <div className="cw__floaters" aria-hidden="true">
            {FLOATERS.map((f) => (
              <span
                key={`${f.left}-${f.top}`}
                className="cw__floater"
                style={{
                  left: f.left,
                  top: f.top,
                  animationDelay: f.delay,
                  animationDuration: f.duration,
                } as React.CSSProperties}
              >
                <svg viewBox="0 0 24 52" width="18" height="44" aria-hidden="true">
                  <g className={`cw__flame${lit ? ' cw__flame--lit' : ''}`}>
                    <ellipse cx="12" cy="9" rx="7" ry="9" fill="rgba(200,136,106,0.25)" />
                    <path d="M12 2 C14.8 6 15.2 9.5 12 13.5 C8.8 9.5 9.2 6 12 2 Z" fill="#E0A83E" />
                    <path d="M12 6 C13.2 8 13.4 10 12 11.8 C10.6 10 10.8 8 12 6 Z" fill="#F6E7C1" />
                    <ellipse cx="12" cy="9.5" rx="1.5" ry="2.2" fill="#FFFFFF" opacity="0.9" />
                  </g>
                  <path
                    className={`cw__smoke${sealed ? ' cw__smoke--show' : ''}`}
                    d="M12 14 C11 11 13 9.5 12 7"
                    fill="none" stroke="#9A8878" strokeWidth="1.2" strokeLinecap="round"
                  />
                  <line x1="12" y1="18" x2="12" y2="14" stroke="#3A2E26" strokeWidth="1" />
                  <rect x="7" y="18" width="10" height="28" rx="2" fill="#FFFDF7" stroke="#C4886A" strokeWidth="1" />
                  <path d={`M7 22 L17 19 M7 27 L17 24 M7 32 L17 29 M7 37 L17 34 M7 42 L17 39`}
                    stroke={f.color} strokeWidth="1.4" />
                </svg>
              </span>
            ))}
          </div>

          {/* THE CAKE — 3-tier, "19" topper */}
          <button
            type="button"
            className="cw__cake"
            onClick={blowOut}
            disabled={!lit}
            aria-label={lit ? 'Blow out the candles' : 'Candles are out'}
          >
            <svg
              className="cw__cake-svg"
              viewBox="0 0 320 360"
              role="img"
              aria-label="Three-tier birthday cake with five lit candles and a golden 19 topper"
            >
              <defs>
                {/* Tier gradient */}
                <linearGradient id="cwTier" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FFFDF7" />
                  <stop offset="55%" stopColor="#FBF4E6" />
                  <stop offset="100%" stopColor="#F0E4CD" />
                </linearGradient>
                {/* Pearl */}
                <radialGradient id="cwPearl" cx="35%" cy="30%" r="75%">
                  <stop offset="0%" stopColor="#FFFFFF" />
                  <stop offset="100%" stopColor="#E4DCCB" />
                </radialGradient>
                {/* Glow */}
                <radialGradient id="cwGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#E0A83E" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#E0A83E" stopOpacity="0" />
                </radialGradient>
                {/* Scene warm glow */}
                <radialGradient id="cwSceneGlow" cx="50%" cy="45%" r="55%">
                  <stop offset="0%" stopColor="#FFF0D0" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#FFF0D0" stopOpacity="0" />
                </radialGradient>
                {/* Plate shade */}
                <radialGradient id="cwShade" cx="35%" cy="28%" r="80%">
                  <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.85" />
                  <stop offset="45%" stopColor="#FFFFFF" stopOpacity="0" />
                  <stop offset="100%" stopColor="#7A5A3A" stopOpacity="0.18" />
                </radialGradient>
                {/* Blur filter */}
                <filter id="cwBlur" x="-30%" y="-60%" width="160%" height="220%">
                  <feGaussianBlur stdDeviation="2.5" />
                </filter>
                {/* Candle stick clip */}
                <clipPath id="cwStick">
                  {TOP_CANDLES.map((c) => (
                    <rect key={c.x} x={c.x - 4} y="90" width="8" height="28" rx="1.5" />
                  ))}
                </clipPath>
              </defs>

              {/* ── Plate shadow ── */}
              <ellipse cx="160" cy="342" rx="115" ry="12" fill="rgba(130,80,40,0.18)" filter="url(#cwBlur)" />

              {/* ── Plate ── */}
              <ellipse cx="160" cy="332" rx="110" ry="14" fill="#FDF9F2" stroke="#C4886A" strokeWidth="2" />
              <ellipse cx="160" cy="332" rx="100" ry="11" fill="none" stroke="#EDCFB3" strokeWidth="1" />
              <ellipse cx="160" cy="332" rx="88"  ry="8"  fill="rgba(196,136,106,0.12)" />

              {/* ══════════════════════════════
                  TIER 1 — Bottom (widest)
                 ══════════════════════════════ */}
              {/* Body */}
              <rect x="52" y="250" width="216" height="76" rx="10" fill="url(#cwTier)" stroke="#E3D5B8" strokeWidth="1.5" />
              {/* Subtle vertical grain */}
              <g stroke="#D8C6A3" strokeWidth="1.2" strokeLinecap="round" opacity="0.11">
                <line x1="80"  y1="268" x2="80"  y2="318" />
                <line x1="108" y1="268" x2="108" y2="318" />
                <line x1="136" y1="268" x2="136" y2="318" />
                <line x1="164" y1="268" x2="164" y2="318" />
                <line x1="192" y1="268" x2="192" y2="318" />
                <line x1="220" y1="268" x2="220" y2="318" />
                <line x1="248" y1="268" x2="248" y2="318" />
              </g>
              {/* Bottom band */}
              <rect x="52" y="306" width="216" height="20" rx="10" fill="#EFE6D2" opacity="0.65" />
              {/* Frosting scallop top */}
              <path d="M56 252 q4.5-10 9 0 q4.5-10 9 0 q4.5-10 9 0 q4.5-10 9 0 q4.5-10 9 0 q4.5-10 9 0 q4.5-10 9 0 q4.5-10 9 0 q4.5-10 9 0 q4.5-10 9 0 q4.5-10 9 0 q4.5-10 9 0 q4.5-10 9 0 q4.5-10 9 0 q4.5-10 9 0 q4.5-10 9 0 q4.5-10 9 0 q4.5-10 9 0 q4.5-10 9 0 q4.5-10 9 0 q4.5-10 9 0 q4.5-10 9 0 q4.5-10 9 0 Z"
                fill="#FFFDF7" stroke="#E3D5B8" strokeWidth="1" />
              {/* Frosting drips */}
              <path d="M56 252 L268 252 L268 264 C260 264 262 278 254 278 C246 278 250 266 242 266 C234 266 238 288 228 288 C218 288 222 266 212 266 C204 266 206 280 198 280 C190 280 194 266 186 266 C178 266 180 292 170 292 C160 292 164 266 156 266 C148 266 150 278 142 278 C134 278 138 266 130 266 C122 266 124 284 114 284 C106 284 110 266 102 266 C94 266 96 276 88 276 C80 276 82 266 76 266 L56 266 Z"
                fill="#E58AA8" />
              <path d="M56 252 L268 252 L268 264 C260 264 262 278 254 278 C246 278 250 266 242 266 C234 266 238 288 228 288 C218 288 222 266 212 266 C204 266 206 280 198 280 C190 280 194 266 186 266 C178 266 180 292 170 292 C160 292 164 266 156 266 C148 266 150 278 142 278 C134 278 138 266 130 266 C122 266 124 284 114 284 C106 284 110 266 102 266 C94 266 96 276 88 276 C80 276 82 266 76 266 L56 266 Z"
                fill="#F2A7BB" opacity="0.7" />
              {/* Drip tips */}
              <circle cx="228" cy="286" r="4.5" fill="#F2A7BB" />
              <circle cx="170" cy="290" r="5" fill="#F2A7BB" />
              <circle cx="114" cy="282" r="4" fill="#F2A7BB" />
              {/* Drip shine */}
              <g fill="#FFFDF7">
                <rect x="225.5" y="268" width="3" height="14" rx="1.5" opacity="0.7" />
                <rect x="167.5" y="268" width="3" height="18" rx="1.5" opacity="0.7" />
                <rect x="112"   y="268" width="2.6" height="10" rx="1.3" opacity="0.65" />
              </g>
              {/* "Happy Birthday Luna" script */}
              <text x="160" y="300" textAnchor="middle"
                fontFamily="Caveat, cursive" fontSize="18"
                textLength="148" lengthAdjust="spacingAndGlyphs"
                fontWeight="700" fill="#C4847A"
                stroke="#FFFDF7" strokeWidth="3" paintOrder="stroke"
                style={{ filter: 'drop-shadow(0 1px 2px rgba(196,100,100,0.35))' }}>
                Happy Birthday Luna
              </text>
              {/* Bead border */}
              <line x1="64" y1="318" x2="256" y2="318" stroke="#EAD9BC" strokeWidth="3.5" strokeLinecap="round" strokeDasharray="0.5 7.5" opacity="0.85" />
              {/* Pearls on tier 1 */}
              <g fill="url(#cwPearl)">
                <circle cx="96"  cy="264" r="3.5" />
                <circle cx="130" cy="264" r="3.5" />
                <circle cx="160" cy="264" r="3.5" />
                <circle cx="190" cy="264" r="3.5" />
                <circle cx="224" cy="264" r="3.5" />
              </g>
              {/* Gold accent stars tier 1 — replace cherries */}
              <g fill="#D9A83E" opacity="0.75">
                <path d="M78 308 L79.2 311.5 L83 313 L79.2 314.5 L78 318 L76.8 314.5 L73 313 L76.8 311.5 Z" />
                <path d="M242 308 L243.2 311.5 L247 313 L243.2 314.5 L242 318 L240.8 314.5 L237 313 L240.8 311.5 Z" />
              </g>
              {/* Gold stars tier 1 */}
              <g fill="#D9A83E">
                <path d="M116 272 L117.5 275.8 L121.5 277.5 L117.5 279.2 L116 283 L114.5 279.2 L110.5 277.5 L114.5 275.8 Z" />
                <path d="M204 272 L205.5 275.8 L209.5 277.5 L205.5 279.2 L204 283 L202.5 279.2 L198.5 277.5 L202.5 275.8 Z" />
              </g>

              {/* ══════════════════════════════
                  TIER 2 — Middle
                 ══════════════════════════════ */}
              <rect x="88" y="178" width="144" height="68" rx="10" fill="url(#cwTier)" stroke="#E3D5B8" strokeWidth="1.5" />
              <g stroke="#D8C6A3" strokeWidth="1.1" strokeLinecap="round" opacity="0.11">
                <line x1="108" y1="194" x2="108" y2="236" />
                <line x1="132" y1="194" x2="132" y2="236" />
                <line x1="160" y1="194" x2="160" y2="236" />
                <line x1="188" y1="194" x2="188" y2="236" />
                <line x1="212" y1="194" x2="212" y2="236" />
              </g>
              <rect x="88" y="228" width="144" height="18" rx="9" fill="#EFE6D2" opacity="0.65" />
              {/* Frosting scallop */}
              <path d="M92 180 q4-8.5 8 0 q4-8.5 8 0 q4-8.5 8 0 q4-8.5 8 0 q4-8.5 8 0 q4-8.5 8 0 q4-8.5 8 0 q4-8.5 8 0 q4-8.5 8 0 q4-8.5 8 0 q4-8.5 8 0 q4-8.5 8 0 q4-8.5 8 0 q4-8.5 8 0 q4-8.5 8 0 q4-8.5 8 0 q4-8.5 8 0 q4-8.5 8 0 Z"
                fill="#FFFDF7" stroke="#E3D5B8" strokeWidth="1" />
              {/* Drips */}
              <path d="M88 178 L232 178 L232 190 C225 190 227 202 220 202 C213 202 216 190 209 190 C202 190 205 212 196 212 C187 212 190 190 183 190 C176 190 178 202 171 202 C164 202 166 190 159 190 C152 190 154 208 146 208 C138 208 141 190 134 190 C127 190 128 200 122 200 C116 200 117 190 112 190 C108 190 107 198 102 198 L88 198 Z"
                fill="#E58AA8" />
              <path d="M88 178 L232 178 L232 190 C225 190 227 202 220 202 C213 202 216 190 209 190 C202 190 205 212 196 212 C187 212 190 190 183 190 C176 190 178 202 171 202 C164 202 166 190 159 190 C152 190 154 208 146 208 C138 208 141 190 134 190 C127 190 128 200 122 200 C116 200 117 190 112 190 C108 190 107 198 102 198 L88 198 Z"
                fill="#F2A7BB" opacity="0.65" />
              <circle cx="196" cy="210" r="4" fill="#F2A7BB" />
              <circle cx="146" cy="206" r="3.8" fill="#F2A7BB" />
              <g fill="#FFFDF7">
                <rect x="193.5" y="192" width="2.8" height="14" rx="1.4" opacity="0.7" />
                <rect x="143.5" y="192" width="2.8" height="10" rx="1.4" opacity="0.65" />
              </g>
              {/* Bead border */}
              <line x1="96" y1="238" x2="224" y2="238" stroke="#EAD9BC" strokeWidth="3" strokeLinecap="round" strokeDasharray="0.5 6.5" opacity="0.85" />
              {/* Pearls */}
              <g fill="url(#cwPearl)">
                <circle cx="116" cy="190" r="3" />
                <circle cx="144" cy="190" r="3" />
                <circle cx="176" cy="190" r="3" />
                <circle cx="204" cy="190" r="3" />
              </g>
              {/* Stars */}
              <g fill="#D9A83E">
                <path d="M132 200 L133.2 203.2 L136.5 204.5 L133.2 205.8 L132 209 L130.8 205.8 L127.5 204.5 L130.8 203.2 Z" />
                <path d="M190 200 L191.2 203.2 L194.5 204.5 L191.2 205.8 L190 209 L188.8 205.8 L185.5 204.5 L188.8 203.2 Z" />
              </g>
              {/* Gold star and pearl accents on Tier 2 — elegant celebration motif */}
              <g fill="#D9A83E">
                <path d="M100 176 L101.5 179.8 L105.5 181.5 L101.5 183.2 L100 187 L98.5 183.2 L94.5 181.5 L98.5 179.8 Z" />
                <path d="M220 176 L221.5 179.8 L225.5 181.5 L221.5 183.2 L220 187 L218.5 183.2 L214.5 181.5 L218.5 179.8 Z" />
              </g>
              <g fill="url(#cwPearl)">
                <circle cx="95" cy="184" r="3" />
                <circle cx="105" cy="184" r="3" />
                <circle cx="215" cy="184" r="3" />
                <circle cx="225" cy="184" r="3" />
              </g>

              {/* ══════════════════════════════
                  TIER 3 — Top (narrow)
                 ══════════════════════════════ */}
              <rect x="116" y="118" width="88" height="58" rx="8" fill="url(#cwTier)" stroke="#E3D5B8" strokeWidth="1.5" />
              <g stroke="#D8C6A3" strokeWidth="1" strokeLinecap="round" opacity="0.11">
                <line x1="132" y1="132" x2="132" y2="166" />
                <line x1="152" y1="132" x2="152" y2="166" />
                <line x1="172" y1="132" x2="172" y2="166" />
                <line x1="192" y1="132" x2="192" y2="166" />
              </g>
              <rect x="116" y="160" width="88" height="16" rx="8" fill="#EFE6D2" opacity="0.65" />
              {/* Frosting scallop */}
              <path d="M120 120 q3.5-7.5 7 0 q3.5-7.5 7 0 q3.5-7.5 7 0 q3.5-7.5 7 0 q3.5-7.5 7 0 q3.5-7.5 7 0 q3.5-7.5 7 0 q3.5-7.5 7 0 q3.5-7.5 7 0 q3.5-7.5 7 0 q3.5-7.5 7 0 q3.5-7.5 7 0 q3.5-7.5 7 0 Z"
                fill="#FFFDF7" stroke="#E3D5B8" strokeWidth="1" />
              {/* Drips */}
              <path d="M116 118 L204 118 L204 128 C199 128 200 138 194 138 C188 138 191 128 185 128 C179 128 182 148 175 148 C168 148 171 128 165 128 C159 128 161 140 155 140 C149 140 151 128 145 128 C139 128 141 136 136 136 C131 136 132 128 128 128 L116 128 Z"
                fill="#E58AA8" />
              <path d="M116 118 L204 118 L204 128 C199 128 200 138 194 138 C188 138 191 128 185 128 C179 128 182 148 175 148 C168 148 171 128 165 128 C159 128 161 140 155 140 C149 140 151 128 145 128 C139 128 141 136 136 136 C131 136 132 128 128 128 L116 128 Z"
                fill="#F2A7BB" opacity="0.65" />
              <circle cx="175" cy="146" r="3.5" fill="#F2A7BB" />
              <rect x="172.5" y="129" width="2.5" height="12" rx="1.25" fill="#FFFDF7" opacity="0.7" />
              {/* Bead border */}
              <line x1="122" y1="170" x2="198" y2="170" stroke="#EAD9BC" strokeWidth="2.8" strokeLinecap="round" strokeDasharray="0.5 6" opacity="0.85" />
              {/* Star */}
              <g fill="#D9A83E">
                <path d="M160 130 L161.2 133.5 L165 135 L161.2 136.5 L160 140 L158.8 136.5 L155 135 L158.8 133.5 Z" />
              </g>

              {/* Tier 3 top rim surface — clean shelf for candles */}
              <ellipse cx="160" cy="118" rx="44" ry="5.5" fill="#FFFDF7" stroke="#E3D5B8" strokeWidth="1" />

              {/* ══════════════════════════════
                  "19" TOPPER — Elevated summit
                 ══════════════════════════════ */}
              {/* Topper stick — rises high from cake center */}
              <line x1="160" y1="54" x2="160" y2="118" stroke="#C4886A" strokeWidth="2.5" strokeLinecap="round" />
              {/* Golden 19 Star Topper — crowned high above candles */}
              <g transform="translate(160,36)">
                <circle cx="0" cy="0" r="22" fill="rgba(217, 168, 62, 0.18)" />
                <path d="M0 -20 L5 -6.5 L19 -6.5 L7.8 2 L12 16 L0 7.5 L-12 16 L-7.8 2 L-19 -6.5 L-5 -6.5 Z"
                  fill="#D9A83E" stroke="#EDCFB3" strokeWidth="1.2" />
                <path d="M0 -15 L3.8 -4.8 L14 -4.8 L5.8 1.5 L9 12 L0 5.5 L-9 12 L-5.8 1.5 L-14 -4.8 L-3.8 -4.8 Z"
                  fill="#F4D070" />
                <text x="0" y="5.5" textAnchor="middle"
                  fontFamily="'Playfair Display', Georgia, serif"
                  fontSize="12.5" fontWeight="700"
                  fill="#2E2620"
                  style={{ filter: 'drop-shadow(0 1px 0 rgba(255,255,255,0.6))' }}>
                  19
                </text>
              </g>

              {/* ══════════════════════════════
                  FIVE CANDLES on top tier
                 ══════════════════════════════ */}
              {TOP_CANDLES.map((c, i) => (
                <g key={c.x}>
                  {/* Candle base holder */}
                  <ellipse cx={c.x} cy="118" rx="5.5" ry="2" fill="#EDCFB3" stroke="#C4886A" strokeWidth="0.8" />

                  {/* Candle stick body */}
                  <rect x={c.x - 4} y="90" width="8" height="28" rx="1.5"
                    fill="#FFFDF7" stroke="#C4886A" strokeWidth="0.9" />

                  {/* Spiral stripes */}
                  <g clipPath="url(#cwStick)">
                    <g transform={`rotate(25 ${c.x} 104)`} stroke={c.color} strokeWidth="3">
                      <line x1={c.x - 8} y1="92" x2={c.x + 8} y2="92" />
                      <line x1={c.x - 8} y1="98" x2={c.x + 8} y2="98" />
                      <line x1={c.x - 8} y1="104" x2={c.x + 8} y2="104" />
                      <line x1={c.x - 8} y1="110" x2={c.x + 8} y2="110" />
                      <line x1={c.x - 8} y1="116" x2={c.x + 8} y2="116" />
                    </g>
                  </g>

                  {/* Wick */}
                  <line x1={c.x} y1="90" x2={c.x} y2="84" stroke="#3A2E26" strokeWidth="1.2" strokeLinecap="round" />

                  {/* Glow halo (under flame) */}
                  <ellipse
                    className={`cw__flame${lit ? ' cw__flame--lit' : ''}`}
                    cx={c.x} cy="75"
                    rx="10" ry="12"
                    fill="url(#cwGlow)"
                    style={{ animationDelay: `${i * 0.25}s` }}
                  />

                  {/* Flame group */}
                  <g
                    className={`cw__flame${lit ? ' cw__flame--lit' : ''}`}
                    style={{ animationDelay: `${i * 0.25 + 0.06}s` }}
                  >
                    <path
                      d={`M${c.x} 66 C${c.x + 4} 72 ${c.x + 4.5} 78 ${c.x} 84 C${c.x - 4.5} 78 ${c.x - 4} 72 ${c.x} 66 Z`}
                      fill="#E0A83E"
                    />
                    <path
                      d={`M${c.x} 71 C${c.x + 2} 75 ${c.x + 2.2} 79 ${c.x} 83 C${c.x - 2.2} 79 ${c.x - 2} 75 ${c.x} 71 Z`}
                      fill="#F6E7C1"
                    />
                    <ellipse cx={c.x} cy="78" rx="1.2" ry="2" fill="#FFFFFF" opacity="0.95" />
                  </g>

                  {/* Smoke wisp (rises when blown out) */}
                  <path
                    className={`cw__smoke${sealed ? ' cw__smoke--show' : ''}`}
                    d={`M${c.x} 84 C${c.x - 2} 79 ${c.x + 2} 74 ${c.x} 69 C${c.x - 1.5} 65 ${c.x + 1} 61 ${c.x} 56`}
                    fill="none" stroke="#9A8878" strokeWidth="1.2" strokeLinecap="round"
                    style={{ animationDelay: `${i * 0.12}s` }}
                  />
                </g>
              ))}

              {/* ── Ambient gold sparkles ── */}
              <g aria-hidden="true">
                <g fill="#D9A83E" opacity="0.5">
                  <path d="M28 60 L28.8 62.2 L31 63 L28.8 63.8 L28 66 L27.2 63.8 L25 63 L27.2 62.2 Z" />
                  <path d="M292 82 L292.8 84.2 L295 85 L292.8 85.8 L292 88 L291.2 85.8 L289 85 L291.2 84.2 Z" />
                  <path d="M20 200 L20.8 202.2 L23 203 L20.8 203.8 L20 206 L19.2 203.8 L17 203 L19.2 202.2 Z" />
                  <path d="M300 178 L300.8 180.2 L303 181 L300.8 181.8 L300 184 L299.2 181.8 L297 181 L299.2 180.2 Z" />
                  <path d="M148 16 L148.8 18.2 L151 19 L148.8 19.8 L148 22 L147.2 19.8 L145 19 L147.2 18.2 Z" />
                </g>
                <g opacity="0.45">
                  <circle cx="50" cy="120" r="1.8" fill="#F2A7BB" />
                  <circle cx="270" cy="120" r="1.8" fill="#A9D3EE" />
                  <circle cx="40" cy="250" r="1.8" fill="#7FCBA1" />
                  <circle cx="285" cy="248" r="1.8" fill="#F2A7BB" />
                  <circle cx="186" cy="22" r="1.8" fill="#D9A83E" />
                </g>
              </g>
            </svg>
          </button>
        </div>

        {/* Wish message — fades in after blowing */}
        {wishVisible && (
          <div className="cw__wish-message" role="status" aria-live="polite">
            <span className="cw__wish-text">Close your eyes, Luna. Make a wish.</span>
            <span className="cw__wish-sparkle" aria-hidden="true">✦</span>
          </div>
        )}

        <p className="cw__status" aria-live="polite">
          {sealed && 'The wish is sealed. ✓'}
        </p>


        {sealed && (
          <button type="button" className="cw__relight" onClick={relight}>
            relight
          </button>
        )}
      </div>

      {burstKey > 0 && (
        <ConfettiBurst
          key={burstKey}
          level="celebration"
          originX={0.5}
          originY={0.5}
          onComplete={() => setBurstKey(0)}
        />
      )}
    </section>
  );
}
