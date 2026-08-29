#!/usr/bin/env python
"""Decide whether a suspect clip is short, or whether Whisper simply misread it.

  python scripts/check-clip-duration.py af_sarah/protection-conflict ...

Every clip is the same shape — N digits, evenly spaced — so duration is close
to linear in digit count. Fitting that line per voice from its own 259 clips
gives an expected duration for the suspect, and a clip missing a digit sits
roughly one digit-width below it.

This is how the earlier repeated-digit mismatches were settled: the audio was
right and the transcription was wrong, which only duration could show.
"""
from __future__ import annotations

import json
import os
import subprocess
import sys

AUDIO = os.path.join('scripts', 'data', 'audio')


def duration(path: str) -> float | None:
    try:
        out = subprocess.run(
            ['ffprobe', '-v', 'error', '-show_entries', 'format=duration',
             '-of', 'csv=p=0', path],
            capture_output=True, text=True, timeout=30).stdout.strip()
        return float(out)
    except Exception:
        return None


def main() -> int:
    targets = sys.argv[1:]
    if not targets:
        print('usage: check-clip-duration.py <voice>/<id> [...]')
        return 1

    with open(os.path.join(AUDIO, 'manifest.json'), encoding='utf-8') as fh:
        manifest = json.load(fh)
    clips = manifest['clips']

    for target in targets:
        voice, fid = target.split('/', 1)
        meta = clips.get(voice, {}).get(fid)
        if not meta:
            print(f'{target}: not in manifest')
            continue

        n = len(meta['digits'])

        # Fit seconds-per-digit from this voice's other clips.
        samples = []
        for other_id, other in clips[voice].items():
            if other_id == fid:
                continue
            d = duration(os.path.join(AUDIO, voice, other['file']))
            if d:
                samples.append((len(other['digits']), d))
            if len(samples) >= 60:
                break

        if len(samples) < 10:
            print(f'{target}: not enough samples to fit')
            continue

        # Least squares on duration = a * digits + b
        sx = sum(k for k, _ in samples)
        sy = sum(v for _, v in samples)
        sxx = sum(k * k for k, _ in samples)
        sxy = sum(k * v for k, v in samples)
        m = len(samples)
        a = (m * sxy - sx * sy) / (m * sxx - sx * sx)
        b = (sy - a * sx) / m

        actual = duration(os.path.join(AUDIO, voice, meta['file']))
        expect_n = a * n + b
        expect_short = a * (n - 1) + b

        verdict = ('AUDIO LOOKS COMPLETE'
                   if abs(actual - expect_n) < abs(actual - expect_short)
                   else 'AUDIO LOOKS SHORT — re-render')

        print(f'{target}')
        print(f'   digits expected      : {n}')
        print(f'   actual duration      : {actual:.2f}s')
        print(f'   expected for {n:2d}      : {expect_n:.2f}s')
        print(f'   expected for {n - 1:2d} (one short): {expect_short:.2f}s')
        print(f'   per-digit (this voice): {a:.3f}s')
        print(f'   -> {verdict}\n')

    return 0


if __name__ == '__main__':
    sys.exit(main())
