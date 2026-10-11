'use client';

// Web port of align-app/src/components/chat/HatchAnimation.tsx — same sequence & timing:
// egg shakes harder, cracks spread, flash, shell splits and falls, baby springs out in confetti.

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { hslToHex, type PetTraits } from '@/lib/petTraits';
import PetCreature from './PetCreature';

const DUR = 3.6;
const BURST = 0.52;
const EGG_W = 150;
const EGG_H = 159;

const CRACK: Array<[number, number]> = [
  [-50, -50], [-34, -40], [-20, -58], [-6, -42], [8, -60], [22, -44], [36, -56], [50, -46],
];
const crackPts = CRACK.map(([x, y]) => `${x},${y}`).join(' L');
const TOP_CLIP = `M-50,-110 L${crackPts} L50,-110 Z`;
const BOTTOM_CLIP = `M${crackPts} L50,20 L-50,20 Z`;
const CONFETTI = ['#FAC775', '#FF7AA8', '#7F77DD', '#5DCAA5', '#85B7EB', '#F09595'];

interface Props {
  traits: PetTraits;
  name: string;
  onDone: () => void;
}

export default function HatchAnimation({ traits: T, name, onDone }: Props) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const [burst, setBurst] = useState(false);
  const [hopKey, setHopKey] = useState(0);
  // The parent re-renders constantly (hearts, presence, timers). Keep the callback in a ref so the
  // sequence's timers start once and are never reset mid-animation.
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  const col = useMemo(
    () => ({
      c: hslToHex(T.hue, 68, 72),
      cd: hslToHex(T.hue, 55, 52),
      cl: hslToHex(T.hue, 80, 90),
      c2: hslToHex(T.hue2, 65, 62),
    }),
    [T.hue, T.hue2],
  );

  useEffect(() => {
    const vib = (ms: number) => { try { navigator.vibrate?.(ms); } catch { /* not supported */ } };
    const timers = [
      setTimeout(() => vib(10), 500),
      setTimeout(() => vib(10), 900),
      setTimeout(() => vib(10), 1250),
      setTimeout(() => vib(20), 1600),
      setTimeout(() => { vib(60); setBurst(true); setHopKey(1); }, DUR * BURST * 1000),
      setTimeout(() => doneRef.current(), (DUR + 0.7) * 1000),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  const eggId = (k: string) => `eggclip_${k}_${uid}`;
  const eggBody = (k: string) => (
    <>
      <defs>
        <clipPath id={eggId(k)}>
          <ellipse cx={0} cy={-46} rx={36} ry={48} />
        </clipPath>
      </defs>
      <ellipse cx={0} cy={-46} rx={36} ry={48} fill={col.cl} stroke={col.cd} strokeWidth={2} />
      <g clipPath={`url(#${eggId(k)})`}>
        <circle cx={-14} cy={-70} r={8} fill={col.c} />
        <circle cx={12} cy={-48} r={10} fill={col.c2} />
        <circle cx={-8} cy={-24} r={7} fill={col.c} />
        <circle cx={18} cy={-78} r={5} fill={col.c2} />
      </g>
    </>
  );

  const abs: React.CSSProperties = { position: 'absolute', left: 0, top: 0, width: EGG_W, height: EGG_H };
  const crackSvg = (d: string, delay: number) => (
    <motion.div
      style={abs}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay, duration: 0.05 }}
    >
      <svg width={EGG_W} height={EGG_H} viewBox="-50 -100 100 106">
        <path d={d} stroke={col.cd} strokeWidth={2} fill="none" strokeLinecap="round" />
      </svg>
    </motion.div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      style={{
        position: 'absolute', inset: 0, zIndex: 20, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(#1d1a3a,#2b2656)',
      }}
    >
      <motion.div
        aria-hidden
        style={{ position: 'absolute', width: 260, height: 260, borderRadius: 130, background: '#FAC775' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.35, 0.9, 0, 0] }}
        transition={{ duration: DUR, times: [0, BURST * 0.9, BURST, BURST + 0.12, 1], ease: 'linear' }}
      />
      <div style={{ position: 'relative', width: 220, height: 190, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div
          aria-hidden
          style={{ position: 'absolute', width: 120, height: 120, borderRadius: 60, background: '#fff' }}
          initial={{ opacity: 0, scale: 0.2 }}
          animate={{ opacity: [0, 0, 0.95, 0], scale: [0.2, 0.2, 1.2, 3.4] }}
          transition={{ duration: DUR, times: [0, BURST - 0.02, BURST + 0.04, BURST + 0.16], ease: 'easeOut' }}
        />

        <motion.div
          style={{ position: 'relative', width: EGG_W, height: EGG_H }}
          animate={{ rotate: [0, -2, 2, -4, 4, -7, 7, -11, 11, -13, 0] }}
          transition={{ duration: DUR * BURST, ease: 'linear' }}
        >
          <motion.div
            style={abs}
            animate={burst ? { x: -34, y: [-0, -80, -20], rotate: -38, opacity: [1, 1, 0] } : {}}
            transition={{ duration: DUR * 0.26 }}
          >
            <svg width={EGG_W} height={EGG_H} viewBox="-50 -100 100 106">
              <defs><clipPath id={`ht${uid}`}><path d={TOP_CLIP} /></clipPath></defs>
              <g clipPath={`url(#ht${uid})`}>{eggBody('t')}</g>
            </svg>
          </motion.div>
          <motion.div
            style={abs}
            animate={burst ? { x: 26, y: 26, rotate: 18, opacity: [1, 1, 0] } : {}}
            transition={{ duration: DUR * 0.26 }}
          >
            <svg width={EGG_W} height={EGG_H} viewBox="-50 -100 100 106">
              <defs><clipPath id={`hb${uid}`}><path d={BOTTOM_CLIP} /></clipPath></defs>
              <g clipPath={`url(#hb${uid})`}>{eggBody('b')}</g>
            </svg>
          </motion.div>
          {!burst && crackSvg('M-6 -42 L-2 -52 L-9 -58', DUR * 0.16)}
          {!burst && crackSvg('M8 -60 L14 -50 L10 -42 L20 -36', DUR * 0.28)}
          {!burst && crackSvg('M-20 -58 L-26 -48 L-20 -42 L-30 -34', DUR * 0.4)}
        </motion.div>

        {burst && (
          <motion.div
            style={{ position: 'absolute', width: EGG_W, height: EGG_H * 0.9, display: 'flex', justifyContent: 'center' }}
            initial={{ opacity: 0, scale: 0.15, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 150, damping: 8 }}
          >
            <PetCreature traits={T} stage={1} size={150} happy hopKey={hopKey} />
          </motion.div>
        )}

        {burst &&
          Array.from({ length: 18 }, (_, i) => {
            const angle = (i / 18) * Math.PI * 2 + (i % 2) * 0.2;
            const dist = 78 + (i % 4) * 22;
            const size = 6 + (i % 3) * 2;
            return (
              <motion.span
                key={i}
                aria-hidden
                style={{
                  position: 'absolute', width: size, height: size * 0.6, borderRadius: 2,
                  background: CONFETTI[i % CONFETTI.length], pointerEvents: 'none',
                }}
                initial={{ opacity: 1, x: 0, y: 0, rotate: 0 }}
                animate={{
                  opacity: [1, 1, 0],
                  x: Math.cos(angle) * dist,
                  y: [0, Math.sin(angle) * dist, Math.sin(angle) * dist + 46],
                  rotate: 360 * (i % 2 ? 1 : -1),
                }}
                transition={{ duration: DUR * 0.42, ease: 'easeOut' }}
              />
            );
          })}
      </div>

      <motion.p
        style={{ marginTop: 8, color: '#FAC775', fontSize: 20, fontWeight: 700 }}
        initial={{ opacity: 0, y: 10 }}
        animate={burst ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: DUR * 0.22, duration: 0.4 }}
      >
        {name} hatched!
      </motion.p>
    </motion.div>
  );
}
