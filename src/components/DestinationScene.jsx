import React from 'react';

/**
 * Ambient animated "nature scene" layers for destination pages.
 * Pure CSS (see `scene-*` classes in index.css) — no extra image requests,
 * and animations are disabled for prefers-reduced-motion users.
 *
 * Scenes: aurora (Reykjavík), petals (Kyoto), sunglow (Lisbon/Barcelona),
 * coast (Cape Town), canopy (Medellín).
 */

// Fixed configs (not Math.random) so particles don't jump on re-renders.
const DRIFTERS = [
  { left: '6%', delay: '0s', duration: '13s', size: 10 },
  { left: '18%', delay: '3.2s', duration: '16s', size: 7 },
  { left: '31%', delay: '1.4s', duration: '12s', size: 9 },
  { left: '44%', delay: '5s', duration: '17s', size: 6 },
  { left: '58%', delay: '2.2s', duration: '14s', size: 10 },
  { left: '69%', delay: '6.4s', duration: '15s', size: 7 },
  { left: '81%', delay: '0.8s', duration: '13.5s', size: 8 },
  { left: '92%', delay: '4.1s', duration: '18s', size: 6 },
];

const FIREFLIES = [
  { left: '8%', top: '58%', delay: '0s', duration: '6s' },
  { left: '22%', top: '72%', delay: '1.6s', duration: '7.5s' },
  { left: '35%', top: '48%', delay: '3s', duration: '5.5s' },
  { left: '52%', top: '66%', delay: '0.9s', duration: '8s' },
  { left: '64%', top: '42%', delay: '2.4s', duration: '6.5s' },
  { left: '78%', top: '70%', delay: '4s', duration: '7s' },
  { left: '88%', top: '52%', delay: '1.2s', duration: '6s' },
];

const DestinationScene = ({ scene, compact = false, className = '' }) => {
  if (!scene) return null;

  return (
    <div
      className={`scene-layer ${compact ? 'scene-compact' : ''} ${className}`}
      aria-hidden="true"
    >
      {scene === 'aurora' && (
        <>
          <div className="scene-stars" />
          <div
            className="scene-aurora"
            style={{
              top: '2%',
              background:
                'linear-gradient(100deg, transparent 5%, rgba(74,222,128,0.55) 32%, rgba(45,212,191,0.45) 55%, rgba(139,92,246,0.4) 78%, transparent 95%)',
            }}
          />
          <div
            className="scene-aurora"
            style={{
              top: '24%',
              animationDelay: '-7s',
              animationDuration: '24s',
              background:
                'linear-gradient(80deg, transparent 8%, rgba(139,92,246,0.4) 38%, rgba(74,222,128,0.35) 68%, transparent 92%)',
            }}
          />
        </>
      )}

      {scene === 'petals' && (
        <>
          <div className="scene-mist" style={{ top: '52%' }} />
          <div className="scene-mist" style={{ top: '74%', animationDelay: '-13s' }} />
          {DRIFTERS.map((petal, index) => (
            <span
              key={index}
              className="scene-petal"
              style={{
                left: petal.left,
                width: petal.size,
                height: Math.round(petal.size * 0.8),
                animationDelay: petal.delay,
                animationDuration: petal.duration,
                background:
                  'linear-gradient(135deg, rgba(251,207,232,0.95), rgba(244,114,182,0.75))',
              }}
            />
          ))}
        </>
      )}

      {scene === 'sunglow' && (
        <>
          <div
            className="scene-sun"
            style={{
              top: '-14%',
              right: '-6%',
              width: '46%',
              aspectRatio: '1',
              background:
                'radial-gradient(circle, rgba(253,224,71,0.7) 0%, rgba(251,146,60,0.3) 50%, transparent 72%)',
            }}
          />
          <div
            className="scene-mist"
            style={{
              top: '62%',
              background:
                'linear-gradient(90deg, transparent, rgba(253,186,116,0.22) 45%, transparent)',
            }}
          />
        </>
      )}

      {scene === 'coast' && (
        <>
          <div
            className="scene-mist"
            style={{
              top: '6%',
              height: '26%',
              background:
                'linear-gradient(90deg, transparent, rgba(255,255,255,0.22) 40%, rgba(255,255,255,0.14) 65%, transparent)',
            }}
          />
          <div className="scene-mist" style={{ top: '20%', height: '22%', animationDelay: '-11s' }} />
          <div className="scene-shimmer" />
        </>
      )}

      {scene === 'canopy' && (
        <>
          <div
            className="scene-sun"
            style={{
              bottom: '-18%',
              left: '-10%',
              width: '55%',
              aspectRatio: '1',
              background:
                'radial-gradient(circle, rgba(74,222,128,0.35) 0%, rgba(16,185,129,0.18) 55%, transparent 75%)',
            }}
          />
          {FIREFLIES.map((firefly, index) => (
            <span
              key={index}
              className="scene-firefly"
              style={{
                left: firefly.left,
                top: firefly.top,
                animationDelay: firefly.delay,
                animationDuration: firefly.duration,
              }}
            />
          ))}
        </>
      )}
    </div>
  );
};

export default DestinationScene;
