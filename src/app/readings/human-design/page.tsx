'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { api, buildBirthData } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import Link from 'next/link';
import { Hexagon, ArrowLeft, Info, ChevronDown, ChevronUp, X, Copy, Check, Share2 } from 'lucide-react';
import { PaywallGate } from '@/components/ui/PaywallGate';

// ═══════════════════════════════════════════════════════════════════
// TYPE CONSTANTS
// ═══════════════════════════════════════════════════════════════════

const TYPE_COLORS: Record<string, { from: string; to: string }> = {
  Generator: { from: '#22C55E', to: '#16A34A' },
  'Manifesting Generator': { from: '#22C55E', to: '#F59E0B' },
  Projector: { from: '#3B82F6', to: '#2563EB' },
  Manifestor: { from: '#EF4444', to: '#DC2626' },
  Reflector: { from: '#A78BFA', to: '#8B5CF6' },
};

const TYPE_AURAS: Record<string, string> = {
  Generator: 'Open & Enveloping',
  'Manifesting Generator': 'Open & Enveloping',
  Projector: 'Focused & Absorbing',
  Manifestor: 'Closed & Repelling',
  Reflector: 'Resistant & Sampling',
};

const CENTER_COLORS: Record<string, string> = {
  Head: '#F59E0B',
  Ajna: '#22C55E',
  Throat: '#8B5CF6',
  G: '#F59E0B',
  'Self/Identity': '#F59E0B',
  Heart: '#EF4444',
  'Will/Ego': '#EF4444',
  Sacral: '#EF4444',
  'Solar Plexus': '#3B82F6',
  Emotional: '#3B82F6',
  SolarPlexus: '#3B82F6',
  Spleen: '#22C55E',
  Root: '#EF4444',
};

// ═══════════════════════════════════════════════════════════════════
// GATE MEANINGS (subset for display)
// ═══════════════════════════════════════════════════════════════════

const GATE_MEANINGS: Record<number, { name: string; theme: string; gift: string }> = {
  1: { name: 'The Creative', theme: 'Self-Expression', gift: 'You make things that only you would make, and you do not wait for a reason or an audience. It costs you the afternoons you spend alone with a half-finished idea while friends ask why you never come out.' },
  2: { name: 'The Receptive', theme: 'Direction of Self', gift: 'You know which way to go before you can explain it, and people end up following your lead without being told. It costs you when somebody demands a plan, because you can only say it feels right.' },
  3: { name: 'Ordering', theme: 'Innovation Through Chaos', gift: 'You start things with no clear map and sort out the shape of them while you work. It costs you the weeks of looking like a mess to people who need things tidy, and the nights you doubt it will ever make sense.' },
  4: { name: 'Formulization', theme: 'Mental Solutions', gift: 'You find the answer to the problem someone else has been stuck on for a month. It costs you when you hand it over too early and they are not ready to hear it, or when you keep answering questions nobody asked.' },
  5: { name: 'Waiting', theme: 'Fixed Rhythms', gift: 'You turn up at the same hour, eat at the same time and finish your routines, and your life runs better for it. It costs you the patience you lose with people who are late, and the days a changed plan throws you off completely.' },
  6: { name: 'Friction', theme: 'Emotional Growth', gift: 'You say the thing that makes the room go quiet, then stay to sort it out when everyone else leaves. It costs you friendships that cannot take the heat, and the evenings you spend replaying an argument.' },
  7: { name: 'The Army', theme: 'Leadership', gift: 'You step up and direct when a group is drifting, and people go along with you because you ask for little. It costs you the nights you carry decisions for everyone else and the resentment that follows when nobody thanks you.' },
  8: { name: 'Contribution', theme: 'Creative Contribution', gift: 'You put your own odd style into whatever you make, and people recognise it as yours. It costs you the safe job, the matching taste and the days you wonder if anyone will ever buy it.' },
  9: { name: 'Taming Power of the Small', theme: 'Focus & Detail', gift: 'You can sit with one task for hours until it is done properly. It costs you the missed calls, the unanswered messages and a reputation for being hard to pull away from your screen.' },
  10: { name: 'Treading', theme: 'Self-Love', gift: 'You behave the same whether you are with your boss or your friends, and you are comfortable in your own skin. It costs you the invitations you decline and the people who wanted you to be someone more convenient.' },
  11: { name: 'Peace', theme: 'Ideas & Stimulation', gift: 'You come up with ideas all day long, in the shower, on the bus and in the middle of a conversation. It costs you the many that never leave your head, and the friends who tire of hearing the next big one.' },
  12: { name: 'Standstill', theme: 'Caution & Voice', gift: 'You say something at the right moment and the room changes, but you stay silent when the mood is wrong. It costs you the evenings people take you for cold, and the ones where you say too much and wish you had not.' },
  13: { name: 'Fellowship', theme: 'Listener & Witness', gift: 'You hear secrets from people you barely know, because they sense you will not judge or repeat them. It costs you the weight of everyone\'s stories and the days you come home needing a week of silence.' },
  14: { name: 'Power Skills', theme: 'Material Empowerment', gift: 'You have a knack for finding money, work or support when you follow what you love, and you use it to keep other people afloat. It costs you the years of working long hours for pay that is not quite enough, and you rarely say no to a friend in need.' },
  15: { name: 'Modesty', theme: 'Extremes & Rhythms', gift: 'You are comfortable with a messy week as much as a calm one, and you take people as they are. It costs you the days you cannot keep a routine, and the people who want you to stay in one gear.' },
  16: { name: 'Enthusiasm', theme: 'Selective Mastery', gift: 'You practise one skill until you are good at it, then you teach it with a grin. It costs you the weeks you spend on a hobby while other things pile up, and the sting of being praised before you feel ready.' },
  17: { name: 'Following', theme: 'Opinions & Understanding', gift: 'You form a view on things quickly, and your friends ask what you think before they decide. It costs you the arguments when you are sure and wrong, and the times you correct people who only wanted to vent.' },
  18: { name: 'Work on What Has Been Spoiled', theme: 'Correction & Judgment', gift: 'You spot what is wrong with a plan, a draft or a person, and you want to fix it. It costs you the friendships where you pointed it out once too often, and the grind of never seeing your own work as good enough.' },
  19: { name: 'Approach', theme: 'Wanting & Sensitivity', gift: 'You notice who is hungry, cold or left out before anyone else does, and you feed or include them. It costs you the times you give so much you have nothing left, and the days you feel others do not see your needs.' },
  20: { name: 'Contemplation', theme: 'Present Awareness', gift: 'You say what is happening right now, in the middle of the meeting or the party, and it lands. It costs you the plans you drop because the moment changed, and the polite silence of people who did not want it said.' },
  21: { name: 'Biting Through', theme: 'Control & Will', gift: 'You take charge of your money, your tools and your corner of the world, and you do not like to be told how. It costs you the evenings you spend checking on things, and the friction with bosses who want to supervise.' },
  22: { name: 'Grace', theme: 'Emotional Openness', gift: 'You can charm a room when your mood is right, and you disappear to a quiet space when it is not. It costs you the invitations you cancel at the last minute, and the people who feel shut out when you retreat.' },
  23: { name: 'Splitting Apart', theme: 'Assimilation & Simplicity', gift: 'You turn a muddled idea into one clear sentence people repeat afterwards. It costs you the times you speak too soon, and the days you are ignored until someone else says the same thing.' },
  24: { name: 'Return', theme: 'Rationalization & Knowing', gift: 'You go back over the same thought for days until it settles into something you know. It costs you the sleepless nights and the loop of replaying a conversation from last Tuesday.' },
  25: { name: 'Innocence', theme: 'Universal Love', gift: 'You treat strangers, animals and enemies with the same openness, and you shrug off insults that would hurt others. It costs you the times you trust the wrong person, and the loneliness of a love that has no particular target.' },
  26: { name: 'The Taming Power of the Great', theme: 'The Egoist', gift: 'You can sell nearly anything you believe in, from a car to a casual idea, and you can bargain well. It costs you the sense that you are always being a little bit managed, and the times you stretch the truth and feel it later.' },
  27: { name: 'Nourishment', theme: 'Caring & Nurturing', gift: 'You feed people, check on them and carry their bags, and you do it without being asked. It costs you the evenings you spend on other people\'s problems, and a stubborn guilt when you rest.' },
  28: { name: 'Preponderance of the Great', theme: 'The Game Player', gift: 'You pick the hard path because a safe life with no point feels worse. It costs you the jobs you quit, the risks that fail and the nights of wondering what any of it is for.' },
  29: { name: 'The Abysmal', theme: 'Commitment & Saying Yes', gift: 'You say yes, and then you do the work until it is done, well after the excitement wears off. It costs you the weekends given away to commitments you made in a good mood, and the burnout when a yes was the wrong one.' },
  30: { name: 'The Clinging Fire', theme: 'Recognition of Feelings', gift: 'You feel things strongly and you chase them: the trip, the person, the new project. It costs you the weeks of crashing when the thrill fades, and the disappointment when reality does not match the picture.' },
  31: { name: 'Influence', theme: 'Democratic Leadership', gift: 'You speak up for a group and it chooses you to lead, because you say what everyone else is thinking. It costs you the nights of criticism from people who disagreed, and the burden of being asked to speak again.' },
  32: { name: 'Duration', theme: 'Continuity & Endurance', gift: 'You know within a few minutes which job, house or relationship will last and which will fizzle. It costs you the time you spend with people who do not want to hear it, and the fear of being wrong about something you chose.' },
  33: { name: 'Retreat', theme: 'Privacy & Memory', gift: 'You take yourself away after an event and come back with a story or a lesson that is yours alone. It costs you the parties you skip and the friends who think you are avoiding them.' },
  34: { name: 'Power of the Great', theme: 'Pure Power', gift: 'You have the stamina to work all day and be asked for more, and you enjoy doing it. It costs you the nights you push beyond your limit, and the pile of things you say yes to with your body before you decide with your head.' },
  35: { name: 'Progress', theme: 'Change & Experience', gift: 'You try new places, jobs and people because you get bored when nothing changes. It costs you the stable relationships you drift away from, and a restless feeling after each experience that you wanted more.' },
  36: { name: 'Darkening of the Light', theme: 'Crisis & Experience', gift: 'You walk into emotional trouble that others avoid, and you come out with a story and more patience. It costs you the rough weeks of a breakup or an argument that scrambles your plans.' },
  37: { name: 'The Family', theme: 'Friendship & Community', gift: 'You make a group feel like family: you remember birthdays, organise dinners and settle disputes. It costs you the bills, the favours and the quiet resentment when your kindness is not returned.' },
  38: { name: 'Opposition', theme: 'The Fighter', gift: 'You fight for the underdog, the cause or the idea that matters to you, and you do not back down. It costs you the arguments you start and the days you spend exhausted over a battle that might not be won.' },
  39: { name: 'Obstruction', theme: 'Provocation', gift: 'You say or do something that pokes at people until they react, and you see who they really are. It costs you the friendships that end over a jab, and the black moods that follow when you feel misunderstood.' },
  40: { name: 'Deliverance', theme: 'Aloneness & Will', gift: 'You work hard for your family or team, then take time away on your own, and you expect them to respect it. It costs you the feeling that you give more than you receive, and a sulk when nobody offers to help.' },
  41: { name: 'Decrease', theme: 'Fantasy & Imagination', gift: 'You daydream about the next thing: a trip, a business, a different life, and the dream gives you energy. It costs you the let-down when the reality is smaller, and the cycle of starting over.' },
  42: { name: 'Increase', theme: 'Growth & Completion', gift: 'You finish what you start, down to the last chapter and the final payment. It costs you the sadness of endings, and the restlessness you feel in the quiet weeks between projects.' },
  43: { name: 'Breakthrough', theme: 'Insight & Knowing', gift: 'You get a sudden idea, often out of nowhere, that changes how you do things. It costs you the long stretches of not knowing what you think, and the moments when nobody understands the idea you cannot yet explain.' },
  44: { name: 'Coming to Meet', theme: 'Alertness & Memory', gift: 'You smell a bad deal or a bad person before you can say why, and you remember what went wrong last time. It costs you the opportunities you turn down because of a gut feeling, and the old mistakes that keep returning in your head.' },
  45: { name: 'Gathering Together', theme: 'The King/Queen', gift: 'You gather people and resources, say what the group needs and sort out who gets what. It costs you the pressure of being the one who is asked for money, and the lonely sense of being looked up to rather than known.' },
  46: { name: 'Pushing Upward', theme: 'Love of Body', gift: 'You turn up in the right place at the right time, then you say it was luck. It costs you the days you sit around waiting for it to happen, and the disappointment when your body is not in the mood.' },
  47: { name: 'Oppression', theme: 'Realization & Abstract Thinking', gift: 'You mull over a confusing year until it suddenly makes sense, and you tell it as a lesson. It costs you the months of feeling stuck and unable to explain why, and the heavy mood that comes before the realisation.' },
  48: { name: 'The Well', theme: 'Depth & Inadequacy', gift: 'You know your subject more deeply than you let on, and when someone asks, you answer. It costs you the days you worry you do not know enough, and the jobs you turn down because you do not feel ready.' },
  49: { name: 'Revolution', theme: 'Principles & Rejection', gift: 'You walk away from a job, a group or a partner when the rules stop being fair. It costs you the friendships you lose and the shaky weeks between leaving and landing.' },
  50: { name: 'The Cauldron', theme: 'Values & Responsibility', gift: 'You make the rules for the household, the team or the family, and you take care of those who follow them. It costs you the dinners where you lecture, and the weight of being the one who must worry about everybody.' },
  51: { name: 'The Arousing', theme: 'Shock & Initiation', gift: 'You do something shocking, brave or unexpected, and it wakes up everyone around you. It costs you the nights after an outburst, and the friends you rattle without meaning to.' },
  52: { name: 'Keeping Still', theme: 'Stillness & Concentration', gift: 'You can sit still and focus when others fidget, and you finish a long task. It costs you the days when you cannot move to start, and the opportunities you pass while you are being calm.' },
  53: { name: 'Development', theme: 'Starting New Cycles', gift: 'You get the urge to start something fresh before the last thing is done: a course, a business, a move. It costs you the pile of half-finished projects and the guilt about the ones you left behind.' },
  54: { name: 'The Marrying Maiden', theme: 'Ambition & Drive', gift: 'You work your way up: the better job, the bigger flat, the people who matter. It costs you the evenings and the weekends, and a feeling that you are never quite where you should be yet.' },
  55: { name: 'Abundance', theme: 'Spirit & Emotional Freedom', gift: 'You ride big emotional swings and turn them into music, writing or advice for others. It costs you the low weeks, the tears you cannot explain and the friends who do not know whether to ask.' },
  56: { name: 'The Wanderer', theme: 'Stimulation & Storytelling', gift: 'You turn what happened to you into stories that make people laugh or think. It costs you the times you exaggerate, the repeat tellings and the boredom when nobody is listening.' },
  57: { name: 'The Gentle', theme: 'Intuitive Clarity', gift: 'You sense danger or opportunity in the first few seconds, and you follow it. It costs you the nights you lie awake with worry, and the awkward times your fear turns out to be wrong.' },
  58: { name: 'The Joyous', theme: 'Vitality & Correction', gift: 'You see how to make things better, in the kitchen, at work or with a friend, and you do it with humour. It costs you the days you feel nothing is ever good enough, and the irritation at people who are fine as they are.' },
  59: { name: 'Dispersion', theme: 'Intimacy & Sexuality', gift: 'You get past people\'s guard with a joke or a look, and they open up in a way they do not with others. It costs you the entanglements that start too quickly, and the shock of being known better than you intended.' },
  60: { name: 'Limitation', theme: 'Acceptance & Mutation', gift: 'You work with what you have and make something new out of it, even on a bad budget. It costs you the long waits when nothing works, and the restless feeling that you cannot move until the time is right.' },
  61: { name: 'Inner Truth', theme: 'Mystery & Pressure to Know', gift: 'You think about the same unanswerable questions: why we are here, what is true. It costs you the nights spent awake, and the pressure of having a head that does not switch off.' },
  62: { name: 'Preponderance of the Small', theme: 'Detail & Precision', gift: 'You find the exact word, number or fact that makes your point, and you check it twice. It costs you the long messages, the nitpicking and the people who find you pedantic.' },
  63: { name: 'After Completion', theme: 'Doubt & Logic', gift: 'You question whether it adds up and ask for the evidence before agreeing. It costs you the friends who feel you doubt them, and the weeks of delaying a decision because it does not quite make sense yet.' },
  64: { name: 'Before Completion', theme: 'Confusion & Imagination', gift: 'You replay old pictures and memories until the pattern suddenly shows. It costs you the weeks of mental fog, and the sense that you are always about to understand but never quite do.' },
};

// ═══════════════════════════════════════════════════════════════════
// CENTER MEANINGS
// ═══════════════════════════════════════════════════════════════════

const CENTER_DEFINED_MEANINGS: Record<string, string> = {
  Head: "Your Head center is **defined**, meaning you have a consistent source of mental inspiration and pressure to think about the big questions of life.\n\nYou are naturally drawn to wonder, to question, and to seek answers. This is not random — it is your design. You have a reliable stream of inspiration that fuels your thinking.\n\nThe key: not every question your Head generates is yours to answer. Learn to distinguish between the questions that genuinely matter to you and the ones that are just mental noise.\n\nYour gift is the ability to inspire others with your questions and mental frameworks.",
  Ajna: "Your Ajna center is **defined**, meaning you have a fixed way of processing information and forming opinions.\n\nYou think in a consistent, reliable pattern. Whether your Ajna processes through logic, abstract thinking, or sensory awareness depends on the gates, but the consistency is the point — people can count on the way you think.\n\nThe key: your fixed mental framework is a gift for processing, but it can also become a trap if you believe your way of thinking is the only way. Stay open.\n\nYour gift is mental reliability — people trust your thinking because it is consistent.",
  Throat: "Your Throat center is **defined**, meaning you have consistent access to expression, manifestation, and communication.\n\nYou do not need to struggle to be heard or to make things happen. Your voice and your ability to manifest are reliable energies you can count on.\n\nThe key: the Throat is the center of action and expression. What you say has weight. Be intentional about what you put into words, because your defined Throat gives those words power.\n\nYour gift is the ability to express and manifest consistently — to turn energy into action and ideas into reality.",
  G: "Your G center (Self/Identity) is **defined**, meaning you have a fixed sense of identity, direction, and love.\n\nYou know who you are. Your sense of self does not shift dramatically based on who you are with or where you are. This gives you a reliable inner compass that guides your direction in life.\n\nThe key: because your identity is fixed, you may sometimes feel frustrated when others cannot find their own direction as easily as you can. Remember that not everyone has this consistency.\n\nYour gift is a stable sense of self that acts as a beacon for others. People feel safe around your consistent identity.",
  Heart: "Your Heart/Ego/Will center is **defined**, meaning you have consistent willpower and the ability to make and keep promises.\n\nYou have a reliable engine of determination. When you commit to something, you have the sustained willpower to follow through. This makes you naturally suited to positions of leadership and material influence.\n\nThe key: your willpower is real but not infinite. Even a defined Heart needs rest. Do not confuse having consistent willpower with being able to will yourself through everything. Honor your body's need for recovery.\n\nYour gift is the ability to commit fully and follow through — a rare and powerful quality.",
  Sacral: "Your Sacral center is **defined**, meaning you have a consistent, sustainable life force energy.\n\nThis is the most powerful motor in Human Design. You have access to a deep well of creative and work energy that regenerates through correct use. When you are doing work that lights you up, your energy is virtually limitless.\n\nThe key: your Sacral energy must be used up each day to sleep well. If you are not exhausting your Sacral through satisfying work, you will feel restless and frustrated.\n\nYour gift is raw life force — the ability to work, create, and sustain effort when your gut says yes.",
  SolarPlexus: "Your Solar Plexus (Emotional center) is **defined**, meaning you ride a consistent emotional wave.\n\nYou experience emotions in a predictable wave pattern — highs and lows that cycle over time. This is not a mood disorder. This is your design. Your emotional wave is your authority — you make correct decisions only after the wave settles.\n\nThe key: never make important decisions at the peak or valley of your wave. Wait for emotional clarity. There is no truth in the now for you — only in the calm between the highs and lows.\n\nYour gift is emotional depth and the ability to bring richness and nuance to every experience.",
  Spleen: "Your Spleen center is **defined**, meaning you have consistent access to instinctive awareness, intuition, and a sense of what is healthy.\n\nYour Spleen gives you a quiet, in-the-moment knowing about safety, health, and timing. It speaks once, softly, and does not repeat. If you miss the first whisper, you miss it.\n\nThe key: trust the first hit. Your Spleen is your body's survival intelligence. It knows before your mind does whether something is safe, healthy, or correctly timed.\n\nYour gift is instinctive clarity — the ability to sense what is right in the moment without needing to think about it.",
  Root: "Your Root center is **defined**, meaning you have a consistent internal drive and pressure to get things done.\n\nYou carry a steady, pulsing pressure that motivates you to act, to move, to complete tasks. This pressure is not stress — it is fuel. When channeled correctly, it gives you the momentum to accomplish extraordinary things.\n\nThe key: because the pressure is consistent, you do not need to rush. You have all the time you need. The urgency you feel is not external — it is your motor running. Learn to use it rather than be driven by it.\n\nYour gift is reliable drive and the ability to handle pressure without crumbling.",
};

const CENTER_UNDEFINED_MEANINGS: Record<string, string> = {
  Head: "Your Head center is **undefined**, meaning you take in and amplify the mental inspiration and pressure from those around you.\n\nYou may feel overwhelmed by questions, ideas, and mental pressure — but most of it is not yours. You are absorbing the thinking energy of every defined Head center in your environment.\n\nThe key: when you feel mental pressure to figure something out, ask yourself: is this my question to answer, or am I absorbing someone else's mental energy? Learning this distinction is liberating.\n\nYour wisdom: you become wise about what questions are truly important because you have sampled so many that are not.",
  Ajna: "Your Ajna center is **undefined**, meaning your way of processing information is flexible and adaptable.\n\nYou can think in multiple ways — logic, abstract, sensory — depending on who you are with and what the situation calls for. This makes you mentally versatile but also susceptible to mental conditioning.\n\nThe key: do not try to have fixed opinions about everything. Your gift is mental flexibility. Embrace not knowing. Your ability to see things from multiple perspectives is a superpower, not a weakness.\n\nYour wisdom: you become wise about which ideas and opinions actually hold up under scrutiny because you have held so many different ones.",
  Throat: "Your Throat center is **undefined**, meaning your ability to express and manifest varies based on your environment and the people around you.\n\nYou may feel pressure to speak, to prove yourself, to be heard. Much of this pressure comes from amplifying others' Throat energy. You do not need to talk to be valuable.\n\nThe key: wait to be invited to speak. When the timing is right, your expression is powerful precisely because it is not constant. Quality over quantity.\n\nYour wisdom: you become wise about when words matter and when silence is more powerful because you have experienced both sides.",
  G: "Your G center (Self/Identity) is **undefined**, meaning your sense of identity and direction is fluid and influenced by your environment.\n\nYou try on different identities. You feel different in different places. This is not a lack of self — it is the ability to be a chameleon, to adapt, and to understand identity from multiple perspectives.\n\nThe key: environment is everything for you. If you are in a place that feels wrong, your sense of self will feel confused. If you are in a place that feels right, you will feel clear and directed. Choose your environment above all else.\n\nYour wisdom: you become wise about identity itself because you have experienced so many versions of it.",
  Heart: "Your Heart/Ego/Will center is **undefined**, meaning your willpower is inconsistent and influenced by the people around you.\n\nYou may feel pressure to prove yourself, to compete, to push through with sheer will. Most of this pressure is amplified from others. You are not designed to force outcomes through willpower alone.\n\nThe key: stop making promises you do not have the consistent willpower to keep. Your value is not determined by what you can force yourself to do. Rest when you need rest.\n\nYour wisdom: you become wise about what is truly worth committing to because you have felt the cost of overcommitting to things that were not right for you.",
  Sacral: "Your Sacral center is **undefined**, meaning you do not have consistent access to sustainable work energy.\n\nYou amplify the Sacral energy of Generators around you, which can feel exhilarating — but it is borrowed energy. You cannot sustain the same work pace as someone with a defined Sacral. Trying to will lead to exhaustion and burnout.\n\nThe key: work in focused bursts, not sustained marathons. Know when enough is enough. Leave the party before you are depleted, not after.\n\nYour wisdom: you become wise about what work is truly satisfying and what is just busy-ness because you experience Sacral energy from the outside, without being identified with it.",
  SolarPlexus: "Your Solar Plexus (Emotional center) is **undefined**, meaning you absorb and amplify the emotions of everyone around you.\n\nYou feel other people's emotions more intensely than they do. A room full of anxious people makes you the most anxious person there. A room full of joyful people makes you the happiest.\n\nThe key: learn to distinguish your emotions from others'. When you feel an intense emotion, ask: is this mine, or am I absorbing someone else's wave? This single question can transform your emotional life.\n\nYour wisdom: you become wise about emotions themselves because you have felt every shade of every feeling from the outside. You understand the emotional spectrum better than most.",
  Spleen: "Your Spleen center is **undefined**, meaning your sense of what is safe, healthy, and correctly timed varies.\n\nYou may hold on to things (relationships, jobs, habits) longer than you should because your instinctive alarm system is inconsistent. You amplify fear and survival instincts from others.\n\nThe key: do not make decisions based on fear. When you feel afraid, check whether the fear is real or amplified. Your undefined Spleen can make you hyper-aware of danger that is not actually present.\n\nYour wisdom: you become wise about health, safety, and timing because you have experienced both the presence and absence of instinctive awareness.",
  Root: "Your Root center is **undefined**, meaning the pressure you feel to get things done is amplified and inconsistent.\n\nYou may feel urgency that is not your own — a constant sense that you need to hurry, rush, and finish everything immediately. This is borrowed pressure from defined Root centers around you.\n\nThe key: you do not need to be in a rush. The pressure you feel is not a deadline — it is someone else's motor that you are amplifying. Learn to discharge this pressure consciously through exercise, nature, or simply recognizing it as not yours.\n\nYour wisdom: you become wise about stress and adrenaline because you have experienced both overwhelming pressure and its absence. You know the difference between productive drive and pointless rushing.",
};

// ═══════════════════════════════════════════════════════════════════
// SECTION EXPLAINERS
// ═══════════════════════════════════════════════════════════════════

const TYPE_EXPLAINERS: Record<string, string> = {
  Generator: 'You are one of the most powerful energy types in Human Design. You carry a defined Sacral center, which means you have a consistent, sustainable life force that is designed to be used in response to what life brings you.\n\nGenerators make up about 35% of the population. Your aura is open and enveloping — people are literally drawn to your energy without knowing why.\n\nYour gift is your sustainable work energy, but only when it is engaged by something that lights you up. Doing work your Sacral says "no" to drains you and produces frustration.\n\nThe core lesson for Generators: stop initiating. Let life come to you, and respond with your gut.',
  'Manifesting Generator': 'You carry the raw life force of the Generator combined with the initiating power of the Manifestor. You are multi-passionate, fast-moving, and designed to do many things at once.\n\nManifesting Generators are the speed demons of Human Design. You skip steps, take shortcuts, and move faster than most people can track. This is a feature, not a bug.\n\nYour aura is open and enveloping like a Generator\'s, but you also have the capacity to initiate like a Manifestor — once your Sacral says yes.\n\nThe core lesson: embrace being multi-passionate. You are not scattered — you are designed to juggle.',
  Projector: 'You are here to guide, direct, and manage the energy of others. You do not have consistent access to Sacral energy, which means you are not designed for sustained physical work like Generators.\n\nProjectors make up about 20% of the population. Your aura is focused and absorbing — you read people deeply the moment you meet them.\n\nYour power is in your perception. You see inefficiencies, talents, and potential that others miss. But your insights only land when they are invited.\n\nThe core lesson for Projectors: rest is productive. Wait to be recognized before sharing your wisdom.',
  Manifestor: 'You are here to initiate, to make things happen, to set things in motion that others will respond to and build upon.\n\nManifestors are only about 9% of the population. Your aura is closed and repelling — you are not here to merge with the group. You are here to move first.\n\nYou have an urge to act that most people do not understand. When you are free to follow that urge, you create things that change the world around you.\n\nThe core lesson for Manifestors: informing is not asking permission. Tell the people around you what you\'re about to do, not to get approval, but to reduce resistance.',
  Reflector: 'You are the rarest type, making up only about 1% of the population. You have no defined centers, which means you are a mirror for the health of your community and environment.\n\nReflectors take in everything from their surroundings and amplify it. In a healthy environment, you thrive. In an unhealthy one, you suffer disproportionately.\n\nYour aura is resistant and sampling — you taste environments before committing to them.\n\nThe core lesson for Reflectors: your environment is everything. Choose it carefully, and give big decisions a full lunar cycle (~28 days) before committing.',
};

const STRATEGY_EXPLAINERS: Record<string, string> = {
  'To Respond': 'Your strategy is to wait for life to bring you something, then respond with your gut.\n\nThis does not mean sitting passively — it means not initiating. Instead of chasing, calling, or forcing, let the opportunity, person, or idea show up in your field. When it does, your Sacral center will give you a visceral yes ("uh-huh") or no ("un-uh").\n\nTrust that sound more than your mind. The mind will come up with a hundred reasons to override it — the Sacral is never wrong about what\'s right for your body.\n\nExperiment with this for 90 days: before saying yes to anything, listen for the Sacral sound. Notice what changes.',
  'To Respond, then Inform': 'You combine the Generator\'s strategy of responding with the Manifestor\'s need to inform.\n\nWait for life to present something that lights up your Sacral. Respond to it. Then — before you take action — inform the people who will be affected by what you\'re about to do.\n\nThis isn\'t asking permission. It\'s reducing the resistance that naturally arises when you move faster than those around you.',
  'To Wait for the Invitation': 'The big decisions of your life — career, love, where to live, who to be close to — are designed to come to you through invitation.\n\nNot every interaction requires a formal invitation. But the significant ones do. When you are recognized and invited, your guidance and gifts land with incredible impact. When you try to give advice, direct people, or offer your wisdom without being asked, you meet resistance.\n\nThe invitation will come when you are recognized for who you actually are. Until then, rest, study, and deepen your mastery.',
  'To Inform': 'Before you act, tell the people who will be impacted.\n\nManifestors are here to initiate — to start things that others will join or be affected by. But when you act without informing, the people around you feel hit by your energy, and they push back.\n\nInforming is not asking for approval. It\'s a courtesy that says: "I\'m about to do X." That\'s it. You proceed regardless of the response, but the act of informing dissolves most of the friction.',
  'To Wait a Lunar Cycle': 'For any significant decision, wait a full lunar cycle — about 28 days — before committing.\n\nAs the Moon moves through all 64 gates, you experience the full spectrum of energies and perspectives. A decision that feels right on day 1 may feel completely different on day 14 or day 28.\n\nFor small daily choices, use your intuition. For the big ones — moving, marrying, committing to a path — let the moon teach you.',
};

const AUTHORITY_EXPLAINERS: Record<string, string> = {
  Emotional: 'You must ride your emotional wave before making any significant decision.\n\nYour Solar Plexus is defined, which gives you a consistent emotional wave that moves through highs and lows over time. There is no truth for you in the NOW. Your truth reveals itself only after the emotional charge settles.\n\nNever decide at the peak of excitement or the valley of despair. Both extremes distort your clarity.\n\nSleep on it. Wait a day. Wait a week if the decision is big. When the charge fades and you still feel the same way, that is your truth.',
  Sacral: 'Your gut response — the "uh-huh" (yes) or "un-uh" (no) — is your most reliable decision-making tool.\n\nWhen asked yes/no questions, your Sacral gives you an immediate, visceral sound or sensation. It happens in your body before your mind has time to weigh pros and cons.\n\nTrust it more than your mind. The mind will rationalize. The Sacral just knows.',
  Splenic: 'You receive spontaneous, in-the-moment intuitive hits about what is healthy and safe for you.\n\nYour Spleen is defined, which gives you an instant, quiet, primal knowing. It\'s not a loud voice. It\'s a whisper, a hunch, a feeling of "this is right" or "this is not safe."\n\nThese whispers come once and do not repeat. If you miss the first hit, it\'s gone.',
  Ego: 'Your Heart/Ego center is defined and is your decision-making authority.\n\nYou know what\'s right for you by checking: "Do I want to do this? Is my willpower behind it?" If your ego genuinely says yes — with willpower, desire, and commitment behind it — that is your truth.',
  'Self-Projected': 'Your G/Identity center is defined and connects to your Throat. Your truth reveals itself when you hear yourself speak.\n\nTalk it out. Call a trusted friend and say "I\'m thinking about doing X" — then listen to the words that come out of your mouth. The quality of your own voice will tell you whether it is right.',
  Mental: 'You have no defined motor-level authority. Your clarity comes through talking things through with trusted people in the right environment.\n\nYou make your best decisions not alone but in dialogue with people who know you well, in places that feel right to your body.',
  Lunar: 'You are a Reflector, and your authority is the lunar cycle.\n\nFor any significant decision, wait a full ~28 days — a complete moon cycle. As the Moon moves through all 64 gates, each day reveals a different facet of the decision.',
};

const PROFILE_EXPLAINERS: Record<string, string> = {
  '1/3': '**Investigator / Martyr**\n\nYou build foundations through deep research, then test everything through trial and error. Your path is paved with experiments — some succeed, many fail — but each one adds to the bedrock of knowledge you stand on.',
  '1/4': '**Investigator / Opportunist**\n\nYou research deeply and share your findings through personal relationships. Your knowledge travels through your network — people trust what you know because they trust you.',
  '2/4': '**Hermit / Opportunist**\n\nYou carry natural talents that you are often the last to recognize. The 2 line is a "called hermit" — you need solitude to recharge, and people call you out of it because they see gifts in you that you cannot see yourself.',
  '2/5': '**Hermit / Heretic**\n\nYou carry natural genius that others project expectations onto. The 2 needs solitude; the 5 attracts projections of what other people think you should do for them.',
  '3/5': '**Martyr / Heretic**\n\nYou learn through trial and error, and others see you as someone who can solve their problems through practical experience.',
  '3/6': '**Martyr / Role Model**\n\nYour life unfolds in three distinct phases:\n\n**Phase 1 (birth to ~age 30):** pure experimentation. Messy, chaotic, full of hard lessons.\n\n**Phase 2 (~30 to ~50):** you climb onto the metaphorical roof and observe.\n\n**Phase 3 (~50+):** you descend as a living example of wisdom earned through experience.',
  '4/6': '**Opportunist / Role Model**\n\nYou influence through personal connections in the first half of life, then shift into role-model authority built on lived experience.',
  '4/1': '**Opportunist / Investigator**\n\nYou share deep, researched knowledge through personal warmth and genuine relationships.',
  '5/1': '**Heretic / Investigator**\n\nPeople project savior expectations onto you. Your deep research gives you the substance to meet those projections — when you choose to.',
  '5/2': '**Heretic / Hermit**\n\nYou are seen as a universal problem-solver but need significant solitude to recharge.',
  '6/2': '**Role Model / Hermit**\n\nThree-phase life: experiment wildly (phase 1), retreat to observe (phase 2), then emerge as a living embodiment of wisdom (phase 3).',
  '6/3': '**Role Model / Martyr**\n\nIntense experimentation followed by observation, culminating in experiential authority.',
};

const DEFINITION_EXPLAINERS: Record<string, string> = {
  'Single Definition': 'All your defined centers are connected in one continuous flow. You process information and make decisions independently.\n\nThis is the most common definition (about 41% of people). You do not need others to feel whole or to reach clarity.',
  'Split Definition': 'Your defined centers form two separate groups that are not directly connected to each other. You naturally seek out people who "bridge" the gap between your two halves.\n\nAbout 46% of people have split definition. The key is recognizing WHICH centers create the gap.',
  'Triple Split Definition': 'Your defined centers form three separate groups. You need diverse social environments and multiple people to feel fully connected.\n\nOnly about 11% of people have this definition. You are built for variety.',
  'Quadruple Split Definition': 'Your defined centers form four separate groups — the rarest definition (under 1%).\n\nYou thrive in even more diverse environments and have the unusual gift of connecting disparate worlds.',
  'No Definition': 'You are a Reflector — no centers are defined. You take in the energy of your environment and reflect the state of your community back to it.',
};

const SIGNATURE_EXPLAINERS: Record<string, string> = {
  Satisfaction: 'You feel **Satisfaction** when you are living correctly.\n\nThis is a deep, full-body sense that your energy has been used well. It is how Generators know they are on the right path.',
  Peace: 'You feel **Peace** when you are living correctly.\n\nPeace for a Manifestor means freedom — the ability to follow your impulses without resistance from the people around you.',
  Success: 'You feel **Success** when you are living correctly.\n\nFor a Projector, success is the experience of your wisdom being recognized, valued, and wanted.',
  Surprise: 'You feel **Surprise** when you are living correctly.\n\nFor a Reflector, surprise is the daily gift of a healthy environment. Every day is a fresh experience.',
};

const NOT_SELF_EXPLAINERS: Record<string, string> = {
  Frustration: 'You feel **Frustration** when you are NOT living correctly.\n\nFrustration is the feeling of spinning your wheels — doing work that drains you, saying yes to things your gut said no to.',
  'Frustration / Anger': 'You feel **Frustration** AND **Anger** when you are NOT living correctly — the double signature of Manifesting Generators.\n\nFrustration shows up when your Sacral is being wasted. Anger shows up when you are not informing before you act.',
  Bitterness: 'You feel **Bitterness** when you are NOT living correctly.\n\nBitterness is what happens when you are overlooked, overworked, or unrecognized.',
  Anger: 'You feel **Anger** when you are NOT living correctly.\n\nAnger shows up when you are controlled, restricted, or forced to ask permission.',
  Disappointment: 'You feel **Disappointment** when you are NOT living correctly.\n\nDisappointment shows up when your environment is unhealthy, when the people around you are misaligned.',
};

const INCARNATION_CROSS_EXPLAINER = 'Your **Incarnation Cross** is the life theme you were born into — the broader purpose your soul is here to express.\n\nIt is composed of the Sun and Earth positions from two moments: your conscious placements at birth and your design placements from about 88 days before birth.\n\nThese four gates form your cross. There are 192 possible incarnation crosses. Yours is specific, and together the four gates describe the shape of your purpose.';

// ═══════════════════════════════════════════════════════════════════
// INTERFACES
// ═══════════════════════════════════════════════════════════════════

interface HumanDesignCenter { name: string; defined: boolean; }
interface HumanDesignChannel { name: string; gates: string; description: string; }
interface HumanDesignResult {
  type: string;
  strategy: string;
  authority: string;
  profile: string;
  definition: string;
  incarnation_cross: string;
  centers: HumanDesignCenter[];
  channels: HumanDesignChannel[];
  not_self_theme: string;
  signature: string;
}

// ═══════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════

const TYPE_STRATEGY_MAP: Record<string, { strategy: string; notSelf: string; signature: string }> = {
  Generator: { strategy: 'To Respond', notSelf: 'Frustration', signature: 'Satisfaction' },
  'Manifesting Generator': { strategy: 'To Respond, then Inform', notSelf: 'Frustration / Anger', signature: 'Satisfaction' },
  Projector: { strategy: 'To Wait for the Invitation', notSelf: 'Bitterness', signature: 'Success' },
  Manifestor: { strategy: 'To Inform', notSelf: 'Anger', signature: 'Peace' },
  Reflector: { strategy: 'To Wait a Lunar Cycle', notSelf: 'Disappointment', signature: 'Surprise' },
};

function normalizeCenterName(raw: string): string {
  const lower = raw.toLowerCase().replace(/[\s_\-/]/g, '');
  if (lower === 'solarplexus' || lower === 'emotional' || lower === 'emotionalsolarplexus') return 'SolarPlexus';
  if (lower === 'selfidentity' || lower === 'self' || lower === 'identity' || lower === 'gcenter' || lower === 'g') return 'G';
  if (lower === 'willego' || lower === 'will' || lower === 'ego' || lower === 'heartwill' || lower === 'heart') return 'Heart';
  if (lower === 'spleen' || lower === 'splenic') return 'Spleen';
  if (lower === 'head') return 'Head';
  if (lower === 'ajna') return 'Ajna';
  if (lower === 'throat') return 'Throat';
  if (lower === 'sacral') return 'Sacral';
  if (lower === 'root') return 'Root';
  return raw;
}

function safeString(val: any, fallback = ''): string {
  if (val === null || val === undefined) return fallback;
  if (typeof val === 'string') return val;
  if (typeof val === 'number') return String(val);
  if (typeof val === 'object') {
    if (val.label) return String(val.label);
    if (val.name) return String(val.name);
    if (val.gates) return String(val.gates);
    return JSON.stringify(val);
  }
  return String(val);
}

function normalizeAuthKey(auth: string): string {
  if (/emotional|solar plexus/i.test(auth)) return 'Emotional';
  if (/sacral/i.test(auth)) return 'Sacral';
  if (/splenic|spleen/i.test(auth)) return 'Splenic';
  if (/ego|heart|will/i.test(auth)) return 'Ego';
  if (/self[- ]?projected|g[- ]?center/i.test(auth)) return 'Self-Projected';
  if (/mental|environmental|sounding/i.test(auth)) return 'Mental';
  if (/lunar|reflector/i.test(auth)) return 'Lunar';
  return auth;
}

function getSectionInfo(
  section: string,
  result: HumanDesignResult,
): { title: string; body: string; accent: string } {
  switch (section) {
    case 'type': return { title: `Type: ${result.type}`, body: TYPE_EXPLAINERS[result.type] || 'Detailed information for this type is being prepared.', accent: TYPE_COLORS[result.type]?.from || '#22C55E' };
    case 'strategy': return { title: `Strategy: ${result.strategy}`, body: STRATEGY_EXPLAINERS[result.strategy] || 'Detailed information for this strategy is being prepared.', accent: '#3B82F6' };
    case 'authority': { const key = normalizeAuthKey(result.authority); return { title: `Authority: ${result.authority}`, body: AUTHORITY_EXPLAINERS[key] || 'Detailed information for this authority is being prepared.', accent: '#F59E0B' }; }
    case 'profile': return { title: `Profile: ${result.profile}`, body: PROFILE_EXPLAINERS[result.profile] || 'Detailed information for this profile is being prepared.', accent: '#8B5CF6' };
    case 'definition': return { title: `Definition: ${result.definition}`, body: DEFINITION_EXPLAINERS[result.definition] || 'Detailed information for this definition is being prepared.', accent: '#06B6D4' };
    case 'signature': return { title: `Signature: ${result.signature}`, body: SIGNATURE_EXPLAINERS[result.signature] || 'Detailed information for this signature is being prepared.', accent: '#22C55E' };
    case 'notself': return { title: `Not-Self Theme: ${result.not_self_theme}`, body: NOT_SELF_EXPLAINERS[result.not_self_theme] || 'Detailed information for this not-self theme is being prepared.', accent: '#EF4444' };
    case 'cross': return { title: 'Incarnation Cross', body: INCARNATION_CROSS_EXPLAINER + `\n\nYour cross: **${result.incarnation_cross}**`, accent: '#F59E0B' };
    default: return { title: '', body: '', accent: '#8B5CF6' };
  }
}

// ═══════════════════════════════════════════════════════════════════
// RENDER MARKDOWN
// ═══════════════════════════════════════════════════════════════════

function RenderMarkdown({ text }: { text: string }) {
  const elements: React.ReactNode[] = [];
  const lines = text.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (!trimmed) { elements.push(<div key={i} className="h-2" />); continue; }
    if (trimmed === '---') { elements.push(<hr key={i} className="border-accent-muted/30 my-4" />); continue; }
    if (trimmed.startsWith('## ')) {
      elements.push(<h2 key={i} className="text-lg font-bold text-text-primary mt-2 mb-1">{trimmed.slice(3).replace(/\*\*/g, '')}</h2>);
      continue;
    }
    if (trimmed.startsWith('### ')) {
      elements.push(<h3 key={i} className="text-base font-bold text-purple-300 mt-4 mb-1.5">{trimmed.slice(4).replace(/\*\*/g, '')}</h3>);
      continue;
    }
    if (trimmed.startsWith('- ')) {
      elements.push(
        <p key={i} className="text-text-secondary text-sm leading-relaxed mb-1 pl-3">
          <span className="text-accent-primary mr-2">&bull;</span>
          <InlineBold text={trimmed.slice(2)} />
        </p>
      );
      continue;
    }
    elements.push(
      <p key={i} className="text-text-secondary text-sm leading-relaxed mb-0.5">
        <InlineBold text={trimmed} />
      </p>
    );
  }
  return <>{elements}</>;
}

function InlineBold({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return <>{parts.map((p, i) => p.startsWith('**') && p.endsWith('**') ? <strong key={i} className="font-bold text-text-primary">{p.slice(2, -2)}</strong> : <span key={i}>{p}</span>)}</>;
}

// ═══════════════════════════════════════════════════════════════════
// COPY BUTTON
// ═══════════════════════════════════════════════════════════════════

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="inline-flex items-center gap-1 text-xs text-text-muted hover:text-text-secondary mt-1 transition-colors"
    >
      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════════
// MODAL
// ═══════════════════════════════════════════════════════════════════

function InfoModal({ info, onClose }: { info: { title: string; body: string; accent: string } | null; onClose: () => void }) {
  if (!info) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70" onClick={onClose}>
      <div
        className="bg-bg-secondary rounded-2xl p-5 max-w-lg w-full max-h-[82vh] overflow-y-auto border"
        style={{ borderColor: info.accent + '55' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-2.5 mb-3.5">
          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: info.accent }} />
          <h3 className="text-lg font-bold text-text-primary flex-1">{info.title}</h3>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary text-xl"><X className="w-5 h-5" /></button>
        </div>
        <div className="space-y-3">
          {info.body.split('\n\n').map((paragraph, idx) => (
            <p key={idx} className="text-text-secondary text-[15px] leading-relaxed">
              <InlineBold text={paragraph} />
            </p>
          ))}
        </div>
        <CopyBtn text={info.body} />
      </div>
    </div>
  );
}

function CenterModal({ center, onClose }: { center: { name: string; defined: boolean } | null; onClose: () => void }) {
  if (!center) return null;
  const canonical = normalizeCenterName(center.name);
  const body = center.defined
    ? (CENTER_DEFINED_MEANINGS[canonical] || '')
    : (CENTER_UNDEFINED_MEANINGS[canonical] || '');
  const borderColor = center.defined ? (CENTER_COLORS[canonical] || CENTER_COLORS[center.name] || '#8B5CF6') : 'rgba(255,255,255,0.1)';
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70" onClick={onClose}>
      <div
        className="bg-bg-secondary rounded-2xl p-5 max-w-lg w-full max-h-[82vh] overflow-y-auto border"
        style={{ borderColor }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-2.5 mb-3.5">
          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: center.defined ? borderColor : 'rgba(255,255,255,0.15)' }} />
          <h3 className="text-lg font-bold text-text-primary flex-1">{center.name} Center</h3>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary"><X className="w-5 h-5" /></button>
        </div>
        <p className={`text-xs font-semibold uppercase tracking-widest mb-2.5 ${center.defined ? 'text-purple-300' : 'text-amber-400'}`}>
          {center.defined ? 'Defined — Consistent Energy' : 'Undefined — Amplifying Energy'}
        </p>
        {body ? (
          <>
            <RenderMarkdown text={body} />
            <CopyBtn text={body} />
          </>
        ) : (
          <p className="text-text-secondary text-sm leading-relaxed">
            Detailed interpretation for this center is being prepared.
            {center.defined
              ? ' A defined center gives you consistent, reliable access to this kind of energy.'
              : ' An undefined center means you experience this energy through the people and environments around you.'}
          </p>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// AI READING GENERATOR (local, matching mobile)
// ═══════════════════════════════════════════════════════════════════

function generateHDReading(result: HumanDesignResult, firstName: string): string {
  const typeDescriptions: Record<string, string> = {
    Generator: `${firstName}, you are a **Generator** — one of the most powerful energy types in Human Design. You carry a defined Sacral center, which means you have a consistent, sustainable life force that is designed to be used in response to what life brings you.\n\nYour strategy is **To Respond**. This means you are not here to initiate — you are here to wait for something in life to show up and then respond to it with your gut. When something is right for you, your Sacral gives you an unmistakable "uh-huh" — a visceral, physical yes. When it is wrong, you feel a flat, dead "un-uh." Trust that response more than any logical analysis.\n\nWhen you are living correctly, you experience **Satisfaction** — a deep, full-body sense that your energy is being used well. When you are not, you feel **Frustration** — the feeling of spinning your wheels, doing work that drains you, or saying yes to things your gut said no to.\n\nYour gift is your energy. People are drawn to your aura because it is open, warm, and enveloping. You literally light up a room when you are doing work you love. The key is to never waste that energy on things that do not excite your Sacral.`,
    'Manifesting Generator': `${firstName}, you are a **Manifesting Generator** — you carry the raw life force of the Generator combined with the initiating power of the Manifestor. You are multi-passionate, fast-moving, and designed to do many things at once.\n\nYour strategy is **To Respond, then Inform**. Wait for life to present something that lights up your Sacral, respond to it, and then inform the people around you before you take action.\n\nYou experience **Satisfaction** when your energy is fully engaged in work that excites you. You feel **Frustration and Anger** when you are stuck, bored, or forced to do one thing at a time when your nature wants to juggle five.`,
    Projector: `${firstName}, you are a **Projector** — you are here to guide, direct, and manage the energy of others. You do not have consistent access to Sacral energy, which means you are not designed for sustained physical work. Your power is in your perception.\n\nYour strategy is **To Wait for the Invitation**. When you are recognized and invited into the big decisions, your guidance lands perfectly. When you try to offer advice without being asked, people resist you.\n\nYou experience **Success** when your wisdom is valued. You feel **Bitterness** when you are overlooked, overworked, or unrecognized.`,
    Manifestor: `${firstName}, you are a **Manifestor** — you are here to initiate, to make things happen, to set things in motion that others will respond to and build upon.\n\nYour strategy is **To Inform**. Before you act, tell the people who will be impacted.\n\nYou experience **Peace** when you are free to follow your impulses. You feel **Anger** when you are controlled, restricted, or forced to wait for permission.`,
    Reflector: `${firstName}, you are a **Reflector** — the rarest type, making up only 1% of the population. You have no defined centers, which means you are a mirror for the health of your community.\n\nYour strategy is **To Wait a Lunar Cycle** — a full 28 days — before making any major decision.\n\nYou experience **Surprise** when life delights you. You feel **Disappointment** when your environment is unhealthy.`,
  };
  let reading = `## ${firstName}, Your Human Design Blueprint\n\n`;
  reading += typeDescriptions[result.type] || typeDescriptions.Generator;
  if (result.definition) {
    reading += `\n\n### Your Definition: ${result.definition}\n\n`;
    if (result.definition === 'Split Definition') reading += 'You have **Split Definition**, which means your defined centers form two separate groups. You naturally seek out people who bridge the gap.';
    else if (result.definition === 'Single Definition') reading += 'You have **Single Definition**, meaning all your defined centers are connected in one continuous flow. You process information independently.';
    else if (result.definition.includes('Triple')) reading += 'You have **Triple Split Definition**, meaning your defined centers form three separate groups. You need diverse social environments.';
  }
  if (result.channels?.length > 0) {
    reading += `\n\n### Your Defined Channels\n\nYou have **${result.channels.length} defined channel${result.channels.length > 1 ? 's' : ''}** — these are your consistent gifts:\n\n`;
    for (const ch of result.channels) reading += `- **Channel ${ch.gates}** (${ch.name})\n`;
  }
  reading += `\n\n---\n\n${firstName}, your Human Design is not a prescription — it is a permission slip. Permission to stop forcing, stop initiating when your body says wait, and permission to trust the intelligence that lives in your body rather than the noise in your mind.\n\nExperiment with your strategy and authority for 90 days. Notice what shifts.\n`;
  return reading;
}

// ═══════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════

export default function HumanDesignPage() {
  const { t } = useTranslation();
  const { profile } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<HumanDesignResult | null>(null);
  const [error, setError] = useState('');
  const [selectedInfo, setSelectedInfo] = useState<{ title: string; body: string; accent: string } | null>(null);
  const [selectedCenter, setSelectedCenter] = useState<{ name: string; defined: boolean } | null>(null);
  const [expandedGate, setExpandedGate] = useState<number | null>(null);
  const [expandedChannel, setExpandedChannel] = useState<number | null>(null);
  const [aiText, setAiText] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [showAi, setShowAi] = useState(false);

  const loadHumanDesign = useCallback(async () => {
    if (!profile?.birth_date || !profile?.latitude) {
      setError('Please add your birth data in your profile first.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const apiResult = await api.getHumanDesign(buildBirthData(profile));
      const allCenterNames = ['Head', 'Ajna', 'Throat', 'G', 'Heart', 'Sacral', 'SolarPlexus', 'Spleen', 'Root'];
      const definedNames = new Set(
        (apiResult.defined_centers || []).map((c: string) => normalizeCenterName(c))
      );
      const typeInfo = TYPE_STRATEGY_MAP[apiResult.type] || TYPE_STRATEGY_MAP.Generator;

      const data: HumanDesignResult = {
        type: safeString(apiResult.type, 'Generator'),
        strategy: safeString(apiResult.strategy) || typeInfo.strategy,
        authority: safeString(apiResult.authority, 'Sacral'),
        profile: safeString(apiResult.profile),
        definition: safeString(apiResult.definition),
        incarnation_cross: safeString(apiResult.incarnation_cross),
        centers: allCenterNames.map(c => ({ name: c, defined: definedNames.has(c) })),
        channels: (apiResult.defined_channels || []).map((ch: any) => {
          if (Array.isArray(ch)) {
            const g1 = parseInt(safeString(ch[0]), 10);
            const g2 = parseInt(safeString(ch[1]), 10);
            const g1Info = GATE_MEANINGS[g1];
            const g2Info = GATE_MEANINGS[g2];
            let desc = '';
            if (g1Info && g2Info) desc = `This channel connects Gate ${g1} (${g1Info.name} — ${g1Info.theme}) with Gate ${g2} (${g2Info.name} — ${g2Info.theme}).`;
            else if (g1Info) desc = `Gate ${g1}: ${g1Info.gift}`;
            else if (g2Info) desc = `Gate ${g2}: ${g2Info.gift}`;
            return { name: safeString(ch[2]) || (g1Info && g2Info ? `${g1Info.name} — ${g2Info.name}` : ''), gates: `${safeString(ch[0])}-${safeString(ch[1])}`, description: desc };
          }
          const gatesVal = ch.gates;
          let gatesStr: string;
          let channelLabel = '';
          if (typeof gatesVal === 'string') gatesStr = gatesVal;
          else if (typeof gatesVal === 'object' && gatesVal !== null) { gatesStr = safeString(gatesVal.gates) || `${safeString(ch.gate1)}-${safeString(ch.gate2)}`; channelLabel = safeString(gatesVal.label); }
          else gatesStr = `${safeString(ch.gate1)}-${safeString(ch.gate2)}`;
          let desc = safeString(ch.description);
          if (!desc) {
            const parts = gatesStr.split('-');
            const g1 = parseInt(parts[0], 10), g2 = parseInt(parts[1], 10);
            const g1Info = GATE_MEANINGS[g1], g2Info = GATE_MEANINGS[g2];
            if (g1Info && g2Info) desc = `This channel connects Gate ${g1} (${g1Info.name} — ${g1Info.theme}) with Gate ${g2} (${g2Info.name} — ${g2Info.theme}).`;
            else if (g1Info) desc = `Gate ${g1}: ${g1Info.gift}`;
            else if (g2Info) desc = `Gate ${g2}: ${g2Info.gift}`;
          }
          return { name: safeString(ch.name) || safeString(ch.label) || channelLabel, gates: gatesStr, description: desc };
        }),
        not_self_theme: safeString(apiResult.not_self_theme) || typeInfo.notSelf,
        signature: safeString(apiResult.signature) || typeInfo.signature,
      };
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load Human Design chart');
    } finally {
      setLoading(false);
    }
  }, [profile]);

  // Auto-load on mount (matching mobile behavior)
  useEffect(() => {
    if (profile?.birth_date && profile?.latitude && !result && !loading) {
      loadHumanDesign();
    }
  }, [profile, result, loading, loadHumanDesign]);

  const requestAI = useCallback(() => {
    if (!result) return;
    setAiLoading(true);
    setShowAi(true);
    const firstName = (profile?.display_name || '').split(' ')[0] || 'you';
    try {
      const reading = generateHDReading(result, firstName);
      setAiText(reading);
    } catch {
      setAiText('Unable to generate reading. Please try again.');
    } finally {
      setAiLoading(false);
    }
  }, [result, profile]);

  const definedCenters = result?.centers?.filter(c => c.defined) || [];
  const undefinedCenters = result?.centers?.filter(c => !c.defined) || [];
  const typeColors = TYPE_COLORS[result?.type || ''] || { from: '#8B5CF6', to: '#7C3AED' };
  const aura = TYPE_AURAS[result?.type || ''] || '';

  // Collect activated gates from channels
  const activatedGates: number[] = [];
  if (result?.channels) {
    const gateSet = new Set<number>();
    for (const ch of result.channels) {
      const matches = (ch.gates || '').match(/\d+/g);
      if (matches) matches.forEach(m => { const n = parseInt(m, 10); if (!isNaN(n) && n >= 1 && n <= 64) gateSet.add(n); });
    }
    activatedGates.push(...Array.from(gateSet).sort((a, b) => a - b));
  }

  return (
    <PaywallGate feature="human_design">
      <div className="max-w-3xl mx-auto">
        <Link href="/readings" className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary mb-4">
          <ArrowLeft className="w-4 h-4" />
          Back to Readings
        </Link>

        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <Hexagon className="w-8 h-8 text-accent-primary" />
          <div>
            <h1 className="text-2xl font-display font-bold text-text-primary">&#x2B21; Human Design</h1>
            <p className="text-text-tertiary text-sm">Your unique energetic blueprint</p>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="card text-center py-16">
            <div className="animate-spin w-8 h-8 border-2 border-accent-primary border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-text-tertiary">Mapping Your Energetic Blueprint...</p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="card text-center py-12">
            <p className="text-red-400 text-sm mb-4">{error}</p>
            <button onClick={loadHumanDesign} className="btn-primary">Retry</button>
          </div>
        )}

        {/* Results */}
        {result && !loading && (
          <div className="space-y-4 mt-4">

            {/* Type Banner */}
            <button
              className="w-full rounded-2xl p-6 text-center cursor-pointer transition-opacity hover:opacity-90"
              style={{ background: `linear-gradient(to right, ${typeColors.from}, ${typeColors.to})` }}
              onClick={() => setSelectedInfo(getSectionInfo('type', result))}
            >
              <p className="text-white/70 text-xs uppercase tracking-widest mb-1">Type <Info className="w-3 h-3 inline ml-1" /></p>
              <h2 className="text-2xl font-display font-bold text-white">{result.type}</h2>
              {aura && <p className="text-white/60 text-sm mt-1">Aura: {aura}</p>}
              <p className="text-white/50 text-[11px] italic mt-1">Click to learn more</p>
            </button>

            {/* Strategy & Authority */}
            <div className="grid grid-cols-2 gap-3">
              <button
                className="card text-center py-4 cursor-pointer hover:border-blue-500/30 transition-colors"
                onClick={() => setSelectedInfo(getSectionInfo('strategy', result))}
              >
                <p className="text-blue-400 text-xs uppercase tracking-wider mb-1">Strategy <Info className="w-3 h-3 inline ml-0.5" /></p>
                <p className="font-semibold text-text-primary text-sm">{result.strategy}</p>
              </button>
              <button
                className="card text-center py-4 cursor-pointer hover:border-amber-500/30 transition-colors"
                onClick={() => setSelectedInfo(getSectionInfo('authority', result))}
              >
                <p className="text-amber-400 text-xs uppercase tracking-wider mb-1">Authority <Info className="w-3 h-3 inline ml-0.5" /></p>
                <p className="font-semibold text-text-primary text-sm">{result.authority}</p>
              </button>
            </div>

            {/* Profile & Definition */}
            <div className="grid grid-cols-2 gap-3">
              <button
                className="card text-center py-4 cursor-pointer hover:border-purple-500/30 transition-colors"
                onClick={() => setSelectedInfo(getSectionInfo('profile', result))}
              >
                <p className="text-purple-400 text-xs uppercase tracking-wider mb-1">Profile <Info className="w-3 h-3 inline ml-0.5" /></p>
                <p className="font-semibold text-text-primary text-sm">{result.profile}</p>
              </button>
              <button
                className="card text-center py-4 cursor-pointer hover:border-cyan-500/30 transition-colors"
                onClick={() => setSelectedInfo(getSectionInfo('definition', result))}
              >
                <p className="text-cyan-400 text-xs uppercase tracking-wider mb-1">Definition <Info className="w-3 h-3 inline ml-0.5" /></p>
                <p className="font-semibold text-text-primary text-sm">{result.definition}</p>
              </button>
            </div>

            {/* Signature & Not-Self */}
            <div className="grid grid-cols-2 gap-3">
              {result.signature && (
                <button
                  className="card text-center py-4 cursor-pointer hover:border-emerald-500/30 transition-colors"
                  onClick={() => setSelectedInfo(getSectionInfo('signature', result))}
                >
                  <p className="text-emerald-400 text-xs uppercase tracking-wider mb-1">Signature <Info className="w-3 h-3 inline ml-0.5" /></p>
                  <p className="font-semibold text-text-primary text-sm">{result.signature}</p>
                </button>
              )}
              {result.not_self_theme && (
                <button
                  className="card text-center py-4 cursor-pointer hover:border-red-500/30 transition-colors"
                  onClick={() => setSelectedInfo(getSectionInfo('notself', result))}
                >
                  <p className="text-red-400 text-xs uppercase tracking-wider mb-1">Not-Self Theme <Info className="w-3 h-3 inline ml-0.5" /></p>
                  <p className="font-semibold text-text-primary text-sm">{result.not_self_theme}</p>
                </button>
              )}
            </div>

            {/* Incarnation Cross */}
            {result.incarnation_cross && (
              <button
                className="w-full card text-center py-5 cursor-pointer bg-gradient-to-r from-amber-500/10 to-amber-500/[0.02] hover:border-amber-500/30 transition-colors"
                onClick={() => setSelectedInfo(getSectionInfo('cross', result))}
              >
                <p className="text-amber-400 text-xs uppercase tracking-wider mb-2">&#x271A; Incarnation Cross <Info className="w-3 h-3 inline ml-0.5" /></p>
                <p className="font-bold text-text-primary">{result.incarnation_cross}</p>
              </button>
            )}

            {/* Energy Centers */}
            <h3 className="text-lg font-bold text-text-primary mt-6 mb-3">Energy Centers</h3>

            {definedCenters.length > 0 && (
              <>
                <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Defined Centers</p>
                <p className="text-xs text-text-muted mb-2">Click a center to learn what it means for you</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {definedCenters.map(center => (
                    <button
                      key={center.name}
                      onClick={() => setSelectedCenter({ name: center.name, defined: true })}
                      className="inline-flex items-center gap-1.5 bg-bg-secondary rounded-full px-3 py-1.5 border border-border-primary hover:border-accent-primary/40 transition-colors text-sm"
                    >
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CENTER_COLORS[center.name] || '#8B5CF6' }} />
                      <span className="text-text-primary">{center.name}</span>
                    </button>
                  ))}
                </div>
              </>
            )}

            {undefinedCenters.length > 0 && (
              <>
                <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Undefined Centers</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {undefinedCenters.map(center => (
                    <button
                      key={center.name}
                      onClick={() => setSelectedCenter({ name: center.name, defined: false })}
                      className="inline-flex items-center gap-1.5 bg-bg-secondary rounded-full px-3 py-1.5 border border-border-primary hover:border-text-muted/40 transition-colors text-sm"
                    >
                      <span className="w-2.5 h-2.5 rounded-full bg-gray-600 border border-gray-500" />
                      <span className="text-text-muted">{center.name}</span>
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* Active Channels */}
            {result.channels?.length > 0 && (
              <>
                <h3 className="text-lg font-bold text-text-primary mt-6 mb-3">Active Channels</h3>
                <div className="space-y-2">
                  {result.channels.map((channel, i) => {
                    const isExpanded = expandedChannel === i;
                    const gateParts = String(channel.gates || '').split('-');
                    const g1 = parseInt(gateParts[0], 10);
                    const g2 = parseInt(gateParts[1], 10);
                    const g1Info = GATE_MEANINGS[g1];
                    const g2Info = GATE_MEANINGS[g2];
                    return (
                      <button
                        key={i}
                        onClick={() => setExpandedChannel(isExpanded ? null : i)}
                        className={`w-full text-left rounded-xl p-3.5 transition-all ${isExpanded ? 'bg-purple-500/10 border border-purple-500/30' : 'bg-bg-secondary border border-transparent hover:border-border-primary'}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5 flex-1 min-w-0">
                            <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0">
                              <span className="text-accent-primary text-[10px] font-bold">{String(channel.gates || '')}</span>
                            </div>
                            <div className="min-w-0">
                              <p className="text-text-primary text-sm font-semibold truncate">{String(channel.name || '')}</p>
                              <p className="text-text-muted text-xs">{g1Info ? `Gate ${g1}: ${g1Info.name}` : ''}{g1Info && g2Info ? ' ↔ ' : ''}{g2Info ? `Gate ${g2}: ${g2Info.name}` : ''}</p>
                            </div>
                          </div>
                          {isExpanded ? <ChevronUp className="w-4 h-4 text-text-muted shrink-0" /> : <ChevronDown className="w-4 h-4 text-text-muted shrink-0" />}
                        </div>
                        {isExpanded && (
                          <div className="mt-3 space-y-2.5">
                            <p className="text-text-secondary text-[13px] leading-relaxed">{String(channel.description || '')}</p>
                            {g1Info && (
                              <div className="bg-bg-primary/50 rounded-lg p-2.5">
                                <p className="text-accent-primary text-xs font-semibold mb-1">Gate {g1} — {g1Info.name}</p>
                                <p className="text-text-secondary text-[12.5px] leading-relaxed">{g1Info.gift}</p>
                              </div>
                            )}
                            {g2Info && (
                              <div className="bg-bg-primary/50 rounded-lg p-2.5">
                                <p className="text-accent-primary text-xs font-semibold mb-1">Gate {g2} — {g2Info.name}</p>
                                <p className="text-text-secondary text-[12.5px] leading-relaxed">{g2Info.gift}</p>
                              </div>
                            )}
                            <CopyBtn text={`${channel.name} (${channel.gates})\n${channel.description}${g1Info ? `\n\nGate ${g1} — ${g1Info.name}: ${g1Info.gift}` : ''}${g2Info ? `\n\nGate ${g2} — ${g2Info.name}: ${g2Info.gift}` : ''}`} />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {/* Personal Reading */}
            <button
              onClick={requestAI}
              disabled={aiLoading}
              className="btn-primary w-full mt-6"
            >
              {aiLoading ? 'Generating...' : showAi ? 'Regenerate Personal Reading' : '✨ Get Your Personal Reading'}
            </button>

            {showAi && (
              <div className="card bg-gradient-to-br from-purple-500/10 to-purple-500/[0.02] mt-3">
                <p className="text-accent-secondary text-xs font-semibold uppercase tracking-wider mb-3">&#x2728; Personal Reading</p>
                {aiText ? (
                  <>
                    <RenderMarkdown text={aiText} />
                    <CopyBtn text={aiText} />
                  </>
                ) : (
                  <p className="text-text-tertiary">Reading your energetic design...</p>
                )}
              </div>
            )}

            {/* Activated Gates */}
            <h3 className="text-lg font-bold text-text-primary mt-6 mb-2">Your Activated Gates</h3>
            <p className="text-xs text-text-muted mb-3">Click a gate to learn what it means for you</p>

            {activatedGates.length === 0 ? (
              <p className="text-text-muted text-sm">
                No individual gate activations could be extracted from your chart data. Your core energetic blueprint above is still accurate and complete.
              </p>
            ) : (
              <div className="space-y-2">
                {activatedGates.map(gateNum => {
                  const info = GATE_MEANINGS[gateNum];
                  if (!info) return null;
                  const isExpanded = expandedGate === gateNum;
                  return (
                    <button
                      key={gateNum}
                      onClick={() => setExpandedGate(isExpanded ? null : gateNum)}
                      className={`w-full text-left rounded-xl p-3.5 transition-all ${isExpanded ? 'bg-purple-500/10 border border-purple-500/30' : 'bg-bg-secondary border border-transparent hover:border-border-primary'}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                            <span className="text-accent-primary text-sm font-bold">{gateNum}</span>
                          </div>
                          <div>
                            <p className="text-text-primary text-sm font-semibold">{info.name}</p>
                            <p className="text-text-muted text-xs">{info.theme}</p>
                          </div>
                        </div>
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-text-muted" /> : <ChevronDown className="w-4 h-4 text-text-muted" />}
                      </div>
                      {isExpanded && (
                        <div className="mt-2.5">
                          <p className="text-text-secondary text-[13px] leading-relaxed">{info.gift}</p>
                          <CopyBtn text={info.gift} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Recalculate */}
            <button onClick={loadHumanDesign} className="btn-secondary w-full mt-4">
              Recalculate
            </button>
          </div>
        )}

        {/* Modals */}
        <InfoModal info={selectedInfo} onClose={() => setSelectedInfo(null)} />
        <CenterModal center={selectedCenter} onClose={() => setSelectedCenter(null)} />
      </div>
    </PaywallGate>
  );
}
