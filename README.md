# Luna · 19

A candlelit birthday site for Luna — sealed entry, a cinematic photo hero, nineteen
reasons, five framed photographs, a cake wish, a letter, a guestbook and a small
playground. Cream, rose gold and warm film grain throughout.

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
| Music | `public/music/perfect.mp3` |
| Page metadata | `index.html` |

The guestbook runs in local demo mode (wishes live in `localStorage`). To collect
real wishes, set `VITE_FORMSPREE_ENDPOINT` (e.g. `https://formspree.io/f/xxxx`) in
`.env` at build time.

## Deploy

`npm run build` produces a fully static `dist/` — drop it on Netlify, Vercel,
Cloudflare Pages or GitHub Pages. For GitHub Pages, publish `dist/` on a `gh-pages`
branch (or use Actions); the site has no server-side requirements.
