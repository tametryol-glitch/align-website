'use client';

/**
 * ParticleField — CSS-animated floating particles for the web VN.
 * Uses CSS keyframes and absolute positioning. No JS animation loop.
 */

import { useMemo } from 'react';

type ParticleStyle = 'embers' | 'dust' | 'stars' | 'rain' | 'none';

interface Props {
  style: ParticleStyle;
  count?: number;
  intensity?: number;
}

interface ParticleConfig {
  color: string;
  sizeRange: [number, number];
  count: number;
  opacityRange: [number, number];
  durationRange: [number, number];
  shape: 'circle' | 'streak';
  animation: string;
}

const CONFIGS: Record<Exclude<ParticleStyle, 'none'>, ParticleConfig> = {
  embers: {
    color: '#F5A623',
    sizeRange: [3, 7],
    count: 20,
    opacityRange: [0.15, 0.55],
    durationRange: [5, 10],
    shape: 'circle',
    animation: 'vn-drift-up',
  },
  dust: {
    color: '#C8C0D8',
    sizeRange: [2, 5],
    count: 16,
    opacityRange: [0.08, 0.25],
    durationRange: [8, 16],
    shape: 'circle',
    animation: 'vn-wander',
  },
  stars: {
    color: '#E8EEFF',
    sizeRange: [2, 5],
    count: 22,
    opacityRange: [0.1, 0.65],
    durationRange: [3, 8],
    shape: 'circle',
    animation: 'vn-twinkle',
  },
  rain: {
    color: '#8AB4D8',
    sizeRange: [1, 2],
    count: 28,
    opacityRange: [0.1, 0.3],
    durationRange: [1.5, 4],
    shape: 'streak',
    animation: 'vn-fall',
  },
};

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

interface ParticleData {
  id: number;
  left: string;
  top: string;
  width: number;
  height: number;
  borderRadius: string;
  opacity: number;
  duration: string;
  delay: string;
  animation: string;
  color: string;
}

export default function ParticleField({ style, count, intensity = 1 }: Props) {
  if (style === 'none') return null;

  const config = CONFIGS[style];
  const n = count ?? config.count;

  const particles = useMemo<ParticleData[]>(() => {
    return Array.from({ length: n }, (_, i) => {
      const size = rand(config.sizeRange[0], config.sizeRange[1]);
      const isStreak = config.shape === 'streak';
      return {
        id: i,
        left: `${rand(0, 100)}%`,
        top: `${rand(0, 100)}%`,
        width: isStreak ? size * 0.5 : size,
        height: isStreak ? size * 8 : size,
        borderRadius: isStreak ? `${size * 0.25}px` : '50%',
        opacity: rand(config.opacityRange[0], config.opacityRange[1]) * intensity,
        duration: `${rand(config.durationRange[0], config.durationRange[1])}s`,
        delay: `${rand(0, config.durationRange[1] * 0.6)}s`,
        animation: config.animation,
        color: config.color,
      };
    });
  }, [style, n, intensity]);

  return (
    <>
      <style>{KEYFRAMES}</style>
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {particles.map((p) => (
          <div
            key={p.id}
            style={{
              position: 'absolute',
              left: p.left,
              top: p.top,
              width: p.width,
              height: p.height,
              borderRadius: p.borderRadius,
              backgroundColor: p.color,
              opacity: p.opacity,
              animation: `${p.animation} ${p.duration} ${p.delay} infinite ease-in-out`,
            }}
          />
        ))}
      </div>
    </>
  );
}

const KEYFRAMES = `
@keyframes vn-drift-up {
  0%   { transform: translateY(0) translateX(0); opacity: 0.4; }
  25%  { transform: translateY(-25vh) translateX(12px); opacity: 1; }
  50%  { transform: translateY(-45vh) translateX(-8px); opacity: 0.7; }
  75%  { transform: translateY(-60vh) translateX(6px); opacity: 0.3; }
  100% { transform: translateY(-80vh) translateX(0); opacity: 0; }
}
@keyframes vn-wander {
  0%   { transform: translate(0, 0); opacity: 0.5; }
  25%  { transform: translate(15px, -10px); opacity: 1; }
  50%  { transform: translate(-10px, 8px); opacity: 0.6; }
  75%  { transform: translate(8px, 12px); opacity: 0.8; }
  100% { transform: translate(0, 0); opacity: 0.5; }
}
@keyframes vn-twinkle {
  0%   { transform: scale(1); opacity: 0.2; }
  50%  { transform: scale(1.6); opacity: 1; }
  100% { transform: scale(1); opacity: 0.2; }
}
@keyframes vn-fall {
  0%   { transform: translateY(0); opacity: 0.3; }
  100% { transform: translateY(80vh); opacity: 0; }
}
`;
