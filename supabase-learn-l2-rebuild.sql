-- Level 2 — Synthesis & the Moving Sky, rebuilt to the Learn Loop standard.
--
-- Replaces seven stub lessons whose bodies were placeholder text. Five
-- dual-coded slides against a live visual, six retrieval questions whose
-- explanations say why the other answers are weaker.
--
-- Astrology follows the Align rulership throughout (Virgo=Vesta, Libra=Juno,
-- Scorpio=Pluto, Aquarius=Uranus, Pisces=Neptune). Exaltations named in the
-- dignity lesson are the traditional ones for the classical planets and are
-- taught as a dignity separate from rulership.
--
-- Generated from validated data, not hand-written SQL. Safe to re-run.

UPDATE public.learn_lessons SET
  duration_minutes = 7,
  objectives = ARRAY['Count your chart by element and mode and read what is missing','Name your chart shape and what it says about your focus','Spot a stellium and know what it concentrates'],
  key_terms  = ARRAY['stellium'],
  slides = $json$[
  {
    "title": "Count before you interpret",
    "visual": "element_grid",
    "content": "Before you read a single placement, count. How many planets in each element, how many in each mode. The tally tells you what this person runs on and, more usefully, what they have to go outside themselves to get."
  },
  {
    "title": "The empty element talks loudest",
    "visual": "element_grid",
    "content": "Four planets in fire says drive. Zero in earth says that drive rarely lands as a finished thing. An element you lack is not a flaw. It is what you will keep seeking in partners, jobs and habits, without ever naming it."
  },
  {
    "title": "Mode tells you the timing",
    "visual": "zodiac_wheel",
    "content": "Cardinal-heavy charts start. Fixed-heavy charts hold, long past the point of usefulness. Mutable-heavy charts adapt and hand over. If someone starts everything and finishes nothing, count their cardinal against their fixed before you say another word."
  },
  {
    "title": "Shape is where the planets sit",
    "visual": "zodiac_wheel",
    "content": "Bundle: everything inside a third of the wheel, a life with one obsession. Bowl: half the wheel, a person who feels a missing side. Locomotive: two thirds with one open gap, driven. Splash: scattered, many interests, thin focus."
  },
  {
    "title": "A stellium is the loudest thing in the room",
    "visual": "house_circle",
    "content": "Three or more planets in one whole sign is a stellium, and in Whole Sign that is one house. That house becomes the chart centre of gravity: the area of life that gets the most energy, the most repetition, and usually the most trouble."
  }
]$json$::jsonb,
  quiz   = $json$[
  {
    "q": "A chart has six planets in cardinal signs and one in fixed. What is the likeliest complaint from people around them?",
    "choices": [
      "They start things constantly and rarely see them through",
      "They refuse to change their mind about anything",
      "They cannot form an opinion"
    ],
    "answer": 0,
    "explain": "Cardinal initiates, and with almost no fixed there is nothing built to hold a project once the excitement passes. Refusing to change is a fixed-heavy signature and indecision is closer to mutable-heavy, so the mode they lack is what predicts the complaint."
  },
  {
    "q": "Which of these is a stellium?",
    "choices": [
      "Four planets in Gemini",
      "Four planets in fire signs spread across three houses",
      "The Sun and Moon together in one sign"
    ],
    "answer": 0,
    "explain": "A stellium is three or more planets in a single whole sign, which in Whole Sign means one house carrying all of them. Planets scattered across three fire signs share an element but concentrate no house, and two bodies together is a conjunction."
  },
  {
    "q": "A chart has no water placements at all. What does this lesson suggest?",
    "choices": [
      "They will keep seeking the emotional depth they do not generate themselves",
      "They do not have emotions",
      "Their water houses will be empty"
    ],
    "answer": 0,
    "explain": "A missing element is a function you go outside yourself to get, in partners and work and habits, rather than a function you lack. Everyone has emotions, and element balance counts planets by sign rather than describing which houses happen to be tenanted."
  },
  {
    "q": "Every planet in a chart falls within four consecutive signs. What shape is that?",
    "choices": [
      "A bundle, a life concentrated on a narrow band of concerns",
      "A splash, with interests spread everywhere",
      "A bowl, filling half the wheel"
    ],
    "answer": 0,
    "explain": "Four signs is a hundred and twenty degrees, a third of the wheel, which is the bundle. A splash is the opposite, planets scattered around the whole circle, and a bowl fills roughly half and leaves an empty half the person feels as something missing."
  },
  {
    "q": "Why does counting come before interpreting?",
    "choices": [
      "The tally is the frame every placement you read afterwards sits inside",
      "Element counts are more reliable than placements",
      "It is faster than reading placements"
    ],
    "answer": 0,
    "explain": "Balance is context: the same Mars reads differently in a fire-heavy chart than in one with a single fire placement. Counting is not more reliable than reading a placement and it is not a shortcut, it is what makes the placements legible."
  },
  {
    "q": "A stellium falls in the 8th house. What follows?",
    "choices": [
      "Depth, shared resources and endings get the most energy and the most repetition",
      "The person will be wealthy",
      "The ruler of the 8th is automatically strong"
    ],
    "answer": 0,
    "explain": "A stellium marks where a chart concentrates rather than what it guarantees, so 8th house themes recur and demand attention. Wealth is a prediction the placement does not support, and the house ruler condition is a separate question decided by its own sign."
  }
]$json$::jsonb
WHERE id = 'l2-1-chart-shape';

UPDATE public.learn_lessons SET
  duration_minutes = 8,
  objectives = ARRAY['Judge a planet by domicile and detriment in the Align system','Follow a dispositor chain to where it ends','Say what a final dispositor runs in a life'],
  key_terms  = ARRAY['domicile','detriment','exaltation','fall','ruler'],
  slides = $json$[
  {
    "title": "A planet has a condition, not just a position",
    "visual": "planet_row",
    "content": "Knowing Mars is in Cancer is half a reading. The other half is how well Mars can operate there. Dignity is that judgement: how much of itself a planet is able to be in the sign it happened to land in."
  },
  {
    "title": "Domicile and detriment, the Align way",
    "visual": "planet_row",
    "content": "A planet in the sign it rules is in domicile and works at full strength. In the opposite sign it is in detriment and works against the grain. Juno in Libra is at home. Juno in Aries is uphill the whole way."
  },
  {
    "title": "Exaltation and fall are a separate axis",
    "visual": "planet_row",
    "content": "Exaltation is a sign where a planet is honoured as an esteemed guest rather than as owner: the Sun in Aries, the Moon in Taurus, Saturn in Libra. The sign opposite is its fall. A planet can be exalted somewhere it does not rule."
  },
  {
    "title": "Every planet reports to someone",
    "visual": "house_circle",
    "content": "Take any planet. Find its sign. Find that sign Align ruler. That ruler is its dispositor. Now do the same for the dispositor, and again. The chain always ends somewhere, and where it ends is the point of the exercise."
  },
  {
    "title": "Where the chain stops is what runs the chart",
    "visual": "planet_row",
    "content": "A chain ends when a planet sits in its own sign, or when two planets each occupy a sign the other rules and close into a loop. That final dispositor is the decision-maker: what its house wants, the whole chart tends to serve."
  }
]$json$::jsonb,
  quiz   = $json$[
  {
    "q": "Vesta is in Pisces. What is its condition?",
    "choices": [
      "Detriment, because Pisces is opposite Virgo, the sign Vesta rules",
      "Domicile, because Pisces suits devotion",
      "Exaltation"
    ],
    "answer": 0,
    "explain": "Detriment is always the sign opposite a planet domicile, and Virgo opposes Pisces. The pull toward calling it strong comes from Pisces reading as devotional, but dignity is decided by geometry rather than by theme."
  },
  {
    "q": "Mars is in Aries and every chain in the chart runs into Mars. What is Mars here?",
    "choices": [
      "The final dispositor, the planet the whole chart answers to",
      "In detriment",
      "The chart ruler by definition"
    ],
    "answer": 0,
    "explain": "A chain stops at a planet in its own sign, and Aries is the domicile of Mars, so nothing disposes it further. Mars in Aries is the opposite of detriment, and the chart ruler is whichever planet rules the rising sign, which is a different question entirely."
  },
  {
    "q": "Your Moon is in Libra. Who is its dispositor in the Align system?",
    "choices": [
      "Juno",
      "Venus",
      "The Moon disposes itself"
    ],
    "answer": 0,
    "explain": "The Align ruler of Libra is Juno, so a Moon in Libra reports to Juno. Venus is the conventional answer and in Align keeps Taurus alone, and a planet only disposes itself when it occupies a sign it rules."
  },
  {
    "q": "Two planets each sit in a sign the other rules. What happens to the chain?",
    "choices": [
      "It closes into a loop, and that pair holds the final authority together",
      "The chain breaks and cannot be read",
      "One of the two must be discarded"
    ],
    "answer": 0,
    "explain": "Mutual reception closes the chain because each disposes the other, so it ends there with two planets sharing the role instead of one. Nothing breaks and nothing is discarded: a loop is a valid ending, just a shared one."
  },
  {
    "q": "What does a planet in detriment actually mean in a life?",
    "choices": [
      "The function still runs, against the grain, and costs more effort to express",
      "The function is absent",
      "The planet does nothing until it is transited"
    ],
    "answer": 0,
    "explain": "Detriment describes difficulty rather than deletion, so the planet works without the natural support of its own sign. Treating it as absent throws away everything the placement does, and transits change timing rather than whether a natal placement functions."
  },
  {
    "q": "Why is a dispositor chain cleaner in Whole Sign than in a degree-based system?",
    "choices": [
      "Every house holds one sign, so there is one unambiguous ruler at each step",
      "Whole Sign uses fewer planets",
      "Chains are always shorter in Whole Sign"
    ],
    "answer": 0,
    "explain": "One sign per house means one ruler and one direction to follow at every step of the chain. In a degree-based system a house can straddle two signs and two rulers, so the chain forks and you have to choose. Planet count and chain length are unaffected."
  }
]$json$::jsonb
WHERE id = 'l2-2-dignity-dispositors';

UPDATE public.learn_lessons SET
  duration_minutes = 7,
  objectives = ARRAY['Recognise the five major aspect patterns on sight','Name the engine and the release point of a pattern','Find a pattern in your own chart and say what it demands'],
  key_terms  = ARRAY['aspect','orb'],
  slides = $json$[
  {
    "title": "Patterns are aspects that gang up",
    "visual": "zodiac_wheel",
    "content": "One square is a friction. Three planets locked into two squares and an opposition is a structure, something that repeats in a life whether you engage with it or not. Patterns are where a chart stops being a list of placements."
  },
  {
    "title": "T-square: the most common engine",
    "visual": "zodiac_wheel",
    "content": "Two planets in opposition, both square a third. That third planet is the apex and it absorbs the pressure of both. The empty sign opposite the apex is the release: the thing nothing pushes you toward, which is why you must go there deliberately."
  },
  {
    "title": "Grand trine: talent that costs nothing",
    "visual": "zodiac_wheel",
    "content": "Three planets, each a hundred and twenty degrees apart, usually sharing one element. It flows so easily that nothing ever forces you to develop it. A grand trine with no hard aspect touching it is the most wasted configuration in a chart."
  },
  {
    "title": "Grand cross and yod",
    "visual": "zodiac_wheel",
    "content": "A grand cross is two T-squares sharing an axis: four planets, maximum load, no easy exit. A yod is two quincunxes, the awkward hundred and fifty degree aspect, converging on one apex, producing an insistent pressure toward one specific adjustment."
  },
  {
    "title": "Find yours and read the apex",
    "visual": "planet_row",
    "content": "Look for the apex planet first, because that is where a pattern discharges and where you actually feel it. Read the apex by sign and by house, then look at the empty point opposite. That empty point is the instruction."
  }
]$json$::jsonb,
  quiz   = $json$[
  {
    "q": "You find an opposition, and both ends square a third planet. What is it, and where does the pressure land?",
    "choices": [
      "A T-square, and the pressure lands on the apex squared by both",
      "A grand trine, with pressure spread evenly",
      "A yod, with the pressure on the opposition"
    ],
    "answer": 0,
    "explain": "That configuration is the definition of a T-square, and the apex carries the load of both squares at once. A grand trine is built from trines with no squares in it, and a yod is built from quincunxes rather than an opposition."
  },
  {
    "q": "Why does this lesson call a grand trine potentially wasted?",
    "choices": [
      "It flows so easily that nothing forces the person to develop it",
      "Trines are weak aspects",
      "Grand trines only activate later in life"
    ],
    "answer": 0,
    "explain": "Ease removes the pressure that turns raw capacity into a practised skill, so the talent often sits unused for decades. Trines are not weak, they are the most flowing major aspect, and nothing about the configuration waits for a particular age."
  },
  {
    "q": "Where is the release point of a T-square?",
    "choices": [
      "The empty sign opposite the apex",
      "The apex planet itself",
      "Whichever planet is closest to exact"
    ],
    "answer": 0,
    "explain": "The apex is where the pressure lands, and the empty degree opposite it is the direction nothing is pulling you toward, which is exactly why it has to be chosen on purpose. Tightness of orb affects how loud the pattern is, not where it discharges."
  },
  {
    "q": "A grand cross is best described as...",
    "choices": [
      "Two T-squares sharing an axis, four planets and no easy exit",
      "Four planets in a grand trine",
      "Two grand trines overlapping"
    ],
    "answer": 0,
    "explain": "Two oppositions square to each other lock into a pair of T-squares, which is the heaviest configuration a chart can carry. Four planets in trine is not a cross at all, and overlapping grand trines make a kite or a star, both of which flow rather than grind."
  },
  {
    "q": "Why read the apex by house as well as by sign?",
    "choices": [
      "Sign says how the pressure behaves, house says which area of life it keeps appearing in",
      "House placement decides whether the pattern is valid",
      "The house tells you what age it activates"
    ],
    "answer": 0,
    "explain": "Sign and house answer different questions, manner and arena, and you need both before you can say anything useful about a pattern. A pattern is valid on its angles alone regardless of houses, and houses carry no timing information by themselves."
  },
  {
    "q": "A yod is built from which aspect?",
    "choices": [
      "Two quincunxes converging on one apex planet",
      "Two squares and an opposition",
      "Three trines"
    ],
    "answer": 0,
    "explain": "The quincunx is the awkward hundred and fifty degree aspect, and two of them pointing at a single planet produce the yod hard-to-settle pressure. Squares plus an opposition make a T-square, and three trines make a grand trine."
  }
]$json$::jsonb
WHERE id = 'l2-3-aspect-patterns';

UPDATE public.learn_lessons SET
  duration_minutes = 6,
  objectives = ARRAY['Place your nodal axis by sign and whole-sign house','Read the South Node as what is already easy','Say what the North Node is asking you to build'],
  key_terms  = ARRAY['node'],
  slides = $json$[
  {
    "title": "The nodes are not planets",
    "visual": "zodiac_wheel",
    "content": "The lunar nodes are the two points where the Moon path crosses the Sun path. Nothing is physically there. They sit exactly opposite each other, so finding one gives you both, and they move backwards through the zodiac."
  },
  {
    "title": "South Node: what you already do well",
    "visual": "house_circle",
    "content": "Your South Node is the competence you arrived with. It is comfortable, automatic, and it is where you retreat when frightened. Overusing it is the most common way a life gets stuck without any of it ever feeling like failure."
  },
  {
    "title": "North Node: what you avoid",
    "visual": "house_circle",
    "content": "The North Node is the opposite sign and house, and it usually feels clumsy and unnatural. That is the signature, not a warning. Growth there is deliberate, and no part of it will ever arrive feeling like a talent."
  },
  {
    "title": "Read the axis, never one end",
    "visual": "zodiac_wheel",
    "content": "The nodes are one axis with two ends, so you read them together: what you lean on, and what you avoid because leaning is easier. A South Node in the 10th with a North in the 4th says achievement is the hiding place."
  },
  {
    "title": "Houses matter more than signs here",
    "visual": "house_circle",
    "content": "The sign tells you the manner. The whole-sign houses tell you the arena, and the arena is where the pull is actually felt in a life. Find both ends by house before you read a single word about the signs."
  }
]$json$::jsonb,
  quiz   = $json$[
  {
    "q": "Your South Node is in the 7th house. Where is your North Node?",
    "choices": [
      "The 1st house, always",
      "The 8th house",
      "It depends on the signs involved"
    ],
    "answer": 0,
    "explain": "The nodes are one axis with ends a hundred and eighty degrees apart, so the North is always six houses along from the South. Nothing about the signs changes that geometry, because it is fixed by the definition of the axis."
  },
  {
    "q": "How does this lesson describe the South Node?",
    "choices": [
      "Already-easy competence, and the place you retreat to when frightened",
      "A punishment carried from a past life",
      "The area where you have the least ability"
    ],
    "answer": 0,
    "explain": "It is what you arrived able to do, comfortable and automatic, which is exactly why leaning on it stalls a life without ever feeling like failure. That is the opposite of an area of low ability, and nothing here frames it as punishment."
  },
  {
    "q": "Your North Node placement feels awkward and unnatural. What does that indicate?",
    "choices": [
      "That you have found it, because awkwardness is the signature",
      "That the chart was calculated wrongly",
      "That you should work the South Node instead"
    ],
    "answer": 0,
    "explain": "Unfamiliarity is the defining quality of the North Node, so discomfort is confirmation rather than a problem to solve. Retreating to the South Node is precisely the stuck pattern the whole axis is describing."
  },
  {
    "q": "Why read the nodal axis rather than a single node?",
    "choices": [
      "What you lean on and what you avoid are two ends of one behaviour",
      "The North Node is unreliable on its own",
      "The South Node only works in day charts"
    ],
    "answer": 0,
    "explain": "The avoidance and the comfort explain each other, since you avoid one end precisely because the other is easier, so reading either alone loses the mechanism. Neither node is unreliable, and sect governs planetary condition rather than the nodes."
  },
  {
    "q": "The nodes move through the zodiac...",
    "choices": [
      "Backwards, in reverse zodiacal order",
      "Forwards, like the planets",
      "Not at all, they are fixed points"
    ],
    "answer": 0,
    "explain": "The nodal axis regresses through the signs, which is why nodal returns and eclipse families run in reverse order through a chart. They are not fixed, and that backwards motion is what distinguishes them from ordinary planetary movement."
  },
  {
    "q": "South Node in the 10th, North Node in the 4th. What is the most useful reading?",
    "choices": [
      "Public standing is the hiding place, and the work is at home and in the roots",
      "The person should abandon their career",
      "The person will have a famous parent"
    ],
    "answer": 0,
    "explain": "The South Node names the comfortable default, so a 10th house South says status is where this person retreats when uncertain, leaving the 4th as the neglected direction. Nothing demands abandoning a career, and the nodes describe the native rather than a parent."
  }
]$json$::jsonb
WHERE id = 'l2-4-lunar-nodes';

UPDATE public.learn_lessons SET
  duration_minutes = 7,
  objectives = ARRAY['Read a natal retrograde as internalised rather than broken','Track the Moon from new to full and use each phase','Recognise a void-of-course Moon and what not to begin in it'],
  key_terms  = ARRAY['retrograde'],
  slides = $json$[
  {
    "title": "Retrograde is an illusion that still matters",
    "visual": "planet_row",
    "content": "No planet reverses. From Earth, as we overtake a slower planet, it appears to. What that marks is a function turned inward: it runs privately, on its own schedule, and rarely looks the way other people expect it to look."
  },
  {
    "title": "Natal retrograde is not damage",
    "visual": "planet_row",
    "content": "A retrograde Mercury does not mean you communicate badly. It means you process before you speak, and you reopen what others consider settled. The function is internalised and delayed, and it is frequently better for both."
  },
  {
    "title": "The lunation cycle is the chart clock",
    "visual": "zodiac_wheel",
    "content": "New Moon: begin, in the dark, without evidence. First quarter: the first real resistance arrives. Full Moon: it becomes visible and you finally see what it actually is. Last quarter: cut whatever did not work."
  },
  {
    "title": "Use the phase, not only the sign",
    "visual": "zodiac_wheel",
    "content": "A new Moon in your 10th house is the month to begin something in public, and the full Moon a fortnight later shows you whether it took. Most people read the sign and ignore the phase, which is the half carrying the timing."
  },
  {
    "title": "Void of course: nothing sticks",
    "visual": "planet_row",
    "content": "Between the Moon last aspect in a sign and its entry into the next, it is void of course. Things begun there tend not to develop as planned. Use it for rest, admin and finishing, and not for launches or first meetings."
  }
]$json$::jsonb,
  quiz   = $json$[
  {
    "q": "What does a natal retrograde planet indicate, in this lesson?",
    "choices": [
      "The function is internalised, processed privately and on its own schedule",
      "The function is damaged",
      "The planet does nothing until it stations direct by transit"
    ],
    "answer": 0,
    "explain": "Retrograde marks an inward turn rather than a fault, so the function runs privately and reopens what others treat as closed. Calling it damage discards what the placement does, and a natal placement operates for life rather than waiting on a transit."
  },
  {
    "q": "A planet appears to reverse because...",
    "choices": [
      "Earth overtakes it, so the motion is an effect of our viewpoint",
      "It genuinely reverses its orbit",
      "Its gravity is temporarily disrupted"
    ],
    "answer": 0,
    "explain": "Apparent retrograde motion is a parallax effect of the faster Earth passing a slower planet, and nothing in the solar system actually changes direction. The illusion is real as a measurement even though the reversal itself is not."
  },
  {
    "q": "You want to launch something publicly. Which does this lesson suggest?",
    "choices": [
      "A new Moon in your 10th house, then check it at the following full Moon",
      "A void-of-course Moon in your 10th house",
      "The last quarter Moon in your 4th house"
    ],
    "answer": 0,
    "explain": "New Moons begin things and the 10th is public standing, with the following full Moon showing whether it took hold. A void Moon is precisely when starts fail to develop, and the last quarter is for cutting what did not work."
  },
  {
    "q": "When is the Moon void of course?",
    "choices": [
      "After its last aspect in a sign, until it enters the next sign",
      "Whenever it passes through the 12th house",
      "During any eclipse"
    ],
    "answer": 0,
    "explain": "The void period is defined by the gap between the Moon final aspect and its change of sign, so it is an aspect condition rather than a house position. Eclipses are a separate phenomenon tied to the lunar nodes."
  },
  {
    "q": "What is the full Moon for, in this lesson framing?",
    "choices": [
      "Seeing what the thing you started has actually become",
      "Starting something new",
      "Resting and withdrawing"
    ],
    "answer": 0,
    "explain": "The full Moon is the visibility point of the cycle, where a beginning becomes legible enough to judge. Beginnings belong to the new Moon, and rest is what the void periods and the dark of the Moon are for."
  },
  {
    "q": "Someone says their retrograde Mercury makes them bad at communicating. What is the sharper answer?",
    "choices": [
      "They process first and speak after, and reopen conclusions others consider closed",
      "They are right, and should avoid writing",
      "Retrogrades only matter by transit"
    ],
    "answer": 0,
    "explain": "Internalised is not incompetent: the delay is processing and the revisiting is often what makes the eventual output better. Avoiding writing throws away a strength, and a natal retrograde describes a lifelong mode rather than a passing transit."
  }
]$json$::jsonb
WHERE id = 'l2-5-retrogrades-lunation';

UPDATE public.learn_lessons SET
  duration_minutes = 7,
  objectives = ARRAY['Read a transit as a moving planet aspecting a natal point','Weigh a transit by which planet moves and which house it enters','Find your strongest current transit and read it'],
  key_terms  = ARRAY['transit','aspect'],
  slides = $json$[
  {
    "title": "A transit is the sky touching your chart",
    "visual": "planet_row",
    "content": "Your natal chart never changes. The sky keeps moving. A transit is a planet where it is right now making an aspect to a planet where it was the moment you were born. That contact is the whole event."
  },
  {
    "title": "Speed decides weight",
    "visual": "planet_row",
    "content": "The Moon crosses a house in two days and you may feel nothing at all. Saturn takes two and a half years and you will remember it for the rest of your life. Weight comes from how slowly the transiting planet moves."
  },
  {
    "title": "The house is what it touches",
    "visual": "house_circle",
    "content": "Which of your whole-sign houses the transiting planet has entered tells you the area of life under pressure. Saturn through your 7th is a completely different two years from Saturn through your 2nd, even though it is the same Saturn."
  },
  {
    "title": "The transiting planet is the verb",
    "visual": "planet_row",
    "content": "Saturn tests and demands structure. Jupiter expands, sometimes past what is wise. Uranus disrupts. Pluto dismantles and rebuilds. Combine that verb with the natal planet it touches and the house it sits in, and you have a reading."
  },
  {
    "title": "Applying is louder than separating",
    "visual": "zodiac_wheel",
    "content": "A transit builds as the aspect closes toward exact and fades once it separates. Outer planets cross the same point three times when they retrograde, which is why a hard Saturn transit arrives, leaves, and returns to finish the job."
  }
]$json$::jsonb,
  quiz   = $json$[
  {
    "q": "Which transit carries more weight, and why?",
    "choices": [
      "Transiting Saturn square your natal Sun, because Saturn is slow and the contact lasts",
      "Transiting Moon square your natal Sun, because the Moon governs feeling",
      "They are equal, because the aspect is the same"
    ],
    "answer": 0,
    "explain": "Weight comes from duration: Saturn holds a square for months and then returns to it, where the Moon passes in hours. The aspect being identical is exactly why speed becomes the deciding factor, and the Moon governing feeling does not slow it down."
  },
  {
    "q": "What is a transit, precisely?",
    "choices": [
      "A planet in the current sky making an aspect to a point in your natal chart",
      "A planet moving through your natal signs, with no aspect required",
      "A change in your natal chart over time"
    ],
    "answer": 0,
    "explain": "The definition is a contact between the moving sky and the fixed birth chart. Your natal positions never change, which is what makes them a usable reference, and it is the aspect that makes the contact readable rather than mere sign occupancy."
  },
  {
    "q": "Why does an outer-planet transit often hit three times?",
    "choices": [
      "The planet retrogrades back over the same point, then crosses it forward again",
      "Because it aspects three different natal planets",
      "Because eclipses repeat it"
    ],
    "answer": 0,
    "explain": "Retrograde motion carries a slow planet back across a degree it already crossed, turning one contact into a three-pass sequence with a middle act. Aspects to other planets are separate transits, and eclipses are a distinct nodal phenomenon."
  },
  {
    "q": "Saturn is transiting your 7th house. What is the most useful first thing to say?",
    "choices": [
      "Partnership is being tested and asked to become more structured or more honest",
      "You are going to get divorced",
      "Nothing, until Saturn aspects a natal planet"
    ],
    "answer": 0,
    "explain": "The verb of Saturn is testing and structuring and the 7th is partnership, so the house and the verb together already give you something usable. A specific outcome is not supported by a transit alone, and a planet moving through a house reads before it makes an exact aspect."
  },
  {
    "q": "A transit is exact tomorrow, another was exact last month. Which is louder now?",
    "choices": [
      "The one exact tomorrow, because an applying transit builds toward exact",
      "The one from last month, because its effects have settled in",
      "Neither, because transits only matter on the exact day"
    ],
    "answer": 0,
    "explain": "Pressure grows as an aspect closes and eases once it separates, so the approaching contact is the live one. Effects do continue past exactness but they are fading, and treating only the exact day as real misses most of a transit."
  },
  {
    "q": "Jupiter trine your Venus and Pluto square your Sun are both active. Which shapes the year more?",
    "choices": [
      "Pluto square the Sun, because it is far slower and the aspect is hard",
      "Jupiter trine Venus, because trines are stronger",
      "Whichever is closer to exact today"
    ],
    "answer": 0,
    "explain": "Pluto is the slowest body involved, so its contact lasts years rather than weeks, and a square demands engagement where a trine can pass by unused. Exactness today decides which is loudest this week, not which shapes a year."
  }
]$json$::jsonb
WHERE id = 'l2-6-transits';

UPDATE public.learn_lessons SET
  duration_minutes = 6,
  objectives = ARRAY['Explain an eclipse as a lunation on the nodal axis','Find which of your whole-sign houses an eclipse falls in','Say why an eclipse is not read like an ordinary transit'],
  key_terms  = ARRAY['node','transit'],
  slides = $json$[
  {
    "title": "An eclipse is a lunation with the nodes involved",
    "visual": "zodiac_wheel",
    "content": "A solar eclipse is a new Moon close enough to a lunar node that the Moon blocks the Sun. A lunar eclipse is a full Moon in the same alignment. It is the cycle you already know, with the nodes making it consequential."
  },
  {
    "title": "Why the nodes are required",
    "visual": "zodiac_wheel",
    "content": "The Moon path is tilted about five degrees to the Sun path, so most new Moons pass above or below and nothing happens. Only near a node do the three bodies actually line up, which is why eclipses arrive in seasons rather than monthly."
  },
  {
    "title": "Find the house first",
    "visual": "house_circle",
    "content": "An eclipse falls in a sign, and in Whole Sign that sign is one of your houses. That house is the answer to what it is about. Nothing else about the eclipse matters until you have established which house it landed in."
  },
  {
    "title": "They come in pairs and in families",
    "visual": "house_circle",
    "content": "Eclipses arrive in seasons roughly six months apart, and because the nodes move backwards the axis walks in reverse through your houses over about eighteen months before moving on to the next pair of houses."
  },
  {
    "title": "Read them as revelations, not deadlines",
    "visual": "planet_row",
    "content": "Eclipses tend to surface what was already true rather than manufacture something new, and they often deliver late, weeks either side of the date. Treating an eclipse date as a deadline is the most common way to misread one."
  }
]$json$::jsonb,
  quiz   = $json$[
  {
    "q": "What makes an eclipse different from an ordinary new or full Moon?",
    "choices": [
      "It happens close to a lunar node, so the three bodies actually align",
      "It happens at a faster part of the Moon orbit",
      "It happens when the Moon is in a fixed sign"
    ],
    "answer": 0,
    "explain": "Proximity to a node is the entire distinction, because it allows the alignment that ordinary lunations miss thanks to the tilt of the Moon path. Neither orbital speed nor the mode of the sign has anything to do with whether an eclipse occurs."
  },
  {
    "q": "Why do eclipses come in seasons rather than every month?",
    "choices": [
      "The Moon path is tilted, so only near the nodes do the bodies line up",
      "Because the Moon is sometimes too far from Earth",
      "Because the Sun changes sign every month"
    ],
    "answer": 0,
    "explain": "The roughly five degree tilt means most new Moons pass above or below the Sun, and only the twice-yearly node crossings bring them into line. Lunar distance affects whether an eclipse is total or annular rather than whether it happens at all."
  },
  {
    "q": "An eclipse falls in Taurus and Sagittarius is rising. Which house is it in?",
    "choices": [
      "The 6th",
      "The 2nd",
      "The 5th"
    ],
    "answer": 0,
    "explain": "Count from the rising sign: Sagittarius 1st, Capricorn 2nd, Aquarius 3rd, Pisces 4th, Aries 5th, Taurus 6th. Taurus being the second sign of the zodiac is the trap here, because houses are built from your Ascendant and not from Aries."
  },
  {
    "q": "How should eclipse timing be treated, per this lesson?",
    "choices": [
      "As a revelation that may land weeks either side, rather than a deadline",
      "As a strict exact-day event",
      "As irrelevant unless it aspects a natal planet"
    ],
    "answer": 0,
    "explain": "Eclipses tend to surface what was already true and often deliver late, so anchoring to the precise date is the common misread. They are readable by house alone, although a contact with a natal planet certainly sharpens them."
  },
  {
    "q": "Because the nodes move backwards, an eclipse family works through your houses...",
    "choices": [
      "In reverse order, over about eighteen months, before shifting to the next axis",
      "In forward zodiacal order, one house per month",
      "In no discernible order"
    ],
    "answer": 0,
    "explain": "The nodal axis regresses, so successive eclipse seasons walk backwards through the wheel and stay on one house axis for roughly a year and a half. Forward monthly movement describes ordinary lunations rather than eclipses."
  },
  {
    "q": "Two eclipses fall six months apart on your 4th and 10th houses. What is the useful framing?",
    "choices": [
      "Home and public life are being rebalanced against each other across that period",
      "Two unrelated events, one domestic and one professional",
      "The later eclipse cancels the earlier one"
    ],
    "answer": 0,
    "explain": "An eclipse axis is a single conversation with two ends, so the pair works the tension between private ground and public standing. They are not independent events, and nothing about a later eclipse cancels an earlier one."
  }
]$json$::jsonb
WHERE id = 'l2-7-eclipses';
