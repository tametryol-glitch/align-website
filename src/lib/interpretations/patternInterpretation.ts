/**
 * Pattern Interpretation — converts detected aspect patterns and chart shapes
 * into rich, personal, non-repetitive textual interpretations.
 */

import {
  type DetectedPattern, type DetectedChartShape, type InterpretedPattern,
  type PatternMember, type AspectPatternType, type ChartShapeType,
  SIGN_ELEMENTS, SIGN_MODALITIES,
} from './patternTypes';

/* -- planet / sign / house helpers ----------------------------------- */

/** Noun phrases that read naturally after "which is" or as a sentence subject. */
function planetFunction(name: string): string {
  const map: Record<string, string> = {
    Sun: 'how you show up and what you refuse to stop being',
    Moon: 'what you need to feel safe and how you react before you think',
    Mercury: 'how you talk, think and argue',
    Venus: 'who and what you love, and what you spend on it',
    Mars: 'how you go after what you want and how you fight',
    Jupiter: 'where you take big bets and expect things to work out',
    Saturn: 'where you work hardest and trust yourself least',
    Uranus: 'where you break routine and cut off anyone who boxes you in',
    Neptune: 'where you daydream, idealise and lose track of the facts',
    Pluto: 'where you refuse to stay the same and fight for control',
    Chiron: 'the old hurt you keep tending and end up helping other people with',
    Juno: 'what you demand from a partner and what you will actually commit to',
    Vesta: 'what you protect and give your devotion to',
    Pallas: 'how you size up a problem and spot the pattern in it',
    Ceres: 'how you look after people and how you let them go',
    'North Node': 'the direction life keeps pushing you',
    'South Node': 'the habits you fall back on when you are tired',
    Vertex: 'the people and moments that arrive and change your direction',
    Lilith: 'the part of you that refuses to be polite about it',
  };
  return map[name] || 'the part of your life that ' + name.toLowerCase() + ' touches';
}

/** Gerund phrases that read naturally after "good at", "habit of" or "practise". */
function signTone(sign: string): string {
  const map: Record<string, string> = {
    Aries: 'going first without waiting for permission',
    Taurus: 'slowing down and trusting what you can touch',
    Gemini: 'asking questions and changing your mind',
    Cancer: 'looking after your own',
    Leo: 'being seen and making things with flair',
    Virgo: 'catching the detail everyone else missed',
    Libra: 'keeping the peace and weighing both sides',
    Scorpio: 'digging until you hit the truth',
    Sagittarius: 'chasing the big picture and the next horizon',
    Capricorn: 'building slowly toward a result',
    Aquarius: 'standing apart and thinking for the group',
    Pisces: 'sensing what nobody said out loud',
  };
  return map[sign] || sign.toLowerCase();
}

/** Noun phrases that read naturally after "when it comes to" or "around". */
function houseStory(house: number): string {
  const map: Record<number, string> = {
    1: 'how you come across',
    2: 'money and what you think you are worth',
    3: 'talking, siblings and everyday learning',
    4: 'home and family',
    5: 'romance, play and making things',
    6: 'work routines and your health',
    7: 'close partnerships',
    8: 'shared money, sex and what you hide',
    9: 'travel, study and what you believe',
    10: 'career and reputation',
    11: 'friends and the groups you belong to',
    12: 'what you do alone and what you never say',
  };
  return map[house] || 'daily life';
}

/** Noun phrases that read naturally after "what comes easy to you is". */
function elementNature(sign: string): string {
  const el = SIGN_ELEMENTS[sign];
  if (el === 'Fire') return 'starting things and acting on a hunch';
  if (el === 'Earth') return 'getting practical results and turning effort into money';
  if (el === 'Air') return 'talking, connecting and spotting ideas fast';
  if (el === 'Water') return 'reading people and feeling the room before anyone speaks';
  return 'a mix of things that other people have to work at';
}

function modalityDrive(sign: string): string {
  const m = SIGN_MODALITIES[sign];
  if (m === 'Cardinal') return 'starting things';
  if (m === 'Fixed') return 'sticking with things long after others quit';
  if (m === 'Mutable') return 'adjusting on the fly';
  return 'getting on with it';
}

function memberLabel(m: PatternMember): string {
  return m.name + ' in ' + m.sign + ' (house ' + m.house + ')';
}

function memberNames(members: PatternMember[]): string[] {
  return members.map(m => m.name);
}

function ordinalHouse(h: number): string {
  const suf = ['th','st','nd','rd'];
  const v = h % 100;
  return h + (suf[(v - 20) % 10] || suf[v] || suf[0]) + ' house';
}

function focalDescription(focal: PatternMember | undefined): string {
  if (!focal) return '';
  return focal.name + ' in ' + focal.sign + ' (' + ordinalHouse(focal.house) + ')';
}

/* -- Aspect Pattern interpreters ------------------------------------- */

function interpretGrandTrine(p: DetectedPattern): InterpretedPattern {
  const el = SIGN_ELEMENTS[p.members[0]?.sign] || 'mixed';
  const names = memberNames(p.members);
  const bodyList = p.members.map(m => memberLabel(m)).join(', ');
  return {
    type: p.type, title: el + ' Grand Trine',
    involvedBodies: names,
    geometrySummary: 'Three planets in ' + el.toLowerCase() + ' signs form a flowing triangle: ' + bodyList + '.',
    interpretation: 'What comes easy to you is ' + elementNature(p.members[0]?.sign) + '. Your ' + p.members[0]?.name + ' is good at ' + signTone(p.members[0]?.sign) + ', your ' + p.members[1]?.name + ' at ' + signTone(p.members[1]?.sign) + ' and your ' + p.members[2]?.name + ' at ' + signTone(p.members[2]?.sign) + ', and each one hands the next a head start. Because it never costs you effort, you tend to undervalue it.',
    lifeManifest: 'When it comes to ' + houseStory(p.members[0]?.house) + ', ' + houseStory(p.members[1]?.house) + ' and ' + houseStory(p.members[2]?.house) + ', things fall into place for you before other people have finished trying. Friends watch you do in an afternoon what took them a month and ask how.',
    growthLesson: 'The trap is that nothing here ever hurts, so you stop pushing. You coast, get passed by people with half your talent who practised, and only notice when the gap is wide. Pick one thing you do easily and make it hard on purpose.',
    category: 'major-pattern', score: p.score,
  };
}

function interpretKite(p: DetectedPattern): InterpretedPattern {
  const apex = p.members.find(m => m.role === 'apex') || p.focalPoint;
  const names = memberNames(p.members);
  const an = apex?.name || 'the apex planet';
  return {
    type: p.type, title: 'Kite — Directed Grand Trine',
    involvedBodies: names,
    geometrySummary: 'A Grand Trine with ' + focalDescription(apex) + ' as the apex, forming sextiles to two trine members.',
    interpretation: 'Your easy talent has a job to do. ' + an + ' sits opposite part of that talent, and the pull between them stops you from sitting on the gift. ' + (apex ? 'Everything runs through ' + apex.name + ', which is ' + planetFunction(apex.name) + '.' : ''),
    lifeManifest: 'You do not just have the knack, you get restless until you use it. Most of that restlessness lands in ' + houseStory(apex?.house || 1) + ', and that is where people see you at your best.',
    growthLesson: 'If ' + an + ' gets neglected, the whole set-up stalls. When you feel bored or stuck, look at how you have been treating ' + an + ' before you blame anything else.',
    focalLabel: apex ? 'Apex: ' + focalDescription(apex) : undefined,
    category: 'major-pattern', score: p.score,
  };
}

function interpretTSquare(p: DetectedPattern): InterpretedPattern {
  const apex = p.members.find(m => m.role === 'apex') || p.focalPoint;
  const names = memberNames(p.members);
  const mod = apex ? SIGN_MODALITIES[apex.sign] : 'dynamic';
  return {
    type: p.type, title: mod + ' T-Square',
    involvedBodies: names,
    geometrySummary: 'Two planets in opposition both square ' + focalDescription(apex) + ', creating a triangle of tension.',
    interpretation: 'Two parts of you pull in opposite directions and neither backs down, so the pressure lands on ' + (apex?.name || 'one point') + '. ' + (apex ? 'That is ' + planetFunction(apex.name) + ', and it is why you are always pushed to act, fix or finish something.' : '') + ' It is uncomfortable, and it is also why you get so much done.',
    lifeManifest: 'You are never fully settled around ' + houseStory(apex?.house || 1) + '. The same problem comes back in new clothes until you handle it, and you end up good at it because you had to be.',
    growthLesson: 'The way out is the side of the chart that sits empty. Practise ' + (p.missingLeg ? signTone(p.missingLeg.sign) : 'the opposite of your usual move') + ' and the pressure drops, because it finally has somewhere to go.',
    focalLabel: apex ? 'Apex: ' + focalDescription(apex) : undefined,
    category: 'major-pattern', score: p.score,
  };
}

function interpretGrandCross(p: DetectedPattern): InterpretedPattern {
  const names = memberNames(p.members);
  const mod = SIGN_MODALITIES[p.members[0]?.sign] || 'dynamic';
  return {
    type: p.type, title: mod + ' Grand Cross',
    involvedBodies: names,
    geometrySummary: 'Four planets form two oppositions that cross each other with four squares: ' + names.join(', ') + '.',
    interpretation: 'You are pulled four ways at once and every choice costs you something. ' + names.join(', ') + ' each want a different thing, so you rarely get a day when all four are satisfied. The upside is that you get tested constantly, and you almost never fold.',
    lifeManifest: 'Across ' + p.members.map(m => houseStory(m.house)).join(', ') + ', the demands clash. The job wants one thing, the family another, and you end up the person who holds it all together. That much practice makes you hard to rattle.',
    growthLesson: 'Stop waiting for the tension to end. Give each of the four a set slot in your week and you stop feeling like you are failing all of them at once.',
    category: 'major-pattern', score: p.score,
  };
}

function interpretYod(p: DetectedPattern): InterpretedPattern {
  const apex = p.members.find(m => m.role === 'apex') || p.focalPoint;
  const names = memberNames(p.members);
  return {
    type: p.type, title: 'Yod — Finger of God',
    involvedBodies: names,
    geometrySummary: 'Two planets sextile each other and both quincunx ' + focalDescription(apex) + ', forming a narrow triangle.',
    interpretation: 'You carry a sense that you are meant for something specific and that you are slightly off course. ' + (apex ? apex.name + ' is where the nag sits, and it concerns ' + planetFunction(apex.name) + '.' : '') + ' You adjust, tweak and rearrange, and it never quite clicks until something forces your hand.',
    lifeManifest: 'Odd events keep nudging you toward ' + houseStory(apex?.house || 1) + ': a job that ends, a stranger who says the right thing, a move you did not plan. Looking back, every one of them pushed you the same way.',
    growthLesson: 'Stop waiting for the plan to make sense first. The thing you keep being pushed toward is usually the thing to start before you feel ready.',
    focalLabel: apex ? 'Apex: ' + focalDescription(apex) : undefined,
    category: 'major-pattern', score: p.score,
  };
}

function interpretBoomerangYod(p: DetectedPattern): InterpretedPattern {
  const apex = p.members.find(m => m.role === 'apex') || p.focalPoint;
  const release = p.members.find(m => m.role === 'release');
  const names = memberNames(p.members);
  return {
    type: p.type, title: 'Boomerang Yod',
    involvedBodies: names,
    geometrySummary: 'A Yod with ' + focalDescription(apex) + ' at the apex, plus ' + (release ? memberLabel(release) : 'a release point') + ' opposite the apex.',
    interpretation: 'You get the nagging sense of being slightly off course, but you also have somewhere to put it. ' + (release ? release.name + ' sits opposite the apex and takes the strain back, and it concerns ' + planetFunction(release.name) + '. When the nag gets loud, go there first.' : 'The point opposite the apex takes the strain back. When the nag gets loud, go there first.'),
    lifeManifest: 'When something knocks you off course, you recover faster than most because you have a place to put the pressure, and that place is ' + houseStory(release?.house || 1) + '. It makes the direction you keep being pushed in easier to follow.',
    growthLesson: 'Use both ends. Act through the apex, then hand the leftover energy to the release point, and you stop swinging between pushing hard and burning out.',
    focalLabel: apex ? 'Apex: ' + focalDescription(apex) + (release ? ' | Release: ' + focalDescription(release) : '') : undefined,
    category: 'major-pattern', score: p.score,
  };
}

function interpretMysticRectangle(p: DetectedPattern): InterpretedPattern {
  const names = memberNames(p.members);
  return {
    type: p.type, title: 'Mystic Rectangle',
    involvedBodies: names,
    geometrySummary: 'Four planets connected by two oppositions, two trines, and two sextiles: ' + names.join(', ') + '.',
    interpretation: 'You hold two opposing views at once and make them work together. ' + names.join(' and ') + ' keep each other in check, so you can listen to both sides of a row and steer it somewhere calm. People bring you their arguments for exactly that reason.',
    lifeManifest: 'Around ' + p.members.map(m => houseStory(m.house)).join(', ') + ', things connect. What you learn in one place helps in another, and you can see where each person is coming from.',
    growthLesson: 'The cost is that you keep the peace for years instead of saying what you want. Decide something, say it, and let it disappoint someone.',
    category: 'major-pattern', score: p.score,
  };
}

function interpretMinorGrandTrine(p: DetectedPattern): InterpretedPattern {
  const names = memberNames(p.members);
  return {
    type: p.type, title: 'Minor Grand Trine',
    involvedBodies: names,
    geometrySummary: 'A trine between two planets, both sextile a third: ' + names.join(', ') + '.',
    interpretation: names[0] + ' and ' + names[1] + ' work together without effort, and ' + (names[2] || 'the third planet') + ' gives that ease somewhere to go. It is a small area where you are better than you think.',
    lifeManifest: 'Chances turn up around ' + houseStory(p.members[2]?.house || 1) + ' if you say yes to them. They will not chase you.',
    growthLesson: 'Unlike a full Grand Trine, nothing here happens on its own. You have to send the message or show up, or it stays a talent nobody sees.',
    category: 'secondary-pattern', score: p.score,
  };
}

function interpretStellium(p: DetectedPattern): InterpretedPattern {
  const names = memberNames(p.members);
  const sign = p.members[0]?.sign || 'unknown';
  const house = p.members[0]?.house || 1;
  return {
    type: p.type, title: names.length + '-Planet Stellium in ' + sign,
    involvedBodies: names,
    geometrySummary: names.length + ' planets clustered in ' + sign + ' (' + ordinalHouse(house) + '): ' + names.join(', ') + '.',
    interpretation: names.length + ' planets in ' + sign + ' means one side of you runs the show. Your life keeps coming back to ' + signTone(sign) + ', whatever the subject, because ' + names.join(', ') + ' all pull the same way. People know you for it, and you get tired of being known only for it.',
    lifeManifest: 'Your ' + ordinalHouse(house) + ' is where it piles up: ' + houseStory(house) + '. Big events, obsessions and arguments gather there, and the rest of your life gets less of you than it deserves.',
    growthLesson: 'You are strong where ' + sign + ' is strong and blind everywhere else. Ask one person who is nothing like that what you keep missing, and listen to the answer.',
    category: 'major-pattern', score: p.score,
  };
}

/* -- Chart Shape interpreters ---------------------------------------- */

function interpretBowl(shape: DetectedChartShape): InterpretedPattern {
  const lead = shape.leadingPlanet;
  return {
    type: shape.type, title: 'Bowl Chart Shape',
    involvedBodies: lead ? [lead.name] : [],
    geometrySummary: shape.description,
    interpretation: 'Your planets sit on one side of the chart, so you carry your life like something you are holding. You know what you are about, and the empty half is where you rely on other people to show you what you lack.' + (lead ? ' ' + lead.name + ' goes first, so ' + planetFunction(lead.name) + ' is the first thing people meet.' : ''),
    lifeManifest: 'You are self-reliant and do things your own way. The people closest to you tend to have exactly the traits you lack, which is why they annoy you and why you keep them.',
    growthLesson: 'Go looking for what you do not already have. Take the invitation you would normally decline.',
    focalLabel: lead ? 'Leading planet: ' + focalDescription(lead) : undefined,
    category: 'chart-shape', score: shape.confidence,
  };
}

function interpretBucket(shape: DetectedChartShape): InterpretedPattern {
  const handle = shape.handlePlanet;
  return {
    type: shape.type, title: 'Bucket Chart Shape',
    involvedBodies: handle ? [handle.name] : [],
    geometrySummary: shape.description,
    interpretation: 'Most of your chart is a bowl and one planet sits alone outside it, so everything you hold inside comes out through that one door.' + (handle ? ' ' + handle.name + ' is the door, and it concerns ' + planetFunction(handle.name) + '.' : '') + ' When it works, you are focused. When it is blocked, you feel it everywhere.',
    lifeManifest: (handle ? 'Your energy runs through ' + houseStory(handle.house) + '. ' : '') + 'People know you for that one thing and miss how much more is going on behind it.',
    growthLesson: 'Look after that one planet. Give it a regular outlet, because if it clogs, everything else backs up behind it.',
    focalLabel: handle ? 'Handle: ' + focalDescription(handle) : undefined,
    category: 'chart-shape', score: shape.confidence,
  };
}

function interpretBundle(shape: DetectedChartShape): InterpretedPattern {
  return {
    type: shape.type, title: 'Bundle Chart Shape',
    involvedBodies: [],
    geometrySummary: shape.description,
    interpretation: 'Your planets are packed into one corner of the chart, so you go deep on a few things and ignore the rest. You know exactly what you care about, and people who flit between ten hobbies baffle you.',
    lifeManifest: 'Your life revolves around a handful of subjects. You get bored at parties where nobody talks about them, and you come across as narrow to people who do not share them.',
    growthLesson: 'Eight of the twelve signs are empty in your chart. Spend time with people whose lives look nothing like yours; they will show you what you would otherwise walk straight past.',
    category: 'chart-shape', score: shape.confidence,
  };
}

function interpretLocomotive(shape: DetectedChartShape): InterpretedPattern {
  const lead = shape.leadingPlanet;
  return {
    type: shape.type, title: 'Locomotive Chart Shape',
    involvedBodies: lead ? [lead.name] : [],
    geometrySummary: shape.description,
    interpretation: 'Your planets cover most of the chart with one big empty stretch, so you always feel a step short of something. That gap is what keeps you moving.' + (lead ? ' ' + lead.name + ' goes first, so ' + planetFunction(lead.name) + ' is what pulls the rest along.' : ''),
    lifeManifest: 'You start early and finish late. Just as you hit one goal you are scanning for the next, and resting feels like falling behind.',
    growthLesson: 'Work out what the empty stretch says you are chasing. Once you can name it, you get to choose it instead of being dragged after it.',
    focalLabel: lead ? 'Leading planet: ' + focalDescription(lead) : undefined,
    category: 'chart-shape', score: shape.confidence,
  };
}

function interpretSeesaw(shape: DetectedChartShape): InterpretedPattern {
  return {
    type: shape.type, title: 'Seesaw Chart Shape',
    involvedBodies: [],
    geometrySummary: shape.description,
    interpretation: 'Your planets form two camps on opposite sides of the chart, and you spend your life swinging between them. You want the quiet life and the big one, the partner and the freedom, and whichever you have, you miss the other.',
    lifeManifest: 'Big decisions take you forever because you can see the case for both sides and mean it. That makes you the friend people call to settle a fight.',
    growthLesson: 'Stop trying to pick a winner. Set aside time for each side on purpose, and the swinging gets smaller.',
    category: 'chart-shape', score: shape.confidence,
  };
}

function interpretSplash(shape: DetectedChartShape): InterpretedPattern {
  return {
    type: shape.type, title: 'Splash Chart Shape',
    involvedBodies: [],
    geometrySummary: shape.description,
    interpretation: 'Your planets are spread through nearly the whole chart, so you have a foot in everything. You can talk to anyone about almost anything, and you pick up new interests about as fast as you drop them.',
    lifeManifest: 'You have had more jobs, hobbies and friend groups than most people you know, and you hate being asked what you do in one word.',
    growthLesson: 'Choose two or three things and stay with them until they get boring. What waits on the other side of boring is what the people who stuck with it have and you do not.',
    category: 'chart-shape', score: shape.confidence,
  };
}

function interpretSplay(shape: DetectedChartShape): InterpretedPattern {
  return {
    type: shape.type, title: 'Splay Chart Shape',
    involvedBodies: [],
    geometrySummary: shape.description,
    interpretation: 'Your planets gather in several separate clusters that do not line up, so the parts of you do not fit one story. You have strong interests that look unrelated, and you are the only one who sees the thread between them.',
    lifeManifest: 'People cannot place you. You might have a day job, a creative obsession and a spiritual practice that have nothing to do with each other, and each one gets a different version of you.',
    growthLesson: 'Stop explaining yourself to fit other people\'s boxes. The odd links between your interests are where your best ideas come from.',
    category: 'chart-shape', score: shape.confidence,
  };
}

function interpretFan(shape: DetectedChartShape): InterpretedPattern {
  const handle = shape.handlePlanet;
  return {
    type: shape.type, title: 'Fan Chart Shape',
    involvedBodies: handle ? [handle.name] : [],
    geometrySummary: shape.description,
    interpretation: 'Your planets crowd together and one sits far off by itself as the only way out, so all that stored energy goes through a single gate.' + (handle ? ' ' + handle.name + ' is that gate, it concerns ' + planetFunction(handle.name) + ', and it runs your life more than you admit.' : ''),
    lifeManifest: (handle ? 'Nearly everything funnels into ' + houseStory(handle.house) + '. ' : '') + 'You focus harder than most people can, and you pay for it when that one thing goes wrong.',
    growthLesson: 'It is easy to make that one thing your whole identity. Build in a rest day and one interest outside it, so a bad month there does not take you down with it.',
    focalLabel: handle ? 'Handle: ' + focalDescription(handle) : undefined,
    category: 'chart-shape', score: shape.confidence,
  };
}

/* -- Main entry point ------------------------------------------------ */

const ASPECT_INTERPRETERS: Record<AspectPatternType, (p: DetectedPattern) => InterpretedPattern> = {
  'Grand Trine': interpretGrandTrine,
  'Kite': interpretKite,
  'T-Square': interpretTSquare,
  'Grand Cross': interpretGrandCross,
  'Yod': interpretYod,
  'Boomerang Yod': interpretBoomerangYod,
  'Mystic Rectangle': interpretMysticRectangle,
  'Minor Grand Trine': interpretMinorGrandTrine,
  'Stellium': interpretStellium,
};

const SHAPE_INTERPRETERS: Record<ChartShapeType, (s: DetectedChartShape) => InterpretedPattern> = {
  'Bowl': interpretBowl,
  'Bucket': interpretBucket,
  'Bundle': interpretBundle,
  'Locomotive': interpretLocomotive,
  'Seesaw': interpretSeesaw,
  'Splash': interpretSplash,
  'Splay': interpretSplay,
  'Fan': interpretFan,
};

export function interpretPatterns(
  patterns: DetectedPattern[],
  shape: DetectedChartShape | null,
): InterpretedPattern[] {
  const results: InterpretedPattern[] = [];

  // Chart shape first (if detected)
  if (shape && SHAPE_INTERPRETERS[shape.type]) {
    results.push(SHAPE_INTERPRETERS[shape.type](shape));
  }

  // Aspect patterns sorted by score
  const sorted = [...patterns].sort((a, b) => b.score - a.score);
  for (const p of sorted) {
    const fn = ASPECT_INTERPRETERS[p.type];
    if (fn) results.push(fn(p));
  }

  return results;
}
