'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { api, buildBirthData } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import Link from 'next/link';
import { ArrowLeft, Star, ChevronDown, ChevronUp, Copy, Sparkles, Loader2, Info, Search } from 'lucide-react';
import { InlineBold } from '@/components/ui/InlineBold';
import { BirthDataPrompt } from '@/components/ui/BirthDataPrompt';
import { PaywallGate } from '@/components/ui/PaywallGate';
import { getZodiacGlyph } from '@/lib/utils';

const SIGNS = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];

interface ArabicPart {
  name: string;
  sign: string;
  degree: number;
  house: number;
  longitude: number;
  formula: string;
  meaning: string;
}

// Arabic Parts formulas matching AstroEinstein desktop exactly
// [name, ref, body1, body2, nightReverse, formula_desc, meaning]
const ARABIC_PARTS_FORMULAS: Array<[string, string, string, string, boolean, string, string]> = [
  ['Part of Fortune',    'Ascendant', 'Moon',    'Sun',     true,  'ASC + Moon - Sun (day) / ASC + Sun - Moon (night)', 'Material prosperity, worldly success, and where joy flows naturally'],
  ['Part of Spirit',     'Ascendant', 'Sun',     'Moon',    true,  'ASC + Sun - Moon (day) / ASC + Moon - Sun (night)', 'Spiritual purpose, conscious intention, and soul direction'],
  ['Part of Eros (Love)','Ascendant', 'Venus',   'Sun',     true,  'ASC + Venus - Sun', 'Romantic attraction, love style, and what draws love to you'],
  ['Part of Necessity',  'Ascendant', 'Mercury', 'Moon',    true,  'ASC + Mercury - Moon', 'Obligations, necessities, and what must be done'],
  ['Part of Courage',    'Ascendant', 'Mars',    'Moon',    true,  'ASC + Mars - Moon', 'Bravery, willpower, and fighting spirit'],
  ['Part of Victory',    'Ascendant', 'Jupiter', 'Moon',    true,  'ASC + Jupiter - Moon', 'Success, triumph, and overcoming obstacles'],
  ['Part of Nemesis',    'Ascendant', 'Saturn',  'Moon',    true,  'ASC + Saturn - Moon', 'Karmic reckoning, hidden enemies, and the undoing'],
  ['Part of Marriage (F)','Ascendant','Saturn',  'Venus',   false, 'ASC + Saturn - Venus', 'Marriage timing and commitment (feminine)'],
  ['Part of Marriage (M)','Ascendant','Venus',   'Saturn',  false, 'ASC + Venus - Saturn', 'Marriage timing and commitment (masculine)'],
  ['Part of Children',   'Ascendant', 'Jupiter', 'Saturn',  false, 'ASC + Jupiter - Saturn', 'Fertility, children, and creative offspring'],
  ['Part of Father',     'Ascendant', 'Sun',     'Saturn',  false, 'ASC + Sun - Saturn', 'Relationship with father and paternal influence'],
  ['Part of Mother',     'Ascendant', 'Moon',    'Venus',   false, 'ASC + Moon - Venus', 'Relationship with mother and maternal influence'],
  ['Part of Siblings',   'Ascendant', 'Saturn',  'Jupiter', false, 'ASC + Saturn - Jupiter', 'Siblings and family bonds'],
  ['Part of Friends',    'Ascendant', 'Moon',    'Mercury', false, 'ASC + Moon - Mercury', 'Friendships, social networks, and allies'],
  ['Part of Career',     'Ascendant', 'Saturn',  'Sun',     false, 'ASC + Saturn - Sun', 'Career direction and professional calling'],
  ['Part of Commerce',   'Ascendant', 'Mercury', 'Sun',     false, 'ASC + Mercury - Sun', 'Business acumen, trade, and commercial success'],
  ['Part of Death',      'Ascendant', 'Saturn',  'Moon',    true,  'ASC + Saturn - Moon', 'Transformation, endings, and life transitions'],
  ['Part of Illness',    'Ascendant', 'Saturn',  'Mars',    false, 'ASC + Saturn - Mars', 'Health vulnerabilities and illness patterns'],
  ['Part of Passion',    'Ascendant', 'Mars',    'Sun',     false, 'ASC + Mars - Sun', 'Sexual desire, passion, and raw drive'],
  ['Part of Desire',     'Ascendant', 'Venus',   'Mars',    false, 'ASC + Venus - Mars', 'Deep desires and what you crave'],
  ['Part of Faith',      'Ascendant', 'Moon',    'Mercury', true,  'ASC + Moon - Mercury', 'Spiritual beliefs, faith, and devotion'],
  ['Part of Intelligence','Ascendant','Mercury', 'Moon',    false, 'ASC + Mercury - Moon', 'Mental acuity and intellectual gifts'],
  ['Part of Honor',      'Ascendant', 'Sun',     'Jupiter', false, 'ASC + Sun - Jupiter', 'Public honor, respect, and recognition'],
  ['Part of Increase',   'Ascendant', 'Jupiter', 'Sun',     false, 'ASC + Jupiter - Sun', 'Abundance, growth, and expansion'],
  ['Part of Travel',     'Ascendant', 'Saturn',  'Mercury', false, 'ASC + Saturn - Mercury', 'Long-distance travel and foreign connections'],
  ['Part of Catastrophe','Ascendant', 'Saturn',  'Sun',     true,  'ASC + Saturn - Sun', 'Crisis points and major life disruptions'],
  ['Part of Inheritance','Ascendant', 'Saturn',  'Moon',    false, 'ASC + Saturn - Moon', 'Inherited wealth, legacy, and family resources'],
  ['Part of Mastery',    'Ascendant', 'Mars',    'Saturn',  false, 'ASC + Mars - Saturn', 'Skill mastery, discipline, and craft'],
  ['Part of Attraction', 'Ascendant', 'Venus',   'Moon',    false, 'ASC + Venus - Moon', 'What attracts others to you'],
  ['Part of Sexuality',  'Ascendant', 'Venus',   'Sun',     false, 'ASC + Venus - Sun', 'Sexual magnetism and erotic nature'],
];

const KEY_PARTS = ['Part of Fortune', 'Part of Spirit', 'Part of Eros (Love)', 'Part of Marriage (F)', 'Part of Marriage (M)'];

// ─── Complete Arabic Part Interpretations (all 29 parts) ────────────────────

const PART_MEANINGS: Record<string, { general: string; inSign: Record<string, string>; inHouse: Record<number, string> }> = {
  'Part of Fortune': {
    general: 'Your natural prosperity point — where joy, abundance, and material success flow to you most naturally. This is the area of life where the universe wants to reward you.',
    inSign: {
      Aries: 'You make money the week you stop planning and launch. You quote the job, open the shop or pitch the client before three other people have finished their decks.',
      Taurus: 'Money builds slowly and then stays. You buy the good version once, hold assets for years, and the savings account you ignored turns out to be the thing that saves you.',
      Gemini: 'Luck arrives through a conversation you almost skipped. You earn from three small streams at once, a side gig, a reply in a group chat, a referral from someone you once answered a question for.',
      Cancer: 'You do best where money and home overlap: renting a room, selling food, running something from the kitchen table, or caring for people who then pay you loyally for years.',
      Leo: 'Your income rises when people can see your face. You get paid for the stage, the channel, the name on the door, and you earn less the moment you hide behind a brand.',
      Virgo: 'You get paid for fixing what is broken. The spreadsheet nobody could read, the clinic schedule, the messy process: you tidy it and the client keeps calling back.',
      Libra: 'Your luck comes through one other person. A business partner, a client who becomes a friend, a deal you close because both sides felt fairly treated.',
      Scorpio: 'You win in situations other people avoid: a distressed property, a messy audit, a crisis at work, a problem everyone else walked past. Money follows your willingness to dig.',
      Sagittarius: 'Luck shows up when you leave town. A trip, a foreign client, a course you teach or a book you publish pays more than staying put and optimizing.',
      Capricorn: 'You earn by outlasting people. A slow promotion, a boring title, ten years at the company everyone else quit, and the pay jump comes late and sticks.',
      Aquarius: 'Money comes from the group and the odd angle: a community you built, software, a niche online that everyone else called too weird, a friend\'s introduction.',
      Pisces: 'Luck arrives when you stop forcing it. Money comes through music, healing work, art or looking after people, and you lose it when you lend it out or avoid opening the bank app.',
    },
    inHouse: {
      1: 'Doors open when you show up in person. You get the job, the deal or the date because you were in the room and people liked how you carried yourself.',
      2: 'Your own paycheck is the luck. Money you earn yourself, skills you can charge for, things you own outright. Pricing your time properly pays you back every month.',
      3: 'You make money from what you say and write: posts, emails, short courses, sales calls. A sibling, neighbour or classmate hands you the opportunity.',
      4: 'Your luck is tied to property and family: the house you buy, the parent who helps, the business that runs out of your home. Money tends to follow a move.',
      5: 'You win when you play: a creative project you enjoy, a risk taken for fun, a date that turns into something. When you stop enjoying it, the money stops too.',
      6: 'Steady work is your luck. The more reliably you show up and solve problems for coworkers or clients, the more you get paid, and your health improves with it.',
      7: 'Your best money comes in twos. A spouse, partner or client who believes in you opens deals you would never land alone.',
      8: 'You gain from other people\'s money: loans, investments, an inheritance, a partner\'s income, a business you turn around. The payoff depends on whom you trust with the books.',
      9: 'Luck sits abroad and in school. Degrees, teaching, publishing, foreign clients, and long trips that end in contracts.',
      10: 'Your job title is your luck. Money follows the role people recognise you in, and it rises each time you take the visible position over the safe one.',
      11: 'Your friends are your income. A group chat, a team, a community, the friend of a friend who says your name when work comes up.',
      12: 'Your luck works out of sight: quiet work alone, a job behind the scenes, help from someone you never meet. Money comes when you stop advertising and slip in the back door.',
    },
  },
  'Part of Spirit': {
    general: 'Your soul\'s conscious direction — where you find spiritual purpose and intentional growth. This is the area where your higher self guides you.',
    inSign: {
      Aries: 'You feel most alive doing something that costs you: speaking first in the meeting, running at 5am, saying no to a person who expected a yes.',
      Taurus: 'Meaning comes when your hands are in soil, dough or wood. A walk without your phone, a slow meal, a full day outdoors, does more for you than any book.',
      Gemini: 'You find meaning in explaining. You write it down, teach a friend, send the voice note, and find out what you believe as you say it.',
      Cancer: 'Meaning comes from feeding and sheltering people. The family dinner, the friend you sit with at 2am, the grave you visit every year.',
      Leo: 'You come alive when you make something and hand it over: a song, a party, a performance, a handmade gift that makes someone cry.',
      Virgo: 'Meaning is in the work done right when nobody checks it: the clean list, the careful repair, the patient care for someone who is sick.',
      Libra: 'You feel purposeful when you settle a fight, fix an unfairness or make a room more beautiful. Sitting between two people who have stopped talking is where you belong.',
      Scorpio: 'Meaning arrives after something breaks: a breakup, a loss, a secret said out loud. You grow by walking into the thing other people look away from.',
      Sagittarius: 'You find purpose on the road and in the big question. Moving countries, studying another faith, arguing about what is true at midnight.',
      Capricorn: 'Purpose shows up as a long project you keep building: a business, a craft, a family line. You feel at peace when you keep a promise made years ago.',
      Aquarius: 'You feel purposeful fighting for people you will never meet: a cause, a forum, a tool that helps strangers. You would rather change a system than a mood.',
      Pisces: 'Meaning comes in silence and surrender: music, prayer, water, sleep, forgiving someone. You find it when you stop explaining yourself.',
    },
    inHouse: {
      1: 'Your beliefs show in how you live. People read your values from how you dress, speak and treat the waiter before you say a word about them.',
      2: 'Meaning is attached to what you earn and own. Spend on what you believe in, turn down money that costs your conscience, and your sense of direction firms up.',
      3: 'You work out what you believe by talking and writing. A journal, a podcast, a call with a sibling can make your direction clear within an hour.',
      4: 'Purpose starts at home. Healing a family pattern, forgiving a parent, or making a house feel safe is your real spiritual work.',
      5: 'You feel purposeful when you make something and enjoy it. Play, art, flirting and time with kids do more for you than discipline.',
      6: 'Your daily routine is the practice. Cooking, cleaning, stretching, the same walk every morning carry more meaning for you than a retreat.',
      7: 'You learn who you are through one person at a time. Your partner or closest friend shows you what you will not look at alone.',
      8: 'Your purpose runs through endings: grief, debt, a crisis, a breakup. You come out of each as a different person and you do not go back.',
      9: 'Meaning lives far away and up high: foreign places, university, religion, the bigger question. A year abroad does more than ten years at home.',
      10: 'Your purpose is public. You feel it when you stand behind your name, hold a role people depend on and lead where others can see you.',
      11: 'Purpose comes through groups: the team, the movement, the friends who share your goals. Alone you drift; with a crowd that wants something real, you steer.',
      12: 'Your meaning is private and hard to explain. Dreams, time alone, hospitals, retreats and prayer feed you, and you need hours with no audience to feel it.',
    },
  },
  'Part of Eros (Love)': {
    general: 'Your love attraction point — how you draw romantic love to you and what sparks your deepest passion.',
    inSign: {
      Aries: 'You get noticed by going first: texting first, asking them out, saying I like you before you are sure. You draw people who like being chased and hate waiting.',
      Taurus: 'Love builds through touch, food and showing up every Sunday. You attract people by being the one who is reliably there, and you lose interest the moment they get flaky.',
      Gemini: 'Someone falls for you because of a conversation: the joke at 1am, the long thread, the thing you noticed about them. Silence in a relationship feels like a breakup to you.',
      Cancer: 'People love you after they have seen you tired. You attract partners by cooking for them, remembering their mother\'s name and being home when they get back.',
      Leo: 'You pull love in by being generous in public: the birthday you plan, the compliment you say out loud, the toast you give. You need to be adored back or you sulk.',
      Virgo: 'You show love by fixing things: their resume, their schedule, their sore back. People fall for how closely you pay attention, and you feel loved mostly when you are useful.',
      Libra: 'You attract love with how you look and how you talk, then keep it by being fair. You hate giving a plain no to someone you are not into, so some people hang around too long.',
      Scorpio: 'People feel pulled to you before you have said a word. You test them with silence and hard questions, and love begins when someone does not flinch.',
      Sagittarius: 'Love finds you while you are moving: a trip, a class, a night out in another city. You attract partners who like freedom, then panic at the word moving in.',
      Capricorn: 'Love comes later and slower, and it lasts. You attract people who respect your work, then have to learn to take a night off to be with them.',
      Aquarius: 'You become a lover after being a friend. People are drawn to how little you try to impress them, then confused when you vanish for a weekend.',
      Pisces: 'You fall for potential and for people who need rescuing. They fall for how you see them, which is why the reality check hurts both of you.',
    },
    inHouse: {
      1: 'Love reaches you directly. People are attracted at first sight, so how you walk into a room matters more than any profile.',
      2: 'Love gets easier once you stop undercharging for your time and attention. You attract partners through what you value and what you spend on them.',
      3: 'Love starts with messages. Texts, emails, a neighbour, a classmate, a colleague down the corridor: the first move is usually words.',
      4: 'Love grows at home. You meet people through family or friends of family, and a romance sticks after the first night in your own kitchen.',
      5: 'Love comes through dating, parties and flirting. You meet partners while having fun, and when you are not enjoying yourself you are not meeting anyone.',
      6: 'Love starts at work or in a routine: the same gym, the same office, the same bus. You fall for people you see every week and help with small chores.',
      7: 'Love is the main event. You draw serious partners, you tend to be coupled, and you are at your best with one person beside you.',
      8: 'Love happens fast and heavy: shared money, shared secrets, jealousy. Sex comes first and trust is built later, if at all.',
      9: 'Love comes from far away or from a classroom: someone from another country, a teacher, a travel partner, a person who believes what you believe.',
      10: 'You meet love through your reputation and your work: a boss, a client, someone who admired you before they knew you. Keeping it private is hard.',
      11: 'Love grows out of friendship. You date someone in your group, and a breakup can cost you the whole circle.',
      12: 'Love can be hidden: secret affairs, long distance, someone who is unavailable. You often feel a pull you cannot explain and cannot tell anyone about.',
    },
  },
  'Part of Necessity': {
    general: 'What you must do — the obligations and requirements that your life demands.',
    inSign: {
      Aries: 'What you have to do is act before you feel ready. If you wait for permission, the chance goes to someone who did not wait.',
      Taurus: 'What you have to do is stay put and build. Quitting at the first rough month costs you more than the work does.',
      Gemini: 'What you have to do is keep learning and keep talking. The year you stop reading and asking questions is the year things stall.',
      Cancer: 'What you have to do is look after people, starting with whoever lives under your roof. Skip it and the guilt costs more than the time would have.',
      Leo: 'What you have to do is make something with your name on it. Years in the background leave you flat and a little bitter.',
      Virgo: 'What you have to do is get the details right. The task you rush is the one that comes back at you, so you check twice and still feel behind.',
      Libra: 'What you have to do is decide, and stop asking six friends what they think. A choice you make yourself beats a perfect one you keep postponing.',
      Scorpio: 'What you have to do is face the thing you are hiding: the money, the secret, the person. It gets bigger every month you avoid it.',
      Sagittarius: 'What you have to do is go further than your comfortable radius, in travel, study or belief. Staying small makes you restless and rude.',
      Capricorn: 'What you have to do is carry the responsibility nobody else will. It is heavy, you resent it some weeks, and it is the reason people trust you.',
      Aquarius: 'What you have to do is stay your own person inside a group. Going along to keep the peace is the one thing you cannot keep doing.',
      Pisces: 'What you have to do is protect time to rest and dream. Without it you absorb everyone\'s moods and lose track of which feelings are yours.',
    },
    inHouse: {
      1: 'Your obligation is yourself: your health, your look, your direction. Everyone else gets what is left, so it matters that something is left.',
      2: 'Your obligation is money: bills paid on time, a number you actually know, and a price you do not undercut.',
      3: 'Your obligation is to keep in touch. Replies, calls to siblings, paperwork, errands: small things that pile up if you let them.',
      4: 'Your obligation is home and family: the parent who needs help, the lease, the repairs that cannot wait.',
      5: 'Your obligation is to your kids or your creative work, whichever is demanding you tonight. Both want you at your best.',
      6: 'Your obligation is the daily grind: the job, the routine, your body. When the basics slip, everything else goes with them.',
      7: 'Your obligation is the person next to you. Showing up for them when it is inconvenient is what keeps the relationship going.',
      8: 'Your obligation is shared money and other people\'s problems: debts, taxes, an estate, a partner\'s crisis. You are the one who ends up sorting them out.',
      9: 'Your obligation is to learn something big or go somewhere far: a degree, a licence, a trip you keep postponing.',
      10: 'Your obligation is your career and your good name. You show up when you are tired, because people are counting on you.',
      11: 'Your obligation is to the group: friends who rely on you, a team, a cause. Dropping out of it quietly costs you more than staying.',
      12: 'Your obligation is to rest, to be alone sometimes, and to take care of whatever you hide: a worry, a person, a habit.',
    },
  },
  'Part of Courage': {
    general: 'Your source of bravery and willpower — where you find the fighting spirit to overcome obstacles.',
    inSign: {
      Aries: 'Your courage is physical and instant. You step between two people arguing, take the first run down the hill or say the blunt thing before you have time to think.',
      Taurus: 'Your courage is staying. You hold your ground in the argument, the recession, the rough year, and you are still there when others have left.',
      Gemini: 'Your courage is saying it. You send the honest email, ask the awkward question in the meeting and argue with the person everyone is afraid of.',
      Cancer: 'Your courage is protective. You go all in for your kids, friends or pets, and you will confront the landlord for them when you would never do it for yourself.',
      Leo: 'Your courage is walking out in front of people. You take the stage, tell the boss no in public and stand by your decision when the room goes quiet.',
      Virgo: 'Your courage shows up as preparation. You read the contract, run the numbers and then do the scary thing because you know exactly what you are risking.',
      Libra: 'Your courage is saying the unpopular thing politely. You stand up for the person being treated unfairly and take the heat for it.',
      Scorpio: 'Your courage is going into the dark room: the diagnosis, the confession, the argument everyone else is dodging. You do not look away.',
      Sagittarius: 'Your courage is the leap. You book the one-way ticket, quit the job, tell the truth to the family and trust it will work out.',
      Capricorn: 'Your courage is the slow kind. You work the extra shift, wait out the bad boss and take the hard route because you can see the end of it.',
      Aquarius: 'Your courage is being the odd one out. You say the thing the room is not ready for and keep saying it after they stare.',
      Pisces: 'Your courage is giving yourself up for someone else, and having faith when there is no evidence. You walk toward people others would run from.',
    },
    inHouse: {
      1: 'You are brave about yourself: asking for what you want, trying the thing you might fail at, introducing yourself first.',
      2: 'You are brave with money: quitting for less pay, investing, asking for the raise, saying a price out loud without apologising.',
      3: 'You are brave when you speak and write: publishing the post, saying it in the meeting, telling a sibling the truth.',
      4: 'You are brave at home: confronting a parent, moving out, buying the house, ending the family silence.',
      5: 'You are brave in love and creativity: asking them out, showing the work, having the child, risking the big gesture.',
      6: 'You are brave in the daily slog: showing up sick, doing the dull task, going to the doctor, sticking to the routine.',
      7: 'You are brave with other people: saying no to a partner, ending something, walking into the lawsuit.',
      8: 'You are brave with crisis and secrets: sitting up all night with the dying, facing debt, telling the thing you promised never to tell.',
      9: 'You are brave about distance: moving abroad, studying something hard, changing what you believe in public.',
      10: 'You are brave about ambition: asking for the top job, standing behind your name, taking the blame for your team.',
      11: 'You are brave in groups: leading the protest, standing up for the outcast, leaving the circle that was bad for you.',
      12: 'You are brave in private: sitting alone with your fears, confessing what you did, letting go of what you cannot control.',
    },
  },
  'Part of Victory': {
    general: 'Where you triumph — the area of life where you can overcome obstacles and achieve lasting success.',
    inSign: {
      Aries: 'You win by going first. In sport, sales or arguments, the person who moves while others are still thinking is you.',
      Taurus: 'You win by waiting. The competitor tires out, the price drops, the client comes round, and you are still there at the end.',
      Gemini: 'You win with the better pitch. You find the sentence, the angle or the joke that gets the room on your side.',
      Cancer: 'You win by reading what everyone is feeling. You know when to push, when to back off and who to call before the meeting.',
      Leo: 'You win by being seen. Judges, bosses and crowds remember you, and you play better with an audience watching.',
      Virgo: 'You win through preparation. You have read the file, practised the answer and fixed the typo while others were still celebrating.',
      Libra: 'You win with allies. You get the vote, the contract or the verdict because you made friends before you needed them.',
      Scorpio: 'You win by outlasting the fight. Rivals break first, because you do not drop a grudge or a goal once you have decided.',
      Sagittarius: 'You win with confidence and the long shot. You back the bold plan, keep your sense of humour and land on your feet.',
      Capricorn: 'You win by discipline. Slow, dull, daily work puts you ahead of the more talented person who got bored.',
      Aquarius: 'You win by doing it differently. The rule-bound competitor loses to the plan nobody expected from you.',
      Pisces: 'You win by not fighting. You step aside, let the other person overreach, and watch the situation resolve itself.',
    },
    inHouse: {
      1: 'You win at being yourself: image, fitness, first impressions, the personal contest.',
      2: 'You win with money: negotiations, salary, sales, saving up for the thing you wanted.',
      3: 'You win with words: debates, exams, pitches, a message that lands at the right moment.',
      4: 'You win on the home front: property deals, family disputes, getting the house you wanted.',
      5: 'You win at games, romance and showing your work. Contests you enter for fun are the ones you take.',
      6: 'You win at work: the promotion, the clean bill of health, the clients who stay.',
      7: 'You win with other people: contracts, courtrooms, getting the person you want to say yes.',
      8: 'You win in a crisis: inheritance disputes, debt, a tough negotiation where everyone else gives up.',
      9: 'You win with distance and ideas: exams, publishing, cases that go to a higher court, deals abroad.',
      10: 'You win at reputation: promotions, awards, public contests where your name is on the line.',
      11: 'You win with a team: elections, campaigns, fundraising and causes that need many hands.',
      12: 'You win quietly: private battles, hidden rivals, things settled behind closed doors.',
    },
  },
  'Part of Nemesis': {
    general: 'Your karmic reckoning point — where hidden enemies, self-undoing patterns, and consequences manifest.',
    inSign: {
      Aries: 'You undo yourself by acting in anger. The email sent at midnight, the door slammed, the quit announced in a meeting: the damage comes from the first ten seconds.',
      Taurus: 'You undo yourself by refusing to move. You hold onto the money, the argument or the habit one month past the point where it paid.',
      Gemini: 'You undo yourself by saying two different things to two different people. Eventually they compare notes.',
      Cancer: 'You undo yourself by clinging. Calling five times, checking their location, guilt-tripping the friend who needs space, and then wondering why they pull away.',
      Leo: 'You undo yourself by needing to be right in public. The correction you could have made privately becomes a feud you lose.',
      Virgo: 'You undo yourself by picking at everything. Your standards turn into a running commentary on people, and eventually people stop telling you things.',
      Libra: 'You undo yourself by not choosing. Months pass while you ask opinions, and the person or the offer you wanted goes to someone who said yes.',
      Scorpio: 'You undo yourself by keeping score. A slight from four years ago still runs your decisions, and the people who did it have long forgotten.',
      Sagittarius: 'You undo yourself by promising big and skipping the details. The contract you did not read and the plan with no backup come back to you.',
      Capricorn: 'You undo yourself by going cold. You work so hard at being in charge that people stop telling you the truth until it is too late.',
      Aquarius: 'You undo yourself by pulling away. When things get close you disappear, then wonder who left you.',
      Pisces: 'You undo yourself by hiding. A drink, a screen, a convenient lie, an assumed martyr role: the escape becomes the problem.',
    },
    inHouse: {
      1: 'Your own habits are the opponent. The person who most often blocks you in life is you, and it shows in your image and your choices.',
      2: 'The enemy is money: overspending, underearning, a person who owes you, or a belief that you are not worth the fee.',
      3: 'The enemy is in your messages. Gossip, a text that was misread, a sibling or a neighbour who uses what you said against you.',
      4: 'The enemy is at home: a family feud, a landlord, a parent whose opinion still runs your week.',
      5: 'The enemy is the thing you love too much: a lover, a gamble, a child, a project that eats everything else.',
      6: 'The enemy is the workplace: a rival colleague, an unhealthy routine, a body that keeps telling you to stop.',
      7: 'The enemy is the person you are closest to. Open rivals and legal fights come through partnership, and so does the lesson.',
      8: 'The enemy is shared money and secrets: debts, taxes, an ex with access to your accounts, a trust given to the wrong person.',
      9: 'The enemy is certainty. Arguments about belief, bad advice from experts, and foreign deals where the fine print was in another language.',
      10: 'The enemy is in your career: the boss, the rival who wants your job, a reputation damaged by one bad week.',
      11: 'The enemy is among friends. Someone in the circle gossips, competes or leaves you off the list, and you find out late.',
      12: 'The enemy is out of sight: a secret rival, a private fear, a habit nobody knows about. It does the most damage when you do not name it.',
    },
  },
  'Part of Marriage (F)': {
    general: 'Marriage timing and commitment energy in the feminine expression.',
    inSign: {
      Aries: 'You marry someone who moves fast. The proposal comes out of nowhere or you make it yourself, and you argue loudly and make up faster.',
      Taurus: 'You marry for stability, and you wait until the money and the house make sense. Once you say yes, you do not leave.',
      Gemini: 'You marry someone you can talk to at 3am. The marriage lasts as long as the conversation does, and silence is the first warning.',
      Cancer: 'You marry into family. In-laws are in your kitchen, your partner is attached to their mother, and home is the centre of the relationship.',
      Leo: 'You marry someone who makes you feel seen. A big wedding, a public declaration, a partner who claps loudest for you.',
      Virgo: 'You marry the one who shows up. Practical help with taxes, the sick parent and the weekly shop wins you over faster than flowers.',
      Libra: 'You marry early or you marry well matched. Your partner is fair, dresses well and wants peace, and you both avoid the fight that needs to happen.',
      Scorpio: 'You marry someone who knows your secrets. The bond is intense, jealousy is part of it, and the marriage survives only if you tell the truth.',
      Sagittarius: 'You marry someone who lets you roam. Long trips apart, a foreign partner or a spouse who shares your beliefs, and you resent anyone who clips your wings.',
      Capricorn: 'You marry late or you marry someone older and established. The relationship feels like a business arrangement first, then a love story.',
      Aquarius: 'You marry your friend, or you marry rarely and unconventionally. You need your own room, schedule and circle, and you give your partner the same.',
      Pisces: 'You marry the person you want to rescue, or the one who rescues you. The romance is gentle, the money is vague and the boundaries need drawing.',
    },
    inHouse: {
      1: 'Marriage changes who you are. People start describing you as half of a couple, and your whole look and routine shift.',
      2: 'Marriage is tied to money. You combine accounts, buy things together, and the first big fight is about the budget.',
      3: 'Marriage grows in conversation. You may meet through a sibling, a neighbour or a text, and you stay together by talking things out.',
      4: 'Marriage centres on the house. You buy or rent together early, and your partner\'s family is always in the picture.',
      5: 'Marriage is romantic and playful. Date nights, kids and creative projects keep it alive, and boredom is the danger.',
      6: 'Marriage is work you do every day: chores, schedules, caring for each other when ill. It succeeds through routine.',
      7: 'Marriage is the main event of your life. You are visibly coupled, and a split would reorganise everything you own.',
      8: 'Marriage involves merging money and secrets. Joint accounts, inheritances and a partner\'s family matters become your business.',
      9: 'Marriage comes with travel, study or a different culture. Your partner may be from far away or share your faith.',
      10: 'Marriage affects your public image. You marry someone who helps your career, or whose career you help, and people watch the pair of you.',
      11: 'Marriage grows out of your friend group, and your friends stay close to it. Shared goals hold it together.',
      12: 'Marriage has a hidden side: a secret engagement, a long separation, a partner who is private. Part of the relationship always stays unspoken.',
    },
  },
  'Part of Marriage (M)': {
    general: 'Marriage timing and commitment energy in the masculine expression.',
    inSign: {
      Aries: 'You marry fast and decisively. You decide quickly, propose without a plan and expect your partner to keep up.',
      Taurus: 'You marry when you can afford it and you stay loyal. The relationship is physical and domestic, and you resist change in either.',
      Gemini: 'You marry someone who talks back. You need a partner with a quick mind, and a quiet home worries you more than an argument does.',
      Cancer: 'You marry to protect. Your partner\'s safety is your first thought, and the family home is where you feel most like yourself.',
      Leo: 'You marry with a big gesture: the ring, the party, the speech. You are warm and proud and need admiration to feel secure.',
      Virgo: 'You marry the helpful one. You show love through repairs, errands and being on time, and you are hurt when nobody notices.',
      Libra: 'You marry someone who keeps the peace. You both avoid conflict, so the issues build up until one of you finally speaks.',
      Scorpio: 'You marry deeply and you guard it closely. The bond is loyal and jealous, and a secret from your partner feels like a betrayal.',
      Sagittarius: 'You marry someone with a mind of their own. You need space, you travel, and you hate being asked where you were.',
      Capricorn: 'You marry for the long haul and often a bit later. You provide, you plan, and you need to say I love you out loud more often than you do.',
      Aquarius: 'You marry someone who is also your best friend. You care about equality, and you shrink when a partner needs more closeness than you can give.',
      Pisces: 'You marry the person you look after. You are gentle and giving, and you can lose yourself in your partner\'s problems.',
    },
    inHouse: {
      1: 'Marriage shapes how you see yourself. Once you are married, your habits and your appearance change, and you think of yourself as a pair.',
      2: 'Marriage is tied to shared values and the household budget. What you earn and what your partner earns become one conversation.',
      3: 'Marriage depends on talk. Long phone calls, shared jokes, an argument that gets settled in writing.',
      4: 'Marriage is anchored in the home. Where you live, who visits and how the place looks matter more than the wedding.',
      5: 'Marriage is playful and affectionate. Children, hobbies and weekends away keep it going.',
      6: 'Marriage is daily service. Making dinner, driving to work, handling a partner\'s illness are how you say I love you.',
      7: 'Marriage is your biggest commitment. A partner is at the centre of your decisions, and a breakup would shake your whole life.',
      8: 'Marriage means merging: money, families, secrets, bodies. It is intense, and trust is the thing everything depends on.',
      9: 'Marriage widens your life. Your partner introduces you to new places, new beliefs or a different language.',
      10: 'Marriage is seen by others. Your partner\'s reputation counts as much as yours, and the two of you are judged together.',
      11: 'Marriage includes your community. Friends are always around and your partner needs to fit into the group.',
      12: 'Marriage includes something unspoken: a past bond, a private understanding, time apart. You cannot explain it to everybody.',
    },
  },
  'Part of Children': {
    general: 'Fertility, children, and creative offspring — both literal children and the creative works you birth into the world.',
    inSign: {
      Aries: 'You make things by starting them. Kids who are headstrong, projects you start in a rush, and a family where somebody always wants to go first.',
      Taurus: 'You make things that last. A child you raise patiently, a garden, a product built slowly, and you feel richest when you can hold what you made.',
      Gemini: 'You make things by talking. A child who talks back at three, a blog or a business that begins as an idea you could not stop explaining.',
      Cancer: 'You make things by feeding and sheltering them. You are the parent who is always home, or the boss who looks after the team.',
      Leo: 'You make things that get applauded. Your kids or your work put you on stage, and you are happiest when they shine.',
      Virgo: 'You make things carefully. You research the school, rebuild the draft and worry about your kids\' health more than you tell them.',
      Libra: 'You make things with a partner. A child or a project comes out of a shared effort, and you need the other person\'s input to finish.',
      Scorpio: 'You make things through intensity. Pregnancy, birth or a creative project that changes you, and a bond with your kids that is deep and protective.',
      Sagittarius: 'You make things that travel. Kids who move abroad, books that sell in other countries, students who go far.',
      Capricorn: 'You make things with structure. You are a firm parent, you build a company for the next generation and you wait to start a family.',
      Aquarius: 'You make things that are different. A child nobody can predict, a project that breaks the rules, and a family that does not look like the one you grew up in.',
      Pisces: 'You make things from feeling. Creative work that comes in dreams, a sensitive child you shield, a parenting style that is gentle and a bit scattered.',
    },
    inHouse: {
      1: 'Kids, or the things you create, are part of who you are. People know you as a parent or as a maker first.',
      2: 'Kids or creations affect your money. They cost a lot and, in time, they bring something back.',
      3: 'Kids or creations involve a lot of talking: school runs, teaching, writing, a younger relative you look after.',
      4: 'Kids or creations are at the heart of your home. The house is built around them, or the work is done from there.',
      5: 'Kids and creative work come naturally. You enjoy both, and you are good with young people.',
      6: 'Kids or creations come with daily care: lunches, rehearsals, deadlines. You look after them on a schedule.',
      7: 'Kids or creations arrive through partnership. You make them with one other person, and you share the cost.',
      8: 'Kids or creations bring big changes. A birth, a loss or a long wait changes who you are.',
      9: 'Kids or creations take you far away. You raise a child abroad, teach, or send your work out into the world.',
      10: 'Kids or creations affect your career. You are known for your family, or your work for the next generation is your legacy.',
      11: 'Kids or creations connect you to a group. Parent friends, a school community, a team that works on a shared project.',
      12: 'Kids or creations have a private side: a child you worry about quietly, an unspoken loss, or work that stays unseen.',
    },
  },
  'Part of Father': {
    general: 'Your relationship with fatherhood and paternal influence.',
    inSign: {
      Aries: 'Your father was quick, competitive and direct. You either fought him or became him, and you still hear his voice when you speed up.',
      Taurus: 'Your father provided and did not talk much about it. Love came as dinner on the table and a paid bill, and you learned to read that as affection.',
      Gemini: 'Your father was talkative or always reading. He taught you to argue, or he was never around to listen, and you chase conversation either way.',
      Cancer: 'Your father worried about the family and said so. He was protective and moody, and you picked up how to look after people from him.',
      Leo: 'Your father was larger than life. He had a story for every room, and you either want his approval or want to prove you are nothing like him.',
      Virgo: 'Your father was practical and critical. He fixed things, noticed mistakes and rarely said well done.',
      Libra: 'Your father avoided conflict or kept things polished. He charmed people and dodged hard conversations, and you learned that peace comes first.',
      Scorpio: 'Your father kept things to himself. He was powerful, secretive or intense, and you sensed more than he ever told you.',
      Sagittarius: 'Your father was a traveller, a talker or a believer. He was gone a lot, and he taught you to look for something bigger than home.',
      Capricorn: 'Your father was strict, working and hard to impress. You learned discipline and a deep fear of letting him down.',
      Aquarius: 'Your father was different. He was the odd one out or emotionally distant, and you learned to relate to him as a friend rather than a dad.',
      Pisces: 'Your father was gentle or absent. He drank, dreamed, disappeared or was kind but vague, and you spent time trying to fill the gap.',
    },
    inHouse: {
      1: 'Your father shaped your sense of self. You carry his posture, his temper or his silence in how you present yourself.',
      2: 'Your father shaped how you think about money. His attitude to earning and spending is the one you copy or reject.',
      3: 'Your father shaped how you talk. His jokes, his arguments or his silence set your habits of speech.',
      4: 'Your father is your foundation. His home, his family and his place in your upbringing are what you are measuring everything against.',
      5: 'Your father shaped how you play and create. His approval or his criticism sits behind your creative work and your flirting.',
      6: 'Your father shaped how you work. His work ethic, his health and his habits turn up in your daily routine.',
      7: 'Your father is the model for your partner choices. You pick someone like him or the exact opposite.',
      8: 'Your father brings up intense matters: inheritance, his illness, secrets or a loss that changed your family.',
      9: 'Your father shaped what you believe. His religion, politics or travels set the questions you ask about life.',
      10: 'Your father shaped your ambitions. His career, his name and his expectations push or weigh on your own career.',
      11: 'Your father shaped your friendships. His friends, his club or his absence from the group affect who you trust.',
      12: 'Your father is partly hidden from you. There is a secret, an estrangement or a loss you have yet to understand.',
    },
  },
  'Part of Mother': {
    general: 'Your relationship with motherhood and maternal influence.',
    inSign: {
      Aries: 'Your mother was strong and independent, and she did things her way. You learned to rely on yourself early and to hide when you needed help.',
      Taurus: 'Your mother was steady and physical. She cooked, held on to things and did not like change, so you grew up safe and a little stuck.',
      Gemini: 'Your mother was talkative, curious and busy. She asked a lot of questions, kept the phone near and taught you to explain yourself.',
      Cancer: 'Your mother was the emotional centre of the house. She worried, she fed everyone, and her moods set the weather for the family.',
      Leo: 'Your mother was warm and dramatic. She liked being admired, and you learned to perform for her approval.',
      Virgo: 'Your mother was practical and anxious. She kept the house in order, watched your health and corrected your posture.',
      Libra: 'Your mother kept the peace and cared how things looked. She avoided open fights, and you learned to smile through them.',
      Scorpio: 'Your mother was intense. Her feelings ran deep, she did not forgive easily, and you sensed secrets that were never explained.',
      Sagittarius: 'Your mother was free-spirited and had her own life. She gave you room, and you felt both trusted and a little left alone.',
      Capricorn: 'Your mother was responsible and reserved. She held the family together and did not show much tenderness, so you learned to earn it.',
      Aquarius: 'Your mother was unconventional or emotionally distant. She treated you like a friend and expected you to stand on your own.',
      Pisces: 'Your mother was gentle, sensitive and sometimes overwhelmed. You looked after her feelings as a child, and still do.',
    },
    inHouse: {
      1: 'Your mother shaped who you are. Your face, your habits and the way you comfort yourself come from her.',
      2: 'Your mother shaped how you handle money and security. What she saved, spent or worried about is what you carry.',
      3: 'Your mother shaped how you talk and think. Her stories, her scolding and her phone calls are your first lessons.',
      4: 'Your mother is your home. The kitchen, the neighbourhood and the family rituals are where you go back to.',
      5: 'Your mother shaped how you love and play. Her affection or lack of it set the pattern for romance and for children.',
      6: 'Your mother shaped your daily habits. Food, sleep, cleaning and illness all echo how she did things.',
      7: 'Your mother is your model for relationships. You pick partners who treat you as she did, or who are the opposite.',
      8: 'Your mother brings deep ties: loss, inheritance, a bond that is intense and sometimes suffocating.',
      9: 'Your mother shaped what you believe. Her faith, her travels or her sayings are in your worldview.',
      10: 'Your mother shaped how you approach work and reputation. You are driven to prove something to her, or to be like her.',
      11: 'Your mother shaped your friendships. Her circle, her sociable nature or her loneliness set your own pattern.',
      12: 'Your mother has a private side you only understand later. A hidden pain, a sacrifice or a bond you cannot put into words.',
    },
  },
  'Part of Siblings': {
    general: 'Sibling relationships and family bonds.',
    inSign: {
      Aries: 'You and your siblings compete over everything: grades, races, who gets the last slice. You fight hard and you defend each other harder.',
      Taurus: 'Your siblings are loyal and stubborn. You may not talk for months, but you show up with a casserole when it counts.',
      Gemini: 'Your siblings are your talking partners. You text constantly, tease each other and know all the family jokes.',
      Cancer: 'Your siblings are family first. You take care of them or they take care of you, and holiday dinners matter to you all.',
      Leo: 'Your siblings are loud, loving and a little theatrical. You are proud of each other and quick to flare up over who got the attention.',
      Virgo: 'Your siblings keep you practical. You help with their problems, point out their mistakes and ask if they are eating enough.',
      Libra: 'Your siblings try to keep the peace. You compromise, you share and you avoid saying what really annoys you.',
      Scorpio: 'Your siblings are intense. You keep each other\'s secrets, and a falling out can last for years.',
      Sagittarius: 'Your siblings are far apart, in distance or in outlook. You share adventures and honest arguments, and you meet up like old friends.',
      Capricorn: 'Your siblings are the responsible ones, or you are. Someone was the second parent, and the roles stuck into adulthood.',
      Aquarius: 'Your siblings are your friends, and quite different from you. You respect each other\'s space and rarely talk about feelings.',
      Pisces: 'Your siblings are tender and sometimes needy. You rescue, you worry and you sometimes lose your own plans because of them.',
    },
    inHouse: {
      1: 'Your siblings shaped your identity. Being the oldest, youngest or middle child is still how you see yourself.',
      2: 'Your siblings are tied up with money. Shared inheritance, loans and who pays for what are bigger topics than you admit.',
      3: 'Your siblings are at the centre of your daily world. You talk, text, visit and know what each other is doing.',
      4: 'Your siblings are part of your home. You grew up in the same rooms, and the family house still brings you together.',
      5: 'Your siblings bring play and fun. You tease, collaborate and share a sense of humour.',
      6: 'Your siblings are involved in your day-to-day life. You help with work, health or errands more than you expected.',
      7: 'Your siblings show you how you act in relationships. The way you fight with them is the way you fight with partners.',
      8: 'Your siblings are linked to deep matters: shared losses, inheritance or secrets you protect.',
      9: 'Your siblings live far away or hold different beliefs. You learn from them, and your visits feel like trips.',
      10: 'Your siblings affect your career. They may work with you, set the standard you compare yourself to, or reflect on your reputation.',
      11: 'Your siblings are part of your social circle. Their friends and yours overlap.',
      12: 'Your siblings have a private side. A sibling you worry about, a distance nobody explains, or a bond that goes beyond words.',
    },
  },
  'Part of Friends': {
    general: 'Your friendship magnetism — how you attract allies and supportive connections.',
    inSign: {
      Aries: 'You attract friends who do things: runners, builders, people who text at 6am to ask if you are in. You like friends who push and cannot stand slow replies.',
      Taurus: 'You attract friends who stay for decades. They are the ones who bring soup, remember your birthday and tell you straight that the new job is a mistake.',
      Gemini: 'You attract friends with whom you talk for hours. Your circle is large and you move between groups easily.',
      Cancer: 'You attract friends who become family. You host, you cook and you remember everyone\'s problems.',
      Leo: 'You attract friends who like to celebrate. Parties, group trips and loud toasts, and you expect loyalty in return.',
      Virgo: 'You attract friends who need practical help, and you are the one they call about taxes, a resume or a breakup plan.',
      Libra: 'You attract friends who are charming, fair and well dressed. You rarely fight with them, and rarely say what you really think.',
      Scorpio: 'You attract few friends and deep ones. They know your secrets, and they test you before they trust you.',
      Sagittarius: 'You attract friends from many countries and walks of life. You meet them through trips, classes and a good argument.',
      Capricorn: 'You attract friends who are ambitious and older. Your friendships help your career, and you drop the ones who do not.',
      Aquarius: 'You attract friends who think differently. You find them online or in a cause, and you give each other space.',
      Pisces: 'You attract friends who are artistic, sensitive or in need. You are generous with your time, and sometimes get drained by it.',
    },
    inHouse: {
      1: 'Your friends are part of your identity. People judge you by who you spend your time with.',
      2: 'Your friends are linked to money. You do business with them, lend to them or borrow from them.',
      3: 'Your friends are close to hand. Neighbours, classmates, colleagues and people you text every day.',
      4: 'Your friends feel like family. They come to the house, they know your parents and they stay for years.',
      5: 'Your friends are fun. Parties, hobbies and creative projects are how you meet them and how you keep them.',
      6: 'Your friends come from work and routine. You meet at the gym, the office or a class and you help one another out.',
      7: 'Your friends are chosen one at a time. A best friend matters more to you than a group.',
      8: 'Your friends are tied up with your secrets. They know your history, and a falling out would hurt.',
      9: 'Your friends are from far away or from other beliefs. They broaden your thinking and invite you abroad.',
      10: 'Your friends support your career. They open doors, give references and celebrate your wins.',
      11: 'Your friends are your natural world. Groups, teams and causes are where you are most at home.',
      12: 'Your friends are a private circle. A few close ones you see rarely, or friends you keep out of sight.',
    },
  },
  'Part of Career': {
    general: 'Your career direction and professional calling.',
    inSign: {
      Aries: 'You work best in charge of something: a team, a shop, a startup, a sports squad. Taking orders for years makes you sloppy and snappy.',
      Taurus: 'You work best where the product is real and the money is clear: food, property, finance, craft. You are the employee who stays for a decade.',
      Gemini: 'You work best where you talk or write for a living: media, sales, teaching, customer calls. You hold two jobs at once and do both well.',
      Cancer: 'You work best in jobs that look after people: nursing, catering, real estate, family business, HR. Colleagues bring you their problems.',
      Leo: 'You work best where people watch you: performing, presenting, managing, selling in person. A back-office role dulls you in a year.',
      Virgo: 'You work best where details matter: health, editing, accounting, logistics, quality control. You are the one who finds the error.',
      Libra: 'You work best with another person: a partner, a client, a negotiation. Law, design, mediation, styling and sales suit you.',
      Scorpio: 'You work best on hard problems: investigations, therapy, finance, research, repair. You take the cases others turn down.',
      Sagittarius: 'You work best when your work involves movement or meaning: teaching, travel, publishing, coaching, import and export.',
      Capricorn: 'You work best in structured organisations that reward patience: management, government, engineering, construction. You rise late and stay high.',
      Aquarius: 'You work best on new things: technology, science, community projects, odd freelance work. Your boss rarely understands what you do, and it pays anyway.',
      Pisces: 'You work best in healing, music, film, care or anything behind the scenes. Rigid hours and big offices wear you out.',
    },
    inHouse: {
      1: 'Your career and your identity are the same thing. People hire you for who you are, and a job that does not fit you shows on your face.',
      2: 'Your career is about earning. You pick the role that pays properly and you grow when you know your market rate.',
      3: 'Your career runs on communication: writing, calls, teaching, short trips, a network of contacts.',
      4: 'Your career involves home: working from your house, property, family business or a field that cares for people.',
      5: 'Your career has a creative side: entertainment, children, design, or any job where you can play.',
      6: 'Your career is daily service: health, administration, repairs, hospitality. You become known for reliability.',
      7: 'Your career comes through partnerships: co-founders, clients, the person who recommends you.',
      8: 'Your career handles other people\'s resources: banking, insurance, research, therapy, crisis work.',
      9: 'Your career has distance or depth: teaching, publishing, law, travel, religion, international work.',
      10: 'Your career is your public face. Your name is attached to your work, and your role is what people know you by.',
      11: 'Your career runs through groups: teams, networks, online communities, collective projects.',
      12: 'Your career works behind the scenes: research, hospitals, retreats, writing alone. Recognition comes later and quietly.',
    },
  },
  'Part of Commerce': {
    general: 'Your business acumen and commercial success.',
    inSign: {
      Aries: 'You sell by being first. You spot the gap, make the offer and close before competitors reply.',
      Taurus: 'You sell things people can touch and trust. Good materials, honest pricing, and a reputation that grows by word of mouth.',
      Gemini: 'You sell information and introductions. You broker, you write copy, you connect the buyer to the seller and take a cut.',
      Cancer: 'You sell by looking after the customer. They return because you remember their name, their order and their birthday.',
      Leo: 'You sell yourself. A brand with your face on it, a personality people buy from, a showy launch.',
      Virgo: 'You sell by being the careful one. Fewer products, fewer mistakes, better reviews, and customers who pay for reliability.',
      Libra: 'You sell through partnerships and good taste. You close deals with charm, and your packaging does half the talking.',
      Scorpio: 'You sell by playing the long game: acquiring, investing, turning a failing business around, using money others fear to touch.',
      Sagittarius: 'You sell widely: courses, exports, travel, books. Your offer works best when it has a big promise and a big market.',
      Capricorn: 'You sell through institutions. You land contracts with large organisations and build a business with real structure.',
      Aquarius: 'You sell new things: apps, communities, subscriptions, odd products with a loyal niche.',
      Pisces: 'You sell what people feel: art, music, wellness, spiritual products. Pricing it properly is your hardest lesson.',
    },
    inHouse: {
      1: 'You are your brand. Customers buy you, so your name, your look and your voice are the product.',
      2: 'You make money directly from sales. Income is clear, and growing it means raising prices and building skills.',
      3: 'You trade in words: copywriting, deals, messages, local contacts, short projects.',
      4: 'You can run business from home. A shop in the garage, an online store at the kitchen table, a family company.',
      5: 'You earn from creative work: entertainment, kids\' products, games, a hobby that turns profitable.',
      6: 'You earn from service: a clinic, a cleaning company, a consultancy where clients pay month after month.',
      7: 'You earn through partners: a co-founder, a distributor, a client who brings others.',
      8: 'You earn from shared money: investing, lending, buying distressed assets, managing other people\'s funds.',
      9: 'You earn from overseas: export, import, teaching, publishing, anything with a foreign audience.',
      10: 'You earn from the corporate world: contracts with large firms, senior roles, a visible business name.',
      11: 'You earn from your network: referrals, communities, partnerships and online audiences.',
      12: 'You earn quietly: private clients, work done from the back office, businesses that stay out of the spotlight.',
    },
  },
  'Part of Death': {
    general: 'Transformation, endings, and life transitions — not literal death, but cycles of dying and rebirth.',
    inSign: {
      Aries: 'You change by acting. You quit, leave, move or pick the fight, and the new life starts the week after the decision.',
      Taurus: 'You change when you let go of what you own. The house, the job, the habit of holding on to someone: losing it frees you.',
      Gemini: 'You change when your thinking changes. A book, a conversation or an argument takes apart an idea you held for years.',
      Cancer: 'You change after a good cry. Moving out of a family home, a loss, an apology: you release it and rebuild.',
      Leo: 'You change when your pride gets knocked. Public failure, a rejection or a lost spotlight forces you to find out who you are without it.',
      Virgo: 'You change by clearing out. A diet, a detox, a clean desk, an honest audit of how you spend your days.',
      Libra: 'You change when a relationship ends or shifts. A divorce, a new partner, a friend lost, and you rebuild around a new idea of fairness.',
      Scorpio: 'You change by going to the bottom. Therapy, grief, a crisis, a secret that comes out: you shed an old self completely.',
      Sagittarius: 'You change when your beliefs break. A trip, a teacher or a failure shows you that what you thought was true was not.',
      Capricorn: 'You change when what you built collapses. A business folds, a career ends, a title is lost, and you start from the ground.',
      Aquarius: 'You change suddenly. An odd event, a new group or an idea turns your life over in a week.',
      Pisces: 'You change by surrender. You stop fighting, forgive, let go of control, and something quiet and new takes its place.',
    },
    inHouse: {
      1: 'Your identity renews itself every few years. People who knew you ten years ago would not recognise you.',
      2: 'Your relationship with money and values goes through cycles. You lose and rebuild what you own more than once.',
      3: 'Your way of speaking and thinking changes. You drop old opinions, old friends and old ways of talking.',
      4: 'Your home and family go through big changes: moves, deaths, divorces, new arrivals.',
      5: 'Your love life and creative work go through endings and restarts. A project dies, and a better one appears.',
      6: 'Your health and work routines are reset several times. A diagnosis or a job loss pushes you toward a better way of living.',
      7: 'Your partnerships change deeply. Marriages end or transform, and the person you become with each partner is different.',
      8: 'Endings are your regular theme. Loss, inheritance and crisis come up repeatedly, and you become the person who knows how to handle them.',
      9: 'Your beliefs are overturned. You change religion, country or philosophy, and each move feels like a rebirth.',
      10: 'Your career gets rebuilt. You change field, lose a role and start again, usually in a better place.',
      11: 'Your friend groups turn over. Circles dissolve, causes end and new communities appear.',
      12: 'Your inner life goes through letting go. Dreams, retreats and long quiet spells close one chapter before another opens.',
    },
  },
  'Part of Illness': {
    general: 'Health vulnerabilities and illness patterns.',
    inSign: {
      Aries: 'Stress shows in your head and face: headaches, a clenched jaw, a short fuse. Rest when you are angry, not after.',
      Taurus: 'Stress settles in your throat and neck. Overeating, tight shoulders and a sore throat arrive when you hold back what you want to say.',
      Gemini: 'Stress shows in your nerves and breath. Racing thoughts, poor sleep and shallow breathing arrive when you take on too many conversations.',
      Cancer: 'Stress sits in your stomach. You eat your feelings, or you cannot eat at all, and your gut tracks your mood.',
      Leo: 'Stress hits your heart and back. Overwork and pride keep you going past the point you should stop.',
      Virgo: 'Stress goes to your digestion and your worries. You check symptoms online, and your gut reacts to deadlines.',
      Libra: 'Stress shows in your lower back and hormones. You get run down when you keep the peace at your own expense.',
      Scorpio: 'Stress shows in what your body holds back: slow recovery, tension and trouble letting go. Emotional release matters.',
      Sagittarius: 'Stress is overindulgence. Too much food, drink or travel strains your liver and hips, and you recover slowly after a binge.',
      Capricorn: 'Stress hits your bones, knees and skin. You carry too much, rest too little and ignore pain until it is serious.',
      Aquarius: 'Stress shows in your circulation and nerves. Cold hands, jittery legs and fatigue come when you stay up thinking about the world.',
      Pisces: 'Stress shows in your feet and immune system. You pick up colds when you absorb other people\'s moods or escape into drink or sleep.',
    },
    inHouse: {
      1: 'Your health follows your habits. Sleep, exercise and what you put in your body show on your face fast.',
      2: 'Your health follows your diet and comfort. Overeating, undereating and money worries affect your body.',
      3: 'Your health follows your stress and your nerves. Too many messages and too little quiet wear you down.',
      4: 'Your health follows your emotions. A hard time with family or a house move affects your digestion and sleep.',
      5: 'Your health follows your pleasures. Late nights, parties and excess catch up with you.',
      6: 'Your health is a big part of your life. You think about it often, you work around it, and a good routine keeps you well.',
      7: 'Your health is affected by your relationships. A fight with a partner or a breakup shows in your body.',
      8: 'Your health has times of deep crisis and recovery. A scare changes how you live afterwards.',
      9: 'Your health is affected by travel and beliefs. Jet lag, new foods and strong convictions show up in your body.',
      10: 'Your health follows your job. Long hours, pressure and deadlines hit your joints, skin and sleep.',
      11: 'Your health follows your social life. Too many events or too much isolation affects your energy.',
      12: 'Your health has hidden or slow-moving patterns. Fatigue and symptoms that are hard to name need a patient doctor.',
    },
  },
  'Part of Passion': {
    general: 'Your raw desire and sexual drive.',
    inSign: {
      Aries: 'Your drive is immediate. Desire hits, you act on it, and you are bored if the chase is over too soon.',
      Taurus: 'Your drive is physical and slow-building. Touch, food and long evenings matter, and once you commit you do not want to stop.',
      Gemini: 'Your drive is in your head first. Texting, flirting and wordplay turn you on before anything else does.',
      Cancer: 'Your drive follows your mood. You want closeness and safety first, then the passion comes out.',
      Leo: 'Your drive is showy and generous. You want to be wanted loudly, and you give a lot to the one who does.',
      Virgo: 'Your drive is quiet and attentive. You show it through small acts, and you are turned on by someone who notices details.',
      Libra: 'Your drive wants beauty and mutual attention. Atmosphere matters, and indifference kills it.',
      Scorpio: 'Your drive is total. You want all of someone, and losing it or sharing it feels like a threat.',
      Sagittarius: 'Your drive is playful and restless. You want adventure, variety and a partner who laughs in bed.',
      Capricorn: 'Your drive is controlled until you trust. Once you do, it is steady and strong and focused on one person.',
      Aquarius: 'Your drive is odd and experimental. You like novelty, friendship first and a lover who surprises you.',
      Pisces: 'Your drive is dreamy and merging. You lose track of time, and you give more than you plan to.',
    },
    inHouse: {
      1: 'Your drive is a big part of your presence. People feel it when you walk in, whether you intend them to or not.',
      2: 'Your drive is linked to money and comfort. You enjoy buying gifts and good food, and a lack of security cools you off.',
      3: 'Your drive starts with words. Messages, phone calls and talk lead to bed.',
      4: 'Your drive roots in home and feeling safe. Passion lives best in private rooms and familiar places.',
      5: 'Your drive is playful and visible. Dating, dancing, flirting and being admired turn you on.',
      6: 'Your drive shows up in daily life, in the routines, the energy and the work you put in.',
      7: 'Your drive lives in partnership. It rises with one person and drops when the relationship is flat.',
      8: 'Your drive is intense and private. Trust, secrets and complete surrender are what turn you on.',
      9: 'Your drive grows when you travel. New places, new people and new ideas make you want more.',
      10: 'Your drive goes into ambition. You chase a goal with the same hunger as a lover.',
      11: 'Your drive is sparked in groups. You meet lovers through friends, causes and shared plans.',
      12: 'Your drive is hidden. Secret crushes, long fantasies and private moments carry more weight than the visible ones.',
    },
  },
  'Part of Desire': {
    general: 'What you crave at the deepest level.',
    inSign: {
      Aries: 'You want to be free to act. A boss who checks your work or a partner who says wait is the fastest way to lose you.',
      Taurus: 'You want a comfortable life you can count on: a good bed, good food, money in the account. Uncertainty drains you.',
      Gemini: 'You want to know things and meet people. Being stuck in one routine, one town, one conversation feels like a cage.',
      Cancer: 'You want to belong. A home, a table with your people, and someone who says come in without being asked.',
      Leo: 'You want to be loved out loud. Applause, compliments and someone who clearly picks you in a crowd.',
      Virgo: 'You want to be useful and to get it right. A day when you have made something better is a good day.',
      Libra: 'You want a partner and a calm life. Being alone for long stretches makes you uneasy, and conflict makes you sick.',
      Scorpio: 'You want depth and control. Surface chat bores you, and you would rather have one real person than a hundred acquaintances.',
      Sagittarius: 'You want meaning and open roads. A routine job without a reason makes you restless, and so does a partner who wants you home.',
      Capricorn: 'You want respect and a name that counts. You will work for years to be taken seriously.',
      Aquarius: 'You want to be yourself without apology. You crave friends who accept your odd side and a life with no script.',
      Pisces: 'You want to dissolve into something bigger: love, music, faith, a cause. Ordinary life can feel too small.',
    },
    inHouse: {
      1: 'You crave freedom to be yourself. Your biggest wish is to live without having to explain or tone it down.',
      2: 'You crave security. A steady income, a home you own and things that last make you calm.',
      3: 'You crave information and company. Books, conversations, short trips and a lively neighbourhood.',
      4: 'You crave a home and a family, whether the one you came from or the one you build.',
      5: 'You crave romance, children and play. You want to make something and enjoy it with someone.',
      6: 'You crave useful work and a body that feels good. A day with a clear list ticked off is your reward.',
      7: 'You crave a partner. A long-term relationship matters more to you than you let on.',
      8: 'You crave intensity: a bond so close you can share every secret, and a chance to start fresh.',
      9: 'You crave distance and truth. Another country, a bigger question and the freedom to follow it.',
      10: 'You crave achievement and respect. A title, a result or a legacy that proves it was worth it.',
      11: 'You crave community. Friends who share your goals, and a cause bigger than you.',
      12: 'You crave peace and space. Time alone, quiet, and a break from being needed.',
    },
  },
  'Part of Faith': {
    general: 'Your spiritual beliefs and devotion.',
    inSign: {
      Aries: 'Your faith is active. You pray with your feet: volunteering, defending someone, doing the hard thing, and you lose patience with people who only talk about it.',
      Taurus: 'Your faith is physical. A walk outside, a meal shared, garden work, and a belief you can touch rather than argue.',
      Gemini: 'Your faith questions everything. You read the sacred texts, ask the awkward question in the class and change your mind more than once.',
      Cancer: 'Your faith is family. Rituals, holidays and a grandmother\'s prayers tie you to something older than you.',
      Leo: 'Your faith is joyful and expressive. Music, celebration and a community that sings out loud matter to you.',
      Virgo: 'Your faith shows in how you work. Cleaning, tending, caring for the sick and getting the details right are your devotions.',
      Libra: 'Your faith is about fairness. You believe in justice, you argue ethics and you cannot ignore cruelty.',
      Scorpio: 'Your faith goes through the dark. You have lost it, rebuilt it and come out with a belief that cannot be shaken.',
      Sagittarius: 'Your faith asks big questions. You read philosophy, travel to sacred sites and trust that there is a meaning somewhere.',
      Capricorn: 'Your faith is disciplined. You keep traditions, show up every week and respect rules, even when they are hard.',
      Aquarius: 'Your faith is your own. You may reject organised religion, and believe in humanity, science or a cause.',
      Pisces: 'Your faith is mystical. Dreams, signs and silence speak to you, and you do not need proof.',
    },
    inHouse: {
      1: 'Your faith is who you are. People can tell what you believe from the way you live.',
      2: 'Your faith ties to your values and your money. You give, tithe or refuse deals that clash with it.',
      3: 'Your faith is learned and discussed. Books, classes and talks with siblings or friends shape it.',
      4: 'Your faith comes from home. The tradition you were raised in is the one you return to.',
      5: 'Your faith is creative and joyful. Art, song and children bring you closest to it.',
      6: 'Your faith is practised daily. A morning routine, a prayer before work, a habit of service.',
      7: 'Your faith is shared with a partner. You grow by talking about it with the person closest to you.',
      8: 'Your faith is tested by crisis. A death or loss strips it down and rebuilds it into something real.',
      9: 'Your faith is your life\'s journey. Study, travel and teaching are your path.',
      10: 'Your faith is public. You speak about it, represent it or build a career around it.',
      11: 'Your faith serves the community. You belong to a group that acts on what it believes.',
      12: 'Your faith lives in private. Prayer, meditation and solitude are where you meet it.',
    },
  },
  'Part of Intelligence': {
    general: 'Your mental acuity and intellectual gifts.',
    inSign: {
      Aries: 'You think fast and decide fast. You grasp the point in the first sentence and get impatient with the rest.',
      Taurus: 'You think slowly and remember everything. Once you learn something it stays, and you do not change your mind lightly.',
      Gemini: 'You think in many directions at once. You read five books, hold three conversations and connect ideas others miss.',
      Cancer: 'You think through feeling. You pick up on a mood in a room before anyone speaks, and you remember how things felt years later.',
      Leo: 'You think big and creatively. Pitches, stories and visions come to you whole.',
      Virgo: 'You think in details. You find the error, the missing step and the cleaner method.',
      Libra: 'You think in both sides at once. You weigh each argument, see the fair answer and sometimes take too long to commit.',
      Scorpio: 'You think by digging. You pick up on motives, work out what is hidden and do not stop until you know.',
      Sagittarius: 'You think in the big picture. You see where things are going, and you tend to leave the small print for later.',
      Capricorn: 'You think in plans. You map the next ten years, measure risk and trust what you can prove.',
      Aquarius: 'You think differently. You solve problems from the side and often get an idea years before others agree.',
      Pisces: 'You think in images and feelings. Poems, music and hunches reach you before logic does.',
    },
    inHouse: {
      1: 'Your mind is your brand. People know you as the smart one, or the one who never stops thinking.',
      2: 'Your mind goes to money. You do the maths, spot deals and know the price of everything.',
      3: 'Your mind is at home here. You read, write, talk and learn constantly.',
      4: 'Your mind works through memory and feeling. Family history and childhood details are sharp.',
      5: 'Your mind is creative. Games, stories and clever play are how you learn best.',
      6: 'Your mind is practical. You solve work problems, improve systems and notice flaws.',
      7: 'Your mind sharpens in conversation. Debate, negotiation and a good argument bring out your best.',
      8: 'Your mind penetrates. Mysteries, psychology and research hold your attention.',
      9: 'Your mind reaches for wisdom. Philosophy, languages and big questions suit you.',
      10: 'Your mind drives your career. Planning, strategy and leadership use it daily.',
      11: 'Your mind serves ideas and groups. Technology, science and social change interest you.',
      12: 'Your mind accesses the hidden. Dreams, intuition and the unconscious give you ideas.',
    },
  },
  'Part of Honor': {
    general: 'Your public honor, respect, and recognition.',
    inSign: {
      Aries: 'People respect you for going first. The person who stepped up when nobody else would is the one they remember.',
      Taurus: 'People respect you because you deliver. The same quality, the same quote, the same hour, year after year.',
      Gemini: 'People respect you for what you know. Your explanations, your articles and your quick answers are what earn you the title.',
      Cancer: 'People respect you for taking care of them. The boss who remembers a child\'s name and covers for you when you are ill earns lasting loyalty.',
      Leo: 'People respect you for putting on a show. A great speech, a big event or a standout performance earns you a reputation.',
      Virgo: 'People respect you for being reliable. The clean report, the careful work and the quiet fix are what they praise.',
      Libra: 'People respect you for being fair. You settle disputes, you dress for the room and you leave both sides feeling heard.',
      Scorpio: 'People respect you for surviving things. You came through a crisis others did not, and your calm in a storm earns trust.',
      Sagittarius: 'People respect you for your honesty and range. You teach, you travel, you speak your mind and you have stories to match.',
      Capricorn: 'People respect you for the long haul. A title earned over decades, a firm that survived and a name that means something.',
      Aquarius: 'People respect you for being original. You propose what nobody else dared, and you are proven right later.',
      Pisces: 'People respect you for quiet generosity. The favours nobody sees add up to a good name in a small circle.',
    },
    inHouse: {
      1: 'Honor comes from who you are. Your character, your manner and your word count more than your title.',
      2: 'Honor comes from building your own wealth. Respect follows when you are self-made.',
      3: 'Honor comes from what you write and say. A published piece, a talk or a clever reply earns you your name.',
      4: 'Honor comes from family and roots. Your name, your home and your parents\' reputation carry weight.',
      5: 'Honor comes from creative work. A show, a book or a child who does well brings recognition.',
      6: 'Honor comes from dedicated work. People trust you because you keep showing up and doing it right.',
      7: 'Honor comes through the people you work with. A partner or a client who speaks well of you lifts your reputation.',
      8: 'Honor comes from getting through crisis. Surviving something hard and helping others do the same earns respect.',
      9: 'Honor comes from learning and teaching. A degree, a book or a reputation as a wise person abroad.',
      10: 'Honor is your career. Public rank, a high office and the respect of your field are within reach.',
      11: 'Honor comes from leading groups. A community, a team or a cause that depends on you.',
      12: 'Honor comes from quiet service. A reputation that grows without publicity and is recognised late.',
    },
  },
  'Part of Increase': {
    general: 'Abundance, growth, and expansion.',
    inSign: {
      Aries: 'Things grow when you start them. A business launched on a Monday, a habit begun today, a risk taken before you were ready.',
      Taurus: 'Things grow slowly and then stay. Savings, land and skills compound, and you gain more by holding than by trading.',
      Gemini: 'Things grow through contacts and ideas. Every person you talk to is a possible job, a client or a friend.',
      Cancer: 'Things grow in the home. Property gains value, family expands and your cooking brings people to your table.',
      Leo: 'Things grow when you share them. A generous gesture, a public project or a gift returns multiplied.',
      Virgo: 'Things grow when you improve them. A neater system, a better routine and a repaired relationship pay off.',
      Libra: 'Things grow in partnership. A merger, a marriage or a collaboration multiplies what either of you could do alone.',
      Scorpio: 'Things grow by investing deeply. Money, effort or trust placed in the right hands doubles over time.',
      Sagittarius: 'Things grow with travel and teaching. A course, a trip or a book that reaches far more people than you expected.',
      Capricorn: 'Things grow with discipline. Steady saving, regular promotion and a structured plan add up over decades.',
      Aquarius: 'Things grow through groups and new ideas. A network, an online audience or a technology that spreads.',
      Pisces: 'Things grow when you trust. Gifts come unexpectedly, and faith carries you through lean periods.',
    },
    inHouse: {
      1: 'You grow in yourself. Confidence, skills and presence build year after year, and others notice.',
      2: 'Your money grows. Income, savings and possessions increase, especially when you invest in your own skills.',
      3: 'Your knowledge and contacts multiply. Every course, conversation and trip pays off later.',
      4: 'Your property and family grow. A bigger home, a larger family and a stronger base.',
      5: 'Your creative output grows. More projects, more romance, more children or more fun.',
      6: 'Your productivity and health improve. A better routine produces visible results within months.',
      7: 'Your partnerships grow. A strong partner or client multiplies your income and your reach.',
      8: 'Shared resources grow. Joint funds, inheritances and investments increase.',
      9: 'Your wisdom and opportunities grow. Study, travel and teaching widen your world.',
      10: 'Your career grows. Promotions, recognition and a bigger public role follow.',
      11: 'Your influence grows. Your circle, your followers and your causes get bigger.',
      12: 'Your inner life grows. Meditation, dreams and retreats deepen quietly.',
    },
  },
  'Part of Travel': {
    general: 'Long-distance travel and foreign connections.',
    inSign: {
      Aries: 'You travel on impulse. A cheap flight on Thursday, a road trip with no hotel, a move you decide in a day.',
      Taurus: 'You travel for comfort and taste. Good food, nice hotels, a slow week in the same place, and the return trips to places you love.',
      Gemini: 'You travel often and in short bursts. Weekend breaks, work trips and constant messages from abroad.',
      Cancer: 'You travel to find home. Family reunions, ancestral towns and a long stay near water or a childhood place.',
      Leo: 'You travel with style. Big trips, memorable photos, and a story you tell for years.',
      Virgo: 'You travel with a plan. Packing lists, checked reservations and trips tied to work, study or health.',
      Libra: 'You travel to enjoy beauty and company. Romantic cities, art, a honeymoon and a partner at your side.',
      Scorpio: 'You travel to change. A trip that ends a relationship or begins a new life, and places you cannot forget.',
      Sagittarius: 'You travel constantly. Living abroad, long trips, learning languages and always planning the next one.',
      Capricorn: 'You travel for work. Business trips, conferences and moves for a better position.',
      Aquarius: 'You travel to unusual places. Group journeys, causes and destinations few people choose.',
      Pisces: 'You travel to find peace. Retreats, pilgrimages, the sea and places where you can be quiet.',
    },
    inHouse: {
      1: 'Travel is part of who you are. You describe yourself through the places you have been.',
      2: 'Travel affects your income. You earn or spend on trips, and a foreign contract may come your way.',
      3: 'Short trips come often. Visits to siblings, local errands and quick breaks.',
      4: 'Travel returns you home. You move for family, or you go back to your roots.',
      5: 'Travel is for pleasure. Holidays, festivals and romance on the road.',
      6: 'Travel is for work or health. Business trips, treatments and practical journeys.',
      7: 'Travel is shared. You go with a partner, or you meet one on the road.',
      8: 'Travel transforms you. A trip that changes your mind or your life.',
      9: 'Travel is your destiny. Long journeys, other cultures and moving abroad.',
      10: 'Travel serves your career. Conferences, relocations and international jobs.',
      11: 'Travel is with groups. Friends, teams, tours and causes.',
      12: 'Travel is for retreat. Sacred places, solitude and rest.',
    },
  },
  'Part of Catastrophe': {
    general: 'Crisis points and major life disruptions.',
    inSign: {
      Aries: 'Trouble starts with a rash decision. A fight you cannot take back, a speeding ticket, an accident from rushing.',
      Taurus: 'Trouble starts with money or possessions. A lost job, a market drop, a house that loses value or a stubborn choice that costs a lot.',
      Gemini: 'Trouble starts with information. A misread contract, a leaked message, a lie that spreads or a deadline missed.',
      Cancer: 'Trouble starts with the family. A death, a move, a breakdown at home or a feeling you could not hold.',
      Leo: 'Trouble starts with pride. A public failure, a loss of status or an ego bruise that rearranges your plans.',
      Virgo: 'Trouble starts with work or health. Burnout, a layoff, an illness you ignored or a mistake you did not catch.',
      Libra: 'Trouble starts with a relationship. A break-up, a legal dispute or a betrayal from someone you trusted.',
      Scorpio: 'Trouble starts with power. A betrayal over money, the loss of control or someone with leverage over you.',
      Sagittarius: 'Trouble starts with a belief. A scam, a bad advisor, a trip gone wrong or a faith that falls apart.',
      Capricorn: 'Trouble starts with structure. A company folding, a career ending or a rule that breaks your plan.',
      Aquarius: 'Trouble starts suddenly. A shock event, a sudden departure or a friend group splitting.',
      Pisces: 'Trouble starts with illusion. A disappointment, a deception you wanted to believe or an escape that went too far.',
    },
    inHouse: {
      1: 'Crisis rewrites who you are. After the worst year, you are a different person.',
      2: 'Crisis hits money. Debt, a lost job or a bad investment forces you to rebuild.',
      3: 'Crisis hits communication. Accidents on the road, hard news or a break with a sibling.',
      4: 'Crisis hits home. A move, a break-up or a family emergency.',
      5: 'Crisis hits love or children. A heartbreak, a loss or a creative disaster.',
      6: 'Crisis hits health or work. Illness or a layoff pushes you to change your life.',
      7: 'Crisis hits partnership. A divorce, a lawsuit or a falling out.',
      8: 'Crisis hits shared money. Debts, inheritances or a financial betrayal.',
      9: 'Crisis hits belief. A failed plan abroad, a legal case or a lost faith.',
      10: 'Crisis hits career. A public fall or a sudden change in position.',
      11: 'Crisis hits friends and groups. A betrayal, a split or a shattered dream.',
      12: 'Crisis hits in private. Hidden fears, secret losses or a time alone that forces a reset.',
    },
  },
  'Part of Inheritance': {
    general: 'Inherited wealth, legacy, and family resources.',
    inSign: {
      Aries: 'You inherit nerve. A parent or grandparent who started things from nothing, and a habit of acting before the fear arrives.',
      Taurus: 'You inherit property or the habit of saving. Land, a house, jewellery or the family rule to never spend what you cannot see.',
      Gemini: 'You inherit stories and skills with words. A relative who wrote, taught or talked, and the library that came with them.',
      Cancer: 'You inherit a home and its feelings. The family house, recipes and a way of caring that comes with the walls.',
      Leo: 'You inherit talent and a taste for the stage. Singers, makers or showmen in the family line.',
      Virgo: 'You inherit practical skills and health habits. A trade, a method or a family way of keeping a house running.',
      Libra: 'You inherit connections and manners. A family that knows how to talk to people and to make deals.',
      Scorpio: 'You inherit money and secrets. A will, a debt or a family history that is not discussed.',
      Sagittarius: 'You inherit beliefs and a sense of adventure. A family tradition of faith or travel.',
      Capricorn: 'You inherit discipline and duty. A business, a name or a standard to uphold.',
      Aquarius: 'You inherit difference. A family with an eccentric streak and a tradition of ideas.',
      Pisces: 'You inherit sensitivity and spiritual gifts. Dreams, intuition and the ability to feel what others feel.',
    },
    inHouse: {
      1: 'You inherit your looks, your temperament and your manner from the family.',
      2: 'You inherit money, goods and a way of earning from the family.',
      3: 'You inherit a family gift with words, learning and the sibling bond.',
      4: 'You inherit property and roots. The family home is likely to matter.',
      5: 'You inherit creative talent and an attitude to love and play.',
      6: 'You inherit health patterns and work habits from the family.',
      7: 'You inherit relationship patterns. Your parents\' marriage is a template you follow or avoid.',
      8: 'You directly inherit money or property, and often the responsibilities that come with it.',
      9: 'You inherit beliefs, languages and a view of the world.',
      10: 'You inherit professional standing, a family business or a famous name.',
      11: 'You inherit contacts and community, a circle you were born into.',
      12: 'You inherit hidden karma. Family secrets and spiritual patterns sit in the background.',
    },
  },
  'Part of Mastery': {
    general: 'Skill mastery, discipline, and craft.',
    inSign: {
      Aries: 'You master things by competing. Practice against someone better, enter the race and learn from losing.',
      Taurus: 'You master things by repeating them. The same recipe, scale or stroke for years until your hands know it.',
      Gemini: 'You master things by teaching them. You learn a subject properly when you must explain it to someone else.',
      Cancer: 'You master things through feeling. Cooking, nursing, counselling: crafts where reading people matters.',
      Leo: 'You master things you get to perform. Music, design, speaking, cooking for a crowd.',
      Virgo: 'You master the fine detail. Precision crafts, editing, medicine, engineering and anything where a millimetre counts.',
      Libra: 'You master things that need taste and balance. Design, law, diplomacy, styling.',
      Scorpio: 'You master things that need depth. Investigation, therapy, surgery and long research.',
      Sagittarius: 'You master things through wide study. Languages, philosophy, coaching and teaching.',
      Capricorn: 'You master things with time. Ten years of showing up gets you further than a flash of talent.',
      Aquarius: 'You master new fields. Technology, science, unusual crafts that few have tried.',
      Pisces: 'You master by feel. Music, painting, healing and crafts you cannot fully explain.',
    },
    inHouse: {
      1: 'You master yourself. Habits, discipline and character are your real craft.',
      2: 'You master earning and managing money.',
      3: 'You master communication: speaking, writing, languages.',
      4: 'You master home arts: cooking, building, decorating, caring.',
      5: 'You master creative expression and play.',
      6: 'You master technique and daily craft. Your routines make you better each year.',
      7: 'You master relationships. Negotiation, partnership and listening are your skills.',
      8: 'You master transformation: therapy, finance, research and healing.',
      9: 'You master knowledge. Study, teaching and travel make you wise.',
      10: 'You master your profession. People call you the expert in your field.',
      11: 'You master group dynamics. Organising people and ideas comes easily.',
      12: 'You master your inner practice. Meditation, prayer and quiet work.',
    },
  },
  'Part of Attraction': {
    general: 'What attracts others to you.',
    inSign: {
      Aries: 'People are drawn to your nerve. You say yes first, you walk in confident, and you make others feel braver.',
      Taurus: 'People are drawn to how steady you feel. You are calm, warm to the touch and good at making a day feel easy.',
      Gemini: 'People are drawn to your wit. You ask good questions, tell the right joke and make a dull evening fun.',
      Cancer: 'People are drawn to how safe they feel. You listen, remember details and make a room feel like home.',
      Leo: 'People are drawn to your warmth. You laugh loudly, praise freely and make others feel like the main character.',
      Virgo: 'People are drawn to your competence. You remember what they said, help without being asked and get things right.',
      Libra: 'People are drawn to your charm. You dress well, speak gently and make everyone feel welcome.',
      Scorpio: 'People are drawn to your depth. You look at them directly, say little, and they want to know what you are thinking.',
      Sagittarius: 'People are drawn to your lightness. You are curious, funny and make plans that feel like adventures.',
      Capricorn: 'People are drawn to your seriousness. You look like someone who can be trusted, and later they discover your dry humour.',
      Aquarius: 'People are drawn to your difference. You are unpredictable, friendly with strangers and unbothered by approval.',
      Pisces: 'People are drawn to your softness. You see them kindly, you imagine more than you say and they feel understood.',
    },
    inHouse: {
      1: 'You attract through presence. How you look, move and enter a room is your biggest draw.',
      2: 'You attract through what you have: comfort, a generous hand and a calm manner.',
      3: 'You attract through conversation. Messages, jokes and a quick mind.',
      4: 'You attract through warmth. A welcoming home and a caring manner.',
      5: 'You attract through creativity and fun. People gather around you when you play.',
      6: 'You attract through helpfulness. People are drawn to you because you make life easier.',
      7: 'You attract through how you handle relationships. People like how you listen and work with others.',
      8: 'You attract through intensity. People feel your depth before you speak.',
      9: 'You attract through ideas and openness. People like how wide your world is.',
      10: 'You attract through status. Your role and your reputation make you interesting to others.',
      11: 'You attract through your vision and your friends. People join you for your goals.',
      12: 'You attract through mystery. People wonder about your private life and your quiet side.',
    },
  },
  'Part of Sexuality': {
    general: 'Your sexual magnetism and erotic nature.',
    inSign: {
      Aries: 'You are direct. You make the first move, want what you want right now and lose interest in the slow build.',
      Taurus: 'You are sensual and slow. Touch, taste and comfort matter, and you can stay in bed all Sunday.',
      Gemini: 'You are playful and talkative. Teasing, messages and curiosity are your foreplay.',
      Cancer: 'You are emotional. You need to feel close and safe before you relax, and then you give a lot.',
      Leo: 'You are generous and theatrical. You love being desired, you give compliments freely and you like a lover who shows it.',
      Virgo: 'You are attentive and a bit reserved. You pay attention to details, and your confidence grows with trust.',
      Libra: 'You are romantic and aesthetic. Mood, lighting and kindness matter, and rudeness switches you off.',
      Scorpio: 'You are intense. You want complete trust, you keep secrets well and you can be jealous.',
      Sagittarius: 'You are adventurous and cheerful. You laugh in bed, travel with lovers and run from clingy partners.',
      Capricorn: 'You are reserved until trust builds. After that you are steady, patient and surprisingly passionate.',
      Aquarius: 'You are experimental and independent. Friendship comes first, and you like variety and unconventional setups.',
      Pisces: 'You are dreamy and giving. You merge easily, and you need to keep your boundaries clear.',
    },
    inHouse: {
      1: 'Sexuality is central to who you are. Your presence carries it whether you mean it to or not.',
      2: 'Sexuality is linked to your self-worth. How you feel about your body and your value shows up in bed.',
      3: 'Sexuality starts with words. Messages, flirting and conversation lead the way.',
      4: 'Sexuality is private. It belongs in your home and with someone you trust.',
      5: 'Sexuality is joyful and playful. You enjoy romance, dating and creative flirting.',
      6: 'Sexuality is part of everyday life. It grows through habit, care and shared routine.',
      7: 'Sexuality lives in partnership. It is stronger with one committed person.',
      8: 'Sexuality is intense and deep. It involves trust, secrets and transformation.',
      9: 'Sexuality is adventurous. New places, new people and new ideas keep it alive.',
      10: 'Sexuality has a public side. Charisma and status add to your appeal.',
      11: 'Sexuality grows from friendships and groups. Lovers often come from your circle.',
      12: 'Sexuality has a hidden, spiritual side. Secret attractions and unspoken desires play a role.',
    },
  },
};

// ─── Helper Functions ───────────────────────────────────────────────────────

function getSuffix(n: number): string {
  if (n === 1) return 'st';
  if (n === 2) return 'nd';
  if (n === 3) return 'rd';
  return 'th';
}

function generatePersonalizedPartInterpretation(part: ArabicPart, firstName: string): string {
  const meanings = PART_MEANINGS[part.name];
  if (!meanings) return '';
  const signText = meanings.inSign[part.sign] || '';
  const houseText = part.house ? (meanings.inHouse[part.house] || '') : '';
  return `${firstName}, your ${part.name} in **${part.sign}** in the **${part.house ? part.house + getSuffix(part.house) + ' house' : 'chart'}** means: ${signText} ${houseText}`;
}

function generateLocalArabicPartsReading(parts: ArabicPart[], firstName: string): string {
  let reading = `## ${firstName}'s Arabic Parts Reading\n\n`;
  reading += `${firstName}, your chart contains **${parts.length} Arabic Parts** — ancient mathematical points that reveal hidden dimensions of your unique destiny. Each one is a cosmic equation calculated specifically from your birth chart, unlocking areas of your life that planets and houses alone cannot show.\n\n`;

  const keyPartsList = parts.filter(p => KEY_PARTS.some(kp => p.name.toLowerCase().includes(kp.toLowerCase())));
  const otherPartsList = parts.filter(p => !KEY_PARTS.some(kp => p.name.toLowerCase().includes(kp.toLowerCase())));

  if (keyPartsList.length > 0) {
    reading += `### ${firstName}'s Key Parts\n\n`;
    for (const part of keyPartsList) {
      const meanings = PART_MEANINGS[part.name];
      if (meanings) {
        reading += `**${part.name}** in **${part.sign}** (House ${part.house || '?'})\n\n`;
        reading += `${generatePersonalizedPartInterpretation(part, firstName)}\n\n`;
      }
    }
  }

  const majorPartNames = ['Part of Career', 'Part of Death', 'Part of Illness', 'Part of Travel',
    'Part of Courage', 'Part of Victory', 'Part of Nemesis', 'Part of Children'];
  const majorParts = parts.filter(p => majorPartNames.includes(p.name));

  if (majorParts.length > 0) {
    reading += `### ${firstName}'s Major Life Parts\n\n`;
    for (const part of majorParts) {
      const meanings = PART_MEANINGS[part.name];
      if (meanings) {
        reading += `**${part.name}** in **${part.sign}** (House ${part.house || '?'})\n\n`;
        reading += `${generatePersonalizedPartInterpretation(part, firstName)}\n\n`;
      }
    }
  }

  const signCounts: Record<string, number> = {};
  const houseCounts: Record<number, number> = {};
  for (const part of parts) {
    signCounts[part.sign] = (signCounts[part.sign] || 0) + 1;
    if (part.house) houseCounts[part.house] = (houseCounts[part.house] || 0) + 1;
  }
  const topSign = Object.entries(signCounts).sort((a, b) => b[1] - a[1])[0];
  const topHouse = Object.entries(houseCounts).sort((a, b) => b[1] - a[1])[0];

  reading += `### Patterns in ${firstName}'s Parts\n\n`;
  if (topSign) {
    reading += `${firstName}, **${topSign[0]}** is your most activated sign with ${topSign[1]} Arabic Parts falling there. This means the energy of ${topSign[0]} — its style, its strengths, its challenges — runs through multiple dimensions of your destiny.\n\n`;
  }
  if (topHouse) {
    reading += `**House ${topHouse[0]}** is your most activated house with ${topHouse[1]} Parts concentrated there. This house is a powerhouse in your chart, ${firstName} — pay special attention to the life areas it governs.\n\n`;
  }

  const remaining = otherPartsList.filter(p => !majorPartNames.includes(p.name));
  if (remaining.length > 0) {
    reading += `### Other Notable Parts\n\n`;
    for (const part of remaining.slice(0, 8)) {
      const meanings = PART_MEANINGS[part.name];
      if (meanings) {
        reading += `**${part.name}** in ${part.sign} (House ${part.house || '?'}): ${generatePersonalizedPartInterpretation(part, firstName)}\n\n`;
      }
    }
  }

  reading += `---\n\n`;
  reading += `${firstName}, the Arabic Parts are one of the oldest and most profound tools in astrology. They reveal dimensions of your chart that planets and houses alone cannot show. Revisit this reading as you grow — the meanings will deepen with your own self-knowledge.\n`;

  return reading;
}

// ─── Copy Button ─────────────────────────────────────────────────────────────

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded bg-bg-tertiary text-text-muted hover:text-text-primary transition-colors"
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
    >
      <Copy className="w-3 h-3" />
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
}

// ─── Markdown Renderer ──────────────────────────────────────────────────────

function RenderMarkdown({ text }: { text: string }) {
  const lines = text.split('\n');
  return (
    <div className="space-y-1">
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (trimmed.startsWith('## ')) {
          return <h2 key={i} className="text-lg font-bold text-amber-400 mt-4 mb-2">{trimmed.replace('## ', '')}</h2>;
        } else if (trimmed.startsWith('### ')) {
          return <h3 key={i} className="text-base font-semibold text-text-primary mt-3 mb-1">{trimmed.replace('### ', '')}</h3>;
        } else if (trimmed.startsWith('---')) {
          return <hr key={i} className="border-border-primary my-3" />;
        } else if (trimmed.startsWith('- ')) {
          return (
            <div key={i} className="flex gap-2 pl-2 mb-1">
              <span className="text-amber-400">&bull;</span>
              <InlineBold text={trimmed.slice(2)} className="text-text-secondary text-sm leading-relaxed" />
            </div>
          );
        } else if (trimmed.length > 0) {
          return <p key={i} className="text-text-secondary text-sm leading-relaxed mb-1"><InlineBold text={trimmed} /></p>;
        }
        return <div key={i} className="h-2" />;
      })}
    </div>
  );
}

// ─── Calculation Helpers ────────────────────────────────────────────────────

function getLon(planets: any[], name: string): number | null {
  const p = planets.find((pl: any) => (pl.name || pl.planet) === name);
  return p ? (p.longitude ?? null) : null;
}

function getHouseForLon(lon: number, ascLon: number): number {
  const ascSignIdx = Math.floor(ascLon / 30) % 12;
  const lonSignIdx = Math.floor(lon / 30) % 12;
  return ((lonSignIdx - ascSignIdx + 12) % 12) + 1;
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function ArabicPartsPage() {
  const { profile } = useAuthStore();
  const [chartData, setChartData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expandedPart, setExpandedPart] = useState<string | null>(null);
  const [aiReading, setAiReading] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const hasFetchedRef = useRef(false);
  const hasTriggeredReadingRef = useRef(false);

  const firstName = profile?.display_name?.split(' ')[0] || 'Friend';

  // Calculate Arabic Parts from chart data
  const arabicParts: ArabicPart[] = useMemo(() => {
    if (!chartData) return [];
    const planets = chartData?.planets || chartData?.positions || [];
    if (planets.length === 0) return [];

    const ascLon = getLon(planets, 'Ascendant') ?? getLon(planets, 'ASC');
    if (ascLon === null) return [];

    const sunLon = getLon(planets, 'Sun');
    const sunHouse = sunLon !== null ? getHouseForLon(sunLon, ascLon) : 1;
    const isDayChart = sunHouse >= 7;

    const parts: ArabicPart[] = [];
    for (const [name, refName, body1Name, body2Name, nightReverse, formula, meaning] of ARABIC_PARTS_FORMULAS) {
      const mcLon = getLon(planets, 'MC') ?? getLon(planets, 'Midheaven');
      const ref = refName === 'MC' ? mcLon : ascLon;
      let b1 = getLon(planets, body1Name);
      let b2 = getLon(planets, body2Name);
      if (ref === null || b1 === null || b2 === null) continue;

      if (nightReverse && !isDayChart) {
        const temp = b1;
        b1 = b2;
        b2 = temp;
      }
      const lon = ((ref + b1 - b2) % 360 + 360) % 360;
      const signIdx = Math.floor(lon / 30) % 12;
      const degInSign = lon % 30;
      const house = getHouseForLon(lon, ascLon);

      parts.push({ name, sign: SIGNS[signIdx], degree: degInSign, house, longitude: lon, formula, meaning });
    }
    return parts;
  }, [chartData]);

  // Pattern analysis
  const patterns = useMemo(() => {
    if (arabicParts.length === 0) return null;
    const signCounts: Record<string, number> = {};
    const houseCounts: Record<number, number> = {};
    for (const p of arabicParts) {
      signCounts[p.sign] = (signCounts[p.sign] || 0) + 1;
      houseCounts[p.house] = (houseCounts[p.house] || 0) + 1;
    }
    const topSign = Object.entries(signCounts).sort((a, b) => b[1] - a[1])[0];
    const topHouse = Object.entries(houseCounts).sort((a, b) => b[1] - a[1])[0];
    return { topSign, topHouse };
  }, [arabicParts]);

  const isDayChart = useMemo(() => {
    if (!chartData) return true;
    const planets = chartData?.planets || chartData?.positions || [];
    const ascLon = getLon(planets, 'Ascendant') ?? getLon(planets, 'ASC') ?? 0;
    const sunLon = getLon(planets, 'Sun') ?? 0;
    return getHouseForLon(sunLon, ascLon) >= 7;
  }, [chartData]);

  const keyParts = arabicParts.filter(p => KEY_PARTS.includes(p.name));
  const otherParts = arabicParts.filter(p => !KEY_PARTS.includes(p.name));

  const filteredOtherParts = useMemo(() => {
    if (!searchQuery.trim()) return otherParts;
    const q = searchQuery.toLowerCase();
    return otherParts.filter(p => p.name.toLowerCase().includes(q) || p.sign.toLowerCase().includes(q) || p.meaning.toLowerCase().includes(q));
  }, [otherParts, searchQuery]);

  // Auto-load chart on mount
  const fetchChart = useCallback(async () => {
    if (!profile?.birth_date || !profile?.latitude) return;
    setLoading(true);
    setError('');
    try {
      const data = await api.getNatalChart(buildBirthData(profile));
      setChartData(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load chart');
    } finally {
      setLoading(false);
    }
  }, [profile]);

  useEffect(() => {
    if (hasFetchedRef.current) return;
    if (!profile?.birth_date || !profile?.latitude) return;
    hasFetchedRef.current = true;
    fetchChart();
  }, [fetchChart, profile]);

  // Auto-generate reading once parts are calculated
  useEffect(() => {
    if (hasTriggeredReadingRef.current) return;
    if (arabicParts.length === 0) return;
    hasTriggeredReadingRef.current = true;
    const reading = generateLocalArabicPartsReading(arabicParts, firstName);
    setAiReading(reading);
  }, [arabicParts, firstName]);

  if (!profile?.birth_date || !profile?.latitude) {
    return <PaywallGate feature="arabic_parts" fallbackTier="pro"><BirthDataPrompt message="Add your birth data to calculate your Arabic Parts (Lots)." /></PaywallGate>;
  }

  return (
    <PaywallGate feature="arabic_parts" fallbackTier="pro">
    <div className="max-w-3xl mx-auto">
      <Link href="/readings" className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary mb-4">
        <ArrowLeft className="w-4 h-4" />
        Back to Readings
      </Link>
      <div className="flex items-center gap-3 mb-6">
        <Star className="w-8 h-8 text-accent-primary" />
        <div>
          <h1 className="text-2xl font-display font-bold text-text-primary">Arabic Parts</h1>
          <p className="text-text-tertiary text-sm">29 ancient lots calculated from your birth chart</p>
        </div>
      </div>

      {error && !loading && (
        <div className="card text-center py-12">
          <p className="text-red-400 text-sm mb-4">{error}</p>
          <button onClick={fetchChart} className="btn-primary">Retry</button>
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-accent-primary animate-spin mb-4" />
          <p className="text-text-secondary text-sm">Calculating 29 Arabic Parts...</p>
        </div>
      )}

      {arabicParts.length > 0 && (
        <div className="space-y-5">
          {/* Onboarding intro */}
          {showIntro && (
            <div className="card border border-purple-500/30 bg-purple-500/5 relative">
              <button onClick={() => setShowIntro(false)} className="absolute top-2 right-2 text-text-muted hover:text-text-primary text-lg leading-none">&times;</button>
              <h3 className="text-sm font-semibold text-purple-400 mb-2 flex items-center gap-2">
                <Info className="w-4 h-4" /> What Are Arabic Parts?
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Arabic Parts (Lots) are ancient mathematical points calculated from three components in your chart — typically your Ascendant plus one planet minus another. They reveal hidden dimensions of destiny that planets and houses alone cannot show. The 29 lots below cover everything from fortune and love to career and transformation, with day/night reversal for precise calculation.
              </p>
            </div>
          )}

          {/* Day/Night indicator */}
          <div className="flex items-center justify-center gap-2 text-xs text-text-muted">
            <span>{isDayChart ? '☀️ Day Chart' : '🌙 Night Chart'}</span>
            <span className="text-text-muted/50">|</span>
            <span>{arabicParts.length} parts calculated</span>
          </div>

          {/* Pattern highlights */}
          {patterns && (
            <div className="card bg-gradient-cosmic border-accent-muted">
              <h3 className="text-sm font-semibold text-text-primary mb-2 flex items-center gap-2">
                <span className="text-lg">&#x1F4CA;</span> Patterns
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {patterns.topSign && (
                  <div className="text-center p-3 bg-bg-tertiary rounded-xl">
                    <p className="text-xs text-text-muted">Most Active Sign</p>
                    <p className="text-sm font-semibold text-text-primary">{patterns.topSign[0]}</p>
                    <p className="text-[10px] text-accent-primary">{patterns.topSign[1]} parts</p>
                  </div>
                )}
                {patterns.topHouse && (
                  <div className="text-center p-3 bg-bg-tertiary rounded-xl">
                    <p className="text-xs text-text-muted">Most Active House</p>
                    <p className="text-sm font-semibold text-text-primary">House {patterns.topHouse[0]}</p>
                    <p className="text-[10px] text-accent-primary">{patterns.topHouse[1]} parts</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Key Parts */}
          {keyParts.length > 0 && (
            <div className="card">
              <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
                <span className="text-lg">&#x1F511;</span> Key Parts
              </h3>
              <div className="space-y-2">
                {keyParts.map((part) => (
                  <PartCard key={part.name} part={part} expanded={expandedPart === part.name} onToggle={() => setExpandedPart(expandedPart === part.name ? null : part.name)} isKey firstName={firstName} />
                ))}
              </div>
            </div>
          )}

          {/* Inline AI Reading */}
          {aiReading.length > 0 && (
            <div className="card border border-accent-muted">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-accent-primary font-semibold">
                  <Sparkles className="w-4 h-4 inline mr-1" />
                  Your Personal Reading
                </h3>
                <CopyBtn text={aiReading} />
              </div>
              <RenderMarkdown text={aiReading} />
            </div>
          )}

          {/* Other Parts with search */}
          {otherParts.length > 0 && (
            <div className="card">
              <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
                <span className="text-lg">&#x2728;</span> All Parts ({otherParts.length})
              </h3>
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="text"
                  placeholder="Search parts by name, sign, or meaning..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-bg-tertiary border border-border-primary text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-primary"
                />
              </div>
              <div className="space-y-2">
                {filteredOtherParts.map((part) => (
                  <PartCard key={part.name} part={part} expanded={expandedPart === part.name} onToggle={() => setExpandedPart(expandedPart === part.name ? null : part.name)} firstName={firstName} />
                ))}
                {filteredOtherParts.length === 0 && searchQuery && (
                  <p className="text-center text-text-muted text-sm py-4">No parts match &ldquo;{searchQuery}&rdquo;</p>
                )}
              </div>
            </div>
          )}

          <button onClick={() => { hasFetchedRef.current = false; hasTriggeredReadingRef.current = false; setChartData(null); setExpandedPart(null); setAiReading(''); setSearchQuery(''); fetchChart(); }} className="btn-secondary w-full">
            Recalculate
          </button>
        </div>
      )}
    </div>
    </PaywallGate>
  );
}

// ─── Part Card Component ────────────────────────────────────────────────────

function PartCard({ part, expanded, onToggle, isKey, firstName }: { part: ArabicPart; expanded: boolean; onToggle: () => void; isKey?: boolean; firstName: string }) {
  const meanings = PART_MEANINGS[part.name];
  const signInterp = meanings?.inSign[part.sign] || '';
  const houseInterp = meanings?.inHouse[part.house] || '';

  return (
    <div className={`border rounded-xl overflow-hidden ${isKey ? 'border-accent-muted bg-accent-muted/5' : 'border-border-primary'}`}>
      <button onClick={onToggle} className="w-full p-3 text-left">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isKey && <span className="text-[9px] font-bold text-accent-primary bg-accent-muted px-1.5 py-0.5 rounded">KEY</span>}
            <span className="text-sm font-medium text-text-primary">{part.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-accent-primary font-medium">
              {getZodiacGlyph(part.sign)} {part.degree.toFixed(1)}&deg; {part.sign}
            </span>
            <span className="text-[10px] text-text-muted">H{part.house}</span>
            {expanded ? <ChevronUp className="w-3.5 h-3.5 text-text-muted" /> : <ChevronDown className="w-3.5 h-3.5 text-text-muted" />}
          </div>
        </div>
        <p className="text-[11px] text-text-muted mt-0.5">{part.meaning}</p>
      </button>

      {expanded && (
        <div className="px-3 pb-3 pt-1 border-t border-border-primary space-y-2 animate-in fade-in duration-300">
          {signInterp && (
            <div>
              <p className="text-[10px] uppercase text-text-muted font-semibold mb-0.5">In {part.sign}</p>
              <p className="text-xs text-text-secondary">{signInterp}</p>
            </div>
          )}
          {houseInterp && (
            <div>
              <p className="text-[10px] uppercase text-text-muted font-semibold mb-0.5">House {part.house}</p>
              <p className="text-xs text-text-secondary">{houseInterp}</p>
            </div>
          )}
          {/* Personalized interpretation */}
          {meanings && (
            <div className="bg-purple-500/5 rounded-lg p-2 border border-purple-500/10">
              <p className="text-[10px] uppercase text-accent-primary font-semibold mb-0.5">Personalized</p>
              <p className="text-xs text-text-secondary leading-relaxed"><InlineBold text={generatePersonalizedPartInterpretation(part, firstName)} /></p>
            </div>
          )}
          <div className="bg-bg-tertiary rounded-lg p-2">
            <p className="text-[10px] uppercase text-text-muted font-semibold mb-0.5">Formula</p>
            <p className="text-xs text-text-tertiary font-mono">{part.formula}</p>
          </div>
        </div>
      )}
    </div>
  );
}
