import { useCallback, useEffect, useRef, useState } from 'react';

export type BlowState = 'idle' | 'requesting' | 'listening' | 'denied' | 'error';

interface Options {
  /** Fired once, when breath is sustained long enough. */
  onBlow: () => void;
  /** Fraction of full scale. Calibrated against room noise on start. */
  threshold?: number;
  /** How long the level must stay above threshold. */
  holdMs?: number;
  /** Hard stop so a forgotten mic never stays hot. */
  timeoutMs?: number;
}

/**
 * Optional microphone breath detection.
 *
 * Nothing is recorded, stored or uploaded: the stream feeds an AnalyserNode
 * only, and every track is stopped the moment a blow is detected, the visitor
 * cancels, or the component unmounts. Permission is requested only from an
 * explicit click — never on scroll or mount.
 */
export function useBlowDetection({
  onBlow,
  threshold = 0.11,
  holdMs = 240,
  timeoutMs = 25000,
}: Options) {
  const [state, setState] = useState<BlowState>('idle');

  const onBlowRef = useRef(onBlow);
  useEffect(() => {
    onBlowRef.current = onBlow;
  }, [onBlow]);

  const streamRef = useRef<MediaStream | null>(null);
  const contextRef = useRef<AudioContext | null>(null);
  const frameRef = useRef<number | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const permissionTimerRef = useRef<number | null>(null);
  const sessionRef = useRef(0);
  const aboveSinceRef = useRef<number | null>(null);
  const stoppingRef = useRef(false);

  const stop = useCallback(() => {
    if (stoppingRef.current) return;
    stoppingRef.current = true;
    sessionRef.current += 1;

    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (permissionTimerRef.current !== null) {
      window.clearTimeout(permissionTimerRef.current);
      permissionTimerRef.current = null;
    }
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    const ctx = contextRef.current;
    contextRef.current = null;
    if (ctx && ctx.state !== 'closed') void ctx.close().catch(() => undefined);

    aboveSinceRef.current = null;
    setState((prev) => (prev === 'listening' || prev === 'requesting' ? 'idle' : prev));
    stoppingRef.current = false;
  }, []);

  const start = useCallback(async () => {
    if (state === 'requesting' || state === 'listening') return;

    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setState('error');
      return;
    }

    sessionRef.current += 1;
    const session = sessionRef.current;
    setState('requesting');

    /* If the browser never answers the permission prompt, offer the tap
       fallback instead of leaving the visitor waiting forever. */
    permissionTimerRef.current = window.setTimeout(() => {
      if (sessionRef.current !== session) return;
      sessionRef.current += 1;
      setState('error');
    }, 15000);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });

      if (permissionTimerRef.current !== null) {
        window.clearTimeout(permissionTimerRef.current);
        permissionTimerRef.current = null;
      }

      /* Cancelled or timed out while the prompt was open. */
      if (sessionRef.current !== session) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }
      streamRef.current = stream;

      const AudioCtor =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtor) {
        stop();
        setState('error');
        return;
      }

      const ctx = new AudioCtor();
      contextRef.current = ctx;
      if (ctx.state === 'suspended') await ctx.resume();

      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 1024;
      analyser.smoothingTimeConstant = 0.6;
      source.connect(analyser);

      const buffer = new Float32Array(analyser.fftSize);
      let ambientFrames = 0;
      let ambientSum = 0;
      let activeThreshold = threshold;

      setState('listening');

      const tick = () => {
        analyser.getFloatTimeDomainData(buffer);
        let sum = 0;
        for (let i = 0; i < buffer.length; i += 1) sum += buffer[i] * buffer[i];
        const rms = Math.sqrt(sum / buffer.length);

        /* First ~0.6s: learn the room so a fan or hum doesn't blow the cake. */
        if (ambientFrames < 36) {
          ambientFrames += 1;
          ambientSum += rms;
          if (ambientFrames === 36) {
            const ambient = ambientSum / 36;
            activeThreshold = Math.max(threshold, ambient * 2.6 + 0.04);
          }
          frameRef.current = requestAnimationFrame(tick);
          return;
        }

        const now = performance.now();
        if (rms > activeThreshold) {
          if (aboveSinceRef.current === null) aboveSinceRef.current = now;
          if (now - aboveSinceRef.current >= holdMs) {
            onBlowRef.current();
            stop();
            return;
          }
        } else {
          aboveSinceRef.current = null;
        }

        frameRef.current = requestAnimationFrame(tick);
      };

      frameRef.current = requestAnimationFrame(tick);

      timeoutRef.current = window.setTimeout(() => stop(), timeoutMs);
    } catch (error) {
      if (sessionRef.current !== session) return;
      if (permissionTimerRef.current !== null) {
        window.clearTimeout(permissionTimerRef.current);
        permissionTimerRef.current = null;
      }
      const name = error instanceof DOMException ? error.name : '';
      setState(name === 'NotAllowedError' || name === 'PermissionDeniedError' ? 'denied' : 'error');
      stop();
    }
  }, [holdMs, state, stop, threshold, timeoutMs]);

  useEffect(() => stop, [stop]);

  return { state, start, stop };
}
