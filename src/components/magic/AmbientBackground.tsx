import { useEffect, useRef, useState } from 'react';

interface AmbientBackgroundProps {
  intensity?: 'low' | 'medium';
}

/* ─── SVG noise filter (base64-encoded tiny SVG) ────── */
const noiseDataUri = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.4'/%3E%3C/svg%3E`;

export default function AmbientBackground({ intensity = 'low' }: AmbientBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isTabVisible, setIsTabVisible] = useState(true);
  const multiplier = intensity === 'medium' ? 1 : 0.5;

  /* Tab visibility pause */
  useEffect(() => {
    const handle = () => setIsTabVisible(!document.hidden);
    document.addEventListener('visibilitychange', handle);
    return () => document.removeEventListener('visibilitychange', handle);
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
        opacity: isTabVisible ? 1 : 0,
        transition: 'opacity 0.3s ease',
      }}
    >
      {/* Subtle grain overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url("${noiseDataUri}")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '200px 200px',
          opacity: 0.04 * multiplier,
          mixBlendMode: 'overlay' as const,
        }}
      />
      {/* Gold dust: 4-6 tiny floating dots */}
      {Array.from({ length: Math.round(4 * multiplier) }).map((_, i) => (
        <div
          key={`dust-${i}`}
          className="ambient-dust"
          style={{
            position: 'absolute',
            width: '2px',
            height: '2px',
            borderRadius: '50%',
            background: 'var(--gold, #C8A46B)',
            opacity: 0.15,
            left: `${15 + i * 18}%`,
            top: `${20 + (i % 3) * 25}%`,
            animation: `ambientDrift ${15 + i * 3}s ease-in-out ${i * 4}s infinite`,
          }}
        />
      ))}
      {/* Soft light blobs: 1-2 large blurred circles */}
      {Array.from({ length: Math.round(1 * multiplier) }).map((_, i) => (
        <div
          key={`light-${i}`}
          className="ambient-light"
          style={{
            position: 'absolute',
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            background: 'var(--gold, #C8A46B)',
            opacity: 0.04,
            filter: 'blur(40px)',
            left: `${30 + i * 40}%`,
            top: `${40 + i * 20}%`,
            animation: `ambientOrbit ${30 + i * 10}s ease-in-out ${i * 10}s infinite`,
          }}
        />
      ))}
    </div>
  );
}
