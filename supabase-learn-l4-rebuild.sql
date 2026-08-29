-- Level 4 — Traditional Astrology & Whole Sign Mastery, Learn Loop standard.
--
-- Replaces seven stub lessons. Five dual-coded slides against a live visual,
-- six retrieval questions whose explanations say why the other answers are
-- weaker.
--
-- DOCTRINAL NOTE. Domicile and detriment come straight from the Align
-- rulership table and are taught as fact. Exaltation is taught using the
-- classical examples that do not collide with Align's five replacements
-- (Sun/Aries, Moon/Taurus, Jupiter/Cancer, Saturn/Libra); Mercury in Virgo is
-- deliberately omitted because Vesta owns Virgo here and the pairing needs a
-- ruling from you. Triplicity, bound and decan are taught as mechanism rather
-- than as asserted tables, because Align has not published its own and
-- inventing one inside a lesson would be worse than teaching how the layer
-- works. Zodiacal Releasing period lengths are the traditional ones attached
-- to the signs, not derived from the Align rulers.
--
-- Generated from validated data, not hand-written SQL. Safe to re-run.

UPDATE public.learn_lessons SET
  duration_minutes = 7,
  objectives = ARRAY['Determine whether a chart is day or night','Name the benefic and the malefic of the sect','Re-read your own chart through sect'],
  key_terms  = ARRAY['sect'],
  slides = $json$[
  {
    "title": "One question splits every chart in two",
    "visual": "house_circle",
    "content": "Was the Sun above the horizon when you were born? Above means a day chart, below means a night chart. That single fact reorganises how every planet in the nativity should be judged, and most modern readings never ask it."
  },
  {
    "title": "The two teams",
    "visual": "planet_row",
    "content": "The diurnal team is the Sun, Jupiter and Saturn. The nocturnal team is the Moon, Venus and Mars. Mercury goes either way depending on whether it rises before or after the Sun. Being on the winning team is the advantage."
  },
  {
    "title": "The benefic of sect does the most good",
    "visual": "planet_row",
    "content": "In a day chart Jupiter is the benefic of sect and does its best work. At night that role passes to Venus. The out-of-sect benefic still helps, just less reliably and with more strings attached."
  },
  {
    "title": "The malefic of sect is the one you can work with",
    "visual": "planet_row",
    "content": "In a day chart Saturn is in sect and behaves like a strict but fair teacher, while Mars is out of sect and does the real damage. At night it reverses: Mars is workable and Saturn is the problem."
  },
  {
    "title": "Now read your chart again",
    "visual": "zodiac_wheel",
    "content": "Find your sect, then look at your two malefics. One of them has been getting blamed for the other work. Sect is the cheapest correction in traditional astrology and it changes half your delineations immediately."
  }
]$json$::jsonb,
  quiz   = $json$[
  {
    "q": "How do you determine a chart sect?",
    "choices": [
      "Whether the Sun was above or below the horizon at birth",
      "Whether the birth was before or after noon on the clock",
      "Whether the Moon was waxing or waning"
    ],
    "answer": 0,
    "explain": "Sect is decided by the Sun position relative to the horizon, which is a real astronomical condition rather than a clock reading. Clock noon drifts from solar noon by longitude and daylight saving, and the lunar phase is a separate measurement entirely."
  },
  {
    "q": "In a night chart, which malefic is in sect and therefore more workable?",
    "choices": [
      "Mars",
      "Saturn",
      "Both are out of sect at night"
    ],
    "answer": 0,
    "explain": "Mars belongs to the nocturnal team alongside the Moon and Venus, so at night it operates within its own sect and behaves far more constructively. Saturn is diurnal, which makes it the out-of-sect malefic and the harder of the two after dark."
  },
  {
    "q": "In a day chart, which planet is the benefic of sect?",
    "choices": [
      "Jupiter",
      "Venus",
      "The Moon"
    ],
    "answer": 0,
    "explain": "Jupiter is diurnal, so in a day chart it is the benefic of sect and does its most reliable work. Venus is the nocturnal benefic and takes that role at night, while the Moon is the nocturnal light rather than a benefic."
  },
  {
    "q": "Which planet can belong to either sect?",
    "choices": [
      "Mercury, depending on whether it rises before or after the Sun",
      "Venus, depending on whether it is evening or morning star",
      "The Moon, depending on its phase"
    ],
    "answer": 0,
    "explain": "Mercury is assigned by whether it rises ahead of the Sun or behind it, which is why it is the one genuinely variable body. Venus is nocturnal regardless of its visibility, and the Moon is always the nocturnal light whatever its phase."
  },
  {
    "q": "Why does sect matter to a delineation?",
    "choices": [
      "The same planet does noticeably better or worse depending on which team it is on",
      "It changes which houses the planets occupy",
      "It determines the chart ruler"
    ],
    "answer": 0,
    "explain": "Sect is a condition of the planets rather than of the houses, so it changes how a placement performs without moving anything. Houses come from the Ascendant and the chart ruler is the ruler of the rising sign, neither of which sect touches."
  },
  {
    "q": "Someone blames every hard year on their Saturn, in a night chart. What would you check?",
    "choices": [
      "Whether Mars, the in-sect malefic, has been the more workable of the two all along",
      "Whether Saturn is retrograde",
      "Whether Saturn is in the 12th house"
    ],
    "answer": 0,
    "explain": "In a night chart Saturn is the out-of-sect malefic and genuinely the harder one, so the blame may be correctly placed while Mars is the resource being overlooked. Retrograde and house placement are separate conditions that do not decide sect."
  }
]$json$::jsonb
WHERE id = 'l4-1-sect';

UPDATE public.learn_lessons SET
  duration_minutes = 8,
  objectives = ARRAY['Name the five levels of essential dignity in order of strength','Say what each level actually measures','Judge a planet overall condition rather than one label'],
  key_terms  = ARRAY['domicile','exaltation','triplicity','bound','decan'],
  slides = $json$[
  {
    "title": "Dignity comes in five layers",
    "visual": "planet_row",
    "content": "Domicile, exaltation, triplicity, bound and decan. They run strongest to subtlest. Most people learn the first two and stop, which is why their judgements are blunt: a planet with no domicile can still be well supported underneath."
  },
  {
    "title": "Domicile is the Align table, and it is fact",
    "visual": "planet_row",
    "content": "Domicile is ownership and it comes straight from the Align rulership: Juno owns Libra, Vesta owns Virgo, Pluto owns Scorpio. The sign opposite is detriment. These two you can always derive without looking anything up."
  },
  {
    "title": "Exaltation is honour, not ownership",
    "visual": "planet_row",
    "content": "An exalted planet is an esteemed guest: the Sun in Aries, the Moon in Taurus, Jupiter in Cancer, Saturn in Libra. The opposite sign is its fall. Ownership and honour are different dignities and can belong to different planets in the same sign."
  },
  {
    "title": "Triplicity, bound and decan are the fine grain",
    "visual": "zodiac_wheel",
    "content": "Triplicity assigns rulers by element and by sect. Bounds divide each sign into five unequal stretches with their own ruler. Decans cut it into three tens. Together they answer how supported a planet is by degree rather than by sign."
  },
  {
    "title": "Condition is a judgement, not a score",
    "visual": "planet_row",
    "content": "Add sect, solar condition, aspects and house placement to the dignity layers. A planet in its own sign in a hidden house and out of sect is not simply strong. Read the whole condition, then say one sentence about it."
  }
]$json$::jsonb,
  quiz   = $json$[
  {
    "q": "Put these in order of strength, strongest first.",
    "choices": [
      "Domicile, exaltation, triplicity, bound, decan",
      "Exaltation, domicile, decan, bound, triplicity",
      "Decan, bound, triplicity, exaltation, domicile"
    ],
    "answer": 0,
    "explain": "The classical order runs from ownership down to the finest grain, so domicile is strongest and decan is the subtlest. The other orderings invert the scheme, which would make a decan ruler outweigh a planet sitting in its own sign."
  },
  {
    "q": "What is the difference between domicile and exaltation?",
    "choices": [
      "Domicile is ownership of the sign, exaltation is being honoured as a guest in it",
      "They are two words for the same condition",
      "Exaltation is always stronger than domicile"
    ],
    "answer": 0,
    "explain": "Ownership and honour are separate dignities, which is why the same sign can be owned by one planet and exalt another. They are not synonyms, and exaltation sits below domicile in the classical order of strength."
  },
  {
    "q": "Which of these can you derive from the Align table alone, with nothing to look up?",
    "choices": [
      "Domicile and detriment",
      "Triplicity and bound",
      "Decan and exaltation"
    ],
    "answer": 0,
    "explain": "The Align rulership gives you every domicile directly, and detriment is simply the opposite sign, so both fall out of one table. Triplicity, bound, decan and exaltation are separate schemes that have to be looked up rather than derived."
  },
  {
    "q": "A planet is in the sign it rules, but in the 12th house and out of sect. What is the honest judgement?",
    "choices": [
      "Essentially dignified but poorly placed and poorly timed, so mixed rather than strong",
      "Strong, because domicile outranks everything else",
      "Weak, because the 12th house cancels dignity"
    ],
    "answer": 0,
    "explain": "Essential dignity says how much of itself a planet can be, while house and sect say where and how well it can act, and the three can disagree. Neither does domicile override placement nor does an obscure house cancel a planet own sign."
  },
  {
    "q": "What do bounds divide a sign into?",
    "choices": [
      "Five unequal stretches of degrees, each with its own ruler",
      "Three equal stretches of ten degrees",
      "Two halves split by sect"
    ],
    "answer": 0,
    "explain": "The bounds cut each sign into five unequal segments with separate rulers, which is what makes them a degree-level rather than sign-level dignity. Three equal tens describes the decans, and no dignity splits a sign into halves by sect."
  },
  {
    "q": "Why does this lesson warn against reducing dignity to a score?",
    "choices": [
      "Sect, solar condition, aspects and house all modify what the dignity layers say",
      "Because dignity is not measurable at all",
      "Because only domicile matters in practice"
    ],
    "answer": 0,
    "explain": "A number collapses several independent judgements that frequently disagree with each other, and the disagreement is the useful part. Dignity is perfectly measurable layer by layer, and the finer layers do real work beyond domicile."
  }
]$json$::jsonb
WHERE id = 'l4-2-dignity-full';

UPDATE public.learn_lessons SET
  duration_minutes = 7,
  objectives = ARRAY['Calculate the Lot of Fortune by sect','Place a Lot in its whole-sign house','Read the ruler of the Lot of Fortune'],
  key_terms  = ARRAY['lot-of-fortune','sect'],
  slides = $json$[
  {
    "title": "A Lot is a measured distance, not a body",
    "visual": "zodiac_wheel",
    "content": "A Lot is built by taking the arc between two points and projecting it from the Ascendant. Nothing is physically there. It is a constructed point that carries meaning because of the relationship it measures."
  },
  {
    "title": "Fortune is the body and the circumstances",
    "visual": "house_circle",
    "content": "By day the Lot of Fortune is the Ascendant plus the Moon minus the Sun. By night the Sun and Moon swap places in the formula. It describes the body, livelihood and the circumstances you are handed rather than choose."
  },
  {
    "title": "Spirit is what you choose",
    "visual": "house_circle",
    "content": "The Lot of Spirit reverses the formula: by day the Ascendant plus the Sun minus the Moon. Where Fortune is what happens to you, Spirit is action, intention and career. The pair is the axis of given against chosen."
  },
  {
    "title": "Getting the sect wrong ruins it",
    "visual": "planet_row",
    "content": "If you use the day formula on a night chart the Lot lands in the wrong place entirely, usually the wrong house, and everything you read from it is wrong. Establish sect before you calculate any Lot at all."
  },
  {
    "title": "Then read its ruler",
    "visual": "house_circle",
    "content": "Put Fortune in its whole-sign house, take the Align ruler of that sign, and find where that ruler lives. That chain is what turns a constructed point into an actual statement about a life."
  }
]$json$::jsonb,
  quiz   = $json$[
  {
    "q": "What is the day formula for the Lot of Fortune?",
    "choices": [
      "Ascendant plus Moon minus Sun",
      "Ascendant plus Sun minus Moon",
      "Sun plus Moon minus Ascendant"
    ],
    "answer": 0,
    "explain": "By day Fortune runs from the Ascendant by the arc from Sun to Moon, giving Ascendant plus Moon minus Sun. Swapping the lights gives the Lot of Spirit by day, and dropping the Ascendant from the front produces no recognised Lot at all."
  },
  {
    "q": "Why does sect have to be established before calculating a Lot?",
    "choices": [
      "The formula reverses at night, so the wrong sect puts the Lot in the wrong house",
      "Lots only exist in day charts",
      "Sect changes which Ascendant is used"
    ],
    "answer": 0,
    "explain": "Day and night use mirrored formulas, so applying the wrong one moves the point substantially and usually into a different whole-sign house. Lots exist in both sects, and the Ascendant is whatever was rising regardless of sect."
  },
  {
    "q": "What does the Lot of Fortune describe?",
    "choices": [
      "The body, livelihood and the circumstances you are handed",
      "The career you deliberately choose",
      "Your capacity for good luck alone"
    ],
    "answer": 0,
    "explain": "Fortune is the given side of the pair, covering the body and the material circumstances that arrive without being chosen. Deliberate action and career belong to the Lot of Spirit, and reading Fortune as luck alone loses most of its meaning."
  },
  {
    "q": "Your Lot of Fortune falls in Aquarius. Who rules it in the Align system?",
    "choices": [
      "Uranus",
      "Saturn",
      "The Sun"
    ],
    "answer": 0,
    "explain": "Aquarius is ruled by Uranus in the Align system, so Uranus rules the Lot and its house placement completes the reading. Saturn is the traditional Aquarius ruler and in Align keeps Capricorn alone."
  },
  {
    "q": "What is the relationship between Fortune and Spirit?",
    "choices": [
      "Fortune is what happens to you, Spirit is what you choose to do",
      "They are the same point calculated two ways",
      "Spirit is only used in horary"
    ],
    "answer": 0,
    "explain": "The pair sets the given against the chosen, which is exactly why both are calculated and read together. They are distinct points with mirrored formulas, and Spirit is central to natal time-lord work rather than confined to horary."
  },
  {
    "q": "A Lot is best described as...",
    "choices": [
      "A constructed point measuring an arc projected from the Ascendant",
      "A slow-moving invisible planet",
      "The midpoint of two planets"
    ],
    "answer": 0,
    "explain": "A Lot takes the distance between two points and casts it from the Ascendant, so it is a measured relationship rather than an object. Nothing physical sits there, and a midpoint is a different construction with its own separate meaning."
  }
]$json$::jsonb
WHERE id = 'l4-3-lots';

UPDATE public.learn_lessons SET
  duration_minutes = 8,
  objectives = ARRAY['Run a profection for any age, forwards or backwards','Activate the lord of the year through transit and return','Layer monthly profections onto the annual one'],
  key_terms  = ARRAY['profection','ruler','transit'],
  slides = $json$[
  {
    "title": "Run it backwards to test it",
    "visual": "house_circle",
    "content": "Profection is worth trusting only if it survives your own history. Work out the profected house for the years you remember clearly and see whether the lord of the year matches what actually happened. Test before you forecast."
  },
  {
    "title": "Activation is what makes a year loud",
    "visual": "planet_row",
    "content": "The lord of the year is always in charge, but a year gets loud when that planet is also being transited, or turns up angular in the solar return. Lord of the year plus a hard transit to it is the classic significant year."
  },
  {
    "title": "Read the condition it was already in",
    "visual": "planet_row",
    "content": "A lord of the year that is dignified and well placed runs a very different year from one in detriment in a hidden house. The natal condition of the planet is the ceiling on what its year can be."
  },
  {
    "title": "Monthly profections sit inside the annual",
    "visual": "house_circle",
    "content": "The annual profected house holds for the year. Then the months advance one house each from that starting house, about thirty days apart, giving a second and finer lord. Use it to place events inside the year."
  },
  {
    "title": "Layer, do not replace",
    "visual": "zodiac_wheel",
    "content": "Annual profection names the theme. The monthly narrows it. Transits say when. The solar return describes the texture. None of these overrides another, and a reading that uses only one of them is a reading with one leg."
  }
]$json$::jsonb,
  quiz   = $json$[
  {
    "q": "How do you profect backwards to test the technique?",
    "choices": [
      "Work out the profected house for years you remember and check the lord against what happened",
      "Reverse the direction of the count for past years",
      "Profections only run forwards from the current age"
    ],
    "answer": 0,
    "explain": "The count is the same in both directions, so past ages give you a ready-made test set against your own history. Nothing reverses, and the ability to check the method against a known life is precisely what makes it trustworthy."
  },
  {
    "q": "What makes a profected year particularly loud?",
    "choices": [
      "The lord of the year also receiving a significant transit",
      "The lord of the year being in a fire sign",
      "The profection landing on an even-numbered house"
    ],
    "answer": 0,
    "explain": "A year is run by its lord, and it becomes eventful when that same planet is simultaneously under transit, which is the classic combination. Element and house number are not what determine the intensity of a profected year."
  },
  {
    "q": "Your lord of the year is in detriment in the 12th house natally. What does that tell you?",
    "choices": [
      "The natal condition of the planet is the ceiling on what its year can be",
      "The year will be uneventful",
      "The profection should be recalculated"
    ],
    "answer": 0,
    "explain": "The lord runs the year using whatever condition it already has, so a poorly placed lord sets a lower ceiling on the year. That is not the same as uneventful, and there is nothing to recalculate since the count itself is unaffected."
  },
  {
    "q": "How do monthly profections relate to the annual one?",
    "choices": [
      "They begin at the annual profected house and advance one house roughly every thirty days",
      "They begin at the 1st house every year regardless",
      "They replace the annual profection for that month"
    ],
    "answer": 0,
    "explain": "The monthly cycle starts from whichever house the year is profecting to, then walks forward through the twelve within the year. Restarting at the 1st would discard the annual context, and the two layers coexist rather than override."
  },
  {
    "q": "A year is running with a strong lord and no transits to it. What is the reasonable expectation?",
    "choices": [
      "The theme still applies, but the year is quieter than an activated one",
      "Nothing at all happens",
      "The lord of the year changes"
    ],
    "answer": 0,
    "explain": "The lord governs the year whether or not it is activated, so the theme holds while the volume stays low without a transit. Nothing switches the lord mid-year, and quiet is not the same as empty."
  },
  {
    "q": "Which statement about layering is correct?",
    "choices": [
      "The annual names the theme, the monthly narrows it, transits say when",
      "Whichever technique is most recent overrides the others",
      "The solar return replaces the profection"
    ],
    "answer": 0,
    "explain": "Each layer answers a different question and they are designed to be read together, which is what gives a forecast both a subject and a date. No layer supersedes another, and using only one leaves the reading standing on one leg."
  }
]$json$::jsonb
WHERE id = 'l4-4-profections-full';

UPDATE public.learn_lessons SET
  duration_minutes = 9,
  objectives = ARRAY['Release periods from the Lot of Spirit or Fortune','Recognise a peak period and a loosing of the bond','Read a life as a sequence of chapters'],
  key_terms  = ARRAY['zodiacal-releasing','lot-of-fortune'],
  slides = $json$[
  {
    "title": "A life told in chapters",
    "visual": "zodiac_wheel",
    "content": "Zodiacal Releasing walks forward from a Lot one sign at a time, giving each sign a period whose length is fixed by tradition. The result is a timeline of chapters, each with a beginning, a subject and an end date."
  },
  {
    "title": "Spirit for career, Fortune for the body",
    "visual": "house_circle",
    "content": "Release from the Lot of Spirit to read action, work and the arc of a career. Release from the Lot of Fortune for the body, health and material circumstance. Same machinery, two entirely different questions."
  },
  {
    "title": "Periods nest inside periods",
    "visual": "zodiac_wheel",
    "content": "The first level gives chapters of years. Each chapter subdivides into second-level periods of months, and those subdivide again. You read the chapter for the theme and the sub-period for the timing inside it."
  },
  {
    "title": "Peaks are angular to Fortune",
    "visual": "house_circle",
    "content": "The signs that stand angular to the Lot of Fortune mark the peak periods: the stretches where the most visible activity of a life tends to cluster. Finding them is most of why anyone learns this technique."
  },
  {
    "title": "Loosing of the bond",
    "visual": "zodiac_wheel",
    "content": "When a period would run past the end of its sequence, the count jumps to the opposite sign instead of continuing in order. That jump is the loosing of the bond, and it very often lands where a life visibly changes direction."
  }
]$json$::jsonb,
  quiz   = $json$[
  {
    "q": "Which Lot do you release from to read a career arc?",
    "choices": [
      "The Lot of Spirit",
      "The Lot of Fortune",
      "Either, they give the same result"
    ],
    "answer": 0,
    "explain": "Spirit governs action and deliberate work, which is why career questions release from it. Fortune covers the body and given circumstance, and the two produce completely different timelines from the same chart."
  },
  {
    "q": "What is the loosing of the bond?",
    "choices": [
      "A jump to the opposite sign when a period would run past the end of its sequence",
      "The moment a period ends normally",
      "The point where two Lots conjoin"
    ],
    "answer": 0,
    "explain": "Rather than continuing in order, the count leaps across the wheel, and that discontinuity often coincides with a visible change of direction in a life. An ordinary period ending is just the next chapter, and conjoining Lots is unrelated."
  },
  {
    "q": "What marks a peak period?",
    "choices": [
      "The period sign standing angular to the Lot of Fortune",
      "The period sign containing the Sun",
      "The longest period in the sequence"
    ],
    "answer": 0,
    "explain": "Angularity to Fortune is what identifies the stretches where the most visible activity clusters, and locating them is the main reason to run the technique. Neither the position of the Sun nor the raw length of a period defines a peak."
  },
  {
    "q": "How do the levels of Zodiacal Releasing relate?",
    "choices": [
      "First-level chapters subdivide into shorter second-level periods, and so on",
      "Each level is an independent timeline",
      "Only the first level is readable"
    ],
    "answer": 0,
    "explain": "The levels nest, so a chapter provides the theme and its sub-periods provide the timing within it. They are not independent sequences, and the finer levels are exactly where the technique earns its precision."
  },
  {
    "q": "Why is Zodiacal Releasing described as chapters rather than transits?",
    "choices": [
      "Each period has a defined start, subject and end, so a life reads as a sequence",
      "Because it ignores the planets entirely",
      "Because it only covers the first half of life"
    ],
    "answer": 0,
    "explain": "Periods are bounded stretches with their own subject, which produces narrative structure rather than a series of passing contacts. The planets are very much involved through the Lots and rulers, and the sequence covers a whole life."
  },
  {
    "q": "You release from Fortune and get a difficult period, but the person career flourished. What is the likeliest explanation?",
    "choices": [
      "Fortune covers body and circumstance, so the career question needed Spirit",
      "The technique failed",
      "The birth time must be wrong"
    ],
    "answer": 0,
    "explain": "Releasing from the wrong Lot answers the wrong question, and career belongs to Spirit while Fortune reports on the body and material circumstance. Suspecting the technique or the data should come after checking that the right Lot was used."
  }
]$json$::jsonb
WHERE id = 'l4-5-zodiacal-releasing';

UPDATE public.learn_lessons SET
  duration_minutes = 7,
  objectives = ARRAY['Distinguish cazimi, combustion and under the beams','Recognise bonification and maltreatment','Adjust a delineation for solar condition'],
  key_terms  = ARRAY['cazimi','combustion','sect'],
  slides = $json$[
  {
    "title": "Nearness to the Sun changes everything",
    "visual": "planet_row",
    "content": "A planet close to the Sun is in a special condition, and which condition depends entirely on how close. The difference between the best placement in the chart and one of the worst is a matter of a few degrees."
  },
  {
    "title": "Cazimi: in the heart of the Sun",
    "visual": "planet_row",
    "content": "Within about sixteen minutes of arc, a planet is cazimi, seated in the heart of the Sun. Rather than being overwhelmed it is exalted by the proximity, and cazimi is one of the strongest conditions a planet can be in."
  },
  {
    "title": "Combust: burned up",
    "visual": "planet_row",
    "content": "From roughly half a degree out to about eight and a half degrees, a planet is combust: obscured, weakened and unable to act on its own account. The same closeness that made cazimi remarkable is now doing damage."
  },
  {
    "title": "Under the beams: dimmed",
    "visual": "planet_row",
    "content": "Beyond combustion out to about fifteen degrees, a planet is under the beams. It is diminished rather than destroyed, working at reduced strength and with less visibility than it would otherwise have."
  },
  {
    "title": "Bonification and maltreatment",
    "visual": "planet_row",
    "content": "A benefic can rescue a badly placed planet by aspect or rulership, which is bonification. A malefic can wreck a well placed one, which is maltreatment. Condition is never decided by one factor on its own."
  }
]$json$::jsonb,
  quiz   = $json$[
  {
    "q": "A planet sits ten minutes of arc from the Sun. What is its condition?",
    "choices": [
      "Cazimi, one of the strongest conditions available",
      "Combust, and severely weakened",
      "Under the beams, and mildly dimmed"
    ],
    "answer": 0,
    "explain": "Inside roughly sixteen minutes the planet is in the heart of the Sun and is strengthened rather than burned. Combustion begins beyond that narrow window, and under the beams is a wider and milder condition further out still."
  },
  {
    "q": "A planet sits four degrees from the Sun. What is its condition?",
    "choices": [
      "Combust, obscured and weakened",
      "Cazimi, strengthened",
      "Unaffected, since four degrees is a wide orb"
    ],
    "answer": 0,
    "explain": "Four degrees falls inside the combustion range that runs from about half a degree to roughly eight and a half. Cazimi requires being within minutes rather than degrees, and four degrees is far too close for the Sun to be ignored."
  },
  {
    "q": "What distinguishes cazimi from combustion, given both are close to the Sun?",
    "choices": [
      "Cazimi is far closer, and proximity that extreme strengthens rather than burns",
      "Cazimi applies only to benefics",
      "Cazimi happens only in day charts"
    ],
    "answer": 0,
    "explain": "The whole distinction is degree of closeness, with the tiny cazimi window treated as being seated with the king rather than scorched by him. It applies to any planet, and it is not restricted by sect."
  },
  {
    "q": "What is bonification?",
    "choices": [
      "A benefic rescuing a badly placed planet by aspect or rulership",
      "A planet improving its own dignity over time",
      "The Sun strengthening a planet it conjoins"
    ],
    "answer": 0,
    "explain": "Bonification is help arriving from outside, specifically from a benefic that aspects or rules the struggling planet. Dignity does not change over time, and solar strengthening at close range is cazimi rather than bonification."
  },
  {
    "q": "Why does solar condition need checking before you finish a delineation?",
    "choices": [
      "A planet can be dignified by sign and still be unable to act because it is combust",
      "Because it changes which house the planet is in",
      "Because it determines the chart sect"
    ],
    "answer": 0,
    "explain": "Essential dignity and solar condition are independent, so a planet in its own sign can still be burned up and unable to operate. Solar proximity moves nothing between houses, and sect is decided by the Sun position relative to the horizon."
  },
  {
    "q": "A well dignified planet is closely squared by the out-of-sect malefic. What is the judgement?",
    "choices": [
      "Maltreated, so the dignity is real but under attack",
      "Unaffected, because dignity outranks aspect",
      "Automatically ruined and unreadable"
    ],
    "answer": 0,
    "explain": "Maltreatment is exactly this case, where a malefic undermines a planet that is otherwise well placed, and the tension between the two is the reading. Dignity does not immunise a planet, and nothing here makes the placement unreadable."
  }
]$json$::jsonb
WHERE id = 'l4-6-planetary-conditions';

UPDATE public.learn_lessons SET
  duration_minutes = 9,
  objectives = ARRAY['Run a traditional delineation in a fixed order','Judge the overall condition of a nativity','Deliver a reading of your own chart end to end'],
  key_terms  = ARRAY['whole-sign-houses','sect','lot-of-fortune','profection'],
  slides = $json$[
  {
    "title": "Order beats cleverness",
    "visual": "house_circle",
    "content": "A traditional delineation follows a sequence, every time. Sect, then the condition of the lights, then the Ascendant ruler, then the Lots, then the time-lords. Working in order is what stops you finding whatever you went looking for."
  },
  {
    "title": "Start with sect and the lights",
    "visual": "planet_row",
    "content": "Establish day or night. Find the sect light, the Sun by day or the Moon by night, and judge its sign, house, dignity and solar condition. Most of the tone of a nativity is already in that one judgement."
  },
  {
    "title": "Then the ruler of the Ascendant",
    "visual": "house_circle",
    "content": "Take the rising sign, find its Align ruler, and locate it by house, dignity, sect and aspect. That planet steers the native. Where it lives is where the life is actually run from, whatever the person believes."
  },
  {
    "title": "Then the Lots, then the time-lords",
    "visual": "zodiac_wheel",
    "content": "Place Fortune and Spirit and read their rulers. Then run the profection for the current year and the releasing chapter. Now you have a nativity and a clock, which is the whole point of the exercise."
  },
  {
    "title": "Say one sentence, then defend it",
    "visual": "planet_row",
    "content": "A reading that lists twenty factors is not a reading. Synthesise to one honest sentence about this life, then be able to name the three placements it rests on. If you cannot, you have not finished."
  }
]$json$::jsonb,
  quiz   = $json$[
  {
    "q": "What does this lesson give as the first step of a delineation?",
    "choices": [
      "Establishing sect",
      "Finding the tightest aspect",
      "Reading the Sun sign"
    ],
    "answer": 0,
    "explain": "Sect comes first because it changes how every subsequent judgement about the planets is made, so establishing it late means redoing the work. The tightest aspect and the Sun sign are both details that belong much further down the sequence."
  },
  {
    "q": "Why does the order of a delineation matter?",
    "choices": [
      "A fixed order stops you finding whatever you went looking for",
      "Because the planets must be read in zodiacal order",
      "Because it is faster than reading freely"
    ],
    "answer": 0,
    "explain": "A sequence imposes discipline and guards against assembling evidence for a conclusion reached in advance, which is the main failure mode in chart reading. Zodiacal order is unrelated, and speed is not the reason for the rule."
  },
  {
    "q": "In a night chart, which light do you judge first?",
    "choices": [
      "The Moon, because it is the sect light at night",
      "The Sun, because it is always primary",
      "Whichever is closer to the Ascendant"
    ],
    "answer": 0,
    "explain": "The sect light is the Moon in a nocturnal chart, and it carries the weight the Sun carries by day. Treating the Sun as always primary is precisely the modern habit that sect corrects, and proximity to the Ascendant is a separate consideration."
  },
  {
    "q": "The rising sign is Pisces. Which planet steers the native, in the Align system?",
    "choices": [
      "Neptune, read by house, dignity, sect and aspect",
      "Jupiter, read the same way",
      "The Moon, as the natural ruler of the 1st"
    ],
    "answer": 0,
    "explain": "The Align ruler of Pisces is Neptune, so Neptune is the Ascendant ruler and where it lives is where the life is run from. Jupiter is the traditional Pisces ruler and in Align keeps Sagittarius alone, and no planet is a natural ruler of the 1st here."
  },
  {
    "q": "What does this lesson say a finished reading looks like?",
    "choices": [
      "One honest sentence you can defend by naming the three placements behind it",
      "A complete list of every factor in the chart",
      "A prediction with a date attached"
    ],
    "answer": 0,
    "explain": "Synthesis to a defensible sentence is the standard, and being able to cite what it rests on is the test of whether you actually did the work. An exhaustive list is the opposite of synthesis, and a dated prediction is a different kind of claim."
  },
  {
    "q": "Why place the Lots and the time-lords after the lights and the Ascendant ruler?",
    "choices": [
      "The nativity has to be judged before a clock can be laid over it",
      "Because the Lots depend on the Ascendant ruler",
      "Because time-lords are optional"
    ],
    "answer": 0,
    "explain": "Timing techniques say when a chart delivers, so they need the chart to have been judged first or you are dating something you have not yet understood. The Lots depend on the Ascendant and the lights rather than on its ruler, and time-lords are essential rather than optional."
  }
]$json$::jsonb
WHERE id = 'l4-7-whole-sign-mastery';
