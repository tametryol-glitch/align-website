-- Level 1, Lesson 1 rebuilt to the Learn Loop.
--
-- Reference implementation for the new lesson standard: a hook that asks
-- something about the learner's own chart, five dual-coded slides (~40 words
-- each against a live visual), and retrieval questions whose explanations say
-- why the other answers are weaker.
--
-- Every visual named here renders with no visualData. Safe to re-run.

UPDATE public.learn_lessons
SET
  duration_minutes = 6,

  objectives = ARRAY[
    'Read your chart as one moment of sky, not a personality label',
    'Say why birth time moves your houses and birth place moves your horizon',
    'Explain what Whole Sign houses do to your 1st house'
  ],

  slides = $json$[
    {
      "title": "Four minutes decided this",
      "visual": "zodiac_wheel",
      "content": "Move your birth time by four minutes and this whole wheel turns about a degree. Move it by two hours and your rising sign changes — and every house in your chart moves with it. That is how sharp the instrument is."
    },
    {
      "title": "The wheel is a photograph",
      "visual": "zodiac_wheel",
      "content": "Your chart is the sky from one spot on Earth at one moment: yours. The outer ring is the zodiac — 360 degrees cut into twelve equal signs of 30. The dots inside are where the planets actually stood."
    },
    {
      "title": "Time fixes the planets",
      "visual": "planet_row",
      "content": "The Moon moves about 13 degrees a day, half a degree an hour. The Sun moves about one degree a day. So a wrong hour on your birth certificate almost never moves your Sun sign. It moves your Moon regularly."
    },
    {
      "title": "Place fixes the horizon",
      "visual": "house_circle",
      "content": "Born the same minute in Nassau and in Oslo, you get a different sky overhead. Your birth place decides which sign was climbing the eastern horizon — your Ascendant. In Align, that entire sign becomes your 1st house."
    },
    {
      "title": "Why nobody else has your chart",
      "visual": "element_grid",
      "content": "Two people born the same day share a Sun sign and very little else. A different minute gives a different rising sign. A different rising sign redraws all twelve houses. Same planets, a completely different life."
    }
  ]$json$::jsonb,

  quiz = $json$[
    {
      "q": "You were told you were born at 3pm, but your mother now thinks it was closer to 5pm. Which part of your chart is most at risk?",
      "choices": [
        "Your rising sign, and every house built from it",
        "Your Sun sign",
        "The element balance of the whole chart"
      ],
      "answer": 0,
      "explain": "Two hours turns the horizon roughly 30 degrees — a whole sign. Your Sun barely moves in two hours, and the element balance shifts only as much as the fastest bodies do. The Ascendant can change outright, and in Whole Sign that redraws all twelve houses at once."
    },
    {
      "q": "A friend was born the same day as you, in the same city, six hours apart. What do you almost certainly still share?",
      "choices": [
        "Your Sun sign",
        "Your rising sign",
        "Your Moon sign"
      ],
      "answer": 0,
      "explain": "The Sun moves about a degree a day, so six hours barely touches it. The Moon covers roughly three degrees in that time — enough to cross a sign boundary if it started near one. The Ascendant moves through about three whole signs. The Sun is the only safe answer."
    },
    {
      "q": "In the Align system, your entire 1st house is...",
      "choices": [
        "The whole sign that was rising at your birth",
        "The 30 degrees starting from your exact Ascendant degree",
        "Whichever sign your Sun is in"
      ],
      "answer": 0,
      "explain": "That is Whole Sign: the rising sign becomes the 1st house entire, 0 to 30 degrees. The second answer describes Equal House — a real system, but a different one, and it would hand you different rulers for every house in the chart."
    },
    {
      "q": "Someone tells you they do not believe in astrology because they are nothing like a Gemini. Using only this lesson, what is the first thing worth checking?",
      "choices": [
        "Their birth time — their rising sign and Moon may look nothing like their Sun",
        "Whether they were born on a cusp",
        "Their birth year"
      ],
      "answer": 0,
      "explain": "The Sun is one moving part out of dozens. With no birth time there is no Ascendant and no houses, so a Sun sign reading is a twelfth of the chart being passed off as the whole person. Cusps and birth years change far less than a missing birth time does."
    }
  ]$json$::jsonb,

  content = 'Your birth chart is the sky over one spot on Earth at one moment — the moment you arrived. Astrology reads where the Sun, Moon and planets stood along the **zodiac**, a 360-degree band cut into twelve equal signs of 30 degrees each.

Two things make that chart yours rather than anyone else''s.

**Your birth time** fixes where the planets were. The Moon is the giveaway: it covers about 13 degrees a day, so an hour of error moves it half a degree, and a few hours can move it into a different sign entirely. The Sun only moves about a degree a day, which is why a rough birth time still gets your Sun sign right — and why people who only know their Sun sign are reading a twelfth of themselves.

**Your birth place** fixes the horizon. It decides which sign was climbing in the east at that moment: your **Ascendant**, or rising sign. In Align we build the houses straight from it using **Whole Sign houses** — the rising sign becomes your entire 1st house, all thirty degrees of it, and the eleven signs after it become houses 2 through 12 in order.

That is the whole reason two people born on the same day live such different lives. They share a Sun. They rarely share a horizon.

Look at your wheel now. Outer ring: the twelve signs. Dots inside: the planets. Everything else in this level is learning to read those two things against each other.'

WHERE id = 'l1-1-what-astrology-is';
