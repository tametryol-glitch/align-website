// Client-side Pythagorean numerology calculator
// Method: Add ALL digits together, preserve master numbers (11, 22, 33)

const LETTER_VALUES: Record<string, number> = {
  A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8, I: 9,
  J: 1, K: 2, L: 3, M: 4, N: 5, O: 6, P: 7, Q: 8, R: 9,
  S: 1, T: 2, U: 3, V: 4, W: 5, X: 6, Y: 7, Z: 8,
};

const VOWELS = new Set(['A', 'E', 'I', 'O', 'U']);
const MASTER_NUMBERS = [11, 22, 33];

function digitSum(num: number): number {
  return String(num).split('').reduce((s, d) => s + parseInt(d), 0);
}

function pythagoreanReduce(num: number): { raw: number; reduced: number } {
  const raw = num;
  let current = num;
  while (current > 9 && !MASTER_NUMBERS.includes(current)) {
    current = digitSum(current);
  }
  return { raw, reduced: current };
}

function formatNumber(raw: number, reduced: number): string {
  if (raw !== reduced && raw > 9) {
    return `${raw}/${reduced}`;
  }
  return String(reduced);
}

function letterSum(name: string, filter?: 'vowels' | 'consonants'): { raw: number; reduced: number } {
  const upper = name.toUpperCase().replace(/[^A-Z]/g, '');
  let total = 0;
  for (const ch of upper) {
    if (filter === 'vowels' && !VOWELS.has(ch)) continue;
    if (filter === 'consonants' && VOWELS.has(ch)) continue;
    total += LETTER_VALUES[ch] || 0;
  }
  return pythagoreanReduce(total);
}

function lifePathFromDate(dateStr: string): { raw: number; reduced: number } {
  const digits = dateStr.replace(/[^0-9]/g, '');
  const total = digits.split('').reduce((s, d) => s + parseInt(d), 0);
  return pythagoreanReduce(total);
}

function personalYear(dateStr: string): { raw: number; reduced: number } {
  const parts = dateStr.split('-').map(Number);
  let month: number, day: number;
  if (parts[0] > 31) {
    month = parts[1]; day = parts[2];
  } else {
    day = parts[0]; month = parts[1];
  }
  const currentYear = new Date().getFullYear();
  const allDigits = `${day}${month}${currentYear}`;
  const total = allDigits.split('').reduce((s, d) => s + parseInt(d), 0);
  return pythagoreanReduce(total);
}

function birthdayNumber(dateStr: string): { raw: number; reduced: number } {
  const parts = dateStr.split('-').map(Number);
  const day = parts[0] > 31 ? parts[2] : parts[0];
  return pythagoreanReduce(day);
}

export const NUMBER_MEANINGS: Record<number, { title: string; personality: string; strengths: string; challenges: string; career: string; relationships: string }> = {
  1: {
    title: 'The Leader',
    personality: 'Independent, ambitious, and pioneering. You forge your own path with confidence and originality. You have a natural drive to be first, to initiate, and to stand on your own two feet.',
    strengths: 'Self-reliance, determination, courage, innovation, and the ability to start things from scratch. You inspire others through action rather than words.',
    challenges: 'Stubbornness, impatience with others, difficulty asking for help, and a tendency to isolate. You may push people away when you need them most.',
    career: 'Entrepreneurship, leadership roles, self-employment, creative direction, and any field where you can pioneer new ideas or methods.',
    relationships: 'You need a partner who respects your independence and does not try to control you. You love deeply but need space to be yourself.',
  },
  2: {
    title: 'The Diplomat',
    personality: 'Sensitive, intuitive, and cooperative. You have a natural gift for understanding others and creating harmony. You sense what people need before they say it.',
    strengths: 'Empathy, patience, diplomacy, mediation, and the ability to bring opposing sides together. You are the glue that holds groups together.',
    challenges: 'Over-sensitivity, indecisiveness, fear of confrontation, and tendency to put others needs above your own until you burn out.',
    career: 'Counseling, mediation, teaching, healing arts, human resources, music, and any role that requires deep listening and emotional intelligence.',
    relationships: 'You thrive in committed, harmonious partnerships. You need emotional security and a partner who appreciates your depth of feeling.',
  },
  3: {
    title: 'The Communicator',
    personality: 'Creative, expressive, and charismatic. You light up every room you enter. Your words carry weight and your natural joy is contagious.',
    strengths: 'Creativity, self-expression, optimism, social skills, and the ability to inspire others through your vision and enthusiasm.',
    challenges: 'Scattered energy, superficiality, difficulty with follow-through, and using humor to avoid deeper emotions. You may spread yourself too thin.',
    career: 'Writing, speaking, performing arts, marketing, teaching, design, and any field where your creativity and communication skills can shine.',
    relationships: 'You need a partner who appreciates your social nature and creative spirit. Boredom is your enemy in relationships.',
  },
  4: {
    title: 'The Builder',
    personality: 'Stable, disciplined, and hardworking. You are the foundation that others build upon. Your reliability is your greatest asset.',
    strengths: 'Discipline, organization, perseverance, practical problem-solving, and the ability to turn abstract ideas into concrete reality.',
    challenges: 'Rigidity, resistance to change, workaholic tendencies, and difficulty relaxing or being spontaneous. You may miss opportunities by playing it too safe.',
    career: 'Engineering, architecture, project management, accounting, real estate, operations, and any field that requires systematic building and organization.',
    relationships: 'You are deeply loyal and committed. You need a partner who values stability and is willing to build something lasting together.',
  },
  5: {
    title: 'The Free Spirit',
    personality: 'Adventurous, versatile, and freedom-loving. You thrive on change, variety, and new experiences. Routine is your kryptonite.',
    strengths: 'Adaptability, curiosity, resourcefulness, courage to take risks, and the ability to reinvent yourself whenever life demands it.',
    challenges: 'Restlessness, commitment issues, overindulgence, impulsiveness, and difficulty finishing what you start. Freedom without direction becomes chaos.',
    career: 'Travel, sales, media, entertainment, consulting, and any field that offers variety, movement, and the freedom to explore.',
    relationships: 'You need a partner who gives you space and shares your love of adventure. Jealousy and possessiveness will drive you away.',
  },
  6: {
    title: 'The Nurturer',
    personality: 'Responsible, loving, and devoted to home and family. You carry a deep sense of duty to care for others and create beauty and harmony.',
    strengths: 'Compassion, responsibility, artistic sense, loyalty, and the ability to create safe, beautiful environments where people can heal and grow.',
    challenges: 'Over-giving, martyrdom, controlling behavior disguised as care, perfectionism, and difficulty setting boundaries with people you love.',
    career: 'Healthcare, teaching, interior design, counseling, hospitality, and any field where you can nurture, heal, or beautify.',
    relationships: 'You are devoted and protective. You need a partner who reciprocates your care and does not take your generosity for granted.',
  },
  7: {
    title: 'The Seeker',
    personality: 'Analytical, introspective, and spiritually inclined. You seek truth beneath the surface and trust your inner wisdom above all else.',
    strengths: 'Deep thinking, research ability, spiritual insight, intuition, and the ability to see patterns and truths that others miss entirely.',
    challenges: 'Isolation, overthinking, emotional detachment, skepticism, and difficulty trusting others. You may build walls that keep love out.',
    career: 'Research, science, psychology, spirituality, technology, writing, and any field that rewards depth of thought and independent investigation.',
    relationships: 'You need a partner who respects your need for solitude and intellectual depth. Surface-level connections leave you empty.',
  },
  8: {
    title: 'The Powerhouse',
    personality: 'Ambitious, authoritative, and driven toward material and spiritual mastery. You understand power and how to wield it responsibly.',
    strengths: 'Leadership, financial acumen, strategic thinking, resilience, and the ability to manifest abundance through sheer determination and vision.',
    challenges: 'Workaholism, materialism, controlling behavior, difficulty with vulnerability, and cycles of gain and loss that test your relationship with power.',
    career: 'Business leadership, finance, law, real estate, executive management, and any field where strategic power and authority are valued.',
    relationships: 'You need a partner who is your equal, someone strong enough to stand beside you without being intimidated by your ambition.',
  },
  9: {
    title: 'The Humanitarian',
    personality: 'Compassionate, wise, and universally loving. You carry an old soul energy and a deep commitment to serving humanity and making the world better.',
    strengths: 'Wisdom, compassion, artistic talent, global perspective, and the ability to let go of what no longer serves you with grace.',
    challenges: 'Difficulty with endings, emotional overwhelm, self-sacrifice, scattered generosity, and struggling to focus your humanitarian impulse into practical action.',
    career: 'Non-profit work, art, teaching, healing, international relations, and any field that allows you to serve a cause larger than yourself.',
    relationships: 'You love universally and deeply. You need a partner who understands that your love extends beyond just them, to the world.',
  },
  11: {
    title: 'The Visionary',
    personality: 'Spiritually illuminated, highly intuitive, and inspirational. You are a channel for higher wisdom and carry an electric energy that others can feel.',
    strengths: 'Spiritual insight, creative genius, charisma, healing ability, and the power to awaken and inspire others through your very presence.',
    challenges: 'Extreme sensitivity, nervous energy, self-doubt that contradicts your gifts, difficulty grounding your visions into practical reality, and feeling misunderstood.',
    career: 'Spiritual teaching, art, music, counseling, innovation, and any field where your visionary gifts can reach and transform others.',
    relationships: 'You need a partner who can handle your intensity and support your spiritual path without trying to dim your light.',
  },
  22: {
    title: 'The Master Builder',
    personality: 'Visionary with the discipline to manifest dreams on a massive scale. You carry the intuition of 11 combined with the practical power of 4.',
    strengths: 'Turning impossible visions into tangible reality, organizational genius, leadership at scale, and the ability to build institutions and systems that outlast you.',
    challenges: 'Enormous pressure to perform, burnout from carrying too much responsibility, perfectionism that paralyzes action, and feeling crushed under the weight of your own potential.',
    career: 'Large-scale project leadership, architecture, technology, international business, and any field where you can build something that changes the world.',
    relationships: 'You need a partner who understands your mission and is willing to support the enormous demands your purpose places on your life.',
  },
  33: {
    title: 'The Master Teacher',
    personality: 'Selfless, spiritually evolved, and devoted to the upliftment of humanity. You teach through love, example, and sacrifice. You carry the combined power of 11 and 22.',
    strengths: 'Unconditional love, healing presence, ability to elevate consciousness in others, and the rare gift of teaching through being rather than preaching.',
    challenges: 'Extreme self-sacrifice, martyrdom, unrealistic expectations from self and others, and the burden of being held to a higher standard by everyone around you.',
    career: 'Spiritual leadership, healing, teaching, humanitarian work, and any role where your presence alone can transform the people around you.',
    relationships: 'You love at a level most people cannot comprehend. You need a partner who will not exploit your generosity or mistake your kindness for weakness.',
  },
};

export const PERSONAL_YEAR_MEANINGS: Record<number, string> = {
  1: 'A year of new beginnings, fresh starts, and planting seeds. Take initiative. Start the project, make the move, say the thing. This is your green light year.',
  2: 'A year of patience, partnerships, and trust. Things are developing behind the scenes. Focus on relationships, cooperation, and letting things unfold in their own time.',
  3: 'A year of creativity, joy, and self-expression. Your social life expands, your voice gets louder, and opportunities to create and be seen multiply. Enjoy it.',
  4: 'A year of building, discipline, and laying foundations. The work is real and necessary. What you construct this year will support you for years to come. Show up consistently.',
  5: 'A year of major change, freedom, and unexpected turns. Nothing stays the same — embrace it. Travel, take risks, and let go of anything that feels like a cage.',
  6: 'A year of home, family, responsibility, and love. Your relationships deepen, your domestic life demands attention, and your heart leads every decision. Nurture what matters.',
  7: 'A year of introspection, solitude, and spiritual deepening. Pull back from the noise. This is your year to go inward, study, reflect, and connect with something bigger than yourself.',
  8: 'A year of power, money, achievement, and karmic return. What you have sown in previous years now comes back — for better or worse. Step into your authority. Claim what is yours.',
  9: 'A year of completion, release, and endings. Let go of what has run its course. This is the final chapter of a nine-year cycle. Clear the slate so the next cycle can begin clean.',
  11: 'A master year of spiritual awakening and heightened intuition. You are being called to step into a leadership role that goes beyond the ordinary. Trust your inner vision — the downloads coming through are real. This is not a year to play small.',
  22: 'A master year of manifesting grand visions into reality. The universe is handing you the blueprint for something extraordinary. The pressure is immense, but so is the potential. Build with intention — what you create now can outlast you.',
  33: 'A master year of selfless service and spiritual teaching. You are being asked to lead through love and compassion on a scale that transforms everyone around you. Your example is your greatest lesson. Give generously, but remember to fill your own cup.',
};

export const ANGEL_NUMBERS = [
  { number: '111', meaning: 'New beginnings and manifestation. Your thoughts are becoming reality — stay focused on what you want, not what you fear.' },
  { number: '222', meaning: 'Balance and trust. Everything is aligning in divine timing. Keep the faith, even when you cannot see the full picture.' },
  { number: '333', meaning: 'The Ascended Masters are near. You are being guided and supported by powerful spiritual forces. Express yourself fully.' },
  { number: '444', meaning: 'Protection and foundation. Your angels are surrounding you. You are safe, grounded, and exactly where you need to be.' },
  { number: '555', meaning: 'Major transformation is underway. Buckle up — life is about to shift. Embrace the change instead of resisting it.' },
  { number: '777', meaning: 'Spiritual awakening and divine luck. You are on the right path. Keep going — miracles are forming around you.' },
  { number: '888', meaning: 'Abundance is flowing to you. Financial and spiritual prosperity are aligning. Receive with open hands.' },
  { number: '999', meaning: 'A chapter is closing. Release what no longer serves you with gratitude and make space for what is coming next.' },
];

export interface NumerologyCoreNumber {
  label: string;
  value: number;
  display: string;
  interpretation: string;
}

export interface NumerologyResult {
  life_path: NumerologyCoreNumber;
  expression: NumerologyCoreNumber;
  soul_urge: NumerologyCoreNumber;
  personality: NumerologyCoreNumber;
  birthday_number: NumerologyCoreNumber;
  personal_year: number;
  personal_year_display: string;
  personal_year_meaning: string;
  angel_numbers: { number: string; meaning: string }[];
}

function buildCoreNumber(label: string, raw: number, reduced: number): NumerologyCoreNumber {
  const info = NUMBER_MEANINGS[reduced];
  const display = formatNumber(raw, reduced);
  const masterNote = MASTER_NUMBERS.includes(reduced) ? ' This is a Master Number — it carries intensified spiritual significance and should never be reduced further.' : '';
  return {
    label,
    value: reduced,
    display,
    interpretation: info ? `${info.title}: ${info.personality}${masterNote}` : '',
  };
}

export function calculateNumerology(fullName: string, birthDate: string): NumerologyResult {
  const lp = lifePathFromDate(birthDate);
  const expr = letterSum(fullName);
  const soul = letterSum(fullName, 'vowels');
  const pers = letterSum(fullName, 'consonants');
  const bd = birthdayNumber(birthDate);
  const py = personalYear(birthDate);

  const shuffled = [...ANGEL_NUMBERS].sort(() => Math.random() - 0.5);

  return {
    life_path: buildCoreNumber('Life Path', lp.raw, lp.reduced),
    expression: buildCoreNumber('Expression', expr.raw, expr.reduced),
    soul_urge: buildCoreNumber('Soul Urge', soul.raw, soul.reduced),
    personality: buildCoreNumber('Personality', pers.raw, pers.reduced),
    birthday_number: buildCoreNumber('Birthday', bd.raw, bd.reduced),
    personal_year: py.reduced,
    personal_year_display: formatNumber(py.raw, py.reduced),
    personal_year_meaning: PERSONAL_YEAR_MEANINGS[py.reduced] || '',
    angel_numbers: shuffled.slice(0, 3),
  };
}

export function isMasterNumber(num: number): boolean {
  return MASTER_NUMBERS.includes(num);
}

// ─── Number Compatibility Insight ───────────────────────────────

const COMPATIBILITY_MATRIX: Record<string, string> = {
  '1-1': 'Two leaders — powerful but competitive. You both need to take turns driving.',
  '1-2': 'The initiator and the diplomat. A natural balance where one leads and the other harmonizes.',
  '1-3': 'Creative fire. You inspire each other and never run out of ideas or energy.',
  '1-4': 'Vision meets structure. One dreams it, the other builds it. Unstoppable when aligned.',
  '1-5': 'Adventure duo. You both crave freedom and push each other to take bold risks.',
  '1-6': 'The pioneer and the nurturer. One charges ahead, the other creates a home to return to.',
  '1-7': 'Independent spirits who respect each other\'s space. Deep connection without suffocation.',
  '1-8': 'A power couple. Ambitious, driven, and capable of building empires together.',
  '1-9': 'The leader and the humanitarian. You share a desire to make an impact on the world.',
  '2-2': 'Double sensitivity. Beautiful emotional depth, but you must learn to speak up, not just feel.',
  '2-3': 'Heart and voice. The 2 feels deeply, the 3 expresses freely. You complete each other.',
  '2-4': 'Steady and secure. A partnership built on trust, patience, and unwavering loyalty.',
  '2-5': 'Opposites attract. The 2 craves stability, the 5 craves change. Growth lives in the tension.',
  '2-6': 'Two hearts, one home. This is one of the most naturally harmonious combinations.',
  '2-7': 'Intuition squared. You understand each other without words, but must make space for conversation.',
  '2-8': 'The peacemaker and the powerhouse. A strong balance of soft and strong energy.',
  '2-9': 'Compassion meets wisdom. You both care deeply about others and lift each other spiritually.',
  '3-3': 'Double creative force. The energy is electric but you need someone grounded nearby.',
  '3-4': 'Creativity and discipline. The 3 paints the vision, the 4 frames it. Better together.',
  '3-5': 'Life of the party squared. Fun, magnetic, and always on the move. Just remember to slow down.',
  '3-6': 'The artist and the caretaker. Beautiful balance of expression and devotion.',
  '3-7': 'Surface meets depth. The 3 draws people in, the 7 explores what lies beneath.',
  '3-8': 'Charm and ambition. The 3 opens doors with charisma, the 8 closes deals with power.',
  '3-9': 'Two idealists. Creative, compassionate, and drawn to making the world more beautiful.',
  '4-4': 'Rock solid. Nobody works harder or builds more reliably. Just remember to play sometimes.',
  '4-5': 'Stability vs. freedom. Challenging but transformative if both sides stay flexible.',
  '4-6': 'The builder and the nurturer. A foundation so strong it can hold anything.',
  '4-7': 'Practical wisdom. The 4 builds the structure, the 7 fills it with meaning.',
  '4-8': 'Empire builders. Disciplined, strategic, and capable of lasting achievement.',
  '4-9': 'Structure meets surrender. The 4 holds on, the 9 lets go. Growth lives in the contrast.',
  '5-5': 'Pure freedom. Wild, unpredictable, and never boring. Grounding is your mutual challenge.',
  '5-6': 'The adventurer and the homemaker. Tension exists, but the chemistry is magnetic.',
  '5-7': 'Restless minds. Both seek truth through experience — you learn the most from each other.',
  '5-8': 'Risk meets reward. The 5 takes chances, the 8 turns them into gold.',
  '5-9': 'Two free spirits with big hearts. You give each other space and inspire each other to grow.',
  '6-6': 'All love, all the time. Beautiful devotion, but be careful not to lose yourselves in each other.',
  '6-7': 'Heart and mind. The 6 leads with love, the 7 with wisdom. A quietly powerful pairing.',
  '6-8': 'The nurturer and the achiever. A family-first duo with the resources to match.',
  '6-9': 'Compassion overload. You both give everything to others — just save some for each other.',
  '7-7': 'Two seekers walking the same inner path. Profound understanding, but come up for air together.',
  '7-8': 'Depth meets power. The 7 asks why, the 8 asks how much. Together, you find both answers.',
  '7-9': 'Spiritual connection. Two old souls who recognize each other across lifetimes.',
  '8-8': 'Double ambition. Unstoppable together, but power struggles are real. Stay on the same team.',
  '8-9': 'Achievement and release. The 8 builds wealth, the 9 teaches you what money can\'t buy.',
  '9-9': 'Two humanitarians. You share a mission bigger than yourselves. Legacy is your love language.',
};

function getCompatKey(a: number, b: number): string {
  const reduced = [a > 9 ? digitSum(a) : a, b > 9 ? digitSum(b) : b].sort((x, y) => x - y);
  return `${reduced[0]}-${reduced[1]}`;
}

export function getNumberCompatibility(result: NumerologyResult): string {
  const lp = result.life_path.value > 9 ? digitSum(result.life_path.value) : result.life_path.value;
  const expr = result.expression.value > 9 ? digitSum(result.expression.value) : result.expression.value;
  const key = [lp, expr].sort((a, b) => a - b).join('-');
  const base = COMPATIBILITY_MATRIX[key];

  const lpTitle = NUMBER_MEANINGS[result.life_path.value]?.title || '';
  const exprTitle = NUMBER_MEANINGS[result.expression.value]?.title || '';

  if (base) {
    return `Your Life Path (${result.life_path.display} — ${lpTitle}) and Expression (${result.expression.display} — ${exprTitle}) create a dynamic interplay: ${base}`;
  }
  return `Your Life Path ${result.life_path.display} (${lpTitle}) channels through your Expression ${result.expression.display} (${exprTitle}), blending your core purpose with your natural talents.`;
}

// ─── Lucky Numbers ──────────────────────────────────────────────

export function getLuckyNumbers(result: NumerologyResult): number[] {
  const core = [
    result.life_path.value,
    result.expression.value,
    result.soul_urge.value,
    result.personality.value,
    result.birthday_number.value,
  ];
  const base = core.map(n => n > 9 ? digitSum(n) : n);
  const set = new Set<number>();

  // The core numbers themselves
  base.forEach(n => set.add(n));
  // Sum of life path + expression
  const combo1 = pythagoreanReduce(base[0] + base[1]).reduced;
  set.add(combo1);
  // Sum of soul urge + personality
  const combo2 = pythagoreanReduce(base[2] + base[3]).reduced;
  set.add(combo2);
  // Double-digit derived numbers
  set.add(result.life_path.value <= 31 ? result.life_path.value : base[0]);
  set.add(result.birthday_number.value);

  const arr = Array.from(set).filter(n => n > 0).sort((a, b) => a - b);
  return arr.slice(0, 6);
}

// ─── Daily Universal Number ─────────────────────────────────────

export function getDailyNumber(): { number: number; display: string; meaning: string } {
  const today = new Date();
  const dateStr = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;
  const total = dateStr.split('').reduce((s, d) => s + parseInt(d), 0);
  const { raw, reduced } = pythagoreanReduce(total);
  const display = formatNumber(raw, reduced);

  const DAY_MEANINGS: Record<number, string> = {
    1: 'A day for new starts and bold action. Take the lead on something.',
    2: 'A day for cooperation and patience. Listen more than you speak.',
    3: 'A day for creativity and self-expression. Share your ideas.',
    4: 'A day for hard work and organization. Build something concrete.',
    5: 'A day for change and adventure. Break your routine.',
    6: 'A day for love, family, and responsibility. Nurture your relationships.',
    7: 'A day for reflection and inner work. Trust your intuition.',
    8: 'A day for ambition and financial focus. Make power moves.',
    9: 'A day for compassion and letting go. Release what no longer serves you.',
    11: 'A master day of spiritual insight. Pay attention to signs and synchronicities.',
    22: 'A master day of manifestation. Your visions can become reality today.',
    33: 'A master day of healing and service. Your presence alone can uplift others.',
  };

  return { number: reduced, display, meaning: DAY_MEANINGS[reduced] || '' };
}

export function getDailyPersonalInteraction(dailyNum: number, personalYear: number): string {
  if (dailyNum === personalYear) {
    return 'Today\'s energy perfectly aligns with your personal year — amplified power. Whatever your year is asking of you, today delivers it with extra force.';
  }
  const sum = pythagoreanReduce(dailyNum + personalYear).reduced;
  const sumTitle = NUMBER_MEANINGS[sum]?.title || '';
  return `Today's ${dailyNum} energy meets your Personal Year ${personalYear}, creating a combined vibration of ${sum}${sumTitle ? ` (${sumTitle})` : ''}. Use both energies — don't fight the contrast, blend it.`;
}

// ─── Partner Compatibility ──────────────────────────────────────

export interface CompatibilityResult {
  person1: NumerologyResult;
  person2: NumerologyResult;
  life_path_match: string;
  expression_match: string;
  soul_urge_match: string;
  overall: string;
  score: number;
}

const HARMONY_SCORES: Record<string, number> = {
  '1-1': 65, '1-2': 80, '1-3': 85, '1-4': 70, '1-5': 90, '1-6': 75, '1-7': 80, '1-8': 85, '1-9': 75,
  '2-2': 75, '2-3': 80, '2-4': 85, '2-5': 60, '2-6': 95, '2-7': 80, '2-8': 75, '2-9': 85,
  '3-3': 70, '3-4': 65, '3-5': 90, '3-6': 85, '3-7': 70, '3-8': 75, '3-9': 90,
  '4-4': 75, '4-5': 55, '4-6': 90, '4-7': 80, '4-8': 90, '4-9': 65,
  '5-5': 70, '5-6': 60, '5-7': 75, '5-8': 80, '5-9': 85,
  '6-6': 85, '6-7': 70, '6-8': 85, '6-9': 90,
  '7-7': 80, '7-8': 70, '7-9': 90,
  '8-8': 75, '8-9': 70,
  '9-9': 85,
};

export function calculateCompatibility(name1: string, date1: string, name2: string, date2: string): CompatibilityResult {
  const r1 = calculateNumerology(name1, date1);
  const r2 = calculateNumerology(name2, date2);

  const lpKey = getCompatKey(r1.life_path.value, r2.life_path.value);
  const exprKey = getCompatKey(r1.expression.value, r2.expression.value);
  const soulKey = getCompatKey(r1.soul_urge.value, r2.soul_urge.value);

  const lpMatch = COMPATIBILITY_MATRIX[lpKey] || 'Your life paths bring unique energies that complement each other in unexpected ways.';
  const exprMatch = COMPATIBILITY_MATRIX[exprKey] || 'Your expression numbers create an interesting dynamic of shared and contrasting talents.';
  const soulMatch = COMPATIBILITY_MATRIX[soulKey] || 'Your soul urges reveal a deep connection that operates beneath the surface.';

  const s1 = HARMONY_SCORES[lpKey] || 75;
  const s2 = HARMONY_SCORES[exprKey] || 75;
  const s3 = HARMONY_SCORES[soulKey] || 75;
  const score = Math.round((s1 * 0.45) + (s2 * 0.30) + (s3 * 0.25));

  let overall: string;
  if (score >= 90) overall = 'Extraordinary resonance. Your numbers sing in harmony — this connection is rare and powerful.';
  else if (score >= 80) overall = 'Strong compatibility. Your numbers support and enhance each other naturally. This is a connection worth investing in.';
  else if (score >= 70) overall = 'Good compatibility with growth potential. Some tension exists, but that tension is where the deepest growth happens.';
  else if (score >= 60) overall = 'Challenging but transformative. Your numbers push each other out of comfort zones — the relationship demands evolution from both of you.';
  else overall = 'A complex pairing that requires conscious effort. The differences are real, but so is the potential for profound mutual growth.';

  return { person1: r1, person2: r2, life_path_match: lpMatch, expression_match: exprMatch, soul_urge_match: soulMatch, overall, score };
}
