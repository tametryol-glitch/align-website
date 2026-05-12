'use client';

interface PlanetPosition {
  name: string;
  longitude: number;
  sign?: string;
  degree?: number;
  retrograde?: boolean;
}

interface Aspect {
  planet1: string;
  planet2: string;
  type: string;
  orb: number;
}

interface NatalWheelProps {
  planets: PlanetPosition[];
  aspects: Aspect[];
  houseCusps?: number[];
  ascendantDegree?: number;
  midheavenDegree?: number;
  size?: number;
}

const SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];

const ZODIAC_GLYPHS: Record<string, string> = {
  Aries: '♈', Taurus: '♉', Gemini: '♊', Cancer: '♋',
  Leo: '♌', Virgo: '♍', Libra: '♎', Scorpio: '♏',
  Sagittarius: '♐', Capricorn: '♑', Aquarius: '♒', Pisces: '♓',
};

const PLANET_GLYPHS: Record<string, string> = {
  Sun: '☉', Moon: '☽', Mercury: '☿', Venus: '♀', Mars: '♂',
  Jupiter: '♃', Saturn: '♄', Uranus: '♅', Neptune: '♆', Pluto: '♇',
  'North Node': '☊', 'South Node': '☋', Chiron: '⚷',
  Juno: '⚵', Vesta: '⚶', Eros: '❣', Psyche: 'Ψ',
  Lilith: '⚸', Ceres: '⚳', Pallas: '⚴',
  'Part of Fortune': '⊗', 'Part of Spirit': '⊙', Vertex: '⋄',
};

const SIGN_ELEMENTS: Record<string, string> = {
  Aries: 'Fire', Taurus: 'Earth', Gemini: 'Air', Cancer: 'Water',
  Leo: 'Fire', Virgo: 'Earth', Libra: 'Air', Scorpio: 'Water',
  Sagittarius: 'Fire', Capricorn: 'Earth', Aquarius: 'Air', Pisces: 'Water',
};

const SIGN_RULERS: Record<string, string> = {
  Aries: 'Mars', Taurus: 'Venus', Gemini: 'Mercury', Cancer: 'Moon',
  Leo: 'Sun', Virgo: 'Vesta', Libra: 'Juno', Scorpio: 'Pluto',
  Sagittarius: 'Jupiter', Capricorn: 'Saturn', Aquarius: 'Uranus', Pisces: 'Neptune',
};

const ASPECT_COLORS: Record<string, string> = {
  conjunction: '#FF4444', sextile: '#44BB44', square: '#FF8800',
  trine: '#4488FF', opposition: '#FFBB00', quincunx: '#FF44FF',
};

const ASPECT_DASH: Record<string, string> = {
  conjunction: '', sextile: '4,3', square: '', trine: '', opposition: '6,3', quincunx: '2,3',
};

const CHART_BODIES = [
  'Mars', 'Venus', 'Mercury', 'Moon', 'Sun', 'Vesta', 'Juno',
  'Pluto', 'Jupiter', 'Saturn', 'Uranus', 'Neptune',
  'North Node', 'South Node', 'Chiron',
  'Eros', 'Psyche', 'Lilith',
  'Part of Fortune', 'Part of Spirit', 'Vertex',
  'Ceres', 'Pallas',
];

const ANGLE_NAMES = ['Ascendant', 'Descendant', 'MC', 'IC', 'Anti-Vertex'];

const PLANET_COLORS: Record<string, string> = {
  Sun: '#FFD700', Moon: '#C0C0C0', Mercury: '#00CED1', Venus: '#FF69B4', Mars: '#FF4500',
  Jupiter: '#8A2BE2', Saturn: '#808080', Uranus: '#00BFFF', Neptune: '#4169E1', Pluto: '#8B0000',
  'North Node': '#9370DB', 'South Node': '#9370DB', Chiron: '#2E8B57',
  Juno: '#DA70D6', Vesta: '#FF8C00', Eros: '#FF1493', Psyche: '#BA55D3',
  Lilith: '#696969', 'Part of Fortune': '#FFD700', 'Part of Spirit': '#E6E6FA',
  Vertex: '#778899',
};

const EDGE_COLORS: Record<string, string> = {
  Fire: '#E07070', Water: '#6AABDB', Air: '#E8D07A', Earth: '#6BBF8A',
};

function formatDegreeMins(deg: number): string {
  const d = Math.abs(deg);
  const degrees = Math.floor(d);
  const minutes = Math.round((d - degrees) * 60);
  if (minutes >= 60) return `${degrees + 1}°00'`;
  return `${degrees}°${String(minutes).padStart(2, '0')}'`;
}

export function NatalWheel({
  planets,
  aspects,
  houseCusps,
  ascendantDegree = 0,
  midheavenDegree,
  size = 460,
}: NatalWheelProps) {
  const cx = size / 2;
  const cy = size / 2;
  const outerR = size / 2 - 6;
  const zodiacOuterR = outerR;
  const zodiacInnerR = outerR - 28;
  const rulerR = zodiacInnerR - 12;
  const planetOuterR = zodiacInnerR - 18;
  const planetR = zodiacInnerR - 32;
  const degreeR = zodiacInnerR - 44;
  const innerR = zodiacInnerR - 52;
  const aspectR = innerR - 6;

  const rotationAnchor = houseCusps && houseCusps.length === 12 ? houseCusps[0] : ascendantDegree;
  const toAngle = (lon: number) => 180 - (lon - rotationAnchor);
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const pointOnCircle = (angle: number, radius: number) => {
    const x = cx + radius * Math.cos(toRad(angle));
    const y = cy + radius * Math.sin(toRad(angle));
    return {
      x: Number.isFinite(x) ? x : cx,
      y: Number.isFinite(y) ? y : cy,
    };
  };

  const displayPlanets = planets.filter(p =>
    CHART_BODIES.includes(p.name) && !ANGLE_NAMES.includes(p.name)
  );

  const renderZodiacRing = () => {
    const sectors: React.ReactElement[] = [];
    for (let i = 0; i < 12; i++) {
      const signName = SIGNS[i];
      const startLon = i * 30;
      const midLon = startLon + 15;
      const endLon = startLon + 30;

      const startAngle = toAngle(startLon);
      const endAngle = toAngle(endLon);
      const midAngle = toAngle(midLon);

      const element = SIGN_ELEMENTS[signName];
      const edgeColor = EDGE_COLORS[element] || '#666';

      const steps = 20;
      let pathPoints = '';
      for (let s = 0; s <= steps; s++) {
        const frac = s / steps;
        const angle = startAngle + (endAngle - startAngle) * frac;
        const pt = pointOnCircle(angle, zodiacOuterR);
        pathPoints += (s === 0 ? 'M' : 'L') + ` ${pt.x} ${pt.y} `;
      }
      for (let s = steps; s >= 0; s--) {
        const frac = s / steps;
        const angle = startAngle + (endAngle - startAngle) * frac;
        const pt = pointOnCircle(angle, zodiacInnerR);
        pathPoints += `L ${pt.x} ${pt.y} `;
      }
      pathPoints += 'Z';

      sectors.push(<path key={`band-${i}`} d={pathPoints} fill={edgeColor} opacity={1} />);

      const outerPt = pointOnCircle(startAngle, zodiacOuterR);
      const innerPt = pointOnCircle(startAngle, zodiacInnerR);
      sectors.push(
        <line key={`div-${i}`} x1={outerPt.x} y1={outerPt.y} x2={innerPt.x} y2={innerPt.y}
          stroke="#3D3D5C" strokeWidth={0.8} />
      );

      const glyphR = (zodiacOuterR + zodiacInnerR) / 2 + 2;
      const glyphPt = pointOnCircle(midAngle, glyphR);
      const glyphTextColor = element === 'Air' ? '#1A1A2E' : '#FFFFFF';
      sectors.push(
        <text key={`sign-${i}`} x={glyphPt.x} y={glyphPt.y}
          fill={glyphTextColor} fontSize={16} fontWeight="900"
          textAnchor="middle" dominantBaseline="central">
          {ZODIAC_GLYPHS[signName]}
        </text>
      );

      const ruler = SIGN_RULERS[signName];
      const rulerGlyph = PLANET_GLYPHS[ruler] || '';
      const rulerPt = pointOnCircle(midAngle, rulerR);
      if (rulerGlyph) {
        sectors.push(
          <text key={`ruler-${i}`} x={rulerPt.x} y={rulerPt.y}
            fill={glyphTextColor} fontSize={7} opacity={0.6}
            textAnchor="middle" dominantBaseline="central">
            {rulerGlyph}
          </text>
        );
      }

      for (const tick of [10, 20]) {
        const tickAngle = toAngle(startLon + tick);
        const tOuter = pointOnCircle(tickAngle, zodiacInnerR);
        const tInner = pointOnCircle(tickAngle, zodiacInnerR - 3);
        sectors.push(
          <line key={`tick-${i}-${tick}`} x1={tOuter.x} y1={tOuter.y} x2={tInner.x} y2={tInner.y}
            stroke="#2D2D4A" strokeWidth={0.3} />
        );
      }

      for (const tick of [5, 15, 25]) {
        const tickAngle = toAngle(startLon + tick);
        const tOuter = pointOnCircle(tickAngle, zodiacInnerR);
        const tInner = pointOnCircle(tickAngle, zodiacInnerR - 2);
        sectors.push(
          <line key={`stk-${i}-${tick}`} x1={tOuter.x} y1={tOuter.y} x2={tInner.x} y2={tInner.y}
            stroke="#2D2D4A" strokeWidth={0.2} />
        );
      }
    }
    return sectors;
  };

  const renderHouseCusps = () => {
    const cuspElements: React.ReactElement[] = [];
    const getCuspLon = (i: number) =>
      houseCusps && houseCusps.length === 12 ? houseCusps[i] : ascendantDegree + i * 30;

    const actualAsc = ascendantDegree;
    const actualDsc = (ascendantDegree + 180) % 360;
    const mcPlanet = planets.find(p => p.name === 'MC');
    const actualMc = midheavenDegree ?? (mcPlanet ? mcPlanet.longitude : getCuspLon(9));
    const actualIc = (actualMc + 180) % 360;

    const ascAngle = toAngle(actualAsc);
    const dscAngle = toAngle(actualDsc);
    const mcAngle = toAngle(actualMc);
    const icAngle = toAngle(actualIc);

    const ascOuter = pointOnCircle(ascAngle, zodiacInnerR);
    const dscOuter = pointOnCircle(dscAngle, zodiacInnerR);
    cuspElements.push(
      <line key="axis-asc-dsc" x1={ascOuter.x} y1={ascOuter.y} x2={dscOuter.x} y2={dscOuter.y}
        stroke="#7C3AED" strokeWidth={2} opacity={0.8} />
    );

    const mcOuter = pointOnCircle(mcAngle, zodiacInnerR);
    const icOuter = pointOnCircle(icAngle, zodiacInnerR);
    cuspElements.push(
      <line key="axis-mc-ic" x1={mcOuter.x} y1={mcOuter.y} x2={icOuter.x} y2={icOuter.y}
        stroke="#7C3AED" strokeWidth={2} opacity={0.8} />
    );

    const axisLabels = [
      { label: 'ASC', angle: ascAngle, color: '#F59E0B', fontSize: 10 },
      { label: 'DSC', angle: dscAngle, color: '#8B8BA0', fontSize: 8 },
      { label: 'MC', angle: mcAngle, color: '#A78BFA', fontSize: 9 },
      { label: 'IC', angle: icAngle, color: '#8B8BA0', fontSize: 8 },
    ];
    for (const { label, angle, color, fontSize } of axisLabels) {
      const labelPt = pointOnCircle(angle, zodiacOuterR + 14);
      cuspElements.push(
        <text key={`axis-label-${label}`} x={labelPt.x} y={labelPt.y}
          fill={color} fontSize={fontSize} fontWeight="900"
          textAnchor="middle" dominantBaseline="central">
          {label}
        </text>
      );
    }

    // ASC arrow
    const ascArrowR = zodiacOuterR + 4;
    const ascPt = pointOnCircle(ascAngle, ascArrowR);
    const ascInnerPt = pointOnCircle(ascAngle, zodiacOuterR - 2);
    const arrowSize = 6;
    const arrowAngleRad = (ascAngle * Math.PI) / 180;
    const arrowSpread = 0.4;
    const arrow1x = ascInnerPt.x + arrowSize * Math.cos(arrowAngleRad + Math.PI + arrowSpread);
    const arrow1y = ascInnerPt.y + arrowSize * Math.sin(arrowAngleRad + Math.PI + arrowSpread);
    const arrow2x = ascInnerPt.x + arrowSize * Math.cos(arrowAngleRad + Math.PI - arrowSpread);
    const arrow2y = ascInnerPt.y + arrowSize * Math.sin(arrowAngleRad + Math.PI - arrowSpread);
    cuspElements.push(
      <g key="asc-arrow-marker">
        <line x1={ascPt.x} y1={ascPt.y} x2={ascInnerPt.x} y2={ascInnerPt.y} stroke="#F59E0B" strokeWidth={2.5} />
        <line x1={ascInnerPt.x} y1={ascInnerPt.y} x2={arrow1x} y2={arrow1y} stroke="#F59E0B" strokeWidth={2.5} />
        <line x1={ascInnerPt.x} y1={ascInnerPt.y} x2={arrow2x} y2={arrow2y} stroke="#F59E0B" strokeWidth={2.5} />
        <circle cx={ascPt.x} cy={ascPt.y} r={3} fill="#F59E0B" />
      </g>
    );

    // MC arrow
    const mcArrowPt = pointOnCircle(mcAngle, zodiacOuterR + 4);
    const mcInnerPt = pointOnCircle(mcAngle, zodiacOuterR - 2);
    const mcAngleRad = (mcAngle * Math.PI) / 180;
    const mc1x = mcInnerPt.x + arrowSize * Math.cos(mcAngleRad + Math.PI + arrowSpread);
    const mc1y = mcInnerPt.y + arrowSize * Math.sin(mcAngleRad + Math.PI + arrowSpread);
    const mc2x = mcInnerPt.x + arrowSize * Math.cos(mcAngleRad + Math.PI - arrowSpread);
    const mc2y = mcInnerPt.y + arrowSize * Math.sin(mcAngleRad + Math.PI - arrowSpread);
    cuspElements.push(
      <g key="mc-arrow-marker">
        <line x1={mcArrowPt.x} y1={mcArrowPt.y} x2={mcInnerPt.x} y2={mcInnerPt.y} stroke="#A78BFA" strokeWidth={1.8} />
        <line x1={mcInnerPt.x} y1={mcInnerPt.y} x2={mc1x} y2={mc1y} stroke="#A78BFA" strokeWidth={1.8} />
        <line x1={mcInnerPt.x} y1={mcInnerPt.y} x2={mc2x} y2={mc2y} stroke="#A78BFA" strokeWidth={1.8} />
        <circle cx={mcArrowPt.x} cy={mcArrowPt.y} r={2} fill="#A78BFA" />
      </g>
    );

    for (let i = 0; i < 12; i++) {
      const houseLon = getCuspLon(i);
      const nextHouseLon = getCuspLon((i + 1) % 12);
      const angle = toAngle(houseLon);
      const isAngular = i === 0 || i === 3 || i === 6 || i === 9;

      if (!isAngular) {
        const outerPt = pointOnCircle(angle, zodiacInnerR);
        const innerPt = pointOnCircle(angle, innerR);
        cuspElements.push(
          <line key={`house-${i}`} x1={outerPt.x} y1={outerPt.y} x2={innerPt.x} y2={innerPt.y}
            stroke="#3D3D5C" strokeWidth={0.5} />
        );
      }

      const midLon = houseLon + (((nextHouseLon - houseLon + 360) % 360) / 2);
      const numPt = pointOnCircle(toAngle(midLon), innerR + 10);
      cuspElements.push(
        <text key={`hnum-${i}`} x={numPt.x} y={numPt.y}
          fill="#8B8BA0" fontSize={7} fontWeight="500"
          textAnchor="middle" dominantBaseline="central">
          {i + 1}
        </text>
      );
    }
    return cuspElements;
  };

  const spreadPlanets = (planetList: PlanetPosition[]) => {
    const sorted = [...planetList].sort((a, b) => a.longitude - b.longitude);
    const minSep = 8;
    const positions = sorted.map(planet => ({
      planet,
      trueAngle: toAngle(planet.longitude),
      displayAngle: toAngle(planet.longitude),
    }));
    for (let pass = 0; pass < 5; pass++) {
      for (let i = 1; i < positions.length; i++) {
        const prev = positions[i - 1];
        const curr = positions[i];
        let diff = curr.displayAngle - prev.displayAngle;
        while (diff > 180) diff -= 360;
        while (diff < -180) diff += 360;
        if (Math.abs(diff) < minSep) {
          const shift = (minSep - Math.abs(diff)) / 2;
          prev.displayAngle -= shift;
          curr.displayAngle += shift;
        }
      }
    }
    return positions;
  };

  const renderPlanets = () => {
    const spread = spreadPlanets(displayPlanets);
    return spread.map(({ planet, trueAngle, displayAngle }) => {
      const tickOuter = pointOnCircle(trueAngle, zodiacInnerR);
      const tickInner = pointOnCircle(trueAngle, zodiacInnerR - 5);
      const glyphPt = pointOnCircle(displayAngle, planetR);
      const lineStart = pointOnCircle(displayAngle, planetOuterR);
      const glyph = PLANET_GLYPHS[planet.name] || planet.name.charAt(0);
      const planetColor = PLANET_COLORS[planet.name] || '#E0E0FF';
      const deg = planet.degree ?? (planet.longitude % 30);
      const degPt = pointOnCircle(displayAngle, degreeR);

      return (
        <g key={`planet-${planet.name}`}>
          <line x1={tickOuter.x} y1={tickOuter.y} x2={tickInner.x} y2={tickInner.y}
            stroke={planetColor} strokeWidth={1.2} />
          <line x1={lineStart.x} y1={lineStart.y} x2={glyphPt.x} y2={glyphPt.y}
            stroke={planetColor} strokeWidth={0.3} opacity={0.4} />
          <text x={glyphPt.x} y={glyphPt.y}
            fill={planetColor} fontSize={12} fontWeight="700"
            textAnchor="middle" dominantBaseline="central">
            {glyph}
          </text>
          {planet.retrograde && (
            <text x={glyphPt.x + 8} y={glyphPt.y - 5}
              fill="#FF4444" fontSize={7} fontWeight="800"
              textAnchor="middle" dominantBaseline="central">
              R
            </text>
          )}
          <text x={degPt.x} y={degPt.y}
            fill="#8B8BA0" fontSize={6}
            textAnchor="middle" dominantBaseline="central">
            {formatDegreeMins(deg)}
          </text>
        </g>
      );
    });
  };

  const renderAspects = () => {
    return aspects.map((aspect, i) => {
      const p1 = displayPlanets.find(p => p.name === aspect.planet1);
      const p2 = displayPlanets.find(p => p.name === aspect.planet2);
      if (!p1 || !p2) return null;

      const pt1 = pointOnCircle(toAngle(p1.longitude), aspectR);
      const pt2 = pointOnCircle(toAngle(p2.longitude), aspectR);
      const aspectType = aspect.type.toLowerCase();
      const color = ASPECT_COLORS[aspectType] || '#8B8BA0';
      const dash = ASPECT_DASH[aspectType] || '';
      const opacity = Math.max(0.2, 0.7 - aspect.orb * 0.08);

      return (
        <line key={`asp-${i}`}
          x1={pt1.x} y1={pt1.y} x2={pt2.x} y2={pt2.y}
          stroke={color} strokeWidth={aspectType === 'conjunction' ? 1.2 : 0.8}
          strokeDasharray={dash || undefined} opacity={opacity} />
      );
    });
  };

  return (
    <div className="flex items-center justify-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="max-w-full h-auto">
        <circle cx={cx} cy={cy} r={zodiacOuterR} fill="none" stroke="#3D3D5C" strokeWidth={1} />
        <circle cx={cx} cy={cy} r={zodiacInnerR} fill="none" stroke="#3D3D5C" strokeWidth={0.8} />
        <circle cx={cx} cy={cy} r={innerR} fill="none" stroke="#2D2D4A" strokeWidth={0.4} />
        <circle cx={cx} cy={cy} r={2} fill="#7C3AED" opacity={0.5} />
        {renderAspects()}
        {renderHouseCusps()}
        {renderZodiacRing()}
        {renderPlanets()}
      </svg>
    </div>
  );
}
