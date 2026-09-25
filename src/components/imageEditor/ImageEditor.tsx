'use client';

// Full-screen photo editor used by the feed composer and the story creator.
// The photo fills the screen; the tools sit in a column on the right-hand
// side like TikTok (Text, Stickers, Draw, Filters, Adjust, Rotate, Music) and
// each opens a small panel at the bottom without leaving the photo. Done bakes
// every edit into a new JPEG (lib/imageEdit.ts).

import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent as RPointerEvent } from 'react';
import { useTranslation } from 'react-i18next';
import {
  X, Type, Smile, PenLine, Sparkles, SlidersHorizontal, RotateCw, Music2, Undo2, Trash2, Loader2, Check, Minus, Plus,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  FILTER_PRESETS, NO_ADJUST, EDIT_COLORS, STICKERS, TEXT_SIZE, STICKER_SIZE,
  combineOps, cssFilter, exportEditedImage, hasEdits, pillTextColor,
  type Adjustments, type Overlay, type Stroke, type TextOverlay, type EditState,
} from '@/lib/imageEdit';
import { MusicPicker } from '@/components/music/MusicPicker';
import type { AttachedMusic } from '@/lib/postMusic';

type Tool = 'text' | 'stickers' | 'draw' | 'filters' | 'adjust' | 'music' | null;

const uid = () => Math.random().toString(36).slice(2, 10);

export function ImageEditor({
  file,
  onCancel,
  onDone,
  music,
  onMusicChange,
}: {
  file: File;
  onCancel: () => void;
  onDone: (edited: File) => void;
  /** Pass both to show the Music tool (the song belongs to the post/story). */
  music?: AttachedMusic | null;
  onMusicChange?: (m: AttachedMusic | null) => void;
}) {
  const { t } = useTranslation();
  const [src, setSrc] = useState<string | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [natural, setNatural] = useState<{ w: number; h: number } | null>(null);
  const areaRef = useRef<HTMLDivElement>(null);
  const [area, setArea] = useState({ w: 0, h: 0 });

  const [tool, setTool] = useState<Tool>(null);
  const [rotation, setRotation] = useState<EditState['rotation']>(0);
  const [filterId, setFilterId] = useState('original');
  const [adjust, setAdjust] = useState<Adjustments>(NO_ADJUST);
  const [overlays, setOverlays] = useState<Overlay[]>([]);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [drawColor, setDrawColor] = useState(EDIT_COLORS[0]);
  const [drawWidth, setDrawWidth] = useState(0.012);
  const [textDraft, setTextDraft] = useState('');
  const [textColor, setTextColor] = useState(EDIT_COLORS[0]);
  const [textPill, setTextPill] = useState(false);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setSrc(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  // Load the photo once to learn its size.
  useEffect(() => {
    if (!src) return;
    const img = new Image();
    img.onload = () => { imgRef.current = img; setNatural({ w: img.naturalWidth, h: img.naturalHeight }); };
    img.onerror = () => setError(t('editor.errors.load', 'This photo could not be opened'));
    img.src = src;
  }, [src, t]);

  // Track the space available for the photo.
  useEffect(() => {
    const el = areaRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setArea({ w: el.clientWidth, h: el.clientHeight }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || saving) return;
      if (tool) setTool(null); else onCancel();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [tool, saving, onCancel]);

  // Play the chosen song while editing, like TikTok (the picker has its own
  // preview, so stay quiet while it's open).
  useEffect(() => {
    const a = audioRef.current;
    if (a && music) a.currentTime = music.startSec;
  }, [music?.url, music?.startSec]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    if (music?.url && tool !== 'music') a.play().catch(() => {});
    else a.pause();
  }, [music?.url, music?.startSec, tool]);

  const sideways = rotation === 90 || rotation === 270;
  const stage = useMemo(() => {
    if (!natural || !area.w || !area.h) return null;
    const rw = sideways ? natural.h : natural.w;
    const rh = sideways ? natural.w : natural.h;
    const k = Math.min(area.w / rw, area.h / rh);
    return { w: Math.round(rw * k), h: Math.round(rh * k) };
  }, [natural, area, sideways]);

  const preset = FILTER_PRESETS.find((f) => f.id === filterId) || FILTER_PRESETS[0];
  const ops = useMemo(() => combineOps(preset.ops, adjust), [preset, adjust]);

  // ── Dragging overlays ─────────────────────────────────────────────────────
  const drag = useRef<{ id: string; dx: number; dy: number } | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  const toStage = (e: { clientX: number; clientY: number }) => {
    const r = stageRef.current!.getBoundingClientRect();
    return { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height };
  };

  // Keep receiving moves when the finger leaves the element. Can throw for
  // an already-released pointer — the drag still works without it.
  const capture = (e: RPointerEvent) => {
    try { (e.target as Element).setPointerCapture?.(e.pointerId); } catch { /* ignore */ }
  };

  const startDrag = (e: RPointerEvent, o: Overlay) => {
    if (tool === 'draw') return;
    e.stopPropagation();
    capture(e);
    const p = toStage(e);
    drag.current = { id: o.id, dx: o.x - p.x, dy: o.y - p.y };
    setSelectedId(o.id);
  };

  const moveDrag = (e: RPointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const p = toStage(e);
    const x = Math.min(1, Math.max(0, p.x + d.dx));
    const y = Math.min(1, Math.max(0, p.y + d.dy));
    setOverlays((os) => os.map((o) => (o.id === d.id ? { ...o, x, y } : o)));
  };

  const endDrag = () => { drag.current = null; };

  // ── Drawing ───────────────────────────────────────────────────────────────
  const drawing = useRef(false);
  const onStageDown = (e: RPointerEvent) => {
    if (tool !== 'draw') { setSelectedId(null); return; }
    capture(e);
    drawing.current = true;
    const p = toStage(e);
    setStrokes((s) => [...s, { color: drawColor, width: drawWidth, points: [[p.x, p.y]] }]);
  };
  const onStageMove = (e: RPointerEvent) => {
    if (drag.current) { moveDrag(e); return; }
    if (!drawing.current) return;
    const p = toStage(e);
    setStrokes((s) => {
      const last = s[s.length - 1];
      if (!last) return s;
      return [...s.slice(0, -1), { ...last, points: [...last.points, [p.x, p.y]] }];
    });
  };
  const onStageUp = () => { drawing.current = false; endDrag(); };

  // ── Text ──────────────────────────────────────────────────────────────────
  const openText = useCallback((o?: TextOverlay) => {
    setTool('text');
    if (o) {
      setEditingTextId(o.id);
      setTextDraft(o.text);
      setTextColor(o.color);
      setTextPill(o.pill);
    } else {
      setEditingTextId(null);
      setTextDraft('');
    }
  }, []);

  const commitText = () => {
    const text = textDraft.trim();
    if (editingTextId) {
      setOverlays((os) => text
        ? os.map((o) => (o.id === editingTextId && o.kind === 'text' ? { ...o, text, color: textColor, pill: textPill } : o))
        : os.filter((o) => o.id !== editingTextId));
    } else if (text) {
      const id = uid();
      setOverlays((os) => [...os, { id, kind: 'text', text, x: 0.5, y: 0.4, scale: 1, color: textColor, pill: textPill }]);
      setSelectedId(id);
    }
    setEditingTextId(null);
    setTextDraft('');
    setTool(null);
  };

  const addSticker = (emoji: string) => {
    const id = uid();
    setOverlays((os) => [...os, { id, kind: 'sticker', emoji, x: 0.5, y: 0.5, scale: 1 }]);
    setSelectedId(id);
    setTool(null);
  };

  const selected = overlays.find((o) => o.id === selectedId) || null;
  const scaleSelected = (d: number) =>
    setOverlays((os) => os.map((o) => (o.id === selectedId ? { ...o, scale: Math.min(4, Math.max(0.4, o.scale + d)) } : o)));
  const deleteSelected = () => { setOverlays((os) => os.filter((o) => o.id !== selectedId)); setSelectedId(null); };

  const rotate = () => setRotation((r) => (((r + 90) % 360) as EditState['rotation']));

  async function done() {
    if (!imgRef.current || saving) return;
    const state: EditState = { rotation, ops, overlays, strokes };
    if (!hasEdits(state)) { onDone(file); return; }
    setSaving(true);
    setError(null);
    try {
      onDone(await exportEditedImage(imgRef.current, state, file.name));
    } catch (e: any) {
      console.warn('[ImageEditor] export failed:', e?.message);
      setError(t('editor.errors.save', 'Could not save your edits. Try again.'));
      setSaving(false);
    }
  }

  const tools: { id: Exclude<Tool, null> | 'rotate'; icon: typeof Type; label: string }[] = [
    { id: 'text', icon: Type, label: t('editor.tools.text', 'Text') },
    { id: 'stickers', icon: Smile, label: t('editor.tools.stickers', 'Stickers') },
    { id: 'draw', icon: PenLine, label: t('editor.tools.draw', 'Draw') },
    { id: 'filters', icon: Sparkles, label: t('editor.tools.filters', 'Filters') },
    { id: 'adjust', icon: SlidersHorizontal, label: t('editor.tools.adjust', 'Adjust') },
    { id: 'rotate', icon: RotateCw, label: t('editor.tools.rotate', 'Rotate') },
    ...(onMusicChange ? [{ id: 'music' as const, icon: Music2, label: t('editor.tools.music', 'Music') }] : []),
  ];

  const W = stage?.w || 0;

  return (
    <div className="fixed inset-0 z-[80] bg-black flex flex-col select-none">
      {/* Top bar */}
      <div className="flex items-center justify-between px-3 py-2 text-white shrink-0">
        <button onClick={onCancel} disabled={saving} className="p-2 rounded-full hover:bg-white/10" aria-label={t('common.cancel', 'Cancel')}>
          <X className="w-6 h-6" />
        </button>
        {music && (
          <span className="flex items-center gap-1.5 max-w-[55%] px-3 py-1 rounded-full bg-white/15 text-xs truncate">
            <Music2 className="w-3.5 h-3.5 shrink-0" /> <span className="truncate">{music.title}</span>
          </span>
        )}
        <button
          onClick={done}
          disabled={saving || !natural}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-accent text-sm font-semibold disabled:opacity-60"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
          {t('editor.done', 'Done')}
        </button>
      </div>

      {/* Photo */}
      <div ref={areaRef} className="relative flex-1 min-h-0 flex items-center justify-center px-2 pb-2">
        {stage && (
          <div
            ref={stageRef}
            className={cn('relative overflow-hidden rounded-lg', tool === 'draw' && 'cursor-crosshair')}
            style={{ width: stage.w, height: stage.h, touchAction: 'none' }}
            onPointerDown={onStageDown}
            onPointerMove={onStageMove}
            onPointerUp={onStageUp}
            onPointerCancel={onStageUp}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src || undefined}
              alt=""
              draggable={false}
              className="absolute left-1/2 top-1/2 max-w-none pointer-events-none"
              style={{
                width: sideways ? stage.h : stage.w,
                height: sideways ? stage.w : stage.h,
                transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
                filter: cssFilter(ops),
              }}
            />
            {ops.tint && (
              <div
                className="absolute inset-0 pointer-events-none"
                style={{ backgroundColor: ops.tint.color, opacity: ops.tint.alpha, mixBlendMode: 'soft-light' }}
              />
            )}

            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox={`0 0 ${stage.w} ${stage.h}`}>
              {strokes.map((s, i) => (
                <polyline
                  key={i}
                  points={s.points.map(([x, y]) => `${x * stage.w},${y * stage.h}`).join(' ')}
                  fill="none"
                  stroke={s.color}
                  strokeWidth={s.width * stage.w}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ))}
            </svg>

            {overlays.map((o) => {
              const isSel = o.id === selectedId;
              const common = {
                onPointerDown: (e: RPointerEvent) => startDrag(e, o),
                onDoubleClick: () => o.kind === 'text' && openText(o),
                className: cn(
                  'absolute -translate-x-1/2 -translate-y-1/2 whitespace-pre text-center leading-tight cursor-move',
                  isSel && 'outline outline-2 outline-dashed outline-white/80 outline-offset-4 rounded',
                  tool === 'draw' && 'pointer-events-none',
                ),
                style: { left: `${o.x * 100}%`, top: `${o.y * 100}%` } as React.CSSProperties,
              };
              if (o.kind === 'sticker') {
                return <span key={o.id} {...common} style={{ ...common.style, fontSize: STICKER_SIZE * W * o.scale, lineHeight: 1 }}>{o.emoji}</span>;
              }
              const size = TEXT_SIZE * W * o.scale;
              return (
                <span
                  key={o.id}
                  {...common}
                  style={{
                    ...common.style,
                    fontSize: size,
                    fontWeight: 700,
                    lineHeight: 1.25,
                    color: o.pill ? pillTextColor(o.color) : o.color,
                    background: o.pill ? o.color : undefined,
                    padding: o.pill ? `${size * 0.175}px ${size * 0.4}px` : undefined,
                    borderRadius: o.pill ? size * 0.35 : undefined,
                    textShadow: o.pill ? undefined : `0 0 ${size * 0.12}px rgba(0,0,0,0.45)`,
                  }}
                >
                  {o.text}
                </span>
              );
            })}
          </div>
        )}
        {!natural && !error && <Loader2 className="w-8 h-8 text-white/70 animate-spin" />}

        {/* Right-hand tool column */}
        <div className="absolute right-2 top-2 flex flex-col gap-3 z-10">
          {tools.map(({ id, icon: Icon, label }) => {
            const active = tool === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => {
                  if (id === 'rotate') { rotate(); return; }
                  if (id === 'text') { active ? setTool(null) : openText(); return; }
                  setTool(active ? null : id);
                }}
                className="flex flex-col items-center gap-0.5 text-white"
                style={{ textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}
              >
                <span className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-sm transition-colors',
                  active ? 'bg-white text-black' : 'bg-black/40 hover:bg-black/60',
                )}>
                  <Icon className="w-5 h-5" />
                </span>
                <span className="text-[10px] font-medium">{label}</span>
              </button>
            );
          })}
        </div>

        {/* Selected overlay controls */}
        {selected && !tool && (
          <div className="absolute left-1/2 -translate-x-1/2 bottom-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/70 text-white z-10">
            <button onClick={() => scaleSelected(-0.15)} className="p-1" aria-label={t('editor.smaller', 'Smaller')}><Minus className="w-4 h-4" /></button>
            <button onClick={() => scaleSelected(0.15)} className="p-1" aria-label={t('editor.bigger', 'Bigger')}><Plus className="w-4 h-4" /></button>
            {selected.kind === 'text' && (
              <button onClick={() => openText(selected)} className="p-1" aria-label={t('editor.editText', 'Edit text')}><Type className="w-4 h-4" /></button>
            )}
            <button onClick={deleteSelected} className="p-1 text-red-400" aria-label={t('editor.delete', 'Delete')}><Trash2 className="w-4 h-4" /></button>
          </div>
        )}
      </div>

      {error && <p className="px-4 pb-2 text-center text-xs text-red-400">{error}</p>}

      {/* Tool panels */}
      {tool && tool !== 'music' && (
        <div className="shrink-0 bg-neutral-950/95 border-t border-white/10 px-4 py-3 text-white">
          {tool === 'text' && (
            <div className="space-y-3">
              <textarea
                autoFocus
                value={textDraft}
                onChange={(e) => setTextDraft(e.target.value.slice(0, 200))}
                rows={2}
                placeholder={t('editor.textPlaceholder', 'Type something…')}
                className="w-full bg-white/10 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-white/40"
              />
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
                <button
                  onClick={() => setTextPill((p) => !p)}
                  className={cn('px-2.5 py-1 rounded-lg text-xs font-bold border shrink-0', textPill ? 'bg-white text-black border-white' : 'border-white/40')}
                >
                  A
                </button>
                {EDIT_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setTextColor(c)}
                    aria-label={c}
                    className={cn('w-7 h-7 rounded-full border-2 shrink-0', textColor === c ? 'border-white scale-110' : 'border-white/20')}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
              <button onClick={commitText} className="w-full py-2 rounded-xl bg-white text-black text-sm font-semibold">
                {editingTextId ? t('editor.saveText', 'Save text') : t('editor.addText', 'Add text')}
              </button>
            </div>
          )}

          {tool === 'stickers' && (
            <div className="grid grid-cols-8 sm:grid-cols-10 gap-1 max-h-40 overflow-y-auto">
              {STICKERS.map((s) => (
                <button key={s} onClick={() => addSticker(s)} className="text-2xl p-1 rounded-lg hover:bg-white/10">{s}</button>
              ))}
            </div>
          )}

          {tool === 'draw' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
                {EDIT_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setDrawColor(c)}
                    aria-label={c}
                    className={cn('w-7 h-7 rounded-full border-2 shrink-0', drawColor === c ? 'border-white scale-110' : 'border-white/20')}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="range" min={0.004} max={0.04} step={0.002} value={drawWidth}
                  onChange={(e) => setDrawWidth(Number(e.target.value))}
                  className="flex-1 accent-white"
                  aria-label={t('editor.brush', 'Brush size')}
                />
                <button
                  onClick={() => setStrokes((s) => s.slice(0, -1))}
                  disabled={strokes.length === 0}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/10 text-xs disabled:opacity-40"
                >
                  <Undo2 className="w-4 h-4" /> {t('editor.undo', 'Undo')}
                </button>
                <button onClick={() => setTool(null)} className="px-3 py-1.5 rounded-lg bg-white text-black text-xs font-semibold">
                  {t('editor.done', 'Done')}
                </button>
              </div>
            </div>
          )}

          {tool === 'filters' && (
            <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
              {FILTER_PRESETS.map((f) => {
                const fOps = combineOps(f.ops, NO_ADJUST);
                return (
                  <button key={f.id} onClick={() => setFilterId(f.id)} className="flex flex-col items-center gap-1 shrink-0">
                    <span className={cn('relative w-14 h-14 rounded-xl overflow-hidden border-2', filterId === f.id ? 'border-white' : 'border-transparent')}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src || undefined} alt="" className="w-full h-full object-cover" style={{ filter: cssFilter(fOps) }} />
                      {fOps.tint && (
                        <span className="absolute inset-0" style={{ backgroundColor: fOps.tint.color, opacity: fOps.tint.alpha, mixBlendMode: 'soft-light' }} />
                      )}
                    </span>
                    <span className="text-[10px]">{t(`editor.filters.${f.id}`, f.label)}</span>
                  </button>
                );
              })}
            </div>
          )}

          {tool === 'adjust' && (
            <div className="space-y-2">
              {([
                ['brightness', t('editor.adjust.brightness', 'Brightness')],
                ['contrast', t('editor.adjust.contrast', 'Contrast')],
                ['saturation', t('editor.adjust.saturation', 'Saturation')],
              ] as const).map(([key, label]) => (
                <label key={key} className="flex items-center gap-3 text-xs">
                  <span className="w-20 shrink-0">{label}</span>
                  <input
                    type="range" min={-50} max={50} step={1} value={adjust[key]}
                    onChange={(e) => setAdjust((a) => ({ ...a, [key]: Number(e.target.value) }))}
                    className="flex-1 accent-white"
                  />
                  <span className="w-8 text-right tabular-nums">{adjust[key] > 0 ? `+${adjust[key]}` : adjust[key]}</span>
                </label>
              ))}
              <button onClick={() => setAdjust(NO_ADJUST)} className="text-[11px] text-white/60 hover:text-white">
                {t('editor.reset', 'Reset')}
              </button>
            </div>
          )}
        </div>
      )}

      {tool === 'music' && onMusicChange && (
        <MusicPicker value={music || null} onChange={onMusicChange} onClose={() => setTool(null)} />
      )}
      {music?.url && <audio ref={audioRef} src={music.url} loop />}
    </div>
  );
}
