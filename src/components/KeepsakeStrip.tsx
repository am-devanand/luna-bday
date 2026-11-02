import { useEffect, useState } from 'react';
import './KeepsakeStrip.css';

/* ─── Keepsake contract (shared with L2/L4/L6 — consumer only) ─── */
const KEEPSAKE_KEY = 'luna-keepsakes-v1';

interface KeepsakeItem {
  id: string;
  kind: 'photo' | 'wish' | 'candle' | 'promise';
  label: string;
  imageSrc?: string;
  ts: number;
}

function readKeepsakes(): KeepsakeItem[] {
  try {
    const raw = localStorage.getItem(KEEPSAKE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    /* Keepsakes saved before the rename still carry the old name. Bring
       them forward once so the strip never shows a stale label. */
    const items = parsed as KeepsakeItem[];
    let renamed = false;
    const migrated = items.map((item) => {
      if (typeof item.label !== 'string' || !item.label.includes('Luna')) return item;
      renamed = true;
      return { ...item, label: item.label.replace(/Luna/g, 'Swethaaa') };
    });

    if (renamed) {
      try {
        localStorage.setItem(KEEPSAKE_KEY, JSON.stringify(migrated));
      } catch {
        /* Display the migrated labels even if the write fails. */
      }
    }

    return migrated;
  } catch {
    return [];
  }
}

function ordinal(n: number): string {
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 13) return `${n}th`;
  switch (n % 10) {
    case 1: return `${n}st`;
    case 2: return `${n}nd`;
    case 3: return `${n}rd`;
    default: return `${n}th`;
  }
}

export default function KeepsakeStrip() {
  const [items, setItems] = useState<KeepsakeItem[]>([]);

  useEffect(() => {
    setItems(readKeepsakes());
    const onKeep = (e: Event) => {
      const item = (e as CustomEvent<KeepsakeItem>).detail;
      if (!item || typeof item.id !== 'string') return;
      setItems((prev) => (prev.some((k) => k.id === item.id) ? prev : [...prev, item]));
    };
    window.addEventListener('luna:keepsake', onKeep);
    return () => window.removeEventListener('luna:keepsake', onKeep);
  }, []);

  return (
    <section className="keepsake-strip" aria-label="Kept memories">
      <h2 className="keepsake-strip__heading">Take this with you</h2>
      {items.length === 0 ? (
        <p className="keepsake-strip__empty">
          Nothing kept yet — tap Keep on a photo, blow out the candles, or play above ↑
        </p>
      ) : (
        <div className="keepsake-strip__row" role="list">
          {items.map((item, i) => (
            <figure
              key={item.id}
              role="listitem"
              className={`keepsake-card keepsake-card--${item.kind}`}
            >
              {item.kind === 'photo' && item.imageSrc ? (
                <img
                  src={item.imageSrc}
                  alt={item.label}
                  loading="lazy"
                  className="keepsake-card__thumb"
                />
              ) : (
                <blockquote className="keepsake-card__seal">{item.label}</blockquote>
              )}
              <figcaption className="keepsake-card__meta">
                <span className="keepsake-card__index">kept {ordinal(i + 1)}</span>
                <span className="keepsake-card__label">{item.label}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      )}
    </section>
  );
}
