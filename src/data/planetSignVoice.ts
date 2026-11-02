/* Planet-in-sign page copy in the reader's voice (Uranus, Neptune, Pluto, Chiron,
   Juno, Vesta, North Node, South Node). Second person, lived scenes, no
   definitions of the body or the sign. Replaces only the intro and the section
   paragraphs of the matching *SignContent.ts files; titles, subtitles, icons and
   keywords there are unchanged. */

export type PlanetVoiceKey = 'uranus' | 'neptune' | 'pluto' | 'chiron' | 'juno' | 'vesta' | 'northNode' | 'southNode';

interface PlanetSignVoice {
  intro: string;
  sections: { paragraphs: string[] }[];
}

export const PLANET_SIGN_VOICE: Record<PlanetVoiceKey, Record<string, PlanetSignVoice>> = {
  "uranus": {
    "aries": {
      "intro": "You grew up around people who started things first and asked permission never. You don't wait for the committee, the green light or the right moment, and you've been called impatient for it since you were small.",
      "sections": [
        {
          "paragraphs": [
            "You have an idea on Monday and a prototype by Wednesday. Planning meetings make you restless, and you'd rather ship something rough and fix it live than polish something nobody has seen. The people your age around you do the same, which is why so much of what you grew up with was launched half-finished and improved in public.",
            "Bureaucracy feels personal to you. A form that takes three weeks to approve what you could do in an afternoon makes you want to build a way around it, and more often than not you do. You are usually the first among your friends to try a new app, a new tool or a new way of working, and you drop it the moment it stops moving.",
            "Your trap is mistaking noise for change. You tear something down because it's old, then realise you liked half of it. Some of what you walked away from was working, and you only find that out after the bridge is gone."
          ]
        },
        {
          "paragraphs": [
            "The world you came up in kept rewriting what a person is allowed to be on their own. Individual rights, personal tech and self-made identities all moved fast, and you never found it strange that a teenager could start something that mattered. Your friends measure each other by who dared first.",
            "You cannot stand being managed. Give you a boss who explains the goal and leaves you alone and you'll outwork everyone. Give you a script and you'll be gone by the next quarter, and you won't see why that's a problem."
          ]
        },
        {
          "paragraphs": [
            "You break rules by reflex, not by plan. Somebody says that isn't how it's done and you're already doing it, because a rule you can't see the reason for feels like a hand on your shoulder. Sometimes you free the people around you from something pointless. Sometimes you just leave a mess and walk off.",
            "What turns this from chaos into something useful is finishing one thing you started. Once you pair your speed with a target you picked on purpose, nobody in the room can keep up with you."
          ]
        }
      ]
    },
    "taurus": {
      "intro": "You grew up watching the ground under money, land and food shift slowly and then all at once. You don't trust a system just because your parents did, and you quietly build your own version of security.",
      "sections": [
        {
          "paragraphs": [
            "You change things the slow way. You won't jump on a trend, but once you've decided the old arrangement doesn't work, you move your savings, your diet or your career for good and don't look back. People your age do the same, which is why the changes you lived through stuck instead of fading.",
            "You're drawn to what you can touch and grow: food, soil, cash, your own body. Whatever new way of paying, eating or staying healthy shows up, you test it on yourself first. You'd rather own a small thing outright than rent a big thing.",
            "What shakes you is losing a sense of safety you thought was permanent. A job disappears, prices jump, a savings plan collapses, and you're forced to learn that comfort you can lose is not security. You come out of it more flexible than you wanted to be."
          ]
        },
        {
          "paragraphs": [
            "You and your friends argue about what things cost, who owns what and whether the old deal still makes sense. Wealth stopped looking like a guarantee for people your age, so you care less about showing it and more about having an option if things go wrong.",
            "You want abundance that doesn't depend on someone else holding the door. You'd rather build something that works for ten people than preach about it to ten thousand."
          ]
        },
        {
          "paragraphs": [
            "Your rule-breaking is around money, property and your own body. You ask why a bill is that high, why a house costs that much, why beauty has to look a certain way, and then you quietly set up an alternative instead of complaining.",
            "It doesn't look dramatic from outside. A year later you have a different income stream, a different budget, a different idea of what enough means, and the people who laughed are asking how you did it."
          ]
        }
      ]
    },
    "gemini": {
      "intro": "You grew up in a world where how people talk to each other kept changing under your feet. You think fast, jump between ideas, and refuse to take any claim at face value until you've checked it yourself.",
      "sections": [
        {
          "paragraphs": [
            "Your mind connects things nobody else lined up. You read three sources, spot the gap between them, and have a theory before the conversation is over. People your age built the media, tools and shortcuts that changed how everyone shares what they know, and you probably made a few yourself.",
            "You hate gatekeeping. If information exists, you want it open, and you'll find a way around any wall that stands between you and learning something. Your friends send each other links, clips and threads all day and consider that a form of affection.",
            "The cost is a head that never switches off. You start six projects, bounce between tabs, chase the next interesting thing and wonder why nothing feels deep. Novelty is your drug, and depth is the thing you keep promising yourself."
          ]
        },
        {
          "paragraphs": [
            "Every few years the way you learn and talk gets replaced, and you adapt without complaint. You remember a before and an after, and you've learned that whoever controls how news travels controls what people believe.",
            "You and your age group protect free speech and free access almost by instinct. School felt too slow, teachers too sure, textbooks too fixed, so you taught yourself the useful parts elsewhere."
          ]
        },
        {
          "paragraphs": [
            "You question who gets to speak and who gets believed. When someone with a platform says something that doesn't add up, you're the one who posts the correction, and when someone with no platform has a good point, you pass it on.",
            "You fight with words, jokes and timing. A sharp reply at the right moment does more for you than a march, and you know exactly how fast an idea can travel once it's phrased well."
          ]
        }
      ]
    },
    "cancer": {
      "intro": "You grew up around families that were changing shape, and you learned early that home is something you can rebuild on purpose. You love your people hard, and you refuse to repeat what hurt you.",
      "sections": [
        {
          "paragraphs": [
            "You're the one who finally says this stops with me. Whatever got passed down in your family, the silence, the favourites, the temper, you decide not to hand it on, and you do the uncomfortable work to make that true. It costs you some holidays and some relatives, and you pay it.",
            "Your ideas about home are practical. You want a place that actually fits how you live, whether that means a shared house, a flat above a friend, a smart gadget in every room or parents moving in with you. Your friends have arrangements their grandparents would not recognise.",
            "The price is a life that keeps rearranging. You move, a relationship ends, someone returns home, a family plan falls apart, and your sense of safety gets knocked again. Over time you learn to carry it inside you instead of in a building."
          ]
        },
        {
          "paragraphs": [
            "The households around you stopped matching the old picture. Women worked, parents separated, friends became family, and you grew up knowing that who counts as family is a choice some people make and others are denied.",
            "You feel the cracks in belonging more than most. Rent, loneliness, aging parents and kids who never had a steady home are not abstract topics for you, and a lot of your energy goes into building something steadier for the next group."
          ]
        },
        {
          "paragraphs": [
            "You break the rule that blood decides loyalty. If someone in your family keeps hurting you, you stop showing up, even when everyone tells you that's selfish. You'd rather be the black sheep than keep the peace by swallowing it.",
            "That kind of break is lonely, and it also works. The home and the people you end up with are usually warmer than the ones you left, because you chose every one of them."
          ]
        }
      ]
    },
    "leo": {
      "intro": "You grew up watching ordinary people become famous overnight and decided you didn't need permission to be seen either. Hiding your talent feels like a small betrayal, and you won't do it.",
      "sections": [
        {
          "paragraphs": [
            "You want to make something that only you could have made, and you want people to see it. You'll dress, sing, film or design in a way that makes older relatives blink, and you'd rather be strange and noticed than polite and forgotten. Your friends your age do the same, and the culture around you bent to fit.",
            "The tools you grew up with made stages for everybody. Music, video, fashion and personal style all got cheaper to make and faster to share, and you used every one of them to put yourself out there.",
            "Your trap is confusing attention with proof that you matter. You post, perform or promote, count the response, and feel hollow when the numbers dip. The work gets better when you make it for the thing itself and not for the reaction."
          ]
        },
        {
          "paragraphs": [
            "The world around you kept moving the line on who gets to be a star. Talent shows, home videos, online followings and street fashion all broke the old gatekeeping, and you saw people with no connections become household names.",
            "You believe everyone has a gift worth showing and that being told to tone it down is a quiet kind of damage. You'll cheer louder for a friend's first performance than for a professional's tenth."
          ]
        },
        {
          "paragraphs": [
            "You break rules about who is allowed to shine. When someone says you need credentials before you can create, you create anyway and let the result speak. Your rebellion is loud on purpose, because visibility is the point.",
            "Other people feel braver around you for it. When you walk into a room dressed exactly how you like and unbothered, someone else decides to stop hiding too."
          ]
        }
      ]
    },
    "virgo": {
      "intro": "You grew up noticing what was broken in the everyday machinery of health, work and routine, and you can't leave a bad system alone. You fix things one practical step at a time, and most people never see you do it.",
      "sections": [
        {
          "paragraphs": [
            "You don't dream about a better world in speeches. You spot the clunky step in a process, rewrite it, test it, and check the result with actual numbers. You want to be useful more than you want to be admired.",
            "The things you care about are specific: how a doctor's visit goes, how a workday is organised, what's in your food, which app saves ten minutes. Your friends call you when something won't work, because you will sit and untangle it.",
            "The trap is demanding perfect before you start. You research, refine and hold back a good idea because it isn't flawless, and meanwhile someone sloppier ships and takes the credit. You need to let a rough version out and fix it in motion."
          ]
        },
        {
          "paragraphs": [
            "Daily life around you got rebuilt behind the scenes. Medical care, workplace habits, food, technology and the way jobs are organised all shifted, and you saw how much of it nobody noticed unless it stopped working.",
            "You and your age group take service seriously. You get quietly angry at waste, sloppy care and policies that make people's days harder for no reason, and you put your energy into repairing them."
          ]
        },
        {
          "paragraphs": [
            "You break rules about how health and work are supposed to run. You question the standard protocol, try the supplement, the diet or the unusual treatment, and then check whether it really helped. You mix old remedies and modern science without caring who approves.",
            "You don't protest, you replace. You rewrite the checklist, redo the schedule and show the better version working until nobody can argue."
          ]
        }
      ]
    },
    "libra": {
      "intro": "You grew up watching the rules about who can love whom, and who is treated fairly, get rewritten in real time. You can't sit quietly through an unfair deal, and you won't stay in a partnership that makes you smaller.",
      "sections": [
        {
          "paragraphs": [
            "You question what a relationship has to look like. Marriage, living together, open arrangements, staying single, splitting chores, splitting money: you and your friends build your own version and don't apologise to anyone who expected the old script.",
            "Fairness shapes your choices. Contracts, laws and workplace deals all get a hard look from you, and you can feel when the balance is off before you can say why. You push for a better arrangement politely, and you do not drop it.",
            "Your tension is wanting peace and freedom at once. You smooth things over, then suddenly cut a tie that was costing you too much, and the people around you are shocked because you seemed fine. The lesson is that honesty up front is kinder than a clean exit later."
          ]
        },
        {
          "paragraphs": [
            "The world you came up in changed who was allowed to marry, who counted as equal and what a fair settlement looked like. You watched lawsuits and campaigns reshape those rules in your lifetime, and you grew up assuming they could keep shifting.",
            "You and your friends find inequality physically uncomfortable. You don't like being told that rights and harmony have to be traded off, and you spend a lot of energy proving they don't."
          ]
        },
        {
          "paragraphs": [
            "You break rules about how people are meant to be together. You leave a partnership that requires you to hide something, you push back on a law that treats people differently, and you do it in a way that looks refined, not angry.",
            "The space between people is where you work: the agreement, the unspoken deal, the way a couple divides power. You rewrite those until both sides can breathe."
          ]
        }
      ]
    },
    "scorpio": {
      "intro": "You grew up in a world where secrets kept coming out, and you learned not to trust anything that looks too clean. You go for what people hide, and you cannot let a buried thing stay buried.",
      "sections": [
        {
          "paragraphs": [
            "You don't change the surface, you go to the root. When something feels off in a family, a company or a person, you keep digging until the real story is on the table, and you don't care how uncomfortable it makes the room.",
            "Your fascinations are the ones others avoid: power, sex, money behind the scenes, death, what people do when no one is watching. Your friends bring you their worst secrets because they know you won't flinch.",
            "The danger is exposing for the sake of it. You find the truth, swing it around, and hurt people who weren't the problem. Or you get so fixed on who holds power that you copy their moves. You do your best work when you expose a thing in order to heal it."
          ]
        },
        {
          "paragraphs": [
            "The world around you kept dragging hidden things into view: abuse, corruption, private habits, things nobody used to say out loud. You watched institutions lose their polish, and you're not surprised by it.",
            "You read people very fast. A lie lands on you like a wrong note, and you and your age group don't tolerate cover-ups well, whether it's an employer, a church, a family or a government."
          ]
        },
        {
          "paragraphs": [
            "You break the silence rule. You name the person everyone knew about, say the number nobody wanted to say, and talk about death and sex like they are normal subjects. People call it too much until they realise you were right.",
            "When you finish with a rule, it stays finished. You don't just attack it, you dismantle the quiet agreements that held it up, so it can't be rebuilt in the same shape."
          ]
        }
      ]
    },
    "sagittarius": {
      "intro": "You grew up being told what to believe and never quite buying it. You have to go find the truth yourself, even if that means leaving the faith, the school or the country you started in.",
      "sections": [
        {
          "paragraphs": [
            "You won't take a belief on loan. You read the book from the other tradition, travel to the place people warned you about, and put together your own answer from pieces. Friends your age own a mix of ideas no single teacher would have approved.",
            "The world got wider for you. Flights, far-off cultures, space, new languages and global conversations opened up, and you used all of it. You treat the claim that only one way is right as a challenge, not a fact.",
            "Your trap is becoming rigid about being open. You tear down a belief so loudly that you have nothing left to stand on, then drift. The real work is building something bigger in its place."
          ]
        },
        {
          "paragraphs": [
            "You came up while religions, universities and ideas about what counts as knowledge were being questioned in public. People your age left the faith they were born into, studied outside the system and moved across borders without much fuss.",
            "You want big answers and distrust small ones. A tidy slogan irritates you, and you'd rather hold a hard question for years than accept a lazy answer that sounds good."
          ]
        },
        {
          "paragraphs": [
            "You break rules about belief and boundaries. You don't stay in one religion, one culture or one career track because it was handed to you. You teach yourself, change countries, switch paths and call that ordinary.",
            "You don't believe anyone owns the truth. When a leader or professor acts like they do, you politely look elsewhere, and a lot of people follow you out the door."
          ]
        }
      ]
    },
    "capricorn": {
      "intro": "You grew up watching big institutions crack and decided the answer wasn't to scream outside them. You get inside, learn how they run, and then redesign them from within.",
      "sections": [
        {
          "paragraphs": [
            "You don't burn the building, you take a job in it. You work your way up, learn where the real power is, and change the rules once you're in a position to. Colleagues think you're a loyal climber until your restructure lands.",
            "Your ideas are about structure: how a government runs, how a company is organised, how a system gets more accountable. You'd rather draw a better org chart than give a speech about one.",
            "The risk is turning into what you replaced. You get comfortable, start defending the system you meant to fix, and wake up as the boss you used to complain about. Keep one foot outside, always."
          ]
        },
        {
          "paragraphs": [
            "Governments, companies and hierarchies lost their authority while you were growing up, and you saw how quickly something solid can fall. That taught you that tradition needs to earn its place, and that rebuilding takes more patience than demolishing.",
            "You and the people your age want ambition and reform together. You respect someone who has done the work, but you don't respect someone for being old, and you will say so to a manager's face."
          ]
        },
        {
          "paragraphs": [
            "You break rules about authority. Seniority alone doesn't impress you, and a procedure that exists only because it always has gets challenged the moment you see it. You ask what it produces and who it serves.",
            "Your moves are calculated. You study the weak point, prepare the replacement, and only then pull out the old rule. By the time anyone objects, the new version is already running."
          ]
        }
      ]
    },
    "aquarius": {
      "intro": "You grew up around people who talked about the future like a place they were already building. You think in groups, networks and what could be, and you get impatient with anyone who says it has always been this way.",
      "sections": [
        {
          "paragraphs": [
            "You see how one change ripples through everything. A tool, a rule or a habit shifts, and you can already tell what it does ten steps down the line. Your friends look to you to say what comes next, and you are right more often than is comfortable.",
            "Technology, networks, new ways of organising and communities that cross borders feel natural to you. You build or join the group first and sort out the leadership later, if at all.",
            "Your weak spot is distance. You get so wrapped up in the big picture or the principle that you forget the person standing in front of you, and people feel like data. Your ideals land harder when you remember to ask how someone actually is."
          ]
        },
        {
          "paragraphs": [
            "The systems you inherited were rebuilt around you: how people connect, vote, work and organise. You and your friends take for granted tools that older people find strange, and you design the next layer without nostalgia.",
            "You believe people should be free and the group should be well, and you refuse to accept that one has to be sacrificed for the other. You'd rather build something that proves it."
          ]
        },
        {
          "paragraphs": [
            "You break rules by questioning why they exist. If the only reason is that it has always been done that way, you consider it fair game and start sketching the replacement. That makes you the odd one out at plenty of family dinners.",
            "You don't rebel for yourself. You do it because you can see a freer version of how people could live, and you push for it even when it costs you friends."
          ]
        }
      ]
    },
    "pisces": {
      "intro": "You grew up in a world where the line between real and imagined kept blurring, and you never found that frightening. You trust intuition and dreams as sources of knowledge, and plenty of people around you still treat that as odd.",
      "sections": [
        {
          "paragraphs": [
            "You mix things other people keep apart: science and spirit, tech and art, waking life and a dream you can't shake. You get sudden knowing, a hunch that turns out true, and you build on it before you can explain it.",
            "Film, music, immersive worlds, altered states and new kinds of healing are all natural ground for you. You and your friends make or seek out things that carry you somewhere else for an hour and bring you back changed.",
            "The trap is floating. You call avoidance a spiritual practice, wait for a sign instead of making a call, and let real problems pile up. You do better when the vision gets a schedule and a task attached."
          ]
        },
        {
          "paragraphs": [
            "You came up while the old line between rational and mystical was dissolving. New spiritual ideas, new kinds of cinema and a looser view of the mind became normal, and you didn't need convincing.",
            "You feel other people's pain more than you let on. When the news is bad or a friend is struggling, it lands in your body, and you try to turn that into art, care or something beautiful."
          ]
        },
        {
          "paragraphs": [
            "You break rules about what counts as real. You ask why only measurable things are taken seriously, you trust a feeling when the spreadsheet says otherwise, and you make things that refuse to fit a category.",
            "You don't argue with the establishment, you slip past it. You change how people see something, and once they see it differently, the old rule quietly stops making sense."
          ]
        }
      ]
    }
  },
  "neptune": {
    "aries": {
      "intro": "You dream of being the one who charges in and saves the day, and you pray the way you play, with your whole body and no patience for waiting. Your faith has a sword in it, and your biggest risk is believing you can't be wrong.",
      "sections": [
        {
          "paragraphs": [
            "Your spiritual life is a personal mission. You don't sit quietly and wait for peace, you act on a calling, make a vow, start the fight that feels holy. Prayer for you is closer to a shout at the sky than a whisper.",
            "The visions you chase are bold and first-of-their-kind. You want to start the movement, invent the style, open the door nobody has opened. Friends your age lean toward being pioneers of their own beliefs and don't wait for tradition to hand them one.",
            "The danger is deciding you alone were chosen. Once you start seeing yourself as the hero of the story, you stop listening, and the people you wanted to save feel run over. The braver version of you serves without needing the credit."
          ]
        },
        {
          "paragraphs": [
            "Your blind spot is your own motive. You tell yourself you're fighting for a cause when part of you is fighting to prove something, and you don't notice until a friend points it out. You also mistake force for strength and aggression for conviction.",
            "Reality eventually collides with the hero picture you carry. A defeat, a failure, a cause that didn't need you can flatten you for a while. Once you let go of being special, you find a quieter courage that works without an audience."
          ]
        },
        {
          "paragraphs": [
            "You make things in a burst. Raw, urgent, unfiltered, half-finished and alive, your work comes out before you've had time to fix it. Some of it is brilliant and some of it is a mess, and usually it's both on the same page.",
            "What you pass on is permission to make something with no precedent. You tell the story nobody told, say the thing nobody dared to say, and the next person finds it easier because you went first."
          ]
        }
      ]
    },
    "taurus": {
      "intro": "You find the holy in a good meal, a warm blanket and a field after rain. Heaven, for you, is a place you can touch, and your trap is believing enough comfort will fill the gap that only meaning can.",
      "sections": [
        {
          "paragraphs": [
            "You feel closest to something bigger through your senses. A song in a car, bread out of the oven, bare feet on grass, a piece of fabric you love. You don't need a temple, your kitchen and garden do the job.",
            "You dream about a world of real abundance: gardens, shared feasts, beautiful things made to last, people living gently on the land. You would rather have heaven here than a promise of one afterward.",
            "You can make an ordinary day feel sacred. Cooking for someone, tending a plant, building something with your hands is how you pray, and the people around you feel calmer for being near it."
          ]
        },
        {
          "paragraphs": [
            "Your illusion is that having enough will make you whole. You buy the better thing, lock down the secure job, wrap yourself in comfort, and then wonder why you still feel an ache. Luxury looks like peace and isn't.",
            "The shake-up usually arrives through money or loss: a crash, a bill, something you owned that disappears. It hurts, and it shows you a kind of richness that doesn't depend on what you hold."
          ]
        },
        {
          "paragraphs": [
            "Your art goes to the body. Food, music, design, textiles, gardens, the things you make are lush and grounded, and people feel them before they think about them.",
            "You raise the status of craft. You show that making a beautiful chair, growing good food or designing a lovely room counts as real creative work, and you are not apologetic about it."
          ]
        }
      ]
    },
    "gemini": {
      "intro": "You dream in sentences. A line of text, a story you half remember, a conversation that changed you, these are your holy places, and you grew up in a world where it is hard to tell which words are true.",
      "sections": [
        {
          "paragraphs": [
            "A perfectly chosen sentence feels like prayer to you. A good talk with the right person at two in the morning can open something no ritual ever did, and you keep chasing that moment when someone says exactly what you could not.",
            "You imagine a world where nobody gets misunderstood, where ideas pass between minds without friction. Part of you hopes for a language underneath language, a way of knowing that needs no words at all.",
            "Signs and coincidences talk to you. A song comes on, a number repeats, a stranger says what you were just thinking, and you read the message. Usually you are not wrong."
          ]
        },
        {
          "paragraphs": [
            "Your blind spot is a beautiful argument. You can be charmed by a speaker who sounds right and miss that they are selling you something. You also talk yourself out of feelings by building a smooth explanation for why they don't matter.",
            "The wake-up arrives when nothing you can say fixes the situation. A death, a break, a silence that no analysis reaches. You find out there are truths that live between words, and you learn to sit in them."
          ]
        },
        {
          "paragraphs": [
            "You write, tell stories, make lyrics, shape captions that stay with people. The line between fact and fiction blurs in your hands, and what you put out both informs and enchants.",
            "What you leave behind is the proof that a well-told story can change how someone sees the world. You treat the act of communicating as a kind of magic, because for you it is."
          ]
        }
      ]
    },
    "cancer": {
      "intro": "You dream of home the way other people dream of heaven. You long for a family that feels safe, a table everyone sits at, and a past that may have been better in memory than it was in life.",
      "sections": [
        {
          "paragraphs": [
            "Your holiest places are kitchens, bedrooms and the corner of a couch. Looking after someone, being looked after, feeling you belong to a particular set of people, that is how you touch something bigger than yourself.",
            "You carry a nostalgia that aches. You miss a time of family unity and neighbourhood closeness that you may only half remember, and that longing pushes you to make home for others, in whatever shape you can.",
            "You feel what the people around you feel, in your own chest. You show up for them without keeping score, and a friend in pain will call you before they call anyone else."
          ]
        },
        {
          "paragraphs": [
            "Your illusion lives in the past. You polish your childhood, your mother, your hometown, and you leave out the parts that hurt. You defend the family myth and wonder why the present feels thin by comparison.",
            "The crash comes when the family or place you idealised shows its real face. It stings badly, and it opens up something better: loving people as they are and not as you wished they were."
          ]
        },
        {
          "paragraphs": [
            "You make art that feels like walking into a familiar house. Songs that bring back a summer, films about ordinary family love, photographs of a Sunday afternoon, your work is intimate and goes straight to the chest.",
            "You prove the personal is universal. A story about your own kitchen table reaches strangers in other countries, because everyone has a version of the place you are describing."
          ]
        }
      ]
    },
    "leo": {
      "intro": "You dream in widescreen. Stage lights, a crowd, a love story with a soundtrack, you want your life to feel like a film, and your trap is thinking being adored is the same as being loved.",
      "sections": [
        {
          "paragraphs": [
            "Being truly seen feels holy to you. On a stage, in front of a camera or in a room where someone looks at you with full attention, you come alive, and you honestly believe joy and beauty are a form of worship.",
            "Your dreams are grand and personal at once. You picture your life as a story worth telling, and under the showmanship is a real conviction that every person has something magnificent to show.",
            "You lift people. Your warmth and playfulness remind a tired room that fun and creativity are not luxuries. When you're in good form, someone nearby remembers they used to sing."
          ]
        },
        {
          "paragraphs": [
            "Your illusion is that applause equals love. You chase a crowd's attention, take a compliment as proof you are worth something, and slip into playing a version of yourself that people clap for. The glow of fame is a trap that keeps you performing.",
            "The break comes when the spotlight moves on, or when you notice the person people adore is a character you built. It's painful, and it's the moment you start making things from the inside instead of for the reaction."
          ]
        },
        {
          "paragraphs": [
            "Your taste runs to the dazzling. Film, musical theatre, big pop songs and romance stories are your ground, and you turn ordinary feelings into something mythic.",
            "You helped build the dream factory. You make entertainment that lets people feel magnificent for two hours. When you do it right, it doesn't pull them away from their lives, it lights them up."
          ]
        }
      ]
    },
    "virgo": {
      "intro": "You dream of a fixed, tidy, healed world and give your days to getting it there. You show up with a remedy, a routine or a better method, and you believe if you just try hard enough, nobody will have to hurt.",
      "sections": [
        {
          "paragraphs": [
            "You find the sacred in small, careful work. The right herb, the routine that finally clicks, folding the laundry properly, tending to someone who is sick. Devotion for you is a daily practice and not a grand gesture.",
            "You imagine a world where illness is caught early, systems run cleanly and every detail serves wellbeing. In your private picture of heaven, everything is clean, quiet and working.",
            "You make humble work meaningful. People around you start to see that doing one thing well, for no audience, is a kind of prayer, and that you were not wasting your time."
          ]
        },
        {
          "paragraphs": [
            "Your illusion is that perfect is possible and that anything less is failure. You scan yourself and others for flaws, worry about your health at three in the morning, and treat spiritual growth like a checklist you are behind on.",
            "What eases it is realising the world cannot be fully fixed. When you stop trying, a gentler thing arrives: kindness toward the imperfect, including yourself. It feels like losing, and it works like grace."
          ]
        },
        {
          "paragraphs": [
            "You make things that help. Design that smooths a day, writing that explains a hard diagnosis, music chosen to calm a nervous system. In your work, beauty and usefulness are the same thing.",
            "You join art and health. You show that a well-designed system or a carefully made remedy can be as creative as any painting, and that being useful is not a lesser way to be artistic."
          ]
        }
      ]
    },
    "libra": {
      "intro": "You dream of the perfect partner, the beautiful room and the world where nobody fights. It is a lovely dream, and it makes real people feel like they are failing you.",
      "sections": [
        {
          "paragraphs": [
            "Love, beauty and balance feel spiritual to you. A relationship that finally clicks is an achievement, a gorgeous space is a refuge, and smoothing a conflict between two people feels like doing something holy.",
            "You dream of effortless love and a fair society where beauty is for everyone and justice arrives without a fight. That longing drives a lot of what you create and a lot of whom you choose.",
            "You bring grace into rooms. People relax around you because you notice what is off and gently set it right, and you remind them that beauty is not shallow."
          ]
        },
        {
          "paragraphs": [
            "Your illusion is that the right person will complete you. You pour your longing into a partner and expect them to carry it, then feel let down when they turn out to be human. You also keep the peace by swallowing what you want, until resentment sits under a polished surface.",
            "The wake-up arrives when the ideal partner shows real flaws, or when staying harmonious means lying. It teaches you that honest conflict is part of love, and that real intimacy is with an imperfect person."
          ]
        },
        {
          "paragraphs": [
            "You make beautiful things: clothes, interiors, love songs, romantic films, art with a social conscience. Your work is elegant, balanced and aimed straight at the heart.",
            "You push beauty as a value. You show that an eye for it is a kind of intelligence, not vanity, and that making something lovely is a gift to everyone who walks into the room."
          ]
        }
      ]
    },
    "scorpio": {
      "intro": "You want to be changed, not comforted. You dream of the experience that burns you down and rebuilds you, and you have to be careful that you don't confuse a rough night with a breakthrough.",
      "sections": [
        {
          "paragraphs": [
            "Your holy ground is the dark. The worst night, the moment of total exposure, giving up control to someone or something. You don't want a pleasant spirituality, you want one that costs you something and leaves you different.",
            "You dream of dissolving into union, of losing the line between you and another person, between life and death. Ecstatic states, intense rituals, long nights of honesty and anything that strips away the mask pull you hard.",
            "You go where others stop. Death, grief, the unconscious, the things people whisper about, you walk into them calmly and come back with something that helps the ones who couldn't follow."
          ]
        },
        {
          "paragraphs": [
            "Your illusion is that intensity means depth. You chase the next extreme, the next consuming relationship or the next altered state, and mistake emotional storms for transformation. Darkness can start to look glamorous and suffering romantic.",
            "The letdown arrives when yet another peak changes nothing. You learn, slowly, that real depth takes patience and ordinary days, and that the quiet repetition is where you actually change."
          ]
        },
        {
          "paragraphs": [
            "Your work faces the shadow. Dark romance, psychological stories, music that takes people apart, art about sex, death and power. It is intense, hard to forget and sometimes upsetting in the useful way.",
            "You refuse shallow. You insist that creative work should include the parts of life polite company avoids, and your friends trust you with the things they could not say anywhere else."
          ]
        }
      ]
    },
    "sagittarius": {
      "intro": "You believe the answer is out there, past the next border, book or teacher. You dream of a world where every faith talks to every other, and you have to watch that you don't spend your life looking and never landing.",
      "sections": [
        {
          "paragraphs": [
            "Your spirituality is a road. You find the sacred on a mountain path, in a conversation with a stranger from a different culture, at the moment you feel how big everything is. You look for God in experiences and not in buildings.",
            "You dream of freedom and shared truth, a world where every path is respected and wisdom travels without anyone fencing it in. You want faith without dogma.",
            "You carry an easy faith that things work out. Even in a rough stretch you assume it is teaching you something, and the people around you borrow your optimism when theirs runs low."
          ]
        },
        {
          "paragraphs": [
            "Your illusion is that the next journey will finally settle it. You collect teachers, retreats, trips and philosophies like souvenirs, and file them without applying any. A confident guru with an easy promise can win you quickly.",
            "The letdown arrives when the next teacher or adventure delivers nothing. Then you see the truth was never somewhere else to be found, it has to be lived where you stand today."
          ]
        },
        {
          "paragraphs": [
            "Your taste is wide. World music, epic films, big books and anything that crosses cultures, you fill your work with distance and a sense of adventure.",
            "You are part of the generation that globalised the imagination. You show that the best art does not stay inside one culture, because everyone shares the hunger for meaning and for something bigger."
          ]
        }
      ]
    },
    "capricorn": {
      "intro": "You want your ideals to have walls and a roof. You dream of building something sacred that lasts, and you have to be careful that the title and the success don't stand in for the real thing.",
      "sections": [
        {
          "paragraphs": [
            "The holy, for you, takes years. A cathedral built over generations, a tradition that has held for centuries, the slow work of making something that will outlive you. You respect what endures and distrust what is only exciting.",
            "You dream of a world where values are built into the structure: businesses with a conscience, institutions that serve something higher than profit. You'd rather create the organisation than write the manifesto.",
            "You make the invisible concrete. You take a vague hope and turn it into a plan, a team, a building or a system, and people who only had the feeling finally have somewhere to put it."
          ]
        },
        {
          "paragraphs": [
            "Your illusion is that spiritual standing can be earned like a promotion. You count titles, positions and credentials as proof of depth, and use holy language to dress up plain ambition. It can fool you as much as anyone else.",
            "The fall comes when a leader, church or organisation you trusted turns out to be rotten. When the structure cracks, you learn that real faith cannot be filed and stamped. It has to be practised."
          ]
        },
        {
          "paragraphs": [
            "You make things that last. Architecture, classical music, serious fiction, any craft that takes years of discipline. Your work is polished, professional and built to stand.",
            "You put craft back at the centre. You show that the most moving work often comes from patient mastery, and that there is something holy in doing a hard skill well for a very long time."
          ]
        }
      ]
    },
    "aquarius": {
      "intro": "You dream of everybody being connected, and you grew up inside that experiment. You believe in the group mind and the shared screen, and you are learning that being linked is not the same as being close.",
      "sections": [
        {
          "paragraphs": [
            "Your sense of the sacred shows up in the crowd. A million people feeling the same thing at once, a message from a stranger on another continent, a movement that forms overnight. You feel something bigger than yourself in the network.",
            "You dream of an awake humanity, of technology that serves attention instead of stealing it, and of a world where the line between my feelings and ours turns transparent. It is an idealistic picture and you hold it sincerely.",
            "You pick up the mood of the moment before it has a name. You sense where the collective is heading and turn it into something people can use, a project, a post, a cause."
          ]
        },
        {
          "paragraphs": [
            "Your illusion is that connection will fix things on its own. You assume that if everyone is linked, understanding will follow, and you confuse an online crowd with belonging, a thousand followers with a friend and access to information with wisdom.",
            "The disappointment arrives when the connected world splits people instead of joining them, and the tools you trusted amplify the worst along with the best. You face the plain fact that a tool is neutral, and the people using it have to change."
          ]
        },
        {
          "paragraphs": [
            "You make work with technology: digital art, virtual worlds, shared projects where the audience helps build the thing. It is inventive, communal and breaks down the wall between maker and viewer.",
            "You prove soul and screens can coexist. You use digital tools to reach something that feels genuinely larger, and you show it is the awareness behind the medium that matters."
          ]
        }
      ]
    },
    "pisces": {
      "intro": "You feel the other side of things all the time, and you float more easily than you land. You are open to music, mood and other people's pain in a way that can be a gift and a flood, and keeping your footing is the main work of your life.",
      "sections": [
        {
          "paragraphs": [
            "The thin wall between the everyday and the unseen has never been solid for you. You do not have to talk yourself into believing in something larger, you feel it, sometimes at the grocery store, sometimes at three in the morning.",
            "You long for oneness: no separation, no fear, a feeling of being held by everything. That ache colours your whole life and gives your quietest moments a sad, lovely edge.",
            "Grace comes to you easily. Beauty, tenderness and love show up as normal parts of a day and not as rare events. Things seem to pass through you from somewhere else, and others notice."
          ]
        },
        {
          "paragraphs": [
            "Your illusion is that nothing is quite solid. The practical world starts to feel unreal, and you slip into escape in whatever form is nearest: a substance, a fantasy, a spiritual idea that lets you skip the bill you need to pay. The pull to dissolve is strong, and holding your boundaries takes steady effort.",
            "The lesson comes through too much magic. When everything is meaningful, nothing holds your weight. You learn to live in the actual world, flawed and beautiful, without losing the other one, and grounding becomes your real spiritual practice."
          ]
        },
        {
          "paragraphs": [
            "Your work comes out dreamy, layered and strangely moving. Music, poetry, film and painting that feel like they came from somewhere else, and that can carry a listener into another state of mind.",
            "You remind people art is sacred. What you make doesn't just entertain, it heals and opens something, and walking through it changes how the rest of the day looks."
          ]
        }
      ]
    }
  },
  "pluto": {
    "aries": {
      "intro": "You will not be managed. Somewhere in your life someone tried to shrink you, and your answer was to burn the arrangement down and start again as someone harder to argue with. Your whole generation treats survival and the right to be yourself as the first fight, and you are no exception.",
      "sections": [
        {
          "paragraphs": [
            "You have rebuilt yourself more than once, and each time it started with a moment where staying the same felt like dying. You quit the job, left the town, cut off the person, and walked out lighter and meaner. Friends your age do the same thing, so none of you find it strange.",
            "You do not want power over other people. You want nobody to have power over you, and that is a different appetite. The trouble starts when you hear an ordinary request as an attempt to corner you, and you swing at someone who only asked you to be home by nine.",
            "Your rage is old and fast. Because you learned young that backing down meant losing something you could not get back, you hit first, then spend the next day working out whether the threat was real. Your growth is learning to feel the flare and not act on it for ten seconds."
          ]
        },
        {
          "paragraphs": [
            "Your generation made a hero out of whoever hits hardest, and you grew up on it. You laughed at the tough guy and then copied him, because softness looked like the thing that got people crushed. Now you can see how many of your friends confuse being loud with being strong.",
            "When you stop proving yourself by force, you turn into the person who stays calm while everyone else panics. People your age notice that first. It is the one kind of toughness that does not cost you your relationships."
          ]
        },
        {
          "paragraphs": [
            "You have to be first. First to the idea, first to leave, first to say the thing nobody would say, and you feel it as a physical itch when someone beats you to it. It makes you start more than you finish and compete with people who are not even playing.",
            "Underneath is a fear that if you stop moving you will turn out not to have mattered. You make your mark loudly because silence feels like erasure. The day you pick one thing and give it years, that same urgency becomes the strongest engine you own."
          ]
        }
      ]
    },
    "taurus": {
      "intro": "You grew up watching what money does to people, and you do not trust anyone who says it does not matter. Your generation lives in the shaking of everything that was supposed to be solid, from savings to food to land. You feel it in your wallet before you read it in the news.",
      "sections": [
        {
          "paragraphs": [
            "You noticed early that the people with the resources make the rules, and you decided not to be at their mercy. So you save past the point of sense, check prices on everything, and keep a cushion even when you are doing fine. Your friends your age tease you for it and quietly copy you.",
            "Your power sits in what you own and what nobody can take off you: the land, the skill, the account, the house. When something you built gets threatened, you go quiet and immovable, and people finally understand you cannot be pushed. You do not shout; you just do not move.",
            "Your lesson is that holding on tighter does not make you safer. You have lost things you guarded perfectly well, and the loss showed you that security built only from stuff cracks the first time life shakes. The sturdy part is what you can do with your hands and who will show up when it falls apart."
          ]
        },
        {
          "paragraphs": [
            "Your generation rationalised taking more than its share and called it being sensible. You have heard yourself say that is just how business works, and felt the lie in it a half second later. The people who do best on paper in your circle are often the ones who gave up the most.",
            "The work you are here for is building a way of living where you can eat well without stripping something else bare. You will not manage it by guilt. You manage it by making the sustainable option the one that is also comfortable and good, which is the only version your kind of person will stay with."
          ]
        },
        {
          "paragraphs": [
            "You collect. Objects, accounts, land, routines, people who have proven loyal, all of it stored against a bad year that has not come. The habit makes you reliable and also makes it hard to share, lend or let go, even when letting go would cost you nothing.",
            "What you want underneath is something that outlasts you. You would rather build one slow, solid thing than ten quick ones, and you get restless around people who treat everything as disposable. The risk is mistaking stubbornness for strength and keeping a structure standing long after it stopped serving anyone."
          ]
        }
      ]
    },
    "gemini": {
      "intro": "You learned that whoever controls the story controls the room, and you made yourself hard to fool. Your generation watched how information is made and sold and came out suspicious of every headline. You read the second source, and the third.",
      "sections": [
        {
          "paragraphs": [
            "Your instinct is to take the sentence apart. Who said it, why now, what did they leave out. That makes you a sharp writer, a good interrogator, and a bad audience for a pitch. People your age have a nose for spin that older relatives just do not have.",
            "Your power is in what you can get people to believe, and you know it. You can say a thing so cleanly that the room tilts your way, and the discomfort comes the first time you do it knowing it was not quite true. After that you start choosing when you use it.",
            "You are living through a flood of information and your trouble is not finding facts, it is knowing which to trust. Some days you feel like the only one still checking. Your work is to say plainly what you know, even when a smoother lie is available."
          ]
        },
        {
          "paragraphs": [
            "Your generation grew up where anyone could say anything to everyone at once, and it left you both wiser about propaganda and more tired than anyone should be. You have scrolled yourself into certainty about things you could not defend out loud.",
            "What heals this is a habit your friends can learn from you: saying I don't know yet, and meaning it. Slow, careful, boringly accurate people are who the rest of you will end up trusting."
          ]
        },
        {
          "paragraphs": [
            "You have to know. You read the whole thread, open the extra tabs, ask the follow-up question, and lie awake with something you half learned. It can tip into collecting facts as a way to avoid deciding anything.",
            "You also believe that whoever names a thing owns it, and you use that. You give the nickname, the label, the one-line verdict, and it sticks, for better and worse. Notice when you name someone just to be done understanding them."
          ]
        }
      ]
    },
    "cancer": {
      "intro": "Home is where you were hurt and where you are trying to be safe, sometimes the same address. Your generation grew up while families split, shifted and rebuilt, and you carry a loyalty to your own people that is half love and half fear of being left out of it.",
      "sections": [
        {
          "paragraphs": [
            "You have a sharper sense than most of who is in the circle and who is out. You can feel the temperature of a family dinner from the doorway. You know who gets fed first and who gets forgotten, and you have probably been on both sides of that.",
            "Your power is emotional. You can make someone feel like they belong or like they do not, and everyone around you has seen you do both. The side of that you will not enjoy admitting is how well a cold shoulder works.",
            "You carry things that happened before you were born. A grandmother's silence, a father's temper, a country's grudge, handed down as mood rather than story, and you keep reacting to events you never saw. Part of your life is finally putting down what was never yours."
          ]
        },
        {
          "paragraphs": [
            "Your generation can turn belonging into a wall. It is easy for you to love your own people so fiercely that outsiders become a threat, and you have heard yourself say something about them that you would be ashamed of at another table.",
            "The harder move is to widen who counts as yours while refusing to pretend your family did no harm. You can love them and still stop the pattern with you. That is the cut you make so the next kid does not inherit it."
          ]
        },
        {
          "paragraphs": [
            "You need the house to be safe, and you will run yourself ragged to make it so. You hover, check in, feed people, and keep a quiet score of who did not call. Your care is real, and it also tightens until the people you love feel watched.",
            "The mother, yours or the idea of one, is a loaded subject for you. You swing between wanting to protect her and being furious at her, sometimes in the same hour. When you stop needing her to have been different, you stop re-living the argument with everyone who comes close."
          ]
        }
      ]
    },
    "leo": {
      "intro": "You want to matter in a way that cannot be taken back, and you have a feel for what it costs to be looked at. Your generation grew up around charisma, fame and personal brands, and you have watched what the spotlight does to people up close.",
      "sections": [
        {
          "paragraphs": [
            "You walk into a room and it shifts a little, and you know it. You also know that kind of pull can be used to lift people or to feed on them. Most of your life is deciding which one you are doing.",
            "Your power is that people follow your energy, your taste, your voice. The ugly side is the version of you who needs the applause to feel real, who goes sour when someone else gets the credit, and who takes a joke about your work as an attack on you.",
            "The part of you that dies, over and over, is the act. The polished version of yourself you built to win approval wears thin, and one day you drop it in front of people and nothing terrible happens. After that, what you make gets better, because it is yours."
          ]
        },
        {
          "paragraphs": [
            "Your generation hands out worship cheaply and takes it back faster. You have idolised someone and watched them fall, and part of you has wanted to be the one on the pedestal. Fame without anything behind it leaves you hollow quicker than you expect.",
            "The better path is the friend who makes everyone else more confident and gets quietly remembered for it. When you hand your fire to someone else without losing yours, you stop needing an audience to know you are real."
          ]
        },
        {
          "paragraphs": [
            "You want to be remembered. You think about what you will leave behind, and you work on things partly so that your name stays on them. It makes you ambitious and a little desperate, especially around people who seem to be remembered without trying.",
            "You also believe, without saying it, that love done properly can change anything. That belief is why you forgive too much, give too much and get burned. Keep the belief and add the boundary, and the heart you trust so much becomes your most reliable tool."
          ]
        }
      ]
    },
    "virgo": {
      "intro": "You can see what is broken, and you cannot stop yourself from reaching for the wrench. Your generation grew up watching how health, work and daily systems get run, and you came out wanting to fix the machine instead of just surviving it.",
      "sections": [
        {
          "paragraphs": [
            "You walk into any workplace and see in a day what is wasted, who is overworked and which rule exists for no reason. People your age are the ones who quit the job over a broken process and then rebuild it as a better business. You cannot leave a bad system alone.",
            "Your power is competence. You know how things work better than the people running them, and when you decide to change something, you do it by learning more than anyone expects. You win by being the one who read the manual.",
            "The trap is that fixing becomes your whole personality. You repair other people's lives before they asked, then feel resentful that nobody notices what you carry. Learning to sit with a thing that cannot be fixed is the hardest piece of work you will do."
          ]
        },
        {
          "paragraphs": [
            "Your generation uses improvement as a leash. Tracking, scoring, optimising, correcting, all of it dressed up as help, and you have both done it to people and had it done to you. You know the moment a helpful suggestion turns into control.",
            "Your body is where you carry the worry. You scan it for symptoms and hold yourself to a standard you would never put on a friend. When you learn to live in it without constant inspection, the people around you start to relax as well."
          ]
        },
        {
          "paragraphs": [
            "You want things clean, in the full sense of the word: clear of mess, of moral stain, of guesses. You will go to great lengths to remove what contaminates, and the search for the pure option leaves you stuck choosing nothing.",
            "You also think that if you analyse a thing enough, you can stop it hurting you. That works on spreadsheets and fails on people. The relief comes the day you let something stay unexplained and still sit down to dinner."
          ]
        }
      ]
    },
    "libra": {
      "intro": "You learned early that relationships are where the power really sits, and you have been negotiating from that moment on. Your generation grew up where partnership, fairness and the deal between two people got rewritten, and you keep finding out the hard way what is fair.",
      "sections": [
        {
          "paragraphs": [
            "You are most changed by the person you are closest to. A partnership breaks you open more than any job or move ever has, and you can name the exact relationships that rebuilt you. Your closest friends your age have the same history.",
            "You have a gift for getting people to agree, and you have used it as a weapon. You know exactly which smile closes a deal, which silence wins an argument, and you have won a few things you should have fought for out loud.",
            "Keeping things pleasant while you swallow what you really think is not peace, and you know it. You let resentment pile up until one small thing detonates. Your growth is saying the unpleasant sentence on the day it is true."
          ]
        },
        {
          "paragraphs": [
            "Politeness is your cover story. You can be savage in a perfectly civil voice, and the people on the receiving end go home puzzled about why they feel so small. You learned it as a kid, and you can unlearn it.",
            "Fighting fair means saying you are angry and then staying in the room. It terrifies you, because you think the relationship cannot take it. Mostly it can, and the ones that cannot were already ending."
          ]
        },
        {
          "paragraphs": [
            "You are searching for the one who makes you whole, and you have hung a lot of weight on people who could not carry it. Being alone for a stretch feels like a verdict instead of a season, so you stay in things that should have ended.",
            "Fairness is your itch. When something is lopsided you cannot let it go, and that is how you end up arguing for strangers online at midnight. Perfect justice is not on offer, so settle for the version where you at least stop being the one who tolerates it."
          ]
        }
      ]
    },
    "scorpio": {
      "intro": "You do not do shallow. Your generation grew up on the things people usually leave in the dark, sex, money, death, secrets, and it made you ask the question under the question every time. You have no talent for pretending you did not notice.",
      "sections": [
        {
          "paragraphs": [
            "You have gone through endings that would have finished someone else, and you came out different. You can name the month your old self died. Most of the people your age who grew up near you have a similar line in their story, and you recognise each other.",
            "Your power sits where people hide: in what they want, what they owe, what they fear. You read them quickly, and you can use that to help or to corner them. The people who trust you are trusting you with a loaded thing.",
            "You do not change a little. When it is time, you burn the whole structure, the relationship, the career, the version of you that was holding it up, and you start from ash. Each time is harder and the person who comes out is more honest."
          ]
        },
        {
          "paragraphs": [
            "You are drawn to the dark and can get too comfortable down there. You can treat darkness as the only honest place and start to mistrust anything warm. That is where your generation loses people: they get so good at the abyss that they forget to come back up.",
            "Your task is to go into the ugly thing and bring something back. A truth, a repaired relationship, a story that was kept quiet too long. That is what your family and friends will remember you for."
          ]
        },
        {
          "paragraphs": [
            "You cannot leave a secret alone. You search, probe, ask the next question, and read the room's silence like text. It makes you a brilliant investigator and a tiring person to hide from.",
            "Loss and renewal pull at you because you know they are the same event seen from two sides. You are not morbid. You just stay in the room when others leave, and over time you are the one people call when something is ending."
          ]
        }
      ]
    },
    "sagittarius": {
      "intro": "You need your life to mean something and you will tear down whatever lies about it. Your generation grew up while faiths, schools and global order lost their authority, and you were left to build your own answer from scratch.",
      "sections": [
        {
          "paragraphs": [
            "You have walked away from a belief you were raised with, and it cost you something. A church, a political side, a teacher, a version of the world your family took for granted. Your friends have a similar story, and you swap them like war stories.",
            "Your power is the story you tell about why things happen. When you believe it, you can move a room, and that is also when you are most dangerous, because certainty makes you stop listening. You have been right loudly and wrong loudly.",
            "What has to die in you is being sure. The self-righteous speech you give at dinner, the moral high ground you stand on, all of it has to fall at least once. It usually falls when someone you love turns out to be right."
          ]
        },
        {
          "paragraphs": [
            "Your generation has watched people kill and die for things they called truth. You have seen a good idea turn ugly the day somebody was told they had to hold it. You are wary of the person who says they have the answer, and sometimes that person is you.",
            "The better skill is to believe something fully while keeping the door open. You say what you hold, and you say you could be wrong, in the same breath. People trust that more than any speech."
          ]
        },
        {
          "paragraphs": [
            "You need a reason. A purpose that explains the pain, a philosophy that fits, a destination worth the trip. You try one after another, and each promises to be the one and then thins out, which sends you off to the next.",
            "You cannot stand a cage of any kind, a job, a doctrine, a relationship with too many rules. You break out well. What you have to learn is to build the next thing before you smash the last one."
          ]
        }
      ]
    },
    "capricorn": {
      "intro": "You have seen the institutions that were supposed to hold things up fail, and you decided to either run them properly or take them apart. Your generation grew up while governments, banks and bosses lost their shine, and you cannot take authority at face value.",
      "sections": [
        {
          "paragraphs": [
            "You are not impressed by titles. You check whether the person at the top can actually do the job, and if they cannot, it shows in how you treat them. At work you are either the one quietly fixing the structure or the one who leaves to build a better one.",
            "Your power is structural. You know how to build an organisation, a plan, a ladder, and how to find the beam holding up the ceiling. Used well, you reform things from the inside. Used badly, you turn into the boss you hated.",
            "Ambition is your fuel and your trap. You can climb for years and discover you built a tidy office for someone who does not exist. The authority worth having is the kind that holds up when nobody is watching."
          ]
        },
        {
          "paragraphs": [
            "Your generation has lived with orderliness that hid cruelty. You were raised to respect the system and then watched it protect the wrong people. You know exactly what tradition sounds like when it is excusing something.",
            "Tearing it down is the easy half. You have to also build the replacement and keep it running on a Tuesday. If you only take the roof off, somebody worse puts up a new one."
          ]
        },
        {
          "paragraphs": [
            "You cannot be neutral about power. You either want the chair or you want to know why that person has it, and you spend a lot of energy on that question. Hierarchy shapes how you meet every new group.",
            "You also feel what you build now will outlive you, and that makes you serious, sometimes joyless. You carry the whole load because you think nobody else will. Put a piece of it down, and watch what the others do with it."
          ]
        }
      ]
    },
    "aquarius": {
      "intro": "You can see the future being built and you do not trust who is building it. Your generation lives on the edge of new technology, new networks and new kinds of belonging, and you know it can free people or fence them in.",
      "sections": [
        {
          "paragraphs": [
            "You work in the part of the world that is changing fastest, and you know your skills could be obsolete next year. You are comfortable with that in a way older people find alarming. You assume the old social order is temporary.",
            "Your power is networks. You know how to get a group to move, a message to spread, a system to scale. In the wrong hands, which could be yours on a bad week, the same tools watch people instead of connecting them.",
            "The danger for you is idealism. You will design a better world with a completely clear conscience and miss that the plan treats people like parts. The change that actually holds starts in how you treat the person next to you."
          ]
        },
        {
          "paragraphs": [
            "Your generation is handing over its data and calling it convenience. You have felt the discomfort of being tracked and the pull of being seen, both at once. You want equality, and you have seen it demanded in a tone that crushed the very people it was for.",
            "What you protect is the person who disagrees. A group that can only survive by silencing its odd ones is already broken, and you are the one who can say so without leaving."
          ]
        },
        {
          "paragraphs": [
            "You live in tomorrow. You plan the next version of everything, and you miss the dinner happening in front of you. People close to you have said you seem far away, and they are right.",
            "You also want to belong far more than you let on. The loner act protects a real need for a group that fits. When you find three people who accept your strangeness, you stop performing detachment."
          ]
        }
      ]
    },
    "pisces": {
      "intro": "You feel the edge of things where the rest of us stop. Your generation grew up around dissolving certainties, spiritual hunger and a world that is hard to bear while awake, and you feel a strong pull to escape it.",
      "sections": [
        {
          "paragraphs": [
            "You can sense what other people are going through, and sometimes you take it on as your own. You have cried at a stranger's story, picked up a room's mood, felt a family's secret before anyone said it. Your friends your age tend to be the sensitive ones too.",
            "Your power is quiet. You change a room by what you feel and how you imagine, and you can heal a friend with one honest hour. Someone with less scruple could use the same ability to sell hope to people who badly want it.",
            "You are tempted to rise above everything. Meditating through an argument you should be having, calling it acceptance when it is avoidance. Real growth is landing back in your body, your house and your bills, and still keeping the vision."
          ]
        },
        {
          "paragraphs": [
            "Your generation can romanticise suffering. You have felt the pull toward being the one who gives up everything, and you have mistaken self-erasure for love. Compassion with no edges ends up feeding the person who takes the most.",
            "Strength, for you, looks like staying present when the old reflex is to float off. It looks like saying no to someone who is hurting and still caring about them afterward."
          ]
        },
        {
          "paragraphs": [
            "You want out of the ordinary. Out of your own head, out of the weight of the world, into music, a substance, a fantasy, a long sleep. Some of it is spiritual and some of it is just escape, and you know which is which on a good day.",
            "You believe nothing is beyond redemption. That belief is why you stay with people long past sense. Held with some ground under it, it makes you a real healer. Held without, it makes you refuse to admit that some things are simply sad."
          ]
        }
      ]
    }
  },
  "chiron": {
    "aries": {
      "intro": "Somewhere early, you got the message that taking up space was a problem. So you either apologise for wanting things or you come in swinging before anyone can say no. Both are the same hurt wearing different clothes, and learning to want out loud is how you end up helping everyone else do it.",
      "sections": [
        {
          "paragraphs": [
            "You learned that being bold got you punished, ignored or laughed at. The adults flinched when you got loud, or a sibling got the praise for the same behaviour, and you took it to mean you were too much. Now you hesitate before asking for the thing you came for.",
            "Your anger is either locked in or explosive. You swallow it for months, get headaches and low moods, then it goes off over something small and you are mortified. Calm, clean anger that says stop and means it feels almost forbidden.",
            "The question under it all is whether you are allowed to be here as you are. You shrink in meetings, or you swing too hard and lose the people you wanted. Both are ways of managing the same fear."
          ]
        },
        {
          "paragraphs": [
            "It starts when you act without waiting for permission. Order the thing, say the opinion, take the lead in the plan, and watch that nobody dies. Small proofs add up faster than any insight.",
            "You treat your anger as information. It tells you where a boundary got crossed or a need was ignored, and when you listen early it never has to explode. Using it that way gives you back energy you have been burning on holding it down.",
            "Your body does this faster than your head. Boxing, running, climbing, a hard dance class, anything where you push and push back, shows you your own force is not dangerous. Plenty of people with this placement heal through a gym before a therapist."
          ]
        },
        {
          "paragraphs": [
            "You are the person who tells a friend that they are allowed to quit, leave, say no, go for it. You spot the flinch in someone and you know what it costs. People trust you because you are not selling confidence; you are returning it.",
            "You end up coaching, training, defending or just being the loud friend in someone's corner. You are good with people who were told to be smaller, especially after something frightening happened to them. You hand them their own nerve back."
          ]
        }
      ]
    },
    "taurus": {
      "intro": "You grew up unsure you were worth good things, and that doubt follows you into your bank account and your own skin. You either grab and hoard or you quietly refuse comfort. Learning to receive without earning it first is what turns you into the one who shows others what they are worth.",
      "sections": [
        {
          "paragraphs": [
            "You learned that wanting nice things was shallow, or that there was not enough to go around. Maybe money was tight, maybe someone made you feel greedy for asking, and maybe you were simply never told you were valuable. You absorbed it as a rule about yourself.",
            "Money is tense for you whatever the balance says. You hoard because the fear of running out never lifts, or you undercut yourself, undercharge, lose the check, spend it before it stays. Either way you do not feel you have a right to be comfortable.",
            "It lands in your body too. You eat on the run, skip the bath, cannot relax into a massage or a nice meal. Pleasure feels like something that will be taken, so you do not settle into it."
          ]
        },
        {
          "paragraphs": [
            "You have to stop trying to earn your worth. Raising it with a bigger salary or a better body never works, because the number keeps moving. It starts when you let the nice thing happen without paying for it first.",
            "Slow, physical, real things do the work. Cooking a meal for yourself and sitting down for it, a garden, a long walk, a body practice you do for pleasure rather than for results. Letting someone give you something and saying thank you, without a counter-gift, is harder than it sounds.",
            "You sort out money without shame. You set prices, save a bit, spend a bit, give a bit, and look at the number without feeling something. When it stops being a verdict on you, the dread goes quiet."
          ]
        },
        {
          "paragraphs": [
            "You are the one who looks at a friend undercharging or apologising for taking up a chair and says, that is worth more. You see worth clearly in other people because you had to fight for your own. Your honesty about it lands.",
            "You end up working with bodies, food, land, money or craft, anything that helps people live well in the physical world. You make people feel that they deserve a good life, and they believe you."
          ]
        }
      ]
    },
    "gemini": {
      "intro": "You were told you talked too much, or too little, or that you were not that bright, and some part of you believed it. You rehearse sentences and then say them wrong anyway. Learning to say it imperfectly is how you become the person others finally feel understood by.",
      "sections": [
        {
          "paragraphs": [
            "Someone made you feel stupid early. A teacher, a parent, a sibling, a speech problem, a reading problem, a class where you froze. The memory is still specific enough to make your face go hot.",
            "You overthink every message before sending it, or you talk a lot to cover the silence. Either you avoid conversations where you might sound foolish or you fill every gap so no one can judge the quiet. Neither feels like you.",
            "Under it is the fear of being alone in your own head with nobody able to reach you. You say something true and it lands wrong, and the loneliness of that is the real injury. You keep trying to build the bridge and keep watching it wobble."
          ]
        },
        {
          "paragraphs": [
            "You give up on saying it perfectly. Misunderstandings are what happens between any two people, not proof you are bad at this. Once you stop demanding flawless delivery, you say more and it goes better.",
            "Writing, music, drawing and voice notes become your route. You say things on the page you cannot say across a table, and that is fine. Plenty of people with this placement are far more articulate in text than live, and they stop apologising for it.",
            "You learn to listen properly, which sounds easy and is not. You were so busy managing your own delivery that you missed half of what others said. When you start receiving, conversations stop feeling like exams."
          ]
        },
        {
          "paragraphs": [
            "You are good at translating. You hear a clumsy sentence and know what the person meant, then say it back so they nod. People who have never been understood find themselves understood by you.",
            "You end up teaching, writing, mediating or coaching, and you are patient with slow talkers and stuck thinkers. You do not make anyone feel stupid, because you remember exactly how that felt."
          ]
        }
      ]
    },
    "cancer": {
      "intro": "You never quite felt at home where you grew up, and some part of you is still waiting to be picked up. You build beautiful places for other people and wonder why they do not feel like yours. When you mother yourself properly, you become the person who gives other lost people somewhere to land.",
      "sections": [
        {
          "paragraphs": [
            "Your family did not feel safe or did not fully see you. A parent who was away, ill, cold or overwhelmed, or you were the odd one out at the table. You stayed close anyway and kept hoping.",
            "You make homes, feed people, hold groups together, and still feel a gap that no amount of giving fills. You give love in the form you wished you got, and it does not come back that way. The mother thing, the real one or the idea, sits in the middle of it.",
            "A younger part of you is still waiting by the door. Your achievements, your friends and your lovely flat do not reach that part. Until it is held, you keep trying to be held by people who cannot know where to find it."
          ]
        },
        {
          "paragraphs": [
            "You start by giving yourself what nobody gave you. A regular bedtime, real meals, a kind voice when you slip up, a day when you do nothing and nobody minds. It is dull daily care, and it works.",
            "You let yourself grieve. For the family you needed, the mother who was not what she should have been, the childhood you did not have. Once you cry about it properly, the ache stops running your choices.",
            "You build the home and the chosen family you wanted, one honest friendship at a time. The place does not have to look like anyone else's. When it is yours and it is safe, the old wound turns into the warmth people come to you for."
          ]
        },
        {
          "paragraphs": [
            "You can tell within five minutes who has not been looked after. You pass them a drink, make room, ask the second question. For people who have been displaced, rejected or forgotten, you are the first person who actually makes space.",
            "You end up fostering, counselling, running the community kitchen, the one who hosts everyone. You mother people who were never mothered and you do it without condescension, because you know what it was like to stand in the cold."
          ]
        }
      ]
    },
    "leo": {
      "intro": "You were told to sit down, stop showing off, or not to bother, and you learned to dim yourself. You want to be seen and flinch when you are. Letting yourself be proud again is how you end up the person who gets other people shining.",
      "sections": [
        {
          "paragraphs": [
            "Someone laughed when you performed, or a sibling got the spotlight, or a parent found your joy embarrassing. You stopped doing the dance, the song, the drawing, and learned to be small and agreeable. You still remember the exact day.",
            "You want attention and dread it in equal measure. You freeze on stage, deflect a compliment, and hold your best idea until someone else says it. Or you go loud to be sure you cannot be missed, and it comes out as need.",
            "Underneath is the fear that the real you, the joyful, creative, loud-hearted one, is too much to love. So you play it ordinary and feel empty, or you demand to be adored and push people off. Both come from the same child who got laughed at."
          ]
        },
        {
          "paragraphs": [
            "You make things in private first. Write the song nobody hears, paint the bad painting, dance in the kitchen. The aim is to remember that making things is fun before anyone is allowed an opinion.",
            "You break the link between worth and applause. You make something because you want to, share it because you want to, and the reaction becomes a nice extra. That is when confidence stops depending on the crowd.",
            "You find people who clap for the right reasons. A group, a class, a few friends who respond with real interest and do not mock. Being seen safely a few times does more than ten motivational talks."
          ]
        },
        {
          "paragraphs": [
            "You can tell when someone is hiding their talent and you are not shy about pushing. You say it is good, do it again, take the stage. You give people the kind of encouragement you wish you had got.",
            "You end up teaching, directing, running a children's class, coaching, producing, or being the friend who talks everyone into the open mic. You pick out the spark in people before they believe they have one."
          ]
        }
      ]
    },
    "virgo": {
      "intro": "You decided long ago that you are the problem and that enough effort would fix you. It does not, so you keep going. When you finally point that sharp eye of yours at yourself with kindness, you become the healer who catches what everyone else missed.",
      "sections": [
        {
          "paragraphs": [
            "You grew up with the feeling that you were never quite right. Somebody pointed out your flaws, or you were the helpful one who still got criticised, and you learned that mistakes proved something awful. You went on to catch every one of them before anyone else could.",
            "You are hard on yourself in a way you would never be with a friend. You check your body for symptoms, count what you ate, redo work that was done, and tidy a room while telling yourself off. Anxiety about health or food or order can take over whole weeks.",
            "Underneath is the belief that you are broken and that being useful is your only defence. You keep improving yourself, and the finish line keeps moving. Good enough is something you have never actually felt."
          ]
        },
        {
          "paragraphs": [
            "You allow yourself to be imperfect in public. Leave the typo, wear the creased shirt, serve the slightly burnt dinner, and notice nobody runs. It sounds trivial, and it is the hardest practice you have.",
            "You turn the attention you give to flaws into attention you give to yourself. The same eye that catalogues errors can notice that you are tired, hungry, or doing fine. When you aim your precision at care, you stop treating yourself like a project.",
            "You make peace with your body by listening to it instead of ruling it. Eating when hungry, resting when ill, moving because it feels good. Once it becomes an ally, the rest of life loosens too."
          ]
        },
        {
          "paragraphs": [
            "You notice what others miss: the symptom, the missing step, the tiny habit behind a big problem. People come away from an hour with you with something practical they can use tomorrow. You do not give vague comfort; you give a plan that fits.",
            "You end up in nutrition, herbs, physiotherapy, nursing, bodywork, editing, anything where detail saves a life. Because you know what it is to feel flawed, you are gentle with other people's mess, and they can tell."
          ]
        }
      ]
    },
    "libra": {
      "intro": "You learned to earn love by shrinking, and now you wonder why the people who stay are not the ones you wanted. You give yourself away to keep a partner. When you stop, you become the person who helps other couples fix what you broke.",
      "sections": [
        {
          "paragraphs": [
            "Somewhere you decided you were hard to love, or that love had to be paid for with your own needs. Maybe a parent left, or one of them held the other up, or you watched a marriage turn into a negotiation. You took the lesson that you must be agreeable to be kept.",
            "You take the too-kind route in love. You give in, agree to what you do not want, and stay long past the point where it was good. Or you avoid getting close because rejection would flatten you. You pick partners who are cold, unavailable, or just not on your level, and you try to win them.",
            "Underneath is that you abandon yourself first. You drop your opinions, your hobbies and your friends to fit a relationship, and then you are lonely inside it. The thing you do to be loved is what stops anyone loving the real you."
          ]
        },
        {
          "paragraphs": [
            "You build a life that is yours before you try to share one. Your own friends, your own money, your own Saturday plans. Being on your own for a while shows you that you are not half of anything.",
            "You practise saying no and disagreeing in small doses. I'd rather not, I see it differently, I need a night in. Every time you say one and the person stays, the old rule loses ground.",
            "You choose partners who treat you as an equal and notice when they do not. Fairness in the day to day, who cooks, who decides, who apologises, is where this wound heals. The love you wanted comes once you stop buying it."
          ]
        },
        {
          "paragraphs": [
            "You see the imbalance in a couple faster than they do. One of them is doing all the giving, the other keeps score, and you know what is under it. You say it gently enough that it can be heard.",
            "You end up mediating, counselling, doing social work or being the friend everyone's partner problem lands on. You have been the one who disappeared into a relationship, so you recognise it in others and help them find their way back."
          ]
        }
      ]
    },
    "scorpio": {
      "intro": "Someone you trusted used it against you, and you have kept your guard up ever since. You read everyone before they can read you. Letting the right person in, slowly, is what makes you the one who can sit with others in the worst hour of their lives.",
      "sections": [
        {
          "paragraphs": [
            "Someone crossed a line with you early. A betrayal, a violation, a secret turned into a weapon, a person you trusted who proved dangerous. After that, being seen felt like standing in the open with your back turned.",
            "You protect yourself with intensity. You test people, withhold information, go cold, or analyse them first so they cannot do it to you. You want closeness badly and make it nearly impossible to get.",
            "The root is having been made powerless. You swore never again, so you control what you can, watch for the signs, and get pulled back to the kind of intensity that hurt you. You know it, and some days you do it anyway."
          ]
        },
        {
          "paragraphs": [
            "It happens slowly. You tell one person one real thing and see what happens. You survive it, then do it again, and over years the wall comes down by inches.",
            "You go back to what happened, with a good therapist, a trusted friend, or a ritual that lets you say it. Facing it takes back the power that went missing. You are better at this than most, because you do not flinch from dark rooms.",
            "You turn the intensity from armour into depth. Your honesty, your need for truth and your refusal to do small talk stop being defences and start being what people love about you."
          ]
        },
        {
          "paragraphs": [
            "You can stay in the room with the thing nobody else can look at. A death, an abuse story, a breakdown. You do not rush to comfort or fix, and that steadiness is what people need most.",
            "You end up in trauma work, hospice, crisis lines, or you are simply the friend people call at 3 a.m. You know what it is like to come apart and get put back together, and you tell the truth about it."
          ]
        }
      ]
    },
    "sagittarius": {
      "intro": "At some point what you believed in stopped holding you up, and you have been looking for something to stand on ever since. You chase meaning across places, books and people. The day you build your own and start sharing it, you become the one who gives others their faith back.",
      "sections": [
        {
          "paragraphs": [
            "Your faith got broken. A religion that turned out hypocritical, a country you left, a teacher who lied, a loss that made the explanations sound cheap. After that, everybody else seemed to have a purpose and you were reading from someone else's script.",
            "You keep searching. You move, travel, study another philosophy, try another retreat, and each time it promises to be it and then thins out. The next horizon looks better until you get there.",
            "Beneath it is the feeling that the universe forgot you. You put on the cheerful, big-picture face while quietly wondering whether any of it is for something. The optimism looks solid and feels borrowed."
          ]
        },
        {
          "paragraphs": [
            "You stop searching for meaning and start making it. Show up, commit to something and see what it gives you back. A purpose built from your own days holds better than one imported from a book.",
            "You make peace with not knowing. You say, I don't have the answer, and stay curious. A faith that has doubt in it does not shatter the next time life hits.",
            "You teach what you are still working out. Explaining your half-formed ideas to someone else gives them shape, and you often find that the teaching is the purpose you went looking for."
          ]
        },
        {
          "paragraphs": [
            "You are the person who stays up with someone whose world just collapsed. You do not hand over a slogan; you say you have been in that desert and here is what helped. People hear the difference.",
            "You end up counselling, teaching, guiding, chaplaincy, writing or travelling with people who need a broader view. You help others rebuild hope after the old version fell apart, and you speak from experience, not theory."
          ]
        }
      ]
    },
    "capricorn": {
      "intro": "You worked out young that love came with a performance review, and you have been passing it ever since without ever feeling you passed. You hit the goal and the goalpost moves. When you finally rest inside your own worth, you become the leader others trust.",
      "sections": [
        {
          "paragraphs": [
            "You grew up where approval was conditional. A hard or absent father, responsibilities too heavy for a kid, an atmosphere where you were valued for what you did. You learned to be useful and to hide the cost.",
            "You achieve and it does not land. You get the promotion, the degree, the praise, and feel like a fraud waiting to be found out. The next target appears before you have sat down, and rest feels like laziness.",
            "Underneath is the belief that love has to be earned and you never have quite earned it. You carry a father figure in your head, real or imagined, who is never satisfied. You set a standard nobody could meet and punish yourself for missing it."
          ]
        },
        {
          "paragraphs": [
            "You start by separating who you are from what you do. Take a day with nothing to show for it and notice you are still here. It is a weird feeling at first, and then a relief.",
            "You learn to rest, fail and ask for help. You let a project be mediocre, tell someone you are struggling, and discover the respect does not leave. The discipline you aim at work, you aim at your own care.",
            "You change what counts as success. Friends who actually know you, a body that works, an afternoon that belonged to you, work you can look at without dread. When those are on the scoreboard, the title on the door matters less."
          ]
        },
        {
          "paragraphs": [
            "You are the mentor who tells the high achiever that they are allowed to stop. You have seen the top and you know how it feels. People take your advice because you have the credentials and the honesty.",
            "You end up coaching, consulting, leading, teaching, running something with a human face. You show that being strong and being open can sit together, and younger people watch you and relax."
          ]
        }
      ]
    },
    "aquarius": {
      "intro": "You have always felt slightly outside the group, too odd for the normal crowd and too normal for the odd one. You either avoid people or serve them from a distance. Finding the few who fit is how you become the one who builds a place for everyone else who does not.",
      "sections": [
        {
          "paragraphs": [
            "You were the odd one at school, in the family, at work. The different kid, the one with the strange interests, the one who said the thing out loud. You learned that standing out gets you shut out.",
            "You are ambivalent about groups. You skip the party to avoid being the outsider, or you join the cause and stay emotionally behind glass. You can do a hundred people's worth of activism and still go home feeling that nobody actually knows you.",
            "Underneath is the sense that something about you makes belonging impossible. The very things that make you feel like an alien, your originality, your angle, your refusal to fit, are what people keep coming to you for. You are slow to believe that."
          ]
        },
        {
          "paragraphs": [
            "You stop trying to be more normal. You say the odd thing, wear what you like and bring the strange hobby up, and see who leans in. The people who stay are your kind, and they were out there the whole time.",
            "You find your small tribe. Three or four people who like how you are different, not a crowd that tolerates you. Good friends are rarely found in big rooms.",
            "You let one friend see the feelings under the cleverness. Being weird is not your hard part; being soft is. The first time you say I was hurt and a friend answers I get it, your sense of exile starts to loosen."
          ]
        },
        {
          "paragraphs": [
            "You see the new kid, the loner at the edge of the room, the person quietly different, and you make a gap for them. You do not try to fix them; you tell them there are others like them.",
            "You end up building communities, running groups, creating spaces for misfits, working in social innovation. You turn your own isolation into a door others walk through."
          ]
        }
      ]
    },
    "pisces": {
      "intro": "You feel too much and have never found a good place to put it. The world seems rough and you have wanted to check out of it, one way or another. When you learn to feel everything without drowning, your presence becomes the thing people remember as healing.",
      "sections": [
        {
          "paragraphs": [
            "You have felt homesick for somewhere you cannot name since you were small. The world felt loud and unkind, and you soaked it up. Other kids seemed to have thicker skin and you did not know how to get it.",
            "You cannot always tell where you end. A friend's bad mood becomes yours, a news story ruins your week, a sad song stays for days. To cope, you reach for what numbs or lifts you out: wine, sleep, scrolling, fantasy, a spiritual idea that keeps you above it.",
            "At the bottom is the ache of being in a body at all. You remember a sort of belonging that you cannot reach from here, and everyday life feels like a rough translation of it. The grief is not about anything specific, which is why it is so hard to talk about."
          ]
        },
        {
          "paragraphs": [
            "You learn boundaries without losing softness. You can feel a friend's pain and not take it home, leave a conversation before it drains you, and say not tonight. Sensitivity is the gift; sponginess was the problem.",
            "You find ways to be spiritual that keep your feet on the floor. Walking in the woods, swimming, painting, playing an instrument, volunteering. They give you the sacred feeling without the escape.",
            "You use your pain as fuel instead of trying to outrun it. A bad year becomes the thing that lets you sit with another person's. The sensitivity that used to wreck you becomes the most useful thing you own."
          ]
        },
        {
          "paragraphs": [
            "You help just by being there. You do not need a technique; the person across from you feels met and goes quiet. People who could not say it to anyone say it to you.",
            "You end up in energy work, counselling, music, art therapy, addiction recovery, anything that reaches the soul. You do not fix people. You keep them company, and for some that is the whole cure."
          ]
        }
      ]
    }
  },
  "juno": {
    "aries": {
      "intro": "You know fast. Within a few weeks of meeting someone you have decided whether they are the one, and you go after them out loud, with no games. What you will not accept in return is a partner who tries to slow you down, manage you or turn the relationship into a place where you ask permission.",
      "sections": [
        {
          "paragraphs": [
            "When you commit, you say so before you are comfortable saying so. You text first, you book the trip, you tell your friends the week after the third date, and you expect the other person to match that pace or say plainly that they can't.",
            "You cannot stay with someone who keeps a calendar on you. The first time a partner asks where you were and sounds like they want a report, something in you goes cold, and you start planning your exit without telling anyone.",
            "Your fights are loud and quick. You say the thing, the other person says the thing back, and twenty minutes later you want dinner. If your partner needs three days of silence to recover from one sharp exchange, you read it as punishment, and that is when you begin to pull away."
          ]
        },
        {
          "paragraphs": [
            "You need a marriage that keeps moving. A shared goal helps, a race you both train for, a business, a move abroad, because when the routine settles into the same sofa and the same show you feel your pulse drop and you get restless in a way that looks like falling out of love.",
            "You also need a partner with a life of their own. Someone who drops every interest to orbit you loses your respect within a year, and you will not understand why you stopped wanting them. The partner you keep is the one who argues back and has somewhere else to be on Saturday."
          ]
        },
        {
          "paragraphs": [
            "The person who holds you is athletic or at least restless, ambitious, and not afraid of your temper. They can take a blunt sentence without crumbling, and they can give one back. Competition at the tennis court or over a board game is part of how you flirt, and you keep flirting for decades.",
            "You tend to commit early and sometimes too early, starting with a fireworks courtship and a quick yes. If the first partner can't keep up with your pace and your need for space, you leave cleanly and start again. The marriages that last are the ones where you are still being courted in year twenty and still doing some of the chasing yourself."
          ]
        }
      ]
    },
    "taurus": {
      "intro": "You commit once and you mean it for life. You want a partner who shows up at the same time every evening, shares a table with you, and builds something you can both touch: a home, savings, a garden. Once you've decided, nothing short of a real betrayal moves you, and that includes the things that should have moved you years earlier.",
      "sections": [
        {
          "paragraphs": [
            "You are not interested in a whirlwind. You want to know where the relationship is living in five years, and you'd rather spend a slow Sunday cooking with someone than be swept off to another country by them. Love, for you, is things you can point at: the dinner, the hand on your back, the lease with both names on it.",
            "You are loyal to a fault, and the fault is real. You will stay in a dead relationship for years because you have put so much into it, because leaving means dismantling what you built, and because you dig in when pushed. People around you see the expiry date long before you admit to it.",
            "You say it with routine. The coffee made the same way every morning, the walk after dinner, the same side of the bed. A grand gesture on a random Tuesday makes you suspicious; the person who is reliably there for ten years earns you completely."
          ]
        },
        {
          "paragraphs": [
            "You cannot relax around money chaos or flaky behaviour. A partner who spends the rent, cancels twice a week or drifts in and out emotionally sets off a low hum of anxiety in you that you will carry until something breaks. Stability is the entry fee, not a bonus.",
            "You need to be touched and fed and in the same room. A long-distance relationship starves you faster than you'd expect, and a sexless one makes you feel like a housemate. Beautiful surroundings and good food are not luxuries to you, they are how you know you're loved."
          ]
        },
        {
          "paragraphs": [
            "The partner who suits you is dependable, sensual, financially grounded and patient. They like comfort without being lazy, enjoy nice things without making them the point, and can commit without a drama every quarter.",
            "You court slowly, and practical facts weigh heavily in who you pick: job, family, whether they pay their bills. Your marriages tend to get better with age, because every year of shared meals, shared savings and shared habits makes the life you share harder to leave and nicer to stay in."
          ]
        }
      ]
    },
    "gemini": {
      "intro": "You fall for someone's mind before you fall for anything else. If the conversation dies, the attraction goes with it, and you can sit across a gorgeous person at dinner feeling your interest drain. What you need from a partner is someone who keeps you curious for decades, and the dealbreaker is predictability.",
      "sections": [
        {
          "paragraphs": [
            "You test a person with talk. On the first dates you are checking whether they can follow your tangents, bounce a joke back and tell you something you didn't know. A great face with nothing behind it bores you by the second drink, and you are polite about it for longer than you should be.",
            "Inside a relationship you need things to keep changing. A new topic, a new neighbourhood, a side of them you hadn't met yet. The day you can finish their sentences and they can finish yours without surprise, you start checking your phone at the table.",
            "You process everything out loud. You text during the day, send them articles, leave voice notes, and you work through a fight by talking about it. A partner who goes silent, sulks for two days or says nothing is wrong makes you frantic, because to you silence is the one thing that does not resolve anything."
          ]
        },
        {
          "paragraphs": [
            "You need your head to be free. A partner who gets threatened by your many friends, your long phone calls or the three new hobbies you picked up this month will lose you slowly. You don't cheat to get away; you just stop telling them things.",
            "You also need a partner who moves. Somebody who stopped reading, stopped asking questions and wants every year to look like the last one will feel like a closed door. Your commitment is real, but what you're committing to is changing together, not staying the same."
          ]
        },
        {
          "paragraphs": [
            "The person for you is quick, curious, well-read and has their own circle and opinions. They argue with you for fun and tell a story well. Dull is the one thing you can't live with.",
            "You often meet through work, school or a shared obsession, and you take longer to commit than most because you want to see what else is out there. Once you do say yes, you keep the marriage alive the way you keep everything alive, by talking: constant messages, endless plans and new things learned side by side."
          ]
        }
      ]
    },
    "cancer": {
      "intro": "You want a home with a person in it. Commitment, for you, means somebody who comes back to the same kitchen, who knows how you take the news of a bad day, and who makes you feel safe enough to cry without explaining. If your partner treats feelings as an inconvenience, you can't stay, however good the rest looks.",
      "sections": [
        {
          "paragraphs": [
            "You put your whole soul into a partnership. You make the home warm, you remember their mother's birthday, their allergies and the exact way they fall silent when something is wrong. Your partner is held in a way few people get to be.",
            "You notice a need before it is spoken. You put the soup on before they say they're sick, you leave the lamp on, you keep a drawer of their things. All of that care is real, and it is also a ledger that you are keeping without knowing it.",
            "When you're scared, the care turns sharp. You go quiet, you sigh in the next room, you make them guess what they did, and you withhold the warmth that you usually give freely. That is how you ask for reassurance when you can't say the words, and a partner has to learn to hand it over without feeding the pattern."
          ]
        },
        {
          "paragraphs": [
            "You need to be safe emotionally, and you can tell within minutes whether you are. A partner who mocks vulnerability, rolls their eyes at tears or takes your care for granted will drain you quickly, and you will keep giving anyway until you are empty and bitter.",
            "You need the relationship to become a family. Children, chosen family, a house full of people on holidays; a couple that stays only a couple, with no wider circle around the table, will leave you feeling that something has been left unfinished."
          ]
        },
        {
          "paragraphs": [
            "The partner who fits you is emotionally available, home-loving and not embarrassed by deep feeling. They prefer a night in with your cooking to a club and would rather be understood than impressed.",
            "You bond early and you put family first in every decision, from where you live to which job gets taken. Your marriages often get stronger through the hard shared jobs, raising kids or looking after ageing parents, because that is when your partner finally sees what you've been building the whole time."
          ]
        }
      ]
    },
    "leo": {
      "intro": "You want to be chosen out loud. A quiet, understated arrangement leaves you cold; you want the person who stands up at the party and says you are the best thing that happened to them. What you won't tolerate is being a line item in someone's life, and the moment you feel taken for granted the whole partnership starts to dim.",
      "sections": [
        {
          "paragraphs": [
            "You treat commitment as a love story, and you expect it to look like one. You like the proposal with people watching, the anniversary dinner booked three months ahead, the partner who never stops courting you. If they stop trying after the wedding, you notice it on day one.",
            "In return you are generous to the point of extravagance. You cheer for their promotion louder than they do, you introduce them as the most talented person you know, and you show them off because you are proud, not because you're vain. They will never doubt that you are on their side.",
            "You need to be seen, and when you aren't, you get loud. A forgotten birthday or a flat reaction to something you made can turn into an evening of wounded silence followed by a speech. Your partner has to be willing to give real praise often, without sighing about it."
          ]
        },
        {
          "paragraphs": [
            "You need to feel special, not just loved. Included is not enough, you want celebrated. A partner who is kind but never lights up when you walk in will slowly starve you, and you will start performing for strangers to get what you can't get at home.",
            "You also need play in the marriage. If the whole thing shrinks to schedules, bills and who does the dishes, with no joke, no dressing up, no date that isn't errands, your spirit goes grey. You would rather have less money and more fun than the other way round."
          ]
        },
        {
          "paragraphs": [
            "The partner who fits you is warm, confident and generous, with a light of their own. They have a talent, a laugh or a presence that doesn't wilt when you're in the room, and your brightness makes them brighter instead of making them shrink.",
            "Your weddings and proposals tend to be remembered, and your friends point to you two as the couple who still go out. The marriages hold when both of you keep spending effort on romance and on admiring each other, and they sag fast when one of you decides the courting is over."
          ]
        }
      ]
    },
    "virgo": {
      "intro": "You show love by fixing things. You remember how they take their coffee, you spot the cold coming before they do, and you quietly book the appointment they've been putting off. In return you need a partner who carries their share of daily life, and a person who lets you do everything while they praise your patience will lose your respect.",
      "sections": [
        {
          "paragraphs": [
            "Your love language is the thousand small tasks. You refill the prescription, you check the tyre pressure, you put the bill reminders in a shared calendar. A partner who thinks love is only the big words misses most of what you've been saying for years.",
            "You treat the relationship like a craft you're trying to get right. You notice what could run better, from how you handle money to how you handle Sunday evenings, and you work at it without being asked. It is a real gift, and it makes you tired.",
            "The part that hurts people is the criticism. You spot the flaw, say it precisely and think you're helping, while your partner hears that they are never quite enough. You mean it as care, and it lands as a verdict, so you need to learn where to stop."
          ]
        },
        {
          "paragraphs": [
            "You need someone who sees the small things you do. A thank-you for the lunch you packed means more to you than a surprise weekend away. When the work you do is invisible to your partner, you stay quiet and keep a private tally.",
            "You also need a partner who does their half of the actual running of life: money, chores, appointments, the boring admin. You cannot respect someone who lets you carry the household and calls it your preference."
          ]
        },
        {
          "paragraphs": [
            "The person for you is organised, looks after their body, is modest and willing to deal with the details. They keep the place reasonably clean, show up on time and treat their own life with the same care you give yours.",
            "You build practical marriages: shared budgets, systems for everything, a household that works. They deepen through accumulation, one remembered favour and one handled problem at a time, until your partner realises their whole life rests on a foundation you laid by hand."
          ]
        }
      ]
    },
    "libra": {
      "intro": "You were built to be half of two. You know without being taught how to share a decision, split the effort and make a room feel good for both people, and you want a partner who does the same. The dealbreaker is lopsidedness: one person giving and the other collecting.",
      "sections": [
        {
          "paragraphs": [
            "You treat partnership as something you make well. You choose the restaurant together, you notice who spoke last at dinner, you adjust so that nobody is the one who always gives in. Your friends say you two just look right at a table.",
            "Inside the relationship you are fair, attentive and considerate. You listen until your partner finishes, you split things evenly, and you care how the flat looks and how the evening feels. People watch your couple and quietly take notes.",
            "What you do badly is the ugly argument. To keep the peace you swallow your actual opinion, say fine, smile, and then carry the resentment behind that smile for months. Your partner has no idea anything is wrong until you suddenly leave, and the lesson you need is that an honest disagreement is part of the harmony, not a break in it."
          ]
        },
        {
          "paragraphs": [
            "You need equality, and you measure it. Who initiated last time, who planned the trip, who apologised, who cried. If it tilts too far to one side for too long, you can't relax, and you will quietly even the score or leave.",
            "You also need beauty in the life you share. A good table, a gallery on Saturday, music playing while you cook, a home with some thought in it. A relationship that is purely logistics, however loyal, makes something in you wither."
          ]
        },
        {
          "paragraphs": [
            "The person for you is refined, fair-minded, graceful with other people and committed to equality. They have taste, manners and decent values, and they understand that partnership is something two people practise together, not something one person performs for the other.",
            "Your standards make choosing slow, and you may say no to perfectly nice people before you say yes to one. After that you commit on purpose and keep investing, and the marriage lasts because of mutual respect, constant small repairs and the way you keep making the effort to stay a pair."
          ]
        }
      ]
    },
    "scorpio": {
      "intro": "You do not want a pleasant companion, you want someone who sees all of you and stays. Anything less feels like a performance, and you can smell one from across the room. What you ask of a partner is total honesty and loyalty, and what you will never forgive is being lied to.",
      "sections": [
        {
          "paragraphs": [
            "When you commit, you merge. Their moods become yours, their enemies become yours, and you know what they are not saying before they say it. Most people have never been loved with that kind of attention, and some find it too much.",
            "You are fiercely loyal and you will go a long way for your partner, quietly and without a speech about it. The price is that you expect the same, completely. If you find out about the secret messages or the thing they hid for a year, that is the end of it; you do not do second chances on betrayal.",
            "Your shadow is the grip. When you are afraid of losing someone you check their phone in your head, test them with silence and turn jealousy into a weapon. The hardest thing you'll learn is to hold a person tightly enough to love them and loosely enough that they stay by choice."
          ]
        },
        {
          "paragraphs": [
            "You need the real conversation. Small talk about the weekend and polite avoidance when something is wrong make you furious. You need a partner who stays in the room when it gets ugly, says the true thing, and is not frightened by what you say back.",
            "Sex is not optional or recreational for you. It is where you feel the bond, and if the physical side goes flat or cold you read it as the relationship dying at the root, even when everything else is fine."
          ]
        },
        {
          "paragraphs": [
            "The partner for you is emotionally brave, sexually confident, deeply loyal and not scared of intensity. They have looked at their own mess and can talk about it, and they treat the relationship as something that changes both of you.",
            "Your courtships are intense, your bonds often form during a crisis or a confession, and your marriages go through cycles where something dies and something new takes its place. The ones that survive the fire become the hardest relationships to break that anyone knows."
          ]
        }
      ]
    },
    "sagittarius": {
      "intro": "You want a partner for the road, not a landlord. You will commit to someone who makes the world bigger, who says yes to the trip nobody planned, and who laughs at the same ridiculous things you do. Jealousy and a clingy leash are the dealbreakers, and you will leave over them before you'd leave over almost anything else.",
      "sections": [
        {
          "paragraphs": [
            "You treat commitment as a long trip you're taking with someone. Travel, a course abroad, a late-night argument about God and money, a plan to move somewhere new: that is how you bond. A partner who wants the same street for forty years has to love you very much to stay.",
            "Inside a relationship you are generous, cheerful and good company. You turn a bad Tuesday into a story, you plan the next adventure before the last one is unpacked, and your partner gets laughter that doesn't run out.",
            "Your trick is calling avoidance freedom. When closeness gets heavy you suddenly need a trip, a project or space, and when you tell the truth you do it bluntly, with no softening, so it cuts. Learning to stay in the room when it is boring or painful is what makes you a real partner instead of a fun one."
          ]
        },
        {
          "paragraphs": [
            "You need room to move. Time for your own trips, your own studies, your own friends in other countries. A partner who sulks when you go, checks where you are or asks why you need to leave sets off your flight instinct fast.",
            "You also need the relationship to mean something. Bills and furniture alone will not hold you; you need to feel the two of you are heading toward something that matters, a belief, a mission, a life that keeps getting larger."
          ]
        },
        {
          "paragraphs": [
            "The partner for you is adventurous, open-minded, curious about big questions and comfortable on their own. Someone from another culture, or someone who sees the world from an angle you hadn't tried, tends to keep your attention longest.",
            "You commit later than most, often to someone you met while travelling or studying, and you pick growth over security. The marriage works when both of you keep learning, keep going places and keep refusing to let the routine close in."
          ]
        }
      ]
    },
    "capricorn": {
      "intro": "You treat marriage as the most important project of your life, and you will not start it until you're sure. You want a partner who takes you seriously, plans ahead and builds a life that is still standing in thirty years. Disrespect, or a partner with no direction, ends it faster than a fight.",
      "sections": [
        {
          "paragraphs": [
            "You do not rush. You watch, you assess, you ask yourself whether this person can carry a mortgage, a crisis and a decade, and only then do you say yes. When you do, you are rock-solid: promises kept, anniversaries remembered, the relationship handled with the same seriousness as your career.",
            "You are responsible and dependable, and your partner can lean on you without a second thought. You take pride in the partnership and put real work into it, quietly, over years.",
            "Where you slip is warmth and appearance. You may care more about how the marriage looks to the outside than how it feels at 11 at night, and you struggle to say I'm scared or I need you. Love is not a business you can manage, and the people closest to you have been waiting to see that you know it."
          ]
        },
        {
          "paragraphs": [
            "You need respect, first and above everything. You need to know your partner takes your work and your judgment seriously, and a casual sneer or a dismissive joke in front of friends hurts you more than you admit.",
            "You need a shared plan. Where the money goes, where you live in ten years, what you are leaving behind. A partner who drifts, has no ambition and shrugs at the future frustrates you deeply, and you will start running the show alone."
          ]
        },
        {
          "paragraphs": [
            "The partner for you is ambitious, mature, responsible and settled in the world. They've built something, they carry themselves with dignity and they think ahead as you do.",
            "You commit later, practical facts weigh in the choice, and the marriage usually gets better with age. Shared achievements, years of kept promises and deepening trust stack up until the bond is very hard to shake."
          ]
        }
      ]
    },
    "aquarius": {
      "intro": "You will not sign up for the standard script. You write your own vows, keep your own friends and decide for yourselves what living together even means. A partner who needs you to act like other couples, or who wants to own your time, is the dealbreaker.",
      "sections": [
        {
          "paragraphs": [
            "You commit on your own terms and refuse to apologise for the shape. Maybe that is separate bedrooms, a long-distance arrangement that works, a wedding in a field or no wedding at all. The form matters less to you than whether it is honest.",
            "You value the friendship and the mind in a relationship. You keep your own hobbies, your own circle and your own evenings, and you stay fully committed. People are surprised that you can be that independent and still never think of leaving.",
            "The place you get stuck is feeling. You explain your emotions instead of having them, you retreat into a theory when your partner cries, and you call distance freedom. Letting someone in all the way will not cost you your independence, it will make it feel less lonely."
          ]
        },
        {
          "paragraphs": [
            "You need respect for your strangeness. A partner who compares your life to the neighbours', who wants you to play a traditional role, or who gets embarrassed by what you believe, wears you down.",
            "You also need a shared cause. A relationship that is only about the two of you, with nothing outward in it, goes flat. You are happiest building something with your partner that reaches beyond the front door: a campaign, a community, a project nobody asked for."
          ]
        },
        {
          "paragraphs": [
            "The partner for you is independent, sharp, socially aware and relaxed about unusual setups. They have their own mission and their own people, and they are not looking to be completed by you.",
            "Your ceremonies and arrangements tend to be unconventional, and many of your relationships began as friendships. The marriages hold when each of you keeps your own identity and the two of you keep pointing the same way, toward growth and toward something bigger than the household."
          ]
        }
      ]
    },
    "pisces": {
      "intro": "You are looking for the one you feel you have known before. Ordinary compatibility does not interest you; you want a person who dreams with you, goes quiet with you and loves you without a list of conditions. What you cannot survive is harshness, and a partner who is cold or sarcastic when you're open will find you gone one night without a scene.",
      "sections": [
        {
          "paragraphs": [
            "You treat love as a spiritual event. When you meet the person, you feel it in the body before you can explain it, and you commit with a devotion that surprises even you. Friends say it looks like fate, and to you it feels exactly like that.",
            "You are gentle, intuitive and almost embarrassingly generous. You know their mood from the way they set down their keys, you hold them when they can't say what's wrong, and you make a bed that feels safe to be in. Being loved by you is like floating.",
            "The danger is disappearing. You give until there is nothing left of you, you make excuses for behaviour you would never excuse in a friend, and you read suffering as proof of love. A partner who is hurting you is not a test of your devotion, and you have to learn to leave anyway."
          ]
        },
        {
          "paragraphs": [
            "You need depth. Gossip, logistics and a partner who only discusses schedules starve you. You want someone who will stay up with you talking about dreams, pray or sit in silence with you, and make ordinary evenings feel like something sacred.",
            "You need gentleness. Criticism, sarcasm and a cold shoulder hit you harder than your partner will ever realise. You don't need to be handled like glass, but your openness is the best thing about you, and it should be treated that way."
          ]
        },
        {
          "paragraphs": [
            "The partner for you is empathic, creative, spiritual and soft-spoken. They care more about the inner life than the career, they can share a silence without squirming, and they treat the relationship like holy ground.",
            "Your relationships often feel fated, and you tend to meet through a retreat, a creative circle or some odd coincidence. At their best your marriages become a private world of beauty and feeling that carries both of you through everything the outside keeps throwing at you."
          ]
        }
      ]
    }
  },
  "vesta": {
    "aries": {
      "intro": "You give yourself to what needs someone brave. When nobody else will make the call, start the group or step in front of the problem, you do, and you give up sleep, safety and comfort to see it through. The thing you sacrifice most easily is your own body.",
      "sections": [
        {
          "paragraphs": [
            "Your devotion is active. You don't sit and wish for a better world, you sign up, show up at six in the morning and start. Whatever you've chosen to serve gets your hands, your legs and your temper.",
            "You do it alone, and you prefer it. A committee that debates for a month frustrates you, so you quietly take the job and finish it before the second meeting. The organisation nobody dared to start exists because of someone like you.",
            "What you sacrifice is yourself. You skip meals, run on four hours of sleep, and ignore the injury because the mission cannot wait. Then you crash, blame everybody for not helping and wonder why no one noticed you were running on fumes."
          ]
        },
        {
          "paragraphs": [
            "You find the sacred in courage. You feel closest to something larger when you do the frightening thing, say the unpopular sentence or go in first. Safe, comfortable belief leaves you cold.",
            "Stillness is hard for you, so your practice moves. Running, boxing, dance, hard physical work: that is where the noise stops and you get a clear head. Ten minutes of forced silence feels like a sentence, but after a hard session you can finally hear yourself."
          ]
        },
        {
          "paragraphs": [
            "You serve in the moment of crisis. You are the one who runs the emergency shift, leads the march, drives the truck of supplies after the flood. When something must be done in the next hour, people call you.",
            "You expect others to match your pace, and you have no patience for paperwork, delays or half effort. You become far more useful when you let slower people carry their part in their own way, and you stop treating a different speed as a lack of loyalty."
          ]
        }
      ]
    },
    "taurus": {
      "intro": "You are devoted to what can be touched, grown and kept: the land, the house, the food on the table, the body. You give up speed, novelty and a lot of free evenings to keep those things in good order. People rely on you precisely because you do not drop things.",
      "sections": [
        {
          "paragraphs": [
            "Your devotion looks like upkeep. You plant the garden, mend the thing instead of replacing it, keep the books honest and stock the kitchen. You find the holy in the long, patient work of making a place good to live in.",
            "You do not waver. Once you've picked a practice, a person to care for or a cause, you are there year after year, like a root nobody sees. That steadiness is why people trust you and also why you become hard to move.",
            "What you sacrifice is flexibility. You defend the old method long after it stopped working, you resent the new system that someone else brought in, and you cling to the way it was always done. You lose some good ideas that way, and some good people."
          ]
        },
        {
          "paragraphs": [
            "You find the divine through the body and the earth. A body well fed, rested and looked after is, to you, part of your faith, and so is the soil under your fingernails. You see no conflict between a physical life and a spiritual one.",
            "Your rituals are sensory: bread made from scratch, an hour in the garden, a craft done by hand, a long walk in the woods. You have eaten meals so lovingly made they felt like a sacrament, and you know exactly what that means."
          ]
        },
        {
          "paragraphs": [
            "You serve by providing. You bring the food to the funeral, you organise the fundraiser that is actually beautiful, and you make sure the practical needs are covered before anyone thinks to ask. Nobody makes a speech about it, and everything falls apart if you stop.",
            "You work slowly and you do it right. Sloppy results offend you, so you take the extra hour, finish the seams and wash the pans. How a gift is given matters to you as much as the gift."
          ]
        }
      ]
    },
    "gemini": {
      "intro": "You are devoted to making things understood. You give your evenings to explaining, writing, translating and connecting people who would otherwise never speak. What you pay for it is focus, because you can't stop yourself from saying yes to the next interesting thing.",
      "sections": [
        {
          "paragraphs": [
            "Your devotion runs through words. You are the one who stays after the lecture to answer questions, writes the long reply to the stranger who asked, and turns a tangled subject into a clear page. For you, sharing what you know is how you give back.",
            "You believe confusion causes suffering. If people just had the right information, you think, half of the pain would go away, so you read constantly and pass on everything you find. You are tireless at it and often unpaid.",
            "The cost is scatter. You run five projects, three newsletters and a dozen half-finished threads, and none of the flames gets enough fuel to warm a room. Picking one thing and sticking with it feels like a loss, but it is the only way your work ever gets deep."
          ]
        },
        {
          "paragraphs": [
            "You treat language as a sacred tool. A name changes how a person relates to what they fear, and the right sentence at the right time can change a life. You choose your words carefully when it counts, and you know it.",
            "Your practice is study, writing, teaching and honest conversation. A journal, a blog, a podcast, a long talk with a friend at midnight: when you find the sentence that is true, something in you settles."
          ]
        },
        {
          "paragraphs": [
            "You serve as a teacher, writer, mentor or the person who explains the form to everyone else. You make knowledge easy to reach for people who feel shut out of it.",
            "You adapt fast. You can move from a child to a professor to a frightened patient in one afternoon and find the words each of them can take in. Your talent is making a hard thing simple without making it stupid."
          ]
        }
      ]
    },
    "cancer": {
      "intro": "You are devoted to the people under your roof and the feeling in the room. You will give up your own rest, your ambitions and sometimes your health so that the people you love are fed, calm and safe. The sacrifice is real, and so is the resentment that builds when no one notices.",
      "sections": [
        {
          "paragraphs": [
            "Your devotion lives in the kitchen and the living room. You make the soup, you sit on the edge of the bed, you create a place where a person can fall apart without being judged. The home is your temple, and you tend it like one.",
            "You protect fiercely. If someone you love is threatened, you turn into a different person, and you will cancel your plans, drain your savings and sit up all night without a thought. That total loyalty is the best thing about you, and it is how you get hurt.",
            "Your sacrifice becomes martyrdom when nobody sees it. You give and give, say you are fine, and slowly start counting every favour you did that wasn't returned. Learning to take care, to ask for a meal and to accept help without guilt is the work of your life."
          ]
        },
        {
          "paragraphs": [
            "You treat feelings as the substance of spiritual life, not a distraction from it. Sitting with grief, celebrating a small joy, making someone feel safe enough to cry: all of that is prayer to you.",
            "Your practice runs through family and ancestors. Cooking your grandmother's recipe, keeping the holiday tradition and telling the old stories at the table connect you to something older than you. A family altar, real or imagined, is where you gather yourself."
          ]
        },
        {
          "paragraphs": [
            "You serve face to face. You run the soup kitchen, stay with the grieving, and make a neighbourhood feel like a place somebody belongs. You build belonging where there was isolation.",
            "You don't serve through systems or from a distance. Your presence is what heals: the way you make a stranger feel welcome in thirty seconds is a skill most professionals never learn."
          ]
        }
      ]
    },
    "leo": {
      "intro": "You are devoted to making something and sharing it with joy. You will give up money, security and a normal schedule for the song, the painting or the stage, and you'll do it without apology. What you risk is slowly working for the clapping instead of the work.",
      "sections": [
        {
          "paragraphs": [
            "Your devotion is a calling to create. You do not treat art, performance or playfulness as a hobby; they are your prayer, and you believe a courageous piece of honest work can do more for people than a sermon.",
            "You do it in the open. You stand in the light and tend it with pride. An opening night feels like a ceremony, a finished painting feels like an offering, and a shared laugh in a full room feels like communion.",
            "The shadow is the applause. You start adjusting the work to the response, polishing for the crowd, and when the room is quiet you take it as an insult. The fix is to go back to a day when you made something for nobody and remember how that felt."
          ]
        },
        {
          "paragraphs": [
            "Joy is serious business for you. You know laughter heals, play connects, and that having the nerve to say who you are out loud is a spiritual act. Frivolous is the wrong word for it.",
            "Your practice is making things: painting, singing, dancing, acting, writing, cooking for twelve. You feel closest to the divine in the second when a room and a performer become one thing."
          ]
        },
        {
          "paragraphs": [
            "You serve by lifting people. You teach the art class, direct the community play, entertain the children, and make work that gives a whole room a better evening. People leave you more alive than they arrived.",
            "You give freely, with warmth and energy. Your biggest gift is permission: when you shine without embarrassment, the people watching decide they are allowed to as well."
          ]
        }
      ]
    },
    "virgo": {
      "intro": "You are devoted to doing the work properly, down to the detail nobody will check. You give up your evenings, your ease and any chance of being thanked, because you cannot leave a thing half done. This is the most naturally devoted placement there is, and it costs you the ability to call anything finished.",
      "sections": [
        {
          "paragraphs": [
            "Your devotion is craft. You keep the system running, check the figures twice, label the files and finish the job. To you, the line between work and worship simply is not there.",
            "You don't need a stage. Doing something well, with full attention, is the reward, so you clean the corner nobody looks at and write the instructions that will save a stranger an hour. Sweeping a floor with your whole mind is, for you, an act of prayer.",
            "Your sacrifice is the impossible standard. You redo what was good, you keep revising, you hold yourself to a bar no one set, and you end the day criticising yourself for what you did not do. Good enough is sometimes sacred enough, and you have to learn it the hard way."
          ]
        },
        {
          "paragraphs": [
            "For you, enlightenment is made of ordinary minutes. Chopping vegetables, filing papers, dressing a wound, planning a week: these are your scriptures, and you read them carefully.",
            "You hold your faith through routine. Morning practice, a health regime, a clean table, a work schedule followed almost like a monastery bell. The consistency is the prayer, and you feel off the day you skip it."
          ]
        },
        {
          "paragraphs": [
            "You serve through precise, practical care. You are the herbalist, the editor, the nurse, the planner, the person who designs the process that makes everything else work. Most of what you do is invisible, and everyone depends on it.",
            "You do not do it for credit. You do it because it is who you are, and the people around you rarely understand how much runs on your quiet competence until you're not there."
          ]
        }
      ]
    },
    "libra": {
      "intro": "You are devoted to making things fair, peaceful and good to look at. You give up your own opinion more often than anyone knows, because keeping the room calm feels like your job. The price is a quiet resentment you rarely admit to.",
      "sections": [
        {
          "paragraphs": [
            "Your devotion goes into relationships. You mend a rift between two friends, set the table so people want to linger, and spend an afternoon on a compromise that leaves everyone a little satisfied. Every act of peacemaking is a form of worship for you.",
            "You do it with care and take your time. You don't leap in; you think about the fair way, the elegant way, the way that won't wound anybody. How you do a thing matters to you as much as the thing.",
            "Your sacrifice is the truth. You swallow what you really think, smile through a decision you don't agree with and keep the surface smooth, while discontent piles up underneath. Serving honestly, even when it causes a quarrel, is the thing you need to practise."
          ]
        },
        {
          "paragraphs": [
            "You find the sacred in connection and in beauty. A real meeting between two people is an achievement to you, and a well-made room, a piece of music or a fair judgement counts as proof of something higher.",
            "Your practice is aesthetic and shared. Standing in front of a painting, a ritual done as a couple, a quiet time spent on balance and fairness: these are what steady you and bring you back to yourself."
          ]
        },
        {
          "paragraphs": [
            "You serve as the mediator, the counsellor, the designer, the diplomat or the person who plans the event where everyone feels at ease. You bring grace into a tense situation just by being there.",
            "You work with people, not over them. You are good at finding common ground, making each person feel heard and arriving at a solution that nobody has to lose face to accept."
          ]
        }
      ]
    },
    "scorpio": {
      "intro": "You are devoted to the truth that other people avoid. You give your comfort, your easy friendships and sometimes your peace of mind to go where it hurts and come back with something useful. People bring you the thing they can't tell anyone else, and you take it.",
      "sections": [
        {
          "paragraphs": [
            "Your devotion is to what is real. You will sit through the interrogation, the diagnosis, the confession or the funeral that everyone else escapes. Healing, for you, only starts once somebody has looked at the wound.",
            "You are all in or not at all. When you commit to a cause, a person's recovery or a hard practice, you give it everything and no half version is possible. People feel that and trust you or run.",
            "The shadow is obsession. You chase the truth so hard that you lose perspective, push allies away and burn a bridge you needed. Holding the intensity without letting it eat you is the discipline, and it takes years."
          ]
        },
        {
          "paragraphs": [
            "You believe in death and rebirth as an everyday event. Something in you has to end before something better can begin, and you have been through enough endings to stop being afraid of them.",
            "Your practice turns pain into use. Therapy, deep meditation, shadow work, ritual, anything that makes you meet the part of yourself you'd rather hide. That is where you feel connected to something larger."
          ]
        },
        {
          "paragraphs": [
            "You serve as the therapist, the hospice worker, the investigator, the one who sits with the dying. You work at the border between what people can say and what they can't.",
            "It is not comfortable work, and it is badly needed. You hold grief, trauma, betrayal and fear without flinching, and your steadiness in those moments does more than any advice would."
          ]
        }
      ]
    },
    "sagittarius": {
      "intro": "You are devoted to the search for what it all means. You spend your savings on the ticket, your Saturdays on the book and your certainty on the question, and you would trade a safe life for a bigger understanding of it. What you risk giving away is your humility.",
      "sections": [
        {
          "paragraphs": [
            "Your devotion is the quest itself. Your faith is strongest when you are past the edge of what you know, in a foreign city or a hard text or a conversation that changes your mind. Standing still feels like dying.",
            "You share what you find. You don't hoard wisdom; you talk about it over dinner, write it up, teach it to the first person who is curious. Natural teachers and guides come out of this.",
            "The shadow is the sermon. You get so sure of your version that you turn preachy, wave away other views and treat a doubter as an enemy. Holding the truth with an open hand is the discipline, and the people who love you wait for it."
          ]
        },
        {
          "paragraphs": [
            "You believe the search is meaningful in itself. The journey changes the seeker, and faith, for you, is not the lack of doubt but the nerve to keep looking despite it.",
            "Your practice is a trip: a pilgrimage, a year abroad, a study of traditions that are not your own. The divine shows up for you in the unfamiliar, and each new horizon makes the belief deeper rather than weaker."
          ]
        },
        {
          "paragraphs": [
            "You serve by teaching, publishing, mentoring and carrying ideas across borders. You are the professor, the guide, the person who comes back from another country and changes how a whole room thinks.",
            "You light fires. People walk away from you hungry to learn more, because you make wisdom sound exciting instead of exclusive."
          ]
        }
      ]
    },
    "capricorn": {
      "intro": "You are devoted to building what will outlast you. You give up spontaneity, weekends and your own fun for decades, to keep the institution, the business or the family standing. You do not burn out fast, you burn slow, and the bill comes later.",
      "sections": [
        {
          "paragraphs": [
            "Your devotion is sustained effort. While others sprint and quit, you are still at the same desk in year twelve, doing the unglamorous thing the whole place leans on. You carry responsibility as if it were a calling, because for you it is.",
            "You do not work for a feeling. You work because the job must be done and someone has to be the adult, so you take it, and then you keep taking the next one.",
            "The shadow is work posing as virtue. You become your output, forget how to play, and decide that rest is for people with less to prove. Rest and pleasure are also sacred, and your body will keep making the point until you agree."
          ]
        },
        {
          "paragraphs": [
            "You find the sacred in responsibility and mastery. Taking on a burden is a spiritual act to you, and so is spending ten years getting good at one thing. Building something that outlives your own life is your version of touching eternity.",
            "Your practice is structure: a fixed routine, steady training, patient expertise piled up over the years. You find God in the mountain you are climbing, and you don't need to know whether you will reach the summit."
          ]
        },
        {
          "paragraphs": [
            "You serve by building and maintaining the systems others live inside. You are the administrator, the mentor, the quiet leader behind the scenes who keeps the organisation and the neighbourhood organised.",
            "You can be less warm than the people around you, and less exciting. But your contribution is the foundation, and most institutions would fall over in a year without someone like you."
          ]
        }
      ]
    },
    "aquarius": {
      "intro": "You are devoted to making a better arrangement for everyone, not just the people you love. You give your time and your sleep to a movement, a tool or an idea that might change how people live together. The thing you forfeit is the closeness of the people at your own table.",
      "sections": [
        {
          "paragraphs": [
            "Your devotion is to the collective. You care about the ideas, platforms and movements that could improve life for many people at once, and you will spend a year on one that has no chance of making you rich.",
            "You work through systems more than through personal attention. You build the network, write the code, set up the community space and organise the volunteers. Your sacred fire is as likely to burn in a server room as in a sanctuary.",
            "Your sacrifice is the nearby person. You can be so occupied with humanity that your partner, your friend or your own sister waits three weeks for a reply. Pairing the big picture with plain warmth for the person in front of you is the lesson."
          ]
        },
        {
          "paragraphs": [
            "You believe one person's awakening is incomplete if the community does not move too. Your faith is shared work, a circle, a group effort, and technology used to widen what people can reach.",
            "Your practice is unorthodox. An online meditation group, a new model for gathering, a spiritual experiment that doesn't fit any tradition. You find sacred space in places other people don't think to look."
          ]
        },
        {
          "paragraphs": [
            "You serve through social innovation, technology and community organising. You are the nonprofit founder, the open-source developer, the activist or the social entrepreneur who builds something that outgrows you.",
            "You work alongside people, not above them. You can see how scattered contributions might become real collective power, and you are good at turning a loose crowd into a movement."
          ]
        }
      ]
    },
    "pisces": {
      "intro": "You are devoted to something larger than yourself, and you give to it without keeping count. You hand over your time, your money and your own boundaries to anyone who hurts, and you often do it so quietly that nobody thanks you. What you sacrifice is the line between what is yours and what is theirs.",
      "sections": [
        {
          "paragraphs": [
            "Your devotion is a way of being, not a decision. You feel connected to everything that suffers, so helping is as natural as breathing, and you serve from a sense that the other person is also you.",
            "You give anonymously. You leave the envelope, say the prayer no one hears, stay with the stranger in the waiting room and do not post about it. The act is complete the moment it is done.",
            "The shadow is disappearing. You give until you have nothing, and you sometimes use devotion to dodge the harder work of knowing what you want and saying no. Healthy giving needs someone solid on the giving end, and that is you, if you take the time."
          ]
        },
        {
          "paragraphs": [
            "You look for direct contact with the divine, not doctrine. Meditation, prayer, chanting and quiet that opens the chest are your tools, and a felt moment of oneness counts for more with you than a correct belief.",
            "Your practice is intuitive and often formless. You may follow no tradition and let your own path grow out of what comes up. Few placements end up with a spiritual life so completely personal."
          ]
        },
        {
          "paragraphs": [
            "You serve through compassion, healing and holding the space. You may be the chaplain, the energy worker, the grief counsellor or the artist whose work heals without explaining itself. Sometimes sitting beside someone is the entire service.",
            "You sense what is needed before it is said and answer so gently that defences drop. Your gift is seeing something sacred in the people the world has forgotten or thrown away."
          ]
        }
      ]
    }
  },
  "northNode": {
    "aries": {
      "intro": "You are the one who asks everyone else what they want for dinner and then eats whatever is left. Your life keeps pushing you to choose first, say it plainly and let someone be annoyed about it.",
      "sections": [
        {
          "paragraphs": [
            "You have always been good at the room: who is tense, who needs a yes, who will sulk if the plan changes. That skill got you liked, and it also taught you to treat your own preference as the last item on the agenda. The pull now is to put it first and see what happens.",
            "The first attempts feel rude. You order the restaurant, apply for the job without asking three friends, tell your partner you would rather go alone this weekend. Nothing collapses, and that surprise is the whole lesson.",
            "You are not meant to become a bulldozer. You are meant to arrive at a relationship as a person with an opinion, because people who always agree are pleasant and very hard to actually meet."
          ]
        },
        {
          "paragraphs": [
            "What scares you is the half second after you say what you want and before the other person reacts. You know that gap well, and you have spent years filling it with a joke, a softening phrase or a quick retreat. Staying quiet inside that gap is the exercise.",
            "Life tends to arrange it for you. A relationship ends and nobody is left to consult. A project lands on your desk with no committee. A situation asks for a decision today, and there is no one to hide behind.",
            "Anger is part of this. When something crosses a line, you swallow it until it comes out sideways as exhaustion or sarcasm. Saying it cleanly in the moment, at normal volume, is a new skill and you will do it badly at first."
          ]
        },
        {
          "paragraphs": [
            "You are learning to move before you feel ready. The list of pros and cons still gets written, but you act on the second line instead of the twentieth, and you find that most mistakes are cheap and fixable.",
            "You are also learning that an argument is not a verdict on the relationship. People who love you can be loud at you for ten minutes and still be there at dinner, and the ones who cannot take your no were mostly enjoying your yes."
          ]
        }
      ]
    },
    "taurus": {
      "intro": "You treat a quiet Tuesday as a problem to be solved. Your life keeps nudging you toward a calmer, slower, more owned version of things, and that is the part that feels suspicious.",
      "sections": [
        {
          "paragraphs": [
            "You are used to living at a high pitch: the intense friendship, the crisis you are somehow in the middle of, the relationship where every conversation is about something enormous. It feels like being alive. The pull now is toward a life that is not on fire.",
            "That means building things slowly. A savings account that grows because you leave it alone, a body you feed and sleep properly, a home you stop planning to leave. None of it makes a good story, which is exactly why it is hard for you.",
            "You are not being asked to become boring. You are being asked to find out what you want when nobody is pushing you to feel it, and to learn that contentment is something you can build, not something that happens to people who give up."
          ]
        },
        {
          "paragraphs": [
            "The flat stretch after a crisis ends is what frightens you. You catch yourself starting an argument, checking someone's phone, or deciding the job is secretly terrible, just to bring the volume back up. Sitting through the quiet without sabotaging it is the work.",
            "Your supply of drama keeps getting cut. The friend who fed on it moves away, the relationship that only worked at full intensity runs out of fuel, money gets tight in a way that only patience can fix. It feels like loss before it feels like relief.",
            "Money and possessions are part of it. You are used to leaning on other people's resources or emotional energy. Earning your own steady income and learning what you like to spend it on is slower than borrowing, and a lot more yours."
          ]
        },
        {
          "paragraphs": [
            "You are learning to enjoy something without analysing it. A meal, a walk, an afternoon with nothing in it. You look for the hidden angle out of habit and slowly discover that sometimes there is only the thing itself.",
            "You are also learning to do one thing for a long time. Finishing the garden, the degree or the savings goal teaches you that you are more capable than your intensity ever proved."
          ]
        }
      ]
    },
    "gemini": {
      "intro": "You walk into a conversation already knowing the point you want to make. Your life keeps asking you to walk in with a question instead, and to actually wait for the answer.",
      "sections": [
        {
          "paragraphs": [
            "You have always been the one with the take. Someone mentions a problem and you hand over a conclusion, a quote or a rule for living, usually kindly and usually too fast. The pull now is to find out what the other person actually knows before you decide what they need to hear.",
            "That means being a beginner in public. You ask the dull question, read the whole thread instead of the headline, learn from someone ten years younger who knows more than you about the thing in front of you.",
            "You are not losing your depth. You are trading the big claim for a hundred small true observations, and finding that people trust you more when you can say, I don't know yet, tell me."
          ]
        },
        {
          "paragraphs": [
            "What stings is being wrong where people can see. You have built an identity on seeing further than the room, so a correction can feel like a demotion. You answer fast partly so nobody has time to notice the gap.",
            "Life sets it up. You meet someone whose view you cannot file under anything you already believe, you take a class where you are the slowest person, or a sibling or neighbour turns out to understand something you waved away for years.",
            "The practical test is the pause. You are mid-sentence, you feel the lecture coming, and you ask one more question instead. It feels like standing still, and it is the thing that changes how people talk to you."
          ]
        },
        {
          "paragraphs": [
            "You are learning to be curious about the street you live on, the person at the next desk, the argument your cousin keeps making. The faraway big idea was easier to love than a neighbour you actually have to talk to.",
            "You are also learning that small talk is how most trust gets built. The weather chat and the how was your weekend are not wasted time, and you stop rushing past them to get to the point."
          ]
        }
      ]
    },
    "cancer": {
      "intro": "You can run a meeting, a budget and a crisis, and you cannot tell anyone you had a bad day. Your life keeps moving you toward the people and rooms where that is the main thing you do.",
      "sections": [
        {
          "paragraphs": [
            "You have always been the capable one. Others lean on your calm and you have learned to keep your own wobbles private, because needing something feels like failing a test. The pull now is toward being the person who says, I'm not okay, can you sit with me.",
            "That means putting people ahead of the project for once. You leave the office on time for a dinner, you call your mother back the same day, you say yes to the baby shower instead of the extra hour of work.",
            "You are not meant to drop your drive. You are meant to find out that being held by someone is not a step down from being respected, and that a house where people feel safe is a serious piece of work."
          ]
        },
        {
          "paragraphs": [
            "What frightens you is the moment you stop managing and start feeling. You hold it together at the funeral and fall apart at the car wash two weeks later. Letting it show in the room, in front of someone, is the unfamiliar part.",
            "Life tends to take the armour off for you. A new baby in the family, a parent who needs care, an injury that leaves you relying on others for a month. You hate it at first and later realise those were the weeks you felt closest to anyone.",
            "Home is part of this too. You are asked to make a place and a family, chosen or born, that you actually return to, instead of a CV that happens to have an address attached."
          ]
        },
        {
          "paragraphs": [
            "You are learning to measure a year by who you were kind to and who showed up for you, not just by what got shipped. The new scoreboard is quieter and harder to cheat.",
            "You are also learning to look after yourself the way you look after others: a proper meal, a real day off, a no that does not need a reason. It feels indulgent until you notice you are less irritable."
          ]
        }
      ]
    },
    "leo": {
      "intro": "You will happily write the speech, build the slide and make the other person look brilliant. Your life keeps asking you to be the one who stands up and says it.",
      "sections": [
        {
          "paragraphs": [
            "You have always been good in the middle of a group: the fair one, the clever one, the one with no ego about it. A lot of that was hiding. The pull now is toward doing something with your name on it and standing next to it while people look.",
            "That could be a song, a business, a love declaration, a costume, a role at work where you are the face and not the helper. Being visible for something you made yourself is the point.",
            "You are not becoming a diva. You are finding out that having a heart and showing it on purpose is not showing off, and that the people around you have been waiting to see what you do when you stop blending in."
          ]
        },
        {
          "paragraphs": [
            "What scares you is the clap that comes after. Praise makes you deflect, change the subject or credit the team before anyone finishes the sentence. Standing there and saying thank you, I worked hard on that, is harder than the work was.",
            "A stage turns up that you did not ask for. A promotion that makes you the lead, a creative project that cannot be delegated, a crush that requires you to say so first. Hiding behind we stops working.",
            "Play is part of it. You tend to approve of fun once the cause is good enough. Doing something just because it delights you, and letting others watch, is the actual assignment."
          ]
        },
        {
          "paragraphs": [
            "You are learning that your taste, your jokes and your way of doing things are not a flaw in the team plan. They are the reason someone picked you, and diluting them to fit in costs everyone.",
            "You are also learning to receive. A compliment, a gift, an invitation to go first. You practise taking it in without handing something back straight away, and notice how rarely the world falls apart when you do."
          ]
        }
      ]
    },
    "virgo": {
      "intro": "You can feel the whole mood of a situation and still not know where the invoice is. Your life keeps pulling you toward the plain, daily work of making things actually function.",
      "sections": [
        {
          "paragraphs": [
            "You have always been good at sensing what is going on and floating along with it. Plans stay vague, appointments get missed, big feelings substitute for a schedule. The pull now is toward being the person who shows up Tuesday at nine with the thing done.",
            "That means picking a craft and getting competent at it. A trade, a health routine, a filing system, a skill that people can check. The glow of good intentions starts to turn into something others can lean on.",
            "You are not giving up your sensitivity. You are giving it hands. Your helpfulness becomes real when it comes with a calendar, a budget and a version of the favour that actually gets finished."
          ]
        },
        {
          "paragraphs": [
            "Being measured is what frightens you. Vague potential is safe, because nobody can say you failed at it. Handing over a finished report, a plan or a recipe that can be judged is exposing in a way daydreaming never was.",
            "Life tends to demand detail. A job that needs accuracy, a body that insists on sleep and decent food, a relationship where the other person needs you to do the dishes, not just understand their feelings.",
            "Boundaries are part of it. You are used to saying yes to every sad story and then disappearing. Learning to help in specific, limited ways, and to say what you can and cannot do this week, feels cold and works much better."
          ]
        },
        {
          "paragraphs": [
            "You are learning to turn up on the boring days. The list, the gym, the follow-up email. You notice a quiet pride that did not exist when everything was left to mood.",
            "You are also learning to criticise usefully: this part works, this part does not, here is the fix. Sharp feedback used to feel unkind to you, and you are finding it is one of the more caring things you can offer."
          ]
        }
      ]
    },
    "libra": {
      "intro": "You made the decision, booked the thing and told them afterwards. Your life keeps pointing you at the harder skill: deciding with another person, out loud, and meaning it.",
      "sections": [
        {
          "paragraphs": [
            "You have always done fine alone. You move fast, you need nobody's sign-off, and you treat asking for help as a small defeat. The pull now is toward one other person whose opinion actually changes what you do.",
            "That means learning to ask, wait and adjust. You check in before you book the holiday, you let a partner pick the paint colour, you stay in the conversation after the first disagreement instead of walking out of it.",
            "You are not being asked to shrink. You are finding out that two people who both say what they want and both give a bit make something neither could build alone, and that you are good at it once you stop treating it as losing."
          ]
        },
        {
          "paragraphs": [
            "What scares you is depending on someone and being let down. Doing it yourself is safe because the only person who can fail you is you. Leaving a thing half decided so the other person can weigh in feels like handing over a weapon.",
            "You keep landing in two-person situations. A relationship that will not work on your terms alone, a business partner, a friend who says, I need you to listen, not fix. Your usual solo move gets a polite no.",
            "Fairness is the real test. You are used to winning arguments by volume or speed. Learning to lose a point gracefully, and to ask what the other person needs before you answer, is slower and strangely satisfying."
          ]
        },
        {
          "paragraphs": [
            "You are learning to hear the second sentence. Someone says fine and you used to hear fine. Now you notice the tone and ask, and the conversation gets longer and a lot better.",
            "You are also learning that tact is not lying. You can be honest and still choose the moment, the wording and the kindness, and your honesty lands better for it."
          ]
        }
      ]
    },
    "scorpio": {
      "intro": "You are very good at keeping your life comfortable and your feelings tidy. Your life keeps pulling you into rooms and relationships where neither is possible.",
      "sections": [
        {
          "paragraphs": [
            "You have always known how to make things steady: a job that pays, a body that behaves, a routine that holds. The pull now is toward the thing underneath, the conversation you have avoided for years, the person you could actually lose.",
            "That means closeness with a cost. You tell someone the real reason you were upset, share an account, let a partner see you panic. It is not comfortable and it is the point.",
            "You are not meant to burn down what you built. You are meant to find out that what you hold onto tightest is often what is keeping you small, and that a few endings are the only way to get to the next version of your life."
          ]
        },
        {
          "paragraphs": [
            "What frightens you is not being in charge of the outcome. You like to have the savings, the exit and the plan in your pocket before any feeling is allowed in. Handing someone your trust with no guarantee is the exact thing you avoid.",
            "Life tends to take things away so you can see what is left. A job goes, a relationship ends, a loss arrives that you did not plan for, money gets complicated with another person. You grieve properly and come out knowing more about yourself than any comfortable year taught you.",
            "Your own dark moods are part of it. Jealousy, rage, wanting too much. You are used to sanding them off. Admitting them, to yourself first, and watching them lose their grip is the actual work."
          ]
        },
        {
          "paragraphs": [
            "You are learning to stay in the intense conversation instead of changing the subject to something pleasant. The first minutes are miserable, and afterwards you feel lighter than you have in months.",
            "You are also learning that what you share with someone, whether money, a bed or a secret, binds you in a good way. Self-sufficiency was a safety rule, and you are slowly finding out it was also a loneliness."
          ]
        }
      ]
    },
    "sagittarius": {
      "intro": "You can name the three best sources on any topic and still not say what you think. Your life keeps pulling you to pick a side and go live on it.",
      "sections": [
        {
          "paragraphs": [
            "You have always had the facts. You can argue both sides, quote the study, keep ten tabs open and never be caught out. The pull now is toward a conclusion you will defend, even if it turns out partly wrong.",
            "That means a belief you act on. You move abroad, you commit to a path of study, you say, this is what I think matters, and arrange your week around it. The leap comes before the proof.",
            "You are not meant to stop being curious. You are meant to stop using curiosity as a way of never arriving, and to find out what a life feels like when it points somewhere."
          ]
        },
        {
          "paragraphs": [
            "What scares you is being pinned down. Keeping every option alive felt like freedom, and it has been a quiet way of never risking a real no. Saying, this is my view, and hearing someone disagree, is a new kind of exposed.",
            "You get sent far from your usual circle. A trip with no itinerary, a teacher or friend from a completely different culture, a course that requires you to stretch your theories to fit somebody else's world.",
            "Trust is part of it. You are used to checking everything twice. Taking a step on a hunch, without the second source, is the practice. Some of the time you will be wrong and the ground will still be there."
          ]
        },
        {
          "paragraphs": [
            "You are learning to say what the pile of facts adds up to. The summary is the hard bit, because it can be disagreed with, and it is the bit people actually want from you.",
            "You are also learning that a belief, even a flawed one, gives a life shape. Staying open to everything leaves you well informed and oddly absent, and a few firm convictions are what let people find you."
          ]
        }
      ]
    },
    "capricorn": {
      "intro": "You are the person everyone wants on their side when things are hard, and you have been waiting for someone to give you permission to be in charge. Nobody will, so your life keeps handing you the job anyway.",
      "sections": [
        {
          "paragraphs": [
            "You have always been the soft centre of a group: the one who looks after the mood, remembers birthdays, stays home when it is safer. The pull now is toward the outside world, where you are accountable for something that matters and people rely on your judgment.",
            "That means taking on titles, deadlines and decisions with your name attached. You apply for the harder role, you tell the team the plan, you stay with a long project that does not give you a hug at the end of each day.",
            "You are not meant to turn hard. You are meant to find out that being the adult in the room can sit alongside warmth, and that people feel safer with someone who can both feel and decide."
          ]
        },
        {
          "paragraphs": [
            "The cold is what frightens you. Ambition feels like leaving home, and you worry you will lose the people who loved you for being easy and available. You also fear failing publicly, because nobody has ever seen you in that position.",
            "Something pushes you out of the nest. A family move, a parent who can no longer be leaned on, a job offer that is bigger than you feel. The old comfort zone shrinks and the next step is up.",
            "Discipline is the other half. You are used to acting on how you feel. Doing the thing at the scheduled time, every week, whether or not the mood is right, is a skill you do not have yet and will be proud of."
          ]
        },
        {
          "paragraphs": [
            "You are learning to measure yourself by what you built, not by how well liked you were that week. The satisfaction is slower and it lasts.",
            "You are also learning that some things are worth doing because they are hard. You put up with discomfort in the middle of a long project, and discover you have more stamina than your history suggests."
          ]
        }
      ]
    },
    "aquarius": {
      "intro": "You are the best at being noticed, and the harder question is what you do once the lights go off. Your life keeps pulling you toward a group, a cause and friends who like you without you performing.",
      "sections": [
        {
          "paragraphs": [
            "You have always known how to light up a room, and some of that is a job you have never been able to quit. The pull now is toward being one of many: the person in the team, the volunteer, the friend in a big, messy group chat.",
            "That means using your gifts for something that is not about you. You put your creative energy into a community project, back someone else's idea at full strength, and give credit before anyone asks.",
            "You are not losing your spark. You are finding that it burns longer when it lights something other than your own reputation, and that belonging is a different feeling from applause."
          ]
        },
        {
          "paragraphs": [
            "What scares you is going unnoticed. When you contribute and nobody claps, you feel the old drop in your stomach. Doing the unseen work, and being fine about it, is the exercise.",
            "You get enrolled in groups. A team where you are not the lead, a cause that matters more than your mood, friends who have strong opinions that do not centre you. You find out who you are when you are not the star.",
            "Your own ideas are part of it. You are used to staying with what is tried and flattering. Offering something odd, early and unfinished, and letting the group pull it apart, is the risk."
          ]
        },
        {
          "paragraphs": [
            "You are learning to ask what the group needs before offering what you have. It is a small switch that changes your whole role in the room, and people begin to trust you in a different way.",
            "You are also learning that friendship is not a lesser thing than romance or fame. The friends who will show up for a boring Thursday are the quiet proof that you are doing this right."
          ]
        }
      ]
    },
    "pisces": {
      "intro": "You have a plan, a backup plan and an answer for everything, and you are very tired. Your life keeps pulling you toward the things you cannot organise: faith, mood, tenderness, a day that goes wrong and is still fine.",
      "sections": [
        {
          "paragraphs": [
            "You have always fixed things. You see what is off in a plan or a person and mention it, usually helpfully, often at the wrong time. The pull now is toward letting something be unfinished, and trusting that it is still okay.",
            "That means making room for the unmeasurable. A daily quiet hour, music with no purpose, prayer or meditation or just staring at water. Time that cannot be tracked, scored or improved.",
            "You are not meant to stop caring about quality. You are meant to find out that you do not have to earn your place by being useful, and that being present with someone can be the whole contribution."
          ]
        },
        {
          "paragraphs": [
            "What frightens you is not knowing. You want to understand why a friend is upset, what the diagnosis means, how the year will go, and you grip the question tighter as the answer slips. Staying with the mystery feels like negligence.",
            "Situations turn up that no checklist covers. A grief, a sudden intuition that proves right, a creative idea that arrives when you stop pushing. You are asked to follow it before it makes sense.",
            "Perfectionism is part of it. The inner editor marks every conversation after it ends. Letting a sentence stay clumsy, and a friend see you confused, is the new move."
          ]
        },
        {
          "paragraphs": [
            "You are learning to answer with kindness before critique. When someone brings you a problem, you listen all the way to the end and do not fix it, and they tell you later it was the best conversation they had that month.",
            "You are also learning to trust your gut a little earlier. You still check the facts, but you notice you were right more often than your spreadsheet suggested, and you act on that feeling sooner."
          ]
        }
      ]
    }
  },
  "southNode": {
    "aries": {
      "intro": "You decide before the question is finished. It is your best trick and it is also why you are so often doing everything by yourself.",
      "sections": [
        {
          "paragraphs": [
            "You act first. A problem shows up and your hands are already moving, while other people are still asking who is in charge. You do not need a pep talk, a plan or backup, and people have been grateful for that since you were small.",
            "Your body treats risk as normal. The rush of a deadline, an argument, a dare, a bad situation that needs someone to step in. You stay clear when others freeze, and you rarely notice how rare that is.",
            "You also start things nobody else would. The business, the move, the confrontation everyone had been circling for months. Starting is easy for you in a way that surprises you whenever you watch someone else struggle with it."
          ]
        },
        {
          "paragraphs": [
            "Under stress you go solo. You stop answering messages, take the decision yourself and announce it afterwards, then wonder why the people close to you feel shut out. It feels efficient and it is a rut.",
            "You are at home in a fight, a race or an emergency. A situation that requires patience, consensus or three rounds of feedback makes you restless, and you will quietly sabotage it to get things moving again.",
            "Anger is your default feeling. Hurt, fear and loneliness all come out as irritation, because irritation lets you do something and the others leave you sitting there. People near you often only meet the angry version."
          ]
        },
        {
          "paragraphs": [
            "You are letting go of doing it all yourself. The reflex to take over, win and prove you needed nobody is still strong, and you are slowly noticing what it costs: help you never asked for, and people who stopped offering.",
            "You are also letting go of conflict as a way to feel awake. Peace seems dull and vulnerability seems risky, so you pick a fight over a small thing. The alternative is to say, I'm hurt, and survive the silence that follows."
          ]
        }
      ]
    },
    "taurus": {
      "intro": "You are the one who has the spare key, the savings and the good pan. It is why people trust you and also why change feels like a physical threat.",
      "sections": [
        {
          "paragraphs": [
            "You build comfort. A home that feels good to walk into, a pantry that is never empty, a bank balance that grows slowly and without drama. You know how to make a life solid, and you do it without effort.",
            "You are good with your hands and your senses. You can cook, grow, mend, price things and tell cheap from well made on touch. Friends ask you where to buy, what to buy and how to make it last.",
            "You are steady. When everyone else is panicking you stay put, follow through on what you said and turn up when you said you would. People rely on that more than they tell you."
          ]
        },
        {
          "paragraphs": [
            "When things get hard you retreat into the familiar. The same meal, the same chair, another online order, extra sleep. Comfort works in the moment and then becomes the reason nothing moves.",
            "You like things predictable. A change of plan, a surprise, someone else's feelings landing on you uninvited, all feel like an intrusion. You can dig in so hard that you miss the good thing arriving through the door you refused to open.",
            "You do things on your own resources. You pay for it yourself, fix it yourself and do not like sharing an account or owing a favour. It looks like independence and it often hides a fear of depending on anyone."
          ]
        },
        {
          "paragraphs": [
            "You are letting go of the idea that security is what you own. Your tight grip on money, routines and possessions is starting to show as the thing that keeps you stuck, because what you hold that tightly cannot grow.",
            "You are also letting go of staying too long. The job, the flat, the friendship or the partner that expired two years ago. You know it is over and still wait, because leaving feels like a small death, and then you discover the space afterwards is where the good stuff arrives."
          ]
        }
      ]
    },
    "gemini": {
      "intro": "You know a little about everything and can talk to anyone. The trouble is that you can talk your way around every decision, including the ones that matter.",
      "sections": [
        {
          "paragraphs": [
            "You learn fast. A new software, language or subject sits in your head after one afternoon, and you can explain it back in simpler words than the person who taught you. School was easy in some ways and boring in others.",
            "Words come easily. You were probably the early reader, the kid with the quick comeback, the one who wrote the card everyone kept. Texts, emails and speeches come out of you in a single pass.",
            "You connect people. You know someone who knows someone, you can translate between your angry friend and your confused one, and you make strangers feel heard in about four minutes. It is a quiet superpower you use without noticing."
          ]
        },
        {
          "paragraphs": [
            "When pressure hits, you research. You read five articles, ask three friends, make a list of pros and cons and still have not decided. Gathering information feels like progress while it mostly delays the moment you have to choose.",
            "You keep options open. On the other hand is your favourite phrase, because as long as there is another side to consider you do not have to commit. Plans stay tentative, promises stay vague, and people sometimes feel they never got a straight answer.",
            "You are wide and not deep. A hundred tabs, ten half-learned hobbies, a conversation that touches everything and settles on nothing. Going deep on one subject would mean being stuck with it, and that is the part that you avoid."
          ]
        },
        {
          "paragraphs": [
            "You are letting go of the idea that more information will finally make the answer obvious. It will not. At some point you have to pick, and you are learning that a decent decision made today beats a perfect one never made.",
            "You are also letting go of using chatter as armour. When something painful is near, you narrate it, joke about it or analyse it, and the feeling never quite arrives. Staying quiet and letting it hurt for a minute is your next exercise."
          ]
        }
      ]
    },
    "cancer": {
      "intro": "You can tell a person is struggling before they do, and you have been quietly caring for the room your whole life. Somewhere along the way you started hiding in it.",
      "sections": [
        {
          "paragraphs": [
            "You feel what others feel. You walk into a house and know whether there was an argument, you spot the friend who is faking fine, you say the right small thing without thinking. No one taught you this.",
            "You comfort people. Soup, a blanket, a text at the right hour, a hug that lasts a bit longer. People tell you things they have never told anyone, because you make it feel safe to say them.",
            "You make places feel like home. A rented flat, a break room, a group chat. You remember the favourite mug, the allergy, the anniversary, and people stay in your orbit because of it."
          ]
        },
        {
          "paragraphs": [
            "Under stress you go home. Literally, or into your shell: cancelled plans, sofa, a call to your mum, old habits of getting looked after. It works in the short term and keeps you where you started.",
            "You like being the caretaker. Everyone else's feelings come first, which feels generous and safe because you know the role so well. It also means you are rarely the one asked what you want, or the one who steps up in public.",
            "Your sensitivity can be a reason not to try. A hard conversation at work, a risky pitch, an authority role. You call it protecting yourself, when sometimes it is just a polite word for avoiding."
          ]
        },
        {
          "paragraphs": [
            "You are letting go of the idea that feeling safe is the most important thing in a day. It matters, and it cannot be the only measure. Some of what you want lives outside the comfort of your own circle.",
            "You are also letting go of being defined by who you look after. You are somebody's parent, partner or best friend, and you are also a person with a job to do in the world. Claiming that second part is the move."
          ]
        }
      ]
    },
    "leo": {
      "intro": "You light up a room without trying. The question is whether anyone has seen you when you were not performing.",
      "sections": [
        {
          "paragraphs": [
            "You are warm and a little bit magnetic. People turn toward you in a group, laugh at your jokes before the end, and feel better for being noticed by you. That was true when you were seven.",
            "You make things. A show, a party, a look, a team that you name and run. The creative confidence comes from a place that has never needed a course.",
            "You are generous. You remember what makes each person feel special and hand it over, and your friends feel taller after time with you. People follow that."
          ]
        },
        {
          "paragraphs": [
            "Pressure sends you looking for an audience. A text for reassurance, a post, a dramatic entrance, a big gesture. Being the main character is where you feel safe, and being one of the crowd feels like fading.",
            "You like to be admired. When someone else takes the spotlight, even briefly, something tight goes through you. You steer the conversation back, finish the story for them or take over the project before you have noticed.",
            "You use drama as a way to stay relevant. Not cruelly, but a row, a sulk or a grand apology keeps everyone looking at you. Quiet, ordinary contribution feels like disappearing."
          ]
        },
        {
          "paragraphs": [
            "You are letting go of the belief that you are only worth something when you stand out. Being special has been your shortcut to being loved, and it is wearing thin as the only door in.",
            "You are also letting go of needing the credit. The next stage is making things that help other people shine and finding you are still there afterwards. It feels like less, then it feels like more."
          ]
        }
      ]
    },
    "virgo": {
      "intro": "You notice the crooked picture frame, the missing comma and the friend who is not eating. It is a gift, and it gets heavy when you cannot switch it off.",
      "sections": [
        {
          "paragraphs": [
            "You notice detail. The error in the contract, the number that does not add up, the thing on the shelf that is slightly out of place. You see it before anyone has finished talking.",
            "You make systems better. A messy spreadsheet, a clunky morning routine, a team that wastes time. You tidy, simplify and improve without being asked, and the whole place runs smoother after you leave.",
            "You pay attention to bodies. You notice when someone is run down and what usually helps them: a meal, a stretch, an early night. People ask you about their back, their sleep, their stomach."
          ]
        },
        {
          "paragraphs": [
            "Under stress you fix. You clean the kitchen at midnight, reorganise the drawer, write another list, correct someone's grammar. It calms you and avoids whatever you were really upset about.",
            "You like to be in control. Everything in its place, every step planned. A situation with no clear answer, an emotional mess that cannot be reorganised, leaves you tense in a way you rarely admit.",
            "You are hard on yourself. The inner voice marks every day, expects a better version of you by Friday and treats rest as laziness. It got you competent and it also keeps you from ever feeling good enough."
          ]
        },
        {
          "paragraphs": [
            "You are letting go of being perfect and being useful as the reasons you deserve to be here. Neither makes you worth more, and both wear you out.",
            "You are also letting go of busy as a hiding place. If every minute has a task, there is no room for the odd, unplanned, unmeasurable parts of life. Sitting still without fixing anything is the practice, and it is harder than any project you have done."
          ]
        }
      ]
    },
    "libra": {
      "intro": "You are the one who knows what everyone at the table wants and what you will say to keep it pleasant. What you want yourself is somewhere further down.",
      "sections": [
        {
          "paragraphs": [
            "You are good with people. You walk into a tense room and it relaxes, you find the compromise that works for both, you say it so nobody loses face. Others call you easy to be around.",
            "You read social situations at speed. Who is annoyed, who is flirting, who needs to be invited into the conversation. You smooth it before anyone sees there was a problem.",
            "You have taste. Good colours, a balanced room, the right word, a relationship that looks graceful from outside. You bring beauty into whatever you touch."
          ]
        },
        {
          "paragraphs": [
            "When it gets tense, you please. You say what people want to hear, hold back your opinion and agree to the plan you dislike. The evening goes well, and you go home a little smaller.",
            "You are most comfortable in a pair. Being single can feel like standing on the edge of something, so you move from one relationship to the next or stay in the wrong one because the alternative is too quiet.",
            "You see every side. It makes you fair and it also makes you slow. Asked what you want for dinner, you say anything, and the habit has spread to bigger questions, so other people end up deciding for you."
          ]
        },
        {
          "paragraphs": [
            "You are letting go of the idea that being liked is the point. Being agreeable has kept you safe for years, and you are discovering that safe and known are different things.",
            "You are also letting go of defining yourself through other people's reactions. The person whose opinion matters most turns out to be you, and the talk with them needs plain honesty, not diplomacy."
          ]
        }
      ]
    },
    "scorpio": {
      "intro": "You know what people are hiding before they say a word. You also know what it is like when the room goes quiet and you are the one holding the secret.",
      "sections": [
        {
          "paragraphs": [
            "You read people. A shift in tone, a pause too long, an answer that does not match the face. You sense when someone is lying, often before they admit it to themselves.",
            "You handle the dark topics. Death, money, sex, betrayal, a family secret. Others change the subject, and you ask the real question and stay for the answer.",
            "You get through crises. When something breaks, the job, a relationship, a diagnosis, you are steady in a way that surprises people, and you come out changed. Rebuilding is something you have done more than once."
          ]
        },
        {
          "paragraphs": [
            "Under stress you turn up the intensity. A confrontation, a test, a power play, a fixation on one person. Peace feels suspicious, and you wait for the other shoe even on a good week.",
            "You like control. You prefer to know the details, hold the leverage and choose who sees what. Trusting someone fully feels like handing them a knife, because at some point you did.",
            "You mix drama and closeness. A big fight feels like proof someone cares, a long silence like proof they do not. Calm love, with no crisis in it, can look like indifference to you."
          ]
        },
        {
          "paragraphs": [
            "You are letting go of needing intensity to feel alive. The big emotional swings built you, and the person on the other side of them is someone who lives a quieter life and likes it.",
            "You are also letting go of control as protection. Knowing everyone's secrets does not make you safe. Building a steady life, with money in the bank and a regular routine, is the thing that actually does, and you are learning to relax into it."
          ]
        }
      ]
    },
    "sagittarius": {
      "intro": "You are the person with the big take, the next trip and the line that gets repeated at parties. People rarely hear you say that you are not sure.",
      "sections": [
        {
          "paragraphs": [
            "You see the pattern. A string of random events becomes a story with a meaning in your head, and friends come to you when their lives feel pointless. You tend to have a reason ready.",
            "You teach without trying. An idea in your mouth sounds exciting, people leave a conversation with you wanting to try something. You explain, encourage and make the possible feel close.",
            "You are optimistic. You assume it will work out, and a surprising amount of the time it does. That confidence comes from having landed on your feet before."
          ]
        },
        {
          "paragraphs": [
            "When life gets tight you go big. A philosophy, a move abroad, a new plan for the year. Anything to avoid the dull detail of what is in front of you today, the form, the bill, the awkward email.",
            "You like being the one who knows. Giving advice feels natural and asking for it feels like a step down. You have an answer ready, and the other person did not always want one.",
            "You use positivity to skip problems. Look on the bright side comes out so fast that a real worry never gets a hearing. A friend says it hurts, you say it will be fine, and they feel more alone."
          ]
        },
        {
          "paragraphs": [
            "You are letting go of needing the answer. Not having one is not failure, and the people who ask a good question usually learn more than those with a speech.",
            "You are also letting go of the big picture as an escape. The small, unglamorous facts you have been stepping over are where most of the real information is, and wisdom with no daily application is a nice conversation."
          ]
        }
      ]
    },
    "capricorn": {
      "intro": "You are the one who gets things done and has not cried in front of anyone in years. People respect you, and fewer know what you are like on a bad night.",
      "sections": [
        {
          "paragraphs": [
            "You work. Long hours, hard projects, a goal that takes five years. You stick with it long after others get bored, and you tend to finish what you start.",
            "You understand structure. Who reports to whom, what a deadline means, how an organisation works. You can get into a messy team and make it function.",
            "You carry authority without asking for it. People lower their voices, look to you when the plan falls apart and take your word as final. It is steadying for them, and heavy for you."
          ]
        },
        {
          "paragraphs": [
            "Pressure only makes you work more. The inbox, the project, the spreadsheet. Anything with a clear task and a result is easier than a feeling, and you disappear into it for weeks.",
            "You prefer control and clear rules. A boss, a plan, a role. A conversation with no agenda about how everyone is feeling leaves you quietly looking for the exit.",
            "You stay busy so nothing catches up with you. Your calendar is full and your needs are not on it. The tiredness, loneliness and wish to be looked after wait patiently in the background."
          ]
        },
        {
          "paragraphs": [
            "You are letting go of being what you achieve. The title and the results are real, and they are not who you are when the phone goes quiet.",
            "You are also letting go of treating feelings as inefficiency. They are information about what you need, and it is worth hearing them before the body raises the volume. Leaving the office on time and going home to someone is part of the job."
          ]
        }
      ]
    },
    "aquarius": {
      "intro": "You are the sane one in the group, the one with the unusual angle and the cool head. You are also the one nobody knows very well.",
      "sections": [
        {
          "paragraphs": [
            "You understand groups. How a community works, why a project stalls, what happens when one person gets all the say. People ask you to sort out the group chat and the committee.",
            "You think differently. You see the fix nobody has tried, learn a new tool in an evening and spot where a system is about to break. Others call it unusual and then use your idea.",
            "You treat people as equals. The CEO and the cleaner get the same tone. Friends feel respected around you in a way that is hard to fake."
          ]
        },
        {
          "paragraphs": [
            "Under stress you go to the group. A cause, a forum, a project with ten people on it. Something bigger than your own feelings, so nobody asks what you are up to personally.",
            "You are comfortable as one of many. A solo spot, a romantic gaze, a moment where you have to say what makes you different feels like standing in the wrong place.",
            "You step back from feelings. You observe them, explain them, even find them interesting, and the real one stays in the other room. People feel they are talking to a very thoughtful stranger."
          ]
        },
        {
          "paragraphs": [
            "You are letting go of hiding in the collective. Blending in has been safe, and it has also left the best of you unseen.",
            "You are also letting go of the idea that your own voice is selfish. The group is better when each person shows up in colour, and you are one of the people who has to start."
          ]
        }
      ]
    },
    "pisces": {
      "intro": "You feel the whole room, and then you cannot find your keys. The sensitivity is real, and it has been quietly running your life.",
      "sections": [
        {
          "paragraphs": [
            "You sense things. A mood in a building, a friend's trouble before they say it, a dream that turns out to be right. You trust it without needing to explain.",
            "You imagine. Music, stories, images, whole rooms in your head. When you let it out, people are moved and cannot say why.",
            "You care about everyone. A stray animal, a stranger in tears, a news story at midnight. You take it in physically and your gentleness helps people more than they let on."
          ]
        },
        {
          "paragraphs": [
            "When it gets too much you disappear. Sleep, scrolling, wine, daydreams, a long spiritual retreat in your own head. The world feels too sharp, and fading is an easy option.",
            "You like things loose. No timetable, no inbox, no routine. Deadlines and admin feel like an insult to your soul, so bills pile up and appointments get missed.",
            "You say yes to everyone's pain. You lend money, take people in and listen at three in the morning, and call it love. Saying no feels unkind, even when you are running on empty."
          ]
        },
        {
          "paragraphs": [
            "You are letting go of escape as a plan. Floating above the daily grind has been a relief, and the body, the diary and the money are where your gifts actually get to do some good.",
            "You are also letting go of absorbing everything. A boundary does not make you cold. It makes your care something that lasts through a bad week, and it lets you show up as help instead of another person who is drowning."
          ]
        }
      ]
    }
  }
};

/** Swap in the reader's-voice text when it matches the page's section layout;
 *  otherwise leave the original content untouched. */
export function applyPlanetVoice<T extends { intro: string; sections: { paragraphs: string[] }[] }>(
  planet: PlanetVoiceKey,
  sign: string,
  content: T,
): T {
  const v = PLANET_SIGN_VOICE[planet]?.[sign];
  if (!v || v.sections.length !== content.sections.length) return content;
  return {
    ...content,
    intro: v.intro,
    sections: content.sections.map((s, i) => ({ ...s, paragraphs: v.sections[i].paragraphs })),
  };
}
