# Align SFX generator

Original, synthesized sound effects (no third-party audio, no licensing issues).

    python build.py ./out        # renders every entry in catalog.py to mp3 + manifest.json
    python upload.py ./out       # uploads to storage cosmic-videos/sfx/ and registers audio_tracks rows (idempotent)

Needs Python 3 with numpy + scipy, and ffmpeg (set FFMPEG=path if it isn't on PATH).
`upload.py` reads SUPABASE_SERVICE_KEY from `align-web/.env.local`. Add sounds by writing a function in `catalog.py`.
Famous meme clips are other people's recordings and are NOT included; "Meme & Comedy" holds original sound-alikes.
