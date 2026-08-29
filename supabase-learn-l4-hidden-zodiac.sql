-- Level 4 additions — the Hidden Zodiac: Duads, Compendiums and the Matrix.
--
-- APPENDED to Level 4 at sort_order 8-13. The seven traditional lessons
-- (sect, dignity, the Lots, profections, releasing, solar conditions, the
-- delineation capstone) are left exactly as they are.
--
-- Every figure was verified against the live engine in
-- align-app/src/services/duadCompendium.ts before being written:
--
--     duad        30 / 12    = 2 deg 30 min        cycles from the sign
--     compendium  2.5 / 12   = 0 deg 12 min 30 s   cycles from the duad sign
--     matrix      2.5 / 144  = 0 deg 1 min 02.5 s  cycles from the compendium
--     1,728 segments per sign, 20,736 across the zodiac
--
-- Worked example used in the lessons, computed with the engine rather than
-- recalled: Sun at 17 deg Leo -> duad Aquarius, compendium Scorpio,
-- matrix Gemini.
--
-- Safe to re-run.

UPDATE public.learn_courses SET
  title = 'Level 4 — Traditional Craft & The Hidden Zodiac',
  description = 'Expert I. The Hellenistic craft taught natively in Whole Sign with Align rulership — sect, dignity, the Lots and the time-lords — then the layers beneath every degree: the duad, the compendium and the matrix.'
WHERE id = 'l4-traditional-wholesign';

INSERT INTO public.learn_lessons
  (id, course_id, title, duration_minutes, content, objectives, key_terms, chart_focus, quiz, slides, sort_order)
VALUES (
  'l4-8-why-degrees-matter', 'l4-traditional-wholesign', 'Why the Degree Changes Everything', 7,
  'A sign is thirty degrees wide, and a placement at one degree of it is not the same placement as one at twenty-eight. Align reads four layers in every position: the sign, the duad inside it, the compendium inside that, and the matrix inside that. This lesson makes the case for why.',
  ARRAY['Say why two people with the same placement live it differently','Explain what a sign alone cannot tell you','Name the four layers Align reads in every degree'],
  ARRAY['domicile','ruler'],
  NULL,
  $json$[
  {
    "q": "Two people both have the Sun at Leo, one at one degree and one at twenty-eight. What does conventional astrology give them?",
    "choices": [
      "The same reading, because it stops at the sign",
      "Different readings, because degree is always accounted for",
      "The same reading, but only if they share a birth year"
    ],
    "answer": 0,
    "explain": "Stopping at the sign means a thirty-degree range collapses into one answer, which is exactly the loss the deeper layers exist to recover. Degree is not accounted for by sign alone, and birth year is irrelevant to this particular question."
  },
  {
    "q": "How many duads are in one sign?",
    "choices": [
      "Twelve",
      "Thirty",
      "Three"
    ],
    "answer": 0,
    "explain": "Every sign divides into twelve duads, which is what makes each one two and a half degrees wide. Thirty is the number of degrees in a sign and three is the number of decans, which is a different and much coarser division."
  },
  {
    "q": "How many distinguishable positions does the four-layer system give inside one sign?",
    "choices": [
      "1,728",
      "144",
      "360"
    ],
    "answer": 0,
    "explain": "Twelve duads, each with twelve compendiums, each with twelve matrix segments, gives twelve cubed. A hundred and forty-four stops one level short at the compendium, and three hundred and sixty is the degree count of the whole zodiac."
  },
  {
    "q": "What does the sign layer actually tell you?",
    "choices": [
      "The mode of expression, at the widest possible resolution",
      "Nothing useful once you know the duad",
      "The exact behaviour of the person"
    ],
    "answer": 0,
    "explain": "The sign is genuinely informative but it is the broadest answer available, which is why the deeper layers refine rather than replace it. It does not become worthless, and no single layer specifies exact behaviour."
  },
  {
    "q": "What is the relationship between the four layers?",
    "choices": [
      "Each one subdivides the layer above it by twelve",
      "They are four unrelated measurements",
      "Each one replaces the layer above it"
    ],
    "answer": 0,
    "explain": "The structure is strictly nested: sign into duad into compendium into matrix, twelve at every step. They are not independent readings, and a deeper layer refines the one above rather than cancelling it."
  },
  {
    "q": "Why does this lesson say experienced astrologers already suspect the sign is not enough?",
    "choices": [
      "Because charts with identical placements repeatedly describe different people",
      "Because signs have been disproven",
      "Because degrees are easier to calculate"
    ],
    "answer": 0,
    "explain": "Anyone who has read enough charts has met two people with the same placement who are plainly not alike, and that observation is what the deeper layers explain. Nothing here disproves signs, and ease of calculation is not the argument."
  }
]$json$::jsonb,
  $json$[
  {
    "title": "Thirty degrees is not one thing",
    "visual": "zodiac_wheel",
    "content": "Two people both have the Sun in Leo. One at one degree, one at twenty-eight. Conventional astrology hands them the same paragraph. They are not the same, and every astrologer who has read enough charts already knows it."
  },
  {
    "title": "The sign is the outermost layer",
    "visual": "zodiac_wheel",
    "content": "A sign tells you the mode of expression, and it is genuinely useful. But it is the widest possible answer to the question, and a system that stops there is throwing away almost everything the degree is telling you."
  },
  {
    "title": "Four layers, each twelve times finer",
    "visual": "planet_row",
    "content": "Align divides every sign into twelve duads. Every duad into twelve compendiums. Every compendium into twelve matrix segments. Four layers, each one twelve times more specific than the one above it."
  },
  {
    "title": "Which is one thousand seven hundred and twenty-eight positions",
    "visual": "zodiac_wheel",
    "content": "Twelve times twelve times twelve gives 1,728 distinguishable positions inside a single sign, and 20,736 across the zodiac. That is the resolution Align actually reads a chart at."
  },
  {
    "title": "This is the difference",
    "visual": "house_circle",
    "content": "Sign says what kind of person. Duad says what runs underneath it. Compendium says how it comes out in a life. Matrix says the fine grain of that. Same Sun in Leo, four different people."
  }
]$json$::jsonb,
  8
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title, duration_minutes = EXCLUDED.duration_minutes,
  content = EXCLUDED.content, objectives = EXCLUDED.objectives,
  key_terms = EXCLUDED.key_terms, quiz = EXCLUDED.quiz,
  slides = EXCLUDED.slides, sort_order = EXCLUDED.sort_order;

INSERT INTO public.learn_lessons
  (id, course_id, title, duration_minutes, content, objectives, key_terms, chart_focus, quiz, slides, sort_order)
VALUES (
  'l4-9-the-duad', 'l4-traditional-wholesign', 'The Duad: Twelve Signs Inside Every Sign', 8,
  'The duad divides each thirty-degree sign into twelve micro-signs of two degrees thirty minutes each, cycling forward from the sign itself. Where the sign is what shows, the duad is the psychological undertone running beneath it.',
  ARRAY['Calculate the duad of any placement','Explain what the duad layer describes','Find the Align ruler and whole-sign house of your duad'],
  ARRAY['ruler','domicile'],
  NULL,
  $json$[
  {
    "q": "How wide is one duad?",
    "choices": [
      "Two degrees thirty minutes",
      "Ten degrees",
      "Twelve degrees thirty minutes"
    ],
    "answer": 0,
    "explain": "Thirty degrees divided into twelve gives two and a half degrees each. Ten degrees is a decan, and twelve degrees thirty minutes is the width of a compendium, which is the next layer down."
  },
  {
    "q": "A planet sits at seventeen degrees of Leo. What is its duad?",
    "choices": [
      "Aquarius",
      "Leo",
      "Libra"
    ],
    "answer": 0,
    "explain": "Seventeen divided by two and a half is six point eight, so you count six signs forward from Leo, landing on Aquarius. Leo would be the answer only in the first two and a half degrees."
  },
  {
    "q": "A planet sits at fifteen degrees of any sign. What is the duad?",
    "choices": [
      "The opposite sign, always",
      "The same sign, always",
      "It depends which sign it is"
    ],
    "answer": 0,
    "explain": "Fifteen divided by two and a half is exactly six, and six signs forward is the opposition, so this holds for every sign in the zodiac. The same sign occurs only in the first slice, and the pattern is not sign-dependent."
  },
  {
    "q": "What does the duad layer describe?",
    "choices": [
      "The psychological undertone running beneath what the sign shows",
      "The person outward behaviour",
      "The timing of events"
    ],
    "answer": 0,
    "explain": "The duad is the pressure underneath the surface expression, which is why it so often reads unlike the sign itself. Outward expression belongs to the sign and to the compendium, and no layer here carries timing."
  },
  {
    "q": "A duad sign has which of the following?",
    "choices": [
      "An Align ruler and a whole-sign house counted from the Ascendant",
      "Neither, because nothing physical is there",
      "A ruler, but no house"
    ],
    "answer": 0,
    "explain": "The duad is a sign, so everything true of a sign applies: it has a ruler in the Align table and it occupies a house counted from your rising sign. Being an abstract division does not remove either property."
  },
  {
    "q": "The duad slices cycle forward starting from which sign?",
    "choices": [
      "The sign the placement is in",
      "Aries, always",
      "The sign opposite the placement"
    ],
    "answer": 0,
    "explain": "The first duad of any sign is that sign itself, and the sequence runs forward from there. Starting from Aries would give every sign the same duad sequence, which would make the layer carry no information."
  }
]$json$::jsonb,
  $json$[
  {
    "title": "Twelve signs inside every sign",
    "visual": "zodiac_wheel",
    "content": "Take any sign and divide it into twelve equal slices of two degrees thirty minutes. The first slice belongs to the sign itself, the second to the next sign, and so on around the zodiac. That is the duad."
  },
  {
    "title": "The arithmetic is one division",
    "visual": "planet_row",
    "content": "Divide the degree within the sign by two and a half and take the whole number. That is how many signs forward from the sign itself to count. Seventeen degrees of Leo gives six, and six on from Leo is Aquarius."
  },
  {
    "title": "Two patterns worth memorising",
    "visual": "zodiac_wheel",
    "content": "In the first two and a half degrees of a sign, the duad is the sign itself, undiluted. At fifteen degrees the count reaches six, so the duad is always the opposite sign. Those two anchors let you estimate any duad in your head."
  },
  {
    "title": "What the duad describes",
    "visual": "house_circle",
    "content": "The sign is what a person shows. The duad is the psychological undertone underneath it: the pressure that is actually driving the behaviour, which is often nothing like the surface would suggest."
  },
  {
    "title": "It has a ruler and a house",
    "visual": "house_circle",
    "content": "The duad is a sign, so it has an Align ruler and it falls in a whole-sign house counted from your Ascendant. That gives you a second ruler and a second house for every placement in the chart."
  }
]$json$::jsonb,
  9
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title, duration_minutes = EXCLUDED.duration_minutes,
  content = EXCLUDED.content, objectives = EXCLUDED.objectives,
  key_terms = EXCLUDED.key_terms, quiz = EXCLUDED.quiz,
  slides = EXCLUDED.slides, sort_order = EXCLUDED.sort_order;

INSERT INTO public.learn_lessons
  (id, course_id, title, duration_minutes, content, objectives, key_terms, chart_focus, quiz, slides, sort_order)
VALUES (
  'l4-10-the-compendium', 'l4-traditional-wholesign', 'The Compendium: The Sub-Duad', 8,
  'The compendium, or sub-duad, divides each two-and-a-half-degree duad into twelve further slices of twelve minutes thirty seconds, cycling forward from the duad sign. Where the duad is the inner undertone, the compendium is how that undertone actually shows up in a life.',
  ARRAY['Calculate the compendium of any placement','Say how the compendium differs from the duad','Read the compendium as lived expression'],
  ARRAY['ruler'],
  NULL,
  $json$[
  {
    "q": "How wide is one compendium?",
    "choices": [
      "Twelve minutes thirty seconds of arc",
      "Two degrees thirty minutes",
      "One minute two point five seconds"
    ],
    "answer": 0,
    "explain": "Two and a half degrees divided by twelve gives twelve minutes thirty seconds. Two degrees thirty minutes is the duad above it, and one minute two point five seconds is the matrix segment below it."
  },
  {
    "q": "The compendium sequence cycles forward from which sign?",
    "choices": [
      "The duad sign",
      "The sign the planet occupies",
      "Aries"
    ],
    "answer": 0,
    "explain": "You take the duad first and count forward from that, which is the step most often got wrong. Counting from the occupied sign skips the duad entirely and produces the wrong compendium every time."
  },
  {
    "q": "What does the compendium describe?",
    "choices": [
      "The externalised lived expression, what other people actually witness",
      "The hidden psychological undertone",
      "The physical body"
    ],
    "answer": 0,
    "explain": "The compendium is where the inner pressure surfaces as visible behaviour. The hidden undertone is the duad one level up, and no layer in this system is a description of the body."
  },
  {
    "q": "A planet is at seventeen degrees of Leo. Its duad is Aquarius. What is its compendium?",
    "choices": [
      "Scorpio",
      "Aquarius",
      "Leo"
    ],
    "answer": 0,
    "explain": "The remainder after dividing seventeen by two and a half is two degrees, which is nine compendium slices, and nine signs forward from Aquarius is Scorpio. Aquarius would be the answer only in the first slice of the duad."
  },
  {
    "q": "Two placements share a sign and a duad. What does this lesson say?",
    "choices": [
      "They can still separate at the compendium, which is where two different lives begin",
      "They are identical placements",
      "The compendium must also match"
    ],
    "answer": 0,
    "explain": "Sharing two layers still leaves a hundred and forty-four positions of difference below them, and the compendium is where the resemblance typically ends. Nothing forces the deeper layers to agree."
  },
  {
    "q": "Roughly what fraction of a degree is a compendium?",
    "choices": [
      "About one fifth",
      "About one half",
      "About one thirtieth"
    ],
    "answer": 0,
    "explain": "Twelve minutes thirty seconds is a little over a fifth of a degree, since a degree holds sixty minutes. Half a degree would be thirty minutes, and a thirtieth of a degree is two minutes, which is finer than a compendium but coarser than a matrix segment."
  }
]$json$::jsonb,
  $json$[
  {
    "title": "Now divide the duad",
    "visual": "zodiac_wheel",
    "content": "The compendium takes a single duad and cuts it into twelve again. Each slice is twelve minutes and thirty seconds of arc, roughly one fifth of a degree. This is the third layer down."
  },
  {
    "title": "It cycles from the duad, not the sign",
    "visual": "planet_row",
    "content": "This is the step people get wrong. The compendium sequence starts from the duad sign, not from the sign the planet is in. Get the duad first, then count forward from it."
  },
  {
    "title": "The arithmetic",
    "visual": "planet_row",
    "content": "Take the remainder after dividing the degree by two and a half, then divide that by twelve minutes thirty. The whole number is how many signs forward from the duad sign. Seventeen degrees of Leo gives a Scorpio compendium."
  },
  {
    "title": "What it describes",
    "visual": "house_circle",
    "content": "The duad is the undertone. The compendium is the externalised, lived expression of it: what other people actually witness, the behaviour that turns up in the room rather than the pressure behind it."
  },
  {
    "title": "Two people, same duad, different lives",
    "visual": "house_circle",
    "content": "Two placements can share a sign and a duad and still separate at the compendium. That is where the resemblance ends and two genuinely different lives begin, which is why the layer earns its place."
  }
]$json$::jsonb,
  10
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title, duration_minutes = EXCLUDED.duration_minutes,
  content = EXCLUDED.content, objectives = EXCLUDED.objectives,
  key_terms = EXCLUDED.key_terms, quiz = EXCLUDED.quiz,
  slides = EXCLUDED.slides, sort_order = EXCLUDED.sort_order;

INSERT INTO public.learn_lessons
  (id, course_id, title, duration_minutes, content, objectives, key_terms, chart_focus, quiz, slides, sort_order)
VALUES (
  'l4-11-the-matrix', 'l4-traditional-wholesign', 'The Matrix: The Fourth Level', 8,
  'The matrix is the fourth level, dividing each compendium into twelve segments of one minute two and a half seconds of arc, cycling forward from the compendium sign. It is the finest layer Align reads, and the one that demands the most from birth-time accuracy.',
  ARRAY['Calculate the matrix segment of a placement','State how fine the matrix layer actually is','Say what the matrix adds that the compendium does not'],
  ARRAY['ruler'],
  NULL,
  $json$[
  {
    "q": "How wide is one matrix segment?",
    "choices": [
      "One minute two and a half seconds of arc",
      "Twelve minutes thirty seconds",
      "One degree"
    ],
    "answer": 0,
    "explain": "Twelve minutes thirty seconds divided by twelve gives one minute and two and a half seconds. Twelve minutes thirty is the compendium above it, and a full degree is coarser than every layer below the sign."
  },
  {
    "q": "How many matrix segments are there in one sign?",
    "choices": [
      "1,728",
      "144",
      "360"
    ],
    "answer": 0,
    "explain": "Twelve duads times twelve compendiums times twelve matrix segments gives twelve cubed. A hundred and forty-four counts only as far as the compendium, and three hundred and sixty is the degree count of the entire zodiac."
  },
  {
    "q": "The matrix cycles forward from which sign?",
    "choices": [
      "The compendium sign",
      "The duad sign",
      "The sign the planet occupies"
    ],
    "answer": 0,
    "explain": "Each layer counts from the layer directly above it, so the matrix starts at the compendium. Starting from the duad or from the occupied sign skips a level and produces the wrong segment."
  },
  {
    "q": "Roughly how long does the Ascendant spend in one matrix segment?",
    "choices": [
      "About four seconds",
      "About four minutes",
      "About four hours"
    ],
    "answer": 0,
    "explain": "The Ascendant moves through roughly fifteen degrees an hour, so a segment of about one arcminute passes in a handful of seconds. Four minutes would be a far coarser division and four hours is longer than a whole duad takes."
  },
  {
    "q": "What does the matrix layer add?",
    "choices": [
      "It distinguishes two people who match on sign, duad and compendium",
      "It replaces the compendium",
      "It provides the timing of events"
    ],
    "answer": 0,
    "explain": "It is the last layer of individuation, separating charts that agree on all three layers above. It refines rather than replaces, and no layer in this system carries event timing."
  },
  {
    "q": "Why does this lesson say the matrix must be treated with respect?",
    "choices": [
      "A layer that fine is only as reliable as the birth time behind it",
      "Because it is difficult to calculate",
      "Because it contradicts the compendium"
    ],
    "answer": 0,
    "explain": "At a few seconds of Ascendant motion per segment, an approximate birth time cannot support the layer, which is a limit of the data rather than of the method. The computation is trivial and the layers never contradict each other."
  }
]$json$::jsonb,
  $json$[
  {
    "title": "The fourth level",
    "visual": "zodiac_wheel",
    "content": "Take a compendium and divide it by twelve one more time. Each matrix segment is one minute and two and a half seconds of arc. There are 1,728 of them in a single sign and 20,736 across the whole zodiac."
  },
  {
    "title": "Same method, one level deeper",
    "visual": "planet_row",
    "content": "The rule never changes: take the remainder, divide by the segment size, count that many signs forward from the layer above. The matrix cycles from the compendium sign exactly as the compendium cycles from the duad."
  },
  {
    "title": "How fine is that, really",
    "visual": "planet_row",
    "content": "The Ascendant crosses one matrix segment in about four seconds. The Moon takes about two minutes. The Sun takes about twenty-five. This is a genuinely small unit, and that fact has consequences."
  },
  {
    "title": "What it adds",
    "visual": "house_circle",
    "content": "Sign, duad and compendium already give a hundred and forty-four positions. The matrix is what distinguishes two people who match on all three: the last layer of individuation before two charts become the same chart."
  },
  {
    "title": "Treat it with respect",
    "visual": "house_circle",
    "content": "A layer this fine is only as trustworthy as the birth time behind it. The matrix rewards a certified birth time to the minute and punishes a remembered one. The next lesson deals with exactly that."
  }
]$json$::jsonb,
  11
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title, duration_minutes = EXCLUDED.duration_minutes,
  content = EXCLUDED.content, objectives = EXCLUDED.objectives,
  key_terms = EXCLUDED.key_terms, quiz = EXCLUDED.quiz,
  slides = EXCLUDED.slides, sort_order = EXCLUDED.sort_order;

INSERT INTO public.learn_lessons
  (id, course_id, title, duration_minutes, content, objectives, key_terms, chart_focus, quiz, slides, sort_order)
VALUES (
  'l4-12-the-four-layer-chain', 'l4-traditional-wholesign', 'Reading All Four Layers Together', 9,
  'Each of the four layers is a sign, so each has an Align ruler and a whole-sign house counted from your Ascendant. Running one placement through all four gives four rulers and four houses, and reading them as a chain is what an Align delineation actually is.',
  ARRAY['Run one placement through all four layers','Find the Align ruler and house of each layer','Say one sentence that uses all four'],
  ARRAY['ruler','whole-sign-houses','domicile'],
  NULL,
  $json$[
  {
    "q": "How many rulers does one placement give you in the four-layer system?",
    "choices": [
      "Four, one for each layer",
      "One, for the sign",
      "Two, the sign and the duad"
    ],
    "answer": 0,
    "explain": "Every layer is a sign and every sign has exactly one Align ruler, so four layers give four rulers. Stopping at one or two discards the layers the system exists to read."
  },
  {
    "q": "Why must the layers be worked in order?",
    "choices": [
      "Each layer counts forward from the one above it",
      "Because the software requires it",
      "Because the rulers change order"
    ],
    "answer": 0,
    "explain": "The duad is measured from the sign, the compendium from the duad and the matrix from the compendium, so a skipped step misplaces everything below it. No tool imposes the order and the rulership table never changes."
  },
  {
    "q": "A Sun at seventeen degrees of Leo has a duad of Aquarius. Who rules that duad in the Align system?",
    "choices": [
      "Uranus",
      "Saturn",
      "The Sun"
    ],
    "answer": 0,
    "explain": "Aquarius is ruled by Uranus in the Align system, so Uranus becomes the duad ruler for this placement. Saturn is the traditional Aquarius ruler and in Align keeps Capricorn alone, and the Sun rules the Leo sign layer rather than the duad."
  },
  {
    "q": "What do you do after identifying the four layer rulers?",
    "choices": [
      "Find which whole-sign house each of those rulers occupies",
      "Nothing, the ruler names are the reading",
      "Average them into a single ruler"
    ],
    "answer": 0,
    "explain": "A ruler only becomes a statement once you locate it, so the house each one occupies completes the chain. Naming rulers without placing them stops halfway, and averaging them would destroy exactly the detail the layers created."
  },
  {
    "q": "Two people share a Leo Sun. One has a duad ruler in the 12th, the other in the 10th. What follows?",
    "choices": [
      "Two very different Suns, and nothing at sign level would reveal it",
      "No meaningful difference, since both are Leo Suns",
      "One of the two charts is calculated wrongly"
    ],
    "answer": 0,
    "explain": "The layer rulers and their houses are where two identical-looking placements separate, which is the entire argument for reading them. A sign-level reading cannot see the difference, and nothing here suggests a calculation error."
  },
  {
    "q": "What does the four-layer chain produce that a sign-level system cannot?",
    "choices": [
      "A reading specific to the degree rather than to the thirty-degree sign",
      "A prediction of dated events",
      "A compatibility score"
    ],
    "answer": 0,
    "explain": "The chain resolves a placement to one of 1,728 positions inside its sign, which is a different order of specificity from naming the sign. It carries no event timing and produces no score."
  }
]$json$::jsonb,
  $json$[
  {
    "title": "Four signs, four rulers, four houses",
    "visual": "house_circle",
    "content": "Every layer is a sign, so every layer has an Align ruler and a whole-sign house from your Ascendant. One placement therefore gives you four rulers and four houses instead of one of each."
  },
  {
    "title": "Work it in order",
    "visual": "planet_row",
    "content": "Sign, then duad, then compendium, then matrix. Never skip a step, because each layer counts forward from the one above it. Skipping the duad puts every layer under it in the wrong place."
  },
  {
    "title": "A worked example",
    "visual": "planet_row",
    "content": "Sun at seventeen degrees of Leo. Sign Leo, ruled by the Sun. Duad Aquarius, ruled by Uranus. Compendium Scorpio, ruled by Pluto. Matrix Gemini, ruled by Mercury. Four rulers from one placement."
  },
  {
    "title": "Then place each ruler",
    "visual": "house_circle",
    "content": "Find where each of those four rulers actually lives by house. A Leo Sun whose duad ruler Uranus sits in the 12th is a very different Sun from one whose Uranus sits in the 10th, and nothing at sign level would tell you."
  },
  {
    "title": "Say it as one sentence",
    "visual": "zodiac_wheel",
    "content": "Leo on the surface, Aquarius underneath, Scorpio in how it lands, Gemini in the fine grain. Warm and proud, driven by something detached, expressed with intensity, delivered through words. That is a reading no sign-level system can produce."
  }
]$json$::jsonb,
  12
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title, duration_minutes = EXCLUDED.duration_minutes,
  content = EXCLUDED.content, objectives = EXCLUDED.objectives,
  key_terms = EXCLUDED.key_terms, quiz = EXCLUDED.quiz,
  slides = EXCLUDED.slides, sort_order = EXCLUDED.sort_order;

INSERT INTO public.learn_lessons
  (id, course_id, title, duration_minutes, content, objectives, key_terms, chart_focus, quiz, slides, sort_order)
VALUES (
  'l4-13-precision-and-birth-time', 'l4-traditional-wholesign', 'Precision, Birth Time and What You Can Honestly Read', 8,
  'Every layer demands a birth time accurate enough to support it. The sign tolerates a rough time, the duad a good one, the compendium a recorded one, and the matrix a certified one. Reading a layer the data cannot support is the fastest way to discredit the whole system.',
  ARRAY['Match the layer you read to the birth time you actually have','Say how far each layer moves in a given span of time','Refuse to read a layer the data cannot support'],
  ARRAY['ascendant','ruler'],
  NULL,
  $json$[
  {
    "q": "Roughly how long does the Ascendant take to cross one duad?",
    "choices": [
      "About ten minutes",
      "About one hour",
      "About four seconds"
    ],
    "answer": 0,
    "explain": "The Ascendant moves through roughly fifteen degrees an hour, so two and a half degrees takes about ten minutes. An hour would carry it through six duads, and four seconds is the matrix segment rather than the duad."
  },
  {
    "q": "Roughly how long does the Moon spend in one matrix segment?",
    "choices": [
      "About two minutes",
      "About two hours",
      "About two seconds"
    ],
    "answer": 0,
    "explain": "The Moon covers about thirteen degrees a day, so a segment of roughly one arcminute passes in a couple of minutes. Two hours would take it through most of a compendium, and two seconds is closer to the Ascendant rate."
  },
  {
    "q": "A client remembers being born mid-morning, with no record. Which layers can you honestly read?",
    "choices": [
      "The sign layer, and you should say the rest is unsupported",
      "All four, since the mathematics still runs",
      "None, since the chart is unusable"
    ],
    "answer": 0,
    "explain": "A vague time still fixes the slower bodies by sign, so that much is honest while the finer layers are not. The mathematics running is not the same as the answer meaning anything, and the chart is far from unusable."
  },
  {
    "q": "Why is reading an unsupported layer damaging?",
    "choices": [
      "It produces a confident answer to a question the data cannot answer",
      "It slows the calculation down",
      "It changes the sign layer as well"
    ],
    "answer": 0,
    "explain": "Precision that the record cannot justify is a false claim, and it is what discredits a deep system fastest. Computation cost is irrelevant, and the finer layers never alter the sign above them."
  },
  {
    "q": "Which body is most sensitive to birth-time error?",
    "choices": [
      "The Ascendant",
      "The Sun",
      "Pluto"
    ],
    "answer": 0,
    "explain": "The Ascendant moves through the whole zodiac in a day, far faster than any planet, so it degrades first as the time gets vaguer. The Sun moves about a degree a day and Pluto barely moves at all."
  },
  {
    "q": "What does this lesson say a good practitioner does with an approximate birth time?",
    "choices": [
      "Names the uncertainty and reads only the layers it supports",
      "Rectifies the chart silently and continues",
      "Refuses to read the chart at all"
    ],
    "answer": 0,
    "explain": "Stating the limit and working inside it keeps the reading honest and still useful. Silent rectification hides a large assumption from the client, and refusing outright discards the layers the time genuinely does support."
  }
]$json$::jsonb,
  $json$[
  {
    "title": "Precision is a data question",
    "visual": "planet_row",
    "content": "The mathematics of all four layers is exact. Whether the answer means anything depends entirely on the birth time you fed it. That is not a weakness of the method, it is a limit of the record."
  },
  {
    "title": "How fast the Ascendant moves",
    "visual": "house_circle",
    "content": "The Ascendant covers a duad in about ten minutes, a compendium in about fifty seconds, and a matrix segment in about four seconds. A birth time rounded to the nearest quarter hour cannot support any layer below the sign for the Ascendant."
  },
  {
    "title": "The Moon and the Sun are kinder",
    "visual": "planet_row",
    "content": "The Moon takes about four and a half hours to cross a duad, twenty-three minutes for a compendium, and two minutes for a matrix segment. The Sun takes two and a half days, five hours and twenty-five minutes respectively."
  },
  {
    "title": "Match the layer to the record",
    "visual": "house_circle",
    "content": "A remembered time supports the sign. A time to the nearest five minutes supports the duad for slower bodies. Only a certificate to the exact minute supports the compendium on the Ascendant, and the matrix asks for more still."
  },
  {
    "title": "Say what you do not know",
    "visual": "planet_row",
    "content": "If the birth time is approximate, say so and read the layers it supports. Delivering a matrix reading from a remembered time is not deep astrology, it is a confident answer to a question the data cannot answer."
  }
]$json$::jsonb,
  13
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title, duration_minutes = EXCLUDED.duration_minutes,
  content = EXCLUDED.content, objectives = EXCLUDED.objectives,
  key_terms = EXCLUDED.key_terms, quiz = EXCLUDED.quiz,
  slides = EXCLUDED.slides, sort_order = EXCLUDED.sort_order;
