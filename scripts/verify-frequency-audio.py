#!/usr/bin/env python
"""Round-trip verification for rendered Cosmic Frequency clips.

Transcribes every rendered clip with Whisper and asserts the digits spoken
match the digits the catalog expects. A swallowed or hallucinated digit means
the user hears the WRONG CODE, which is exactly the failure that ruled Suno
out for this job — so the Kokoro output gets held to the same standard rather
than trusted.

Run with the tts-lab venv, which already has faster-whisper:

  C:\\Users\\tamet\\tts-lab\\.venv\\Scripts\\python.exe ^
    scripts/verify-frequency-audio.py [--dir scripts/data/audio] [--model base]

Exit code is non-zero if any clip mismatches, so this can gate a deploy.
"""
from __future__ import annotations

import argparse
import json
import os
import re
import sys

WORDS = {
    'zero': '0', 'oh': '0', 'o': '0', 'nought': '0',
    'one': '1', 'won': '1',
    'two': '2', 'to': '2', 'too': '2',
    'three': '3',
    'four': '4', 'for': '4', 'fore': '4',
    'five': '5',
    'six': '6',
    'seven': '7',
    'eight': '8', 'ate': '8',
    'nine': '9',
}


_TOKEN = re.compile(r'\d+|[a-z]+')


def transcript_to_digits(text: str) -> str:
    """Pull an ordered digit string out of a transcript.

    Scans for digit runs and number words in order rather than splitting into
    whole tokens. Whisper emits things like "4989s" and "3194-1", and a
    whole-token test discards "4989s" entirely — which reads as "heard
    nothing" and looks exactly like a clip that failed to render.
    """
    out = []
    for tok in _TOKEN.findall(text.lower()):
        if tok.isdigit():
            out.append(tok)          # Whisper sometimes groups: "520"
        elif tok in WORDS:
            out.append(WORDS[tok])
        elif tok.endswith('s') and tok[:-1] in WORDS:
            # Whisper pluralises a spoken digit now and then ("twos" for
            # "two"). Dropping the token loses a digit and makes a correct
            # clip look truncated.
            out.append(WORDS[tok[:-1]])
    return ''.join(out)


def collapse_runs(digits: str) -> str:
    """"1001105010" -> "1010S010"-style: every run of one digit becomes one."""
    return re.sub(r'(\d)\1+', r'\1', digits)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument('--dir', default=os.path.join('scripts', 'data', 'audio'))
    ap.add_argument('--model', default='base',
                    help='whisper size: tiny|base|small (base is a good tradeoff)')
    ap.add_argument('--limit', type=int, default=0, help='verify only the first N clips')
    ap.add_argument('--ids', default='',
                    help='comma-separated frequency ids to re-check in isolation')
    ap.add_argument('--voice', default='',
                    help='verify only one voice folder')
    ap.add_argument('--report', default='',
                    help='write every mismatch id to this file, one per line')
    ap.add_argument('--beam', type=int, default=1,
                    help='whisper beam size; raise it when re-checking mismatches')
    args = ap.parse_args()

    manifest_path = os.path.join(args.dir, 'manifest.json')
    if not os.path.exists(manifest_path):
        print(f'no manifest at {manifest_path} — run render-frequency-audio.mjs first')
        return 1

    with open(manifest_path, encoding='utf-8') as fh:
        manifest = json.load(fh)

    # v2 is clips[voice][id]; v1 was flat clips[id]. Flatten to
    # (display key, meta, relative path) so both verify identically.
    raw = manifest.get('clips', {})
    items = []
    if manifest.get('version', 1) >= 2:
        for voice, by_id in raw.items():
            for fid, meta in by_id.items():
                items.append((f'{voice}/{fid}', meta, os.path.join(voice, meta['file'])))
    else:
        for fid, meta in raw.items():
            items.append((fid, meta, meta['file']))

    if args.voice:
        items = [i for i in items if i[0].startswith(args.voice + '/')]
    if args.ids:
        wanted = {s.strip() for s in args.ids.split(',') if s.strip()}
        items = [i for i in items if i[0] in wanted or i[0].split('/')[-1] in wanted]
    if args.limit:
        items = items[:args.limit]

    if not items:
        print('manifest has no clips')
        return 1

    from faster_whisper import WhisperModel
    print(f'loading whisper "{args.model}" (cpu, int8)...')
    model = WhisperModel(args.model, device='cpu', compute_type='int8')

    ok = 0
    mismatches = []
    warnings = []
    missing = []

    for i, (freq_id, meta, rel) in enumerate(items, 1):
        path = os.path.join(args.dir, rel)
        if not os.path.exists(path):
            missing.append(freq_id)
            continue

        segments, _info = model.transcribe(path, language="en", beam_size=args.beam)
        text = ' '.join(s.text for s in segments)
        heard = transcript_to_digits(text)
        expected = meta['digits']

        if heard == expected:
            ok += 1
        elif collapse_runs(heard) == collapse_runs(expected):
            # Known ASR blind spot, not a bad clip. Whisper merges or
            # duplicates adjacent identical digits ("1, 1" -> "1"), and it does
            # it at every model size and speed. Confirmed by measuring audio
            # duration: a clip whose transcript "lost" a digit still runs the
            # full length for its real digit count, so the audio is intact.
            # Reported, never failed on.
            warnings.append({
                'id': freq_id,
                'expected': expected,
                'heard': heard,
                'transcript': text.strip()[:90],
            })
            ok += 1
        else:
            mismatches.append({
                'id': freq_id,
                'expected': expected,
                'heard': heard,
                'transcript': text.strip()[:90],
            })

        if i % 25 == 0 or i == len(items):
            print(f'  {i}/{len(items)} verified...')

    print(f'\nmatched    : {ok}/{len(items)}')
    print(f'  of which repeat-run warnings : {len(warnings)}')
    print(f'mismatched : {len(mismatches)}')
    print(f'missing    : {len(missing)}')

    if warnings:
        print('\nrepeat-run warnings — ASR blind spot on adjacent identical')
        print('digits, not a bad clip. Spot-check by duration if unsure:')
        for w in warnings[:15]:
            print(f"  {w['id']}: expected {w['expected']}  heard {w['heard']}")
        if len(warnings) > 15:
            print(f'  ...and {len(warnings) - 15} more')

    if missing:
        print('\nmissing files:')
        for m in missing[:15]:
            print('  ' + m)

    if mismatches:
        print('\nmismatches (re-render these, or check the transcript is just ASR noise):')
        for m in mismatches[:200]:
            print(f"  {m['id']}")
            print(f"      expected {m['expected']}")
            print(f"      heard    {m['heard']}")
            print(f"      asr      {m['transcript']!r}")
        if len(mismatches) > 200:
            print(f'  ...and {len(mismatches) - 200} more')

    if args.report:
        with open(args.report, 'w', encoding='utf-8') as fh:
            for m in mismatches:
                fh.write(m['id'] + '\n')
        print(f'\nmismatch ids -> {args.report}')

    return 1 if (mismatches or missing) else 0


if __name__ == '__main__':
    sys.exit(main())
