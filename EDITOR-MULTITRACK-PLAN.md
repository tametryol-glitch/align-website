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
- **Phase 4 (next):** export/renderer parity — teach `align-video-renderer` the
  multi-track spec so server exports match the preview, and add an Export/Post
  button to MultiTrackEditor (serialize timeline → spec → requestRender). This is
  what lets the edited video actually be posted. Also: B-roll add-clip (overlay
  track), and edit-text-after-adding.
- **Phase 5:** polish — audio waveforms, magnetic snapping refinements, ripple
  delete, keyboard shortcuts, fades.

## Before merging to master
Strip branch-only testbed: `/editor-lab` page, its middleware allowlist entry,
`window.__timeline` / `window.__player` hooks, and `public/lab-sample.mp4` +
`public/lab-song.mp3`. Keep the media-extension middleware matcher fix.

## Migration note
The new model coexists with the legacy `segments`/`brollClips`/overlays until the
UI + spec are migrated onto it, then the legacy arrays are derived-from or removed.
