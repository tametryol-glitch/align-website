// Hidden-layer textures for placement interpretations.
//
// These tables voice the three sub-sign layers computed by the duad/compendium
// engine (src/lib/engines/duadCompendium.ts) WITHOUT ever naming the systems
// in user-facing text:
//   - DUAD_TEXTURE   → the hidden undercurrent beneath the outer sign (duad)
//   - DUAD_PURE      → used when the undercurrent IS the outer sign (1st duad)
//   - COMPENDIUM_STYLE → how the placement shows up in observable daily behavior
//   - MATRIX_SIGNATURE → the finest micro-tell in the wiring
//
// Also holds the progressed-voice tables (evolution, present tense — must never
// read like natal text) and the short second-person planet leads that replace
// the old "what this planet represents" anatomy paragraphs.
//
// Voice rules (do not violate): second person, behavioral, cause-and-effect,
// bold and specific. Never explain astrology mechanics. Never name Duad,
// Compendium, or Matrix in strings.

// ─── The hidden undercurrent (duad layer) ──────────────────────────────────
// Each entry describes what is really running underneath the visible sign.
// Written to attach to any outer sign: "Underneath, ..." + entry.

export const DUAD_TEXTURE: Record<string, string> = {
  Aries: 'there\'s a trigger-wire in you that fires before thought. You decide in a heartbeat and construct the reasons afterward, and the moments you regret are almost never the risks — they\'re the times you let someone talk you into waiting. When you feel yourself going numb, it\'s not depletion. It\'s a fight you\'ve been postponing.',
  Taurus: 'there\'s a slow, stubborn keeper in you that refuses to let go of what it has decided to hold. Whatever the surface of your life is doing, some part of you is always securing the ground — the savings, the routine, the person, the proof that tomorrow is handled. You don\'t actually relax until something is permanent, which is why so little in your life is casual.',
  Gemini: 'there\'s a commentator in you that never stops narrating. While you\'re living the moment, a second voice is already describing it, comparing it, finding the funny angle. It makes you quick and it makes you evasive — when a feeling gets too heavy, you talk about it instead of having it, and most people never notice the switch.',
  Cancer: 'there\'s a homesick current in you that never fully drains. Every room you enter gets scanned for whether you\'re safe and whether you\'re wanted, in that order. You remember emotional temperature the way others remember faces, and old hurts don\'t archive — they stay current, quietly steering choices you think are logical.',
  Leo: 'there\'s a performer in you that never fully exits the stage. Some part of you is always aware of the audience — even an audience of one, even an audience that exists only in your head. Praise lands deeper than you admit and its absence cuts deeper than you show, and the realest thing about you is how generous you become the moment you feel seen.',
  Virgo: 'there\'s an auditor in you that never stops taking inventory. You catch the flaw before the beauty, the discrepancy before the compliment, the thing that needs fixing before the thing that\'s fine. It makes you devastatingly precise — and it means your love often looks like correction, which not everyone knows how to receive.',
  Libra: 'there\'s a diplomat in you that measures every word before releasing it. You feel the room tilt when someone\'s upset and instinctively move to level it, often before checking what you actually want. Half your exhaustion comes from carrying both sides of arguments you never say out loud.',
  Scorpio: 'there\'s a vault in you that runs its own security. You test people without telling them they\'re being tested, keep evidence you never mention, and know exactly who has failed you and when. Nothing about you is casual once trust is involved — you\'re either all the way in or completely, silently gone.',
  Sagittarius: 'there\'s an escape artist in you that keeps one eye on the exit. The moment something becomes a cage — a job, a promise, even a version of yourself — a restlessness starts up underneath, insisting the real thing is somewhere past the horizon. You call it optimism. Sometimes it is. Sometimes it\'s just refusal to be held.',
  Capricorn: 'there\'s a foreman in you that never clocks out. Underneath whatever you\'re showing, something is always measuring cost against value, keeping score of who works and who talks, and quietly deciding that if it\'s going to be done right, you\'ll do it yourself. Rest feels like a debt to this part of you — that\'s the tell.',
  Aquarius: 'there\'s an observer in you standing three steps outside your own life. Even in your closest moments, part of you is watching the moment instead of being in it — cataloguing patterns, noting what everyone needs, staying slightly untouchable. People sense that remove and can\'t name it. Neither can you, until you\'re alone and finally exhale.',
  Pisces: 'there\'s a tide in you that doesn\'t respect your boundaries. Other people\'s moods soak into you before you can decide whether to accept them, and half of what you feel on a given day didn\'t start in you. Your escapes — the daydreaming, the scrolling, the one more episode — aren\'t laziness. They\'re a porous person trying to drain water that was never theirs.',
};

// When the undercurrent is the same sign as the surface — undiluted expression.
export const DUAD_PURE: Record<string, string> = {
  Aries: 'With you it runs undiluted — there is no second current softening it, no hidden hedge. The instinct people see is exactly the instinct that\'s operating, at full strength, all the way down.',
  Taurus: 'With you it runs undiluted — no restless second current underneath, no secret escape plan. What you build is what you mean, all the way down, which is why people twice your age trust your word.',
  Gemini: 'With you it runs undiluted — the quickness goes all the way down. There is no slower, hidden self waiting underneath; the mind in motion IS the foundation, and stillness has to be learned like a foreign language.',
  Cancer: 'With you it runs undiluted — the feeling goes all the way to the floor. There\'s no detached observer underneath to hand the wheel to; you protect what you love with everything, or you haven\'t decided to love it yet.',
  Leo: 'With you it runs undiluted — the warmth is not a performance layered over something colder. The generosity, the pride, the need to matter: it\'s the same fire at every depth, which is why pretending to be small actually makes you ill.',
  Virgo: 'With you it runs undiluted — the precision goes all the way down. There is no messy secret self underneath the order; the standard you hold in public is the standard you hold at 3am, alone, with no one checking.',
  Libra: 'With you it runs undiluted — the instinct for fairness isn\'t a social skill, it\'s structural. You literally cannot rest inside an injustice, including the ones you commit against yourself by keeping the peace.',
  Scorpio: 'With you it runs undiluted — the depth has no false bottom. There is no lighter self underneath the intensity waiting to come out when things calm down. This IS calm, for you. People either learn that or leave.',
  Sagittarius: 'With you it runs undiluted — the hunger for meaning goes all the way down. There\'s no secret homebody underneath the seeker; even your rest is a search, even your comfort needs a horizon in it.',
  Capricorn: 'With you it runs undiluted — the discipline isn\'t armor over something softer, it\'s load-bearing structure. You were old young, and the ambition people see is the same one that talks to you when the lights are off.',
  Aquarius: 'With you it runs undiluted — the difference goes all the way down. You\'re not a conventional person with quirks; you\'re built on another blueprint entirely, and every attempt to pass as standard-issue has cost you more than it bought.',
  Pisces: 'With you it runs undiluted — the sensitivity has no floor. There is no pragmatist underneath the dreamer to take over when it gets loud; you feel it all, first and fully, and your survival skill is choosing what to do with it rather than whether to feel it.',
};

// ─── Daily observable expression (compendium layer) ────────────────────────
// "Day to day, it shows up like this:" + entry. Concrete, watchable behavior.

export const COMPENDIUM_STYLE: Record<string, string> = {
  Aries: 'you\'re the one who moves first — the reply sent before others finish reading, the decision made in the parking lot, the argument you start because waiting felt worse than being wrong.',
  Taurus: 'you\'re the one with the routine that doesn\'t move — the same seat, the same order, the same three people you actually answer. People read it as calm. It\'s actually policy.',
  Gemini: 'you\'re the one asking the second question — the joke in the tense meeting, the tab-hopping, the ability to talk to absolutely anyone and the difficulty saying the one thing that\'s hardest.',
  Cancer: 'you\'re the one who remembers — the birthday, the thing they said in March, who wasn\'t there when it mattered. You feed people, check on people, and retreat completely when your own tank hits empty.',
  Leo: 'you\'re the one people notice — you tell stories with your whole body, you take up the room\'s warmth and give it back doubled, and you go strangely quiet in rooms where nobody bothers to see you.',
  Virgo: 'you\'re the one who fixes it before anyone asks — the typo caught, the plan tightened, the friend\'s problem quietly handled. Your care is practical, constant, and chronically underappreciated because it looks like nothing went wrong.',
  Libra: 'you\'re the one smoothing the room — introducing people who should know each other, rephrasing the harsh thing kindly, taking twenty minutes to choose because every option closes a door.',
  Scorpio: 'you\'re the one watching from the edge of the conversation — saying less than you know, asking questions that go one layer deeper than expected, remembering exactly who changed their story.',
  Sagittarius: 'you\'re the one already planning the next thing — the trip half-booked, the theory offered uninvited, the blunt truth said with a grin, the sudden absence when routine closes in.',
  Capricorn: 'you\'re the one who actually follows through — the early arrival, the deadline met without drama, the dry one-liner that reveals you\'ve been watching everything the whole time.',
  Aquarius: 'you\'re the one with the unexpected take — the friend group made of people who\'d never otherwise meet, the rule questioned on principle, the warmth that arrives sideways when nobody\'s demanding it.',
  Pisces: 'you\'re the one who feels the room shift before anyone speaks — the friend people cry to, the one who\'s late because time is a suggestion, the escape hatch always half-open in your mind.',
};

// ─── The finest micro-tell (matrix layer) ──────────────────────────────────
// One sentence. "And at the finest level of your wiring:" + entry.

export const MATRIX_SIGNATURE: Record<string, string> = {
  Aries: 'in the split second before anything else happens, your very first reflex is always the same — act now, feel later.',
  Taurus: 'your body decides before you do — you literally cannot say yes to a person, plan, or place your gut has registered as unstable.',
  Gemini: 'your mind is always holding one more thought than the conversation knows about, and it\'s usually the interesting one.',
  Cancer: 'you never stop tracking where the emotional exits are — who\'s safe, who\'s off, who needs something they haven\'t said.',
  Leo: 'some part of you always knows whether it has been truly seen today, and your entire mood is quietly indexed to the answer.',
  Virgo: 'you cannot not notice the flaw — the crooked frame, the wrong word, the small dishonesty — even when you say nothing.',
  Libra: 'you feel imbalance physically — an unfair moment, an ugly room, an unresolved argument all register like a pebble in your shoe.',
  Scorpio: 'you clock the exits, the power, and the lie within seconds of entering any room, and you\'ve never once turned it off.',
  Sagittarius: 'some compass in you is permanently pointed at "more" — and it twitches the instant a situation stops teaching you anything.',
  Capricorn: 'you are always, even at rest, aware of what this moment is costing and what it\'s building — nothing in you is ever fully off the clock.',
  Aquarius: 'part of you is permanently observing from the outside — even your own life gets watched like a system you\'re studying.',
  Pisces: 'you absorb the feeling in the room before a word is spoken, and you knew how the conversation would end before it began.',
};

// ─── Transit undercurrent (duad layer of a TRANSITING body) ────────────────
// What a transit is really smuggling in beneath its surface sign — temporary,
// window-voiced, behavioral. Written to attach after "expect ": each entry
// describes what the person will catch themselves doing while it's active.

export const TRANSIT_UNDERCURRENT: Record<string, string> = {
  Aries: 'your fuse shortening by the day: decisions you\'d normally sleep on getting made in the parking lot, replies sent before you finish deciding to send them, and a rising itch to force the issue anywhere your life has stalled.',
  Taurus: 'a sudden hunger for solid ground: checking the balance twice, gripping routines and people harder, digging in on positions you privately know are half pride. Whatever you refuse to release during this stretch is naming exactly what you\'re afraid to lose.',
  Gemini: 'your mind running double shifts: three conversations open at once, the urge to talk about the feeling instead of having it, and a restlessness that keeps mistaking new information for actual movement.',
  Cancer: 'old emotional weather rolling back in: people and places you thought were archived turning current again, a thinner skin than you\'ll admit to, and choices that look logical but are really about where you feel safe.',
  Leo: 'your need to be seen turning its volume up: wins you want witnessed, slights you replay twice, and a mood that quietly indexes itself to whether anyone actually noticed you today.',
  Virgo: 'the inner auditor working overtime: flaws jumping out of things that were fine last month, the urge to fix people who didn\'t ask, and a standard climbing so high that "good enough" starts to feel like failure.',
  Libra: 'the peacekeeper in you taking over negotiations: harsh truths getting rephrased into softness, twenty-minute decisions, and a growing tab of things you swallowed to keep a room level.',
  Scorpio: 'the vault doors moving: trust getting quietly re-audited, tests you run on people without telling them they\'re being tested, and an appetite for the real story underneath whatever you\'re being told.',
  Sagittarius: 'the exits glowing brighter: routines that fit last month feeling like slow suffocation, escapes half-booked before you\'ve told anyone, and blunt truths leaving your mouth with a grin before diplomacy can catch them.',
  Capricorn: 'the foreman taking over: everything getting audited for cost against value, rest starting to feel like a debt, and the creeping conviction that if it\'s going to be done right, you\'ll have to do it yourself.',
  Aquarius: 'a step-back coming over you: watching your own life like a system you\'re studying, inherited opinions coming up for review, and a cool altitude entering rooms that used to hold you close.',
  Pisces: 'your edges thinning: other people\'s moods soaking in before you can decline them, time going soft around the schedule, and the escape hatches — the scrolling, the daydream, one more episode — standing wider open than usual.',
};

// ─── Progressed voice: what you have EVOLVED into (per sign) ───────────────
// Present-tense becoming. Must never read like natal text: this is not who
// they were born as — it's who life has made them, showing in real time.

export const PROGRESSED_SIGN_NOW: Record<string, string> = {
  Aries: 'You\'ve grown into someone who doesn\'t wait anymore. Watch yourself lately: decisions that used to take you weeks now happen in a breath, patience you used to fake has simply stopped being available, and there\'s a new heat in you when something needs to start and nobody\'s starting it. People who knew the earlier you keep being surprised — you interrupt now, you leave now, you begin things without permission. This directness isn\'t a mood. It\'s the current chapter of you, and it\'s still gathering speed.',
  Taurus: 'You\'ve grown into someone who refuses to be rushed. Notice what\'s changed: the drama that used to pull you in now just makes you tired, you\'ve started wanting things you can touch — the home, the savings, the body that\'s cared for — and your yes has gotten slower while your no has gotten final. The you of a few years ago chased; the you of right now builds and keeps. That new stubbornness people are bumping into? It\'s not aging. It\'s arrival.',
  Gemini: 'You\'ve grown into someone whose curiosity has come back online. Notice it: you\'re asking questions again, picking up threads you dropped years ago, needing conversation the way you used to need certainty. Where you once wanted one answer, you now want three perspectives, and commitment to a single version of anything feels premature. People may call this scattered. It isn\'t. Your life is deliberately widening after a chapter that was too narrow.',
  Cancer: 'You\'ve grown into someone whose feelings have stopped taking no for an answer. Lately the tears arrive without appointment, home matters more than it did — the actual rooms, the actual people — and you\'ve started protecting your circle with a fierceness that surprises you. Things you powered through for years suddenly ache. That\'s not weakness arriving; it\'s feeling returning to areas you\'d gone numb in. This chapter is re-teaching you what you actually need.',
  Leo: 'You\'ve grown into someone who is done being background. Watch what\'s changed: you want credit now — out loud, by name — you\'ve started taking up room you used to apologize for, and something in you demands that this chapter be SEEN. The invisible-supporting-role years are closing. If you feel a new hunger for color, romance, applause, creation — that\'s not vanity arriving late. That\'s your life insisting on its own spotlight, in real time.',
  Virgo: 'You\'ve grown into someone who needs things to actually work. Notice it: the grand gestures impress you less than the follow-through, your body has started sending invoices for years of neglect, and you\'ve developed a new intolerance for chaos you used to tolerate — in schedules, in people, in yourself. You\'re pruning now. Fewer things, done properly. It can look like pickiness from outside; inside, it\'s your life demanding craftsmanship of its current chapter.',
  Libra: 'You\'ve grown into someone who can\'t do it alone anymore — and has stopped pretending otherwise. Where an earlier you powered through solo, the current you keeps reaching for the other chair: the partner, the witness, the second opinion that makes things real. Beauty has started to matter in a way you don\'t apologize for. So has fairness — you renegotiate now where you used to just absorb. This chapter of you is learning that needing people isn\'t the weakness you were treating it as.',
  Scorpio: 'You\'ve grown into someone who no longer accepts the surface of anything. Notice what\'s changed recently: small talk exhausts you where it used to entertain you, you can smell a half-truth across a room, and things you used to let slide now get investigated — quietly, thoroughly, to the bottom. You\'re shedding people and habits like a skin that stopped fitting, and it isn\'t cruelty. This chapter of your life demands the real thing or nothing, and everyone around you can feel that the terms have changed.',
  Sagittarius: 'You\'ve grown into someone the old fences can\'t hold. Watch yourself: the routine that felt safe two years ago now feels like slow suffocation, faraway places and bigger questions keep tugging at you, and you\'ve started saying true things out loud that you used to soften. The restlessness isn\'t a problem to fix — it\'s the engine of this entire chapter. You\'re being widened, and the discomfort you feel in small rooms is the proof it\'s working.',
  Capricorn: 'You\'ve grown into someone who has stopped playing the short game. Notice the shift: you think in years now where you used to think in weekends, respect has started mattering more than being liked, and a seriousness has settled into you that isn\'t sadness — it\'s aim. You\'re quietly auditing everything for whether it\'s building toward something. People may miss the lighter you. But the lighter you didn\'t have a mountain. This one does.',
  Aquarius: 'You\'ve grown into someone who has stopped needing to belong the way you used to. Watch what\'s changed: opinions you inherited are up for review, the group\'s approval has lost its grip on your choices, and you keep having ideas that feel slightly ahead of everyone around you. Some distance has entered your closest bonds — not coldness, altitude. This chapter of you is stepping outside every box you were sorted into, including the ones you built yourself.',
  Pisces: 'You\'ve grown into someone whose edges have gone soft in the best and hardest ways. Notice it: the armored logic of an earlier you keeps dissolving into intuition, other people\'s pain reaches you faster than it used to, and something in you is reaching for meaning that no schedule or paycheck can hold. Dreams are louder. Coincidence feels less coincidental. You\'re not losing your grip — this chapter is trading grip for depth, and the people who need certainty from you will just have to adjust.',
};

// ─── Progressed voice: where it\'s playing out RIGHT NOW (per house) ────────

export const PROGRESSED_HOUSE_NOW: Record<number, string> = {
  1: 'And it\'s playing out in the most visible place possible: you. Your face, your presence, the first impression you make — people who haven\'t seen you in a year do a double-take, and old photos are starting to look like someone you used to know. This evolution isn\'t private. You\'re wearing it.',
  2: 'And right now it\'s playing out through your money and your sense of what you\'re worth. Watch the spending, the earning, the new refusals — what you\'ll no longer do for a paycheck, what you\'ve started charging for, what security has come to mean. The numbers in your life are currently a mirror.',
  3: 'And right now it\'s playing out in your words — the conversations you\'re starting, the texts you\'re finally sending or finally not sending, the way your voice sounds different in your own ears. Siblings, neighbors, the daily rounds: the ordinary exchanges of your life are where this new you keeps leaking out.',
  4: 'And right now it\'s playing out at home — the actual rooms, the family patterns, the question of where and with whom you belong. Moves, renovations, returns, departures, old family business resurfacing: the foundation of your life is under active construction, which is why everything else feels slightly tilted.',
  5: 'And right now it\'s playing out through joy — romance, creativity, play, the things you make and the people who make you feel lit up. If new love, new art, or a new hunger for fun keeps knocking, that\'s the current chapter demanding expression. You\'re being asked to enjoy your life out loud.',
  6: 'And right now it\'s playing out in the dailiness — your body, your work, your routines. The schedule that used to fit doesn\'t, the health signals are getting harder to ignore, and how you spend an ordinary Tuesday has quietly become the most important question in your life.',
  7: 'And right now it\'s playing out in your closest one-on-one bonds. Partnerships are where the evolution gets tested: some are deepening into something new, some are straining against who you\'ve become. The person across the table — spouse, partner, best friend, rival — is currently your mirror, and the reflection has changed.',
  8: 'And right now it\'s playing out in the deep end — intimacy, shared money, the things you don\'t discuss in daylight. Debts are being settled, secrets are surfacing, something old in you is dying on schedule. This chapter isn\'t comfortable, but it\'s the kind that transforms you at the root.',
  9: 'And right now it\'s playing out through the big questions — what you believe, where you\'re going, what it all means. Travel keeps calling, study keeps calling, some larger truth keeps calling. The map you\'ve been using has run out of edge, and this chapter is handing you a bigger one.',
  10: 'And right now it\'s playing out in public — your career, your title, your name in other people\'s mouths. The ambition is shifting under you: the ladder you were climbing may not be against the right wall anymore, and the world is about to find out who you\'ve become whether you announce it or not.',
  11: 'And right now it\'s playing out in your people — the friends, the circles, the future you\'re building toward. Watch the guest list of your life change: some communities are falling away mid-sentence, new ones are forming around who you actually are now. Your dreams for the future are being rewritten to fit the current you.',
  12: 'And right now it\'s playing out underneath everything — in dreams, in solitude, in the parts of your life nobody sees. This chapter works in private: old patterns are dissolving, grief is completing, something is being prepared behind the curtain. If you feel like you\'re in between selves, you are. Rest. The reveal comes later.',
};

// ─── Second-person planet leads (replace the anatomy paragraphs) ───────────
// One or two sentences that aim the reading at the planet\'s territory without
// ever lecturing about what the planet "represents."

export const PLANET_LEADS: Record<string, string> = {
  Sun: 'Watch what you do when nobody is grading you. That is where this part of your chart shows.',
  Moon: 'At 2am, with the phone down and the house quiet, you reach for the same comfort every time. Very few people have ever seen it.',
  Mercury: 'You have already replayed the conversation twice, and the sentence you needed turned up an hour late. Thinking, talking and joking all start here.',
  Venus: 'Look at the last three people you chose and the pattern speaks for itself. What you accept in love comes from what you quietly believe you deserve.',
  Mars: 'Your jaw tightens a full second before you say anything. What you want, how you chase it and what you do when pushed too far all start there.',
  Jupiter: 'Say yes to one odd invitation and it pays off more than it should. Doors in this part of your life open before you knock.',
  Saturn: 'You did the hard version because there was no easy one. Slowly it turned you into the person other people lean on.',
  Uranus: 'You were the odd one out years before it was fashionable, and you still cannot fake interest in a life built to someone else\'s plan.',
  Neptune: 'You believe the version of someone you imagined, then wonder how you missed what was plain. Dreams, music and blur all live here.',
  Pluto: 'Something in your life fell apart completely, you rebuilt it in private, and you came back harder to move. Shallow people notice.',
  'North Node': 'A small dread arrives right before the thing that is good for you, and it settles the moment you do it anyway.',
  'South Node': 'You are good at something you never studied, and you grab it whenever life gets hard. It works so well that you stay too long.',
  Chiron: 'What hurt you most is what you now handle best for other people, and the sore spot never fully closes.',
  Lilith: 'You were edited down to be easier to live with, and the cut-out part keeps coming back as a blunt remark, an appetite, a no.',
  Juno: 'There is one thing you will not forgive in a partner, and you will not announce it. You will just leave.',
  Vesta: 'You cancel plans for one thing and do not apologise: the craft, the routine, the quiet hour only you understand.',
  Ceres: 'You feed people before they ask, and you rarely say how much you would like someone to do the same.',
  Pallas: 'You spot who is bluffing and which plan will fail while everyone else is still reading the agenda.',
  Eros: 'Your body decides who you want inside a minute, and the rest of you catches up later.',
  Psyche: 'You catch the pause before somebody says fine. Being hurt trained you to hear what people leave out.',
  'Part of Fortune': 'Money and recognition arrive with little chasing in one kind of situation, and you do your best work there. Skip it for something that sounds more serious and everything gets heavier.',
  Vertex: 'A stranger on a train, a friend of a friend, a wrong turn that became a job. These people arrive as if scripted, and you remember the date.',
  Ascendant: 'People decide about you in the first ten seconds and you let them, because your entrance is automatic: you scan, you joke, you go still, or you take charge.',
  Descendant: 'Three partners, one type. The traits you keep falling for are ones you have not built in yourself yet.',
  MC: 'Strangers sum you up in a sentence slightly off from the one you would pick, and it walks into rooms before you do.',
  IC: 'You exhale in very few places. The home you grew up in still sets the temperature of the one you live in.',
  'Anti-Vertex': 'You send the message, book the flight, say the thing, and life answers in a way it never would have if you had waited.',
  'Part of Spirit': 'You make one choice on purpose that costs you comfort, because drifting feels worse.',
};
