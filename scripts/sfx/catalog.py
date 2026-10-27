"""Catalog of original synthesized SFX. Each entry: (category, mood, name, builder)."""
import numpy as np
from dsp import *  # noqa

CATALOG = []


def reg(category, mood, name):
    def deco(fn):
        CATALOG.append((category, mood, name, fn))
        return fn
    return deco


def many(category, mood, base, variants):
    """Register a family: variants = list of (suffix, kwargs); builder gets kwargs."""
    def deco(fn):
        for suf, kw in variants:
            CATALOG.append((category, mood, f"{base} {suf}".strip(), (lambda kw=kw: fn(**kw))))
        return fn
    return deco


# ───────────────────────── Whooshes & Transitions ─────────────────────────
@many("Whooshes & Transitions", "Energetic", "Whoosh", [
    ("Fast", dict(d=0.5, f0=400, f1=6000, peak=0.5)),
    ("Quick", dict(d=0.35, f0=600, f1=7000, peak=0.5)),
    ("Air", dict(d=0.8, f0=300, f1=5000, peak=0.45)),
    ("Smooth", dict(d=1.0, f0=250, f1=3500, peak=0.5)),
    ("Long", dict(d=1.6, f0=200, f1=4500, peak=0.45)),
    ("Heavy", dict(d=1.2, f0=120, f1=2500, peak=0.4)),
    ("Bright", dict(d=0.7, f0=1000, f1=9000, peak=0.5)),
    ("Soft", dict(d=0.9, f0=300, f1=2200, peak=0.5)),
])
def whoosh(d, f0, f1, peak):
    n = pink(d) + 0.3 * white(d)
    y = sweep_bp(n, f0, f1, q=1.2) * bell_env(d, peak)
    return finish(reverb(y, 0.4, 0.15))


@many("Whooshes & Transitions", "Dramatic", "Reverse Whoosh", [
    ("Short", dict(d=0.7, f0=6000, f1=300)),
    ("Long", dict(d=1.5, f0=5000, f1=250)),
])
def rev_whoosh(d, f0, f1):
    n = pink(d) + 0.3 * white(d)
    y = sweep_bp(n, f1, f0, q=1.2) * (np.linspace(0, 1, int(SR * d)) ** 2.2)
    return finish(y, fade_out=0.005)


@many("Whooshes & Transitions", "Playful", "Swipe", [
    ("Left", dict(d=0.28, up=False)), ("Right", dict(d=0.28, up=True)), ("Slide", dict(d=0.45, up=True)),
])
def swipe(d, up):
    n = white(d)
    a, b = (500, 5000) if up else (5000, 500)
    y = sweep_bp(n, a, b, q=2.0) * bell_env(d, 0.5)
    return finish(y)


@reg("Whooshes & Transitions", "Mysterious", "Portal Swirl")
def portal():
    d = 1.6
    f = sweep(200, 1200, d, "lin") * (1 + 0.04 * np.sin(2 * np.pi * 9 * tarr(d)))
    y = (sine(f) + 0.5 * saw(f * 0.5)) * bell_env(d, 0.6)
    n = sweep_bp(pink(d), 300, 3000, q=1.5) * bell_env(d, 0.6)
    return finish(reverb(mix(y * 0.5, n), 0.9, 0.3))


@reg("Whooshes & Transitions", "Energetic", "Spin Transition")
def spin():
    d = 0.9
    t = tarr(d)
    lfo = 0.5 + 0.5 * np.sin(2 * np.pi * (4 + 14 * t) * t)
    y = sweep_bp(white(d), 400, 4000, q=1.4) * bell_env(d, 0.5) * (0.5 + 0.5 * lfo)
    return finish(y)


@reg("Whooshes & Transitions", "Playful", "Page Flip")
def pageflip():
    n = white(0.35)
    y = hp(n, 2500) * decay(0.35, 0.07)
    y = mix(y, at(hp(white(0.2), 3000) * decay(0.2, 0.04), 0.1))
    return finish(y)


@reg("Whooshes & Transitions", "Dramatic", "Cinematic Sweep")
def cinesweep():
    d = 2.4
    n = sweep_bp(pink(d), 150, 3000, q=0.9) * bell_env(d, 0.55)
    sub = sine(sweep(50, 90, d)) * bell_env(d, 0.55) * 0.4
    return finish(reverb(mix(n, sub), 1.2, 0.35))


# ───────────────────────── Risers & Builds ─────────────────────────
@many("Risers & Builds", "Dramatic", "Noise Riser", [
    ("2s", dict(d=2.0)), ("4s", dict(d=4.0)), ("6s", dict(d=6.0)),
])
def noise_riser(d):
    n = white(d) * 0.6 + pink(d)
    y = sweep_bp(n, 250, 9000, q=0.8) * swell(d, curve=2.2)
    return finish(y, fade_out=0.01)


@many("Risers & Builds", "Energetic", "Synth Riser", [
    ("Low", dict(d=3.0, f0=80, f1=800)), ("High", dict(d=3.0, f0=300, f1=2400)), ("Epic", dict(d=5.0, f0=100, f1=1600)),
])
def synth_riser(d, f0, f1):
    f = sweep(f0, f1, d)
    y = (saw(f) + saw(f * 1.01) + 0.6 * saw(f * 0.5)) / 2.6
    y = sweep_lp(y, 300, 9000) * swell(d, curve=1.8)
    return finish(reverb(y, 0.5, 0.2), fade_out=0.01)


@many("Risers & Builds", "Mysterious", "Tension Build", [
    ("Short", dict(d=3.0)), ("Long", dict(d=6.0)),
])
def tension(d):
    t = tarr(d)
    f = sweep(70, 140, d, "lin")
    y = (sine(f) + 0.5 * sine(f * 1.5)) * 0.5 * swell(d, curve=1.5)
    pulse = (0.5 + 0.5 * np.sin(2 * np.pi * (1 + 5 * t / d) * t)) ** 2
    n = sweep_bp(pink(d), 400, 4000, q=1.0) * swell(d, curve=2) * pulse * 0.6
    return finish(mix(y, n), fade_out=0.01)


@reg("Risers & Builds", "Playful", "Siren Rise")
def siren_rise():
    d = 2.5
    f = sweep(300, 1500, d)
    return finish(sat(square(f) * 0.4, 1.5) * swell(d, curve=1.3))


@reg("Risers & Builds", "Energetic", "Snare Roll Build")
def snare_roll():
    d = 3.0
    out = np.zeros(int(SR * (d + 0.3)))
    t = 0.0
    gap = 0.16
    while t < d:
        hit = hp(white(0.12), 1800) * decay(0.12, 0.03)
        hit = mix(hit, sine(190, 0.12) * decay(0.12, 0.03) * 0.4)
        amp = 0.25 + 0.75 * (t / d)
        o = int(SR * t)
        out[o:o + len(hit)] += hit * amp
        t += gap
        gap = max(0.03, gap * 0.9)
    return finish(out)


@reg("Risers & Builds", "Dramatic", "Reverse Cymbal")
def rev_cymbal():
    d = 2.2
    n = hp(white(d), 3500) * (np.linspace(0, 1, int(SR * d)) ** 2.5)
    return finish(n, fade_out=0.004)


# ───────────────────────── Impacts & Hits ─────────────────────────
@many("Impacts & Hits", "Dramatic", "Deep Boom", [
    ("1", dict(d=2.0, f0=110, f1=38)), ("2", dict(d=2.8, f0=90, f1=30)), ("Short", dict(d=1.0, f0=130, f1=45)),
])
def boom(d, f0, f1):
    f = sweep(f0, f1, d)
    y = sine(f) * decay(d, d * 0.28)
    click = lp(white(0.08), 3000) * decay(0.08, 0.015) * 0.6
    return finish(reverb(sat(mix(y, click), 1.8), 1.0, 0.25))


@many("Impacts & Hits", "Dramatic", "Cinematic Hit", [
    ("1", dict(root=41)), ("2", dict(root=36)), ("3", dict(root=45)),
])
def cine_hit(root):
    d = 2.6
    f = midi(root)
    body = sine(f * 1.0, d) * decay(d, 0.7) + 0.6 * sine(f * 2.01, d) * decay(d, 0.4)
    metal = lp(white(d), 5000) * decay(d, 0.25) * 0.5
    thud = sine(sweep(160, 45, 0.25), 0.25) * decay(0.25, 0.08)
    return finish(reverb(sat(mix(body, metal, at(thud, 0)), 1.6), 1.4, 0.35))


@many("Impacts & Hits", "Energetic", "Punch", [
    ("Light", dict(f=180, d=0.2)), ("Heavy", dict(f=110, d=0.3)),
])
def punch(f, d):
    y = sine(sweep(f * 2, f * 0.5, d), d) * decay(d, d * 0.3)
    n = lp(white(d), 2500) * decay(d, 0.03) * 0.8
    return finish(sat(mix(y, n), 2.0))


@many("Impacts & Hits", "Dramatic", "Slam", [("Door", dict(d=0.9, f=120)), ("Metal", dict(d=1.4, f=240))])
def slam(d, f):
    t = tarr(d)
    y = sum(sine(f * r, d) * decay(d, 0.3 / (i + 1)) for i, r in enumerate([1, 2.76, 5.4, 8.9])) / 3
    n = hp(white(d), 800) * decay(d, 0.05) * 0.8
    return finish(reverb(sat(mix(y, n), 1.5), 0.7, 0.25))


@many("Impacts & Hits", "Dramatic", "Bass Drop", [
    ("Sub", dict(d=2.2, f0=140, f1=32)), ("Wobble", dict(d=2.6, f0=120, f1=36)),
])
def bass_drop(d, f0, f1):
    f = sweep(f0, f1, d)
    y = sat(sine(f), 2.5) * decay(d, d * 0.45)
    return finish(y)


@reg("Impacts & Hits", "Dramatic", "Braam Stab")
def braam():
    d = 2.4
    f = midi(34)
    y = sum(saw(f * (1 + 0.006 * k), d) for k in range(-3, 4)) / 7
    y = sweep_lp(y, 4000, 300) * decay(d, 0.9)
    return finish(reverb(sat(y, 2.2), 1.2, 0.3))


@many("Impacts & Hits", "Playful", "Thud", [("Soft", dict(f=90)), ("Wood", dict(f=160))])
def thud(f):
    d = 0.4
    y = sine(sweep(f * 1.6, f, d), d) * decay(d, 0.08)
    return finish(mix(y, lp(white(d), 1200) * decay(d, 0.02) * 0.5))


@reg("Impacts & Hits", "Dramatic", "Gong")
def gong():
    d = 5.0
    f = 98
    y = sum(sine(f * r, d) * decay(d, 1.8 / (1 + i * 0.6)) * a for i, (r, a) in enumerate([(1, 1), (1.47, .7), (2.09, .6), (2.57, .45), (3.9, .3)]))
    return finish(reverb(y, 1.5, 0.3))


# ───────────────────────── UI & Pops ─────────────────────────
@many("UI & Pops", "Playful", "Pop", [("1", dict(f=700)), ("2", dict(f=900)), ("3", dict(f=550)), ("Bubble", dict(f=400))])
def pop(f):
    d = 0.18
    y = sine(sweep(f, f * 2.2, d), d) * decay(d, 0.04)
    return finish(y)


@many("UI & Pops", "Calm", "Click", [("Soft", dict(f=2500)), ("Crisp", dict(f=4000)), ("Tick", dict(f=1800))])
def click(f):
    d = 0.06
    y = bp(white(d), f * 0.7, f * 1.4) * decay(d, 0.008)
    return finish(y, fade_out=0.005)


@many("UI & Pops", "Playful", "Notification", [
    ("Ding", dict(notes=[88])), ("Two-Tone", dict(notes=[84, 91])), ("Chime Up", dict(notes=[79, 83, 86])),
    ("Soft Bell", dict(notes=[91])), ("Alert", dict(notes=[86, 86])),
])
def notif(notes):
    parts = []
    for i, n in enumerate(notes):
        f = midi(n)
        d = 0.9
        y = (sine(f, d) + 0.35 * sine(f * 2.0, d) + 0.15 * sine(f * 3.0, d)) * decay(d, 0.22)
        parts.append(at(y, i * 0.13))
    return finish(reverb(mix(*parts), 0.5, 0.2))


@many("UI & Pops", "Energetic", "Success", [("Chime", dict(n=[72, 76, 79, 84])), ("Fanfare", dict(n=[67, 72, 76, 79, 84, 88]))])
def success(n):
    parts = []
    for i, m in enumerate(n):
        f = midi(m)
        d = 0.7
        parts.append(at((sine(f, d) + 0.3 * sine(f * 2, d)) * decay(d, 0.2), i * 0.09))
    return finish(reverb(mix(*parts), 0.7, 0.25))


@many("UI & Pops", "Dramatic", "Error", [("Buzz", dict(f=110)), ("Bonk", dict(f=180))])
def error(f):
    d = 0.4
    y = sat(square(f, d) * 0.5 + saw(f * 1.01, d) * 0.4, 2) * env(d, 0.003, 0.08)
    return finish(lp(y, 1800))


@many("UI & Pops", "Calm", "Toggle", [("On", dict(up=True)), ("Off", dict(up=False))])
def toggle(up):
    d = 0.12
    a, b = (600, 1100) if up else (1100, 600)
    return finish(sine(sweep(a, b, d), d) * decay(d, 0.03))


@reg("UI & Pops", "Playful", "Message Sent")
def msg_sent():
    d = 0.35
    y = sine(sweep(500, 1400, d), d) * env(d, 0.003, 0.12) * 0.7
    return finish(mix(y, at(sine(1400, 0.12) * decay(0.12, 0.04) * 0.5, 0.16)))


@reg("UI & Pops", "Playful", "Camera Shutter")
def shutter():
    a = hp(white(0.03), 2000) * decay(0.03, 0.01)
    b = hp(white(0.05), 1500) * decay(0.05, 0.015)
    return finish(mix(a, at(b, 0.07), at(sine(300, 0.04) * decay(0.04, 0.01) * 0.5, 0.07)))


@reg("UI & Pops", "Energetic", "Coin Collect")
def coin():
    y = mix(square(midi(83), 0.08) * 0.4 * env(0.08, 0.001, 0.02), at(square(midi(88), 0.45) * 0.4 * decay(0.45, 0.14), 0.07))
    return finish(y)


@reg("UI & Pops", "Playful", "Typewriter Key")
def typekey():
    d = 0.1
    return finish(mix(bp(white(d), 1500, 5000) * decay(d, 0.012), sine(180, d) * decay(d, 0.02) * 0.4))


# ───────────────────────── Magic & Sparkle ─────────────────────────
@many("Magic & Sparkle", "Mysterious", "Sparkle", [("1", dict(base=96, n=14)), ("2", dict(base=100, n=18)), ("Soft", dict(base=90, n=10))])
def sparkle(base, n):
    parts = []
    scale = [0, 2, 4, 7, 9, 12, 14, 16, 19]
    for i in range(n):
        f = midi(base + scale[rng().integers(0, len(scale))] % 24)
        d = 0.35
        parts.append(at(sine(f, d) * decay(d, 0.08) * (0.4 + 0.6 * rng().random()), i * (1.2 / n) + rng().random() * 0.03))
    return finish(reverb(mix(*parts), 1.0, 0.4))


@many("Magic & Sparkle", "Mysterious", "Magic Wand", [("Swish", dict(d=1.2, up=True)), ("Reveal", dict(d=1.8, up=True)), ("Fade Away", dict(d=1.5, up=False))])
def wand(d, up):
    a, b = (600, 3000) if up else (3000, 500)
    f = sweep(a, b, d)
    y = (sine(f) + 0.4 * sine(f * 2.0)) * bell_env(d, 0.7 if up else 0.2)
    tw = at(sine(midi(100), 0.4) * decay(0.4, 0.1), d * 0.7)
    return finish(reverb(mix(y * 0.6, tw * 0.5), 1.0, 0.4))


@reg("Magic & Sparkle", "Calm", "Harp Gliss")
def harp():
    parts = []
    notes = [60, 62, 64, 67, 69, 72, 74, 76, 79, 81, 84, 86, 88]
    for i, m in enumerate(notes):
        f = midi(m)
        d = 1.2
        y = (sine(f, d) + 0.3 * sine(f * 2, d) + 0.1 * sine(f * 3, d)) * decay(d, 0.35)
        parts.append(at(y, i * 0.06))
    return finish(reverb(mix(*parts), 1.2, 0.3))


@reg("Magic & Sparkle", "Calm", "Fairy Dust")
def fairy():
    parts = [at(sine(midi(96 + int(rng().integers(0, 12))), 0.25) * decay(0.25, 0.05) * 0.5, i * 0.04 + rng().random() * 0.02) for i in range(30)]
    return finish(reverb(mix(*parts), 1.2, 0.45))


@reg("Magic & Sparkle", "Mysterious", "Cosmic Ping")
def cosmic_ping():
    d = 2.4
    f = midi(84)
    y = (sine(f, d) + 0.5 * sine(f * 1.5, d)) * decay(d, 0.6)
    return finish(echo(reverb(y, 1.2, 0.35), 0.3, 0.4, 3))


@reg("Magic & Sparkle", "Mysterious", "Star Twinkle")
def twinkle():
    parts = []
    for i, m in enumerate([96, 100, 103, 108]):
        parts.append(at(sine(midi(m), 0.6) * decay(0.6, 0.12), i * 0.11))
    return finish(reverb(mix(*parts), 1.0, 0.4))


@reg("Magic & Sparkle", "Dramatic", "Angelic Choir Pad")
def angelic():
    d = 3.5
    ys = []
    for m in [60, 64, 67, 72]:
        f = midi(m)
        ys.append((sine(f, d) + 0.5 * sine(f * 2.0, d)) * (1 + 0.003 * np.sin(2 * np.pi * 5 * tarr(d))))
    y = mix(*ys) * bell_env(d, 0.4)
    return finish(reverb(y, 1.8, 0.4), fade_out=0.05)


# ───────────────────────── Sci-Fi & Cosmic ─────────────────────────
@many("Sci-Fi & Cosmic", "Energetic", "Laser", [("Shot", dict(f0=2400, f1=300, d=0.35)), ("Zap", dict(f0=1600, f1=200, d=0.22)), ("Blaster", dict(f0=1100, f1=120, d=0.45))])
def laser(f0, f1, d):
    f = sweep(f0, f1, d)
    return finish(sat(saw(f) * 0.6 + sine(f), 1.8) * decay(d, d * 0.5))


@many("Sci-Fi & Cosmic", "Energetic", "Power", [("Up", dict(up=True)), ("Down", dict(up=False))])
def power(up):
    d = 1.4
    a, b = (120, 1400) if up else (1400, 90)
    f = sweep(a, b, d)
    y = (saw(f) * 0.5 + square(f * 0.5) * 0.3)
    return finish(sweep_lp(y, 300 if up else 4000, 4000 if up else 200) * (swell(d, curve=1.2) if up else decay(d, 0.6)))


@reg("Sci-Fi & Cosmic", "Mysterious", "Scanner Beep")
def scanner():
    parts = [at(sine(1400 + 200 * (i % 2), 0.1) * decay(0.1, 0.04), i * 0.14) for i in range(6)]
    return finish(mix(*parts))


@reg("Sci-Fi & Cosmic", "Mysterious", "Hologram")
def hologram():
    d = 1.3
    f = sweep(300, 900, d) * (1 + 0.02 * np.sin(2 * np.pi * 30 * tarr(d)))
    return finish(reverb(sine(f) * bell_env(d, 0.3) * 0.6 + sweep_bp(white(d), 1000, 6000) * bell_env(d, 0.3) * 0.2, 0.6, 0.3))


@reg("Sci-Fi & Cosmic", "Dramatic", "Warp Drive")
def warp():
    d = 2.6
    y = sweep_bp(pink(d), 100, 3500, q=0.8) * bell_env(d, 0.7) + sine(sweep(60, 400, d)) * bell_env(d, 0.7) * 0.5
    return finish(reverb(y, 0.8, 0.25))


@reg("Sci-Fi & Cosmic", "Mysterious", "Engine Hum")
def hum():
    d = 4.0
    t = tarr(d)
    y = (sine(55, d) + 0.5 * saw(55.3, d) * 0.3 + 0.3 * sine(110, d)) * (1 + 0.1 * np.sin(2 * np.pi * 3 * t))
    return finish(lp(y, 900), fade_in=0.2, fade_out=0.3)


@reg("Sci-Fi & Cosmic", "Dramatic", "Alarm Klaxon")
def klaxon():
    d = 2.4
    f = np.where((tarr(d) * 2) % 1 < 0.5, 520.0, 380.0)
    return finish(lp(sat(saw(f) * 0.5, 2), 3000))


@reg("Sci-Fi & Cosmic", "Playful", "Robot Voice Beeps")
def robot():
    parts = [at(square(float(rng().choice([400, 520, 640, 780])), 0.08) * 0.4 * env(0.08, 0.002, 0.02), i * 0.1) for i in range(8)]
    return finish(lp(mix(*parts), 3500))


@reg("Sci-Fi & Cosmic", "Mysterious", "Radar Sweep")
def radar():
    d = 2.0
    y = sine(1000, d) * decay(d, 0.5)
    return finish(echo(y * 0.6, 0.45, 0.5, 3))


# ───────────────────────── Retro & Gaming ─────────────────────────
@reg("Retro & Gaming", "Playful", "8-Bit Coin")
def coin8():
    return finish(mix(square(midi(83), 0.07) * 0.5, at(square(midi(91), 0.4) * decay(0.4, 0.12) * 0.5, 0.07)))


@reg("Retro & Gaming", "Playful", "8-Bit Jump")
def jump8():
    d = 0.3
    return finish(square(sweep(250, 900, d, "lin"), d) * 0.5 * decay(d, 0.25))


@reg("Retro & Gaming", "Energetic", "8-Bit Power Up")
def powerup8():
    notes = [60, 64, 67, 72, 76, 79, 84]
    return finish(mix(*[at(square(midi(n), 0.09) * 0.5, i * 0.07) for i, n in enumerate(notes)]))


@reg("Retro & Gaming", "Dramatic", "8-Bit Game Over")
def gameover8():
    notes = [67, 66, 65, 64, 60]
    return finish(mix(*[at(square(midi(n), 0.2) * 0.5 * decay(0.2, 0.15), i * 0.22) for i, n in enumerate(notes)]))


@reg("Retro & Gaming", "Energetic", "8-Bit Level Up")
def levelup8():
    notes = [72, 76, 79, 84, 79, 84, 88]
    return finish(mix(*[at(square(midi(n), 0.12) * 0.5 * decay(0.12, 0.1), i * 0.1) for i, n in enumerate(notes)]))


@reg("Retro & Gaming", "Dramatic", "8-Bit Hit")
def hit8():
    d = 0.2
    return finish(bitcrush(sat(white(d) * decay(d, 0.05) + square(sweep(300, 80, d), d) * 0.5, 2), 5, 3))


@many("Retro & Gaming", "Playful", "Blip", [("1", dict(f=880)), ("2", dict(f=1320)), ("3", dict(f=660))])
def blip(f):
    d = 0.07
    return finish(square(f, d) * 0.5 * env(d, 0.001, 0.02))


# ───────────────────────── Glitch & Digital ─────────────────────────
@many("Glitch & Digital", "Energetic", "Glitch", [("1", dict(d=0.6)), ("2", dict(d=0.9)), ("Burst", dict(d=0.4))])
def glitch(d):
    n = int(SR * d)
    y = np.zeros(n)
    i = 0
    while i < n:
        seg = int(SR * (0.01 + rng().random() * 0.06))
        kind = rng().integers(0, 3)
        if kind == 0:
            s = square(float(rng().choice([300, 700, 1500, 3000])), seg / SR)
        elif kind == 1:
            s = white(seg / SR)
        else:
            s = np.zeros(seg)
        y[i:i + len(s)] += s[: n - i] * 0.6
        i += seg
    return finish(bitcrush(y, 6, 2))


@reg("Glitch & Digital", "Playful", "VHS Rewind")
def vhs_rewind():
    d = 1.4
    n = white(d) * 0.3 + sine(sweep(2000, 300, d), d) * 0.2
    wob = 0.6 + 0.4 * np.sin(2 * np.pi * 14 * tarr(d))
    return finish(bp(n, 400, 6000) * wob * env(d, 0.01, 0.2))


@reg("Glitch & Digital", "Energetic", "Static Burst")
def static():
    d = 0.5
    return finish(hp(white(d), 500) * decay(d, 0.15))


@reg("Glitch & Digital", "Mysterious", "Data Stutter")
def stutter():
    base = sine(900, 0.04) * decay(0.04, 0.02)
    parts = [at(base * (1 - 0.1 * i), i * 0.06) for i in range(8)]
    return finish(bitcrush(mix(*parts), 5, 2))


@reg("Glitch & Digital", "Playful", "Dial-Up Chirp")
def dialup():
    parts = [at(square(float(rng().choice([1200, 1800, 2400])), 0.06) * 0.4, i * 0.07) for i in range(14)]
    return finish(lp(mix(*parts), 4000))


@reg("Glitch & Digital", "Dramatic", "Screen Off")
def screen_off():
    d = 0.5
    return finish(sine(sweep(4000, 80, d), d) * decay(d, 0.15))


# ───────────────────────── Drums & Beats ─────────────────────────
def _kick(f0=150, f1=45, d=0.4):
    return sat(sine(sweep(f0, f1, d), d) * decay(d, d * 0.3), 1.5)


@many("Drums & Beats", "Energetic", "Kick", [("Punchy", dict(f0=180, f1=50, d=0.35)), ("Deep", dict(f0=120, f1=38, d=0.7)), ("808", dict(f0=100, f1=40, d=1.2))])
def kick(f0, f1, d):
    return finish(_kick(f0, f1, d))


@many("Drums & Beats", "Energetic", "Snare", [("Tight", dict(d=0.25, tone=220)), ("Fat", dict(d=0.4, tone=170)), ("Clap", dict(d=0.3, tone=0))])
def snare(d, tone):
    n = hp(white(d), 1200) * decay(d, d * 0.22)
    if tone:
        n = mix(n, sine(tone, d) * decay(d, 0.06) * 0.6)
    else:
        n = mix(*[at(hp(white(0.05), 1000) * decay(0.05, 0.015), k * 0.012) for k in range(4)], n * 0.8)
    return finish(reverb(n, 0.3, 0.15))


@many("Drums & Beats", "Energetic", "Hi-Hat", [("Closed", dict(d=0.08, tau=0.015)), ("Open", dict(d=0.5, tau=0.12))])
def hihat(d, tau):
    return finish(hp(white(d), 7000) * decay(d, tau))


@many("Drums & Beats", "Dramatic", "Cymbal Crash", [("Short", dict(d=1.6)), ("Long", dict(d=3.5))])
def crash(d):
    return finish(hp(white(d), 3000) * decay(d, d * 0.28), fade_out=0.05)


@many("Drums & Beats", "Playful", "Tom", [("High", dict(f=220)), ("Mid", dict(f=150)), ("Low", dict(f=100))])
def tom(f):
    d = 0.5
    return finish(sine(sweep(f * 1.4, f, d), d) * decay(d, 0.15))


@reg("Drums & Beats", "Playful", "Rim Shot")
def rim():
    d = 0.1
    return finish(mix(bp(white(d), 1500, 4500) * decay(d, 0.015), sine(900, d) * decay(d, 0.02) * 0.5))


@reg("Drums & Beats", "Playful", "Shaker")
def shaker():
    d = 0.3
    return finish(hp(white(d), 5000) * np.sin(np.linspace(0, np.pi, int(SR * d))) ** 2)


@reg("Drums & Beats", "Energetic", "Countdown Beeps")
def countdown():
    parts = [at(sine(880, 0.15) * env(0.15, 0.003, 0.05), i * 0.5) for i in range(3)]
    parts.append(at(sine(1760, 0.5) * env(0.5, 0.003, 0.15), 1.5))
    return finish(mix(*parts))


# ───────────────────────── Meme & Comedy (original sound-alikes) ─────────────────────────
@reg("Meme & Comedy", "Energetic", "Air Horn")
def airhorn():
    d = 1.4
    f = 440.0
    y = sum(saw(f * r, d) * a for r, a in [(1, 1), (1.005, .8), (2, .5), (3, .3)]) / 2.6
    y = sat(lp(y, 5000), 2.5) * env(d, 0.01, 0.15)
    return finish(y)


@reg("Meme & Comedy", "Energetic", "Air Horn Triple")
def airhorn3():
    parts = []
    for i in range(3):
        d = 0.32
        y = sum(saw(440 * r, d) * a for r, a in [(1, 1), (1.005, .8), (2, .5)]) / 2.3
        parts.append(at(sat(lp(y, 5000), 2.5) * env(d, 0.01, 0.05), i * 0.4))
    return finish(mix(*parts))


@reg("Meme & Comedy", "Dramatic", "Boom Drop")
def meme_boom():
    d = 1.8
    y = sine(sweep(180, 32, d), d) * decay(d, 0.45)
    c = lp(white(0.1), 2500) * decay(0.1, 0.02) * 0.7
    return finish(reverb(sat(mix(y, c), 2.4), 0.6, 0.2))


@reg("Meme & Comedy", "Dramatic", "Record Scratch")
def record_scratch():
    d = 0.6
    t = tarr(d)
    f = 300 + 900 * np.abs(np.sin(2 * np.pi * 6 * t * (1 - t / d)))
    y = saw(f) * 0.5 + white(d) * 0.25
    y = bp(y, 400, 5000) * env(d, 0.005, 0.15)
    return finish(sat(y, 2))


@reg("Meme & Comedy", "Playful", "Sad Trombone")
def sad_trombone():
    notes = [(62, 0.5), (61, 0.5), (60, 0.5), (59, 1.2)]
    parts = []
    t0 = 0
    for m, dur in notes:
        f = midi(m)
        vib = 1 + (0.012 * np.sin(2 * np.pi * 5.5 * tarr(dur)) if dur > 1 else 0)
        y = lp(saw(f * vib, dur) + 0.5 * saw(f * 2.0 * vib, dur), 1400) * env(dur, 0.04, 0.12)
        parts.append(at(y, t0))
        t0 += dur
    return finish(mix(*parts))


@reg("Meme & Comedy", "Playful", "Ba Dum Tss")
def badum():
    k1 = _kick(160, 50, 0.25)
    sn = hp(white(0.2), 1200) * decay(0.2, 0.05) + sine(200, 0.2) * decay(0.2, 0.05) * 0.5
    cym = hp(white(1.2), 4000) * decay(1.2, 0.3) * 0.7
    return finish(mix(k1, at(sn, 0.22), at(cym, 0.5)))


@many("Meme & Comedy", "Playful", "Slide Whistle", [("Up", dict(a=300, b=1800)), ("Down", dict(a=1800, b=250))])
def slide_whistle(a, b):
    d = 0.9
    f = sweep(a, b, d, "lin") * (1 + 0.01 * np.sin(2 * np.pi * 7 * tarr(d)))
    return finish(sine(f) * env(d, 0.02, 0.1) * 0.8)


@many("Meme & Comedy", "Playful", "Boing", [("1", dict(f=300)), ("2", dict(f=450))])
def boing(f):
    d = 0.7
    t = tarr(d)
    fr = f * (1 + 0.6 * np.sin(2 * np.pi * 8 * t) * np.exp(-t * 4)) * (1 + 0.5 * np.exp(-t * 3))
    return finish(sine(fr) * decay(d, 0.25))


@reg("Meme & Comedy", "Playful", "Bonk")
def bonk():
    d = 0.35
    return finish(mix(sine(sweep(500, 220, d), d) * decay(d, 0.07), lp(white(d), 3000) * decay(d, 0.01) * 0.5))


@reg("Meme & Comedy", "Playful", "Cha-Ching")
def chaching():
    a = bp(white(0.15), 2000, 6000) * decay(0.15, 0.03)
    b = sum(sine(f, 1.0) * decay(1.0, 0.25) for f in [2093, 3136, 4186]) / 3
    return finish(reverb(mix(a, at(b, 0.12)), 0.5, 0.2))


@reg("Meme & Comedy", "Dramatic", "Dun Dun Dun")
def dundundun():
    parts = []
    for i, m in enumerate([43, 43, 38]):
        d = 0.9 if i < 2 else 2.2
        f = midi(m)
        y = lp(saw(f, d) + saw(f * 1.005, d), 1500) * decay(d, 0.5) + sine(f / 2, d) * decay(d, 0.6)
        parts.append(at(y, i * 0.7))
    return finish(reverb(sat(mix(*parts), 1.5), 1.2, 0.3))


@reg("Meme & Comedy", "Mysterious", "Suspense Sting")
def sting():
    d = 1.6
    f = sweep(400, 420, d, "lin")
    y = (saw(f) + saw(f * 1.06)) * 0.4 * decay(d, 0.5)
    return finish(reverb(lp(y, 2500), 1.0, 0.3))


@reg("Meme & Comedy", "Playful", "Whoopee")
def whoopee():
    d = 0.7
    f = sweep(160, 60, d)
    y = lp(square(f * (1 + 0.15 * np.sin(2 * np.pi * 30 * tarr(d)))), 900) * env(d, 0.01, 0.1)
    return finish(sat(y, 2))


@reg("Meme & Comedy", "Playful", "Sneaky Steps")
def sneaky():
    parts = []
    for i, m in enumerate([55, 58, 55, 58, 53, 56, 53, 56]):
        f = midi(m)
        d = 0.2
        parts.append(at(sine(f, d) * decay(d, 0.05) + 0.4 * sine(f * 2, d) * decay(d, 0.04), i * 0.22))
    return finish(mix(*parts))


@reg("Meme & Comedy", "Playful", "Crickets")
def crickets():
    d = 3.0
    parts = []
    for k in range(10):
        for j in range(3):
            parts.append(at(bp(sine(4300, 0.025) * 1.0, 3800, 4800) * env(0.025, 0.003, 0.01) * 0.6, k * 0.3 + j * 0.035))
    return finish(mix(*parts))


@reg("Meme & Comedy", "Playful", "Ding Dong")
def dingdong():
    a = (sine(midi(79), 1.2) + 0.4 * sine(midi(79) * 2, 1.2)) * decay(1.2, 0.4)
    b = (sine(midi(72), 1.6) + 0.4 * sine(midi(72) * 2, 1.6)) * decay(1.6, 0.5)
    return finish(reverb(mix(a, at(b, 0.5)), 0.6, 0.2))


@reg("Meme & Comedy", "Energetic", "Anime Wow")
def anime_wow():
    sp = []
    for i in range(12):
        sp.append(at(sine(midi(88 + int(rng().integers(0, 12))), 0.3) * decay(0.3, 0.08), i * 0.05))
    hit = sine(sweep(500, 90, 0.4), 0.4) * decay(0.4, 0.1)
    return finish(reverb(mix(hit, *sp), 0.9, 0.35))


@reg("Meme & Comedy", "Dramatic", "Fail Horn")
def fail_horn():
    parts = []
    for i, m in enumerate([55, 54, 53, 52]):
        d = 0.45
        f = midi(m)
        parts.append(at(lp(saw(f, d) + 0.6 * saw(f * 2, d), 1300) * env(d, 0.03, 0.08), i * 0.4))
    return finish(mix(*parts))


@reg("Meme & Comedy", "Playful", "Cartoon Run")
def cartoon_run():
    parts = []
    for i in range(14):
        parts.append(at(sine(sweep(300, 900, 0.06), 0.06) * decay(0.06, 0.03) * 0.6, i * 0.07))
    return finish(mix(*parts))


@reg("Meme & Comedy", "Playful", "Sitcom Laugh Bed")
def laugh_bed():
    d = 2.5
    t = tarr(d)
    n = bp(white(d), 300, 3500)
    burst = (0.5 + 0.5 * np.sin(2 * np.pi * 7 * t)) ** 2
    return finish(n * burst * np.sin(np.linspace(0, np.pi, int(SR * d))) ** 0.8)


# ───────────────────────── Ambience & Nature ─────────────────────────
@reg("Ambience & Nature", "Calm", "Wind")
def wind():
    d = 5.0
    y = sweep_bp(pink(d) * 2, 200, 900, q=0.9)
    mod = 0.6 + 0.4 * np.sin(2 * np.pi * 0.35 * tarr(d))
    return finish(y * mod, fade_in=0.4, fade_out=0.5)


@reg("Ambience & Nature", "Calm", "Rain")
def rain():
    d = 6.0
    return finish(hp(white(d), 1500) * 0.5 + lp(pink(d), 3000) * 0.2, fade_in=0.4, fade_out=0.5)


@reg("Ambience & Nature", "Calm", "Ocean Waves")
def waves():
    d = 8.0
    t = tarr(d)
    lfo = (0.5 + 0.5 * np.sin(2 * np.pi * 0.14 * t - 1)) ** 1.5
    return finish(lp(pink(d), 1800) * lfo, fade_in=0.5, fade_out=0.8)


@reg("Ambience & Nature", "Dramatic", "Thunder Rumble")
def thunder():
    d = 4.5
    y = lp(pink(d), 220) * decay(d, 1.4) * 3
    crack = hp(white(0.3), 600) * decay(0.3, 0.06)
    return finish(reverb(mix(y, crack * 0.5), 1.0, 0.25))


@reg("Ambience & Nature", "Calm", "Fire Crackle")
def fire():
    d = 4.0
    out = lp(pink(d), 400) * 0.2
    for _ in range(40):
        o = rng().random() * (d - 0.1)
        out = out + at(hp(white(0.05), 2000) * decay(0.05, 0.01), o, d)[: len(out)] * (0.3 + rng().random())
    return finish(out, fade_in=0.2, fade_out=0.3)


@reg("Ambience & Nature", "Calm", "Heartbeat")
def heartbeat():
    parts = []
    for i in range(6):
        t = i * 0.85
        parts.append(at(sine(sweep(80, 45, 0.18), 0.18) * decay(0.18, 0.06), t))
        parts.append(at(sine(sweep(70, 40, 0.18), 0.18) * decay(0.18, 0.06) * 0.7, t + 0.22))
    return finish(mix(*parts))


@reg("Ambience & Nature", "Mysterious", "Dark Drone")
def dark_drone():
    d = 6.0
    t = tarr(d)
    y = (saw(41.2, d) + saw(41.5, d) + 0.5 * saw(82.4, d)) / 2.5
    y = sweep_lp(y, 200, 700) * (0.7 + 0.3 * np.sin(2 * np.pi * 0.2 * t))
    return finish(reverb(y, 1.5, 0.3), fade_in=0.5, fade_out=0.8)


@reg("Ambience & Nature", "Calm", "Clock Tick")
def clock_tick():
    parts = []
    for i in range(8):
        parts.append(at(bp(white(0.03), 1500, 5000) * decay(0.03, 0.006) + sine(900, 0.03) * decay(0.03, 0.006) * 0.4, i * 0.5))
    return finish(mix(*parts))


@reg("Ambience & Nature", "Calm", "Church Bell")
def bell():
    d = 5.0
    f = 220
    y = sum(sine(f * r, d) * decay(d, 1.6 / (1 + i * 0.5)) * a for i, (r, a) in enumerate([(1, 1), (2.0, .6), (2.4, .5), (3.0, .35), (4.2, .25)]))
    return finish(reverb(y, 1.5, 0.3))
