// ═══════════════════════════════════════════════════════════════════
// Advanced Synastry Compatibility Engine
// Ported 1:1 from app.py _CE_* constants + _ce_compute_synastry_compatibility
// ═══════════════════════════════════════════════════════════════════

// ── Aspect definitions (same as desktop ASPECTS dict) ──
const ASPECTS: Record<string, { angle: number; orb: number }> = {
  Conjunction:    { angle: 0,   orb: 8 },
  Sextile:        { angle: 60,  orb: 6 },
  Square:         { angle: 90,  orb: 8 },
  Trine:          { angle: 120, orb: 8 },
  Quincunx:       { angle: 150, orb: 6 },
  Opposition:     { angle: 180, orb: 8 },
  'Semi-Sextile':    { angle: 30,  orb: 3 },
  'Semi-Square':     { angle: 45,  orb: 3 },
  Sesquiquadrate: { angle: 135, orb: 3 },
};

function calculateAspect(lon1: number, lon2: number): [string, number] | null {
  let diff = Math.abs(lon1 - lon2);
  diff = Math.min(diff, 360 - diff);
  for (const [aspectName, aspectData] of Object.entries(ASPECTS)) {
    const { angle, orb } = aspectData;
    if (Math.abs(diff - angle) <= orb) {
      return [aspectName, angle - diff];
    }
  }
  return null;
}

// ── 7 Categories ──
const CE_CATEGORIES = ['Attraction', 'Emotional', 'Mental', 'Stability', 'Karmic', 'Harmony', 'Magnetic'] as const;
type Category = typeof CE_CATEGORIES[number];

// ── Aspect Type Weight ──
const CE_ASPECT_TYPE_WEIGHT: Record<string, number> = {
  Conjunction:     1.00,
  Trine:           0.92,
  Sextile:         0.78,
  Opposition:      0.82,
  Square:          0.76,
  Quincunx:        0.58,
  'Semi-Sextile':  0.42,
  'Semi-Square':   0.40,
  Sesquiquadrate:  0.40,
};

// ── Max orbs by planet class ──
const CE_MAX_ORBS: Record<string, number> = {
  luminary:  10,
  personal:   8,
  outer:      6,
  angle:      5,
  node:       5,
  asteroid:   3,
};

// ── Planet classifications ──
const CE_PLANET_CLASS: Record<string, string> = {
  Sun: 'luminary', Moon: 'luminary',
  Mercury: 'personal', Venus: 'personal', Mars: 'personal',
  Jupiter: 'outer', Saturn: 'outer', Uranus: 'outer',
  Neptune: 'outer', Pluto: 'outer',
  Ascendant: 'angle', Descendant: 'angle', MC: 'angle', IC: 'angle',
  'North Node': 'node', 'South Node': 'node',
  Chiron: 'asteroid', Juno: 'asteroid', Vesta: 'asteroid',
  Eros: 'asteroid', Lilith: 'asteroid',
};

// ── Helper: make an order-independent pair key ──
function pairKey(a: string, b: string): string {
  return [a, b].sort().join('|');
}

// ── Planet Pair Importance ──
const CE_PAIR_IMPORTANCE: Record<string, number> = {};
function _pi(a: string, b: string, v: number) { CE_PAIR_IMPORTANCE[pairKey(a, b)] = v; }
_pi('Sun', 'Moon', 1.50);
_pi('Venus', 'Mars', 1.45);
_pi('Moon', 'Moon', 1.40);
_pi('Venus', 'Saturn', 1.35);
_pi('North Node', 'Sun', 1.34);
_pi('North Node', 'Moon', 1.34);
_pi('Sun', 'Venus', 1.30);
_pi('Moon', 'Venus', 1.30);
_pi('Sun', 'Saturn', 1.28);
_pi('Moon', 'Saturn', 1.28);
_pi('Pluto', 'Venus', 1.25);
_pi('Pluto', 'Mars', 1.25);
_pi('Moon', 'Pluto', 1.22);
_pi('Sun', 'Pluto', 1.20);
_pi('Venus', 'Neptune', 1.18);
_pi('Mars', 'Pluto', 1.18);
_pi('Sun', 'Ascendant', 1.35);
_pi('Venus', 'Ascendant', 1.35);
_pi('Mars', 'Ascendant', 1.32);
_pi('Moon', 'Ascendant', 1.30);
_pi('Pluto', 'Ascendant', 1.22);
_pi('Saturn', 'Ascendant', 1.18);
_pi('Jupiter', 'Ascendant', 1.12);
_pi('Jupiter', 'Venus', 1.12);
_pi('Jupiter', 'Sun', 1.10);
_pi('Mercury', 'Mercury', 1.10);
_pi('North Node', 'Venus', 1.10);
_pi('North Node', 'Mars', 1.08);
_pi('Chiron', 'Venus', 1.08);
_pi('Chiron', 'Sun', 1.06);
_pi('Chiron', 'Moon', 1.06);
_pi('Sun', 'Mercury', 1.05);
_pi('Moon', 'Mercury', 1.02);
_pi('Sun', 'Mars', 1.05);
_pi('Moon', 'Mars', 1.05);
_pi('Sun', 'Jupiter', 1.05);
_pi('Venus', 'Jupiter', 1.05);
_pi('Venus', 'Pluto', 1.25);
_pi('Mercury', 'Uranus', 0.95);
_pi('Mercury', 'Neptune', 0.92);
_pi('Sun', 'Uranus', 0.90);
_pi('Moon', 'Uranus', 0.90);
_pi('Venus', 'Uranus', 0.92);
_pi('North Node', 'Ascendant', 1.12);
_pi('North Node', 'MC', 1.05);
_pi('Sun', 'Descendant', 1.12);
_pi('Venus', 'Descendant', 1.12);
_pi('Moon', 'IC', 1.10);
// Juno — partnership asteroid, critical for long-term commitment
_pi('Juno', 'Sun', 1.30);
_pi('Juno', 'Moon', 1.28);
_pi('Juno', 'Venus', 1.35);
_pi('Juno', 'Mars', 1.22);
_pi('Juno', 'Saturn', 1.25);
_pi('Juno', 'Ascendant', 1.20);
_pi('Juno', 'North Node', 1.18);
_pi('Juno', 'Pluto', 1.15);
_pi('Juno', 'Jupiter', 1.12);
_pi('Juno', 'Juno', 1.30);
// Vesta — devotion asteroid, sacred focus and dedication
_pi('Vesta', 'Sun', 1.18);
_pi('Vesta', 'Moon', 1.20);
_pi('Vesta', 'Venus', 1.22);
_pi('Vesta', 'Mars', 1.18);
_pi('Vesta', 'Saturn', 1.15);
_pi('Vesta', 'Ascendant', 1.10);
_pi('Vesta', 'Pluto', 1.12);
_pi('Vesta', 'Juno', 1.20);
_pi('Vesta', 'Vesta', 1.15);
_pi('Vesta', 'North Node', 1.10);

const CE_DEFAULT_PAIR_IMPORTANCE = 0.85;

// ── Category Modifiers ──
// Key: "pairKey|aspectName" -> category weights
type CatMods = Record<string, number>;
const CE_CATEGORY_MODIFIERS: Record<string, CatMods> = {};
function _cm(a: string, b: string, asp: string, m: CatMods) {
  CE_CATEGORY_MODIFIERS[pairKey(a, b) + '|' + asp] = m;
}

// Venus-Mars
_cm('Venus','Mars','Conjunction',  {Attraction:1.00,Emotional:0.40,Mental:0.00,Stability:0.20,Karmic:0.25,Harmony:0.40,Magnetic:1.00});
_cm('Venus','Mars','Trine',        {Attraction:1.00,Emotional:0.35,Mental:0.00,Stability:0.30,Karmic:0.10,Harmony:0.55,Magnetic:0.85});
_cm('Venus','Mars','Sextile',      {Attraction:0.85,Emotional:0.30,Mental:0.05,Stability:0.30,Karmic:0.05,Harmony:0.50,Magnetic:0.70});
_cm('Venus','Mars','Opposition',   {Attraction:0.95,Emotional:0.10,Mental:0.00,Stability:-0.15,Karmic:0.30,Harmony:0.00,Magnetic:0.95});
_cm('Venus','Mars','Square',       {Attraction:0.85,Emotional:-0.20,Mental:0.00,Stability:-0.35,Karmic:0.25,Harmony:-0.15,Magnetic:0.95});
// Sun-Moon
_cm('Sun','Moon','Conjunction',    {Attraction:0.65,Emotional:1.00,Mental:0.40,Stability:0.80,Karmic:0.30,Harmony:0.90,Magnetic:0.50});
_cm('Sun','Moon','Trine',          {Attraction:0.55,Emotional:1.00,Mental:0.35,Stability:0.75,Karmic:0.10,Harmony:1.00,Magnetic:0.30});
_cm('Sun','Moon','Sextile',        {Attraction:0.45,Emotional:0.85,Mental:0.30,Stability:0.65,Karmic:0.05,Harmony:0.85,Magnetic:0.25});
_cm('Sun','Moon','Opposition',     {Attraction:0.50,Emotional:0.55,Mental:0.20,Stability:0.30,Karmic:0.40,Harmony:0.25,Magnetic:0.55});
_cm('Sun','Moon','Square',         {Attraction:0.40,Emotional:0.15,Mental:0.10,Stability:0.00,Karmic:0.45,Harmony:-0.30,Magnetic:0.45});
// Moon-Moon
_cm('Moon','Moon','Conjunction',   {Attraction:0.20,Emotional:1.00,Mental:0.25,Stability:0.70,Karmic:0.15,Harmony:0.95,Magnetic:0.20});
_cm('Moon','Moon','Trine',         {Attraction:0.15,Emotional:0.95,Mental:0.20,Stability:0.65,Karmic:0.05,Harmony:0.90,Magnetic:0.15});
_cm('Moon','Moon','Sextile',       {Attraction:0.10,Emotional:0.80,Mental:0.20,Stability:0.55,Karmic:0.05,Harmony:0.80,Magnetic:0.10});
_cm('Moon','Moon','Opposition',    {Attraction:0.15,Emotional:0.40,Mental:0.10,Stability:0.20,Karmic:0.30,Harmony:0.10,Magnetic:0.30});
_cm('Moon','Moon','Square',        {Attraction:0.10,Emotional:-0.30,Mental:0.00,Stability:-0.20,Karmic:0.35,Harmony:-0.40,Magnetic:0.25});
// Moon-Venus
_cm('Moon','Venus','Conjunction',  {Attraction:0.45,Emotional:0.95,Mental:0.10,Stability:0.55,Karmic:0.10,Harmony:0.85,Magnetic:0.40});
_cm('Moon','Venus','Trine',        {Attraction:0.40,Emotional:0.90,Mental:0.10,Stability:0.50,Karmic:0.05,Harmony:0.85,Magnetic:0.30});
_cm('Moon','Venus','Sextile',      {Attraction:0.35,Emotional:0.80,Mental:0.10,Stability:0.45,Karmic:0.05,Harmony:0.75,Magnetic:0.25});
_cm('Moon','Venus','Opposition',   {Attraction:0.35,Emotional:0.35,Mental:0.05,Stability:0.10,Karmic:0.25,Harmony:0.05,Magnetic:0.40});
_cm('Moon','Venus','Square',       {Attraction:0.30,Emotional:-0.15,Mental:0.00,Stability:-0.20,Karmic:0.20,Harmony:-0.25,Magnetic:0.35});
// Venus-Saturn
_cm('Venus','Saturn','Conjunction', {Attraction:0.20,Emotional:0.25,Mental:0.05,Stability:0.75,Karmic:0.70,Harmony:0.20,Magnetic:0.55});
_cm('Venus','Saturn','Trine',       {Attraction:0.15,Emotional:0.35,Mental:0.05,Stability:0.85,Karmic:0.40,Harmony:0.50,Magnetic:0.35});
_cm('Venus','Saturn','Sextile',     {Attraction:0.10,Emotional:0.30,Mental:0.05,Stability:0.75,Karmic:0.30,Harmony:0.45,Magnetic:0.25});
_cm('Venus','Saturn','Opposition',  {Attraction:0.10,Emotional:-0.20,Mental:0.00,Stability:0.30,Karmic:0.65,Harmony:-0.30,Magnetic:0.50});
_cm('Venus','Saturn','Square',      {Attraction:0.05,Emotional:-0.40,Mental:0.00,Stability:0.10,Karmic:0.70,Harmony:-0.50,Magnetic:0.45});
// Pluto-Venus
_cm('Pluto','Venus','Conjunction',  {Attraction:0.85,Emotional:0.20,Mental:0.00,Stability:-0.10,Karmic:1.00,Harmony:-0.10,Magnetic:1.00});
_cm('Pluto','Venus','Trine',        {Attraction:0.75,Emotional:0.30,Mental:0.00,Stability:0.10,Karmic:0.65,Harmony:0.20,Magnetic:0.80});
_cm('Pluto','Venus','Sextile',      {Attraction:0.65,Emotional:0.25,Mental:0.00,Stability:0.15,Karmic:0.50,Harmony:0.25,Magnetic:0.65});
_cm('Pluto','Venus','Opposition',   {Attraction:0.80,Emotional:-0.10,Mental:0.00,Stability:-0.30,Karmic:0.90,Harmony:-0.30,Magnetic:0.95});
_cm('Pluto','Venus','Square',       {Attraction:0.75,Emotional:-0.25,Mental:0.00,Stability:-0.40,Karmic:0.85,Harmony:-0.40,Magnetic:0.90});
// Pluto-Mars
_cm('Pluto','Mars','Conjunction',   {Attraction:0.80,Emotional:0.05,Mental:0.00,Stability:-0.20,Karmic:0.90,Harmony:-0.20,Magnetic:0.95});
_cm('Pluto','Mars','Trine',         {Attraction:0.70,Emotional:0.15,Mental:0.00,Stability:0.05,Karmic:0.55,Harmony:0.10,Magnetic:0.75});
_cm('Pluto','Mars','Sextile',       {Attraction:0.60,Emotional:0.10,Mental:0.00,Stability:0.10,Karmic:0.40,Harmony:0.15,Magnetic:0.60});
_cm('Pluto','Mars','Opposition',    {Attraction:0.75,Emotional:-0.15,Mental:0.00,Stability:-0.35,Karmic:0.85,Harmony:-0.35,Magnetic:0.90});
_cm('Pluto','Mars','Square',        {Attraction:0.70,Emotional:-0.25,Mental:0.00,Stability:-0.45,Karmic:0.80,Harmony:-0.45,Magnetic:0.85});
// Moon-Saturn
_cm('Moon','Saturn','Conjunction',  {Attraction:0.05,Emotional:-0.30,Mental:-0.10,Stability:0.60,Karmic:0.65,Harmony:-0.25,Magnetic:0.30});
_cm('Moon','Saturn','Trine',        {Attraction:0.05,Emotional:0.25,Mental:0.05,Stability:0.80,Karmic:0.35,Harmony:0.40,Magnetic:0.15});
_cm('Moon','Saturn','Sextile',      {Attraction:0.05,Emotional:0.20,Mental:0.05,Stability:0.70,Karmic:0.25,Harmony:0.35,Magnetic:0.10});
_cm('Moon','Saturn','Opposition',   {Attraction:0.00,Emotional:-0.70,Mental:-0.15,Stability:0.20,Karmic:0.55,Harmony:-0.65,Magnetic:0.25});
_cm('Moon','Saturn','Square',       {Attraction:0.00,Emotional:-0.85,Mental:-0.20,Stability:0.10,Karmic:0.50,Harmony:-0.80,Magnetic:0.20});
// Sun-Saturn
_cm('Sun','Saturn','Conjunction',   {Attraction:0.10,Emotional:0.00,Mental:0.05,Stability:0.65,Karmic:0.55,Harmony:0.00,Magnetic:0.25});
_cm('Sun','Saturn','Trine',         {Attraction:0.10,Emotional:0.15,Mental:0.10,Stability:0.80,Karmic:0.30,Harmony:0.45,Magnetic:0.15});
_cm('Sun','Saturn','Sextile',       {Attraction:0.08,Emotional:0.10,Mental:0.10,Stability:0.70,Karmic:0.20,Harmony:0.40,Magnetic:0.10});
_cm('Sun','Saturn','Opposition',    {Attraction:0.05,Emotional:-0.30,Mental:0.00,Stability:0.25,Karmic:0.50,Harmony:-0.35,Magnetic:0.25});
_cm('Sun','Saturn','Square',        {Attraction:0.05,Emotional:-0.45,Mental:-0.05,Stability:0.10,Karmic:0.55,Harmony:-0.50,Magnetic:0.20});
// Mercury-Mercury
_cm('Mercury','Mercury','Conjunction', {Attraction:0.10,Emotional:0.20,Mental:1.00,Stability:0.35,Karmic:0.05,Harmony:0.65,Magnetic:0.05});
_cm('Mercury','Mercury','Trine',       {Attraction:0.05,Emotional:0.15,Mental:0.90,Stability:0.30,Karmic:0.05,Harmony:0.60,Magnetic:0.05});
_cm('Mercury','Mercury','Sextile',     {Attraction:0.05,Emotional:0.15,Mental:0.80,Stability:0.25,Karmic:0.05,Harmony:0.55,Magnetic:0.05});
_cm('Mercury','Mercury','Opposition',  {Attraction:0.05,Emotional:0.00,Mental:0.40,Stability:0.05,Karmic:0.15,Harmony:0.05,Magnetic:0.10});
_cm('Mercury','Mercury','Square',      {Attraction:0.05,Emotional:-0.10,Mental:-0.20,Stability:-0.10,Karmic:0.15,Harmony:-0.30,Magnetic:0.10});
// Sun-Mercury
_cm('Sun','Mercury','Conjunction',  {Attraction:0.10,Emotional:0.15,Mental:0.85,Stability:0.25,Karmic:0.05,Harmony:0.55,Magnetic:0.05});
_cm('Sun','Mercury','Trine',        {Attraction:0.08,Emotional:0.10,Mental:0.75,Stability:0.20,Karmic:0.05,Harmony:0.50,Magnetic:0.05});
_cm('Sun','Mercury','Sextile',      {Attraction:0.05,Emotional:0.10,Mental:0.65,Stability:0.18,Karmic:0.05,Harmony:0.45,Magnetic:0.05});
_cm('Sun','Mercury','Opposition',   {Attraction:0.05,Emotional:0.00,Mental:0.30,Stability:0.05,Karmic:0.10,Harmony:0.05,Magnetic:0.05});
_cm('Sun','Mercury','Square',       {Attraction:0.05,Emotional:-0.05,Mental:-0.10,Stability:-0.05,Karmic:0.10,Harmony:-0.20,Magnetic:0.05});
// Moon-Mercury
_cm('Moon','Mercury','Conjunction',  {Attraction:0.10,Emotional:0.55,Mental:0.80,Stability:0.25,Karmic:0.05,Harmony:0.55,Magnetic:0.10});
_cm('Moon','Mercury','Trine',        {Attraction:0.08,Emotional:0.50,Mental:0.70,Stability:0.20,Karmic:0.05,Harmony:0.50,Magnetic:0.08});
_cm('Moon','Mercury','Sextile',      {Attraction:0.05,Emotional:0.40,Mental:0.60,Stability:0.18,Karmic:0.05,Harmony:0.45,Magnetic:0.05});
_cm('Moon','Mercury','Opposition',   {Attraction:0.05,Emotional:0.10,Mental:0.25,Stability:0.05,Karmic:0.10,Harmony:0.00,Magnetic:0.10});
_cm('Moon','Mercury','Square',       {Attraction:0.05,Emotional:-0.15,Mental:-0.15,Stability:-0.10,Karmic:0.10,Harmony:-0.25,Magnetic:0.08});
// Mercury-Uranus
_cm('Mercury','Uranus','Conjunction', {Attraction:0.20,Emotional:0.00,Mental:0.75,Stability:-0.15,Karmic:0.15,Harmony:0.10,Magnetic:0.25});
_cm('Mercury','Uranus','Trine',       {Attraction:0.15,Emotional:0.05,Mental:0.70,Stability:0.00,Karmic:0.10,Harmony:0.25,Magnetic:0.15});
_cm('Mercury','Uranus','Sextile',     {Attraction:0.12,Emotional:0.05,Mental:0.60,Stability:0.05,Karmic:0.08,Harmony:0.20,Magnetic:0.12});
_cm('Mercury','Uranus','Opposition',  {Attraction:0.15,Emotional:-0.05,Mental:0.30,Stability:-0.25,Karmic:0.20,Harmony:-0.15,Magnetic:0.25});
_cm('Mercury','Uranus','Square',      {Attraction:0.12,Emotional:-0.10,Mental:-0.05,Stability:-0.30,Karmic:0.20,Harmony:-0.25,Magnetic:0.20});
// Mercury-Neptune
_cm('Mercury','Neptune','Conjunction', {Attraction:0.10,Emotional:0.20,Mental:0.40,Stability:-0.10,Karmic:0.25,Harmony:0.10,Magnetic:0.20});
_cm('Mercury','Neptune','Trine',       {Attraction:0.08,Emotional:0.25,Mental:0.50,Stability:0.00,Karmic:0.15,Harmony:0.25,Magnetic:0.15});
_cm('Mercury','Neptune','Sextile',     {Attraction:0.05,Emotional:0.20,Mental:0.45,Stability:0.05,Karmic:0.10,Harmony:0.20,Magnetic:0.10});
_cm('Mercury','Neptune','Opposition',  {Attraction:0.05,Emotional:0.00,Mental:-0.10,Stability:-0.20,Karmic:0.25,Harmony:-0.20,Magnetic:0.15});
_cm('Mercury','Neptune','Square',      {Attraction:0.05,Emotional:-0.10,Mental:-0.25,Stability:-0.25,Karmic:0.25,Harmony:-0.30,Magnetic:0.15});
// Sun-Venus
_cm('Sun','Venus','Conjunction',    {Attraction:0.75,Emotional:0.60,Mental:0.15,Stability:0.50,Karmic:0.10,Harmony:0.75,Magnetic:0.55});
_cm('Sun','Venus','Trine',          {Attraction:0.65,Emotional:0.55,Mental:0.10,Stability:0.45,Karmic:0.05,Harmony:0.70,Magnetic:0.40});
_cm('Sun','Venus','Sextile',        {Attraction:0.55,Emotional:0.45,Mental:0.10,Stability:0.40,Karmic:0.05,Harmony:0.60,Magnetic:0.35});
_cm('Sun','Venus','Opposition',     {Attraction:0.60,Emotional:0.25,Mental:0.05,Stability:0.10,Karmic:0.25,Harmony:0.10,Magnetic:0.55});
_cm('Sun','Venus','Square',         {Attraction:0.50,Emotional:0.05,Mental:0.00,Stability:-0.10,Karmic:0.20,Harmony:-0.15,Magnetic:0.45});
// Sun-Mars
_cm('Sun','Mars','Conjunction',     {Attraction:0.70,Emotional:0.10,Mental:0.10,Stability:0.15,Karmic:0.20,Harmony:0.15,Magnetic:0.70});
_cm('Sun','Mars','Trine',           {Attraction:0.60,Emotional:0.15,Mental:0.10,Stability:0.25,Karmic:0.10,Harmony:0.35,Magnetic:0.50});
_cm('Sun','Mars','Sextile',         {Attraction:0.50,Emotional:0.10,Mental:0.10,Stability:0.20,Karmic:0.05,Harmony:0.30,Magnetic:0.40});
_cm('Sun','Mars','Opposition',      {Attraction:0.65,Emotional:-0.10,Mental:0.05,Stability:-0.15,Karmic:0.30,Harmony:-0.15,Magnetic:0.65});
_cm('Sun','Mars','Square',          {Attraction:0.55,Emotional:-0.25,Mental:0.00,Stability:-0.30,Karmic:0.25,Harmony:-0.30,Magnetic:0.60});
// Moon-Mars
_cm('Moon','Mars','Conjunction',    {Attraction:0.60,Emotional:0.20,Mental:0.00,Stability:0.00,Karmic:0.25,Harmony:0.00,Magnetic:0.65});
_cm('Moon','Mars','Trine',          {Attraction:0.50,Emotional:0.35,Mental:0.00,Stability:0.15,Karmic:0.10,Harmony:0.25,Magnetic:0.45});
_cm('Moon','Mars','Sextile',        {Attraction:0.40,Emotional:0.30,Mental:0.00,Stability:0.15,Karmic:0.05,Harmony:0.20,Magnetic:0.35});
_cm('Moon','Mars','Opposition',     {Attraction:0.55,Emotional:-0.20,Mental:0.00,Stability:-0.25,Karmic:0.35,Harmony:-0.30,Magnetic:0.60});
_cm('Moon','Mars','Square',         {Attraction:0.50,Emotional:-0.40,Mental:0.00,Stability:-0.35,Karmic:0.30,Harmony:-0.45,Magnetic:0.55});
// Moon-Pluto
_cm('Moon','Pluto','Conjunction',   {Attraction:0.55,Emotional:0.30,Mental:0.00,Stability:-0.05,Karmic:0.85,Harmony:-0.10,Magnetic:0.90});
_cm('Moon','Pluto','Trine',         {Attraction:0.40,Emotional:0.45,Mental:0.00,Stability:0.10,Karmic:0.55,Harmony:0.20,Magnetic:0.65});
_cm('Moon','Pluto','Sextile',       {Attraction:0.35,Emotional:0.40,Mental:0.00,Stability:0.15,Karmic:0.40,Harmony:0.25,Magnetic:0.50});
_cm('Moon','Pluto','Opposition',    {Attraction:0.50,Emotional:-0.15,Mental:0.00,Stability:-0.25,Karmic:0.80,Harmony:-0.35,Magnetic:0.85});
_cm('Moon','Pluto','Square',        {Attraction:0.45,Emotional:-0.35,Mental:0.00,Stability:-0.35,Karmic:0.75,Harmony:-0.45,Magnetic:0.80});
// Sun-Pluto
_cm('Sun','Pluto','Conjunction',    {Attraction:0.60,Emotional:0.10,Mental:0.00,Stability:-0.05,Karmic:0.80,Harmony:-0.05,Magnetic:0.85});
_cm('Sun','Pluto','Trine',          {Attraction:0.50,Emotional:0.20,Mental:0.00,Stability:0.10,Karmic:0.50,Harmony:0.20,Magnetic:0.60});
_cm('Sun','Pluto','Sextile',        {Attraction:0.40,Emotional:0.15,Mental:0.00,Stability:0.15,Karmic:0.35,Harmony:0.25,Magnetic:0.45});
_cm('Sun','Pluto','Opposition',     {Attraction:0.55,Emotional:-0.10,Mental:0.00,Stability:-0.25,Karmic:0.75,Harmony:-0.25,Magnetic:0.80});
_cm('Sun','Pluto','Square',         {Attraction:0.50,Emotional:-0.25,Mental:0.00,Stability:-0.35,Karmic:0.70,Harmony:-0.35,Magnetic:0.75});
// Venus-Neptune
_cm('Venus','Neptune','Conjunction', {Attraction:0.55,Emotional:0.65,Mental:0.10,Stability:-0.10,Karmic:0.45,Harmony:0.35,Magnetic:0.60});
_cm('Venus','Neptune','Trine',       {Attraction:0.45,Emotional:0.60,Mental:0.10,Stability:0.05,Karmic:0.30,Harmony:0.45,Magnetic:0.45});
_cm('Venus','Neptune','Sextile',     {Attraction:0.40,Emotional:0.50,Mental:0.10,Stability:0.10,Karmic:0.20,Harmony:0.40,Magnetic:0.35});
_cm('Venus','Neptune','Opposition',  {Attraction:0.45,Emotional:0.15,Mental:0.00,Stability:-0.30,Karmic:0.45,Harmony:-0.20,Magnetic:0.55});
_cm('Venus','Neptune','Square',      {Attraction:0.40,Emotional:-0.10,Mental:0.00,Stability:-0.40,Karmic:0.40,Harmony:-0.35,Magnetic:0.50});
// Jupiter-Venus
_cm('Jupiter','Venus','Conjunction', {Attraction:0.50,Emotional:0.45,Mental:0.15,Stability:0.55,Karmic:0.10,Harmony:0.75,Magnetic:0.30});
_cm('Jupiter','Venus','Trine',       {Attraction:0.40,Emotional:0.40,Mental:0.10,Stability:0.50,Karmic:0.05,Harmony:0.70,Magnetic:0.20});
_cm('Jupiter','Venus','Sextile',     {Attraction:0.35,Emotional:0.35,Mental:0.10,Stability:0.45,Karmic:0.05,Harmony:0.60,Magnetic:0.15});
_cm('Jupiter','Venus','Opposition',  {Attraction:0.30,Emotional:0.15,Mental:0.05,Stability:0.15,Karmic:0.15,Harmony:0.15,Magnetic:0.20});
_cm('Jupiter','Venus','Square',      {Attraction:0.25,Emotional:0.00,Mental:0.00,Stability:-0.05,Karmic:0.10,Harmony:-0.05,Magnetic:0.15});
// Jupiter-Sun
_cm('Jupiter','Sun','Conjunction',   {Attraction:0.35,Emotional:0.30,Mental:0.20,Stability:0.55,Karmic:0.10,Harmony:0.65,Magnetic:0.20});
_cm('Jupiter','Sun','Trine',         {Attraction:0.25,Emotional:0.25,Mental:0.15,Stability:0.50,Karmic:0.05,Harmony:0.60,Magnetic:0.15});
_cm('Jupiter','Sun','Sextile',       {Attraction:0.20,Emotional:0.20,Mental:0.15,Stability:0.45,Karmic:0.05,Harmony:0.55,Magnetic:0.10});
_cm('Jupiter','Sun','Opposition',    {Attraction:0.20,Emotional:0.05,Mental:0.10,Stability:0.15,Karmic:0.15,Harmony:0.10,Magnetic:0.15});
_cm('Jupiter','Sun','Square',        {Attraction:0.15,Emotional:-0.05,Mental:0.05,Stability:-0.05,Karmic:0.10,Harmony:-0.05,Magnetic:0.10});
// North Node-Sun
_cm('North Node','Sun','Conjunction', {Attraction:0.35,Emotional:0.40,Mental:0.15,Stability:0.45,Karmic:1.00,Harmony:0.30,Magnetic:0.75});
_cm('North Node','Sun','Trine',       {Attraction:0.25,Emotional:0.30,Mental:0.10,Stability:0.35,Karmic:0.70,Harmony:0.30,Magnetic:0.50});
_cm('North Node','Sun','Sextile',     {Attraction:0.20,Emotional:0.25,Mental:0.10,Stability:0.30,Karmic:0.55,Harmony:0.25,Magnetic:0.40});
_cm('North Node','Sun','Opposition',  {Attraction:0.25,Emotional:0.15,Mental:0.10,Stability:0.15,Karmic:0.80,Harmony:0.05,Magnetic:0.60});
_cm('North Node','Sun','Square',      {Attraction:0.15,Emotional:0.00,Mental:0.05,Stability:-0.10,Karmic:0.65,Harmony:-0.15,Magnetic:0.45});
// North Node-Moon
_cm('North Node','Moon','Conjunction', {Attraction:0.25,Emotional:0.55,Mental:0.10,Stability:0.40,Karmic:1.00,Harmony:0.35,Magnetic:0.70});
_cm('North Node','Moon','Trine',       {Attraction:0.15,Emotional:0.45,Mental:0.10,Stability:0.35,Karmic:0.70,Harmony:0.30,Magnetic:0.50});
_cm('North Node','Moon','Sextile',     {Attraction:0.12,Emotional:0.35,Mental:0.08,Stability:0.28,Karmic:0.55,Harmony:0.25,Magnetic:0.40});
_cm('North Node','Moon','Opposition',  {Attraction:0.15,Emotional:0.20,Mental:0.05,Stability:0.10,Karmic:0.80,Harmony:0.05,Magnetic:0.55});
_cm('North Node','Moon','Square',      {Attraction:0.10,Emotional:0.00,Mental:0.00,Stability:-0.10,Karmic:0.65,Harmony:-0.15,Magnetic:0.40});
// North Node-Venus
_cm('North Node','Venus','Conjunction', {Attraction:0.55,Emotional:0.45,Mental:0.05,Stability:0.35,Karmic:0.90,Harmony:0.35,Magnetic:0.70});
_cm('North Node','Venus','Trine',       {Attraction:0.40,Emotional:0.35,Mental:0.05,Stability:0.30,Karmic:0.60,Harmony:0.30,Magnetic:0.45});
_cm('North Node','Venus','Opposition',  {Attraction:0.40,Emotional:0.15,Mental:0.00,Stability:0.10,Karmic:0.75,Harmony:0.05,Magnetic:0.55});
_cm('North Node','Venus','Square',      {Attraction:0.25,Emotional:0.00,Mental:0.00,Stability:-0.05,Karmic:0.60,Harmony:-0.10,Magnetic:0.40});
// North Node-Mars
_cm('North Node','Mars','Conjunction',  {Attraction:0.55,Emotional:0.10,Mental:0.05,Stability:0.10,Karmic:0.85,Harmony:0.05,Magnetic:0.75});
_cm('North Node','Mars','Trine',        {Attraction:0.40,Emotional:0.10,Mental:0.05,Stability:0.15,Karmic:0.55,Harmony:0.15,Magnetic:0.50});
_cm('North Node','Mars','Opposition',   {Attraction:0.45,Emotional:-0.05,Mental:0.00,Stability:-0.05,Karmic:0.70,Harmony:-0.10,Magnetic:0.60});
_cm('North Node','Mars','Square',       {Attraction:0.30,Emotional:-0.10,Mental:0.00,Stability:-0.15,Karmic:0.60,Harmony:-0.20,Magnetic:0.45});
// North Node-Ascendant
_cm('North Node','Ascendant','Conjunction', {Attraction:0.40,Emotional:0.30,Mental:0.15,Stability:0.40,Karmic:0.90,Harmony:0.30,Magnetic:0.65});
_cm('North Node','Ascendant','Opposition', {Attraction:0.30,Emotional:0.20,Mental:0.10,Stability:0.20,Karmic:0.75,Harmony:0.10,Magnetic:0.50});
// Chiron-Venus
_cm('Chiron','Venus','Conjunction',  {Attraction:0.25,Emotional:0.45,Mental:0.05,Stability:0.15,Karmic:0.80,Harmony:0.15,Magnetic:0.50});
_cm('Chiron','Venus','Trine',        {Attraction:0.15,Emotional:0.40,Mental:0.05,Stability:0.20,Karmic:0.55,Harmony:0.30,Magnetic:0.30});
_cm('Chiron','Venus','Opposition',   {Attraction:0.15,Emotional:0.10,Mental:0.00,Stability:0.00,Karmic:0.65,Harmony:-0.10,Magnetic:0.40});
_cm('Chiron','Venus','Square',       {Attraction:0.10,Emotional:-0.15,Mental:0.00,Stability:-0.10,Karmic:0.60,Harmony:-0.25,Magnetic:0.35});
// Chiron-Sun
_cm('Chiron','Sun','Conjunction',    {Attraction:0.15,Emotional:0.30,Mental:0.10,Stability:0.10,Karmic:0.75,Harmony:0.10,Magnetic:0.40});
_cm('Chiron','Sun','Trine',          {Attraction:0.10,Emotional:0.25,Mental:0.10,Stability:0.15,Karmic:0.50,Harmony:0.25,Magnetic:0.25});
_cm('Chiron','Sun','Opposition',     {Attraction:0.10,Emotional:0.05,Mental:0.05,Stability:0.00,Karmic:0.60,Harmony:-0.10,Magnetic:0.30});
// Chiron-Moon
_cm('Chiron','Moon','Conjunction',   {Attraction:0.10,Emotional:0.45,Mental:0.05,Stability:0.10,Karmic:0.80,Harmony:0.10,Magnetic:0.45});
_cm('Chiron','Moon','Trine',         {Attraction:0.08,Emotional:0.40,Mental:0.05,Stability:0.15,Karmic:0.55,Harmony:0.25,Magnetic:0.30});
_cm('Chiron','Moon','Opposition',    {Attraction:0.08,Emotional:0.10,Mental:0.00,Stability:0.00,Karmic:0.65,Harmony:-0.10,Magnetic:0.35});
// Juno — partnership and long-term commitment
_cm('Juno','Sun','Conjunction',      {Attraction:0.45,Emotional:0.50,Mental:0.15,Stability:0.80,Karmic:0.35,Harmony:0.65,Magnetic:0.40});
_cm('Juno','Sun','Trine',           {Attraction:0.35,Emotional:0.40,Mental:0.12,Stability:0.70,Karmic:0.20,Harmony:0.55,Magnetic:0.28});
_cm('Juno','Sun','Sextile',         {Attraction:0.28,Emotional:0.35,Mental:0.10,Stability:0.60,Karmic:0.12,Harmony:0.50,Magnetic:0.20});
_cm('Juno','Sun','Opposition',      {Attraction:0.35,Emotional:0.20,Mental:0.08,Stability:0.30,Karmic:0.45,Harmony:0.10,Magnetic:0.35});
_cm('Juno','Sun','Square',          {Attraction:0.20,Emotional:0.05,Mental:0.05,Stability:-0.10,Karmic:0.40,Harmony:-0.15,Magnetic:0.25});
_cm('Juno','Moon','Conjunction',     {Attraction:0.30,Emotional:0.70,Mental:0.10,Stability:0.75,Karmic:0.40,Harmony:0.65,Magnetic:0.35});
_cm('Juno','Moon','Trine',          {Attraction:0.20,Emotional:0.60,Mental:0.08,Stability:0.65,Karmic:0.25,Harmony:0.55,Magnetic:0.25});
_cm('Juno','Moon','Sextile',        {Attraction:0.15,Emotional:0.50,Mental:0.08,Stability:0.55,Karmic:0.15,Harmony:0.45,Magnetic:0.18});
_cm('Juno','Moon','Opposition',     {Attraction:0.20,Emotional:0.25,Mental:0.05,Stability:0.20,Karmic:0.50,Harmony:0.00,Magnetic:0.30});
_cm('Juno','Moon','Square',         {Attraction:0.12,Emotional:0.00,Mental:0.00,Stability:-0.15,Karmic:0.45,Harmony:-0.20,Magnetic:0.22});
_cm('Juno','Venus','Conjunction',    {Attraction:0.60,Emotional:0.55,Mental:0.10,Stability:0.85,Karmic:0.30,Harmony:0.75,Magnetic:0.55});
_cm('Juno','Venus','Trine',         {Attraction:0.45,Emotional:0.45,Mental:0.08,Stability:0.75,Karmic:0.18,Harmony:0.65,Magnetic:0.38});
_cm('Juno','Venus','Sextile',       {Attraction:0.38,Emotional:0.38,Mental:0.08,Stability:0.65,Karmic:0.10,Harmony:0.55,Magnetic:0.28});
_cm('Juno','Venus','Opposition',    {Attraction:0.40,Emotional:0.20,Mental:0.05,Stability:0.25,Karmic:0.40,Harmony:0.05,Magnetic:0.40});
_cm('Juno','Venus','Square',        {Attraction:0.25,Emotional:0.00,Mental:0.00,Stability:-0.15,Karmic:0.35,Harmony:-0.20,Magnetic:0.30});
_cm('Juno','Mars','Conjunction',     {Attraction:0.55,Emotional:0.20,Mental:0.05,Stability:0.50,Karmic:0.25,Harmony:0.30,Magnetic:0.55});
_cm('Juno','Mars','Trine',          {Attraction:0.40,Emotional:0.18,Mental:0.05,Stability:0.45,Karmic:0.15,Harmony:0.30,Magnetic:0.38});
_cm('Juno','Mars','Opposition',     {Attraction:0.45,Emotional:0.00,Mental:0.00,Stability:0.10,Karmic:0.35,Harmony:-0.10,Magnetic:0.50});
_cm('Juno','Mars','Square',         {Attraction:0.30,Emotional:-0.10,Mental:0.00,Stability:-0.10,Karmic:0.30,Harmony:-0.25,Magnetic:0.40});
_cm('Juno','Saturn','Conjunction',   {Attraction:0.15,Emotional:0.30,Mental:0.10,Stability:0.90,Karmic:0.40,Harmony:0.50,Magnetic:0.20});
_cm('Juno','Saturn','Trine',        {Attraction:0.10,Emotional:0.25,Mental:0.08,Stability:0.80,Karmic:0.25,Harmony:0.45,Magnetic:0.12});
_cm('Juno','Saturn','Opposition',   {Attraction:0.10,Emotional:0.10,Mental:0.05,Stability:0.30,Karmic:0.45,Harmony:0.05,Magnetic:0.15});
_cm('Juno','Saturn','Square',       {Attraction:0.05,Emotional:-0.05,Mental:0.00,Stability:-0.10,Karmic:0.40,Harmony:-0.20,Magnetic:0.10});
_cm('Juno','Ascendant','Conjunction',{Attraction:0.55,Emotional:0.35,Mental:0.10,Stability:0.65,Karmic:0.25,Harmony:0.50,Magnetic:0.45});
_cm('Juno','Ascendant','Trine',     {Attraction:0.40,Emotional:0.28,Mental:0.08,Stability:0.55,Karmic:0.12,Harmony:0.45,Magnetic:0.30});
_cm('Juno','Ascendant','Opposition',{Attraction:0.35,Emotional:0.15,Mental:0.05,Stability:0.30,Karmic:0.30,Harmony:0.10,Magnetic:0.35});
_cm('Juno','Juno','Conjunction',     {Attraction:0.40,Emotional:0.50,Mental:0.15,Stability:0.90,Karmic:0.50,Harmony:0.70,Magnetic:0.40});
_cm('Juno','Juno','Trine',          {Attraction:0.30,Emotional:0.40,Mental:0.10,Stability:0.75,Karmic:0.30,Harmony:0.60,Magnetic:0.28});
_cm('Juno','Juno','Opposition',     {Attraction:0.30,Emotional:0.20,Mental:0.08,Stability:0.35,Karmic:0.45,Harmony:0.10,Magnetic:0.30});
_cm('Juno','Juno','Square',         {Attraction:0.18,Emotional:0.00,Mental:0.00,Stability:-0.10,Karmic:0.40,Harmony:-0.15,Magnetic:0.22});
_cm('Juno','North Node','Conjunction',{Attraction:0.30,Emotional:0.35,Mental:0.10,Stability:0.55,Karmic:0.85,Harmony:0.35,Magnetic:0.50});
_cm('Juno','North Node','Trine',    {Attraction:0.20,Emotional:0.28,Mental:0.08,Stability:0.45,Karmic:0.60,Harmony:0.30,Magnetic:0.35});
_cm('Juno','North Node','Opposition',{Attraction:0.20,Emotional:0.15,Mental:0.05,Stability:0.20,Karmic:0.70,Harmony:0.05,Magnetic:0.40});
_cm('Juno','Pluto','Conjunction',    {Attraction:0.35,Emotional:0.30,Mental:0.05,Stability:0.40,Karmic:0.70,Harmony:0.15,Magnetic:0.55});
_cm('Juno','Pluto','Trine',         {Attraction:0.25,Emotional:0.25,Mental:0.05,Stability:0.35,Karmic:0.50,Harmony:0.25,Magnetic:0.35});
_cm('Juno','Pluto','Opposition',    {Attraction:0.25,Emotional:0.05,Mental:0.00,Stability:0.05,Karmic:0.65,Harmony:-0.15,Magnetic:0.50});
_cm('Juno','Pluto','Square',        {Attraction:0.18,Emotional:-0.10,Mental:0.00,Stability:-0.15,Karmic:0.60,Harmony:-0.25,Magnetic:0.42});
// Vesta — devotion, sacred focus, and dedication in the bond
_cm('Vesta','Sun','Conjunction',     {Attraction:0.30,Emotional:0.40,Mental:0.15,Stability:0.65,Karmic:0.35,Harmony:0.50,Magnetic:0.30});
_cm('Vesta','Sun','Trine',          {Attraction:0.20,Emotional:0.32,Mental:0.12,Stability:0.55,Karmic:0.20,Harmony:0.42,Magnetic:0.20});
_cm('Vesta','Sun','Sextile',        {Attraction:0.15,Emotional:0.28,Mental:0.10,Stability:0.48,Karmic:0.12,Harmony:0.38,Magnetic:0.15});
_cm('Vesta','Sun','Opposition',     {Attraction:0.18,Emotional:0.15,Mental:0.08,Stability:0.20,Karmic:0.40,Harmony:0.00,Magnetic:0.25});
_cm('Vesta','Sun','Square',         {Attraction:0.10,Emotional:0.00,Mental:0.05,Stability:-0.10,Karmic:0.35,Harmony:-0.15,Magnetic:0.18});
_cm('Vesta','Moon','Conjunction',    {Attraction:0.20,Emotional:0.60,Mental:0.10,Stability:0.60,Karmic:0.40,Harmony:0.55,Magnetic:0.30});
_cm('Vesta','Moon','Trine',         {Attraction:0.12,Emotional:0.50,Mental:0.08,Stability:0.50,Karmic:0.25,Harmony:0.45,Magnetic:0.20});
_cm('Vesta','Moon','Sextile',       {Attraction:0.10,Emotional:0.42,Mental:0.08,Stability:0.42,Karmic:0.15,Harmony:0.38,Magnetic:0.15});
_cm('Vesta','Moon','Opposition',    {Attraction:0.12,Emotional:0.18,Mental:0.05,Stability:0.15,Karmic:0.45,Harmony:-0.05,Magnetic:0.25});
_cm('Vesta','Moon','Square',        {Attraction:0.08,Emotional:-0.05,Mental:0.00,Stability:-0.10,Karmic:0.38,Harmony:-0.18,Magnetic:0.18});
_cm('Vesta','Venus','Conjunction',   {Attraction:0.40,Emotional:0.50,Mental:0.08,Stability:0.70,Karmic:0.30,Harmony:0.60,Magnetic:0.40});
_cm('Vesta','Venus','Trine',        {Attraction:0.30,Emotional:0.40,Mental:0.08,Stability:0.60,Karmic:0.18,Harmony:0.50,Magnetic:0.28});
_cm('Vesta','Venus','Sextile',      {Attraction:0.22,Emotional:0.32,Mental:0.06,Stability:0.50,Karmic:0.10,Harmony:0.42,Magnetic:0.20});
_cm('Vesta','Venus','Opposition',   {Attraction:0.28,Emotional:0.15,Mental:0.05,Stability:0.20,Karmic:0.35,Harmony:0.00,Magnetic:0.32});
_cm('Vesta','Venus','Square',       {Attraction:0.15,Emotional:0.00,Mental:0.00,Stability:-0.10,Karmic:0.30,Harmony:-0.15,Magnetic:0.25});
_cm('Vesta','Mars','Conjunction',    {Attraction:0.45,Emotional:0.15,Mental:0.05,Stability:0.45,Karmic:0.30,Harmony:0.20,Magnetic:0.50});
_cm('Vesta','Mars','Trine',         {Attraction:0.32,Emotional:0.12,Mental:0.05,Stability:0.38,Karmic:0.18,Harmony:0.22,Magnetic:0.35});
_cm('Vesta','Mars','Opposition',    {Attraction:0.35,Emotional:0.00,Mental:0.00,Stability:0.05,Karmic:0.35,Harmony:-0.10,Magnetic:0.45});
_cm('Vesta','Mars','Square',        {Attraction:0.22,Emotional:-0.08,Mental:0.00,Stability:-0.10,Karmic:0.30,Harmony:-0.20,Magnetic:0.35});
_cm('Vesta','Saturn','Conjunction',  {Attraction:0.10,Emotional:0.25,Mental:0.08,Stability:0.75,Karmic:0.40,Harmony:0.40,Magnetic:0.15});
_cm('Vesta','Saturn','Trine',       {Attraction:0.08,Emotional:0.20,Mental:0.06,Stability:0.65,Karmic:0.25,Harmony:0.35,Magnetic:0.10});
_cm('Vesta','Saturn','Opposition',  {Attraction:0.05,Emotional:0.08,Mental:0.05,Stability:0.25,Karmic:0.40,Harmony:0.00,Magnetic:0.10});
_cm('Vesta','Saturn','Square',      {Attraction:0.03,Emotional:-0.05,Mental:0.00,Stability:-0.05,Karmic:0.35,Harmony:-0.15,Magnetic:0.08});
_cm('Vesta','Ascendant','Conjunction',{Attraction:0.35,Emotional:0.30,Mental:0.10,Stability:0.50,Karmic:0.25,Harmony:0.40,Magnetic:0.35});
_cm('Vesta','Ascendant','Trine',    {Attraction:0.25,Emotional:0.22,Mental:0.08,Stability:0.42,Karmic:0.12,Harmony:0.35,Magnetic:0.25});
_cm('Vesta','Ascendant','Opposition',{Attraction:0.20,Emotional:0.12,Mental:0.05,Stability:0.18,Karmic:0.25,Harmony:0.00,Magnetic:0.28});
_cm('Vesta','Pluto','Conjunction',   {Attraction:0.25,Emotional:0.25,Mental:0.05,Stability:0.35,Karmic:0.65,Harmony:0.12,Magnetic:0.45});
_cm('Vesta','Pluto','Trine',        {Attraction:0.18,Emotional:0.20,Mental:0.05,Stability:0.30,Karmic:0.45,Harmony:0.20,Magnetic:0.30});
_cm('Vesta','Pluto','Opposition',   {Attraction:0.15,Emotional:0.05,Mental:0.00,Stability:0.05,Karmic:0.55,Harmony:-0.10,Magnetic:0.38});
_cm('Vesta','Juno','Conjunction',    {Attraction:0.35,Emotional:0.45,Mental:0.10,Stability:0.80,Karmic:0.45,Harmony:0.60,Magnetic:0.35});
_cm('Vesta','Juno','Trine',         {Attraction:0.25,Emotional:0.35,Mental:0.08,Stability:0.65,Karmic:0.28,Harmony:0.50,Magnetic:0.25});
_cm('Vesta','Juno','Opposition',    {Attraction:0.20,Emotional:0.15,Mental:0.05,Stability:0.25,Karmic:0.40,Harmony:0.05,Magnetic:0.28});
_cm('Vesta','Juno','Square',        {Attraction:0.12,Emotional:0.00,Mental:0.00,Stability:-0.05,Karmic:0.35,Harmony:-0.12,Magnetic:0.20});
_cm('Vesta','Vesta','Conjunction',   {Attraction:0.25,Emotional:0.40,Mental:0.12,Stability:0.70,Karmic:0.45,Harmony:0.55,Magnetic:0.30});
_cm('Vesta','Vesta','Trine',        {Attraction:0.18,Emotional:0.32,Mental:0.10,Stability:0.58,Karmic:0.28,Harmony:0.45,Magnetic:0.20});
_cm('Vesta','Vesta','Opposition',   {Attraction:0.15,Emotional:0.15,Mental:0.05,Stability:0.20,Karmic:0.40,Harmony:0.00,Magnetic:0.22});
_cm('Vesta','North Node','Conjunction',{Attraction:0.20,Emotional:0.30,Mental:0.10,Stability:0.45,Karmic:0.75,Harmony:0.30,Magnetic:0.40});
_cm('Vesta','North Node','Trine',   {Attraction:0.12,Emotional:0.22,Mental:0.08,Stability:0.38,Karmic:0.55,Harmony:0.25,Magnetic:0.28});
_cm('Vesta','North Node','Opposition',{Attraction:0.12,Emotional:0.12,Mental:0.05,Stability:0.15,Karmic:0.60,Harmony:0.00,Magnetic:0.32});
// Sun-Ascendant
_cm('Sun','Ascendant','Conjunction', {Attraction:0.70,Emotional:0.30,Mental:0.20,Stability:0.45,Karmic:0.15,Harmony:0.55,Magnetic:0.50});
_cm('Sun','Ascendant','Trine',       {Attraction:0.55,Emotional:0.25,Mental:0.15,Stability:0.40,Karmic:0.05,Harmony:0.50,Magnetic:0.35});
_cm('Sun','Ascendant','Sextile',     {Attraction:0.45,Emotional:0.20,Mental:0.15,Stability:0.35,Karmic:0.05,Harmony:0.45,Magnetic:0.25});
_cm('Sun','Ascendant','Opposition',  {Attraction:0.55,Emotional:0.15,Mental:0.10,Stability:0.30,Karmic:0.20,Harmony:0.20,Magnetic:0.40});
_cm('Sun','Ascendant','Square',      {Attraction:0.35,Emotional:0.00,Mental:0.05,Stability:0.05,Karmic:0.15,Harmony:-0.10,Magnetic:0.30});
// Venus-Ascendant
_cm('Venus','Ascendant','Conjunction', {Attraction:0.80,Emotional:0.45,Mental:0.10,Stability:0.40,Karmic:0.10,Harmony:0.60,Magnetic:0.60});
_cm('Venus','Ascendant','Trine',       {Attraction:0.65,Emotional:0.35,Mental:0.10,Stability:0.35,Karmic:0.05,Harmony:0.55,Magnetic:0.40});
_cm('Venus','Ascendant','Sextile',     {Attraction:0.55,Emotional:0.30,Mental:0.08,Stability:0.30,Karmic:0.05,Harmony:0.50,Magnetic:0.30});
_cm('Venus','Ascendant','Opposition',  {Attraction:0.60,Emotional:0.15,Mental:0.05,Stability:0.20,Karmic:0.15,Harmony:0.15,Magnetic:0.50});
_cm('Venus','Ascendant','Square',      {Attraction:0.40,Emotional:0.00,Mental:0.00,Stability:0.00,Karmic:0.10,Harmony:-0.10,Magnetic:0.35});
// Mars-Ascendant
_cm('Mars','Ascendant','Conjunction',  {Attraction:0.75,Emotional:0.05,Mental:0.05,Stability:0.10,Karmic:0.15,Harmony:0.05,Magnetic:0.70});
_cm('Mars','Ascendant','Trine',        {Attraction:0.60,Emotional:0.10,Mental:0.05,Stability:0.15,Karmic:0.05,Harmony:0.20,Magnetic:0.50});
_cm('Mars','Ascendant','Opposition',   {Attraction:0.65,Emotional:-0.05,Mental:0.00,Stability:-0.05,Karmic:0.20,Harmony:-0.10,Magnetic:0.65});
_cm('Mars','Ascendant','Square',       {Attraction:0.50,Emotional:-0.15,Mental:0.00,Stability:-0.15,Karmic:0.15,Harmony:-0.20,Magnetic:0.55});
// Sun-Descendant / Venus-Descendant
_cm('Sun','Descendant','Conjunction',  {Attraction:0.55,Emotional:0.35,Mental:0.15,Stability:0.70,Karmic:0.25,Harmony:0.50,Magnetic:0.45});
_cm('Sun','Descendant','Trine',        {Attraction:0.40,Emotional:0.25,Mental:0.10,Stability:0.55,Karmic:0.15,Harmony:0.45,Magnetic:0.30});
_cm('Venus','Descendant','Conjunction', {Attraction:0.65,Emotional:0.40,Mental:0.10,Stability:0.70,Karmic:0.20,Harmony:0.55,Magnetic:0.50});
_cm('Venus','Descendant','Trine',      {Attraction:0.50,Emotional:0.30,Mental:0.08,Stability:0.55,Karmic:0.10,Harmony:0.50,Magnetic:0.35});
// Moon-IC
_cm('Moon','IC','Conjunction',       {Attraction:0.15,Emotional:0.90,Mental:0.10,Stability:0.55,Karmic:0.30,Harmony:0.65,Magnetic:0.25});
_cm('Moon','IC','Trine',             {Attraction:0.10,Emotional:0.75,Mental:0.10,Stability:0.45,Karmic:0.15,Harmony:0.55,Magnetic:0.15});
// Venus-Uranus
_cm('Venus','Uranus','Conjunction',  {Attraction:0.65,Emotional:0.10,Mental:0.15,Stability:-0.30,Karmic:0.20,Harmony:-0.05,Magnetic:0.60});
_cm('Venus','Uranus','Trine',        {Attraction:0.50,Emotional:0.15,Mental:0.15,Stability:-0.05,Karmic:0.10,Harmony:0.15,Magnetic:0.40});
_cm('Venus','Uranus','Opposition',   {Attraction:0.55,Emotional:0.00,Mental:0.10,Stability:-0.40,Karmic:0.25,Harmony:-0.25,Magnetic:0.55});
_cm('Venus','Uranus','Square',       {Attraction:0.50,Emotional:-0.10,Mental:0.05,Stability:-0.45,Karmic:0.20,Harmony:-0.30,Magnetic:0.50});
// Moon-Uranus
_cm('Moon','Uranus','Conjunction',   {Attraction:0.30,Emotional:0.10,Mental:0.15,Stability:-0.35,Karmic:0.25,Harmony:-0.15,Magnetic:0.40});
_cm('Moon','Uranus','Trine',         {Attraction:0.20,Emotional:0.20,Mental:0.15,Stability:-0.05,Karmic:0.10,Harmony:0.10,Magnetic:0.25});
_cm('Moon','Uranus','Opposition',    {Attraction:0.25,Emotional:-0.20,Mental:0.10,Stability:-0.45,Karmic:0.30,Harmony:-0.35,Magnetic:0.35});
_cm('Moon','Uranus','Square',        {Attraction:0.20,Emotional:-0.35,Mental:0.05,Stability:-0.50,Karmic:0.25,Harmony:-0.45,Magnetic:0.30});
// Sun-Uranus
_cm('Sun','Uranus','Conjunction',    {Attraction:0.40,Emotional:0.05,Mental:0.20,Stability:-0.25,Karmic:0.20,Harmony:-0.05,Magnetic:0.40});
_cm('Sun','Uranus','Trine',          {Attraction:0.30,Emotional:0.10,Mental:0.20,Stability:0.00,Karmic:0.10,Harmony:0.15,Magnetic:0.25});
_cm('Sun','Uranus','Opposition',     {Attraction:0.35,Emotional:-0.10,Mental:0.10,Stability:-0.35,Karmic:0.25,Harmony:-0.25,Magnetic:0.35});
_cm('Sun','Uranus','Square',         {Attraction:0.25,Emotional:-0.20,Mental:0.05,Stability:-0.40,Karmic:0.20,Harmony:-0.30,Magnetic:0.30});
// Sun-Neptune
_cm('Sun','Neptune','Conjunction',   {Attraction:0.35,Emotional:0.40,Mental:0.10,Stability:-0.10,Karmic:0.40,Harmony:0.20,Magnetic:0.45});
_cm('Sun','Neptune','Trine',         {Attraction:0.25,Emotional:0.40,Mental:0.10,Stability:0.05,Karmic:0.25,Harmony:0.30,Magnetic:0.30});
_cm('Sun','Neptune','Opposition',    {Attraction:0.25,Emotional:0.10,Mental:0.00,Stability:-0.25,Karmic:0.35,Harmony:-0.15,Magnetic:0.35});
_cm('Sun','Neptune','Square',        {Attraction:0.20,Emotional:-0.10,Mental:-0.05,Stability:-0.35,Karmic:0.30,Harmony:-0.30,Magnetic:0.30});
// Moon-Neptune
_cm('Moon','Neptune','Conjunction',  {Attraction:0.20,Emotional:0.55,Mental:0.05,Stability:-0.10,Karmic:0.40,Harmony:0.25,Magnetic:0.40});
_cm('Moon','Neptune','Trine',        {Attraction:0.15,Emotional:0.55,Mental:0.05,Stability:0.05,Karmic:0.25,Harmony:0.35,Magnetic:0.25});
_cm('Moon','Neptune','Opposition',   {Attraction:0.15,Emotional:0.10,Mental:0.00,Stability:-0.25,Karmic:0.35,Harmony:-0.20,Magnetic:0.30});
_cm('Moon','Neptune','Square',       {Attraction:0.12,Emotional:-0.15,Mental:-0.05,Stability:-0.35,Karmic:0.30,Harmony:-0.35,Magnetic:0.25});

// ── Default Aspect Archetype Modifiers (fallback) ──
const CE_DEFAULT_ASPECT_MODIFIERS: Record<string, CatMods> = {
  Conjunction:    {Attraction:0.30,Emotional:0.25,Mental:0.15,Stability:0.25,Karmic:0.20,Harmony:0.25,Magnetic:0.30},
  Trine:          {Attraction:0.25,Emotional:0.30,Mental:0.20,Stability:0.35,Karmic:0.05,Harmony:0.50,Magnetic:0.15},
  Sextile:        {Attraction:0.20,Emotional:0.25,Mental:0.20,Stability:0.30,Karmic:0.05,Harmony:0.40,Magnetic:0.10},
  Opposition:     {Attraction:0.25,Emotional:0.00,Mental:0.05,Stability:-0.10,Karmic:0.25,Harmony:-0.10,Magnetic:0.30},
  Square:         {Attraction:0.15,Emotional:-0.15,Mental:-0.05,Stability:-0.20,Karmic:0.20,Harmony:-0.25,Magnetic:0.25},
  Quincunx:       {Attraction:0.05,Emotional:-0.05,Mental:0.00,Stability:-0.10,Karmic:0.20,Harmony:-0.15,Magnetic:0.10},
  'Semi-Sextile': {Attraction:0.05,Emotional:0.05,Mental:0.05,Stability:0.05,Karmic:0.05,Harmony:0.05,Magnetic:0.05},
  'Semi-Square':  {Attraction:0.05,Emotional:-0.05,Mental:0.00,Stability:-0.05,Karmic:0.08,Harmony:-0.08,Magnetic:0.08},
  Sesquiquadrate: {Attraction:0.05,Emotional:-0.05,Mental:0.00,Stability:-0.05,Karmic:0.08,Harmony:-0.08,Magnetic:0.08},
};

// ── House Overlay Scoring REMOVED ──
// Whole Sign house system is used exclusively. House cusps are not
// factored into the compatibility equation — only aspect-based and
// planet-pair-based scoring is used.

// ── Overall interpretation bands ──
const CE_OVERALL_BANDS: Array<[number, string]> = [
  [90, 'Rare compatibility \u2014 very strong bond, high attraction and support'],
  [80, 'Very strong relationship potential'],
  [70, 'Good compatibility with some friction'],
  [60, 'Mixed but workable if mature'],
  [50, 'Strong pull but inconsistent harmony'],
  [40, 'Difficult, unstable, karmically heavy'],
  [0,  'More lesson than peace'],
];

// ── Scoreable bodies ──
const SCOREABLE = new Set([
  'Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn',
  'Uranus','Neptune','Pluto','Ascendant','Descendant','MC','IC',
  'North Node','South Node','Chiron','Juno','Vesta',
]);

// (Overlay planets removed — Whole Sign system, no house cusp scoring)

// ── Aspect description templates ──
const ASPECT_VERBS: Record<string, { supportive: string; challenging: string }> = {
  Conjunction:    { supportive: 'merges with',        challenging: 'intensely fuses with' },
  Trine:          { supportive: 'harmonizes with',    challenging: 'flows with' },
  Sextile:        { supportive: 'supports',           challenging: 'gently connects to' },
  Opposition:     { supportive: 'complements',        challenging: 'opposes' },
  Square:         { supportive: 'energizes',          challenging: 'challenges' },
  Quincunx:       { supportive: 'adjusts to',         challenging: 'creates tension with' },
  'Semi-Sextile': { supportive: 'subtly connects to', challenging: 'mildly irritates' },
  'Semi-Square':  { supportive: 'nudges',             challenging: 'friction with' },
  Sesquiquadrate: { supportive: 'pushes',             challenging: 'agitates' },
};

const ASPECT_THEMES: Record<string, Record<string, string>> = {
  'Moon|Sun': { supportive: 'you two understand each other without having to explain', challenging: 'one person\'s personality can steamroll the other\'s feelings. What helps: ask how the other feels before explaining what you meant' },
  'Mars|Venus': { supportive: 'real, visible chemistry that neither of you has to fake', challenging: 'you want different things from desire. What helps: say what you\'re actually after instead of letting the other guess' },
  'Moon|Moon': { supportive: 'you read each other\'s moods before a word is said', challenging: 'you can drown in each other\'s feelings. What helps: agree that one of you steps back when the other spirals' },
  'Moon|Venus': { supportive: 'affection here is soft and easy to come home to', challenging: 'one of you will test the other\'s affection for proof. What helps: say the reassurance out loud before it\'s demanded' },
  'Saturn|Venus': { supportive: 'the kind of loyalty that stays when things get dull', challenging: 'love can feel rationed or judged. What helps: show warmth on purpose, because it won\'t happen by default' },
  'Pluto|Venus': { supportive: 'a pull that rewires how you both love', challenging: 'attachment can turn possessive fast. What helps: keep your own friends and routines so neither becomes the whole world' },
  'Mars|Pluto': { supportive: 'you push each other to be far stronger than you\'d be alone', challenging: 'every disagreement turns into who wins. What helps: pick the fight\'s goal first, and drop it if it\'s only to win' },
  'Moon|Saturn': { supportive: 'one of you steadies the other when feelings run hot', challenging: 'one of you can make the other\'s emotions feel like a burden. What helps: say \'I need listening, not fixing\'' },
  'Saturn|Sun': { supportive: 'mutual respect that grows into something built to last', challenging: 'one of you feels judged, the other feels disrespected. What helps: separate criticism of the idea from criticism of the person' },
  'Mercury|Mercury': { supportive: 'you finish each other\'s thoughts and never run out to talk about', challenging: 'you talk past each other and both think you were clear. What helps: repeat back what you heard before you reply' },
  'Mercury|Sun': { supportive: 'you each get how the other thinks and talks', challenging: 'criticism gets heard where none was meant. What helps: ask what was meant before reacting' },
  'Mercury|Moon': { supportive: 'hard things can be said and the feeling underneath gets heard', challenging: 'logic gets heard as coldness and feelings as drama. What helps: lead with the feeling, then the point' },
  'Sun|Venus': { supportive: 'admiration here is open and obvious', challenging: 'the attraction is strong but can stay at the surface. What helps: ask the questions that go past the first impression' },
  'Mars|Sun': { supportive: 'they get you moving and you get them moving', challenging: 'you compete when you should be cooperating. What helps: choose a shared opponent, like a goal or a deadline, instead of each other' },
  'Mars|Moon': { supportive: 'you spark each other, emotionally and physically', challenging: 'tempers flare quickly. What helps: take a 20-minute break before you finish any heated argument' },
  'Moon|Pluto': { supportive: 'you bond at a depth most people never reach', challenging: 'one of you can end up steering the other\'s feelings. What helps: name it when you feel pressured instead of going quiet' },
  'Pluto|Sun': { supportive: 'you each make the other stronger and more honest', challenging: 'one of you will try to control the other\'s choices. What helps: protect each other\'s right to decide for themselves' },
  'Neptune|Venus': { supportive: 'love that feels almost spiritual', challenging: 'one of you may love an idea more than the person. What helps: check what is actually done, not what is hoped' },
  'Jupiter|Venus': { supportive: 'joy and generosity come easily between you', challenging: 'you can overdo everything, from spending to promises. What helps: keep one shared budget and one honest check-in each week' },
  'Jupiter|Sun': { supportive: 'you make each other believe bigger things are possible', challenging: 'you promise more than either of you delivers. What helps: only commit to what you\'d still do on a tired day' },
  'North Node|Sun': { supportive: 'being together points you both toward who you\'re meant to become', challenging: 'growing together means leaving something comfortable behind. What helps: talk about what you\'re each afraid of losing' },
  'Moon|North Node': { supportive: 'this feels fated at an emotional level', challenging: 'old emotional patterns replay with them. What helps: notice when a feeling is older than the relationship' },
  'Chiron|Venus': { supportive: 'being loved here heals something old', challenging: 'one of you touches exactly where the other was hurt in love. What helps: name the sore spot before it gets stepped on' },
  'Chiron|Sun': { supportive: 'seeing each other clearly helps you both accept yourselves', challenging: 'one of you pokes at the other\'s deepest insecurity without meaning to. What helps: say which topics are tender' },
  'Chiron|Moon': { supportive: 'you can cry in front of each other and feel better after', challenging: 'old emotional wounds reopen here. What helps: treat those moments as healing, not as a fight' },
  'Ascendant|Sun': { supportive: 'instant familiarity, and one of you feels truly seen', challenging: 'one of you sees the other as they want them to be. What helps: wait a few months before deciding who they are' },
  'Ascendant|Venus': { supportive: 'charm lands instantly', challenging: 'the first spark can be mistaken for something deeper. What helps: let the second and third meetings decide' },
  'Ascendant|Mars': { supportive: 'the physical pull is obvious to both of you', challenging: 'a first impression can feel pushy. What helps: slow the pace until it\'s mutual' },
  'Uranus|Venus': { supportive: 'love with surprise in it, never routine', challenging: 'affection comes in bursts and disappears. What helps: agree on a baseline of contact so silence doesn\'t read as rejection' },
  'Moon|Uranus': { supportive: 'you each feel free to be yourselves', challenging: 'moods shift without warning. What helps: ask for a heads-up before pulling away' },
  'Sun|Uranus': { supportive: 'they push you to be more original', challenging: 'independence turns into distance. What helps: schedule time together so freedom doesn\'t become absence' },
  'Neptune|Sun': { supportive: 'you inspire the best, most hopeful versions of each other', challenging: 'one of you loses track of who they are. What helps: each keep one thing that is only yours' },
  'Moon|Neptune': { supportive: 'an intuitive bond that needs few words', challenging: 'you can disappear into each other and avoid real problems. What helps: say the hard thing plainly, even when it\'s awkward' },
  'Mercury|Uranus': { supportive: 'conversations that spark ideas neither of you had alone', challenging: 'you interrupt, change topics, or go quiet suddenly. What helps: finish the thought before you start another' },
  'Mercury|Neptune': { supportive: 'you talk in images and feelings and still get each other', challenging: 'you each assume the other understood. What helps: put important plans in writing' },
  'Descendant|Sun': { supportive: 'this feels like the partner one of you was looking for', challenging: 'one of you leans on the other to feel complete. What helps: build your own life so staying is a choice, not a need' },
  'Descendant|Venus': { supportive: 'one of you is close to the other\'s picture of an ideal partner', challenging: 'you slide into needing each other to feel whole. What helps: protect separate hobbies and friendships' },
  'IC|Moon': { supportive: 'being together feels like home', challenging: 'you step on each other\'s family boundaries. What helps: decide together how much family gets a say' },
  'North Node|Venus': { supportive: 'love here moves you toward who you\'re meant to be', challenging: 'love comes with a lesson you didn\'t ask for. What helps: ask what the relationship is teaching instead of what it\'s costing' },
  'Mars|North Node': { supportive: 'you act together toward the same future', challenging: 'you repeat the same fight on loop. What helps: change the pattern, not the person' },
  'Ascendant|North Node': { supportive: 'meeting feels meant to happen', challenging: 'the meeting changes you in ways you didn\'t pick. What helps: take the discomfort as information, not as a warning' },
  'Juno|Sun': { supportive: 'this feels like a life you could build together', challenging: 'committing seems to cost independence. What helps: define what you\'d keep before you merge anything' },
  'Juno|Moon': { supportive: 'devotion feels safe here', challenging: 'emotional needs and ideas of commitment don\'t match. What helps: spell out what commitment means to each of you' },
  'Juno|Venus': { supportive: 'romance and long-term partnership point the same way', challenging: 'the romantic ideal and the real day-to-day don\'t line up. What helps: love the real person, not the picture' },
  'Juno|Mars': { supportive: 'desire and commitment reinforce each other', challenging: 'what you want and what the relationship expects pull apart. What helps: don\'t let duty replace desire' },
  'Juno|Saturn': { supportive: 'a commitment that holds under pressure', challenging: 'the partnership feels like a set of rules. What helps: renegotiate the rules out loud once a year' },
  'Ascendant|Juno': { supportive: 'partnership potential is visible the moment you meet', challenging: 'one of you projects the ideal partner onto the other. What helps: ask, don\'t assume' },
  'Juno|Juno': { supportive: 'you want the same kind of partnership', challenging: 'you want different kinds of commitment. What helps: write down what you each expect before you assume' },
  'Juno|North Node': { supportive: 'commitment here feels like part of the path', challenging: 'the partnership is meant to stretch you, and that\'s uncomfortable. What helps: stay through the discomfort before judging it' },
  'Juno|Pluto': { supportive: 'a commitment that changes both of you deeply', challenging: 'commitment turns into control. What helps: keep exits open so staying is a real choice' },
  'Sun|Vesta': { supportive: 'you each treat the other\'s light as worth protecting', challenging: 'one of you gives so much that they vanish. What helps: don\'t let devotion replace having a self' },
  'Moon|Vesta': { supportive: 'feelings get cared for like a vow', challenging: 'one of you gives up emotional needs to keep the peace. What helps: ask for what you need before you resent it' },
  'Venus|Vesta': { supportive: 'love here is devoted, almost sacred', challenging: 'duty replaces fun. What helps: schedule pleasure like you\'d schedule a responsibility' },
  'Mars|Vesta': { supportive: 'you put real energy into what you build together', challenging: 'passion narrows into work, a project or a fixation. What helps: do something purely for fun every week' },
  'Saturn|Vesta': { supportive: 'disciplined devotion that outlasts mood', challenging: 'duty gets rigid and warmth disappears. What helps: say thank you out loud, not just do the chores' },
  'Ascendant|Vesta': { supportive: 'devotion is visible to everyone, including each other', challenging: 'dedication to the other overshadows who you are. What helps: stay visible as yourself' },
  'Pluto|Vesta': { supportive: 'devotion that transforms what you each stand for', challenging: 'devotion turns obsessive. What helps: notice when focus becomes fixation and step back' },
  'Juno|Vesta': { supportive: 'devotion and partnership work together instead of competing', challenging: 'devotion and the need for freedom collide. What helps: agree what is sacred and what is flexible' },
  'Vesta|Vesta': { supportive: 'you both hold the same things sacred', challenging: 'you\'re each devoted to different things. What helps: choose one shared priority to protect first' },
  'North Node|Vesta': { supportive: 'your devotion points at the same destiny', challenging: 'you repeat sacrifices from old patterns. What helps: ask whether you\'re giving from love or from habit' },
};

// ── Sigmoid normalization (matches Python exactly) ──
function normalizeScore(raw: number, midpoint: number = 8.0, steepness: number = 0.35): number {
  if (raw <= 0) {
    return Math.max(5.0, 50.0 * (1.0 + Math.tanh(raw * steepness / 2.0)));
  }
  return Math.min(98.0, 100.0 / (1.0 + Math.exp(-steepness * (raw - midpoint))));
}

// (getHouseForLongitude removed — Whole Sign system, no house cusp scoring)

// ── Relationship Style Label ──
function determineStyleLabel(scores: Record<string, number>): string {
  const att = scores['Attraction'] || 0;
  const emo = scores['Emotional'] || 0;
  const men = scores['Mental'] || 0;
  const stb = scores['Stability'] || 0;
  const kar = scores['Karmic'] || 0;
  const har = scores['Harmony'] || 0;
  const mag = scores['Magnetic'] || 0;

  if (att >= 75 && emo >= 75 && stb >= 70 && har >= 70) return 'Soulmate Potential';
  if (mag >= 75 && att >= 70 && har < 45) return 'Passion Without Peace';
  if (emo >= 75 && har >= 70 && att < 50) return 'Deep Emotional Bond';
  if (kar >= 75 && mag >= 65) return 'Karmic and Transformational';
  if (stb >= 75 && har >= 70 && mag < 45) return 'Built to Last';
  if (men >= 70 && har >= 60 && att < 50) return 'Strong Friendship Base';
  if (att >= 70 && mag >= 70 && stb < 45) return 'Powerful but Volatile';
  if (kar >= 70 && har < 40) return 'Spiritual but Confusing';
  if (stb >= 65 && emo >= 65) return 'Steady and Nurturing';
  if (att >= 65 && emo >= 60) return 'Romantic and Warm';
  if (kar >= 60 && stb >= 55) return 'Fated with Staying Power';
  if (har >= 65) return 'Naturally Harmonious';
  if (mag >= 65) return 'Magnetically Drawn';
  if (stb >= 60) return 'Practical Partnership';
  if (att >= 55) return 'Chemistry-Driven';
  return 'Complex Dynamic';
}

// ── Build human-readable aspect description ──
// What each body governs in a person \u2014 used when a pair has no hand-written theme,
// so the fallback says something specific instead of a generic phrase.
const BODY_ESSENCE: Record<string, string> = {
  Sun: 'sense of self', Moon: 'emotional needs', Mercury: 'way of thinking',
  Venus: 'way of loving', Mars: 'drive and desire', Jupiter: 'optimism and growth',
  Saturn: 'need for structure', Uranus: 'need for freedom', Neptune: 'idealism',
  Pluto: 'intensity', Ascendant: 'first impression', Descendant: 'ideal partner',
  MC: 'public direction', IC: 'sense of home', 'North Node': 'life direction',
  'South Node': 'past patterns', Chiron: 'sore spots', Juno: 'commitment style',
  Vesta: 'devotion',
};

function fallbackTheme(inner: string, outer: string, supportive: boolean): string {
  const a = BODY_ESSENCE[inner] || inner;
  const b = BODY_ESSENCE[outer] || outer;
  return supportive
    ? `your ${a} and their ${b} pull in the same direction, so this part of you two comes easily`
    : `your ${a} and their ${b} pull in different directions \u2014 it only stops stinging once you name it out loud`;
}

function describeAspect(inner: string, outer: string, aspect: string, supportive: boolean, orb?: number): string {
  const pk = pairKey(inner, outer);
  const verb = ASPECT_VERBS[aspect] || { supportive: 'connects to', challenging: 'clashes with' };
  const theme = ASPECT_THEMES[pk];
  const verbStr = supportive ? verb.supportive : verb.challenging;
  const themeStr = theme
    ? (supportive ? theme.supportive : theme.challenging)
    : fallbackTheme(inner, outer, supportive);
  const exact = orb !== undefined && orb <= 0.5 ? ' (near-exact, one of the loudest signals between you)' : '';
  return `Your ${inner} ${verbStr} their ${outer} \u2014 ${themeStr}${exact}`;
}

// Angles are two ends of one axis: a planet conjunct their Descendant is also
// opposite their Ascendant. Count that once, not as two separate findings.
const AXIS_GROUP: Record<string, string> = { Ascendant: 'AC', Descendant: 'AC', MC: 'MC', IC: 'MC' };

function dedupeAxis<T extends { inner: string; outer: string }>(list: T[], limit: number): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const a of list) {
    const ga = AXIS_GROUP[a.outer];
    const gb = AXIS_GROUP[a.inner];
    const key = ga ? `${a.inner}>${ga}` : gb ? `${gb}<${a.outer}` : `${a.inner}|${a.outer}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(a);
    if (out.length === limit) break;
  }
  return out;
}

// ═══════════════════════════════════════════════════════════════════
// Public types
// ═══════════════════════════════════════════════════════════════════

export interface CompatibilityResult {
  overall_score: number;
  emotional_score: number;
  intellectual_score: number;
  physical_score: number;
  spiritual_score: number;
  strengths: string[];
  challenges: string[];
  summary: string;
  aspects: Array<{
    inner: string;
    outer: string;
    aspect: string;
    orb: number;
    strength: number;
    supportive: boolean;
  }>;
  scores: Record<string, number>;
  band_text: string;
  style_label: string;
}

// ═══════════════════════════════════════════════════════════════════
// Main Engine
// ═══════════════════════════════════════════════════════════════════

export function computeSynastryCompatibility(
  person1Positions: Array<{ name: string; longitude: number; house?: number }>,
  person2Positions: Array<{ name: string; longitude: number; house?: number }>,
  person1HouseCusps: number[],
  person2HouseCusps: number[],
): CompatibilityResult {
  const rawScores: Record<string, number> = {};
  for (const c of CE_CATEGORIES) rawScores[c] = 0.0;

  interface AspectDetail {
    inner: string;
    outer: string;
    aspect: string;
    orb: number;
    strength: number;
    contributions: Record<string, number>;
    supportive: boolean;
    harmony_mod: number;
  }
  const allAspectDetails: AspectDetail[] = [];

  // Filter to scoreable bodies
  const inner = (person1Positions || []).filter(p => SCOREABLE.has(p.name));
  const outer = (person2Positions || []).filter(p => SCOREABLE.has(p.name));

  // ── 1. ASPECT SCORING ──
  for (const ip of inner) {
    for (const op of outer) {
      const result = calculateAspect(ip.longitude, op.longitude);
      if (!result) continue;
      const [aspName, orbVal] = result;
      const actualOrb = Math.abs(orbVal);

      // Aspect type weight
      const atw = CE_ASPECT_TYPE_WEIGHT[aspName] ?? 0.40;

      // Max orb for this pair
      const c1 = CE_PLANET_CLASS[ip.name] || 'asteroid';
      const c2 = CE_PLANET_CLASS[op.name] || 'asteroid';
      const o1 = CE_MAX_ORBS[c1] ?? 3;
      const o2 = CE_MAX_ORBS[c2] ?? 3;
      const mo = Math.max(o1, o2);

      // Orb weight
      const ow = Math.max(0.0, 1.0 - (actualOrb / mo));

      // Pair importance
      const pk = pairKey(ip.name, op.name);
      const pi = CE_PAIR_IMPORTANCE[pk] ?? CE_DEFAULT_PAIR_IMPORTANCE;

      // Final aspect strength
      const strength = atw * ow * pi;

      // Category modifiers
      const modKey = pk + '|' + aspName;
      const mods: CatMods = CE_CATEGORY_MODIFIERS[modKey]
        || CE_DEFAULT_ASPECT_MODIFIERS[aspName]
        || {};

      const contributions: Record<string, number> = {};
      for (const cat of CE_CATEGORIES) {
        const contrib = strength * (mods[cat] ?? 0.0);
        rawScores[cat] += contrib;
        contributions[cat] = contrib;
      }

      // Supportive vs challenging
      const harmonyVal = mods['Harmony'] ?? 0.0;
      const isSupportive = harmonyVal >= 0;

      allAspectDetails.push({
        inner: ip.name,
        outer: op.name,
        aspect: aspName,
        orb: actualOrb,
        strength,
        contributions,
        supportive: isSupportive,
        harmony_mod: harmonyVal,
      });
    }
  }

  // ── 2. HOUSE OVERLAY SCORING — REMOVED ──
  // Whole Sign house system: no house cusp overlays in the equation.
  // Scoring is purely aspect-based + planet pair importance.

  // ── 3. NORMALIZATION (0-100 with sigmoid) ──
  // Midpoints calibrated for aspect-only scoring (no house overlays)
  const midpoints: Record<string, number> = {
    Attraction: 4.5, Emotional: 4.0, Mental: 3.0,
    Stability: 3.5, Karmic: 3.5, Harmony: 3.5, Magnetic: 3.5,
  };

  const normalized: Record<string, number> = {};
  for (const cat of CE_CATEGORIES) {
    const mp = midpoints[cat] ?? 6.0;
    normalized[cat] = normalizeScore(rawScores[cat], mp, 0.38);
  }

  // ── 4. OVERALL SCORE (weighted blend) ──
  let overall =
    normalized['Attraction'] * 0.22 +
    normalized['Emotional']  * 0.24 +
    normalized['Mental']     * 0.16 +
    normalized['Stability']  * 0.23 +
    normalized['Karmic']     * 0.15;
  overall = Math.max(0.0, Math.min(100.0, overall));

  // ── 5. INTERPRETATION BAND ──
  let bandText = 'Unknown';
  for (const [threshold, text] of CE_OVERALL_BANDS) {
    if (overall >= threshold) {
      bandText = text;
      break;
    }
  }

  // ── 6. STYLE LABEL ──
  const styleLabel = determineStyleLabel(normalized);

  // ── 7. TOP ASPECTS ──
  const supportiveAspects = dedupeAxis(
    allAspectDetails.filter(a => a.supportive).sort((a, b) => b.strength - a.strength), 5);

  const challengingAspects = dedupeAxis(
    allAspectDetails.filter(a => !a.supportive).sort((a, b) => b.strength - a.strength), 5);

  // Build human-readable strings
  const strengths = supportiveAspects.map(a => describeAspect(a.inner, a.outer, a.aspect, true, a.orb));
  const challenges = challengingAspects.map(a => describeAspect(a.inner, a.outer, a.aspect, false, a.orb));

  // Build the full aspects array for display
  const aspects = allAspectDetails
    .sort((a, b) => b.strength - a.strength)
    .map(a => ({
      inner: a.inner,
      outer: a.outer,
      aspect: a.aspect,
      orb: Math.round(a.orb * 100) / 100,
      strength: Math.round(a.strength * 1000) / 1000,
      supportive: a.supportive,
    }));

  // Build summary
  const summary = `${bandText}. Style: ${styleLabel}.`;

  return {
    overall_score: Math.round(overall),
    emotional_score: Math.round(normalized['Emotional']),
    intellectual_score: Math.round(normalized['Mental']),
    physical_score: Math.round(normalized['Attraction']),
    spiritual_score: Math.round(normalized['Karmic']),
    strengths: strengths.length > 0 ? strengths : ['Natural energetic connection between your charts'],
    challenges: challenges.length > 0 ? challenges : ['Learning to navigate differences together'],
    summary,
    aspects,
    scores: Object.fromEntries(
      CE_CATEGORIES.map(c => [c, Math.round(normalized[c])])
    ),
    band_text: bandText,
    style_label: styleLabel,
  };
}
