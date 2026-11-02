/* Synastry aspect page copy in the reader's voice: you two, real scenes, no
   definitions of the planets or the aspect. Layered over synastryContent.ts. */

export interface SynastryVoice {
  intro: string;
  sections: { heading: string; body: string }[];
}

export const SYNASTRY_VOICE: Record<string, SynastryVoice> = {
  "sun-conjunct-moon": {
    "intro": "You two feel like you've known each other for years by the second date. One of you walks into a room and the other's mood settles, or lifts, without a word being said. It's one of the oldest marriage signatures there is, and it comes with a catch: you're so lined up that neither of you gets much practice at being different.",
    "sections": [
      {
        "heading": "Relationship Dynamics",
        "body": "Whoever has the Sun decides things, and the one with the Moon quietly feels whether the decision is right. Most of the time the answer is yes, so plans get made in half a sentence and you finish each other's errands without discussing them. You end up in the same corner of every party, talking to the same two people. The other side of that is that the one with the Moon starts living inside the other's life, and the one with the Sun stops noticing how much of the emotional weather they're being carried by. Neither of you ever voted on this arrangement, it just happened."
      },
      {
        "heading": "Gifts & Challenges",
        "body": "What you get is being understood without performing. You can come home flat and be left alone, or come home wired and be met, and you never have to explain which. The hard part is that whoever has the Moon hands their moods straight to the other, who takes them on as their own problem. One of you gets quiet and the other starts scanning their own behaviour for what they did wrong, even when the answer is just a bad day at work. You also share blind spots, so when you're both wrong about something you're wrong with total confidence and nobody in the house corrects you."
      },
      {
        "heading": "Long-Term Potential",
        "body": "This is a pairing that lasts, often because it's easy, and it only goes stale if you stop being curious about each other. After ten years you can narrate each other's reactions in advance, and that feels like intimacy until one of you says something unexpected and the other flinches. What keeps it alive is separate friends, separate hobbies, and one trip a year where you each do something the other wouldn't choose. Couples who skip that end up warm, loyal and slightly bored, finishing sentences that were never worth finishing."
      }
    ]
  },
  "sun-sextile-moon": {
    "intro": "You two get along in a way that doesn't need managing. Conversations start easily, plans get made without a negotiation, and nobody has to translate. The risk is that it's so pleasant you never push it anywhere deeper.",
    "sections": [
      {
        "heading": "Relationship Dynamics",
        "body": "One of you brings the drive and the other brings the feeling, and they slot together if either of you makes the first move. Whoever has the Sun says they're thinking of a weekend away, and the one with the Moon has already half-packed in their head. You laugh at the same things, and a bad mood rarely survives a shared dinner. But the ease depends on someone starting it. If you both wait for the other to suggest the plan, a month goes by with texts about nothing and no actual evenings."
      },
      {
        "heading": "Gifts & Challenges",
        "body": "What works is that you make each other's lives smoother without noticing. The one with the Moon softens the other's rushing, and the one with the Sun gives them a reason to leave the house on a night they'd rather stay in. The challenge is that nothing forces you to grow. You can coast for years on being nice to each other, and the first real argument feels disproportionate because you never practised having small ones. If you want this to turn into more than a good friendship, say the slightly awkward true thing early, while it's still cheap."
      }
    ]
  },
  "sun-square-moon": {
    "intro": "You two rub each other the wrong way and can't stop standing close. One of you wants to act and the other wants to be felt first, and neither plan survives contact with the other. The attraction is real, and so is the friction.",
    "sections": [
      {
        "heading": "Relationship Dynamics",
        "body": "Whoever has the Sun makes a decision and announces it. The one with the Moon wanted to be asked, and says fine in a voice that means the opposite. Then the one with the Sun takes fine at face value, gets on with the day, and the other's silence grows until it comes out sideways over something about the dishwasher. You fight about tone far more than facts: you weren't listening, you don't ever slow down, you make everything about your feelings. Make-up is quick but you rarely resolve why it happened, so the same scene returns every few weeks in a new costume."
      },
      {
        "heading": "Gifts & Challenges",
        "body": "You keep each other honest. The one with the Sun can't coast on charm with someone who reads the mood underneath it, and the one with the Moon can't hide in comfort with someone who keeps pushing forward. The challenge is that every need of one reads as pressure from the other. A request for reassurance feels like a cage, a request for space feels like rejection, and you both take it personally. It helps enormously to agree on a signal for I'm not angry, I just need an hour, and to actually use it."
      }
    ]
  },
  "sun-trine-moon": {
    "intro": "You two are comfortable together almost from the start. Your habits fit, your moods don't clash, and you can spend a whole Sunday doing nothing and call it a great day. People around you assume you've been together longer than you have.",
    "sections": [
      {
        "heading": "Relationship Dynamics",
        "body": "The one with the Sun leads without bulldozing, and the one with the Moon follows without feeling smaller. You don't really argue about who decides, because whoever cares more just does it and the other is glad. Evenings fall into a rhythm: same side of the sofa, same show, same unspoken agreement about who cooks. Friends describe you as easy to be around, because you aren't performing a relationship for anyone. The danger is that the rhythm becomes the relationship, and you stop going out and trying new things because the old routine already feels good."
      },
      {
        "heading": "Gifts & Challenges",
        "body": "You get real emotional safety. The one with the Moon can say the soft, embarrassing thing and the other hears it as a compliment, not a weakness. The one with the Sun, in return, gets someone who actually believes in what they're building. The challenge is complacency. With so little friction, small resentments get swallowed instead of said, and they pile up behind the politeness. Plan something that scares you a little each year, and have one honest conversation a month that isn't about logistics."
      }
    ]
  },
  "sun-opposition-moon": {
    "intro": "You two are drawn to each other because the other is exactly what you aren't. One of you faces outward and the other faces in, and the pull across that gap is strong. It can also feel like living with someone who answers a different question than the one you asked.",
    "sections": [
      {
        "heading": "Relationship Dynamics",
        "body": "Whoever has the Sun wants to go out, do things, be seen. The one with the Moon wants to stay in, be close, be asked how they feel. You trade the same two arguments: why can't we just stay home, and why do you always need to be doing something. Each of you ends up playing the extreme because the other is playing theirs, so the one with the Sun gets louder and the one with the Moon gets quieter. In the good weeks you borrow from each other, and the one with the Sun learns to sit still while the other learns to show up at the party and enjoy it."
      },
      {
        "heading": "Gifts & Challenges",
        "body": "Each of you sees something the other is missing. The one with the Moon notices the mood in the room that the other walked straight past, and the one with the Sun spots the opportunity the first would have talked themselves out of. What goes wrong is that you tend to cast each other as the problem. One of you becomes cold and always busy, the other becomes needy and always upset, and neither is the whole truth. The fix is boring and works: say what you actually need before you're resentful, and compromise on the calendar before it becomes a referendum on the relationship."
      }
    ]
  },
  "venus-conjunct-mars": {
    "intro": "You two can't be in a room together without it getting charged. One of you wants and the other is wanted, and it turns around every few minutes. Your chemistry is the first thing people notice and the last thing that ever goes wrong.",
    "sections": [
      {
        "heading": "Relationship Dynamics",
        "body": "Whoever has Venus lights up the moment the one with Mars walks in, and the one with Mars goes after what they see. Nobody is confused about who's interested. You flirt in front of friends, text late, and find reasons to touch an arm or a back in the kitchen. The pace is fast: you've kissed before you've decided whether you even like each other's taste in music. That speed is the thrill and the trap, because affection and wanting arrive together and it's easy to mistake the second for the first."
      },
      {
        "heading": "Gifts & Challenges",
        "body": "You get a connection where wanting and tenderness feel like the same thing, which is rare. The challenge is that it runs on heat, and heat needs fuel. When you're stressed, the one with Venus wants to be wooed and the one with Mars wants to be left to fix things, and sex becomes the place you both try to make up. Learn to fight without going straight to bed. If you can have a real argument and a real repair that doesn't involve the bedroom, the chemistry stops carrying a load it was never built for."
      }
    ]
  },
  "venus-sextile-mars": {
    "intro": "You two have an easy, playful spark. You're attracted without it becoming a drama, and flirting between you feels more like a game you both enjoy than a negotiation. It's the sort of chemistry that sneaks up on friends.",
    "sections": [
      {
        "heading": "Relationship Dynamics",
        "body": "The one with Venus is charming, the one with Mars is bold, and when either of you makes a move the other usually says yes. Dates tend to start as something casual, like coffee or a walk, and end three hours later at someone's front door. You tease each other and neither feels attacked. Because the pull is gentle, it won't carry you over the line on its own. One of you has to say I like you in plain words, because you'll both happily stay in the maybe zone for months."
      },
      {
        "heading": "Gifts & Challenges",
        "body": "You bring out each other's best manners and best nerve. The Venus side gets braver about asking for what it wants, and the Mars side gets better at being kind in the pursuit. The snag is that low friction can mean low urgency. Nobody throws a plate, but nobody plans the trip either. If you want heat, schedule it: a proper date, a late night, an actual conversation about what you each want, instead of waiting for the spark to demand it."
      }
    ]
  },
  "venus-square-mars": {
    "intro": "You two want each other badly and keep getting it slightly wrong. The attraction is loud, and so are the misreadings. People who've seen you in a room together say there's something in the air, and they don't always mean it kindly.",
    "sections": [
      {
        "heading": "Relationship Dynamics",
        "body": "Whoever has Mars goes straight for what it wants, and the one with Venus wanted to be courted a little first. So the pursuit feels pushy, and the pulling back feels like a game. You have the argument about who texted last, who showed up late, who made it weird. Then you end up in bed anyway, and the next day it's unclear whether anything was settled. The cycle of tension, release, and mild confusion becomes its own addiction, and a lot of couples with this square mistake the cycle for passion."
      },
      {
        "heading": "Gifts & Challenges",
        "body": "What you get is real heat and a refusal to be bored. Nobody in this pairing is sleepwalking. The trouble is that desire and affection keep coming apart: the Mars side shows love by doing, the Venus side by being appreciated, and each feels unseen by the other's version. Ask for what you want in words instead of hints. Learn what affection actually looks like to the other, and give that, even when it isn't how you'd say I love you."
      }
    ]
  },
  "venus-trine-mars": {
    "intro": "You two flow together. Attraction is simple, affection is simple, and nobody has to coax the other into wanting you. Sex and tenderness both come without much of a negotiation.",
    "sections": [
      {
        "heading": "Relationship Dynamics",
        "body": "The one with Venus knows how to receive and the one with Mars knows how to move, and neither makes it awkward. Your first kiss probably felt unrushed and inevitable. You share a physical language: the same pace, the same sense of humour in bed, the same comfort with silence after. Nobody is performing. Even in an argument you can laugh your way out of it within an hour, which friends mistake for not caring when it's actually a gift."
      },
      {
        "heading": "Gifts & Challenges",
        "body": "What you get is chemistry that doesn't require upkeep to survive, and a relationship where desire isn't a battleground. The challenge is how easy it all is. Because nothing breaks, nothing prompts you to look at whether you actually want the same life, the same city, the same number of kids. You can drift for two years on a great connection and discover you never discussed money. Put the unsexy topics on the table while you still like each other that much."
      }
    ]
  },
  "venus-opposition-mars": {
    "intro": "You two are magnets that keep flipping. The attraction is immediate, almost cinematic, and so is the push-pull that comes with it. One of you pursues, the other pulls back, and then it flips.",
    "sections": [
      {
        "heading": "Relationship Dynamics",
        "body": "Whoever has Venus wants closeness and softness, and the one with Mars wants action and conquest. When you're apart, you're both obsessed. When you're together, it takes about forty minutes for one of you to feel crowded and the other to feel ignored. You chase in turns: one week it's you texting at midnight, next week it's them. Friends see you as the couple who break up and get back together, and they've stopped keeping score."
      },
      {
        "heading": "Gifts & Challenges",
        "body": "Each of you carries a quality the other secretly wants. The Mars side learns that tenderness can be strong, and the Venus side learns that wanting something out loud isn't rude. What goes wrong is polarisation: you each become more extreme to counter the other, so the Mars side gets harder and the Venus side gets clingier or colder. The way out is naming it as it happens. Say I'm pulling away and I don't want to, or I'm getting needy and I know it, and the spell loses some of its grip."
      }
    ]
  },
  "moon-conjunct-venus": {
    "intro": "You two feel safe with each other fast. One of you has the Moon and needs to feel held, the other has Venus and loves to hold, and there is almost no gap between the two. It feels like coming home to a house you've never lived in.",
    "sections": [
      {
        "heading": "Relationship Dynamics",
        "body": "Whoever has Venus gives affection easily and in the exact flavour the one with the Moon needs. Tea gets made, a hand lands on a shoulder, a favourite song appears on a playlist unprompted. The one with the Moon relaxes in ways they don't with anyone else, and starts telling the truth about small things. You build a home together quickly, with shared jokes and routines that other people find a bit much. It's gentle, but it's also sticky: leaving the house together after a hard week can feel like betraying the sofa."
      },
      {
        "heading": "Gifts & Challenges",
        "body": "What you get is a love that makes both of you softer and more generous, and people notice. The trouble is that comfort can squeeze out everything else. You skip friends, you avoid conflict, and you start saying yes to keep the peace, so resentment hides inside the sweetness. One of you also tends to over-give to prevent any sadness in the other. Keep an honest line open for I'd rather not tonight, because a relationship that can't say no is one where the yes means less."
      }
    ]
  },
  "moon-sextile-venus": {
    "intro": "You two are kind to each other without trying. There's warmth, ease, and a lot of small gestures that add up. It's a quieter kind of compatibility than fireworks, and often a more reliable one.",
    "sections": [
      {
        "heading": "Relationship Dynamics",
        "body": "The one with the Moon has moods and the one with Venus knows how to meet them with something small and right. A good meal, a gentle text, a hand on the back of the neck. You tend to like the same food, the same pace of weekend, the same quiet evenings. Disagreements are mild and short, and nobody holds a grudge for long. Because it's pleasant, it can take a while before one of you says what you actually want, and by then you're both attached."
      },
      {
        "heading": "Gifts & Challenges",
        "body": "You get a relationship that feels like a soft place to land and still has a spark of affection in it. The one with the Moon feels cared for, and the one with Venus feels appreciated. The catch is that this easy kind of pairing needs someone to act. Neither of you is likely to force the issue, so the trip stays an idea and the deeper conversation stays unscheduled. Make the first move more often than feels necessary, and say the affectionate thing out loud, since it will almost always be received well."
      }
    ]
  },
  "moon-square-venus": {
    "intro": "You two want to be good to each other and keep missing on how. One of you shows love by caring for the other, the other shows it by being charming, affectionate and easy to be around, and neither reads the other's version as the real thing.",
    "sections": [
      {
        "heading": "Relationship Dynamics",
        "body": "The one with the Moon wants to be asked how the day went and to be held when it didn't go well. The one with Venus wants lightness, dates, compliments and a partner who still dresses up. So one of you comes home needing a soft landing and gets a flirty text instead, and the other plans a lovely dinner and gets a heavy mood across the table. Each of you ends up thinking the other is not really paying attention, and each of you is wrong, because you are both paying attention to a different thing."
      },
      {
        "heading": "Gifts & Challenges",
        "body": "What you get right is tenderness and taste. When you land, the one with the Moon feels fed and the one with Venus feels adored, and you make a home together that is comfortable and pretty. What goes wrong is the quiet scorekeeping: one of you feels smothered by the neediness, the other feels brushed off by the polish. You fix it by saying the need out loud in plain words, I need you to just sit with me tonight, instead of waiting for the other to guess it from your face."
      }
    ]
  },
  "moon-trine-venus": {
    "intro": "Being around each other is easy in a way that surprises you both. Nobody has to perform, and affection moves back and forth without anyone keeping count.",
    "sections": [
      {
        "heading": "Relationship Dynamics",
        "body": "The one with the Moon gets soothed just by the other being in the room, and the one with Venus feels wanted for who they are, not for what they do. You cook together without a plan, fall asleep on the sofa mid-film, and say sorry fast because neither of you wants the evening ruined. Small kindnesses happen without an announcement: a coffee made the way the other likes it, a hand on the back in the kitchen. Friends tell you that you look calm together, and they are right."
      },
      {
        "heading": "Gifts & Challenges",
        "body": "You feel safe, and safe is rarer than people admit. The risk is that nothing forces you to grow. Because you rarely fight, you can drift for years without ever saying the harder thing, like the trip you want or the habit that bothers you. Pick one real conversation a month that is not pleasant and have it anyway, and the ease stays a strength instead of turning into a rut."
      }
    ]
  },
  "moon-opposition-venus": {
    "intro": "You two pull hard toward each other and then discover you were reaching for different things. One of you wants to be understood, the other wants to be enjoyed, and the gap between those feels exciting for a while and tiring after.",
    "sections": [
      {
        "heading": "Relationship Dynamics",
        "body": "The one with the Moon needs closeness, routine and reassurance, and the one with Venus needs room to be charming, social and a little bit unreachable. So one of you phones twice when the other is out with friends, and the other gets a bit cold exactly when the first one needs warmth. You swing back and forth: you cling, they drift, they come back sweet, you finally relax, and then it starts again. Each of you reads the other's behaviour as a verdict on the relationship when it is mostly just temperament."
      },
      {
        "heading": "Gifts & Challenges",
        "body": "You teach each other what you lack. The one with the Moon learns that love can be light, and the one with Venus learns that closeness is not a trap. But if neither of you names the pattern, you slide into a chase where the more one asks, the less the other gives. Agree on rules that cover both needs, such as a nightly check-in that is short and sincere, plus nights out that carry no guilt."
      }
    ]
  },
  "sun-conjunct-venus": {
    "intro": "The two of you adore each other early and openly, and people around you notice. One of you feels seen and admired, the other feels like the best version of themselves.",
    "sections": [
      {
        "heading": "Relationship Dynamics",
        "body": "Whoever has Venus makes the other feel worth looking at: they compliment, they touch, they notice the haircut and the new job. Whoever has the Sun lights up under that attention and gets more confident, funnier and warmer by the week. You flirt for years, buy each other silly presents and enjoy being seen as a couple. Disagreements get smoothed over with a joke or a kiss before they have time to harden."
      },
      {
        "heading": "Gifts & Challenges",
        "body": "Each of you feels chosen. The weak spot is that you both like harmony so much that you swallow irritation and let it pile up. The one with the Sun can start taking the admiration for granted, and the one with Venus can start performing sweetness they no longer feel. Be willing to be a little less charming and a little more honest, and the warmth lasts."
      }
    ]
  },
  "sun-sextile-venus": {
    "intro": "You get on well from the first dinner, and the liking grows with time instead of fading. It takes a small push from one of you to turn that goodwill into something deeper.",
    "sections": [
      {
        "heading": "Relationship Dynamics",
        "body": "The one with Venus is quick to praise and the one with the Sun is quick to be grateful, so you both leave conversations feeling a little better than you arrived. You laugh at the same things and share taste in food, music or weekend plans without having to negotiate. Because nothing is forcing the issue, it is easy to stay in the comfortable middle: great friends who kiss sometimes. Someone has to say I want more of this, or the friendship is all you get."
      },
      {
        "heading": "Gifts & Challenges",
        "body": "What you get is a relationship with no drama attached. The cost of that is that it can stay at a pleasant simmer if neither of you takes a risk. Plan the trip, say the I love you first, ask the real question about the future. Once one of you moves, the other follows with obvious relief."
      }
    ]
  },
  "sun-square-venus": {
    "intro": "You two find each other attractive and annoying in the same hour. One of you wants to be admired, the other wants to be appreciated on terms that do not quite match.",
    "sections": [
      {
        "heading": "Relationship Dynamics",
        "body": "The one with Venus wants romance, gentleness and a partner who slows down; the one with the Sun wants to be admired, to lead, and to be looked at as the main event. So a compliment lands slightly wrong, a gift feels like a hint, and a plan for the weekend becomes a negotiation about who is putting in more effort. You can hear criticism in a sigh. A small thing, like who picks the restaurant, takes up an evening because it stands for who is being valued."
      },
      {
        "heading": "Gifts & Challenges",
        "body": "The pull between you is real, and it is the kind that makes you try. The cost is that each of you feels slightly unappreciated while the other thinks they are giving plenty. Ask each other directly what feels like love, because the answers will not be what you each assumed. When you do that, the friction turns into effort that shows."
      }
    ]
  },
  "sun-trine-venus": {
    "intro": "You two slot together without effort and the affection feels natural from the beginning. You like each other as people, which makes everything else easier.",
    "sections": [
      {
        "heading": "Relationship Dynamics",
        "body": "Whoever has Venus is generous with warmth and the one with the Sun soaks it up and gives back confidence, so each of you gets better at the thing you were already good at. You enjoy the same evenings, spend money in similar ways and rarely need to translate. When you disagree it stays small, and you make up with a hug or a joke before bedtime. Other couples ask you how you do it, and you honestly do not have a method."
      },
      {
        "heading": "Gifts & Challenges",
        "body": "What you get is genuine contentment. The risk is that a relationship with so little friction lets you both avoid the uncomfortable talks, about money, about the future, about the habit that irritates you. Because things feel fine, you put off the decisions that would make it permanent. Name a goal you both want, like a move or a project, so the comfort has somewhere to go."
      }
    ]
  },
  "sun-opposition-venus": {
    "intro": "You two are strongly drawn to each other and keep running into the fact that you want to be loved in opposite ways. The attraction is obvious; the daily fit takes work.",
    "sections": [
      {
        "heading": "Relationship Dynamics",
        "body": "The one with the Sun wants to be admired and followed, and the one with Venus wants to be wooed and met halfway. So one of you pushes forward and the other waits to be asked, and you spend a few evenings each month sulking over who was supposed to make the first move. Your tastes can differ, in spending, in how much you socialise, in how affectionate you are in public. Each of you sees in the other something you partly lack, which is why you were so interested at the start."
      },
      {
        "heading": "Gifts & Challenges",
        "body": "You balance each other: boldness meets grace, and both of you grow a little. The wear comes from taking turns being the one who gives in. Decide together how to split the compromises so neither of you is quietly keeping a tally. When the balance is fair, the opposition feels like a partnership instead of a tug of war."
      }
    ]
  },
  "mars-conjunct-saturn": {
    "intro": "Your energy together is intense and heavy at once. One of you pushes, the other holds back, and sometimes you can feel the handbrake being pulled in the middle of a perfectly good moment.",
    "sections": [
      {
        "heading": "Relationship Dynamics",
        "body": "The one with Mars wants to go, to act, to start, and the one with Saturn wants to check, to wait, to do it properly. So a spontaneous idea gets met with a list of reasons it is a bad idea, and the one who suggested it feels shut down while the other feels pressured. In bed and out of it, you can run hot and cold: drive and discipline fused, then a flat refusal that comes from nowhere. Arguments tend to be short and cold, and you remember them longer than you admit."
      },
      {
        "heading": "Gifts & Challenges",
        "body": "What you get right is stamina. You build things together, whether it is a business, a house or a training routine, and you finish what you start. What you get wrong is that the one with Saturn can squash the other's spark with criticism, and the one with Mars can force pace and push past a legitimate no. Learn when to say slow down in a kind voice, and when to say go ahead and mean it."
      }
    ]
  },
  "mars-sextile-saturn": {
    "intro": "You two work well as a team, and you feel it when you get something done together. Drive and discipline fit, if you remember to use them.",
    "sections": [
      {
        "heading": "Relationship Dynamics",
        "body": "The one with Mars supplies the energy and the one with Saturn supplies the plan, so projects around the house, money goals and fitness routines go better when you do them as a pair. You respect each other's work ethic, and you talk about how to get things done instead of just complaining. There is a calm steadiness in how you handle disagreement, with less shouting than most couples manage. It takes a bit of intention, though; the cooperation doesn't happen unless somebody suggests the plan."
      },
      {
        "heading": "Gifts & Challenges",
        "body": "You get a partnership that actually builds something. The risk is that you treat the relationship like a shared job and forget the play. Schedule the dates, the sex and the dumb fun the way you schedule the rest, and you will keep that spark. If you do, you get a pair that works well and still wants to come home."
      }
    ]
  },
  "mars-square-saturn": {
    "intro": "This is the pairing where one of you feels blocked and the other feels attacked. You want to move together and keep stepping on each other's toes.",
    "sections": [
      {
        "heading": "Relationship Dynamics",
        "body": "The one with Mars acts first and asks later, and the one with Saturn comes down hard on the mess that results. So one of you says you are always criticising me and the other says you never think before you do things, and both of you are right about the other. Sex can turn into a power question, one of you pushing and the other withholding. A no has to be heard as a full answer, not as a move in the argument. You say things in anger that sound like rules, and then stay quiet for days."
      },
      {
        "heading": "Gifts & Challenges",
        "body": "It wears you both out when the cold war becomes normal. Slowly the one with Mars stops suggesting things and the one with Saturn stops trusting, and from the outside it looks like a quiet marriage. What makes it last is clear agreements about decisions, a fixed time to discuss money and chores, and the habit of taking a break instead of finishing the fight. If you each respect the other's pace, you build real strength, and it is strength you earned instead of inherited."
      }
    ]
  },
  "mars-trine-saturn": {
    "intro": "You two move at a compatible speed. One of you gets things going and the other makes sure they last, and you trust each other to do your half.",
    "sections": [
      {
        "heading": "Relationship Dynamics",
        "body": "The one with Mars starts and the one with Saturn finishes, so errands, renovations, trips and training plans go smoothly, with little shouting about who forgot what. You know what the other is going to say before they say it, because you both honour your commitments. Arguments are short and practical: here is the problem, here is what we do. In bed there is a steady confidence, nobody is performing and nobody is pushed."
      },
      {
        "heading": "Gifts & Challenges",
        "body": "What you get is reliability, which you take for granted until you see how rare it is. The weak spot is that you can get stuck in routine and let the heat fade without noticing. Do something that scares you both a little, like a new city or a new skill, so the dependable partnership has something exciting to carry."
      }
    ]
  },
  "mars-opposition-saturn": {
    "intro": "You push and the other one brakes, or the other way round, and neither of you ever feels fully understood. Plans, sex and money all turn into a negotiation about pace. You can feel like opponents on the same team.",
    "sections": [
      {
        "heading": "Relationship Dynamics",
        "body": "One of you wants to go now, the other wants to check first, and every decision becomes a tug of war about speed. The one with Mars hears a no as a verdict on who they are, so they push harder, which makes the one with Saturn dig in. You argue about the unbooked trip, the unanswered text, the thing that was supposed to happen last month. Because each of you is sure the other is the obstacle, you start rehearsing the fight before it happens. Often you only notice you are standing on opposite sides of the room when one of you has gone quiet."
      },
      {
        "heading": "Gifts & Challenges",
        "body": "You each hold what the other lacks: one of you finishes nothing without a push, the other starts nothing without a plan, and together things can actually get built and actually get started. The cost is that the Mars side feels policed and the Saturn side feels run over. Sex can go cold when one of you reads every advance as pressure or every refusal as rejection. It gets better the day the faster one says what they need by when, and the slower one says yes or no instead of a vague maybe that stalls everything for a week."
      }
    ]
  },
  "moon-conjunct-pluto": {
    "intro": "You two feel each other all the way down, and you can never quite get comfortable with how much. One mood in the house sets the mood for both of you. Closeness here feels total or it doesn't feel safe.",
    "sections": [
      {
        "heading": "Relationship Dynamics",
        "body": "Whoever has the Moon feels everything the one with Pluto doesn't say, and the one with Pluto can see straight through every excuse. Nothing stays private for long: a flat tone in the kitchen gets read, questioned and answered before you have decided what you feel. You cry in front of each other early and you reveal things you have never told anyone. Then comes the morning after, when one of you feels exposed and cools off, and the other takes the retreat as proof they were right to be afraid."
      },
      {
        "heading": "Gifts & Challenges",
        "body": "What you get is repair that goes deeper than an apology: after a real blow-up you actually understand each other better than before. The danger is control dressed as love, where one of you checks the phone, tracks the whereabouts, or goes silent for days as punishment. That is control, not depth, and nobody owes it to the other. Whoever has the Moon learns to hide the feeling instead of showing it, and the one with Pluto learns to squeeze harder when they sense distance. Jealousy and old wounds from other relationships get pulled in, and arguments are rarely about the dishes."
      },
      {
        "heading": "Long-Term Potential",
        "body": "This pairing tends to last either for decades or only a few ferocious years, with little in between. The wear comes from emotional intensity that never gets a day off: you can't have a casual evening because every look carries weight, and eventually one of you needs air and the other treats that as abandonment. It holds when you give each other real privacy, say the control out loud when you catch yourself doing it, and stop saving up grievances for the big night. If you do the work, the intensity settles into something steady. If you don't, you end up with a very loyal, very tired standoff."
      }
    ]
  },
  "moon-sextile-pluto": {
    "intro": "You get under each other's skin in a way that mostly helps. Honest talks come easy and neither of you flinches at what the other admits. It's a quiet depth rather than a storm.",
    "sections": [
      {
        "heading": "Relationship Dynamics",
        "body": "You tell each other things you wouldn't tell friends, usually late at night and usually by accident. The one with the Moon lets a feeling slip, and the one with Pluto doesn't judge or rush to fix it, just names what's underneath. A bad day at work becomes a real conversation about where the fear came from. Because it is easy to go deep, you rarely feel the need to fake being fine around each other."
      },
      {
        "heading": "Gifts & Challenges",
        "body": "You can handle the hard subjects, like family wounds, money fears and old exes, without it exploding. The catch is that nothing forces you to do it, so you can coast on pleasant surface for months and miss that something has gone unsaid. The one with Pluto quietly decides how things will go and the other goes along because it is easier than a scene. Open the heavy topic on purpose now and then, and this pairing quietly pays you back."
      }
    ]
  },
  "moon-square-pluto": {
    "intro": "Your feelings and their intensity collide, and neither of you backs down. One of you wants comfort, the other wants the truth, and you can't always get both in the same hour. It's gripping and it's draining.",
    "sections": [
      {
        "heading": "Relationship Dynamics",
        "body": "Whoever has the Moon wants to be soothed and the one with Pluto wants to dig, so a small upset turns into an interrogation. You say you're fine, they don't believe it, and ninety minutes later you are crying about something from age nine. Then the roles flip: the Pluto one goes cold and silent, and the Moon one pushes for answers that never come. You remember every fight in detail, including who said what, long after you have both stopped meaning it."
      },
      {
        "heading": "Gifts & Challenges",
        "body": "Nothing important stays buried, because you cannot leave a wound alone, and some of those wounds really do heal. The cost is power games about who gives in first, who apologises, and who decides the mood of the house. Control shows up as silent treatment, guilt, checking up, or threats to leave that nobody means. If one of you has ever been betrayed, the fear comes out as tests. Testing does not build trust: say the fear in words and skip the traps."
      }
    ]
  },
  "moon-trine-pluto": {
    "intro": "Your emotions meet at the same depth and it feels natural, almost unfair. You understand each other's moods without needing the whole explanation. People around you can tell you share something private.",
    "sections": [
      {
        "heading": "Relationship Dynamics",
        "body": "You can sit in a heavy mood together and neither of you tries to cheer the other up before it is time. The one with the Moon feels protected when the Pluto one says that's really about your dad, isn't it, and they are right. You have a sense for each other's timing, knowing when to push and when to leave the room. Crying, confessing and admitting you were wrong happen here faster than in most of your other relationships."
      },
      {
        "heading": "Gifts & Challenges",
        "body": "What you get is a loyalty that survives bad stretches, because you don't panic when the other is at their worst. The cost is that the ease makes you lazy about the things that aren't emotional: bills, chores, dates that need planning. The one with Pluto can also take over the emotional agenda without either of you noticing, and the other lets it happen because it feels like being understood. Check now and then that you are both choosing this, not just sinking into it."
      }
    ]
  },
  "moon-opposition-pluto": {
    "intro": "You pull each other toward the deep end, and one of you keeps wanting to leave the water. There is a strong magnetism and a strong defensiveness at the same time. You both feel watched.",
    "sections": [
      {
        "heading": "Relationship Dynamics",
        "body": "The one with the Moon wants comfort and routine, and the one with Pluto wants to change something about the relationship every few months. You show up at opposite ends of every emotional conversation: one pushes to dig it all out, the other says it is handled and goes to bed. Each sees in the other the exact thing they fear in themselves, whether that is neediness or coldness. So the fights are less about the event and more about who gets to define what just happened."
      },
      {
        "heading": "Gifts & Challenges",
        "body": "You get a mirror that does not lie, so if you can stay in the room, you both learn things about your own patterns very fast. The problem is projection: the Moon side accuses the Pluto side of manipulation, and the Pluto side accuses the Moon side of using feelings as leverage, and both accusations are partly true. Power moves look like withholding affection, going quiet at dinner, bringing up old mistakes, and getting friends on your side. None of that is intensity, it is moves to win, and each of you can stop making them. It goes better when you say what you want plainly instead of testing whether the other will guess."
      }
    ]
  },
  "venus-conjunct-pluto": {
    "intro": "This pull is closer to compulsion than to a crush. You can't casually like each other, it is all or nothing from the first weekend. Love and obsession get tangled early.",
    "sections": [
      {
        "heading": "Relationship Dynamics",
        "body": "You think about each other constantly, you reread messages, and you plan your week around where the other one will be. The one with Venus feels chosen in a way that is thrilling, and the one with Pluto feels something almost frightening about how much they want it. Early on, plans, friends and sleep get dropped without much discussion. Then the first small cooling, a slow text or a night out alone, sets off a panic that looks like love and acts like control."
      },
      {
        "heading": "Gifts & Challenges",
        "body": "What you get is a bond that goes far beyond ordinary attraction, and when it is good, being wanted this fully changes how both of you see yourselves. The cost is jealousy, possessiveness and the habit of testing loyalty with small traps. Those are control, not passion, and calling them passion is how they last. The one with Pluto tries to run the relationship through intensity, and the one with Venus gives in to keep the peace and resents it later. Deal-breakers show up fast: one affair, one lie, one threat to leave, and it never fully goes back to how it was. Keeping your own friends, money and evenings is not betrayal here, it is what keeps this from swallowing you."
      }
    ]
  },
  "venus-sextile-pluto": {
    "intro": "There's a steady, magnetic warmth between you that needs no drama. You trust each other with more than you expected. Attraction deepens over time rather than burning out.",
    "sections": [
      {
        "heading": "Relationship Dynamics",
        "body": "You notice each other in a room before you notice anyone else, and the flirting has a seriousness underneath. The one with Venus feels seen when the one with Pluto asks something sharper than small talk. Dates tend to run long, and you leave knowing something new about the other person. Affection comes easily, and so does honesty about what you want in bed and out of it."
      },
      {
        "heading": "Gifts & Challenges",
        "body": "You grow more attached rather than less, because the more you learn, the more interesting the other becomes. The weakness is that nothing here forces action, so a pleasant pull can stay a pleasant pull for years if neither of you makes a move or a commitment. Occasional jealousy shows up, but you can usually talk it down before it sets. Say the serious thing out loud instead of waiting for the other to guess it, and this pairing rewards you."
      }
    ]
  },
  "venus-square-pluto": {
    "intro": "You want each other badly and you don't fully trust that wanting. Sparks fly and so do accusations. There is a push and pull that feels like being hunted and hunting at once.",
    "sections": [
      {
        "heading": "Relationship Dynamics",
        "body": "One of you wants affection and ease, the other wants total honesty and total commitment, and neither is willing to settle for less. The attraction is immediate and a bit uncomfortable, like you shouldn't be this interested. A friendly chat with an ex or a coworker becomes a three hour interrogation, and the interrogation is the thing to fix, not the chat. You make up passionately, which makes it harder to notice that you have made up the same fight six times."
      },
      {
        "heading": "Gifts & Challenges",
        "body": "What you get is raw desire that few couples ever feel, and the pair of you do not do boring. The cost is control: the one with Pluto goes through the phone, rewrites the story, or threatens to disappear, while the one with Venus smiles, lies about small things to avoid scenes, and builds resentment. Money, exes and loyalty are where it blows up. If you ever hit the point where one of you is afraid to say what they did today, that is the signal to stop and reset, not push through."
      }
    ]
  },
  "venus-trine-pluto": {
    "intro": "Attraction here is strong and unusually calm. You want each other fully and neither of you needs to prove it. The depth shows up in small things rather than big scenes.",
    "sections": [
      {
        "heading": "Relationship Dynamics",
        "body": "You flirt like you mean it and you mean it. The one with Venus feels comfortable being fully wanted, and the one with Pluto feels safe being fully committed, which is rarer than either would admit. Time alone together has weight, even over a cheap dinner or a long drive. You are quick to forgive each other for the things that would sink other couples."
      },
      {
        "heading": "Gifts & Challenges",
        "body": "What you get is a bond that gets stronger under pressure and a physical connection that does not fade on schedule. The risk is how easily it all flows: you stop having the hard conversations because nothing seems broken, and one of you slowly takes over the decisions. The Pluto one can go possessive without raising their voice, and the Venus one lets it pass because it feels like being cherished. Possessive is not cherished, and it grows when nobody names it. Notice when closeness has turned into being each other's whole world, and keep a few things outside it."
      }
    ]
  },
  "venus-opposition-pluto": {
    "intro": "You are drawn across a gap and you keep checking whether it is safe to cross. Attraction runs hot and so does the suspicion. It feels like a pursuit where both of you want to be caught and both of you want to win.",
    "sections": [
      {
        "heading": "Relationship Dynamics",
        "body": "The one with Venus wants things light and pleasant and the one with Pluto wants everything on the table, and you keep meeting in the middle badly. You chase, withdraw, and chase again, sometimes for years. Every compliment gets checked for motive, and every night out alone gets a follow-up question the next day. One of you says I just need space and the other hears the door slam."
      },
      {
        "heading": "Gifts & Challenges",
        "body": "What you get is chemistry that does not need a reason, plus a willingness to look at what you each avoid. The trouble is a power struggle disguised as romance: who texts first, who needs whom more, who is allowed to look at someone else. Gifts, favours and affection can become currency, and sooner or later someone calls in a debt. It improves if you stop trying to win and say plainly what you want, even when that sounds needy."
      }
    ]
  },
};
