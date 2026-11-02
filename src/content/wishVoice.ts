/**
 * The wish voice note.
 *
 * Dev records the birthday wish out loud, then drops the file at
 * `public/audio/wish-voice.mp3` and flips `ready` to `true`. Until then the
 * whole block stays out of the page — no broken player, no missing-file flash.
 *
 * Steps live in README.md → "Adding the wish voice note".
 */
export const WISH_VOICE = {
  /** Flip to `true` once the file below exists in `public/audio/`. */
  ready: false,
  src: '/audio/wish-voice.mp3',
  /** Rough length in seconds, shown only until the file's metadata loads. */
  approx: 30,
  title: 'The wish, out loud',
  lead: 'I said it out loud so you could keep the sound, not just the words.',
};
