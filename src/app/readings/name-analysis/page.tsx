'use client';

import { useState, useMemo } from 'react';
import { api, buildBirthData } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import Link from 'next/link';
import { ArrowLeft, Type, Copy, Check, ChevronDown, ChevronUp, Users, Sparkles, RefreshCw, Heart } from 'lucide-react';
import { PaywallGate } from '@/components/ui/PaywallGate';

// ─── Types ──────────────────────────────────────────────────────────────────────

interface NameAnalysisResult {
  full_name: string;
  expression_number: number;
  soul_urge_number: number;
  personality_number: number;
  life_path_number?: number;
  letter_frequencies: { letter: string; count: number }[];
  vowel_count: number;
  consonant_count: number;
  total_letters: number;
  first_letter: string;
}

// ─── Constants ──────────────────────────────────────────────────────────────────

const PYTH_MAP: Record<string, number> = {
  A:1,B:2,C:3,D:4,E:5,F:6,G:7,H:8,I:9,
  J:1,K:2,L:3,M:4,N:5,O:6,P:7,Q:8,R:9,
  S:1,T:2,U:3,V:4,W:5,X:6,Y:7,Z:8,
};

const BASE_VOWELS = new Set('AEIOU');

const NUM_TITLES: Record<number, string> = {
  1: 'The Leader', 2: 'The Diplomat', 3: 'The Creator', 4: 'The Builder',
  5: 'The Freedom Seeker', 6: 'The Nurturer', 7: 'The Seeker', 8: 'The Powerhouse',
  9: 'The Humanitarian', 11: 'The Intuitive', 22: 'The Master Builder', 33: 'The Master Teacher',
};

const EXPRESSION_PROFILES: Record<number, { power: string; shadow: string; careers: string; love: string }> = {
  1: {
    power: `You were born to initiate, to go first, to build something from nothing. Your name vibrates with pioneer energy — you are wired to lead, not follow. When you walk into a room, people instinctively look to you for direction, even if you have not said a word. Your gift is original thought. You do not borrow ideas — you generate them. The world needs people who are willing to be first, to take the risk nobody else will, to say "I will figure it out" when everyone else is waiting for permission. That is you.`,
    shadow: `When this energy is blocked — when you are stuck in someone else's framework, following rules that do not make sense to you, or dimming yourself to make insecure people comfortable — you become frustrated, aggressive, or shut down entirely. Headaches, insomnia, anger you cannot explain — these are your 1 energy screaming to be expressed.`,
    careers: `Entrepreneurship, leadership, innovation, anything where you set the agenda rather than follow one`,
    love: `You need a partner who has their own identity. You are not looking for someone to complete you — you are looking for someone who can stand beside you without needing to control you`,
  },
  2: {
    power: `Your name carries the frequency of diplomacy, intuition, and deep emotional intelligence. You pick up on what people are feeling before they say it — sometimes before they even know it themselves. Your superpower is your ability to hold space for others, to see both sides, to find the thread of connection between people who seem incompatible. You are the person everyone calls when they need to be heard, truly heard, without judgment.`,
    shadow: `When this energy turns inward, you become a people-pleaser who loses yourself in other people's emotions. You absorb their stress, their anxiety, their problems — and forget where they end and you begin. Saying no feels like cruelty to you. It is not. It is survival.`,
    careers: `Counseling, mediation, healing arts, partnerships, anything requiring emotional intelligence and collaboration`,
    love: `You love deeply and need someone who matches your emotional depth. Surface-level relationships feel like starvation to you`,
  },
  3: {
    power: `Your name is literally wired for expression — words, art, performance, anything that lets the inner world become the outer world. You probably started talking early, or drawing, or singing, or making up stories. You cannot NOT create. When you are silent for too long, you start to rot from the inside. The 3 is the number of joy, and when you are in your element — communicating, creating, connecting — you light up rooms and make people feel alive.`,
    shadow: `When blocked, you scatter. You start ten things and finish none. You talk about the novel you are going to write, the business you are going to start, the talent you are going to develop — and then you scroll your phone until midnight because the gap between your vision and your output feels too painful to face. The 3 shadow is self-doubt disguised as procrastination.`,
    careers: `Writing, performing, teaching, marketing, design, anything that rewards verbal and creative expression`,
    love: `You need a partner who makes you laugh and who genuinely enjoys your stories. Someone who tells you to be quiet is someone who is slowly killing you`,
  },
  4: {
    power: `Your name vibrates at the frequency of foundation. You are here to build things that last — not flashy, not trendy, but permanent. While everyone else is chasing the next shiny thing, you are laying brick after brick, creating something that will still be standing long after the hype fades. You have an almost supernatural ability to create order from chaos, to see the steps that others skip, to turn dreams into actual plans with actual timelines.`,
    shadow: `When this energy is unbalanced, you become rigid, controlling, and allergic to change. You cling to routines that no longer serve you because the alternative — uncertainty — feels like freefall. You may also overwork yourself into the ground, equating rest with laziness. It is not laziness. It is maintenance on the machine that does everything.`,
    careers: `Engineering, project management, finance, architecture, operations — anything that rewards systematic thinking and follow-through`,
    love: `You need stability and loyalty above all else. You are not looking for fireworks — you are looking for someone who shows up, consistently, reliably, without drama`,
  },
  5: {
    power: `Your name pulses with the frequency of freedom, adventure, and change. You are hardwired to experience everything — every culture, every perspective, every sensation. Where others see risk, you see a doorway. You are the person who moves to a new city on a gut feeling, learns a new language for fun, or pivots their entire career because curiosity demanded it. Your adaptability is extraordinary. You can walk into any environment and within a week, you belong.`,
    shadow: `The shadow of 5 is addiction — not necessarily to substances, but to stimulation. When you are bored, you self-destruct. You start fights, blow up relationships, sabotage stable situations — anything to feel something. The challenge of the 5 is learning that depth and commitment are not prisons. They are different kinds of freedom.`,
    careers: `Travel, sales, media, consulting, any role that offers variety, autonomy, and exposure to new environments`,
    love: `You need a partner who is also an adventurer — someone who does not try to cage you but instead wants to explore alongside you`,
  },
  6: {
    power: `Your name resonates with the vibration of love, responsibility, and service. You are wired to nurture — to create beauty, maintain harmony, and make the people around you feel safe. Your home is probably either beautifully maintained or you feel genuinely distressed when it is not. You carry other people's burdens willingly, sometimes even eagerly, because taking care of others is how you express love. And you love fiercely.`,
    shadow: `The 6 shadow is martyrdom. You give and give until there is nothing left, and then you resent the people you gave everything to — even though they never asked you to. You may also use your nurturing nature as a form of control: "I do everything for you, so you owe me." That is not love. That is a transaction. Real love lets people struggle, fail, and find their own way.`,
    careers: `Healthcare, education, counseling, hospitality, interior design, community leadership — anything centered on service and creating harmony`,
    love: `You need to be needed — but your real lesson is learning to be wanted for who you are, not what you do for people`,
  },
  7: {
    power: `Your name vibrates at the frequency of the seeker — the person who cannot accept the surface-level explanation for anything. You need to know WHY. Not the marketing version, not the polite version — the real version. You have an analytical mind that can cut through noise and see patterns that others miss. But your intelligence is not just intellectual — it is deeply spiritual. You feel the invisible architecture of things. You know when something is true before you can prove it.`,
    shadow: `The 7 shadow is isolation disguised as independence. You retreat into your mind and mistake loneliness for solitude. You intellectualize your feelings instead of feeling them. You hold people at arm's length because vulnerability feels like weakness — and for a 7, weakness is the worst thing you can imagine. But the paradox is: the connection you fear is the very thing that will set you free.`,
    careers: `Research, technology, psychology, philosophy, investigative work, spiritual practice — anything that rewards deep thinking and pattern recognition`,
    love: `You need a partner who respects your need for space but can gently pull you out of your head when you have been in there too long`,
  },
  8: {
    power: `Your name carries the vibration of power, authority, and material mastery. You are here to learn the relationship between effort and reward, between vision and execution, between money and meaning. When aligned, you are unstoppable — the person who turns ideas into empires, who commands respect without demanding it, who understands that real power is not about controlling others but about controlling yourself.`,
    shadow: `The 8 shadow is domination — using your natural authority to overpower rather than empower. You may also become obsessed with status, measuring your worth by your net worth, your title, or the size of your circle. When an 8 loses their soul to the hustle, they end up with everything the world values and nothing their heart needs.`,
    careers: `Business, finance, law, executive leadership, real estate, any field where strategic vision and material results are rewarded`,
    love: `You need a partner who is your equal — not intimidated by your ambition, not competing with it, but genuinely supportive of the empire you are building together`,
  },
  9: {
    power: `Your name vibrates with the energy of completion, wisdom, and universal love. You are an old soul — you have seen enough, felt enough, and understood enough to have compassion for everyone, including the people most others would write off. Your gift is perspective. Where others react, you respond. Where others judge, you understand. You carry a natural authority that comes not from power but from depth.`,
    shadow: `The 9 shadow is resentment masked as resignation. You give so much to so many that you feel perpetually drained, and the bitterness builds silently. You also struggle to let go — of relationships, grudges, past versions of yourself. The lesson of 9 is release. You cannot carry the world's pain and still walk your own path. You must learn to set things down.`,
    careers: `Humanitarian work, teaching, creative arts, leadership, healing — anything with a purpose larger than personal gain`,
    love: `You love everyone a little, which can make it hard to love one person completely. Your partner needs to understand that your heart is big enough for the world AND for them`,
  },
  11: {
    power: `Your name carries a master number — the 11. This is the frequency of the intuitive, the visionary, the person who receives downloads from a frequency most people cannot tune into. You are literally wired to channel ideas, insights, and creative impulses that do not originate from logic alone. You have probably been called "too sensitive" your entire life. You are not too sensitive. You are precisely calibrated for a world that is not calibrated for you.`,
    shadow: `The 11 shadow is anxiety — a nervous system constantly receiving signals it does not know how to process. You feel everything, all the time, and the volume does not have an off switch. You may also struggle with imposter syndrome, sensing your potential is enormous but feeling paralyzed by the gap between where you are and where you know you could be.`,
    careers: `Spiritual work, creative arts, counseling, innovation, any field that rewards intuitive insight and vision`,
    love: `You need a partner who does not think your sensitivity is a problem to solve. It is not a bug — it is the feature.`,
  },
  22: {
    power: `Your name carries the master number 22 — the Master Builder. This is the rarest and most powerful vibration in numerology. You have the vision of the 11 combined with the practical discipline of the 4. You are here to build something that changes the world — not metaphorically, literally. Systems, institutions, movements, businesses that outlive you. The 22 does not think in lifetimes — it thinks in legacies.`,
    shadow: `The shadow of 22 is the crushing weight of potential. You know what you are capable of, and it terrifies you. You may spend years — decades — in preparation mode, perfecting and planning but never launching, because the stakes of your vision feel too high to risk failure. But here is the truth: a 22 who never builds is a 4 who overworks themselves into insignificance. You must build. It is not optional.`,
    careers: `Visionary leadership, large-scale project management, architecture, social enterprise, infrastructure — anything that creates lasting systems`,
    love: `You need a partner who understands that your mission comes first — not because you do not love them, but because you are wired to serve something larger than any single relationship`,
  },
  33: {
    power: `Your name vibrates at 33 — the Master Teacher. This is the highest vibration in numerology, the number of the healer, the guide, the one who teaches through presence rather than lectures. You have an almost supernatural ability to make people feel safe, seen, and capable of more than they believed possible. Your gift is not what you know — it is who you are in the room.`,
    shadow: `The 33 shadow is self-sacrifice to the point of self-destruction. You give everything — your time, your energy, your emotional reserves — and then wonder why you feel hollow. You may also struggle with a savior complex, believing you can fix everyone and that it is your responsibility to do so. It is not. Your job is to show people the door. They have to walk through it themselves.`,
    careers: `Teaching, healing, spiritual leadership, counseling, creative arts with a humanitarian purpose`,
    love: `You need a partner who takes care of YOU — because you will never ask for it yourself, and you need someone who sees that and does it anyway`,
  },
};

const SOUL_URGE_PROFILES: Record<number, string> = {
  1: `What your heart aches for — even if you would never say it out loud — is to be recognized as the original. Not the best copy, not the most improved version, but the genuine article. You crave the respect that comes from building something that is unmistakably yours. Deep down, you are terrified of being ordinary.`,
  2: `Your deepest craving is connection — real, soul-level intimacy where you are known completely and loved anyway. You do not want a partner. You want a witness. Someone who sees the parts of you that you hide from the world and says "I see all of it, and I am staying." The ache you carry is the ache of someone who gives everything and wonders if anyone will ever do the same for them.`,
  3: `What you want, more than anything, is to be heard. Not just listened to — heard. You want someone to understand the thing you are trying to say, even when you cannot find the words. Your soul craves self-expression without judgment, creativity without criticism, joy without guilt. You are happiest when you are making something — and someone is watching with genuine delight.`,
  4: `Your heart craves security — not just financial, but emotional. You want a life that makes sense, where the rules are clear, where effort produces predictable results. Chaos is not exciting to you. It is exhausting. You want a home that feels like a fortress, relationships that feel like contracts honored in good faith, and enough stability to finally relax.`,
  5: `What your soul is really after is the feeling of being fully alive. You do not want comfort — you want intensity. You want to taste everything, feel everything, try everything. The idea of living the same day on repeat for 40 years makes your chest tighten. You would rather have a life that is messy and real than one that is tidy and numb.`,
  6: `Your deepest desire is to be needed — to matter to someone in a way that is irreplaceable. You want to create a home, a family, a community where everyone is taken care of and nobody is forgotten. The thing that breaks your heart is feeling useless. If no one needs you, you do not know who you are.`,
  7: `What your soul craves is truth. Not comfortable truth, not convenient truth — real truth. You want to understand the mechanics of existence. Why are we here? What happens next? What is the pattern behind the pattern? You carry a deep loneliness that comes from seeing the world at a depth most people cannot access. You are not antisocial. You are under-met.`,
  8: `Your heart wants mastery. You want to be the best at what you do — not for applause, but because mediocrity physically hurts you. You crave respect that is earned, not given. You want to look at what you have built and know it was real. The thing that keeps you up at night is the fear that you peaked too early, or that you are running out of time.`,
  9: `Your soul aches to make a difference — to leave the world better than you found it. You carry a compassion that borders on painful. You feel the suffering of strangers. You cannot watch the news without it sitting in your chest for days. What you want is meaning. You want to know that your life mattered to someone, somewhere.`,
  11: `Your deepest desire is to channel something larger than yourself — to be a vessel for an idea, a message, a creative force that transforms people when they encounter it. You know you are here for something important. You just cannot always see what it is. The ache you carry is the ache of someone standing at the edge of their purpose, almost able to see it, not quite able to reach it.`,
  22: `Your soul craves legacy. Not fame — legacy. You want to build something that persists after you are gone. Something your grandchildren point to and say "they built that." The desire is so large it sometimes paralyzes you, because where do you even begin with a vision that big?`,
  33: `Your heart wants to heal the world. Literally. You feel the brokenness everywhere — in people, in systems, in the gap between what life could be and what it is. What you crave is the moment someone looks at you and says "you changed my life." That is not ego. That is your purpose confirming itself.`,
};

const PERSONALITY_PROFILES: Record<number, string> = {
  1: `People see you as someone who has it together. Confident. Self-sufficient. Maybe even a little intimidating. They assume you do not need anyone — which is both your armor and your curse. The truth is, you do need people. You are just terrified that needing them makes you weak.`,
  2: `People see warmth, gentleness, and approachability. You seem easy to talk to, nonthreatening, and genuinely kind. What they do not see is the steel underneath — the fierce loyalty, the stubborn devotion, the quiet strength that holds everything together while looking effortless.`,
  3: `People see you as charming, funny, and magnetic. You are the person everyone gravitates toward at a party. What they do not realize is that the performance has a cost. Behind the smile, there is often a deep well of feeling that you do not show anyone.`,
  4: `People see you as reliable, grounded, and no-nonsense. They trust you instinctively — with their money, their secrets, their worst moments. What they miss is that your composure is not effortless. It is a discipline you have practiced so long it looks natural.`,
  5: `People see you as exciting, spontaneous, and slightly unpredictable. You are the friend who makes every day feel like an adventure. What they do not understand is that the constant motion is not random — it is how you process the world. You think with your feet.`,
  6: `People see you as the caretaker — the responsible one, the one who remembers birthdays and checks in after hard conversations. They lean on you because you seem unbreakable. What they do not see is that you are exhausted from holding everyone up and no one is holding you.`,
  7: `People see you as mysterious, intelligent, and slightly aloof. They assume you are judging them (sometimes you are). What they do not understand is that the distance is not arrogance — it is protection. You let people in slowly because the ones you have let in fast have hurt you the most.`,
  8: `People see power. Even if you are soft-spoken, there is something about your presence that commands attention. They either respect you instantly or feel threatened by you — rarely anything in between. What they do not see is that the power they admire is born from pain you have already survived.`,
  9: `People see wisdom beyond your years. You seem like you have already lived several lifetimes. They come to you for advice and perspective, and you give it freely. What they do not realize is that the wisdom comes at a price — you have felt things most people never will.`,
  11: `People sense something about you they cannot quite name. There is an intensity, a depth, an almost electric quality to your presence. Some are drawn to it. Others are uncomfortable with it. Either way, no one forgets meeting you.`,
  22: `People see quiet authority. You do not need to be the loudest person in the room — your competence speaks for itself. They sense that you are capable of things they cannot fully grasp, and that both impresses and intimidates them.`,
  33: `People feel safe around you, often before they understand why. You have an energy that calms rooms and opens hearts. Strangers tell you their secrets. Children trust you instantly. This is not something you learned — it is who you are.`,
};

const FIRST_LETTER_INSIGHTS: Record<string, string> = {
  A: `Your name begins with the letter of initiation — the very first letter of the alphabet. You are a starter, a launcher, an opener of doors. This first-letter energy means you approach life with a "me first" instinct that is not selfish but pioneering.`,
  B: `B is the letter of partnership and sensitivity. Your name opens with an energy of receptivity — you take in the room before you speak into it. You are a natural collaborator who builds through relationship, not competition.`,
  C: `C carries the vibration of creative expression. Your name leads with charisma and communication. You were born to make things — conversations, art, connections, joy. Your first impression is always memorable.`,
  D: `D is the letter of discipline and determination. Your name opens with solid, grounded energy. People trust you instinctively because your name literally vibrates with reliability. You do what you say you will do.`,
  E: `E is the letter of experience and freedom. Your name begins with the most energetic vowel — pure life force. You are magnetic, curious, and physically expressive. You communicate with your whole body, not just your words.`,
  F: `F carries the vibration of nurturing responsibility. Your name opens with an energy of warmth and care. People feel mothered by your presence, regardless of your gender. You create home wherever you go.`,
  G: `G is the letter of the mind — analysis, introspection, and spiritual depth. Your name leads with intelligence. People sense that you know things, that you see things, that your silence carries more weight than most people's words.`,
  H: `H vibrates with ambition and material power. Your name opens with executive energy — you are wired for achievement and authority. You carry a businesslike presence even in casual settings.`,
  I: `I is the letter of deep feeling and artistic sensitivity. Your name begins with the most personal vowel. You experience life at a higher emotional resolution than most people. This makes you an extraordinary artist and an exhausted human.`,
  J: `J carries the vibration of justice and leadership. Your name opens with a crusading energy — you have strong opinions about right and wrong, and you are not afraid to voice them. You lead through conviction.`,
  K: `K is the letter of spiritual mastery and high-strung energy. Your name leads with intuition and a kind of nervous brilliance. You are either the smartest person in the room or the most anxious — often both simultaneously.`,
  L: `L vibrates with love, creativity, and self-expression. Your name opens with warmth and charm. You are naturally entertaining and socially graceful. People enjoy being around you because you make ordinary moments feel special.`,
  M: `M is the letter of the builder and the worker. Your name leads with practical, get-it-done energy. You are the person who rolls up their sleeves while everyone else is still debating the plan. Your hands are never still.`,
  N: `N carries the vibration of adventure and change. Your name opens with restless, curious energy. You are a natural storyteller because you have actually lived the stories you tell. Your life is never boring.`,
  O: `O is the letter of emotional depth and responsibility. Your name begins with the roundest, most complete vowel. You carry a weight of responsibility — for your family, your word, your principles. Breaking a promise physically hurts you.`,
  P: `P vibrates with mental power and spiritual wisdom. Your name leads with quiet authority. You are a natural teacher — not because you lecture, but because your presence makes people want to learn.`,
  Q: `Q is rare and carries the vibration of uniqueness. Your name literally starts with the most uncommon letter. You do not fit categories, and you stopped trying a long time ago. Your eccentricity is your greatest asset.`,
  R: `R carries the vibration of compassion and humanitarianism. Your name opens with a warm, emotionally intelligent energy. You feel things for others that they cannot feel for themselves. You are a natural healer.`,
  S: `S is the letter of emotional intensity. Your name leads with magnetic, serpentine energy — you draw people in. You are charming and persuasive, but there is always something deeper happening beneath the surface.`,
  T: `T vibrates with sacrifice and spiritual growth. Your name opens with an energy of restless seeking. You are the person who asks the questions nobody else is brave enough to ask, and you do not accept easy answers.`,
  U: `U carries the vibration of accumulation and loss. Your name begins with a gathering energy — you collect experiences, relationships, knowledge, and material things. But U also teaches letting go.`,
  V: `V is the letter of construction and inspiration. Your name leads with dynamic, creative energy. You are a natural visionary who sees potential in things others have given up on.`,
  W: `W vibrates with determination and self-expression. Your name opens with a stubborn, powerful energy. You have a voice that demands to be heard, and when you speak, rooms shift.`,
  X: `X is the rarest letter to begin a name — and it carries the vibration of sacrifice, sensuality, and creative extremes. You operate at frequencies most people cannot access.`,
  Y: `Y carries the vibration of spiritual seeking and independence. Your name opens with a questioning energy — you are always looking for the deeper meaning, the hidden pattern, the truth behind the truth.`,
  Z: `Z vibrates with originality and optimism. Your name leads with a flash of creative lightning. You see the world differently from everyone around you, and that difference is your gift.`,
};

const COMPATIBILITY_MAP: Record<string, { rating: number; desc: string }> = {
  '1-1': { rating: 60, desc: 'Two leaders — powerful but competitive. You both want to drive, which creates friction unless you take turns at the wheel.' },
  '1-2': { rating: 85, desc: 'Excellent balance. The 1 leads, the 2 supports, and both feel valued. This is one of the strongest number pairings in numerology.' },
  '1-3': { rating: 80, desc: 'Creative and energetic. The 1 provides direction, the 3 provides inspiration. You bring out each other\'s playful side.' },
  '1-4': { rating: 55, desc: 'Challenging but grounding. The 1 wants to innovate, the 4 wants stability. You can build empires together if you stop butting heads.' },
  '1-5': { rating: 75, desc: 'Exciting and dynamic. Both love freedom and independence. The risk is that nobody anchors the relationship.' },
  '1-6': { rating: 65, desc: 'The 6 nurtures, the 1 charges ahead. Works when the 1 remembers to come home and the 6 gives them space to lead.' },
  '1-7': { rating: 70, desc: 'Intellectual connection. Both are independent and respect each other\'s need for space. Emotional intimacy requires conscious effort.' },
  '1-8': { rating: 80, desc: 'Power couple energy. Both are ambitious and driven. The key is channeling competition outward, not at each other.' },
  '1-9': { rating: 75, desc: 'The 1 brings ambition, the 9 brings purpose. Together you can change the world — if the 1 learns that not everything is about winning.' },
  '2-2': { rating: 70, desc: 'Deeply sensitive and caring. You understand each other intuitively but may avoid conflict to the point of resentment.' },
  '2-3': { rating: 85, desc: 'Warm and joyful. The 2 provides emotional depth, the 3 keeps things light. You make each other laugh AND feel deeply.' },
  '2-4': { rating: 75, desc: 'Stable and devoted. Both value security and commitment. The 4 builds the foundation, the 2 makes it feel like home.' },
  '2-5': { rating: 45, desc: 'Difficult pairing. The 2 craves stability, the 5 craves adventure. One of you always feels confined while the other feels abandoned.' },
  '2-6': { rating: 90, desc: 'One of the best pairings in numerology. Both are nurturing, devoted, and prioritize harmony. Your home is a sanctuary.' },
  '2-7': { rating: 60, desc: 'The 2 wants emotional connection, the 7 needs intellectual space. Beautiful when the 7 opens up — frustrating when they retreat.' },
  '2-8': { rating: 65, desc: 'The 8 provides material security, the 2 provides emotional warmth. Works when the 8 remembers that money is not love.' },
  '2-9': { rating: 75, desc: 'Both are compassionate and giving. The risk is that you both give so much to the world that there is nothing left for each other.' },
  '3-3': { rating: 70, desc: 'Creative explosion. You inspire each other endlessly but may struggle with follow-through. Someone needs to pay the bills.' },
  '3-4': { rating: 50, desc: 'The 3 wants to play, the 4 wants to work. Opposites that can complement each other or drive each other absolutely crazy.' },
  '3-5': { rating: 85, desc: 'Fun, exciting, and never boring. Both love variety and stimulation. The challenge is building something lasting amid all the excitement.' },
  '3-6': { rating: 80, desc: 'The 3 brings joy, the 6 brings stability. A warm, creative partnership where the home is always full of life.' },
  '3-7': { rating: 55, desc: 'The 3 is social, the 7 is private. You fascinate each other but inhabit different worlds. Meeting in the middle requires real effort.' },
  '3-8': { rating: 65, desc: 'The 3 creates, the 8 monetizes. A potent business partnership. In romance, the 8 needs to appreciate the 3\'s art, not just its market value.' },
  '3-9': { rating: 80, desc: 'Both are creative and compassionate. You share a vision of a more beautiful world and inspire each other to pursue it.' },
  '4-4': { rating: 70, desc: 'Extremely stable but potentially rigid. You build an unshakable foundation but may forget to have fun on top of it.' },
  '4-5': { rating: 40, desc: 'The hardest pairing. The 4 wants predictability, the 5 wants spontaneity. This works only if both stretch significantly toward the other.' },
  '4-6': { rating: 85, desc: 'Rock-solid partnership. Both value family, stability, and doing things the right way. Your home is built to last.' },
  '4-7': { rating: 70, desc: 'Both are serious and thoughtful. The 4 builds in the physical world, the 7 explores the mental world. Respect for different strengths is key.' },
  '4-8': { rating: 85, desc: 'A powerhouse combination for building wealth and stability. Both are disciplined and goal-oriented. May need to schedule romance intentionally.' },
  '4-9': { rating: 60, desc: 'The 4 is practical, the 9 is idealistic. Tension between building your own life and saving the world. Compromise is essential.' },
  '5-5': { rating: 65, desc: 'Thrilling but chaotic. Neither of you wants to be the anchor. The relationship needs at least one stabilizing external structure.' },
  '5-6': { rating: 50, desc: 'The 5 wants freedom, the 6 wants commitment. This works only when the 6 loosens the reins and the 5 learns that roots are not chains.' },
  '5-7': { rating: 75, desc: 'Both value independence and intellectual stimulation. You give each other space without resentment — a rare and beautiful thing.' },
  '5-8': { rating: 65, desc: 'Dynamic and ambitious. The 5 brings adaptability, the 8 brings strategy. Together you can navigate any market — or any argument.' },
  '5-9': { rating: 70, desc: 'Both are driven by big ideas and a desire for more. You understand each other\'s restlessness. The challenge is landing somewhere together.' },
  '6-6': { rating: 80, desc: 'A love story about love itself. Both prioritize family, home, and devotion. Watch for codependency — two nurturers sometimes forget to nurture themselves.' },
  '6-7': { rating: 55, desc: 'The 6 wants closeness, the 7 wants space. This pairing requires extraordinary patience and a willingness to love in different languages.' },
  '6-8': { rating: 75, desc: 'The 8 builds the empire, the 6 builds the home. A traditional power dynamic that works when both roles are equally respected.' },
  '6-9': { rating: 85, desc: 'Both are driven by love and service. You share a deep sense of purpose and devotion that most couples never experience.' },
  '7-7': { rating: 65, desc: 'Two seekers in a library of silence. Beautiful intellectual connection but the emotional intimacy can feel like two parallel lines — close but never touching.' },
  '7-8': { rating: 60, desc: 'The 7 seeks truth, the 8 seeks power. This works when the 8 respects the 7\'s depth and the 7 respects the 8\'s ambition.' },
  '7-9': { rating: 75, desc: 'Deeply spiritual and wise. Both see the world at a level most people cannot access. Your conversations go to midnight.' },
  '8-8': { rating: 70, desc: 'Mutual respect and ambition. Two powerhouses who either build an empire together or destroy each other competing. There is rarely a middle ground.' },
  '8-9': { rating: 65, desc: 'The 8 wants material success, the 9 wants meaning. This works when you realize both are valid and neither is the whole picture.' },
  '9-9': { rating: 75, desc: 'Two old souls who understand each other\'s depth. Beautiful compassion but both need to stop saving the world long enough to save the relationship.' },
};

// ─── Calculation helpers ────────────────────────────────────────────────────────

function reduceNum(n: number): number {
  while (n > 9 && n !== 11 && n !== 22 && n !== 33) {
    n = String(n).split('').reduce((s, d) => s + parseInt(d), 0);
  }
  return n;
}

function calcNameNumbers(name: string): { expression: number; soul: number; personality: number; vowelCount: number; consonantCount: number } {
  const words = name.toUpperCase().split(/[^A-Z]+/).filter(w => w.length > 0);
  let expressionFromParts = 0, soulFromParts = 0, consonantFromParts = 0;
  let vowelCount = 0, consonantCount = 0;
  for (const word of words) {
    let wordTotal = 0, wordVowel = 0, wordConsonant = 0;
    for (let ci = 0; ci < word.length; ci++) {
      const ch = word[ci];
      const val = PYTH_MAP[ch] || 0;
      wordTotal += val;
      let isV = BASE_VOWELS.has(ch);
      if (ch === 'Y') {
        if (ci === 0 && word.length > 1 && BASE_VOWELS.has(word[1])) isV = false;
        else isV = true;
      }
      if (isV) { wordVowel += val; vowelCount++; }
      else { wordConsonant += val; consonantCount++; }
    }
    expressionFromParts += reduceNum(wordTotal);
    soulFromParts += reduceNum(wordVowel);
    consonantFromParts += reduceNum(wordConsonant);
  }
  return { expression: reduceNum(expressionFromParts), soul: reduceNum(soulFromParts), personality: reduceNum(consonantFromParts), vowelCount, consonantCount };
}

function calculateNameAnalysis(name: string, birthDateStr: string): NameAnalysisResult {
  const allLetters = name.toUpperCase().replace(/[^A-Z]/g, '');
  const nums = calcNameNumbers(name);

  let lifePathNumber: number | undefined;
  if (birthDateStr) {
    const digits = birthDateStr.replace(/[^0-9]/g, '');
    if (digits.length >= 4) lifePathNumber = reduceNum(digits.split('').reduce((s, d) => s + parseInt(d), 0));
  }

  const freqMap: Record<string, number> = {};
  for (const ch of allLetters) freqMap[ch] = (freqMap[ch] || 0) + 1;
  const letter_frequencies = Object.entries(freqMap).map(([letter, count]) => ({ letter, count })).sort((a, b) => b.count - a.count);

  return {
    full_name: name,
    expression_number: nums.expression,
    soul_urge_number: nums.soul,
    personality_number: nums.personality,
    life_path_number: lifePathNumber,
    letter_frequencies,
    vowel_count: nums.vowelCount,
    consonant_count: nums.consonantCount,
    total_letters: allLetters.length,
    first_letter: allLetters[0] || 'A',
  };
}

function getCompatibility(n1: number, n2: number): { rating: number; desc: string } {
  const k1 = Math.min(n1, n2) > 9 ? reduceNum(Math.min(n1, n2)) : Math.min(n1, n2);
  const k2 = Math.max(n1, n2) > 9 ? reduceNum(Math.max(n1, n2)) : Math.max(n1, n2);
  const key = `${Math.min(k1, k2)}-${Math.max(k1, k2)}`;
  return COMPATIBILITY_MAP[key] || { rating: 70, desc: 'An interesting pairing with unique dynamics. Your numbers create a distinctive energy that defies simple categorization.' };
}

function getVowelConsonantInsight(vowelCount: number, consonantCount: number): string {
  const total = vowelCount + consonantCount;
  if (total === 0) return '';
  const vowelPct = Math.round((vowelCount / total) * 100);
  if (vowelPct > 55) return `Your name is **vowel-dominant** (${vowelPct}% vowels). This means your inner world — your emotions, desires, and spiritual life — is louder than your outer presentation. You feel more than you show. People often underestimate the depth of your emotional landscape because your consonants (the "mask") are relatively thin. You are more transparent than you realize.`;
  if (vowelPct < 40) return `Your name is **consonant-dominant** (${100 - vowelPct}% consonants). This means your outer presentation — how you act, work, and move through the world — is stronger than your inner expression. You are someone who DOES more than they FEEL, at least publicly. The real you is more sensitive than anyone suspects, but your name's architecture keeps that vulnerability well-protected.`;
  return `Your name has a **balanced vowel-to-consonant ratio** (${vowelPct}% vowels, ${100 - vowelPct}% consonants). This means your inner life and outer presentation are in relative harmony. What you feel and what you show are more aligned than most people's. This balance is a gift — you come across as authentic because you genuinely are.`;
}

function getNameVariantAnalysis(fullName: string, variant: string): { expression: number; diff: string } {
  const fullNums = calcNameNumbers(fullName);
  const varNums = calcNameNumbers(variant);
  let diff = '';
  if (varNums.expression === fullNums.expression) {
    diff = `Going by **"${variant}"** keeps the same Expression energy (${varNums.expression}) as your full name. The core vibration is unchanged — this is a cosmetic shift, not an energetic one.`;
  } else {
    const fullTitle = NUM_TITLES[fullNums.expression] || fullNums.expression.toString();
    const varTitle = NUM_TITLES[varNums.expression] || varNums.expression.toString();
    diff = `Going by **"${variant}"** shifts your Expression from **${fullNums.expression}** (${fullTitle}) to **${varNums.expression}** (${varTitle}). This changes how the world experiences you. ${varNums.expression > fullNums.expression ? 'The higher vibration amplifies your energy but may feel more intense to maintain.' : 'This shifts your presentation energy — neither better nor worse, but distinctly different in how people respond to you.'}`;
  }
  return { expression: varNums.expression, diff };
}

// ─── AI prompt builder ──────────────────────────────────────────────────────────

function buildAIPrompt(result: NameAnalysisResult, birthDate?: string, sunSign?: string, moonSign?: string): string {
  const firstName = result.full_name.split(' ')[0] || 'friend';
  const letterBreakdown = result.letter_frequencies.slice(0, 8).map(lf => `${lf.letter}: ${lf.count}x`).join(', ');
  const vowelInsight = getVowelConsonantInsight(result.vowel_count, result.consonant_count);

  let chartContext = '';
  if (sunSign || moonSign) {
    chartContext = `\nASTROLOGICAL CROSS-REFERENCE:\n`;
    if (sunSign) chartContext += `Sun Sign: ${sunSign} — integrate this with their Expression number to show how their name energy and solar identity work together\n`;
    if (moonSign) chartContext += `Moon Sign: ${moonSign} — connect this with their Soul Urge to show how their emotional needs in astrology align (or conflict) with what their name reveals\n`;
  }

  return `NAME ANALYSIS FOR ${result.full_name.toUpperCase()}

Full Name: ${result.full_name}
First Name: ${firstName}
${birthDate ? `Birth Date: ${birthDate}` : ''}
${chartContext}
CORE NUMEROLOGICAL PROFILE:
Expression Number: ${result.expression_number} (${NUM_TITLES[result.expression_number] || ''}) — who they are meant to become
Soul Urge Number: ${result.soul_urge_number} (${NUM_TITLES[result.soul_urge_number] || ''}) — what their heart aches for
Personality Number: ${result.personality_number} (${NUM_TITLES[result.personality_number] || ''}) — the mask they wear
${result.life_path_number ? `Life Path Number: ${result.life_path_number} (${NUM_TITLES[result.life_path_number] || ''}) — the road they walk` : ''}

Letter Analysis:
- First Letter: ${result.first_letter}
- Total Letters: ${result.total_letters}
- Vowels: ${result.vowel_count} (${Math.round((result.vowel_count / result.total_letters) * 100)}%)
- Consonants: ${result.consonant_count} (${Math.round((result.consonant_count / result.total_letters) * 100)}%)
- Dominant Letters: ${letterBreakdown}
- Vowel/Consonant Insight: ${vowelInsight.replace(/\*\*/g, '')}

INSTRUCTIONS:

You are a master numerologist with 25 years of private practice. Write as if ${firstName} is sitting across from you.

YOUR VOICE: Conversational, direct, emotionally present. Be SPECIFIC — not "you are creative" but what KIND of creativity, how it shows up at 2am. Show them things they have felt but never articulated. Vary rhythm — short sentences for impact, longer for depth, questions to make them pause.

STRUCTURE (use ## and ### headers):

## ${firstName}, Let Me Tell You What Your Name Has Been Trying to Tell You
- Powerful opening referencing their specific number combination

### The Power You Carry (Expression ${result.expression_number})
- Their specific gift, how it shows up in work/relationships, the shadow when blocked

### What Your Heart Actually Wants (Soul Urge ${result.soul_urge_number})
- The private desire they might not admit. What they crave in love/friendship/solitude

### How The World Sees You (Personality ${result.personality_number})
- The gap between who they are and who people think they are

${result.life_path_number ? `### The Road You Are Walking (Life Path ${result.life_path_number})\n- Lessons, current life phase, how it works with their Expression number` : ''}

${sunSign || moonSign ? `### Where Your Stars and Your Name Converge\n- How their astrological profile confirms, amplifies, or creates tension with their numerological identity. Be specific about the interplay.` : ''}

### The Hidden Mathematics of Your Name
- Letter patterns, vowel/consonant balance, what the first letter reveals, blind spots

### ${firstName}, Here Is What I Need You to Hear
- A closing so specific to their numbers it could only be for them. End with a screenshot-worthy sentence.

RULES: 1500+ words. Never say "in conclusion." Weave traits into narrative prose. Include 2 moments that might make them emotional. Make them understand themselves better than they did 10 minutes ago.`;
}

// ─── Fallback reading generator ─────────────────────────────────────────────────

function generateFallbackReading(result: NameAnalysisResult, sunSign?: string, moonSign?: string): string {
  const firstName = result.full_name.split(' ')[0] || 'friend';
  const expr = EXPRESSION_PROFILES[result.expression_number] || EXPRESSION_PROFILES[1];
  const soul = SOUL_URGE_PROFILES[result.soul_urge_number] || SOUL_URGE_PROFILES[1];
  const pers = PERSONALITY_PROFILES[result.personality_number] || PERSONALITY_PROFILES[1];
  const firstLetterInsight = FIRST_LETTER_INSIGHTS[result.first_letter] || '';
  const vowelInsight = getVowelConsonantInsight(result.vowel_count, result.consonant_count);

  let r = `## ${firstName}, Let Me Tell You What Your Name Has Been Trying to Tell You\n\n`;
  r += `Your name — **${result.full_name}** — is not a random label your parents picked off a list. It is a frequency. A code. A vibration that has been shaping your personality, your relationships, and your destiny since the moment it was first spoken aloud. Every time someone calls your name, they are activating this energy. Let me show you what it contains.\n\n`;

  r += `### The Power You Carry (Expression ${result.expression_number} — ${NUM_TITLES[result.expression_number] || ''})\n\n`;
  r += `${expr.power}\n\n`;
  r += `${expr.shadow}\n\n`;
  r += `**Where this takes you:** ${expr.careers}.\n\n`;

  r += `### What Your Heart Actually Wants (Soul Urge ${result.soul_urge_number})\n\n`;
  r += `${soul}\n\n`;

  r += `### How The World Sees You (Personality ${result.personality_number})\n\n`;
  r += `${pers}\n\n`;
  r += `**In relationships:** ${expr.love}.\n\n`;

  if (result.life_path_number) {
    r += `### The Road You Are Walking (Life Path ${result.life_path_number})\n\n`;
    const lpProfile = EXPRESSION_PROFILES[result.life_path_number] || EXPRESSION_PROFILES[1];
    r += `Your Life Path of **${result.life_path_number}** (${NUM_TITLES[result.life_path_number] || ''}) is the curriculum your soul signed up for. `;
    if (result.life_path_number === result.expression_number) {
      r += `Remarkably, your Life Path and Expression are the same number — **${result.life_path_number}**. This is rare. It means there is no conflict between who you are meant to become and the lessons you are here to learn. Your name and your destiny are singing the same note. When you feel lost, you are never actually far from your path.\n\n`;
    } else {
      r += `Combined with your Expression ${result.expression_number}, this creates a specific dynamic: your name says you are built to be ${NUM_TITLES[result.expression_number] || 'something powerful'}, while your life path is teaching you the lessons of ${NUM_TITLES[result.life_path_number] || 'growth'}. ${lpProfile.power.split('.')[0]}. The tension between these two energies is where your greatest growth happens.\n\n`;
    }
  }

  if (sunSign || moonSign) {
    r += `### Where Your Stars and Your Name Converge\n\n`;
    if (sunSign) {
      r += `Your Sun in **${sunSign}** combined with your Expression **${result.expression_number}** creates a specific signature. `;
      r += `Your solar identity (${sunSign}) is the energy you radiate in the world, while your Expression number is the mission encoded in your name. `;
      r += `Together, they define how you show up AND what you are building toward.\n\n`;
    }
    if (moonSign) {
      r += `Your Moon in **${moonSign}** paired with your Soul Urge **${result.soul_urge_number}** is where the real depth lives. `;
      r += `Your Moon sign reveals your emotional needs astrologically, and your Soul Urge reveals them numerologically. `;
      if (moonSign === sunSign) r += `These are reinforcing each other — your emotional truth is consistent and unmistakable.\n\n`;
      else r += `When these two align, you feel complete. When they pull in different directions, you feel that quiet restlessness that you can never quite explain to anyone.\n\n`;
    }
  }

  r += `### The Hidden Mathematics of Your Name\n\n`;
  if (firstLetterInsight) r += `**First Letter — ${result.first_letter}:** ${firstLetterInsight}\n\n`;
  r += `${vowelInsight}\n\n`;
  const topLetters = result.letter_frequencies.slice(0, 3);
  if (topLetters.length > 0) {
    r += `Your most dominant letter is **${topLetters[0].letter}** (appears ${topLetters[0].count} times). `;
    r += `This letter carries extra weight in your name's vibration — it amplifies the energy of whatever it touches. `;
    if (topLetters.length > 1) r += `Followed by **${topLetters[1].letter}** (${topLetters[1].count}x)${topLetters.length > 2 ? ` and **${topLetters[2].letter}** (${topLetters[2].count}x)` : ''}. `;
    r += `Together, these dominant letters shape the "texture" of your name — the way it feels in people's mouths, the way it lingers in their minds.\n\n`;
  }

  r += `### ${firstName}, Here Is What I Need You to Hear\n\n`;
  r += `Your name is not an accident. Every letter, every vowel, every consonant carries a frequency — and together they form the energetic signature of your purpose. `;
  r += `You carry the vibration of **${result.expression_number}** in a world that often does not know what to do with that energy. `;
  r += `You have probably spent years wondering why you feel things so deeply, why certain patterns keep repeating, why you never quite fit into the boxes other people seem comfortable in. `;
  r += `Now you know: you were never meant to fit. You were meant to stand out.\n\n`;
  r += `Lean into your ${NUM_TITLES[result.expression_number] || result.expression_number.toString()} Expression. Honor your Soul Urge of ${result.soul_urge_number} — it is not a weakness, it is the compass pointing toward everything that matters. `;
  if (result.life_path_number) r += `And trust that your Life Path ${result.life_path_number} is leading you exactly where you need to go, even when the road does not make sense yet. `;
  r += `Your name has been trying to tell you who you are your entire life. Now you are finally listening.`;

  return r;
}

// ─── Render helpers ─────────────────────────────────────────────────────────────

function RenderMarkdown({ text }: { text: string }) {
  return <>{text.split('\n').map((line, i) => {
    const t = line.trim();
    if (!t) return <div key={i} className="h-2" />;
    if (t === '---') return <hr key={i} className="border-border-primary my-4" />;
    if (t.startsWith('## ')) return <h2 key={i} className="text-accent-primary font-bold text-lg mt-4 mb-2">{t.slice(3)}</h2>;
    if (t.startsWith('### ')) return <h3 key={i} className="text-text-primary font-semibold mt-3 mb-1">{t.slice(4)}</h3>;
    if (t.startsWith('- ') || t.startsWith('• ')) return <p key={i} className="text-text-secondary text-sm leading-relaxed mb-1 pl-3"><span className="text-accent-primary mr-2">&bull;</span><InlineBold text={t.replace(/^[-•]\s*/, '')} /></p>;
    return <p key={i} className="text-text-secondary text-sm leading-relaxed mb-1"><InlineBold text={t} /></p>;
  })}</>;
}

function InlineBold({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return <>{parts.map((p, i) => p.startsWith('**') && p.endsWith('**') ? <strong key={i} className="font-bold text-text-primary">{p.slice(2, -2)}</strong> : <span key={i}>{p}</span>)}</>;
}

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className="ml-2 p-1 rounded hover:bg-bg-tertiary transition-colors shrink-0" title="Copy">
      {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5 text-text-muted" />}
    </button>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────────

export default function NameAnalysisPage() {
  const { profile } = useAuthStore();
  const [fullName, setFullName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [result, setResult] = useState<NameAnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [aiReading, setAiReading] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'analysis' | 'compatibility' | 'variants'>('analysis');
  const [compareName, setCompareName] = useState('');
  const [compareResult, setCompareResult] = useState<NameAnalysisResult | null>(null);
  const [variantName, setVariantName] = useState('');

  useState(() => {
    if (profile?.birth_date && !birthDate) setBirthDate(profile.birth_date);
  });

  const sunSign = profile?.sun_sign || undefined;
  const moonSign = profile?.moon_sign || undefined;

  async function handleAnalyze(e: React.FormEvent) {
    e.preventDefault();
    if (!fullName.trim()) { setError('Please enter a full name.'); return; }
    setLoading(true); setError(''); setResult(null); setAiReading('');
    try {
      setResult(calculateNameAnalysis(fullName.trim(), birthDate));
    } catch (err: any) { setError(err.message || 'Failed to analyze'); }
    finally { setLoading(false); }
  }

  async function handleAiReading() {
    if (!result) return;
    setAiLoading(true); setAiReading('');
    const chartText = buildAIPrompt(result, birthDate || undefined, sunSign, moonSign);
    try {
      await api.streamAIInterpretation(
        { type: 'name_analysis', chart_data_text: chartText, messages: [{ role: 'user', content: 'Please give me my personal name reading.' }] },
        (chunk) => setAiReading(prev => prev + chunk), () => {},
      );
    } catch { setAiReading(generateFallbackReading(result, sunSign, moonSign)); }
    finally { setAiLoading(false); }
  }

  function handleCompare() {
    if (!compareName.trim()) return;
    setCompareResult(calculateNameAnalysis(compareName.trim(), ''));
  }

  const compatibility = useMemo(() => {
    if (!result || !compareResult) return null;
    const exprCompat = getCompatibility(result.expression_number, compareResult.expression_number);
    const soulCompat = getCompatibility(result.soul_urge_number, compareResult.soul_urge_number);
    const overall = Math.round((exprCompat.rating + soulCompat.rating) / 2);
    return { exprCompat, soulCompat, overall };
  }, [result, compareResult]);

  const variantAnalysis = useMemo(() => {
    if (!result || !variantName.trim()) return null;
    return getNameVariantAnalysis(result.full_name, variantName.trim());
  }, [result, variantName]);

  const toggle = (key: string) => setExpandedSection(expandedSection === key ? null : key);

  return (
    <PaywallGate feature="name_analysis" fallbackTier="light">
      <div className="max-w-3xl mx-auto">
        <Link href="/readings" className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to Readings
        </Link>
        <div className="flex items-center gap-3 mb-2">
          <Type className="w-8 h-8 text-accent-primary" />
          <div>
            <h1 className="text-2xl font-display font-bold text-text-primary">Name Analysis</h1>
            <p className="text-text-tertiary text-sm">Numerology, letter vibrations, compatibility, and the hidden code in your name</p>
          </div>
        </div>

        {/* Input Form */}
        {!result && (
          <form onSubmit={handleAnalyze} className="card space-y-4 mt-6">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Full Name</label>
              <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} className="input" placeholder="Enter your full legal name" autoCapitalize="words" autoComplete="off" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Birth Date <span className="text-text-muted">(optional — adds Life Path)</span></label>
              <input type="text" value={birthDate} onChange={e => setBirthDate(e.target.value)} className="input" placeholder="DD-MM-YYYY" />
            </div>
            <button type="submit" disabled={loading || !fullName.trim()} className="btn-primary w-full">
              {loading ? 'Analyzing...' : 'Reveal Your Name Code'}
            </button>
            {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
          </form>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-5 mt-6">

            {/* Tabs */}
            <div className="flex gap-1 bg-bg-secondary rounded-xl p-1">
              {([
                { key: 'analysis' as const, label: 'Your Name', icon: <Type className="w-3.5 h-3.5" /> },
                { key: 'compatibility' as const, label: 'Compatibility', icon: <Heart className="w-3.5 h-3.5" /> },
                { key: 'variants' as const, label: 'Name Variants', icon: <RefreshCw className="w-3.5 h-3.5" /> },
              ]).map(tab => (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                  className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold py-2.5 rounded-lg transition-all ${activeTab === tab.key ? 'bg-accent-primary text-white' : 'text-text-muted hover:text-text-primary'}`}>
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>

            {/* ─── TAB: Analysis ─── */}
            {activeTab === 'analysis' && (
              <div className="space-y-5">
                {/* Core Numbers */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: 'Expression', num: result.expression_number, sub: 'Who you become' },
                    { label: 'Soul Urge', num: result.soul_urge_number, sub: 'What you crave' },
                    { label: 'Personality', num: result.personality_number, sub: 'How they see you' },
                    ...(result.life_path_number ? [{ label: 'Life Path', num: result.life_path_number, sub: 'Your road' }] : []),
                  ].map((nv, i) => (
                    <button key={i} onClick={() => toggle(nv.label)} className={`card text-center py-4 border transition-all ${expandedSection === nv.label ? 'border-accent-primary bg-accent-primary/5' : 'border-border-primary hover:border-accent-muted'}`}>
                      <span className="text-4xl font-extrabold text-accent-primary block">{nv.num}</span>
                      <span className="text-sm font-semibold text-text-primary block mt-1">{nv.label}</span>
                      <span className="text-[10px] text-text-muted block">{NUM_TITLES[nv.num] || ''}</span>
                      <span className="text-[9px] text-text-tertiary block mt-0.5">{nv.sub}</span>
                      {expandedSection === nv.label ? <ChevronUp className="w-3 h-3 text-accent-primary mx-auto mt-1" /> : <ChevronDown className="w-3 h-3 text-text-muted mx-auto mt-1" />}
                    </button>
                  ))}
                </div>

                {/* Expanded Number Detail */}
                {expandedSection && (
                  <div className="card border border-accent-muted animate-in fade-in">
                    {expandedSection === 'Expression' && EXPRESSION_PROFILES[result.expression_number] && (
                      <>
                        <h3 className="text-sm font-bold text-accent-primary mb-2">Expression {result.expression_number} — {NUM_TITLES[result.expression_number]}</h3>
                        <p className="text-sm text-text-secondary leading-relaxed mb-3">{EXPRESSION_PROFILES[result.expression_number].power}</p>
                        <p className="text-sm text-red-400/80 leading-relaxed mb-3"><strong className="text-red-400">Shadow:</strong> {EXPRESSION_PROFILES[result.expression_number].shadow}</p>
                        <p className="text-xs text-text-muted"><strong className="text-text-tertiary">Best careers:</strong> {EXPRESSION_PROFILES[result.expression_number].careers}</p>
                        <p className="text-xs text-text-muted mt-1"><strong className="text-text-tertiary">In love:</strong> {EXPRESSION_PROFILES[result.expression_number].love}</p>
                      </>
                    )}
                    {expandedSection === 'Soul Urge' && (
                      <>
                        <h3 className="text-sm font-bold text-accent-primary mb-2">Soul Urge {result.soul_urge_number} — {NUM_TITLES[result.soul_urge_number]}</h3>
                        <p className="text-sm text-text-secondary leading-relaxed">{SOUL_URGE_PROFILES[result.soul_urge_number] || ''}</p>
                      </>
                    )}
                    {expandedSection === 'Personality' && (
                      <>
                        <h3 className="text-sm font-bold text-accent-primary mb-2">Personality {result.personality_number} — {NUM_TITLES[result.personality_number]}</h3>
                        <p className="text-sm text-text-secondary leading-relaxed">{PERSONALITY_PROFILES[result.personality_number] || ''}</p>
                      </>
                    )}
                    {expandedSection === 'Life Path' && result.life_path_number && EXPRESSION_PROFILES[result.life_path_number] && (
                      <>
                        <h3 className="text-sm font-bold text-accent-primary mb-2">Life Path {result.life_path_number} — {NUM_TITLES[result.life_path_number]}</h3>
                        <p className="text-sm text-text-secondary leading-relaxed mb-3">{EXPRESSION_PROFILES[result.life_path_number].power}</p>
                        {result.life_path_number === result.expression_number ? (
                          <p className="text-sm text-emerald-400 leading-relaxed"><strong>Rare alignment:</strong> Your Life Path and Expression are the same number. Your name and your destiny are singing the same note.</p>
                        ) : (
                          <p className="text-sm text-amber-400/80 leading-relaxed"><strong>Dynamic tension:</strong> Your Expression ({result.expression_number}) says who you are meant to become. Your Life Path ({result.life_path_number}) shows what lessons you must learn to get there. The friction between them is where your greatest growth happens.</p>
                        )}
                      </>
                    )}
                    <CopyBtn text={expandedSection === 'Expression' ? EXPRESSION_PROFILES[result.expression_number]?.power || '' : expandedSection === 'Soul Urge' ? SOUL_URGE_PROFILES[result.soul_urge_number] || '' : PERSONALITY_PROFILES[result.personality_number] || ''} />
                  </div>
                )}

                {/* First Letter + Vowel/Consonant */}
                <div className="card">
                  <h3 className="text-sm font-bold text-text-primary mb-2">Name Architecture</h3>
                  {FIRST_LETTER_INSIGHTS[result.first_letter] && (
                    <div className="mb-3">
                      <p className="text-[10px] uppercase tracking-widest text-accent-secondary font-semibold mb-1">First Letter — {result.first_letter}</p>
                      <p className="text-sm text-text-secondary leading-relaxed">{FIRST_LETTER_INSIGHTS[result.first_letter]}</p>
                    </div>
                  )}
                  <div className="mb-3">
                    <p className="text-[10px] uppercase tracking-widest text-accent-secondary font-semibold mb-1">Inner/Outer Balance</p>
                    <div className="flex gap-2 mb-2">
                      <div className="flex-1 bg-purple-500/10 rounded-lg p-2 text-center">
                        <span className="text-lg font-bold text-purple-400">{result.vowel_count}</span>
                        <span className="text-[10px] text-text-muted block">Vowels (Soul)</span>
                      </div>
                      <div className="flex-1 bg-blue-500/10 rounded-lg p-2 text-center">
                        <span className="text-lg font-bold text-blue-400">{result.consonant_count}</span>
                        <span className="text-[10px] text-text-muted block">Consonants (Mask)</span>
                      </div>
                    </div>
                    <RenderMarkdown text={getVowelConsonantInsight(result.vowel_count, result.consonant_count)} />
                  </div>
                </div>

                {/* Letter Frequency */}
                {result.letter_frequencies.length > 0 && (
                  <div className="card">
                    <h3 className="text-sm font-bold text-text-primary mb-2">Letter Frequency</h3>
                    <div className="space-y-1">
                      {result.letter_frequencies.map((lf, i) => {
                        const maxC = result.letter_frequencies[0].count;
                        return (
                          <div key={i} className="flex items-center gap-2 py-0.5">
                            <span className="text-sm font-semibold text-text-primary w-5 text-center">{lf.letter}</span>
                            <div className="flex-1 h-3 bg-bg-tertiary rounded-full overflow-hidden">
                              <div className="h-full bg-gradient-accent rounded-full" style={{ width: `${Math.max((lf.count / maxC) * 100, 5)}%` }} />
                            </div>
                            <span className="text-xs text-text-secondary w-5 text-right">{lf.count}</span>
                          </div>
                        );
                      })}
                    </div>
                    <p className="text-xs text-text-muted mt-2">
                      Your dominant letter <strong className="text-text-primary">{result.letter_frequencies[0]?.letter}</strong> amplifies its numerological value ({PYTH_MAP[result.letter_frequencies[0]?.letter] || '?'}) throughout your name, creating a recurring energetic pulse.
                    </p>
                  </div>
                )}

                {/* Birth Chart Cross-Reference */}
                {(sunSign || moonSign) && (
                  <div className="card border border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-transparent">
                    <h3 className="text-sm font-bold text-amber-400 mb-2">Astro-Numerology Cross-Reference</h3>
                    {sunSign && <p className="text-sm text-text-secondary leading-relaxed mb-2"><strong className="text-text-primary">{sunSign} Sun + Expression {result.expression_number}:</strong> Your solar identity ({sunSign}) and your name's destiny ({NUM_TITLES[result.expression_number]}) {sunSign === 'Aries' && result.expression_number === 1 ? 'are in perfect resonance — double pioneer energy' : `create a unique blend of ${sunSign} presence with ${(NUM_TITLES[result.expression_number] || '').toLowerCase()} purpose`}.</p>}
                    {moonSign && <p className="text-sm text-text-secondary leading-relaxed"><strong className="text-text-primary">{moonSign} Moon + Soul Urge {result.soul_urge_number}:</strong> Your emotional needs ({moonSign} Moon) {moonSign === sunSign ? 'reinforce' : 'add dimension to'} what your Soul Urge ({result.soul_urge_number}) craves. This is the deepest layer of who you are — where astrology and numerology agree on what your heart needs.</p>}
                  </div>
                )}

                {/* AI Reading */}
                <button onClick={handleAiReading} disabled={aiLoading} className="btn-primary w-full py-3">
                  {aiLoading ? 'Crafting Your Reading...' : '✨ Get Your Deep Personal Reading'}
                </button>
                {aiReading.length > 0 && (
                  <div className="card border-accent-muted">
                    <div className="flex items-center justify-between mb-3">
                      <h2 className="text-lg font-display font-bold text-accent-secondary">Your Personal Name Reading</h2>
                      <CopyBtn text={aiReading} />
                    </div>
                    <RenderMarkdown text={aiReading} />
                  </div>
                )}
              </div>
            )}

            {/* ─── TAB: Compatibility ─── */}
            {activeTab === 'compatibility' && (
              <div className="space-y-5">
                <div className="card">
                  <h3 className="text-sm font-bold text-text-primary mb-2">Name Compatibility</h3>
                  <p className="text-xs text-text-muted mb-3">Compare your name with a partner, friend, crush, or business partner.</p>
                  <div className="flex gap-2">
                    <input type="text" value={compareName} onChange={e => setCompareName(e.target.value)} className="input flex-1" placeholder="Enter their full name" onKeyDown={e => e.key === 'Enter' && handleCompare()} />
                    <button onClick={handleCompare} disabled={!compareName.trim()} className="btn-primary px-4 shrink-0">Compare</button>
                  </div>
                </div>

                {compareResult && compatibility && (
                  <>
                    {/* Score */}
                    <div className="card text-center">
                      <div className="relative w-28 h-28 mx-auto mb-3">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
                          <circle cx="50" cy="50" r="42" fill="none" stroke={compatibility.overall >= 75 ? '#10B981' : compatibility.overall >= 50 ? '#F59E0B' : '#EF4444'} strokeWidth="6" strokeLinecap="round" strokeDasharray={2 * Math.PI * 42} strokeDashoffset={2 * Math.PI * 42 - (compatibility.overall / 100) * 2 * Math.PI * 42} className="transition-all duration-700" />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-3xl font-extrabold" style={{ color: compatibility.overall >= 75 ? '#10B981' : compatibility.overall >= 50 ? '#F59E0B' : '#EF4444' }}>{compatibility.overall}%</span>
                        </div>
                      </div>
                      <p className="text-sm font-semibold text-text-primary">{result.full_name} + {compareResult.full_name}</p>
                      <p className="text-xs text-text-muted">Overall Name Compatibility</p>
                    </div>

                    {/* Side by side numbers */}
                    <div className="card">
                      <h3 className="text-sm font-bold text-text-primary mb-3">Number Comparison</h3>
                      <div className="space-y-3">
                        {[
                          { label: 'Expression', n1: result.expression_number, n2: compareResult.expression_number },
                          { label: 'Soul Urge', n1: result.soul_urge_number, n2: compareResult.soul_urge_number },
                          { label: 'Personality', n1: result.personality_number, n2: compareResult.personality_number },
                        ].map((row, i) => (
                          <div key={i}>
                            <div className="flex items-center justify-between mb-1">
                              <div className="text-center flex-1">
                                <span className="text-xl font-bold text-accent-primary">{row.n1}</span>
                                <span className="text-[10px] text-text-muted block">{result.full_name.split(' ')[0]}</span>
                              </div>
                              <span className="text-[10px] text-text-muted uppercase tracking-widest px-2">{row.label}</span>
                              <div className="text-center flex-1">
                                <span className="text-xl font-bold text-pink-400">{row.n2}</span>
                                <span className="text-[10px] text-text-muted block">{compareResult.full_name.split(' ')[0]}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Expression compat */}
                    <div className="card">
                      <h3 className="text-sm font-bold text-text-primary mb-1">Expression Compatibility ({compatibility.exprCompat.rating}%)</h3>
                      <p className="text-xs text-text-muted mb-2">How your public identities interact</p>
                      <p className="text-sm text-text-secondary leading-relaxed">{compatibility.exprCompat.desc}</p>
                    </div>

                    {/* Soul compat */}
                    <div className="card">
                      <h3 className="text-sm font-bold text-text-primary mb-1">Soul Urge Compatibility ({compatibility.soulCompat.rating}%)</h3>
                      <p className="text-xs text-text-muted mb-2">How your deepest desires align</p>
                      <p className="text-sm text-text-secondary leading-relaxed">{compatibility.soulCompat.desc}</p>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* ─── TAB: Variants ─── */}
            {activeTab === 'variants' && (
              <div className="space-y-5">
                <div className="card">
                  <h3 className="text-sm font-bold text-text-primary mb-1">Name Variant Analysis</h3>
                  <p className="text-xs text-text-muted mb-3">See how a nickname, married name, or business name changes your vibration compared to <strong className="text-text-primary">{result.full_name}</strong> (Expression {result.expression_number}).</p>
                  <input type="text" value={variantName} onChange={e => setVariantName(e.target.value)} className="input" placeholder="e.g. nickname, married name, business name" />
                </div>

                {variantAnalysis && (
                  <div className="card border border-accent-muted">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="text-sm font-bold text-text-primary">{variantName}</h3>
                        <p className="text-xs text-text-muted">Expression: {variantAnalysis.expression} ({NUM_TITLES[variantAnalysis.expression] || ''})</p>
                      </div>
                      <div className="flex gap-2 items-center">
                        <div className="text-center">
                          <span className="text-2xl font-bold text-accent-primary">{result.expression_number}</span>
                          <span className="text-[9px] text-text-muted block">Full</span>
                        </div>
                        <span className="text-text-muted">→</span>
                        <div className="text-center">
                          <span className="text-2xl font-bold text-pink-400">{variantAnalysis.expression}</span>
                          <span className="text-[9px] text-text-muted block">Variant</span>
                        </div>
                      </div>
                    </div>
                    <RenderMarkdown text={variantAnalysis.diff} />
                    {variantAnalysis.expression !== result.expression_number && (
                      <div className="mt-3 p-2.5 bg-amber-500/5 rounded-lg border border-amber-500/15">
                        <p className="text-xs text-amber-400 leading-relaxed">
                          <strong>Practical impact:</strong> Every time someone calls you "{variantName}" instead of "{result.full_name}", they are activating a {variantAnalysis.expression} vibration instead of your birth {result.expression_number}. This is not good or bad — but it is different. Consider which energy you want more of in your life.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Quick variants */}
                <div className="card">
                  <h3 className="text-sm font-bold text-text-primary mb-2">Quick Comparisons</h3>
                  <p className="text-xs text-text-muted mb-3">Tap to analyze common variants of your name:</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      result.full_name.split(' ')[0],
                      result.full_name.split(' ').length > 1 ? `${result.full_name.split(' ')[0]} ${result.full_name.split(' ').slice(-1)[0]}` : null,
                      result.full_name.split(' ')[0]?.slice(0, Math.ceil(result.full_name.split(' ')[0].length * 0.6)),
                    ].filter((v): v is string => !!v && v !== result.full_name).map((variant, i) => {
                      const vNums = calcNameNumbers(variant);
                      return (
                        <button key={i} onClick={() => setVariantName(variant)} className={`text-xs px-3 py-1.5 rounded-full border transition-all ${variantName === variant ? 'border-accent-primary bg-accent-primary/10 text-accent-primary' : 'border-border-primary text-text-muted hover:text-text-primary'}`}>
                          {variant} → {vNums.expression}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Analyze another */}
            <button onClick={() => { setResult(null); setAiReading(''); setError(''); setCompareResult(null); setExpandedSection(null); }} className="btn-secondary w-full">
              Analyze Another Name
            </button>
          </div>
        )}
      </div>
    </PaywallGate>
  );
}
