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
    general: 'Your luck is concentrated in one corner of life. Look for the work, place or person that leaves you richer afterwards, and keep going back there even when it looks too easy.',
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
    general: 'What you stand for shows up in what you do when nobody\'s grading you. The choices you make here are the ones you\'ll be proud of, or wince at, years later.',
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
    general: 'You attract love the same way every time: who notices you, who stays and what you do when you want someone. The pattern repeats until you see it.',
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
    general: 'There\'s one job in your life you can\'t dodge. Skip it and the weight shows up somewhere else, so you may as well start on Monday.',
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
      1: 'The thing you owe first is your own body and direction. You answer everyone else\'s messages before you book your own appointment, and then wonder why you feel flat by Thursday.',
      2: 'A number you actually know is your duty: what you owe, what comes in, what you can\'t afford to undercut. The month you stop looking at the account is the month it bites.',
      3: 'You owe people replies. The unanswered text to a sibling, the form on the kitchen counter, the call you keep rescheduling all pile up and make you feel behind on your whole life.',
      4: 'A parent\'s appointment, a lease, a leak in the ceiling: home keeps handing you jobs that can\'t wait. You do them, resent them a little, and feel steadier once they\'re done.',
      5: 'Your kids or your own creative work are asking for you tonight, and you can\'t give both your best. Choosing on purpose beats being pulled in two directions every evening.',
      6: 'The unglamorous basics are your assignment: sleep, the job, the grocery run. When you let them slide for a week, everything you care about starts to wobble with them.',
      7: 'Someone near you needs you to show up when it\'s inconvenient. Cancel on them twice and the relationship starts costing you more than the effort ever would have.',
      8: 'Other people\'s messes end up on your desk: a partner\'s debt, a tax letter, a relative\'s estate. You\'re the one who reads the fine print, and nobody thanks you for it.',
      9: 'A degree, a licence, a trip you keep postponing is what you owe your own life. The longer you put it off, the more you quietly feel like you\'re living a smaller version.',
      10: 'People are counting on you at work, so you go in tired and do it anyway. Your good name is built from the days you\'d rather have skipped.',
      11: 'A team, a friend who relies on you, or a cause you signed up for expects you to turn up. Slipping out quietly costs you more standing than saying no honestly.',
      12: 'You owe yourself hours nobody can reach you, and you owe attention to whatever you\'ve been hiding: a worry, a habit, a person. Both get louder the longer you ignore them.',
    },
  },
  'Part of Courage': {
    general: 'You\'ll do things here that you wouldn\'t do anywhere else. Waiting costs more than trying, and you know it.',
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
      1: 'You ask for what you want out loud: the first handshake, the audition, the try at something you might fail in front of people. Hanging back is the only thing that costs you.',
      2: 'Your nerve shows up around money. You name your price out loud without apologising, take the pay cut for the better job, or put savings into something you believe in.',
      3: 'You say the true thing in the meeting, hit publish on the post, and tell a sibling what you actually think. Your bravery is measured in sentences.',
      4: 'You stand up in your own family: confront the parent, buy the house, move out, or end the silence at the dinner table nobody else would break.',
      5: 'You risk looking foolish for love and for your work. You ask the person out, show the half-finished piece, or make the grand gesture and live with the answer.',
      6: 'Your bravery is dull and daily: going to the doctor, doing the task you\'ve avoided for a month, keeping the routine on a day you feel like quitting.',
      7: 'You say no to a partner, end something that\'s dragging, or walk into the dispute instead of letting it fester. Your nerve is tested by one person at a time.',
      8: 'You sit through the hardest rooms: the hospital night, the debt conversation, the secret you finally say out loud. You don\'t look away when others do.',
      9: 'You move abroad, take the hard course, or say in public that you\'ve changed your mind about what you believe. The distance is what frightens you and what pays.',
      10: 'You go for the top job, put your name on the project, and take the blame when your team gets it wrong. Courage here means being visible when it could go badly.',
      11: 'You lead the protest, defend the person the group is ignoring, or walk out of a circle that\'s been bad for you. Doing it with others watching is the test.',
      12: 'Your bravest moments have no audience: sitting alone with a fear, admitting what you did, letting go of something you can\'t control.',
    },
  },
  'Part of Victory': {
    general: 'There\'s one area where you win when you commit and coast when you don\'t. Be honest about which you\'re doing this month.',
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
      1: 'You win on presentation: the interview, the fitness goal, the first impression in a room full of rivals. People back you before you\'ve argued your case.',
      2: 'You win the negotiation. The salary you ask for, the price you hold, the deal where you walk away and they call back usually go your way.',
      3: 'You win with a well-timed sentence: the exam answer, the pitch, the text that lands when the other person was about to say no.',
      4: 'You win on the home front: the property deal, the family dispute, the house you wanted that everyone said was out of reach.',
      5: 'You win the games you enter for fun. Love, competitions and the project you show off all go better when you aren\'t gripping them.',
      6: 'You win at work through steady results: the promotion that comes after two quiet years, the clean test result, the clients who stay.',
      7: 'You win against and with other people: contracts, courtrooms, the person you hoped would say yes. A well-chosen ally doubles your odds.',
      8: 'You win where others fold. The inheritance fight, the debt negotiation, the long standoff all end in your favour because you outlast the other side.',
      9: 'You win through distance and ideas: the foreign deal, the publication, the appeal that goes to a higher court.',
      10: 'You win in public. Awards, promotions and contests with your name on the line tend to go your way, so enter the ones you\'re nervous about.',
      11: 'You win with a team behind you: the election, the fundraiser, the campaign that needs a hundred people to care. Alone you\'d lose; together you don\'t.',
      12: 'You win without anyone seeing it: the private battle, the hidden rival who quietly gives up, the matter settled behind closed doors.',
    },
  },
  'Part of Nemesis': {
    general: 'You trip yourself here. The people you blame are usually standing where your own habit left a gap.',
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
    general: 'How you commit shows in who you choose, when you choose them and what you do after saying yes. It also shows what you\'ll fight about before you\'ve said I do.',
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
      1: 'Once you\'re married, people describe you as half of a pair. Your look, your routine and the way you walk into rooms all shift around the other person.',
      2: 'You merge accounts, buy furniture together, and have the first real fight over the budget. How you two handle money decides how the marriage goes.',
      3: 'You meet through a sibling, a neighbour or a stream of texts, and you stay together by talking things through. A week of short replies is your warning light.',
      4: 'You buy or rent together early, and your partner\'s family is always at the table. The house matters to the marriage more than the wedding day did.',
      5: 'The marriage runs on date nights, kids and shared projects. Boredom is what threatens it, so you keep inventing reasons to enjoy each other.',
      6: 'The marriage is chores, schedules and nursing each other through flu. It works because you show up for the dull parts, not the anniversary dinner.',
      7: 'Your marriage is the biggest thing in your life. Everyone sees you as a couple, and a split would rearrange where you live, who you see and what you own.',
      8: 'You merge money and secrets: joint accounts, an inheritance, a partner\'s family problems that become yours. Hide something here and the marriage never recovers.',
      9: 'Your partner comes from another culture, another city or another faith, and the marriage involves flights, languages and learning a second set of customs.',
      10: 'People watch your marriage. Your partner helps your career or you help theirs, and the two of you get judged as one unit.',
      11: 'You marry out of your friend group, and your friends stay close afterwards. The marriage holds because you two want the same future.',
      12: 'A part of the marriage stays unspoken: a long engagement kept quiet, stretches apart, or a partner who is private. Some of it you\'ll never explain to anyone.',
    },
  },
  'Part of Marriage (M)': {
    general: 'How you commit shows in who you choose, when you choose them and what you do after saying yes. It also shows what you\'ll fight about before you\'ve said I do.',
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
      1: 'Marriage changes the way you carry yourself. Your habits, your clothes and the way you introduce yourself all start to say we.',
      2: 'Your pay and your partner\'s pay become one conversation, and so do values. You learn quickly whether you two spend the same way.',
      3: 'Your marriage lives in talk: long phone calls, jokes only you two get, arguments that get settled in a message sent from the other room.',
      4: 'The home is the marriage. Where you live, who visits and how the place feels matter more to you than the ceremony ever did.',
      5: 'The marriage stays affectionate through kids, hobbies and weekends away. When you stop playing together, it gets quiet fast.',
      6: 'You say I love you by cooking dinner, driving the car and handling a partner\'s illness. Service is your language, and it\'s easy to miss that you\'re doing it.',
      7: 'Your partner is at the centre of every big decision you make. A breakup would shake your whole life, which is why you take the vow seriously.',
      8: 'Marriage means merging money, families and secrets. It\'s intense, and trust is the single thing the whole arrangement stands on.',
      9: 'Your partner opens up places, beliefs or languages you wouldn\'t have found alone. The marriage widens your world.',
      10: 'Your partner\'s reputation counts as much as yours, and the pair of you are judged together in public. Careless words at a work party matter.',
      11: 'Your friends are always around the marriage, and your partner has to fit into the group. If they don\'t, you feel pulled in two.',
      12: 'Something stays unspoken: a past bond, a private arrangement, time apart. You can\'t explain it to everyone, and you stop trying.',
    },
  },
  'Part of Children': {
    general: 'You make things and look after them: children, projects, students, a business. You can\'t stop nurturing certain things, even when you\'re tired.',
    inSign: {
      Aries: 'You make things by starting them in a rush. Your kids are headstrong, your projects begin on a Tuesday afternoon, and someone in your house always wants to go first.',
      Taurus: 'You build things that last: a child you raise patiently, a garden, a product that takes three years. You feel richest when you can hold what you made.',
      Gemini: 'You create by talking. Your child answers back at three, and your best projects begin as an idea you couldn\'t stop explaining to friends.',
      Cancer: 'You make things by feeding and sheltering them. You\'re the parent who is always home, or the boss who remembers every employee\'s kid\'s name.',
      Leo: 'You make things that get applauded. Your kids or your work put you on a stage, and you are happiest when they outshine you.',
      Virgo: 'You research the school, redraft the manuscript and worry about your kids\' health more than you let on. The care is real, and so is the nagging.',
      Libra: 'You need a partner to finish things. A child or a project comes out of a shared effort, and you stall when the other person goes quiet.',
      Scorpio: 'Pregnancy, birth or a project that changes you, and a bond with your kids so deep it borders on guarding. You protect first and explain later.',
      Sagittarius: 'What you make ends up far away: a child who moves abroad, a book that sells in other countries, students who go further than you did.',
      Capricorn: 'You\'re a firm parent, you build a company meant to outlast you, and you wait until you feel ready to start a family. Late starts suit you.',
      Aquarius: 'Your child can\'t be predicted, your project breaks the rules, and your family looks nothing like the one you grew up in. You wouldn\'t swap it.',
      Pisces: 'Your best work arrives in dreams. You shield a sensitive child, parent gently and a little scattered, and forget lunch money more than you\'d admit.',
    },
    inHouse: {
      1: 'People know you as a parent or a maker before they know your job. What you create is part of how you introduce yourself.',
      2: 'Kids or creations cost real money first and bring something back later. You budget for school fees and supplies long before you see a return.',
      3: 'School runs, bedtime stories, tutoring a younger cousin, writing every morning. Making things for you is a daily talk-and-teach job.',
      4: 'The house gets built around your kids, or your work happens at the kitchen table. Home and what you make cannot be pulled apart.',
      5: 'Kids and creative work come to you easily. You\'re good with young people and quick to turn an idea into something you enjoy.',
      6: 'Making things comes with daily care: packed lunches, rehearsals, deadlines. You look after them on a schedule, and they thrive on it.',
      7: 'You make things with one other person, and you split the cost, the sleep and the decisions. Choosing the right partner is half of it.',
      8: 'A birth, a loss or a long wait changes who you are. What you create or lose here marks you for years.',
      9: 'You raise a child abroad, teach, or send your work out to readers on another continent. What you make travels without you.',
      10: 'You\'re known for your family, or your work for the next generation is what you\'ll be remembered for.',
      11: 'Your children or creations connect you to groups: school parents, a collaborative team, a community around a shared project.',
      12: 'You worry about a child quietly, carry an unspoken loss, or make work that stays unseen for years. Part of it is private by choice.',
    },
  },
  'Part of Father': {
    general: 'Your father left something in you: his voice, his rules, his silences. You copy it or fight it, and either way he\'s in the room.',
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
      1: 'You carry your father in your posture, your temper or your silence. People say you look or sound like him, and you wince or smile depending on the day.',
      2: 'His attitude to earning and spending is the one you copy or fight. You hear his voice at the till, in a salary conversation, in every price you hesitate over.',
      3: 'His jokes, his arguments or his silence set how you talk. You finish a sentence the way he did before you notice.',
      4: 'His house, his side of the family and his place in your upbringing are what you measure every home against.',
      5: 'His approval or his criticism sits behind your creative work and your flirting. You perform a little for a man who might not be watching.',
      6: 'His work ethic, his health and his habits turn up in your daily routine. You inherited the back pain or the 6am start.',
      7: 'You choose someone like him or the exact opposite. Either way, your father is in the room at every relationship fight.',
      8: 'His illness, a loss, inheritance or a secret he never told you shapes your family. You learn the real story late and in pieces.',
      9: 'His religion, politics or travels set the questions you ask about life. You argue with his worldview or take it as your own.',
      10: 'His career, his name and his expectations weigh on yours. You push to match him, beat him, or avoid his field altogether.',
      11: 'His friends, his club or his absence from groups affects who you trust. You watch how men gather and learn from it.',
      12: 'A secret, an estrangement or a loss about your father hasn\'t been explained to you yet. It shows up as a feeling with no source.',
    },
  },
  'Part of Mother': {
    general: 'Your mother left something in you: how you comfort yourself, how you feed people and what you expect from care. You carry it into every home you make.',
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
      1: 'Your face, your habits and the way you comfort yourself come from her. When you\'re tired you hear her voice, or you catch yourself in her gestures.',
      2: 'What she saved, spent or worried about is what you carry around money. You hoard or splurge in reaction to her.',
      3: 'Her stories, her scolding and her phone calls were your first lessons. You still talk the way she did when you\'re stressed.',
      4: 'Her kitchen, her neighbourhood and the family rituals are where you go back to. You feel safe or on edge depending on how she kept the house.',
      5: 'Her affection, or the lack of it, set the pattern for how you love and play. You copy her warmth or you try hard to give what you didn\'t get.',
      6: 'Food, sleep, cleaning and illness all echo how she did things. You find her habits turning up in your own mornings.',
      7: 'You pick partners who treat you as she did, or who are the exact opposite. Her marriage is the template you follow or run from.',
      8: 'A tie so deep it can feel suffocating: a loss, an inheritance, a bond that never fully loosened. You feel her pain before she says a word.',
      9: 'Her faith, her trips or her sayings are in your worldview. You quote her without knowing it.',
      10: 'You work to prove something to her, or to be like her. Her opinion of your career still sits in the back of your head.',
      11: 'Her circle, her sociable nature or her loneliness set your own pattern with friends. You either copy her open door or her closed one.',
      12: 'She has a private side you only understood late: a hidden pain, a sacrifice, a feeling she never put into words. You inherited the silence.',
    },
  },
  'Part of Siblings': {
    general: 'You act with your brothers and sisters the way you act in every close group. The rivalry, loyalty and old roles all follow you.',
    inSign: {
      Aries: 'You and your siblings compete over grades, races and the last slice of cake. You fight hard, apologise badly, and still defend each other against outsiders.',
      Taurus: 'Your siblings are loyal and stubborn. You can go months without talking, then one of you turns up with a casserole when it counts.',
      Gemini: 'You text your siblings constantly, tease each other in code and still know every family joke. Silence between you means something is wrong.',
      Cancer: 'One of you has always looked after the others. Holiday dinners matter to all of you, and a skipped one gets remembered for years.',
      Leo: 'Your siblings are loud, loving and a little theatrical. You\'re proud of each other and flare up fast over who got the attention.',
      Virgo: 'You help with their problems, point out their mistakes and ask if they\'re eating properly. They roll their eyes and call you anyway.',
      Libra: 'You keep the peace between siblings by compromising and by never saying what actually annoys you. The resentment waits for a bad Christmas.',
      Scorpio: 'You keep each other\'s secrets, and a falling out can last for years. You remember who said what at the funeral.',
      Sagittarius: 'Your siblings live far away or see the world differently. You swap honest arguments and big plans, and meet up like old friends.',
      Capricorn: 'One of you was the second parent growing up, and the roles stuck into adulthood. You still catch yourself managing them.',
      Aquarius: 'Your siblings are your friends, and quite unlike you. You respect each other\'s space and rarely talk about feelings, which is also the problem.',
      Pisces: 'Your siblings are tender and sometimes needy. You rescue, you worry, and now and then you rearrange your own plans because of them.',
    },
    inHouse: {
      1: 'Being the oldest, youngest or the middle one is still how you see yourself. You still react the way you did at the dinner table at nine.',
      2: 'Shared inheritance, loans and who pays for Mum\'s birthday are bigger topics between you than anyone admits. Settle the money in writing.',
      3: 'Your siblings are in your daily world: the group chat, the weekly call, knowing what each of them had for lunch. Going quiet on them hurts.',
      4: 'You grew up in the same rooms, and the family house still pulls you together. Arguments there start with who gets which bedroom.',
      5: 'You tease, collaborate and share a sense of humour nobody else gets. Your best memories with them are silly ones.',
      6: 'You help a sibling with work, a health scare or an errand more often than you expected. They lean on you, and you let them.',
      7: 'The way you fight with your siblings is the way you fight with partners. Watch how you act at their kitchen table and you\'ll learn something.',
      8: 'Shared losses, an inheritance or a secret you protect tie you to a sibling in ways you don\'t discuss. A death in the family tests it.',
      9: 'A sibling lives abroad or holds beliefs very different from yours. You visit like it\'s a trip and come back thinking about it.',
      10: 'A sibling works with you, sets the bar you compare yourself to, or reflects on your reputation. Their choices become your problem at work.',
      11: 'Their friends and yours overlap, so a falling out with a sibling splits the group chat. You go to the same parties.',
      12: 'You worry quietly about a sibling, or there is a distance nobody explains. Something unspoken has been sitting between you for years.',
    },
  },
  'Part of Friends': {
    general: 'Certain people end up in your corner, and you know why. What you give them and what you quietly expect back decides who stays.',
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
      1: 'People judge you by who you\'re seen with. Your friends are your brand, so you choose them carefully and drop the ones who make you look smaller.',
      2: 'You do business with friends, lend them money or borrow from them. It goes well until a late repayment makes dinner awkward.',
      3: 'Your friends are on your doorstep: neighbours, classmates, colleagues, and the five people you text every day. Distance kills these friendships faster than arguments.',
      4: 'Friends turn into family. They know your parents, have a key to your house and stay for years.',
      5: 'You meet friends at parties, hobby groups and creative projects. The friendships stay light and fun until someone needs something serious.',
      6: 'Your friends come from work and routine: the gym, the office, the class. You help each other with practical problems, and the friendship fades when the routine does.',
      7: 'You choose friends one at a time. A best friend matters more to you than any group, and losing one hurts like a breakup.',
      8: 'Your friends know your history and your secrets. A falling out is never small, and a betrayal here stays with you for years.',
      9: 'Your friends come from abroad, a different faith or a different class. They widen your thinking and invite you to places you\'d never have planned.',
      10: 'Friends open doors for your career, write references and celebrate your wins. You also use them, and a few notice.',
      11: 'Groups, teams and causes are where you feel most at home. You\'d rather lose a job than lose your circle.',
      12: 'You keep a small private circle. A few close friends you see rarely, and others you keep out of sight on purpose.',
    },
  },
  'Part of Career': {
    general: 'There\'s a type of work you\'re built for. It shows in what you do best, what wears you out and the role you grow into.',
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
      1: 'Your job and your identity are the same thing. People hire you for who you are, and a role that doesn\'t fit shows on your face within months.',
      2: 'You pick the role that pays properly, and you grow once you know your market rate. Underselling yourself keeps you stuck for years.',
      3: 'You work with messages, calls and contacts: writing, teaching, short trips, a network that keeps you busy. Your inbox is your office.',
      4: 'You work from your house, in property, in a family business or in a field that looks after people. The line between work and home is thin.',
      5: 'Your job has a play element: entertainment, children, design, anything where you create. A rigid desk job drains you.',
      6: 'You become known for reliability. Health, admin, repairs and hospitality use your daily habits, and clients return because you turn up.',
      7: 'A co-founder, a client or a person who recommends you opens the door. You need a work partner to do your best job.',
      8: 'Banking, insurance, research, therapy and crisis work: you handle other people\'s resources and problems, and stay calm while they panic.',
      9: 'Teaching, publishing, law, travel, religion or international work gives your career distance and depth. A local desk job feels too small.',
      10: 'Your name is attached to your work, and your role is what people know you by. A visible position suits you better than a safe one.',
      11: 'Teams, networks, online communities and collective projects pay you. You do your best work in a crowd that shares a goal.',
      12: 'Research, hospitals, retreats, writing alone: you work behind the scenes. Recognition arrives later and quietly.',
    },
  },
  'Part of Commerce': {
    general: 'You make money from other people in a specific way: what you sell, how you close and where you undercharge. Customers pay you for one thing, and it isn\'t always what you think.',
    inSign: {
      Aries: 'You sell by being first. You spot the gap, make the offer and close before the competition replies.',
      Taurus: 'You sell things people can hold and trust. Good materials, honest pricing and a reputation that spreads by word of mouth.',
      Gemini: 'You sell information and introductions. You broker deals, write copy, connect the buyer to the seller and take a cut.',
      Cancer: 'Customers return because you remember their name, their usual order and their birthday. Looking after them is the sales pitch.',
      Leo: 'You sell yourself. A brand with your face on it, a personality people buy from, a showy launch that gets talked about.',
      Virgo: 'You sell by being the careful one. Fewer products, fewer mistakes, better reviews, and customers who pay extra for reliability.',
      Libra: 'You close deals with charm and good taste, usually through a partner. Your packaging does half the talking.',
      Scorpio: 'You play the long game: acquiring, investing, turning a failing business around, using money others are scared to touch.',
      Sagittarius: 'You sell widely: courses, exports, travel, books. Your offer works best with a big promise and a big market.',
      Capricorn: 'You land contracts with large organisations and build a business with real structure. Selling takes years, and the contracts last.',
      Aquarius: 'You sell new things: apps, communities, subscriptions, odd products with a loyal niche. Your customers find you, not the other way round.',
      Pisces: 'You sell what people feel: art, music, wellness, spiritual work. Pricing it properly is the hardest lesson you\'ll learn.',
    },
    inHouse: {
      1: 'Customers buy you, so your name, your look and your voice are the product. A bad week shows up in the sales figures.',
      2: 'Income is clear, and growing it comes down to raising prices and building skills. You know within a month if an idea pays.',
      3: 'You trade in words: copywriting, deals, messages and local contacts. Many short projects beat one big one.',
      4: 'You can run a shop out of the garage, an online store from the kitchen table or a family company. Home doubles as the office.',
      5: 'You earn from creative work: entertainment, kids\' products, games, a hobby that turns profitable the year you stop treating it as one.',
      6: 'A clinic, a cleaning company, a consultancy where clients pay month after month. Reliable service is your best product.',
      7: 'A co-founder, a distributor or a client who brings others makes you money. You do well with a partner who handles what you hate.',
      8: 'You earn from shared money: investing, lending, buying distressed assets, managing other people\'s funds. Trust is your currency.',
      9: 'Your best customers are overseas. Export, import, teaching and publishing for a foreign audience all work.',
      10: 'You earn from big firms: contracts with large clients, senior roles, a business name people recognise.',
      11: 'Referrals, communities and online audiences bring your income. Spend your time on the network before the product.',
      12: 'Private clients, back-office work and businesses that stay out of the spotlight pay you. You earn quietly and prefer it.',
    },
  },
  'Part of Death': {
    general: 'Your life ends one chapter and begins another in a repeating way. You can see what you let go of and what it costs.',
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
      1: 'Your identity renews itself every few years. People who knew you at twenty wouldn\'t recognise you now, and you shed the old version without a ceremony.',
      2: 'You lose and rebuild what you own more than once. Money, possessions and what you value go through cycles, and you learn to hold them loosely.',
      3: 'You drop old opinions, old friends and old ways of talking. A conversation can end a belief you had held for a decade.',
      4: 'Your home and family go through large changes: moves, deaths, divorces, new arrivals. The house you grew up in is not the one you end up in.',
      5: 'A love affair or creative project dies, and a better one appears. Endings here sting, but each leaves you with more nerve.',
      6: 'A diagnosis or a job loss resets your routine. You rebuild your health and work habits several times, and each version works better.',
      7: 'A marriage ends or transforms, and the person you become with each partner is different. Your partnerships have chapters.',
      8: 'Loss, inheritance and crisis return often, and you turn into the person who knows how to handle them. People call you when someone dies.',
      9: 'You change religion, country or philosophy, and each move feels like a rebirth. What you believed at thirty isn\'t what you believe now.',
      10: 'You change fields, lose a role and start again, usually in a better place. Your career has an acts-structure, not a straight line.',
      11: 'Circles dissolve, causes end and new communities appear. You outgrow friend groups, and you grieve for them quietly.',
      12: 'Dreams, retreats and long quiet spells close one chapter before another opens. Your biggest changes happen where no one sees them.',
    },
  },
  'Part of Illness': {
    general: 'Your body sends you the bill when you ignore it. Some habits and stresses wear you down first, and you can name them.',
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
      1: 'Your habits show on your face: sleep, exercise and what you eat or drink. A bad week shows within days, and so does a good one.',
      2: 'Overeating, undereating and money worries land in your body. When the finances shake, so does your appetite.',
      3: 'Too many messages and too little quiet wear down your nerves. Headaches and sleeplessness follow a day on your phone.',
      4: 'A hard stretch with family or a house move hits your digestion and sleep. Your body tracks how safe you feel at home.',
      5: 'Late nights, parties and excess catch up with you. You enjoy it, and you pay on Monday.',
      6: 'You think about your health often and work around it. A good routine keeps you well; skipping it for a month shows.',
      7: 'A fight with a partner or a breakup shows in your body first. You get run down when a relationship goes sour.',
      8: 'You go through scares and deep recoveries, and a crisis changes how you live afterwards. You learn what matters in hospital corridors.',
      9: 'Jet lag, strange food and fierce convictions show up in your body. Long trips cost you more than you plan for.',
      10: 'Long hours and pressure hit your joints, skin and sleep. You ignore the signs until a deadline passes.',
      11: 'Too many events or too much isolation drains your energy. Your health follows the state of your social life.',
      12: 'Slow, hard-to-name fatigue and symptoms need a patient doctor. Rest and time alone are medicine for you, not an indulgence.',
    },
  },
  'Part of Passion': {
    general: 'There\'s a pace at which you desire and a thing that shuts you down. Knowing both saves you from a lot of wrong dates.',
    inSign: {
      Aries: 'Desire hits, you act on it, and you\'re bored the minute the chase ends. Slow replies kill your interest faster than rejection.',
      Taurus: 'Your drive is physical and slow to build. Touch, food and long evenings matter, and once you commit you don\'t want to stop.',
      Gemini: 'Texting, flirting and wordplay turn you on before anything else does. A good conversation at midnight can lead to everything.',
      Cancer: 'Your drive follows your mood. You want closeness and safety first, and then the passion shows up.',
      Leo: 'You want to be wanted out loud, and you give a lot to the person who does it. Being ignored in bed or in public cools you at once.',
      Virgo: 'You show desire through small acts, and you\'re turned on by someone who notices details. A remembered preference is better than a compliment.',
      Libra: 'You need beauty and mutual attention. Atmosphere matters, and indifference kills the mood.',
      Scorpio: 'You want all of someone, and sharing or losing them feels like a threat. Half-hearted attention bores you.',
      Sagittarius: 'You want adventure, variety and a partner who laughs in bed. You run from anyone who makes passion feel like a duty.',
      Capricorn: 'You stay controlled until you trust. After that, your drive is steady, strong and focused on one person.',
      Aquarius: 'You like novelty, friendship first and a lover who surprises you. Routine passion fades while strange passion lasts.',
      Pisces: 'You lose track of time and give more than you planned to. Boundaries blur, and you wake up unsure whose idea it was.',
    },
    inHouse: {
      1: 'People feel your drive when you walk in, whether you intend it or not. You get stared at and sometimes misread.',
      2: 'You enjoy buying gifts and good food for people you want. A lack of security cools you off.',
      3: 'Messages, phone calls and long talk lead to bed. The first night happens in text.',
      4: 'Passion lives best in private rooms and familiar places. You don\'t relax on a first date in a bar.',
      5: 'Dating, dancing, flirting and being admired turn you on. You enjoy the chase more than you admit.',
      6: 'Your drive turns up in the daily grind: the routines, the energy, the work you pour into someone. Habit keeps it alive.',
      7: 'Your drive rises with one person and drops when the relationship goes flat. You need someone to desire.',
      8: 'Trust, secrets and total surrender turn you on. Anything shallow leaves you cold.',
      9: 'New places, new people and new ideas make you want more. You come alive on a plane.',
      10: 'You chase a goal with the same hunger as a lover. Ambition takes the heat that romance would otherwise get.',
      11: 'You meet lovers through friends, causes and shared plans. Attraction starts with a shared mission.',
      12: 'Secret crushes, long fantasies and private moments carry more weight than visible ones. Your hottest feelings go unspoken.',
    },
  },
  'Part of Desire': {
    general: 'What you want when nobody\'s watching drives more of your choices than the reasons you give out loud.',
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
      1: 'You crave freedom to be yourself without explaining or toning it down. Every job or partner that asks you to shrink loses you.',
      2: 'You crave security: a steady income, a home you own, things that last. Calm arrives when the account balance does.',
      3: 'You crave information and company: books, conversations, short trips and a lively neighbourhood. A silent house feels like punishment.',
      4: 'You crave a home and a family, whether the one you came from or the one you build. A rented room feels temporary even after ten years.',
      5: 'You crave romance, children and play. You want to make something and enjoy it with someone who laughs at your jokes.',
      6: 'You crave useful work and a body that feels good. A day with a clear list ticked off is your reward.',
      7: 'You crave a partner, and more than you let on. Long stretches alone make you feel unfinished.',
      8: 'You crave a bond so close you can share every secret, and a chance to start fresh. Shallow relationships leave you hungry.',
      9: 'You crave distance and truth: another country, a bigger question and the freedom to follow it.',
      10: 'You crave achievement and respect: a title, a result or a legacy that proves it was worth it.',
      11: 'You crave a community of friends who share your goals, and a cause bigger than you. You hate being a spectator.',
      12: 'You crave peace and space: time alone, quiet and a break from being needed. You\'ll cancel plans to get it.',
    },
  },
  'Part of Faith': {
    general: 'When nothing is guaranteed, you trust a particular thing. It decides how you pray, doubt and keep going.',
    inSign: {
      Aries: 'You pray with your feet: volunteering, defending someone, doing the hard thing. You lose patience with people who only talk about belief.',
      Taurus: 'A walk outside, a shared meal, garden work. You trust a belief you can touch more than one you have to argue.',
      Gemini: 'You read the texts, ask the awkward question in class and change your mind more than once. Faith stays alive for you because you question it.',
      Cancer: 'Rituals, holidays and a grandmother\'s prayers tie you to something older than you. Faith is what your family does together.',
      Leo: 'Music, celebration and a community that sings out loud matter to you. You believe in joy and say so.',
      Virgo: 'Cleaning, tending, caring for the sick and getting the details right are your devotions. Service is how you pray.',
      Libra: 'You believe in fairness. You argue ethics over dinner and can\'t ignore cruelty when you see it.',
      Scorpio: 'You have lost your faith, rebuilt it and ended up with something that can\'t be shaken. It was earned in a dark year.',
      Sagittarius: 'You read philosophy, travel to sacred sites and trust that a meaning exists somewhere. Faith keeps you moving.',
      Capricorn: 'You keep traditions, turn up every week and respect rules even when they are hard. Faith for you is discipline, not feeling.',
      Aquarius: 'You may reject organised religion and believe in people, science or a cause. Your faith belongs to you, not to a building.',
      Pisces: 'Dreams, signs and silence speak to you, and you don\'t need proof. You pray without words.',
    },
    inHouse: {
      1: 'People can tell what you believe from how you live. Your faith is visible before you mention it.',
      2: 'You give, tithe or refuse deals that clash with your values. Money is where your belief gets tested.',
      3: 'Books, classes and talks with siblings or friends shape what you believe. You think your way to faith.',
      4: 'The tradition you were raised in is the one you return to. Home is where your belief lives.',
      5: 'Art, song and children bring you closest. You feel faith when you play and create.',
      6: 'A morning routine, a prayer before work, a habit of service. Belief is practised daily or not at all.',
      7: 'You grow by talking about your belief with the person closest to you. A partner who shares it matters.',
      8: 'A death or a loss strips your faith down and rebuilds it into something real. You believe differently after.',
      9: 'Study, travel and teaching are your path. Your faith is the journey you\'re on.',
      10: 'You speak about your belief publicly, represent it or build a career around it. People know what you stand for.',
      11: 'You belong to a group that acts on what it believes. Faith feels real when it\'s shared.',
      12: 'Prayer, meditation and solitude are where you meet it. Your faith needs privacy.',
    },
  },
  'Part of Intelligence': {
    general: 'Your mind works best in a certain way: what you notice first, what you remember and where you think clearly. Using it that way feels like relief.',
    inSign: {
      Aries: 'You grasp the point in the first sentence and get impatient with the rest. Your fast answers are often right, and sometimes careless.',
      Taurus: 'You learn slowly and forget nothing. Once you learn something it stays, and you don\'t change your mind lightly.',
      Gemini: 'You read five books, hold three conversations and connect ideas others miss. Your mind is rarely quiet.',
      Cancer: 'You sense a mood in the room before anyone speaks and remember how things felt years later. Your memory is emotional.',
      Leo: 'Pitches, stories and visions come to you whole. You think big and creatively, and you need an audience for the idea.',
      Virgo: 'You find the error, the missing step and the cleaner method. People bring you problems because you notice what they missed.',
      Libra: 'You hear both sides at once and see the fair answer. You sometimes take too long to commit.',
      Scorpio: 'You pick up on motives and work out what\'s hidden. You don\'t stop digging until you know.',
      Sagittarius: 'You see where things are going and leave the small print for later. The big picture comes easily; the footnotes come late.',
      Capricorn: 'You map the next ten years, measure risk and trust what you can prove. You plan before you speak.',
      Aquarius: 'You solve problems from the side and often get an idea years before others agree. You get used to being early.',
      Pisces: 'Poems, music and hunches reach you before logic does. You trust a feeling that you can\'t explain.',
    },
    inHouse: {
      1: 'You\'re known as the smart one, or the one who never stops thinking. Your mind is part of how people introduce you.',
      2: 'You do the maths, spot deals and know the price of everything. Money is where your mind goes first.',
      3: 'You read, write, talk and learn constantly. A day without a new idea feels wasted.',
      4: 'Family history and childhood details are sharp in your mind. You remember what was said at the table in 1998.',
      5: 'Games, stories and clever play are how you learn best. You absorb things while you enjoy them.',
      6: 'You solve work problems, improve systems and notice flaws. Colleagues bring you the knots.',
      7: 'Debate, negotiation and a good argument bring out your best. You think better with someone across the table.',
      8: 'Mysteries, psychology and research hold your attention. You like a question with no easy answer.',
      9: 'Philosophy, languages and big questions suit your mind. You keep studying long after school ends.',
      10: 'Planning, strategy and leadership use your mind daily. Your thinking is what gets you promoted.',
      11: 'Technology, science and social change interest you. Your best ideas arrive in conversation with a group.',
      12: 'Dreams and intuition give you ideas. You think best alone and half asleep.',
    },
  },
  'Part of Honor': {
    general: 'People come to respect you for one thing in particular. It\'s also what you could lose their respect over.',
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
      1: 'People respect your character, your manner and your word before your title. You\'re trusted because you do what you said you would.',
      2: 'Respect arrives once you\'re self-made. Nobody questions the person who paid for it themselves.',
      3: 'A published piece, a good talk or a sharp reply earns you your name. What you say in public is repeated.',
      4: 'Your family name, your home and your parents\' reputation carry weight. You inherit a standing, and you can lose it.',
      5: 'A show, a book or a child who does well brings recognition. Your pride is in what you made.',
      6: 'People trust you because you keep turning up and doing the work right. Your reputation is built from ordinary Tuesdays.',
      7: 'A partner or client who speaks well of you lifts your name. Pick the people who vouch for you carefully.',
      8: 'Surviving something hard and helping others through it earns you respect. People remember who stayed in the room.',
      9: 'A degree, a book or a reputation as a wise person abroad. People look up to you for how much you know.',
      10: 'Public rank, a high office and the respect of your field are within reach. You are meant to be seen.',
      11: 'A community, a team or a cause that depends on you gives you your name. People follow you because you show up for them.',
      12: 'Your reputation grows without publicity and is recognised late. The people who matter notice long before the crowd.',
    },
  },
  'Part of Increase': {
    general: 'Some efforts multiply instead of adding up. Spend more of your time there and the return is larger than the work.',
    inSign: {
      Aries: 'Things grow the moment you start them. A business launched on a Monday, a habit begun today, a risk taken before you felt ready.',
      Taurus: 'Savings, land and skills compound quietly. You gain more by holding on than by trading, and you hate being rushed.',
      Gemini: 'Every person you talk to is a possible job, client or friend. Your network grows faster than your to-do list.',
      Cancer: 'Property gains value, the family expands and your cooking brings people to the table. Your growth happens at home.',
      Leo: 'A generous gesture, a public project or a gift returns multiplied. Hoarding makes you shrink.',
      Virgo: 'A neater system, a better routine and a repaired relationship pay off. Small improvements add up before you notice.',
      Libra: 'A merger, a marriage or a collaboration multiplies what either of you could do alone. You grow by pairing up.',
      Scorpio: 'Money, effort or trust placed in the right hands doubles over time. Shallow bets don\'t pay you.',
      Sagittarius: 'A course, a trip or a book reaches far more people than you expected. Growing means going wider.',
      Capricorn: 'Steady saving, regular promotion and a structured plan add up over decades. You get rich slowly and stay rich.',
      Aquarius: 'A network, an online audience or an idea that spreads past your own circle. Growth arrives sideways.',
      Pisces: 'Gifts arrive unexpectedly and faith carries you through lean stretches. Trusting is how you grow.',
    },
    inHouse: {
      1: 'Confidence, skill and presence build year after year, and people notice before you do. You look more capable at forty than at twenty-five.',
      2: 'Income, savings and possessions rise, especially when you invest in your own skills. A course you pay for this year pays you back.',
      3: 'Every course, conversation and short trip pays off later. Your contacts multiply while you\'re not counting.',
      4: 'A bigger home, a larger family and a stronger base. Your property grows more reliably than your career does.',
      5: 'More projects, more romance, more children or simply more fun. The more you make for pleasure, the more arrives.',
      6: 'A better routine produces visible results within months. Productivity and health improve together.',
      7: 'A strong partner or client multiplies your income and your reach. Pick the right one and you double.',
      8: 'Joint funds, inheritances and investments increase. The money in other people\'s hands grows with yours.',
      9: 'Study, travel and teaching widen your world. Opportunities arrive from far away.',
      10: 'Promotions, recognition and a bigger public role follow. Your career has a long upward slope.',
      11: 'Your circle, your followers and your causes get bigger. Influence grows through the people who like you.',
      12: 'Meditation, dreams and retreats deepen quietly. Your inner life gets richer without any announcement.',
    },
  },
  'Part of Travel': {
    general: 'Where you go, why you leave and what you bring back follow a pattern. Distance does something for you that staying put cannot.',
    inSign: {
      Aries: 'A cheap flight on Thursday, a road trip with no hotel, a move decided in a day. You travel on impulse and sort it out on arrival.',
      Taurus: 'Good food, a nice hotel, a slow week in the same place. You go back to the same places because you love them.',
      Gemini: 'Weekend breaks, work trips and constant messages from abroad. You take many short trips instead of one long one.',
      Cancer: 'Family reunions, ancestral towns and a long stay near water or a childhood place. You travel to feel at home.',
      Leo: 'Big trips, memorable photos, a story you tell for years. You travel with style and want a witness.',
      Virgo: 'Packing lists, checked reservations and trips tied to work, study or health. You plan, and then something goes wrong and you cope.',
      Libra: 'Romantic cities, art, a honeymoon and a partner at your side. You travel for beauty and company.',
      Scorpio: 'A trip that ends a relationship or begins a new life. You return from places you can\'t forget.',
      Sagittarius: 'Living abroad, long trips, learning languages and always planning the next one. Staying put for a year makes you restless.',
      Capricorn: 'Business trips, conferences and moves for a better position. You pack your laptop and your calendar.',
      Aquarius: 'Group journeys, causes and destinations few people choose. You go where nobody gave you a recommendation.',
      Pisces: 'Retreats, pilgrimages, the sea and places where you can be quiet. You travel to find peace.',
    },
    inHouse: {
      1: 'A year abroad changed how you stand and speak. You describe yourself through the places you\'ve lived.',
      2: 'A trip pays or costs you real money, and a foreign contract may arrive. Your passport earns its keep.',
      3: 'You visit siblings, run errands in nearby towns and take quick breaks. Short trips come often and rarely feel like holidays.',
      4: 'You move for family or go back to your roots. A journey ends with you at your parents\' table.',
      5: 'Holidays, festivals and romance on the road. You come home with a story and sometimes a person.',
      6: 'Business trips, treatments and practical journeys. You travel to get something done and rest only when you return.',
      7: 'You travel with a partner or meet one on the road. A trip alone changes your relationship more than a trip together.',
      8: 'A trip changes your mind or your life: a funeral abroad, an escape, a year that rearranges you. You come back different.',
      9: 'Long journeys, other cultures and moving abroad are written into your life. Home may be a different country than the one you were born in.',
      10: 'Conferences, relocations and international jobs drive your career. You acquire an airline lounge habit.',
      11: 'You travel with friends, teams, tours and causes. The group picks the destination, and you go along happily.',
      12: 'Sacred places, solitude and rest. You travel to disappear for a while and are slow to answer messages.',
    },
  },
  'Part of Catastrophe': {
    general: 'Life has knocked you over here, or will. The shape of the crisis is familiar, and so is how you rebuild.',
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
      1: 'A crisis rewrites who you are. After the worst year you\'re a different person, and not everyone recognises you.',
      2: 'Debt, a lost job or a bad investment forces you to rebuild from the ground. You recover, but you stop trusting easy money.',
      3: 'Accidents on the road, hard news or a break with a sibling. The shock arrives by phone call.',
      4: 'A move, a break-up or a family emergency shakes your base. You stay with someone while you rebuild.',
      5: 'A heartbreak, a loss involving a child or a creative disaster. What you loved most is what hurts most.',
      6: 'Illness or a layoff pushes you to change your life. The body or the job says stop, and you finally listen.',
      7: 'A divorce, a lawsuit or a falling out with someone close. The person you trusted is the cause.',
      8: 'Debts, inheritances or a financial betrayal. Other people\'s money becomes your emergency.',
      9: 'A failed plan abroad, a legal case or a lost faith. What you were sure of turns out to be wrong.',
      10: 'A public fall or a sudden change in position. Your reputation takes a hit and rebuilds slowly.',
      11: 'A betrayal, a split or a shattered dream shared with friends. The group you relied on dissolves.',
      12: 'Hidden fears, secret losses or a time alone that forces a reset. The crisis is private and the recovery slow.',
    },
  },
  'Part of Inheritance': {
    general: 'People before you left you money, habits, talents and unfinished business. Some of it you chose, some chose you.',
    inSign: {
      Aries: 'You inherit nerve: a parent or grandparent who started from nothing, and your own habit of acting before the fear arrives.',
      Taurus: 'Land, a house, jewellery or the family rule to never spend what you can\'t see. You also inherit the stubbornness.',
      Gemini: 'A relative who wrote, taught or talked, and the library that came with them. You got the books and the way of arguing.',
      Cancer: 'The family house, the recipes and a way of caring that comes with the walls. You inherit the feelings too.',
      Leo: 'Singers, makers or showmen in the family line. You got the talent and the taste for the stage.',
      Virgo: 'A trade, a method or a family way of keeping a house running. You inherited the habit of checking twice.',
      Libra: 'A family that knows how to talk to people and make deals. You got their manners and their talent for compromise.',
      Scorpio: 'A will, a debt or a family history nobody discusses. The silence is part of what you inherit.',
      Sagittarius: 'A family tradition of faith or travel. You got the itch to go and the questions that go with it.',
      Capricorn: 'A business, a name or a standard to uphold. You inherit the duty along with the credit.',
      Aquarius: 'A family with an eccentric streak and a tradition of ideas. You carry the odd one out inside you.',
      Pisces: 'Dreams, intuition and the ability to feel what others feel. You got the gift and the sensitivity that hurts.',
    },
    inHouse: {
      1: 'Your looks, your temperament and your manner come from the family. People see a parent when you smile.',
      2: 'Money, goods and a way of earning come down to you. You also receive their attitude to spending.',
      3: 'A family gift with words, learning and the sibling bond. You write or speak like someone before you.',
      4: 'Property and roots matter. The family home is likely to be yours to deal with.',
      5: 'Creative talent and an attitude to love and play. You got your parents\' flirting style.',
      6: 'Health patterns and work habits come from the family. You keep the same back trouble.',
      7: 'Your parents\' marriage is a template you follow or avoid. You repeat it by accident.',
      8: 'You directly inherit money or property, and the responsibilities that come with it. Settling an estate is a job you take on.',
      9: 'Beliefs, languages and a view of the world arrive with your upbringing. You may leave, but you take them along.',
      10: 'Professional standing, a family business or a famous name. You enter a field with a reputation already attached.',
      11: 'Contacts and community, a circle you were born into. Your parents\' friends become yours.',
      12: 'Hidden karma, family secrets and spiritual patterns sit in the background. You feel what no one told you.',
    },
  },
  'Part of Mastery': {
    general: 'Practice turns into skill in one particular place. Stay with it for years and you get world-class there.',
    inSign: {
      Aries: 'Practice against someone better, enter the race and learn from losing. You get good by competing.',
      Taurus: 'The same recipe, scale or stroke for years until your hands know it. Repetition is your teacher.',
      Gemini: 'You learn a subject properly when you must explain it to someone else. Teaching is how you get good.',
      Cancer: 'Cooking, nursing, counselling: crafts where reading people matters. Your hands learn from feeling.',
      Leo: 'Music, design, speaking, cooking for a crowd. You get good at what you get to perform.',
      Virgo: 'Precision crafts, editing, medicine, engineering and anything where a millimetre counts. You see the flaw first.',
      Libra: 'Design, law, diplomacy, styling. You master what needs taste and balance.',
      Scorpio: 'Investigation, therapy, surgery and long research. You master what needs depth, and you stay with it.',
      Sagittarius: 'Languages, philosophy, coaching and teaching. You get good through wide study and restless questions.',
      Capricorn: 'Ten years of showing up gets you further than a flash of talent. Time is your greatest tool.',
      Aquarius: 'Technology, science and unusual crafts few have tried. You master the field before others notice it.',
      Pisces: 'Music, painting, healing and crafts you can\'t fully explain. You get good by feel.',
    },
    inHouse: {
      1: 'Your real craft is yourself: the habit you keep, the temper you tame, the body you train. Everything else you do well comes after that.',
      2: 'You get very good at earning and keeping money. You know your rate, track your spending and negotiate without flinching.',
      3: 'You get good at explaining things: writing a clear email, giving a short talk, speaking a second language. People ask you to put it into words.',
      4: 'Cooking, building, decorating, caring for someone who is ill. Home arts are where your skill shows, and visitors notice.',
      5: 'You get better at making things the more you enjoy them. Music, painting, performing or coaching a kids\' team improves most when you stop trying so hard.',
      6: 'Daily technique wins. You get better each year because you do the same routine, notice what\'s off and tweak it, long after others lose interest.',
      7: 'You get skilled at negotiating, listening and partnering. People learn from watching you handle a difficult person.',
      8: 'You master what most people avoid: the therapy session, the audit, the grief conversation, the investigation. You stay in the room when it gets hard.',
      9: 'Study, teaching and travel make you wise. You build knowledge slowly, keep it, and find it useful twenty years later.',
      10: 'People call you the expert in your field. Your profession is your craft, and you\'re willing to be known for it.',
      11: 'You get good at moving a crowd: organising a team, running a campaign, hosting a community. You see who should do what faster than the rest.',
      12: 'You master a practice nobody sees: meditation, prayer, long hours of quiet work. The skill shows later as calm.',
    },
  },
  'Part of Attraction': {
    general: 'People are drawn to you before you speak. They notice one thing first, and it\'s why they stay.',
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
      1: 'People decide about you in the first few seconds: how you stand, how you walk in, what you do with your eyes. Show up half asleep and you\'re invisible; show up awake and you get approached.',
      2: 'People are drawn to how comfortable you are to be around. You pick up the bill, bring the good snack and stay calm when plans fall apart, and they remember it.',
      3: 'You pull people in with talk: a fast joke in a group chat, a question that shows you listened. They keep the conversation going long after they planned to leave.',
      4: 'People want to be in your kitchen. A warm, lived-in home and an easy way of making guests feel expected draw friends, lovers and strangers.',
      5: 'People gather around you when you\'re having fun. Start dancing, tell the story or pick up the guitar and the room rearranges itself around you.',
      6: 'People are drawn to you because you make their week easier. You sort the booking, fix the thing and know who to call, and then they can\'t stop texting you.',
      7: 'People like how you listen and work with others. They bring you their relationship problems and leave feeling understood, which is how you end up everyone\'s confidant.',
      8: 'People feel your depth before you speak. You hold eye contact a second too long, say little, and they want to know what you\'re thinking.',
      9: 'People like how wide your world is. You have a story from another country, an opinion on something big, and you make them want to book a ticket.',
      10: 'Your role and your reputation make you interesting before you open your mouth. People lean in when they hear what you do, and you can use that or hide behind it.',
      11: 'People join you for your goals and your friends. You talk about the thing you\'re building, and strangers volunteer.',
      12: 'People wonder about your private life. You keep a quiet side, answer some questions with a smile, and the mystery pulls harder than any story would.',
    },
  },
  'Part of Sexuality': {
    general: 'How you desire and want to be desired follows a pattern. Something makes you open up, and something shuts you down.',
    inSign: {
      Aries: 'You make the first move, want what you want right now and lose interest in the slow build. Hesitation is your biggest turn-off.',
      Taurus: 'Touch, taste and comfort matter, and you can stay in bed all Sunday. Rushing ruins it.',
      Gemini: 'Teasing, messages and curiosity are your foreplay. You want to talk first.',
      Cancer: 'You need to feel close and safe before you relax, and then you give a lot. Emotional distance kills it.',
      Leo: 'You love being desired, you give compliments freely and you like a lover who shows it. Being ignored cools you at once.',
      Virgo: 'You pay attention to details, and your confidence grows with trust. Awkward starts become warm endings.',
      Libra: 'Mood, lighting and kindness matter, and rudeness switches you off. You want romance first.',
      Scorpio: 'You want complete trust, you keep secrets well and you can be jealous. Anything casual leaves you cold.',
      Sagittarius: 'You laugh in bed, travel with lovers and run from clingy partners. Freedom is the aphrodisiac.',
      Capricorn: 'You are reserved until trust builds, then steady, patient and surprisingly passionate. The first month is a test.',
      Aquarius: 'Friendship comes first, and you like variety and unconventional setups. Rules bore you.',
      Pisces: 'You merge easily and give a lot, and you need to keep your boundaries clear. You can lose yourself.',
    },
    inHouse: {
      1: 'People read you as sexual before you say a word. You get stared at, sometimes misread, and learn to handle the attention.',
      2: 'How you feel about your body and your worth shows up in bed. When you feel valued, you relax; when you feel cheap, you shut down.',
      3: 'The first night starts in your phone. Flirting, teasing and a long text thread do more for you than a candlelit dinner.',
      4: 'Sex belongs in your own space and with someone you trust. A hotel on a first date feels wrong, and your bedroom feels like yours alone.',
      5: 'You treat desire as play: dating, dressing up, flirting for the joy of it. Taking it too seriously kills the mood.',
      6: 'Closeness grows from habit: cooking together, caring for each other when sick, the same bed every night. Routine is the foreplay.',
      7: 'Sex is stronger with one committed person. Casual encounters leave you emptier than you expected.',
      8: 'You want intensity: trust, secrets, a bond that changes you. Surface sex bores you and may even leave you cold.',
      9: 'New places, new people and new ideas keep desire alive. A trip does more for your sex life than a month of date nights.',
      10: 'Status and charisma add to your appeal, and you know it. You\'re drawn to people with power and attract them back.',
      11: 'Lovers often come from your circle. Friendship leads to the bedroom, and so does a shared cause.',
      12: 'Your inner erotic life is richer than the outer one. Secret attractions and unspoken fantasies carry more weight than anything you act on.',
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
  reading += `${firstName}, your chart carries **${parts.length} Arabic Parts**. Each one is worked out from your own birth time and place, and each points at a specific corner of your life: money, love, work, family, health, nerve. Read the ones that sting first, because they are doing the most.\n\n`;

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
    reading += `${firstName}, **${topSign[0]}** holds ${topSign[1]} of your Arabic Parts. So very different situations get the same ${topSign[0]} reflex from you, for better and for worse, and you will spot it once you look at where each part sits.\n\n`;
  }
  if (topHouse) {
    reading += `**House ${topHouse[0]}** holds ${topHouse[1]} of your Parts. That corner of your life gets more than its share of your luck and your lessons, ${firstName}, so expect it to keep coming up.\n\n`;
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
  reading += `${firstName}, these points will not change what happened or promise what comes next. They show where you keep ending up, so you can walk in on purpose. Come back to this after a big decision and see which line you were living.\n`;

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
                Arabic Parts (Lots) are points worked out from your birth time, your Ascendant and two planets. Each one points at a part of your life, such as money, love, work, family or health, and the lines below tell you what you do there. Read the ones that sting first. They are the ones doing the most work.
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
