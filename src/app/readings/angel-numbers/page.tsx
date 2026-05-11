'use client';

import { useState } from 'react';
import { Hash } from 'lucide-react';

const ANGEL_NUMBERS: Record<string, { meaning: string; message: string; area: string }> = {
  '111': { meaning: 'New Beginnings', message: 'The universe is opening a portal of manifestation. Your thoughts are becoming reality faster than usual — keep them positive and aligned.', area: 'Manifestation' },
  '222': { meaning: 'Balance & Trust', message: 'Everything is unfolding as it should. Trust the process and maintain faith. Partnerships and cooperation are highlighted.', area: 'Harmony' },
  '333': { meaning: 'Ascended Masters', message: 'Spiritual guides are near. You are being encouraged to express your creative gifts and use your natural abilities to uplift others.', area: 'Creativity' },
  '444': { meaning: 'Protection & Foundation', message: 'Angels surround you. You are on the right path and your hard work is building something lasting. Stay grounded and persistent.', area: 'Security' },
  '555': { meaning: 'Major Change', message: 'Significant transformation is underway. Release what no longer serves you and embrace the new chapter opening before you.', area: 'Transformation' },
  '666': { meaning: 'Realignment', message: 'Time to rebalance your focus between material and spiritual worlds. Nurture your inner world as much as your outer achievements.', area: 'Balance' },
  '777': { meaning: 'Divine Luck', message: 'You are in perfect alignment with the cosmos. Miracles, synchronicities, and spiritual downloads are flowing to you. Keep going.', area: 'Spirituality' },
  '888': { meaning: 'Abundance', message: 'Financial and material abundance is flowing your way. You are entering a cycle of reward for past efforts and karmic balance.', area: 'Prosperity' },
  '999': { meaning: 'Completion', message: 'A major life chapter is closing. Release, forgive, and prepare for the next cycle. You are being called to step into your higher purpose.', area: 'Closure' },
  '000': { meaning: 'Infinite Potential', message: 'You are one with the universe. A moment of pure potential where anything is possible. Set your deepest intentions now.', area: 'Unity' },
  '1111': { meaning: 'Spiritual Awakening', message: 'A powerful gateway is opening. You are being called to a higher level of consciousness and spiritual awareness.', area: 'Awakening' },
  '1234': { meaning: 'Progress', message: 'You are making step-by-step progress toward your goals. Keep moving forward with confidence — each step matters.', area: 'Growth' },
};

export default function AngelNumbersPage() {
  const [selectedNumber, setSelectedNumber] = useState<string | null>(null);
  const [customNumber, setCustomNumber] = useState('');

  const currentReading = selectedNumber ? ANGEL_NUMBERS[selectedNumber] : null;

  function handleCustomLookup() {
    const num = customNumber.trim();
    if (ANGEL_NUMBERS[num]) {
      setSelectedNumber(num);
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Hash className="w-8 h-8 text-accent-primary" />
        <div>
          <h1 className="text-2xl font-display font-bold text-text-primary">Angel Numbers</h1>
          <p className="text-text-tertiary text-sm">Decode the messages hidden in repeating number sequences</p>
        </div>
      </div>

      {/* Custom lookup */}
      <div className="card mb-6">
        <label className="text-sm text-text-secondary font-medium mb-2 block">
          Enter a number you keep seeing
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={customNumber}
            onChange={(e) => setCustomNumber(e.target.value.replace(/[^0-9]/g, ''))}
            placeholder="e.g. 111, 444, 1111"
            className="input flex-1"
            maxLength={4}
          />
          <button onClick={handleCustomLookup} className="btn-primary whitespace-nowrap">
            Look Up
          </button>
        </div>
      </div>

      {/* Number grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-6">
        {Object.keys(ANGEL_NUMBERS).map((num) => (
          <button
            key={num}
            onClick={() => setSelectedNumber(num)}
            className={`p-3 rounded-xl border text-center transition-all ${
              selectedNumber === num
                ? 'border-accent-primary bg-accent-muted text-accent-primary'
                : 'border-border-primary text-text-secondary hover:border-accent-primary/40 hover:bg-bg-tertiary'
            }`}
          >
            <span className="text-lg font-bold block">{num}</span>
            <span className="text-[10px] text-text-muted">{ANGEL_NUMBERS[num].area}</span>
          </button>
        ))}
      </div>

      {/* Reading */}
      {currentReading && selectedNumber && (
        <div className="bg-gradient-cosmic rounded-2xl p-8 border border-accent-muted">
          <div className="text-center mb-4">
            <span className="text-4xl font-display font-bold text-accent-primary">{selectedNumber}</span>
            <h2 className="text-xl font-display font-bold text-text-primary mt-2">{currentReading.meaning}</h2>
            <span className="text-xs text-accent-secondary uppercase tracking-wider">{currentReading.area}</span>
          </div>
          <p className="text-text-secondary text-center leading-relaxed">{currentReading.message}</p>
        </div>
      )}
    </div>
  );
}
