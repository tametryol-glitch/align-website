-- Level 1, lessons 2-7 rebuilt to the Learn Loop standard.
--
-- Same shape as l1-1: five dual-coded slides of roughly 40 words each against
-- a live visual, and four retrieval questions whose explanations say why the
-- other answers are weaker.
--
-- The astrology is unchanged from the existing lessons and follows the Align
-- rulership exactly (Virgo=Vesta, Libra=Juno, Scorpio=Pluto, Aquarius=Uranus,
-- Pisces=Neptune). The markdown content bodies are deliberately left alone:
-- they are already real, and they only show when a lesson has no slides.
--
-- Every visual named renders with no visualData. Safe to re-run.

UPDATE public.learn_lessons SET
  duration_minutes = 6,
  objectives = ARRAY['Read any sign as one element crossed with one mode','Derive how a sign behaves from that pair alone','Spot which element and mode your own chart leans on'],
  key_terms  = ARRAY['aspect'],
  slides = $json$[
  {
    "title": "You do not need to memorise twelve",
    "visual": "element_grid",
    "content": "Twelve signs sounds like twelve things to learn. It is two. Every sign is one element crossed with one mode, four times three. Learn the grid and you can rebuild any sign you have forgotten."
  },
  {
    "title": "Element is what fuels it",
    "visual": "element_grid",
    "content": "Fire (Aries, Leo, Sagittarius) burns for its own sake. Earth (Taurus, Virgo, Capricorn) wants a result you can touch. Air (Gemini, Libra, Aquarius) runs on ideas and other people. Water (Cancer, Scorpio, Pisces) moves on feeling."
  },
  {
    "title": "Mode is when it moves",
    "visual": "zodiac_wheel",
    "content": "Cardinal signs start things: Aries, Cancer, Libra, Capricorn, each opening a season. Fixed signs hold: Taurus, Leo, Scorpio, Aquarius. Mutable signs bend and hand over: Gemini, Virgo, Sagittarius, Pisces."
  },
  {
    "title": "The pair does the work",
    "visual": "zodiac_wheel",
    "content": "Scorpio is fixed water: feeling that will not let go. Gemini is mutable air: ideas that will not sit still. Capricorn is cardinal earth: it starts things that must produce. You just derived three signs from a grid."
  },
  {
    "title": "What your own grid leans on",
    "visual": "element_grid",
    "content": "Count your planets by element and by mode. Heavy fire with no earth starts more than it finishes. Heavy fixed with no mutable holds a position long past its use. The gaps tell you more than the clusters."
  }
]$json$::jsonb,
  quiz   = $json$[
  {
    "q": "A sign is cardinal water. Without looking it up, what can you already say about it?",
    "choices": [
      "It initiates through feeling, so it starts things emotionally",
      "It sustains one fixed emotional position",
      "It adapts its feelings to whoever is present"
    ],
    "answer": 0,
    "explain": "Cardinal means it initiates and water means the fuel is feeling. That is Cancer. The second answer describes fixed water (Scorpio) and the third mutable water (Pisces): same element, different mode, completely different behaviour."
  },
  {
    "q": "A chart has five planets in Fire and none in Earth. What is the likeliest lived pattern?",
    "choices": [
      "Plenty of starts, few finished results",
      "Constant emotional overwhelm",
      "An inability to form opinions"
    ],
    "answer": 0,
    "explain": "Earth is the element that turns drive into something you can touch. Without it, fire keeps igniting and nothing sets. Overwhelm is a water signature and indecision is closer to an air one, so neither follows from fire-heavy and earth-empty."
  },
  {
    "q": "Which of these three signs shares an element with Aquarius?",
    "choices": [
      "Gemini",
      "Pisces",
      "Capricorn"
    ],
    "answer": 0,
    "explain": "Aquarius is air, and so is Gemini. The water-bearer pours water but the sign itself is air, which is the single most common misread in the zodiac. Pisces is water and Capricorn is earth."
  },
  {
    "q": "Every season opens with a cardinal sign. Which four are they?",
    "choices": [
      "Aries, Cancer, Libra, Capricorn",
      "Taurus, Leo, Scorpio, Aquarius",
      "Gemini, Virgo, Sagittarius, Pisces"
    ],
    "answer": 0,
    "explain": "Those four sit at the equinoxes and solstices, the moments the light actually turns. The second set is fixed, holding the middle of each season, and the third is mutable, handing over into the next."
  }
]$json$::jsonb
WHERE id = 'l1-2-the-signs';

UPDATE public.learn_lessons SET
  duration_minutes = 6,
  objectives = ARRAY['Say what each planet actually does in a life','Separate personal, social and outer planets by how fast they move','Read Vesta and Juno as full rulers, not minor asteroids'],
  key_terms  = ARRAY['ruler','domicile'],
  slides = $json$[
  {
    "title": "The planets are the verbs",
    "visual": "planet_row",
    "content": "Signs are how something happens. Planets are what is happening. Mars is not aggression, Mars is wanting, and the sign tells you how you want. Get that order right and interpretation stops being guesswork."
  },
  {
    "title": "The two lights run the show",
    "visual": "planet_row",
    "content": "The Sun is what you are becoming: vitality, purpose, the thing you are quietly proud of. The Moon is what you need to feel safe, and what you do without deciding when you are tired. Most people live from the Moon and credit the Sun."
  },
  {
    "title": "Personal, social and outer is really a speed chart",
    "visual": "planet_row",
    "content": "Mercury, Venus and Mars move fast, so they describe you. Jupiter and Saturn take years, so they describe your cohort. Uranus, Neptune and Pluto take decades, so they mark whole generations and turn personal only through house and aspect."
  },
  {
    "title": "Vesta and Juno are not minor here",
    "visual": "planet_row",
    "content": "In Align, Vesta rules Virgo and Juno rules Libra, which makes them full chart rulers rather than footnotes. Vesta is the tended flame and devotion to a craft. Juno is the contract and the chosen other."
  },
  {
    "title": "Read one planet properly",
    "visual": "planet_row",
    "content": "Take your Mars. Name what it wants, which is drive and desire. Read its sign for how it goes about wanting. Read its house for where it spends itself. Three steps, then repeat them ten more times. That is the method."
  }
]$json$::jsonb,
  quiz   = $json$[
  {
    "q": "Pluto stays in one sign for well over a decade. What does that tell you about reading a Pluto sign?",
    "choices": [
      "It describes a generation, and only house and aspect make it personal",
      "It is the most personal placement in the chart",
      "It changes meaning every year"
    ],
    "answer": 0,
    "explain": "Everyone born across roughly a decade shares it, so on its own it cannot tell two people apart. What individualises an outer planet is the house it landed in and what it touches, because those are chart-specific."
  },
  {
    "q": "In the Align system, which planet rules Virgo?",
    "choices": [
      "Vesta",
      "Mercury",
      "Saturn"
    ],
    "answer": 0,
    "explain": "Vesta, the tended flame and devotion to a craft, rules Virgo in Align. Mercury is the conventional answer and is not used here, where it keeps Gemini alone. Reading Virgo through Mercury hands you the wrong ruler for every Virgo house in every chart."
  },
  {
    "q": "You want to know how someone pursues what they want. Which placement do you read first?",
    "choices": [
      "Mars, by sign and house",
      "The Sun, by sign",
      "Jupiter, by house"
    ],
    "answer": 0,
    "explain": "Mars is desire and drive, which is the how of pursuit. The Sun is the direction you are growing in rather than the way you chase it, and Jupiter shows where you expand, not how you push."
  },
  {
    "q": "Someone calls the Moon just moods. What is the sharper reading?",
    "choices": [
      "What you need to feel safe, and what you default to when depleted",
      "Your public personality",
      "Your long-term purpose"
    ],
    "answer": 0,
    "explain": "The Moon is the baseline you return to, not the face you present, which is nearer the Ascendant, and not the direction of growth, which is the Sun. Calling it moods throws away the part that predicts behaviour under stress."
  }
]$json$::jsonb
WHERE id = 'l1-3-the-planets';

UPDATE public.learn_lessons SET
  duration_minutes = 7,
  objectives = ARRAY['Build all twelve houses from the rising sign alone','Name what each house governs','Say why one sign per house keeps rulership clean'],
  key_terms  = ARRAY['whole-sign-houses','ascendant'],
  slides = $json$[
  {
    "title": "One rule builds all twelve",
    "visual": "house_circle",
    "content": "Your rising sign is your entire 1st house. The next sign is your entire 2nd. Keep going once around the wheel. That is the whole construction: no degrees, no splitting, and no house holding two signs."
  },
  {
    "title": "Why we never split a house",
    "visual": "house_circle",
    "content": "Degree-based systems cut houses wherever the maths falls, so one house can straddle two signs and two rulers. Whole Sign refuses that. Every house gets exactly one sign and therefore exactly one ruler, and everything downstream gets cleaner."
  },
  {
    "title": "The first six are your own ground",
    "visual": "house_circle",
    "content": "1st self and body. 2nd resources and what you value. 3rd communication and siblings. 4th home and roots. 5th creativity and romance. 6th daily work and health. These are the houses you mostly live in alone."
  },
  {
    "title": "The last six all have someone else in them",
    "visual": "house_circle",
    "content": "7th partnership and the other. 8th depth, death and shared resources. 9th meaning and travel. 10th career and calling. 11th community and hopes. 12th the unconscious and retreat."
  },
  {
    "title": "Walk your own wheel",
    "visual": "zodiac_wheel",
    "content": "Find your rising sign and count forward. If Leo rises, your 2nd is Virgo, your 7th is Aquarius and your 10th is Taurus. You now know which signs govern your money, your partnerships and your career, in about ten seconds."
  }
]$json$::jsonb,
  quiz   = $json$[
  {
    "q": "Sagittarius is rising. Which sign is on the 7th house?",
    "choices": [
      "Gemini",
      "Sagittarius",
      "Virgo"
    ],
    "answer": 0,
    "explain": "Count six forward from Sagittarius: Capricorn, Aquarius, Pisces, Aries, Taurus, Gemini. The 7th is always the sign opposite the rising sign, which is a shortcut worth keeping for every chart you read."
  },
  {
    "q": "In Whole Sign, can a single house contain parts of two signs?",
    "choices": [
      "Never, one house holds one sign",
      "Yes, when a planet sits near a cusp",
      "Yes, in charts from high latitudes"
    ],
    "answer": 0,
    "explain": "That is the defining rule of the system. Houses straddling two signs belong to degree-based systems like Placidus, and high-latitude distortion is precisely the problem Whole Sign sidesteps."
  },
  {
    "q": "Why does one sign per house matter for interpretation?",
    "choices": [
      "Each house then has exactly one ruler, so the rulership chain stays unambiguous",
      "It makes the chart wheel easier to draw",
      "It makes every house equal in time"
    ],
    "answer": 0,
    "explain": "One sign means one ruler, which is what lets find the house, find its ruler, find where that ruler lives work every single time. The drawing is incidental, and equal size in space is not equal size in time."
  },
  {
    "q": "You want to read a career. Which house, and what do you need first?",
    "choices": [
      "The 10th, and you need the rising sign to know which sign sits on it",
      "The 6th, and you need the Sun sign",
      "The 2nd, and you need the birth year"
    ],
    "answer": 0,
    "explain": "Career and calling is the 10th. Without the rising sign you cannot say which sign occupies it and so cannot name its ruler. The 6th is daily work and health, a different question, and the 2nd is resources."
  }
]$json$::jsonb
WHERE id = 'l1-4-whole-sign-houses';

UPDATE public.learn_lessons SET
  duration_minutes = 6,
  objectives = ARRAY['Read Sun, Moon and Ascendant as one sentence rather than three labels','Say which of the three a stranger meets first','Name the Align ruler of your own 1st house'],
  key_terms  = ARRAY['ascendant','ruler'],
  slides = $json$[
  {
    "title": "Three placements, three different people",
    "visual": "zodiac_wheel",
    "content": "Your Sun is who you are becoming. Your Moon is who you are at two in the morning. Your Ascendant is who walks in the door. Most people are only ever told the first one, then wonder why it does not fit."
  },
  {
    "title": "Sun is the direction, not the description",
    "visual": "planet_row",
    "content": "The Sun is vitality and purpose: the thing you are growing into and are quietly proud of. It is not a summary of your behaviour. Treating it as one is exactly why sun-sign astrology feels wrong to so many people."
  },
  {
    "title": "Moon is what you need, not what you show",
    "visual": "planet_row",
    "content": "Your Moon is the emotional baseline: what makes you feel safe, and what you reach for automatically when you are tired or hurt. It predicts your behaviour under pressure better than any other single placement."
  },
  {
    "title": "Rising is the door, and the whole 1st house",
    "visual": "house_circle",
    "content": "The Ascendant is the lens you meet life through and the style people register first. In Whole Sign it is also your entire 1st house, which means its Align ruler becomes the ruler of your chart."
  },
  {
    "title": "Say it as one sentence",
    "visual": "zodiac_wheel",
    "content": "A Leo core, met through a Virgo style, needing Scorpio depth to feel at home. And because Virgo rises, Vesta rules the 1st: a chart pointed at devoted, exacting craft. That is synthesis, and you just did it."
  }
]$json$::jsonb,
  quiz   = $json$[
  {
    "q": "A stranger meets you at a party. Which of the Big Three are they registering first?",
    "choices": [
      "Your Ascendant",
      "Your Sun",
      "Your Moon"
    ],
    "answer": 0,
    "explain": "The Ascendant is the lens and the style, so it lands first. The Sun is a direction of growth people only see over time, and the Moon is what you show when you are safe or exhausted, which is rarely at a party."
  },
  {
    "q": "Virgo is rising. In the Align system, which planet therefore rules the chart?",
    "choices": [
      "Vesta",
      "Mercury",
      "The Sun"
    ],
    "answer": 0,
    "explain": "The 1st house sign is Virgo and the Align ruler of Virgo is Vesta, so Vesta rules the chart. Mercury is the conventional Virgo ruler and is not used in Align. The Sun rules the chart only when Leo rises."
  },
  {
    "q": "Someone insists their Sun sign is nothing like them. What does this lesson suggest first?",
    "choices": [
      "Their Moon and Ascendant point elsewhere, and those govern what is felt and what is seen",
      "They were born on a cusp",
      "Their Sun sign was calculated wrong"
    ],
    "answer": 0,
    "explain": "The Sun is one of three, and the other two govern what is shown and what is needed. Cusp anxiety and calculation errors are far rarer than simply reading a third of the trio and expecting the whole person."
  },
  {
    "q": "Which placement best predicts how someone behaves when they are exhausted?",
    "choices": [
      "The Moon",
      "The Sun",
      "The Ascendant"
    ],
    "answer": 0,
    "explain": "The Moon is the automatic default, the thing you do without deciding. The Sun takes deliberate energy to express, which is what is missing when someone is depleted, and a presented Ascendant style tends to drop under strain."
  }
]$json$::jsonb
WHERE id = 'l1-5-big-three';

UPDATE public.learn_lessons SET
  duration_minutes = 7,
  objectives = ARRAY['Recite all twelve Align rulers','Explain domicile and detriment','Follow any house to its ruler and read where that ruler lives'],
  key_terms  = ARRAY['ruler','domicile','detriment'],
  slides = $json$[
  {
    "title": "Twelve signs, twelve rulers, no exceptions",
    "visual": "zodiac_wheel",
    "content": "Every sign has exactly one ruler, the planet most at home there, which is its domicile. Five of the twelve differ from what you will read elsewhere, and those five are the signature of the whole Align system."
  },
  {
    "title": "The seven nobody argues about",
    "visual": "planet_row",
    "content": "Aries to Mars. Taurus to Venus. Gemini to Mercury. Cancer to the Moon. Leo to the Sun. Sagittarius to Jupiter. Capricorn to Saturn. Learn these first, because they carry over from every tradition you will meet."
  },
  {
    "title": "The five that make it Align",
    "visual": "planet_row",
    "content": "Virgo to Vesta. Libra to Juno. Scorpio to Pluto. Aquarius to Uranus. Pisces to Neptune. Vesta is the tended flame and devotion to a craft, which is Virgo exactly. Juno is the contract and the chosen other, which is Libra exactly."
  },
  {
    "title": "Domicile and detriment",
    "visual": "planet_row",
    "content": "A planet in the sign it rules is in domicile: strongest, most itself. A planet in the opposite sign is in detriment, working against the grain. So Vesta is in detriment in Pisces, and Juno is in detriment in Aries."
  },
  {
    "title": "The chain is the whole method",
    "visual": "house_circle",
    "content": "Find a house. Find its sign. Find that sign Align ruler. Find where that ruler lives. If your 2nd house is Libra then Juno rules your money, and if Juno sits in your 7th, your resources run through partnership. That is a reading."
  }
]$json$::jsonb,
  quiz   = $json$[
  {
    "q": "In the Align system, which planet rules Libra?",
    "choices": [
      "Juno",
      "Venus",
      "Saturn"
    ],
    "answer": 0,
    "explain": "Juno: partnership, the contract, the chosen other. Venus is the conventional Libra ruler and in Align keeps Taurus alone. Using Venus here would give you the wrong ruler for every Libra house in every chart you ever read."
  },
  {
    "q": "A planet sits in the sign opposite the one it rules. What is that, and what does it mean?",
    "choices": [
      "Detriment, and it works against the grain",
      "Domicile, and it is at its strongest",
      "Exaltation, and it is honoured"
    ],
    "answer": 0,
    "explain": "Opposite the domicile is detriment. Domicile is the sign the planet rules, so it is the opposite condition rather than the same one, and exaltation is a separate dignity that falls in a different sign again."
  },
  {
    "q": "Your 10th house is Scorpio. Who rules your career, and what is the next move?",
    "choices": [
      "Pluto, then find which house Pluto occupies",
      "Mars, then find which house Mars occupies",
      "The Sun, then read its sign"
    ],
    "answer": 0,
    "explain": "The Align ruler of Scorpio is Pluto, and the next move is always to locate that ruler and read the house it lives in. Mars is the traditional Scorpio ruler and is not used in Align, where it keeps Aries."
  },
  {
    "q": "Why does Whole Sign make rulership chains cleaner than degree-based systems?",
    "choices": [
      "Each house holds exactly one sign, so it has exactly one ruler to follow",
      "Rulers change less often over a lifetime",
      "It uses fewer planets"
    ],
    "answer": 0,
    "explain": "One sign per house means one unambiguous ruler. In degree-based systems a house can straddle two signs and two rulers, leaving you to decide which to trust. The planet count is identical either way."
  }
]$json$::jsonb
WHERE id = 'l1-6-rulership-align-system';

UPDATE public.learn_lessons SET
  duration_minutes = 6,
  objectives = ARRAY['Recognise the five major aspects by angle','Apply an orb and know why tighter means louder','Read your tightest aspect as a sentence'],
  key_terms  = ARRAY['aspect','orb','conjunction'],
  slides = $json$[
  {
    "title": "Planets do not act alone",
    "visual": "zodiac_wheel",
    "content": "Two planets ninety degrees apart behave differently from the same two planets a hundred and twenty apart. The angle between them is the relationship. Miss the aspects and you are reading a cast list instead of a plot."
  },
  {
    "title": "The five that matter most",
    "visual": "planet_row",
    "content": "Conjunction at 0 degrees: fusion, the two act as one. Sextile at 60: opportunity you still have to take. Square at 90: friction that forces growth. Trine at 120: natural flow and talent. Opposition at 180: two poles pulling for balance."
  },
  {
    "title": "Orb is the volume knob",
    "visual": "zodiac_wheel",
    "content": "Aspects rarely land exact. The orb is how far off they can be and still count, roughly up to eight degrees for the majors. Two degrees off is loud and constant. Seven degrees off is a background hum."
  },
  {
    "title": "Easy is not the same as better",
    "visual": "zodiac_wheel",
    "content": "Trines and sextiles flow, so they often go unused: talent nobody was ever forced to develop. Squares and oppositions cost something, which is exactly why they build the person. Do not read the hard aspects as bad news."
  },
  {
    "title": "Read your tightest one",
    "visual": "planet_row",
    "content": "Join the two planets meanings with the aspect flavour. Venus trine Saturn is love that flows easily toward commitment and durability. Mars square Saturn is wanting that keeps meeting a wall, and gets strong from the pushing."
  }
]$json$::jsonb,
  quiz   = $json$[
  {
    "q": "Which aspects most often go undeveloped in a life, and why?",
    "choices": [
      "Trines and sextiles, because they flow so easily that nothing forces you to use them",
      "Squares and oppositions, because they are too painful to face",
      "Conjunctions, because they are too subtle to notice"
    ],
    "answer": 0,
    "explain": "Ease removes the pressure that turns capacity into skill. Squares and oppositions are the ones that demand attention, which is why they build something, and a conjunction is the loudest configuration in a chart rather than the subtlest."
  },
  {
    "q": "Two planets are 94 degrees apart. What is the aspect, and how loud is it?",
    "choices": [
      "A square, four degrees off exact, well inside orb and loud",
      "No aspect, because a square must be exactly 90",
      "A trine, and within orb"
    ],
    "answer": 0,
    "explain": "Ninety degrees is a square and four degrees off is comfortably inside the roughly eight-degree major orb. Exactness is never required, only proximity, and 94 degrees is nowhere near the 120 that a trine needs."
  },
  {
    "q": "You have Venus opposite Mars. What is the most useful first reading?",
    "choices": [
      "What you love and what you want pull in opposite directions and are seeking balance",
      "Your love life is doomed",
      "The two fuse and act as one"
    ],
    "answer": 0,
    "explain": "An opposition is two poles demanding balance, not a verdict. Fusion is the conjunction. A doom reading gives the person nothing they can act on, which is the test of whether an interpretation was worth saying at all."
  },
  {
    "q": "Why does a tighter orb mean a stronger aspect?",
    "choices": [
      "The closer to exact, the more constantly the two planets act together",
      "Tighter orbs involve faster planets",
      "Tight aspects only apply before age 30"
    ],
    "answer": 0,
    "explain": "Closeness to exact governs how constantly the contact is felt, so it measures strength rather than speed or timing. Planet speed changes how often an aspect recurs by transit, which is a separate question entirely."
  }
]$json$::jsonb
WHERE id = 'l1-7-aspects-101';
