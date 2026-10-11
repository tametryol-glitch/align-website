'use client';

// Web port of align-app/src/components/chat/PetCreature.tsx — same shapes, same traits,
// same behaviours (breathe, blink, hop, lean + squish while stroked, happy eyes, sick face).

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { motion, useAnimationControls } from 'framer-motion';
import { hslToHex, type PetTraits, type PetStage } from '@/lib/petTraits';

interface Props {
  traits: PetTraits;
  stage: PetStage;
  size: number;
  happy: boolean;
  sleeping?: boolean;
  sick?: boolean;
  /** Increment to trigger a hop. */
  hopKey?: number;
  /** Increment to play the "someone else is petting me" reaction. */
  remotePetKey?: number;
  streakCrown?: boolean;
  onStroke?: () => void;
  onStrokeEnd?: (total: number) => void;
  onPoke?: () => void;
}

const INK = '#26215C';

const CSS = `
@keyframes cp-br{0%,100%{transform:scale(1,1)}50%{transform:scale(1.035,.965)}}
@keyframes cp-wb{0%,100%{transform:rotate(-4deg)}50%{transform:rotate(4deg)}}
@keyframes cp-bk{0%,92%,100%{transform:scaleY(1)}95%{transform:scaleY(.08)}}
@keyframes cp-sway{0%,100%{transform:translateX(0) rotate(0)}25%{transform:translateX(6px) rotate(3deg)}75%{transform:translateX(-6px) rotate(-3deg)}}
.cp-breathe{transform-origin:50% 100%;animation:cp-br 3.2s ease-in-out infinite}
.cp-egg{transform-origin:50% 100%;animation:cp-wb 1.8s ease-in-out infinite}
.cp-blink{transform-box:fill-box;transform-origin:center;animation:cp-bk 4.5s infinite}
.cp-sway{animation:cp-sway 1.1s ease-in-out 2}
@media (prefers-reduced-motion: reduce){.cp-breathe,.cp-egg,.cp-blink,.cp-sway{animation:none}}
`;

export default function PetCreature({
  traits: T, stage, size, happy, sleeping, sick, hopKey = 0, remotePetKey = 0,
  streakCrown, onStroke, onStrokeEnd, onPoke,
}: Props) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const clipId = `cpbc${uid}`;
  const hop = useAnimationControls();
  const box = useRef<HTMLDivElement>(null);
  const st = useRef({ down: false, x: 0, y: 0, total: 0, acc: 0, t0: 0 });
  const [pressed, setPressed] = useState(false);
  const [lean, setLean] = useState(0);
  const [petting, setPetting] = useState(false);
  const [remote, setRemote] = useState(false);
  const pettingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (hopKey === 0) return;
    hop.start({
      y: [0, -size * 0.22, 0],
      scaleY: [1, 1.05, 0.94, 1],
      scaleX: [1, 0.96, 1.06, 1],
      transition: { duration: 0.55, times: [0, 0.4, 0.75, 1] },
    });
  }, [hopKey]);

  useEffect(() => {
    if (remotePetKey === 0) return;
    setRemote(true);
    const id = setTimeout(() => setRemote(false), 2200);
    return () => clearTimeout(id);
  }, [remotePetKey]);

  useEffect(() => () => { if (pettingTimer.current) clearTimeout(pettingTimer.current); }, []);

  const col = useMemo(
    () => ({
      c: hslToHex(T.hue, 68, 72),
      cd: hslToHex(T.hue, 55, 52),
      cl: hslToHex(T.hue, 80, 90),
      c2: hslToHex(T.hue2, 65, 62),
    }),
    [T.hue, T.hue2],
  );
  const { c, cd, cl, c2 } = col;
  const egg = stage === 0;
  const scale = [1, 0.78, 0.98, 1.12][stage];
  const rx = egg ? 36 : 52;
  const ry = egg ? 48 : 46;
  const eyesClosedNow = !!sleeping || petting || remote;

  function onPointerDown(e: React.PointerEvent) {
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    st.current = { down: true, x: e.clientX, y: e.clientY, total: 0, acc: 0, t0: Date.now() };
    setPressed(true);
  }
  function onPointerMove(e: React.PointerEvent) {
    const s = st.current;
    if (!s.down) return;
    const d = Math.hypot(e.clientX - s.x, e.clientY - s.y);
    if (d === 0) return;
    s.x = e.clientX;
    s.y = e.clientY;
    s.total += d;
    s.acc += d;
    if (s.total < 3) return;
    const rect = box.current?.getBoundingClientRect();
    if (rect) {
      const nx = (e.clientX - rect.left - size / 2) / (size / 2);
      setLean(Math.max(-1, Math.min(1, nx)));
    }
    if (pettingTimer.current) clearTimeout(pettingTimer.current);
    setPetting(true);
    if (s.acc >= 40) {
      s.acc = 0;
      onStroke?.();
    }
  }
  function endPointer() {
    const s = st.current;
    if (!s.down) return;
    s.down = false;
    setPressed(false);
    setLean(0);
    pettingTimer.current = setTimeout(() => setPetting(false), 600);
    if (s.total >= 3) onStrokeEnd?.(s.total);
    else if (Date.now() - s.t0 < 250) onPoke?.();
  }

  const ear = (() => {
    switch (T.ear) {
      case 0:
        return (<>
          <circle cx={-36} cy={-84} r={15} fill={c} /><circle cx={36} cy={-84} r={15} fill={c} />
          <circle cx={-36} cy={-84} r={8} fill={cl} /><circle cx={36} cy={-84} r={8} fill={cl} />
        </>);
      case 1:
        return (<>
          <polygon points="-48,-70 -38,-106 -18,-86" fill={c} /><polygon points="48,-70 38,-106 18,-86" fill={c} />
          <polygon points="-42,-76 -38,-96 -26,-84" fill={cl} /><polygon points="42,-76 38,-96 26,-84" fill={cl} />
        </>);
      case 2:
        return (<>
          <ellipse cx={-22} cy={-110} rx={10} ry={30} fill={c} transform="rotate(-10 -22 -110)" />
          <ellipse cx={22} cy={-110} rx={10} ry={30} fill={c} transform="rotate(10 22 -110)" />
          <ellipse cx={-22} cy={-110} rx={5} ry={22} fill={cl} transform="rotate(-10 -22 -110)" />
          <ellipse cx={22} cy={-110} rx={5} ry={22} fill={cl} transform="rotate(10 22 -110)" />
        </>);
      case 3:
        return (<>
          <polygon points="-30,-86 -24,-112 -14,-90" fill={c2} /><polygon points="30,-86 24,-112 14,-90" fill={c2} />
        </>);
      case 4:
        return (<>
          <path d="M-16 -88 Q-26 -112 -30 -118" stroke={cd} strokeWidth={3} fill="none" strokeLinecap="round" />
          <path d="M16 -88 Q26 -112 30 -118" stroke={cd} strokeWidth={3} fill="none" strokeLinecap="round" />
          <circle cx={-30} cy={-118} r={6} fill={c2} /><circle cx={30} cy={-118} r={6} fill={c2} />
        </>);
      default:
        return (<>
          <path d="M0 -90 Q-6 -112 -24 -114 Q-20 -96 0 -90 Z" fill="#5DCAA5" />
          <path d="M0 -90 Q8 -108 24 -108 Q20 -94 0 -90 Z" fill="#1D9E75" />
        </>);
    }
  })();

  const tail =
    T.tail === 0 ? (
      <path d="M46 -30 Q74 -34 66 -62 Q62 -74 52 -66" stroke={c} strokeWidth={9} fill="none" strokeLinecap="round" />
    ) : T.tail === 1 ? (
      <ellipse cx={56} cy={-34} rx={16} ry={12} fill={c2} transform="rotate(-20 56 -34)" />
    ) : (
      <circle cx={50} cy={-20} r={8} fill={cl} />
    );

  const pat = (() => {
    if (T.pat === 1)
      return (
        <g clipPath={`url(#${clipId})`} opacity={0.55}>
          <circle cx={-30} cy={-70} r={7} fill={cd} /><circle cx={26} cy={-30} r={9} fill={cd} />
          <circle cx={34} cy={-74} r={5} fill={cd} /><circle cx={-34} cy={-30} r={6} fill={cd} />
        </g>
      );
    if (T.pat === 2)
      return (
        <g clipPath={`url(#${clipId})`} opacity={0.5}>
          <rect x={-60} y={-92} width={120} height={7} fill={cd} transform="rotate(-8)" />
          <rect x={-60} y={-76} width={120} height={7} fill={cd} transform="rotate(-8)" />
          <rect x={-60} y={-14} width={120} height={7} fill={cd} transform="rotate(-8)" />
        </g>
      );
    if (T.pat === 3)
      return <path d="M0 -88 L3 -80 L11 -80 L5 -75 L7 -67 L0 -72 L-7 -67 L-5 -75 L-11 -80 L-3 -80 Z" fill={c2} />;
    if (T.pat === 4)
      return (
        <g clipPath={`url(#${clipId})`} opacity={0.5}>
          <rect x={-60} y={-46} width={120} height={60} fill={c2} />
        </g>
      );
    return null;
  })();

  const eb = stage === 1 ? 9 : 7;
  const ey = stage === 1 ? -52 : -56;
  const ex = stage === 1 ? -17 : -19;

  const eyesOpen =
    T.eye === 2 ? (
      <>
        <path d={`M${ex - 8} ${ey} Q${ex} ${ey + 8} ${ex + 8} ${ey}`} stroke={INK} strokeWidth={3} fill="none" strokeLinecap="round" />
        <path d={`M${-ex - 8} ${ey} Q${-ex} ${ey + 8} ${-ex + 8} ${ey}`} stroke={INK} strokeWidth={3} fill="none" strokeLinecap="round" />
      </>
    ) : (
      <>
        <ellipse cx={ex} cy={ey} rx={eb} ry={eb + 1} fill={INK} />
        <ellipse cx={-ex} cy={ey} rx={eb} ry={eb + 1} fill={INK} />
        <circle cx={ex + 2} cy={ey - 3} r={2.6} fill="#fff" />
        <circle cx={-ex + 2} cy={ey - 3} r={2.6} fill="#fff" />
        {T.eye === 1 && (
          <>
            <circle cx={ex - 3} cy={ey + 3} r={1.4} fill="#fff" />
            <circle cx={-ex - 3} cy={ey + 3} r={1.4} fill="#fff" />
          </>
        )}
      </>
    );

  const eyesClosed = (
    <>
      <path d={`M${ex - 7} ${ey + 1} Q${ex} ${ey - 5} ${ex + 7} ${ey + 1}`} stroke={INK} strokeWidth={3} fill="none" strokeLinecap="round" />
      <path d={`M${-ex - 7} ${ey + 1} Q${-ex} ${ey - 5} ${-ex + 7} ${ey + 1}`} stroke={INK} strokeWidth={3} fill="none" strokeLinecap="round" />
    </>
  );

  const sickEyes = (
    <>
      <circle cx={ex} cy={ey} r={6.5} stroke={INK} strokeWidth={2.2} fill="#fff" />
      <circle cx={ex} cy={ey} r={2.6} stroke={INK} strokeWidth={2} fill="none" />
      <circle cx={-ex} cy={ey} r={6.5} stroke={INK} strokeWidth={2.2} fill="#fff" />
      <circle cx={-ex} cy={ey} r={2.6} stroke={INK} strokeWidth={2} fill="none" />
    </>
  );

  const mouth = sick ? 'M-10 -37 Q-5 -43 0 -37 T10 -37' : happy ? 'M-7 -40 Q0 -31 7 -40' : 'M-6 -36 Q0 -41 6 -36';

  const leanStyle: React.CSSProperties = {
    transform: `translateX(${lean * size * 0.07}px) rotate(${lean * 5}deg) scale(${pressed ? 1.04 : 1}, ${pressed ? 0.94 : 1})`,
    transition: 'transform 120ms ease-out',
    transformOrigin: '50% 100%',
  };

  return (
    <div
      ref={box}
      style={{ width: size, height: size * 0.9, touchAction: 'none', cursor: 'pointer', userSelect: 'none' }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endPointer}
      onPointerCancel={endPointer}
      role="img"
      aria-label="Your shared pet. Tap to poke, drag to pet."
    >
      <style>{CSS}</style>
      <motion.div animate={hop} style={{ width: '100%', height: '100%', transformOrigin: '50% 100%' }}>
        <div className={egg ? 'cp-egg' : 'cp-breathe'} style={{ width: '100%', height: '100%' }}>
          <div className={remote ? 'cp-sway' : undefined} style={{ width: '100%', height: '100%' }}>
            <div style={{ ...leanStyle, width: '100%', height: '100%' }}>
              <svg width={size} height={size * 0.9} viewBox="-90 -135 180 150" style={{ overflow: 'visible' }}>
                <defs>
                  <clipPath id={clipId}>
                    <ellipse cx={0} cy={-46} rx={rx} ry={ry} />
                  </clipPath>
                </defs>
                <g transform={`scale(${scale})`}>
                  {T.rare && !egg && (
                    <circle cx={0} cy={-48} r={74} fill="none" stroke="#FAC775" strokeWidth={2} strokeDasharray="3 9" />
                  )}
                  {egg ? (
                    <>
                      <ellipse cx={0} cy={-46} rx={36} ry={48} fill={cl} stroke={cd} strokeWidth={2} />
                      <g clipPath={`url(#${clipId})`}>
                        <circle cx={-14} cy={-70} r={8} fill={c} />
                        <circle cx={12} cy={-48} r={10} fill={c2} />
                        <circle cx={-8} cy={-24} r={7} fill={c} />
                        <circle cx={18} cy={-78} r={5} fill={c2} />
                      </g>
                    </>
                  ) : (
                    <>
                      {tail}
                      {ear}
                      <ellipse cx={-24} cy={-4} rx={14} ry={8} fill={cd} />
                      <ellipse cx={24} cy={-4} rx={14} ry={8} fill={cd} />
                      <ellipse cx={0} cy={-46} rx={52} ry={46} fill={c} stroke={cd} strokeWidth={2} />
                      {pat}
                      <ellipse cx={0} cy={-30} rx={30} ry={24} fill={cl} opacity={0.85} />
                      {sick && <ellipse cx={0} cy={-46} rx={52} ry={46} fill="#8BC34A" opacity={0.28} />}
                      {sick ? (
                        sickEyes
                      ) : eyesClosedNow ? (
                        eyesClosed
                      ) : (
                        <g className="cp-blink">{eyesOpen}</g>
                      )}
                      <circle cx={-32} cy={-42} r={6} fill={sick ? '#9BD67A' : '#ff9db8'} opacity={0.7} />
                      <circle cx={32} cy={-42} r={6} fill={sick ? '#9BD67A' : '#ff9db8'} opacity={0.7} />
                      <path d={mouth} stroke={INK} strokeWidth={2.4} fill="none" strokeLinecap="round" />
                      {sick && <path d="M46 -92 Q40 -80 46 -76 Q52 -80 46 -92 Z" fill="#9FD8FF" />}
                      {streakCrown && stage >= 2 && (
                        <path
                          d="M-16 -98 L-12 -112 L-5 -100 L0 -114 L5 -100 L12 -112 L16 -98 Z"
                          fill="#EF9F27"
                          stroke="#BA7517"
                          strokeWidth={1.5}
                          transform={`translate(0 ${T.ear === 2 || T.ear === 4 ? -14 : 0})`}
                        />
                      )}
                    </>
                  )}
                </g>
              </svg>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
