/* Planet-in-house page copy in the reader's voice: what happens in that area of
   your life, no definitions of the planet or the house. Layered over
   planetsInHousesContent.ts, whose text stays as a fallback. */

export interface PlanetHouseVoice {
  intro: string;
  sections: { heading: string; body: string }[];
}

export const PLANET_HOUSE_VOICE: Record<string, PlanetHouseVoice> = {
  "sun-in-1st-house": {
    "intro": "People read you before you say a word. Your face, your walk and the first ten seconds of a conversation decide how the whole room treats you for the rest of the evening. Your sense of who you are gets built out loud, in front of other people, and it shows.",
    "sections": [
      {
        "heading": "Life Areas & Gifts",
        "body": "You walk into a room and people orient toward you without knowing why. You are good at starting things from nothing: a new job, a new city, a new look, a new group of friends. When something needs a person to go first, you are the one who does, and others relax once you have. You also hold up well when a situation is unclear, because you decide who you are in it rather than waiting to be told."
      },
      {
        "heading": "Challenges & Growth",
        "body": "You treat every first impression as a test you are taking, so you perform a little. You push ahead on instinct, announce the plan, and only later notice that three people in the room never agreed to it. Other people's reactions start steering you, and you end up acting like the version of you that got applause last time. Ask one question before you decide anything that affects other people, and let the answer change your plan at least once a month."
      },
      {
        "heading": "Integration",
        "body": "Someone who has sorted this out stops auditioning. They state a preference in one sentence, listen to the reply, and do not rewrite the whole self to fit it. They let the first impression be slightly wrong and correct it by behaviour over weeks instead of by explaining. When they walk into a room, they walk in as themselves, and it costs them nothing."
      }
    ]
  },
  "sun-in-2nd-house": {
    "intro": "Your sense of who you are is tied to what you earn, own and can produce with your own hands. A bad month in the bank account feels like a verdict on you personally. A good one makes you stand straighter.",
    "sections": [
      {
        "heading": "Life Areas & Gifts",
        "body": "You are good at turning effort into something that stays: a skill people pay for, a stack of savings, a trade you get better at every year. You can tell quickly what something is worth, whether it is a used car, a salary offer or a friendship. You build slowly and you rarely have to start over, because you do not spend what you have not earned. People come to you when they need practical judgment about money."
      },
      {
        "heading": "Challenges & Growth",
        "body": "You check your balance the way other people check their phone. If income dips, you start doubting your talent, not the market, and you cling to a job or a client long past the point where it still serves you. You also buy things to feel solid, then feel guilty about it. Separate your worth from your net worth by writing down what you would still be good at with half the income, and set a number above which you stop adjusting your plan every week."
      }
    ]
  },
  "sun-in-3rd-house": {
    "intro": "You live through your head, your mouth and your phone. Your day is a string of short exchanges with siblings, neighbours, coworkers and people in the group chat, and each one feeds you. When the talking stops, you feel switched off.",
    "sections": [
      {
        "heading": "Life Areas & Gifts",
        "body": "You learn fast by asking, reading and repeating things to someone else. You are the one who explains the contract to the family, writes the message that settles the argument, and knows three shortcuts across town. Siblings, cousins and the people on your street are a bigger part of your identity than you admit. Writing, teaching, selling, short trips and anything that needs quick thinking suit you better than long, silent projects."
      },
      {
        "heading": "Challenges & Growth",
        "body": "You pick up ten things and master two. You answer every message the second it lands, so other people set your schedule, and you use being informed as a substitute for being decided. You also talk yourself out of an idea by discussing it with too many people before you start. Choose one subject a year to go deep on, and put your phone in another room while you do it."
      }
    ]
  },
  "sun-in-4th-house": {
    "intro": "Home is where you become yourself, and the version of you at the kitchen table is the real one. Your family, your childhood house and the place you come back to every evening shape you more than any job title will.",
    "sections": [
      {
        "heading": "Life Areas & Gifts",
        "body": "You make a place feel lived in within a week: the lamp, the smell from the kitchen, the chair where everyone ends up. You are the person relatives call when someone has to take the old house, the sick parent or the holiday dinner, and you do it well. You build slowly toward a base you own or truly belong to, and it steadies everyone around you. You have a long memory for where people come from, including yourself."
      },
      {
        "heading": "Challenges & Growth",
        "body": "You measure your life against your parents' even when you swore you would not. You come home from work and still carry the unspoken rules of the house you grew up in, so you either copy them or fight them without noticing. You can hide inside the house and call it rest while the outside world waits. Say out loud which family habit you are keeping and which you are done with, and then be seen at work in a way that does not depend on the family opinion of it."
      }
    ]
  },
  "sun-in-5th-house": {
    "intro": "You come alive when you are making something, playing something or falling for someone. Your best days have a stage in them, even if the stage is a dinner table. Doing things halfway feels like not living.",
    "sections": [
      {
        "heading": "Life Areas & Gifts",
        "body": "Romance, kids, art, games, sport and any project where you can put your name on it bring out the best in you. You are generous with attention, you make others feel picked, and you can turn a dull weekend into a story. People bring their ideas and their crushes to you because you take both seriously. You take creative risks that cautious people never try."
      },
      {
        "heading": "Challenges & Growth",
        "body": "You need an audience, and when the clapping stops you sulk or start something new to get it back. You fall in love with the opening scene, then lose interest in the long middle, which is where the project, the relationship or the child actually gets built. You take a lukewarm reply as an insult. Finish one thing a year all the way to the boring end, and tell the people you love what you admire in them before you ask them to admire you."
      }
    ]
  },
  "sun-in-6th-house": {
    "intro": "Your identity runs through your daily routine: what you do at 7 a.m., how you do your job, what you eat, how your body feels by Thursday. You feel most like yourself when the work is done properly.",
    "sections": [
      {
        "heading": "Life Areas & Gifts",
        "body": "You are the colleague who actually fixes the thing, notices the error before it ships and knows how the system works. Health, craft, service and any job with a checklist suit you, and you improve at them every year without fanfare. You keep promises on small things, and people lean on you because your Tuesdays are reliable. A well-run kitchen, calendar or workshop calms you more than a holiday does."
      },
      {
        "heading": "Challenges & Growth",
        "body": "You say yes to every favour and end the week tired and resentful. You think you are only worth what you are useful for, so you fix other people's problems before your own and ignore the ache in your back for months. You criticise your own work harder than anyone else will. Block one hour a day that is useful to nobody, and say no to the third request in a week without giving a reason."
      }
    ]
  },
  "sun-in-7th-house": {
    "intro": "You find out who you are by standing next to someone else. Your closest partner, business partner or best friend is a mirror, and what they say back to you shapes your whole week. You do not trust a decision you have not talked through with a person you respect.",
    "sections": [
      {
        "heading": "Life Areas & Gifts",
        "body": "You are good at one-on-one: negotiating, advising, closing the deal across the table, staying in a marriage when it gets dull. You listen well enough that people tell you things they have told nobody. You see what a pairing needs and you fix it, whether it is two coworkers who clash or two friends who stopped speaking. Partnerships you choose carefully carry you further than anything you could do alone."
      },
      {
        "heading": "Challenges & Growth",
        "body": "You let the other person decide, then resent the outcome. You pick partners who are louder or more certain than you, and then you complain about being overruled. Being alone makes you feel half-formed, so you stay in situations that cost you. Make three decisions this month without consulting anyone, and say what you want first in the next negotiation, before you hear their offer."
      }
    ]
  },
  "sun-in-8th-house": {
    "intro": "You live where other people avoid looking: debt, inheritance, loss, sex, secrets, power and what happens after a crisis. You treat the surface of a conversation as a door and keep going until you find what is behind it.",
    "sections": [
      {
        "heading": "Life Areas & Gifts",
        "body": "You stay calm when someone is crying, dying or in debt up to their eyes. You are good with other people's money, insurance, legal tangles, therapy, investigation and any work that involves what is hidden. Intimacy is not a casual matter for you, and the people you let in get all of you. You have rebuilt your life more than once, and each time you come back with more control than before."
      },
      {
        "heading": "Challenges & Growth",
        "body": "You test people by withholding, then conclude that nobody can be trusted when they fail. You keep tabs on who owes what, emotionally and financially, and you hold on to old wounds long after the other person has forgotten them. Control feels safe, so you turn down help even when you need it. Tell one person the thing you are hiding before it leaks out sideways, and let a shared account or a shared decision stay shared for a year."
      }
    ]
  },
  "sun-in-9th-house": {
    "intro": "Your life only feels worth living when it is growing past its current borders: another country, another philosophy, another degree, another way of looking at the same thing. Staying in the same small circle for years makes you restless and a little bitter.",
    "sections": [
      {
        "heading": "Life Areas & Gifts",
        "body": "You are the person who comes back from a trip with a new language, a new conviction and a stranger's phone number. Teaching, publishing, law, travel, religion and anything that lets you make sense of the larger picture bring out your best. You are generous with what you know, and you can explain big ideas to people who think they hate big ideas. You hold optimism steady when others around you have given up on next year."
      },
      {
        "heading": "Challenges & Growth",
        "body": "You declare a worldview with total certainty and abandon it two years later for the next one. You promise more than your schedule allows, preach to people who asked a simple question, and leave the dull details of your own life to someone else. Leaving becomes a habit and a way to avoid finishing. Before you adopt the next big belief, spend a month testing it on someone who disagrees with you, and finish the course you started last year."
      }
    ]
  },
  "sun-in-10th-house": {
    "intro": "Your life is pointed at a public result: a career, a name, a position, a thing you will be known for. You watch your reputation the way other people watch their health, and you know where you stand in a room within a minute.",
    "sections": [
      {
        "heading": "Life Areas & Gifts",
        "body": "You climb. You take responsibility earlier than your peers, accept the title no one else wants, and keep going when the work gets lonely. Bosses trust you with the high-stakes project, and juniors watch how you carry yourself. You are good at long-term planning, and you have a very clear picture of where you will be in ten years. Authority comes to you because you are willing to carry the weight that comes with it."
      },
      {
        "heading": "Challenges & Growth",
        "body": "You mistake your job for your self, so a demotion or a redundancy feels like a death. You work through birthdays, cancel plans for a deadline that moves anyway, and your home life gets the leftover hours. You also hear criticism from your boss as a ruling on your character. Put one non-negotiable appointment each week that has nothing to do with your career, and ask yourself what you would still be proud of if nobody ever saw the title."
      }
    ]
  },
  "sun-in-11th-house": {
    "intro": "Your people are your identity: the friends, the team, the online community, the cause. You feel most like yourself in a group that shares a goal and gives you a role in it.",
    "sections": [
      {
        "heading": "Life Areas & Gifts",
        "body": "You collect interesting people and then introduce them to each other. Clubs, causes, networks, startups and any project where ten people build something none could build alone suit you. You see the shape of the future earlier than your friends do, and you can rally a crowd behind it. Friends come to you for the honest outside view because you do not need anything from them."
      },
      {
        "heading": "Challenges & Growth",
        "body": "You are warm to everyone and close to almost nobody, so when you need real help the list of names is shorter than you thought. You hold back opinions that would make the group uncomfortable, then quietly drift away from it. You also lean on a cause so heavily that you skip your own life. Pick two friends this year and tell them the thing that is actually going on with you, and let the group see you disagree once without leaving it."
      }
    ]
  },
  "sun-in-12th-house": {
    "intro": "The real you lives behind closed doors. You gain strength alone, in quiet rooms, asleep, in prayer, in the car with the radio off. Many people who know you well still have only part of the picture.",
    "sections": [
      {
        "heading": "Life Areas & Gifts",
        "body": "You see what is under the surface in other people before they have said a word. Counselling, healing, art, research, care work and anything done behind the scenes fit you, and you do it without needing credit. You feel the mood of a room before anyone speaks, and you can sit with someone in grief without trying to fix it. Your best ideas arrive at night or when you are by yourself."
      },
      {
        "heading": "Challenges & Growth",
        "body": "You retreat when you should speak, then feel unseen because nobody noticed you left. You absorb everyone's moods and call it your own, you sabotage a promotion because being visible feels dangerous, and you slip into numbing habits when you are tired. You hide the small wins and the large worries equally. Schedule solitude on purpose, one afternoon a week, and tell one person the plan before you disappear, so that retreat stays a choice and not an escape."
      }
    ]
  },
  "moon-in-1st-house": {
    "intro": "Your feelings are on your face before you know you have them. People read your mood off the way you walk in, and they react to it all day. You wear your moods like weather.",
    "sections": [
      {
        "heading": "Life Areas & Gifts",
        "body": "You respond fast and instinctively, and people trust you because they can see you mean it. You pick up what a stranger needs and offer it before it is asked for. You are good at the first minute of anything, a hospital waiting room or a new class, because you make people feel looked after. Your reactions are quick, which makes you excellent in emergencies that need warmth rather than a plan."
      },
      {
        "heading": "Challenges & Growth",
        "body": "Your mood leaks into every room, so a bad morning becomes everyone's bad morning and you do not see why. You take small slights personally, change your plans with your feelings, and then wonder why people think you are unpredictable. Others learn to walk on eggshells. Wait ten minutes before you answer anything while you are upset, and ask a friend to tell you honestly how you came across last week."
      }
    ]
  },
  "moon-in-2nd-house": {
    "intro": "You feel safe when there is money in the account, food in the fridge and something of your own to sit on. Your mood follows your finances more than you would like to admit. A stable bank balance is a bigger comfort to you than a compliment.",
    "sections": [
      {
        "heading": "Life Areas & Gifts",
        "body": "You are good at making a home comfortable on a modest budget, and at feeding people well. You know what you need to feel secure and you save for it steadily. Work that involves food, property, care or things people hold onto suits you. You have a loyal way with money and possessions: you keep what is good, repair what is broken, and the people around you benefit."
      },
      {
        "heading": "Challenges & Growth",
        "body": "You spend when you are sad, snack when you are anxious, and buy a treat to feel held. Then the balance drops and the mood drops with it. You also keep things long after they stopped serving you, from old clothes to old jobs, because letting go feels like loss. Wait a day before a purchase you feel an emotional pull toward, and set a monthly amount that is yours to spend without justification."
      }
    ]
  },
  "moon-in-3rd-house": {
    "intro": "You process feelings by talking, writing and asking questions. If you cannot say what is wrong to someone nearby, it stays stuck in your chest all day. Your siblings and your old neighbourhood stay close to your emotional life.",
    "sections": [
      {
        "heading": "Life Areas & Gifts",
        "body": "You find words for what other people cannot say. A text from you can settle a quarrel, and a note you write on a card gets kept for years. You remember conversations in detail, learn well from stories, and you are fast at gathering the facts of a situation. Teaching children, writing, short travel and daily conversation come easily and keep you well."
      },
      {
        "heading": "Challenges & Growth",
        "body": "Your mind never switches off, so a small worry becomes a long night of rehearsing conversations. You gossip to feel connected, repeat the same story until it hardens, and read ten articles to avoid one honest talk. You also confuse thinking about a feeling with having dealt with it. Write the worry on paper before bed, and when you feel something big, say it to one person in one sentence instead of circling it."
      }
    ]
  },
  "moon-in-4th-house": {
    "intro": "Home and family sit at the base of your emotional life. You feel your mother's mood and your childhood house long after you left both. Everything calms down once you are in your own place with the door shut.",
    "sections": [
      {
        "heading": "Life Areas & Gifts",
        "body": "You make a home that people do not want to leave. You remember birthdays, recipes and who sat where at every holiday, and you keep the family stories alive. You care for parents, relatives and anyone who needs a refuge, and you do it without keeping score. You need a real base more than a good address, and when you have one you are steady everywhere else."
      },
      {
        "heading": "Challenges & Growth",
        "body": "You hold on to the past, including grudges, old houses and the way things used to be. Moving, changing jobs or watching a parent age hits you harder than it hits others. You also lean on family to settle feelings that belong to you, and you stay in a home that has stopped fitting. Name which old family rule you are still obeying, and build one routine in your own space that belongs to you and not to your parents."
      }
    ]
  },
  "moon-in-5th-house": {
    "intro": "You feel most alive when you are playing, performing or in love. Joy is how you check that things are okay. A life without a creative outlet or a crush goes grey for you.",
    "sections": [
      {
        "heading": "Life Areas & Gifts",
        "body": "You are warm in a way people feel from across the room, and you are wonderful with children. Creative work, theatre, hobbies and romance bring out your best because you throw your whole heart into them. You make dinner feel like an event and a Tuesday feel like a celebration. You fall in love easily and you love openly, which makes people feel chosen."
      },
      {
        "heading": "Challenges & Growth",
        "body": "You need to be adored, so you take a cooler reply as rejection and go quiet or dramatic. You chase the thrill of a new romance or a new hobby, then drop it when the novelty fades. Being the favourite is your way of feeling safe, and it burns out friends. Tell people how much they matter without waiting to be asked, and commit to one creative project for a full year before you give yourself permission to switch."
      }
    ]
  },
  "moon-in-6th-house": {
    "intro": "Your feelings show up in your body and your schedule. When you are stressed your stomach, sleep or energy takes the hit first. A neat routine settles you more than a pep talk.",
    "sections": [
      {
        "heading": "Life Areas & Gifts",
        "body": "You show love by doing: the packed lunch, the fixed shelf, the appointment you booked for someone else. You are quick at noticing what is off, in a kitchen, an office or a person's health. Healing work, caring work, cooking, animals and any job where you tend to details suit you. People feel taken care of around you, and your work is steady."
      },
      {
        "heading": "Challenges & Growth",
        "body": "You worry through your to-do list and start to think a rest day is laziness. You absorb the stress of everyone at work and then get sick on the first quiet weekend. You also nurse a quiet resentment about being the one who does everything. Eat at fixed hours, set a finish time for work and keep it, and ask for help once a week in plain words before you reach the point of snapping."
      }
    ]
  },
  "moon-in-7th-house": {
    "intro": "You feel at home only when someone is beside you. Your mood tracks the state of your closest relationship, and a quarrel at breakfast can colour your entire day. You learn about your own feelings from the people you love.",
    "sections": [
      {
        "heading": "Life Areas & Gifts",
        "body": "You are a natural at making a partner feel understood. You notice a shift in tone, remember what they said last month and know when to hold on and when to give space. Marriage, close friendship and one-on-one work such as counselling, mediation or client care bring out your best. You build lasting bonds because you actually turn up for them."
      },
      {
        "heading": "Challenges & Growth",
        "body": "You lose your own feelings in your partner's, and you do not notice until you are resentful. You need reassurance, so you test the relationship with silence or an indirect question. You also pick partners who mirror your family's emotional pattern. Say what you want in a sentence before the resentment builds, and spend one evening a week alone so you remember what your own mood feels like."
      }
    ]
  },
  "moon-in-8th-house": {
    "intro": "Your feelings run deep and mostly out of sight. You sense secrets, shifts in power and what someone is not saying, and you rarely show how much you are carrying. Closeness is a high-stakes event for you.",
    "sections": [
      {
        "heading": "Life Areas & Gifts",
        "body": "You are steady in a crisis, whether it is a death, a breakdown or a financial mess, and people turn to you for exactly that reason. You are good at counselling, research, finance, healing and any work that involves other people's private pain. You bond intensely, you keep confidences, and the few people you let in know you are loyal. You come back from loss with more depth than before."
      },
      {
        "heading": "Challenges & Growth",
        "body": "You test people with silence and then feel abandoned when they fail. You store hurt for years, check up on partners in secret, and use emotional distance as protection. Jealousy and a need for control creep in when you feel unsafe. Say a hard feeling out loud within a week of having it, and share one financial or personal decision a month so that trust has something to hold on to."
      }
    ]
  },
  "moon-in-9th-house": {
    "intro": "You feel settled when you are learning, travelling or believing in something larger than your own week. A sense of meaning is your comfort food. Staying in one small routine for years makes your mood sink.",
    "sections": [
      {
        "heading": "Life Areas & Gifts",
        "body": "You are warm and generous with ideas, and you make strangers feel welcome in a foreign place. Teaching, travel, publishing, spiritual work and anything that connects distant people suit you. You absorb cultures and languages emotionally, not just intellectually, so you feel at home in other countries. Your optimism lifts the people around you when things look bleak."
      },
      {
        "heading": "Challenges & Growth",
        "body": "You hold a belief like a feeling, so you take disagreement as an attack. You run away to a new place or a new teaching when your emotions get complicated, and you carry the same problem there. You talk about home while living elsewhere. When you feel the urge to leave, name the feeling first and give it a week, and test your biggest belief against a person who thinks differently."
      }
    ]
  },
  "moon-in-10th-house": {
    "intro": "Your feelings are visible to the public, and your career is tied up with how people feel about you. You are rarely just doing a job. You care for a team, a customer base or a community, and your standing rises and falls with their mood.",
    "sections": [
      {
        "heading": "Life Areas & Gifts",
        "body": "You are good at work that involves looking after people on a large scale: leading a team, running a business that feeds or houses others, public-facing care, teaching, politics, hospitality. People trust you with responsibility because they sense you will not drop it. You read the public mood well and know what to say to a crowd. Your mother or a strong parent figure shaped your idea of what success looks like."
      },
      {
        "heading": "Challenges & Growth",
        "body": "You take every criticism at work as a rejection of you, and you carry office moods home. You also put on a composed face while storing stress, then it comes out at the people closest to you. You confuse being needed with being valued. Keep a separate hour each day where nobody at work can reach you, and say plainly to one colleague when you are overwhelmed."
      }
    ]
  },
  "moon-in-11th-house": {
    "intro": "You feel supported when you belong to a group. Friends, teams, online communities and shared causes steady your mood more than family does. A day without contact with your people feels strangely empty.",
    "sections": [
      {
        "heading": "Life Areas & Gifts",
        "body": "You make friends of every age and mix people who would never have met. You are good at group care: remembering everyone's news, organising the get-together, holding a community together through a hard year. Causes, networks and teams suit you because you feel the needs of the whole room. Your friends tell you things they tell nobody else, and you keep them."
      },
      {
        "heading": "Challenges & Growth",
        "body": "You attach to groups for comfort, then take it badly when a friend moves on. You hold back your own needs so you do not burden anyone, and your friends do not know you are struggling. You also drop everything for a friend and have no energy left for yourself. Tell one friend something real before you are asked, and let a friendship that has gone quiet stay quiet without taking it as a verdict."
      }
    ]
  },
  "moon-in-12th-house": {
    "intro": "Your feelings live far below the surface, and often even you cannot say what you feel until later. You take in the moods around you like a sponge. Quiet, privacy and sleep are not luxuries for you but a requirement.",
    "sections": [
      {
        "heading": "Life Areas & Gifts",
        "body": "You sense unspoken pain and you are gentle with it. You are good at caring work, healing, art, music, spiritual practice and anything behind the scenes where quiet attention helps. You dream vividly and your intuition about people is usually right. You can sit with the grieving, the sick or the lost without needing them to cheer up."
      },
      {
        "heading": "Challenges & Growth",
        "body": "You hide how you feel, even from the people closest to you, and they only find out when you have already pulled away. You take on other people's moods and feel drained by evening without knowing why. You turn to food, sleep, drink or screens to numb out. Get alone time every day, name your feeling in writing before you try to explain it to anyone, and tell one trusted person when you are hiding."
      }
    ]
  },
  "mercury-in-1st-house": {
    "intro": "People meet your mouth before they meet the rest of you. You talk fast, ask questions in the first minute and leave a room with a reputation for being sharp. Your whole sense of who you are runs through what you know and how well you say it.",
    "sections": [
      {
        "heading": "Life Areas & Gifts",
        "body": "You think out loud and you are quick enough to get away with it. In a job interview, a first date or a meeting with strangers, you read the room in seconds and adjust your pitch before anyone notices. People remember the thing you said, not the outfit. You pick up new skills, accents and slang faster than the people around you, and you look younger than your age because you keep moving and keep asking. Anything that rewards a fast answer, like sales, teaching, writing, hosting or negotiating, fits you."
      },
      {
        "heading": "Challenges & Growth",
        "body": "You reinvent yourself every few months, and people who liked the last version get whiplash. You start three projects because the idea was exciting on Tuesday and you drop two of them by Friday. When you are anxious you talk more, which makes you sound sure while you feel the opposite. The fix is boring: finish one thing a quarter, and say the true sentence instead of the clever one. Once you stop performing quick wit, people start trusting what you say."
      }
    ]
  },
  "mercury-in-2nd-house": {
    "intro": "You think about money constantly, and you earn it by talking, writing, pricing and figuring things out. What you own, what things cost and what you are worth are live questions in your head all week.",
    "sections": [
      {
        "heading": "Life Areas & Gifts",
        "body": "You spot a bad deal from across the room and you can explain in two sentences why a price is wrong. Selling, copywriting, bookkeeping, negotiating a salary and running a side business with a spreadsheet all come easily. You make money from what you know, so your income tends to come in several streams rather than one paycheck. You compare prices, read the fine print and remember what you paid for things years ago. Your voice itself is part of your earning power, and people hire you partly for how you explain."
      },
      {
        "heading": "Challenges & Growth",
        "body": "You run numbers in your head at 2 a.m. and talk yourself into both a purchase and out of it. You haggle over small amounts and then overspend on something you researched for weeks, because the research felt like work done. You also tie your worth to how clever your last idea was, so a slow month reads as a verdict on you. Set a fixed price for your time and stick to it, and stop discounting because the conversation went well. Write the budget down once instead of rehearsing it nightly."
      }
    ]
  },
  "mercury-in-3rd-house": {
    "intro": "Your head is full of messages, side streets, siblings, neighbours and tabs. You learn by chatting, reading and getting around, and a day without new information feels wasted.",
    "sections": [
      {
        "heading": "Life Areas & Gifts",
        "body": "You write, text, call and reply faster than anyone you know. Short trips, local errands and conversations with neighbours give you ideas you use later at work. You are the one who explains a complicated thing to a younger cousin in a way that finally lands. Writing, teaching, podcasting, sales calls, journalism and anything that puts you in front of many small audiences suit you. You often have a close, talkative bond with a brother, sister or a friend who feels like one."
      },
      {
        "heading": "Challenges & Growth",
        "body": "You know a little about everything and get restless when a topic asks for a year of boring practice. Your phone owns your attention, and you answer a message while someone is mid-sentence in front of you. You also pick up gossip and repeat it before checking whether it is true. Choose one subject to study properly, and put the phone in another room for the hour you do it. Read your message once before sending it, especially the angry ones."
      }
    ]
  },
  "mercury-in-4th-house": {
    "intro": "Your thinking was formed at a kitchen table. What was said in your family, and what was never said, still decides how you talk to people you love.",
    "sections": [
      {
        "heading": "Life Areas & Gifts",
        "body": "You remember stories, dates and names from your family that nobody else kept. Your home is where you think best, so you set up a desk, a shelf or a whole room as a place to read and write. Family history, real estate, interior work, teaching from home and remote jobs all fit. You are the relative who calls everyone, settles the argument by explaining each side, and keeps the group chat alive. Late in life you get sharper rather than duller, and your best ideas arrive in your own space."
      },
      {
        "heading": "Challenges & Growth",
        "body": "You replay old family conversations and still argue with a parent who may not even remember the fight. You pick up the family opinion on money, religion or what counts as success and repeat it as if you had thought it through. You also go quiet at home when the talk gets emotional, then write an excellent message that never gets sent. Say one true thing out loud to the person it concerns, instead of drafting it for a week. Form an opinion your family would not recognise and say it calmly at the next dinner."
      }
    ]
  },
  "mercury-in-5th-house": {
    "intro": "You play with ideas the way other people play cards. Jokes, flirting, stories and hobbies all start in your head and come out as a performance.",
    "sections": [
      {
        "heading": "Life Areas & Gifts",
        "body": "You are funny on purpose and you tell a story with timing. Dates with you are good conversation first, and you win people over by making them laugh and think at once. Writing for the stage, screen or social media, coaching kids, teaching and any job where you entertain while you explain suit you. You are the adult kids love because you talk to them like people. Your hobbies, whether poetry, board games, speculation or improv, keep your mind fresh into old age."
      },
      {
        "heading": "Challenges & Growth",
        "body": "You flirt with words and then wonder why someone took it seriously. You get so pleased with a good line that you say it even when it hurts. You also start creative projects with a flourish and let them sit when the applause is over, or gamble on a clever idea with money you cannot lose. Finish something small and show it to a stranger, then do it again. In love, say the plain sentence, I like you, and let the wit come after."
      }
    ]
  },
  "mercury-in-6th-house": {
    "intro": "Your mind works through the daily grind: lists, schedules, inboxes, appointments and the question of why this process is so slow. You are happiest when you can make the routine more intelligent.",
    "sections": [
      {
        "heading": "Life Areas & Gifts",
        "body": "You improve any system you touch. At work you notice the extra step nobody needs, fix it and write the instructions so the next person can follow them. Editing, admin, analysis, research, health writing, coding and customer support are natural fits, and you are good at the detail that others skip. You learn your own body by tracking it, so sleep logs, food notes and checkups come naturally. Coworkers bring you problems because you answer calmly and clearly."
      },
      {
        "heading": "Challenges & Growth",
        "body": "You worry about small errors and then reread an email eight times. Your nerves show up in your stomach, your sleep and your inbox, and you call it being busy. You also take on everyone's small tasks because you can do them fast, so your own big project never gets the hours. Set a time each day when work stops, and say no to the fourth favour. Walk away from the screen on a schedule, and let a good enough draft go out."
      }
    ]
  },
  "mercury-in-7th-house": {
    "intro": "You think best with another person across from you. Your closest relationships, business partners and opponents all become conversations that shape what you believe.",
    "sections": [
      {
        "heading": "Life Areas & Gifts",
        "body": "You listen well, and you can say both sides of an argument fairly. Contracts, mediation, counselling, partnerships and negotiating suit you, and clients feel you took their side seriously even when you disagreed. You are drawn to partners who are quick and who talk back. Your best relationships are the ones where you can finish each other's thoughts and still be surprised. You often meet important people through a conversation that ran too long."
      },
      {
        "heading": "Challenges & Growth",
        "body": "You see every side so well that you cannot pick one, and the partner waiting for a yes or a no hears another essay. You win arguments by being cleverer, then notice you got the point but lost the person. You also reason about feelings so you do not have to have them. Say what you want in one sentence before you list the counterarguments. Let a silence sit, and let the other person finish before you reply."
      }
    ]
  },
  "mercury-in-8th-house": {
    "intro": "You go looking for what people do not say. Secrets, shared money, inheritance, intimacy and loss pull your attention, and a surface answer never satisfies you.",
    "sections": [
      {
        "heading": "Life Areas & Gifts",
        "body": "You ask the follow-up question that makes someone admit the real thing. Research, investigation, therapy, forensics, tax and insurance work, and writing about taboo subjects suit you. People tell you things they have told nobody, and you keep them. You read contracts, debt terms and fine print more closely than anyone, which protects you and your partners when money is shared. You understand why people lie, and that makes you hard to fool."
      },
      {
        "heading": "Challenges & Growth",
        "body": "You assume people are hiding something and you are right often enough to keep doing it. You hold a suspicion for months, say nothing and then bring it up as a verdict. In a close relationship you question every silence, and your partner starts to feel interrogated. You also keep your own secrets to stay in control. Ask the question directly, once, and accept the answer for a day before you check it. Share one thing you would rather hide with someone you trust."
      }
    ]
  },
  "mercury-in-9th-house": {
    "intro": "You are happiest when the question is big: why people believe what they do, what the law says, what another country eats and thinks. Travel, study and publishing keep your mind fed.",
    "sections": [
      {
        "heading": "Life Areas & Gifts",
        "body": "You pick up languages and customs quickly and you enjoy being the odd one out in a foreign city. Teaching, publishing, law, philosophy, travel writing and anything that moves ideas across borders suit you. You read the long book, take the extra course and ask a stranger about their country. Students and readers follow you because you connect a small fact to the larger picture. Your opinions on religion, politics and meaning are thought through and you can defend them."
      },
      {
        "heading": "Challenges & Growth",
        "body": "You hold forceful opinions after reading one side. You tell people what they should believe before you have heard their situation, and you feel misunderstood when they push back. You also keep planning the trip, the degree or the book and avoid the dull middle where you actually do it. Read the best argument against your view before you post it. Pick one course or manuscript and finish it before buying the next ticket."
      }
    ]
  },
  "mercury-in-10th-house": {
    "intro": "Your career is built from words. Your reputation depends on what you say, write and explain in public, and people place you by how you sound.",
    "sections": [
      {
        "heading": "Life Areas & Gifts",
        "body": "You are the person in the meeting who summarises, and the boss asks you to present because you are clear. Writing, media, teaching, sales, consulting, politics, law and management of information suit you. You change jobs and fields several times and each one uses the last. You build a name through a newsletter, a talk or a steady voice online. Colleagues remember how you explained a hard problem, and that memory gets you the promotion."
      },
      {
        "heading": "Challenges & Growth",
        "body": "You say yes to too many projects and become known for starting. You give the opinion that suits the audience, and over the years people learn you can be talked into anything. You also hide in busywork and email so you do not have to commit to one direction. Choose one title you want in five years and turn down work that does not lead there. Say the unpopular thing once, in writing, so your name stands for something."
      }
    ]
  },
  "mercury-in-11th-house": {
    "intro": "Your friends are the people you think with. Groups, online communities, causes and your wider circle give you most of your ideas, and a day with no one to talk to is a flat day.",
    "sections": [
      {
        "heading": "Life Areas & Gifts",
        "body": "You collect friends from different worlds and you introduce them to each other. You are good at running a group chat, a club, a newsletter or a campaign, and at explaining what the group wants in a way that moves it. Technology, networking, activism and community work suit you. You hear about trends early because you are in the right conversations. Friends come to you for the straight answer about their plans."
      },
      {
        "heading": "Challenges & Growth",
        "body": "You spread yourself across fifteen groups and let most of them fade. You talk about the cause for hours and then forget to do the dull part. You argue with a friend over a principle and lose the friend. You also hide behind the group's opinion so you do not have to form your own. Pick two groups where you take responsibility for a task. Talk to one friend each week without an agenda."
      }
    ]
  },
  "mercury-in-12th-house": {
    "intro": "Most of your thinking happens where nobody sees it. You rehearse conversations, replay the day at night and hold thoughts that never reach your mouth.",
    "sections": [
      {
        "heading": "Life Areas & Gifts",
        "body": "You have a rich private mind and you notice what others miss: a tone, an unspoken fear, the thing that is not in the report. Writing, research, counselling, translation, behind-the-scenes work and anything done alone suit you. You get your best ideas in solitude, at night or in retreat. Dreams, journals and quiet walks sort out your problems. People tell you what is wrong because you listen without hurry."
      },
      {
        "heading": "Challenges & Growth",
        "body": "You think a thing for years and never say it, then wonder why people do not know. You expect others to guess, and when they do not you decide they do not care. Overthinking turns into worry at 3 a.m., and you carry a secret longer than it deserves. Write the thought down every day, and send one of those pages to someone you trust. Say the small honest thing in the moment instead of saving it for a speech."
      }
    ]
  },
  "venus-in-1st-house": {
    "intro": "People like you before they know why. Your look, your manner and the way you enter a room make others want to be nice to you, and you notice how quickly doors open.",
    "sections": [
      {
        "heading": "Life Areas & Gifts",
        "body": "You have style that looks easy. You know which colour, cut or haircut suits you, and you carry it without effort. Strangers help you, waiters smile and a tense room softens when you arrive. You are good at diplomacy, at settling a quarrel with one gentle sentence and making everyone feel included. Fashion, beauty, hospitality, acting, design and any job where your presence sells the product suit you."
      },
      {
        "heading": "Challenges & Growth",
        "body": "You smooth things over so well that you never say what you want. You say yes to avoid a scene, and then resent the person you agreed with. You also lean on being liked and skip the harder work of becoming good at something. When someone criticises you, you spend a week rearranging yourself. Say no once a week to something small. Practise a skill until it is better than your charm."
      }
    ]
  },
  "venus-in-2nd-house": {
    "intro": "You like nice things and you can afford more of them than most. Money, comfort and taste are bound up with how you feel about yourself, and you know the difference between cheap and good.",
    "sections": [
      {
        "heading": "Life Areas & Gifts",
        "body": "You buy fewer, better things and they last. Food, fabric, furniture and music matter to you, and you set up a home where each object earns its place. You attract money through pleasant work, a good reputation and a steady manner. Art dealing, retail, hospitality, finance, cooking and design suit you. You are generous with friends and love to treat them to a good meal."
      },
      {
        "heading": "Challenges & Growth",
        "body": "You spend to soothe yourself, and a bad week ends with a purchase. You judge yourself and others by what they own, and you stay in a job that pays well and drains you. You also cling to a comfortable situation after it has stopped working. Track your spending for a month and see what you buy when sad. Ask what you want to do if the money were not the question."
      }
    ]
  },
  "venus-in-3rd-house": {
    "intro": "You are pleasant to talk to and you know it. Your words come out soft and well timed, and your siblings, neighbours and classmates tend to like you.",
    "sections": [
      {
        "heading": "Life Areas & Gifts",
        "body": "You write and speak in a way that makes people feel at ease. Short letters, thank-you notes, captions and conversations with a stranger on a train come naturally. You are good in sales, teaching, writing, music or anything that mixes language and charm. A brother, sister or neighbour is a real friend. You learn best when the subject is beautiful or the teacher is kind, and you remember songs and poems for life."
      },
      {
        "heading": "Challenges & Growth",
        "body": "You tell people what they want to hear, and the compliment you gave does not match what you think. You avoid hard conversations by sending a cheerful text. You also gossip pleasantly and are shocked when it travels back. Say the true thing in the same warm voice. Study the dull subject on purpose, not only the pretty ones."
      }
    ]
  },
  "venus-in-4th-house": {
    "intro": "Home is where you are at your best. You make a room feel good within a week of moving in, and you want the people you love under one roof.",
    "sections": [
      {
        "heading": "Life Areas & Gifts",
        "body": "You cook, arrange flowers, hang pictures and light the room so that guests stay longer than planned. Your family is close, or you work hard to make it so, and you are the one who hosts the holiday. Interior design, property, catering and hospitality suit you. You may inherit a home, taste or an artistic streak from a parent. Later in life your home and family are the sweetest part of your story."
      },
      {
        "heading": "Challenges & Growth",
        "body": "You keep the peace at home by swallowing things, so a family quarrel arrives years late. You tolerate a messy relationship because leaving would break the picture. You also hold on to the house or the childhood memory after it has stopped fitting. Say the uncomfortable thing at the table, kindly and early. Make your home match who you are now, not who you were at ten."
      }
    ]
  },
  "venus-in-5th-house": {
    "intro": "Romance, fun and making things come easily to you. You flirt, play, date and create, and you enjoy being enjoyed.",
    "sections": [
      {
        "heading": "Life Areas & Gifts",
        "body": "People fall for you at parties and you are a generous lover who plans a lovely evening. You paint, sing, dance, decorate or write for pleasure and others pay for the results. You are great with children and with anyone who needs cheering up. Entertainment, art, hosting, teaching and event work suit you. Your life has more joy in it than most, and you spread it to the people near you."
      },
      {
        "heading": "Challenges & Growth",
        "body": "You chase the first rush of a new romance and lose interest when it becomes routine. You overspend on dinners, trips and gifts to keep the glow alive. You also want compliments so much that you pick partners who give them freely. Learn to stay for the second year. Make something for no audience at all."
      }
    ]
  },
  "venus-in-6th-house": {
    "intro": "You show love by doing things well and doing them for people. Your work, your daily schedule and your care for your body carry your sense of beauty.",
    "sections": [
      {
        "heading": "Life Areas & Gifts",
        "body": "You make a workplace pleasanter just by being in it. Your desk is tidy, your tone is kind, and customers and coworkers ask for you by name. Healing, wellness, hairdressing, nursing, cooking, design and service jobs suit you. You may meet a partner at work, and you treat colleagues like friends. You care for pets, plants and the people who rely on you, and you do it gracefully."
      },
      {
        "heading": "Challenges & Growth",
        "body": "You give so much help that you forget to ask for any, and your partner or boss takes it for granted. You say yes to extra work to be liked and end the month tired. You also put pleasure on hold until the list is finished, which it never is. Set a limit on what you do for others each week. Book a treat for yourself before the work is done."
      }
    ]
  },
  "venus-in-7th-house": {
    "intro": "You are at your best with one other person. You want a partner and you work to make it a good one, and the way you are treated by that person shapes your mood more than anything else.",
    "sections": [
      {
        "heading": "Life Areas & Gifts",
        "body": "You are fair, attentive and good at making a partner feel chosen. You pick people with taste and manners, and you keep a long marriage warm with small gestures. You are strong in counselling, law, design, mediation and any business built on a partnership. Clients and in-laws like you. Others describe your relationship as something to aim for."
      },
      {
        "heading": "Challenges & Growth",
        "body": "You build your day around someone else and wake up unsure of what you like. You choose a partner for the image, then feel let down when the real person has bad days. You swallow complaints for years and then end it suddenly. Say the small complaint this week instead of the big one in ten years. Keep one hobby, friend and bank account of your own."
      }
    ]
  },
  "venus-in-8th-house": {
    "intro": "You love in all or nothing. Intimacy, trust, shared money and what a partner does with your secrets matter to you more than flowers.",
    "sections": [
      {
        "heading": "Life Areas & Gifts",
        "body": "You build real closeness, the kind where two people know each other's worst day and stay. Money comes to you through partners, family, inheritance or investments, and you are good at handling it for others. You suit work in therapy, finance, insurance, healing and art about hard subjects. You are loyal in a way that surprises people. Your sex life and emotional life are deep, and you remember everything."
      },
      {
        "heading": "Challenges & Growth",
        "body": "You test a partner to see whether they will leave. You get jealous, check a phone, and call it love. You also stay in a relationship for the money or the chemistry after it stopped being kind. Ask for what you want without a trial attached. Keep your own money in your own name and share it by choice."
      }
    ]
  },
  "venus-in-9th-house": {
    "intro": "You fall for the faraway: a foreign city, a different language, a teacher with a wide view. Love and beauty arrive through travel, study and belief.",
    "sections": [
      {
        "heading": "Life Areas & Gifts",
        "body": "You meet partners abroad, in class or through shared faith, and they often come from a different background. You bring grace to teaching, publishing, travel, law and cultural work. Foreign food, music and architecture stay with you and shape your taste. People trust you because you respect other customs. You think about love as a philosophy and that gives your relationships room to grow."
      },
      {
        "heading": "Challenges & Growth",
        "body": "You look for the perfect place or person somewhere else, so you leave a good thing at home. You assume a romantic trip will fix a relationship and come back with the same arguments. You also preach tolerance and lose patience with someone who disagrees. Stay in one place long enough to find out what you have. Ask your partner about their views before you share yours."
      }
    ]
  },
  "venus-in-10th-house": {
    "intro": "Charm helps your career. People in charge like you, and your public image is polished and likeable.",
    "sections": [
      {
        "heading": "Life Areas & Gifts",
        "body": "You get promoted partly because you are pleasant to work with and good at the diplomatic email. You do well in art, fashion, beauty, law, public relations, hospitality and any role that faces clients. Your boss, the press and the public warm to you. A mentor or an older partner may lift your career. You can turn taste into a business."
      },
      {
        "heading": "Challenges & Growth",
        "body": "You avoid the hard conversation with your boss and let a problem grow. You pick a career for the status and not for the work. You also treat a promotion like a love affair and are hurt when it cools. Say your price and your deadline aloud. Do the part of the job nobody applauds."
      }
    ]
  },
  "venus-in-11th-house": {
    "intro": "Friends are your love life's backbone. You collect warm, interesting people and your circle has the same taste for fun, art and good talk as you.",
    "sections": [
      {
        "heading": "Life Areas & Gifts",
        "body": "You are the friend who remembers birthdays and brings people together. You attract help from groups, clubs, online communities and well-connected acquaintances. Your wishes come true through other people. Many of your partners start out as friends. Community work, social media, event planning and causes you love suit you."
      },
      {
        "heading": "Challenges & Growth",
        "body": "You stay friendly with everyone and honest with no one. You drift into a relationship with a friend and lose both when it ends. You also buy your way into a group by paying for dinners. Tell a friend one hard truth this month. Cut down to the few friends who would help you move house."
      }
    ]
  },
  "venus-in-12th-house": {
    "intro": "Your love life has a private room. Much of what you feel is kept to yourself, and affection arrives through quiet, art and sacrifice.",
    "sections": [
      {
        "heading": "Life Areas & Gifts",
        "body": "You love people deeply and without show. You give help anonymously, forgive easily and feel for strangers in trouble. Music, painting, poetry, healing, charity, film and spiritual practice suit you. Time alone recharges you, and a retreat or the sea fixes more than a party. Your creative work has depth because you do it in private."
      },
      {
        "heading": "Challenges & Growth",
        "body": "You fall for someone unavailable, a secret, a married person or a fantasy, and hide it for years. You sacrifice for a partner who never asked, then feel unseen. You also avoid talking about your needs because you think they are a burden. Say who you love and what you need to a friend who will not judge. Let one relationship be visible in daylight."
      }
    ]
  },
  "mars-in-1st-house": {
    "intro": "You walk into a room and people feel you before you speak. Your drive is visible on your face, in your pace and in how fast you move toward what you want.",
    "sections": [
      {
        "heading": "Life Areas & Gifts",
        "body": "You start things. You are the one who gets up first, takes the first swing and volunteers before the question is finished. Physical effort suits you, so sport, hard training or any job where you move your body gives you a clearer head. You handle conflict better than most because you say the thing out loud instead of stewing for a week. People hand you the wheel in an emergency because you do not freeze."
      },
      {
        "heading": "Challenges & Growth",
        "body": "Your first reaction arrives before your judgment does, so you send the sharp message, take the dare or snap at the waiter and regret it by evening. People read your directness as aggression even when you were only being quick. You get hurt more often than others because you rush, whether that is a sprained ankle or a bruised friendship. The fix is a ten-second gap before you answer anything that annoys you, and a real outlet for the energy every day, because on the days you skip it, it comes out at whoever is nearest."
      }
    ]
  },
  "mars-in-2nd-house": {
    "intro": "Your drive goes into money, possessions and the feeling of owning something you fought for. You work hard when the payoff is concrete.",
    "sections": [
      {
        "heading": "Life Areas & Gifts",
        "body": "You earn by effort, and you are better at it than people who wait for opportunities to arrive. Sales, trades, building a business from nothing or taking on the extra shift all suit you, because you will outwork the competition for a number you can see. You go after what you want and you do not apologise for wanting money. You also know your own worth and negotiate a raise with a straight face."
      },
      {
        "heading": "Challenges & Growth",
        "body": "You spend as fast as you earn. A bad day ends with an impulse purchase, a good day ends with a bigger one, and the account never gets ahead of you. You also fight over money fast, with a partner, a boss or a client, and you treat a fair question about a bill as an attack. Set up an automatic transfer to savings on payday before you can touch the money, and wait a full day before any purchase over a number you pick in advance."
      }
    ]
  },
  "mars-in-3rd-house": {
    "intro": "Your drive lives in your mouth and your hands. You think fast, talk fast and cannot leave a wrong statement alone.",
    "sections": [
      {
        "heading": "Life Areas & Gifts",
        "body": "You win arguments, and you are good at debate, negotiating, writing with an edge and any job where you must say a hard thing clearly. You learn quickly when there is a challenge attached, so a deadline or a rival makes you sharper. Short trips, quick errands and driving suit you more than they suit most people. Siblings and neighbours know you as the one who tells the truth plainly."
      },
      {
        "heading": "Challenges & Growth",
        "body": "You correct people who did not ask for it, and you can turn a casual disagreement at dinner into a fight nobody enjoys. You speak before the full facts are in, then defend the first version rather than admit you were off. Texts and emails written while angry cost you more than any real fight. Write the reply, leave it as a draft for an hour, and ask yourself whether you want to win the point or keep the person."
      }
    ]
  },
  "mars-in-4th-house": {
    "intro": "Your fire sits at home. The place you live, the family you grew up in and the privacy of your own door are where your temper and your energy both go.",
    "sections": [
      {
        "heading": "Life Areas & Gifts",
        "body": "You are the one who fixes, builds, paints and rearranges the house, and you defend the people under your roof without hesitation. Home projects calm you. Moving furniture, tearing out a wall or working in the yard burns off the tension you carry in. When a relative is in trouble you show up with a truck, not a card."
      },
      {
        "heading": "Challenges & Growth",
        "body": "Your anger saves itself for home. You can be patient at work all day and then snap at the people you love the moment you walk in. Family arguments run old scripts, and you may have grown up in a house where raised voices were normal, so you repeat it without noticing. Give yourself twenty minutes alone when you arrive, do something physical before dinner, and apologise the same night instead of letting the silence do the damage."
      }
    ]
  },
  "mars-in-5th-house": {
    "intro": "You play to win. Romance, creativity, games and risk are where your energy is at its strongest and its most reckless.",
    "sections": [
      {
        "heading": "Life Areas & Gifts",
        "body": "You chase, you flirt and you commit to a crush with full force. In creative work you produce a lot, finish things fast and perform well under an audience. You make a good coach, a good team captain and a fun parent because you turn everything into a contest the kids want to join. Sport, dance and anything with a scoreboard keep you happy."
      },
      {
        "heading": "Challenges & Growth",
        "body": "You treat love as a hunt and lose interest once the chase is over, or you pick fights in a relationship just to feel the spark again. Gambling, speculation and dares tempt you more than they should, and you tend to double down after a loss. You cannot take losing gracefully, and a board game with friends can turn sour. Choose one thing you pursue for the sake of it, with no scoreboard, and keep the real stakes for your bank account and your relationship out of the game."
      }
    ]
  },
  "mars-in-6th-house": {
    "intro": "Your energy goes into work, routine and your body. You are at your best when there is a lot to do and a reason to do it quickly.",
    "sections": [
      {
        "heading": "Life Areas & Gifts",
        "body": "You are the colleague who finishes the task while others are still discussing it. You thrive in physical or demanding jobs, medicine, trades, kitchens, the military, athletic training and any role where results show by the end of the day. You like a strict routine and a workout you can sweat through. You fix inefficiency on sight and are hard to replace."
      },
      {
        "heading": "Challenges & Growth",
        "body": "You overwork until your body sends the bill, with back trouble, headaches, inflammation or an injury from pushing too hard. You get irritated at slower coworkers and become the boss nobody asked for, which makes teams tense. Rest feels like laziness to you, so you skip it. Schedule a day off the way you schedule a meeting, and when someone works at a different speed, ask what they need rather than taking over their task."
      }
    ]
  },
  "mars-in-7th-house": {
    "intro": "Your drive shows up through other people. You meet your own aggression in partners, rivals and anyone who stands across the table from you.",
    "sections": [
      {
        "heading": "Life Areas & Gifts",
        "body": "You are drawn to strong, direct people and you bring real energy to a partnership. You stand up for the person you love and fight hard on their behalf. In business, negotiation or law you do well because you are not afraid of an opponent. A relationship with you is never dull, and you never leave a partner guessing where you stand."
      },
      {
        "heading": "Challenges & Growth",
        "body": "You attract fights, or you hand your anger to your partner and then complain they are the aggressive one. You may end up with someone who argues constantly, or you may swallow your frustration for months and then explode. Arguments about who decides what repeat until you each take responsibility for your own temper. Say what you want in the moment it bothers you, in plain words and at normal volume, and stop waiting for a partner to guess."
      }
    ]
  },
  "mars-in-8th-house": {
    "intro": "Your drive goes where most people do not look: shared money, sex, power and what a person hides. You want the whole truth, not the polite version.",
    "sections": [
      {
        "heading": "Life Areas & Gifts",
        "body": "You are strong in a crisis. When a funeral, a debt, a breakup or a medical scare hits, you stay steady and handle the details. You have a strong sexual drive and a hunger for real intimacy rather than flirtation. Investigation, surgery, finance, research and any work that deals with other people's money or secrets suits you."
      },
      {
        "heading": "Challenges & Growth",
        "body": "You hold grudges for years, and you can plan a quiet payback without anyone noticing. Jealousy and control show up in love, and you test partners to see if they will stay. Money shared with a partner or business associate becomes a battleground when you feel overpowered. Say what hurt you within a week while it is still small, and keep joint accounts and agreements written down so power never has to be argued about."
      }
    ]
  },
  "mars-in-9th-house": {
    "intro": "Your energy goes toward belief, travel and the big question of what is true. You argue about ideas the way other people argue about money.",
    "sections": [
      {
        "heading": "Life Areas & Gifts",
        "body": "You take a belief and act on it. You will pack a bag and fly to a country you have never seen, study for a hard degree or join a cause and give it a year of your life. Teaching, debate, legal work, adventure sport and long physical trips fit you. You are fearless about leaving the familiar, and you inspire people to try something bigger."
      },
      {
        "heading": "Challenges & Growth",
        "body": "You preach. A strong opinion about religion, politics or how people should live turns into a lecture at the dinner table, and you lose people who agree with half of what you say. You start trips and courses with enormous enthusiasm and quit when the first discomfort arrives. Ask a question before you state a conclusion, and finish one long project before beginning the next."
      }
    ]
  },
  "mars-in-10th-house": {
    "intro": "Your drive is aimed at your career and your name. You want to be at the top and you will work visibly to get there.",
    "sections": [
      {
        "heading": "Life Areas & Gifts",
        "body": "You are ambitious in a way people can see. You take on the hard assignment, lead the team through a deadline and do not wait for permission. Management, entrepreneurship, sport, the military, surgery and construction all reward you. You often reach authority early because you actually act when others hesitate."
      },
      {
        "heading": "Challenges & Growth",
        "body": "You clash with bosses, and you cannot hide it when someone above you is wrong. Your impatience can burn bridges, and rivals at work know exactly how to provoke you. You may work so hard on status that home life goes quiet. Pick your battles with senior people on a short list of what truly matters, and let a smaller win go so a bigger one stays possible."
      }
    ]
  },
  "mars-in-11th-house": {
    "intro": "Your energy runs through friends, groups and shared causes. You do best when you are fighting for something alongside other people.",
    "sections": [
      {
        "heading": "Life Areas & Gifts",
        "body": "You take charge of a team, a club or a movement and get it moving. Friends call you when something needs to be done, and you organise the event, the protest or the fundraiser. You push your friends to chase their goals and you are loyal in a fight. Competitive groups, sport teams and activist work bring out your best."
      },
      {
        "heading": "Challenges & Growth",
        "body": "You argue with friends over who leads, and a group can split because you pushed too hard on a point. You pick friends who match your intensity and then burn out on the drama. You also take on a cause when you are angry, and drop it when the anger fades. Let someone else run the meeting sometimes, and stay with a group long enough to see a project through before you judge it."
      }
    ]
  },
  "mars-in-12th-house": {
    "intro": "Your drive runs underground. Anger, desire and effort often stay hidden, even from you, until they show up in the body or in a sudden outburst.",
    "sections": [
      {
        "heading": "Life Areas & Gifts",
        "body": "You work well alone, behind the scenes and out of the spotlight. Hospitals, research, writing, charity work, therapy and quiet creative effort give your energy somewhere to go. You can be unusually strong for other people in private, helping at a bedside or carrying a secret. Solitary exercise such as swimming, long walks or lifting is where you find your calm."
      },
      {
        "heading": "Challenges & Growth",
        "body": "You swallow anger, smile and say you are fine, and then it leaks out as exhaustion, headaches, sleeplessness or a sudden blow-up that surprises everyone including you. You may fear your own temper so much that you never use it, and people walk over you. Secret resentments and hidden desires grow while you say nothing. Name the anger to one trusted person each week, in plain words, and give it a physical outlet before it has to find its own."
      }
    ]
  },
  "jupiter-in-1st-house": {
    "intro": "People trust you quickly. You carry an easy confidence that makes strangers open up and doors open.",
    "sections": [
      {
        "heading": "Life Areas & Gifts",
        "body": "You are lucky in first impressions. Your optimism is real, and people lean in when you describe what is possible. You take chances other people avoid, and more of them land than should. Teaching, selling, travel, public speaking and leadership roles fit you, and you take up room when you speak."
      },
      {
        "heading": "Challenges & Growth",
        "body": "You say yes to everything and promise more than you can deliver. Weight gain, overspending and overconfidence come from the same habit of assuming it will work out. You skip the boring preparation and then act surprised when the details sink the plan. Write down what you promised each week and cut the list in half, and test a big plan on a small scale before you tell everyone about it."
      }
    ]
  },
  "jupiter-in-2nd-house": {
    "intro": "Money tends to find you, and you tend to enjoy spending it. Your relationship with having things is generous and a little loose.",
    "sections": [
      {
        "heading": "Life Areas & Gifts",
        "body": "You attract income through opportunity, and you often earn more than expected in a field you like. You are generous with friends, you pay for the dinner and you help family with rent. Teaching, publishing, law, travel, import and food businesses suit you. You believe that money grows when you invest in the right thing, and often you are right."
      },
      {
        "heading": "Challenges & Growth",
        "body": "You overspend on the good life, with the better hotel, the second car and the dinner for ten, and call it an investment. Debt grows quietly because the next windfall always seems close. You lend money to people who will not repay it and feel too kind to ask. Set a monthly saving amount that moves automatically, and treat a loan to a friend as a gift you can afford to lose."
      }
    ]
  },
  "jupiter-in-3rd-house": {
    "intro": "You learn by talking, reading and moving around. Your mind jumps from topic to topic and enjoys every one of them.",
    "sections": [
      {
        "heading": "Life Areas & Gifts",
        "body": "You are a natural communicator, good at teaching, writing, selling and explaining complicated ideas in plain terms. You pick up languages and facts easily, and you enjoy short trips and conversations with strangers. Siblings, neighbours and classmates are usually a source of luck and support. You can make a topic sound like an adventure."
      },
      {
        "heading": "Challenges & Growth",
        "body": "You know a little about everything and finish little of it. You talk too much, exaggerate a story to improve it, and promise to read the book you never open. Your enthusiasm outpaces your accuracy, so people double check you. Pick one subject per season, go deep, and check one fact before you repeat it as true."
      }
    ]
  },
  "jupiter-in-4th-house": {
    "intro": "Home is where your luck lives. You do best with room, family and a place that feels like a base.",
    "sections": [
      {
        "heading": "Life Areas & Gifts",
        "body": "You tend to have a warm, generous family and a home with space for guests. Property and real estate often work in your favour, either through inheritance or a good purchase. You host holidays, feed everyone and make newcomers feel at home. A stable base gives you the confidence to take risks elsewhere."
      },
      {
        "heading": "Challenges & Growth",
        "body": "You buy the bigger house than you can afford, or fill the one you have with more than you need. Family can lean on your generosity until you resent it. You may romanticise your childhood and avoid the real conversation with a parent. Keep your housing cost well within your income, and say no to one family request this month that you would normally agree to out of habit."
      }
    ]
  },
  "jupiter-in-5th-house": {
    "intro": "You enjoy life with obvious relish. Romance, children, creativity and play are where luck tends to arrive.",
    "sections": [
      {
        "heading": "Life Areas & Gifts",
        "body": "You are a generous lover and a fun parent, the one who plans the birthday party and gets children laughing. Creative work, performing, teaching and entertainment come naturally, and you take chances in love that often pay off. You are lucky with games and speculation, at least for a while. People enjoy being around you because you make an ordinary evening feel like an event."
      },
      {
        "heading": "Challenges & Growth",
        "body": "You indulge. Too much food, too many drinks, too many romances at once, and a gambling streak that you read as luck instead of risk. You promise love lavishly and then struggle to follow through when it gets ordinary. Children and partners may see your generosity as a substitute for attention. Set a limit on the risks you take with money, and give your partner a plain, undivided evening each week instead of a grand gesture."
      }
    ]
  },
  "jupiter-in-6th-house": {
    "intro": "Your luck arrives through work. A good job, helpful colleagues and a useful routine tend to find you.",
    "sections": [
      {
        "heading": "Life Areas & Gifts",
        "body": "You do well in service work, health care, teaching, coaching and any role where you help people daily. Coworkers like you, bosses promote you and you find jobs through connections. You treat the work as meaningful, which makes it easier to do well. Pets, nutrition and fitness are areas where you enjoy learning."
      },
      {
        "heading": "Challenges & Growth",
        "body": "You take on too much work because each task looks reasonable alone. Weight, liver strain and overindulgence in food or drink build up slowly. You say yes to every favour and let your own routine slide. Cap your commitments at a number you set in advance, and keep two meals and one workout per week fixed no matter what else comes up."
      }
    ]
  },
  "jupiter-in-7th-house": {
    "intro": "Partners are your biggest source of luck. People who share your life tend to be generous, educated and good for you.",
    "sections": [
      {
        "heading": "Life Areas & Gifts",
        "body": "You attract capable, kind and often generous partners and business associates. Marriage and long partnerships tend to raise your standard of living and widen your world. You are fair in negotiation and good at making both sides feel heard, which suits law, counselling and diplomacy. You expect the best from people and often receive it."
      },
      {
        "heading": "Challenges & Growth",
        "body": "You expect your partner to supply the optimism, the money or the direction, and you drift when they do not. You commit before you know the person, then find the faults later. You may overpromise in the relationship and overlook red flags because you want it to be big and good. Ask a new partner direct questions about money, children and where you will live before you commit, and carry your own half of the planning."
      }
    ]
  },
  "jupiter-in-8th-house": {
    "intro": "Shared resources, inheritance and deep bonds tend to work in your favour. You get through crises with more help than you expected.",
    "sections": [
      {
        "heading": "Life Areas & Gifts",
        "body": "Money from other people, such as a partner's income, an inheritance, a loan, an investor or insurance, has a way of turning up when you need it. You handle loss and change calmly, and people turn to you in hard times. Finance, research, therapy, medicine and anything involving other people's money fit you. You are open about sex and intimacy and you want a bond that goes beyond surface."
      },
      {
        "heading": "Challenges & Growth",
        "body": "You borrow too freely and assume the credit will always be there. Joint money with a partner can be handled loosely, and one big debt can undo years of luck. You may count on an inheritance that never comes. Keep your own savings separate, read every contract on shared money, and plan as though the windfall will not happen."
      }
    ]
  },
  "jupiter-in-9th-house": {
    "intro": "Travel, study and belief expand your life more than anything else. You are happiest when you are learning something large.",
    "sections": [
      {
        "heading": "Life Areas & Gifts",
        "body": "You take to higher education, foreign countries and big ideas. Teaching, publishing, law, religion and travel work all suit you, and you often meet an important person abroad or in a classroom. Your faith, whether religious or personal, keeps you steady. You see the whole picture and help others see it too."
      },
      {
        "heading": "Challenges & Growth",
        "body": "You mistake being right for being wise, and your certainty can sound like preaching. You start too many courses, plan too many trips and leave the detail work to someone else. You overestimate how much you know about a place or a subject after one visit. Finish a degree or a project before you start the next, and ask a local or an expert before you give advice."
      }
    ]
  },
  "jupiter-in-10th-house": {
    "intro": "Your career tends to rise and your reputation tends to be good. People in charge notice you and give you more room.",
    "sections": [
      {
        "heading": "Life Areas & Gifts",
        "body": "You advance through confidence, a good reputation and well-timed opportunities. Positions of authority in teaching, law, publishing, politics, business or religion come to you, and you handle visibility well. You aim high and you often get far. People respect you because you treat employees and juniors generously."
      },
      {
        "heading": "Challenges & Growth",
        "body": "You aim so high that you skip steps, and you take credit for plans you have not finished. You may rely on luck and connections in place of skill and then stall when the favour runs out. Pride makes you take on a role larger than you can hold. Build one real skill that does not depend on anyone's goodwill, and finish the smaller job before you accept the bigger title."
      }
    ]
  },
  "jupiter-in-11th-house": {
    "intro": "Your luck comes through friends, groups and shared goals. The people you know open more doors than anything you do alone.",
    "sections": [
      {
        "heading": "Life Areas & Gifts",
        "body": "You have a wide circle of friends, and some of them are well-placed, kind and loyal. You belong to clubs, communities and causes, and you often find a job or a deal through them. You are generous with your time and good at introducing people who should meet. Your hopes for the future are large, and friends help you reach them."
      },
      {
        "heading": "Challenges & Growth",
        "body": "You collect people and then spread yourself thin, so no one gets your real attention. You say yes to every invitation and every cause and end up with a calendar you resent. You may rely on friends to give you a break instead of building something yourself. Choose three friendships and two groups to keep, and put your own name on one goal that does not depend on anyone else."
      }
    ]
  },
  "jupiter-in-12th-house": {
    "intro": "Your luck works quietly. Protection, faith and unseen help show up in the moments when you need them most.",
    "sections": [
      {
        "heading": "Life Areas & Gifts",
        "body": "You get through hard stretches with surprising ease, as if someone is looking out for you. Meditation, prayer, retreat, charity, hospital work, writing and anything done in private feel rewarding. You are kind to people who suffer and you understand loneliness without fear. You often find that what looked like a loss turns into an opening."
      },
      {
        "heading": "Challenges & Growth",
        "body": "You hide your generosity and your problems, and you under-use your own talent because you prefer the back room. Drinking, escapism and long periods of withdrawal can look like spiritual practice when they are avoidance. You may say yes to a stranger's need and ignore your own. Choose one place where you are visible each week, such as a class, a volunteer shift or a team, and speak your needs aloud to one person before they turn into a mood."
      }
    ]
  },
  "saturn-in-1st-house": {
    "intro": "You walked into rooms as a kid and felt like the oldest person in them. Strangers hand you responsibility before you have asked for it, and you usually take it.",
    "sections": [
      {
        "heading": "Life Areas & Gifts",
        "body": "People assume you know what you are doing, and most of the time you do, because you checked twice before you spoke. You are the one who gets handed the keys, the budget or the crisis, since your face stays calm while everyone else's falls apart. You build a reputation slowly and it holds, so a promise from you is treated like a signed contract. You look better at forty than you did at twenty, and people who dismissed you early end up asking for your opinion."
      },
      {
        "heading": "Challenges & Growth",
        "body": "You hold your shoulders like someone about to be judged, so people read you as cold when you are just guarded. You criticise yourself first and hardest, which means a compliment bounces off and a small mistake keeps you awake. You wait until you feel ready to enjoy yourself, and ready never arrives, so you skip the party, the trip or the day off and call it discipline. The habit that fixes it is small and deliberate: say what you want out loud before you have earned it, and let one thing a week be fun with no purpose attached. You stop being the strict parent to yourself, and the seriousness turns into authority instead of a weight."
      }
    ]
  },
  "saturn-in-2nd-house": {
    "intro": "Money has never felt casual to you. You learned early that nothing arrives unless you carry it in yourself, and that shapes every purchase.",
    "sections": [
      {
        "heading": "Life Areas & Gifts",
        "body": "You are unusually good at making a little go a long way. You track what comes in, you notice the subscription nobody else remembers, and you build savings in quiet increments that look boring until year ten. Employers and clients trust you with budgets because you treat their money like your own, which is to say carefully. The self-worth that grows out of this is slow to arrive but hard to shake, since it rests on things you actually built."
      },
      {
        "heading": "Challenges & Growth",
        "body": "You can sit on a healthy bank balance and still feel one bad month from the street. So you say no to the good coat, the holiday and the dentist, then resent people who spend freely. You also tie your value to your numbers, which means a pay cut or a lean quarter feels like a verdict on you. The fix is to set a spending amount for pleasure each month, written down, and spend it without a speech to yourself afterward. When you can enjoy what you have built and still know you are worth something in a broke week, the money finally works for you instead of watching over you."
      }
    ]
  },
  "saturn-in-3rd-house": {
    "intro": "Talking did not come easily at first, and you learned to choose words the way other people choose a mortgage. What you eventually say tends to be worth hearing.",
    "sections": [
      {
        "heading": "Life Areas & Gifts",
        "body": "You think before you speak, so when you do, people stop and listen. You are strong at anything that rewards precision: contracts, technical writing, teaching a hard subject step by step, reading the fine print. You keep a small circle of siblings, neighbours or old friends for decades rather than collecting acquaintances. Your studying habits are better than they feel, because you learn thoroughly and forget slowly."
      },
      {
        "heading": "Challenges & Growth",
        "body": "You rehearse a sentence so long that the moment passes, then replay the conversation at 2 a.m. with the version you should have said. You assume you are the slow one in the room and hold back an idea, only to hear someone else say it ten minutes later and get the credit. A sibling or a teacher may have shut you down early, and you still brace for the same response. The habit to build is saying the rough version out loud in the meeting, text or class, and fixing it afterward. Your first drafts are better than you think, and speed will come from repetition, not from waiting until it is perfect."
      }
    ]
  },
  "saturn-in-4th-house": {
    "intro": "Home was the place where you learned to be careful. Either it felt cold and strict, or you were the one holding it together.",
    "sections": [
      {
        "heading": "Life Areas & Gifts",
        "body": "You are the person who ends up building the stable base for everyone else. You buy the house, fix the roof, host the holiday and remember the family dates because nobody else will. Late in life you create the secure, warm home you did not have, and it is a better one than most people manage because you built it on purpose. Older relatives lean on you, and you carry the family history with real loyalty."
      },
      {
        "heading": "Challenges & Growth",
        "body": "You flinch at being needed and also resent not being looked after. A parent who was distant, demanding or absent left you wary of closeness at home, so you tidy, plan and manage when you could simply sit down and be with your own people. Your own household can turn into another job, and the people in it start to feel like a to-do list. The fix is to name the old family rule you are still obeying, usually something like do not ask for help, and break it once on purpose with a partner or friend. Home gets warmer the day you let someone else carry the groceries."
      }
    ]
  },
  "saturn-in-5th-house": {
    "intro": "Play does not come naturally to you, and you notice it every time you watch someone else being silly without a plan. You build joy the way you build everything else, one brick at a time.",
    "sections": [
      {
        "heading": "Life Areas & Gifts",
        "body": "When you commit to a creative project, you finish it, which puts you ahead of most talented people. You are patient with children, students and anyone you are teaching, and you do not talk down to them. In love you are slow to say the words but the loyalty that follows is real, and your romances tend to last because you do not play games. Hobbies you take up seriously, whether woodwork, music or a sport, turn into real skill by your forties."
      },
      {
        "heading": "Challenges & Growth",
        "body": "You watch yourself having fun and grade it. A date, a dance floor or a paint set feels like a test, so you stay home or turn it into a competence exercise. You pick partners who need fixing or who feel safe rather than exciting, then wonder why the spark never shows up. If you have kids, you worry about getting it wrong so loudly that you forget to enjoy them. Schedule one useless, unproductive thing every week and do it badly on purpose, because laughing at yourself is the muscle you are missing."
      }
    ]
  },
  "saturn-in-6th-house": {
    "intro": "Work is where you prove yourself, and you rarely let a task leave your desk half done. Your body keeps the score of how hard you push.",
    "sections": [
      {
        "heading": "Life Areas & Gifts",
        "body": "You are the colleague who reads the instructions and then writes better ones. Systems, checklists and routines come easily, and you make a messy department run on time without announcing it. You are strong at any job built on accuracy, like auditing, nursing, engineering, editing or logistics. Over the years your steady method makes you the person management quietly depends on."
      },
      {
        "heading": "Challenges & Growth",
        "body": "You say yes to extra work because saying no feels lazy, and your back, stomach or sleep pays for it. You hold yourself to a standard that nobody in the office even asked for, then resent the people who clock off on time. Rest feels like falling behind, so you recover badly and get sick on the first day of a holiday. The fix is a fixed stop time, an actual lunch break, and one task a day that you let be good enough. You get more done at forty hours of steady effort than at sixty hours of tight jaws."
      }
    ]
  },
  "saturn-in-7th-house": {
    "intro": "You take commitment seriously enough that you can look slow to outsiders. Partners and business allies are chosen with a long timeline in mind.",
    "sections": [
      {
        "heading": "Life Areas & Gifts",
        "body": "When you finally commit, you stay, and your partner knows you will still be there in a bad year. You are strong in contracts, long marriages and business partnerships, since you read the terms and keep your side. You often pair with someone older, steadier or more established, and the relationship gets better with time rather than worse. People trust you with their secrets because you do not gossip."
      },
      {
        "heading": "Challenges & Growth",
        "body": "You either marry late, marry the wrong sort of responsible person, or hold back from love so long that the person gives up waiting. You can fall into the role of the grown-up in a couple, which means your partner stops growing up and you start resenting it. You expect to be disappointed, so you test the other person and then treat their failure as proof. Saying what you need before it turns into a grievance is the habit that changes things. A relationship stops feeling like a duty when you let it be two people, not a manager and an employee."
      }
    ]
  },
  "saturn-in-8th-house": {
    "intro": "Shared money, debt, inheritance and anything intimate gets examined by you before you let it near your life. You want proof, not promises.",
    "sections": [
      {
        "heading": "Life Areas & Gifts",
        "body": "You are excellent with other people's resources, which suits you to roles in accounting, insurance, probate, therapy or negotiation. You keep a joint account tidy, you read the loan documents and you do not take on debt you cannot explain. Crisis does not rattle you, so people turn to you at funerals, in divorces and during medical scares. Over time you gain a calm about loss and change that others envy."
      },
      {
        "heading": "Challenges & Growth",
        "body": "Trust has to be earned in installments, which means a partner can feel interrogated about money, exes or the past. You may avoid intimacy or sex until you feel absolutely safe, and that moment keeps moving. You carry fear of loss and control, so you hoard, you plan for disaster and you refuse help from a spouse or family. A debt, an inheritance dispute or a bereavement can sit unresolved for years because you will not talk about it. Say the money number or the fear out loud to one person you trust, and the grip loosens."
      }
    ]
  },
  "saturn-in-9th-house": {
    "intro": "You do not take beliefs on faith. You test them for years, and what survives becomes the spine of how you live.",
    "sections": [
      {
        "heading": "Life Areas & Gifts",
        "body": "You earn your authority in teaching, law, publishing or any field that rewards long study. You finish the degree, the language or the certification that others quit at the halfway mark, and it pays off in your forties. Your beliefs are your own, tested and reasoned, so people take your advice seriously. When you travel, you go with purpose and come home with something you can use."
      },
      {
        "heading": "Challenges & Growth",
        "body": "You can turn rigid. You reject a religion, a country or a way of thinking after one bad experience and then defend your position against all evidence. Doubt eats at you in the opposite direction, so you stay at a job or a town because leaving feels irresponsible. You also hold back from a bigger life, whether abroad, in study, or in a calling, until you have proof it will work. Take one trip or one course where success is not required, and let a worldview change in front of you without treating that as failure. Your convictions get stronger when you are allowed to revise them."
      }
    ]
  },
  "saturn-in-10th-house": {
    "intro": "Ambition sits at the centre of your life, and you know it from your teens. You build a career the long way, and the view from the top is solid.",
    "sections": [
      {
        "heading": "Life Areas & Gifts",
        "body": "You climb steadily and get promoted for reliability more than for flash. People see you as the person in charge before you hold the title, and when you finally do hold it you run things well. You are strong in management, public roles, building a business or anything where reputation is built over decades. Your peak tends to come late, and it lasts longer than the quick starters' careers."
      },
      {
        "heading": "Challenges & Growth",
        "body": "You measure your whole worth by your standing, so a demotion, a layoff or a slow year hits like a personal collapse. You work for approval from a parent or boss who is never satisfied, and you keep raising the bar to earn it. Family and health get what is left over, and you notice only when someone leaves. The fix is to decide what enough looks like in writing, then protect one evening a week that belongs to no one's expectations. Success feels real when it is yours, not a response to somebody's old judgement."
      }
    ]
  },
  "saturn-in-11th-house": {
    "intro": "You keep a short friend list and take it seriously. Groups and causes get your time only after you have checked they deserve it.",
    "sections": [
      {
        "heading": "Life Areas & Gifts",
        "body": "Your friends are loyal ones, often older or more mature than your age group, and some stay for forty years. In an organisation you become the treasurer, the secretary or the person who actually does the work. You are strong at long-term goals because you break a distant dream into plain steps and then take them. Communities trust you since you show up when it is boring."
      },
      {
        "heading": "Challenges & Growth",
        "body": "You feel like an outsider in a crowd and conclude that people do not want you, so you leave before you are sidelined. You may carry a school memory of being left out and still scan new groups for rejection. You can also hang onto a friendship or a club out of duty long after it stopped feeding you. Join one group with no responsibility attached, just for the company, and stay a month longer than feels comfortable. The dreams you hold back from sharing are the ones you most need other people to help carry."
      }
    ]
  },
  "saturn-in-12th-house": {
    "intro": "Much of your inner life runs where no one sees it. You carry fears and duties that you rarely say aloud.",
    "sections": [
      {
        "heading": "Life Areas & Gifts",
        "body": "You do your best work alone and out of the spotlight, in research, writing, nursing, counselling, or behind the scenes in a larger operation. You have a deep capacity for solitude, and retreat restores you rather than punishes you. People in hospitals, prisons and recovery rooms respond to your steady, unshowy presence. Over time you turn private pain into quiet wisdom that is practical, not preachy."
      },
      {
        "heading": "Challenges & Growth",
        "body": "You hide your worries until they surface as insomnia, guilt or a flat mood nobody can explain. You judge yourself in private harder than anyone outside would, and you expect punishment for things you did not do. You sometimes sabotage yourself right before you succeed, then call it bad luck. Weekly therapy, a journal, a spiritual practice or one honest friend gives the fear a place to go that is not your body. Once you say a thing out loud it shrinks, and the strength that was hiding becomes available for your life."
      }
    ]
  },
  "uranus-in-1st-house": {
    "intro": "You are the odd one out and you stopped apologising for it a long time ago. People feel a jolt when you walk in.",
    "sections": [
      {
        "heading": "Life Areas & Gifts",
        "body": "You show up looking and sounding like yourself, which is not like anyone else in the room. You think fast, you take sudden turns, and you reinvent your appearance, job or city more than once without burning out. People hand you the weird project because you are not afraid of it. You inspire others simply by refusing to follow the script."
      },
      {
        "heading": "Challenges & Growth",
        "body": "You rebel by reflex, so you can reject a good idea because someone in authority suggested it. Your mood and plans shift without warning, which leaves friends and partners unsure what version of you will arrive. You push people away right when they get close, then wonder why you feel isolated. The fix is to choose what you are rebelling for, not just what you are rebelling against, and to give one close person notice before you change direction. Your freedom stops costing you your relationships when you can be unpredictable on purpose instead of in panic."
      }
    ]
  },
  "uranus-in-2nd-house": {
    "intro": "Your income has never followed a straight line, and your idea of security is not the usual one. You value independence more than a steady payslip.",
    "sections": [
      {
        "heading": "Life Areas & Gifts",
        "body": "You find money in places other people overlook: freelance work, new technology, odd talents and side projects. You are quick to spot a trend and adapt your earnings before the market catches up. You hold few possessions out of sentiment, so you can move or start over with little baggage. Your sense of worth comes from your originality, which makes you hard to replace."
      },
      {
        "heading": "Challenges & Growth",
        "body": "Cash arrives in lumps and leaves the same way. You quit a stable job on a hunch, buy a gadget you will use twice, or lend money to a clever friend who vanishes. Your self-esteem rises and falls with the bank balance, and the swing is hard on you. Keep a boring buffer account you are not allowed to touch, and automate one saving so that the unpredictable income has a floor. You can stay as inventive as you like once you have rent for six months sitting somewhere safe."
      }
    ]
  },
  "uranus-in-3rd-house": {
    "intro": "Your mind jumps. You get an idea, say it before you have finished thinking it, and you are already onto the next one.",
    "sections": [
      {
        "heading": "Life Areas & Gifts",
        "body": "You learn fast and in odd ways, often teaching yourself a skill by taking it apart. You are strong at technology, writing, debate, and any job where thinking differently is the point. Conversations with you go places nobody planned. Siblings and neighbours either love your oddness or find it exhausting, and you tend to have at least one lifelong friend who gets you."
      },
      {
        "heading": "Challenges & Growth",
        "body": "You interrupt, finish other people's sentences and lose track of conversations because your next thought has arrived. You start courses, books and projects with great energy and abandon them when the novelty fades. Nerves run high, so you may struggle to sleep or sit still. A school or family that wanted you to conform made you feel stupid when you were just wired differently. Pick one thing and finish it to the end each month, and listen for five sentences before you answer. Your brilliance gets traction the day it arrives with follow-through."
      }
    ]
  },
  "uranus-in-4th-house": {
    "intro": "Home life never settled into a pattern for you. Either the family was unconventional, or you broke away from it as soon as you could.",
    "sections": [
      {
        "heading": "Life Areas & Gifts",
        "body": "You make a home that fits you instead of one that looks right. You may live somewhere unusual, with unusual people, and be happier for it. You are good at reinventing the idea of family, with friends, chosen relatives and mixed households. You move easily, adapt to new places, and bring a sense of freedom into any room you live in."
      },
      {
        "heading": "Challenges & Growth",
        "body": "Your roots feel unstable, so you find it hard to say where you belong. A parent who was unpredictable, absent or abruptly gone left you jumpy about closeness at home. You move house or cut off relatives suddenly, and the people involved are left stunned. The fix is to build one reliable ritual at home, like a weekly meal or a fixed evening, so stability exists even if the address changes. You can keep your independence and still have a place where somebody expects you to be."
      }
    ]
  },
  "uranus-in-5th-house": {
    "intro": "Fun, romance and creativity come with a spark of surprise. Nothing about the way you play looks like a copy of anyone else.",
    "sections": [
      {
        "heading": "Life Areas & Gifts",
        "body": "You are original in love and in art, and you attract people who find you refreshing. You make things that cannot be filed under a category, whether music, games, comedy or a new kind of date. You treat children and creative projects as places to experiment, not to follow rules. Your attraction runs on friendship and wit, which keeps your romances interesting."
      },
      {
        "heading": "Challenges & Growth",
        "body": "You fall hard and fast, then bolt when the thing gets routine. You test partners with sudden coldness or a fling to see if they will stay, and the answer is usually no. Gambling, thrill-seeking and risky bets feed you, so you can lose more than you planned. The fix is to tell a partner early that you need space and then really come back, which builds trust faster than disappearing. Commitment stops feeling like a cage when it includes room to be strange inside it."
      }
    ]
  },
  "uranus-in-6th-house": {
    "intro": "Routine bores you almost on contact. You work best when the day looks different from yesterday.",
    "sections": [
      {
        "heading": "Life Areas & Gifts",
        "body": "You find faster, smarter ways to do a task, and people notice the pattern after the first month. You are suited to technology, alternative health, freelancing, problem-solving jobs and anything with shifting demands. Colleagues come to you when the system is broken, since you fix it without drama. You keep your health habits interesting enough to stick, and you try the new therapy or diet before most people have heard of it."
      },
      {
        "heading": "Challenges & Growth",
        "body": "You are restless with bosses and rules, and you quit before the notice period feels fair. Your nervous system runs hot, so sleep, digestion or tension in the neck goes first. You drop a healthy routine as soon as it feels dull, then wonder why you fell off. Build a loose structure with a changing menu inside it, like the same morning walk on a different route. Work and health both hold up when the frame is stable and the content gets to vary."
      }
    ]
  },
  "uranus-in-7th-house": {
    "intro": "You want a partner who leaves you free, and you tend to attract people who surprise you. Relationships start with a jolt.",
    "sections": [
      {
        "heading": "Life Areas & Gifts",
        "body": "You are drawn to people unlike you: foreign, unusual, younger, older or just strange in a way you like. A good relationship with you feels like friendship with chemistry, with plenty of talk and little possessiveness. You respect your partner's independence and expect the same in return. Business partners and clients who are original or unusual end up being your best matches."
      },
      {
        "heading": "Challenges & Growth",
        "body": "You swing between needing someone and needing out, and the partner feels the whiplash. You may marry fast, split fast, or keep one foot at the door the entire time. You pick people who are unavailable so that you do not have to face your own wish for closeness. Say the plain version, like I need a night alone and then I want to be with you, before you pick a fight to create distance. The relationship becomes stable once your partner knows the door is closed behind you, not just unlocked."
      }
    ]
  },
  "uranus-in-8th-house": {
    "intro": "Change in your life tends to come as an event, not a process. Shared money, intimacy and endings arrive without warning.",
    "sections": [
      {
        "heading": "Life Areas & Gifts",
        "body": "You handle sudden shifts better than most because you think quickly under pressure. You are drawn to research, psychology, occult subjects, investigations and unusual money arrangements. Intimacy with you is experimental and honest, and you bring a clean eye to what others avoid. People rely on you in crisis because you do not panic."
      },
      {
        "heading": "Challenges & Growth",
        "body": "A partner's finances, an inheritance, or a shared debt can flip overnight, and you find out late. You avoid emotional closeness by treating it as an intellectual puzzle, which leaves the other person feeling analysed. You may cut off hard and fast when trust breaks. Keep your own account and your own paperwork in order so surprises hit less. Talking about fear before it becomes a decision to leave gives you the intimacy you keep saying you want."
      }
    ]
  },
  "uranus-in-9th-house": {
    "intro": "Your beliefs came by rebellion or by awakening, and you do not hold your parents' worldview by default. Big ideas hit you suddenly and change your direction.",
    "sections": [
      {
        "heading": "Life Areas & Gifts",
        "body": "You love travel to unusual places, unconventional teachers and fields that rewrite the textbook. You do well in science, alternative education, publishing, astrology and any area where you get to question assumptions. Your views are original, and you share them in ways that make a room rethink. A single trip or course can change your whole life plan, and you are willing to let it."
      },
      {
        "heading": "Challenges & Growth",
        "body": "You switch philosophies as fast as you switch playlists, so nothing gets deep enough to hold you. You preach your latest conviction to people who did not ask, and you dismiss anyone who disagrees as asleep. Education starts and stops, leaving half finished degrees. Commit to one subject for a full year before judging it. Insight needs depth, and you have the curiosity, so give it a stretch of time to settle."
      }
    ]
  },
  "uranus-in-10th-house": {
    "intro": "You will not follow a career script, and the one you build looks nothing like your parents'. Your reputation is for being different.",
    "sections": [
      {
        "heading": "Life Areas & Gifts",
        "body": "You succeed in new fields, in technology, in media, in reform work, or in any role that did not exist twenty years ago. You tend to have several careers, and each one teaches you something the next uses. Authority figures find you either refreshing or threatening, and you attract mentors who like your edge. You are at your best when you set your own hours and your own methods."
      },
      {
        "heading": "Challenges & Growth",
        "body": "You walk out of jobs without a plan, and your résumé looks like a series of dramatic exits. You clash with bosses on principle and cannot take an order that comes without a reason. A sudden firing, a business that folds, or a public reversal can hit your standing. Keep a backup income and a trusted reference at every job, and pick fights you can win. Your originality earns more when you stay long enough for the work to compound."
      }
    ]
  },
  "uranus-in-11th-house": {
    "intro": "Friends are your favourite subject, and you collect them from every possible corner. Your circle is wide, odd and full of talent.",
    "sections": [
      {
        "heading": "Life Areas & Gifts",
        "body": "You belong to groups that are ahead of their time: online communities, activist causes, tech circles, creative collectives. You bring people together who would never otherwise meet, and you spot a good idea in a crowd before anyone else. Friendships with you are loyal but unclingy, built on shared interests instead of obligation. Your hopes for the future are vivid and often come true years later."
      },
      {
        "heading": "Challenges & Growth",
        "body": "You drop friends suddenly if they bore you or disagree, and you do not always explain. You go cold during a group conflict, which leaves people wondering what they did. You also join so many causes that none gets your full effort. Pick two groups, keep them for years, and tell a friend directly when something bothers you. Real community builds when you stay for the dull stretch between exciting meetings."
      }
    ]
  },
  "uranus-in-12th-house": {
    "intro": "Your strangest thoughts run underground. You have flashes of insight that arrive at night, in dreams, or in solitude, and you rarely announce them.",
    "sections": [
      {
        "heading": "Life Areas & Gifts",
        "body": "You have a strong intuition that works like a hunch you cannot explain but keep being right about. You find your best ideas in quiet, in meditation, in sleep, or in long walks alone. You are suited to research, healing, spiritual work, and creative fields that need an unconscious source. You often understand outsiders and misfits because you have felt like one."
      },
      {
        "heading": "Challenges & Growth",
        "body": "You hide your oddness so well that nobody knows who you are, and that makes you lonely. Anxiety, racing thoughts and sleep disruption come in waves, and you cannot tell what set them off. You sabotage a plan at the last moment without knowing why, then feel baffled. Keep a dream journal or a daily writing page, and show the strange material to one safe person. What you hide stops running your decisions once you give it somewhere to go."
      }
    ]
  },
  "neptune-in-1st-house": {
    "intro": "People meet a version of you that changes depending on who is standing in front of them. You walk into a room and pick up its mood before anyone has said a word, and half the time you leave carrying it. Your first impression is soft, hard to pin down and strangely memorable.",
    "sections": [
      {
        "heading": "Life Areas & Gifts",
        "body": "You are unusually good at making people feel seen. Strangers tell you things on trains, and clients, patients and friends arrive with the thing they have told nobody else. You read tone, silence and the lie under a cheerful sentence faster than most people read the words. That makes you strong in music, film, photography, acting, caregiving and any work where you have to become someone else for an hour. Because you reflect people back, they fall for a version of you that is partly their own projection."
      },
      {
        "heading": "Challenges & Growth",
        "body": "You answer the question of what you want by checking what everyone else wants first, and after a long enough stretch you cannot find your own answer. You agree in the meeting and resent it in the car. Wine, sleep, scrolling and a good fantasy become the quiet exits when a room asks too much of you. The habit that fixes it is small and repeated: decide your preference before you walk in, say it first at least once a day, and leave a crowded room before you are drained rather than after. A fixed morning routine gives you a shape to return to when everything else bends."
      }
    ]
  },
  "neptune-in-2nd-house": {
    "intro": "Money slides through your hands in a way that surprises even you. You want to earn from something that feels meaningful, and a payslip for work you find empty makes you quietly miserable.",
    "sections": [
      {
        "heading": "Life Areas & Gifts",
        "body": "You earn best when the work has beauty, mercy or imagination in it: music, design, healing, teaching, charity, film, anything with a story. Money tends to arrive from people who trust you, sometimes at the moment you were about to panic. You are generous without keeping a ledger, and people remember it. You can price a thing by how it feels rather than what it costs, which makes you a good judge of what is worth buying and what is hollow. You rarely chase wealth, and that calm makes people want to pay you."
      },
      {
        "heading": "Challenges & Growth",
        "body": "The leak is vagueness. You do not open the bank app, you lend to a friend with a sad story and never mention it again, and you sign things without reading page two. Someone with a persuasive pitch and a warm voice finds you easy. The fix is boring and it works: an automatic transfer to savings on payday, a written agreement for every loan, and a rule that you wait 48 hours before any investment or money favour. Look at your balance on a set day each week, even when you dread it."
      }
    ]
  },
  "neptune-in-3rd-house": {
    "intro": "You think in pictures and half-heard feelings before you think in sentences. A conversation with you wanders off somewhere interesting, and sometimes ends up somewhere neither of you planned.",
    "sections": [
      {
        "heading": "Life Areas & Gifts",
        "body": "You write and speak in images people remember: a line of a poem, a song hook, a story that makes a table go quiet. Siblings, neighbours and classmates tell you things they would not tell others because you listen without hurrying them. Your hunches about what someone means are right more often than your notes from the meeting. Music, lyrics, fiction, voice work and translating feelings into words are natural territory. You learn best through stories and examples, not lists."
      },
      {
        "heading": "Challenges & Growth",
        "body": "You forget the appointment, mishear the number and nod along to instructions you did not follow. Dry facts slide off, so you skim contracts and emails and then find out later what they said. You also tell small convenient untruths to smooth a moment, and you half believe them yourself. Write everything down at the moment it is said, repeat back dates and amounts, and read the important thing twice with a pen in your hand. Save the dreamy, loose talk for the places that want it, and give plain facts when someone is relying on you."
      }
    ]
  },
  "neptune-in-4th-house": {
    "intro": "Home for you is a feeling before it is an address. You need somewhere quiet and soft to come back to, and a loud or chaotic house wears you down faster than any job.",
    "sections": [
      {
        "heading": "Life Areas & Gifts",
        "body": "You make rooms that calm people: candles, water, plants, music, a blanket on the chair, a kettle that is always on. Friends fall asleep on your sofa and say they have not slept like that in weeks. You pick up your family's unspoken history, so you know who was hurt and who was never forgiven without anyone telling you. Living near water, or with a window full of sky, settles you. You are good at looking after a parent, a child or a house in a way that feels like shelter."
      },
      {
        "heading": "Challenges & Growth",
        "body": "Your family story has gaps, and you fill them with the version you can live with. A parent who drank, vanished, was ill or lied may have left an atmosphere you absorbed as a child and still feel as a vague unease at home. You idealise the childhood, or you blame yourself for it, and either way you avoid asking the direct question. You also move into a place on a feeling and find the damp, the noise or the landlord later. Ask the questions out loud to the relatives who are still alive, inspect a home as hard as you fall for it, and keep one corner that is yours alone."
      }
    ]
  },
  "neptune-in-5th-house": {
    "intro": "Romance, play and creating for its own sake are where you go to feel alive. You fall in love with the idea of a person fast, and you make things that arrive more like gifts than plans.",
    "sections": [
      {
        "heading": "Life Areas & Gifts",
        "body": "You are a natural performer, writer, painter, dancer or storyteller, and your best work comes when you stop managing it. With children and animals you are tender and inventive, and you can turn an ordinary Tuesday into a story. In love you are romantic in a way people remember for years: the handwritten note, the playlist, the trip to the sea. You bring imagination to flirting, hobbies and holidays. Your creative ideas arrive as full pictures, and the job is to catch them."
      },
      {
        "heading": "Challenges & Growth",
        "body": "You fall for potential. The person who is charming, wounded and nearly available is exactly your type, and you spend months loving who they could become. You find out the partner is married, in debt or still in love with an ex a little after everyone else did. Gambling, flirtation and late nights can carry the same pull, a chance to feel something large. Give any new love ninety days before you make plans, ask two direct questions about their last relationship, and finish one creative project all the way rather than starting five. Finishing is what turns the gift into something other people can use."
      }
    ]
  },
  "neptune-in-6th-house": {
    "intro": "Daily work and your body tell you the truth about your life before your mind will. You want your job to mean something, and a routine that feels like drudgery drains you quickly.",
    "sections": [
      {
        "heading": "Life Areas & Gifts",
        "body": "You are the colleague who senses the team is falling apart a week before the manager does. Healing work, nursing, therapy, animal care, music, art and anything that serves the vulnerable suits you. You bring a gentle atmosphere to a workplace, and people come to you when they are frazzled. Your body reacts to stress, food, medication and the mood of a room with precision, which is a warning system if you listen. You work well on tasks that let you help someone directly and see it land."
      },
      {
        "heading": "Challenges & Growth",
        "body": "Your schedule slips, and so do the details: missed deadlines, unclear boundaries, and a pile of tasks nobody formally gave you but you took anyway. Fatigue, allergies, stomach trouble and symptoms that doctors struggle to name arrive when you ignore what you need. You say yes to the coworker who needs a favour and end up doing their job at 9 pm. Build a fixed daily routine with set meal and sleep times, keep a written task list, and say no to one extra request a week. Treat unexplained symptoms seriously and get them checked rather than waiting for them to pass."
      }
    ]
  },
  "neptune-in-7th-house": {
    "intro": "In close partnership you see the person you hope for first, and the person who is actually there second. You give more to a partner than you tell them you are giving.",
    "sections": [
      {
        "heading": "Life Areas & Gifts",
        "body": "You love with real devotion, and you notice what a partner is feeling before they do. Clients, business partners and spouses trust you because you do not judge them, and you can forgive what others cannot. You are good at creative partnerships, healing practices and relationships built on a shared faith or art. You make a person feel understood in the first conversation, which is why they get close quickly. The partners you attract tend to be artistic, spiritual or fragile in some way."
      },
      {
        "heading": "Challenges & Growth",
        "body": "You choose people you can rescue, then wonder why you are exhausted and unthanked. A partner who is evasive, addicted or a little dishonest can hold you for years because you keep reading the best into every excuse. You say it is fine, you do not say what you need, and the resentment comes out in the third year as a sudden cold exit. Notice the pattern in the first month: when someone's story keeps changing, believe the changes. Check a partner's claims against facts, ask for what you need in plain sentences, and in business partnerships put every term on paper."
      }
    ]
  },
  "neptune-in-8th-house": {
    "intro": "Shared money, sex, grief and the things nobody says out loud are territory you handle by feel. You sense what is hidden between people, and you are drawn to the edge where one life merges into another.",
    "sections": [
      {
        "heading": "Life Areas & Gifts",
        "body": "You are at ease with death, endings and the unspeakable, so people who are grieving or frightened want you in the room. Intimacy for you is close to spiritual, and you bond through trust and surrender, not technique. You have a feeling for what a partner is hiding, and for the real situation behind a family inheritance or a joint account. Work in counselling, hospice care, hypnosis, psychology or research into the unseen suits you. Your dreams and hunches about other people's money and secrets are usually right."
      },
      {
        "heading": "Challenges & Growth",
        "body": "The practical side of shared resources goes blurry. You sign a joint loan without reading it, trust a partner with the accounts, or leave an inheritance unclear and it turns into a family feud. Deception around money or sex, done to you or by you, is the typical wound. You can merge so fully with a lover that you stop knowing which feelings are yours. Keep your own account, get legal and financial arrangements in writing with a third party, and talk about money before the wedding, not after. In sexual and emotional intimacy, say what you want and what you will not do."
      }
    ]
  },
  "neptune-in-9th-house": {
    "intro": "You want a belief big enough to live inside, and you will travel, study or pray a long way to find one. Truth for you is something you feel in the body, and a teacher who only gives facts leaves you cold.",
    "sections": [
      {
        "heading": "Life Areas & Gifts",
        "body": "You are drawn to pilgrimage, retreats, foreign countries, spiritual traditions and long study of how people make meaning. You can sit with a person from a different culture or faith and find the thing you share. Teaching, writing, film, philosophy and ministry give you a platform where your sincerity carries. Travel by sea, or to places with ruins, temples and old stories, changes you more than it changes other people. Your faith, when it is real, comforts people who have lost theirs."
      },
      {
        "heading": "Challenges & Growth",
        "body": "You can attach yourself to a guru, a movement or a theory without testing it, because the vision is beautiful and the leader is warm. You give money, years and your judgment to people who sound certain. When the disillusion comes, you drop the whole belief rather than sorting what was real. Ask of any teacher what followers owe them, what happens to those who leave, and what can be checked. Keep one trusted friend outside the group, travel with return tickets and a budget, and test a big idea against a hard fact before committing."
      }
    ]
  },
  "neptune-in-10th-house": {
    "intro": "Your public life has a haze around it. People see you as inspiring, mysterious or hard to place, and you are not always sure yourself what your career is supposed to be.",
    "sections": [
      {
        "heading": "Life Areas & Gifts",
        "body": "You do well in work that moves an audience: film, music, photography, fashion, healing, ministry, charity and any role where you stand for an ideal. People project authority and kindness onto you, and you can use that to lead with a vision rather than a rulebook. Your reputation grows through the feeling people have after meeting you. You can step into a public role that serves the vulnerable and become known for it. You sense where the culture is heading before the data shows it."
      },
      {
        "heading": "Challenges & Growth",
        "body": "The career path wanders. You take a job because it sounds meaningful, find out it is political or underpaid, and drift out without a plan. A boss or mentor you idealised turns out to be flawed, or a rumour about you spreads and you never correct it. You avoid putting yourself forward because you dislike self-promotion, and then someone else gets the role. Set a concrete goal with a date, get your agreements about title and pay in writing, and answer a rumour with one clear sentence. Choose a field where the work product is visible, so your reputation rests on something that cannot blur."
      }
    ]
  },
  "neptune-in-11th-house": {
    "intro": "Friendships and groups are where you look for a better world. You give your loyalty to causes and people who share a dream, and you find it painful when they fall short.",
    "sections": [
      {
        "heading": "Life Areas & Gifts",
        "body": "You gather people around an idea: a community project, an online group, a creative collective, a charity. Your friends come from every background, and you make the outsider feel invited. You see what a group could become before it knows itself. Your hopes for the future are generous, and people join you because you believe in them. Online communities, music scenes and volunteer work are natural homes."
      },
      {
        "heading": "Challenges & Growth",
        "body": "You choose friends by their potential and by how sad their story is, so some of them take much more than they give. You lend the money, host the person who stays three months, and keep quiet when a friend lets you down. A group you gave years to can turn out to be run by one person with an agenda. You also lose friends by vanishing quietly instead of explaining. Pick friends by how they behave over a year, set a limit on what you lend, and say a hard thing once and clearly. Keep at least one friendship that is plain, funny and unspiritual."
      }
    ]
  },
  "neptune-in-12th-house": {
    "intro": "A large part of your life happens where nobody can see it: dreams, prayer, fantasy and a private ocean of feeling. You need hours alone the way other people need food.",
    "sections": [
      {
        "heading": "Life Areas & Gifts",
        "body": "You are at your best in solitude, in meditation, in water, in a quiet room with music. Your dreams are vivid and informative, and you wake knowing things. You pick up the pain in a hospital, prison or crowded station and know how to be gentle with it. Work in care, retreat, healing, art, spiritual practice and anything behind the scenes suits you. You have a compassion that does not need an audience."
      },
      {
        "heading": "Challenges & Growth",
        "body": "You can disappear into sleep, drink, screens or a daydream and call it rest. Old fears and griefs you cannot name arrive at 3 am, and the loneliness can feel like a flaw in you. You take on other people's pain and then cannot tell it from your own. The way out is structure around the solitude: a set bedtime, a few hours a week with real people, and a daily practice such as journaling, prayer or a long walk. Talk to a counsellor about the vague dread rather than numbing it, and notice that a clear hour alone is different from escaping."
      }
    ]
  },
  "pluto-in-1st-house": {
    "intro": "People feel your presence before you say anything. You have rebuilt yourself more than once, and each time the new version was tougher and more honest than the last.",
    "sections": [
      {
        "heading": "Life Areas & Gifts",
        "body": "You hold a room without trying. You see what a person is hiding, and you can say the blunt thing that finally moves a stuck situation. After a crisis, a breakup or a loss you come back stronger and clearer about what you will no longer tolerate. You are good at turning around a failing project, a crisis or your own life. Others sense your intensity and either lean on you or step back."
      },
      {
        "heading": "Challenges & Growth",
        "body": "You test people by pushing, and then you read their reaction as proof of what you already suspected. Control is the habit that costs you: you decide how a conversation will go, withhold your feelings, and then are hurt that nobody reached you. Fear of being dominated makes you dominate first. Practise saying one vulnerable sentence a week to someone safe, let someone else win an argument that does not matter, and wait a day before the cutting reply. Power that is chosen quietly gets more respect than power that is shown."
      }
    ]
  },
  "pluto-in-2nd-house": {
    "intro": "Money and what you own carry far more weight for you than for most people. You have either lost a lot, or watched someone lose it, and you do not intend to be powerless again.",
    "sections": [
      {
        "heading": "Life Areas & Gifts",
        "body": "You are very good at building resources from nothing, and at recovering after a financial hit. You can see where value is hidden: the undervalued property, the neglected business, the skill nobody else is charging for. Your self-worth gets rebuilt more than once, and each time you value yourself more precisely. You spot a bad deal fast. You make a stubborn, patient investor."
      },
      {
        "heading": "Challenges & Growth",
        "body": "Money becomes a stand-in for safety and control. You hoard, or you gamble it all on a big comeback, and you can use a paycheque as leverage over a partner. You judge your own value by your balance, so a bad month feels like a verdict. Decide the number that means safe, write it down, and build to it in steady steps rather than in swings. Share the full picture of your finances with your partner, and when you feel the urge to control, ask what you are afraid of losing."
      }
    ]
  },
  "pluto-in-3rd-house": {
    "intro": "Your words land harder than you mean them to. You think in layers and cannot leave a question alone until you reach the bottom of it.",
    "sections": [
      {
        "heading": "Life Areas & Gifts",
        "body": "You are a natural investigator, interviewer, researcher and writer of material that makes people uncomfortable in a useful way. You listen for what is under what people say, and you ask the one question that reveals it. Siblings, neighbours and colleagues learn that you remember everything. Your mind can stay on a hard subject for weeks, which suits detective work, psychology, journalism and strategy. You change minds because you know the argument and the objection."
      },
      {
        "heading": "Challenges & Growth",
        "body": "A sibling or early teacher may have silenced you or hurt you with words, and you learned to speak only when you could win. Now you interrogate, hold grudges over things said years ago, and use silence as a weapon. Obsessive thinking can take over at night, replaying a conversation until it becomes a case. Say the thing in the first week, not the fifth, and ask a question when you would normally accuse. Keep a notebook for the loops, then close it, and apologise fast when your words went too far."
      }
    ]
  },
  "pluto-in-4th-house": {
    "intro": "Your family and your childhood home left a deep mark, and what was never said in that house still shapes you. You rebuild your sense of belonging again and again.",
    "sections": [
      {
        "heading": "Life Areas & Gifts",
        "body": "You break family patterns that run back generations: the temper, the silence, the debt, the secret. Once you decide on a home you build it solid, and people feel safe in it because you have thought about what safety takes. You understand what your parents carried, even when they cannot tell you. Property, renovation, family therapy and work with roots and history suit you. You can make a home where a hard thing can be said out loud."
      },
      {
        "heading": "Challenges & Growth",
        "body": "Someone in your childhood held the power at home, and you either copy that person or fight them still. Moves, divorces, deaths or a controlling parent may have taught you that the ground can disappear. Now you hold on to a house, a person or a grievance tighter than it deserves. Ask your relatives directly about the old stories, find a counsellor for the heavy parts, and let one family rule go that serves only habit. Notice when you are acting like the parent you swore not to become, and do the opposite on purpose."
      }
    ]
  },
  "pluto-in-5th-house": {
    "intro": "Romance, creativity and play are all-or-nothing for you. You do not date lightly, and you do not make casual art.",
    "sections": [
      {
        "heading": "Life Areas & Gifts",
        "body": "When you create, you go deep: the novel, the performance, the project that costs you something. Love affairs are intense and transformative, and people remember you after years apart. You bring seriousness to parenting and make your children feel truly noticed. You can charm a room and hold its attention to the end. You have the nerve to put something raw on a stage."
      },
      {
        "heading": "Challenges & Growth",
        "body": "Passion turns into possession quickly. You test a lover's loyalty, read a late reply as betrayal, and cannot play at a relationship when you feel something strong. Jealousy, power struggles with a child, or a creative project you cannot release are the usual tangles. A breakup hits you as a small death and you replay it for months. Slow down the first three months, say out loud when you feel jealous instead of acting on it, and let your children make their own mistakes. Do something playful with no stakes every week, so fun is not always a performance."
      }
    ]
  },
  "pluto-in-6th-house": {
    "intro": "Your daily work is where you prove yourself, and you work harder than the job asks. Your body is the first place stress shows.",
    "sections": [
      {
        "heading": "Life Areas & Gifts",
        "body": "You fix systems that are broken: the failing department, the messy workflow, the habit that was killing your health. You go after the root of a problem, in a machine, a person or a diet. Colleagues rely on you for the job nobody else will touch. Medicine, research, therapy, repair, auditing and recovery work suit you. Once you commit to a routine, you can change your body and your life with it."
      },
      {
        "heading": "Challenges & Growth",
        "body": "You overwork until something breaks. A boss with a lot of power, a toxic workplace or your own perfectionism can turn the job into a fight. Health problems arrive in waves, and you treat them as enemies to beat rather than messages. You rarely delegate, because nobody does it right. Set a finishing time and keep it, hand off one task a week, and see a doctor when a symptom is two weeks old. Pick a body habit you can sustain, not a punishing regime that you drop in a month."
      }
    ]
  },
  "pluto-in-7th-house": {
    "intro": "Close partners change you. You bring a lot of intensity to marriage and business partnership, and you tend to meet people who have a lot of power or want yours.",
    "sections": [
      {
        "heading": "Life Areas & Gifts",
        "body": "You commit completely, and a relationship that survives its crisis with you gets deeper than most. You see a partner's hidden strength and bring it out. In contracts, negotiations and conflicts you are not afraid of confrontation, which makes you a strong advocate. A good partner is transformed by you, and you by them. You can hold a hard conversation that others avoid for years."
      },
      {
        "heading": "Challenges & Growth",
        "body": "Control shows up in one of two ways: you take it, or you give it up and then resent the partner who has it. Jealousy, ultimatums and silent punishment appear when you feel unsafe. Relationships can end dramatically, and you can repeat that pattern with a different face. Notice who you hand your power to, and ask for what you want before resentment builds. Agree on rules for fights, such as no leaving without a time to return, and see a couples counsellor early, not at the last stage."
      }
    ]
  },
  "pluto-in-8th-house": {
    "intro": "Shared money, sex, secrets and death are not frightening topics to you, they are home territory. You get pulled into crises that other people avoid.",
    "sections": [
      {
        "heading": "Life Areas & Gifts",
        "body": "You handle other people's worst moments with a steadiness that is rare. Work in investigation, finance, inheritance, psychology, surgery, crisis support or research suits you. Intimacy with you goes deep and changes people. You understand where money, debt and power sit in a family. You rebuild after a loss with a thoroughness that surprises people."
      },
      {
        "heading": "Challenges & Growth",
        "body": "Power struggles with partners over money and sex are common, and so is a fascination with what is hidden. You can hold onto a secret or a grudge for decades. Loss, a death or a betrayal may have taught you to trust nobody, and you test people in ways that cost you. Get shared-money agreements in writing, tell one person the thing you have kept hidden, and stop collecting evidence in relationships. When you notice yourself setting a test, say the need out loud instead."
      }
    ]
  },
  "pluto-in-9th-house": {
    "intro": "You do not take beliefs on loan. You have torn down your worldview at least once and rebuilt it from what you could verify.",
    "sections": [
      {
        "heading": "Life Areas & Gifts",
        "body": "You are a persuasive teacher, writer or speaker on subjects that others hesitate to touch. Travel to places very different from home changes you at a deep level. You study to the bottom: law, religion, philosophy, history, politics. People take your convictions seriously because you paid for them. Publishing, teaching and legal work can bring you influence."
      },
      {
        "heading": "Challenges & Growth",
        "body": "Conviction can turn into a crusade. You become certain, you look down on those who disagree, and you lecture where you could listen. The loss of a belief, a faith or a teacher can leave you shaken for years. You try to convert a family member and damage the relationship. Ask yourself once a month what would change your mind, read a smart opponent properly, and let people hold different views at your table. Teach by showing what worked for you, and let others reach their own conclusion."
      }
    ]
  },
  "pluto-in-10th-house": {
    "intro": "Your public life carries weight. You want authority, and you have had to learn what it costs to hold it.",
    "sections": [
      {
        "heading": "Life Areas & Gifts",
        "body": "You rise in jobs that need someone to take charge in a crisis. Your ambition is serious and long-term, and you are willing to start again from zero after a collapse. You have a talent for reorganising a business, a department or a brand into something stronger. People in your field know you as someone who does not quit. You are effective in politics, management, medicine, law, finance and any role with real consequences."
      },
      {
        "heading": "Challenges & Growth",
        "body": "Power fights with bosses, rivals or a parent are your repeating pattern. You can rule by pressure, and you can be pushed out by people with more of it. A career can break down and restart a couple of times, and each time you wonder what it was for. Hold authority by explaining reasons, not only giving orders, and build allies before you need them. Keep your motives clean when you compete, and take at least one real rest each year. Choose work whose purpose you would still defend if nobody were watching."
      }
    ]
  },
  "pluto-in-11th-house": {
    "intro": "Groups, friends and causes shape you, and you do not join anything halfway. You have watched a group turn on someone, and you know how much trust it takes to belong.",
    "sections": [
      {
        "heading": "Life Areas & Gifts",
        "body": "You gather people around a cause with real stakes, and you can organise a movement or a small team to get things done. You can see who in a group holds the actual power. Friends who stay with you for years are loyal in a way you do not take for granted. You are good in activism, networks, online communities and collectives that aim to change something. A hard truth from you can change a whole group's direction."
      },
      {
        "heading": "Challenges & Growth",
        "body": "You can take control of a group and then be surprised that it follows you less. A friend may have betrayed you once, and you now watch for it, and punish small slights. You sometimes join a cause because of the people in it rather than the work. Let two friends see you unsure, hand over the lead on one project, and leave a group when the fight is about ego. Give trust in small steps and watch behaviour across a year."
      }
    ]
  },
  "pluto-in-12th-house": {
    "intro": "Much of what drives you sits below your own awareness. You carry fears and strengths that you did not choose, and they surface when you are alone or very tired.",
    "sections": [
      {
        "heading": "Life Areas & Gifts",
        "body": "You are strong in the places people avoid: therapy, hospices, prisons, research labs, the quiet hours in crisis work. You can sit in the dark with someone without flinching. Solitude restores your power, and your best insights come after retreat. You understand the unconscious through dreams and meditation. Some of your strength is invisible to others, and it gets used when nobody is watching."
      },
      {
        "heading": "Challenges & Growth",
        "body": "A buried fear or old shame can drive your choices without you knowing why. You can sabotage a good thing as it begins to work, or stay quiet while you are being used. Withdrawal turns into hiding, and anger turns inward as exhaustion or illness. Work with a therapist or a long practice such as journaling or meditation, and name the fear in writing. Let one trusted person in on what you hide. Keep a rhythm of solitude and company so retreat stays a choice."
      }
    ]
  },
};
