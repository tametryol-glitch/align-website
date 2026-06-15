'use client';

/**
 * BrollLayer — renders B-roll / overlay clips as picture-in-picture <video>
 * elements over the main preview, each shown during its window on the timeline
 * and seeked to follow the main playhead.
 */

import { useRef, useEffect } from 'react';
import { useVideoEditorStore, type BrollClip } from '@/stores/videoEditorStore';

export function BrollLayer() {
  const brollClips = useVideoEditorStore((s) => s.brollClips);
  return (
    <>
      {brollClips.map((clip) => (
        <BrollClipView key={clip.id} clip={clip} />
      ))}
    </>
  );
}

function BrollClipView({ clip }: { clip: BrollClip }) {
  const ref = useRef<HTMLVideoElement>(null);
  const currentTime = useVideoEditorStore((s) => s.currentTime);
  const isPlaying = useVideoEditorStore((s) => s.isPlaying);
  const selectedBrollId = useVideoEditorStore((s) => s.selectedBrollId);
  const selectBroll = useVideoEditorStore((s) => s.selectBroll);

  const len = Math.max(0.1, clip.sourceEnd - clip.sourceStart);
  const visible = currentTime >= clip.timelineStart && currentTime <= clip.timelineStart + len;
  const localTarget = clip.sourceStart + (currentTime - clip.timelineStart);
  const selected = selectedBrollId === clip.id;

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (visible) {
      if (Math.abs(v.currentTime - localTarget) > 0.3) {
        v.currentTime = Math.max(0, Math.min(clip.duration, localTarget));
      }
      if (isPlaying && v.paused) v.play().catch(() => {});
      if (!isPlaying && !v.paused) v.pause();
    } else if (!v.paused) {
      v.pause();
    }
  }, [visible, isPlaying, localTarget, clip.duration]);

  return (
    <div
      onClick={(e) => { e.stopPropagation(); selectBroll(clip.id); }}
      style={{
        position: 'absolute',
        left: `${clip.x}%`,
        top: `${clip.y}%`,
        width: `${clip.scale * 100}%`,
        transform: 'translate(-50%, -50%)',
        opacity: visible ? clip.opacity : 0,
        display: visible ? 'block' : 'none',
        borderRadius: 8,
        overflow: 'hidden',
        outline: selected ? '2px solid var(--color-accent-primary, #8b5cf6)' : 'none',
        boxShadow: '0 2px 12px rgba(0,0,0,0.4)',
        cursor: 'pointer',
        zIndex: 5,
      }}
    >
      <video ref={ref} src={clip.sourceUrl} muted playsInline className="w-full h-auto block" />
    </div>
  );
}
