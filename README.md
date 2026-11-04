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
| Wish voice note | `public/audio/wish-voice.mp3` + `src/content/wishVoice.ts` |
| Page metadata | `index.html` |

## Adding the wish voice note

The player under the sealed cake message is already built and reserved. It stays
hidden until the recording is in place, so nothing looks broken in the meantime.

1. Put the recording at `public/audio/wish-voice.mp3`.
2. Keep it phone-friendly — mono, 96–128 kbps, and trim long silences:

   ```bash
   ffmpeg -i "recording.m4a" -ac 1 -b:a 112k -af silenceremove=start_periods=1:start_threshold=-45dB \
     public/audio/wish-voice.mp3
   ```

3. In `src/content/wishVoice.ts`, set `ready: true` and update `approx` to the real
   length in seconds (shown only until the file's metadata loads).
4. Check it locally: open the cake section, blow out the candles, and press play.
   Want to see the slot before the file exists? Add `?wishvoice=1` to the URL — it
   renders the block with an existing note as a stand-in.
5. `npm run build`, then redeploy.

The player obeys the site-wide one-audio-at-a-time rule, so it pauses the music or
a gift note when it starts.

The wish wall is a fixed collection of four wishes written for Swethaaa — there is
no public form, so nothing can be added or changed from the page.

## Deploy

`npm run build` produces a fully static `dist/` — drop it on Netlify, Vercel,
Cloudflare Pages or GitHub Pages. For GitHub Pages, publish `dist/` on a `gh-pages`
branch (or use Actions); the site has no server-side requirements.

**Private repo note:** GitHub Pages only publishes from private repositories on a
paid GitHub plan. Netlify, Vercel and Cloudflare Pages all deploy private repos for
free. If the repo must stay private and free, deploy there and keep GitHub as the
source of truth.
