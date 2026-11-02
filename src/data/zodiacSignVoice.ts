/* ──────────────────────────────────────────────────────────────
   Zodiac sign page copy in the reader's voice.
   Second person, specific, no definitions of the sign or its element.
   Layered over the factual fields in zodiacSignContent.ts (traits, lists,
   matches, famous people), which are unchanged.
   ────────────────────────────────────────────────────────────── */

import type { ZodiacSign } from './compatibilityContent';

export interface ZodiacSignVoice {
  loveStyle: string[];
  careerStrengths: string[];
  shadowSide: string;
  lifePurpose: string;
  elementDescription: string;
  sections: { title: string; icon: string; paragraphs: string[] }[];
}

export const ZODIAC_SIGN_VOICE: Record<ZodiacSign, ZodiacSignVoice> = {
  aries: {
    "loveStyle": [
      "You fall fast, and you make it obvious. You text first, plan the date before they have finished saying yes, and turn up with the thing they mentioned once in passing. Anyone you are interested in knows within a week, because hiding it has never been an option for you.",
      "What keeps you in a relationship is friction of the good kind. You want a partner who teases you back, argues without sulking and beats you at something once in a while. If everything is smooth and agreeable, you start picking fights just to feel something, and then wonder why the relationship got tense.",
      "You show love by turning up. You will drive across the city at midnight, take on the person who was rude to them and cheer louder than anyone at their small wins. What you forget is that they sometimes need you to sit still and listen, which is the one thing that costs you the most."
    ],
    "careerStrengths": [
      "You do your best work when you can move first and fix later. Sales, startups, sport, emergency work and any job with a clock and a visible result suit you, because you are the person who makes the call while the meeting is still going in circles. Give you a deadline and a rival and you get sharper.",
      "You do not wait for permission, and people follow you because of it. Put you under a micromanaging boss or a process with six sign-offs and you either quit or quietly do it your own way, which is where most of your career trouble starts. Autonomy and a clear goal are all you really ask for."
    ],
    "shadowSide": "Your shadow is speed. You decide in a second, defend the decision for a week, and cannot stand being told you moved too fast. Under pressure you bulldoze: you finish other people's sentences and make the call without asking, then call the wreckage honesty. The fix is not to slow down for good. It is to wait one breath before the first thing you say to someone you love.",
    "lifePurpose": "You are here to learn that courage and care are not opposites. You have already proven nobody can push you around. The real test is whether you will be the one who protects somebody else. Grown up, you stop fighting to win and start fighting for someone.",
    "elementDescription": "Fire is why you walk into a room and the temperature changes. You act first, feel the consequences second, and recover faster than anyone around you. Left unaimed it burns the people closest to you: the same heat that makes you magnetic makes you exhausting when you need everything to move at your speed.",
    "sections": [
      {
        "title": "Personality Overview",
        "icon": "🔥",
        "paragraphs": [
          "You start things. While other people are still weighing the risks, you have already sent the email, signed up for the race or booked the flight, and you figure it out on the way down. Sitting still feels like falling behind, and you have never once felt better after waiting.",
          "You need something to push against. Easy wins bore you within a week, which is why you pick the harder job, the bigger competitor, the argument you did not have to start. You are not proving your worth to anyone. Testing your limits is simply the only time you feel completely awake.",
          "People always know where they stand with you. If you are annoyed they hear it today, and if you like them they hear that too. You have no patience for hints, hidden agendas or the group chat that says fine when it means the opposite, and that bluntness is the reason people trust you.",
          "You get over things quickly, which is a gift to you and a problem for everyone who needed an apology. You can blow up at breakfast and be laughing by lunch, and you assume the other person is too. Some of them are still at breakfast."
        ]
      },
      {
        "title": "In Love & Relationships",
        "icon": "💕",
        "paragraphs": [
          "The first month with you is a lot. Daily messages, a spontaneous weekend away, your full attention aimed at one person like a spotlight. They feel chosen, and they are, which is exactly why it hurts them when the spotlight swings toward a new project and they are left standing in the dark.",
          "You are drawn to people who do not fold. The partner who says no to your face, holds their ground in an argument and still wants to have dinner afterwards gets your deepest respect. Someone who agrees with everything you say gets your boredom, and you will not even notice you have started treating them like furniture.",
          "The hard part is month eight, when the thrill has settled into a Tuesday. You get restless, start a fight over nothing or plan an escape, and it looks to your partner like you have stopped caring. You have not. You just do not yet trust that being known is as exciting as being chased.",
          "You say it with your body and your feet: hands on them in the kitchen, a trip you booked as a surprise, a dare at midnight. Dates with you turn into races, and the competitive streak shows up even in bed. The thing you rarely say out loud is that you are scared of needing someone, so you do it with action instead."
        ]
      },
      {
        "title": "Career & Purpose",
        "icon": "🚀",
        "paragraphs": [
          "Nine to five with a fixed ladder drains you. You want a role where you own the outcome, can see the result by Friday and nobody rewrites your plan in a meeting. When a job gives you that, you outwork the whole department. When it does not, you start interviewing without telling anyone.",
          "You are the person who turns an idea into a launched thing while others are still polishing the deck. That makes you a natural founder, even if the business is small, because you can tolerate the risk that makes other people freeze. Your first version is rough, and it is also live.",
          "In a crisis you get calmer, not louder. When the client is furious or the system is down, you pick up the phone and start fixing before the others have finished panicking. Teams quietly hand you the wheel in those moments, and you take it without being asked.",
          "Your career gets damaged in the small moments: the sharp reply in an email, the colleague you overruled in front of everyone, the idea you took credit for because you moved first. Each one feels minor at the time. Years later they add up to a reputation that costs you promotions you should have won."
        ]
      },
      {
        "title": "Strengths & Gifts",
        "icon": "✨",
        "paragraphs": [
          "Your biggest gift is that you go first. In a room where everyone agrees something must change and nobody moves, you are the one who makes the phone call. Other people borrow your courage without realising it, and plenty of them have a different life because you went first.",
          "You say the thing nobody else will. You tell the friend the relationship is bad for her, you tell the boss the plan will not work, you tell the family the story they avoid. It costs you some dinners, but it is also why people come to you when they need the truth.",
          "You bounce back from things that would flatten other people. A failed launch, a breakup, a humiliating mistake: you take a day or two, then you are already planning the next move. People who watch you do it find it contagious, and you rarely notice how much that holds a group together."
        ]
      },
      {
        "title": "Shadow & Growth",
        "icon": "🌑",
        "paragraphs": [
          "You win arguments you should have lost. Because you hate being wrong, you push the point past the moment where the other person has stopped listening and started resenting. You walk away having been right, and they walk away having quietly decided never to bring it up again.",
          "Anger is how you feel almost everything. Hurt, fear and embarrassment all come out as heat, so the people close to you only ever see the anger and never the softer thing under it. If you could say I felt left out instead of snapping, half your conflicts would not happen.",
          "Your next level is learning to stay. Stay in the conversation after the first wave of irritation, stay in the project past week three, stay in the discomfort of a feeling you cannot punch your way out of. Nothing in your life has been fixed faster by being louder than it was by being patient.",
          "Life tends to send you situations force cannot solve: a partner who needs you to compromise, a project that takes three years, a person you cannot out-argue. Those are not setbacks. They are the places where you stop being a fighter and turn into someone people lean on."
        ]
      },
      {
        "title": "Compatibility Quick Guide",
        "icon": "💫",
        "paragraphs": [
          "With Leo and Sagittarius you finally stop explaining yourself. Leo matches your appetite for being seen, so the two of you act like a power couple who dares each other to go bigger. Sagittarius makes you laugh at your own rush, takes the next flight with you and never asks you to stay put.",
          "Aquarius and Gemini keep your mind busy, which is rarer than you think. Aquarius is as independent as you are, so nobody feels managed, and the odd ideas they bring fascinate you. Gemini is quick enough to keep up with you in conversation and teases you out of your moods before they settle.",
          "Cancer and Capricorn are where it gets bumpy. With Cancer you act, they feel, and they take your bluntness as a wound you did not know you caused. With Capricorn you want it now and they want it planned, so you end up resenting each other for being exactly what you each asked for. These pairings can last, but only if you both do real work."
        ]
      }
    ]
  },
  taurus: {
    "loveStyle": [
      "You do not rush love, and you do not fake it. You watch for months. You notice whether they are kind to waiters, whether they do what they said they would, whether they are still the same person on a bad day. Once you commit, it is for years, and you show it by cooking, fixing, buying the good bedding and quietly making their life more comfortable.",
      "You love through your senses. The smell of their jumper, the weight of an arm around you on the sofa, a meal made properly and eaten slowly: that is where you feel close. Rushed, distracted or mechanical intimacy leaves you cold, and you would rather wait a week for the real thing.",
      "You need to know where you stand. Drama, mixed signals and on-and-off patterns make you shut down rather than fight, and you can sit in a bad situation for far too long before you finally say anything. What you want is someone who turns up on time, every time, and lets you build something that lasts."
    ],
    "careerStrengths": [
      "You make things real. Where others pitch, you build: a business that pays, a kitchen that people queue for, a portfolio that grows quietly for twenty years. Property, finance, food, music, design and craft suit you, because your taste and your patience pull in the same direction.",
      "Your edge is that you stay. While colleagues chase the next shiny role, you put down roots, get properly good and become the person nobody can replace. You build wealth steadily and you rarely lose it to a bad gamble, because you walk away from any plan that smells too good to be true."
    ],
    "shadowSide": "The grip is where you go wrong. When you feel unsafe you dig in, and from the outside it looks like calm. Actually you have stopped listening. You hold onto the job, the routine, the grudge and sometimes the person long after they stopped serving you, and you call it loyalty. Comfort turns into a place to hide, and the silent treatment becomes your way of winning without saying a word.",
    "lifePurpose": "You are here to learn that you are safe without holding everything tight. Everything you have built can be lost and you will still be you. The Taurus who grows up keeps building beautiful, lasting things, but opens their hands enough to let people, money and plans move through their life without panic.",
    "elementDescription": "Earth is why people exhale when you walk in. You slow the room down, notice what is actually in front of you and turn vague ideas into things that exist. Left unchecked, the same steadiness hardens into a refusal to move: you decide, and then the decision becomes a wall that nobody, including you, can get over.",
    "sections": [
      {
        "title": "Personality Overview",
        "icon": "🌿",
        "paragraphs": [
          "As a Taurus, you are the one people lean on without knowing why. You do not hurry, you do not panic and you do not get pulled into other people's urgency. If someone says it must be decided today, you go quiet, think it over for two days and usually turn out to be right.",
          "Underneath is a simple need: you want a life that is secure and good to live in. A home you love, food worth eating, money that does not worry you, people who are not going anywhere. You will work for years towards it, which is why you plant the tree knowing you will not eat the fruit for a decade.",
          "You notice what everyone else rushes past. The texture of a fabric, the way a room smells at five o'clock, the flat note in a song. Because you actually live in the moment you are in, you enjoy small things more than most people and you can be hard to talk out of a good meal or a long bath.",
          "Your stubbornness is legendary and you know it. Nobody wins an argument with you by pushing, because pushing makes you plant your feet. You change your mind on your own schedule, often silently, and sometimes only after the other person has given up and gone home."
        ]
      },
      {
        "title": "In Love & Relationships",
        "icon": "💕",
        "paragraphs": [
          "You prove love with objects and routines. You remember their usual order, keep their favourite snack in the cupboard, warm the car on cold mornings and turn the flat into a place they never want to leave. You rarely say the big words first, but your partner can feel them in the way you take care of the details.",
          "You expect loyalty and you give it all the way. Flirting that others call harmless feels like a small betrayal to you, and you do not keep one eye on the exit. If you are cheated on or lied to, you may stay silent for weeks, and once you decide that trust is gone, getting it back is slow and rarely complete.",
          "Your trouble is that you hate change inside a relationship. You want the same Sunday, the same restaurant, the same side of the bed, and when a partner needs something to shift, you hear criticism. You dig in, they feel unheard, and a small request turns into months of cold distance.",
          "Sex with you is slow and generous, and it needs to feel unhurried and real. You pay attention to touch, mood, the right room. If your partner treats it like a task or a performance, you go still and polite, and they may not realise how far away you have gone until it is already late."
        ]
      },
      {
        "title": "Career & Purpose",
        "icon": "🏗️",
        "paragraphs": [
          "You are not interested in fast money or exciting-sounding industries. You choose a path, learn it deeply and let the years do the work. By your late thirties, you often look quietly ahead of people who made louder moves at twenty-five.",
          "Work that involves your hands, ears, eyes or taste suits you: cooking, music, interiors, architecture, wine, craft, anything where quality is visible. You cannot stand to hand over something that is merely fine. Colleagues call you slow, and then use your version because it is the one that lasts.",
          "Money drives your choices more than you admit. You track what comes in and goes out, you build a cushion before you take any leap and you never trust a scheme that needs you to hurry. That caution has saved you from every crash that took out your more adventurous friends.",
          "Your career gets stuck when it is comfortable. The job is fine, the pay is fine, the commute is familiar, so you stay three years after you stopped learning anything. The raise you wanted never came because you never asked, and the leap you needed never happened because you were warm where you were."
        ]
      },
      {
        "title": "Strengths & Gifts",
        "icon": "✨",
        "paragraphs": [
          "You make things last. Your marriage, your friendships, your business and your garden are the ones that are still going after the trend has passed. People around you are tired of disposable everything, and being around you reminds them that some things are worth looking after.",
          "Your patience is a real advantage. You can do the boring daily thing for five years without needing applause, and compound interest rewards exactly that. Money, skill, trust and health all grow for you because you keep turning up on days when other people have lost interest.",
          "You make others feel safe. In a crisis, your calm voice is the one people trust, and friends call you when everything has gone wrong because they know you will not catastrophise. You feed them, sit with them and fix the practical thing first, and they leave steadier than they arrived."
        ]
      },
      {
        "title": "Shadow & Growth",
        "icon": "🌑",
        "paragraphs": [
          "When you are unhappy, you go silent and stay put. You do not shout, you do not leave, you simply stop moving, and the people around you are left guessing for weeks. The cold, polite non-answer is your most effective weapon, and also the thing that wears out the people who love you.",
          "You tighten your grip on what you are scared of losing. A partner who has a night out with friends, a business partner who wants a new direction, a sibling who borrowed something: all of them can trigger the urge to hold on harder. The tighter you hold, the more the person pulls away, which proves your fear right and starts the cycle again.",
          "Your growth comes from tolerating a little uncertainty. Try the unfamiliar restaurant, take the meeting about the strange offer, let a plan change without taking it as an attack. Each time you survive it, you learn that you are steadier than your routine ever suggested.",
          "Life tends to take things from you at some point: a job, a home, a relationship, a sum of money. It hurts, and you will be furious about it. Later you see that you are still here, still capable and still yourself, and that discovery is worth more than whatever you lost."
        ]
      },
      {
        "title": "Compatibility Quick Guide",
        "icon": "💫",
        "paragraphs": [
          "Virgo and Capricorn feel like home. Virgo notices the small things you do for them and does the same back, so the two of you build a calm, tidy life without a single dramatic argument. Capricorn wants the same long game you do, and together you quietly end up with the house, the savings and the plan.",
          "Cancer and Pisces are where you let your guard down. Cancer wants a cosy nest and a long future as much as you do, and your cooking and their care make a very warm home. Pisces is the one who draws out the dreamier side you keep hidden and gets you to laugh at your own schedule.",
          "Aquarius and Leo are the harder ones. Aquarius changes plans for the fun of it, and you feel the ground move, then go stubbornly quiet. Leo wants constant attention and big gestures, and you feel tired by the third dinner out. You can make either work, but only if you both agree to bend."
        ]
      }
    ]
  },
  gemini: {
    "loveStyle": [
      "You fall for the mind first. Someone who makes you laugh in the first ten minutes and says something you have never thought before has you hooked before you realise it. You will message them an article at 11pm, keep a running joke going for months and treat a good conversation as the closest thing you know to a kiss.",
      "You get restless if the relationship has only one mode. You are quiet and bookish on Sunday and loud and social on Friday, and both are genuinely you. A partner who needs you to be the same person every day ends up feeling like they are living with a stranger, and you end up feeling like you are on trial.",
      "You love through talking, so silence worries you. You process feelings by saying them out loud, often before you have worked out what you think, which can sound like you are changing your story. A partner who sends you something funny at lunch, asks real questions and answers yours has you completely."
    ],
    "careerStrengths": [
      "You are at your best when every day is different and words are involved. Writing, teaching, sales, marketing, media, tech and anything where you are explaining, persuading or connecting people suits you. You get bored by repetition faster than anyone, so a job that keeps handing you new problems keeps you sharp.",
      "You pick up a topic in an afternoon and can explain it to others by evening, which is rarer than you think. People send you the complicated thing and you send back something clear. You often run two projects, a side hustle or a second career at once, and the overlap tends to make each one better."
    ],
    "shadowSide": "Your weak point is the quick answer. You can talk your way out of almost anything, and that includes the honest conversation with yourself. You tell one friend the polished version and another the funny version, say yes to three things and quietly drop two, and then wonder why people say they do not know where they stand with you. Under pressure you joke, change the subject and move to something new before anyone has caught up with what you actually felt.",
    "lifePurpose": "You are here to learn that depth and curiosity can live in the same person. You already know a little about everything. The real work is staying with one idea, one project or one person long enough to find out what it becomes. Grown up, you stop collecting information and become the person others trust to explain what it all means.",
    "elementDescription": "Air is why you can walk into a stranger's party and leave with three phone numbers and a book recommendation. You think fast, talk fast and move between people and ideas without effort. The cost is that your mind is rarely where your body is, so you can spend a whole day thinking about a feeling without once actually having it.",
    "sections": [
      {
        "title": "Personality Overview",
        "icon": "🌬️",
        "paragraphs": [
          "You are never doing only one thing. You have three books open, a dozen group chats going and a new hobby you started last Tuesday. Your phone has forty tabs and you could explain every one. Quiet moments feel strangely loud to you, so you fill them.",
          "You can hold two opposite views and feel no need to choose. You see why they are right and why they are wrong, why the job is perfect and why you should leave. People who think in straight lines find this exhausting, and some call you flaky. Mostly you are just seeing more of the picture than they are.",
          "Curiosity is the engine. You want to know how it works, why they did that, what happens next and what the other side thinks. It makes you wonderful company and also leaves you tired, because your brain rarely switches off, and 2am is where your best and worst ideas live.",
          "You read a room in seconds. Within a minute, you know who is nervous, who is lying and what tone will land, and you adjust without thinking. It feels like kindness, and often it is, but it can also make people suspect you are a different person with every group."
        ]
      },
      {
        "title": "In Love & Relationships",
        "icon": "💕",
        "paragraphs": [
          "You are won by wit. The person who surprises you with a sharp line, an odd fact or an unexpected opinion gets your attention, and the person who bores you does not get a second date no matter how good-looking they are. You are attracted to the way someone thinks long before the way they look.",
          "You need air in a relationship. Your own friends, your own interests, a few hours alone with your head every week. If a partner tries to merge your lives into one calendar, you start inventing excuses to be out, and you feel guilty about it. Nothing feels as claustrophobic to you as being asked to explain where you were.",
          "You are the partner who defuses a tense evening with a joke, a silly voice or a sudden plan to go for ice cream. You keep relationships light and fun, and that is a real gift. It also means a lot of your arguments end in laughter without anyone having said what was actually wrong.",
          "Your difficulty is that you talk about feelings rather than feel them. You explain why you are sad with perfect clarity and a good structure, and your partner nods and still does not know you are hurt. Learning to say I am scared or I need you without a punchline is the step that turns a fun relationship into a deep one."
        ]
      },
      {
        "title": "Career & Purpose",
        "icon": "📚",
        "paragraphs": [
          "Your career is rarely a straight line. You are a marketer who writes a newsletter and learns to code on weekends, or a teacher with a podcast. Relatives keep asking when you will pick one thing. For you, the variety is how you stay engaged, and you do far better work when you have two or three streams going than when you are locked into one.",
          "Words are your best tool. You can write the email that gets the yes, pitch the idea in two sentences and make a dry topic sound interesting at a meeting. Journalism, teaching, social media, PR, sales and podcasting all let you turn what you picked up that morning into something people want to hear.",
          "Tech and anything that moves fast suits you too. When the tools change every six months, you are the one who is learning the new one while others complain. Being a quick study is worth more than deep specialism in industries that keep reinventing themselves.",
          "Your risk is spreading yourself so thin that nothing finishes. Five half-built projects look like a pile of potential to you and like a pattern to everyone else. Choose the one thread that runs through all of it, such as teaching, building or explaining, and your scattered history becomes a story people want to hire."
        ]
      },
      {
        "title": "Strengths & Gifts",
        "icon": "✨",
        "paragraphs": [
          "You connect things. You introduce two people who end up in business together, link an idea from last year to a problem today and translate what the expert said into a sentence the rest of the room understands. Without you, a lot of good people and good ideas would never meet.",
          "Change does not scare you the way it scares others. A job loss, a move to a new city or a sudden shift in plan has you curious before it has you worried. People around you borrow that, because watching you land on your feet makes the unknown look less frightening.",
          "You lighten heavy rooms. At a tense family dinner, a flat team meeting or a long, grim hospital wait, you are the one who finds the joke and reminds everyone there is another way to see it. It is not avoidance when you do it well. It lets people breathe long enough to deal with the real thing."
        ]
      },
      {
        "title": "Shadow & Growth",
        "icon": "🌑",
        "paragraphs": [
          "You are good at talking your way out of things, and the main person you talk out of things is yourself. You can argue yourself out of the uncomfortable truth about a relationship, a habit or a deadline in under a minute. Quick wit makes accountability easy to skip, and it is the reason the same lesson comes round again.",
          "Your mind runs hot. Overthinking at night, a stomach that tightens before every call, a body you only notice when something hurts. You live in your head so much that you miss your own signals. Walking, cold water, stretching or just a slow meal pull you back more reliably than another podcast.",
          "Real growth for you is staying. One book finished, one conversation held past the awkward part, one project carried past the week the novelty wore off. You get a different kind of interesting when you go deep, and people start quoting you, not just enjoying you.",
          "Life brings you something that needs your full attention: a creative piece that takes years, a person who needs the honest version of you, a skill that does not respond to shortcuts. Those are the places you finally stop skimming. They are also the ones you will remember when you are old."
        ]
      },
      {
        "title": "Compatibility Quick Guide",
        "icon": "💫",
        "paragraphs": [
          "Libra and Aquarius feel like talking to your own reflection with better jokes. Libra gives you graceful, endless conversation and a shared eye for what looks good, and neither of you ever raises your voice. Aquarius lets you be odd, follows your wildest tangent and gives you the freedom you quietly need.",
          "Aries and Leo bring heat. Aries matches your speed and dares you to act on your ideas, so dates turn into spontaneous adventures. Leo is generous and loud and loves an audience, which suits you, and you keep each other entertained as long as you both remember to listen.",
          "Pisces and Virgo are the harder ones. With Pisces you say something light and they hear something heavy, and you end up feeling flooded by emotions you cannot fix with a joke. With Virgo, you tell the story and they correct the details, and the criticism makes you feel caged. Scorpio is hard too, because you hide behind humour and they want the truth. These pairings work when you each learn from what the other does best."
        ]
      }
    ]
  },
  cancer: {
    "loveStyle": [
      "You love by remembering. The coffee order, the name of the coworker who annoys them, the date of the awful thing that happened three years ago: you keep all of it, and it is how you say I am paying attention. When you open up to someone you are not offering a fling, you are handing over a key to your whole life.",
      "You turn any place you live into a refuge within a month. Food is how you talk when words feel too exposed, so you cook, you stock the fridge, you pick the gift that proves you listened. You also check your phone more than you admit, waiting to see whether the effort got noticed.",
      "You give far more than you ask for, then quietly keep score. Nobody sees the ledger until the night you go silent and answer fine, nothing is wrong. Say what you need while it is still small, because a partner can meet a request but cannot read a grudge."
    ],
    "careerStrengths": [
      "You are at your best where someone is vulnerable and you are the steady one: nursing, teaching, counselling, real estate, food, hospitality, anything where a person walks in worried and leaves feeling safe. Customers and patients tell you things they tell nobody else, and you remember it next time.",
      "You read a team the way other people read a screen. You know who is about to quit, who is covering for a friend and who needs a kind word before the meeting. That makes you a manager people stay for, even if your own boss never notices what you are holding together."
    ],
    "shadowSide": "Your shadow is the quiet punishment. When you feel hurt you do not argue, you go cold, drop hints and let the other person guess what they did. You give until you are exhausted, then treat the exhaustion as a debt they owe. You also hold on long past the point of use: the ex, the old house, the insult from 2016. The fix is saying the hurt out loud on the day it happens, in one plain sentence, instead of making someone earn their way back in.",
    "lifePurpose": "You are here to learn that you can care for people without keeping them. You already know how to build a home out of nothing. The harder lesson is watching someone you love walk out of it and still being whole when the door closes. The Cancer who grows up stops needing to be needed and starts being glad when the people they raised no longer need them.",
    "elementDescription": "Water is why you know the mood of a room before you have taken your coat off. You feel first and explain later, and your feelings rise and fall without asking permission, which makes you hard to predict even to yourself. Left alone it turns into a tide that pulls everyone into your weather: the same sensitivity that makes you the safest person to talk to makes you the hardest to disagree with.",
    "sections": [
      {
        "title": "Personality Overview",
        "icon": "🌊",
        "paragraphs": [
          "You feel everything first and decide what to do about it second. You walk into a room and know who is tense, who just argued and who is pretending to be fine. Most people cannot do this, so you tend to assume they are ignoring it on purpose.",
          "People mistake your softness for weakness, and it costs them. Once you have committed to a person or a plan, you do not let go, and you will outlast people who looked tougher. You will take the long way round, the quiet way, but you get there.",
          "Home is not an address to you, it is a feeling you carry. You can make a rented room feel lived in by the second night, and a stranger feels like family after one meal at your table. When that feeling is missing you cannot concentrate, sleep or be nice.",
          "You keep things. Letters, songs, grudges, the exact words someone said at a party years ago. The past is not behind you, it is in the next room, and you visit it more often than the people close to you realise."
        ]
      },
      {
        "title": "In Love & Relationships",
        "icon": "💕",
        "paragraphs": [
          "When you fall, you fall completely, and you do not play games because you cannot afford to. You would rather be hurt for being honest than safe for being guarded. That is why people feel looked after around you within a few weeks.",
          "You notice the sigh before the person has said anything. You remember the story they told you in March, you know their snack, their fear, the name of their childhood dog. Your love shows up as small, accurate acts that add up to someone feeling known.",
          "Betrayal does not heal quickly for you. You can forgive in words and still check their phone with your eyes for a year. If someone breaks your trust, they are no longer fighting your anger, they are fighting your memory, and you win those every time.",
          "You spend so much energy on everyone else that you forget you also need looking after. Then you sulk when no one asks how you are, though you spent the evening saying you were fine. A partner who asks twice, and means it, gets the real answer."
        ]
      },
      {
        "title": "Career & Purpose",
        "icon": "🏠",
        "paragraphs": [
          "You are the person who remembers every birthday on the team, notices that the new hire has eaten lunch alone for a week and sends the message that lands at the right moment. Offices run on that, and it is rarely in your job description.",
          "Work that touches home, food, family or healing suits you: real estate, design, cooking, paediatrics, family law, hospitality, care of any kind. You do not just do the job there, you make the client feel they are in good hands.",
          "You are better at business than people expect. Your read on what customers feel, plus a refusal to quit, builds companies around comfort and trust. You are slow to launch and very hard to kill.",
          "What wears you down is carrying other people's pain home at the end of the day. If you do not separate what is theirs from what is yours, you will be the burned-out helper who cannot explain why they are so tired."
        ]
      },
      {
        "title": "Strengths & Gifts",
        "icon": "✨",
        "paragraphs": [
          "You make it safe to feel things. People cry in front of you, confess in front of you and say the awkward true thing in front of you, because they know you will not flinch or tell. That is rarer than talent, and everyone around you has benefited from it.",
          "Your loyalty is not a mood. You show up at the hospital, you celebrate other people's wins without a flicker of jealousy and you are still in touch with friends from fifteen years ago. People you love feel they have been adopted.",
          "You have a vivid inner life that spills into whatever you make, whether it is a story, a room, a meal or a photograph. Strangers feel something looking at it and cannot say why. The reason is that you felt it first."
        ]
      },
      {
        "title": "Shadow & Growth",
        "icon": "🌑",
        "paragraphs": [
          "When you are scared, you start steering people with your feelings. A long sigh, a vague I am fine, a mood that arrives right when someone is about to do something you dislike. You call it sensitivity, but the other person experiences it as pressure.",
          "You are generous and you keep a tally. The favour from six years ago still sits in the ledger, and you will bring it up in an argument without noticing that you have kept the book at all.",
          "You can hold on to a relationship long past its ending because being needed feels like being loved. You take on the sad, the broken, the chaotic, and are surprised to wake up as their only support. Needed and loved are different things, and only one of them is restful.",
          "The turning point comes when you give yourself the care you hand out so easily. Eat properly, say no without a speech, and let someone else be the strong one for an evening without feeling replaced."
        ]
      },
      {
        "title": "Compatibility Quick Guide",
        "icon": "💫",
        "paragraphs": [
          "With Scorpio and Pisces you rarely have to explain yourself. Scorpio notices exactly what you are not saying and stays anyway, which is the thing you have wanted all along. Pisces feels the same weather you do, so evenings together can run on a look and a blanket.",
          "Taurus and Virgo give you what you are always trying to build alone: someone who comes home at the same time and means it. Taurus loves the soft life you create and will cook right back. Virgo fixes the practical problem you were secretly worried about before you mentioned it.",
          "With Aries, Libra and Aquarius you feel the gap. Aries says the blunt thing and moves on while you replay it for a week. Libra charms its way out of the conversation you needed, and Aquarius can be sincerely kind while you sit across from them feeling lonely. These can work, but only if you say what you need out loud instead of waiting to be understood."
        ]
      }
    ]
  },
  leo: {
    "loveStyle": [
      "You love out loud. When you are in, your partner knows it from the text on Tuesday morning, the surprise on Friday and the way you introduce them to every stranger at the party. You would rather be accused of too much than have anyone wonder where they stand.",
      "You need to be seen to feel loved. Not flattery, attention: someone who notices the effort you put into the dinner, the outfit, the plan, and says so. If your partner stops noticing, you do not ask for it. You get louder or colder, and you call it being fine.",
      "You want a love story worth retelling. Public affection, trips, dressing up for a normal Thursday, a partner who is proud to be next to you. Routine without any spark is the one thing that makes you quietly start looking at the exit."
    ],
    "careerStrengths": [
      "You do best where being seen is part of the job: stage, screen, sales, management, teaching, politics, luxury, anything that rewards a person who can walk in and make a room lean forward. Hiding behind a screen all day drains you faster than hard work does.",
      "People work harder for you than for other bosses because you make them feel their work matters. You hand out credit freely, set a high bar and make Monday feel like an event. The team will follow you into a bad plan if you believe in it, which is both your power and your risk."
    ],
    "shadowSide": "The applause is your shadow: you need it more than the work. When you do not get noticed you get dramatic, and when you do get noticed you wonder why it was not louder. You give generously, then feel robbed if nobody says thank you. Pride is the worst part: you would sooner lose a friend than say I was wrong, and you will argue a point you already know is false. The fix is saying I need you or I got that wrong once this month, to one person, before anyone makes you.",
    "lifePurpose": "You are here to learn that you are still enough when no one is clapping. You already know how to light up a room. The real test is whether you will do something generous that nobody ever finds out about. The Leo who grows up stops performing for the crowd and starts using the spotlight to put other people in it.",
    "elementDescription": "People drift toward you at parties without knowing why. You are warm, loud and generous, and you give a room more energy than you take from it. Left unwatched, that warmth turns into a need to be the centre: the same glow that makes everyone feel special tends to dim the moment the attention moves elsewhere.",
    "sections": [
      {
        "title": "Personality Overview",
        "icon": "☀️",
        "paragraphs": [
          "As a Leo, you end up at the centre of things without trying. At a table, in a group chat, on a project, people turn toward you for the verdict, the idea or the joke. You do not apologise for it, and you are quietly annoyed that others do apologise for existing.",
          "You have to make something. A party, a company, a haircut, a speech, a ridiculous birthday present. You cannot let an ordinary moment stay ordinary, and the people around you remember an evening with you long after everything else from that year blurs.",
          "When you turn your full attention on someone, they feel like the only person in the building. It is not an act. You hand out praise, introductions and loyalty with both hands, and people feel richer after twenty minutes with you.",
          "You carry yourself like someone who expects respect, even in sweatpants at a petrol station. People sense it and usually give it. When they do not, you take it far more personally than you let on."
        ]
      },
      {
        "title": "In Love & Relationships",
        "icon": "💕",
        "paragraphs": [
          "Being loved by you is an event. You plan the trip, you tell the table how lucky you are, you turn a normal anniversary into a production. Your partner never has to wonder if you are proud of them.",
          "You want the world to see it. Photos, toasts, the surprise party, the dinner with the good wine. You believe love that is not celebrated is half done, and you can be genuinely hurt when a partner prefers to keep things private.",
          "Your weak spot is feedback. If your partner forgets to notice the effort, you do not ask, you sulk, or start a fight about something unrelated. Then you wonder why the argument was about the dishes when it was really about the compliment.",
          "Loyalty is the line. You give everything, so you expect the same, and if you feel taken for granted you do not shout, you go cold and proud. That coldness can last months, and your partner often never learns what set it off."
        ]
      },
      {
        "title": "Career & Purpose",
        "icon": "👑",
        "paragraphs": [
          "You are built for visibility. Presenting, leading, performing, pitching, hosting: work that puts you in front of people gives you energy rather than taking it. Quiet back-office roles leave you flat by Wednesday.",
          "As a boss you create a culture people brag about. You praise in public, you back your team when it matters and you make hard deadlines feel like a shared adventure. People do overtime for you because they want you to be proud of them.",
          "You make a strong founder. You can sell the vision, gather loyal people around it and dress the brand in your own personality. The risk is that the brand needs you in every photo.",
          "Your career trap is chasing recognition instead of mastery. The titles come easily, but the work that lasts needs boring months of skill-building that nobody applauds. The leaders who last are the ones who learned to enjoy that part."
        ]
      },
      {
        "title": "Strengths & Gifts",
        "icon": "✨",
        "paragraphs": [
          "You make people feel alive. A dull evening becomes a story, a nervous friend feels brave and a shy colleague gets pulled into the conversation by you. Plenty of people feel more confident than they would have been because you spent ten minutes on them.",
          "You are brave in front of an audience. You will perform, speak, post or pitch knowing you might fall flat, and that nerve gives other people permission to try. Your willingness to look foolish is half the reason the people around you ever do anything.",
          "You are generous in a way people remember. You pick up the bill, organise the surprise, gather the group, show up when a friend is in trouble with your sleeves already rolled. You are the one who makes a group feel like a team."
        ]
      },
      {
        "title": "Shadow & Growth",
        "icon": "🌑",
        "paragraphs": [
          "When you are insecure you chase attention. You tell the story louder, steer the conversation back to yourself and get edgy when someone else gets praised. The generosity turns conditional: I did this for you, so notice.",
          "Pride is the real problem. You find it close to impossible to say I was wrong or I need help, so you defend a mistake until the friendship pays for it. Intimacy needs the version of you that is not impressive.",
          "You grow when another person's success stops feeling like a loss. A friend gets the promotion, a colleague gets the applause, and you clap and mean it. That is when you realise your light never depended on theirs being off.",
          "The lessons that change you are rarely the flattering ones. A project that flops in public, a partner who asks you to drop the act, a loss nobody can fix with charm. Those moments strip the show away and leave the person who was always worth knowing."
        ]
      },
      {
        "title": "Compatibility Quick Guide",
        "icon": "💫",
        "paragraphs": [
          "With Sagittarius and Aries you get a partner who can keep up. Sagittarius turns every weekend into a trip and never expects you to dim down. Aries matches your pace and your appetite, and the two of you walk into rooms as a pair people remember.",
          "Libra and Gemini give you an audience that talks back. Libra loves beauty, dressing up and an evening out as much as you do, and lets you be the loud one without a fight. Gemini keeps you laughing and keeps you from getting bored, which is half of what keeps you faithful.",
          "With Taurus, Scorpio and Capricorn you hit friction. Taurus is not impressed and does not pretend to be, which feels like a closed door to you. Scorpio wants control as much as you do, so dinner becomes a negotiation, and Capricorn takes the work seriously enough to leave little room for the show. When these work, they are intense. When they do not, the fights are legendary."
        ]
      }
    ]
  },
  virgo: {
    "loveStyle": [
      "You show love by fixing things. You book the appointment you noticed they kept putting off, reorganise the kitchen, send the article about their back pain. You rarely say I love you first, you just make their life run better and assume they can tell.",
      "Your love is quiet and it builds. You will not sweep anyone off their feet, but by month six you know their coffee order, their sleep habits and what their silence means. The relationship gets deeper the longer you stay, and you are shocked when someone calls that boring.",
      "Your biggest problem is that your care sounds like criticism. You mention the diet, the posture, the way they load the dishwasher, and you mean it as help. Your partner hears I am not good enough, and you are left confused about why your kindness started a fight."
    ],
    "careerStrengths": [
      "You are at your best where precision matters and someone has to get it right: medicine, research, editing, data, accounting, nutrition, project management, quality control. You are the one who reads the contract to the end and finds the line that would have cost everyone money.",
      "You see what is broken in a system faster than anyone in the building, then you quietly fix it. Slow processes, sloppy handoffs, a spreadsheet nobody trusts: you cannot leave them alone. Organisations run because of people like you, though the credit usually goes to whoever presented it."
    ],
    "shadowSide": "The voice in your head that is never satisfied is your shadow. You find the flaw in the dinner, the draft, the holiday and the person, and you start with yourself. Your standards are so high that nothing ever counts as finished, so you redo the report a fourth time and miss the deadline you were trying to protect. It spills out as nagging, then you worry that you are the problem. The fix is shipping the good version, not the perfect one, and seeing the world keep turning.",
    "lifePurpose": "You are here to learn that you are worth something on the days you fix nothing. You already know how to make things better. The real test is whether you can sit with someone who is broken without rearranging them. The Virgo who grows up stops trying to be indispensable and starts letting people love them for free.",
    "elementDescription": "You cannot walk past a crooked picture frame. You work with what is real: lists, routines, a body that needs sleep, a bill that needs paying. Left on its own, that eye hardens into control, and the same steadiness that makes everyone feel safe around you can make the people closest to you feel like projects.",
    "sections": [
      {
        "title": "Personality Overview",
        "icon": "🌾",
        "paragraphs": [
          "As a Virgo, you notice what everyone else walks past. The typo on page 47, the change in someone's voice on the phone, the one ingredient that would fix the dish. Your mind never really switches off, and quietly sorting the world into better and worse is how you relax.",
          "You need to be useful. Not to be thanked, but because a day without improving something leaves you restless. A spreadsheet, a recipe, a friend's CV, someone's sore shoulder: you pick up the problem before anyone has finished asking.",
          "People read your modesty as low confidence, and they are wrong. You know how much there is left to learn, so you keep studying while others have settled. You would rather say I am not sure yet than bluff, and that is why people trust your word.",
          "You worry in advance. Money, health, the thing you said in an email on Thursday, the meeting next month. The planning helps you, and it also means you spend a lot of evenings rehearsing disasters that never come."
        ]
      },
      {
        "title": "In Love & Relationships",
        "icon": "💕",
        "paragraphs": [
          "You will not write poetry, but you will research the best doctor in the city the moment your partner mentions a worry. That is how you say it. The people who learn to hear it find it more convincing than any speech.",
          "You study the person you love. Their habits, their moods, the way their shoulders drop when something is wrong. You turn that knowledge into hundreds of small acts, which add up to someone feeling completely known.",
          "You are hard to live with when you are anxious. The suggestions pile up: eat this, wear that, send the email now. Your partner needs to feel accepted, not optimised, and the sentence that helps most is I like you as you are.",
          "Once you are committed, you stay, and you are steady about it. You do not do dramatic gestures, you do Tuesdays, year after year. That kind of love is slow, and it is what people still talk about at fifty."
        ]
      },
      {
        "title": "Career & Purpose",
        "icon": "🔬",
        "paragraphs": [
          "You read the fine print. You triple-check, you spot the pattern in the numbers and you see the problem three steps before it shows up. In any detail-heavy job that makes you the person everyone quietly relies on.",
          "Health and the body pull you in. Medicine, nutrition, therapy, physiotherapy, wellness: you combine care with analysis, and you are the practitioner who actually reads the chart and asks the second question.",
          "Editing, research, data and quality assurance reward your eye for flaws. You rise to the top of those fields because you will not let sloppy work pass, not even your own.",
          "Your trap is staying in the supporting role. You do the work, someone else presents it and you tell yourself that is fine. Ask for the title, the raise and the credit, and do it before your resentment writes the email for you."
        ]
      },
      {
        "title": "Strengths & Gifts",
        "icon": "✨",
        "paragraphs": [
          "You make things better. You walk into a messy project, a stalled plan or a tired friend and by the end of the week it works. Most people settle for good enough, and you are the reason things around you are not.",
          "Your help is real. You do not do it for applause, you do it because the problem is in front of you and you can solve it. Friends and colleagues lean on you without noticing, because you never made them feel like a burden.",
          "You prefer the truth to the comfortable version, and that includes the truth about yourself. You question your own opinions, change your mind when the facts change and tell people what is actually going on. In a noisy world, that is rarer than talent."
        ]
      },
      {
        "title": "Shadow & Growth",
        "icon": "🌑",
        "paragraphs": [
          "When you are stressed, standards become a weapon. Nothing is good enough, nobody does it the right way and you are the harshest critic in the room, aimed first at yourself. You can finish something brilliant and spend the evening listing what was wrong with it.",
          "Anxiety is your usual weather. Your analytical mind turns inward at night and produces health scares, money maths and replays of conversations from last Tuesday. Without a walk, a routine or a person to say it aloud to, the worry sits in your stomach and stays.",
          "You grow when you accept the finished, flawed version. A project that ships beats one that is perfect in your drawer, and a person feels loved when you stop correcting them. Your worth was never tied to how much you got done today.",
          "Learning to receive is the hardest part. When someone offers help, a compliment or a gift, you deflect, return it or offer something back at once. Let it land. Accepting is how you tell someone they matter to you."
        ]
      },
      {
        "title": "Compatibility Quick Guide",
        "icon": "💫",
        "paragraphs": [
          "With Taurus and Capricorn you finally have someone who works as hard as you do. Taurus is patient, sensual and devoted, and slows you down enough to enjoy the dinner you cooked. Capricorn respects your standards and has its own, so the two of you quietly build something that lasts.",
          "Cancer and Scorpio give you the depth you pretend you do not want. Cancer makes home soft enough that you finally stop scanning for flaws. Scorpio sees past your composure, is fascinated by it and pulls out a passionate side you rarely let anyone see.",
          "Sagittarius, Gemini and Aquarius test you. Sagittarius forgets the booking and laughs about it, which sets off your inner auditor. Gemini changes the plan three times and you feel unheard, and Aquarius is warm but distant while you wait for a clear answer. It works if you stop correcting them and they stop vanishing."
        ]
      }
    ]
  },
  libra: {
    "loveStyle": [
      "You treat love like something worth making beautiful. You pick the restaurant, you notice the lighting, you remember what they said about their sister three weeks ago. Dating you feels like being looked after by someone with taste, and you are quietly hurt when nobody comments on the effort.",
      "You do not feel finished on your own, and you know it. That is why you check how your partner feels before you decide anything, even where to eat, and why a relationship where you feel level with the other person matters more to you than one where the sparks are bigger. Unequal love makes you restless faster than boredom does.",
      "You keep courting people long after they have stopped courting you. The anniversary card, the surprise booking, the small gesture on a flat Tuesday are all you. The catch is that you keep score without ever saying so, and one day the unspoken ledger comes out in a single sentence nobody saw coming."
    ],
    "careerStrengths": [
      "You are at your best where taste and people skills meet: law, mediation, design, fashion, curation, PR, counselling. In any of them you are the one who walks into a tense meeting and leaves with a deal both sides think was their idea. Ugly offices and cold teams drain you faster than long hours do.",
      "Your real edge is that you can state the other side's case better than they can, and people trust you for it. That is why you end up as the negotiator, the team lead nobody resents, the person who gets pulled into every dispute. It also means you get handed the awkward job of telling someone no, and you dread it every time."
    ],
    "shadowSide": "Your shadow is the mask you wear to keep the peace. You agree with the loudest person in the room, say it is fine when it is not, and nod along to opinions you would never choose, then go home annoyed at people who never knew what you really thought. You call it keeping things pleasant. In practice you are lying by omission and building resentment that eventually comes out sideways, in a cold remark or a sudden exit. The fix is not to become blunt. It is to say the unpopular thing once, early, while it is still small.",
    "lifePurpose": "You are here to learn that peace and honesty are not enemies. You already know how to make a room comfortable. The harder lesson is that a fair outcome sometimes means picking a side and being disliked for it. When you grow into it, you stop managing everyone's feelings and build relationships that can survive an argument.",
    "elementDescription": "Air is why you can read a room in thirty seconds and know who is annoyed, who is being ignored and who is about to say something they will regret. You think before you feel, talk through problems before you sit with them, and stay light on your feet when things get heavy. Left unchecked, that lightness turns into floating: you discuss every option and never land on one, and people close to you start to wonder where you actually stand.",
    "sections": [
      {
        "title": "Personality Overview",
        "icon": "⚖️",
        "paragraphs": [
          "You notice what is off before anyone says a word. The seating plan that leaves one person stranded, the joke that landed badly, the decision that is quietly unfair to somebody: your stomach registers it first and you start repairing it without being asked.",
          "Beauty and fairness are the same thing to you. A scruffy, badly organised, one-sided situation makes you physically uncomfortable, which is why you rearrange the room, fix the wording of the email and step in when somebody is being talked over. You would rather spend an hour making something right than ten minutes tolerating it wrong.",
          "You walk into a gathering and map it in minutes: who is allied with whom, where the tension sits, who needs a way in. You use it kindly. You introduce the shy person, you steer the conversation away from the landmine, and people leave feeling better and rarely work out why.",
          "The warmth is real, which is what confuses people. You are not performing interest, you do like people. But you also like being liked, and when those two get tangled you will soften an opinion until it says nothing at all."
        ]
      },
      {
        "title": "In Love & Relationships",
        "icon": "💕",
        "paragraphs": [
          "You are happiest in a pair. Not because you cannot function alone, but because things only seem fully real when you have someone to share them with. You plan the dates, you set the table properly, and you want the relationship to look as good as it feels.",
          "You remember the details other people drop: the anniversary, the favourite song, the thing they said they were scared of. Partners feel adored by you. The risk is that you keep giving this attention while expecting the same back, and when it does not come you say nothing and just give slightly less.",
          "You bend. First it is the film choice, then the holiday, then the opinion about their friends that you quietly swallowed. A year later you are not sure what you like anymore, only what keeps things smooth. A relationship with two complete people in it is the only kind that will actually satisfy you.",
          "Arguments scare you more than they should. You go silent, change the subject or apologise for things that were not your fault just to end the tension. The problem stays, grows teeth, and shows up three months later as a cold shoulder that confuses your partner, because as far as they knew you were fine."
        ]
      },
      {
        "title": "Career & Purpose",
        "icon": "🎨",
        "paragraphs": [
          "You do your best work where people and taste meet. Give you a client, a brief and a room that looks good, and you will find the version everyone can live with. You are the person the team quietly sends in when two colleagues stop speaking.",
          "Law, mediation and negotiation suit you because fairness is personal to you, not abstract. You can sit across from someone you disagree with and still make them feel heard, which is exactly what settles disputes. Opposing sides often leave preferring you to their own lawyers.",
          "Design, fashion, curation, music and interiors give you somewhere to put your eye for proportion. You notice the margin that is two pixels off and the colour that almost works. Clients may not know why your work feels right, but they come back for it.",
          "Your career stalls on decisions. You weigh every option, ask three more people, then wait for a clear signal that never arrives while the opportunity goes to someone less thoughtful and more willing. You earn more respect the first time you decide on incomplete information and say so out loud."
        ]
      },
      {
        "title": "Strengths & Gifts",
        "icon": "✨",
        "paragraphs": [
          "You can find the middle of a fight that looks unwinnable. You hear both sides, spot what each is actually afraid of, and propose something that lets everyone leave with dignity. That is a rare skill and you use it so casually you forget it is one.",
          "You push for fairness longer than anyone expects. You will email the manager about the colleague who was passed over, go back to the shop about the wrong charge and speak up for the person nobody else noticed. You do it with charm and good arguments instead of volume, which is why it works.",
          "You make places better just by being in them. The flat, the office, the family gathering all improve once you have rearranged a few things and softened the mood. You believe people deserve to live somewhere that looks and feels good, and you act on that every day without being asked."
        ]
      },
      {
        "title": "Shadow & Growth",
        "icon": "🌑",
        "paragraphs": [
          "You turn into a mirror. With one friend you are outraged about the boss, with another you defend the boss, and neither has heard what you truly think. It feels like diplomacy while you are doing it. Afterwards it feels like having no face of your own.",
          "Your indecision is not laziness. You can see the merits and the costs of every option, so every choice feels like losing something. Dinner takes forty minutes, the flat takes six months, and the answer you wanted is usually the one you gave the first thirty seconds.",
          "Growth for you is tolerating a bad mood in the room. Say the unpopular thing, let the silence sit, and notice that you are still alive and the friendship is still there. Each time you survive being disliked a little, the next honest sentence costs less.",
          "You also need time alone more than you think. In a relationship you slip into who the other person needs, and the only way to find out who you are without them is to spend an evening by yourself and notice what you actually want to do. That version of you makes a much better partner."
        ]
      },
      {
        "title": "Compatibility Quick Guide",
        "icon": "💫",
        "paragraphs": [
          "With Gemini and Aquarius, conversation never runs dry. A Gemini keeps you laughing and curious, and you can talk until three in the morning without noticing. An Aquarius shares your sense of how things should be fairer, and the two of you can spend a whole evening redesigning the world. Just watch the habit you share of discussing feelings instead of having them.",
          "Leo and Sagittarius bring a warmth that makes you feel bigger. A Leo loves the glamour and attention you give back, so you end up the golden couple at every party. A Sagittarius tells you the truth you have been avoiding and drags you toward trips and ideas you would never have booked yourself.",
          "Cancer and Capricorn take more work. A Cancer feels everything loudly and you shut down to cope, which reads to them as not caring. A Capricorn shows love through practical help while you want romance and words, so each of you feels short-changed. Aries tends to clash with your need to talk it through, because they want a decision now and you want everyone to be okay with it first."
        ]
      }
    ]
  },
  scorpio: {
    "loveStyle": [
      "You do not do casual, and you cannot fake it. When you commit, you give someone the real you, including the parts you have never told anyone, and you expect the same in return. Small talk over dinner bores you; the question you want answered is what they are afraid of.",
      "You want a partner who will go into the hard places with you: the family wounds, the old betrayals, the thing you did at nineteen. You are not interested in a relationship that stays comfortable and shallow. If it never gets tested, part of you assumes it is not real.",
      "Trust with you is earned slowly, through a long run of small honest moments. Once someone breaks it, you may say you forgive them, but you keep the record. You loved them completely, so the damage lands completely, and they usually sense the temperature change before you say a word."
    ],
    "careerStrengths": [
      "You are drawn to work where the truth is hidden and someone has to dig for it: psychology, investigation, research, surgery, finance, strategy, crisis management. Give you a mess nobody else wants to open and you will be the one still reading at midnight, because you cannot leave a puzzle alone.",
      "You see the real motive behind the stated one. You notice who is quietly undermining the project, which number in the report does not add up, and which client is already halfway out the door. Colleagues call it uncanny. You call it paying attention."
    ],
    "shadowSide": "Your shadow is control. Because you fear being betrayed, you test people: you go quiet to see who notices, you hold back information to see who asks, you read their phone in your head even if you never touch it. Then the tests make them pull away, which feels like proof you were right all along. At your worst you use what you know about someone against them, and you punish with silence rather than say you were hurt. The fix is to say the vulnerable sentence out loud before the test starts: I got scared when you did that.",
    "lifePurpose": "You are here to learn that holding on tightly and being powerful are not the same thing. You have already survived things that would have flattened other people. The real test is whether you can trust someone with the soft parts and still be there if they fail you. Grown up, you use what the dark taught you to help somebody else through theirs.",
    "elementDescription": "You feel the thing underneath the thing. You pick up the mood in a room before anyone has spoken, you know a lie from the way a sentence is built, and you carry feelings quietly for years. Left alone, all that depth stays underground: you say fine, mean something else, and the people who love you spend years guessing what actually happened.",
    "sections": [
      {
        "title": "Personality Overview",
        "icon": "🦂",
        "paragraphs": [
          "As a Scorpio, you want the truth, and you will wait a long time for it. You read people the way other people read menus. Within minutes of meeting someone you know whether they are being straight, what they want from you and what they are hiding, and the unsettling part is that you are usually right.",
          "You cannot stand pretending. Fake enthusiasm, polite lies and performed emotions make your skin crawl, so you go quiet or leave. You would rather sit through an uncomfortable honest conversation than spend an evening in a pleasant lie.",
          "You feel everything at full volume and show about a tenth of it. From the outside you look calm, even cold, while inside you are replaying a comment from last Thursday. The people closest to you eventually learn that your silence is not empty. It is full.",
          "People are drawn to you and cannot explain why. You do not chase attention, you hold back, and that restraint is exactly what makes them lean in. You get asked for advice by people you barely know, and you tend to give it with a directness that either helps them enormously or sends them home furious."
        ]
      },
      {
        "title": "In Love & Relationships",
        "icon": "💕",
        "paragraphs": [
          "You fall in or you do not. There is no lukewarm setting. When it is real, it takes over: you think about them constantly, you want to know everything, and you feel it physically when they pull back even a little.",
          "What you want most is total transparency. You want the unedited version of your partner, the fears they have told nobody and the opinion they would never post online. In return, you open up in a way almost no one gets to see, and you quietly measure whether they treat that gift with care.",
          "Intimacy is where you speak truths you cannot manage in words. Physical closeness is not a side dish for you, it is how you check whether the connection is real, and distance in the bedroom registers as distance everywhere.",
          "Your hard edge is the testing. You pick a fight to see if they stay, you mention an ex to see if they flinch, you withdraw to see if they chase. It feels like protection, but it exhausts people, and the ones who pass the first test are often worn out by the fifth. The relationship you want only becomes possible when you stop auditing it."
        ]
      },
      {
        "title": "Career & Purpose",
        "icon": "🔍",
        "paragraphs": [
          "Put you on a problem everyone else has given up on and you come alive. Failing departments, tangled finances, cases with missing pieces: you will dig until the pattern shows. People call you when it is serious.",
          "Psychology, forensics, investigative work, research and surgery all suit you because you are comfortable with what makes others look away. Illness, secrets, grief and risk do not unsettle you. You can sit with a person at their worst and keep thinking clearly.",
          "You are also good with money and leverage. You read the other side in a negotiation, hold your composure when they push and know what you will walk away from before you sit down. Investors and strategists with half your patience tend to lose to you.",
          "Where you go wrong is disappearing into the work. You hold your cards close, share information late and let colleagues feel shut out or slightly afraid of you. The projects you lead run better and last longer when people feel they are inside the circle, so tell them what you are thinking before they hear it second-hand."
        ]
      },
      {
        "title": "Strengths & Gifts",
        "icon": "✨",
        "paragraphs": [
          "You can come through the worst year of your life and rebuild. A breakup, a firing, a death in the family: you go under, you stay down longer than people realise, and then you come back different and clearer. Others watch and wonder where you find it.",
          "Your loyalty has no half measures. If you are in someone's corner, you stay there when it costs you, when it is boring and when everybody else has left. People you have backed will tell you years later that you were the only one who showed up.",
          "You say what others are too polite to say. When the whole group is circling around the real issue, you name it in one calm sentence. It can sting, but it also ends the pretending, and plenty of people have thanked you for it long after they stopped being angry."
        ]
      },
      {
        "title": "Shadow & Growth",
        "icon": "🌑",
        "paragraphs": [
          "You file things away. The remark at a dinner party in 2019, the favour that was not returned, the friend who cancelled twice: you remember them all, and some part of you is quietly keeping the ledger. Used badly, what you know about people becomes leverage, and silence becomes the punishment.",
          "Grudges cost you more than anyone else. You can spend years rehearsing a conversation with someone who has long since moved on, while it poisons your mood, your sleep and the new relationships that never stood a chance against the old injury.",
          "The growth is surrender, and you hate the word. It means telling someone you need them before you know how they will react, letting a plan fall apart without trying to control the pieces, and accepting that trust sometimes gets broken. It also means you are still standing afterward, which you already know from experience.",
          "Crisis tends to be your teacher. When your life falls apart, you stop managing the image and start telling the truth, and you often emerge from the wreckage freer than you went in. You do not have to wait for disaster, though. Letting go on purpose, while things are calm, is a lot cheaper."
        ]
      },
      {
        "title": "Compatibility Quick Guide",
        "icon": "💫",
        "paragraphs": [
          "With Cancer and Pisces you can finally stop translating yourself. A Cancer picks up on your moods without being told and protects you as fiercely as you protect them. A Pisces sits with you in the deep end, in long silences and half-finished sentences, and you do not have to explain why it matters.",
          "Virgo and Capricorn give you something to lean on. A Virgo notices the details you notice and brings calm and practicality when you spiral. A Capricorn respects your drive, matches your patience and treats loyalty as seriously as you do, so the two of you build things that last.",
          "Leo and Aquarius are harder. A Leo wants to be adored by a roomful of people, and you end up jealous, watching, and pretending you are not. An Aquarius needs space and cool distance, which feels to you like being quietly rejected, so you push for closeness and they pull away. Gemini often runs into the same wall, because their light, ever-changing attention never gives you the depth you need."
        ]
      }
    ]
  },
  sagittarius: {
    "loveStyle": [
      "You want a best friend you also cannot keep your hands off. Someone who will say yes to the road trip, argue about religion at 2am and eat something strange in a country neither of you can pronounce. If the relationship turns into a routine of the same takeaway on the same sofa, part of you starts planning an exit without admitting it.",
      "Freedom is not up for negotiation. You need your own friends, your own plans and the knowledge that the door is open. A partner who checks in too often or sulks about your weekend away finds you getting quieter and then, one day, you are simply gone.",
      "You are the one who makes your partner laugh until they cry, tells them the truth when it is inconvenient and honestly believes the two of you can handle anything. That confidence is the gift. The cost is that you sometimes say the true thing at the worst possible moment and wonder why they are upset."
    ],
    "careerStrengths": [
      "You need work that has room in it: teaching, publishing, travel, international business, coaching, anything where you are learning and moving. A desk, a script and the same 9am meeting every week will slowly flatten you. Give you a mission and a long leash and you will outwork people who are twice as disciplined.",
      "Your gift is that you make other people believe it is possible. You see the opening while everyone else lists the obstacles, and your enthusiasm is the kind teams actually follow. Students, clients and colleagues come away from a conversation with you feeling bigger than when they arrived."
    ],
    "shadowSide": "Your shadow is the exit. You say yes before checking your diary, promise the project by Friday with total sincerity, and then slide away when it gets dull or heavy. You joke when someone needs you serious, travel when you should stay, and call it honesty when you tell a friend exactly what is wrong with them. People forgive the first few times, then quietly stop relying on you. The fix is to finish one thing a year past the point where it stops being fun.",
    "lifePurpose": "You are here to learn that freedom and commitment can live in the same life. You have no trouble starting over somewhere new. The real test is staying through the dull middle, the hard conversation or the year when nothing exciting happens. The Sagittarius who grows up stops collecting experiences and starts working out what they were for.",
    "elementDescription": "You walk in with an idea and leave with three people convinced it will work. You say yes first, work out the details on the way, and recover from disappointment faster than seems decent. Left untended, that habit spreads thin: you light a dozen projects, burn through your goodwill with the people who counted on you, and move on while the smoke is still in the room.",
    "sections": [
      {
        "title": "Personality Overview",
        "icon": "🏹",
        "paragraphs": [
          "As a Sagittarius, you book the ticket first. You sign up for the course on a whim, quit the job after one conversation on a hike, and decide the next chapter of your life before you have worked out how it pays. Staying put feels like missing something.",
          "You are not satisfied with how things work. You need to know why. Under the jokes and the plans sits a mind that keeps asking what this is all for, and you will happily lose a whole night to a conversation about meaning, God, money or where the world is heading.",
          "You really do expect things to work out. You assume strangers are decent, that setbacks are temporary and that next year will be bigger. Plenty of people mistake this for naivety, but you have been knocked down and kept the belief anyway, which is the part they miss.",
          "You cannot sit still, in body or in head. A week of routine and you start itching: new city, new book, new obsession. The restlessness gets you into places others never see. It also leaves a trail of half-finished things behind you."
        ]
      },
      {
        "title": "In Love & Relationships",
        "icon": "💕",
        "paragraphs": [
          "You are the one who swears you are not ready to settle and then falls for someone completely. The fear is never the person, it is the cage. If the relationship feels like open road, you will commit more deeply than anyone expected, yourself included.",
          "What you want is a co-pilot. Someone to take the cheap flight with, stay up debating whether free will exists and say yes when you suggest driving to the coast at midnight. Shared adventures are what bond you, much more than shared furniture.",
          "You tell the truth, always, and fast. If your partner's new haircut is a mistake or their friend is bad news, they will hear it from you over breakfast. Some people find this a relief after years of polite fiction. Others are crushed, and you need to learn that being right does not excuse the delivery.",
          "The danger point comes when the novelty fades. You catch yourself wondering what else is out there, scrolling through other lives, getting short with someone who has done nothing wrong. What you are missing is almost always depth, not distance, and it only shows up if you stay."
        ]
      },
      {
        "title": "Career & Purpose",
        "icon": "🌍",
        "paragraphs": [
          "You need your work to mean something. A good salary alone will not hold you for more than a year or two. You do your best when the job feeds your mind, keeps you moving and lets you tell people why it matters.",
          "Teaching, writing, publishing and speaking suit you because you can take a huge idea and make it land. You explain things in stories, throw in a joke at the right moment and send people away thinking differently. Students and readers remember you decades later.",
          "Anything international is a natural fit: import and export, travel writing, development work, languages, cultural consulting. You are curious about how other people live and you move between cultures without making them feel judged.",
          "Your weak spot is the launch with no plan. You say yes to three projects, announce a fourth and hit a wall when the admin arrives. You succeed when you pair your vision with one dull, reliable partner or system that makes sure things actually ship."
        ]
      },
      {
        "title": "Strengths & Gifts",
        "icon": "✨",
        "paragraphs": [
          "You see the way through while everyone else is staring at the wall. When a project collapses, you are already asking what we could try instead. That is not empty cheerfulness, it is a habit of finding exits that other people have not noticed yet.",
          "Your humour gets people through the worst days. You find the absurd angle on a funeral, a layoff or a failed exam, and the room breathes again. You are not dodging reality, you are making it bearable enough to deal with.",
          "You are one of the few people who can sit with someone from a completely different background and find common ground. Your curiosity is real, so people tell you things they would not tell others. In a loud, divided world, that openness is worth more than you give yourself credit for."
        ]
      },
      {
        "title": "Shadow & Growth",
        "icon": "🌑",
        "paragraphs": [
          "When things get heavy, you vanish. You stop replying, plan a trip, crack a joke instead of answering the serious question. Friends have learned you are brilliant company at a party and hard to find on the day they actually need you.",
          "Your honesty can turn into a weapon. You call it saying it like it is, but sometimes it is just saying the sharpest version you can think of, because being right feels good and being kind takes effort. People remember the sting longer than the point.",
          "Depth is the adventure you keep avoiding. Staying with one person, one craft or one hard season until it opens up is as exciting as any new country, though it does not feel that way in month three. Push through month three once and you will see what you have been missing.",
          "You grow when life pins you down. A partner in crisis, a project that takes years, a problem that cannot be outrun: those are the moments when you stop being a person with great stories and become a person others can build their lives on."
        ]
      },
      {
        "title": "Compatibility Quick Guide",
        "icon": "💫",
        "paragraphs": [
          "With Aries and Leo, the energy matches yours. An Aries will say yes to every wild plan, race you to the top of the hill and not take it personally when you disappear for a week. A Leo gives you generosity, laughs at your jokes and makes every ordinary night feel like a celebration.",
          "Libra and Aquarius give you air to breathe. A Libra loves your big talk, balances your bluntness with some tact and never makes you feel caged. An Aquarius lets you be independent, shares your sense that the world could be better and will argue with you for hours without it turning into a fight.",
          "Virgo, Pisces and Taurus take more effort. A Virgo wants the plan and the details, and you feel supervised. A Pisces feels everything and you say the wrong thing without noticing, then watch them go quiet. A Taurus wants you home on Friday and you want to be in another country, so someone eventually has to give."
        ]
      }
    ]
  },
  capricorn: {
    "loveStyle": [
      "You do not date for fun, and you can tell within a few weeks whether someone has a future with you. If they do not, you end it politely and move on, which makes you look cold to people who thought it was going somewhere. If they do, you start planning: the flat, the savings, the year after next.",
      "You say it with actions. You fix the leaking tap, remember the dentist appointment and turn up when you said you would. Then you wonder why your partner still asks if you love them, when you thought the answer was obvious from the spreadsheet you built for the holiday.",
      "Warmth comes late with you. The first months can feel reserved, even stiff, and the person who stays through that gets the version nobody at your work has met: the dry joke in bed, the soft voice, the hand that reaches for theirs under the table. You hand that out slowly because you have been burned by people who took it too fast."
    ],
    "careerStrengths": [
      "You are the person people quietly hand the keys to. Give you a mess and a deadline and you produce a plan, a list of who does what, and a result that holds up in a year. Finance, law, engineering, management and anything with a hierarchy to climb suits you because you are happy to be responsible when others dodge it.",
      "You play a longer game than the people around you. While colleagues chase this quarter's number, you are working on where you want to be in five years, and you will accept a boring two years to get there. That patience is why you so often end up above the people who started out faster."
    ],
    "shadowSide": "Your shadow is the scoreboard. You tell yourself you will rest, call back, take the holiday and enjoy things once the next goal is done, and the next goal always arrives. Under stress you go cold and practical, answer feelings with solutions and treat a partner's sadness like a task you are failing. You can end up respected, well off and quietly lonely, wondering when exactly everyone stopped telling you things. The way out is not to want less. It is to put one thing in the diary each week that has no result attached to it.",
    "lifePurpose": "You are here to learn that you can be trusted without being impressive. You have spent years earning respect through competence, and it worked, but it also taught you to hide anything that looks like need. The test is whether you will let one person see you struggle and stay. Grown up, you use your authority to make it easier for others to climb, not to prove you got there alone.",
    "elementDescription": "Your feet stay on the ground when everyone else is excited. You trust what you can count, test and build, and you would rather be right in a year than impressive today. That steadiness is why people lean on you. It is also why you keep missing the moments that could not be planned: you were busy making sure the foundations were sound while the party happened.",
    "sections": [
      {
        "title": "Personality Overview",
        "icon": "🏔️",
        "paragraphs": [
          "You treat your life like a project with a long timeline. You know roughly where you want to be in ten years, and you quietly check each month whether you are on schedule. Other people call that intense. To you it is just having a plan.",
          "You want respect, and you want the kind that has to be earned. Flashy praise leaves you cold, but one person saying that your work is solid can keep you going for a week. So you take the harder route on purpose: more hours, more checking, more years of being reliable before you ask for anything.",
          "Your humour is the best-kept secret about you. You sit through a whole meeting looking serious, then drop one flat line that makes the room fall apart, and you do not even smile. People who only know you from work are always surprised to find out how funny you are.",
          "A lot of you was built in hard years. Maybe money was short, maybe you had to be the grown-up early, maybe nobody was coming to help. You learned to wait, to save, to rebuild from nothing, and you carry a private belief that you can survive anything. It is true, and it is also why you find it so hard to ask for help."
        ]
      },
      {
        "title": "In Love & Relationships",
        "icon": "💕",
        "paragraphs": [
          "In love you are far softer than anyone at work would guess. You are loyal to a fault, you remember what your partner said in passing three months ago, and you show up with the thing they mentioned they needed. You just do it without announcing it.",
          "You do not do casual. You size up a relationship the way you size up a job offer: where does this go, and can we build on it? If the answer is nowhere, you lose interest fast. If the answer is yes, you commit completely and begin making plans before your partner has said the word serious.",
          "The hard part for the person who loves you is waiting. You open up slowly, you say I love you less than they would like, and when you feel something big you tend to go quiet and practical instead of saying it. Someone who needs constant reassurance will feel starved by you, even though you are showing love every single day in ways they are not counting.",
          "Affection with you improves with time. Early on you hold back and watch, and then trust builds and a warm, sensual, surprisingly playful person shows up. Plenty of your exes only ever met the guarded version because they left before the guard came down."
        ]
      },
      {
        "title": "Career & Purpose",
        "icon": "🏛️",
        "paragraphs": [
          "You are built for responsibility. Put you in charge of a budget, a team, a build or a case and you get steadier as the stakes rise. Business, finance, law, government, architecture and engineering reward exactly the habits you already have.",
          "You do not look for shortcuts and you do not trust the ones other people find. You would rather spend three years becoming undeniably good than one year becoming briefly famous. Your career tends to look slow from the outside and then suddenly look inevitable.",
          "You lead by doing the work better than anyone, and by holding standards that make others rise or leave. You are not the loudest in the room. People follow you because when you say something will be done, it is done, and they have seen you stay late to make sure.",
          "The trap is that your job becomes the only place you feel like a person. You answer a quiet evening with more work, then wonder why your friends stopped calling and your body started complaining. If your whole sense of worth sits on your title, a bad quarter feels like a bad life."
        ]
      },
      {
        "title": "Strengths & Gifts",
        "icon": "✨",
        "paragraphs": [
          "You build things that last. Your savings, your reputation, your friendships and your work all grow slowly and hold up when storms hit. When everyone else is panicking, you are the one who already made a backup plan.",
          "You can do without a reward for years. Most people quit when results are slow, but you will keep showing up for months of dull effort because you can see the finish line they cannot. That is the single biggest reason you out-last people more talented than you.",
          "You are the adult in the room, and people feel relieved when you walk in. You keep projects realistic, expectations honest and money accounted for. Friends call you when things fall apart, because you will sort it out without a lecture."
        ]
      },
      {
        "title": "Shadow & Growth",
        "icon": "🌑",
        "paragraphs": [
          "Your shadow is trading everything for progress. You skip the birthday, cancel the holiday, ignore the sore back and promise yourself you will catch up later. Later never comes, because the next target is already waiting, and the people who loved you have learned to stop planning around you.",
          "You expect the worst so you cannot be caught off guard, and it works, in the sense that you are rarely disappointed. The price is that you are rarely delighted either. You talk friends out of risky ideas, hear every plan as a list of ways it can fail, and then notice the room has gone quiet.",
          "Growth starts when you let someone see you not coping. Tell one person you are struggling, ask for a favour without offering one back, cry in front of somebody. Each time, the thing you feared, that they would think less of you, does not happen.",
          "Learn to waste time on purpose. Spend an afternoon on something with no output, be bad at a hobby, laugh until you cannot breathe. For a person like you that feels like breaking a rule, and it is the quickest way to feel young again."
        ]
      },
      {
        "title": "Compatibility Quick Guide",
        "icon": "💫",
        "paragraphs": [
          "With Taurus and Virgo you relax. You do not have to explain why you check the numbers twice or why you hate being late. With a Taurus you build a comfortable, well-fed life and nobody rushes the other. With a Virgo you trade standards, and you both quietly get better at what you do.",
          "Pisces and Scorpio give you what you do not go looking for. A Pisces makes you soft and imaginative and does not mind when you say nothing, and you in turn keep their feet on the floor. A Scorpio matches your intensity and your patience for long plans, and with them you get someone who sees through your composed face and does not flinch.",
          "Aries, Libra and Leo are where it gets harder. An Aries acts before you have finished the plan and you end up cleaning up. A Libra takes forty minutes to choose a restaurant and spends your Friday talking about people you do not know. A Leo wants praise out loud, and you feel it should be obvious. It can work if you stop treating their pace as a flaw and let them pull you out of your routine now and then."
        ]
      }
    ]
  },
  aquarius: {
    "loveStyle": [
      "You want your partner to be your best friend first. The person you fall for is the one who can talk to you until 3am about a strange idea and still make you laugh in the morning. Grand romantic gestures leave you a bit embarrassed, but a partner who says something that rearranges how you see the world gets your full attention.",
      "You need room, and you get tense when you do not have it. It is not about wanting anyone else. You just need hours where nobody is waiting for you to say something, your own friends, your own projects. The moment a partner wants every evening together, you start finding reasons to be elsewhere and cannot explain why.",
      "When you love someone, you love their weird parts. You are drawn to the person who dresses oddly, believes unusual things or does not fit anywhere, and you never try to fix them. People who have been loved by you often say it was the first time they stopped performing."
    ],
    "careerStrengths": [
      "You do best where nobody has written the rulebook yet. Technology, science, research, activism, psychology, non-profits and any job where you can say this is broken and here is another way keep you awake. In a role where you just follow the process, you are bored and slightly rebellious within a month.",
      "You see the answer that other people dismiss, and it is often right a few years too early. You suggest the odd idea in a meeting, get polite nods, and then watch a competitor do it later. The skill is not being ahead. It is staying around long enough for the world to catch up, and learning to explain it in plain words."
    ],
    "shadowSide": "Your shadow is being right from a distance. You care about the cause, the future, the people who are not in the room, and you are strangely slow to text the actual person who is. When a feeling gets too close you turn it into an idea, explain it beautifully and walk away unchanged. You also disagree out of reflex, sometimes just because everyone else agreed. The result is people who admire you and do not feel they know you. The fix is small and annoying: answer one personal message today before you think about the planet.",
    "lifePurpose": "You are here to learn that the future you imagine has to include people you actually know. You have never struggled with ideas. The test is whether you can stay in a room when someone is crying and not reach for a theory. The Aquarius who grows up stops needing to be the odd one out to feel real, and changes the world a little by being fully there for one person at a time.",
    "elementDescription": "Your mind is the room you live in. You sit slightly above a situation, watch the pattern, and often understand it before anyone else has finished panicking. That distance is why people bring you their problems and why you can stay calm in a crisis. It also means you can be at a funeral, thinking about how rituals work, while everyone around you is just sad.",
    "sections": [
      {
        "title": "Personality Overview",
        "icon": "⚡",
        "paragraphs": [
          "As an Aquarius, you look at how things are done and immediately ask why. Rules that exist only because they have always existed bother you physically. You are not trying to be difficult. You just can't pretend that a dumb system is sensible because everybody has agreed to ignore it.",
          "You want the world to work better, and you mean it in a practical way. You sign the petition, explain the issue to your friends, build the thing that fixes the thing. You will defend a stranger's right to be different, even when it costs you a friendship.",
          "Give you an order and watch what happens. You push back before you have even thought about whether the instruction is reasonable. Being managed, labelled or told to settle down makes you dig in. That is what makes you the first to try something new, and also the person nobody can get to change their mind in an argument.",
          "Here is the contradiction you live with. You will organise a fundraiser for thousands and forget your mum's birthday. You are loyal to humanity and awkward with the person at the next desk. You are not a hypocrite, but it can look that way to people who wanted a text from you, not a cause."
        ]
      },
      {
        "title": "In Love & Relationships",
        "icon": "💕",
        "paragraphs": [
          "Attraction starts in your head. A good conversation does more for you than a good outfit. You can be hooked by someone you barely find physically striking because they said something nobody has said to you before, and bored within weeks of someone beautiful who agrees with everything.",
          "You want a partnership between two full people, each with their own friends, interests and strange hobbies. You are not shopping for someone to complete you. If a partner has no life of their own, you quietly start to feel responsible for them and that feeling makes you want to run.",
          "When your emotions get big, you describe them instead of feeling them. You can say exactly why you are upset in a calm paragraph while your partner sits there wanting you to just cry or yell. They end up feeling like they are talking to a very smart wall. What helps is a partner who waits without cornering you.",
          "You are almost never jealous, and you do not check phones or ask where anyone has been. You give people room to live and expect the same back. If a partner honours that, the relationship runs on trust most couples never get to."
        ]
      },
      {
        "title": "Career & Purpose",
        "icon": "🔮",
        "paragraphs": [
          "You belong at the front of whatever is changing. Tech, research, social causes, psychology and non-profit work let you spend your days on the next idea instead of defending the last one. If your job is to maintain something that works, you will be itching to change it by Thursday.",
          "Your edge is that you do not stay inside the usual frame. You find the fix in an unrelated field, or you point out that the question itself is wrong. People sometimes dismiss it at first. You often turn out to be early rather than wrong, which is a lonely thing to be for a few years.",
          "You are also good with groups that care about something. You can gather people around a cause, explain it simply and keep them going, and you treat the intern the same as the director. Communities, campaigns and movements tend to find you.",
          "Where you fall down is teamwork. Once you believe in your idea, you stop listening to the colleague who has done this for fifteen years and tells you why it will not work. Sometimes they are right. You go furthest when you learn to take the useful half of the criticism without feeling you have lost."
        ]
      },
      {
        "title": "Strengths & Gifts",
        "icon": "✨",
        "paragraphs": [
          "You live a few steps ahead of everyone else. Where others see the world as it is, you see what it could turn into, and you describe it so clearly that people start believing it. Plenty of ideas that now seem normal were once exactly the thing you would have been saying at a dinner table.",
          "You are not scared of being the only one. You will say the unpopular thing, ask the awkward question and stand your ground in a room that is rolling its eyes. That kind of nerve is rare, and the people who need someone to say it for them always notice.",
          "You treat everyone the same. The waiter, the boss, the stranger online get equal respect, and you spot unfairness quickly and say so. Friends who have been overlooked elsewhere often feel properly seen for the first time around you."
        ]
      },
      {
        "title": "Shadow & Growth",
        "icon": "🌑",
        "paragraphs": [
          "Your worst habit is detachment dressed up as logic. When someone is hurt, you go calm and analytical, and the calm gets read as not caring. You tell yourself you are being objective. They hear that you left.",
          "You also disagree on reflex. If the room is happy with a plan, you start finding holes, not because you have a better one but because agreeing feels like losing yourself. People get tired of being the audience for it, and you end up isolated in a position you did not even like that much.",
          "Growth starts the first time you stay in the feeling instead of explaining it. You say I am scared, or I missed you, with no analysis attached, and nothing bad happens. The person across from you softens, and you realise closeness did not cost you the freedom you were guarding.",
          "Let yourself need somebody. Ask for help with a real problem, lean on a friend, let a partner do something for you without repaying it. You can stay your own person and still depend on others. The loneliest version of you is the one who has convinced yourself you are fine alone."
        ]
      },
      {
        "title": "Compatibility Quick Guide",
        "icon": "💫",
        "paragraphs": [
          "With Gemini and Libra, talking never runs out. A Gemini bounces ideas back at you faster than you can think of them, and neither of you gets bored. A Libra shares your sense of fairness and gives you space without making it a fight, so evenings feel easy.",
          "Sagittarius and Aries give you energy. A Sagittarius is as independent as you are and will happily argue about politics, travel and the point of everything until midnight. An Aries is the one who says okay, let's do it, and gets your big idea out of your head and into the world.",
          "Taurus, Scorpio and Cancer are the pairings that test you. A Taurus wants the same dinner, the same sofa and the same plan, and you feel your life shrinking. A Scorpio wants you to open up completely and watches for any sign you are holding back. A Cancer needs reassurance you forget to give. These can work, but only if you accept that their need for closeness is not an attack on your freedom."
        ]
      }
    ]
  },
  pisces: {
    "loveStyle": [
      "When you fall, you fall all the way. Within weeks you are thinking in we, you know their mood from across the room, and you rearrange your plans around theirs without being asked. It is the most generous love anyone will give them, and it can feel like too much to someone who just wanted dinner.",
      "You fall in love with the person you can see in them, not always the one standing there. You notice the hurt, the potential, the soul behind the awkwardness, and you love that. Then the real person forgets your birthday or says something careless, and you feel the floor shift because the dream and the human no longer match.",
      "You need a partner who is calm and steady and also tender, someone who keeps the bills paid and the plans real while you bring the poetry. What you need to avoid is a person who sees how much you give and quietly starts taking it. Protect yourself by noticing who stays kind once you stop doing everything for them."
    ],
    "careerStrengths": [
      "Your best work happens when it comes from feeling something. Music, film, photography, writing, therapy, nursing, counselling, spiritual work and anything that serves people who are struggling use what you are best at. In a job that is only spreadsheets and targets, you lose weeks to staring at the screen.",
      "Your imagination fills the gap where logic stops. You come up with the image, the melody, the sentence or the way of saying it that makes people feel understood. Colleagues cannot always explain why your work lands, but they know it does, and clients come back for it."
    ],
    "shadowSide": "Your shadow is the drift. When life gets sharp, you float away: into the phone, a drink, a fantasy about how it could be, a relationship that is easier than the one you are in, or a spiritual idea that lets you skip the practical problem. You say yes to things you can't afford, then disappear instead of saying no. You also turn into the person who is always giving and quietly keeping count. People around you see someone wonderful who is never quite reachable. The way back is one small real action a day, like the unopened letter or the awkward phone call.",
    "lifePurpose": "You are here to learn that you are allowed to be on your own side. You have never had trouble caring about others. The test is whether you will give yourself the same patience you give a stranger. Grown up, you keep the tenderness, stay in the room when it hurts, and make things that help people while still having a Tuesday and a bank balance.",
    "elementDescription": "Feelings reach you before facts do. You walk into a room and know someone has been crying, that two people are fighting politely, that the host is nervous, and you absorb it all without trying. It is why people tell you things they have never said out loud. It is also why you leave a party exhausted and sad without knowing whose sadness it was.",
    "sections": [
      {
        "title": "Personality Overview",
        "icon": "🌊",
        "paragraphs": [
          "You live half in the room and half somewhere else. You can be in the middle of a conversation and drift to a song, a memory or a made-up scene, and come back not entirely sure what was said. People call it dreamy. For you it is how you process the world.",
          "You are after something deeper than small talk. A film that wrecks you, a song that fits your mood exactly, a conversation that goes somewhere true, that is what makes a day feel worth it. You are not interested in surface, and you can't pretend to be for long.",
          "You pick up everyone's feelings and often cannot tell which ones are yours. A friend is anxious, so you feel anxious. A stranger in the lift is sad, and your afternoon goes grey. You spend a lot of energy carrying things that were never yours, and it is a big part of why you need time alone.",
          "Other people feel it too: there is something a bit hard to pin down about you. You go quiet when asked what you want, you stare past people, and you avoid direct conflict by drifting away from it. It is not coldness. You are working it out, and the world rarely gives you the time."
        ]
      },
      {
        "title": "In Love & Relationships",
        "icon": "💕",
        "paragraphs": [
          "Being loved by you is intense. You notice the thing nobody else noticed, you remember how they take their tea, and you make them feel like the only person who has ever really been understood. Partners say they have never felt so seen.",
          "You are romantic in a way that is completely sincere. You write the letter, make the playlist, draw the card, and mean every word. Love, for you, is not a transaction. It is where you feel closest to something larger.",
          "The trouble starts when the story and the person drift apart. You build up an ideal, overlook the early signs and give so much that you stop knowing what you want. Then the first big disappointment hits twice as hard because it is not only them you lose, it is the version you were in love with.",
          "In a good relationship you are the partner everyone wishes for. You sense what is needed before it is said, you make home feel safe and you never make anyone feel stupid for having a bad day. It works best with someone who is just as kind back."
        ]
      },
      {
        "title": "Career & Purpose",
        "icon": "🎭",
        "paragraphs": [
          "Your best work is the kind that moves people. You do your finest thinking when you can turn what you feel into something others can hold: a song, a photograph, a session where someone finally says the thing they could not say before.",
          "Creative work comes naturally to you. Music, film, dance, writing and visual art give your imagination somewhere to go, and what you make often has a quality people struggle to describe. It does not look like technique. It looks like truth.",
          "You are also a natural in helping roles. As a therapist, nurse, counsellor or carer, you can sit with someone in pain without rushing them to feel better. People leave your room feeling lighter and often cannot say why.",
          "Money and self-promotion are where you lose. You charge less than you are worth, say yes to favours for free and wait for someone to notice your work instead of showing it. Then you wonder why you are exhausted and broke. Set a price, say it out loud and keep to it."
        ]
      },
      {
        "title": "Strengths & Gifts",
        "icon": "✨",
        "paragraphs": [
          "You make people feel safe to be a mess. When someone tells you the worst thing about their week, you do not hurry to fix it or compare it to your own. You just listen, and they feel lighter. Very few people can do that, and you do it without trying.",
          "You see meaning where others see noise. A stray comment, a colour, a dream, a coincidence, you connect them into something that means something, and sometimes you are right in ways you cannot explain. That is the root of your art.",
          "You remind the people around you that life is more than a to-do list. You take time for a sunset, a long hug, a half-hour stare at the sea. In the middle of a busy week, being around you is the thing that makes people remember to breathe."
        ]
      },
      {
        "title": "Shadow & Growth",
        "icon": "🌑",
        "paragraphs": [
          "When real life gets heavy, you leave without leaving. You scroll for three hours, daydream, sleep too much, drink too much, or fall into a spiritual idea that lets you skip the practical thing. It feels like rest. It is avoidance, and the unpaid bill is still there when you surface.",
          "You do not know where you end and others begin. You take on a friend's crisis as your own, stay in a relationship because leaving would hurt them, and say yes because no feels cruel. After a while you are full of everyone else's feelings and nobody asked you how you were.",
          "Growth begins with one clear boundary said kindly. No, I can't this weekend. I need to think about it. That is not selfish. You will notice that people who love you stay, and that you have more to give when you stop emptying yourself.",
          "Get into your body. Walk, cook, swim, tidy a drawer, pay the bill the day it arrives. Small physical, practical routines are the anchor that stops your sensitivity from sweeping you away, and your creativity gets stronger with them."
        ]
      },
      {
        "title": "Compatibility Quick Guide",
        "icon": "💫",
        "paragraphs": [
          "With Cancer and Scorpio you do not have to explain yourself. A Cancer notices you are off before you say a word and shows up with soup. A Scorpio goes as deep as you do and does not flinch at the dark parts, so you can finally say the things you usually keep inside.",
          "Capricorn and Taurus are your anchors. A Capricorn takes care of the practical side so you can create, and in return you soften them and make them laugh. A Taurus shares your love of good food, soft things and slow evenings, and gives you the stability to relax.",
          "Gemini, Sagittarius and Virgo are the hard ones. A Gemini talks about your feelings like a topic and moves on, and you feel unheard. A Sagittarius says the blunt thing and is gone the next day, and it stays with you for weeks. A Virgo points out what is wrong with the plan, and you take it as being wrong. It can work if both sides slow down and stop assuming the other is being cold."
        ]
      }
    ]
  },
};
