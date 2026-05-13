'use client';

import { useEffect, useRef, useMemo } from 'react';
import { Phone, PhoneOff } from 'lucide-react';
import Image from 'next/image';

// ── Types ────────────────────────────────────────────────────────────

interface IncomingCallOverlayProps {
  isVisible: boolean;
  callerName: string;
  callerAvatar?: string;
  callType: 'voice' | 'video';
  onAccept: () => void;
  onDecline: () => void;
}

// ── Inline keyframes (injected once) ─────────────────────────────────

const STYLE_ID = '__incoming-call-overlay-keyframes';

function ensureKeyframes() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(STYLE_ID)) return;

  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    @keyframes ico-fade-in {
      from { opacity: 0; }
      to   { opacity: 1; }
    }
    @keyframes ico-pulse-ring {
      0%   { transform: scale(1);   opacity: 0.4; }
      100% { transform: scale(2);   opacity: 0; }
    }
    @keyframes ico-twinkle {
      0%, 100% { opacity: 0.2; }
      50%      { opacity: 0.8; }
    }
  `;
  document.head.appendChild(style);
}

// ── Starfield generator ──────────────────────────────────────────────

function generateStars(count: number): { x: number; y: number; size: number; delay: number; duration: number }[] {
  const stars: { x: number; y: number; size: number; delay: number; duration: number }[] = [];
  // Use deterministic pseudo-random so SSR matches client
  let seed = 42;
  function seededRandom() {
    seed = (seed * 16807 + 0) % 2147483647;
    return (seed - 1) / 2147483646;
  }
  for (let i = 0; i < count; i++) {
    stars.push({
      x: seededRandom() * 100,
      y: seededRandom() * 100,
      size: seededRandom() * 2 + 0.5,
      delay: seededRandom() * 5,
      duration: seededRandom() * 3 + 2,
    });
  }
  return stars;
}

// ── Initials helper ──────────────────────────────────────────────────

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

// ── Component ────────────────────────────────────────────────────────

export function IncomingCallOverlay({
  isVisible,
  callerName,
  callerAvatar,
  callType,
  onAccept,
  onDecline,
}: IncomingCallOverlayProps) {
  const onDeclineRef = useRef(onDecline);
  const autoDismissRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep the ref in sync with the latest callback on every render
  onDeclineRef.current = onDecline;

  // Inject keyframes once
  useEffect(() => {
    ensureKeyframes();
  }, []);

  // Auto-dismiss after 30 seconds
  useEffect(() => {
    if (!isVisible) return;

    autoDismissRef.current = setTimeout(() => {
      onDeclineRef.current();
    }, 30_000);

    return () => {
      if (autoDismissRef.current) {
        clearTimeout(autoDismissRef.current);
        autoDismissRef.current = null;
      }
    };
  }, [isVisible]);

  // Memoize starfield so it doesn't regenerate on every render
  const stars = useMemo(() => generateStars(80), []);

  if (!isVisible) return null;

  const callLabel = callType === 'video' ? 'INCOMING VIDEO CALL' : 'INCOMING VOICE CALL';
  const initials = getInitials(callerName);

  return (
    <div
      className="fixed inset-0 z-[70] flex flex-col items-center justify-center"
      style={{
        background: 'linear-gradient(180deg, #0A0E1A 0%, #1E1145 50%, #2D1B69 100%)',
        animation: 'ico-fade-in 0.4s ease-out forwards',
      }}
    >
      {/* Starfield background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {stars.map((star, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              backgroundColor: '#FFFFFF',
              opacity: 0.2,
              animation: `ico-twinkle ${star.duration}s ease-in-out ${star.delay}s infinite`,
            }}
          />
        ))}
      </div>

      {/* Call type label */}
      <p
        className="relative z-10 text-center"
        style={{
          fontSize: '16px',
          letterSpacing: '2px',
          color: '#7B849A',
          textTransform: 'uppercase',
          marginBottom: '48px',
          fontWeight: 500,
        }}
      >
        {callLabel}
      </p>

      {/* Pulsing avatar section */}
      <div
        className="relative z-10 flex items-center justify-center"
        style={{ width: '260px', height: '260px' }}
      >
        {/* Pulse ring */}
        <div
          className="absolute rounded-full"
          style={{
            width: '120px',
            height: '120px',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            border: '2px solid #9B6FF6',
            animation: 'ico-pulse-ring 1500ms ease-out infinite',
          }}
        />

        {/* Avatar */}
        <div
          className="relative rounded-full overflow-hidden flex items-center justify-center"
          style={{
            width: '120px',
            height: '120px',
            border: '3px solid #9B6FF6',
          }}
        >
          {callerAvatar ? (
            <Image
              src={callerAvatar}
              alt={callerName}
              fill
              className="object-cover"
              sizes="120px"
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #2D1B69, #4A2D8A)',
              }}
            >
              <span
                className="font-bold"
                style={{ fontSize: '40px', color: '#FFFFFF' }}
              >
                {initials}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Caller name */}
      <p
        className="relative z-10 text-center"
        style={{
          fontSize: '24px',
          fontWeight: 700,
          color: '#FFFFFF',
          marginTop: '24px',
        }}
      >
        {callerName}
      </p>

      {/* Ringing text */}
      <p
        className="relative z-10 text-center"
        style={{
          fontSize: '16px',
          color: '#A8B0C0',
          marginTop: '4px',
        }}
      >
        Ringing...
      </p>

      {/* Accept / Decline buttons */}
      <div
        className="relative z-10 flex items-start justify-center"
        style={{ marginTop: '96px', gap: '25vw' }}
      >
        {/* Decline button */}
        <div className="flex flex-col items-center">
          <button
            type="button"
            onClick={onDecline}
            className="flex items-center justify-center transition-transform active:scale-95"
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #EF4444, #DC2626)',
              border: 'none',
              cursor: 'pointer',
            }}
            title="Decline call"
          >
            <PhoneOff
              className="text-white"
              style={{
                width: '32px',
                height: '32px',
                transform: 'rotate(135deg)',
              }}
            />
          </button>
          <span
            style={{
              fontSize: '12px',
              color: '#7B849A',
              marginTop: '8px',
            }}
          >
            Decline
          </span>
        </div>

        {/* Accept button */}
        <div className="flex flex-col items-center">
          <button
            type="button"
            onClick={onAccept}
            className="flex items-center justify-center transition-transform active:scale-95"
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #22C55E, #16A34A)',
              border: 'none',
              cursor: 'pointer',
            }}
            title="Accept call"
          >
            <Phone
              className="text-white"
              style={{ width: '32px', height: '32px' }}
            />
          </button>
          <span
            style={{
              fontSize: '12px',
              color: '#7B849A',
              marginTop: '8px',
            }}
          >
            Accept
          </span>
        </div>
      </div>
    </div>
  );
}
