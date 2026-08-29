#!/usr/bin/env python
"""Measure the real tempo and downbeat offset of an ambient bed.

  python scripts/analyze-bed.py "path/to/bed.mp3" [--expect 60]

Suno approximates a requested BPM rather than hitting it exactly, and a bed
whose length is not a whole number of bars breaks sync permanently: every loop
shifts the downbeat, and the error compounds across a 15-minute session. So
the tempo gets measured, not trusted.

Deliberately dependency-light — ffmpeg for decoding, numpy for the maths. No
librosa or aubio, which are not installed and are heavy for one number.

Method: decode to mono, build a spectral-flux onset envelope, autocorrelate it
over a plausible tempo range, then find the phase by correlating a pulse train
against the envelope.
"""
from __future__ import annotations

import argparse
import subprocess
import sys

import numpy as np

SR = 22050
HOP = 512
N_FFT = 2048


def decode_mono(path: str) -> np.ndarray:
    """Decode any ffmpeg-readable file to mono float32 at SR."""
    proc = subprocess.run(
        ['ffmpeg', '-v', 'error', '-i', path,
         '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'],
        capture_output=True,
    )
    if proc.returncode != 0:
        raise SystemExit(f'ffmpeg failed:\n{proc.stderr.decode(errors="replace")[:400]}')
    return np.frombuffer(proc.stdout, dtype=np.float32)


def onset_envelope(y: np.ndarray) -> np.ndarray:
    """Spectral flux: summed positive frame-to-frame magnitude increase."""
    window = np.hanning(N_FFT).astype(np.float32)
    n_frames = 1 + max(0, (len(y) - N_FFT) // HOP)
    if n_frames < 4:
        raise SystemExit('audio too short to analyse')

    mags = np.empty((n_frames, N_FFT // 2 + 1), dtype=np.float32)
    for i in range(n_frames):
        frame = y[i * HOP: i * HOP + N_FFT] * window
        mags[i] = np.abs(np.fft.rfft(frame))

    # Log-compress so a quiet pulse under a loud pad still registers.
    mags = np.log1p(mags)
    flux = np.diff(mags, axis=0)
    env = np.maximum(flux, 0).sum(axis=1)

    env -= env.mean()
    if env.std() > 0:
        env /= env.std()
    return env


def estimate_bpm(env: np.ndarray, lo: float = 40.0, hi: float = 180.0):
    """Autocorrelate the onset envelope; return (bpm, confidence)."""
    fps = SR / HOP
    ac = np.correlate(env, env, mode='full')[len(env) - 1:]
    ac[0] = 0

    lag_min = max(1, int(round(fps * 60.0 / hi)))
    lag_max = min(len(ac) - 1, int(round(fps * 60.0 / lo)))
    if lag_max <= lag_min:
        raise SystemExit('tempo search range collapsed')

    window = ac[lag_min:lag_max + 1]
    best = int(np.argmax(window)) + lag_min

    # Integer lags are coarse: at ~43 fps a one-frame step near 60 BPM is
    # about 1.4 BPM, far too blunt to tell 60.00 from 60.09 — and that
    # difference is 0.2s of drift across a 36-bar loop. Interpolate the
    # autocorrelation peak against its neighbours for a sub-frame lag.
    if 0 < best < len(ac) - 1:
        a, b, c = float(ac[best - 1]), float(ac[best]), float(ac[best + 1])
        denom = a - 2 * b + c
        shift = 0.5 * (a - c) / denom if denom != 0 else 0.0
        shift = max(-0.5, min(0.5, shift))
    else:
        shift = 0.0

    bpm = 60.0 * fps / (best + shift)

    peak = ac[best]
    conf = float(peak / (np.abs(window).mean() + 1e-9))
    return bpm, conf


def refine_bpm(env: np.ndarray, bpm: float, span: float = 1.0, steps: int = 4001):
    """Fine tempo search by pulse-train correlation over the WHOLE file.

    A single-beat autocorrelation lag is quantised to the frame rate — about
    1.4 BPM per step near 60. Scoring a pulse train across all ~147 beats
    instead accumulates the error over the full duration, which pins the
    period far more tightly: a 0.1 BPM error puts the last pulse a quarter of
    a beat out, so the wrong tempo scores visibly worse.
    """
    fps = SR / HOP
    best_bpm, best_score = bpm, -1e18

    for cand in np.linspace(bpm - span, bpm + span, steps):
        period = fps * 60.0 / cand
        if period < 2:
            continue
        # Try a few phases; the best phase for this tempo is what we score.
        local = -1e18
        for off in np.arange(0, period, max(1.0, period / 16)):
            idx = np.arange(off, len(env) - 1, period)
            if len(idx) < 8:
                continue
            s = float(env[np.round(idx).astype(int)].sum()) / len(idx)
            local = max(local, s)
        if local > best_score:
            best_score, best_bpm = local, float(cand)

    return best_bpm, best_score


def estimate_phase(env: np.ndarray, bpm: float) -> float:
    """Seconds from file start to the first beat, by pulse-train correlation."""
    fps = SR / HOP
    period = fps * 60.0 / bpm
    best_off, best_score = 0.0, -1e9

    for off in np.arange(0, period, 0.25):
        idx = np.arange(off, len(env) - 1, period)
        score = float(env[np.round(idx).astype(int)].sum())
        if score > best_score:
            best_score, best_off = score, off

    return best_off / fps


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument('path')
    ap.add_argument('--expect', type=float, default=None,
                    help='the BPM you asked Suno for')
    ap.add_argument('--beats-per-bar', type=int, default=4)
    args = ap.parse_args()

    y = decode_mono(args.path)
    dur = len(y) / SR
    env = onset_envelope(y)
    bpm, conf = estimate_bpm(env)
    phase = estimate_phase(env, bpm)

    # Autocorrelation cannot tell a tempo from its double or half. If the
    # caller said what they asked for, snap to whichever octave is closest.
    if args.expect:
        cands = [bpm, bpm * 2, bpm / 2, bpm * 4, bpm / 4]
        bpm = min(cands, key=lambda c: abs(c - args.expect))

    coarse = bpm
    bpm, _score = refine_bpm(env, bpm)
    print(f'coarse BPM  : {coarse:.2f}  ->  refined {bpm:.3f}')

    bar = args.beats_per_bar * 60.0 / bpm
    bars = dur / bar

    print(f'file        : {args.path}')
    print(f'duration    : {dur:.3f}s')
    print(f'detected BPM: {bpm:.2f}   (confidence {conf:.1f})')
    if args.expect:
        print(f'requested   : {args.expect:.2f}   (off by {bpm - args.expect:+.2f})')
    print(f'first beat  : {phase:.3f}s')
    print(f'bar length  : {bar:.3f}s  ({args.beats_per_bar}/4)')
    print(f'bars in file: {bars:.3f}')

    whole = int(bars)
    trimmed = whole * bar
    print()
    print(f'-> trim to {whole} bars = {trimmed:.3f}s for a loop that stays in sync')
    print(f'   losing {dur - trimmed:.3f}s from the tail')
    print()
    print('   ffmpeg -i "%s" -t %.3f -c:a libmp3lame -q:a 4 out.mp3'
          % (args.path, trimmed))
    return 0


if __name__ == '__main__':
    sys.exit(main())
