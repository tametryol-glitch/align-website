"""Spoken meme-style lines via the local Kokoro TTS -> mp3 + manifest.json.
Run with the tts-lab venv:  C:\\Users\\tamet\\tts-lab\\.venv\\Scripts\\python.exe voices.py <out_dir>
Original synthetic voices only (no samples of real people or viral clips)."""
import json
import re
import subprocess
import sys
import wave
from pathlib import Path

sys.path.insert(0, r"C:\Users\tamet\tts-lab")
import tts_engine as tts  # noqa: E402

FFMPEG = r"C:\Users\tamet\OneDrive\Documents\Desktop\AstroEinsteinSoftware\align-video-renderer\node_modules\ffmpeg-static\ffmpeg.exe"

# (display name, spoken text, voice, speed, ffmpeg fx chain or None)
DEEP = "asetrate=24000*0.82,aresample=24000,atempo=1.22,aecho=0.8:0.6:90:0.35"
ECHO = "aecho=0.8:0.7:260|420:0.45|0.3"
TINY = "asetrate=24000*1.35,aresample=24000,atempo=0.74"
RADIO = "highpass=f=450,lowpass=f=3200,acompressor=threshold=-18dB:ratio=6"
HALL = "aecho=0.8:0.88:60|120|240:0.4|0.3|0.2"

LINES = [
    # Reactions
    ("Bruh", "Bruh.", "am_adam", 0.85, None),
    ("Bruh What", "Bruh... what?", "am_michael", 0.9, None),
    ("Bruh Deep Echo", "Bruh.", "am_onyx", 0.8, DEEP),
    ("Oh No", "Oh no.", "af_bella", 0.95, None),
    ("Oh No No No No", "Oh no, no, no, no!", "af_nicole", 1.1, None),
    ("Oh No Dramatic", "Ohhh nooo.", "am_fenrir", 0.8, ECHO),
    ("Wow", "Wow.", "af_sky", 0.95, None),
    ("Wow Amazing", "Wow! That's amazing!", "af_nova", 1.05, None),
    ("Wow Deep", "Wow.", "am_adam", 0.85, DEEP),
    ("Nope", "Nope.", "am_eric", 1.0, None),
    ("Nah", "Nah.", "am_liam", 1.0, None),
    ("Mmm Nope", "Mmm, nope.", "af_jessica", 0.95, None),
    ("Lets Go", "Let's go!", "am_michael", 1.15, None),
    ("Lets Goooo", "Let's gooooo!", "am_puck", 1.05, None),
    ("Lets Go Hype", "Let's go! Let's go! Let's go!", "af_nova", 1.2, None),
    ("Are You Serious", "Are you serious?", "af_bella", 1.0, None),
    ("Seriously", "Seriously?", "af_sarah", 1.0, None),
    ("Wait What", "Wait, what?", "af_heart", 1.05, None),
    ("Hold On", "Hold on.", "am_echo", 0.95, None),
    ("Excuse Me", "Excuse me?", "bf_emma", 1.0, None),
    ("No Way", "No way!", "af_river", 1.1, None),
    ("Yikes", "Yikes.", "af_kore", 1.0, None),
    ("Oops", "Oops.", "af_sky", 1.0, None),
    ("Uh Oh", "Uh oh.", "af_aoede", 0.95, None),
    ("Oh My Gosh", "Oh my gosh!", "af_nicole", 1.1, None),
    ("Thats Crazy", "That's crazy.", "am_eric", 0.95, None),
    ("Sheesh", "Sheesh!", "am_michael", 1.1, None),
    ("Hello", "Hello?", "bf_isabella", 0.95, None),
    ("Anyway", "Anyway.", "bm_george", 0.95, None),
    ("Why Though", "Why though?", "af_heart", 1.0, None),
    ("Not Even Mad", "I'm not even mad.", "bm_lewis", 0.95, None),
    ("Thats Wild", "That's wild.", "am_liam", 1.0, None),
    ("Fantastic", "Fantastic.", "bm_daniel", 0.9, None),
    ("Gotcha", "Gotcha!", "am_puck", 1.1, None),
    ("Awkward", "Awkward...", "af_jessica", 0.85, None),
    ("Sus", "That's kind of sus.", "am_echo", 1.0, None),
    ("Chill Out", "Chill out.", "am_adam", 0.95, None),
    ("Big Mistake", "Big mistake.", "am_onyx", 0.85, DEEP),
    ("Not Today", "Not today.", "bm_george", 0.95, None),
    # Celebration / hype
    ("Boom Done", "Boom! Done.", "am_michael", 1.15, None),
    ("Bam", "Bam!", "am_puck", 1.2, None),
    ("Ta Da", "Ta-da!", "af_nova", 1.1, None),
    ("Congratulations", "Congratulations!", "af_heart", 1.05, None),
    ("Critical Hit", "Critical hit!", "am_fenrir", 1.1, ECHO),
    ("Mission Accomplished", "Mission accomplished.", "bm_daniel", 0.95, None),
    ("Epic Fail", "Epic fail.", "am_eric", 0.9, None),
    # Narrator / storytelling
    ("Plot Twist", "Plot twist.", "bm_george", 0.85, HALL),
    ("Meanwhile", "Meanwhile...", "bm_fable", 0.9, None),
    ("Three Hours Later", "Three hours later.", "bm_lewis", 0.9, None),
    ("To Be Continued", "To be continued.", "bm_daniel", 0.85, HALL),
    ("Narrator Dramatic Pause", "And then... everything changed.", "bm_george", 0.85, HALL),
    # Voice FX variants
    ("Radio Static Hello", "Hello? Can anyone hear me?", "am_adam", 0.95, RADIO),
    ("Tiny Voice Wow", "Wow.", "af_sky", 1.0, TINY),
    ("Tiny Voice Nope", "Nope.", "am_eric", 1.0, TINY),
    ("Echo Oh No", "Oh no.", "af_bella", 0.9, ECHO),
]


def slug(s):
    return "voice-" + re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")


def run(cmd):
    subprocess.run(cmd, check=True, capture_output=True)


def main(out):
    out = Path(out)
    out.mkdir(parents=True, exist_ok=True)
    manifest = []
    for idx, (name, text, voice, speed, fx) in enumerate(LINES):
        r = tts.render(text, voice=voice, speed=speed, fmt="wav")
        src = Path(r.path)
        s = slug(name)
        mp3 = out / f"{s}.mp3"
        # trim leading/trailing silence, optional fx, tame peaks, 44.1k mono mp3
        chain = [
            "silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.02",
            "areverse", "silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.05", "areverse",
        ]
        if fx:
            chain.append(fx)
        chain += ["highpass=f=60", "alimiter=limit=0.9:level=disabled", "loudnorm=I=-16:TP=-1.5:LRA=7", "afade=t=in:d=0.005"]
        run([FFMPEG, "-y", "-loglevel", "error", "-i", str(src), "-af", ",".join(chain), "-ac", "1", "-ar", "44100",
             "-codec:a", "libmp3lame", "-b:a", "128k", str(mp3)])
        # measure duration from a quick decode
        probe = subprocess.run([FFMPEG, "-i", str(mp3), "-f", "null", "-"], capture_output=True, text=True)
        m = re.findall(r"time=(\d+):(\d+):([\d.]+)", probe.stderr)
        dur = 0.0
        if m:
            h, mi, se = m[-1]
            dur = int(h) * 3600 + int(mi) * 60 + float(se)
        manifest.append({
            "slug": s, "name": "Voice: " + name, "category": "Meme & Comedy", "mood": "Playful",
            "duration": round(dur, 3), "file": mp3.name, "text": text, "voice": voice,
        })
        print(f"{idx + 1:2d}/{len(LINES)} {name} ({dur:.2f}s)")
    (out / "manifest.json").write_text(json.dumps(manifest, indent=1), encoding="utf-8")
    print("built", len(manifest))


if __name__ == "__main__":
    main(sys.argv[1])
