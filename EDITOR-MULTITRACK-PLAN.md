# Multi-track Video Editor Rebuild

Goal: bring the in-app video editor to Filmora-level smoothness — A-roll/B-roll
video tracks, multiple audio tracks, a text track, add-your-own tracks, split &
trim clips on every track, gaps between clips, drag/move freely.

Branch: `editor-multitrack` (do NOT merge to master until a phase is verified;
master auto-deploys to Vercel production).

## Why the old editor couldn't do this
The old timeline stored clips as an ORDER-ONLY list (`segments` in
`videoEditorStore.ts`): clips have a source in/out but no timeline POSITION, so
they can only be reordered, never gapped. Audio was a single "bed", not clips.
Text/stickers were floating overlays, not timeline lanes.

## Phases
- **Foundation (done):** adopted the WYSIWYG Remotion preview + server-render
  export migration (`videoEditSpec.ts`, `remotion/editor/`, PreviewPanel toggle,
  ExportTool server render). One `VideoEditSpec` drives preview and server render.
- **Phase 1 (done):** positioned multi-track data model —
  `src/lib/editor/timelineModel.ts`. Pure, unit-tested functions: tracks + clips
  with absolute `start`/`duration`; add/remove/move/trim/split clips; gaps allowed,
  overlaps rejected; `closeGapBefore` ripple; media clips keep `sourceDuration` so
  a trimmed end can be re-extended. 22/22 model tests green.
- **Phase 2 (done):** timeline UI — `timelineStore.ts` (zustand + undo/redo) and
  `components/video-editor/multitrack/MultiTrackTimeline.tsx`. Real lanes per
  track, drag to move (within + across same-kind tracks), trim handles, split at
  playhead, close-gap, add/remove tracks, mute/hide, snapping, zoom. Verified in
  `/editor-lab` (branch-only testbed). TODO in later polish: audio waveforms
  showing amplitude (true length already shown by clip width).
- **Phase 3 (done):** multi-track WYSIWYG preview — `MultiTrackComposition.tsx`
  (Remotion) renders positioned TimelineState (video/overlay/text lanes by order,
  audio mixed, gaps = black), `MultiTrackPlayer.tsx` (@remotion/player). Verified
  live in `/editor-lab` with real media: gap→black, per-clip source in/out, text
  in-window, audio mixing.
- **Phase 3.5 (done — APP INTEGRATION):** `MultiTrackEditor.tsx` mounted at
  `/cosmic-video/edit?mt=1` (beside the old editor, no risk). Inits the timeline
  from the loaded video (video track + full-span clip). Add-music picks from the
  genre library and adds an audio clip at the song's TRUE length (splittable/
  gappable); Add-text adds a text clip. Verified live: song added at 150.3s true
  length, split into [0-10][10-150.3]. Cosmetic: Remotion preview spawns a few
  stray erroring data-URI audio elements (benign, clean up in polish).
- **Phase 4 (done):** Export + renderer parity. MultiTrackEditor Export button
  uploads local blobs → serializes timeline into `edit_spec.__multitrack` →
  server render (reuses user_video_edit path) → poll → download link. Renderer
  (align-video-renderer, DEPLOYED to Railway) has `MultiTrackComposition` +
  UserVideoEdit branch on `__multitrack` + duration from `__multitrack.durationSeconds`;
  existing templates untouched. Verified with a real `remotion still` render (video
  composites, vignette/effects apply, text over footage). Caught+fixed a layering
  bug: render order is now video→overlay→text (front). TODO: post-to-feed wiring
  (currently returns a download link), B-roll add-clip, edit-text-after-add.
- **Phase 5:** polish — audio waveforms, magnetic snapping refinements, ripple
  delete, keyboard shortcuts, fades.

## TikTok/CapCut feature program (CEO wishlist — "make it all")
Ship one verified feature at a time on the multi-track engine.
- [x] **Filters + Adjust + Effects pack** — 17 grades + intensity, 4 adjust, 8 FX
  (grain/vignette/light-leak/RGB-split/zoom-pulse/shake/glow/dust). Per-clip,
  frame-driven, live preview. (effects.ts, FiltersSheet, MultiTrackComposition)
- [x] **Kinetic text + karaoke captions** — text clips animate (fade/slide/pop/
  bounce/typewriter/word-pop/karaoke); karaoke sweeps gold word-highlight. Edit-text
  panel (content/animation/colour/size/position). Verified via server still. STILL
  DONE: auto-transcribe hookup — see below.
- [x] **Auto-captions (FREE, local Whisper)** — /api/transcribe prefers the
  self-hosted faster-whisper sidecar (no OpenAI credits; OpenAI is fallback only).
  "Auto-captions" button transcribes a selected audio clip → karaoke caption
  clips. Verified: voiceover → 3 accurate karaoke lines, free.
- [x] **Clip entrance transitions** — fade/from-black/zoom/slide/spin/whip/glitch
  per clip, in Filters & FX panel. Verified via server still.
- [x] **Beat sync** — beatDetect.ts (Web Audio energy-onset), "Beat sync" button
  cuts the video at each beat of the selected song. Verified: 120 BPM click →
  0.50s-spaced beats; 1 clip → 24 beat-aligned clips.
- [x] **Per-clip speed** — setClipSpeed recomputes duration, composition plays at
  playbackRate. Verified 30s→15s@2x/60s@0.5x. TODO: velocity curves / smooth slow-mo.
- [x] **Ken Burns motion** — MediaClip.motion + MOTIONS (zoom in/out, pan L/R/U/D,
  ken-burns), animated across the clip; picker in Filters & FX. Verified zoom-in
  scales 1.0→1.22. (This covers most keyframe use; manual keyframes still TODO.)
- [x] **Manual keyframes** — MediaClip.keyframes interpolated per property
  (scale/x/y/opacity/rotation) by clip progress; Keyframes panel (set values +
  add at playhead + delete). Verified: scale 1→2 reads 1.5 at midpoint.
- [ ] Green screen / chroma key + AI background remover (MediaPipe selfie seg, on-device)
- [x] **Aspect ratio / reframe** (9:16, 1:1, 4:5, 16:9) — store.aspect, player
  width/height, editor picker + dynamic preview, export via calculateMetadata.
  Verified 1:1 render = 1080x1080. (Auto-reframe subject-tracking still TODO.)
- [x] **AI voiceover via Kokoro TTS** — /api/tts proxies to KOKORO_URL; editor
  Voiceover panel (text + 6 voices) → narration audio clip. Verified live (text →
  4.1s clip). Works where the Next server reaches the TTS sidecar (local now; set
  KOKORO_URL for prod). Voice effects still TODO.
- [x] **Sound-FX picker** — library sfx kind surfaced in the editor (Sound FX
  button) onto a dedicated SFX audio lane. (Trending rail still TODO.)
- [x] **Templates (Looks)** — 8 one-tap Looks (looks.ts) applying filter+motion+
  transition+effects to all video clips. Verified "Hype".
- [x] **Drafts** — auto-save to localStorage (debounced) + restore banner on
  reload (drafts.ts). Verified: split → reload → Restore brought back the edit.
- [ ] Beauty/retouch (MediaPipe face landmarker) — Tier 2
- [ ] AI beauty (Bold Glamour-grade), auto-highlight, upscale — Tier 3 (needs provider+$ decision)
- [ ] Align-unique: zodiac AR pack, auto-caption from user's chart, horoscope templates

Known dev-only issues to clean in polish: Remotion preview logs a benign
MediaError from stray data-URI audio elements; a setState-in-render warning
appears during HMR (not on clean load / not in the error boundary).

## Before merging to master
Strip branch-only testbed: `/editor-lab` page, its middleware allowlist entry,
`window.__timeline` / `window.__player` hooks, and `public/lab-sample.mp4` +
`public/lab-song.mp3`. Keep the media-extension middleware matcher fix.

## Migration note
The new model coexists with the legacy `segments`/`brollClips`/overlays until the
UI + spec are migrated onto it, then the legacy arrays are derived-from or removed.
