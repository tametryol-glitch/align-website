'use client';

/**
 * TarotOracle — the Align tarot reader, a painterly oracle portrait
 * (generated once via the backend gpt-image-1 avatar pipeline, shipped as a
 * static asset — zero per-use cost) animated with framer-motion overlays:
 * breathing, pulsing aura, voice ripples, and a flickering speaking-light.
 *
 * Exports:
 *  - TarotOracle           inline portrait for the reading card
 *  - OracleSpeakingOverlay full-screen "she is reading to you" mode shown
 *                          while the voice is preparing or speaking
 */

import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

export type OracleVoiceState = 'idle' | 'preparing' | 'speaking';

function OraclePortrait({
  size,
  speaking,
  preparing = false,
}: {
  size: number;
  speaking: boolean;
  preparing?: boolean;
}) {
  const pulseDuration = speaking ? 1.2 : 4.6;

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size * 1.3, height: size * 1.3 }}
    >
      {/* Violet aura glow */}
      <motion.div
        key={speaking ? 'glow-fast' : 'glow-slow'}
        className="absolute rounded-full"
        style={{
          width: size * 1.22,
          height: size * 1.22,
          background:
            'radial-gradient(circle, rgba(139,92,246,0.45) 0%, rgba(139,92,246,0.12) 55%, transparent 75%)',
        }}
        animate={{ opacity: [0.5, 1, 0.5], scale: [0.96, 1.08, 0.96] }}
        transition={{ duration: pulseDuration, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* Gold ring */}
      <motion.div
        key={speaking ? 'ring-fast' : 'ring-slow'}
        className="absolute rounded-full border"
        style={{
          width: size * 1.12,
          height: size * 1.12,
          borderColor: 'rgba(255, 215, 0, 0.4)',
        }}
        animate={{ opacity: [0.25, 0.7, 0.25], scale: [1, 1.04, 1] }}
        transition={{ duration: pulseDuration, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* Voice ripples while she speaks */}
      {speaking &&
        [0, 1, 2].map((i) => (
          <motion.div
            key={`ripple-${i}`}
            className="absolute rounded-full border"
            style={{ width: size, height: size, borderColor: 'rgba(167, 139, 250, 0.45)' }}
            initial={{ scale: 1, opacity: 0.5 }}
            animate={{ scale: 1.45, opacity: 0 }}
            transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.6, ease: 'easeOut' }}
          />
        ))}
      {/* The portrait, breathing gently */}
      <motion.div
        className="relative overflow-hidden rounded-full"
        style={{
          width: size,
          height: size,
          boxShadow: '0 0 40px rgba(139, 92, 246, 0.35), 0 0 80px rgba(139, 92, 246, 0.15)',
        }}
        animate={{ scale: [1, 1.015, 1] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Image
          src="/oracle-portrait.png"
          alt="The Oracle"
          fill
          sizes={`${Math.ceil(size * 1.5)}px`}
          className="object-cover"
        />
        {/* Warm light flickering over her mouth and the candle glow while speaking */}
        {(speaking || preparing) && (
          <motion.div
            className="absolute left-1/2 -translate-x-1/2"
            style={{
              top: '42%',
              width: size * 0.36,
              height: size * 0.22,
              background: 'radial-gradient(ellipse, rgba(255, 200, 120, 0.5) 0%, transparent 70%)',
              filter: 'blur(6px)',
            }}
            animate={
              speaking
                ? { opacity: [0.15, 0.7, 0.3, 0.85, 0.2, 0.65, 0.25] }
                : { opacity: [0.1, 0.3, 0.1] }
            }
            transition={{ duration: speaking ? 1.1 : 2.4, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}
      </motion.div>
    </div>
  );
}

/** Inline oracle shown at the top of the reading card. */
export function TarotOracle({ isSpeaking }: { isSpeaking: boolean }) {
  return (
    <div className="pointer-events-none mx-auto mb-3 flex select-none items-center justify-center">
      <OraclePortrait size={120} speaking={isSpeaking} />
    </div>
  );
}

/**
 * Full-screen speaking mode — the oracle takes center stage above the dimmed
 * reading while the voice prepares and plays. Click the backdrop or the stop
 * control to end playback.
 */
export function OracleSpeakingOverlay({
  state,
  onStop,
  preparingLabel,
  speakingLabel,
  stopLabel,
}: {
  state: OracleVoiceState;
  onStop: () => void;
  preparingLabel: string;
  speakingLabel: string;
  stopLabel: string;
}) {
  return (
    <AnimatePresence>
      {state !== 'idle' && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
        >
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onStop} />
          <motion.div
            className="relative flex flex-col items-center gap-5 px-6 text-center"
            initial={{ scale: 0.92, y: 12 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 8 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          >
            <OraclePortrait size={260} speaking={state === 'speaking'} preparing={state === 'preparing'} />
            <p className="text-lg font-medium text-white/90">
              {state === 'preparing' ? preparingLabel : speakingLabel}
            </p>
            {state === 'preparing' && (
              <div className="flex gap-1.5">
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: 'rgba(252, 211, 77, 0.8)' }}
                    animate={{ opacity: [0.2, 1, 0.2], y: [0, -4, 0] }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                  />
                ))}
              </div>
            )}
            <button
              onClick={onStop}
              className="mt-1 flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/20"
            >
              {'⏹'} {stopLabel}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default TarotOracle;
