'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  Video,
  VideoOff,
  MessageCircle,
  X,
} from 'lucide-react';

// ── Types ────────────────────────────────────────────────────────────

interface CallScreenProps {
  isOpen: boolean;
  callType: 'voice' | 'video';
  callState: 'ringing' | 'connecting' | 'active' | 'ended';
  targetUser: { id: string; name: string; avatar_url?: string };
  isOutgoing: boolean;
  duration: number;
  isMuted: boolean;
  isCameraOn: boolean;
  localVideoRef?: React.RefObject<HTMLDivElement>;
  remoteVideoRef?: React.RefObject<HTMLDivElement>;
  onToggleMute: () => void;
  onToggleCamera: () => void;
  onEndCall: () => void;
  onAcceptCall?: () => void;
  onDeclineCall?: () => void;
}

// ── Color tokens ────────────────────────────────────────────────────

const C = {
  bgPrimary: '#0a0a14',
  accent: '#9B6FF6',
  gold: '#F5A623',
  goldSecondary: '#FCC737',
  textPrimary: '#FFFFFF',
  textSecondary: '#DEE2EA',
  textMuted: '#7B849A',
  red: '#EF4444',
  green: '#22C55E',
  cyan: '#06B6D4',
} as const;

// ── Zodiac glyphs ───────────────────────────────────────────────────

const ZODIAC_GLYPHS = ['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓'];

// ── Helpers ──────────────────────────────────────────────────────────

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// ── Keyframes (injected once) ───────────────────────────────────────

const STYLE_ID = '__call-screen-keyframes';

function ensureKeyframes() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(STYLE_ID)) return;

  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    @keyframes cs-pulse-ring {
      0%   { transform: translate(-50%, -50%) scale(1);   opacity: 0.2; }
      100% { transform: translate(-50%, -50%) scale(1.7); opacity: 0; }
    }
    @keyframes cs-twinkle {
      0%, 100% { opacity: 0.2; }
      50%      { opacity: 0.7; }
    }
    @keyframes cs-fade-in {
      from { opacity: 0; transform: scale(0.95); }
      to   { opacity: 1; transform: scale(1); }
    }
    @keyframes cs-float {
      0%, 100% { transform: translateY(0); }
      50%      { transform: translateY(-8px); }
    }
  `;
  document.head.appendChild(style);
}

// ── Starfield ───────────────────────────────────────────────────────

function useStarfield() {
  return useMemo(() => {
    const rand = seededRandom(42);
    return Array.from({ length: 40 }, (_, i) => ({
      id: i,
      left: rand() * 100,
      top: rand() * 100,
      size: 1 + rand() * 2,
      opacity: 0.2 + rand() * 0.4,
      isGold: i % 7 === 0,
      delay: rand() * 5,
    }));
  }, []);
}

// ── Floating zodiac positions for video overlay ─────────────────────

function useFloatingZodiacs() {
  return useMemo(() => {
    const rand = seededRandom(99);
    return ZODIAC_GLYPHS.map((glyph, i) => ({
      glyph,
      left: 5 + rand() * 90,
      top: 10 + rand() * 75,
      opacity: 0.15 + rand() * 0.15,
      size: 16 + rand() * 12,
      delay: i * 0.8,
    }));
  }, []);
}

// ── Sub-components ──────────────────────────────────────────────────

function Starfield({ stars }: { stars: ReturnType<typeof useStarfield> }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute rounded-full"
          style={{
            left: `${star.left}%`,
            top: `${star.top}%`,
            width: star.size,
            height: star.size,
            backgroundColor: star.isGold ? C.gold : '#FFFFFF',
            opacity: star.opacity,
            animation: `cs-twinkle ${3 + star.delay}s ease-in-out infinite`,
            animationDelay: `${star.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

function CosmicBackground() {
  return (
    <div
      className="absolute inset-0"
      style={{
        background: 'linear-gradient(180deg, #070B14 0%, #0E1225 50%, #1A1040 100%)',
      }}
    />
  );
}

function ProtectedBadge() {
  return (
    <div
      className="flex items-center justify-center gap-1.5 px-3 py-1"
      style={{ opacity: 0.5 }}
    >
      <span className="text-xs" style={{ color: C.gold, fontSize: 12 }}>
        ✨ Cosmically Protected
      </span>
    </div>
  );
}

function Avatar({
  avatarUrl,
  name,
  size = 80,
  showPulse = false,
}: {
  avatarUrl?: string;
  name: string;
  size?: number;
  showPulse?: boolean;
}) {
  const initial = (name || '?')[0].toUpperCase();

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {showPulse && (
        <div
          className="absolute rounded-full"
          style={{
            width: size,
            height: size,
            left: '50%',
            top: '50%',
            border: `2px solid ${C.gold}`,
            animation: 'cs-pulse-ring 2400ms ease-out infinite',
          }}
        />
      )}
      <div
        className="rounded-full overflow-hidden flex items-center justify-center flex-shrink-0"
        style={{
          width: size,
          height: size,
          backgroundColor: 'rgba(155, 111, 246, 0.3)',
        }}
      >
        {avatarUrl ? (
          <img src={avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
        ) : (
          <span
            className="font-bold"
            style={{
              color: C.accent,
              fontSize: size * 0.4,
            }}
          >
            {initial}
          </span>
        )}
      </div>
    </div>
  );
}

function ZodiacWheel({ size = 220 }: { size?: number }) {
  const radius1 = size / 2;
  const radius2 = size / 2 - 12;
  const radius3 = size / 2 - 24;
  const glyphRadius = (radius2 + radius3) / 2;

  return (
    <div
      className="absolute pointer-events-none"
      style={{
        width: size,
        height: size,
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
      }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={radius1}
          cy={radius1}
          r={radius1 - 1}
          fill="none"
          stroke={C.gold}
          strokeWidth={0.5}
          opacity={0.2}
        />
        <circle
          cx={radius1}
          cy={radius1}
          r={radius2}
          fill="none"
          stroke={C.gold}
          strokeWidth={0.5}
          opacity={0.15}
        />
        <circle
          cx={radius1}
          cy={radius1}
          r={radius3}
          fill="none"
          stroke={C.gold}
          strokeWidth={0.5}
          opacity={0.1}
        />
      </svg>
      {ZODIAC_GLYPHS.map((glyph, i) => {
        const angle = (i * 30 - 90) * (Math.PI / 180);
        const x = radius1 + glyphRadius * Math.cos(angle);
        const y = radius1 + glyphRadius * Math.sin(angle);
        return (
          <span
            key={i}
            className="absolute"
            style={{
              left: x,
              top: y,
              transform: 'translate(-50%, -50%)',
              color: C.gold,
              fontSize: 14,
              opacity: 0.5,
            }}
          >
            {glyph}
          </span>
        );
      })}
    </div>
  );
}

function GlassTray({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="absolute bottom-0 left-0 right-0 flex items-center justify-center px-6 py-8"
      style={{
        backgroundColor: 'rgba(12, 16, 32, 0.88)',
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        borderTop: '1px solid rgba(245, 166, 35, 0.12)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
    >
      {children}
    </div>
  );
}

function EndCallPill({ onPress }: { onPress: () => void }) {
  return (
    <button
      type="button"
      onClick={onPress}
      className="flex items-center gap-2 px-8 py-3.5 transition-opacity hover:opacity-80 active:opacity-60"
      style={{
        backgroundColor: C.red,
        borderRadius: 28,
      }}
    >
      <Phone
        className="w-5 h-5"
        style={{
          color: '#FFFFFF',
          transform: 'rotate(135deg)',
        }}
      />
      <span className="text-white text-sm font-semibold">End Call</span>
    </button>
  );
}

function ControlButton({
  isActive,
  onPress,
  children,
}: {
  isActive: boolean;
  onPress: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onPress}
      className="flex items-center justify-center transition-all hover:opacity-80 active:opacity-60"
      style={{
        width: 56,
        height: 56,
        borderRadius: '50%',
        backgroundColor: isActive
          ? 'rgba(245, 166, 35, 0.15)'
          : 'rgba(255, 255, 255, 0.05)',
        border: `1.5px solid ${isActive ? C.goldSecondary : C.gold}`,
      }}
    >
      {children}
    </button>
  );
}

// ── Main Component ──────────────────────────────────────────────────

export function CallScreen({
  isOpen,
  callType,
  callState,
  targetUser,
  isOutgoing,
  duration,
  isMuted,
  isCameraOn,
  localVideoRef,
  remoteVideoRef,
  onToggleMute,
  onToggleCamera,
  onEndCall,
  onAcceptCall,
  onDeclineCall,
}: CallScreenProps) {
  const [visible, setVisible] = useState(isOpen);
  const stars = useStarfield();
  const floatingZodiacs = useFloatingZodiacs();

  useEffect(() => {
    ensureKeyframes();
  }, []);

  useEffect(() => {
    if (isOpen) setVisible(true);
  }, [isOpen]);

  if (!visible && !isOpen) return null;

  const isVideoActive = callState === 'active' && callType === 'video';

  // ── RINGING state ──────────────────────────────────────────────

  const renderRinging = () => (
    <div className="relative flex flex-col items-center justify-center flex-1 z-10">
      <div className="absolute top-12 left-0 right-0 flex justify-center">
        <ProtectedBadge />
      </div>

      <div className="relative flex items-center justify-center" style={{ width: 220, height: 220 }}>
        <ZodiacWheel size={220} />
        <Avatar
          avatarUrl={targetUser.avatar_url}
          name={targetUser.name}
          size={80}
          showPulse={true}
        />
      </div>

      <p
        className="mt-5 font-bold"
        style={{ color: C.textPrimary, fontSize: 24 }}
      >
        {targetUser.name}
      </p>
      <p
        className="mt-1"
        style={{ color: C.gold, fontSize: 15, opacity: 0.6 }}
      >
        Calling...
      </p>

      <GlassTray>
        <div className="flex items-center gap-6">
          {!isOutgoing && onAcceptCall && (
            <button
              type="button"
              onClick={onAcceptCall}
              className="flex items-center gap-2 px-8 py-3.5 transition-opacity hover:opacity-80 active:opacity-60"
              style={{
                backgroundColor: C.green,
                borderRadius: 28,
              }}
            >
              <Phone className="w-5 h-5 text-white" />
              <span className="text-white text-sm font-semibold">Accept</span>
            </button>
          )}
          <EndCallPill onPress={isOutgoing ? onEndCall : (onDeclineCall ?? onEndCall)} />
        </div>
      </GlassTray>
    </div>
  );

  // ── CONNECTING state ───────────────────────────────────────────

  const renderConnecting = () => (
    <div className="relative flex flex-col items-center justify-center flex-1 z-10">
      <div className="absolute top-12 left-0 right-0 flex justify-center">
        <ProtectedBadge />
      </div>

      <div className="relative flex items-center justify-center" style={{ width: 220, height: 220 }}>
        <ZodiacWheel size={220} />
        <Avatar
          avatarUrl={targetUser.avatar_url}
          name={targetUser.name}
          size={80}
          showPulse={true}
        />
      </div>

      <p
        className="mt-5 font-bold"
        style={{ color: C.textPrimary, fontSize: 24 }}
      >
        {targetUser.name}
      </p>
      <p
        className="mt-1"
        style={{ color: C.gold, fontSize: 15, opacity: 0.6 }}
      >
        Connecting...
      </p>

      <GlassTray>
        <EndCallPill onPress={onEndCall} />
      </GlassTray>
    </div>
  );

  // ── ACTIVE VOICE state ─────────────────────────────────────────

  const renderActiveVoice = () => (
    <div className="relative flex flex-col items-center justify-center flex-1 z-10">
      <div className="relative flex items-center justify-center" style={{ width: 220, height: 220 }}>
        <ZodiacWheel size={220} />
        <Avatar
          avatarUrl={targetUser.avatar_url}
          name={targetUser.name}
          size={80}
          showPulse={false}
        />
      </div>

      <p
        className="mt-5 font-bold"
        style={{ color: C.textPrimary, fontSize: 24 }}
      >
        {targetUser.name}
      </p>
      <p
        className="mt-2"
        style={{
          color: C.gold,
          fontSize: 17,
          fontWeight: 500,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {formatDuration(duration)}
      </p>

      <GlassTray>
        <div className="flex items-center" style={{ gap: 28 }}>
          <ControlButton isActive={isMuted} onPress={onToggleMute}>
            {isMuted ? (
              <MicOff className="w-6 h-6" style={{ color: C.textPrimary }} />
            ) : (
              <Mic className="w-6 h-6" style={{ color: C.textPrimary }} />
            )}
          </ControlButton>
          <EndCallPill onPress={onEndCall} />
        </div>
      </GlassTray>
    </div>
  );

  // ── ACTIVE VIDEO state ─────────────────────────────────────────

  const renderActiveVideo = () => (
    <div className="relative w-full h-full z-10">
      {/* Remote video — keep this div clean for Agora to inject <video> */}
      <div
        ref={remoteVideoRef}
        className="absolute inset-0"
        style={{ backgroundColor: '#000000' }}
      />

      {/* Local PiP */}
      <div
        ref={localVideoRef}
        className="absolute overflow-hidden z-20"
        style={{
          top: 16,
          right: 16,
          width: 120,
          height: 160,
          borderRadius: 12,
          border: `2px solid ${C.gold}`,
          backgroundColor: 'rgba(10, 10, 20, 0.8)',
        }}
      />

      {/* Top gradient overlay — name & duration */}
      <div
        className="absolute top-0 left-0 right-0 z-20 flex items-center gap-3 px-5 pt-4 pb-10"
        style={{
          background: 'linear-gradient(to bottom, rgba(7,11,20,0.7) 0%, transparent 100%)',
        }}
      >
        <div
          className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: 'rgba(155, 111, 246, 0.3)' }}
        >
          {targetUser.avatar_url ? (
            <img src={targetUser.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
          ) : (
            <span className="font-bold" style={{ color: C.accent, fontSize: 16 }}>
              {(targetUser.name || '?')[0].toUpperCase()}
            </span>
          )}
        </div>
        <div>
          <p className="font-semibold" style={{ color: C.textPrimary, fontSize: 15 }}>
            {targetUser.name}
          </p>
          <p
            style={{
              color: C.gold,
              fontSize: 13,
              fontWeight: 500,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {formatDuration(duration)}
          </p>
        </div>
      </div>

      {/* Floating zodiac glyphs */}
      {floatingZodiacs.map((z, i) => (
        <span
          key={i}
          className="absolute pointer-events-none z-10"
          style={{
            left: `${z.left}%`,
            top: `${z.top}%`,
            color: C.gold,
            opacity: z.opacity,
            fontSize: z.size,
            animation: `cs-float ${4 + z.delay}s ease-in-out infinite`,
            animationDelay: `${z.delay}s`,
          }}
        >
          {z.glyph}
        </span>
      ))}

      {/* Bottom controls — transparent floating bar */}
      <div
        className="absolute bottom-0 left-0 right-0 z-30 flex items-center justify-center px-6 pb-6 pt-10"
        style={{
          background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 100%)',
        }}
      >
        <div className="flex items-center" style={{ gap: 24 }}>
          <ControlButton isActive={isMuted} onPress={onToggleMute}>
            {isMuted ? (
              <MicOff className="w-5 h-5" style={{ color: C.textPrimary }} />
            ) : (
              <Mic className="w-5 h-5" style={{ color: C.textPrimary }} />
            )}
          </ControlButton>

          <button
            type="button"
            onClick={onEndCall}
            className="flex items-center justify-center transition-opacity hover:opacity-80 active:opacity-60"
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              backgroundColor: C.red,
            }}
          >
            <Phone
              className="w-5 h-5"
              style={{ color: '#FFFFFF', transform: 'rotate(135deg)' }}
            />
          </button>

          <ControlButton isActive={!isCameraOn} onPress={onToggleCamera}>
            {isCameraOn ? (
              <Video className="w-5 h-5" style={{ color: C.textPrimary }} />
            ) : (
              <VideoOff className="w-5 h-5" style={{ color: C.textPrimary }} />
            )}
          </ControlButton>
        </div>
      </div>
    </div>
  );

  // ── ENDED state ────────────────────────────────────────────────

  const renderEnded = () => (
    <div
      className="relative flex flex-col items-center justify-center flex-1 z-10"
      style={{ animation: 'cs-fade-in 0.3s ease-out' }}
    >
      <div
        className="flex flex-col items-center px-10 py-10 relative overflow-hidden"
        style={{
          backgroundColor: 'rgba(18, 22, 42, 0.9)',
          borderRadius: 24,
          border: '1px solid rgba(155, 111, 246, 0.2)',
          minWidth: 300,
        }}
      >
        {/* Gold accent line at top */}
        <div
          className="absolute top-0 left-0 right-0"
          style={{
            height: 2,
            background: `linear-gradient(90deg, transparent 0%, ${C.gold} 50%, transparent 100%)`,
          }}
        />

        <p
          className="mt-2"
          style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: 16 }}
        >
          Call with {targetUser.name}
        </p>
        <p
          className="mt-2 font-bold"
          style={{ color: C.textPrimary, fontSize: 20 }}
        >
          Ended
        </p>
        <p
          className="mt-4"
          style={{
            color: C.gold,
            fontSize: 40,
            fontWeight: 300,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {formatDuration(duration)}
        </p>

        {/* Action buttons */}
        <div className="flex items-center gap-3 mt-8">
          <button
            type="button"
            onClick={onEndCall}
            className="flex items-center gap-2 px-5 py-2.5 transition-opacity hover:opacity-80 active:opacity-60"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: 12,
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <MessageCircle className="w-4 h-4" style={{ color: C.cyan }} />
            <span style={{ color: C.textSecondary, fontSize: 14 }}>Message</span>
          </button>
          <button
            type="button"
            onClick={onEndCall}
            className="flex items-center gap-2 px-5 py-2.5 transition-opacity hover:opacity-80 active:opacity-60"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: 12,
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <Phone className="w-4 h-4" style={{ color: C.cyan }} />
            <span style={{ color: C.textSecondary, fontSize: 14 }}>Call Back</span>
          </button>
        </div>

        {/* Dismiss */}
        <button
          type="button"
          onClick={onEndCall}
          className="mt-5 transition-opacity hover:opacity-60"
          style={{ color: C.textMuted, fontSize: 13 }}
        >
          Dismiss
        </button>
      </div>
    </div>
  );

  // ── Main layout ────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 z-[60] flex flex-col" style={{ backgroundColor: C.bgPrimary }}>
      {/* Background layer */}
      {!isVideoActive && (
        <>
          <CosmicBackground />
          <Starfield stars={stars} />
        </>
      )}

      {/* Content */}
      <div className={`relative flex-1 flex ${isVideoActive ? '' : 'flex-col'}`}>
        {callState === 'ringing' && renderRinging()}
        {callState === 'connecting' && renderConnecting()}
        {callState === 'active' && callType === 'voice' && renderActiveVoice()}
        {callState === 'active' && callType === 'video' && renderActiveVideo()}
        {callState === 'ended' && renderEnded()}
      </div>
    </div>
  );
}
