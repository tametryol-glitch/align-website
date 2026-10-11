'use client';

// Web port of align-app/src/components/chat/ChatPet.tsx. One pet per 1:1 chat, shared with
// the app: same table, same RPCs, same live channel. A web person and an app person are the
// same pair, so they see the same creature, stats, name and live reactions.

import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useChatPet, usePetLive } from '@/lib/chatPetService';
import {
  deriveTraits, defaultName, stageForXp, stageProgress, liveStats, liveStreak, moodFor,
  todayFlags, isSick, sickMinutesLeft, SICK_MINUTES, STAGE_NAMES,
} from '@/lib/petTraits';
import PetCreature from './PetCreature';
import HatchAnimation from './HatchAnimation';

interface Props {
  conversationId: string;
  myId: string;
  otherId: string;
  otherName: string;
}

const STARS = Array.from({ length: 16 }, (_, i) => ({
  x: ((i * 37) % 100) / 100,
  y: ((i * 53) % 55) / 100,
  s: 1 + (i % 3) * 0.6,
  d: (i % 5) * 0.3,
}));

const CSS = `
@keyframes cpc-tw{0%,100%{opacity:.25}50%{opacity:1}}
.cpc-star{position:absolute;border-radius:2px;background:#fff;animation:cpc-tw 2.8s ease-in-out infinite}
@media (prefers-reduced-motion: reduce){.cpc-star{animation:none;opacity:.6}}
`;

function vibrate(ms: number) {
  try { navigator.vibrate?.(ms); } catch { /* unsupported */ }
}

function Bar({ value, color, label }: { value: number; color: string; label: string }) {
  return (
    <div style={{ flex: 1 }}>
      <div style={{ color: '#B8B5E0', fontSize: 10, marginBottom: 3 }}>{label}</div>
      <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.14)', overflow: 'hidden' }}>
        <div style={{ width: `${Math.max(3, Math.min(100, value))}%`, height: '100%', borderRadius: 3, background: color, transition: 'width 600ms' }} />
      </div>
    </div>
  );
}

export function ChatPet({ conversationId, myId, otherId, otherName }: Props) {
  const { pet, loaded, act, rename } = useChatPet(conversationId);
  const traits = useMemo(() => deriveTraits(myId, otherId), [myId, otherId]);
  const firstName = otherName.split(' ')[0] || 'They';
  const [expanded, setExpanded] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [hopKey, setHopKey] = useState(0);
  const [remoteKey, setRemoteKey] = useState(0);
  const [hearts, setHearts] = useState<number[]>([]);
  const [sleeping, setSleeping] = useState(false);
  const [levelUp, setLevelUp] = useState<string | null>(null);
  const [hatching, setHatching] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [, setTick] = useState(0);
  const [renameOpen, setRenameOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [renameBusy, setRenameBusy] = useState(false);
  const [renameError, setRenameError] = useState<string | null>(null);
  const lastPetRpc = useRef(0);
  const lastStrokeSend = useRef(0);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevXp = useRef<number | null>(null);
  const prevStage = useRef<number | null>(null);
  const prevSickUntil = useRef<string | null | undefined>(undefined);
  const heartId = useRef(0);
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const minKey = `chat_pet_min_${conversationId}`;
  useEffect(() => {
    try { setMinimized(localStorage.getItem(minKey) === '1'); } catch { /* private mode */ }
  }, [minKey]);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 30000);
    return () => {
      clearInterval(id);
      if (toastTimer.current) clearTimeout(toastTimer.current);
      if (pressTimer.current) clearTimeout(pressTimer.current);
    };
  }, []);

  const xp = pet?.xp ?? 0;
  const stage = stageForXp(xp);
  const name = pet?.name || defaultName(traits);

  const burst = (n: number) => {
    const ids = Array.from({ length: n }, () => ++heartId.current);
    setHearts((h) => [...h, ...ids]);
    setTimeout(() => setHearts((h) => h.filter((x) => !ids.includes(x))), 2200);
  };
  const showToast = (msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2800);
  };

  const { partnerHere, send } = usePetLive(conversationId, myId, (e) => {
    if (e.kind === 'stroke' || e.kind === 'pet') {
      setSleeping(false); setRemoteKey((k) => k + 1); burst(1);
      showToast(`${firstName} is petting ${name}`);
    } else if (e.kind === 'poke') {
      setSleeping(false); setHopKey((k) => k + 1); burst(1);
    } else if (e.kind === 'feed') {
      setSleeping(false); setHopKey((k) => k + 1); burst(2);
      showToast(`${firstName} fed ${name}`);
    } else if (e.kind === 'play') {
      setSleeping(false); setHopKey((k) => k + 1); burst(3);
      showToast(`${firstName} is playing with ${name}`);
    } else if (e.kind === 'sleep') {
      setSleeping(true);
      showToast(`${firstName} put ${name} to sleep`);
    } else if (e.kind === 'wake') {
      setSleeping(false);
    }
  });

  useEffect(() => {
    if (!loaded) return;
    if (prevXp.current !== null && xp > prevXp.current) {
      setSleeping(false); setHopKey((k) => k + 1); burst(3);
    }
    if (prevStage.current !== null && stage > prevStage.current) {
      if (prevStage.current === 0 && stage === 1) {
        setExpanded(true);
        setHatching(true);
      } else {
        vibrate(60);
        setLevelUp(`${name} grew into a ${STAGE_NAMES[stage].toLowerCase()}`);
        setTimeout(() => setLevelUp(null), 3200);
      }
    }
    prevXp.current = xp;
    prevStage.current = stage;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [xp, stage, loaded]);

  // Tell both people when the pet gets sick (the other person gets it over realtime).
  useEffect(() => {
    if (!loaded) return;
    const cur = pet?.sick_until ?? null;
    if (prevSickUntil.current !== undefined && cur && cur !== prevSickUntil.current && pet && isSick(pet)) {
      vibrate(30);
      showToast(`${name} ate too much and has an upset stomach for ${SICK_MINUTES} min`);
    }
    prevSickUntil.current = cur;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pet?.sick_until, loaded]);

  const stats = pet ? liveStats(pet) : { fed: 70, joy: 60 };
  const streak = pet ? liveStreak(pet) : 0;
  const flags = pet ? todayFlags(pet, myId) : { me: false, them: false };
  const sick = pet ? isSick(pet) : false;
  const sickLeft = pet ? sickMinutesLeft(pet) : 0;
  const mood = moodFor(stats.fed, stats.joy, sick);
  const moodText = sleeping ? 'Sleeping'
    : mood === 'sick' ? `Upset stomach · ${sickLeft}m`
    : mood === 'hungry' ? 'Hungry'
    : mood === 'lonely' ? 'Wants company'
    : mood === 'happy' ? 'Happy' : 'Content';

  function onStroke() {
    vibrate(8);
    setSleeping(false);
    burst(1);
    const now = Date.now();
    if (now - lastStrokeSend.current > 350) {
      lastStrokeSend.current = now;
      send('stroke');
    }
  }
  async function onStrokeEnd(total: number) {
    if (total < 120 || !pet) return;
    const now = Date.now();
    if (now - lastPetRpc.current < 15000) return;
    lastPetRpc.current = now;
    vibrate(30);
    await act('pet');
  }
  function onPoke() {
    vibrate(8);
    setSleeping(false);
    setHopKey((k) => k + 1);
    burst(1);
    send('poke');
  }

  async function onAction(a: 'feed' | 'play') {
    if (!pet) return;
    if (a === 'feed' && sick) {
      showToast(`${name} has an upset stomach. Try again in ${sickLeft} min`);
      return;
    }
    setSleeping(false);
    const row = await act(a);
    if (!row) { showToast("Couldn't do that. Try again"); return; }
    if (a === 'feed' && isSick(row)) return;
    setHopKey((k) => k + 1);
    burst(2);
    send(a);
  }

  function toggleSleep() {
    const next = !sleeping;
    setSleeping(next);
    send(next ? 'sleep' : 'wake');
  }

  function toggleMin() {
    const next = !minimized;
    setMinimized(next);
    if (next) setExpanded(false);
    try { localStorage.setItem(minKey, next ? '1' : '0'); } catch { /* private mode */ }
  }

  function openRename() {
    setDraft(pet?.name || defaultName(traits));
    setRenameError(null);
    setRenameOpen(true);
  }
  async function saveName() {
    if (!pet) { setRenameError('Send a message first. The egg needs to hatch before it can be named.'); return; }
    setRenameBusy(true);
    const ok = await rename(draft);
    setRenameBusy(false);
    if (!ok) { setRenameError("Couldn't save the name. Try again."); return; }
    setRenameOpen(false);
    setHopKey((k) => k + 1);
    burst(2);
  }

  // Long-press the name on an egg for ~1.2s to preview the hatching animation.
  function nameDown() {
    if (stage !== 0) return;
    pressTimer.current = setTimeout(() => { pressTimer.current = null; setExpanded(true); setHatching(true); }, 1200);
  }
  function nameUp() {
    if (pressTimer.current) { clearTimeout(pressTimer.current); pressTimer.current = null; }
  }

  if (minimized) {
    return (
      <button
        onClick={toggleMin}
        className="w-full flex items-center px-4 py-1.5 text-left border-b border-border-primary"
        style={{ background: '#1d1a3a', color: '#CECBF6', fontSize: 12 }}
        aria-label="Show pet"
      >
        <span>{name} · {STAGE_NAMES[stage]}</span>
        {streak > 0 && <span style={{ marginLeft: 8 }}>🔥 {streak}</span>}
        {sick && <span style={{ marginLeft: 8 }}>· upset stomach</span>}
        <span style={{ marginLeft: 'auto' }}>Show</span>
      </button>
    );
  }

  const size = expanded ? 170 : 74;
  const btn = 'flex-1 rounded-xl py-2 text-sm font-semibold text-white';

  return (
    <div
      className="relative overflow-hidden border-b border-border-primary shrink-0"
      style={{ background: 'linear-gradient(#1d1a3a,#2b2656)', minHeight: hatching ? 320 : undefined, transition: 'min-height 240ms' }}
    >
      <style>{CSS}</style>
      {STARS.map((s, i) => (
        <span key={i} aria-hidden className="cpc-star" style={{ left: `${s.x * 100}%`, top: `${s.y * 100}%`, width: s.s, height: s.s, animationDelay: `${s.d}s` }} />
      ))}

      <div style={expanded ? { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '6px 16px 12px' } : { display: 'flex', alignItems: 'center', padding: '8px 14px' }}>
        <div style={expanded ? { height: 160, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' } : { width: 84, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <PetCreature
            traits={traits}
            stage={stage}
            size={size}
            happy={mood === 'happy' || mood === 'okay'}
            sick={sick}
            sleeping={sleeping}
            hopKey={hopKey}
            remotePetKey={remoteKey}
            streakCrown={streak >= 7}
            onStroke={onStroke}
            onStrokeEnd={onStrokeEnd}
            onPoke={onPoke}
          />
          {sleeping && <span style={{ position: 'absolute', top: 8, right: 70, color: '#CECBF6', fontSize: 12 }}>z z z</span>}
        </div>

        <div style={expanded ? { alignSelf: 'stretch', marginTop: 6 } : { flex: 1, marginLeft: 6, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 6 }}>
            <button
              onClick={openRename}
              onPointerDown={nameDown}
              onPointerUp={nameUp}
              onPointerLeave={nameUp}
              style={{ flex: 1, textAlign: 'left', minWidth: 0 }}
              aria-label={`Rename ${name}`}
            >
              <div style={{ color: '#fff', fontSize: 15, fontWeight: 600 }} className="truncate">
                {name} <span style={{ color: '#B8B5E0', fontSize: 12, fontWeight: 400 }}>✎</span>
              </div>
              <div style={{ color: sick ? '#A3E635' : '#B8B5E0', fontSize: 11, marginTop: 1 }}>
                {STAGE_NAMES[stage]}{traits.rare ? ' · Rare' : ''} · {moodText}
              </div>
              {partnerHere && (
                <div style={{ display: 'flex', alignItems: 'center', marginTop: 2 }}>
                  <span style={{ width: 7, height: 7, borderRadius: 4, background: '#22C55E', marginRight: 5 }} />
                  <span style={{ color: '#6EE7B7', fontSize: 11 }}>{firstName} is here now</span>
                </div>
              )}
            </button>
            <span style={{ background: 'rgba(245,166,35,0.18)', borderRadius: 999, padding: '4px 10px', marginRight: 56, color: '#FCC737', fontSize: 13, fontWeight: 600 }}>
              🔥 {streak}
            </span>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <Bar label="Fed" value={stats.fed} color="#EF9F27" />
            <Bar label="Joy" value={stats.joy} color="#D4537E" />
            <Bar label="Growth" value={stageProgress(xp) * 100} color="#1D9E75" />
          </div>

          <AnimatePresence initial={false}>
            {expanded && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 }}>
                  <span style={{ color: '#B8B5E0', fontSize: 12, flex: 1 }}>Today&apos;s care</span>
                  <span style={{ padding: '3px 10px', borderRadius: 999, fontSize: 12, background: flags.me ? 'rgba(16,185,129,0.25)' : 'rgba(255,255,255,0.1)', color: flags.me ? '#6EE7B7' : '#B8B5E0' }}>You</span>
                  <span className="truncate" style={{ padding: '3px 10px', borderRadius: 999, fontSize: 12, maxWidth: 96, background: flags.them ? 'rgba(16,185,129,0.25)' : 'rgba(255,255,255,0.1)', color: flags.them ? '#6EE7B7' : '#B8B5E0' }}>{firstName}</span>
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                  <button className={btn} style={{ background: sick ? 'rgba(255,255,255,0.08)' : 'rgba(155,111,246,0.28)', color: sick ? '#8B90A8' : '#fff' }} onClick={() => onAction('feed')}>
                    {sick ? `Feed · ${sickLeft}m` : 'Feed'}
                  </button>
                  <button className={btn} style={{ background: 'rgba(155,111,246,0.28)' }} onClick={() => onAction('play')}>Play</button>
                  <button className={btn} style={{ background: 'rgba(155,111,246,0.28)' }} onClick={toggleSleep}>{sleeping ? 'Wake' : 'Sleep'}</button>
                </div>
                <p style={{ color: '#B8B5E0', fontSize: 12, textAlign: 'center', marginTop: 10 }}>
                  {pet ? 'Click to poke. Drag to pet.' : 'Send a message to hatch it. You both keep it alive by chatting.'}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <button onClick={() => setExpanded((e) => !e)} aria-label={expanded ? 'Collapse pet' : 'Expand pet'} style={{ position: 'absolute', top: 6, right: 36, width: 24, height: 24, color: '#B8B5E0', fontSize: 16 }}>
        {expanded ? '▴' : '▾'}
      </button>
      <button onClick={toggleMin} aria-label="Minimize pet" style={{ position: 'absolute', top: 6, right: 8, width: 24, height: 24, color: '#B8B5E0', fontSize: 18 }}>–</button>

      <AnimatePresence>
        {hearts.map((id, i) => (
          <motion.svg
            key={id}
            width={22} height={22} viewBox="0 0 24 24" aria-hidden
            style={{ position: 'absolute', bottom: 70, left: 110 + ((id * 29) % 90), pointerEvents: 'none' }}
            initial={{ opacity: 0, y: 0, scale: 0.6 }}
            animate={{ opacity: [0, 1, 0], y: -90, scale: 1.3 }}
            transition={{ duration: 1.3, delay: i * 0.12, ease: 'easeOut' }}
          >
            <path d="M12 21s-7-4.6-9.3-9A5.4 5.4 0 0 1 12 6.6 5.4 5.4 0 0 1 21.3 12C19 16.4 12 21 12 21z" fill="#FF7AA8" />
          </motion.svg>
        ))}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <motion.div
            key="toast"
            initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            role="status"
            style={{ position: 'absolute', top: 6, left: '50%', transform: 'translateX(-50%)', maxWidth: '70%', background: 'rgba(12,10,30,0.88)', border: '1px solid rgba(184,181,224,0.35)', borderRadius: 14, padding: '6px 12px', color: '#F1EFFF', fontSize: 12, textAlign: 'center', pointerEvents: 'none' }}
          >
            {toast}
          </motion.div>
        )}
        {levelUp && (
          <motion.div
            key="lvl"
            initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            transition={{ type: 'spring', stiffness: 220, damping: 14 }}
            style={{ position: 'absolute', top: '36%', left: '50%', x: '-50%', background: 'rgba(250,199,117,0.95)', borderRadius: 16, padding: '10px 16px', color: '#412402', fontSize: 14, fontWeight: 700, pointerEvents: 'none' }}
          >
            {levelUp}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {hatching && <HatchAnimation traits={traits} name={name} onDone={() => setHatching(false)} />}
      </AnimatePresence>

      {renameOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Name your pet"
          onClick={() => setRenameOpen(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
        >
          <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: 360, background: '#1E2640', border: '1px solid #3D4760', borderRadius: 18, padding: 20 }}>
            <div style={{ color: '#fff', fontSize: 17, fontWeight: 600 }}>Name your pet</div>
            <div style={{ color: '#A8B0C0', fontSize: 13, margin: '4px 0 14px' }}>You and {firstName} both see this name.</div>
            <input
              autoFocus
              value={draft}
              maxLength={20}
              placeholder={defaultName(traits)}
              onChange={(e) => { setDraft(e.target.value.slice(0, 20)); setRenameError(null); }}
              onKeyDown={(e) => { if (e.key === 'Enter') saveName(); if (e.key === 'Escape') setRenameOpen(false); }}
              onFocus={(e) => e.currentTarget.select()}
              style={{ width: '100%', color: '#fff', fontSize: 16, background: '#0a0a14', borderRadius: 12, padding: '11px 14px', border: '1px solid #3D4760', outline: 'none' }}
            />
            {renameError
              ? <div style={{ color: '#F87171', fontSize: 12, marginTop: 6 }}>{renameError}</div>
              : <div style={{ color: '#7B849A', fontSize: 12, textAlign: 'right', marginTop: 6 }}>{draft.length}/20</div>}
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button onClick={() => setRenameOpen(false)} style={{ flex: 1, padding: '11px 0', borderRadius: 12, background: 'rgba(255,255,255,0.08)', color: '#fff', fontWeight: 600 }}>Cancel</button>
              <button onClick={saveName} disabled={renameBusy} style={{ flex: 1, padding: '11px 0', borderRadius: 12, background: '#9B6FF6', color: '#fff', fontWeight: 600, opacity: renameBusy ? 0.6 : 1 }}>{renameBusy ? 'Saving…' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
