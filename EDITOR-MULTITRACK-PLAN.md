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
- **Phase 2 (next):** timeline UI — real lanes per track, drag to move, trim
  handles, split at playhead, add/remove tracks, waveforms showing true audio
  length. Build against `timelineModel`.
- **Phase 3:** preview — extend `VideoEditSpec` + `UserVideoEdit` (web preview
  AND server renderer) to lay out positioned multi-track clips with gaps
  (black/silence fill) and multiple audio tracks.
- **Phase 4:** export/renderer parity in `align-video-renderer` for the new spec.
- **Phase 5:** polish — magnetic snapping, ripple delete, keyboard shortcuts,
  fades, to reach "smooth".

## Migration note
The new model coexists with the legacy `segments`/`brollClips`/overlays until the
UI + spec are migrated onto it, then the legacy arrays are derived-from or removed.
