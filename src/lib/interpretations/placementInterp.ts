// Quick placement interpretations — what each planet means in astrology,
// and what it means in each sign and house for the person
//
// The composed reading (getPlacementInterpretation) speaks directly to the
// person: a short planet lead, a fused sign×house portrait, then the hidden
// sub-sign layers (duad/compendium/matrix — never named in user-facing text).

import { SIGN_HOUSE_FUSION } from './signHouseFusion';
import {
  DUAD_TEXTURE, DUAD_PURE, COMPENDIUM_STYLE, MATRIX_SIGNATURE, PLANET_LEADS,
  TRANSIT_UNDERCURRENT,
} from './hiddenLayers';
import { calculateDuad, calculateCompendium, calculateMatrix, getFullDuadCompendium } from '@/lib/engines/duadCompendium';
import { EXTRA_PAIR_INSIGHTS } from './aspectPairInsightsExtra';

export const PLANET_MEANINGS: Record<string, string> = {
  Sun: 'You drift when you spend too long being useful, agreeable or impressive, and you come back to yourself the moment you do something only you would do. The tiredness of playing a role is your Sun asking for its turn. Everything else in your life takes direction from the days you stop performing and act like yourself.',

  Moon: 'You cry in the car, not in the meeting. At 2am you reach for the same comfort you reached for at nine years old, a blanket, a snack, a particular song, and you tell nobody. Tired or scared, you slide back into childhood rules about what keeps you safe, and the people who really know you can see the slide before you admit it.',

  Mercury: 'You rehearse arguments in the shower and win them, then lose the real one because the best line arrived an hour late. You redraft a text four times, learn fastest by explaining things out loud, and make yourself laugh with jokes only the right person catches. Whatever happens to you, your first move is to turn it into a sentence.',

  Venus: 'You keep choosing the same kind of person and calling it chemistry. What you accept in love, what you buy to feel looked after, and which compliments actually land all follow one quiet belief about what you deserve. When someone meets that belief, love feels easy. When they fall short of it, you settle and explain it away.',

  Mars: 'You go quiet before you go off. Someone takes credit or says the wrong thing, and your jaw tightens a full second before your mouth does anything. You chase what you want in straight lines and win more fights than you pick, and you learn late that the drive that starts things also ends them when your temper gets there first.',

  Jupiter: 'Things work out for you in one area more than they should. You say yes to the invitation, the trip, the odd opportunity, and it pays off in ways you could not have planned. You stay hopeful when the numbers say otherwise, and the cost is overcommitting, because luck has taught you that someone will catch you.',

  Saturn: 'You put in the extra hour nobody saw, and you pay for every shortcut you tried. In this area you started late or got told no, so you learned to do it properly, slowly, alone. People lean on you here before you feel ready, and the respect you finally earn arrives years after the pressure did.',

  Uranus: 'You take the exit everyone called crazy and find out later you were early. Being asked to follow a rule makes you want to break it, and you cannot fake interest in a life built to someone else\'s plan. Your changes arrive suddenly: a quit, a move, a cut-off, a decision at 3am. Everyone else calls it random, and you know it was building for years.',

  Neptune: 'You believe the version of someone you imagined, then wonder how you missed what was plain. Music undoes you in the supermarket, and a film can stay with you for three days. You lend too much, drift off in the middle of real conversations and say yes before you have checked what you are agreeing to. When you protect your quiet time, you pick up things nobody told you.',

  Pluto: 'You do not do anything halfway. At least once something collapsed completely, a relationship, a job, a version of you, and you rebuilt in private without telling anyone. Small talk drains you, power games show up to you from across the room, and you either run a situation completely or leave it for good.',

  'North Node': 'You feel a small dread right before the thing that is good for you: the call, the move, the class where you will be a beginner. Every time you do it anyway, something inside you settles. The pull never leaves, and it only gets louder the longer you stay where it is comfortable.',

  'South Node': 'You are good at something you never studied, and you reach for it every time life gets hard. Habits, roles and people that feel like home keep pulling you back, even after you have outgrown them. It is easy and it works, which is exactly why you stay there too long.',

  Chiron: 'The thing that hurt you most is the thing you now handle best for other people. You find yourself at a friend\'s kitchen table in the middle of their crisis, saying what nobody said to you. The sore spot never fully closes, and some days it flares without warning. What you learned by living it is why people bring you their worst.',

  Juno: 'You can forgive a lot in a partner, but there is one thing you will not: disrespect, a lie, being second. You hold that line without announcing it, and you leave quietly the day it is crossed. What you need to feel honoured in a commitment is smaller and more specific than your fantasies, and a lot more stubborn.',

  Vesta: 'You guard one thing with your time: a craft, a routine, a belief, a quiet hour. You cancel plans for it and you do not apologise. Other people call it obsession or avoidance. To you it is the one place the noise cannot reach, and it asks for comfort and sometimes company in exchange for a sense that your days mean something.',

  Eros: 'You do not decide who you are drawn to. Your body does, usually inside a minute of meeting, and the wanting rearranges your week, your judgement and sometimes your plans. What switches it on is a specific flavour of intensity, and you recognise it in seconds. When it is hot you stop being sensible. When it is gone you wonder who that was.',

  Psyche: 'Being hurt taught you to read people\'s insides. You notice the pause before someone says fine, the tremor in a laugh, the thing they almost said. People tell you what they have told nobody else. The cost is carrying it all home, feeling their mood as your own, and never quite believing anyone could read you back.',

  Lilith: 'You were told to be smaller, quieter and more pleasant, and you complied until it started to feel like lying. Now the part that got edited out comes back as a blunt remark, an appetite you do not apologise for, a no that lands in the room. Shame and rage live close together here. When you stop asking permission, you take up exactly the space you needed all along.',

  'Part of Fortune': 'You do your best work, and enjoy it most, in one particular kind of situation, and money or recognition shows up there without much chasing. It happens when what you naturally do and what you get paid or praised for finally line up. When you skip it for something that sounds more serious, everything gets heavier.',

  Vertex: 'People turn up in your life at odd moments and it feels scripted: the stranger on the train, the friend of a friend, the job that came from a wrong turn. You remember the day because it felt charged and inevitable. These meetings change where your life goes next, and you rarely see one coming.',

  Ceres: 'You feed people. You cook, check in, quietly pay, remember who needs what, and you do it before anyone asks. You also ache to be looked after and rarely say so. Loss lands hard here: something you grew, a child who left home, a project that closed. You grieve it in seasons, and letting go costs you more than you admit.',

  Pallas: 'You see the pattern in the meeting before anyone says it: who is bluffing, which plan will fail, where the gap is. You solve things by thinking three moves ahead, and one well-placed question from you changes the outcome. People call it cleverness. It is closer to refusing to be fooled.',

  'Part of Spirit': 'You make one choice on purpose that costs you comfort, because the alternative feels like drifting. A project that matters, a practice, a promise you keep with nobody watching. The world may never reward it and you do it anyway. That deliberate aim is what you pray in, whether or not you call it prayer.',

  Amor: 'You love on conditions you never say out loud: be consistent, don\'t need too much, don\'t leave. Then you wonder why love feels like a negotiation you keep losing. The relationships that work are the ones where you drop the terms and stay anyway. That is when you find out how much of your wanting was just holding on tight.',

  Valentine: 'You send the long letter nobody asked for, drive two hours with soup, and keep showing up for someone who has stopped counting what you do. You love without a ledger, and then one day you notice the other side of the page is blank. The gift is a tenderness people remember for decades. The cost is giving it to anyone who looks hurt enough, before checking they can hold it.',

  Union: 'Three weeks in, you have merged calendars, friends and sleep schedules, and you could not say where your own preferences went. You want the kind of closeness where nobody keeps a private room, and when it arrives it feels like coming home. When it fails you lose more than a partner, because you had stopped being separate from them. Keep one thing that is only yours, a walk, a friend, a hobby, and the merging stays a choice.',

  Karma: 'You keep landing in the same kind of situation with different faces, and the bill always comes in the same currency. A friend repays a favour you forgot you did, or a partner hands you back something you once did to someone else. The repetitions stop the day you finish what they keep pointing at.',

  Pholus: 'You make a small decision, a yes, an email, a remark at dinner, and a year later it has rearranged three lives. You rarely see the chain coming and it does not stop when you ask it to. Some of what spirals started generations before you. What counts is what you do on the day it lands.',

  Nessus: 'You hear your own raised voice and recognise whose kitchen it came from, or you go cold mid-argument the way a parent once did. Someone crossed a line with you long before you could object, and a version of that line lives in how you act when you are cornered. Saying it out loud, to the person it hurt or to someone safe, is the only thing that interrupts it. The next time the old reflex rises and you do something different, the cycle has genuinely stopped with you.',

  Chariklo: 'A friend falls apart on your sofa and you do not fix anything. You make tea, sit on the floor, and let the silence run as long as it needs. People tell you things they cannot say elsewhere because you do not flinch. The cost is becoming the permanent audience for everyone else\'s worst hours while nobody asks how your evening went.',

  Urania: 'You notice the date on the receipt, the song that played twice, the three strangers who all mentioned the same city this week, and you write it down. Charts, numerology and strange coincidences hold your attention for hours when small talk cannot. You tend to find the pattern before you can prove it. The cost is the friend who stops answering when you explain how it all connects, so give the conclusion first and the working second.',

  DNA: 'You wear your family in your body. A gesture, a flare of temper, a health pattern or a talent shows up and you realise whose it was first. Some of it you took gladly and some of it you would hand back tomorrow. Knowing which is which is half the work of not repeating it.',

  Child: 'You get a loud, delighted idea at 11pm and start building a blanket fort, a song or a trip, with no purpose beyond the fun of it. You also sulk like you are seven when plans change, or go quiet when someone raises their voice, and you cannot always say why. Both come from the same age in you. When you give that kid real play and a real hearing, the sulking shrinks.',

  Fortuna: 'Your circumstances turn without warning: a windfall, a layoff, a stranger who changes your whole year. You have learned not to build everything on one position, because the ground moves. Nothing here stays put, and the people who do best ride the turn instead of clutching the spot they were just on.',

  Hygiea: 'Your body sends a polite warning, a tight jaw, a bad sleep week, a rash that comes and goes, and you answer it with coffee and carry on. The warnings get louder until you listen. You feel better on a boring routine of sleep, food and movement than on any dramatic cleanse, and you already know it. Listening to the first warning costs far less than waiting for the loud one.',

  Astraea: 'You stay when other people would have gone, because you believe fairness arrives if you hold on one more month. Sometimes it does. More often you are defending a case nobody is judging anymore, and the loyalty that makes you good also keeps you in rooms that stopped paying you back. Walking away is the hardest act of justice you will ever do.',

  Hecate: 'You know before you can say how you know. A bad feeling about a person, a dream that comes true by Thursday, a choice between three doors where logic has nothing to add. Your best calls come when you stop arguing with the first feeling. Your worst come when you override it and later say you knew all along.',

  Nemesis: 'You undo your own work just as it starts to hold. The late reply, the argument you start the week before launch, the habit everyone around you saw coming. It feels like bad luck every time, and it is the same pattern every time. It ends when you can name it out loud before you do it.',

  Nike: 'You win when you refuse to quit, not when you are best prepared. You get knocked down, stand up, and treat standing up as the point. The finishes you remember are the ones that cost you most, which is exactly why they taste the way they do.',

  Isis: 'When something breaks, a family, a friendship, a version of yourself, you gather the pieces and start putting them back. You do it tirelessly and mostly alone, sometimes for people who never asked. Siblings and broken households end up on your doorstep for repair. You rebuild instead of grieving, and you need to let someone hold the other end.',

  Osiris: 'You have been taken apart at least once, by a loss, a person or your own change, and put back together sturdier. Part of you dreads the next ending. Part of you remembers you survived the last one, and the one before that. What comes back is never the old you, and you stop expecting it to be.',

  Horus: 'You go after what was taken from you: your name, your inheritance, your place at the table. People who thought it was settled find you still filing, still standing there. You see through the story told about you and refuse to wear it. You carry light into rooms that wanted you quiet, and you win slowly.',

  Apollo: 'You keep hitting the same wall in a different outfit: the same boss, the same kind of partner, the same money crisis. Each time you get up a little wiser and a little more stubborn. It repeats until you take out of it what it keeps trying to hand you. The breakthrough is earned on the tenth try, not the first.',

  Sappho: 'You find your people through a language nobody else in the room can hear: the friend who finishes your sentence, the creative partner you never have to explain a draft to. These bonds run deep without needing to be romantic. You see each other at full range and stay. When one of them goes, the loss is quiet and enormous.',

  Eris: 'You say the thing at the table that everyone agreed not to say. The room goes cold, you get called difficult, and a week later the rest of them admit you were right. You don\'t do it for fun. You do it because the unspoken thing was breaking something and you couldn\'t sit across from it.',

  Sedna: 'At some point you were left to cope alone by someone who should have stayed. You built a self that needs nothing from anyone, and it is strong. The price is that you rarely let anyone close enough to see you wanting something. Your relief comes the first time you ask for a hand and survive the asking.',

  Haumea: 'Things end and something new starts before you have finished mourning. A project dies, a relationship closes, and within a month you are building, birthing or planting again. People call you resilient. Mostly you feel like you never get a pause, and you make, lose and make again at a pace that exhausts the people watching.',

  Makemake: 'You make a meal from three ingredients, a business with no budget, a home from a bare room. You are most capable when resources run thin, and you waste almost nothing. You also keep a quiet ledger of what you take and what you give back. Luxury makes you restless.',

  Narcissus: 'You check how you came across: the photo, the message, the room\'s reaction. The attention you give your own image costs you the people you are trying to reach. From outside it looks like confidence and from inside it feels like a wound. It starts to heal when you look away from the reflection and at the person in front of you.',

  Echo: 'You repeat other people\'s opinions, borrow their tastes and fade into their plans. A year into a relationship you cannot say what you want for dinner. You loved someone so completely that you disappeared into their story. Recovery starts the first time you say something that belongs only to you and nobody echoes it back.',

  Pandora: 'You opened what you were told to leave closed: the email, the question, the door. What came out spread further than you meant, and years later you still wince. But hope stayed behind in the jar. In your life, the worst mistake is often where the recovery began.',

  Icarus: 'You go higher than anyone advised: the bigger bet, the faster car, the pitch above your pay grade. For a while it works and it feels like flying. Then the fall arrives, as it was always going to. You refuse to live small, and the height and the drop are measured on the same scale.',

  Daedalus: 'You build the clever thing, the system, the workaround, the elegant plan, and it works so well you never ask what it will lock in. Your solutions free some people and trap others, and the trapped are often the ones you love. Before you hand over the next design, check who else has to live inside it.',

  Orpheus: 'You make something that moves people: a song, a speech, a performance that stops a room. At the crucial moment you doubt that what you love is still behind you, and you turn to check. One look can ruin the piece. The art survives, and whether you do depends on trusting before you can see.',

  Eurydike: 'You were nearly rescued. The relationship almost worked, the healing almost held, the second chance was in your hands. Then someone looked back, or lost nerve one heartbeat early, and it slipped. You still replay that moment. The work is to stop waiting for the do-over and let the near miss be finished.',

  Persephone: 'You were pulled somewhere dark before you were ready, and you came back different. You grew up faster than your friends and know things about loss and power you can\'t explain at parties. The one who went in did not return. The one who came back walks into hard rooms without asking permission.',

  Proserpina: 'Change was done to you: a move, a diagnosis, a breakup, a family decision you had no vote in. The person who came out the other side barely recognised the one who went in. It wasn\'t gentle and you didn\'t choose it. Your power starts when you stop mourning the old version and decide what to do with the new one.',

  'Toulouse-Lautrec': 'Your body set a limit and your talent went around it. You were marked out early as different, stopped competing on the terms everyone else used, and built something nobody else could have made, from a vantage point only you had. You see the people polite society looks past, and you render them without pity or flattery. The shadow is using the wound as a reason to stay up all night among people who never ask you to be well.',

  Steinmetz: 'You are underestimated on sight, too small, too young, too odd, and you settle it by being unmistakably the most capable person in the room. You do not argue with the assumption. You wait, then produce work that makes it embarrassing. The trap is needing the underestimation to perform at all, and quietly picking rooms where you will be doubted.',

  Hephaistos: 'Injury, disability or exclusion pushed you into making things, and what you make is so good that the people who excluded you end up dependent on it. You build the tools everyone else uses to win. The shadow is staying in the workshop, arming the people who get the glory, and calling it dignity.',

  Kant: 'You build an enormous structure from a very small life. Routine, restraint and relentless thinking produce something far larger than your circumstances: a system, a method, a body of principle others work inside for decades. You never needed to travel to get there. The cost is rigidity: you defend the framework long after reality has moved, and you mistake your discipline for a moral standard everyone should meet.',

  Picasso: 'You make far more than anyone asked for, reinvent your own style the moment you master it, and dominate a field by sheer volume and nerve rather than by height, polish or permission. You take what you want, from influences, from people, and make it unmistakably yours. The shadow is the wreckage: the people used as material, and the reinvention that is really an escape.',

  Voltaire: 'You fight with wit instead of force. You are outmatched physically and you win anyway, in print, in public, in one sentence people repeat for years. You take up unpopular causes and cannot leave an injustice alone. The trap is that the same tongue that fights tyranny also wounds allies, and exile, professional or personal, keeps finding you.',

  Ganymed: 'You get picked out of the crowd for how you look and carry yourself. Doors open before you have said anything: your height, your face, your bearing does the first half of the work, and you quietly resent that it does. The gift is access most people never get. The cost is never being sure whether you were chosen for what you can do or for how you look doing it, and the way out is becoming good enough that the answer stops mattering.',

  Artemis: 'You know exactly what you are hunting, you go after it alone, and you hit it. You will burn down any arrangement that tries to domesticate you first. You protect whoever cannot protect themselves, especially the young, and you are colder than people expect toward anyone who threatens them. The trap is mistaking every close bond for a cage. Some of them are just company.',

  Adonis: 'You are desired: looked at, pursued, competed over. Being wanted has quietly replaced being known. You learned early that your appearance opens rooms, and you have been paying the entry fee ever since. The shadow is a life built on being chosen rather than choosing. The gift arrives the day you use the attention to say something that costs you.',

  Phaethon: 'You demand the reins before you are ready. You take on something far bigger than your experience to prove you have the right to it, and the crash, when it comes, is spectacular and public. You are not reckless because you are stupid. You are reckless because a doubt about who you are got attached to this one thing, and the power comes from taking the same ambition and serving your apprenticeship first.',

  Diana: 'You feel boxed in by a standing weekly plan before it has started. You need a day a week, a long walk, a trail, an hour alone in the car, and you get sharp with anyone who treats that as rejection. You step in fast for animals, kids and anyone being pushed around. The cost is a partner who learns not to ask for more, and a distance you never meant to build.',

  Minerva: 'In the meeting you are already two moves ahead, quietly noting who will block the plan and what they want. You hold your answer until the moment it lands hardest, which people read as good timing or as coldness. You win by preparing in private. Share the plan earlier with someone you trust, because strategy kept alone makes your victories lonely.',

  Bacchus: 'You lose yourself in pleasure: the wine, the music, the creative frenzy, the late night where the rules stop applying and something primal takes over. For a few hours it frees you from control. The only question is whether you can find your way back by morning, or whether you even want to.',

  Circe: 'People come to your house sad and leave lighter, or arrive cocky and leave quieter, and you hardly said anything. Your kitchen, garden or studio does something to guests. You can heal someone by feeding them and corner someone by seeing through them. Notice which one you are doing before they do.',

  Medea: 'You gave everything, family, home, name, for someone who then discarded you. The rage that followed isn\'t simple anger. It is the fury of someone who knows exactly what they were worth and refuses to be thrown away quietly. Don\'t ask anyone for their everything unless you intend to honor it.',

  Kassandra: 'You see the disaster coming, the lie being told, the pattern repeating, and no one listens. You speak and they dismiss you. You warn and they laugh. The curse isn\'t being wrong. It is being right every time and watching people walk into the fire you told them was there, and your vindication always comes too late.',

  Achilles: 'You are the capable one, so nobody checks on your one soft spot, and you hide it so well that you forget it yourself. It sits under a particular kind of criticism, a particular family subject, a particular failure. When it gets hit you overreact or go still. Tell one person where it is and the armour stops doing all the work.',

  Sphinx: 'The same question shows up in a new outfit: a job offer, a partner, a family decision that feels like a trap with no right answer. You stall on the threshold and nothing moves until you say the answer out loud. It is usually simpler than the version you have been arguing with at night. Saying it costs you something, which is why you delay.',

  Atlantis: 'You build something remarkable, a system, a business, a reputation, and cannot stop improving it until it is too big to hold. The skill that got you here starts taking over: clever shortcuts, tighter control, tinkering past the point of use. The collapse starts where you stopped checking the foundations. Do the dull maintenance on the thing you are proudest of before it demands it.',

  Tantalus: 'The raise, the reply, the commitment sits one step out of reach, and each time you stretch it moves. You keep wanting what you cannot quite have, and the wanting becomes its own hobby. After years of it you can feel when you are chasing from habit instead of hunger. Ask what you would do the day after you got it, and sometimes the answer tells you to stop reaching.',

  Sisyphus: 'Monday you start the same task you finished on Friday: the inbox, the laundry, the argument about whose turn it is. Nobody sees how much of your life is upkeep, and you keep doing it because stopping would cost more than continuing. The relief comes when you pick one repeated job and turn it into a ritual instead of a punishment. Put on music, do it your way, and the same push stops feeling like a sentence.',

  Damocles: 'You get the promotion, the house or the audience, and you sleep worse. A small voice checks the exits at every party and rereads the contract twice. The more you have, the more you notice how quickly it could go, and that watchfulness keeps you sharp and tired at once. You enjoy things most on the nights you eat dinner while the worry waits in the hall.',

  Lucifer: 'You spot the flaw in the plan and say it first, and you are usually right. You light up a room with one sharp insight, and then you start to enjoy being the only one who sees it. Praise makes you restless to do better. The slide starts when you stop asking anyone else what they see, and your clarity goes stale in the silence.',

  Magdalena: 'You are the person who stayed at the hospital, the funeral, the bad party everyone else had left. Someone once reduced you to a label, and your steady presence outlasted the label. Your loyalty runs on showing up in person, not on being praised or being perfect. The cost is staying around people who never say thank you, so tell them what you need, once, plainly.',

  Cupido: 'You meet someone at a wedding or a hardware store and by Thursday you have rearranged your plans around them. The attraction ignores your list of what you want, and your body decides first. It is thrilling and it makes you a poor judge for about six weeks. Take the long weekend before you sign the lease, and you keep the thrill without the bill.',

  Destinn: 'You swerve toward the exit, change the city, change the job, and find the same lesson waiting at the new address. Some pulls in your life feel decided before you arrived: a profession you fell into, a person you could not stay away from. Fighting them wastes years. Going with them on purpose, on your terms, turns them into direction instead of fate.',

  Abundantia: 'Money and help find you in the months you share what you have: you pay for the dinner, introduce two friends, hand over the contact. Gifts come back from sideways, a client, a stranger, a refund. You block it when you grip, hoard or quietly keep score. Accepting a compliment or a favour without deflecting is the practice that opens the supply.',

  Industria: 'You do the next small task while other people wait for inspiration. Fifteen minutes a day for two years beats the weekend sprint, and you have the finished thing to show for it. You do not need applause to keep going, which is why people forget how much you carry. The risk is a life of output with no days off, so schedule rest the way you schedule deadlines.',

  Heracles: 'You carry what would flatten other people: physical power, stamina, and the stubborn capacity to finish a labour everyone else walked away from. You do not trust anything you did not have to suffer for, so you quietly choose the hardest version of the task and call it standards. You keep adding labours to prove you can, until your body sends the bill. Your real power is not how much you can lift. It is choosing which weight is worth lifting.',

  Atalante: 'You move faster than the room: quicker reflexes, quicker reads, quicker exits. You will not be slowed down or claimed by anyone who has not proved they can keep pace, and you have quietly beaten people who underestimated you. The trap is the golden apple, the shiny distraction rolled into your path at exactly the wrong moment, which costs you races you were already winning. Know which race is yours, and let everything else roll past.',

  Olympia: 'You rise to official competition, the ranking, the final, the event with a name, and perform better under the lights than you ever do in practice. You hold yourself to an elite standard here whether or not anyone asked you to. You start needing a scoreboard to feel that anything counts, and you rank yourself against people who are not even competing with you. Keep one part of this life unmeasured, or you will lose the love that got you here.',

  Marathon: 'You are still moving when everyone who started fast is walking. You pace yourself, manage your energy, and outlast the competition through the long, unglamorous middle. You win by refusing to stop, not by being the most gifted. The same quality keeps you in the job, the injury, or the situation years past the point it made sense, because quitting feels like losing. Know your sustainable pace, and know where your finish line actually is.',

  Spartacus: 'You resist, physically, competitively, and on principle, and being cornered makes you steadier instead of weaker. People who have been pushed around tend to rally behind you. You turn everything into a fight: every coach, boss or partner becomes a master to rebel against, and the war keeps going after it has already been won. Fight for something, not only against something, and you last far longer.',

  Victoria: 'You win, and people see you win. Trophies, titles and public recognition collect around you, and you have a sense for the exact moment that decides a contest. Winning becomes the only result that counts: second place feels like humiliation, and you stop trying anything you are not already good at. Celebrate each victory properly, then put it down. Your record is real evidence, but it is not who you are.',

  Hidalgo: 'Bigger opponents, louder rooms and worse odds make you bolder instead of smaller. You take the risk everyone else priced out, and you often win because nobody expected anyone to try. You end up proving you are not afraid: taking a risk because it was offered rather than because it was smart, and picking a fight with the biggest person in the room on principle. Ask what the risk is for before you take it.',

  Panacea: 'You recover, from injury, from setback, from the season everyone else wrote off, and you often know what actually helps a body heal before the expert does. You chase one magic fix, rush back before you are healed to prove you are fine, or pour everything into someone else\'s recovery while yours waits. There is no single cure. There is rest, rehab and patience, in that order, and your comeback is stronger when you stop trying to make it faster.',

  Fama: 'People talk about you when you are not in the room. Your name travels faster than you do and your achievements turn into stories other people tell. It opens doors, but it is not the same as ability, and part of you knows that. You end up managing the image instead of doing the work that built it, and rumours wound you in ways you never admit. Keep your attention on the craft, not the coverage. A name with substance under it survives a bad headline.',

  Ascendant: 'People form an opinion about you in the first ten seconds and you let them, because your entrance in a room is automatic: you scan, you joke, you go still, or you take charge. You wore that entrance so long it feels like you. Friends are often surprised how different you are once you stop making it. Every other part of your life gets delivered in that style.',

  Descendant: 'You keep meeting the same type: the partner, the business partner, the rival who feels personal. They carry what you never allowed yourself, the boldness, the calm, the polish, the bluntness. You admire it, resent it and fall for it in the same breath. The pattern stops feeling like bad luck the day you start building that quality yourself.',

  MC: 'Strangers describe you in a sentence that is not quite the one you would choose. Your reputation reaches rooms before you do, and it points at the career that fits or the one you keep quietly failing at. What you are known for tends to harden into what you are stuck with. Choosing it on purpose is the work.',

  IC: 'You exhale in only a few places, and everyone close to you has noticed which ones. The home you grew up in still sets the temperature in the home you make: a smell, a silence, a family argument you replay at your own table. Nobody sees this part of you, and everything you build outward rests on what you do with it.',

  'Anti-Vertex': 'You open the door instead of waiting for it. You send the message, take the flight, say the thing, and life answers in a way it never would have if you had stayed put. Some turning points in your life happened because you moved first, and the pattern repeats whenever you do.',
};

export const SIGN_IN_CHART: Record<string, string> = {
  Aries: 'you charge into this part of your life headfirst, all fire and instinct. There\'s no waiting, no second-guessing — you lead with raw courage and deal with the consequences later. This placement makes you a pioneer here, someone who would rather fail spectacularly than play it safe. The energy is fierce, direct, and unapologetically competitive.',

  Taurus: 'you move through this area of life with a patience that others mistake for stubbornness — but you know it\'s devotion. Once you plant yourself here, nothing moves you. This is where you build things that last, where your senses come alive, where beauty and comfort aren\'t luxuries but necessities. Your relationship with this part of your life is physical, grounded, and deeply loyal.',

  Gemini: 'your mind is electric here — always curious, always connecting dots that nobody else even sees. You need variety and stimulation in this area of life, or you wither. Words are your currency, ideas are your oxygen, and you can hold two contradictory truths without blinking. The duality isn\'t a weakness. It\'s your superpower — seeing every angle at once.',

  Cancer: 'you feel this area of life in your bones. Everything here runs through the emotional filter first — logic comes later, if at all. You protect this part of your life fiercely, almost instinctively, the way you\'d protect something fragile and precious. Your memory here is extraordinary, especially for how things made you feel. Home, safety, belonging — these aren\'t just themes. They\'re requirements.',

  Leo: 'you bring warmth, drama, and an unmistakable radiance to this part of your life. You need to shine here — not from ego, but from a deep understanding that your light is genuinely needed. There\'s a generosity in this placement that gives and gives, but there\'s also a hunger to be recognized for what you give. When you\'re appreciated here, you become magnetic. When you\'re overlooked, the light dims.',

  Virgo: 'you approach this area of life with a precision that borders on devotion. You notice what\'s broken and you fix it — quietly, thoroughly, without needing anyone to watch. There\'s a humble mastery here that perfects everything it touches, but the shadow is the inner critic that\'s never quite satisfied. Your gift in this area is seeing what needs to be done and doing it before anyone asks.',

  Libra: 'you navigate this area of life through relationship, seeking balance and beauty in everything. Fairness matters deeply to you here — injustice feels personal and physical. You can see every side of every situation, which makes you a natural diplomat but sometimes paralyzes your ability to choose. Partnership isn\'t just preferred in this area of your life. It\'s how you come alive.',

  Scorpio: 'you experience this area of life at a depth that most people would find overwhelming. Nothing is surface-level here — you need truth, intensity, and the kind of connection that strips away every pretense. Trust is sacred in this placement, and betrayal is the one thing you never fully recover from. You\'d rather burn this part of your life to the ground than live it halfway.',

  Sagittarius: 'you bring an uncontainable hunger for meaning to this area of life. You need freedom here — the freedom to explore, to question, to chase the horizon without anyone telling you to be practical. Faith lives here, wild and restless, always reaching for something bigger. When this part of your life has room to expand, you\'re unstoppable. When it\'s confined, something essential in you starts to suffocate.',

  Capricorn: 'you approach this area of life like a mountain you intend to summit — methodically, patiently, with absolute determination. You\'re willing to do the thankless work that others avoid because you understand that lasting achievement requires sacrifice. There\'s a quiet authority here, an earned wisdom that comes from showing up consistently when everyone else has gone home. Time is your ally.',

  Aquarius: 'you are genuinely, unapologetically different in this area of your life — and the more you try to conform, the more the real you fights to get out. There\'s a visionary quality here, a mind that sees the future before it arrives and refuses to be bound by how things have always been done. Your independence in this placement isn\'t rebellion for its own sake. It\'s integrity.',

  Pisces: 'you feel everything in this area of life — your own emotions, other people\'s emotions, the emotional weather of the entire room. There\'s a porousness here that makes you extraordinarily compassionate but also dangerously absorbent. Your imagination in this placement is boundless, your intuition almost supernatural, and your connection to the unseen world is closer than most people will ever understand.',
};

export const HOUSE_IN_CHART: Record<number, string> = {
  1: "People form their opinion of you in the first ten seconds, and you have spent years either living up to it or correcting it. How you walk into a room, how you start things, how fast you react when startled, what your face does before you decide what it should do: all of it runs through here, which is why you are a worse liar than you think.",

  2: "Money is never just money to you. What you earn, what you refuse to spend on, and what you would go broke for all track how much you believe you are worth, and the people around you can tell. When your income drops your confidence drops with it, and the first time you charge what you should, something in your posture changes.",

  3: "You think out loud, rehearse conversations you will never have, and lie awake rewriting a text you already sent. How you learn, how fast you pick things up, and how you get along with siblings, neighbors and the people you pass every day all run through this wiring. The cost is a mind that never takes a day off.",

  4: "The house you grew up in still has a vote in how you live. The mood at the dinner table, who was allowed to be angry, what nobody ever mentioned: you either rebuild that atmosphere or run from it, and you cannot relax anywhere that does not feel at least a little like it. Almost nobody sees this side of you until they have been inside your actual home.",

  5: "This is where you stop being useful and start being alive: the crush that makes you reckless, the hobby you would do for free, the kids or the creative project you would cancel plans for. You light up here in a way you rarely do at work, and your most you moments have probably come from this part of your life.",

  6: "Your daily routine is the real verdict on your life, and it gets written here: the sleep you skip, the body you ignore until it complains, the coworkers you quietly carry. You are the person who keeps things running, and the cost shows up as burnout when nobody notices the work.",

  7: "You keep meeting the same person wearing different faces, whether partner, business partner or rival. What you tolerate from them, what you lose of yourself standing next to them, and what you admire in them but will not claim for yourself are all on display in your closest one-to-one relationships.",

  8: "This is the part of life most people avoid: shared money, debt, inheritance, sex that actually means something, and the secrets and grief other people hand to you. You get close to people faster and deeper than is comfortable, you are the one they confide in, and the times you were rebuilt from scratch started here.",

  9: "You need to believe in something bigger than your to-do list, and you get restless and bitter when you cannot. Your worldview, the teacher who changed your mind, the trip you take to find yourself and the argument you cannot let drop all start here. You outgrow beliefs the way other people outgrow shoes.",

  10: "Strangers have an opinion about what you do for a living, and it shapes your life more than you admit. Your career, your reputation, the authority you are working toward and the boss you answer to all sit here. You will be remembered for what you built, which may not be what you most wanted to be known for.",

  11: "Your friends, your groups and your online circles say more about your future than your plans do. You are loyal to the people who share your goals and you drift from the ones who do not. The causes you join, the audience you build and the favors you owe all start here.",

  12: "This is the hidden part of your life: what you do when nobody is looking, what you will not admit you fear, the grief you handle alone, and the pull toward rest, prayer or escape. You need real solitude to function, and the times you disappeared, burned out or suddenly just knew something came from here.",
};

// -----------------------------------------------------------------
// Aspect meanings — what each angular relationship does
// -----------------------------------------------------------------

export const ASPECT_MEANINGS: Record<string, { label: string; nature: string; description: string }> = {
  conjunction: {
    label: 'Conjunction',
    nature: 'Fusion',
    description: "These two parts of you fire together every time, so you cannot use one without the other jumping in. People get both at once, whether they asked for it or not. It makes you intense about whatever this pair covers, and the hard part is that you cannot switch either one off, even when the moment calls for it.",
  },
  opposition: {
    label: 'Opposition',
    nature: 'Tension',
    description: "These two sides of you want opposite things, so you swing between them or hand one of them to the people around you and then complain about them. You have probably picked a side, regretted it, and flipped. It only settles when you stop choosing and start doing both on purpose.",
  },
  trine: {
    label: 'Trine',
    nature: 'Flow',
    description: "This comes so easily that you barely register it as a talent, which is why it is the thing you have done the least with. Nobody ever made you work for it, so it never got sharpened. People envy it and you shrug. Put real effort in and it turns from a gift into a reputation.",
  },
  square: {
    label: 'Square',
    nature: 'Friction',
    description: "These two fight, and the fight shows up as the thing you keep running into: the argument that repeats, the habit that cuts you off from what you want, the 3am conversation with yourself. It is also where you have grown the most, because it never lets you coast.",
  },
  sextile: {
    label: 'Sextile',
    nature: 'Opportunity',
    description: "These two work well together, but only if you start it. Left alone, nothing happens, which is why it can look like a talent you never used. Make the first move, make the call, apply for the thing, and it pays back far more than the effort you put in.",
  },
  quincunx: {
    label: 'Quincunx (Inconjunct)',
    nature: 'Adjustment',
    description: "These two do not speak the same language, and nothing you try quite translates. You feel it as a small constant itch: one part of your life always needs adjusting to make room for the other, and each fix lasts a few months. It does not resolve. You manage it, and you get good at managing it.",
  },
  semisextile: {
    label: 'Semisextile',
    nature: 'Subtle Adjustment',
    description: "A small, steady mismatch between two parts of you. It is not a crisis, just a pebble in the shoe, and you tend to ignore it until it irritates someone else. Notice it early and it stays small.",
  },
};

// -----------------------------------------------------------------
// Planet-pair insights — emotionally rich text for specific combos
// Keyed as "Planet1/Planet2" (alphabetical order) with sub-keys per aspect type
// -----------------------------------------------------------------

export const PLANET_PAIR_INSIGHTS: Record<string, Record<string, string>> = {
  'Moon/Sun': {
    conjunction: 'There is a rare wholeness in you; your heart and your will point in the same direction. Most people feel a constant tug between what they want and what they need, but you were born without that war. The challenge is that you may not understand people who do, and your certainty can sometimes read as inflexibility to those who are still figuring themselves out.',
    opposition: 'You live with a fundamental tension between who you are becoming and what you need to feel safe. Your conscious identity and your emotional undercurrent pull in opposite directions, and you may feel like two different people depending on who is watching. The gift here is extraordinary range; you understand both sides of almost any human experience because you live both sides every day.',
    trine: 'Your inner life and your outer life are in quiet agreement. There is an ease to you that other people find calming; you are not at war with yourself in the way that many people are. What you feel and what you project align naturally, and this gives you an emotional confidence that anchors everyone around you.',
    square: 'There is an ongoing friction between what you want and what you need, and it shows up in moments where your ambitions and your emotions feel like they are working against each other. You may push yourself past your emotional limits, or your feelings may sabotage your goals at the worst possible moments. This tension is exhausting, but it is also what makes you so driven; you are never complacent because something inside you always demands more.',
    sextile: 'Your identity and your emotional life cooperate easily, but the cooperation is something you have to actively cultivate rather than take for granted. When you pay attention to how your feelings inform your goals, you make better decisions than almost anyone around you. The opportunity here is emotional intelligence that translates into real-world power.',
    quincunx: 'Something about your emotional needs and your sense of self never quite align, and no amount of adjustment fully resolves it. You may feel emotionally out of step with your own ambitions, or find that what makes you feel safe is oddly disconnected from who you are trying to become. It never fully resolves, and you get better at living with it every year.',
  },
  'Sun/Venus': {
    conjunction: 'Love and identity are fused in you. You need to feel beautiful, valued, and desired, not out of vanity, but because your sense of self is woven into how you connect with others. You radiate warmth when you feel loved, and you dim when you do not. Learning to generate your own light, independent of anyone else\'s admiration, is your deepest work.',
    opposition: 'You are drawn to people and pleasures that seem to carry everything you are not. Relationships become mirrors, and you may fall in love with qualities you need to develop in yourself. The danger is losing yourself in someone else\'s beauty instead of finding your own.',
    trine: 'There is a natural grace to you, charm comes easily, and people are drawn to your warmth without you trying. Art, beauty, and love feel like extensions of who you are rather than things you have to chase. The risk is that things come so easily in love that you never develop the resilience for when they don\'t.',
    square: 'What you want from love and who you are clash in ways that create real friction. You might attract partners who challenge your identity, or you may feel that being yourself and being loved are somehow at odds. The tension is productive; it pushes you to grow beyond superficial connections into something more authentic.',
    sextile: 'Your creative and romantic impulses support your core identity when you make the effort to honor them. You have a natural ability to make people feel seen and valued, and this talent opens doors in both love and career. The key is not taking this gift for granted.',
  },
  'Mars/Moon': {
    conjunction: 'Your emotions hit like a wave, fast, powerful, and impossible to ignore. You feel things with your entire body, and your instinctive response to any emotional trigger is action. This makes you fiercely protective of the people you love, but it also means your anger and your vulnerability are dangerously close to the surface at all times.',
    opposition: 'Your need for emotional safety and your need to act, fight, or compete pull in opposite directions. You may lash out when you feel vulnerable, or suppress your anger to keep the peace until it explodes. The work here is learning that you can be both soft and strong, and that protecting yourself does not require destroying everything around you.',
    trine: 'Your emotions fuel your actions in a way that feels natural and powerful. When you care about something, you fight for it with an instinctive courage that most people envy. There is an emotional honesty in how you move through the world; you do not pretend not to feel things, and your passion is your greatest asset.',
    square: 'Your emotions and your actions are at war. You may act impulsively when you are hurt, or you may feel paralyzed by anger that has nowhere to go. Relationships become battlegrounds because the people closest to you receive the full force of feelings you cannot contain. The breakthrough comes when you learn to channel this intensity into something constructive rather than reactive.',
    sextile: 'Your instincts and your drive work together when you give them conscious direction. You sense what a situation requires and act on it quickly. Emotional intelligence meets decisiveness in a way that makes you effective in crisis.',
  },
  'Mars/Venus': {
    conjunction: 'Desire and attraction are fused in you; you know what you want and you go after it with a directness that is either magnetic or intimidating depending on who is receiving it. Sex and love are not separate categories for you; passion is the through-line of everything. The challenge is learning that not every attraction needs to be acted on immediately.',
    opposition: 'What you want and how you go after it are at odds. You may find yourself attracted to people who challenge you, or you create friction in love precisely because the passion runs so hot. The dynamic tension between pursuing and being pursued is the engine of your romantic life, and learning to hold both roles is the work.',
    trine: 'Your desires and your capacity to attract are in natural harmony. Romance flows easily, and there is an ease between your masculine and feminine energies that makes you comfortable in your own sexuality. The risk is coasting; your charm works so well that you never have to develop the depth that comes from struggle.',
    square: 'What you want and how you go after it are constantly clashing. You may find yourself attracted to people who challenge you, or you create friction in love precisely because the passion runs so hot. The sex and the arguments might feel like the same energy, because they are. Learning to slow down between desire and action is your lifelong edge.',
    sextile: 'Attraction and action cooperate in you when you make the effort. You have a natural sense of timing in romance, knowing when to pursue and when to receive. This subtle calibration gives you an advantage in love that others have to work much harder to develop.',
  },
  'Saturn/Sun': {
    conjunction: 'You were born carrying a weight that most people do not pick up until midlife. There is a seriousness in you: a sense of responsibility or limitation that colored your identity from an early age. You may have felt like you had to earn the right to exist, or that your father\'s expectations defined you before you could define yourself. The gift, which comes slowly, is an unshakable solidity that everyone eventually leans on.',
    opposition: 'Authority figures and your own identity are locked in a tug-of-war. You may struggle against limitation only to realize you are the one building the walls, or you might project your own discipline onto others and resent them for it. The mastery comes when you stop fighting structure and start building your own.',
    trine: 'Discipline comes naturally to you, and you age like fine wine. There is a quiet authority in your presence that commands respect without demanding it. You understand that real power is built slowly, and you have the patience to play the longest game in the room.',
    square: 'Your ambitions and your self-doubt are in constant friction. You want to achieve greatness, but something inside you, a critical voice, a fear of failure, a sense that you are not enough, keeps applying the brakes. The irony is that this tension is exactly what makes your achievements so solid when they finally arrive. Nothing you build is flimsy because nothing came easy.',
    sextile: 'Structure and identity work together when you put in the effort. You have a natural capacity for long-term planning and the discipline to follow through. Mentors and authority figures tend to recognize something in you that you may not yet see in yourself.',
  },
  'Saturn/Moon': {
    conjunction: 'Your emotional life was shaped by restriction, duty, or loss early on. You may have learned to suppress your needs, to be the responsible one, or to distrust your own feelings because vulnerability felt dangerous. The walls you built to protect yourself were necessary once, but they can become a prison if you forget that you are the one who holds the key.',
    opposition: 'Your need for emotional safety and your sense of duty pull in opposite directions. You may feel guilty for needing comfort, or you may armor yourself against vulnerability because someone taught you that feelings were a liability. Relationships can feel like obligations until you learn that letting someone in is not the same as letting your guard down.',
    trine: 'There is an emotional maturity in you that goes beyond your years. You understand that feelings are not frivolous; they carry weight, and you honor them with the seriousness they deserve. You are the person people come to when they need someone who will not flinch from the hard truths.',
    square: 'Your emotions and your sense of duty are in constant friction. You may feel that your needs are inconvenient, or that expressing vulnerability makes you weak. Depression or emotional heaviness can settle in when you deny yourself comfort for too long. The breakthrough comes when you realize that caring for yourself is not selfishness; it is the foundation everything else is built on.',
    sextile: 'Emotional discipline is a quiet strength in you. You have the ability to hold steady when others panic, and your feelings are grounded in a realism that prevents you from being swept away by fantasy. You earn trust because people sense that your emotional commitments are built to last.',
  },
  'Jupiter/Sun': {
    conjunction: 'You were born with an inner confidence that borders on the prophetic: a sense that life is fundamentally on your side. Your personality is expansive, generous, and optimistic in a way that opens doors others do not even see. The shadow is overreach, believing so deeply in your own potential that you overcommit, overpromise, or assume that enthusiasm alone will carry you through.',
    opposition: 'Your sense of self and your need for growth pull in opposite directions. You may feel torn between who you are and who you could become, or you might project your unlived potential onto mentors, teachers, or belief systems. The integration comes when you stop looking for your greatness in others and start living it.',
    trine: 'Luck and identity flow together naturally. You have an innate optimism and a bigness of spirit that attracts opportunity without effort. People trust you because you seem to trust life itself. The only risk is taking this grace for granted and never developing the grit that comes from genuine struggle.',
    square: 'Your identity and your need for growth are in productive tension. You may overextend yourself, promise more than you can deliver, or feel restless no matter how much you achieve. But this friction is exactly what prevents complacency; you are always reaching, always expanding, always becoming.',
    sextile: 'Opportunity supports your sense of self when you reach for it. You have a natural gift for being in the right place at the right time, but only if you show up. Mentors, travel, and education all serve your growth in ways that feel effortlessly aligned.',
  },
  'Saturn/Venus': {
    conjunction: 'Love feels like a serious matter to you, not because you lack warmth, but because you learned early that affection comes with conditions. You may have been denied love, made to earn it, or taught that relationships require sacrifice above pleasure. The result is someone who does not love lightly, but when you commit, your devotion is the most durable kind there is.',
    opposition: 'Your desire for love and your fear of vulnerability are locked in opposition. You may attract partners who are unavailable or withholding, or you may be the one who keeps people at arm\'s length because opening up feels like handing someone a weapon. The growth is learning that love and safety are not mutually exclusive.',
    trine: 'You bring a quiet stability to love that others find deeply reassuring. You are not interested in fireworks; you want something that lasts. There is a maturity in how you approach relationships, and you are drawn to partners who have done their own work. Your love deepens with time rather than fading.',
    square: 'Love and duty clash in you. You may feel that pleasure is something you have to earn, or that relationships require you to sacrifice parts of yourself. There can be a coldness or reserve that masks a deep longing for warmth. The work is learning that you deserve tenderness without having to pay for it.',
    sextile: 'Stability and affection cooperate in you when you allow both to exist. You build relationships that are both loving and practical. Your partnerships tend to improve with time because you invest in them with the same discipline you bring to everything else.',
  },
  'Saturn/Mars': {
    conjunction: 'Your drive and your discipline are welded together. When you commit to something, you pursue it with a controlled intensity that is nearly impossible to stop. But there is a frustration built into this fusion: you may feel like you are always driving with the brakes on, or that your ambition is constantly being tested by obstacles that would break a lesser will.',
    opposition: 'Your need to act and your need to plan are locked in a standoff. You may swing between reckless impulsivity and paralyzing caution, or you might channel all your rage into work and wonder why you feel so burned out. The mastery comes when you learn to treat discipline as the amplifier of your power, not the cage around it.',
    trine: 'Ambition and endurance work together in you with an efficiency that others envy. You know how to pace yourself, how to conserve energy for what matters, and how to sustain effort long after everyone else has quit. Your achievements are not flashy; they are inevitable.',
    square: 'Your drive and your sense of limitation are in constant friction. You want to charge ahead, but something always slows you down, fear, responsibility, external obstacles, or your own harsh inner critic. The frustration is real, but it is also what forges your iron will. What you build under this pressure is indestructible.',
    sextile: 'Action and discipline cooperate when you direct them consciously. You channel aggression into productive work, and your timing tends to be strategic rather than impulsive. Authority figures recognize your capacity for sustained effort.',
  },
  'Pluto/Sun': {
    conjunction: 'You came into this life with a mission to transform, yourself, and everything you touch. There is an intensity in your presence that people either gravitate toward or run from. You have stared into the abyss of your own nature, probably earlier than anyone should, and what you found there gave you a power that operates below the surface of normal life.',
    opposition: 'Power dynamics define your relationship with your own identity. You may attract controlling people, or you may be the one who needs to control. The projection is the lesson: what you see in others that threatens you is exactly the power you need to reclaim in yourself.',
    trine: 'Transformation comes naturally to you. You shed old versions of yourself with a fluidity that others find both inspiring and unsettling. There is a psychological depth to your self-awareness that gives you enormous influence, people sense that you have been through something and come out the other side.',
    square: 'Your identity and your need for transformation are in volatile friction. Power struggles, with others and with yourself, are a recurring theme. You may destroy and rebuild aspects of your life with an intensity that exhausts everyone around you. But this is your crucible: the pressure that turns carbon into diamond.',
    sextile: 'Transformation supports your identity when you lean into it consciously. You have a natural capacity for psychological insight, and you tend to grow the most during periods of upheaval that would flatten other people.',
  },
  'Pluto/Moon': {
    conjunction: 'Your emotional life operates at a depth that most people never reach. You feel everything with an intensity that can be overwhelming, to you and to others. There may be early experiences of loss, betrayal, or emotional manipulation that taught you how dangerous it is to be vulnerable. But that same depth gives you an emotional x-ray vision that sees through every pretense.',
    opposition: 'Your need for emotional safety and your compulsion toward intensity are locked in a power struggle. You may be drawn to emotionally extreme situations because they feel more real than peace. Relationships become arenas for control until you learn that intimacy does not require domination, and that being known does not mean being destroyed.',
    trine: 'Emotional depth and transformative power flow together in you naturally. You have an intuitive understanding of human psychology that borders on the uncanny. People reveal their secrets to you because they sense you can hold the weight of truth without flinching.',
    square: 'Your emotional needs and your need for control are in violent friction. You may manipulate without meaning to, or attract people who try to control you emotionally. Trust is the battlefield, and vulnerability feels like a risk you cannot afford. The breakthrough comes when you realize that the person you need to forgive most is yourself.',
    sextile: 'Emotional depth and psychological power work together when you channel them consciously. You help other people heal because you understand that transformation requires going into the darkness, not around it.',
  },
  'Pluto/Venus': {
    conjunction: 'Love, for you, is not a gentle thing. It is an obsession, a transformation, a death and rebirth. You love with an intensity that can devour, and when you are rejected or betrayed, the wound goes to the bone. You may attract partners who are complex, controlling, or transformative. The gift is a capacity for love so deep it changes the molecular structure of everyone it touches.',
    opposition: 'Your desire for love and your need for power are in direct opposition. You may be drawn to people who are dangerous for you, or you may be the one who wields too much power in relationships. The pattern repeats until you learn that real love does not require ownership.',
    trine: 'Love and transformation are natural partners in your life. You attract deep, meaningful connections that change you fundamentally. There is a magnetic quality to your affections, people sense that loving you will never be boring, and they are right.',
    square: 'Love and power clash in you with an intensity that creates volcanic relationships. Jealousy, possessiveness, and the fear of being consumed by love are ongoing themes. The passion is extraordinary, but so is the destructive potential. The growth edge is learning that love is not a battlefield, or if it is, you do not always need to win.',
    sextile: 'Deep love and personal transformation cooperate when you allow them to. You have a natural ability to bring hidden dynamics in relationships to the surface, and your partnerships tend to evolve over time in ways that are genuinely healing.',
  },
  'Pluto/Mars': {
    conjunction: 'Your willpower is nuclear. When you want something, you pursue it with an intensity that borders on obsession, and very few forces on Earth can stop you. But this power cuts both ways, channeled well, it makes you unstoppable; unchanneled, it can be self-destructive. You have probably already learned that your anger is not something to play with.',
    opposition: 'Your drive and your need for power are locked in a struggle that plays out through confrontation, with others and with yourself. You may attract enemies, or you may be your own worst adversary. The lesson is that real power does not need to dominate; it transforms.',
    trine: 'Willpower and transformative intensity work together with a devastating effectiveness. When you decide something, the universe seems to rearrange itself to accommodate. You do not bully your way through obstacles; you outlast them.',
    square: 'Your drive and your need for power are in explosive friction. You may be drawn to conflict, or conflict may find you regardless. There is a volcanic quality to your anger; it builds beneath the surface and erupts with devastating force. The mastery comes when you learn to harness this intensity without being consumed by it.',
    sextile: 'Raw power and strategic action cooperate when you direct them with awareness. You have a natural ability to regenerate after setbacks that would finish other people, and your determination deepens rather than weakens under pressure.',
  },
  'Mercury/Venus': {
    conjunction: 'Your mind and your heart speak the same language. You think beautifully; there is an elegance to how you process information and express ideas. You are probably charming in conversation, with a gift for saying exactly the right thing at the right moment. The shadow is that your desire to be pleasant can sometimes override your desire to be honest.',
    opposition: 'Your mind and your values want different things. You may think one thing and desire another, or express opinions that contradict your actual feelings. The tension between head and heart creates a rich inner dialogue that, once integrated, gives you extraordinary insight into human nature.',
    trine: 'Communication and love flow together effortlessly. You express affection with grace, and your words carry warmth. Art, poetry, and beauty are not abstract concepts to you; they are the medium through which you understand the world.',
    square: 'Your thoughts and your desires are at odds. You may overthink your relationships or say things in love that you do not mean. There is a restlessness between what your mind wants and what your heart craves. The growth comes from learning that not everything beautiful needs to be analyzed, and not every thought needs to be spoken.',
    sextile: 'Your intellect and your sense of beauty cooperate when you give them room. You have a natural talent for creative expression and social diplomacy. Conversations with you tend to leave people feeling both stimulated and appreciated.',
  },
  'Mercury/Mars': {
    conjunction: 'Your mind is a weapon, fast, sharp, and always ready for a fight. You think quickly, speak directly, and have zero patience for people who cannot keep up. Debates excite you the way sports excite other people. The challenge is that your words can cut before you realize you are holding a blade.',
    opposition: 'Your thoughts and your actions run on different clocks. You may speak before you think, or overthink until the moment for action has passed. Arguments become a way of processing energy, and you may find that conflict clarifies your thinking in ways that peace does not.',
    trine: 'Your mind and your drive are in natural alignment. You think strategically, speak decisively, and execute efficiently. There is a quickness to your mental processes that gives you an edge in any competitive environment.',
    square: 'Your mind and your temper clash in ways that create both brilliant insights and regrettable outbursts. You may argue for sport, or your impatience may make you dismiss ideas before fully hearing them. The friction is productive; it sharpens your intellect, but it can alienate people who mistake your directness for aggression.',
    sextile: 'Sharp thinking and decisive action work together when you engage them consciously. You have a natural talent for debate, strategic communication, and thinking on your feet under pressure.',
  },
  'Jupiter/Saturn': {
    conjunction: 'Expansion and contraction live in the same breath inside you. You dream big and plan carefully; the visionary and the architect are fused. You may swing between blind optimism and crushing doubt, but when both energies are in sync, you build empires that other people only fantasize about.',
    opposition: 'Your need to grow and your need for security are in direct opposition. You may feel torn between taking risks and playing it safe, between faith and fear. The world seems to alternately offer you everything and take it away. Integration comes when you learn that growth and stability are not enemies; they are dance partners.',
    trine: 'Vision and structure cooperate naturally. You have the rare gift of dreaming practical dreams, ambitions that are large enough to inspire and grounded enough to achieve. You grow slowly but unstoppably, and your long-term trajectory is consistently upward.',
    square: 'Your optimism and your realism clash in a way that creates tremendous productive tension. You may overcommit and then face harsh consequences, or you may restrict yourself so severely that growth stalls. The friction between expansion and contraction forces you to find the narrow path between recklessness and paralysis.',
    sextile: 'Growth and discipline work together when you consciously balance them. You have a natural sense of how far to push and when to consolidate. This timing gives you an advantage in career and financial matters that compounds over decades.',
  },
  'Jupiter/Moon': {
    conjunction: 'Your emotional life is generous and expansive. You feel things on a grand scale; your joy is infectious, your sadness is oceanic, and your need for comfort extends far beyond yourself. You want to feed, shelter, and protect the world. The shadow is emotional excess, overindulging your feelings or using generosity to avoid dealing with pain.',
    opposition: 'Your emotional needs and your desire for growth tug against each other. You may sacrifice emotional security for adventure, or cling to comfort at the expense of your potential. The integration comes when you realize that the biggest adventure is the one that takes place inside you.',
    trine: 'Emotional intelligence and wisdom flow together naturally. You have an innate optimism that buoys you through difficulty, and your feelings are your best compass for navigating life. People trust your emotional instincts because they are so often right.',
    square: 'Your emotions and your need for expansion clash in ways that create restlessness. You may eat, spend, or overcommit when you feel anxious, or you may feel that staying in one place emotionally will suffocate you. What changes things is seeing that depth and breadth are not the same thing.',
  },
  'Neptune/Sun': {
    conjunction: 'You are part artist, part mystic, part ghost. Your identity is fluid; you can be anyone, feel everything, dissolve into the collective like water into the ocean. This makes you extraordinarily creative and empathetic, but it also means you may struggle to know where you end and other people begin. Your life task is to give this boundless sensitivity a shape without losing the magic.',
    opposition: 'Your sense of self and your spiritual nature are in tension. You may idealize yourself, or you may feel perpetually disillusioned with who you are. Others may project their fantasies onto you, and you may lose yourself trying to live up to images that were never yours. The growth comes from accepting your humanity without losing your vision.',
    trine: 'Imagination and identity flow together naturally. You have a gift for channeling something larger than yourself, through art, music, healing, or spiritual practice. People sense a quality in you that is hard to name but impossible to ignore.',
    square: 'Your identity and your idealism clash in ways that create confusion. You may not know who you really are beneath the masks, or you may chase fantasies of yourself that dissolve on contact with reality. Addiction, escapism, and self-deception are real risks. But so is transcendence, when you stop trying to be perfect and start being real.',
  },
  'Neptune/Moon': {
    conjunction: 'Your emotional sensitivity is otherworldly. You absorb feelings from the atmosphere the way other people absorb oxygen, automatically and constantly. You may have grown up in an environment where emotional boundaries were nonexistent, leaving you unsure which feelings are yours and which belong to someone else. Your gift is a compassion so vast it can heal, and your challenge is learning not to drown in it.',
    opposition: 'Your emotional needs and your spiritual longings split you down the middle. You may idealize your family or your past, or use fantasy to escape feelings that are too painful to face directly. The growth comes from learning to be present with your real emotions instead of drifting into the version of reality you wish were true.',
    trine: 'Emotional depth and spiritual sensitivity flow together beautifully. You have an intuitive gift that borders on psychic; you sense what people feel before they say a word. Art, music, and water are medicine for you.',
    square: 'Your emotions and your imagination are in restless friction. You may struggle to distinguish between what you feel and what you imagine you feel. Boundaries dissolve too easily, and you may absorb other people\'s pain without realizing it. The work is grounding your sensitivity in reality without losing your magic.',
  },
  'Uranus/Sun': {
    conjunction: 'You are not like other people, and you knew it from the beginning. There is an electric quality to your identity: a need to break free, to shock, to exist on your own terms no matter the cost. You may have felt alienated early in life, but that alienation forged something original in you that the world eventually needs.',
    opposition: 'Your identity and your need for freedom are locked in opposition. You may rebel against yourself, or attract chaos that forces you to reinvent who you are. Relationships, careers, and identities may be disrupted suddenly and repeatedly until you learn that freedom and stability can coexist.',
    trine: 'Originality and identity flow together naturally. You are innovative without being disruptive, independent without being isolated. People accept your uniqueness because you wear it so comfortably.',
    square: 'Your identity and your need for freedom clash in ways that create sudden disruptions. You may sabotage your own stability because routine feels like death. The tension keeps you from ever becoming stagnant, but it can also prevent you from building anything that lasts. The shift happens when you see that some structures are scaffolding, not cages.',
  },
  'Uranus/Moon': {
    conjunction: 'Your emotional life is electric, unpredictable, unconventional, and resistant to anything that feels like emotional confinement. You may have experienced instability in early home life, and as a result, your need for freedom and your need for security exist in permanent tension. You feel safest when nothing is predictable, which is a contradiction most people cannot fathom.',
    opposition: 'Your need for emotional security and your need for independence are in direct opposition. You may crave closeness and push it away in the same breath, or attract relationships that are exciting but unstable. The work is finding a form of intimacy that does not feel like a cage.',
    trine: 'Emotional freedom and instinctive independence flow together naturally. You process feelings in unconventional ways, and your emotional resilience comes from an ability to detach without disconnecting.',
    square: 'Your emotions and your need for freedom clash in ways that create sudden emotional upheavals. You may panic when relationships get too close, or feel suffocated by domestic routines that everyone else finds comforting. The instability is the teacher; it forces you to find emotional security within yourself rather than in circumstances.',
  },
  'Jupiter/Venus': {
    conjunction: 'Love and abundance are fused in you. You love generously, attract easily, and believe in the best version of every relationship. Your romantic life tends toward excess, too much pleasure, too many partners, or expectations so grand that reality cannot match them. But your heart is genuinely warm, and your capacity for joy is a gift to everyone who knows you.',
    opposition: 'Your desire for love and your desire for more keep outvoting each other. You may over-idealize partners or lose interest once the thrill of the chase fades. The growth comes from learning that real love is not always an adventure, sometimes it is the quiet presence that remains after the fireworks end.',
    trine: 'Love and luck flow together beautifully. You attract good things and good people with a natural magnetism that feels effortless. Your sense of beauty is expansive, and your generosity in relationships is genuine and reciprocated.',
    square: 'Your desires and your sense of abundance clash in ways that create indulgence or dissatisfaction. You may want too much, spend too freely on love, or chase pleasures that leave you emptier than they found you. The friction is an invitation to find the difference between what feels good and what is good for you.',
  },
  'Neptune/Venus': {
    conjunction: 'You love with a devotion that borders on the sacred. Romance is not a pastime for you; it is a spiritual experience, and you seek the divine in the eyes of your beloved. The shadow is idealization so extreme that no real person can live up to it, and the disillusionment that follows can be devastating. Your greatest love story is learning to find the magic in what is real.',
    opposition: 'Your romantic ideals and your actual experience of love are in tension. You may chase fantasies, fall for unavailable people, or sacrifice yourself in relationships because you believe love should be selfless. You loosen up once you accept that healthy love does not require you to dissolve.',
    trine: 'Romance and imagination flow together in a way that makes your love life feel like art. You attract through vulnerability and beauty, and your relationships have a poetic quality. Your capacity for unconditional love is genuine and rare.',
    square: 'Your romantic ideals and your reality clash painfully. You may love illusions, be deceived in love, or deceive yourself about who someone really is. Addiction to romance or to substances that simulate the feeling of love is a real risk. The work is learning to love what is real without losing your capacity to dream.',
  },
  'Mercury/Saturn': {
    conjunction: 'Your mind is disciplined, serious, and built for depth. You may have felt intellectually inadequate early in life, perhaps a learning difficulty, a critical teacher, or a sense that your thoughts were not welcome. But the result is a mind that earns its authority through rigor, and your words carry weight because you do not waste them.',
    opposition: 'Your thinking and your sense of authority argue inside you daily. You may doubt your own intelligence, or speak with a gravity that intimidates others. The work is learning that your mind is not a courtroom, not every thought needs to be proven beyond reasonable doubt before you are allowed to share it.',
    trine: 'Mental discipline and structured thinking come naturally to you. You have a gift for concentration, for organizing complex information, and for communicating with precision. Your ideas are taken seriously because they are always well-considered.',
    square: 'Your thoughts and your fears are in friction. You may overthink, self-censor, or struggle with mental blocks that slow down your natural intelligence. Communication feels heavy, like every word has to carry the weight of certainty. The growth comes from learning that your mind does not have to be perfect to be brilliant.',
  },
  'Mercury/Jupiter': {
    conjunction: 'Your mind is expansive, optimistic, and hungry for meaning. You think in big pictures and grand narratives, and you have a natural talent for teaching, writing, and synthesizing complex ideas into compelling stories. The shadow is mental restlessness, too many ideas, too little follow-through, and a tendency to promise more than your schedule can deliver.',
    opposition: 'Your thinking and your beliefs pull in opposite directions. You may argue with your own philosophy, or swing between big-picture optimism and skeptical detail-orientation. The integration comes when you learn to think large without losing accuracy.',
    trine: 'Intellect and wisdom flow together naturally. You are a natural teacher and storyteller, with a gift for making complex ideas accessible. Your curiosity is broad and your optimism is contagious.',
    square: 'Your mind and your need for meaning are in productive friction. You may overpromise intellectually, take on too many projects, or struggle with the gap between what you envision and what you can execute. The tension keeps your mind sharp and your ambitions honest.',
  },
  'Mercury/Pluto': {
    conjunction: 'Your mind penetrates to the core of everything. You do not accept surface explanations; you dig until you find the truth, even when the truth is uncomfortable. You may have a talent for research, psychology, or investigation. Your words carry power because they come from a place of unflinching honesty. The shadow is obsessive thinking and the inability to let go of an idea once it has its hooks in you.',
    opposition: 'Your thinking and your need for psychological depth are in tension. You may be drawn to hidden knowledge, conspiracy, or the dark underbelly of any topic. The growth comes from using your penetrating insight to heal rather than to control.',
    trine: 'Mental depth and transformative insight flow together naturally. You see what others miss, and your ability to communicate uncomfortable truths gives you influence in any environment where honesty is valued.',
    square: 'Your mind and your need for control are in friction. Obsessive thinking, paranoia, or the compulsion to know everything can dominate your mental life. The work is learning to use your psychological X-ray vision without becoming consumed by what you see.',
  },
};

// -----------------------------------------------------------------
// Helper utilities
// -----------------------------------------------------------------

function ordinal(n: number): string {
  if (n === 1) return '1st';
  if (n === 2) return '2nd';
  if (n === 3) return '3rd';
  return `${n}th`;
}

function firstSentence(text: string): string {
  if (!text) return '';
  const idx = text.indexOf('.');
  return idx === -1 ? text : text.slice(0, idx + 1);
}

/**
 * Look up a planet-pair insight by normalizing both orderings into alphabetical key.
 */
function findPairInsight(planet1: string, planet2: string, aspectType: string): string | null {
  const key1 = `${planet1}/${planet2}`;
  const key2 = `${planet2}/${planet1}`;
  const aspect = aspectType.toLowerCase();
  const entry = PLANET_PAIR_INSIGHTS[key1] || PLANET_PAIR_INSIGHTS[key2]
    || EXTRA_PAIR_INSIGHTS[key1] || EXTRA_PAIR_INSIGHTS[key2];
  if (entry && entry[aspect]) return entry[aspect];
  return null;
}

export function getAspectInterpretation(planet1: string, planet2: string, type: string): string {
  const info = ASPECT_MEANINGS[(type || '').toLowerCase()];
  if (!info) return '';

  // Try specific planet-pair insight first
  const pairInsight = findPairInsight(planet1, planet2, type);
  if (pairInsight) {
    return `**${planet1} ${info.label.toLowerCase()} ${planet2}** *(${info.nature})*\n\n${pairInsight}`;
  }

  // Fallback for pairs without a hand-written reading: the aspect itself, in
  // the reader's voice. The planets are named in the heading above, so they
  // are not defined again here.
  return `**${planet1} ${info.label.toLowerCase()} ${planet2}** *(${info.nature})*\n\n${info.description}`;
}

export function getHouseInterpretation(houseNum: number, sign: string, cuspDegree?: number): string {
  const houseMeaning = HOUSE_IN_CHART[houseNum];
  if (!houseMeaning) return '';

  const sections: string[] = [houseMeaning];

  // The fused sign x house portrait speaks to this exact area of life. Fall
  // back to the plain sign line only if a portrait is missing.
  const signLayer = SIGN_HOUSE_FUSION[sign]?.[houseNum] || (SIGN_IN_CHART[sign] ? `Here, ${SIGN_IN_CHART[sign]}` : '');
  if (signLayer) sections.push(signLayer);

  // The exact cusp degree carries its own hidden texture — different from any
  // planet inside the house, so this never duplicates a placement reading.
  if (cuspDegree !== undefined && cuspDegree !== null && isFinite(cuspDegree)) {
    const layered = buildHiddenLayerSection(sign, cuspDegree);
    if (layered) sections.push(layered);
  }

  return sections.join('\n\n');
}

/**
 * Compose the hidden sub-sign layer prose for an exact degree. The engine's
 * three levels each get a distinct narrative role: the undercurrent beneath
 * the visible sign, the observable daily style, and the finest micro-tell.
 * The systems themselves are never named in the output.
 */
export function buildHiddenLayerSection(sign: string, degreeInSign: number): string {
  try {
    const duadSign = calculateDuad(sign, degreeInSign);
    const compSign = calculateCompendium(duadSign, degreeInSign);
    const matrixSign = calculateMatrix(compSign, degreeInSign);
    const parts: string[] = [];

    if (duadSign === sign) {
      const pure = DUAD_PURE[sign];
      if (pure) parts.push(`And this runs deeper in you than any surface description suggests. ${pure}`);
    } else {
      const texture = DUAD_TEXTURE[duadSign];
      if (texture) parts.push(`But there's a finer grain to you than anyone guessing from the outside would ever see. Underneath, ${texture}`);
    }

    const style = COMPENDIUM_STYLE[compSign];
    if (style) parts.push(`Day to day it shows up in the small, watchable things: ${style}`);

    const signature = MATRIX_SIGNATURE[matrixSign];
    if (signature) parts.push(`And at the very finest level of your wiring — ${signature}`);

    return parts.join('\n\n');
  } catch {
    return '';
  }
}

/**
 * Compose the hidden sub-sign layer prose for a transit-to-natal contact from
 * the two exact longitudes. Same rules as buildHiddenLayerSection: the layers
 * get distinct narrative roles and the systems are never named. Voiced for a
 * temporary window, not a natal trait.
 */
export function buildTransitHiddenLayerSection(
  transitPlanet: string,
  transitLongitude: number,
  natalPlanet: string,
  natalLongitude: number,
): string {
  try {
    const t = getFullDuadCompendium(transitLongitude);
    const n = getFullDuadCompendium(natalLongitude);
    const parts: string[] = [];

    const undercurrent = TRANSIT_UNDERCURRENT[t.duadSign];
    if (undercurrent) {
      if (t.duadSign === t.sign) {
        parts.push(`There's one more thing about this transit, and it's the part no calendar will tell you. This one arrives undiluted — no hidden crosscurrent softening it, so what it promises is exactly what it delivers. Expect ${undercurrent}`);
      } else {
        parts.push(`There's one more thing about this transit, and it's the part no calendar will tell you. A second current is riding in beneath the surface, and it's the one you'll actually feel. Expect ${undercurrent}`);
      }
    }

    if (n.duadSign === n.sign) {
      const pure = DUAD_PURE[n.sign];
      if (pure) parts.push(`And it's aimed at the part of your ${natalPlanet} that runs purest. ${pure} That's the exact nerve this period is pressing on.`);
    } else {
      const texture = DUAD_TEXTURE[n.duadSign];
      if (texture) parts.push(`And it's aimed at a part of your ${natalPlanet} almost nobody knows is there. Underneath, ${texture} That's the exact nerve this period is pressing on.`);
    }

    if (t.duadSign === n.sign || t.sign === n.duadSign) {
      parts.push(`If this stretch feels strangely personal — more pointed than anything the dates alone can explain — trust that read. What's arriving and what it's touching in you run on the same private frequency, which is why this one lands like it knew your name.`);
    }
    if (t.compendiumSign === n.compendiumSign) {
      parts.push(`And it isn't skimming the surface of your life. It's plugged into the same deep line your ${natalPlanet} runs on, which is why the small events of these weeks feel heavier than their size.`);
    }

    const style = COMPENDIUM_STYLE[t.compendiumSign];
    if (style) parts.push(`You'll catch it in the small, watchable things while this is active — more days where ${style}`);

    const signature = MATRIX_SIGNATURE[t.matrixSign];
    if (signature) parts.push(`And at the very finest level, this window turns one reflex all the way up: ${signature}`);

    return parts.join('\n\n');
  } catch {
    return '';
  }
}

export function getPlacementInterpretation(
  planetName: string,
  sign: string,
  house: number,
  degreeInSign?: number,
): string {
  const lead = PLANET_LEADS[planetName] || PLANET_MEANINGS[planetName];
  if (!lead && !SIGN_IN_CHART[sign]) return '';

  const sections: string[] = [];
  if (lead) sections.push(lead);

  const fusion = SIGN_HOUSE_FUSION[sign]?.[house];
  if (fusion) {
    sections.push(fusion);
  } else {
    // Fallback for missing fusion content: sign and house blocks, no stitched
    // prefixes (the old prefixing produced "Sun is this is…" grammar bugs).
    const signMeaning = SIGN_IN_CHART[sign];
    const houseMeaning = HOUSE_IN_CHART[house];
    if (signMeaning) sections.push(`Here, ${signMeaning}`);
    if (houseMeaning) sections.push(houseMeaning);
  }

  if (degreeInSign !== undefined && degreeInSign !== null && isFinite(degreeInSign)) {
    const layered = buildHiddenLayerSection(sign, degreeInSign);
    if (layered) sections.push(layered);
  }

  return sections.join('\n\n');
}
