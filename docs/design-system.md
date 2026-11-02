# Design System v2 — "Luxury editorial + romantic fantasy"

Phase 1 foundation. Every token below lives in `src/index.css`; the v1 tokens were
left untouched so existing sections keep their exact appearance while new chapters
opt into the richer palette.

## Palette

| Token | Hex | Use |
| --- | --- | --- |
| `--ivory-0` | `#FDFAF6` | page base |
| `--ivory-1` | `#F8F0E7` | alternating section |
| `--blush-1` | `#F3E3DC` | soft panels, hover washes |
| `--blush-2` | `#E7CFC5` | hairlines, pressed-flower shapes |
| `--dusty-rose` | `#B26E63` | large accent text, icons, active states |
| `--dusty-rose-deep` | `#8A4B42` | AA-safe accent copy on ivory |
| `--champagne` | `#D8B98D` | metallic rules, wax highlights |
| `--champagne-deep` | `#A97C4F` | metal gradient end |
| `--ink` | `#2A211C` | body + headings |
| `--ink-soft` | `#6E5D52` | captions, metadata |
| `--glass-bg` | `rgba(255,252,247,.62)` | glass panels |
| `--hairline` | `rgba(42,33,28,.12)` | 1px rules |

**Contrast law.** Body copy uses `--ink` (≥7:1). Accent copy uses
`--dusty-rose-deep` (≥4.5:1). `--champagne` and `--gold` are decoration only —
never small text. Rose stays around 10% of the page; ivory and champagne carry it.

## Type

| Role | Face | Size |
| --- | --- | --- |
| Display | Playfair Display 500 | `clamp(3rem, 7vw, 6.5rem)` / 0.98 |
| Section H2 | Playfair Display 600 | `clamp(1.9rem, 3.6vw, 2.9rem)` / 1.1 |
| Eyebrow | Inter 500 | 0.68rem, `0.18em`, uppercase |
| Body | Inter 400 | 1rem / 1.7, max 68ch |
| Lead | Inter 300 | 1.0625–1.125rem / 1.7 |
| Hand | Caveat | 1.5rem, annotations only |

Utilities: `.u-display`, `.u-h2`, `.u-lead`, `.u-body`, `.u-hand`, `.eyebrow`.

## Layout

- 4px base; section rhythm `clamp(4.5rem, 9vw, 8rem)` (`--section-rhythm`).
- Containers: prose 680, editorial 1100, gallery 1280.
- Radii: 2 / 8 / 16 / 24 / pill.

## Materials

One material per object.

- **Paper** — warm off-white + 2% grain. Readable content.
- **Glass** — 16px blur, 1px white top highlight, soft shadow. Overlays and controls only.
- **Wax** — radial `#D8A24A → #8A5A1E`. Seals.
- **Champagne metal** — 135° `#F3DFC0 → #D8B98D → #A97C4F`. Rules and letterforms.

## Motion

| Token | Value |
| --- | --- |
| `--motion-fast` | 160ms |
| `--motion-base` | 280ms |
| `--motion-slow` | 560ms |
| `--motion-cinematic` | 1000ms |
| Standard easing | `--ease-out-expo` |
| Soft spring | `--ease-soft-spring` (no overshoot > 1.1) |

**Laws.** Animate transform / opacity / filter only. Max 24 ambient particles on
desktop, 10 on mobile. One primary motion per viewport. `prefers-reduced-motion`
removes transforms, parallax, flips, confetti physics and auto-advance — states
become instant but still legible.

## Primitives

| File | Purpose |
| --- | --- |
| `components/system/SectionShell.tsx` | chapter frame: rhythm, gutter, width, tone |
| `components/system/Reveal.tsx` | the one scroll reveal (opacity + 24px rise) |
| `components/system/Eyebrow.tsx` | small uppercase label |
| `components/system/GlassCard.tsx` | `paper` / `glass` material card |
| `components/system/ModalSheet.tsx` | portal sheet, focus trap, ESC, scroll lock |
| `hooks/usePrefersReducedMotion.ts` | motion gate for all new components |
| `hooks/useMediaQuery.ts` | responsive behaviour in JS |
| `hooks/useFocusTrap.ts` | overlay keyboard contract |
| `hooks/useLocalStorage.ts` | guarded persistence |
| `hooks/useSingleAudio.ts` | one voice note / track at a time |

## Accessibility contract

- AA contrast; 44px minimum targets; visible `:focus-visible` ring defined globally.
- Every overlay is keyboard-openable, Escape-closable and returns focus.
- Audio never autoplays; every clip gets a transcript toggle.
- `aria-live="polite"` for wish, gift and finale state changes.
