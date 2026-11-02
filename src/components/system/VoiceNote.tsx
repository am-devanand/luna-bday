import { useRef, useState } from 'react';
import { useSingleAudio } from '../../hooks/useSingleAudio';
import './VoiceNote.css';

/* ─── Waveform ────────────────────────────────────────────── */

const WAVE = Array.from({ length: 40 }, (_, i) => {
  const raw = Math.sin(i * 12.9898 + 4.1414) * 43758.5453;
  const frac = raw - Math.floor(raw);
  return 0.28 + frac * 0.72;
});

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/* ─── Voice player ────────────────────────────────────────── */

interface VoiceNoteProps {
  src: string;
  /** Shown until the file's metadata loads — preload is deliberately off. */
  approx?: number;
  title: string;
  className?: string;
}

/**
 * Shared voice-note player. Used by the gift boxes and by the wish voice
 * note beside the cake, so both obey the global one-audio-at-a-time rule.
 */
export default function VoiceNote({ src, approx = 0, title, className }: VoiceNoteProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [failed, setFailed] = useState(false);

  const { onPlay: claim, onEnded: release } = useSingleAudio(audioRef, () => {
    audioRef.current?.pause();
  });

  const toggle = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      try {
        await audio.play();
      } catch {
        setFailed(true);
      }
    } else {
      audio.pause();
    }
  };

  const total = duration || approx;
  const progress = total > 0 ? Math.min(1, current / total) : 0;

  return (
    <div className={`voice-note${className ? ` ${className}` : ''}`}>
      <audio
        ref={audioRef}
        src={src}
        preload="none"
        onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
        onTimeUpdate={(event) => setCurrent(event.currentTarget.currentTime)}
        onPlay={() => {
          setPlaying(true);
          claim();
        }}
        onPause={() => setPlaying(false)}
        onEnded={() => {
          setPlaying(false);
          setCurrent(0);
          release();
        }}
        onError={() => setFailed(true)}
      />

      <button
        type="button"
        className="voice-note__play"
        onClick={toggle}
        aria-label={playing ? `Pause ${title}` : `Play ${title}`}
      >
        {playing ? (
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
            <rect x="7" y="5" width="3.4" height="14" rx="1.2" fill="currentColor" />
            <rect x="13.6" y="5" width="3.4" height="14" rx="1.2" fill="currentColor" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
            <path d="M8.5 5.6v12.8a.8.8 0 0 0 1.22.68l10.1-6.4a.8.8 0 0 0 0-1.36L9.72 4.92a.8.8 0 0 0-1.22.68z" fill="currentColor" />
          </svg>
        )}
      </button>

      <div
        className="voice-note__wave"
        role="progressbar"
        aria-label={`${title} progress`}
        aria-valuemin={0}
        aria-valuemax={Math.round(total)}
        aria-valuenow={Math.round(current)}
      >
        {WAVE.map((height, i) => {
          const filled = (i + 0.5) / WAVE.length <= progress;
          return (
            <span
              key={i}
              className={`voice-note__bar${filled ? ' is-filled' : ''}`}
              style={{ height: `${Math.round(height * 100)}%` }}
            />
          );
        })}
      </div>

      <span className="voice-note__time">
        {formatTime(current)} <span aria-hidden="true">/</span> {formatTime(total)}
      </span>

      {failed && (
        <p className="voice-note__error" role="status">
          This browser won&apos;t play the file — ask me in person instead.
        </p>
      )}
    </div>
  );
}
