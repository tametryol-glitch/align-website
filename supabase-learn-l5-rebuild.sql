-- Level 5 — Specialized Branches & Mastery, Learn Loop standard.
--
-- Replaces eight stub lessons. Five dual-coded slides against a live visual,
-- six retrieval questions whose explanations say why the other answers are
-- weaker.
--
-- Fixed-star longitudes are given as approximate and always taught alongside
-- precession, because they drift about a degree every seventy-two years and a
-- lesson stating them as fixed would be wrong within a decade.
--
-- The final lesson carries the ethics that make the word "certified" mean
-- something: no prediction of death, illness or disaster; referral of medical,
-- legal and psychiatric questions; and the standard that a reading must leave
-- the client with more room to move than they arrived with.
--
-- Generated from validated data, not hand-written SQL. Safe to re-run.

UPDATE public.learn_lessons SET
  duration_minutes = 8,
  objectives = ARRAY['Test a horary chart for radicality before reading it','Assign significators by Align rulership','Recognise perfection, translation of light and prohibition'],
  key_terms  = ARRAY['horary','ruler'],
  slides = $json$[
  {
    "title": "The chart of the question",
    "visual": "house_circle",
    "content": "Horary casts a chart for the moment a question is genuinely understood and asked. It has no birth data and no native. The question itself is the subject, and the chart answers it or refuses to."
  },
  {
    "title": "Test radicality first",
    "visual": "zodiac_wheel",
    "content": "An Ascendant in the first three degrees says the matter is too young to judge. Past twenty-seven says it is already decided. A void Moon says nothing will come of it. Test before you read, not after you dislike the answer."
  },
  {
    "title": "Assign the significators",
    "visual": "planet_row",
    "content": "You are the ruler of the 1st, plus the Moon as co-significator. The thing asked about is the ruler of its own house: the 7th for a partner, the 10th for a job. Take those rulers from the Align table."
  },
  {
    "title": "Perfection is the answer",
    "visual": "zodiac_wheel",
    "content": "If the two significators apply to an aspect before either changes sign, the matter perfects and the answer is yes. If they separate, or the aspect never completes, it does not. The geometry is the judgement."
  },
  {
    "title": "Translation and prohibition",
    "visual": "planet_row",
    "content": "A third planet can carry light from one significator to the other and bring about what they could not manage alone, which is translation. Another can intervene first and block it, which is prohibition. Both change the answer."
  }
]$json$::jsonb,
  quiz   = $json$[
  {
    "q": "The Ascendant of a horary chart is at one degree. What does that indicate?",
    "choices": [
      "The matter is too early to judge, and the chart is not radical",
      "The matter is already settled",
      "The querent is young"
    ],
    "answer": 0,
    "explain": "An Ascendant in the first three degrees is the classic sign the question is premature and the situation has not yet taken shape. Past twenty-seven degrees is the too-late signature, and nothing about radicality refers to anybody actual age."
  },
  {
    "q": "Who signifies the querent?",
    "choices": [
      "The ruler of the 1st house, with the Moon as co-significator",
      "The Sun, always",
      "The ruler of the house of the matter asked about"
    ],
    "answer": 0,
    "explain": "The querent takes the ruler of the 1st and the Moon alongside it, which is why the Moon condition matters so much in horary. The Sun has no special claim here, and the house of the matter signifies the thing asked about rather than the asker."
  },
  {
    "q": "A question is asked about a job. Which house rules the quesited?",
    "choices": [
      "The 10th",
      "The 6th",
      "The 2nd"
    ],
    "answer": 0,
    "explain": "Career and public standing is the 10th, so its Align ruler signifies the job in question. The 6th is daily work and service, which answers a different question, and the 2nd covers resources rather than the position itself."
  },
  {
    "q": "The two significators are separating rather than applying. What does that suggest?",
    "choices": [
      "The matter does not perfect, so the answer tends toward no",
      "The matter perfects immediately",
      "The chart must be recast"
    ],
    "answer": 0,
    "explain": "Perfection requires an applying aspect that completes before either significator changes sign, so separation means the moment has passed. Recasting for a better answer defeats the entire premise of asking at a specific moment."
  },
  {
    "q": "What is translation of light?",
    "choices": [
      "A third planet carrying light between two significators that cannot connect alone",
      "A significator changing sign mid-judgement",
      "The Moon becoming void of course"
    ],
    "answer": 0,
    "explain": "Translation is a third body picking up light from one significator and delivering it to the other, bringing about what the pair could not manage. A sign change is a separate consideration, and a void Moon is a radicality warning rather than a mechanism."
  },
  {
    "q": "Why test radicality before reading rather than after?",
    "choices": [
      "Otherwise the test becomes an excuse for rejecting answers you dislike",
      "Because radicality changes the significators",
      "Because it is faster"
    ],
    "answer": 0,
    "explain": "Applying the test first keeps it a genuine check on whether the chart can be judged at all, rather than a rationalisation applied selectively. Radicality does not alter which planets signify what, and speed has nothing to do with the rule."
  }
]$json$::jsonb
WHERE id = 'l5-1-horary';

UPDATE public.learn_lessons SET
  duration_minutes = 8,
  objectives = ARRAY['Define the house of the matter and its ruler','Strengthen the Moon and the relevant ruler','Avoid the classic electional mistakes'],
  key_terms  = ARRAY['electional','ruler'],
  slides = $json$[
  {
    "title": "Horary asks, electional chooses",
    "visual": "house_circle",
    "content": "Horary reads a moment you did not pick. Electional builds one you did. You decide what the event is for, find the house that governs it, and then hunt for a moment when that house and its ruler are as strong as you can get them."
  },
  {
    "title": "Name the house before you look at anything",
    "visual": "house_circle",
    "content": "A business launch is the 10th. A marriage is the 7th. A surgery is the 6th and the 8th. Elect without naming the house first and you end up optimising a chart that is beautiful and about nothing in particular."
  },
  {
    "title": "The Moon is the second client",
    "visual": "planet_row",
    "content": "Every election needs a strong Moon, because the Moon carries the matter forward in time. Waxing is better than waning for anything meant to grow, and a void Moon is the single most reliable way to make a launch quietly fail."
  },
  {
    "title": "Watch what the Moon touches next",
    "visual": "zodiac_wheel",
    "content": "The Moon next aspect is where the matter is heading. If it applies to a malefic before it reaches a benefic, that is what arrives first. Choosing the moment means choosing that sequence deliberately."
  },
  {
    "title": "The classic mistakes",
    "visual": "planet_row",
    "content": "A retrograde or combust ruler of the matter. Malefics on the angles. A perfect chart that ignores the actual purpose. And electing a moment the person cannot realistically use, which is the most common error of all."
  }
]$json$::jsonb,
  quiz   = $json$[
  {
    "q": "What is the first step in an election?",
    "choices": [
      "Naming the house that governs the matter",
      "Finding the next void-of-course Moon",
      "Choosing a day with no retrogrades"
    ],
    "answer": 0,
    "explain": "Without the house you have no target, and you end up optimising a chart that is elegant and about nothing in particular. Void periods and retrogrades are constraints to work around after the subject of the election is fixed."
  },
  {
    "q": "You are electing for a business launch. Which house leads?",
    "choices": [
      "The 10th",
      "The 5th",
      "The 3rd"
    ],
    "answer": 0,
    "explain": "A launch concerns public standing and enterprise, which is the 10th, so its ruler becomes the planet to strengthen. The 5th covers creativity and speculation and the 3rd communication, neither of which is the primary significator for a launch."
  },
  {
    "q": "Why does the Moon matter so much in electional work?",
    "choices": [
      "It carries the matter forward in time, so its condition shapes what unfolds",
      "It rules every election regardless of subject",
      "It is the fastest planet and therefore the strongest"
    ],
    "answer": 0,
    "explain": "The Moon acts as the general significator of process, carrying the matter along after the moment itself. It does not rule the subject, which belongs to the house of the matter, and speed alone confers no strength."
  },
  {
    "q": "The Moon applies to a malefic before reaching a benefic. What does this mean for the election?",
    "choices": [
      "The difficulty arrives first, so the sequence should be chosen deliberately",
      "The benefic cancels the malefic",
      "The Moon condition is irrelevant once the ruler is strong"
    ],
    "answer": 0,
    "explain": "The order of the Moon aspects is the order of events, so what it meets first is what shows up first. Nothing cancels retroactively, and a strong ruler does not make the path the Moon takes irrelevant."
  },
  {
    "q": "Which is the most common electional mistake, per this lesson?",
    "choices": [
      "Electing a moment the person cannot realistically use",
      "Using whole-sign houses",
      "Electing during a waxing Moon"
    ],
    "answer": 0,
    "explain": "A technically excellent chart is worthless if nobody can act at that hour, which is why practicality is part of the craft rather than an afterthought. Whole Sign is the house system Align uses throughout, and a waxing Moon is usually desirable."
  },
  {
    "q": "The ruler of the house of the matter is combust. What should you do?",
    "choices": [
      "Find another moment, since the significator cannot act while burned up",
      "Proceed, because combustion only matters in natal work",
      "Substitute the Moon as the ruler instead"
    ],
    "answer": 0,
    "explain": "A combust significator is obscured and unable to operate, which defeats the purpose of electing at all, so the honest move is to keep looking. Combustion applies across every branch, and the Moon is a co-significator rather than a replacement ruler."
  }
]$json$::jsonb
WHERE id = 'l5-2-electional';

UPDATE public.learn_lessons SET
  duration_minutes = 7,
  objectives = ARRAY['Read an ingress chart as the chart of a place','Track the outer-planet cycles that structure an era','Connect a cycle to events without claiming it caused them'],
  key_terms  = ARRAY['transit','conjunction'],
  slides = $json$[
  {
    "title": "Charts for places, not people",
    "visual": "house_circle",
    "content": "Mundane astrology casts charts for nations, cities and moments rather than for individuals. The technique is the same. What changes is that the 1st house is a population and the 10th is a government."
  },
  {
    "title": "The ingress chart",
    "visual": "zodiac_wheel",
    "content": "Cast a chart for the exact moment the Sun enters Aries, at a specific capital, and you have a chart for that place over the following period. Different capitals give different angles, so every country gets its own reading of the same instant."
  },
  {
    "title": "The great conjunction",
    "visual": "planet_row",
    "content": "Jupiter and Saturn meet roughly every twenty years, and the element those meetings fall in shifts about every two centuries. It is the longest-standing marker of political and economic eras in the whole tradition."
  },
  {
    "title": "Outer-planet cycles set the weather",
    "visual": "planet_row",
    "content": "Saturn with Pluto reads as the hard consolidation of power. Uranus with Pluto reads as upheaval. Neptune with anything blurs the boundaries. These cycles are decades long and describe conditions rather than incidents."
  },
  {
    "title": "Correlate, do not claim causation",
    "visual": "zodiac_wheel",
    "content": "A cycle describes the character of a period. It does not make things happen, and it never names the actor. The moment you tell someone a transit caused a specific event, you have left what the technique can support."
  }
]$json$::jsonb,
  quiz   = $json$[
  {
    "q": "What does the 1st house represent in a mundane chart?",
    "choices": [
      "The population of the place",
      "The head of state",
      "The astrologer casting it"
    ],
    "answer": 0,
    "explain": "In mundane work the 1st stands for the country and its people, which is the direct analogue of the native in a nativity. The government and its leadership belong to the 10th, and the astrologer appears nowhere in the chart."
  },
  {
    "q": "Why does the same Aries ingress read differently for different countries?",
    "choices": [
      "The angles change with location, so the houses differ",
      "The Sun is in a different sign at each capital",
      "The ingress happens at a different time in each country"
    ],
    "answer": 0,
    "explain": "One instant produces different rising signs at different longitudes and latitudes, which redraws the houses entirely. The Sun sits at the same zodiacal degree everywhere at that instant, and the moment itself is simultaneous worldwide."
  },
  {
    "q": "How often do Jupiter and Saturn conjoin?",
    "choices": [
      "Roughly every twenty years",
      "Roughly every twelve years",
      "Roughly every eighty-four years"
    ],
    "answer": 0,
    "explain": "The great conjunction recurs about every two decades, with the element of those meetings shifting roughly every two centuries. Twelve years is the Jupiter orbit and eighty-four is the Uranus orbit, neither of which describes the pairing."
  },
  {
    "q": "What does this lesson say a mundane cycle actually describes?",
    "choices": [
      "The character of a period, rather than a specific event or actor",
      "The exact date a government will fall",
      "Nothing, mundane astrology has no technique"
    ],
    "answer": 0,
    "explain": "Cycles set conditions across years or decades, so they characterise a period without naming incidents or people. Dating a specific political outcome exceeds what the technique supports, and the method itself is well developed."
  },
  {
    "q": "A Saturn and Pluto conjunction is read as...",
    "choices": [
      "Hard consolidation of power and structural pressure",
      "Sudden liberation and reform",
      "Dissolution of boundaries"
    ],
    "answer": 0,
    "explain": "Saturn structures and Pluto concentrates, so together they read as power hardening and being consolidated. Sudden reform is the Uranus signature and the dissolving of boundaries belongs to Neptune, both of which are different pairings."
  },
  {
    "q": "Why does this lesson insist on correlation rather than causation?",
    "choices": [
      "The technique can describe conditions but cannot support a claim about what caused an event",
      "Because astrology is provably false",
      "Because causation only applies to natal charts"
    ],
    "answer": 0,
    "explain": "Naming a cause goes beyond what a cycle can show, and overclaiming is what discredits mundane work fastest. The point is the limit of the evidence rather than a verdict on astrology, and the same restraint applies in natal work too."
  }
]$json$::jsonb
WHERE id = 'l5-3-mundane';

UPDATE public.learn_lessons SET
  duration_minutes = 7,
  objectives = ARRAY['Explain what a harmonic chart does to the zodiac','Know what the fourth and fifth harmonics reveal','Build and read a midpoint tree'],
  key_terms  = ARRAY['midpoint','aspect'],
  slides = $json$[
  {
    "title": "A harmonic folds the zodiac",
    "visual": "zodiac_wheel",
    "content": "To build the nth harmonic, multiply every planet longitude by n and wrap it back inside three hundred and sixty degrees. Aspects based on dividing the circle by n become conjunctions, which makes them impossible to miss."
  },
  {
    "title": "The fourth harmonic: the hard aspects",
    "visual": "zodiac_wheel",
    "content": "Squares and oppositions are the circle divided by four and two. In the fourth harmonic chart they collapse into conjunctions, so every source of friction in a life stacks into visible clusters."
  },
  {
    "title": "The fifth harmonic: the quintiles",
    "visual": "zodiac_wheel",
    "content": "The fifth harmonic surfaces the quintile family, traditionally read as skill, craft and the particular thing a person is unusually good at making. It is where the ordinary aspect list is thinnest and harmonics earn their keep."
  },
  {
    "title": "A midpoint tree",
    "visual": "planet_row",
    "content": "Pick a planet. List every midpoint pair it sits on, tightly. That list is the tree, and it usually says more about how that planet actually behaves than its sign and house do on their own."
  },
  {
    "title": "Discipline or noise",
    "visual": "planet_row",
    "content": "Harmonics and midpoint trees generate enormous quantities of material, and with loose orbs they will confirm anything you already believe. Keep the orbs tight and go in with a question, or do not go in at all."
  }
]$json$::jsonb,
  quiz   = $json$[
  {
    "q": "How is a harmonic chart constructed?",
    "choices": [
      "Multiply every planet longitude by the harmonic number and reduce within 360 degrees",
      "Divide every planet longitude by the harmonic number",
      "Recast the chart for a later date"
    ],
    "answer": 0,
    "explain": "Multiplying and wrapping is the operation, and it converts aspects based on dividing the circle by that number into conjunctions. Dividing produces nothing meaningful, and recasting for another date is a progression or return."
  },
  {
    "q": "Which aspects become conjunctions in the fourth harmonic?",
    "choices": [
      "Squares and oppositions",
      "Trines and sextiles",
      "Quintiles"
    ],
    "answer": 0,
    "explain": "Squares and oppositions come from dividing the circle by four and by two, so the fourth harmonic collapses them into conjunctions and makes every friction point visible. Trines belong to the third harmonic and quintiles to the fifth."
  },
  {
    "q": "What is the fifth harmonic traditionally read for?",
    "choices": [
      "Skill and craft, the thing a person is unusually good at making",
      "Conflict and crisis",
      "Ancestry and inheritance"
    ],
    "answer": 0,
    "explain": "The quintile family surfaced by the fifth harmonic is read as particular ability and craft, which is exactly the area where the standard aspect list is thinnest. Conflict belongs to the fourth harmonic and inheritance is not a harmonic question."
  },
  {
    "q": "What is a midpoint tree?",
    "choices": [
      "Every midpoint pair a chosen planet sits on, listed tightly",
      "The set of all midpoints in a chart",
      "A ranking of planets by dignity"
    ],
    "answer": 0,
    "explain": "A tree is built around one planet and collects the pairs it occupies the midpoint of, which is what makes it readable. Every midpoint in the chart is a far larger and much less useful set, and dignity ranking is unrelated."
  },
  {
    "q": "What is the main risk in harmonic and midpoint work?",
    "choices": [
      "Loose orbs generate so much material that anything can be confirmed",
      "The calculations are too slow to perform",
      "The techniques only work on day charts"
    ],
    "answer": 0,
    "explain": "Volume is the hazard: with wide orbs there is a picture available for any conclusion you arrive with, which is how the technique gets its reputation. Computation is trivial now, and neither method is restricted by sect."
  },
  {
    "q": "Why go into harmonic work with a question already formed?",
    "choices": [
      "Because the output is large enough to confirm whatever you went looking for",
      "Because harmonics only answer yes or no",
      "Because the software requires it"
    ],
    "answer": 0,
    "explain": "A specific question constrains what counts as an answer, which is the discipline that keeps the technique honest against its own volume. Harmonics produce descriptive material rather than binary answers, and no tool imposes the requirement."
  }
]$json$::jsonb
WHERE id = 'l5-4-harmonics';

UPDATE public.learn_lessons SET
  duration_minutes = 7,
  objectives = ARRAY['Read planetary lines on a world map','Explain what relocation changes and what it does not','Choose a place by intention rather than by hope'],
  key_terms  = ARRAY['astrocartography','ascendant'],
  slides = $json$[
  {
    "title": "Lines are where a planet is angular",
    "visual": "house_circle",
    "content": "An astrocartography map draws, for each planet, the places on Earth where it would have been exactly rising, setting, culminating or at the bottom of the sky at your birth moment. Standing on a line puts that planet on an angle."
  },
  {
    "title": "Four lines per planet",
    "visual": "zodiac_wheel",
    "content": "Each planet gets a rising line, a setting line, a midheaven line and an imum coeli line. Same planet, four very different experiences: on the rising line you embody it, and on the setting line you keep meeting it in other people."
  },
  {
    "title": "Relocation keeps the planets and moves the frame",
    "visual": "planet_row",
    "content": "Recast your chart for a new city and every planet stays in the same sign, at the same degree, in the same aspects. Only the angles and therefore the houses change. Moving cannot give you a different chart, only a different emphasis."
  },
  {
    "title": "Read the planet honestly",
    "visual": "planet_row",
    "content": "A Jupiter line is not a guarantee of good fortune and a Saturn line is not a sentence. Saturn lines are where people build things that last, at a cost. Choose for the planet you actually want to be shaped by."
  },
  {
    "title": "Proximity, and the limits",
    "visual": "house_circle",
    "content": "Influence fades with distance from a line, with a few hundred miles as a working rule. And no line overrides circumstance: a map suggests where a placement is amplified, not where a life is guaranteed to go well."
  }
]$json$::jsonb,
  quiz   = $json$[
  {
    "q": "What does an astrocartography line represent?",
    "choices": [
      "Places where a planet would have been exactly angular at your birth moment",
      "Places where a planet is currently overhead",
      "The path a planet traces through the sky today"
    ],
    "answer": 0,
    "explain": "Each line marks where a natal planet would have sat on one of the four angles for your birth instant, which is why it is personal to your chart. Current planetary positions are transits and belong to an entirely different map."
  },
  {
    "q": "What changes when you relocate a chart?",
    "choices": [
      "The angles and houses, while signs, degrees and aspects stay the same",
      "The signs the planets occupy",
      "The aspects between planets"
    ],
    "answer": 0,
    "explain": "Relocation recomputes the angles for a new latitude and longitude, so the house framework shifts while the planets themselves are untouched. Signs, degrees and aspects are fixed by the birth moment and no move can alter them."
  },
  {
    "q": "How many lines does each planet have on the map?",
    "choices": [
      "Four, for rising, setting, midheaven and imum coeli",
      "Two, for rising and setting",
      "One, for its midheaven"
    ],
    "answer": 0,
    "explain": "Every planet produces four angular lines, and each gives a genuinely different experience of the same planet. Reducing it to rising and setting drops the two vertical angles, where much of the career and home material sits."
  },
  {
    "q": "You are on your Venus setting line. What does this lesson suggest?",
    "choices": [
      "You keep meeting Venus in other people rather than embodying it",
      "You embody Venus more strongly than anywhere else",
      "Venus stops functioning in your chart"
    ],
    "answer": 0,
    "explain": "The setting line puts a planet on the descendant, the house of the other, so you encounter it through relationships rather than expressing it yourself. Embodiment belongs to the rising line, and no location switches a planet off."
  },
  {
    "q": "How should a Saturn line be read?",
    "choices": [
      "As a place where things get built at a cost, rather than as a sentence",
      "As a place to avoid entirely",
      "As identical to a Jupiter line"
    ],
    "answer": 0,
    "explain": "Saturn lines concentrate work, structure and endurance, which produces lasting results at real expense rather than simple misfortune. Blanket avoidance discards the planet usefulness, and Saturn and Jupiter are not interchangeable."
  },
  {
    "q": "What is a reasonable working rule for how far a line influence extends?",
    "choices": [
      "A few hundred miles, fading with distance",
      "The entire continent the line crosses",
      "Exactly on the line and nowhere else"
    ],
    "answer": 0,
    "explain": "Influence is strongest on the line and diminishes outward across a few hundred miles, which is why proximity matters when comparing places. A whole continent is far too broad, and treating it as a razor edge ignores how the effect actually behaves."
  }
]$json$::jsonb
WHERE id = 'l5-5-astrocartography';

UPDATE public.learn_lessons SET
  duration_minutes = 7,
  objectives = ARRAY['Read Pluto with the nodes as one story','Place the four asteroid goddesses','Say why Vesta and Juno carry more weight in Align'],
  key_terms  = ARRAY['node','ruler'],
  slides = $json$[
  {
    "title": "Pluto and the nodes tell one story",
    "visual": "house_circle",
    "content": "Evolutionary work reads Pluto as the deepest compulsion and the nodal axis as the direction of travel. Read together they describe what a person keeps being pulled back into and what they are being asked to do instead."
  },
  {
    "title": "Start with Pluto by house",
    "visual": "planet_row",
    "content": "Pluto sign is generational and tells you almost nothing about an individual. Pluto house is personal and tells you where the pressure to transform actually lands. Always read the house before the sign."
  },
  {
    "title": "The four goddesses",
    "visual": "planet_row",
    "content": "Ceres is nurture and what you do when you lose something. Pallas is pattern recognition and strategy. Juno is committed partnership and the terms of it. Vesta is devotion, focus, and what you keep sacred."
  },
  {
    "title": "In Align, two of them are rulers",
    "visual": "planet_row",
    "content": "Vesta rules Virgo and Juno rules Libra here, which promotes them from interesting extras to structural. Any chart with Virgo or Libra on a house has one of them as that house ruler, sitting in the middle of the chain."
  },
  {
    "title": "Read them as planets, not decorations",
    "visual": "planet_row",
    "content": "Give Vesta and Juno the same treatment you give Mars: sign, house, dignity, aspects, and where they sit in the dispositor chain. A ruler you read casually is a chain you have broken without noticing."
  }
]$json$::jsonb,
  quiz   = $json$[
  {
    "q": "Why read Pluto by house before sign?",
    "choices": [
      "The sign is generational, while the house is personal to the individual",
      "The house is easier to calculate",
      "Pluto sign is meaningless in every context"
    ],
    "answer": 0,
    "explain": "Everyone born across a decade or more shares the sign, so it cannot distinguish two people, while the house is specific to the chart. Ease of calculation is irrelevant, and the sign does carry generational meaning even if not personal meaning."
  },
  {
    "q": "Which asteroid governs the terms of committed partnership?",
    "choices": [
      "Juno",
      "Ceres",
      "Pallas"
    ],
    "answer": 0,
    "explain": "Juno covers commitment, the contract and what a person will not compromise inside a bond, which is why Align gives it Libra. Ceres deals in nurture and loss and Pallas in strategy and pattern."
  },
  {
    "q": "Your 6th house is Virgo. Who rules it in the Align system, and what follows?",
    "choices": [
      "Vesta, so Vesta sits in your dispositor chain for that house",
      "Mercury, and the chain runs through Mercury",
      "Nothing rules it, since Virgo has no ruler in Align"
    ],
    "answer": 0,
    "explain": "Vesta rules Virgo here, so it becomes the ruler of any Virgo house and takes a structural position in the chain. Mercury is the conventional answer and keeps Gemini alone in Align, and every sign has exactly one ruler."
  },
  {
    "q": "What does this lesson say about reading Vesta and Juno?",
    "choices": [
      "Give them the same treatment as any planet, because they are chart rulers",
      "Read them only if the chart has no other asteroids",
      "Read them by sign alone"
    ],
    "answer": 0,
    "explain": "Rulership makes them structural, so sign, house, dignity, aspects and chain position all apply exactly as they would to Mars. Treating them casually breaks a rulership chain without the reader noticing it has happened."
  },
  {
    "q": "Pluto and the nodes read together describe...",
    "choices": [
      "What a person keeps returning to, and what they are being asked to do instead",
      "The exact events of a past life",
      "The person lifespan"
    ],
    "answer": 0,
    "explain": "The pairing sets a deep compulsion against a direction of travel, which is what makes it a usable description of a pattern. Specific past-life events and lifespan are claims the technique cannot support."
  },
  {
    "q": "Ceres is most associated with...",
    "choices": [
      "Nurture, and how a person responds to loss",
      "Strategy and pattern recognition",
      "Devotion and sacred focus"
    ],
    "answer": 0,
    "explain": "Ceres covers care, feeding and the grief of separation, which is the core of the myth it takes its name from. Strategy belongs to Pallas and devoted focus to Vesta, each of which is a distinct body."
  }
]$json$::jsonb
WHERE id = 'l5-6-evolutionary-asteroids';

UPDATE public.learn_lessons SET
  duration_minutes = 7,
  objectives = ARRAY['Use bright fixed stars by conjunction with a tight orb','Explain precession and why star positions move','Say what a paran is'],
  key_terms  = ARRAY['whole-sign-houses','conjunction','orb'],
  slides = $json$[
  {
    "title": "Stars are not planets",
    "visual": "zodiac_wheel",
    "content": "The planets wander. The fixed stars hold their positions relative to each other, and they read very differently: sharper, more specific, and far less forgiving. A star adds a distinct flavour to whatever it touches."
  },
  {
    "title": "Conjunction only, and tight",
    "visual": "planet_row",
    "content": "Fixed stars are used by conjunction to a planet or an angle, with an orb of a degree or two at most. They do not square, trine or oppose in ordinary practice. If it is not close, it is not there."
  },
  {
    "title": "Precession moves them",
    "visual": "zodiac_wheel",
    "content": "Star positions in the tropical zodiac drift by about one degree every seventy-two years. Regulus moved from Leo into Virgo in our own lifetimes. Any lesson quoting a fixed degree as permanent is quietly going out of date."
  },
  {
    "title": "The four royal stars",
    "visual": "zodiac_wheel",
    "content": "Aldebaran near ten degrees of Gemini, Regulus near the start of Virgo, Antares near ten degrees of Sagittarius, and Fomalhaut near four degrees of Pisces. Approximate, and drifting, but the four watchers of the tradition."
  },
  {
    "title": "Parans are simultaneity, not longitude",
    "visual": "house_circle",
    "content": "A paran occurs when two bodies are angular at the same moment from your birth place, even with no aspect between them by longitude. It is a separate layer again, and it depends entirely on latitude."
  }
]$json$::jsonb,
  quiz   = $json$[
  {
    "q": "How are fixed stars used in practice?",
    "choices": [
      "By conjunction only, with an orb of a degree or two",
      "By any major aspect, with an eight degree orb",
      "By house placement alone"
    ],
    "answer": 0,
    "explain": "Stars work by close conjunction to a planet or angle and are not read through the usual aspect set. A major-aspect orb would place a star on almost everything, which destroys the specificity that makes them worth using."
  },
  {
    "q": "Why do fixed star positions in the tropical zodiac change over time?",
    "choices": [
      "Precession shifts them about one degree every seventy-two years",
      "The stars physically orbit the Sun",
      "They do not change"
    ],
    "answer": 0,
    "explain": "Precession of the equinoxes slowly moves the tropical framework against the stars, which is why Regulus crossed from Leo into Virgo recently. The stars are effectively fixed relative to each other and certainly do not orbit our Sun."
  },
  {
    "q": "What is a paran?",
    "choices": [
      "Two bodies angular at the same moment from a given place",
      "Two bodies conjunct within one degree",
      "A star exactly on the Ascendant"
    ],
    "answer": 0,
    "explain": "Parans are about simultaneous angularity and depend on the latitude of the place, so two bodies can be linked with no aspect between them at all. A tight conjunction is an ordinary longitude relationship, which is a different measurement."
  },
  {
    "q": "Which star recently moved into Virgo?",
    "choices": [
      "Regulus",
      "Antares",
      "Fomalhaut"
    ],
    "answer": 0,
    "explain": "Regulus crossed from the end of Leo into the beginning of Virgo in recent decades, which is the most cited modern example of precession in action. Antares sits near ten degrees of Sagittarius and Fomalhaut near four degrees of Pisces."
  },
  {
    "q": "Why does this lesson call fixed stars less forgiving than planets?",
    "choices": [
      "They read sharply and specifically rather than as a range of possibilities",
      "They are always malefic",
      "They cannot be interpreted at all"
    ],
    "answer": 0,
    "explain": "Stars deliver a pointed and particular flavour rather than the broad spectrum a planet offers, which is what makes tight orbs essential. They are not uniformly malefic, and they are certainly interpretable."
  },
  {
    "q": "A star sits four degrees from a planet. Is it in play?",
    "choices": [
      "No, four degrees is outside the tight orb fixed stars require",
      "Yes, four degrees is well within orb",
      "Yes, but only if the planet is angular"
    ],
    "answer": 0,
    "explain": "Fixed stars need a degree or two at most, so four degrees puts the star out of range regardless of anything else. Angularity strengthens a contact that already exists rather than widening the orb that creates one."
  }
]$json$::jsonb
WHERE id = 'l5-7-fixed-stars';

UPDATE public.learn_lessons SET
  duration_minutes = 9,
  objectives = ARRAY['Synthesise a full reading in a defensible order','Apply the ethics of reading for another person','Complete the certification capstone'],
  key_terms  = ARRAY['whole-sign-houses','ruler','sect'],
  slides = $json$[
  {
    "title": "Synthesis is subtraction",
    "visual": "house_circle",
    "content": "You can now see more in a chart than anyone can use. The skill at this level is choosing: three things that matter, said clearly, instead of thirty that are true. A reading is what you left out as much as what you said."
  },
  {
    "title": "The person is in the room",
    "visual": "planet_row",
    "content": "Someone hearing their chart is often at a vulnerable moment. What you say lands harder than you intend and lasts longer than you expect. Accuracy without care is not skill, it is just accuracy."
  },
  {
    "title": "Never predict death, illness or disaster",
    "visual": "planet_row",
    "content": "You cannot see these reliably, and being wrong causes real harm while being right helps nobody. Describe pressure, timing and choices. Refer medical, legal and psychiatric questions to people qualified to answer them."
  },
  {
    "title": "Leave the person more agency, not less",
    "visual": "house_circle",
    "content": "A chart describes conditions and tendencies. Every reading should end with the client holding more room to move than when they arrived. If your reading takes away choices, you have misused the technique."
  },
  {
    "title": "The capstone",
    "visual": "zodiac_wheel",
    "content": "Deliver a complete reading of your own chart: sect, lights, Ascendant ruler, Lots, the current profection and releasing chapter. One page. One honest sentence at the top. Every claim traceable to a placement."
  }
]$json$::jsonb,
  quiz   = $json$[
  {
    "q": "What does this lesson mean by synthesis being subtraction?",
    "choices": [
      "Choosing three things that matter over thirty that are merely true",
      "Removing techniques you dislike from the reading",
      "Using fewer planets"
    ],
    "answer": 0,
    "explain": "At this level the constraint is no longer what you can see but what the person can use, so selection is the actual skill. It is not about discarding techniques you find inconvenient, nor about reducing the bodies you examine."
  },
  {
    "q": "A client asks whether their illness will be fatal. What is the correct response?",
    "choices": [
      "Decline, and refer them to a qualified medical professional",
      "Read the 8th house and answer honestly",
      "Give a probability rather than a certainty"
    ],
    "answer": 0,
    "explain": "Medical prognosis is outside both the reliability of the technique and the competence of an astrologer, so referral is the only responsible answer. Reading the 8th house or softening it into a probability still delivers a judgement you cannot support."
  },
  {
    "q": "According to this lesson, how should a reading leave the client?",
    "choices": [
      "Holding more room to move than when they arrived",
      "Certain about what will happen",
      "Aware of every factor in their chart"
    ],
    "answer": 0,
    "explain": "Increasing agency is the stated standard, because a chart describes conditions rather than fixed outcomes. Manufacturing certainty removes choices, and an exhaustive recital is the opposite of a usable reading."
  },
  {
    "q": "Why does the lesson say accuracy without care is not skill?",
    "choices": [
      "A person hearing their chart is often vulnerable, and what you say lasts",
      "Because accuracy is impossible in astrology",
      "Because care matters more than being correct"
    ],
    "answer": 0,
    "explain": "Delivery is part of the craft because the words outlive the session and land harder than intended. The point is not that accuracy is unattainable or unimportant, but that on its own it is insufficient."
  },
  {
    "q": "What does the capstone require?",
    "choices": [
      "A complete reading of your own chart with every claim traceable to a placement",
      "A prediction for the coming year",
      "A written examination on terminology"
    ],
    "answer": 0,
    "explain": "The capstone is a full delineation, sect through time-lords, where each statement can be traced back to the placement supporting it. It is neither a forecast nor a vocabulary test."
  },
  {
    "q": "Which order does the capstone follow?",
    "choices": [
      "Sect, lights, Ascendant ruler, Lots, then the time-lords",
      "Time-lords, Lots, Ascendant ruler, lights, sect",
      "Any order, provided every factor is covered"
    ],
    "answer": 0,
    "explain": "The sequence runs from the conditions that frame every later judgement toward the timing laid over the finished nativity. Reversing it dates a chart you have not yet judged, and working in no order at all is how a reader finds whatever they came for."
  }
]$json$::jsonb
WHERE id = 'l5-8-the-craft';
