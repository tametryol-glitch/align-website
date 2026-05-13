'use client';

import { useState, useMemo, useRef, useEffect } from 'react';

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
  onClose?: () => void;
}

// ─── Emoji data ────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { id: 'smileys',  label: '😀', title: 'Smileys' },
  { id: 'people',   label: '👋', title: 'People'  },
  { id: 'animals',  label: '🐶', title: 'Animals' },
  { id: 'nature',   label: '🌸', title: 'Nature'  },
  { id: 'food',     label: '🍎', title: 'Food'    },
  { id: 'hearts',   label: '❤️', title: 'Hearts'  },
] as const;

type CategoryId = (typeof CATEGORIES)[number]['id'];

const EMOJI_DATA: Record<CategoryId, string[]> = {
  smileys: [
    '😀','😃','😄','😁','😆','😅','🤣','😂','🙂','😊','😇','🥰','😍','🤩','😘',
    '😗','😚','😙','🥲','😋','😛','😜','🤪','😝','🤑','🤗','🤭','🫢','🫣','🤫',
    '🤔','🫡','🤐','🤨','😐','😑','😶','🫥','😏','😒','🙄','😬','🤥','🫠','😌',
    '😔','😪','🤤','😴','😷','🤒','🤕','🤢','🤮','🤧','🥵','🥶','🥴','😵','🤯',
    '🤠','🥳','🥸','😎','🤓','🧐','😕','🫤','😟','🙁','😮','😯','😲','😳','🥺',
    '🥹','😦','😧','😨','😰','😥','😢','😭','😱','😖','😣','😞','😓','😩','😫',
    '🥱','😤','😡','😠','🤬',
  ],
  people: [
    '👋','🤚','🖐️','✋','🖖','🫱','🫲','🫳','🫴','👌','🤌','🤏','✌️','🤞','🫰',
    '🤟','🤘','🤙','👈','👉','👆','🖕','👇','☝️','🫵','👍','👎','✊','👊','🤛',
    '🤜','👏','🙌','🫶','👐','🤲','🤝','🙏','💪','🦾','🦿','🦵','🦶','👂','🦻',
    '👃','🧠','🫀','🫁','🦷','🦴','👀','👁️','👅','👄',
  ],
  animals: [
    '🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐻‍❄️','🐨','🐯','🦁','🐮','🐷','🐸',
    '🐵','🙈','🙉','🙊','🐒','🐔','🐧','🐦','🐤','🦆','🦅','🦉','🦇','🐺','🐗',
    '🐴','🦄','🐝','🪱','🐛','🦋','🐌','🐞','🐜','🪰','🪲','🪳','🦟','🦗','🕷️',
    '🕸️','🦂','🐢','🐍','🦎','🦖','🦕','🐙','🦑','🦐','🦞','🦀','🐡','🐠','🐟',
    '🐬','🐳','🐋','🦈','🦭','🐊','🐅','🐆','🦓','🦍','🦧','🦣','🐘','🦛','🦏',
    '🐪','🐫','🦒','🦘','🦬','🐃','🐂','🐄','🐎','🐖','🐏','🐑','🦙','🐐','🦌',
    '🐕','🐩','🦮','🐕‍🦺','🐈','🐈‍⬛','🪶','🐓','🦃','🦤','🦚','🦜','🦢','🦩','🕊️',
    '🐇','🦝','🦨','🦡','🦫','🦦','🦥','🐁','🐀','🐿️','🦔','🐾','🐉','🐲',
  ],
  nature: [
    '🌸','💐','🌷','🌹','🥀','🌺','🌻','🌼','🌾','🌱','🪴','🌲','🌳','🌴','🪵',
    '🌵','🌿','☘️','🍀','🍁','🍂','🍃','🪺','🪹','🍄','🌍','🌎','🌏','🌕','🌖',
    '🌗','🌘','🌑','🌒','🌓','🌔','🌚','🌝','🌞','🌛','🌜','⭐','🌟','💫','✨',
    '☀️','🌤️','⛅','🌥️','🌦️','🌧️','⛈️','🌩️','🌨️','☃️','⛄','❄️','🌬️','💨','🌪️',
    '🌈','☁️','🔥','💧','🌊',
  ],
  food: [
    '🍇','🍈','🍉','🍊','🍋','🍌','🍍','🥭','🍎','🍏','🍐','🍑','🍒','🍓','🫐',
    '🥝','🍅','🫒','🥥','🥑','🍆','🥔','🥕','🌽','🌶️','🫑','🥒','🥬','🥦','🧄',
    '🧅','🥜','🫘','🌰','🫚','🫛','🍞','🥐','🥖','🫓','🥨','🥯','🥞','🧇','🧀',
    '🍖','🍗','🥩','🥓','🍔','🍟','🍕','🌭','🥪','🌮','🌯','🫔','🥙','🧆','🥚',
    '🍳','🥘','🍲','🫕','🥣','🥗','🍿','🧈','🧂','🥫','🍱','🍘','🍙','🍚','🍛',
    '🍜','🍝','🍠','🍢','🍣','🍤','🍥','🥮','🍡','🥟','🥠','🥡','🦪','🍦','🍧',
    '🍨','🍩','🍪','🎂','🍰','🧁','🥧','🍫','🍬','🍭','🍮','🍯','🍼','🥛','☕',
    '🫖','🍵','🍶','🍾','🍷','🍸','🍹','🍺','🍻','🥂','🥃','🫗','🥤','🧋','🧃',
    '🧉','🧊',
  ],
  hearts: [
    '❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💔','❤️‍🔥','❤️‍🩹','❣️','💕','💞',
    '💓','💗','💖','💝','💘','💟','☮️','✝️','☪️','🕉️','☸️','✡️','🔯','🕎','☯️',
    '☦️','🛐','⛎','♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓',
    '⭕','🚫','💯','❗','❕','❓','❔','‼️','⁉️','⚠️','♻️','✅','❎','💠',
    '🔴','🟠','🟡','🟢','🔵','🟣','⚫','⚪','🟤','🔶','🔷','🔸','🔹','🔺','🔻',
    '▪️','▫️','◾','◽','◼️','◻️','⬛','⬜','🟥','🟧','🟨','🟩','🟦','🟪','🟫',
  ],
};

// Build a flat searchable list once at module level
const ALL_EMOJIS: { emoji: string; category: CategoryId }[] = (
  Object.entries(EMOJI_DATA) as [CategoryId, string[]][]
).flatMap(([category, emojis]) => emojis.map((emoji) => ({ emoji, category })));

// ─── Component ─────────────────────────────────────────────────────────────────

export default function EmojiPicker({ onSelect, onClose }: EmojiPickerProps) {
  const [query, setQuery]         = useState('');
  const [activeTab, setActiveTab] = useState<CategoryId>('smileys');
  const containerRef              = useRef<HTMLDivElement>(null);
  const searchRef                 = useRef<HTMLInputElement>(null);
  const gridRef                   = useRef<HTMLDivElement>(null);

  // Focus search on mount
  useEffect(() => {
    searchRef.current?.focus();
  }, []);

  // Click-outside to close
  useEffect(() => {
    if (!onClose) return;
    function handleMouseDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose?.();
      }
    }
    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [onClose]);

  // Scroll grid to top when tab or query changes
  useEffect(() => {
    if (gridRef.current) gridRef.current.scrollTop = 0;
  }, [activeTab, query]);

  const visibleEmojis = useMemo(() => {
    if (query.trim()) {
      // Simple search: match query against the emoji unicode description isn't available
      // so we just search across all emojis and return those whose codepoint text includes the query
      // (won't match by name, but lets us at least filter by typing the emoji char itself).
      // More practically: return all — users browse by category or just scroll.
      // We filter by checking if the emoji string includes the query character.
      const q = query.trim();
      return ALL_EMOJIS
        .filter(({ emoji }) => emoji.includes(q))
        .map(({ emoji }) => emoji);
    }
    return EMOJI_DATA[activeTab];
  }, [query, activeTab]);

  function handleSelect(emoji: string) {
    onSelect(emoji);
    onClose?.();
  }

  return (
    <div
      ref={containerRef}
      className="absolute z-50 w-80 bg-[#1a1a2e] border border-white/10 rounded-xl shadow-2xl flex flex-col overflow-hidden"
      style={{ maxHeight: 400 }}
      // Prevent the panel itself from bubbling mousedown to document
      onMouseDown={(e) => e.stopPropagation()}
    >
      {/* Search */}
      <div className="p-2 border-b border-white/10 flex-shrink-0">
        <div className="relative">
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/30 text-sm select-none">
            🔍
          </span>
          <input
            ref={searchRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search emojis…"
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-sm text-white placeholder-white/30 outline-none focus:border-white/20 focus:bg-white/8 transition-colors"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors text-xs leading-none"
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Category tabs — hidden while searching */}
      {!query && (
        <div className="flex gap-1 px-2 pt-2 pb-1 flex-shrink-0 overflow-x-auto scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveTab(cat.id)}
              title={cat.title}
              className={`flex-shrink-0 px-2 py-1 rounded-lg text-base leading-none transition-colors ${
                activeTab === cat.id
                  ? 'bg-purple-500/20 ring-1 ring-purple-400/30'
                  : 'hover:bg-white/10'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      )}

      {/* Emoji grid */}
      <div
        ref={gridRef}
        className="flex-1 overflow-y-auto px-2 pb-2 pt-1"
        style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.15) transparent' }}
      >
        {visibleEmojis.length === 0 ? (
          <div className="flex items-center justify-center h-24 text-white/30 text-sm">
            No emojis found
          </div>
        ) : (
          <div className="grid grid-cols-8 gap-0.5">
            {visibleEmojis.map((emoji, i) => (
              <button
                key={`${emoji}-${i}`}
                type="button"
                onClick={() => handleSelect(emoji)}
                className="flex items-center justify-center w-full aspect-square text-xl rounded-lg hover:bg-white/10 active:bg-white/20 transition-colors"
                title={emoji}
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Footer: category label */}
      {!query && (
        <div className="px-3 py-1.5 border-t border-white/10 flex-shrink-0">
          <span className="text-xs text-white/30">
            {CATEGORIES.find((c) => c.id === activeTab)?.title}
          </span>
        </div>
      )}
    </div>
  );
}
