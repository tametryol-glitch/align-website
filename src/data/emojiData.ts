// Emoji for the chat / comment / post picker. Space-separated so multi-part
// emoji (flags, skin tones, joined sequences) stay intact. The cosmic set is
// first-class here: this is an astrology app.

export interface EmojiCategory {
  id: string;
  icon: string;
  label: string;
  emojis: string[];
}

const split = (s: string) => s.trim().split(/\s+/);

export const EMOJI_CATEGORIES: EmojiCategory[] = [
  {
    id: 'smileys', icon: '😀', label: 'Smileys',
    emojis: split(`😀 😃 😄 😁 😆 😅 🤣 😂 🙂 🙃 😉 😊 😇 🥰 😍 🤩 😘 😗 😚 😙 😋 😛 😜 🤪 😝 🤑 🤗 🤭 🤫 🤔 🤐 🤨 😐 😑 😶 😏 😒 🙄 😬 😮‍💨 🤥 😌 😔 😪 🤤 😴 😷 🤒 🤕 🤢 🤮 🤧 🥵 🥶 🥴 😵 🤯 🤠 🥳 😎 🤓 🧐 😕 😟 🙁 ☹️ 😮 😯 😲 😳 🥺 😦 😧 😨 😰 😥 😢 😭 😱 😖 😣 😞 😓 😩 😫 🥱 😤 😡 😠 🤬 😈 👿 💀 ☠️ 💩 🤡 👹 👺 👻 👽 👾 🤖`),
  },
  {
    id: 'gestures', icon: '👍', label: 'People',
    emojis: split(`👋 🤚 🖐️ ✋ 🖖 👌 🤌 🤏 ✌️ 🤞 🤟 🤘 🤙 👈 👉 👆 👇 ☝️ 👍 👎 ✊ 👊 🤛 🤜 👏 🙌 👐 🤲 🤝 🙏 ✍️ 💅 🤳 💪 🦾 🦵 🦶 👂 👃 🧠 👀 👁️ 👅 👄 👶 🧒 👦 👧 🧑 👱 👨 👩 🧓 👴 👵 🙍 🙎 🙅 🙆 💁 🙋 🙇 🤦 🤷 💃 🕺 👯 🧘 🛀 👑 🎓 🧙 🧚 🧜 🧝 🧞 🧛 🦸 🦹 👼 🎅 🤶`),
  },
  {
    id: 'hearts', icon: '❤️', label: 'Hearts',
    emojis: split(`❤️ 🧡 💛 💚 💙 💜 🖤 🤍 🤎 💔 ❣️ 💕 💞 💓 💗 💖 💘 💝 💟 ♥️ 😍 🥰 😘 💋 💌 💐 🌹 🥀 🌷 🌺 🌸 💍 💎 🔥 ✨ 💫 ⭐ 🌟 💥 💦 💨 🕊️ 🫶 🫂`),
  },
  {
    id: 'cosmic', icon: '🌙', label: 'Cosmic',
    emojis: split(`♈ ♉ ♊ ♋ ♌ ♍ ♎ ♏ ♐ ♑ ♒ ♓ ⛎ ☀️ 🌙 ⭐ 🌟 ✨ 💫 ☄️ 🌠 🌌 🪐 🌍 🌎 🌏 🌑 🌒 🌓 🌔 🌕 🌖 🌗 🌘 🌚 🌝 🌛 🌜 🌞 ☁️ ⛅ 🌤️ 🌈 ⚡ 🔥 🌊 💧 🌪️ ❄️ 🔮 🧿 🪬 📿 🕯️ 🔭 🛸 🚀 👁️ 🌀 ☯️ ☮️ 🕉️ ☸️ ✡️ ☪️ ✝️ 🔯 ♾️ 🧬 ⚛️ 🪄 🎴 🃏 🀄 🧙‍♀️ 🧚‍♀️ 🦄 🐉 🦋`),
  },
  {
    id: 'nature', icon: '🐶', label: 'Animals',
    emojis: split(`🐶 🐱 🐭 🐹 🐰 🦊 🐻 🐼 🐨 🐯 🦁 🐮 🐷 🐸 🐵 🙈 🙉 🙊 🐔 🐧 🐦 🐤 🦆 🦅 🦉 🦇 🐺 🐗 🐴 🦄 🐝 🐛 🦋 🐌 🐞 🐜 🕷️ 🦂 🐢 🐍 🦎 🐙 🦑 🦐 🦀 🐠 🐟 🐬 🐳 🐋 🦈 🐊 🐅 🐆 🦓 🦍 🐘 🦛 🐪 🐫 🦒 🦘 🐂 🐎 🐖 🐏 🦙 🌵 🎄 🌲 🌳 🌴 🌱 🌿 ☘️ 🍀 🍁 🍂 🍃 🍄 🌾 🌻 🌼`),
  },
  {
    id: 'food', icon: '🍕', label: 'Food',
    emojis: split(`🍏 🍎 🍐 🍊 🍋 🍌 🍉 🍇 🍓 🫐 🍈 🍒 🍑 🥭 🍍 🥥 🥝 🍅 🍆 🥑 🥦 🥬 🥒 🌶️ 🌽 🥕 🥔 🍞 🥐 🥖 🧀 🥚 🍳 🥞 🥓 🥩 🍗 🍖 🌭 🍔 🍟 🍕 🥪 🌮 🌯 🥗 🍝 🍜 🍲 🍛 🍣 🍱 🥟 🍤 🍙 🍚 🍘 🍥 🥠 🍢 🍡 🍧 🍨 🍦 🥧 🧁 🍰 🎂 🍮 🍭 🍬 🍫 🍿 🍩 🍪 ☕ 🍵 🧃 🥤 🍺 🍻 🥂 🍷 🥃 🍸 🍹 🍾`),
  },
  {
    id: 'activity', icon: '⚽', label: 'Activities',
    emojis: split(`⚽ 🏀 🏈 ⚾ 🥎 🎾 🏐 🏉 🎱 🏓 🏸 🥊 🥋 ⛳ 🏹 🎣 🎽 🛹 ⛸️ 🎿 🏂 🏋️ 🤸 🤾 🏌️ 🏇 🧘 🏄 🏊 🚴 🏆 🥇 🥈 🥉 🏅 🎖️ 🎗️ 🎫 🎟️ 🎪 🎭 🎨 🎬 🎤 🎧 🎼 🎹 🥁 🎷 🎺 🎸 🎻 🎲 🎯 🎳 🎮 🎰 🧩 🎁 🎉 🎊 🎈 🎀 🪅 🪩`),
  },
  {
    id: 'objects', icon: '💡', label: 'Objects',
    emojis: split(`⌚ 📱 💻 ⌨️ 🖥️ 📷 📸 📹 🎥 📞 ☎️ 📺 📻 ⏰ ⏳ 🔋 🔌 💡 🔦 🕯️ 💸 💵 💰 💳 💎 ⚖️ 🔧 🔨 ⚒️ 🛠️ 🔩 ⚙️ 🧲 💣 🔪 🛡️ 🔮 💊 💉 🧬 🔬 🔭 🧪 🧹 🧺 🧻 🚿 🛁 🔑 🗝️ 🚪 🛋️ 🛏️ 🧸 🖼️ 🛍️ 🎒 👓 🕶️ 👔 👗 👠 👑 💄 💍 📚 📖 📝 ✏️ 📌 📎 ✂️ 🗑️ 🔒 🔓`),
  },
  {
    id: 'symbols', icon: '💯', label: 'Symbols',
    emojis: split(`💯 ✅ ❌ ❎ ❓ ❗ ‼️ ⁉️ ⚠️ 🚫 ⛔ 🔞 ♻️ ✔️ ➕ ➖ ➗ ✖️ ➰ ➿ 〰️ ©️ ®️ ™️ #️⃣ *️⃣ 0️⃣ 1️⃣ 2️⃣ 3️⃣ 4️⃣ 5️⃣ 6️⃣ 7️⃣ 8️⃣ 9️⃣ 🔟 🔴 🟠 🟡 🟢 🔵 🟣 ⚫ ⚪ 🟤 🔺 🔻 🔶 🔷 ▶️ ⏸️ ⏹️ ⏺️ ⏭️ ⏮️ 🔀 🔁 🔄 ⬆️ ⬇️ ⬅️ ➡️ ↗️ ↘️ ↙️ ↖️ 🔔 🔕 🎵 🎶 ➡️ 🏁 🚩 🏳️ 🏴 🏳️‍🌈`),
  },
];

// ── Skin tones ──────────────────────────────────────────────────────────
// Unicode has five skin-tone shades (Fitzpatrick scale) that can follow a
// person or hand emoji. 0 = the default yellow. They describe shades of skin,
// not races: anyone picks the one that looks like them.
export interface SkinTone {
  id: number;
  label: string;
  /** Swatch colour shown in the picker. */
  swatch: string;
  /** Unicode modifier appended to the base emoji ('' for the default). */
  modifier: string;
}

export const SKIN_TONES: SkinTone[] = [
  { id: 0, label: 'Default', swatch: '#FFC83D', modifier: '' },
  { id: 1, label: 'Light', swatch: '#F7D7C4', modifier: '\u{1F3FB}' },
  { id: 2, label: 'Medium-light', swatch: '#D8B094', modifier: '\u{1F3FC}' },
  { id: 3, label: 'Medium', swatch: '#B08157', modifier: '\u{1F3FD}' },
  { id: 4, label: 'Medium-dark', swatch: '#8A5A3C', modifier: '\u{1F3FE}' },
  { id: 5, label: 'Dark', swatch: '#5C3A25', modifier: '\u{1F3FF}' },
];

const VS16 = /\uFE0F/g;

// People / hand / body emoji that accept a skin-tone modifier.
const TONE_BASE = new Set(
  split(`👋 🤚 🖐 ✋ 🖖 👌 🤌 🤏 ✌ 🤞 🤟 🤘 🤙 👈 👉 👆 👇 ☝ 👍 👎 ✊ 👊 🤛 🤜 👏 🙌 👐 🤲 🙏 ✍ 💅 🤳 💪 🦵 🦶 👂 👃 👶 🧒 👦 👧 🧑 👱 👨 👩 🧓 👴 👵 🙍 🙎 🙅 🙆 💁 🙋 🙇 🤦 🤷 💃 🕺 🧘 🛀 🧙 🧚 🧜 🧝 🧛 🦸 🦹 👼 🎅 🤶`),
);

/** The emoji in the chosen skin tone, if it has one; otherwise unchanged. */
export function applyTone(emoji: string, toneId: number): string {
  if (toneId <= 0) return emoji;
  const base = emoji.replace(VS16, '');
  if (!TONE_BASE.has(base)) return emoji;
  const tone = SKIN_TONES.find((t) => t.id === toneId);
  return tone ? base + tone.modifier : emoji;
}
