import { useCallback, useEffect, useRef } from 'react';

/**
 * One-audio-at-a-time registry.
 *
 * Voice notes, the gift boxes and the music player all share it, so pressing
 * play anywhere pauses whatever else was speaking. Module scope is deliberate:
 * the rule is global, not per component.
 */
let activeAudio: HTMLAudioElement | null = null;
let activePause: (() => void) | null = null;

export function claimAudio(audio: HTMLAudioElement, pause: () => void): void {
  if (activeAudio && activeAudio !== audio) activePause?.();
  activeAudio = audio;
  activePause = pause;
}

export function releaseAudio(audio: HTMLAudioElement): void {
  if (activeAudio !== audio) return;
  activeAudio = null;
  activePause = null;
}

/**
 * Register an element as the sole source of audio. `pause` is called when
 * another source takes over.
 */
export function useSingleAudio(
  ref: React.RefObject<HTMLAudioElement | null>,
  pause: () => void,
): { onPlay: () => void; onEnded: () => void } {
  const pauseRef = useRef(pause);
  useEffect(() => {
    pauseRef.current = pause;
  }, [pause]);

  const onPlay = useCallback(() => {
    const el = ref.current;
    if (el) claimAudio(el, () => pauseRef.current());
  }, [ref]);

  const onEnded = useCallback(() => {
    const el = ref.current;
    if (el) releaseAudio(el);
  }, [ref]);

  useEffect(() => {
    const el = ref.current;
    return () => {
      if (el) releaseAudio(el);
    };
  }, [ref]);

  return { onPlay, onEnded };
}
