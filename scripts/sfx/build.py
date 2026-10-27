"""Render the catalog to mp3 + manifest.json. Usage: python build.py <out_dir>"""
import json
import re
import subprocess
import sys
import wave
from pathlib import Path

import numpy as np

import dsp
from catalog import CATALOG

import os
FFMPEG = os.environ.get("FFMPEG", "ffmpeg")  # or the path to ffmpeg-static


def slug(s):
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")


def main(out):
    out = Path(out)
    out.mkdir(parents=True, exist_ok=True)
    manifest, seen = [], set()
    for idx, (cat, mood, name, fn) in enumerate(CATALOG):
        dsp.seed(1000 + idx)  # each sound is reproducible on its own
        x = fn()
        if not np.isfinite(x).all() or len(x) < dsp.SR * 0.04:
            print("SKIP bad:", name)
            continue
        s = slug(name)
        if s in seen:
            s = f"{s}-{idx}"
        seen.add(s)
        wav_path = out / f"{s}.wav"
        mp3_path = out / f"{s}.mp3"
        pcm = (np.clip(x, -1, 1) * 32767).astype("<i2")
        with wave.open(str(wav_path), "wb") as w:
            w.setnchannels(1)
            w.setsampwidth(2)
            w.setframerate(dsp.SR)
            w.writeframes(pcm.tobytes())
        subprocess.run([FFMPEG, "-y", "-loglevel", "error", "-i", str(wav_path), "-codec:a", "libmp3lame", "-b:a", "128k", str(mp3_path)], check=True)
        wav_path.unlink()
        manifest.append({
            "slug": s, "name": name, "category": cat, "mood": mood,
            "duration": round(len(x) / dsp.SR, 3), "peak": round(float(np.max(np.abs(x))), 3),
            "rms": round(float(np.sqrt(np.mean(x.astype(np.float64) ** 2))), 4), "file": mp3_path.name,
        })
    (out / "manifest.json").write_text(json.dumps(manifest, indent=1), encoding="utf-8")
    print(f"built {len(manifest)} sounds")
    cats = {}
    for m in manifest:
        cats[m["category"]] = cats.get(m["category"], 0) + 1
    for c, n in cats.items():
        print(f"  {c}: {n}")


if __name__ == "__main__":
    main(sys.argv[1])
