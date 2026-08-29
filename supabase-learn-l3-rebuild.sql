-- Level 3 — Relationships & Predictive, rebuilt to the Learn Loop standard.
--
-- Replaces seven stub lessons whose bodies were placeholder text. Five
-- dual-coded slides against a live visual, six retrieval questions whose
-- explanations say why the other answers are weaker.
--
-- Follows the Align rulership throughout (Virgo=Vesta, Libra=Juno,
-- Scorpio=Pluto, Aquarius=Uranus, Pisces=Neptune) — the composite and
-- profection lessons both route through it, so a conventional ruler here
-- would give the wrong lord of the year and the wrong chart ruler.
--
-- Generated from validated data, not hand-written SQL. Safe to re-run.

UPDATE public.learn_lessons SET
  duration_minutes = 7,
  objectives = ARRAY['Read inter-aspects between two charts','Lay one chart planets into the other whole-sign houses','Weigh which contacts actually carry a relationship'],
  key_terms  = ARRAY['synastry','aspect'],
  slides = $json$[
  {
    "title": "Two charts, one grid",
    "visual": "planet_row",
    "content": "Synastry lays two birth charts over each other and reads the contacts. Their Venus to your Mars. Your Saturn to their Moon. Each contact is a specific, repeatable dynamic between two specific people, and not a compatibility score."
  },
  {
    "title": "House overlays do the heavy lifting",
    "visual": "house_circle",
    "content": "Drop their planets into your whole-sign houses. Their Sun in your 7th feels like a partner. The same Sun in your 12th feels like something you cannot quite see. The overlay tells you the role they occupy in your life."
  },
  {
    "title": "Overlays run both ways and rarely match",
    "visual": "house_circle",
    "content": "You put their planets into your houses, and they put yours into theirs. Because your houses hold different signs, the two readings are usually different, and that asymmetry is most of what couples actually argue about."
  },
  {
    "title": "Weigh the contacts",
    "visual": "zodiac_wheel",
    "content": "Sun, Moon, Venus, Mars and the Ascendant are what carry a relationship. Contacts between two outer planets are shared by nearly everyone born around the same time and say almost nothing about a particular pair of people."
  },
  {
    "title": "Hard aspects hold, soft aspects please",
    "visual": "planet_row",
    "content": "Squares and oppositions between two charts generate the friction that keeps people engaged with each other. Trines feel wonderful and can quietly be forgotten. Long relationships usually run on a mixture rather than on ease alone."
  }
]$json$::jsonb,
  quiz   = $json$[
  {
    "q": "Their Sun falls in your 12th house. What does the overlay suggest?",
    "choices": [
      "They occupy a part of your life you find hard to see clearly",
      "They will be your public partner",
      "The relationship cannot work"
    ],
    "answer": 0,
    "explain": "The 12th is the unseen and the withdrawn, so their presence there is felt without being easy to look at directly. The 7th is the house of the visible partner, and an overlay describes a dynamic rather than issuing a verdict on whether something works."
  },
  {
    "q": "Why must overlays be read in both directions?",
    "choices": [
      "Each person puts the other planets into their own houses, and the two readings usually differ",
      "Because one direction is always wrong",
      "Because the aspects change depending on direction"
    ],
    "answer": 0,
    "explain": "Houses belong to whoever the chart belongs to, so your 7th and their 7th hold different signs and the same planet lands in different territory each way. Neither direction is wrong, and inter-aspects stay symmetrical even though overlays do not."
  },
  {
    "q": "Which contact tells you most about a specific pair?",
    "choices": [
      "Their Moon square your Venus",
      "Their Neptune trine your Pluto",
      "Their Uranus sextile your Neptune"
    ],
    "answer": 0,
    "explain": "Moon and Venus are fast personal points, so a contact between them belongs to these two people in particular. Contacts between two outer planets are shared by nearly everyone born within years of each other and distinguish nothing."
  },
  {
    "q": "A couple has only trines and sextiles between their charts. What does this lesson suggest?",
    "choices": [
      "It feels easy, and may lack the friction that keeps people engaged",
      "It is the strongest possible match",
      "One of the two charts must be wrong"
    ],
    "answer": 0,
    "explain": "Ease is pleasant but nothing in it demands attention, and squares and oppositions are what generate the engagement that holds a long relationship together. Nothing about an all-soft synastry suggests a calculation error."
  },
  {
    "q": "What is synastry actually producing?",
    "choices": [
      "A set of specific dynamics between two people",
      "A single compatibility percentage",
      "A prediction of how long the relationship lasts"
    ],
    "answer": 0,
    "explain": "Each contact describes one repeatable dynamic, and the reading is the collection of them rather than a number. A percentage flattens exactly the detail that makes the technique useful, and duration is not something the contacts encode."
  },
  {
    "q": "Their Saturn conjuncts your Moon. What is the honest reading?",
    "choices": [
      "They steady your emotional life, and can also feel like a weight on it",
      "They will make you unhappy",
      "Saturn contacts are always bad in synastry"
    ],
    "answer": 0,
    "explain": "Saturn structures whatever it touches, so on the Moon it reads as security or as constraint and usually as both across time. Declaring unhappiness overstates what one contact can say, and Saturn contacts are among the most common in lasting relationships."
  }
]$json$::jsonb
WHERE id = 'l3-1-synastry';

UPDATE public.learn_lessons SET
  duration_minutes = 7,
  objectives = ARRAY['Build a relationship as a chart in its own right','Read the composite in whole sign','Use the 1st house ruler to find the bond centre of gravity'],
  key_terms  = ARRAY['composite','ruler'],
  slides = $json$[
  {
    "title": "The relationship gets its own chart",
    "visual": "zodiac_wheel",
    "content": "Synastry reads two people against each other. A composite reads the relationship itself as a third thing, with its own Sun, Moon, houses and rising sign, and its own priorities that neither person actually chose."
  },
  {
    "title": "Composite versus Davison",
    "visual": "planet_row",
    "content": "A composite is built from the midpoint between each pair of planets. A Davison is a real chart cast for the midpoint in time and place between two births. Composite is more common. Davison is an actual moment, so it can be transited."
  },
  {
    "title": "Read it as a chart, not a verdict",
    "visual": "house_circle",
    "content": "The composite Sun is what the relationship is for. The composite Moon is what it needs in order to feel safe. The composite Ascendant is how the whole thing appears to everybody standing outside it."
  },
  {
    "title": "The 1st house ruler is the centre of gravity",
    "visual": "house_circle",
    "content": "Find the composite rising sign, take its Align ruler, then find which composite house that ruler occupies. That house is what the relationship keeps organising itself around, whether or not either person would ever name it."
  },
  {
    "title": "It has no birthday of its own",
    "visual": "planet_row",
    "content": "A composite is a constructed chart rather than a moment anyone lived through, so treat transits to it as suggestive rather than exact. If you want something properly transitable, use the Davison, which is a real time and place."
  }
]$json$::jsonb,
  quiz   = $json$[
  {
    "q": "What is a composite chart?",
    "choices": [
      "A third chart built from the midpoints between two people planets",
      "The chart of whichever person is older",
      "Two charts drawn on a single wheel"
    ],
    "answer": 0,
    "explain": "Every composite planet is the midpoint of the corresponding pair, producing a chart belonging to the relationship rather than to either person. Two charts on one wheel is a synastry bi-wheel, which is a different technique entirely."
  },
  {
    "q": "How does a Davison chart differ?",
    "choices": [
      "It is cast for the midpoint in time and place, so it is a real moment",
      "It uses only the Sun and the Moon",
      "It is the same thing under another name"
    ],
    "answer": 0,
    "explain": "A Davison takes the midpoint date, time and location and casts an ordinary chart for it, which is why it can be transited and progressed like any nativity. A composite is constructed from midpoints and corresponds to no real moment."
  },
  {
    "q": "The composite Ascendant is Scorpio. Who rules the relationship in the Align system?",
    "choices": [
      "Pluto, and you then find which composite house it occupies",
      "Mars, and you find its house",
      "The composite Sun rules it"
    ],
    "answer": 0,
    "explain": "The Align ruler of Scorpio is Pluto, and the next step is always locating that ruler to see what the bond organises itself around. Mars is the traditional Scorpio ruler and is not used in Align, and the Sun rules a chart only when Leo rises."
  },
  {
    "q": "What does the composite Sun describe?",
    "choices": [
      "What the relationship is for",
      "Which of the two people leads",
      "How long the relationship will last"
    ],
    "answer": 0,
    "explain": "The Sun is purpose and direction, so in a composite it names what the relationship exists to do. Leadership is not encoded in a chart built from the midpoints of both people, and duration is not something any natal factor states."
  },
  {
    "q": "Why treat transits to a composite cautiously?",
    "choices": [
      "It is a constructed chart rather than a real moment in time",
      "Composites have no houses",
      "Transits never apply to relationships"
    ],
    "answer": 0,
    "explain": "Because no clock ever read the composite time, transits to it are suggestive rather than precisely timed, which is exactly why the Davison exists as the alternative. Composites do have houses, and relationships are reachable by transit through both natal charts."
  },
  {
    "q": "A couple has warm synastry but a difficult composite. What is the most useful reading?",
    "choices": [
      "They get on well, and the thing they build together is harder than the getting on",
      "The composite is wrong and should be ignored",
      "They are fundamentally incompatible"
    ],
    "answer": 0,
    "explain": "Synastry describes how two people meet each other while the composite describes the entity they form, and those two can genuinely diverge. Discarding the harder chart throws away information, and incompatibility is a verdict neither technique issues."
  }
]$json$::jsonb
WHERE id = 'l3-2-composite';

UPDATE public.learn_lessons SET
  duration_minutes = 7,
  objectives = ARRAY['Explain the day-for-a-year key','Track your progressed Moon by sign and whole-sign house','Read where you are in the progressed lunation cycle'],
  key_terms  = ARRAY['progression'],
  slides = $json$[
  {
    "title": "One day equals one year",
    "visual": "zodiac_wheel",
    "content": "Secondary progressions map the days after your birth onto the years of your life. The sky on your thirtieth day describes your thirtieth year. It is a symbolic key rather than a physical claim about where the planets are now."
  },
  {
    "title": "Most planets barely move",
    "visual": "planet_row",
    "content": "In thirty days the Sun advances about thirty degrees and the outer planets go almost nowhere at all. So progressions are mostly about the Sun changing sign roughly every thirty years, and about the Moon, which is where the movement is."
  },
  {
    "title": "The progressed Moon is the useful one",
    "visual": "house_circle",
    "content": "The progressed Moon spends about two and a half years in each sign and whole-sign house, working around the entire chart in roughly twenty-seven and a half years. It describes the emotional chapter you are currently living in."
  },
  {
    "title": "The progressed lunation cycle",
    "visual": "zodiac_wheel",
    "content": "The progressed Moon and progressed Sun make their own new and full Moon about every twenty-nine and a half years. A progressed new Moon starts a chapter you cannot see yet. The progressed full Moon shows you what it became."
  },
  {
    "title": "Read the house before the sign",
    "visual": "house_circle",
    "content": "Which whole-sign house holds your progressed Moon tells you where life is asking for attention over the next couple of years. The sign tells you the mood of it. The house is the part you can actually act on."
  }
]$json$::jsonb,
  quiz   = $json$[
  {
    "q": "What is the day-for-a-year key?",
    "choices": [
      "The sky a given number of days after birth describes that numbered year of life",
      "The chart is recalculated each year on your birthday",
      "Each planet advances one degree per year of life"
    ],
    "answer": 0,
    "explain": "Secondary progressions map days after birth onto years of life, so the thirtieth day describes the thirtieth year. Recasting on a birthday is the solar return, and a fixed degree per year describes solar arc, which is a separate technique."
  },
  {
    "q": "Why is the progressed Moon the most used progression?",
    "choices": [
      "It moves fast enough to change sign and house every couple of years",
      "It is the only body that progresses",
      "It is more accurate than the progressed Sun"
    ],
    "answer": 0,
    "explain": "Roughly two and a half years per sign gives it a usable rhythm across a lifetime, where the progressed Sun changes sign about every thirty years and the outer planets barely move. Every body progresses, and neither is more accurate than the other."
  },
  {
    "q": "Roughly how long does the progressed Moon take to circle the whole chart?",
    "choices": [
      "About twenty-seven and a half years",
      "About twelve years",
      "About seven years"
    ],
    "answer": 0,
    "explain": "Twelve signs at roughly two and a half years each gives about twenty-seven and a half years for a full circuit, which is why the late twenties so often read as the close of a chapter. Twelve years is the Jupiter cycle and seven is a Saturn quarter."
  },
  {
    "q": "You are at a progressed new Moon. What does this lesson suggest?",
    "choices": [
      "A chapter is beginning whose shape you cannot see yet",
      "A chapter is ending and the results are visible",
      "Nothing, progressed lunations are not readable"
    ],
    "answer": 0,
    "explain": "A progressed new Moon starts the cycle in the dark before there is any evidence, exactly like an ordinary new Moon but on a far longer timescale. Visible results belong to the progressed full Moon roughly fifteen years later."
  },
  {
    "q": "Your progressed Moon has entered your 6th house. What is the useful first read?",
    "choices": [
      "Daily work and health are where life will ask for attention for the next couple of years",
      "You will change career permanently",
      "It only matters once it aspects a natal planet"
    ],
    "answer": 0,
    "explain": "The house names the arena and the duration is the two-odd years the progressed Moon spends there, which is enough to say where attention goes. A permanent career change is a specific outcome the placement does not promise."
  },
  {
    "q": "Progressions are best described as...",
    "choices": [
      "A symbolic key rather than a physical claim about the sky",
      "A literal prediction of planetary positions in that year",
      "A recalculation of the birth chart"
    ],
    "answer": 0,
    "explain": "The day-for-a-year correspondence is symbolic, since nobody claims the sky on your thirtieth day physically governs your thirtieth year. The progressed positions are real positions from real days, but not where the planets sit during the year in question."
  }
]$json$::jsonb
WHERE id = 'l3-3-progressions';

UPDATE public.learn_lessons SET
  duration_minutes = 7,
  objectives = ARRAY['Read a solar return for the year ahead','Read a lunar return for the month','Place return planets in whole-sign houses'],
  key_terms  = ARRAY['solar-return'],
  slides = $json$[
  {
    "title": "A return is the sky repeating a position",
    "visual": "zodiac_wheel",
    "content": "Your solar return is the exact moment each year that the Sun comes back to the degree it held when you were born. It is rarely midnight on your birthday, and it is a complete chart cast for that instant."
  },
  {
    "title": "The return rising sign sets the year",
    "visual": "house_circle",
    "content": "The most important thing in a solar return is what was rising at that moment, because it sets all twelve return houses. That rising sign changes every year, which is why two consecutive years can feel nothing alike."
  },
  {
    "title": "Read return planets in return houses",
    "visual": "house_circle",
    "content": "A solar return is read as a chart in its own right: which house holds the return Sun, where the return Moon fell, which house the return ruler occupies. It describes the coming year and then it expires."
  },
  {
    "title": "Location matters more than you expect",
    "visual": "planet_row",
    "content": "A return is cast for wherever you actually are at that moment, so being in a different city changes the angles and therefore every single house. This is the entire basis of deliberately travelling for a birthday."
  },
  {
    "title": "Lunar returns are the monthly version",
    "visual": "zodiac_wheel",
    "content": "The Moon returns to its natal degree about every twenty-seven and a third days. That chart describes the month in the same way at lower volume, and it is most useful for emotional and domestic timing."
  }
]$json$::jsonb,
  quiz   = $json$[
  {
    "q": "When exactly does your solar return occur?",
    "choices": [
      "The moment the Sun reaches its exact natal degree, rarely midnight on your birthday",
      "At midnight at the start of your birthday",
      "Whenever you choose to cast it"
    ],
    "answer": 0,
    "explain": "The return is an astronomical event fixed by the Sun reaching a specific degree, and it can fall the day before or after the calendar birthday. Casting it at a chosen time would make it an ordinary chart for that time rather than a return."
  },
  {
    "q": "What is the most important single factor in a solar return chart?",
    "choices": [
      "The rising sign at the return moment, because it sets all twelve houses",
      "Whether the return Sun is in a fire sign",
      "The Moon phase on your birthday"
    ],
    "answer": 0,
    "explain": "The return Ascendant determines where every return planet lands by house, so it frames the entire year and changes annually. The return Sun always sits at your natal Sun degree by definition, so its sign is never new information."
  },
  {
    "q": "Why does the location you are in at the return moment matter?",
    "choices": [
      "It changes the angles, and therefore which houses every return planet falls in",
      "It changes the sign the Sun is in",
      "It does not matter at all"
    ],
    "answer": 0,
    "explain": "Angles are computed from latitude and longitude, so a different city produces a different rising sign and an entirely different house layout for the same instant. The Sun degree is identical everywhere at that moment, which is why the houses carry the difference."
  },
  {
    "q": "How often does a lunar return happen?",
    "choices": [
      "About every twenty-seven and a third days",
      "About every twenty-nine and a half days",
      "Once a month on the same calendar date"
    ],
    "answer": 0,
    "explain": "The lunar return follows the sidereal month, the Moon returning to a fixed degree, which is a little over twenty-seven days. Twenty-nine and a half days is the synodic month from new Moon to new Moon, which measures something different."
  },
  {
    "q": "What is the shelf life of a solar return chart?",
    "choices": [
      "Roughly the year until the next return, after which it expires",
      "The whole of the native life",
      "One month"
    ],
    "answer": 0,
    "explain": "A return chart describes the period until the next return and is then replaced, which is what makes it a forecasting tool rather than a second natal chart. A month is the lunar return window rather than the solar one."
  },
  {
    "q": "The return Moon lands in the return 10th house. What is the first thing to say?",
    "choices": [
      "Public life and career will be emotionally live this year",
      "You will be promoted",
      "Nothing, until it aspects a natal planet"
    ],
    "answer": 0,
    "explain": "The Moon marks where feeling and need concentrate and the 10th is standing and career, so the pairing names the arena for the year. A promotion is a specific outcome the placement does not promise, and a return chart reads in its own right."
  }
]$json$::jsonb
WHERE id = 'l3-4-returns';

UPDATE public.learn_lessons SET
  duration_minutes = 6,
  objectives = ARRAY['Advance one whole sign per year of life','Find the profected house and its Align ruler, the lord of the year','Combine the lord of the year with transits and the return'],
  key_terms  = ARRAY['profection','ruler'],
  slides = $json$[
  {
    "title": "The simplest time-lord there is",
    "visual": "house_circle",
    "content": "At age zero you are in your 1st house. At one, the 2nd. One whole sign per year, once around the wheel every twelve years. That is the entire calculation, and it needs no software and no ephemeris."
  },
  {
    "title": "Do the arithmetic in your head",
    "visual": "house_circle",
    "content": "Take your age, divide by twelve, keep the remainder, then count that many houses on from the 1st. Age thirty-four leaves a remainder of ten, so the profected house is the 11th. That is the whole method."
  },
  {
    "title": "The ruler of that house is the lord of the year",
    "visual": "planet_row",
    "content": "Find the sign on the profected house, take its Align ruler, and that planet runs your year. Everywhere it sits, everything it touches, and every transit to it becomes disproportionately important for the next twelve months."
  },
  {
    "title": "This is what makes transits selective",
    "visual": "planet_row",
    "content": "Dozens of transits are always running. Profection tells you which of them matter now. A transit to the lord of the year is loud. The same transit to an unrelated planet, in a year it does not rule, often passes unnoticed."
  },
  {
    "title": "Twelve-year echoes",
    "visual": "house_circle",
    "content": "Because the cycle is twelve years long, ages twelve, twenty-four, thirty-six and forty-eight all return to the 1st house and to the same lord of the year. Those years rhyme, and comparing them is unusually useful."
  }
]$json$::jsonb,
  quiz   = $json$[
  {
    "q": "You are thirty-four. Which house are you profecting to?",
    "choices": [
      "The 11th",
      "The 10th",
      "The 3rd"
    ],
    "answer": 0,
    "explain": "Thirty-four divided by twelve leaves a remainder of ten, and counting ten houses on from the 1st lands on the 11th. Answering the 10th is the classic off-by-one that comes from counting the 1st house as one rather than as zero."
  },
  {
    "q": "Your profected house holds Capricorn. Who is the lord of the year?",
    "choices": [
      "Saturn",
      "Uranus",
      "Whichever planet happens to sit in that house"
    ],
    "answer": 0,
    "explain": "Capricorn is ruled by Saturn in the Align system as in every other, so Saturn takes the year. Uranus rules Aquarius here, and an occupying planet matters to the reading but the lord of the year is always the ruler of the sign."
  },
  {
    "q": "What does knowing the lord of the year actually buy you?",
    "choices": [
      "It tells you which of the many active transits matter this year",
      "It predicts a specific event",
      "It removes the need to look at transits"
    ],
    "answer": 0,
    "explain": "Profection works as a filter: dozens of transits are always running, and this names the one planet whose contacts are amplified for twelve months. It predicts no specific event, and it makes transits more useful rather than unnecessary."
  },
  {
    "q": "Why do ages twelve, twenty-four and thirty-six rhyme?",
    "choices": [
      "The cycle is twelve years, so all three return to the 1st house and the same lord",
      "Because Jupiter returns at exactly those ages",
      "They do not, it is coincidence"
    ],
    "answer": 0,
    "explain": "Twelve houses at one year each brings the profection back to the 1st every twelve years, restoring both the same house and the same lord of the year. Jupiter does return on a roughly twelve-year cycle, but the profection is a separate count."
  },
  {
    "q": "How does profection combine with a solar return?",
    "choices": [
      "You find the lord of the year inside the return chart and read the condition it is in",
      "They are alternatives and should not be mixed",
      "The return replaces the profection"
    ],
    "answer": 0,
    "explain": "The profection names the planet and the return describes the year, so locating that planet inside the return chart is exactly how the two are meant to be layered. They are complementary techniques rather than competing ones."
  },
  {
    "q": "At age twenty-five, which house are you profecting to?",
    "choices": [
      "The 2nd",
      "The 1st",
      "The 3rd"
    ],
    "answer": 0,
    "explain": "Twenty-five divided by twelve leaves a remainder of one, and counting one house on from the 1st gives the 2nd. Age twenty-four returns to the 1st, so twenty-five moves one further, which is where the off-by-one usually creeps in."
  }
]$json$::jsonb
WHERE id = 'l3-5-profections';

UPDATE public.learn_lessons SET
  duration_minutes = 6,
  objectives = ARRAY['Explain declination as distance north or south of the celestial equator','Tell a parallel from a contraparallel','Read an out-of-bounds Moon'],
  key_terms  = ARRAY['declination','out-of-bounds'],
  slides = $json$[
  {
    "title": "A second measurement entirely",
    "visual": "zodiac_wheel",
    "content": "Everything so far has measured planets along the zodiac. Declination measures something else: how far north or south of the celestial equator a body sits. Two planets can make no aspect at all and still be tightly linked by declination."
  },
  {
    "title": "Parallel and contraparallel",
    "visual": "planet_row",
    "content": "Two planets at the same declination on the same side of the equator are parallel, and that behaves like a conjunction. Same declination on opposite sides is a contraparallel, behaving like an opposition. Neither appears on an ordinary chart wheel."
  },
  {
    "title": "Out of bounds means past the solar limit",
    "visual": "planet_row",
    "content": "The Sun never exceeds about twenty-three degrees and twenty-six minutes of declination. A body beyond that is out of bounds: operating outside the boundary the Sun sets, off the map of the ordinary rules."
  },
  {
    "title": "The out-of-bounds Moon",
    "visual": "planet_row",
    "content": "The Moon goes out of bounds far more often than anything else. An out-of-bounds natal Moon reads as an emotional life that does not obey the household it grew up in, for better and for worse in roughly equal measure."
  },
  {
    "title": "Why it explains outliers",
    "visual": "zodiac_wheel",
    "content": "When somebody is unmistakably extreme in a way the ordinary chart does not account for, declination is the first place to look. It is the layer that catches what measuring along the zodiac alone will always miss."
  }
]$json$::jsonb,
  quiz   = $json$[
  {
    "q": "What does declination measure?",
    "choices": [
      "How far north or south of the celestial equator a body sits",
      "How far along the zodiac a body has travelled",
      "How far a planet is from Earth"
    ],
    "answer": 0,
    "explain": "Declination is the north-south coordinate, entirely separate from the zodiacal longitude in which every aspect is measured. Distance from Earth is a third quantity again and plays no part in either aspects or declination."
  },
  {
    "q": "Two planets sit at the same declination on the same side of the equator. What is that?",
    "choices": [
      "A parallel, which behaves like a conjunction",
      "A contraparallel, which behaves like an opposition",
      "An out-of-bounds pair"
    ],
    "answer": 0,
    "explain": "Same declination on the same side is the parallel, and it reads with conjunction-like fusion. A contraparallel requires opposite sides of the equator, and out of bounds concerns exceeding a limit rather than two bodies matching each other."
  },
  {
    "q": "What makes a planet out of bounds?",
    "choices": [
      "Its declination exceeds the solar maximum of about twenty-three degrees twenty-six minutes",
      "It sits in the 12th house",
      "It is retrograde"
    ],
    "answer": 0,
    "explain": "The solar declination limit defines the boundary, so a body past it is operating outside the range the Sun ever reaches. House placement and retrograde motion are unrelated conditions measured in completely different ways."
  },
  {
    "q": "Which body goes out of bounds most often?",
    "choices": [
      "The Moon",
      "Saturn",
      "The Sun"
    ],
    "answer": 0,
    "explain": "The inclination of the lunar orbit carries the Moon past the solar limit regularly, which is why out-of-bounds discussion is mostly about the Moon. The Sun defines the limit and so can never exceed it, and the slow outer bodies rarely do."
  },
  {
    "q": "Why check declination at all?",
    "choices": [
      "It catches links and extremes that measuring along the zodiac alone misses",
      "It is more accurate than aspects",
      "It replaces house placement"
    ],
    "answer": 0,
    "explain": "It is a second and independent measurement, so it finds connections between planets making no aspect and explains outliers the ordinary chart cannot account for. It is not more accurate than aspects and it does not replace houses."
  },
  {
    "q": "An out-of-bounds natal Moon reads as...",
    "choices": [
      "An emotional life that does not obey the household it grew up in",
      "An unusually calm and regulated emotional life",
      "An error in the birth data"
    ],
    "answer": 0,
    "explain": "Out of bounds means operating outside the boundary the Sun sets, and on the Moon that shows as feeling and need which do not follow the family pattern. It is a common and entirely valid condition rather than a sign of bad data."
  }
]$json$::jsonb
WHERE id = 'l3-6-declination';

UPDATE public.learn_lessons SET
  duration_minutes = 6,
  objectives = ARRAY['Calculate a midpoint between two planets','Read the Sun and Moon midpoint','Spot a planet sitting on a midpoint and say what it does'],
  key_terms  = ARRAY['midpoint','orb'],
  slides = $json$[
  {
    "title": "The point exactly between",
    "visual": "zodiac_wheel",
    "content": "A midpoint is the degree halfway between two planets. Nothing is physically there, but when a third planet lands on it, that planet fuses the original two into a single statement you can read as one sentence."
  },
  {
    "title": "The Sun and Moon midpoint is the one to know",
    "visual": "planet_row",
    "content": "The Sun and Moon midpoint is the point of inner union: what you are and what you need, averaged into a single degree. Anything sitting on it describes what closes the gap, which is why it reads so strongly in relationship work."
  },
  {
    "title": "Read a picture in three parts",
    "visual": "planet_row",
    "content": "A planet on a midpoint gives you a sentence with three words. Saturn on the Venus and Mars midpoint reads as desire and affection meeting structure and delay. Name the pair, then name whatever arrived on top of them."
  },
  {
    "title": "Use tight orbs",
    "visual": "zodiac_wheel",
    "content": "Midpoints only work close. Keep the orb to a degree or two. A midpoint picture allowed five degrees of orb is noise, and the technique gets its poor reputation almost entirely from people who allowed exactly that."
  },
  {
    "title": "Where midpoints earn their keep",
    "visual": "house_circle",
    "content": "Midpoints find contacts the ordinary aspect list misses completely. When two people connect obviously and share no clean inter-aspect, one planet landing on a midpoint of the other is very often the explanation."
  }
]$json$::jsonb,
  quiz   = $json$[
  {
    "q": "What is a midpoint?",
    "choices": [
      "The degree exactly halfway between two planets",
      "The degree a planet will reach next",
      "The average position of every planet in a chart"
    ],
    "answer": 0,
    "explain": "A midpoint is the halfway degree between one specific pair, and it becomes readable when a third body occupies it. The average of every planet is a different construct entirely, and future positions are transits rather than midpoints."
  },
  {
    "q": "Why is the Sun and Moon midpoint singled out?",
    "choices": [
      "It is the point where what you are and what you need meet",
      "It is the fastest moving midpoint",
      "It is the only midpoint that can be occupied"
    ],
    "answer": 0,
    "explain": "The Sun is identity and the Moon is need, so the point averaging them describes inner union, which is why it reads so strongly in relationship work. Any midpoint can be occupied, and speed is not what makes this one significant."
  },
  {
    "q": "What orb should a midpoint picture use?",
    "choices": [
      "A degree or two at most",
      "Up to eight degrees, as with a major aspect",
      "Orb does not apply to midpoints"
    ],
    "answer": 0,
    "explain": "Midpoints only hold at tight orbs, and stretching them to major-aspect width produces a picture for very nearly anything, which is where the technique earns its poor reputation. Orb very much applies, it is simply far narrower here."
  },
  {
    "q": "Saturn sits on the Venus and Mars midpoint. What is the reading?",
    "choices": [
      "Desire and affection meeting structure, restraint or delay",
      "Saturn is weakened by Venus and Mars",
      "Venus and Mars stop functioning"
    ],
    "answer": 0,
    "explain": "Read it as a three-part sentence, where the pair supplies the subject and the occupying planet supplies what happened to it. The occupying planet is not weakened by the pair, and neither of the original two planets stops working."
  },
  {
    "q": "Two people connect obviously but share no clean inter-aspect. What does this lesson suggest checking?",
    "choices": [
      "Whether a planet of one lands on a midpoint of the other",
      "Whether one of the charts is wrong",
      "Whether they share a Sun sign"
    ],
    "answer": 0,
    "explain": "Midpoints catch exactly the contacts the ordinary aspect list misses, which is the situation described. Doubting the data should come after exhausting the technique, and a shared Sun sign is neither necessary nor sufficient for a strong connection."
  },
  {
    "q": "How many midpoints does a chart contain?",
    "choices": [
      "One for every pair of planets, which is why you work from the ones you care about",
      "Twelve, one for each house",
      "One, the Sun and Moon midpoint"
    ],
    "answer": 0,
    "explain": "Every pair of planets produces a midpoint, so the count grows very quickly and the discipline is choosing which to examine rather than listing them all. There is no per-house limit, and the Sun and Moon midpoint is merely the most used of many."
  }
]$json$::jsonb
WHERE id = 'l3-7-midpoints';
