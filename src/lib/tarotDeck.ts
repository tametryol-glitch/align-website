// Client-side tarot deck — draws cards locally, no backend needed

interface TarotCardDef {
  name: string;
  arcana: 'major' | 'minor';
  number: number;
  suit?: string;
  keywords_upright: string[];
  keywords_reversed: string[];
  imagery?: string;
}

const MAJOR_ARCANA: TarotCardDef[] = [
  { name: 'The Fool', arcana: 'major', number: 0, keywords_upright: ['you start before you are ready', 'you travel light', 'you laugh at the risk'], keywords_reversed: ['you leap with no money behind it', 'you ignore the one friend who said wait', 'you call carelessness courage'], imagery: 'You are about to do something every sensible person has advised against, and part of you has already left. You won\'t pack properly and you\'ll learn that on the way. The cost is looking foolish in front of the people who warned you.' },
  { name: 'The Magician', arcana: 'major', number: 1, keywords_upright: ['you use what is already on the table', 'you say it and then make it so', 'you stop waiting for permission'], keywords_reversed: ['you promise more than you can deliver', 'you charm your way past the hard part', 'you spin the story to avoid the truth'], imagery: 'You have more to work with than you admit: the skill, the contacts, the free evening. You keep saying you need one more thing first. Once you start, nobody else is to blame for how it turns out.' },
  { name: 'The High Priestess', arcana: 'major', number: 2, keywords_upright: ['you know without being told', 'you keep your own counsel', 'you read what is left unsaid'], keywords_reversed: ['you sit on what you know until it spoils', 'you go silent instead of saying no', 'you bury a feeling and call it calm'], imagery: 'You already know the answer and haven\'t told anyone, including yourself. You notice what the other person left out of the story. The cost is carrying what you know in silence and being called cold for it.' },
  { name: 'The Empress', arcana: 'major', number: 3, keywords_upright: ['you feed and house people', 'you let things take their time', 'you enjoy your body and your senses'], keywords_reversed: ['you do for people what they could do themselves', 'you smother and then resent it', 'you stall on a creative project for months'], imagery: 'You make things grow: a garden, a household, a project, a person. You feed people before you eat. The cost is getting tired of being the one everything depends on and saying nothing until you are resentful.' },
  { name: 'The Emperor', arcana: 'major', number: 4, keywords_upright: ['you make the plan and hold the line', 'you take responsibility', 'you build a system that outlasts you'], keywords_reversed: ['you win the argument and lose the room', 'you need control more than results', 'you never say sorry first'], imagery: 'You are the one who sets the rules, the budget and the date. People relax when you are in charge and also stop telling you things. The cost is being the adult nobody argues with.' },
  { name: 'The Hierophant', arcana: 'major', number: 5, keywords_upright: ['you follow the proven path', 'you learn from someone who has done it', 'you keep the family ritual'], keywords_reversed: ['you stay in a group you outgrew', 'you rebel just to prove you can', 'you break the rule and have nothing to replace it'], imagery: 'You do it the way it is done: the degree, the vows, the family recipe, the advisor everyone trusts. It gives you a place to belong. The cost is never asking whether you still believe it.' },
  { name: 'The Lovers', arcana: 'major', number: 6, keywords_upright: ['you choose with your whole self', 'you tell the truth about what you want', 'you commit to one person or path'], keywords_reversed: ['you keep two options open until both leave', 'you say yes and mean maybe', 'you let someone else choose for you'], imagery: 'You are choosing between two things you want, and picking one loses the other. It is usually about a person and sometimes about who you plan to be. Putting it off is also a choice, and it is made by default.' },
  { name: 'The Chariot', arcana: 'major', number: 7, keywords_upright: ['you drive hard and do not look back', 'you hold two pulls and still move', 'you win by focus'], keywords_reversed: ['you go fast in the wrong direction', 'you snap at whoever is in your way', 'you lose control of the thing you were steering'], imagery: 'You are driving hard at something and holding two opposing pulls together by will, like the safe job and the risky dream, or two people in your life. It works while you stay focused. The cost is no rest and no room to breathe.' },
  { name: 'Strength', arcana: 'major', number: 8, keywords_upright: ['you stay calm with a difficult person', 'you hold your temper', 'you win with patience, not force'], keywords_reversed: ['you doubt yourself right before the thing you can do', 'you swallow anger until it comes out sideways', 'you give in to the impulse you promised to resist'], imagery: 'You stay calm when everyone else is shouting, including your own temper. You handle a hard person with patience, not force. The cost is quiet effort nobody notices and the temptation to swallow your anger.' },
  { name: 'The Hermit', arcana: 'major', number: 9, keywords_upright: ['you pull back to think', 'you choose one good conversation over a crowd', 'you go looking for your own answer'], keywords_reversed: ['you hide and call it self-care', 'you stop answering friends for months', 'you stay alone long after the thinking is done'], imagery: 'You pull back to work something out alone. Your phone sits face down and you decline the party. The answer comes in the quiet. The cost is that friends feel dropped, so tell them how long you\'ll be gone.' },
  { name: 'Wheel of Fortune', arcana: 'major', number: 10, keywords_upright: ['your luck turns', 'a cycle you are in ends', 'a chance lands that you did not plan'], keywords_reversed: ['you cling to a phase that is over', 'you blame bad luck for a repeated mistake', 'you refuse the change handed to you'], imagery: 'Your luck is turning and you didn\'t cause it: a job opening, a layoff, a stranger\'s introduction. What you do with the new position matters more than how you got there. What was working stops.' },
  { name: 'Justice', arcana: 'major', number: 11, keywords_upright: ['you tell it straight', 'you own what you did', 'you get what you earned'], keywords_reversed: ['you bend the story in your favor', 'you dodge the bill for what you did', 'you hold others to a stricter rule than yourself'], imagery: 'You face a decision with real consequences, and the facts rather than your feelings decide it. A contract, a ruling, an honest talk about who owes what. The cost is accepting the verdict even if it goes against you.' },
  { name: 'The Hanged Man', arcana: 'major', number: 12, keywords_upright: ['you pause on purpose', 'you give something up to see clearly', 'you look at it from the other side'], keywords_reversed: ['you stall and call it patience', 'you sacrifice for someone who never asked', 'you wait for a sign instead of deciding'], imagery: 'You are stuck and pushing harder does nothing. The only thing that works is stopping. A pause that looks like wasted time lets you see the problem from the other side. The cost is the control you\'ve been gripping.' },
  { name: 'Death', arcana: 'major', number: 13, keywords_upright: ['something finishes for good', 'you clear out what is dead', 'you start over from zero'], keywords_reversed: ['you keep a dead thing on life support', 'you refuse the ending and stay stuck for years', 'you hold on to the person you used to be'], imagery: 'Something ends, and you knew it was ending: a job, a relationship, an identity, a house. It is clean and not up for negotiation. The cost is real grief, and the gain only shows up months later.' },
  { name: 'Temperance', arcana: 'major', number: 14, keywords_upright: ['you find the middle without losing either side', 'you pace yourself', 'you blend two worlds'], keywords_reversed: ['you swing between too much and nothing', 'you overdo it and then crash', 'you rush what needs to be slow'], imagery: 'You are mixing two things that didn\'t belong together: work and rest, two families, two sides of yourself. It takes slow, small adjustments and no extremes. The cost is the thrill of going all in.' },
  { name: 'The Devil', arcana: 'major', number: 15, keywords_upright: ['you see exactly what has hold of you', 'you admit what you cannot stop', 'you know the chain is loose'], keywords_reversed: ['you leave and go back within a week', 'you swap one habit for another', 'you name it out loud and keep it anyway'], imagery: 'You are tied to something you say you want out of: a person, a drink, a job, your phone. The chain is looser than you claim. You stay because leaving costs you whatever it gives you, so name what you get from staying.' },
  { name: 'The Tower', arcana: 'major', number: 16, keywords_upright: ['it all comes down in a day', 'a lie gets exposed', 'you lose what was built on sand'], keywords_reversed: ['you see the collapse coming and do nothing', 'you patch the crack and wait', 'you avoid the one conversation that would let you fall on your own terms'], imagery: 'A structure built on a false assumption comes down fast: a job loss, a breakup, a diagnosis, an exposed lie. It was already cracking. The shock is the cost, and you finally get to build on what is true.' },
  { name: 'The Star', arcana: 'major', number: 17, keywords_upright: ['you start to believe again', 'you heal slowly', 'you are honest and open'], keywords_reversed: ['you stop hoping so you cannot be hurt again', 'you say you have moved on and have not', 'you lose faith in what is good for you'], imagery: 'After the crash you get your first quiet days. You sleep, you make plans for next spring, you start to believe again in a small way. The wound is still tender. The cost is trust, because you have to hope again.' },
  { name: 'The Moon', arcana: 'major', number: 18, keywords_upright: ['nothing is quite what it looks like', 'your dreams are loud', 'you sense something you cannot prove'], keywords_reversed: ['you believe the worst story you invented', 'you act on a fear and wreck something real', 'you misread a person and cannot let it go'], imagery: 'Things look off and you can\'t tell whether it\'s your anxiety or a real problem: a message that reads wrong, a night of bad sleep, a person whose story shifts. The cost is acting on fear as if it were fact.' },
  { name: 'The Sun', arcana: 'major', number: 19, keywords_upright: ['things work and people see it', 'you feel lit up', 'you enjoy what you have'], keywords_reversed: ['you act confident while quietly exhausted', 'you boast too early', 'you assume the good run needs no effort'], imagery: 'A good stretch where what you were hiding comes out and it\'s fine. People like you, your energy is up, the project works. The cost is that you are visible, so you can\'t hide behind modesty.' },
  { name: 'Judgement', arcana: 'major', number: 20, keywords_upright: ['you hear the call and answer it', 'you forgive and are forgiven', 'you review your life and decide'], keywords_reversed: ['you hear it and put in earplugs', 'you replay old mistakes for years', 'you refuse to look at your own record'], imagery: 'You hear a call you have ignored for a year: the move, the apology, the career change. You review your life and decide what you\'ll do about it. The cost is looking at your own record honestly.' },
  { name: 'The World', arcana: 'major', number: 21, keywords_upright: ['you finish what you started', 'you belong where you are', 'you close a chapter properly'], keywords_reversed: ['you stop at ninety percent', 'you cut a corner at the finish', 'you cannot let a finished thing be finished'], imagery: 'You finish something big: the degree, the move, the book, the project. You belong where you are standing. The cost is the question of what comes next, which arrives the following morning.' },
];

const SUITS = ['Wands', 'Cups', 'Swords', 'Pentacles'];
const COURT = ['Page', 'Knight', 'Queen', 'King'];

const SUIT_KEYWORDS: Record<string, { upright: string[]; reversed: string[]; imagery: string }[]> = {
  Wands: [
    { upright: ['a sudden urge to start', 'you want something badly', 'a new project lights you up'], reversed: ['you have the idea and never start', 'you start and quit by Friday', 'you wait for a better moment forever'], imagery: 'A spark of wanting something arrives: a business, a trip, a person. It has no plan yet. Act on it within the week or it goes cold and you tell yourself it was a phase.' },
    { upright: ['you plan the move', 'you weigh the safe against the bold', 'you hold the world in your hand'], reversed: ['you stay put out of fear', 'you plan forever', 'you copy somebody else\'s plan'], imagery: 'You have a safe place and a bigger plan, and you are standing between them. You keep researching instead of going. Leaving costs you the comfort, and staying costs you the life you imagine.' },
    { upright: ['you wait for the plan to pay off', 'you look ahead', 'others respond to what you started'], reversed: ['you take the first no as final', 'you blame delays on other people', 'you stall instead of following up'], imagery: 'You\'ve sent your plan out and now you wait for results: replies, shipments, a verdict. Your job is to prepare for the answer, not to refresh your email.' },
    { upright: ['a milestone to celebrate', 'a home that feels stable', 'friends gather for you'], reversed: ['you cannot enjoy the win', 'the celebration is tense', 'you move house again too soon'], imagery: 'A milestone you can celebrate: the move-in, the wedding, the finished first draft. Enjoy it for real. The next thing is already waiting, and it will still be there tomorrow.' },
    { upright: ['everyone wants their own way', 'a loud meeting', 'you compete over small things'], reversed: ['you avoid the argument and it festers', 'you fight dirty', 'you pretend you do not care'], imagery: 'Everyone is arguing about how it should be done and nobody is listening: a meeting, a family dinner, a shared flat. It is more noise than war. The cost is wasted days and some bruised pride.' },
    { upright: ['you win and people see it', 'you get the credit', 'you lead the pack'], reversed: ['you need applause more than results', 'you take credit for team work', 'a public fall'], imagery: 'You get the win and the praise, and people notice. The cost is an audience that now expects it again, so you start protecting the image.' },
    { upright: ['you defend your position', 'you refuse to back down', 'you hold the high ground'], reversed: ['you give up one step before it turns', 'you fight everyone, even allies', 'you defend a position that is already lost'], imagery: 'You hold your ground against people who think they know better. You\'re outnumbered and right, or at least stubborn. The cost is exhaustion and the loneliness of defending it alone.' },
    { upright: ['everything speeds up', 'news arrives all at once', 'you travel or move fast'], reversed: ['messages get crossed', 'you rush and miss a detail', 'the reply you were promised never comes'], imagery: 'Things speed up: replies, deadlines, flights, a flood of texts. Clear your desk, because the delays are over. The cost is that you can\'t control the pace.' },
    { upright: ['you get up again after being hit', 'you are tired and you finish', 'you protect what is left'], reversed: ['you refuse all help', 'you quit one step from the finish', 'you treat everyone as an enemy'], imagery: 'You are nearly done, exhausted, and bracing for the next hit because the last one hurt. Don\'t quit now, and do admit you\'re hurt. Stubbornness is passing for toughness.' },
    { upright: ['you carry far too much', 'you cannot say no', 'everything depends on you'], reversed: ['you drop a load and feel guilty', 'you collapse before you ask for help', 'you hand off the work and then redo it yourself'], imagery: 'You are carrying too much: the job, the family, the extra project you said yes to. You haven\'t put anything down because you\'re proud of being reliable. The cost is your health and a resentment that leaks out sideways.' },
  ],
  Cups: [
    { upright: ['a feeling you cannot explain away', 'you fall for someone', 'you want to create again'], reversed: ['you push the feeling back down', 'you cry about nothing and will not say why', 'you stop making things'], imagery: 'A feeling arrives that you can\'t explain away: you fall for someone, or you want to make something again. It is open and a little scary. The cost is letting yourself be moved.' },
    { upright: ['a mutual pull', 'you meet halfway', 'a partnership begins'], reversed: ['one of you gives more than the other', 'a promise is not kept', 'you talk past each other'], imagery: 'Two people agree to meet halfway: a first date that goes well, a partner who finally apologizes, a deal both sides want. It is mutual. The cost is giving up some independence.' },
    { upright: ['friends show up for you', 'you celebrate together', 'a group that has your back'], reversed: ['you drink and gossip too much', 'you drop a friend after one fight', 'a group that only meets to complain'], imagery: 'Friends who actually show up: the birthday, the group trip, the chat that carries you through a bad week. The cost is the effort of showing up for them in return.' },
    { upright: ['you are bored with what you have', 'you turn down a good offer', 'you sit and brood instead of acting'], reversed: ['you act on the offer too late', 'you swing to the opposite extreme', 'you resent everyone for trying'], imagery: 'Something good is on offer and you aren\'t noticing it. You\'re bored, sulking, or comparing it with what you lost. Turn your head. The cost is admitting the offer was there all along.' },
    { upright: ['you grieve what is gone', 'you replay the loss', 'you miss what remains'], reversed: ['you start to move on and drop back', 'you pretend you are fine', 'you blame yourself for what was not yours'], imagery: 'You\'re grieving what spilled and have your back to the cups still standing. You replay the breakup, the loss, the mistake. At some point you have to turn around. The cost is your attention for months.' },
    { upright: ['someone from your past returns', 'you remember a simpler time', 'a kindness from childhood'], reversed: ['you live in the old days', 'you romanticize a bad year', 'you keep an ex as a fallback'], imagery: 'The past turns up: an old friend, a smell from your hometown, a message from an ex. It is sweet and it tempts you to live there. The cost is comparing today with a memory that has been cleaned up.' },
    { upright: ['too many options', 'you daydream about each one', 'you want it all'], reversed: ['you chase the shiniest and drop the real one', 'you pick on impulse and regret it', 'you stay in fantasy so you never risk anything'], imagery: 'Too many options, most of them fantasies: the dream house, the great job, the perfect partner. You daydream and never call. Pick one and test it. The cost is dropping the others.' },
    { upright: ['you leave what no longer fits', 'you walk away quietly', 'you look for something real'], reversed: ['you stay although you are miserable', 'you leave without a word and wonder why', 'you run each time it gets real'], imagery: 'You walk away from something that looks fine on paper because it is empty: a job, a relationship. You leave at dawn without a speech. The cost is what you invested in it.' },
    { upright: ['you got what you wanted', 'you enjoy it without guilt', 'you are comfortable'], reversed: ['you have it all and feel flat', 'you show off to feel it', 'you buy things to fill a gap'], imagery: 'You get what you wished for and it is good, and you\'re allowed to enjoy it. Treat yourself and don\'t apologize. The cost is finding out it wasn\'t the only thing you wanted.' },
    { upright: ['a happy home', 'family at the table', 'you are content with what you built'], reversed: ['the family photo hides a fight', 'you keep up appearances', 'one person carries the whole home'], imagery: 'A full home: family around the table, kids in the yard, a partner coming through the door. It is quiet satisfaction. Keeping it takes ordinary daily effort.' },
  ],
  Swords: [
    { upright: ['you see it clearly', 'you say the true thing', 'a decision becomes obvious'], reversed: ['you use the truth to hurt', 'you mistake bluntness for honesty', 'you muddy it so you do not have to decide'], imagery: 'You see the situation plainly for the first time, and it is a relief and a cut at once: an honest sentence, a diagnosis, a decision. The cost is that you can\'t unknow it.' },
    { upright: ['you refuse to decide', 'you shut out the facts', 'you keep the peace by doing nothing'], reversed: ['you flip back and forth for weeks', 'you drown in advice', 'you decide just because you are sick of deciding'], imagery: 'You refuse to choose between two offers, two people, a hard conversation. Your arms are crossed and your eyes are shut. The cost is that the decision gets made without you.' },
    { upright: ['a heartbreak you can name', 'a painful truth comes out', 'you cry'], reversed: ['you keep the wound open by retelling it', 'you forgive too fast and get hurt again', 'you numb it'], imagery: 'A heartbreak you can point to: the betrayal, the diagnosis, the text. It hurts and it is real, so don\'t dress it up. The cost is a few weeks of aching.' },
    { upright: ['you rest', 'you take a break', 'you go quiet to recover'], reversed: ['you push on and burn out', 'you rest and then panic about it', 'you hide in bed'], imagery: 'You need to stop: sleep, a leave of absence, a quiet week. Your body has been telling you for a month. The cost is that others have to manage without you.' },
    { upright: ['you win and it costs you', 'you humiliate someone', 'a hollow victory'], reversed: ['you let it go and keep the bitterness', 'you apologize to end it, not to mean it', 'you pick a fight to feel in control'], imagery: 'You win the argument and lose the person. You pushed until the other one gave up, and now you\'re alone with being right.' },
    { upright: ['you move away from trouble', 'a slow, quiet escape', 'calmer water ahead'], reversed: ['you cannot leave', 'you take the problem with you', 'you run but the thing follows'], imagery: 'You\'re leaving a bad stretch for calmer water, carrying your baggage. It is slow and sad. The cost is that the baggage comes with you.' },
    { upright: ['you act alone and in secret', 'you take a shortcut', 'you slip away with the goods'], reversed: ['you confess before you are found out', 'you get caught', 'your secret stops being worth keeping'], imagery: 'You\'re doing something on the side, taking a shortcut, keeping a secret, and you think nobody will notice. Something gets left behind. The cost is being found out, or the strain of hiding it.' },
    { upright: ['you feel boxed in', 'you tell yourself you cannot', 'you wait for rescue'], reversed: ['you see the gap in the fence and stay put', 'you blame everyone and still do not move', 'you step out and bring the same thinking with you'], imagery: 'You feel trapped and nothing physically stops you. The restrictions are your own thoughts: I can\'t, they won\'t let me. The cost is another year inside it.' },
    { upright: ['you cannot sleep', 'you replay mistakes', 'the worry is worse than the thing'], reversed: ['you tell nobody', 'you stay up scrolling to avoid it', 'you treat anxiety as a plan'], imagery: 'It is 3 a.m. and your mind is replaying every mistake. Most of what you worry about hasn\'t happened. Write it down and tell somebody. The cost is your sleep.' },
    { upright: ['the worst has happened', 'you hit bottom', 'something ends badly'], reversed: ['you keep dramatizing it', 'you refuse to get up', 'you retell the betrayal until it becomes your whole story'], imagery: 'It is over and it hurt. The worst has happened and you are flat on the floor with nowhere lower to fall. You may exaggerate it, but that chapter is closed.' },
  ],
  Pentacles: [
    { upright: ['an offer with real money behind it', 'a chance to build', 'a good deal'], reversed: ['you miss the offer by dithering', 'you say yes to a bad deal', 'you spend it before you have it'], imagery: 'A real offer arrives: a job, a deal, a house, a loan. Check the numbers and say yes if they hold up. The cost is that it is a commitment.' },
    { upright: ['you juggle two things', 'you adjust week to week', 'you keep it all in the air'], reversed: ['you take on one thing too many', 'you lose track of the bills', 'you drop the important one'], imagery: 'You are juggling money and time, two jobs, two bills. You can keep it up for now. If one drops, the other follows.' },
    { upright: ['you work with people who know more', 'your skill is recognized', 'you build something together'], reversed: ['you coast and call it good enough', 'you work alone and resent the team', 'you ignore the feedback'], imagery: 'You do skilled work with other people watching: the apprenticeship, the team project, the review. Listen to the feedback. The cost is your ego.' },
    { upright: ['you hold on to what you have', 'you save', 'you protect your position'], reversed: ['you hoard', 'you spend to feel safe', 'you control people with your money'], imagery: 'You hold on to money, a role, a person. You\'re safe and nothing gets in or out. The cost is that you can\'t relax and nobody gets close.' },
    { upright: ['you are short on money', 'you feel left out', 'you ignore the help in front of you'], reversed: ['you are out of the worst and cannot relax', 'you take help and resent it', 'you blame yourself for what was circumstance'], imagery: 'You\'re short on money or health and you walk right past the help being offered because of pride. A door is open. The cost is more months in the cold.' },
    { upright: ['you give and receive', 'you pay a debt', 'someone helps you'], reversed: ['you lend to people who will not repay', 'you keep score', 'you give to feel superior'], imagery: 'Money moves between people: you lend, tip, pay a debt, take a loan. It is fair when it is equal. The cost is the strings attached.' },
    { upright: ['you wait for what you planted', 'you assess your progress', 'you stay with a long project'], reversed: ['you dig it up to check', 'you quit just before harvest', 'you keep watering something that will not grow'], imagery: 'You planted months ago and nothing visible has happened. Checking every day won\'t help. The cost is patience, and maybe a field you chose badly.' },
    { upright: ['you practice the craft', 'you do boring work well', 'you improve slowly'], reversed: ['you fuss over details forever', 'you hate the work and keep going', 'you copy instead of improving'], imagery: 'You get good by repetition: the same task a hundred times. It is boring and it works. The cost is your social life and the risk of perfecting something nobody needs.' },
    { upright: ['you earned your comfort', 'you enjoy being alone', 'you are independent'], reversed: ['you flaunt it', 'you are lonely in a nice house', 'you rely on a partner\'s money'], imagery: 'You have your own money, your own garden, your own time, all built by yourself. You like your own company. The cost is that you may not need anyone, which people notice.' },
    { upright: ['family money or a family business', 'something that outlasts you', 'a stable home'], reversed: ['an inheritance fight', 'you spend what the family built', 'family pressure to stay'], imagery: 'Wealth over decades: a family business, an inheritance, a house that stays. The money is attached to the people. The cost is the family\'s expectations and the arguments about the will.' },
  ],
};

const COURT_KEYWORDS: Record<string, { upright: string[]; reversed: string[]; imagery: string }[]> = {
  Wands: [
    { upright: ['a beginner who is lit up', 'you hear an exciting proposal', 'you try something new'], reversed: ['you start ten things and finish none', 'you promise more than you deliver', 'you boast about your plans'], imagery: 'You\'re a beginner who is fired up: a new hobby, a new idea, a message from someone with a proposal. You have more enthusiasm than skill. The cost is that you quit at the first hard part.' },
    { upright: ['you act fast', 'you chase the thrill', 'you say yes and go'], reversed: ['you ride off mid-argument', 'you burn out in a month', 'you leave a mess behind'], imagery: 'You charge in: you quit, you move, you say yes. It is fast and exciting and sloppy. The cost is the people you ran past.' },
    { upright: ['you are confident and warm', 'you draw people in', 'you know what you want'], reversed: ['you get jealous', 'you punish people who outshine you', 'you demand attention'], imagery: 'You are warm and sure of yourself, and people want to stand near you. You run the room without trying. The cost is that you get jealous or sharp when challenged.' },
    { upright: ['you lead and let others do their job', 'you make the call', 'you inspire people'], reversed: ['you steamroll people', 'you promise big and push others to deliver', 'you sulk when overruled'], imagery: 'You lead by setting a direction and trusting people. You see the whole project and make the call. The cost is impatience with slower people.' },
  ],
  Cups: [
    { upright: ['a gentle message', 'you daydream', 'a creative idea shows up'], reversed: ['you hide in fantasy', 'you cry easily and blame others', 'you will not grow up about it'], imagery: 'A message arrives about feelings: a surprising invitation, a creative idea, a shy admission. You\'re soft and young about it. The cost is showing it.' },
    { upright: ['you romance someone', 'you offer your heart', 'you bring the gesture'], reversed: ['you promise love you cannot keep', 'you sulk', 'you fall for the idea of someone'], imagery: 'You offer yourself romantically: the flowers, the long text, the proposal. You mean it. The cost is that you sometimes follow the feeling more than the facts.' },
    { upright: ['you are the one people confide in', 'you sense moods', 'you care without fuss'], reversed: ['you absorb everyone\'s troubles', 'you manipulate with tears', 'you lose yourself in someone else\'s needs'], imagery: 'You feel what others feel, and they come to you to cry. You hold it well. The cost is that you take on their pain and forget your own.' },
    { upright: ['you stay calm in a crisis', 'you give wise counsel', 'you are kind and steady'], reversed: ['you go cold when hurt', 'you hide behind being fine', 'you use calm to control'], imagery: 'You stay calm in an emotional storm, and others rely on that. You\'re kind and you don\'t show it all. The cost is bottling feelings up.' },
  ],
  Swords: [
    { upright: ['you ask sharp questions', 'you learn fast', 'you speak your mind'], reversed: ['you gossip', 'you cut people with a clever line', 'you dig for information you do not need'], imagery: 'You ask sharp questions and want facts. You\'re curious and quick to talk. The cost is saying things you can\'t take back.' },
    { upright: ['you go straight at the problem', 'you argue to win', 'you think fast'], reversed: ['you bulldoze', 'you talk over everyone', 'you charge in and wreck what you wanted'], imagery: 'You push an argument or a project hard and fast without checking who is in the way. The cost is collateral damage.' },
    { upright: ['you see through excuses', 'you say the plain thing', 'you protect yourself'], reversed: ['you cut people off', 'you turn bitter', 'you use sharpness as armor'], imagery: 'You see through excuses and say so. You\'ve been hurt and you won\'t be fooled twice. People trust your honesty. The cost is cold edges.' },
    { upright: ['you decide on facts', 'you hold a standard', 'you give hard feedback'], reversed: ['you abuse your authority', 'you punish mistakes', 'you rule by fear'], imagery: 'You judge on facts and hold people to standards, and they know where they stand. The cost is little warmth.' },
  ],
  Pentacles: [
    { upright: ['you start learning a trade', 'you set a savings goal', 'you study carefully'], reversed: ['you daydream about money but do not work', 'you skip the basics', 'you give up when it is slow'], imagery: 'You start learning a skill or saving for something. You take it seriously and work step by step. The cost is slow progress.' },
    { upright: ['you work steadily', 'you finish what you start', 'you keep your word'], reversed: ['you get stuck in a rut', 'you avoid anything new', 'you bore yourself'], imagery: 'You do the same job at the same pace every day, and it gets done. It is not exciting and it is reliable. The cost is being stuck in routine.' },
    { upright: ['you run a warm, practical home', 'you look after money and people', 'you make things comfortable'], reversed: ['you neglect yourself', 'you smother with help', 'you worry about money all the time'], imagery: 'You make a home or a business comfortable and well fed. You look after money and people. The cost is that you give a lot and may not be thanked.' },
    { upright: ['you built something solid', 'you are generous with it', 'you are steady with money'], reversed: ['you measure people by money', 'you hoard', 'you bribe with gifts'], imagery: 'You built the business, the house, the savings, and it is solid. You\'re generous from a position of strength. The cost is that work was your whole life.' },
  ],
};

function buildFullDeck(): TarotCardDef[] {
  const deck: TarotCardDef[] = [...MAJOR_ARCANA];
  for (const suit of SUITS) {
    for (let n = 1; n <= 10; n++) {
      const kw = SUIT_KEYWORDS[suit][n - 1];
      deck.push({
        name: `${n === 1 ? 'Ace' : n} of ${suit}`,
        arcana: 'minor',
        number: n,
        suit,
        keywords_upright: kw.upright,
        keywords_reversed: kw.reversed,
        imagery: kw.imagery,
      });
    }
    for (let c = 0; c < COURT.length; c++) {
      const kw = COURT_KEYWORDS[suit][c];
      deck.push({
        name: `${COURT[c]} of ${suit}`,
        arcana: 'minor',
        number: 11 + c,
        suit,
        keywords_upright: kw.upright,
        keywords_reversed: kw.reversed,
        imagery: kw.imagery,
      });
    }
  }
  return deck;
}

const FULL_DECK = buildFullDeck();

export interface DrawnCard {
  name: string;
  position: string;
  reversed: boolean;
  arcana: string;
  number: number;
  suit?: string;
  keywords: string[];
  imagery?: string;
}

export function drawCards(spreadType: string, positionLabels: string[]): DrawnCard[] {
  const count = positionLabels.length;
  const shuffled = [...FULL_DECK].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, count);

  return selected.map((card, i) => {
    const reversed = Math.random() < 0.3;
    return {
      name: card.name,
      position: positionLabels[i] || `Card ${i + 1}`,
      reversed,
      arcana: card.arcana,
      number: card.number,
      suit: card.suit,
      keywords: reversed ? card.keywords_reversed : card.keywords_upright,
      imagery: card.imagery,
    };
  });
}

/**
 * Look one specific card up by name instead of shuffling for it.
 * Used when the card is chosen deliberately — e.g. the feed's chart-driven
 * tarot pull, where the planet/sign attribution picks the card.
 * Returns null for an unknown name so callers can degrade gracefully.
 */
export function getTarotCardByName(name: string, reversed = false, position = ''): DrawnCard | null {
  if (!name) return null;
  const card = FULL_DECK.find((c) => c.name.toLowerCase() === name.toLowerCase());
  if (!card) return null;
  return {
    name: card.name,
    position: position || card.name,
    reversed,
    arcana: card.arcana,
    number: card.number,
    suit: card.suit,
    keywords: reversed ? card.keywords_reversed : card.keywords_upright,
    imagery: card.imagery,
  };
}
