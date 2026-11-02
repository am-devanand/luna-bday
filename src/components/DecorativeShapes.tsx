import { memo } from 'react';
import './DecorativeShapes.css';

interface Shape {
  id: number;
  type: 'circle' | 'dot' | 'squiggle' | 'triangle';
  x: number;   /* percentage left */
  y: number;   /* percentage top */
  size: number; /* px */
  color: string;
  rotation: number;
  delay: number; /* animation delay in seconds */
}

/* Generate deterministic-ish set of shapes */
const SHAPES: Shape[] = [
  { id: 1,  type: 'circle',   x: 5,  y: 12,  size: 24,  color: 'var(--gold)',         rotation: 0,   delay: 0 },
  { id: 5,  type: 'dot',      x: 50, y: 8,   size: 8,   color: 'var(--gold)',          rotation: 0,   delay: 1.2 },
  { id: 6,  type: 'circle',   x: 70, y: 75,  size: 20,  color: 'rgba(200,164,107,0.25)', rotation: 0,   delay: 0.4 },
  { id: 8,  type: 'dot',      x: 40, y: 92,  size: 5,   color: 'var(--gold)',          rotation: 0,   delay: 1.0 },
  { id: 10, type: 'circle',   x: 20, y: 35,  size: 16,  color: 'rgba(200,164,107,0.15)', rotation: 0,   delay: 1.1 },
  { id: 12, type: 'dot',      x: 75, y: 88,  size: 6,   color: 'var(--gold-dark)',     rotation: 0,   delay: 0.8 },
];

const SQUIGGLE_PATH = 'M0,10 C10,0 20,20 30,10 C40,0 50,20 60,10';

function ShapeElement({ shape }: { shape: Shape }) {
  const style: React.CSSProperties = {
    position: 'absolute',
    left: `${shape.x}%`,
    top: `${shape.y}%`,
    width: shape.type === 'squiggle' ? shape.size * 1.2 : shape.size,
    height: shape.type === 'squiggle' ? shape.size * 0.4 : shape.size,
    transform: `rotate(${shape.rotation}deg)`,
    opacity: 0,
    animation: `shapeFadeIn 1s ease-out ${shape.delay}s forwards`,
    pointerEvents: 'none',
    zIndex: 0,
  };

  if (shape.type === 'circle') {
    return (
      <div
        className="deco-shape deco-shape--circle"
        style={{ ...style, borderRadius: '50%', border: `2px solid ${shape.color}` }}
        aria-hidden="true"
      />
    );
  }

  if (shape.type === 'dot') {
    return (
      <div
        className="deco-shape deco-shape--dot"
        style={{ ...style, borderRadius: '50%', background: shape.color }}
        aria-hidden="true"
      />
    );
  }

  if (shape.type === 'triangle') {
    return (
      <div className="deco-shape deco-shape--triangle" style={style} aria-hidden="true">
        <svg viewBox="0 0 24 24" width={shape.size} height={shape.size}>
          <polygon points="12,2 22,22 2,22" fill={shape.color} opacity="0.6" />
        </svg>
      </div>
    );
  }

  /* squiggle */
  return (
    <div className="deco-shape deco-shape--squiggle" style={style} aria-hidden="true">
      <svg viewBox="0 0 60 20" width={shape.size * 1.2} height={shape.size * 0.4}>
        <path d={SQUIGGLE_PATH} stroke={shape.color} strokeWidth="2" fill="none" opacity="0.5" />
      </svg>
    </div>
  );
}

function DecorativeShapes() {
  return (
    <div className="decorative-shapes" aria-hidden="true">
      {SHAPES.map((shape) => (
        <ShapeElement key={shape.id} shape={shape} />
      ))}
    </div>
  );
}

export default memo(DecorativeShapes);