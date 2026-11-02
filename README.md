# Swethaaa · 19

A candlelit birthday site for Swethaaa — sealed entry, a cinematic photo hero, nineteen
reasons, five framed photographs with stories on the back, a three-tier cake wish,
three gifts (two real voice notes and a promise), a letter, a guestbook, a
constellation finale and a small playground. Cream, rose gold and warm film grain
throughout.

Built with React 19, TypeScript, Vite and Framer Motion.

## Run locally

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # static build in dist/
npm run preview
```

## Personalising

| What | Where |
| --- | --- |
| Copy, letter, reasons | `src/components/*.tsx` |
| Hero + frame photos | `public/images/luna/` |
| Playground photos | `public/images/moments/` |
| Music | `public/music/the-blessing.mp3` |
| Gift voice notes | `public/audio/voice-note-01.mp3`, `voice-note-02.mp3` |
| Page metadata | `index.html` |

The guestbook runs in local demo mode (wishes live in `localStorage`). To collect
real wishes, set `VITE_FORMSPREE_ENDPOINT` (e.g. `https://formspree.io/f/xxxx`) in
`.env` at build time.

## Deploy

`npm run build` produces a fully static `dist/` — drop it on Netlify, Vercel,
Cloudflare Pages or GitHub Pages. For GitHub Pages, publish `dist/` on a `gh-pages`
branch (or use Actions); the site has no server-side requirements.

**Private repo note:** GitHub Pages only publishes from private repositories on a
paid GitHub plan. Netlify, Vercel and Cloudflare Pages all deploy private repos for
free. If the repo must stay private and free, deploy there and keep GitHub as the
source of truth.
