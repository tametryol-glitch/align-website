"""Tiny synthesis toolkit for the Align SFX library (numpy + scipy only)."""
import numpy as np
from scipy import signal

SR = 44100
_rng = np.random.default_rng(20261026)


def seed(n: int):
    global _rng
    _rng = np.random.default_rng(n)


def tarr(d):
    return np.arange(int(SR * d)) / SR


def white(d):
    return _rng.standard_normal(int(SR * d))


def pink(d):
    x = white(d)
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    f[0] = f[1]
    X /= np.sqrt(f)
    y = np.fft.irfft(X, len(x))
    return y / (np.max(np.abs(y)) + 1e-9)


def _phase(freq):
    return 2 * np.pi * np.cumsum(freq) / SR


def sine(freq, d=None):
    f = np.full(int(SR * d), float(freq)) if np.isscalar(freq) else np.asarray(freq, float)
    return np.sin(_phase(f))


def saw(freq, d=None):
    f = np.full(int(SR * d), float(freq)) if np.isscalar(freq) else np.asarray(freq, float)
    ph = (np.cumsum(f) / SR) % 1.0
    return 2 * ph - 1


def square(freq, d=None, duty=0.5):
    f = np.full(int(SR * d), float(freq)) if np.isscalar(freq) else np.asarray(freq, float)
    ph = (np.cumsum(f) / SR) % 1.0
    return np.where(ph < duty, 1.0, -1.0)


def tri(freq, d=None):
    s = saw(freq, d)
    return 2 * np.abs(s) - 1


def sweep(f0, f1, d, curve="exp"):
    n = int(SR * d)
    u = np.linspace(0, 1, n)
    if curve == "exp":
        return f0 * (f1 / f0) ** u
    return f0 + (f1 - f0) * u


def env(d, a=0.005, r=0.1, curve=3.0):
    """Attack (linear) then exponential-ish release over the rest."""
    n = int(SR * d)
    e = np.ones(n)
    na = max(1, int(SR * a))
    e[:na] = np.linspace(0, 1, na)
    nr = max(1, int(SR * r))
    nr = min(nr, n)
    e[-nr:] *= np.linspace(1, 0, nr) ** 1.5
    return e


def decay(d, tau):
    t = tarr(d)
    e = np.exp(-t / tau)
    na = max(1, int(SR * 0.002))
    e[:na] *= np.linspace(0, 1, na)
    return e


def swell(d, peak=0.8, curve=2.0):
    """Quiet -> loud -> quick fade (risers)."""
    n = int(SR * d)
    u = np.linspace(0, 1, n)
    e = u ** curve
    nf = max(1, int(SR * 0.03))
    e[-nf:] *= np.linspace(1, 0, nf)
    return e


def bell_env(d, peak=0.4):
    """Rises to a peak at fraction `peak` then falls (whooshes)."""
    n = int(SR * d)
    u = np.linspace(0, 1, n)
    e = np.where(u < peak, (u / peak) ** 1.6, ((1 - u) / (1 - peak)) ** 1.6)
    return e


def lp(x, fc, order=4):
    fc = min(fc, SR / 2 - 100)
    sos = signal.butter(order, fc, "low", fs=SR, output="sos")
    return signal.sosfilt(sos, x)


def hp(x, fc, order=4):
    sos = signal.butter(order, max(20, fc), "high", fs=SR, output="sos")
    return signal.sosfilt(sos, x)


def bp(x, f1, f2, order=3):
    f2 = min(f2, SR / 2 - 100)
    sos = signal.butter(order, [f1, f2], "band", fs=SR, output="sos")
    return signal.sosfilt(sos, x)


def sweep_bp(x, fc0, fc1, q=1.5, block=512):
    """Band-pass whose centre sweeps fc0->fc1 across the signal (whooshes/risers)."""
    n = len(x)
    out = np.zeros(n)
    zi = None
    centers = np.exp(np.linspace(np.log(fc0), np.log(fc1), (n + block - 1) // block))
    for i, c in enumerate(centers):
        lo = max(30, c / (1 + 1 / q))
        hi = min(SR / 2 - 200, c * (1 + 1 / q))
        sos = signal.butter(2, [lo, hi], "band", fs=SR, output="sos")
        seg = x[i * block:(i + 1) * block]
        if zi is None or zi.shape[0] != sos.shape[0]:
            zi = np.zeros((sos.shape[0], 2))
        y, zi = signal.sosfilt(sos, seg, zi=zi)
        out[i * block:(i + 1) * block] = y
    return out


def sweep_lp(x, fc0, fc1, block=512):
    n = len(x)
    out = np.zeros(n)
    zi = None
    centers = np.exp(np.linspace(np.log(fc0), np.log(fc1), (n + block - 1) // block))
    for i, c in enumerate(centers):
        sos = signal.butter(2, min(c, SR / 2 - 200), "low", fs=SR, output="sos")
        seg = x[i * block:(i + 1) * block]
        if zi is None or zi.shape[0] != sos.shape[0]:
            zi = np.zeros((sos.shape[0], 2))
        y, zi = signal.sosfilt(sos, seg, zi=zi)
        out[i * block:(i + 1) * block] = y
    return out


def reverb(x, tail=0.8, wet=0.3, damp=4500):
    n = int(SR * tail)
    ir = _rng.standard_normal(n) * np.exp(-np.linspace(0, 6, n))
    ir = lp(ir, damp, 2)
    ir[0] = 0
    total = len(x) + n
    wetsig = np.zeros(total)
    conv = signal.fftconvolve(x, ir)[:total]
    wetsig[: len(conv)] = conv
    wetsig /= (np.max(np.abs(wetsig)) + 1e-9)
    dry = np.concatenate([x, np.zeros(n)])
    peak = np.max(np.abs(dry)) + 1e-9
    return dry * (1 - wet) + wetsig * peak * wet


def echo(x, delay=0.18, fb=0.4, n=4):
    out = np.concatenate([x, np.zeros(int(SR * delay * n))])
    for i in range(1, n + 1):
        off = int(SR * delay * i)
        out[off:off + len(x)] += x * (fb ** i)
    return out


def sat(x, drive=2.0):
    return np.tanh(x * drive) / np.tanh(drive)


def bitcrush(x, bits=6, down=4):
    y = np.repeat(x[::down], down)[: len(x)]
    q = 2 ** (bits - 1)
    return np.round(y * q) / q


def mix(*parts, gains=None):
    n = max(len(p) for p in parts)
    out = np.zeros(n)
    for i, p in enumerate(parts):
        g = 1.0 if gains is None else gains[i]
        out[: len(p)] += p * g
    return out


def at(x, offset, total=None):
    """Place x at `offset` seconds (returns padded array)."""
    o = int(SR * offset)
    n = len(x) + o if total is None else int(SR * total)
    out = np.zeros(max(n, len(x) + o))
    out[o:o + len(x)] = x
    return out


def pad(x, seconds):
    return np.concatenate([x, np.zeros(int(SR * seconds))])


def finish(x, peak=0.89, fade_in=0.002, fade_out=0.02, trim_db=-55):
    """Remove DC, trim silent tail, fade ends, normalise to a safe peak."""
    x = np.nan_to_num(x.astype(np.float64))
    x = x - np.mean(x)
    amp = np.abs(x)
    m = np.max(amp) + 1e-12
    keep = np.where(amp > m * (10 ** (trim_db / 20)))[0]
    if len(keep):
        x = x[: keep[-1] + 1]
    fi = max(1, int(SR * fade_in))
    fo = max(1, min(len(x) // 2, int(SR * fade_out)))
    x[:fi] *= np.linspace(0, 1, fi)
    x[-fo:] *= np.linspace(1, 0, fo)
    x = x / (np.max(np.abs(x)) + 1e-12) * peak
    return x.astype(np.float32)


def midi(n):
    return 440.0 * 2 ** ((n - 69) / 12)


def rng():
    return _rng
