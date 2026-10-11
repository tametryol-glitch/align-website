// The letter shown in an avatar when a person has no photo.
//
// `name.charAt(0)` is wrong for display names that start with an emoji (very
// common here: "🔥✨Fenyxx✨🔥"): an emoji is two UTF-16 units, so charAt(0)
// returns half of it and the avatar renders a question mark. This walks the
// name by whole characters, skips spaces, punctuation, emoji and symbols, and
// uses the first real letter or digit ("F" for the name above).
//
// Plain code-point checks (no /u regex) so it compiles for every build target.
// Keep align-app/src/utils/initials.ts and align-web/src/lib/initials.ts in step.

const ASCII_PUNCT = /[!-/:-@[-`{-~]/;

function isSkippable(ch: string): boolean {
  if (/\s/.test(ch) || ASCII_PUNCT.test(ch)) return true;
  const cp = ch.codePointAt(0) ?? 0;
  return (
    (cp >= 0x1f000 && cp <= 0x1faff) || // emoji, flags, skin tones
    (cp >= 0x2190 && cp <= 0x2bff) ||   // arrows, symbols, dingbats (✨ ★ ☀)
    (cp >= 0x2000 && cp <= 0x206f) ||   // general punctuation (incl. zero-width joiner)
    (cp >= 0xfe00 && cp <= 0xfe0f) ||   // variation selectors
    cp === 0x20e3 ||                    // keycap
    (cp >= 0xe0020 && cp <= 0xe007f)    // tag characters (regional flags)
  );
}

export function getInitial(name?: string | null, fallback = '?'): string {
  const chars = Array.from((name || '').trim());
  for (const ch of chars) {
    if (isSkippable(ch)) continue;
    return Array.from(ch.toUpperCase())[0] || fallback;
  }
  // Only emoji / symbols in the name: show the first one, whole, not half.
  return chars.find((ch) => !/\s/.test(ch)) || fallback;
}
