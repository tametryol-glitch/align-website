// Quick placement interpretations — what each planet means in astrology,
// and what it means in each sign and house for the person

export const PLANET_MEANINGS: Record<string, string> = {
  Sun: 'This is the part of you that refuses to be anyone else. Your Sun is the fire that burns even when no one is watching — the version of you that emerges when you stop performing for the world and finally let yourself just BE. When you feel lost, it\'s because you\'ve wandered too far from this energy. When you feel alive, it\'s because you\'re standing right in the center of it. Everything else in your chart orbits this.',

  Moon: 'Your Moon is the you that only comes out when the door is closed. It\'s the way you cry, the way you comfort yourself at 2am, the thing you reach for when the world gets too loud. This is your emotional blueprint — the needs you can\'t negotiate on, the safety you\'re always quietly building, and the childhood patterns that still run the show when you\'re tired or scared. The people who truly know you know your Moon.',

  Mercury: 'Mercury is the voice inside your head — and the one that comes out of your mouth. It\'s how you connect the dots, how you tell a story, the jokes that make you laugh hardest. This is the part of you that\'s always thinking, always processing, always trying to make sense of the chaos. The way you argue, the way you learn, the texts you agonize over — Mercury fingerprints are on all of it.',

  Venus: 'Venus is the ache you feel when something is beautiful. It\'s the way your heart opens — or closes — in the presence of another person. This is how you love, yes, but it\'s also what you think you deserve. The people you keep choosing, the things you keep buying, the compliments that actually land — they all trace back here. When your Venus is honored, love feels effortless. When it isn\'t, you settle.',

  Mars: 'Mars is the part of you that gets out of bed and fights for what it wants. It\'s your hunger, your anger, your drive — the raw energy that either builds empires or burns bridges. This is how you assert yourself, how you handle conflict, and what happens when someone pushes you too far. Your Mars is also your desire — the way you pursue, the way you take, the fire in your body that refuses to go out.',

  Jupiter: 'Jupiter is where the universe winks at you. It\'s the area of your life where things just work — where doors open before you knock, where faith gets rewarded, where growth happens almost in spite of yourself. This is your built-in belief system, your sense of meaning, the thing that keeps you optimistic even when the evidence says otherwise. Jupiter doesn\'t just bring luck. It brings the wisdom to recognize it.',

  Saturn: 'Saturn is the teacher who never lets you take shortcuts. It\'s the part of your life where nothing comes easy, where every win is earned, where discipline is the only currency that matters. This planet will break you down to build you up — and the mastery that emerges on the other side is unshakeable. Your Saturn placement is where you feel the most pressure, carry the heaviest responsibility, and ultimately become the person everyone else leans on.',

  Uranus: 'Uranus is the part of you that would rather be strange than safe. It\'s the electrical jolt that makes you question everything, the sudden insight at 3am, the refusal to live someone else\'s version of your life. Where Uranus lives in your chart is where you\'re different — genuinely, uncomfortably different — and where the world eventually catches up to you. Revolution starts here.',

  Neptune: 'Neptune is the part of you that dissolves into something greater. It\'s your imagination, your spirituality, the tears you cry at music — but it\'s also where you lose yourself, where boundaries blur, where you believe what you need to believe instead of what\'s real. This is the most beautiful and the most dangerous energy in your chart. When Neptune is clear, you channel the divine. When it\'s foggy, you can\'t tell the dream from the delusion.',

  Pluto: 'Pluto is the part of you that has already died and come back. It\'s the power you discovered in your darkest moment, the intensity that scares people who only want surface-level connection. Where Pluto sits in your chart is where you\'ve been completely dismantled — and where the version of you that emerged from the wreckage is more powerful than anything you were before. This is your phoenix energy. It doesn\'t negotiate. It transforms.',

  'North Node': 'Your North Node is the person you\'re becoming — the qualities that feel foreign and slightly terrifying but light you up when you lean into them. It\'s the direction your soul chose before you arrived here, the growth edge that keeps pulling you forward even when your comfort zone begs you to stay. Every time you move toward your North Node, something inside you whispers: yes, this is it.',

  'South Node': 'Your South Node is the version of you that already knows the answer — because you\'ve lived it a thousand times. It\'s your default setting, your comfort zone, the talent that comes so naturally it\'s almost boring. The catch is that staying here keeps you small. Your South Node gifts are real, but they become a golden cage if you never risk the unfamiliar territory your soul is actually hungry for.',

  Chiron: 'Chiron is the wound that never fully heals — and that\'s exactly what makes it sacred. Where Chiron sits in your chart is where you were hurt so deeply that you became an expert in that particular kind of pain. You can\'t fix this wound in yourself, but you can heal it in others — and that paradox is the source of your deepest wisdom. The people who need you most are the ones carrying the same scar.',

  Juno: 'Juno is what you actually need in a life partner — not what you fantasize about, but what you require to feel genuinely honored in commitment. This is the non-negotiable contract you carry inside you: the loyalty you demand, the equality you insist on, the dealbreakers you\'ll enforce even when it costs you everything. When your Juno is met, partnership becomes your greatest strength. When it\'s violated, you become a force of reckoning.',

  Vesta: 'Vesta is the flame you tend in solitude. It\'s the thing you\'re so devoted to that the world falls away — the work, the practice, the calling that asks for your full attention and gives you back a sense of sacred purpose. Vesta can make you a monk or a master, but it always asks you to sacrifice something: comfort, distraction, maybe even companionship. What you guard here is holy to you, whether anyone else understands it or not.',

  Eros: 'Eros is the desire that grips you at the cellular level. It\'s not just who you want — it\'s how you want, the specific frequency of intensity that makes you feel fully alive and consumed. This is passion in its rawest form: the obsession, the magnetism, the kind of attraction that bypasses your brain entirely and speaks directly to your body. When Eros is activated, you don\'t choose desire. Desire chooses you.',

  Psyche: 'Psyche is the wound that cracked you open and let the light in. It\'s where emotional damage became emotional depth — where being hurt taught you to feel things other people can\'t even name. This placement shows the specific vulnerability that made you wise, the sensitivity you carry like a sixth sense. Your Psyche wound isn\'t something to fix. It\'s the reason you understand people at a level that leaves them speechless.',

  Lilith: 'Lilith is the part of you that society told you to hide — and the part that refuses to stay hidden. It\'s your raw, unapologetic power: the sexuality, the rage, the hunger that doesn\'t ask permission. Where Lilith lives in your chart is where you\'ve been shamed, exiled, or silenced — and where reclaiming that energy makes you dangerous in the most liberating way possible. Lilith doesn\'t beg for acceptance. She demands space.',

  'Part of Fortune': 'Your Part of Fortune is the sweet spot where your Sun, Moon, and Rising all exhale at the same time. It\'s the area of life where joy and success overlap — where being authentically yourself actually pays off in the material world. This isn\'t luck you stumble into. It\'s the alignment you feel when your inner truth and outer life finally match, and everything clicks into place like it was always meant to.',

  Vertex: 'Your Vertex is the universe\'s handwriting on your life. It\'s the point where fate steps in — bringing the people, the moments, the turning points that you couldn\'t have planned but that change everything. When your Vertex is activated, you know it: the encounter feels charged, inevitable, like the plot of your life just shifted. These are the meetings that rearrange your timeline.',

  Ceres: 'Ceres is the way you mother the world — and the way you ache to be mothered. It\'s your relationship with nourishment in every form: the food that comforts you, the care you give without being asked, the grief you carry when something you nurtured is taken away. Ceres knows the seasons of loss and return intimately. Where she lives in your chart is where you pour yourself into growing things — and where letting go hurts the most.',

  Pallas: 'Pallas is your strategic mind at its sharpest. It\'s the part of you that sees the pattern everyone else misses, the intelligence that fights with precision instead of brute force. Where Pallas sits in your chart is where you\'re a natural tactician — reading rooms, solving puzzles, recognizing what\'s really going on beneath the surface. This isn\'t just smart. This is wise in a way that changes outcomes.',

  'Part of Spirit': 'Your Part of Spirit is where you consciously aim your will toward something that matters more than comfort. Unlike the Part of Fortune, which shows where the world rewards you, this point reveals where your soul actively reaches for meaning — the spiritual purpose you choose rather than the one handed to you. This is intention made sacred, the direction you pray in even when you don\'t know who\'s listening.',

  Amor: 'Amor reveals the invisible conditions you place on unconditional love — the fears, the walls, the old stories that interfere with your ability to love freely. This asteroid shows what love truly means to you beyond romance, beyond attachment, beyond need. Where Amor sits is where you learn the difference between loving someone and trying to possess them. When you finally drop the conditions, love transforms everything it touches.',

  Valentine: 'Valentine is the purest love in your chart — the kind that gives without keeping score. It\'s devotion in its most selfless form: the love that would cross oceans, wait decades, sacrifice comfort without a second thought. Where Valentine lives is where you\'re capable of a tenderness so complete it almost hurts. This isn\'t practical love. This is the kind that poets write about because ordinary words can\'t hold it.',

  Union: 'Union is the hunger to dissolve into another person completely. It\'s the drive to merge — not just physically but at the soul level, where the boundary between you and them stops meaning anything. Where Union sits in your chart is where you seek the kind of partnership that changes your molecular structure. This isn\'t companionship. This is two becoming one, with all the ecstasy and terror that implies.',

  Karma: 'Karma is the debt collector and the gift-giver rolled into one. Where this asteroid sits is where what goes around comes around with mathematical precision — the unresolved patterns from other lifetimes that demand attention now. This isn\'t punishment. It\'s completion. The relationships, the struggles, the uncanny repetitions in your life all trace back to this point, asking you to finally balance the ledger.',

  Pholus: 'Pholus is the small match that burns down the whole forest. Where this asteroid sits is where a single decision — sometimes one that seemed trivial at the time — uncorks something massive and irreversible. Chain reactions, multigenerational patterns, consequences that spiral far beyond anything you intended. Pholus teaches you that some bottles, once opened, can never be sealed again. The question isn\'t whether it will happen. It\'s what you\'ll do when it does.',

  Nessus: 'Nessus is where the cycle of harm stops — or doesn\'t. This asteroid marks the place in your chart where toxic patterns, abuse, and violations of trust must be confronted honestly. You didn\'t start this cycle, but it lives in you now, and you\'re the one who gets to decide whether it continues or ends. Nessus is heavy, but its gift is the boundary you finally learn to draw — the line that says: this stops with me.',

  Chariklo: 'Chariklo is the quiet grace that holds space for someone else\'s unraveling. Where this asteroid lives is where you naturally become the calm presence in the room — the one who doesn\'t flinch, doesn\'t fix, just stays. This is sacred witnessing: the ability to sit with someone\'s pain without trying to make it go away. Your Chariklo placement is where you offer the rarest gift a human being can give — the gift of not looking away.',

  Urania: 'Urania is your cosmic antenna — the part of you that reads signs, decodes symbols, and senses the hidden architecture of the universe. Where this asteroid lives is where your mind naturally gravitates toward patterns that connect the mundane to the divine: astrology, sacred geometry, synchronicity. You don\'t just observe the world here. You read it like a language most people don\'t know exists.',

  DNA: 'DNA is the ancestral code running through your blood. Where this asteroid sits is where you carry your lineage in your body — the inherited gifts, the generational trauma, the biological patterns that were yours before you took your first breath. This isn\'t just family resemblance. It\'s the deep cellular memory of everyone who came before you, living in your bones and shaping you in ways you\'re only beginning to understand.',

  Child: 'Child is the part of you that never grew up — and wasn\'t supposed to. It\'s your innocence, your wonder, your ability to play without purpose. But it\'s also where childish reactions still ambush you: the dependency, the tantrums, the wounds from a time when you were too small to protect yourself. Where Child lives is where you\'re still the kid in the room, for better and for worse — and where healing your inner child unlocks your purest joy.',

  Fortuna: 'Fortuna is the wheel that spins without warning. Where this asteroid sits is where your circumstances can shift dramatically — fortune rising and falling, luck arriving and departing, the ground beneath your feet never quite stable. This isn\'t chaos for its own sake. It\'s the cosmic reminder that nothing is permanent, and the wisdom to ride the wheel rather than cling to any single position on it.',

  Hygiea: 'Hygiea is the intelligence of your body. Where this asteroid lives is where your physical and mental health demand conscious attention — the habits that keep you well, the warning signs you ignore at your peril, the discipline of treating your body as the temple it actually is. Hygiea doesn\'t do dramatic healing. She does the quiet, daily work of prevention — the kind that seems boring until you realize it saved your life.',

  Astraea: 'Astraea is the part of you that cannot walk away. Where this asteroid sits is where you stay long past the point others would leave — believing that justice will come, that the effort will be vindicated, that it isn\'t truly over yet. This is both your greatest persistence and your most painful denial. Astraea teaches the excruciating lesson of knowing when devotion becomes self-destruction — and finding the courage to finally let go.',

  Hecate: 'Hecate is the ancient knowing that lives in your gut. Where this asteroid sits is where you stand at the crossroads — the place where three paths diverge and logic can\'t help you choose. This is your connection to the unseen: dreams that predict, instincts that protect, the midnight wisdom that only comes when the rational mind finally shuts up. Trust her or don\'t, but Hecate is never wrong. She just speaks in a language you have to feel, not think.',

  Nemesis: 'Nemesis is the mirror you don\'t want to look into. Where this asteroid sits is where you are your own worst enemy — the pattern of self-sabotage that undoes everything you build, the blind spot that everyone else can see. This isn\'t bad luck. It\'s the repeating lesson you keep failing until you finally face it. Nemesis doesn\'t want to destroy you. She wants you to stop destroying yourself.',

  Nike: 'Nike is where triumph lives in your chart — the area of life where you are built to win if you refuse to quit. This isn\'t easy victory. It\'s the kind that comes after you\'ve been knocked down so many times that standing up becomes an act of defiance. Where Nike sits is where your competitive fire burns hottest, where persistence pays off spectacularly, and where the taste of victory is sweetest because you know exactly what it cost.',

  Isis: 'Isis is the devotion that reassembles what has been shattered. Where this asteroid sits is where you refuse to accept loss as final — where you gather the scattered pieces and put them back together through sheer love and determination. This is fierce, tireless loyalty: the sibling bond, the broken family, the fragmented self that you piece back into wholeness one shard at a time. Isis doesn\'t grieve passively. She rebuilds.',

  Osiris: 'Osiris is the death that leads to new life. Where this asteroid sits is where you\'ve been dismantled — taken apart by circumstances, relationships, or your own transformation — and where you were reassembled into someone more powerful than the person who was destroyed. This is cyclical rebirth: the profound endings that terrify you and the resurrections that prove you are, and always were, indestructible.',

  Horus: 'Horus is the sacred vision that refuses to be blinded. Where this asteroid sits is where you fight to reclaim what was stolen — your purpose, your inheritance, your right to exist fully. This is the divine child energy: the part of you that carries light into dark places, that sees through deception, and that knows your destiny even when the forces opposing you seem overwhelming. Horus doesn\'t just survive. He ascends.',

  Apollo: 'Apollo is where you keep hitting the same wall — and keep getting back up. Where this asteroid sits is where the lesson is stubborn and you are stubborner, where crises repeat themselves until you finally extract the wisdom they\'re trying to teach you. This isn\'t failure. It\'s the universe refusing to let you skip the curriculum. The breakthrough, when it comes, is earned through every single repetition that came before it.',

  Sappho: 'Sappho is the intimacy that doesn\'t need romance to be profound. Where this asteroid sits is where you find your kindred spirits — the friends who understand you without explanation, the creative partnerships that feel like speaking the same secret language. This is soul-deep bonding: artistic kinship, feminine connection, the love between people who see each other\'s full spectrum and stay anyway. Sappho\'s love is quiet, fierce, and irreplaceable.',

  Eris: 'Eris is the troublemaker who tells the truth. Where this asteroid sits is where you expose what everyone else is pretending not to see — the uncomfortable reality, the injustice, the elephant in the room. You\'re the outsider who doesn\'t play along, and the chaos you create is never random. It\'s surgical. Eris doesn\'t destroy for fun. She destroys what was already broken and forces everyone to deal with it.',

  Sedna: 'Sedna is the isolation that forges something unbreakable. Where this asteroid sits is where you were cast into the depths — betrayed, abandoned, left to survive alone in conditions no one should have to endure. But what grew in that isolation is a self-reliance so profound it borders on spiritual sovereignty. Sedna\'s gift is that the person who was thrown away became the one who needs nothing from anyone.',

  Haumea: 'Haumea is the creative force that never stops birthing. Where this asteroid sits is where endings become beginnings so fast you barely have time to grieve — where new life springs from the rubble almost immediately, where fertility and renewal are your default settings. This is phoenix energy on fast-forward: the ability to create, lose, and create again with an abundance that seems almost supernatural.',

  Makemake: 'Makemake is the part of you that makes something from nothing. Where this asteroid sits is where resourcefulness becomes a survival skill — the ingenuity that thrives when resources are scarce, the sacred relationship between what you create and what the earth provides. This is stripped-down creation: no luxury, no excess, just the raw ability to sustain yourself and honor the balance between taking and giving back.',

  Narcissus: 'Narcissus is the mirror you can\'t stop staring into. Where this asteroid sits is where self-focus becomes a trap — where fascination with your own image creates blind spots that cost you the very connections you crave. This isn\'t vanity. It\'s a wound that looks like confidence. The lesson Narcissus teaches is that the reflection you\'re drowning in isn\'t really you — and the real you is standing right behind it, waiting to be seen.',

  Echo: 'Echo is the part of you that disappeared into someone else\'s story. Where this asteroid sits is where you lose your own voice — repeating others\' words, mirroring their desires, fading into their narrative until you forget you ever had your own. This is the pattern of dissolution: love that erases you, devotion that costs you yourself. Echo\'s healing begins the moment you open your mouth and say something that belongs only to you.',

  Pandora: 'Pandora is the door you opened that can never be closed. Where this asteroid sits is where curiosity crossed a line — where one action, one question, one moment of defiance unleashed consequences that cascaded beyond anything you imagined. But here\'s what everyone forgets about Pandora: after everything escaped, hope remained. Where this asteroid lives is where your worst mistake still holds the seed of your salvation.',

  Icarus: 'Icarus is the part of you that flies too close to the sun and doesn\'t care. Where this asteroid sits is where you push past every sensible limit — the exhilaration of defying gravity, the intoxication of getting away with it, followed by the spectacular fall that was always coming. This isn\'t recklessness. It\'s the refusal to live small. Icarus teaches that the height of the flight and the depth of the fall are the same measurement.',

  Daedalus: 'Daedalus is the genius that builds the labyrinth and the wings to escape it. Where this asteroid sits is where your inventiveness creates structures of astonishing complexity — solutions that can either liberate or imprison, depending on your wisdom. This is the craftsman\'s dilemma: the brilliance to build anything, paired with the terrible knowledge that your creations can trap the people you love most.',

  Orpheus: 'Orpheus is the gift so transcendent it almost redeems everything. Where this asteroid sits is where your creative power moves people to tears, parts the veil between worlds, makes the impossible feel inevitable. But Orpheus also carries a fatal flaw: the backward glance, the inability to trust that what you love is following you. One moment of doubt can undo the masterpiece. The art survives. The question is whether you will.',

  Eurydike: 'Eurydike is the love that was almost saved. Where this asteroid sits is where you were pulled back at the threshold — where rescue came so close you could taste it, and then evaporated because someone couldn\'t resist looking back. This is the agony of conditional salvation: the relationship that almost worked, the healing that almost held, the second chance that fell apart because trust was exactly one heartbeat too slow.',

  Persephone: 'Persephone is the innocence that was dragged into the underworld — and came back wearing the crown. Where this asteroid sits is where you were forced to grow up too fast, pulled into darkness you didn\'t choose, and emerged with sovereignty over realms most people are afraid to even acknowledge exist. This is forced maturation: the girl who went in never came back. The queen who came out needs no one\'s permission.',

  Proserpina: 'Proserpina is the transformation that was imposed on you — not chosen. Where this asteroid sits is where radical change came whether you were ready or not, reshaping you so completely that the person on the other side is unrecognizable to the person who went in. This isn\'t gentle evolution. It\'s abduction into a new identity. The power comes from what you make of the new self that emerges from the captivity.',

  Diana: 'Diana is the wild part of you that will not be domesticated. Where this asteroid sits is where you demand complete autonomy — where partnership feels like a cage, where civilization feels like a costume, where you are most yourself running free through the untamed wilderness of your own nature. Diana protects the vulnerable and answers to no one. She is the reminder that some parts of you were never meant to be civilized.',

  Minerva: 'Minerva is the mind that wins the war before the first battle. Where this asteroid sits is where your intelligence becomes strategic — where you think three moves ahead, where your analysis is so precise it looks like prophecy. This isn\'t brute-force intellect. It\'s the surgical precision of wisdom applied to power. Minerva doesn\'t just know the answer. She knows exactly when and how to deploy it for maximum impact.',

  Bacchus: 'Bacchus is the ecstasy that dissolves your edges. Where this asteroid sits is where you lose yourself in pleasure — the wine, the music, the creative frenzy, the altered state where social rules stop applying and something primal takes over. This is divine madness: the liberation that comes from surrendering control. The only question Bacchus asks is whether you can find your way back from the ecstasy — or if you even want to.',

  Circe: 'Circe is the power to transform everyone who enters your space. Where this asteroid sits is where you wield an enchantment so potent it changes the people around you — sometimes healing them, sometimes trapping them, sometimes revealing the animal nature they were hiding all along. This is seductive influence at its most primal: the ability to alter someone\'s reality just by being near them. Whether that\'s a gift or a weapon depends entirely on you.',

  Medea: 'Medea is the love that burned everything down when it was betrayed. Where this asteroid sits is where you gave absolutely everything — sacrificed family, homeland, identity — for someone who then discarded you. The rage that lives here isn\'t just anger. It\'s the fury of a soul that knows exactly how much it was worth and refuses to be thrown away quietly. Medea warns: don\'t ask for someone\'s everything unless you intend to honor it.',

  Kassandra: 'Kassandra is the truth no one believes. Where this asteroid sits is where you see the future clearly — the disaster coming, the lie being told, the pattern repeating — and no one listens. You speak, and they dismiss you. You warn, and they laugh. The curse isn\'t being wrong. The curse is being right, every single time, and watching people walk into the fire you told them was there. Your vindication always comes. It just always comes too late.',

  Achilles: 'Achilles is your hidden vulnerability disguised as your greatest strength. Where this asteroid sits is where you seem invincible — so capable, so armored, so untouchable — that no one suspects this is exactly where you can be fatally wounded. The irony is devastating: your strongest point is your weakest point. The protection you built is the thing that makes you forget you still bleed there.',

  Sphinx: 'Sphinx is the riddle you must answer to move forward. Where this asteroid sits is where life presents you with enigmas — questions that have no obvious answer, tests that guard the doorway to the next chapter. If you solve them, you transform. If you don\'t, you remain stuck at the threshold. The Sphinx doesn\'t care about your feelings. She cares about your readiness. The answer is always simpler than you think — and harder to accept.',

  Atlantis: 'Atlantis is the warning about power that destroys itself. Where this asteroid sits is where your most advanced capabilities carry the shadow of their own downfall — brilliance that becomes hubris, knowledge that becomes tyranny, creation that collapses under its own weight. This is the echo of every civilization that flew too high and forgot the ground. Atlantis asks: can you wield what you know without letting it consume you?',

  Tantalus: 'Tantalus is the hunger that can never be satisfied. Where this asteroid sits is where you can see exactly what you want — it\'s right there, close enough to taste — but every time you reach for it, it pulls away. This is the agony of almost-having: the promotion that never comes, the person who never commits, the fulfillment that stays forever one step ahead. Tantalus teaches that some desires exist not to be fulfilled, but to reveal what you truly need.',

  Sisyphus: 'Sisyphus is the task that never ends. Where this asteroid sits is where you push the same boulder up the same hill, watching it roll back down, knowing you\'ll push it again tomorrow. This is the absurd persistence that defines your character — the effort that seems futile but that you do anyway, because giving up isn\'t in your nature. The secret Sisyphus knows is that meaning isn\'t in the summit. It\'s in the push itself.',

  Damocles: 'Damocles is the sword hanging over your head by a single thread. Where this asteroid sits is where privilege and peril are inseparable — where power comes with a constant awareness that everything could collapse without warning. This is the anxiety of having something to lose: the success that feels fragile, the position that demands vigilance, the knowledge that the higher you climb, the more devastating the fall. Damocles teaches you to sit with the sword and live fully anyway.',

  Lucifer: 'Lucifer is the brilliant light that carries the shadow of pride. Where this asteroid sits is where your illumination is genuine and powerful — you see things others can\'t, you bring clarity to darkness — but where the very brilliance that makes you extraordinary can curdle into arrogance that isolates you. This is the morning star: the most radiant light in the sky, forever carrying the memory of the fall that came from believing the light was yours alone.',

  Magdalena: 'Magdalena is the shame that became sacred authority. Where this asteroid sits is where you were judged, misunderstood, reduced to a label — and where the depth of your devotion eventually silenced every critic. This is the transformation of disgrace into grace: the witness who stayed when everyone else fled, the love that was never about purity but about presence. Magdalena doesn\'t need to be redeemed. She was never fallen.',

  Cupido: 'Cupido is the arrow you never see coming. Where this asteroid sits is where desire strikes without warning — the sudden infatuation that bypasses every rational defense, the attraction that makes no sense on paper but makes perfect sense in your body. This is love at first sight, lust at first glance, the chemical thunderbolt that rewrites your priorities in a single heartbeat. Cupido doesn\'t ask if you\'re ready. He just fires.',

  Destinn: 'Destinn is the current you cannot swim against. Where this asteroid sits is where your life feels scripted by forces older and larger than your conscious will — the path that keeps appearing no matter how many times you try to take a different road. This isn\'t fate as punishment. It\'s fate as alignment: the deep recognition that some chapters of your story were written before you were born, and resistance only delays the inevitable.',

  Abundantia: 'Abundantia is where the universe is trying to overflow your cup. Where this asteroid sits is where prosperity flows most naturally when you stop gripping and start receiving — the area of life where generosity creates more generosity, where gratitude multiplies everything it touches. This isn\'t about being lucky. It\'s about being open. Abundantia teaches that abundance isn\'t something you earn. It\'s something you allow.',

  Industria: 'Industria is the quiet power of showing up every single day. Where this asteroid sits is where diligence defines you — where your contribution to the world is measured not in bursts of genius but in the accumulated weight of consistent, purposeful effort. This is the work ethic that builds cathedrals one stone at a time. Industria doesn\'t need applause. It needs purpose. And when purpose meets persistence, the results outlast everything else.',
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
  1: 'This is the energy people feel the moment you walk into a room. It lives in your body, your face, your walk — the part of you that\'s impossible to hide because it IS the way you show up. Before you say a word, this placement is already introducing you. It shapes your instincts, your physical vitality, and the mask you\'re not even aware you\'re wearing.',

  2: 'This energy weaves itself into your relationship with what you own and what owns you. It shapes not just how you earn money, but what money means to you — the security you\'re building, the values you\'d never sell, the quiet question of whether you believe you\'re worth what you have. Your self-worth and your bank account are connected here in ways that run deeper than anyone sees.',

  3: 'This colors every conversation you have, every text you send, every thought that keeps you up at night. It\'s the rhythm of your daily mind — how you process, how you speak, how you learn things. Your relationships with siblings, neighbors, and the person at the coffee shop all carry this energy. It\'s in the way your brain works when nobody\'s testing it.',

  4: 'This lives at the absolute foundation of who you are — the emotional bedrock, the family patterns, the atmosphere you need in your most private space. This is the part of your chart nobody sees unless you let them all the way in. It shapes what home means to you, what childhood taught you, and the emotional inheritance you carry whether you want to or not.',

  5: 'This is where you come alive — where play, romance, and creation meet and the world stops being a responsibility and starts being a joy. It\'s the energy you bring to falling in love, making art, taking risks that make your heart race. Children, creativity, and pleasure are all colored by this placement. When you\'re expressing this energy, you remember what it feels like to be fully, unapologetically yourself.',

  6: 'This shapes the unsexy, essential machinery of your daily life — the routines, the rituals, the quiet discipline of taking care of your body and your responsibilities. It\'s how you serve, how you heal, how you show up for the work that nobody applauds. Your relationship with health, with coworkers, with the daily grind of being human lives here. This is where devotion meets discipline.',

  7: 'This defines the face of the person you keep choosing — in love, in business, in the mirror of every significant one-on-one relationship. This is who you attract and who you become when you\'re standing next to someone. The patterns in your partnerships, the qualities you admire and the ones that drive you insane, the way you lose yourself or find yourself in another person — it all traces back here.',

  8: 'This operates in the depths — the parts of life most people avoid because they require too much vulnerability. Intimacy, shared finances, psychological transformation, the merging of your resources with someone else\'s — it all lives here. This is where power dynamics play out in silence, where sexual energy and emotional intensity intersect, and where the versions of you that die make room for the versions that are waiting to be born.',

  9: 'This is the part of you that needs to believe in something bigger. It drives your search for meaning — the philosophy you live by, the spiritual questions you can\'t stop asking, the hunger for experiences that expand your understanding of what\'s possible. Higher education, foreign travel, publishing, the mentor who changed your life — they\'re all colored by this placement. This is where your worldview lives and breathes.',

  10: 'This is your legacy — the reputation you\'re building, the career you\'re shaping, the answer to the question: what will they say about you when you\'re not in the room? This is the most visible part of your chart: the authority you command, the achievements the world recognizes, the public version of your purpose. What you build here outlives you. Choose carefully.',

  11: 'This connects you to your tribe — the friendships, the communities, the collective dreams that remind you that some things can only be built together. It\'s the energy you bring to groups, the causes that light you up, and the vision of the future you\'re quietly working toward. The people who share your wavelength, the networks that sustain you, the hope you carry for something bigger than yourself — it all gathers here.',

  12: 'This operates in the parts of yourself you can\'t easily see — the subconscious patterns, the spiritual undercurrent, the quiet voice that speaks loudest when you\'re alone. This is your hidden life: the dreams, the fears, the secret griefs, the connection to something infinite that you can feel but never fully explain. Solitude, meditation, hospitals, monasteries — the places where the boundary between you and the universe dissolves. What lives here is sacred.',
};

// -----------------------------------------------------------------
// Aspect meanings — what each angular relationship does
// -----------------------------------------------------------------

export const ASPECT_MEANINGS: Record<string, { label: string; nature: string; description: string }> = {
  conjunction: {
    label: 'Conjunction',
    nature: 'Fusion',
    description: 'These two parts of you are fused at the core — they don\'t take turns, they speak at the same time, in the same breath. You can\'t express one without the other showing up uninvited. This is amplification: everything these planets share gets louder, more intense, more inseparable from who you are. The gift is power. The challenge is that you can\'t turn either one off.',
  },
  opposition: {
    label: 'Opposition',
    nature: 'Tension',
    description: 'These two energies live on opposite sides of you, pulling in directions that feel mutually exclusive. You may spend years swinging between them — or projecting one onto the people closest to you, convinced it\'s their issue and not yours. The tension is real, but so is the breakthrough: the moment you stop choosing sides and learn to hold both at once, you become someone who understands contradiction as a form of wholeness.',
  },
  trine: {
    label: 'Trine',
    nature: 'Flow',
    description: 'This is the gift you almost forget you have. These two energies harmonize so naturally that their cooperation feels like breathing — effortless, instinctive, always available. The beauty is that you never have to work for this connection. The danger is that you never do. Trines are talents that can go their entire lives undeveloped because nothing ever forced them to grow. The magic is real, but only effort makes it extraordinary.',
  },
  square: {
    label: 'Square',
    nature: 'Friction',
    description: 'This is the friction that makes diamonds. These two energies clash — constantly, stubbornly, in ways that force you to grow whether you want to or not. Squares are the aspects that wake you up at 3am, that make you question everything, that push you to the breaking point and then ask if you\'re ready to be rebuilt. They\'re the hardest aspects to live with and the most rewarding to master. Every achievement you\'re genuinely proud of has a square behind it.',
  },
  sextile: {
    label: 'Sextile',
    nature: 'Opportunity',
    description: 'These two energies get along beautifully — but they won\'t do the work for you. Think of this as an open door that stays open, patiently waiting for you to walk through. The cooperation is real, the talent is genuine, but unlike a trine, this aspect rewards initiative. When you actively engage these two parts of yourself, the results feel almost magical. When you ignore them, nothing happens. The opportunity is always there. The question is whether you\'ll take it.',
  },
  quincunx: {
    label: 'Quincunx (Inconjunct)',
    nature: 'Adjustment',
    description: 'These two parts of you genuinely don\'t understand each other — like two languages that share no common root. There\'s no clean resolution here, no moment where it all clicks into harmony. Instead, this aspect asks for something harder: ongoing adjustment, patient compromise, the willingness to accept that some internal tensions can\'t be solved, only managed with increasing grace. The mastery isn\'t in fixing it. It\'s in learning to live with the itch.',
  },
  semisextile: {
    label: 'Semisextile',
    nature: 'Subtle Adjustment',
    description: 'This is the pebble in your shoe — the low-grade friction between two energies that don\'t quite speak the same language. It\'s not dramatic enough to force a crisis, but it\'s persistent enough that you can\'t completely ignore it. These subtle irritations are actually gentle nudges toward awareness — small adjustments that, over time, build a more nuanced and integrated version of who you are.',
  },
};

// -----------------------------------------------------------------
// Planet-pair insights — emotionally rich text for specific combos
// Keyed as "Planet1/Planet2" (alphabetical order) with sub-keys per aspect type
// -----------------------------------------------------------------

export const PLANET_PAIR_INSIGHTS: Record<string, Record<string, string>> = {
  'Moon/Sun': {
    conjunction: 'There is a rare wholeness in you — your heart and your will point in the same direction. Most people feel a constant tug between what they want and what they need, but you were born without that war. The challenge is that you may not understand people who do, and your certainty can sometimes read as inflexibility to those who are still figuring themselves out.',
    opposition: 'You live with a fundamental tension between who you are becoming and what you need to feel safe. Your conscious identity and your emotional undercurrent pull in opposite directions, and you may feel like two different people depending on who is watching. The gift here is extraordinary range — you understand both sides of almost any human experience because you live both sides every day.',
    trine: 'Your inner life and your outer life are in quiet agreement. There is an ease to you that other people find calming — you are not at war with yourself in the way that many people are. What you feel and what you project align naturally, and this gives you an emotional confidence that anchors everyone around you.',
    square: 'There is an ongoing friction between what you want and what you need, and it shows up in moments where your ambitions and your emotions feel like they are working against each other. You may push yourself past your emotional limits, or your feelings may sabotage your goals at the worst possible moments. This tension is exhausting, but it is also what makes you so driven — you are never complacent because something inside you always demands more.',
    sextile: 'Your identity and your emotional life cooperate easily, but the cooperation is something you have to actively cultivate rather than take for granted. When you pay attention to how your feelings inform your goals, you make better decisions than almost anyone around you. The opportunity here is emotional intelligence that translates into real-world power.',
    quincunx: 'Something about your emotional needs and your sense of self never quite align, and no amount of adjustment fully resolves it. You may feel emotionally out of step with your own ambitions, or find that what makes you feel safe is oddly disconnected from who you are trying to become. This is not a flaw to fix — it is a tension to learn to live with gracefully.',
  },
  'Sun/Venus': {
    conjunction: 'Love and identity are fused in you. You need to feel beautiful, valued, and desired — not out of vanity, but because your sense of self is woven into how you connect with others. You radiate warmth when you feel loved, and you dim when you do not. Learning to generate your own light, independent of anyone else\'s admiration, is your deepest work.',
    opposition: 'You are drawn to people and pleasures that seem to represent everything you are not. Relationships become mirrors, and you may fall in love with qualities you need to develop in yourself. The danger is losing yourself in someone else\'s beauty instead of finding your own.',
    trine: 'There is a natural grace to you — charm comes easily, and people are drawn to your warmth without you trying. Art, beauty, and love feel like extensions of who you are rather than things you have to chase. The risk is that things come so easily in love that you never develop the resilience for when they don\'t.',
    square: 'What you want from love and who you are clash in ways that create real friction. You might attract partners who challenge your identity, or you may feel that being yourself and being loved are somehow at odds. The tension is productive — it pushes you to grow beyond superficial connections into something more authentic.',
    sextile: 'Your creative and romantic impulses support your core identity when you make the effort to honor them. You have a natural ability to make people feel seen and valued, and this talent opens doors in both love and career. The key is not taking this gift for granted.',
  },
  'Mars/Moon': {
    conjunction: 'Your emotions hit like a wave — fast, powerful, and impossible to ignore. You feel things with your entire body, and your instinctive response to any emotional trigger is action. This makes you fiercely protective of the people you love, but it also means your anger and your vulnerability are dangerously close to the surface at all times.',
    opposition: 'Your need for emotional safety and your need to act, fight, or compete pull in opposite directions. You may lash out when you feel vulnerable, or suppress your anger to keep the peace until it explodes. The work here is learning that you can be both soft and strong — that protecting yourself does not require destroying everything around you.',
    trine: 'Your emotions fuel your actions in a way that feels natural and powerful. When you care about something, you fight for it with an instinctive courage that most people envy. There is an emotional honesty in how you move through the world — you do not pretend not to feel things, and your passion is your greatest asset.',
    square: 'Your emotions and your actions are at war. You may act impulsively when you are hurt, or you may feel paralyzed by anger that has nowhere to go. Relationships become battlegrounds because the people closest to you receive the full force of feelings you cannot contain. The breakthrough comes when you learn to channel this intensity into something constructive rather than reactive.',
    sextile: 'Your instincts and your drive work together when you give them conscious direction. You have a natural ability to sense what a situation requires and act on it quickly. Emotional intelligence meets decisiveness in a way that makes you effective in crisis.',
  },
  'Mars/Venus': {
    conjunction: 'Desire and attraction are fused in you — you know what you want and you go after it with a directness that is either magnetic or intimidating depending on who is receiving it. Sex and love are not separate categories for you; passion is the through-line of everything. The challenge is learning that not every attraction needs to be acted on immediately.',
    opposition: 'What you want and how you go after it are at odds. You may find yourself attracted to people who challenge you, or you create friction in love precisely because the passion runs so hot. The dynamic tension between pursuing and being pursued is the engine of your romantic life, and learning to hold both roles is the work.',
    trine: 'Your desires and your capacity to attract are in natural harmony. Romance flows easily, and there is an ease between your masculine and feminine energies that makes you comfortable in your own sexuality. The risk is coasting — your charm works so well that you never have to develop the depth that comes from struggle.',
    square: 'What you want and how you go after it are constantly clashing. You may find yourself attracted to people who challenge you, or you create friction in love precisely because the passion runs so hot. The sex and the arguments might feel like the same energy — because they are. Learning to slow down between desire and action is your lifelong edge.',
    sextile: 'Attraction and action cooperate in you when you make the effort. You have a natural sense of timing in romance — knowing when to pursue and when to receive. This subtle calibration gives you an advantage in love that others have to work much harder to develop.',
  },
  'Saturn/Sun': {
    conjunction: 'You were born carrying a weight that most people do not pick up until midlife. There is a seriousness in you — a sense of responsibility or limitation that colored your identity from an early age. You may have felt like you had to earn the right to exist, or that your father\'s expectations defined you before you could define yourself. The gift, which comes slowly, is an unshakable solidity that everyone eventually leans on.',
    opposition: 'Authority figures and your own identity are locked in a tug-of-war. You may struggle against limitation only to realize you are the one building the walls, or you might project your own discipline onto others and resent them for it. The mastery comes when you stop fighting structure and start building your own.',
    trine: 'Discipline comes naturally to you, and you age like fine wine. There is a quiet authority in your presence that commands respect without demanding it. You understand that real power is built slowly, and you have the patience to play the longest game in the room.',
    square: 'Your ambitions and your self-doubt are in constant friction. You want to achieve greatness, but something inside you — a critical voice, a fear of failure, a sense that you are not enough — keeps applying the brakes. The irony is that this tension is exactly what makes your achievements so solid when they finally arrive. Nothing you build is flimsy because nothing came easy.',
    sextile: 'Structure and identity work together when you put in the effort. You have a natural capacity for long-term planning and the discipline to follow through. Mentors and authority figures tend to recognize something in you that you may not yet see in yourself.',
  },
  'Saturn/Moon': {
    conjunction: 'Your emotional life was shaped by restriction, duty, or loss early on. You may have learned to suppress your needs, to be the responsible one, or to distrust your own feelings because vulnerability felt dangerous. The walls you built to protect yourself were necessary once — but they can become a prison if you forget that you are the one who holds the key.',
    opposition: 'Your need for emotional safety and your sense of duty pull in opposite directions. You may feel guilty for needing comfort, or you may armor yourself against vulnerability because someone taught you that feelings were a liability. Relationships can feel like obligations until you learn that letting someone in is not the same as letting your guard down.',
    trine: 'There is an emotional maturity in you that goes beyond your years. You understand that feelings are not frivolous — they carry weight, and you honor them with the seriousness they deserve. You are the person people come to when they need someone who will not flinch from the hard truths.',
    square: 'Your emotions and your sense of duty are in constant friction. You may feel that your needs are inconvenient, or that expressing vulnerability makes you weak. Depression or emotional heaviness can settle in when you deny yourself comfort for too long. The breakthrough comes when you realize that caring for yourself is not selfishness — it is the foundation everything else is built on.',
    sextile: 'Emotional discipline is a quiet strength in you. You have the ability to hold steady when others panic, and your feelings are grounded in a realism that prevents you from being swept away by fantasy. You earn trust because people sense that your emotional commitments are built to last.',
  },
  'Jupiter/Sun': {
    conjunction: 'You were born with an inner confidence that borders on the prophetic — a sense that life is fundamentally on your side. Your personality is expansive, generous, and optimistic in a way that opens doors others do not even see. The shadow is overreach — believing so deeply in your own potential that you overcommit, overpromise, or assume that enthusiasm alone will carry you through.',
    opposition: 'Your sense of self and your need for growth pull in opposite directions. You may feel torn between who you are and who you could become, or you might project your unlived potential onto mentors, teachers, or belief systems. The integration comes when you stop looking for your greatness in others and start living it.',
    trine: 'Luck and identity flow together naturally. You have an innate optimism and a bigness of spirit that attracts opportunity without effort. People trust you because you seem to trust life itself. The only risk is taking this grace for granted and never developing the grit that comes from genuine struggle.',
    square: 'Your identity and your need for growth are in productive tension. You may overextend yourself, promise more than you can deliver, or feel restless no matter how much you achieve. But this friction is exactly what prevents complacency — you are always reaching, always expanding, always becoming.',
    sextile: 'Opportunity supports your sense of self when you reach for it. You have a natural gift for being in the right place at the right time, but only if you show up. Mentors, travel, and education all serve your growth in ways that feel effortlessly aligned.',
  },
  'Saturn/Venus': {
    conjunction: 'Love feels like a serious matter to you — not because you lack warmth, but because you learned early that affection comes with conditions. You may have been denied love, made to earn it, or taught that relationships require sacrifice above pleasure. The result is someone who does not love lightly, but when you commit, your devotion is the most durable kind there is.',
    opposition: 'Your desire for love and your fear of vulnerability are locked in opposition. You may attract partners who are unavailable or withholding, or you may be the one who keeps people at arm\'s length because opening up feels like handing someone a weapon. The growth is learning that love and safety are not mutually exclusive.',
    trine: 'You bring a quiet stability to love that others find deeply reassuring. You are not interested in fireworks — you want something that lasts. There is a maturity in how you approach relationships, and you are drawn to partners who have done their own work. Your love deepens with time rather than fading.',
    square: 'Love and duty clash in you. You may feel that pleasure is something you have to earn, or that relationships require you to sacrifice parts of yourself. There can be a coldness or reserve that masks a deep longing for warmth. The work is learning that you deserve tenderness without having to pay for it.',
    sextile: 'Stability and affection cooperate in you when you allow both to exist. You have a natural ability to build relationships that are both loving and practical. Your partnerships tend to improve with time because you invest in them with the same discipline you bring to everything else.',
  },
  'Saturn/Mars': {
    conjunction: 'Your drive and your discipline are welded together. When you commit to something, you pursue it with a controlled intensity that is nearly impossible to stop. But there is a frustration built into this fusion — you may feel like you are always driving with the brakes on, or that your ambition is constantly being tested by obstacles that would break a lesser will.',
    opposition: 'Your need to act and your need to plan are locked in a standoff. You may swing between reckless impulsivity and paralyzing caution, or you might channel all your rage into work and wonder why you feel so burned out. The mastery comes when you learn to treat discipline as the amplifier of your power, not the cage around it.',
    trine: 'Ambition and endurance work together in you with an efficiency that others envy. You know how to pace yourself, how to conserve energy for what matters, and how to sustain effort long after everyone else has quit. Your achievements are not flashy — they are inevitable.',
    square: 'Your drive and your sense of limitation are in constant friction. You want to charge ahead, but something always slows you down — fear, responsibility, external obstacles, or your own harsh inner critic. The frustration is real, but it is also what forges your iron will. What you build under this pressure is indestructible.',
    sextile: 'Action and discipline cooperate when you direct them consciously. You have a natural ability to channel aggression into productive work, and your timing tends to be strategic rather than impulsive. Authority figures recognize your capacity for sustained effort.',
  },
  'Pluto/Sun': {
    conjunction: 'You came into this life with a mission to transform — yourself, and everything you touch. There is an intensity in your presence that people either gravitate toward or run from. You have stared into the abyss of your own nature, probably earlier than anyone should, and what you found there gave you a power that operates below the surface of normal life.',
    opposition: 'Power dynamics define your relationship with your own identity. You may attract controlling people, or you may be the one who needs to control. The projection is the lesson — what you see in others that threatens you is exactly the power you need to reclaim in yourself.',
    trine: 'Transformation comes naturally to you. You shed old versions of yourself with a fluidity that others find both inspiring and unsettling. There is a psychological depth to your self-awareness that gives you enormous influence — people sense that you have been through something and come out the other side.',
    square: 'Your identity and your need for transformation are in volatile friction. Power struggles — with others and with yourself — are a recurring theme. You may destroy and rebuild aspects of your life with an intensity that exhausts everyone around you. But this is your crucible: the pressure that turns carbon into diamond.',
    sextile: 'Transformation supports your identity when you lean into it consciously. You have a natural capacity for psychological insight, and you tend to grow the most during periods of upheaval that would flatten other people.',
  },
  'Pluto/Moon': {
    conjunction: 'Your emotional life operates at a depth that most people never reach. You feel everything with an intensity that can be overwhelming — to you and to others. There may be early experiences of loss, betrayal, or emotional manipulation that taught you how dangerous it is to be vulnerable. But that same depth gives you an emotional x-ray vision that sees through every pretense.',
    opposition: 'Your need for emotional safety and your compulsion toward intensity are locked in a power struggle. You may be drawn to emotionally extreme situations because they feel more real than peace. Relationships become arenas for control until you learn that intimacy does not require domination — and that being known does not mean being destroyed.',
    trine: 'Emotional depth and transformative power flow together in you naturally. You have an intuitive understanding of human psychology that borders on the uncanny. People reveal their secrets to you because they sense you can hold the weight of truth without flinching.',
    square: 'Your emotional needs and your need for control are in violent friction. You may manipulate without meaning to, or attract people who try to control you emotionally. Trust is the battlefield, and vulnerability feels like a risk you cannot afford. The breakthrough comes when you realize that the person you need to forgive most is yourself.',
    sextile: 'Emotional depth and psychological power work together when you channel them consciously. You have a natural ability to facilitate healing in others because you understand that transformation requires going into the darkness, not around it.',
  },
  'Pluto/Venus': {
    conjunction: 'Love, for you, is not a gentle thing. It is an obsession, a transformation, a death and rebirth. You love with an intensity that can devour — and when you are rejected or betrayed, the wound goes to the bone. You may attract partners who are complex, controlling, or transformative. The gift is a capacity for love so deep it changes the molecular structure of everyone it touches.',
    opposition: 'Your desire for love and your need for power are in direct opposition. You may be drawn to people who are dangerous for you, or you may be the one who wields too much power in relationships. The pattern repeats until you learn that real love does not require ownership.',
    trine: 'Love and transformation are natural partners in your life. You attract deep, meaningful connections that change you fundamentally. There is a magnetic quality to your affections — people sense that loving you will never be boring, and they are right.',
    square: 'Love and power clash in you with an intensity that creates volcanic relationships. Jealousy, possessiveness, and the fear of being consumed by love are ongoing themes. The passion is extraordinary, but so is the destructive potential. The growth edge is learning that love is not a battlefield — or if it is, you do not always need to win.',
    sextile: 'Deep love and personal transformation cooperate when you allow them to. You have a natural ability to bring hidden dynamics in relationships to the surface, and your partnerships tend to evolve over time in ways that are genuinely healing.',
  },
  'Pluto/Mars': {
    conjunction: 'Your willpower is nuclear. When you want something, you pursue it with an intensity that borders on obsession, and very few forces on Earth can stop you. But this power cuts both ways — channeled well, it makes you unstoppable; unchanneled, it can be self-destructive. You have probably already learned that your anger is not something to play with.',
    opposition: 'Your drive and your need for power are locked in a struggle that plays out through confrontation — with others and with yourself. You may attract enemies, or you may be your own worst adversary. The lesson is that real power does not need to dominate; it transforms.',
    trine: 'Willpower and transformative intensity work together with a devastating effectiveness. When you decide something, the universe seems to rearrange itself to accommodate. You do not bully your way through obstacles — you outlast them.',
    square: 'Your drive and your need for power are in explosive friction. You may be drawn to conflict, or conflict may find you regardless. There is a volcanic quality to your anger — it builds beneath the surface and erupts with devastating force. The mastery comes when you learn to harness this intensity without being consumed by it.',
    sextile: 'Raw power and strategic action cooperate when you direct them with awareness. You have a natural ability to regenerate after setbacks that would finish other people, and your determination deepens rather than weakens under pressure.',
  },
  'Mercury/Venus': {
    conjunction: 'Your mind and your heart speak the same language. You think beautifully — there is an elegance to how you process information and express ideas. You are probably charming in conversation, with a gift for saying exactly the right thing at the right moment. The shadow is that your desire to be pleasant can sometimes override your desire to be honest.',
    opposition: 'Your mind and your values pull in opposite directions. You may think one thing and desire another, or express opinions that contradict your actual feelings. The tension between head and heart creates a rich inner dialogue that, once integrated, gives you extraordinary insight into human nature.',
    trine: 'Communication and love flow together effortlessly. You express affection with grace, and your words carry warmth. Art, poetry, and beauty are not abstract concepts to you — they are the medium through which you understand the world.',
    square: 'Your thoughts and your desires are at odds. You may overthink your relationships or say things in love that you do not mean. There is a restlessness between what your mind wants and what your heart craves. The growth comes from learning that not everything beautiful needs to be analyzed, and not every thought needs to be spoken.',
    sextile: 'Your intellect and your sense of beauty cooperate when you give them room. You have a natural talent for creative expression and social diplomacy. Conversations with you tend to leave people feeling both stimulated and appreciated.',
  },
  'Mercury/Mars': {
    conjunction: 'Your mind is a weapon — fast, sharp, and always ready for a fight. You think quickly, speak directly, and have zero patience for people who cannot keep up. Debates excite you the way sports excite other people. The challenge is that your words can cut before you realize you are holding a blade.',
    opposition: 'Your thoughts and your actions pull in opposite directions. You may speak before you think, or overthink until the moment for action has passed. Arguments become a way of processing energy, and you may find that conflict clarifies your thinking in ways that peace does not.',
    trine: 'Your mind and your drive are in natural alignment. You think strategically, speak decisively, and execute efficiently. There is a quickness to your mental processes that gives you an edge in any competitive environment.',
    square: 'Your mind and your temper clash in ways that create both brilliant insights and regrettable outbursts. You may argue for sport, or your impatience may make you dismiss ideas before fully hearing them. The friction is productive — it sharpens your intellect — but it can alienate people who mistake your directness for aggression.',
    sextile: 'Sharp thinking and decisive action work together when you engage them consciously. You have a natural talent for debate, strategic communication, and thinking on your feet under pressure.',
  },
  'Jupiter/Saturn': {
    conjunction: 'Expansion and contraction live in the same breath inside you. You dream big and plan carefully — the visionary and the architect are fused. You may swing between blind optimism and crushing doubt, but when both energies are in sync, you build empires that other people only fantasize about.',
    opposition: 'Your need to grow and your need for security are in direct opposition. You may feel torn between taking risks and playing it safe, between faith and fear. The world seems to alternately offer you everything and take it away. Integration comes when you learn that growth and stability are not enemies — they are dance partners.',
    trine: 'Vision and structure cooperate naturally. You have the rare gift of dreaming practical dreams — ambitions that are large enough to inspire and grounded enough to achieve. You grow slowly but unstoppably, and your long-term trajectory is consistently upward.',
    square: 'Your optimism and your realism clash in a way that creates tremendous productive tension. You may overcommit and then face harsh consequences, or you may restrict yourself so severely that growth stalls. The friction between expansion and contraction forces you to find the narrow path between recklessness and paralysis.',
    sextile: 'Growth and discipline work together when you consciously balance them. You have a natural sense of how far to push and when to consolidate. This timing gives you an advantage in career and financial matters that compounds over decades.',
  },
  'Jupiter/Moon': {
    conjunction: 'Your emotional life is generous and expansive. You feel things on a grand scale — your joy is infectious, your sadness is oceanic, and your need for comfort extends far beyond yourself. You want to feed, shelter, and protect the world. The shadow is emotional excess — overindulging your feelings or using generosity to avoid dealing with pain.',
    opposition: 'Your emotional needs and your desire for growth pull in opposite directions. You may sacrifice emotional security for adventure, or cling to comfort at the expense of your potential. The integration comes when you realize that the biggest adventure is the one that takes place inside you.',
    trine: 'Emotional intelligence and wisdom flow together naturally. You have an innate optimism that buoys you through difficulty, and your feelings are your best compass for navigating life. People trust your emotional instincts because they are so often right.',
    square: 'Your emotions and your need for expansion clash in ways that create restlessness. You may eat, spend, or overcommit when you feel anxious, or you may feel that staying in one place emotionally will suffocate you. The growth comes from learning that depth and breadth are not the same thing.',
  },
  'Neptune/Sun': {
    conjunction: 'You are part artist, part mystic, part ghost. Your identity is fluid — you can be anyone, feel everything, dissolve into the collective like water into the ocean. This makes you extraordinarily creative and empathetic, but it also means you may struggle to know where you end and other people begin. Your life task is to give this boundless sensitivity a shape without losing the magic.',
    opposition: 'Your sense of self and your spiritual nature are in tension. You may idealize yourself, or you may feel perpetually disillusioned with who you are. Others may project their fantasies onto you, and you may lose yourself trying to live up to images that were never yours. The growth comes from accepting your humanity without losing your vision.',
    trine: 'Imagination and identity flow together naturally. You have a gift for channeling something larger than yourself — through art, music, healing, or spiritual practice. People sense a quality in you that is hard to name but impossible to ignore.',
    square: 'Your identity and your idealism clash in ways that create confusion. You may not know who you really are beneath the masks, or you may chase fantasies of yourself that dissolve on contact with reality. Addiction, escapism, and self-deception are real risks. But so is transcendence — when you stop trying to be perfect and start being real.',
  },
  'Neptune/Moon': {
    conjunction: 'Your emotional sensitivity is otherworldly. You absorb feelings from the atmosphere the way other people absorb oxygen — automatically and constantly. You may have grown up in an environment where emotional boundaries were nonexistent, leaving you unsure which feelings are yours and which belong to someone else. Your gift is a compassion so vast it can heal, and your challenge is learning not to drown in it.',
    opposition: 'Your emotional needs and your spiritual longings pull in opposite directions. You may idealize your family or your past, or use fantasy to escape feelings that are too painful to face directly. The growth comes from learning to be present with your real emotions instead of drifting into the version of reality you wish were true.',
    trine: 'Emotional depth and spiritual sensitivity flow together beautifully. You have an intuitive gift that borders on psychic — you sense what people feel before they say a word. Art, music, and water are medicine for you.',
    square: 'Your emotions and your imagination are in restless friction. You may struggle to distinguish between what you feel and what you imagine you feel. Boundaries dissolve too easily, and you may absorb other people\'s pain without realizing it. The work is grounding your sensitivity in reality without losing your magic.',
  },
  'Uranus/Sun': {
    conjunction: 'You are not like other people, and you knew it from the beginning. There is an electric quality to your identity — a need to break free, to shock, to exist on your own terms no matter the cost. You may have felt alienated early in life, but that alienation forged something original in you that the world eventually needs.',
    opposition: 'Your identity and your need for freedom are locked in opposition. You may rebel against yourself, or attract chaos that forces you to reinvent who you are. Relationships, careers, and identities may be disrupted suddenly and repeatedly until you learn that freedom and stability can coexist.',
    trine: 'Originality and identity flow together naturally. You are innovative without being disruptive, independent without being isolated. People accept your uniqueness because you wear it so comfortably.',
    square: 'Your identity and your need for freedom clash in ways that create sudden disruptions. You may sabotage your own stability because routine feels like death. The tension keeps you from ever becoming stagnant, but it can also prevent you from building anything that lasts. The growth comes from learning that some structures are scaffolding, not cages.',
  },
  'Uranus/Moon': {
    conjunction: 'Your emotional life is electric — unpredictable, unconventional, and resistant to anything that feels like emotional confinement. You may have experienced instability in early home life, and as a result, your need for freedom and your need for security exist in permanent tension. You feel safest when nothing is predictable, which is a contradiction most people cannot fathom.',
    opposition: 'Your need for emotional security and your need for independence are in direct opposition. You may crave closeness and push it away in the same breath, or attract relationships that are exciting but unstable. The work is finding a form of intimacy that does not feel like a cage.',
    trine: 'Emotional freedom and instinctive independence flow together naturally. You process feelings in unconventional ways, and your emotional resilience comes from an ability to detach without disconnecting.',
    square: 'Your emotions and your need for freedom clash in ways that create sudden emotional upheavals. You may panic when relationships get too close, or feel suffocated by domestic routines that everyone else finds comforting. The instability is the teacher — it forces you to find emotional security within yourself rather than in circumstances.',
  },
  'Jupiter/Venus': {
    conjunction: 'Love and abundance are fused in you. You love generously, attract easily, and believe in the best version of every relationship. Your romantic life tends toward excess — too much pleasure, too many partners, or expectations so grand that reality cannot match them. But your heart is genuinely warm, and your capacity for joy is a gift to everyone who knows you.',
    opposition: 'Your desire for love and your desire for more pull in opposite directions. You may over-idealize partners or lose interest once the thrill of the chase fades. The growth comes from learning that real love is not always an adventure — sometimes it is the quiet presence that remains after the fireworks end.',
    trine: 'Love and luck flow together beautifully. You attract good things and good people with a natural magnetism that feels effortless. Your sense of beauty is expansive, and your generosity in relationships is genuine and reciprocated.',
    square: 'Your desires and your sense of abundance clash in ways that create indulgence or dissatisfaction. You may want too much, spend too freely on love, or chase pleasures that leave you emptier than they found you. The friction is an invitation to find the difference between what feels good and what is good for you.',
  },
  'Neptune/Venus': {
    conjunction: 'You love with a devotion that borders on the sacred. Romance is not a pastime for you — it is a spiritual experience, and you seek the divine in the eyes of your beloved. The shadow is idealization so extreme that no real person can live up to it, and the disillusionment that follows can be devastating. Your greatest love story is learning to find the magic in what is real.',
    opposition: 'Your romantic ideals and your actual experience of love are in tension. You may chase fantasies, fall for unavailable people, or sacrifice yourself in relationships because you believe love should be selfless. The growth comes from learning that healthy love does not require you to dissolve.',
    trine: 'Romance and imagination flow together in a way that makes your love life feel like art. You attract through vulnerability and beauty, and your relationships have a poetic quality. Your capacity for unconditional love is genuine and rare.',
    square: 'Your romantic ideals and your reality clash painfully. You may love illusions, be deceived in love, or deceive yourself about who someone really is. Addiction to romance or to substances that simulate the feeling of love is a real risk. The work is learning to love what is real without losing your capacity to dream.',
  },
  'Mercury/Saturn': {
    conjunction: 'Your mind is disciplined, serious, and built for depth. You may have felt intellectually inadequate early in life — perhaps a learning difficulty, a critical teacher, or a sense that your thoughts were not welcome. But the result is a mind that earns its authority through rigor, and your words carry weight because you do not waste them.',
    opposition: 'Your thinking and your sense of authority pull in opposite directions. You may doubt your own intelligence, or speak with a gravity that intimidates others. The work is learning that your mind is not a courtroom — not every thought needs to be proven beyond reasonable doubt before you are allowed to share it.',
    trine: 'Mental discipline and structured thinking come naturally to you. You have a gift for concentration, for organizing complex information, and for communicating with precision. Your ideas are taken seriously because they are always well-considered.',
    square: 'Your thoughts and your fears are in friction. You may overthink, self-censor, or struggle with mental blocks that slow down your natural intelligence. Communication feels heavy — like every word has to carry the weight of certainty. The growth comes from learning that your mind does not have to be perfect to be brilliant.',
  },
  'Mercury/Jupiter': {
    conjunction: 'Your mind is expansive, optimistic, and hungry for meaning. You think in big pictures and grand narratives, and you have a natural talent for teaching, writing, and synthesizing complex ideas into compelling stories. The shadow is mental restlessness — too many ideas, too little follow-through, and a tendency to promise more than your schedule can deliver.',
    opposition: 'Your thinking and your beliefs pull in opposite directions. You may argue with your own philosophy, or swing between big-picture optimism and skeptical detail-orientation. The integration comes when you learn to think large without losing accuracy.',
    trine: 'Intellect and wisdom flow together naturally. You are a natural teacher and storyteller, with a gift for making complex ideas accessible. Your curiosity is broad and your optimism is contagious.',
    square: 'Your mind and your need for meaning are in productive friction. You may overpromise intellectually, take on too many projects, or struggle with the gap between what you envision and what you can execute. The tension keeps your mind sharp and your ambitions honest.',
  },
  'Mercury/Pluto': {
    conjunction: 'Your mind penetrates to the core of everything. You do not accept surface explanations — you dig until you find the truth, even when the truth is uncomfortable. You may have a talent for research, psychology, or investigation. Your words carry power because they come from a place of unflinching honesty. The shadow is obsessive thinking and the inability to let go of an idea once it has its hooks in you.',
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
  const entry = PLANET_PAIR_INSIGHTS[key1] || PLANET_PAIR_INSIGHTS[key2];
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

  // Fallback: rich generic interpretation
  const p1Meaning = PLANET_MEANINGS[planet1];
  const p2Meaning = PLANET_MEANINGS[planet2];

  let interp = `**${planet1} ${info.label.toLowerCase()} ${planet2}** *(${info.nature})*\n\n`;
  interp += `${info.description}\n\n`;

  if (p1Meaning && p2Meaning) {
    interp += `In your chart, the part of you that is ${firstSentence(p1Meaning).toLowerCase().replace(/^your /, '').replace(/\.$/, '')} is ${info.nature.toLowerCase()}-linked to the part of you that is ${firstSentence(p2Meaning).toLowerCase().replace(/^your /, '').replace(/\.$/, '')}. These two forces shape each other constantly — you cannot express one without the other showing up uninvited.`;
  } else if (p1Meaning) {
    interp += `${firstSentence(p1Meaning)} This energy is ${info.nature.toLowerCase()}-linked to ${planet2}, coloring how both express through you.`;
  } else if (p2Meaning) {
    interp += `${firstSentence(p2Meaning)} This energy is ${info.nature.toLowerCase()}-linked to ${planet1}, coloring how both express through you.`;
  }

  return interp;
}

export function getHouseInterpretation(houseNum: number, sign: string): string {
  const houseMeaning = HOUSE_IN_CHART[houseNum];
  if (!houseMeaning) return '';

  const signMeaning = SIGN_IN_CHART[sign];

  let interp = `Your ${ordinal(houseNum)} house is where ${houseMeaning.charAt(0).toLowerCase()}${houseMeaning.slice(1)}\n\n`;

  if (signMeaning) {
    interp += `With ${sign} ruling this area of your life, ${signMeaning}`;
  }

  return interp;
}

export function getPlacementInterpretation(planetName: string, sign: string, house: number): string {
  const planetMeaning = PLANET_MEANINGS[planetName];
  const signMeaning = SIGN_IN_CHART[sign];
  const houseMeaning = HOUSE_IN_CHART[house];

  if (!planetMeaning) return '';

  let interp = `${planetName} is ${planetMeaning.charAt(0).toLowerCase()}${planetMeaning.slice(1)}\n\n`;

  if (signMeaning) {
    interp += `With your ${planetName} in ${sign}, ${signMeaning}\n\n`;
  }

  if (houseMeaning) {
    interp += `Placed in your ${ordinal(house)} house, this energy ${houseMeaning.charAt(0).toLowerCase()}${houseMeaning.slice(1)}`;
  }

  return interp;
}
