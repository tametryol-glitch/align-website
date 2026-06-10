'use client';

/**
 * TarotOracle — animated "Cosmic Oracle" avatar for the tarot reading page.
 *
 * Web port of the mobile component (align-app/src/components/TarotOracle.tsx).
 * Pure framer-motion + CSS — no media assets. The oracle breathes and blinks
 * while idle, and pseudo-lip-syncs (rhythmic mouth movement + faster aura
 * pulse) while `isSpeaking` is true. Keep the props stable so a rigged
 * Rive/Lottie character can replace the internals later.
 */

import { motion } from 'framer-motion';

interface TarotOracleProps {
  isSpeaking: boolean;
}

export function TarotOracle({ isSpeaking }: TarotOracleProps) {
  return (
    <div className="relative mx-auto mb-2 flex h-[140px] w-[150px] items-center justify-center pointer-events-none select-none">
      {/* Gold aura ring */}
      <motion.div
        key={isSpeaking ? 'ring-fast' : 'ring-slow'}
        className="absolute h-[134px] w-[134px] rounded-full border"
        style={{ borderColor: 'rgba(255, 215, 0, 0.35)' }}
        animate={{ opacity: [0.2, 0.55, 0.2], scale: [1, 1.06, 1] }}
        transition={{ duration: isSpeaking ? 1.4 : 4.8, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* Violet aura glow */}
      <motion.div
        key={isSpeaking ? 'aura-fast' : 'aura-slow'}
        className="absolute h-28 w-28 rounded-full"
        style={{ backgroundColor: 'rgba(139, 92, 246, 0.22)' }}
        animate={{ opacity: [0.35, 0.85, 0.35], scale: [0.95, 1.1, 0.95] }}
        transition={{ duration: isSpeaking ? 1.4 : 4.8, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Twinkling accents */}
      <motion.span
        className="absolute left-7 top-1.5 text-[11px]"
        style={{ color: 'rgba(255, 215, 0, 0.7)' }}
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
      >
        {'✦'}
      </motion.span>
      <motion.span
        className="absolute right-5 top-5 text-[9px]"
        style={{ color: 'rgba(255, 215, 0, 0.7)' }}
        animate={{ opacity: [1, 0.3, 1] }}
        transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
      >
        {'✧'}
      </motion.span>
      <motion.span
        className="absolute bottom-3.5 left-5 text-[8px]"
        style={{ color: 'rgba(255, 215, 0, 0.7)' }}
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      >
        {'✦'}
      </motion.span>

      {/* The oracle figure — slow breathing */}
      <motion.div
        animate={{ scale: [1, 1.03, 1] }}
        transition={{ duration: 5.2, repeat: Infinity, ease: 'easeInOut' }}
        className="relative"
      >
        {/* Hood */}
        <div
          className="flex h-24 w-[88px] items-center justify-center border"
          style={{
            background: 'linear-gradient(to bottom, #2d1b69, #1a103a, #13092e)',
            borderColor: 'rgba(139, 92, 246, 0.45)',
            borderRadius: '44px 44px 18px 18px',
          }}
        >
          {/* Face */}
          <div
            className="flex h-[60px] w-[54px] flex-col items-center justify-center"
            style={{ backgroundColor: '#0d0823', borderRadius: 27 }}
          >
            {/* Eyes — blink every ~4s */}
            <div className="mb-2.5 flex gap-3.5">
              {[0, 1].map((i) => (
                <motion.div
                  key={i}
                  className="h-1.5 w-[9px] rounded"
                  style={{
                    backgroundColor: '#C4B5FD',
                    boxShadow: '0 0 6px rgba(196, 181, 253, 0.9)',
                  }}
                  animate={{ scaleY: [1, 1, 0.1, 1] }}
                  transition={{ duration: 4, times: [0, 0.93, 0.95, 1], repeat: Infinity }}
                />
              ))}
            </div>
            {/* Mouth — varied rhythm while speaking, settled when idle */}
            <motion.div
              key={isSpeaking ? 'mouth-talking' : 'mouth-still'}
              className="rounded"
              style={{ backgroundColor: '#A78BFA' }}
              animate={
                isSpeaking
                  ? {
                      height: [3, 10, 4, 8, 2, 11, 5, 9, 3],
                      width: [18, 14, 17, 15, 18, 13, 16, 14, 18],
                      opacity: [0.6, 1, 0.7, 0.95, 0.55, 1, 0.75, 0.95, 0.6],
                    }
                  : { height: 2.5, width: 18, opacity: 0.55 }
              }
              transition={
                isSpeaking
                  ? { duration: 0.85, repeat: Infinity, ease: 'easeInOut' }
                  : { duration: 0.22 }
              }
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default TarotOracle;
