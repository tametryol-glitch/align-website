'use client';

import { useState } from 'react';
import { BookOpen, Search, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { getZodiacGlyph, getPlanetGlyph } from '@/lib/utils';

// Comprehensive astrology reference data
const ZODIAC_SIGNS = [
  { name: 'Aries', element: 'Fire', modality: 'Cardinal', ruler: 'Mars', dates: 'Mar 21 – Apr 19' },
  { name: 'Taurus', element: 'Earth', modality: 'Fixed', ruler: 'Venus', dates: 'Apr 20 – May 20' },
  { name: 'Gemini', element: 'Air', modality: 'Mutable', ruler: 'Mercury', dates: 'May 21 – Jun 20' },
  { name: 'Cancer', element: 'Water', modality: 'Cardinal', ruler: 'Moon', dates: 'Jun 21 – Jul 22' },
  { name: 'Leo', element: 'Fire', modality: 'Fixed', ruler: 'Sun', dates: 'Jul 23 – Aug 22' },
  { name: 'Virgo', element: 'Earth', modality: 'Mutable', ruler: 'Mercury', dates: 'Aug 23 – Sep 22' },
  { name: 'Libra', element: 'Air', modality: 'Cardinal', ruler: 'Venus', dates: 'Sep 23 – Oct 22' },
  { name: 'Scorpio', element: 'Water', modality: 'Fixed', ruler: 'Pluto', dates: 'Oct 23 – Nov 21' },
  { name: 'Sagittarius', element: 'Fire', modality: 'Mutable', ruler: 'Jupiter', dates: 'Nov 22 – Dec 21' },
  { name: 'Capricorn', element: 'Earth', modality: 'Cardinal', ruler: 'Saturn', dates: 'Dec 22 – Jan 19' },
  { name: 'Aquarius', element: 'Air', modality: 'Fixed', ruler: 'Uranus', dates: 'Jan 20 – Feb 18' },
  { name: 'Pisces', element: 'Water', modality: 'Mutable', ruler: 'Neptune', dates: 'Feb 19 – Mar 20' },
];

const PLANETS = [
  { name: 'Sun', meaning: 'Identity, ego, vitality', orbit: '1 year per sign' },
  { name: 'Moon', meaning: 'Emotions, instincts, nurturing', orbit: '2.5 days per sign' },
  { name: 'Mercury', meaning: 'Communication, intellect, travel', orbit: '~1 month per sign' },
  { name: 'Venus', meaning: 'Love, beauty, values', orbit: '~1 month per sign' },
  { name: 'Mars', meaning: 'Action, desire, courage', orbit: '~2 months per sign' },
  { name: 'Jupiter', meaning: 'Expansion, luck, wisdom', orbit: '~1 year per sign' },
  { name: 'Saturn', meaning: 'Structure, discipline, lessons', orbit: '~2.5 years per sign' },
  { name: 'Uranus', meaning: 'Innovation, rebellion, freedom', orbit: '~7 years per sign' },
  { name: 'Neptune', meaning: 'Dreams, spirituality, illusion', orbit: '~14 years per sign' },
  { name: 'Pluto', meaning: 'Transformation, power, rebirth', orbit: '~12-31 years per sign' },
];

const HOUSES = [
  { num: 1, name: 'Self', keywords: 'Identity, appearance, first impressions' },
  { num: 2, name: 'Possessions', keywords: 'Money, values, self-worth' },
  { num: 3, name: 'Communication', keywords: 'Learning, siblings, short travel' },
  { num: 4, name: 'Home', keywords: 'Family, roots, emotional foundation' },
  { num: 5, name: 'Creativity', keywords: 'Romance, children, self-expression' },
  { num: 6, name: 'Health', keywords: 'Work, service, daily routines' },
  { num: 7, name: 'Partnerships', keywords: 'Marriage, contracts, open enemies' },
  { num: 8, name: 'Transformation', keywords: 'Shared resources, death/rebirth, intimacy' },
  { num: 9, name: 'Philosophy', keywords: 'Higher learning, travel, beliefs' },
  { num: 10, name: 'Career', keywords: 'Public image, ambition, authority' },
  { num: 11, name: 'Community', keywords: 'Friends, groups, hopes and wishes' },
  { num: 12, name: 'Unconscious', keywords: 'Solitude, karma, hidden matters' },
];

const ASPECTS = [
  { name: 'Conjunction', angle: '0°', nature: 'Neutral', symbol: '☌', desc: 'Planets merge energies' },
  { name: 'Sextile', angle: '60°', nature: 'Harmonious', symbol: '⚹', desc: 'Opportunity and cooperation' },
  { name: 'Square', angle: '90°', nature: 'Challenging', symbol: '□', desc: 'Tension that drives growth' },
  { name: 'Trine', angle: '120°', nature: 'Harmonious', symbol: '△', desc: 'Natural flow and talent' },
  { name: 'Opposition', angle: '180°', nature: 'Challenging', symbol: '☍', desc: 'Balance through awareness' },
];

type Section = 'signs' | 'planets' | 'houses' | 'aspects';

export default function CosmicIndexPage() {
  const [activeSection, setActiveSection] = useState<Section>('signs');
  const [search, setSearch] = useState('');

  const ELEMENT_COLORS: Record<string, string> = {
    Fire: 'text-fire bg-fire/10',
    Earth: 'text-earth bg-earth/10',
    Air: 'text-air bg-air/10',
    Water: 'text-water bg-water/10',
  };

  const sections: { key: Section; label: string; icon: string }[] = [
    { key: 'signs', label: 'Zodiac Signs', icon: '♈' },
    { key: 'planets', label: 'Planets', icon: '☉' },
    { key: 'houses', label: 'Houses', icon: '🏠' },
    { key: 'aspects', label: 'Aspects', icon: '△' },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-display font-bold text-text-primary mb-2 flex items-center gap-3">
        <BookOpen className="w-7 h-7 text-accent-primary" />
        Cosmic Index
      </h1>
      <p className="text-sm text-text-tertiary mb-6">Your comprehensive astrology reference guide</p>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search terms..."
          className="input pl-10"
        />
      </div>

      {/* Section tabs */}
      <div className="flex gap-1 bg-bg-tertiary rounded-xl p-1 mb-6">
        {sections.map(s => (
          <button
            key={s.key}
            onClick={() => setActiveSection(s.key)}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1.5 ${
              activeSection === s.key
                ? 'bg-bg-card text-text-primary shadow-sm'
                : 'text-text-muted hover:text-text-secondary'
            }`}
          >
            <span>{s.icon}</span>
            <span className="hidden sm:inline">{s.label}</span>
          </button>
        ))}
      </div>

      {/* Signs */}
      {activeSection === 'signs' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {ZODIAC_SIGNS
            .filter(s => !search || s.name.toLowerCase().includes(search.toLowerCase()))
            .map(sign => (
              <div key={sign.name} className="card hover:border-accent-primary/20 transition-colors">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{getZodiacGlyph(sign.name)}</span>
                  <div>
                    <h3 className="text-sm font-semibold text-text-primary">{sign.name}</h3>
                    <p className="text-[10px] text-text-muted">{sign.dates}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${ELEMENT_COLORS[sign.element]}`}>
                    {sign.element}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-bg-tertiary text-text-secondary">
                    {sign.modality}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-bg-tertiary text-text-secondary">
                    {getPlanetGlyph(sign.ruler)} {sign.ruler}
                  </span>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Planets */}
      {activeSection === 'planets' && (
        <div className="space-y-3">
          {PLANETS
            .filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()))
            .map(planet => (
              <div key={planet.name} className="card flex items-center gap-4">
                <span className="text-3xl w-10 text-center">{getPlanetGlyph(planet.name)}</span>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-text-primary">{planet.name}</h3>
                  <p className="text-xs text-text-secondary">{planet.meaning}</p>
                  <p className="text-[10px] text-text-muted mt-0.5">{planet.orbit}</p>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Houses */}
      {activeSection === 'houses' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {HOUSES
            .filter(h => !search || h.name.toLowerCase().includes(search.toLowerCase()) || h.keywords.toLowerCase().includes(search.toLowerCase()))
            .map(house => (
              <div key={house.num} className="card">
                <div className="flex items-center gap-3 mb-1">
                  <span className="w-8 h-8 rounded-lg bg-accent-primary/10 flex items-center justify-center text-sm font-bold text-accent-primary">
                    {house.num}
                  </span>
                  <h3 className="text-sm font-semibold text-text-primary">House of {house.name}</h3>
                </div>
                <p className="text-xs text-text-secondary pl-11">{house.keywords}</p>
              </div>
            ))}
        </div>
      )}

      {/* Aspects */}
      {activeSection === 'aspects' && (
        <div className="space-y-3">
          {ASPECTS
            .filter(a => !search || a.name.toLowerCase().includes(search.toLowerCase()))
            .map(aspect => (
              <div key={aspect.name} className="card flex items-center gap-4">
                <span className="text-3xl w-10 text-center">{aspect.symbol}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-text-primary">{aspect.name}</h3>
                    <span className="text-xs text-text-muted">{aspect.angle}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                      aspect.nature === 'Harmonious' ? 'bg-green-400/10 text-green-400' :
                      aspect.nature === 'Challenging' ? 'bg-red-400/10 text-red-400' :
                      'bg-bg-tertiary text-text-secondary'
                    }`}>
                      {aspect.nature}
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary">{aspect.desc}</p>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
