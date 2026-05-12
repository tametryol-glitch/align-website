export const PLANET_GLYPHS: Record<string, string> = {
  Sun: '\u2609', Moon: '\u263D', Mercury: '\u263F', Venus: '\u2640', Mars: '\u2642',
  Jupiter: '\u2643', Saturn: '\u2644', Uranus: '\u2645', Neptune: '\u2646', Pluto: '\u2647',
  'North Node': '\u260A', 'South Node': '\u260B', Chiron: '\u26B7',
  Juno: '\u26B5', Vesta: '\u26B6', Eros: '\u2763', Psyche: '\u03A8',
  Lilith: '\u26B8', Ceres: '\u26B3', Pallas: '\u26B4', Urania: '\u26B9',
  Ascendant: 'AC', Descendant: 'DC', MC: 'MC', IC: 'IC',
  Vertex: 'Vx', 'Anti-Vertex': 'AVx',
  'Part of Fortune': '\u2297', 'Part of Spirit': '\u2299',
};

export const ASPECT_SYMBOLS: Record<string, string> = {
  conjunction: '\u260C',
  sextile: '\u26B9',
  square: '\u25A1',
  trine: '\u25B3',
  opposition: '\u260D',
  quincunx: '\u26BB',
};

export const ASPECT_COLORS: Record<string, string> = {
  conjunction: '#F5A623',
  trine: '#10B981',
  square: '#EF4444',
  sextile: '#3B82F6',
  opposition: '#F59E0B',
  quincunx: '#8B5CF6',
};

export const TRANSIT_HEADLINES: Record<string, Record<string, string[]>> = {
  Jupiter: {
    conjunction: ['The Universe Is Saying Yes', 'Doors Are Opening You Didn\'t Know Existed', 'Your Expansion Window Is Here'],
    trine: ['The Wind Is at Your Back', 'Growth Without the Growing Pains', 'Good Fortune Finds You Now'],
    sextile: ['An Opportunity Whispers — Will You Hear It?', 'Small Doors Lead to Big Rooms', 'The Universe Nudges You Forward'],
    square: ['Growing Pains That Build Something Real', 'The Stretch That Changes Everything', 'Too Big for Where You\'ve Been'],
    opposition: ['Someone Holds the Mirror Up', 'The Choice Between Safe and Extraordinary', 'What Others Reveal About Your Potential'],
  },
  Saturn: {
    conjunction: ['The Reckoning You\'ve Been Avoiding', 'What\'s Real Stays — Everything Else Falls Away', 'Your Foundation Is Being Tested'],
    trine: ['Slow and Steady Wins This One', 'Mastery Is Built in Moments Like This', 'The Discipline That Pays Off'],
    sextile: ['Structure Becomes Your Superpower', 'Small Systems Create Big Results', 'The Quiet Work That Matters Most'],
    square: ['The Wall That Makes You Stronger', 'Pressure That Forges Diamonds', 'You\'re Being Tested — And You\'ll Pass'],
    opposition: ['The Weight of What\'s Expected vs. What You Want', 'Responsibility Calls — How Will You Answer?', 'The Balance Between Duty and Desire'],
  },
  Uranus: {
    conjunction: ['Lightning Strikes Your Life', 'Nothing Will Be the Same After This', 'The Awakening You Can\'t Ignore'],
    trine: ['Freedom Arrives in an Unexpected Form', 'The Breakthrough You Didn\'t See Coming', 'Change That Actually Feels Good'],
    sextile: ['A Flash of Genius Changes Your Approach', 'The Unconventional Path Opens', 'Innovation Knocks Softly'],
    square: ['Something Has to Break Before It Can Rebuild', 'The Cage You Didn\'t Know You Were In', 'Restlessness That Refuses to Be Ignored'],
    opposition: ['Someone Shakes Your World Awake', 'The Shock That Sets You Free', 'What You Thought Was Permanent... Isn\'t'],
  },
  Neptune: {
    conjunction: ['The Veil Between Worlds Is Thin', 'Reality Dissolves — Trust What Remains', 'Your Soul Is Trying to Show You Something'],
    trine: ['Intuition Becomes Your Compass', 'The Dream That Wants to Become Real', 'Creative Magic Flows Through You'],
    sextile: ['A Whisper from Your Higher Self', 'Spiritual Doors Crack Open', 'The Subtle Knowing You Can\'t Explain'],
    square: ['Lost in the Fog — But Not Forever', 'What You Believed Is Being Questioned', 'The Illusion That Needed to Shatter'],
    opposition: ['Dreams Meet Reality — Something Has to Give', 'The Projection You\'re Finally Seeing Through', 'Not Everyone Is Who They Appear to Be'],
  },
  Pluto: {
    conjunction: ['The Death That Births Something Powerful', 'You\'re Being Reforged From the Inside', 'Total Transformation — No Half Measures'],
    trine: ['Power Rises From Deep Within', 'You Have Access to Strength You Forgot You Had', 'The Transformation That Flows Naturally'],
    sextile: ['Hidden Power Becomes Available', 'The Courage to Face What You\'ve Avoided', 'Quiet Transformation With Lasting Impact'],
    square: ['Forces Beyond Your Control Are Moving', 'The Power Struggle That Reshapes You', 'Surrender the Grip — The Rebirth Is Coming'],
    opposition: ['Face to Face With Your Shadow', 'Power Dynamics Come to a Head', 'The Confrontation That Changes Everything'],
  },
  Mars: {
    conjunction: ['Fire Ignites in Your Chart', 'The Drive to Act Is Undeniable', 'Raw Energy Demands Direction'],
    trine: ['Momentum Carries You Forward', 'Action Produces Results Right Now', 'Your Energy Is Perfectly Aligned'],
    sextile: ['A Burst of Initiative Opens Doors', 'The Push You Needed Arrives', 'Productive Fire Fuels Your Next Move'],
    square: ['Friction Sparks — Channel It or It Burns', 'The Tension That Demands Movement', 'Anger Is a Messenger — Listen to It'],
    opposition: ['Someone Challenges You Directly', 'The Confrontation You Can\'t Sidestep', 'Assert Yourself or Get Pushed Around'],
  },
  Venus: {
    conjunction: ['Love and Beauty Touch Everything', 'Your Magnetism Is Amplified', 'The Heart Opens — Let It'],
    trine: ['Sweetness Flows Into Your World', 'Relationships Feel Easy Right Now', 'Allow Yourself to Receive'],
    sextile: ['A Gentle Wave of Connection Arrives', 'Small Pleasures Carry Deep Meaning', 'Beauty Finds You in Unexpected Places'],
    square: ['What You Want vs. What\'s Available', 'The Tension in Your Heart Has a Message', 'Desire Creates Friction — And Clarity'],
    opposition: ['Love Holds Up a Mirror', 'What Someone Else Shows You About Yourself', 'The Balance Between Giving and Receiving'],
  },
  Mercury: {
    conjunction: ['Your Mind Is Electric Right Now', 'The Idea That Changes Your Direction', 'Words Carry Extra Power Today'],
    trine: ['Clarity Cuts Through the Noise', 'The Conversation That Shifts Everything', 'Your Thinking Is Sharp and Clear'],
    sextile: ['The Right Information Finds You', 'A Connection That Opens New Pathways', 'Mental Agility at Its Peak'],
    square: ['Miscommunication Hides a Deeper Truth', 'The Mental Storm Before Clarity', 'Overthinking Is the Enemy Right Now'],
    opposition: ['Someone Says What You Need to Hear', 'Perspectives Collide — Both Are Valid', 'Listen Between the Lines'],
  },
  Sun: {
    conjunction: ['The Spotlight Falls on You', 'Your Vitality Is Being Renewed', 'Step Into the Light — You\'re Ready'],
    trine: ['Confidence Flows Naturally', 'The Sun Shines on Your Path', 'Self-Expression Comes Effortlessly'],
    sextile: ['A Quiet Surge of Confidence', 'Your Identity Gets a Gentle Boost', 'Creative Vitality Stirs'],
    square: ['Your Identity Is Under Pressure — And Growing', 'The Ego Check That Makes You Stronger', 'Who You Were vs. Who You\'re Becoming'],
    opposition: ['Others Reflect Your True Self Back', 'The Mirror You Can\'t Look Away From', 'Self-Awareness Through Contrast'],
  },
  Moon: {
    conjunction: ['Emotions Rise to the Surface', 'Your Inner World Demands Attention', 'Feel Everything — Then Choose'],
    trine: ['Emotional Peace Washes Over You', 'Your Heart Knows the Way', 'Instinct and Intention Align'],
    sextile: ['A Soft Opening in Your Emotional World', 'Trust the Feeling That Won\'t Leave', 'Gentle Emotional Clarity Arrives'],
    square: ['Emotional Friction Reveals What Matters', 'The Feeling You Can\'t Push Down Anymore', 'Inner Tension Demands Honesty'],
    opposition: ['Your Needs vs. Everyone Else\'s', 'The Emotional Tug-of-War Within', 'What You Feel vs. What You Show'],
  },
};

export const NATAL_PLANET_MODIFIERS: Record<string, string> = {
  Sun: '— Your Identity',
  Moon: '— Your Emotional Core',
  Mercury: '— Your Mind',
  Venus: '— Your Heart',
  Mars: '— Your Drive',
  Jupiter: '— Your Growth',
  Saturn: '— Your Foundation',
  MC: '— Your Career',
  ASC: '— Your Self-Image',
  Midheaven: '— Your Career',
  Ascendant: '— Your Self-Image',
  Uranus: '— Your Awakening',
  Neptune: '— Your Intuition',
  Pluto: '— Your Power',
  Juno: '— Your Partnerships',
  Vesta: '— Your Devotion',
};

export const PLANET_CARD_THEMES: Record<string, { gradient: [string, string, string]; glow: string; accent: string }> = {
  Jupiter: { gradient: ['#1a0a3e', '#3b1f7a', '#6b3fa0'], glow: '#8B5CF6', accent: '#A78BFA' },
  Saturn: { gradient: ['#1a1a2e', '#2d2d4a', '#4a4a6a'], glow: '#6B7280', accent: '#9CA3AF' },
  Uranus: { gradient: ['#001a2c', '#003d5c', '#0077b6'], glow: '#00B4D8', accent: '#48CAE4' },
  Neptune: { gradient: ['#0a1628', '#162d50', '#1e4d78'], glow: '#7C3AED', accent: '#A78BFA' },
  Pluto: { gradient: ['#1a0000', '#3d0a0a', '#6b1a1a'], glow: '#DC2626', accent: '#F87171' },
  Mars: { gradient: ['#2a0a00', '#5c1a00', '#8b3a10'], glow: '#F97316', accent: '#FB923C' },
  Venus: { gradient: ['#2a0a1e', '#5c1a3d', '#8b3a5c'], glow: '#EC4899', accent: '#F472B6' },
  Mercury: { gradient: ['#0a1a0a', '#1a3d1a', '#2d5c2d'], glow: '#10B981', accent: '#34D399' },
  Sun: { gradient: ['#2a1a00', '#5c3d00', '#8b6b10'], glow: '#F59E0B', accent: '#FBBF24' },
  Moon: { gradient: ['#0a0a1a', '#1a1a3d', '#2d2d5c'], glow: '#818CF8', accent: '#A5B4FC' },
};

export const QUINCUNX_HEADLINES: Record<string, string[]> = {
  Jupiter: ['The Growth That Doesn\'t Fit the Plan', 'Adjusting Course Without Losing Faith'],
  Saturn: ['The Uncomfortable Restructuring Has Begun', 'Something Doesn\'t Fit — And That\'s the Point'],
  Uranus: ['Reinvention Comes Whether You\'re Ready or Not', 'The Restless Itch That Won\'t Go Away'],
  Neptune: ['Your Spirit Is Asking for a Redirect', 'The Spiritual Adjustment Period'],
  Pluto: ['The Shift You Can\'t Control — Only Navigate', 'Deep Forces Pull You in a New Direction'],
  Mars: ['Your Energy Needs a New Outlet', 'Fighting in the Wrong Direction? Pivot.'],
  Venus: ['What You Value Is Being Recalibrated', 'The Heart Wants What the Heart Wants — But Does It?'],
  Mercury: ['Everything You Thought You Knew — Reconsider', 'Your Mind Is Being Rewired'],
  Sun: ['Your Purpose Is Being Redirected', 'Identity Meets an Uncomfortable Truth'],
  Moon: ['Emotions That Don\'t Make Sense Yet', 'The Feelings You Can\'t Quite Name'],
};

export const PLANET_ESSENCE: Record<string, string[]> = {
  Jupiter: ['Your Biggest Leap Forward Starts Here', 'Expansion Meets Your Life'],
  Saturn: ['The Test That Proves What\'s Real', 'Reality Checks In — For Your Own Good'],
  Uranus: ['Expect the Unexpected', 'The Lightning Bolt Moment'],
  Neptune: ['Between Worlds — Trust the Process', 'Something Mystical Stirs'],
  Pluto: ['The Metamorphosis Has Begun', 'Stripped Down to Rebuild Stronger'],
  Mars: ['Fuel Meets Fire in Your Chart', 'The Push to Move — Now'],
  Venus: ['Your Heart Is Being Activated', 'Beauty Enters the Picture'],
  Mercury: ['A Message You Need to Hear', 'Your Mind Is Buzzing'],
  Sun: ['A Light Turns On', 'Vitality Returns'],
  Moon: ['Your Emotional Compass Shifts', 'Feelings Demand Attention'],
  'North Node': ['Destiny Taps You on the Shoulder', 'The Path Forward Becomes Clearer'],
  'South Node': ['Letting Go of What No Longer Serves You', 'The Past Releases Its Grip'],
  Chiron: ['The Wound That Becomes Wisdom', 'Healing Arrives in Disguise'],
  Vesta: ['Sacred Focus Intensifies', 'Devotion Takes a New Form'],
  Juno: ['Partnership Energy Shifts', 'Commitment Comes Into Question'],
};

export const TRANSIT_NAVIGATION_ADVICE: Record<string, Record<string, string>> = {
  Jupiter: {
    conjunction: 'This is your green light. Jupiter conjunctions reward boldness — not recklessness, but genuine courage to expand. Ask for more than you think you deserve right now. Apply for the thing, pitch the idea, start the project. The universe is backing your growth, but only if you actually move. Do not sit on this energy waiting for the perfect moment. The perfect moment is this one.',
    trine: 'You are in a rare flow state where effort meets reward naturally. The danger is coasting — because things come easy, you might not push hard enough. Use this window to lock in long-term gains. Sign the deal, build the habit, deepen the relationship. What you establish during this trine has staying power that outlasts the transit itself.',
    sextile: 'Opportunity is knocking softly, not banging down the door. You have to meet it halfway. Look for invitations, introductions, and subtle openings that seem small but lead somewhere real. Follow up on the conversation. Reply to the email. Say yes to the coffee. Jupiter sextiles reward people who show up.',
    square: 'The restlessness you feel is not a problem — it is a signal that you have outgrown something. Do not numb it. Do not distract yourself from it. Sit with the tension and ask: what am I tolerating that no longer fits? The answer to that question is your next move. Growth is uncomfortable before it is liberating.',
    opposition: 'Someone in your life is showing you a version of yourself you have not fully claimed yet. Pay close attention to who is triggering you, inspiring you, or challenging you right now. They are mirrors. What they reflect back is not about them — it is about the potential inside you that wants permission to exist.',
  },
  Saturn: {
    conjunction: 'This is not a punishment. It is an audit. Saturn is checking the foundation of everything you have built in this area of your life, and what is solid will remain. What is not solid will crack — and that is a gift, even if it does not feel like one. Your job right now is radical honesty. Where have you been cutting corners? Fix it now. What you repair during this transit becomes permanent.',
    trine: 'You have the discipline and the focus to build something that lasts right now. This is not dramatic energy — it is brick-by-brick energy. Create the system. Stick to the routine. Do the boring work that nobody sees. This is the transit where compound interest applies to everything — relationships, career, health. Small consistent actions create massive results.',
    sextile: 'A window of practical clarity is open. Your ability to organize, plan, and execute is heightened. Use it for the thing you keep putting off — the budget, the filing, the difficult conversation that needs structure. Saturn sextiles do not hand you gifts. They hand you the tools to build your own.',
    square: 'You are being squeezed on purpose. Saturn squares feel like hitting a wall, but the wall is showing you exactly where you need to become stronger. Do not quit. Do not complain about the unfairness. Channel every ounce of frustration into doing better work. The people who endure Saturn squares emerge with an authority that cannot be faked.',
    opposition: 'There is a tension between what you want and what is being asked of you. You cannot have both right now — you have to choose. And the mature choice is usually the harder one. This is not about sacrifice. It is about knowing which commitments are real and which ones are convenient. Honor the real ones.',
  },
  Uranus: {
    conjunction: 'Your old way of doing this is over. Uranus conjunctions do not ask for permission — they simply change the game. Instead of clinging to what was, get curious about what is emerging. The version of you that existed before this transit is being upgraded. Let the software update run. Resistance makes it harder, not better.',
    trine: 'Fresh ideas and unexpected solutions are available to you right now. Try the unconventional approach. Talk to the person you normally would not. Take the route you have never taken. Uranus trines reward experimentation, not perfection. Give yourself permission to be a beginner at something new.',
    sextile: 'A small innovation can change everything right now. You do not need a revolution — you need a better system, a fresh perspective, or one conversation with someone outside your usual circle. Uranus sextiles deliver breakthroughs disguised as minor adjustments.',
    square: 'Something feels suffocating and you cannot ignore it anymore. Before you blow everything up, ask yourself what specifically needs to change. It is usually not everything — it is one thing you have been tolerating. Address that one thing directly. Calculated rebellion is powerful. Reactive destruction is just chaos.',
    opposition: 'The disruption is coming from outside you — a person, an event, a sudden shift you did not plan for. You cannot control it. What you can control is how you respond. Flexibility is your superpower during this transit. The more rigid you are, the more it breaks. Bend with it.',
  },
  Neptune: {
    conjunction: 'Your boundaries between real and imagined are dissolving right now. This is beautiful for creativity, spirituality, and compassion — but dangerous for decisions that require clarity. Do not sign anything you do not fully understand. Do not commit to anyone who feels too good to be true. Trust your intuition for direction, but verify everything with facts before acting.',
    trine: 'Your creative and spiritual channels are wide open. This is the transit for art, music, meditation, and healing work. Let yourself flow without needing to explain or justify what you are creating. The logical mind cannot access what Neptune is offering you. Let your soul lead for a while.',
    sextile: 'A quiet nudge from your intuition is trying to guide you. Do not dismiss the dream, the gut feeling, or the sense that something means more than it appears. Neptune sextiles speak in whispers. Get still enough to hear them. A short meditation or journaling session will reveal more than hours of analysis.',
    square: 'Something you believed is crumbling, and the confusion feels disorienting. This is Neptune stripping away an illusion you needed to lose. Do not make any major decisions while the fog is thick. Wait. Let the clarity come to you instead of chasing it. In the meantime, avoid alcohol, escapism, and anyone who offers easy answers to hard questions.',
    opposition: 'Someone or something is not what they appear to be. Or — you have been projecting your ideal onto a situation that cannot hold it. Either way, Neptune oppositions demand you see clearly, even when you would rather keep dreaming. Compassion and discernment are not opposites. You can love someone and still see them honestly.',
  },
  Pluto: {
    conjunction: 'You are in the middle of a complete transformation whether you chose it or not. The old identity, the old pattern, the old way of operating in this area — it is dying. Let it. Grief is appropriate. But so is anticipation, because what Pluto births from the ashes is always more powerful than what it destroys. Your only job is to stop protecting what needs to go.',
    trine: 'You have access to a deep well of personal power right now. Use it deliberately. This is the transit for therapy, shadow work, strategic planning, and any endeavor that requires you to go beneath the surface. Changes you make now come from genuine inner authority — not ego, not fear. That is why they last.',
    sextile: 'A quiet transformation is available if you are willing to face something you have been avoiding. It does not require drama. It requires honesty. One conversation, one decision, one admission of truth can shift everything. Pluto sextiles give you the courage to look at what you normally look away from.',
    square: 'Power dynamics are being exposed. Whether it is a relationship, a work situation, or your relationship with yourself — the question is: who is actually in control, and is that arrangement serving you? Stop giving your power away to things that do not deserve it. And stop trying to control things that are not yours to control. Find the middle.',
    opposition: 'Someone is forcing you to confront a part of yourself you would rather ignore. The confrontation might be external — a person, an institution, a situation. But the real battle is internal. What are you afraid of losing? What are you afraid of becoming? The answers to those questions are the keys to navigating this transit.',
  },
  Mars: {
    conjunction: 'Your energy is through the roof right now. The question is not whether you have the drive — it is whether you have a target. Unfocused Mars energy becomes anger, impatience, and accidents. Focused Mars energy is unstoppable. Pick one thing and attack it with everything you have. Physical exercise is non-negotiable during this transit — burn the excess fire or it burns you.',
    trine: 'You are in an action window where effort translates directly to results. Do not overthink — do. Start the workout. Send the message. Begin the project. Mars trines do not reward planning — they reward movement. Your body and your instincts are sharper than your mind right now. Trust them.',
    sextile: 'A productive burst of energy is available for the next step you have been hesitating on. Mars sextiles do not give you a full tank — they give you enough fuel to start. And starting is the hardest part. Once you are in motion, momentum takes over. Take the first step today, not tomorrow.',
    square: 'Friction is high and your patience is low. Someone or something is pushing your buttons and the urge to react is strong. Before you fire back, ask yourself: will this response serve me in 24 hours? Mars squares test your emotional maturity. The win is not in the fight — it is in choosing which fights matter.',
    opposition: 'Someone is challenging you directly. They might be right, they might be wrong — that is beside the point. The point is how you handle it. Assert yourself without aggression. Stand your ground without digging a trench. Mars oppositions teach you that strength is not the same as force.',
  },
  Venus: {
    conjunction: 'Beauty, pleasure, and connection are amplified right now. Your magnetism is higher than usual. Use it with intention. This is an excellent window for deepening a relationship, creating art, or making yourself feel genuinely good. Buy the thing that makes you feel beautiful. Have the dinner. Say the kind thing you have been thinking but not saying.',
    trine: 'Love and harmony flow easily right now. Do not overcomplicate it. Accept the compliment. Receive the invitation. Let the relationship be easy for once. Venus trines remind you that not everything has to be a struggle. Some things are simply gifts — your job is to let them in without questioning whether you deserve them.',
    sextile: 'A gentle opening for connection or creativity is available. It will not announce itself loudly — it shows up as a smile from a stranger, an idea for a project, or a moment of unexpected beauty. Venus sextiles reward noticing. Slow down enough to see the small pleasures that are already present in your day.',
    square: 'There is a gap between what you want and what is available right now. That gap is not a punishment — it is information. What you are craving tells you something important about what you value. Instead of grasping, get clear. Write down what you actually want in this area of your life. Clarity precedes manifestation.',
    opposition: 'A relationship is holding up a mirror. What you admire in someone else is a quality you have not fully owned in yourself. What irritates you is something you have not fully accepted. Venus oppositions are not about the other person — they are about what the other person reveals in you. Look honestly.',
  },
  Mercury: {
    conjunction: 'Your mind is electric and your words carry weight. This is the transit for writing, speaking, negotiating, and making your ideas heard. But speed creates carelessness — slow down enough to say what you mean, not just what comes out first. The best use of this energy is a conversation you have been preparing for or an idea you are ready to pitch.',
    trine: 'Mental clarity is at its peak. Complex problems have simple solutions right now — you just need to sit with them long enough to see the pattern. This is also excellent energy for learning something new. Pick up the book, take the course, have the intellectual conversation that stretches your thinking.',
    sextile: 'The right information is trying to find you. Pay attention to what lands in your inbox, your feed, or your conversations today. Mercury sextiles deliver insight through ordinary channels — the trick is recognizing it. A useful connection, a relevant article, or a passing comment could change your approach to something important.',
    square: 'Your mind is working overtime and it is creating more noise than signal. Overthinking is the enemy right now. You do not need more information — you need to act on what you already know. If a conversation goes sideways, do not escalate. Pause. Restate. Ask clarifying questions instead of making assumptions.',
    opposition: 'Someone has a perspective you need to hear, even if you disagree with it. Mercury oppositions are not about being right — they are about expanding how you think. Listen more than you speak during this transit. The insight you need is in what someone else is trying to tell you, not in what you already believe.',
  },
  Sun: {
    conjunction: 'Your vitality and sense of self are being renewed. Step into the spotlight — share your work, express your opinion, take up space. The Sun conjunction gives you a confidence boost that is backed by genuine substance. This is not ego — it is alignment. You are being reminded of who you actually are underneath all the roles you play.',
    trine: 'You feel like yourself today — the real version, not the performing version. Lean into it. Make decisions from this centered place. Sun trines align your outer expression with your inner truth, and things that match your authentic self flow toward you. Use this window to commit to what is genuinely yours.',
    sextile: 'A quiet confidence is available. You do not need to prove anything right now — just show up as yourself. Sun sextiles reward authenticity over performance. Express something true about who you are. Create something that reflects your actual taste, not what you think others want.',
    square: 'Your identity is being challenged — by circumstances, by other people, or by your own inner critic. The discomfort is not a sign that something is wrong. It is a sign that you are outgrowing a version of yourself that used to fit but no longer does. Let the old skin shed. Who you are becoming is bigger than who you were.',
    opposition: 'Others are reflecting parts of you that you cannot see on your own. The person who inspires you is showing you your own unused potential. The person who frustrates you is showing you your own unresolved shadow. Do not project — integrate. Everything outside you during this transit is a message about what is inside you.',
  },
  Moon: {
    conjunction: 'Your emotions are running the show right now, and that is not a bad thing — if you listen to them instead of reacting to them. Feel everything fully, but do not make permanent decisions based on temporary feelings. Nurture yourself during this transit. Rest, eat well, be around people who feel safe. Your emotional body is doing important work.',
    trine: 'Emotional clarity and inner peace are available today. Your instincts are accurate — trust them. This is a beautiful time for intimate conversations, self-care, and connecting with the people who know you best. Moon trines remind you that feeling good is not indulgent — it is necessary. Let yourself be comfortable.',
    sextile: 'A soft emotional opening is happening. You might feel more tender than usual, more connected to your needs. Do not dismiss it as weakness. Moon sextiles are asking you to honor what you feel without judging it. A small act of self-care — a bath, a walk, calling someone you love — will go further than you think.',
    square: 'Emotional friction is high. You might feel pulled between what you need and what is expected of you, or between different feelings that seem to contradict each other. Both are valid. You do not have to choose one feeling over another — you have to feel them both and still act wisely. Take your time before reacting.',
    opposition: 'Your inner world and your outer world are at odds. What you feel privately does not match what you are showing publicly. That gap is exhausting. This transit is asking you to close it — not by performing more convincingly, but by being more honest about what you actually need. Tell someone the truth about how you are feeling.',
  },
};

export const NATAL_NAVIGATION_CONTEXT: Record<string, string> = {
  Sun: 'Because this transit touches your Sun, your identity and sense of purpose are directly involved. Decisions you make now shape who you are becoming.',
  Moon: 'This transit is activating your Moon — your emotional core. Pay extra attention to your feelings, your needs, and your sense of security right now.',
  Mercury: 'Your Mercury is being activated, which means your thinking patterns, communication style, and decision-making are all in play. Choose your words with care.',
  Venus: 'With your Venus involved, matters of love, beauty, values, and self-worth are center stage. How you relate to others — and to yourself — is the key theme.',
  Mars: 'Your Mars is being triggered, which means your drive, ambition, and anger are all heightened. Channel this fire into action, not reaction.',
  Jupiter: 'Your natal Jupiter is involved, amplifying themes of growth, faith, and expansion. The question is whether you are thinking big enough.',
  Saturn: 'Your Saturn is being activated — themes of responsibility, discipline, and long-term consequences are in focus. Build for the future, not for today.',
  Uranus: 'With your natal Uranus involved, expect the unexpected in how this plays out. Stay flexible and open to solutions you have not considered.',
  Neptune: 'Your Neptune is part of this picture, adding a layer of intuition, idealism, and potential confusion. Trust your gut but verify with facts.',
  Pluto: 'Your natal Pluto is activated, intensifying everything. Power dynamics, deep truths, and transformation are all amplified. Go deep or go home.',
  ASC: 'This transit directly impacts your Ascendant — how you appear to others and how you move through the world. First impressions carry extra weight now.',
  Ascendant: 'This transit directly impacts your Ascendant — how you appear to others and how you move through the world. First impressions carry extra weight now.',
  MC: 'Your Midheaven is involved, making this about your career, public reputation, and life direction. Professional moves made now have lasting impact.',
  Midheaven: 'Your Midheaven is involved, making this about your career, public reputation, and life direction. Professional moves made now have lasting impact.',
  Juno: 'Your Juno is activated — partnership, commitment, and what you need in a relationship are the undercurrents of this transit.',
  Vesta: 'With your Vesta involved, themes of devotion, sacred focus, and what you dedicate yourself to are heightened. Protect your energy for what truly matters.',
};

export const TRANSIT_CYCLE_MEANINGS: Record<string, Record<string, string>> = {
  Jupiter: {
    conjunction: 'This is one of the most powerful expansion cycles you can experience. Jupiter is sitting directly on this point in your chart, amplifying everything it touches. Opportunities you could not have imagined are forming right now. This is the universe saying YES — the question is whether you are ready to receive. New doors are opening in areas you may have given up on. Trust the expansion, even if it feels unfamiliar. Growth always feels uncomfortable before it feels natural. Say yes to more, ask for more, expect more. This cycle happens roughly once every 12 years, so do not waste it playing small.',
    trine: 'Jupiter is sending a wave of supportive, harmonious energy to this part of your chart. Unlike the intensity of harder aspects, this one feels like flow — things that were stuck begin to move, conversations lead to opportunities, and luck seems to find you in unexpected places. The danger of this cycle is complacency. Because things come easier now, you might coast instead of capitalizing. Use this window actively. The trine gives you the wind at your back — but you still need to set the sails.',
    sextile: 'A gentle but real opportunity window is opening. Jupiter sextile this point creates potential, but it requires your participation to activate. Look for invitations, introductions, and subtle openings in conversations. Someone may offer you something that seems small but leads somewhere significant. This is not a dramatic cycle — it is a smart one. The people who benefit most from Jupiter sextiles are the ones who recognize opportunity when it whispers instead of waiting for it to shout.',
    square: 'Jupiter square this point creates a tension between where you are and where you could be. You may feel restless, overextended, or frustrated by limitations. This is growth energy that has nowhere to go yet. The key is to not force expansion — instead, identify what needs to change to make room for growth. Sometimes Jupiter squares reveal where you have been thinking too small, and the discomfort is the gap between your current reality and your actual potential.',
    opposition: 'Jupiter opposite this point brings growth through other people and external circumstances. You may encounter someone who challenges your worldview, or an opportunity that requires you to stretch beyond your comfort zone. This aspect often manifests as a choice between staying safe and going bigger. The universe is holding up a mirror — showing you through others what you are capable of becoming. Pay attention to who appears in your life during this transit.',
  },
  Saturn: {
    conjunction: 'Saturn is sitting directly on this point in your chart, and you can feel it. This is the cycle of ultimate accountability — everything you have built, avoided, or neglected comes up for review. It can feel heavy, restrictive, or like the weight of the world is on this area of your life. But here is the truth: Saturn only pressures what is not structurally sound. If you have done the work, this transit rewards you with mastery, authority, and lasting achievement. If you have cut corners, Saturn will show you exactly where the foundation is weak. Either way, what you build during this transit lasts.',
    trine: 'Saturn trine this point brings steady, reliable progress. This is not flashy — it is functional. You have the discipline, the focus, and the structural support to build something that lasts right now. Projects that require patience and persistence thrive during this window. Relationships that are built on solid ground deepen. This is the cycle where slow and steady actually wins. Do the boring, consistent work. Future you will thank present you.',
    sextile: 'A practical opportunity for growth is forming. Saturn sextile this point supports disciplined action and smart planning. If you have been meaning to create structure in some area of your life — a budget, a routine, a plan — this is the transit that makes it stick. Small, consistent steps taken now compound into significant results over time.',
    square: 'This is a pressure transit. Saturn square this point feels like hitting a wall — obstacles appear, progress stalls, and you may feel tested in ways that seem unfair. But Saturn squares are not punishments. They are stress tests that reveal where you need to grow stronger. The frustration you feel is the friction of becoming more capable. Do not quit during this transit. The people who push through Saturn squares emerge with a level of mastery and resilience that nothing else can give them.',
    opposition: 'Saturn opposite this point brings a reckoning with responsibility and commitment. Other people or external circumstances will test your resolve, boundaries, and maturity. You may feel caught between what you want and what is expected of you. This transit asks you to find the balance between personal desire and professional or relational duty. The growth comes from learning to hold both.',
  },
  Uranus: {
    conjunction: 'Uranus conjunct this point is a once-in-a-lifetime transit that shatters whatever has become stagnant. Expect the unexpected — sudden changes, lightning-bolt realizations, and a fierce desire for freedom in this area of your life. What felt stable may suddenly feel suffocating. What seemed impossible may suddenly become available. This transit is not comfortable, but it is liberating. The old version of you in this area is being upgraded, whether you planned for it or not.',
    trine: 'Uranus trine this point brings exciting changes that feel natural rather than disruptive. You may suddenly see solutions to old problems, discover new interests, or connect with people who open your world in unexpected ways. This is innovation energy that flows easily — use it to experiment, try new approaches, and update areas of your life that have become routine.',
    sextile: 'A window of gentle innovation is opening. Uranus sextile this point supports creative problem-solving and small but meaningful changes. You might discover a new technology, method, or perspective that improves your daily life. Be open to unconventional solutions.',
    square: 'Uranus square this point creates intense restlessness and a desire to break free from limitations. You may feel trapped by circumstances that previously felt acceptable. The urge to do something radical is strong — and while some disruption is healthy, be careful about burning bridges impulsively. Channel this energy into deliberate, strategic change rather than reactive destruction.',
    opposition: 'Uranus opposite this point brings change through other people and external events. Someone may shock you, liberate you, or force you to reconsider what you thought was permanent. Relationships and partnerships are especially affected — you may attract unusual people or experience sudden shifts in existing dynamics.',
  },
  Neptune: {
    conjunction: 'Neptune conjunct this point dissolves boundaries and heightens your sensitivity. Reality in this area of your life becomes more fluid, dreamlike, and potentially confusing. Your intuition is amplified, but so is your susceptibility to illusion. Creative and spiritual activities flourish, but practical matters may feel foggy. The key is to trust your inner knowing while staying grounded in daily reality. This transit can produce profound spiritual growth if you let it.',
    trine: 'Neptune trine this point enhances your imagination, compassion, and spiritual awareness in gentle, supportive ways. Creative projects flow more easily, relationships feel more soulful, and your intuitive hits become more frequent and accurate. This is a beautiful transit for any kind of artistic, healing, or spiritual work.',
    sextile: 'A subtle door to greater spiritual or creative awareness is opening. Neptune sextile this point supports meditation, artistic expression, and compassionate action. You may feel drawn to help others or explore the mystical side of life.',
    square: 'Neptune square this point creates confusion, disillusionment, or a sense that something is not what it seems. You may feel lost, deceived, or unsure of your direction. This is Neptune dissolving outdated beliefs and illusions — painful but necessary. Avoid making major decisions during this transit if things feel unclear. Wait for the fog to lift.',
    opposition: 'Neptune opposite this point brings idealization and potential disillusionment in relationships and external circumstances. Others may not be who they appear to be, or you may project your dreams onto situations that cannot hold them. Stay compassionate but discerning.',
  },
  Pluto: {
    conjunction: 'This is one of the most transformative transits you will ever experience. Pluto conjunct this point strips away everything that is not authentic, forcing a complete rebirth in this area of your life. It can feel like a death — because it is. The old way of being here is ending, and something far more powerful is being born. This process is not gentle, but it is profound. When Pluto is done with you, you will be unrecognizable — and grateful for it.',
    trine: 'Pluto trine this point empowers you from within. You have access to deep reserves of strength, focus, and transformative power right now. Changes you make during this transit stick — because they come from a place of genuine inner authority rather than external pressure. This is an excellent time for deep psychological work, strategic planning, or any endeavor that requires sustained intensity.',
    sextile: 'Pluto sextile this point provides an opportunity for quiet but meaningful transformation. You may discover hidden strengths, develop greater psychological insight, or find the courage to address something you have been avoiding.',
    square: 'Pluto square this point brings intense pressure, power struggles, and the feeling that forces beyond your control are reshaping your life. This transit often involves confrontation with authority, loss of control, or the exposure of hidden dynamics. The transformation is not optional — but how you navigate it is. Resist the urge to control everything. The more you grip, the more Pluto pushes back.',
    opposition: 'Pluto opposite this point manifests as intense encounters with other people, power dynamics, and external forces. Relationships may become battlegrounds for control, or circumstances may force you to confront your shadow. This transit teaches you about power — how to claim it, share it, and release it.',
  },
  Mars: {
    conjunction: 'Mars is igniting this point in your chart with raw energy, drive, and urgency. You feel motivated, possibly impatient, and ready to take action. This is excellent for starting new projects, having difficult conversations, or pushing through obstacles. The shadow is anger, impulsivity, and conflict — channel the fire constructively.',
    trine: 'Mars trine this point gives you focused, productive energy that flows easily. Physical vitality is high, motivation is clear, and actions produce results. This is an excellent window for getting things done.',
    sextile: 'A burst of productive energy supports initiative and action. Mars sextile this point helps you take practical steps toward your goals with confidence.',
    square: 'Mars square this point creates friction, frustration, and the potential for conflict. You may feel blocked, angry, or impatient. The key is to use this energy as fuel for action rather than letting it become destructive tension.',
    opposition: 'Mars opposite this point may bring confrontation, competition, or tension with others. Someone may challenge you directly, or external circumstances may force you to assert yourself.',
  },
  Venus: {
    conjunction: 'Venus is blessing this point with beauty, harmony, and attraction. Relationships feel sweeter, creative energy flows, and you may experience increased social magnetism. This is an excellent time for love, art, and financial matters.',
    trine: 'Venus trine this point brings ease, pleasure, and harmonious connections. Relationships flow smoothly, creative projects come together beautifully, and life feels more enjoyable. Allow yourself to receive the good that is coming.',
    sextile: 'A gentle wave of social and creative opportunity is available. Venus sextile this point supports pleasant interactions, artistic expression, and small financial gains.',
    square: 'Venus square this point creates tension in relationships or values. You may feel dissatisfied, jealous, or conflicted about what you want versus what is available. Use this tension to get clearer about what you truly value.',
    opposition: 'Venus opposite this point brings relationship themes to the foreground. Someone may mirror your desires or challenge your values. This transit asks you to find balance between giving and receiving.',
  },
  Mercury: {
    conjunction: 'Mercury is activating your mind and communication in this area. Conversations, ideas, and information flow rapidly. This is an excellent time for learning, writing, negotiations, and making important connections. Your mental acuity is sharp.',
    trine: 'Mercury trine this point supports clear thinking, effective communication, and productive conversations. Ideas come together easily, negotiations go smoothly, and information you need seems to find you.',
    sextile: 'A window of mental clarity and productive communication is open. Mercury sextile this point helps you express ideas, learn new skills, and make useful connections.',
    square: 'Mercury square this point creates mental tension, miscommunication, or information overload. You may feel scattered, anxious, or prone to overthinking. Slow down, double-check details, and choose your words carefully.',
    opposition: 'Mercury opposite this point brings important conversations, negotiations, or information from others. Pay attention to what people are telling you — even between the lines.',
  },
  Sun: {
    conjunction: 'The Sun is illuminating this point, bringing vitality, clarity, and visibility. You may feel more confident and expressive in this area. A great time for self-expression and taking center stage.',
    default: 'The Sun is activating this area of your chart, bringing awareness, energy, and creative vitality to the themes it touches. Pay attention to what becomes clearer during this period.',
  },
  Moon: {
    conjunction: 'The Moon is activating your emotional world in this area. Feelings are heightened, instincts are sharper, and your needs become more apparent. Honor what you feel without letting emotions override your judgment.',
    default: 'The Moon is stirring your inner world in this area. Emotional responses, gut feelings, and instinctive reactions are your guides right now. Trust your feelings, but also give yourself space to process them.',
  },
};

export interface TransitEvent {
  date: string;
  transiting_planet: string;
  natal_planet: string;
  aspect_type: string;
  aspect_name?: string;
  orb?: number;
  description?: string;
  title?: string;
  preview?: string;
  full_reading?: string;
  intensity?: 'low' | 'medium' | 'high';
  category?: string;
  separating?: boolean;
  days_remaining?: number;
  is_retrograde?: boolean;
  transit_sign?: string;
  natal_sign?: string;
}

export function pickFromArray(arr: string[], seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash + seed.charCodeAt(i)) | 0;
  }
  return arr[Math.abs(hash) % arr.length];
}

export function getTransitCycleTitle(transitPlanet: string, natalPlanet: string, aspect: string): string {
  const tp = transitPlanet || '';
  const np = natalPlanet || '';
  const asp = aspect || '';
  const normalizedAspect = asp.toLowerCase();
  const seed = `${tp}-${normalizedAspect}-${np}`;

  if (!tp) return 'Something Cosmic Is Shifting';

  const planetHeadlines = TRANSIT_HEADLINES[tp];
  let baseTitle: string | undefined;

  if (planetHeadlines && planetHeadlines[normalizedAspect]) {
    baseTitle = pickFromArray(planetHeadlines[normalizedAspect], seed);
  }

  if (!baseTitle && normalizedAspect === 'quincunx') {
    const quincunxOptions = QUINCUNX_HEADLINES[tp];
    if (quincunxOptions) {
      baseTitle = pickFromArray(quincunxOptions, seed);
    }
  }

  if (!baseTitle) {
    const essenceOptions = PLANET_ESSENCE[tp];
    if (essenceOptions) {
      baseTitle = pickFromArray(essenceOptions, seed);
    } else {
      baseTitle = 'Something Cosmic Is Shifting';
    }
  }

  const modifier = np ? NATAL_PLANET_MODIFIERS[np] : undefined;
  if (modifier) {
    return `${baseTitle} ${modifier}`;
  }

  return baseTitle;
}

export function getTransitCycleMeaning(transitPlanet: string, natalPlanet: string, aspect: string, firstName: string): string {
  const tp = transitPlanet || '';
  const np = natalPlanet || '';
  const asp = (aspect || '').toLowerCase();

  const planetMeanings = TRANSIT_CYCLE_MEANINGS[tp];
  let baseMeaning = '';

  if (planetMeanings) {
    baseMeaning = planetMeanings[asp] || planetMeanings['default'] || '';
  }

  if (!baseMeaning) {
    const essenceArr = PLANET_ESSENCE[tp];
    const tpDesc = essenceArr ? essenceArr[0] : 'cosmic energy';
    const npDesc = NATAL_PLANET_MODIFIERS[np] || '';
    baseMeaning = `${firstName}, ${tp} is activating the energy of ${tpDesc.toLowerCase()} ${npDesc ? npDesc.toLowerCase() : 'in your chart'}. This ${asp} aspect creates ${
      asp === 'conjunction' ? 'a powerful merging of energies — intensity and new beginnings' :
      asp === 'trine' ? 'a supportive, flowing connection — ease and natural talent' :
      asp === 'sextile' ? 'a gentle opportunity — growth through small steps' :
      asp === 'square' ? 'dynamic tension — growth through challenge and pressure' :
      asp === 'opposition' ? 'a balancing act — awareness through contrast' :
      'a meaningful connection'
    }. Pay attention to how this area of your life shifts in the coming days and weeks.`;
  }

  if (firstName && firstName !== 'you' && !baseMeaning.includes(firstName)) {
    baseMeaning = `${firstName}, ${baseMeaning.charAt(0).toLowerCase()}${baseMeaning.slice(1)}`;
  }
  return baseMeaning;
}

export function getTransitNavigationAdvice(transitPlanet: string, natalPlanet: string, aspect: string, name: string): string {
  const tp = transitPlanet || '';
  const asp = (aspect || '').toLowerCase();
  const np = natalPlanet || '';

  const planetAdvice = TRANSIT_NAVIGATION_ADVICE[tp];
  if (planetAdvice && planetAdvice[asp]) {
    let advice = planetAdvice[asp];
    if (name && name !== 'Stargazer') {
      advice = `${name}, ${advice.charAt(0).toLowerCase()}${advice.slice(1)}`;
    }
    const natalContext = NATAL_NAVIGATION_CONTEXT[np];
    if (natalContext) {
      advice += `\n\n${natalContext}`;
    }
    return advice;
  }

  const aspectAdvice: Record<string, string> = {
    conjunction: `${name}, this alignment is concentrating powerful energy in one area of your life. Think of it as a magnifying glass — everything it touches is amplified. Direct this intensity deliberately. What you focus on now grows exponentially.`,
    trine: `${name}, supportive energy is flowing your way. The path of least resistance is also the path of most reward right now. Follow what feels natural. When things click easily during this period, it is not luck — it is alignment.`,
    sextile: `${name}, an opportunity is presenting itself in subtle form. It will not chase you — you have to recognize it and act. The door is cracked open. Push it the rest of the way.`,
    square: `${name}, tension is building for a reason. This pressure is not random — it is targeting exactly the area where you need to level up. Lean into the discomfort instead of running from it. The breakthrough is on the other side of the resistance.`,
    opposition: `${name}, balance is the lesson. Two forces in your life are pulling in opposite directions, and you cannot ignore either one. The answer is not choosing sides — it is learning to hold both truths at once.`,
  };
  return aspectAdvice[asp] || `${name}, pay attention to what shifts in your life during this window. The universe is rearranging something important, and your awareness of the process makes all the difference.`;
}

export function getCycleProgress(event: TransitEvent): number {
  const orb = event.orb ?? 5;
  const maxOrb = 8;
  const rawProgress = ((maxOrb - Math.min(orb, maxOrb)) / maxOrb) * 100;
  if (orb <= 0.1) return 98;
  if (orb >= maxOrb) return 12;
  return Math.round(Math.max(12, Math.min(98, rawProgress)));
}
