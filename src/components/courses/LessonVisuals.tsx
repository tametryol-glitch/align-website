'use client';

/**
 * Web ports of the lesson slide visuals.
 *
 * These mirror the renderers in align-app/src/components/courses/LessonSlides.tsx
 * one for one — same data, same colours — so a slide authored once in the Learn
 * CMS looks like the same slide on both platforms. Keep the two in sync: the
 * `visual` values here are the contract the CMS slide editor writes.
 *
 * Every visual renders with no visualData except `sign_card`, which takes an
 * optional { signIndex }.
 */

const SIGN_DATA = [
  { name: 'Aries',       glyph: '♈', dates: 'Mar 21 – Apr 19', element: 'Fire',  color: '#EF4444', emoji: '🐏', keywords: 'Bold, Energetic, Pioneering' },
  { name: 'Taurus',      glyph: '♉', dates: 'Apr 20 – May 20', element: 'Earth', color: '#22C55E', emoji: '🐂', keywords: 'Steady, Sensual, Grounded' },
  { name: 'Gemini',      glyph: '♊', dates: 'May 21 – Jun 20', element: 'Air',   color: '#EAB308', emoji: '👯', keywords: 'Curious, Versatile, Witty' },
  { name: 'Cancer',      glyph: '♋', dates: 'Jun 21 – Jul 22', element: 'Water', color: '#3B82F6', emoji: '🦀', keywords: 'Nurturing, Intuitive, Protective' },
  { name: 'Leo',         glyph: '♌', dates: 'Jul 23 – Aug 22', element: 'Fire',  color: '#EF4444', emoji: '🦁', keywords: 'Radiant, Creative, Confident' },
  { name: 'Virgo',       glyph: '♍', dates: 'Aug 23 – Sep 22', element: 'Earth', color: '#22C55E', emoji: '🌾', keywords: 'Analytical, Precise, Devoted' },
  { name: 'Libra',       glyph: '♎', dates: 'Sep 23 – Oct 22', element: 'Air',   color: '#EAB308', emoji: '⚖️', keywords: 'Harmonious, Diplomatic, Fair' },
  { name: 'Scorpio',     glyph: '♏', dates: 'Oct 23 – Nov 21', element: 'Water', color: '#3B82F6', emoji: '🦂', keywords: 'Intense, Magnetic, Transformative' },
  { name: 'Sagittarius', glyph: '♐', dates: 'Nov 22 – Dec 21', element: 'Fire',  color: '#EF4444', emoji: '🏹', keywords: 'Adventurous, Optimistic, Free' },
  { name: 'Capricorn',   glyph: '♑', dates: 'Dec 22 – Jan 19', element: 'Earth', color: '#22C55E', emoji: '🐐', keywords: 'Ambitious, Disciplined, Strategic' },
  { name: 'Aquarius',    glyph: '♒', dates: 'Jan 20 – Feb 18', element: 'Air',   color: '#EAB308', emoji: '🏺', keywords: 'Innovative, Independent, Visionary' },
  { name: 'Pisces',      glyph: '♓', dates: 'Feb 19 – Mar 20', element: 'Water', color: '#3B82F6', emoji: '🐟', keywords: 'Dreamy, Empathic, Spiritual' },
];

/**
 * Absolute placement on a chart wheel, measured from the container's centre.
 *
 * Chart convention, not clock convention: index 0 sits at 9 o'clock and the
 * sequence runs counterclockwise, so on the house circle the 1st house is the
 * Ascendant on the left, the 4th is the IC at the bottom, the 7th is the
 * Descendant on the right and the 10th is the MC at the top. Starting at 12
 * and running clockwise draws a wheel no astrologer can read.
 */
function radial(index: number, radius: number): React.CSSProperties {
  const angle = (180 - index * 30) * (Math.PI / 180);
  return {
    position: 'absolute',
    left: '50%',
    top: '50%',
    transform: `translate(-50%, -50%) translate(${Math.cos(angle) * radius}px, ${Math.sin(angle) * radius}px)`,
  };
}

function ZodiacWheel() {
  return (
    <div className="flex justify-center py-2">
      <div className="relative w-[248px] h-[248px] rounded-full border border-border-primary/60">
        {SIGN_DATA.map((sign, i) => (
          <div key={sign.name} style={radial(i, 100)} className="flex flex-col items-center w-12">
            <span className="text-xl leading-none" style={{ color: sign.color }}>{sign.glyph}</span>
            <span className="text-[10px] text-text-muted mt-0.5">{sign.name.substring(0, 3)}</span>
          </div>
        ))}
        <div
          style={radial(0, 0)}
          className="w-12 h-12 rounded-full bg-accent-muted flex items-center justify-center"
        >
          <span className="text-xl text-accent-primary">☉</span>
        </div>
      </div>
    </div>
  );
}

const ELEMENTS = [
  { name: 'Fire',  color: '#EF4444', signs: ['Aries', 'Leo', 'Sagittarius'],     emoji: '🔥', quality: 'Action, Passion, Energy' },
  { name: 'Earth', color: '#22C55E', signs: ['Taurus', 'Virgo', 'Capricorn'],    emoji: '🌍', quality: 'Stability, Material, Practical' },
  { name: 'Air',   color: '#EAB308', signs: ['Gemini', 'Libra', 'Aquarius'],     emoji: '💨', quality: 'Thought, Communication, Ideas' },
  { name: 'Water', color: '#3B82F6', signs: ['Cancer', 'Scorpio', 'Pisces'],     emoji: '🌊', quality: 'Emotion, Intuition, Depth' },
];

function ElementGrid() {
  return (
    <div className="grid grid-cols-2 gap-2.5 py-2">
      {ELEMENTS.map((el) => (
        <div
          key={el.name}
          className="rounded-xl border bg-bg-tertiary/40 p-3 flex flex-col items-center text-center"
          style={{ borderColor: el.color }}
        >
          <span className="text-2xl leading-none">{el.emoji}</span>
          <span className="text-sm font-semibold mt-1" style={{ color: el.color }}>{el.name}</span>
          <span className="text-[11px] text-text-secondary mt-0.5">{el.signs.join(' · ')}</span>
          <span className="text-[10px] text-text-muted mt-1">{el.quality}</span>
        </div>
      ))}
    </div>
  );
}

const PLANETS = [
  { name: 'Sun',     glyph: '☉', meaning: 'Identity', color: '#F59E0B' },
  { name: 'Moon',    glyph: '☽', meaning: 'Emotions', color: '#C4B5FD' },
  { name: 'Mercury', glyph: '☿', meaning: 'Mind',     color: '#6EE7B7' },
  { name: 'Venus',   glyph: '♀', meaning: 'Love',     color: '#F472B6' },
  { name: 'Mars',    glyph: '♂', meaning: 'Drive',    color: '#EF4444' },
  { name: 'Jupiter', glyph: '♃', meaning: 'Growth',   color: '#818CF8' },
  { name: 'Saturn',  glyph: '♄', meaning: 'Lessons',  color: '#9CA3AF' },
];

function PlanetRow() {
  return (
    <div className="overflow-x-auto py-2 -mx-1">
      <div className="flex gap-3 px-1 min-w-max">
        {PLANETS.map((p) => (
          <div key={p.name} className="flex flex-col items-center w-16 flex-shrink-0">
            <div
              className="w-11 h-11 rounded-full border-2 flex items-center justify-center bg-bg-tertiary/40"
              style={{ borderColor: p.color }}
            >
              <span className="text-lg" style={{ color: p.color }}>{p.glyph}</span>
            </div>
            <span className="text-[11px] text-text-secondary mt-1">{p.name}</span>
            <span className="text-[10px] text-text-muted">{p.meaning}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const HOUSES = [
  { num: 1,  theme: 'Self' },    { num: 2,  theme: 'Money' },   { num: 3,  theme: 'Mind' },
  { num: 4,  theme: 'Home' },    { num: 5,  theme: 'Joy' },     { num: 6,  theme: 'Health' },
  { num: 7,  theme: 'Partners' },{ num: 8,  theme: 'Power' },   { num: 9,  theme: 'Beliefs' },
  { num: 10, theme: 'Career' },  { num: 11, theme: 'Friends' }, { num: 12, theme: 'Spirit' },
];

function HouseCircle() {
  return (
    <div className="flex justify-center py-2">
      <div className="relative w-[248px] h-[248px] rounded-full border border-border-primary/60">
        {HOUSES.map((h, i) => (
          <div key={h.num} style={radial(i, 95)} className="flex flex-col items-center w-14">
            <div className="w-7 h-7 rounded-full bg-accent-muted flex items-center justify-center">
              <span className="text-[11px] font-semibold text-accent-primary">{h.num}</span>
            </div>
            <span className="text-[10px] text-text-muted mt-0.5">{h.theme}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SignCard({ signIndex }: { signIndex?: number }) {
  const sign = SIGN_DATA[(signIndex ?? 0) % 12];
  return (
    <div className="flex justify-center py-2">
      <div
        className="rounded-2xl px-8 py-6 flex flex-col items-center text-center w-full max-w-xs"
        style={{ background: `linear-gradient(160deg, ${sign.color}30, ${sign.color}08)` }}
      >
        <span className="text-5xl leading-none">{sign.emoji}</span>
        <span className="text-3xl mt-1" style={{ color: sign.color }}>{sign.glyph}</span>
        <span className="text-lg font-semibold text-text-primary mt-1">{sign.name}</span>
        <span className="text-xs text-text-muted">{sign.dates}</span>
        <span
          className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full mt-2"
          style={{ backgroundColor: `${sign.color}30`, color: sign.color }}
        >
          {sign.element}
        </span>
        <span className="text-xs text-text-secondary mt-2">{sign.keywords}</span>
      </div>
    </div>
  );
}

export type SlideVisual =
  | 'zodiac_wheel' | 'element_grid' | 'planet_row'
  | 'house_circle' | 'sign_card' | 'aspect_lines' | 'custom';

/** Renders the visual for a slide, or nothing when the slide has none. */
export function LessonVisual({ visual, data }: { visual?: string; data?: { signIndex?: number } }) {
  switch (visual) {
    case 'zodiac_wheel': return <ZodiacWheel />;
    case 'element_grid': return <ElementGrid />;
    case 'planet_row':   return <PlanetRow />;
    case 'house_circle': return <HouseCircle />;
    case 'sign_card':    return <SignCard signIndex={data?.signIndex} />;
    default:             return null;
  }
}
