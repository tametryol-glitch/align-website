'use client';

import { useState, useCallback } from 'react';
import { Star, Sparkles, RotateCcw, Eye, Share2, Check, Copy } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useSubscriptionStore } from '@/stores/subscriptionStore';
import { drawCards as drawLocalCards, type DrawnCard } from '@/lib/tarotDeck';
import ReactMarkdown from 'react-markdown';
import ShareButton from '@/components/ui/ShareButton';

type SpreadType = 'single' | 'three_card' | 'celtic_cross' | 'relationship' | 'career';

interface SpreadOption {
  key: SpreadType;
  label: string;
  icon: string;
  cardCount: number;
}

const SPREAD_OPTIONS: SpreadOption[] = [
  { key: 'single', label: 'Single Card', icon: '♠', cardCount: 1 },
  { key: 'three_card', label: 'Three Card', icon: '♣', cardCount: 3 },
  { key: 'celtic_cross', label: 'Celtic Cross', icon: '✚', cardCount: 10 },
  { key: 'relationship', label: 'Relationship', icon: '♥', cardCount: 5 },
  { key: 'career', label: 'Career', icon: '♦', cardCount: 5 },
];

const THREE_CARD_LABELS = ['Past', 'Present', 'Future'];
const CELTIC_CROSS_LABELS = [
  'Present', 'Challenge', 'Foundation', 'Recent Past',
  'Crown', 'Near Future', 'Self', 'Environment',
  'Hopes/Fears', 'Outcome',
];
const RELATIONSHIP_LABELS = ['You', 'Partner', 'Connection', 'Challenge', 'Potential'];
const CAREER_LABELS = ['Current', 'Obstacle', 'Hidden Factor', 'Advice', 'Outcome'];

function getPositionLabels(spread: SpreadType): string[] {
  switch (spread) {
    case 'single': return ['Focus'];
    case 'three_card': return THREE_CARD_LABELS;
    case 'celtic_cross': return CELTIC_CROSS_LABELS;
    case 'relationship': return RELATIONSHIP_LABELS;
    case 'career': return CAREER_LABELS;
    default: return [];
  }
}

interface TarotResult {
  spread_type: SpreadType;
  cards: DrawnCard[];
  question?: string;
}

// ── CARD_SOUL: Deep Major Arcana interpretations ──
const CARD_SOUL: Record<string, { upright: string; reversed: string }> = {
  'The Fool': {
    upright: `This is the energy of someone standing at the edge of a cliff — not because they are reckless, but because they trust the ground will meet them. You are being called to begin something without needing every answer first. The innocence here is not naivety — it is the kind of courage that comes from knowing that some journeys only reveal their purpose after you take the first step.`,
    reversed: `You have been hesitating at a threshold, and this card is showing you exactly why. There is a leap you know you need to take, but fear has dressed itself up as logic and convinced you to stay put. The question is not whether you are ready — it is whether you are willing to stop waiting for a certainty that will never come.`,
  },
  'The Magician': {
    upright: `Every tool you need is already in your hands. This is not a card about wishing or hoping — it is about recognizing that you have real, tangible power to shape what happens next. The Magician does not wait for permission. They look at what is available, and they create something from it. That is where you are right now.`,
    reversed: `Your power is scattered. You have the skills, the intelligence, the raw material — but something is causing you to use them against yourself instead of for yourself. Whether it is self-sabotage, distraction, or pouring your energy into things that drain you, this card is a direct call to stop and ask: where is my energy actually going?`,
  },
  'The High Priestess': {
    upright: `There is something you already know that you have been trying to verify through external sources. Stop. The High Priestess is telling you that your intuition has already given you the answer — you just have not trusted it yet. The truth you are seeking is not hidden. It is sitting quietly inside you, waiting for you to listen.`,
    reversed: `You have been disconnected from your inner voice, and it is costing you. Decisions feel harder than they should, and you keep looking to others for answers that only you can give. Something has made you doubt yourself — a past experience, a critical voice, a fear of being wrong. This card says: reconnect. Your gut has never been the problem.`,
  },
  'The Empress': {
    upright: `Something in your life is ready to grow, and this card is confirming that you have the nurturing capacity to sustain it. This is not about forcing outcomes — it is about creating the conditions for something beautiful to emerge naturally. Whether it is a relationship, a creative project, or your own sense of self-worth, abundance is not just possible right now — it is already beginning.`,
    reversed: `You have been giving so much that there is nothing left for yourself. Or perhaps you have been withholding — closing off from love, creativity, or vulnerability because something taught you it was not safe to be soft. Either way, the imbalance is real, and it is affecting everything else in this reading.`,
  },
  'The Emperor': {
    upright: `Structure is not your enemy right now — it is your greatest ally. This card speaks to a time where discipline, clear boundaries, and decisive action will produce results that emotion alone cannot. You do not need to be harsh, but you do need to be firm. Especially with yourself.`,
    reversed: `Control is an illusion you have been clinging to, and it is starting to crack. Whether you have been too rigid with others or too passive in your own life, The Emperor reversed is telling you that the way you have been trying to hold everything together is not sustainable. Real authority comes from flexibility, not force.`,
  },
  'The Hierophant': {
    upright: `There is wisdom available to you right now — not just from books or teachers, but from the traditions and values that have shaped who you are. This card asks you to consider what you truly believe, separate from what you have been told to believe. When your actions align with your genuine values, everything else falls into place.`,
    reversed: `You are outgrowing a belief system, a tradition, or a set of rules that once served you but no longer fits. This is uncomfortable because these structures gave you certainty. But staying inside a framework you have outgrown is more dangerous than stepping outside of it.`,
  },
  'The Lovers': {
    upright: `This is not just about romance — although it can be. At its core, The Lovers is about alignment. It is about making a choice that reflects who you truly are, not who you think you should be. There is a decision in front of you, and the right answer is the one that feels like integrity, even if it is the harder path.`,
    reversed: `There is a misalignment somewhere in your life — between what you say and what you do, between what you want and what you are settling for, or between who you are with someone and who you are alone. This card will not let you ignore it. The discomfort you feel is the gap between your truth and your reality.`,
  },
  'The Chariot': {
    upright: `You have the momentum. The question is whether you will direct it or let it scatter. The Chariot is not about gentle progress — it is about focused, intentional forward motion. You have been through enough deliberation. The cards are saying: move. Not recklessly, but with the confidence of someone who knows where they are going.`,
    reversed: `You feel like you are pushing forward but getting nowhere, or worse — you are being pulled in two directions and the internal conflict is paralyzing you. Something needs to be resolved before you can move again. Which voice inside you are you going to listen to? Because you cannot follow both.`,
  },
  'Strength': {
    upright: `The strength this card speaks of has nothing to do with force. It is the kind of power that comes from patience, from gentleness, from the quiet discipline of not reacting to every provocation. You are stronger than the situation in front of you. This card is confirming that — not to inflate your ego, but to remind you that composure is a superpower.`,
    reversed: `Something has shaken your confidence. A situation, a person, or a failure has made you forget what you are capable of. The self-doubt you are feeling is not truth — it is noise. This card is not asking you to pretend you are fine. It is asking you to remember a time when you handled something you thought would break you. You survived that. You will survive this.`,
  },
  'The Hermit': {
    upright: `You need space. Not to run from anything, but to see clearly. The noise of other people's opinions, expectations, and energy has made it hard for you to hear your own thoughts. The Hermit is not about loneliness — it is about choosing solitude so you can reconnect with the parts of yourself that only speak when it is quiet.`,
    reversed: `You have been alone with your thoughts for too long, and the isolation has started to distort your perspective. What felt like introspection has become rumination. This card is telling you it is time to come back — to reach out, to share what you have been carrying, to let someone else hold the lantern for a while.`,
  },
  'Wheel of Fortune': {
    upright: `Something is turning. You can feel it — that sense that the season is changing, that a chapter is closing while another opens. The Wheel does not ask for your permission. It simply moves. Your job right now is not to control it, but to position yourself to catch what is coming. Fortune favors those who are prepared and paying attention.`,
    reversed: `You feel like you are stuck in a cycle — the same patterns, the same disappointments, the same type of person or situation showing up in different clothing. The Wheel reversed is not punishment. It is a signal that something in your approach needs to change before the cycle can break. What are you doing the same way and expecting different results?`,
  },
  'Justice': {
    upright: `The truth will surface. If you have been honest, this card brings vindication. If you have been avoiding accountability, it brings a reckoning. Justice is not cruel — it is fair. And fairness sometimes means hearing things you would rather not hear. But everything that follows this card is built on truth, and that is the only foundation worth building on.`,
    reversed: `Something is out of balance, and you know it. Maybe you have been unfair to someone. Maybe someone has been unfair to you. Maybe you have been unfair to yourself — holding yourself to standards you would never impose on someone you love. This card asks you to look at where justice has been denied and to start correcting it.`,
  },
  'The Hanged Man': {
    upright: `Stop trying to force it. The Hanged Man appears when the most productive thing you can do is absolutely nothing — not because you are giving up, but because the answer you are looking for requires a completely different angle. Surrender is not weakness here. It is strategy. Let go of one thing you are gripping too tightly and watch what shifts.`,
    reversed: `You are stalling, and you know it. There is a sacrifice you have been avoiding — a comfort you need to release, a truth you need to accept, a version of the story you need to let die. The longer you resist, the longer you stay suspended. The discomfort of letting go lasts a moment. The discomfort of holding on lasts indefinitely.`,
  },
  'Death': {
    upright: `Something is ending, and it needs to end. Death in a tarot reading is never about physical death — it is about the profound, necessary transformation that happens when you let go of what no longer serves you. This could be a relationship, a belief about yourself, a chapter of your life. It hurts because it mattered. But what is coming next cannot arrive until you make room for it.`,
    reversed: `You are resisting a transformation that has already begun. Part of you knows that a chapter is over, but you keep going back to it — rereading the same pages, hoping for a different ending. Death reversed is compassionate, but it is also firm: the ending happened. Your only choice now is whether you grieve it and grow, or stay frozen in a story that is already finished.`,
  },
  'Temperance': {
    upright: `The answer is not in the extremes — it is in the middle. Temperance shows up when you need to find balance between two parts of your life, two feelings, or two choices that seem mutually exclusive. They are not. There is a way to honor both, but it requires patience and the willingness to stop seeing things in black and white.`,
    reversed: `You have been swinging between extremes — all in or completely withdrawn, overly controlled or chaotically impulsive. The imbalance is catching up with you, and your body, your relationships, or your peace of mind are showing the strain. Something moderate, consistent, and sustainable needs to replace whatever you have been doing.`,
  },
  'The Devil': {
    upright: `Let me be direct: there is something you are attached to that is not good for you, and you know it. The Devil does not represent evil — it represents the chains we put on ourselves and then pretend we cannot remove. An addiction, a toxic dynamic, a pattern of self-destruction disguised as pleasure. This card is not here to judge you. It is here to show you that the door was never locked.`,
    reversed: `You are beginning to break free from something that has had a hold on you. This is brave and difficult and messy, and this card honors that. The shadows you are facing — the habits, the attachments, the parts of yourself you are ashamed of — they lose their power the moment you stop hiding from them. Keep going. Freedom is closer than it feels.`,
  },
  'The Tower': {
    upright: `Something is about to shake loose, and it will feel sudden even though it has been building for a while. The Tower is destabilizing — but it only destroys what was built on a faulty foundation. If something in your life collapses, it is because it could not hold the weight of who you are becoming. This is not punishment. It is liberation disguised as chaos.`,
    reversed: `You can feel the cracks forming but you keep patching them, hoping the structure will hold a little longer. It will not. The Tower reversed means the upheaval is internal — the breakdown is happening inside you, quietly, and ignoring it will only make the eventual rupture worse. It is better to dismantle something carefully than to wait for it to collapse on its own.`,
  },
  'The Star': {
    upright: `After everything you have been through, this card is a breath of relief. The Star tells you that hope is not naive — it is necessary. You are entering a period of healing, of quiet renewal, of remembering who you were before the world made you forget. This is not blind optimism. This is the universe telling you: the worst part is behind you. Believe that.`,
    reversed: `You have lost faith — in the process, in yourself, maybe in everything. The Star reversed does not mean hope is gone. It means you have temporarily lost sight of it. That is different. The light is still there. You just need to stop looking at the ground and look up. What is one small thing that used to bring you peace? Start there.`,
  },
  'The Moon': {
    upright: `Not everything is as it seems right now. The Moon reveals that there are hidden factors — things happening beneath the surface that you cannot fully see yet. This is not a reason to panic, but it is a reason to pause before making any major decisions. Trust your feelings over your logic right now, because your subconscious is picking up on things your conscious mind has not processed yet.`,
    reversed: `The confusion is lifting. Something that felt murky and uncertain is starting to become clear, and what you see might surprise you. The Moon reversed asks you to be honest about what you discover — even if it changes the narrative you have been telling yourself. Clarity is a gift, even when it reveals something uncomfortable.`,
  },
  'The Sun': {
    upright: `This is one of the most genuinely positive cards in the entire deck. The Sun says: yes. Things are aligning. Joy is not only possible right now — it is available. But here is what makes this card truly powerful: it does not just promise happiness. It promises the kind of happiness that comes from authenticity. Be fully yourself. The warmth you feel right now is the universe reflecting your own light back at you.`,
    reversed: `The joy is there, but something is dimming it. Maybe you are not letting yourself feel it because you are waiting for the other shoe to drop. Maybe someone else's negativity is casting a shadow over what should be a bright time. The Sun reversed says: you deserve to feel good about this. Stop apologizing for your happiness. Stop shrinking it to make others comfortable.`,
  },
  'Judgement': {
    upright: `A reckoning is coming — not the punishing kind, but the clarifying kind. Judgement asks you to take an honest inventory of who you have been and who you want to become. This is a moment of spiritual maturity, where you stop blaming circumstances and start taking full ownership of your choices. It is heavy, but it is also deeply freeing.`,
    reversed: `You are avoiding an honest conversation with yourself. There is something you did, something you allowed, or something you failed to do, and it is sitting in the back of your mind like an unpaid debt. Judgement reversed says: deal with it. Not to punish yourself, but to release yourself. Self-forgiveness starts with self-honesty.`,
  },
  'The World': {
    upright: `A cycle is completing. Something you have been working toward — maybe for months, maybe for years — is reaching its natural conclusion. The World does not just mean an ending. It means integration. Everything you learned, every struggle you endured, every moment of doubt has been woven into the person you are right now. You are whole. And you are ready for what comes next.`,
    reversed: `You are so close to completion, but something is holding you back from crossing the finish line. Maybe it is perfectionism. Maybe it is fear of what happens after you succeed. Maybe it is unfinished emotional business that keeps pulling you backward. The World reversed says: the only thing between you and closure is your willingness to let this chapter end.`,
  },
};

const SUIT_ENERGY: Record<string, { domain: string; element: string; voice: string }> = {
  Wands: { domain: 'passion, ambition, and creative drive', element: 'fire', voice: 'your willpower and what truly excites you' },
  Cups: { domain: 'emotions, relationships, and intuition', element: 'water', voice: 'your heart and what you genuinely feel beneath the surface' },
  Swords: { domain: 'thoughts, communication, and truth', element: 'air', voice: 'your mind and the stories you tell yourself about reality' },
  Pentacles: { domain: 'material security, health, and practical matters', element: 'earth', voice: 'your sense of stability and what you are building in the tangible world' },
};

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
      title={copied ? 'Copied!' : 'Copy'}
    >
      {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5 text-text-muted" />}
    </button>
  );
}

function CardBack({ index, onClick }: { index: number; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full group cursor-pointer"
    >
      <div
        className="relative rounded-xl overflow-hidden min-h-[180px] bg-gradient-to-br from-[#1a103a] via-[#2d1b69] to-[#1a103a] border border-accent-primary/30 flex items-center justify-center transition-all duration-300 hover:scale-[1.02] hover:border-accent-primary/50 hover:shadow-lg hover:shadow-accent-primary/10"
        style={{ animationDelay: `${index * 150}ms` }}
      >
        <div className="absolute inset-2 border border-accent-primary/15 rounded-lg" />
        <span className="text-4xl text-accent-primary/60 group-hover:text-accent-primary/80 transition-colors">{'✦'}</span>
      </div>
      <p className="text-[11px] text-text-muted text-center mt-1.5 group-hover:text-text-tertiary transition-colors">Tap to reveal</p>
    </button>
  );
}

function RevealedCard({ card }: { card: DrawnCard }) {
  const borderColor = card.reversed ? 'border-red-500/20' : 'border-accent-primary/20';
  const bgGradient = card.reversed
    ? 'from-red-500/10 to-red-500/[0.02]'
    : 'from-accent-primary/10 to-accent-primary/[0.02]';

  return (
    <div className={`rounded-xl border ${borderColor} bg-gradient-to-b ${bgGradient} p-4 min-h-[180px] flex flex-col items-center justify-center gap-1.5 animate-in fade-in zoom-in-95 duration-300`}>
      <h3 className="font-display font-semibold text-text-primary text-center text-sm">{card.name}</h3>
      {card.reversed && (
        <span className="text-[10px] uppercase font-semibold tracking-wider text-red-400 bg-red-500/15 px-2 py-0.5 rounded">Reversed</span>
      )}
      <span className="text-[11px] text-text-muted">{card.arcana === 'major' ? 'Major Arcana' : `${card.suit} • Minor Arcana`}</span>
      {card.imagery && (
        <p className="text-xs text-text-secondary italic text-center mt-1 leading-relaxed px-1">{card.imagery}</p>
      )}
      {card.keywords && card.keywords.length > 0 && (
        <div className="flex flex-wrap justify-center gap-1 mt-1.5">
          {card.keywords.map((kw) => (
            <span key={kw} className="text-[10px] bg-accent-primary/10 text-accent-primary/80 px-1.5 py-0.5 rounded-full">{kw}</span>
          ))}
        </div>
      )}
      <CopyButton text={`${card.name}${card.reversed ? ' (Reversed)' : ''} — ${card.arcana}${card.imagery ? '\n\n' + card.imagery : ''}${card.keywords?.length ? '\n\nKeywords: ' + card.keywords.join(', ') : ''}`} />
    </div>
  );
}

function generatePersonalReading(cards: DrawnCard[], userQuestion?: string, userName?: string): string {
  const name = userName || 'you';

  const pastOpeners = [
    (n: string, c: string) => `${n}, before we look at where you are going, we need to understand where you have been. ${c} appeared here to illuminate a chapter you may have thought was closed.`,
    (n: string, c: string) => `The foundation of this reading begins with ${c}, and its placement in your past is telling. Something from a previous chapter is still echoing forward into your present — not as a punishment, but as an unfinished conversation.`,
    (n: string, c: string) => `${c} sat itself down in your past position with intention. There is a story here, ${n} — one that shaped you in ways you might still be discovering.`,
  ];

  const presentOpeners = [
    (n: string, c: string) => `Right here, right now, ${c} is the lens through which your current reality is being filtered. This is the energy that is alive in your life today, ${n}.`,
    (n: string, c: string) => `The center of your reading holds ${c}, and its message could not be more timely. What you are experiencing right now is not random — this card confirms that.`,
    (n: string, c: string) => `${n}, ${c} in your present position is a snapshot of your inner world at this exact moment. Pay close attention, because this is the card that reveals what is really happening beneath the surface.`,
  ];

  const futureOpeners = [
    (n: string, c: string) => `Looking ahead, ${c} gives us a glimpse of the energy that is building on the horizon. This is not set in stone — it is a trajectory based on the choices you are making right now.`,
    (n: string, c: string) => `${n}, the path forward reveals ${c}. This is the energy waiting for you on the other side of the work this reading is asking you to do.`,
    (n: string, c: string) => `Your future position holds ${c}, and I want you to really absorb what this means. Every card before this one has been building toward what this card represents.`,
  ];

  const genericOpeners = [
    (n: string, c: string, pos: string) => `In the ${pos} position, ${c} reveals something that needs your honest attention. This part of the spread speaks to a specific dimension of your situation that the other cards cannot address.`,
    (n: string, c: string, pos: string) => `${c} in the ${pos} position adds a crucial layer to this reading, ${n}. Without this card, the full picture would be incomplete.`,
    (n: string, c: string, pos: string) => `The ${pos} position carries ${c}, and its message here is distinct from everything else in this spread. This is the angle you might not have considered.`,
  ];

  let reading = '';

  const questionIntros = [
    `## Reading for: "${userQuestion}"\n\n${name}, your question carries real weight, and the cards have responded with equal seriousness. This is not a vague fortune — this is a direct conversation between you and the deck about what matters most to you right now.\n\n`,
    `## Reading for: "${userQuestion}"\n\n${name}, the fact that you asked this specific question tells me something about where you are emotionally. The cards picked up on that energy, and what they laid out is honest, specific, and meant for exactly where you stand today.\n\n`,
    `## Reading for: "${userQuestion}"\n\n${name}, I want you to know that the cards do not answer questions the way we expect them to. They answer the question beneath the question — the one you might not have had the words for yet. Keep that in mind as we go through each card.\n\n`,
  ];

  const generalIntros = [
    `## Your Tarot Reading\n\n${name}, every card in this spread chose you as much as you chose it. What follows is not generic fortune-telling — it is a mirror held up to the exact emotional landscape you are navigating right now.\n\n`,
    `## Your Tarot Reading\n\n${name}, there is a reason you felt drawn to pull these cards today. Something inside you needed to see what the deck had to say, and what it laid out is worth sitting with.\n\n`,
    `## Your Tarot Reading\n\n${name}, the spread in front of you is a map — not of what will happen, but of what is happening inside you right now and what that inner reality is creating in the world around you.\n\n`,
  ];

  reading += userQuestion ? pick(questionIntros) : pick(generalIntros);

  cards.forEach((card) => {
    const reversed = card.reversed;
    const kw = card.keywords || [];
    const posLower = card.position.toLowerCase();
    const cardLabel = `${card.name}${reversed ? ' (Reversed)' : ''}`;

    reading += `### ${card.position} — ${cardLabel}\n\n`;

    let opener = '';
    if (posLower === 'past') {
      opener = pick(pastOpeners)(name, card.name);
    } else if (posLower === 'present') {
      opener = pick(presentOpeners)(name, card.name);
    } else if (posLower === 'future') {
      opener = pick(futureOpeners)(name, card.name);
    } else {
      opener = pick(genericOpeners)(name, card.name, card.position);
    }
    reading += `${opener}\n\n`;

    const soulEntry = CARD_SOUL[card.name];
    if (soulEntry) {
      reading += `${reversed ? soulEntry.reversed : soulEntry.upright}\n\n`;
    }

    const suitInfo = card.suit ? SUIT_ENERGY[card.suit] : null;
    if (suitInfo && !soulEntry) {
      if (reversed) {
        const minorReversedVariants = [
          `${card.name} reversed in the realm of ${suitInfo.domain} tells me that something connected to ${suitInfo.voice} has become tangled. The themes of ${kw.join(' and ')} are not absent from your life — they are present but distorted.`,
          `When ${card.name} appears reversed, the ${suitInfo.element} energy it carries is either suppressed or overflowing. In your case, the themes of ${kw.join(' and ')} suggest that ${suitInfo.voice} has been sending you signals you have been ignoring.`,
          `The reversal of ${card.name} points to a disruption in ${suitInfo.domain}. Specifically, ${kw[0]} is operating in shadow form — meaning you might be experiencing the opposite of what you actually need.`,
        ];
        reading += `${pick(minorReversedVariants)}\n\n`;
      } else {
        const minorUprightVariants = [
          `${card.name} upright channels the ${suitInfo.element} energy of ${suitInfo.domain} in its clearest form. The themes of ${kw.slice(0, 2).join(' and ')} are not abstract concepts right now — they are active forces in your daily experience.`,
          `In the suit of ${card.suit}, ${card.name} represents a specific moment in the journey of ${suitInfo.domain}. Right now, the energy of ${kw.slice(0, 2).join(' and ')} is available to you — not as a distant possibility, but as something you can access today.`,
          `${card.name} brings the grounded ${suitInfo.element} energy of ${kw.slice(0, 2).join(' and ')} into this position. What this means for you, ${name}, is that ${suitInfo.voice} is in a constructive phase.`,
        ];
        reading += `${pick(minorUprightVariants)}\n\n`;
      }
    }

    if (userQuestion) {
      if (posLower === 'past') {
        const v = [
          `When you think about "${userQuestion}", this card reveals the origin story. The pattern of ${kw[0] || 'this energy'} did not begin with your current situation — it started here, in a moment that may have seemed unrelated at the time.`,
          `Your question has deeper roots than you realized. ${card.name} ${reversed ? 'reversed ' : ''}shows that ${kw[0] || 'an old pattern'} has been quietly influencing how you relate to "${userQuestion}".`,
        ];
        reading += `${pick(v)}\n\n`;
      } else if (posLower === 'present') {
        const v = [
          `This is the card that speaks most directly to "${userQuestion}" as it exists right now. The energy of ${kw[0] || 'this card'} is not separate from your question — it IS your question, reflected back at you through the deck.`,
          `Right now, your question about "${userQuestion}" is being shaped by ${kw.slice(0, 2).join(' and ')}. This is not something happening to you — it is something happening through you.`,
        ];
        reading += `${pick(v)}\n\n`;
      } else if (posLower === 'future') {
        const v = [
          `For "${userQuestion}" — the trajectory this card reveals is not a guarantee. It is the most probable outcome based on your current energy and choices. If what you see here excites you, lean into it. If it concerns you, remember: the future card is the most changeable card in any spread.`,
          `The answer to "${userQuestion}" is evolving, and ${card.name} ${reversed ? 'reversed ' : ''}shows where it is heading. The energy of ${kw[0] || 'this card'} is what the outcome will feel like if you continue on your current path.`,
        ];
        reading += `${pick(v)}\n\n`;
      } else {
        const v = [
          `This position adds dimension to your question about "${userQuestion}" that the main cards cannot show on their own. The energy of ${kw[0] || 'this card'} represents an undercurrent you may not have factored into your thinking yet.`,
          `Regarding "${userQuestion}" — ${card.name} ${reversed ? 'reversed ' : ''}in this position reveals a factor you may have overlooked. The themes of ${kw.slice(0, 2).join(' and ')} are shaping the story more than you realize.`,
        ];
        reading += `${pick(v)}\n\n`;
      }
    } else {
      if (posLower === 'past') {
        const v = [
          `This is not about reliving old pain, ${name}. It is about understanding that the person you were then gave you something you still carry. Whether it felt like a gift or a wound at the time, it has become part of your foundation.`,
          `The past is not asking you to go back. It is asking you to integrate what happened so you can stop unconsciously repeating it.`,
        ];
        reading += `${pick(v)}\n\n`;
      } else if (posLower === 'present') {
        const v = [
          `Pay attention to what resonates and what makes you uncomfortable in this interpretation. The discomfort is usually where the truth lives. This is not a card to glance at — it is a card to return to and sit with over the coming days.`,
          `This is the card that will keep echoing after you close this reading. Notice when its themes show up in your conversations, your dreams, or the quiet moments when your guard is down.`,
        ];
        reading += `${pick(v)}\n\n`;
      } else if (posLower === 'future') {
        const v = [
          `Remember — the future position shows potential, not destiny. You are the variable in this equation. The energy ${card.name} ${reversed ? 'reversed ' : ''}carries will arrive differently depending on how you respond to the present card in this spread.`,
          `This is not a prediction — it is a direction. And directions can be changed at any intersection. Use this card as information, not as a verdict.`,
        ];
        reading += `${pick(v)}\n\n`;
      } else {
        const v = [
          `This position is the quiet voice in the room that everyone else is talking over. Do not ignore it. The nuance it adds to your reading will become more important over time.`,
          `${card.name} ${reversed ? 'reversed ' : ''}in this spot adds the complexity that makes this reading truly yours. Without it, the picture would be too simple — and your life is not simple. This card honors that.`,
        ];
        reading += `${pick(v)}\n\n`;
      }
    }
  });

  // ── FINAL VERDICT ──
  reading += `---\n\n### The Verdict\n\n`;

  const majorCards = cards.filter(c => c.arcana === 'major');
  const reversedCount = cards.filter(c => c.reversed).length;
  const uprightCount = cards.length - reversedCount;
  const allKw = cards.flatMap(c => c.keywords || []);
  const uniqueThemes = [...new Set(allKw)].slice(0, 5);

  if (majorCards.length >= 3) {
    reading += `${name}, ${majorCards.length} Major Arcana cards in a single spread is significant. This is not a reading about small decisions or daily frustrations — this is a soul-level conversation. The universe is paying close attention to what you do next, because the choices in front of you carry weight that extends far beyond the obvious.\n\n`;
  } else if (majorCards.length > 0) {
    reading += `The presence of ${majorCards.map(c => c.name).join(' and ')} as Major Arcana ${majorCards.length > 1 ? 'cards adds' : 'adds'} a layer of significance to this reading. These are not everyday energies — they represent turning points, karmic themes, and the kind of moments you will look back on and say "that was when things shifted."\n\n`;
  } else {
    reading += `This spread is entirely Minor Arcana, which means the message is practical and immediate. This is not about grand cosmic destiny — it is about the real, tangible decisions and emotions you are working through right now. That does not make it less important. It makes it more actionable.\n\n`;
  }

  if (reversedCount === 0) {
    reading += `Every card in this spread is upright, which tells me the energy in your life right now is flowing in the right direction. There are no major internal blocks or unconscious patterns sabotaging you at this moment. That is rare, and it is worth appreciating.\n\n`;
  } else if (reversedCount > uprightCount) {
    reading += `With ${reversedCount} out of ${cards.length} cards reversed, this reading is highlighting inner work that needs attention before external circumstances can shift. This is not a criticism — it is information. The reversals are showing you where your energy is tangled, blocked, or misdirected.\n\n`;
  } else if (reversedCount > 0) {
    reading += `The mix of ${uprightCount} upright and ${reversedCount} reversed cards creates a balanced but honest picture. You have genuine momentum and resources working in your favor, but there are specific areas where old patterns or unresolved emotions are slowing you down.\n\n`;
  }

  reading += `The core themes woven through this entire reading are **${uniqueThemes.join(', ')}**. These are not coincidences — when the same energies appear across multiple cards, the deck is emphasizing something it really wants you to understand.\n\n`;

  if (userQuestion) {
    const qv = [
      `${name}, here is the honest answer to "${userQuestion}":\n\nThe cards are not giving you a simple yes or no, because your question does not have a simple answer. What they ARE giving you is a map of the internal and external forces at play. The outcome depends less on what happens to you and more on how you respond to what is already happening inside you. The upright cards show your strengths in this situation — lean on them. The reversed cards show where you need to grow — do not avoid them.\n\n`,
      `${name}, your question about "${userQuestion}" has been answered — just not in the way you might have expected.\n\nThe cards are saying: the situation is more nuanced than the question implies. You are not just asking about an outcome — you are asking about who you need to become to navigate this well. Every card in this spread points to a specific quality you either need to develop, reclaim, or release.\n\n`,
      `${name}, I want to give you a direct answer to "${userQuestion}":\n\nThe cards see this clearly. The energy around your question is ${reversedCount > uprightCount ? 'currently blocked by internal resistance — not by external circumstances. The obstacle is inside, not outside' : 'genuinely moving forward. The momentum is real, not imagined'}. What matters most right now is not what you decide, but the emotional honesty you bring to the decision.\n\n`,
    ];
    reading += pick(qv);
    reading += `This reading is not a one-time event — it is a conversation. Return to it when the noise gets loud and you need to remember what the cards showed you today.\n`;
  } else {
    const gv = [
      `${name}, here is what this reading is really saying when you strip away the individual cards and look at the whole picture:\n\nYou are in a moment of genuine transition. The past cards show what built you. The present cards show what is testing you. And the future cards show what is possible if you meet this moment with honesty and courage. None of this is happening randomly.\n\n`,
      `${name}, when I look at this spread as a complete story rather than individual cards, one thing becomes clear:\n\nYou are not stuck. It might feel that way sometimes, but the cards tell a different story. They show movement, evolution, and the kind of inner work that does not always feel productive but is quietly reshaping everything.\n\n`,
      `${name}, the most important thing about this reading is not any single card — it is the conversation between all of them.\n\nTaken together, they paint a picture of someone who is more capable than they give themselves credit for, more resilient than they feel on hard days, and closer to a breakthrough than the current circumstances suggest.\n\n`,
    ];
    reading += pick(gv);
    reading += `Revisit this reading in a few days. The card that sticks with you — the one that keeps surfacing in quiet moments — is the one carrying your deepest message. Trust it.\n`;
  }

  return reading;
}

export default function TarotPage() {
  const { profile } = useAuthStore();
  const { hasAccess } = useSubscriptionStore();
  const [spreadType, setSpreadType] = useState<SpreadType>('three_card');
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TarotResult | null>(null);
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const [allRevealed, setAllRevealed] = useState(false);
  const [error, setError] = useState('');
  const [aiText, setAiText] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [showAi, setShowAi] = useState(false);
  const [copied, setCopied] = useState(false);

  const selectedSpread = SPREAD_OPTIONS.find((s) => s.key === spreadType)!;
  const positionLabels = getPositionLabels(spreadType);

  async function drawCards() {
    setLoading(true);
    setError('');
    setResult(null);
    setRevealed(new Set());
    setAllRevealed(false);
    setShowAi(false);
    setAiText('');

    await new Promise((r) => setTimeout(r, 1200));

    const labels = getPositionLabels(spreadType);
    const drawn = drawLocalCards(spreadType, labels);
    setResult({
      spread_type: spreadType,
      cards: drawn,
      question: question.trim() || undefined,
    });
    setLoading(false);
  }

  function revealCard(index: number) {
    setRevealed((prev) => {
      const next = new Set(prev);
      next.add(index);
      if (result && next.size === result.cards.length) {
        setAllRevealed(true);
      }
      return next;
    });
  }

  function revealAll() {
    if (!result) return;
    const all = new Set(result.cards.map((_, i) => i));
    setRevealed(all);
    setAllRevealed(true);
  }

  const requestAI = useCallback(() => {
    if (!result) return;
    setAiLoading(true);
    setShowAi(true);
    setAiText('');

    const fullName = profile?.display_name || '';
    const userName = fullName.split(' ')[0] || 'you';

    setTimeout(() => {
      const reading = generatePersonalReading(result.cards, result.question, userName);
      setAiText(reading);
      setAiLoading(false);
    }, 800);
  }, [result, profile]);

  function resetReading() {
    setResult(null);
    setRevealed(new Set());
    setAllRevealed(false);
    setShowAi(false);
    setAiText('');
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-2 border-accent-primary/30 border-t-accent-primary animate-spin" />
          <span className="absolute inset-0 flex items-center justify-center text-2xl">{'✦'}</span>
        </div>
        <p className="text-text-tertiary text-sm animate-pulse">Shuffling the Cosmic Deck...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Star className="w-8 h-8 text-accent-primary" />
        <div>
          <h1 className="text-2xl font-display font-bold text-text-primary">{'♠'} Tarot Reading</h1>
          <p className="text-text-tertiary text-sm">Receive guidance from the arcana</p>
        </div>
      </div>

      {/* Spread Selection */}
      {!result && (
        <div className="card space-y-6">
          {/* Spread Type */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-3">Choose Your Spread</label>
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
              {SPREAD_OPTIONS.map((s) => (
                <button
                  key={s.key}
                  onClick={() => setSpreadType(s.key)}
                  className={`flex-shrink-0 flex flex-col items-center gap-1 p-3 rounded-xl border transition-all min-w-[100px] ${
                    spreadType === s.key
                      ? 'border-accent-primary bg-gradient-to-b from-accent-primary/20 to-accent-primary/5 text-accent-primary shadow-lg shadow-accent-primary/10'
                      : 'border-border-primary text-text-tertiary hover:border-border-secondary bg-bg-card'
                  }`}
                >
                  <span className="text-xl">{s.icon}</span>
                  <span className="text-xs font-medium">{s.label}</span>
                  <span className="text-[10px] text-text-muted">{s.cardCount} {s.cardCount === 1 ? 'card' : 'cards'}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Question */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Your Question (Optional)
            </label>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="input min-h-[80px] resize-none"
              placeholder="What guidance do you seek?"
              rows={3}
            />
          </div>

          {/* Draw Button */}
          <button onClick={drawCards} disabled={loading} className="btn-primary w-full text-base py-3">
            {'✦'} Draw {selectedSpread.label}
          </button>
          {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-6">
          {/* Question Display */}
          {result.question && (
            <div className="card">
              <p className="text-[11px] uppercase tracking-wider text-text-muted font-medium mb-1">Your Question</p>
              <p className="text-text-secondary italic">{result.question}</p>
            </div>
          )}

          {/* Cards Grid */}
          <div className={`grid gap-3 ${
            spreadType === 'single' ? 'grid-cols-1 max-w-[250px] mx-auto' :
            spreadType === 'three_card' ? 'grid-cols-3' :
            'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5'
          }`}>
            {result.cards.map((card, i) => (
              <div key={i}>
                <p className="text-[10px] uppercase tracking-[1.5px] text-accent-primary/70 text-center mb-1.5 font-medium">
                  {positionLabels[i] || card.position}
                </p>
                {revealed.has(i) ? (
                  <RevealedCard card={card} />
                ) : (
                  <CardBack index={i} onClick={() => revealCard(i)} />
                )}
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            {!allRevealed && (
              <button onClick={revealAll} className="btn-secondary flex-1 flex items-center justify-center gap-2">
                <Eye className="w-4 h-4" />
                Reveal All Cards
              </button>
            )}
            <button onClick={resetReading} className="btn-secondary flex-1 flex items-center justify-center gap-2">
              <RotateCcw className="w-4 h-4" />
              New Reading
            </button>
          </div>

          {/* Personal Reading Button */}
          {allRevealed && (
            <button
              onClick={requestAI}
              disabled={aiLoading}
              className="btn-primary w-full py-3.5 text-base flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              {showAi ? 'Regenerate Personal Reading' : 'Get Your Personal Reading'}
            </button>
          )}

          {/* AI Reading Output */}
          {showAi && (
            <div className="card overflow-hidden p-0">
              <div className="bg-gradient-to-b from-accent-primary/10 to-accent-primary/[0.02] p-6 rounded-xl">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-medium text-accent-primary flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Personal Tarot Reading
                  </p>
                  {aiText && (
                    <div className="flex items-center gap-1">
                      <CopyButton text={aiText} />
                      <ShareButton text={aiText} title="My Tarot Reading - Align" variant="icon" />
                    </div>
                  )}
                </div>
                {aiText ? (
                  <div className="prose prose-invert prose-sm max-w-none prose-headings:font-display prose-h2:text-lg prose-h3:text-base prose-p:text-text-secondary prose-p:leading-relaxed prose-strong:text-text-primary">
                    <ReactMarkdown>{aiText}</ReactMarkdown>
                  </div>
                ) : (
                  <p className="text-text-tertiary animate-pulse">The cards are speaking...</p>
                )}
                {aiLoading && (
                  <span className="text-accent-primary text-base">{'█'}</span>
                )}
                {aiText && (
                  <button
                    onClick={() => {
                      const shareText = `My Tarot Reading from Align\n\n${aiText}`;
                      if (navigator.share) {
                        navigator.share({ title: 'My Tarot Reading', text: shareText }).catch(() => {});
                      } else {
                        navigator.clipboard.writeText(shareText);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }
                    }}
                    className="mt-4 w-full py-3 rounded-xl bg-[#2D1B69] border border-accent-primary/30 text-white font-medium text-sm hover:bg-[#3A2580] transition-colors flex items-center justify-center gap-2"
                  >
                    {copied ? (
                      <><Check className="w-4 h-4 text-green-400" /> Copied!</>
                    ) : (
                      <>{'🌌'} Share Reading</>
                    )}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
