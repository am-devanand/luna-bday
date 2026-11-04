import { useState } from 'react';
import SectionShell from './system/SectionShell';
import Eyebrow from './system/Eyebrow';
import Reveal from './system/Reveal';
import ModalSheet from './system/ModalSheet';
import VoiceNote from './system/VoiceNote';
import './GiftBoxes.css';

const KEEPSAKE_KEY = 'luna-keepsakes-v1';

/* ─── Data ────────────────────────────────────────────────── */

interface Gift {
  id: string;
  number: string;
  tag: string;
  title: string;
  blurb: string;
  kind: 'voice' | 'promise';
  src?: string;
  /** Shown before the file's metadata loads — preload is deliberately off. */
  approx?: number;
}

const GIFTS: Gift[] = [
  {
    id: 'gift-voice-1',
    number: '01',
    tag: 'listen',
    title: 'Something I said',
    blurb: 'Five seconds of my actual voice',
    kind: 'voice',
    src: '/audio/voice-note-01.mp3',
    approx: 5,
  },
  {
    id: 'gift-voice-2',
    number: '02',
    tag: 'listen closer',
    title: 'Something I meant',
    blurb: 'Fourteen seconds I couldn’t say to your face',
    kind: 'voice',
    src: '/audio/voice-note-02.mp3',
    approx: 14,
  },
  {
    id: 'gift-promise',
    number: '03',
    tag: 'keep',
    title: 'Something I promise',
    blurb: 'One promise, in three parts',
    kind: 'promise',
  },
];

const PROMISES = [
  'I will choose you on the ordinary days — not only the birthdays.',
  'I will listen before I try to fix anything.',
  'I will never make you guess whether you are loved.',
];

/* ─── Component ───────────────────────────────────────────── */

interface KeepsakeItem {
  id: string;
  kind: 'promise';
  label: string;
  ts: number;
}

export default function GiftBoxes() {
  const [openGift, setOpenGift] = useState<Gift | null>(null);
  const [opened, setOpened] = useState<string[]>([]);
  const [kept, setKept] = useState(false);

  const open = (gift: Gift) => {
    setKept(false);
    setOpenGift(gift);
    setOpened((prev) => (prev.includes(gift.id) ? prev : [...prev, gift.id]));
  };

  const keepPromise = () => {
    const entry: KeepsakeItem = {
      id: `promise-${Date.now()}`,
      kind: 'promise',
      label: 'A promise: I choose you, on the ordinary days',
      ts: Date.now(),
    };
    try {
      const raw = localStorage.getItem(KEEPSAKE_KEY);
      const parsed: unknown = raw ? JSON.parse(raw) : [];
      const next = Array.isArray(parsed) ? [...parsed, entry] : [entry];
      localStorage.setItem(KEEPSAKE_KEY, JSON.stringify(next));
    } catch {
      /* The promise still stands without storage. */
    }
    window.dispatchEvent(new CustomEvent('luna:keepsake', { detail: entry }));
    setKept(true);
  };

  return (
    <SectionShell label="Gifts" tone="ivory" width="editorial" className="gifts">
      <Reveal className="gifts__head">
        <Eyebrow>Three small things</Eyebrow>
        <h2 className="gifts__title">Three gifts, left here for you.</h2>
        <p className="gifts__sub">
          No postage, no ribbon that survives the journey. Open them in any order — none of
          them expire.
        </p>
      </Reveal>

      <div className="gifts__grid">
        {GIFTS.map((gift, i) => {
          const isOpen = opened.includes(gift.id);
          return (
            <Reveal key={gift.id} delay={i * 0.08} className="gifts__cell">
              <button
                type="button"
                className={`gift gift--${gift.number}${isOpen ? ' is-opened' : ''}`}
                onClick={() => open(gift)}
                aria-label={`Open gift ${gift.number.replace(/^0/, '')}: ${gift.title}`}
              >
                <span className="gift__scene" aria-hidden="true">
                  <span className="gift__shadow" />
                  <span className="gift__box">
                    <span className="gift__sheen" />
                  </span>
                  <span className="gift__lid" />
                  <span className="gift__bow">
                    <span className="gift__bow-loop gift__bow-loop--left" />
                    <span className="gift__bow-loop gift__bow-loop--right" />
                    <span className="gift__bow-knot" />
                  </span>
                  <span className="gift__tag">
                    <span className="gift__tag-num">{gift.number}</span>
                    <span className="gift__tag-word">{isOpen ? 'opened' : gift.tag}</span>
                  </span>
                </span>

                <span className="gift__meta">
                  Gift {gift.number} · {gift.tag}
                </span>
                <span className="gift__title">{gift.title}</span>
                <span className="gift__blurb">{gift.blurb}</span>
                <span className="gift__cta">
                  {isOpen ? 'Open again' : 'Open this one'}
                  <svg viewBox="0 0 16 16" width="13" height="13" aria-hidden="true" focusable="false">
                    <path
                      d="M3 8h9M8.5 4.2 12.3 8l-3.8 3.8"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </button>
            </Reveal>
          );
        })}
      </div>

      <ModalSheet
        open={openGift !== null}
        onClose={() => setOpenGift(null)}
        title={openGift?.title ?? 'A gift'}
      >
        {openGift && (
          <div className="gift-sheet">
            <Eyebrow className="gift-sheet__eyebrow">
              Gift {openGift.number} of 03
            </Eyebrow>

            {openGift.kind === 'voice' && openGift.src ? (
              <>
                <p className="gift-sheet__copy">
                  {openGift.id === 'gift-voice-1'
                    ? 'I recorded this when I thought you weren’t listening. It’s short, because I got shy. Press play.'
                    : 'Fourteen seconds I couldn’t say to your face without smiling. It took a few tries. Press play.'}
                </p>
                <VoiceNote src={openGift.src} approx={openGift.approx ?? 0} title={openGift.title} />
                <p className="gift-sheet__note">
                  Your ears only. No transcript — some things only sound right in my voice.
                </p>
              </>
            ) : (
              <>
                <p className="gift-sheet__copy">No ribbon, no receipt. Just this:</p>

                <div className="gift-sheet__promise-layout">
                  <figure className="gift-sheet__polaroid">
                    <img
                      src="/images/luna/frame-02.jpg"
                      alt="Swethaaa smiling inside a heart-shaped frame, in black and white"
                      width={899}
                      height={1599}
                      loading="lazy"
                    />
                    <figcaption>you, in a heart, where you live</figcaption>
                  </figure>

                  <ol className="gift-sheet__promises">
                    {PROMISES.map((promise) => (
                      <li key={promise}>{promise}</li>
                    ))}
                  </ol>
                </div>

                <button
                  type="button"
                  className="gift-sheet__keep"
                  onClick={keepPromise}
                  disabled={kept}
                >
                  {kept ? 'Kept — it’s yours' : 'Keep this promise'}
                </button>
                <p className="gift-sheet__note" role="status" aria-live="polite">
                  {kept
                    ? 'Kept. It’s yours — quietly, always.'
                    : 'Keep it. No ribbon, no expiry.'}
                </p>
              </>
            )}

            <p className="gift-sheet__sign">— Dev</p>
          </div>
        )}
      </ModalSheet>
    </SectionShell>
  );
}
