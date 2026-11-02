'use client';

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/stores/authStore';
import { api, buildBirthData } from '@/lib/api';
import Link from 'next/link';
import { ArrowLeft, Sparkles, Copy, Check, Info } from 'lucide-react';
import { PaywallGate } from '@/components/ui/PaywallGate';
import { BirthDataPrompt } from '@/components/ui/BirthDataPrompt';
import { PLANET_GLYPHS } from '@/lib/transitData';

// ─── Types ──────────────────────────────────────────────────────────────────

interface StarConjunction {
  star_name: string;
  planet: string;
  orb: number;
  magnitude?: number;
  nature?: 'benefic' | 'malefic' | 'mixed' | string;
  meaning?: string;
  constellation?: string;
  traditional_nature?: string;
}

// ─── CopyButton ─────────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        });
      }}
      className="inline-flex items-center gap-1 text-xs text-text-muted hover:text-text-secondary mt-1 shrink-0"
    >
      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

// ─── Markdown Renderer ──────────────────────────────────────────────────────

function RenderMarkdown({ text }: { text: string }) {
  const lines = text.split('\n');
  return (
    <>
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (trimmed.startsWith('## ')) {
          return <h2 key={i} className="text-lg font-display font-bold text-amber-400 mt-6 mb-2">{trimmed.replace('## ', '')}</h2>;
        }
        if (trimmed.startsWith('### ')) {
          return <h3 key={i} className="text-base font-semibold text-text-primary mt-4 mb-1">{trimmed.replace('### ', '')}</h3>;
        }
        if (trimmed.startsWith('---')) {
          return <hr key={i} className="border-border-primary my-4" />;
        }
        if (trimmed.startsWith('- ')) {
          return (
            <div key={i} className="flex gap-2 pl-2 mb-1">
              <span className="text-amber-400">&bull;</span>
              <span className="text-text-secondary text-sm flex-1"><InlineFormat text={trimmed.slice(2)} /></span>
            </div>
          );
        }
        if (/^\d+\.\s/.test(trimmed)) {
          const match = trimmed.match(/^(\d+)\.\s(.*)/);
          return (
            <div key={i} className="flex gap-2 pl-2 mb-1">
              <span className="text-amber-400 w-5">{match ? match[1] + '.' : ''}</span>
              <span className="text-text-secondary text-sm flex-1"><InlineFormat text={match ? match[2] : trimmed} /></span>
            </div>
          );
        }
        if (trimmed.length > 0) {
          return <p key={i} className="text-text-secondary text-sm leading-relaxed mb-1"><InlineFormat text={trimmed} /></p>;
        }
        return <div key={i} className="h-2" />;
      })}
    </>
  );
}

function InlineFormat({ text }: { text: string }) {
  const parts: (string | JSX.Element)[] = [];
  const regex = /\*\*(.*?)\*\*/g;
  let lastIndex = 0;
  let match;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) parts.push(text.slice(lastIndex, match.index));
    parts.push(<strong key={match.index} className="font-semibold text-text-primary">{match[1]}</strong>);
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return <>{parts}</>;
}

// ─── Constants ──────────────────────────────────────────────────────────────

const ROYAL_STARS = ['Aldebaran', 'Regulus', 'Antares', 'Fomalhaut'];

const CONJUNCTION_ORB = 2.0;

// ─── Fixed Stars Database — 100 stars with J2000 ecliptic longitudes ────────

const FIXED_STARS: Record<string, { longitude: number; nature: string; magnitude: number; meaning: string }> = {
  // Royal Stars (4)
  'Aldebaran': { longitude: 69.9, nature: 'benefic', magnitude: 0.85, meaning: 'People trust your word, and you get promoted, elected or put in charge because of it. Your edge is that you say what you will do and then do it. The cost is that you get tested on exactly that: one shortcut or one convenient lie costs you more than it would cost anyone else.' },
  'Regulus': { longitude: 150.1, nature: 'benefic', magnitude: 1.35, meaning: 'You get put at the front of the room early, and you are good there. Authority comes to you without much asking, and so does the pull to want more of it. Your fall comes from pride or from a grudge you refuse to drop, and it tends to arrive right when you are winning.' },
  'Antares': { longitude: 249.9, nature: 'malefic', magnitude: 1.09, meaning: 'When you want something you stop at nothing, and the focus is frightening to the people around you. You plan three moves ahead and you do not let go. The catch is that you push past the point where it still pays, and you burn your health, your savings or a relationship to prove you can win.' },
  'Fomalhaut': { longitude: 333.9, nature: 'benefic', magnitude: 1.16, meaning: 'You have an imagination other people notice, and a chance at real recognition for it. The catch is that it only holds while your motives are clean. The year you start doing it for the applause, or cut a corner to get ahead, the recognition drains away.' },

  // Brightest Stars (20)
  'Sirius': { longitude: 104.1, nature: 'benefic', magnitude: -1.46, meaning: 'You are driven to be seen and remembered, and you will work for years toward that. People hand you responsibility because you take it seriously and stay loyal to what you commit to. The risk is that the hunger for a name makes you burn through people on the way up.' },
  'Canopus': { longitude: 104.9, nature: 'benefic', magnitude: -0.74, meaning: 'You find the route others missed, whether that is a move abroad, a career nobody mapped or a research problem everyone gave up on. People come to you to ask which way to go. You often hit your stride late, and it takes patience with a path that looks slow at the start.' },
  'Arcturus': { longitude: 204.2, nature: 'benefic', magnitude: -0.05, meaning: 'You make progress by trying the thing nobody else will try. You leave the safe job, take the trip or start the business, and it works more often than it should. Travel and moving around are part of how you earn your luck, so staying put too long costs you.' },
  'Vega': { longitude: 285.4, nature: 'benefic', magnitude: 0.03, meaning: 'You can make people feel something with a song, a voice, a photo or a well-placed sentence, and they remember you for it. Charm opens doors for you before you have done anything. The luck is real but it does not wait, so you have to use the opening while it is there.' },
  'Rigel': { longitude: 76.9, nature: 'benefic', magnitude: 0.12, meaning: 'You are the one who quietly fixes the broken process while everyone else complains about it. A system, a tool or a method you improve keeps paying you for years. The price is that you lose patience with people who will not learn it properly, and you end up redoing their work at midnight.' },
  'Procyon': { longitude: 115.7, nature: 'mixed', magnitude: 0.34, meaning: 'Success comes to you quickly, and you can lose it just as quickly. You are sharp, you act fast and you win early. Then you get restless or jealous or snap at the wrong person, and you spend the next year paying for one rushed decision.' },
  'Betelgeuse': { longitude: 88.8, nature: 'benefic', magnitude: 0.42, meaning: 'You are at your best in a fight, a competition or a high-stakes push where nothing is guaranteed. Others see the nerve and remember you for it. You also pick fights you did not need to pick, because being in motion feels better than being at peace.' },
  'Capella': { longitude: 81.8, nature: 'benefic', magnitude: 0.08, meaning: 'You are curious about everything and you collect knowledge the way other people collect hobbies. That curiosity turns into a platform, a title or a paycheck when you share it in public. You do better when you are looking after people or teaching them than when you work alone.' },
  'Altair': { longitude: 301.9, nature: 'mixed', magnitude: 0.77, meaning: 'You jump first. You take the leap into the new job, the dangerous sport or the big stage, and you land higher than people expected. The same nerve gets you hurt when you ignore a warning because you are sure you will be fine.' },
  'Spica': { longitude: 203.9, nature: 'benefic', magnitude: 0.97, meaning: 'You are rewarded for being exact. The pitch where you sweated the details, the piece of craft nobody else bothered to finish, the report with no errors: that is what people remember, and the reward comes back bigger than the effort felt. The downside is that you assume quality speaks for itself, so you under-ask and wait to be noticed.' },
  'Pollux': { longitude: 113.2, nature: 'malefic', magnitude: 1.14, meaning: 'You are brave and you hit hard. In sport, in an argument or in a crisis, you do not back down. The shadow is that your temper goes from zero to cruel in a sentence, and you say the thing you cannot take back.' },
  'Achernar': { longitude: 345.3, nature: 'benefic', magnitude: 0.46, meaning: 'People give you responsibility for a group, a congregation or a cause, because you seem to know what matters. You like learning and you hold yourself to a high standard. The cost is that you judge yourself harshly when you fall short of it.' },
  'Deneb': { longitude: 320.2, nature: 'benefic', magnitude: 1.25, meaning: 'You learn in a weekend what takes other people a season, and you sense a person\'s mood or a room\'s tension before anyone says a word. You set your ideals high and then take it personally when the world misses them. The catch is that you walk away from things the moment they turn ordinary.' },
  'Acrux': { longitude: 192.1, nature: 'benefic', magnitude: 0.76, meaning: 'You are the one at the table who goes quiet when a joke turns unfair, and everyone notices. You read people accurately and you hate being managed, flattered or talked down to. The price is that you carry the weight of what you see, and friends mistake it for coldness.' },
  'Mimosa': { longitude: 192.8, nature: 'benefic', magnitude: 1.25, meaning: 'You invent your way out of problems and you love working with unusual systems, astrology and the unseen among them. You are resourceful and start things without waiting for permission. The downside is a tendency to believe too fast in signs, omens and theories that nobody has checked.' },
  'Hadar': { longitude: 203.7, nature: 'benefic', magnitude: 0.61, meaning: 'You rise through groups. A team, a firm, a congregation or a circle of well-connected friends lifts you, and you are good at being the person they trust. Your honors come through who you know and who vouches for you, so you need to keep your name clean with the people in your circle.' },
  'Bellatrix': { longitude: 80.9, nature: 'malefic', magnitude: 1.64, meaning: 'In a crisis you are the one who picks up the phone and gives the order while others are still arguing. You decide fast, act hard and get noticed for it. The cost is the sharp drop after a call made too quickly, usually in the same month you were being praised.' },
  'Alnilam': { longitude: 83.6, nature: 'benefic', magnitude: 1.69, meaning: 'You walk into a room once and get remembered for years. A bold move that looked reckless puts you in front of an audience you did not plan for. The catch is that the spotlight leaves on its own schedule, and if you have not built something while it was on you, you are left wondering where everyone went.' },
  'Castor': { longitude: 110.2, nature: 'mixed', magnitude: 1.58, meaning: 'You are sharp with words, good at law, writing or negotiating, and success can show up overnight. Your mind runs two tracks at once, and you can swing from generous to mischievous or harsh without warning. People around you never fully know which one they will get.' },
  'Polaris': { longitude: 28.3, nature: 'mixed', magnitude: 1.98, meaning: 'People steer by you. Friends, a team or a family treats you as the one who knows where north is, even when you do not feel sure. It gives you a strong sense of purpose and costs you rest, because you cannot be the one who falls apart.' },

  // Important Classical Stars (30)
  'Algol': { longitude: 56.2, nature: 'malefic', magnitude: 2.12, meaning: 'You carry a lot of intensity, and it comes out in rage, in a hard stare or in a moment you lose control. You learned early what happens when you lose your temper. When you master it, the same force becomes the power to face down people others are scared of.' },
  'Alcyone': { longitude: 60.0, nature: 'mixed', magnitude: 2.87, meaning: 'You have a big appetite for achievement and an inner sense that you see more than you say. You work hard and sometimes ruthlessly to get where you are going. There is also grief in the picture, so the winning is mixed with a loss you do not talk about.' },
  'Hyades': { longitude: 65.7, nature: 'malefic', magnitude: 3.65, meaning: 'Your life has sudden turns, and some of them include tears, scandal or a crisis that nobody saw coming. You can be greedy or rash in desire. You also learn to hold power in the middle of the storm when others fall apart.' },
  'Praesepe': { longitude: 127.3, nature: 'malefic', magnitude: 3.70, meaning: 'You go further than the sensible plan, then further again: the trip nobody wanted to join, the project everyone told you to scale down. You get blunt and rough with people who slow you down. The price is a blind spot about something obvious right in front of you, so the one friend who says it plainly is worth keeping.' },
  'Vindemiatrix': { longitude: 190.0, nature: 'malefic', magnitude: 2.83, meaning: 'You decide alone and you are used to being the only one in the room who does. You spot the flaw in a plan, a contract or a person within five minutes. The downside is the partner who finally says they never get a vote, and the deal you were too proud to double-check.' },
  'Zuben Elgenubi': { longitude: 225.1, nature: 'malefic', magnitude: 2.75, meaning: 'You remember who promised what, and you keep the receipt. When someone breaks a deal you go cold, and the argument stays about fairness long after it stopped being about the thing. Aimed at a real injustice, a landlord, a rule or an employer, the same stubbornness wins cases other people drop.' },
  'Zuben Eschamali': { longitude: 229.2, nature: 'benefic', magnitude: 2.61, meaning: 'You are the one who gets pulled into fixing things: the broken committee, the unfair rule, the family mess nobody wants to touch. Recognition comes easier to you than to most, and sometimes money with it, but only while the work serves more than just you. The year you aim only at your own gain, the ease stops.' },
  'Unukalhai': { longitude: 241.8, nature: 'malefic', magnitude: 2.65, meaning: 'You are clever enough to take the shortcut and sly enough to think it will not cost you. Playing both sides, passing along a rumour, trying something risky just to see: it comes back at you, usually through a person you burned along the way. Being straight with people is cheaper for you than for anyone.' },
  'Ras Alhague': { longitude: 262.4, nature: 'mixed', magnitude: 2.08, meaning: 'People tell you things they have told nobody, and you are good at sitting with it, whether as a nurse, a counsellor or the friend who picks up at 2am. The cost is how you cope yourself: the pills, the bent rule, the secret you keep to protect someone else. You carry everyone\'s troubles and hide your own.' },
  'Sabik': { longitude: 257.6, nature: 'mixed', magnitude: 2.43, meaning: 'You spend yourself on the wrong person, keep a secret love going for months, or hold onto something that stopped working long ago while telling yourself it is nearly there. The leak is slow enough that you only notice when you are exhausted. The fix is the thing you are best at: saying out loud what is true, even when it is embarrassing.' },
  'Nunki': { longitude: 282.3, nature: 'benefic', magnitude: 2.02, meaning: 'You say what you think in the meeting and people take it as settled. You travel, plan big and read situations well because you go on conviction instead of arithmetic. The catch is that you promise more than fits in a week, because a good idea feels like a finished one.' },
  'Deneb Algedi': { longitude: 293.4, nature: 'benefic', magnitude: 2.87, meaning: 'You were handed too much responsibility too young, and it taught you rules, contracts and how to read what people are not saying. Years later you are the one called in when things are hard, because you do not walk out. The price is a feeling that rest has to be earned, so you rarely take any.' },
  'Sadalmelik': { longitude: 303.4, nature: 'benefic', magnitude: 2.96, meaning: 'You join the cause before it is popular and get laughed at or doubted for what you believe. Years later the same people quote you. The downside is the stretch in between, when you are right and alone, and you have to decide whether to keep going without applause.' },
  'Sadalsuud': { longitude: 303.2, nature: 'benefic', magnitude: 2.91, meaning: 'Small luck finds you: the parking space, the cheap flight, the neighbour who becomes a friend. Home and creative projects go better than you have any right to expect, and you turn an ordinary evening into an occasion. The cost is that you coast, since nothing forces you to push.' },
  'Markab': { longitude: 353.5, nature: 'mixed', magnitude: 2.49, meaning: 'You win with your head, through writing, speaking or study, and the honours show up behind it. The catch is a body that runs hot while your mind runs hotter: you rush a job or skip a meal and pay for it by evening. Slow down around hot things and sharp tools.' },
  'Scheat': { longitude: 349.3, nature: 'malefic', magnitude: 2.42, meaning: 'You work out what you think by yourself, and you are early. By the time others catch up you are already bored with it. Freedom of thought matters more to you than comfort, which is why dark moods hit hardest when you are cut off from people, so keep two friends who pick up the phone.' },
  'Alpheratz': { longitude: 14.3, nature: 'benefic', magnitude: 2.06, meaning: 'You do better the moment the door is open: the one-way ticket, the job with no boss, the first freelance month. Honours come through movement and independence. The price is that a lease, a long contract or a relationship with conditions feels like suffocation, and you leave a day before it would have paid off.' },
  'Mirach': { longitude: 30.4, nature: 'benefic', magnitude: 2.05, meaning: 'Love is the main road of your life, not a side street. A partner who is creative or gifted shows up, and the marriage or partnership lifts your own work. The downside is that you trust intuition so much you skip the practical conversation about money or timing until it becomes the whole argument.' },
  'Almach': { longitude: 44.2, nature: 'benefic', magnitude: 2.16, meaning: 'You walk into a party and within ten minutes three people want to work with you. Charm, taste and creative gifts earn you recognition without a campaign. The cost is that you stay liked at the expense of being honest, and you say yes to things you quietly resent.' },
  'Hamal': { longitude: 7.4, nature: 'malefic', magnitude: 2.00, meaning: 'You start without permission and do not apologise. You lead from the front, and the people who slow you down get a short answer. The catch is the cold decision made in a bad mood and the plan carried out too hard, which you regret the week after the person is gone.' },
  'Sheratan': { longitude: 3.9, nature: 'malefic', magnitude: 2.64, meaning: 'You think fast and take risks with your brain: the bet, the pitch, the argument you could lose. Your body pays for the rush with clumsy bumps and a schedule that never lets up. You also sign deals that sound better on the first call than in the fine print, so read the second page.' },
  'Menkar': { longitude: 44.3, nature: 'malefic', magnitude: 2.53, meaning: 'Something larger than you hits: a bad scare, a public humiliation, a collapse at a company or in a family that you did not cause. Things buried in you surface at the worst times, in the middle of a meeting or a holiday. When it passes you know who you are more clearly than before.' },
  'Mira': { longitude: 11.3, nature: 'mixed', magnitude: 3.04, meaning: 'You disappear for a season. Then you show up with a body of work, and people ask where you came from. The quiet years feel like failure from the inside, but they are where the shine gets built. The price is the lonely stretch while the work is still invisible.' },
  'Alnath': { longitude: 82.5, nature: 'mixed', magnitude: 1.65, meaning: 'You fight for your place and earn recognition from it: the promotion you argued for, the contest you refused to concede. You also pick quarrels past the point where they pay, and you can get pushed out of a group for being the one who would not drop it. In a dispute, wait a day before you send the message.' },
  'Ain': { longitude: 68.9, nature: 'malefic', magnitude: 3.53, meaning: 'You see what is wrong before anyone admits it, and you do not let it go. Suspicion is your first instinct, and sometimes it is dead right. When it is wrong you are the one standing in public having accused the wrong person, so check twice before you say it loud.' },
  'Tejat': { longitude: 63.5, nature: 'mixed', magnitude: 2.88, meaning: 'You carry yourself like you know the answer, and sometimes you do not care how that lands. You also keep going through long hard stretches that would stop other people, with a dry joke and no complaint. Your pride is what gets you into trouble you did not need, so apologise first when it is cheap.' },
  'Alhena': { longitude: 99.2, nature: 'benefic', magnitude: 1.93, meaning: 'You walk into a room as if you belong in it, and the room agrees. You have an eye for art and beauty, and you take your spiritual life more seriously than you let on. The downside is a rushed step, so watch the stairs and the heels.' },
  'Wasat': { longitude: 108.5, nature: 'malefic', magnitude: 3.53, meaning: 'You say something blunt in the kitchen and watch someone flinch, and you did not mean it that way. You see through a problem fast and have no interest in softening it. Take fumes, gas and chemicals seriously, because you hurry around them.' },
  'Propus': { longitude: 96.5, nature: 'mixed', magnitude: 3.28, meaning: 'You push yourself harder than anyone asks, and it works: you get the title, the reputation, the standing. Then your pride refuses help, and your health or a relationship pays the bill. Excellence costs you more than it costs others, so budget for it.' },

  // Notable Stars (46)
  'Toliman': { longitude: 209.2, nature: 'benefic', magnitude: -0.01, meaning: 'You make friends who are still around after twenty years, and the women in your life matter more than usual: a mother, sister or partner who shapes your choices. People feel looked after near you and tell you their stories. The cost is that you remember every birthday and hardly anyone remembers yours.' },
  'Acubens': { longitude: 123.4, nature: 'malefic', magnitude: 4.25, meaning: 'You survive things that flatten other people, with a quick mind and a loose relationship with the exact truth. You move house more often than most, and you bend a rule when you are cornered. The catch is a reputation for being slippery that follows you to the next town.' },
  'Asellus Borealis': { longitude: 127.1, nature: 'mixed', magnitude: 4.66, meaning: 'You carry other people\'s burdens patiently: the shift nobody wanted, the committee, the relative who needs a ride. You give to charity and turn up for the unglamorous jobs. The price is that you become the person everyone asks, and you forget how to say no.' },
  'Asellus Australis': { longitude: 128.7, nature: 'mixed', magnitude: 3.94, meaning: 'You get dragged into public causes and give hard, then lose your temper at the person who is not pulling their weight. You are physically brave and will step into a fight others walk away from. The downside is a short fuse that loses you a friend, a job or an argument you were winning.' },
  'Dubhe': { longitude: 135.2, nature: 'malefic', magnitude: 1.79, meaning: 'You know someone is lying before they finish the sentence, and you know what a place feels like before you walk in. You are proud and suspicious, and when you feel cornered you break things, literally or in a friendship. Tarot, astrology and other divination come naturally, and you probably use them to check people.' },
  'Merak': { longitude: 139.5, nature: 'mixed', magnitude: 2.37, meaning: 'You wait, plan and outlast. While others shout for power, you hold the position and let them tire. People experience you as steady and in command, and the cost is that you rarely say what you feel until it is too late to matter.' },
  'Phecda': { longitude: 140.3, nature: 'malefic', magnitude: 2.44, meaning: 'You dig. You want to know who made the decision, where the money went and what is in the sealed folder. You get power because you do the digging others skip. The cost is that ambition turns ruthless when you are close, and you stop asking who gets hurt.' },
  'Megrez': { longitude: 141.3, nature: 'mixed', magnitude: 3.31, meaning: 'You hold a team or a family together without anyone noticing you doing it: the reminders, the corrected spreadsheet, the quiet word before a fight. You catch the detail everyone else missed. The catch is that the day you stop, things fall apart, and nobody knew it was you.' },
  'Alioth': { longitude: 148.9, nature: 'malefic', magnitude: 1.77, meaning: 'You sway groups, for good or for harm: a class, a team, a company, a crowd online. Trouble reaches you through institutions such as school, work or government, and you feel the mood of a crowd in your chest. The price is the temptation to use that pull when you are angry.' },
  'Mizar': { longitude: 150.7, nature: 'mixed', magnitude: 2.27, meaning: 'People stop talking when you speak, because your energy has voltage. Your focus is intense and your temper is quick, so the room swings with you. Be careful around fire, hot kitchens and fast cars, because you are never the slow one.' },
  'Alkaid': { longitude: 156.9, nature: 'malefic', magnitude: 1.86, meaning: 'You are the person at the funeral who knows what to do, because endings keep finding you. Loss changes you, and afterwards other people lean on you during theirs. Make peace with that early so it becomes a skill and not a weight.' },
  'Cor Caroli': { longitude: 184.5, nature: 'benefic', magnitude: 2.89, meaning: 'You give your word to a person or a cause and keep it, even when it costs you. You like good manners, old traditions, dogs and long walks. The downside is that you stay loyal long after it has stopped being returned.' },
  'Denebola': { longitude: 171.5, nature: 'malefic', magnitude: 2.14, meaning: 'You judge fast, hold high ideals and are let down by people who do not meet them. Disgrace can arrive out of nowhere, a rumour or a lost position, and regret follows. You take good luck for granted and then wonder where it went, so say thank you while it lasts.' },
  'Algorab': { longitude: 177.8, nature: 'malefic', magnitude: 2.95, meaning: 'You make use of what others throw away: the cheap furniture, the abandoned project, the failed idea. Your wit is dark and accurate, and people laugh and then go quiet. The cost is bitterness, and a habit of putting off what you know you should do.' },
  'Gienah': { longitude: 180.4, nature: 'mixed', magnitude: 2.59, meaning: 'You talk your way into and out of situations, and chaos suits you while others freeze. You can bend the truth to win, and a cutting comment lands harder than you planned. The catch is the friend who stops trusting your version.' },
  'Khambalia': { longitude: 197.1, nature: 'mixed', magnitude: 4.66, meaning: 'Your path does not look like anyone else\'s, and it changes direction more often than your family expects. You adapt quickly and are curious about the occult. The price is that people find you hard to rely on, because the plan they heard last month is not the plan now.' },
  'Foramen': { longitude: 202.1, nature: 'mixed', magnitude: 1.86, meaning: 'You are calm in a crisis and lead best when things go wrong: the flood, the layoff, the night shift. You also have creative force that can run wild, and water keeps turning up in your story, a boat, a leak, a feeling of drowning. Plan for rough seas and you cross them.' },
  'Alphecca': { longitude: 222.1, nature: 'benefic', magnitude: 2.23, meaning: 'You do things with grace: a meal, a drawing, a way of handling a hard conversation. People find you dignified without you trying, and your gift for healing shows up in how you listen. The downside is that you avoid the loud rooms where force wins, and you lose out to people who push.' },
  'Kornephoros': { longitude: 236.2, nature: 'mixed', magnitude: 2.77, meaning: 'You work harder than the people beside you and add cunning to it, and you stay with a long job after others quit. You fight when pushed and win by endurance. Stubbornness is your gift and your problem, since you keep going after it stopped being worth it.' },
  'Yed Prior': { longitude: 243.5, nature: 'malefic', magnitude: 2.74, meaning: 'You break the rule without feeling bad about it, and you handle risky material: medicines, chemicals, ideas that upset your family. Healing is in your hands and so is harm. The cost is the one time you were sure and it was the wrong dose.' },
  'Han': { longitude: 249.1, nature: 'mixed', magnitude: 2.54, meaning: 'You go to the edge because you want to know what is there: the forbidden subject, the dare, the dark corner of a person. A crisis changes you and you come out braver. The catch is the friend who stops going with you.' },
  'Graffias': { longitude: 243.1, nature: 'malefic', magnitude: 2.62, meaning: 'When you are betrayed you do not forgive, and you hit back where it hurts. You can lose money or property through reckless moves made in anger. Your self-defence works, but it leaves a trail of people who no longer call.' },
  'Dschubba': { longitude: 242.5, nature: 'malefic', magnitude: 2.32, meaning: 'You strike first. You read someone\'s intent from across the table and move before they do. The price is the time you attack a person who was never a threat, and have to live with it.' },
  'Shaula': { longitude: 264.6, nature: 'mixed', magnitude: 1.63, meaning: 'You feel danger in your stomach before you see it, and you act on it before the call or the email arrives. Events in your life change everything in one day. You are tough in a last stand, but you leave things to the last minute.' },
  'Sargas': { longitude: 265.6, nature: 'mixed', magnitude: 1.87, meaning: 'You see through lies and you say so, in writing or out loud. Some people respect you for it and others avoid you. The downside is a reputation for being hard to fool and therefore hard to invite.' },
  'Kaus Borealis': { longitude: 276.1, nature: 'benefic', magnitude: 2.81, meaning: 'You are generous and idealistic, and you like horses, road trips and plans too large for one weekend. You get promoted for your wide vision. You help without keeping score, which means you sometimes end up helping the same person three times.' },
  'Kaus Media': { longitude: 274.6, nature: 'benefic', magnitude: 2.70, meaning: 'You think big, say it out loud and prefer to do it outdoors. People look to you for direction because your mind is quick. You make a strong impression in a crowd, and the cost is that you talk past the person who had the better idea.' },
  'Kaus Australis': { longitude: 275.0, nature: 'benefic', magnitude: 1.85, meaning: 'You push an idea until others carry it out. You are alert, public and persuasive, because people can tell you believe it. The cost is that you put your name on it early, so a failure stays attached to you.' },
  'Facies': { longitude: 278.4, nature: 'malefic', magnitude: 5.90, meaning: 'You fix on a target with such force that you stop seeing what is beside it: the person, the red light, the step. Tunnel vision is the warning, so slow down when you are tired. Your aim is rare, and it pays when you pick one thing.' },
  'Pelagus': { longitude: 282.3, nature: 'benefic', magnitude: 3.17, meaning: 'You chase truth across countries and ideas: a degree abroad, a book that changes your mind, a belief you try on. You are optimistic and mentally sharp, and a small life will not hold you. The catch is the place you never quite settled down in.' },
  'Rukbat': { longitude: 283.9, nature: 'benefic', magnitude: 3.97, meaning: 'You are the person who does not flake. You build slowly, a savings account, a routine, a base people can lean on, and you are hard to move once it is built. The price is that stability turns to stubbornness when a good change shows up and you say not yet.' },
  'Nashira': { longitude: 291.9, nature: 'benefic', magnitude: 3.69, meaning: 'You put chaos in order, whether it is a messy filing system, a family dispute or a government form. You recover from the bad things that happen to you and you write or administer well. People count on your integrity, so one slip stands out more for you than for others.' },
  'Armus': { longitude: 292.4, nature: 'mixed', magnitude: 4.11, meaning: 'You carry heavy things without a word and snap only when the strain runs too long. You are gritty enough to keep going on days others would stop. Your tenacity wins in the end, though it takes a while and you are tired when it does.' },
  'Dorsum': { longitude: 293.6, nature: 'mixed', magnitude: 4.07, meaning: 'You do the thankless work and you keep doing it: the late shift, the unglamorous task, the cleanup. Perseverance pays off for you, but only after a long wait. You trust effort over luck, which makes it hard to enjoy luck when it arrives.' },
  'Sham': { longitude: 301.2, nature: 'mixed', magnitude: 4.37, meaning: 'You aim with precision and you hit: the single interview, the one shot, the deadline you decided to make. Without a goal you drift toward sharp remarks, quarrels and sudden tempers. The downside is that you ignore every other target until the one you chose is done.' },
  'Tarazed': { longitude: 301.1, nature: 'mixed', magnitude: 2.72, meaning: 'You give orders without being asked and break convention without a plan. Scandal and mystery cling to you, and you take the heat with a shrug. You live by your own rules, and the cost is a reputation that arrives before you do.' },
  'Peacock': { longitude: 323.5, nature: 'mixed', magnitude: 1.94, meaning: 'You like being seen, and you have the beauty and talent to back it up. A stage, a camera, a runway, a podium: you glow there. Fame through performance is possible and vanity is the price, because a day without attention feels like a loss.' },
  'Alnair': { longitude: 325.9, nature: 'benefic', magnitude: 1.74, meaning: 'Your mind is quick and your reputation is good, in law, writing or the arts. People see you as refined and well-informed, and you often are. The cost is that being thought polished keeps you from showing the messy draft.' },
  'Ankaa': { longitude: 345.5, nature: 'mixed', magnitude: 2.39, meaning: 'Something burns down, a job, a marriage or a plan, and you start again stronger. Your life has clear turning points, and each one leaves a mark. The catch is the middle part, when you are building with nothing and nobody is clapping.' },
  'Baten Kaitos': { longitude: 352.1, nature: 'malefic', magnitude: 3.74, meaning: 'You go through stretches of isolation: a forced move, a quiet year, a feeling of being swallowed by your own mind. It is a descent and it ends. You come out with a different sense of what matters and fewer people you need to impress.' },
  'Azha': { longitude: 339.0, nature: 'mixed', magnitude: 3.89, meaning: 'You need quiet to let ideas grow, and you disappear to a room, a walk or a cabin to get it. People read your withdrawal as disinterest and take it personally. What you build in private is worth the wait.' },
  'Acamar': { longitude: 343.4, nature: 'benefic', magnitude: 2.88, meaning: 'You do well in public roles, in a church, a school or an institution, and your character holds up when it is tested. You are philosophical and cheerful, so people take you for lighter than you are. The price is that you carry moral responsibility others skip.' },
  'Phact': { longitude: 104.0, nature: 'benefic', magnitude: 2.64, meaning: 'You are the one who offers the olive branch after the fight, and you bring messages and hope to people who need them. You are gentle, peace-loving and artistic. The downside is that you make peace too early, before the real issue has been said.' },
  'Wezen': { longitude: 109.4, nature: 'mixed', magnitude: 1.84, meaning: 'You are the one who stays to close up and covers for others, and you do it without thanks. A quiet melancholy goes with it, because responsibility is lonely. Let someone else carry a shift before you resent them for not offering.' },
  'Pleiades': { longitude: 60.1, nature: 'mixed', magnitude: 1.60, meaning: 'You see and feel more than you let on, and you know loss: a friend who left, a move you did not choose, a long goodbye. That sensitivity also gives you a vision that reaches other people. The cost is tears at odd moments and a habit of saying nothing until you are alone.' },
  'Agena': { longitude: 203.7, nature: 'benefic', magnitude: 0.61, meaning: 'You rise because others back you: a partner, a sponsor, an institution that picks you. Your intellect is refined and your influence is quiet but strong. The catch is that your position depends on who is vouching for you, so keep those relationships warm.' },
};

// ─── Helpers ────────────────────────────────────────────────────────────────

const sortStars = (stars: StarConjunction[]): StarConjunction[] => {
  return [...stars].sort((a, b) => {
    const aIsRoyal = ROYAL_STARS.includes(a.star_name) ? 0 : 1;
    const bIsRoyal = ROYAL_STARS.includes(b.star_name) ? 0 : 1;
    if (aIsRoyal !== bIsRoyal) return aIsRoyal - bIsRoyal;
    return (a.magnitude ?? 99) - (b.magnitude ?? 99);
  });
};

const getNatureColor = (nature?: string): string => {
  if (!nature) return 'text-text-muted';
  const lower = nature.toLowerCase();
  if (lower === 'benefic') return 'text-emerald-400';
  if (lower === 'malefic') return 'text-red-400';
  return 'text-amber-400';
};

const getNatureBg = (nature?: string): string => {
  if (!nature) return 'bg-white/5';
  const lower = nature.toLowerCase();
  if (lower === 'benefic') return 'bg-emerald-500/15';
  if (lower === 'malefic') return 'bg-red-500/15';
  return 'bg-amber-500/15';
};

const getNatureLabel = (nature?: string): string => {
  if (!nature) return 'Unknown';
  return nature.charAt(0).toUpperCase() + nature.slice(1);
};

const getMagnitudeLabel = (mag?: number): string => {
  if (mag === undefined || mag === null) return '';
  if (mag <= 1) return 'Brilliant';
  if (mag <= 2) return 'Bright';
  if (mag <= 3) return 'Moderate';
  return 'Faint';
};

const formatDegree = (deg: number): string => {
  return `${deg.toFixed(3)}°`;
};

// ─── Planet Themes (for personal interpretation) ────────────────────────────

const PLANET_THEMES: Record<string, string> = {
  Sun: 'your core identity, life purpose, and visibility',
  Moon: 'your emotions, instincts, and inner world',
  Mercury: 'your mind, communication, and how you process information',
  Venus: 'your love nature, values, and sense of beauty',
  Mars: 'your drive, ambition, and how you assert yourself',
  Jupiter: 'your growth, wisdom, and where abundance flows',
  Saturn: 'your discipline, life lessons, and long-term mastery',
  Uranus: 'your originality, independence, and where you break from convention',
  Neptune: 'your spirituality, imagination, and psychic sensitivity',
  Pluto: 'your power, transformation, and deepest evolution',
  'North Node': 'your soul direction and destiny path',
  'South Node': 'your past-life gifts and karmic comfort zone',
  Chiron: 'your deepest wound and greatest healing gift',
  MC: 'your career, public reputation, and life calling',
  Vesta: 'your sacred devotion, focus, and dedicated service',
  Juno: 'your partnerships, commitments, and relational contracts',
  'Part of Fortune': 'your natural prosperity and joy point',
};

const HOUSE_THEMES: Record<number, string> = {
  1: 'identity and self-expression', 2: 'finances and self-worth', 3: 'communication and learning',
  4: 'home and emotional roots', 5: 'creativity and romance', 6: 'work and health',
  7: 'partnerships and relationships', 8: 'transformation and shared resources',
  9: 'higher learning and beliefs', 10: 'career and public standing',
  11: 'community and future vision', 12: 'spirituality and inner work',
};

// ─── Main Component ─────────────────────────────────────────────────────────

export default function FixedStarsPage() {
  const { profile } = useAuthStore();
  const [chartData, setChartData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [aiReading, setAiReading] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [natureFilter, setNatureFilter] = useState<string>('all');
  const hasFetchedRef = useRef(false);
  const hasTriggeredReadingRef = useRef(false);

  const fetchChart = useCallback(async () => {
    if (!profile?.birth_date || !profile?.latitude) return;
    setLoading(true);
    setError('');
    try {
      const data = await api.getNatalChart(buildBirthData(profile!));
      setChartData(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [profile]);

  const chartPositions = chartData?.positions || chartData?.planets || [];

  const conjunctions = useMemo(() => {
    if (!chartPositions.length) return [];
    const results: StarConjunction[] = [];
    for (const planet of chartPositions) {
      if (!planet.longitude && planet.longitude !== 0) continue;
      if (['Ascendant', 'Descendant', 'IC', 'Vertex', 'Anti-Vertex'].includes(planet.name)) continue;
      for (const [starName, starData] of Object.entries(FIXED_STARS)) {
        let diff = Math.abs(planet.longitude - starData.longitude);
        if (diff > 180) diff = 360 - diff;
        if (diff <= CONJUNCTION_ORB) {
          results.push({
            star_name: starName,
            planet: planet.name,
            orb: Math.round(diff * 1000) / 1000,
            nature: starData.nature,
            meaning: starData.meaning,
            magnitude: starData.magnitude,
          });
        }
      }
    }
    return sortStars(results);
  }, [chartPositions]);

  const filteredConjunctions = useMemo(() => {
    if (natureFilter === 'all') return conjunctions;
    return conjunctions.filter(c => c.nature === natureFilter);
  }, [conjunctions, natureFilter]);

  // Personal interpretation generator
  const getPersonalInterpretation = (conj: StarConjunction): string => {
    const planetTheme = PLANET_THEMES[conj.planet] || `the energy of ${conj.planet} in your chart`;
    const firstName = (profile?.display_name || '').split(' ')[0] || 'Friend';
    const starName = conj.star_name;
    const nature = conj.nature;
    const orb = conj.orb;

    const planetData = chartPositions.find((p: any) => p.name === conj.planet);
    const sign = planetData?.sign || '';
    const house = planetData?.house || 0;

    const strength = orb <= 0.5 ? 'almost exact, so you feel it daily' : orb <= 1.0 ? 'tight enough to run in the background' : 'wide enough to show up only when it is triggered';
    const houseArea = HOUSE_THEMES[house] || 'life';

    let interp = `${firstName}, ${starName} sits ${orb}° from your ${conj.planet}, ${strength}. That puts it right inside ${planetTheme}. `;

    if (nature === 'benefic') {
      interp += `With ${conj.planet} in ${sign}${house ? ` (House ${house}, ${houseArea})` : ''}, this is where people hand you things you did not ask for: an introduction, the benefit of the doubt, a door held open. `;
      interp += `Say yes to the next offer in matters of ${houseArea} before you talk yourself out of it. The price is that you start expecting it, and the day you stop showing up for it, it thins out.`;
    } else if (nature === 'malefic') {
      interp += `With ${conj.planet} in ${sign}${house ? ` (House ${house}, ${houseArea})` : ''}, this is where things get loud: a fight, a loss, a push that costs you more than you budgeted. You come out of those moments harder to scare than most people. `;
      interp += `The danger is acting in the first hour, when the anger or panic is at its peak. When ${houseArea} gets heavy, wait a day before you send the email, make the purchase or give the ultimatum.`;
    } else {
      interp += `With ${conj.planet} in ${sign}${house ? ` (House ${house}, ${houseArea})` : ''}, you get one move that works brilliantly and one that blows up, and the same trait drives both. Expect a win followed by a reversal in matters of ${houseArea}. `;
      interp += `Watch the day you feel most certain, because that is when the swing turns. Take the win, then check the exit before you double down.`;
    }

    return interp;
  };

  const handleAiReading = useCallback(() => {
    if (conjunctions.length === 0) return;
    setAiLoading(true);
    setAiReading('');

    const firstName = (profile?.display_name || '').split(' ')[0] || 'Friend';
    const beneficCount = conjunctions.filter(c => c.nature === 'benefic').length;
    const maleficCount = conjunctions.filter(c => c.nature === 'malefic').length;
    const mixedCount = conjunctions.filter(c => c.nature === 'mixed').length;
    const royalConjunctions = conjunctions.filter(c => ROYAL_STARS.includes(c.star_name));
    const tightConjunctions = conjunctions.filter(c => c.orb <= 1.0);

    let reading = `## Your Fixed Star Reading\n\n`;
    reading += `${firstName}, you have **${conjunctions.length}** fixed star conjunctions in your natal chart. `;

    if (royalConjunctions.length > 0) {
      reading += `Most notably, you have ${royalConjunctions.length === 1 ? 'a Royal Star' : `${royalConjunctions.length} Royal Stars`} on your chart: `;
      reading += `${royalConjunctions.map(c => `**${c.star_name}** conjunct your ${c.planet}`).join(', ')}. `;
      reading += `With a Royal Star on your planet, the rewards are bigger and so is the fall if you cheat the terms. Nobody hands you a small version of this.\n\n`;
    } else {
      reading += `None of them is a Royal Star, so your stars work in the details of your life and not on a stage. Read each one below for the exact place it shows up.\n\n`;
    }

    // Overall signature
    reading += `### Your Stellar Signature\n\n`;
    if (beneficCount > maleficCount) {
      reading += `${firstName}, your stars lean **benefic** (${beneficCount} benefic, ${maleficCount} malefic, ${mixedCount} mixed). Help turns up for you more often than it should: the stranger who steps in, the offer nobody pitched. `;
      reading += `The cost is that you get comfortable, so ask yourself which of these gifts you have not used yet.\n\n`;
    } else if (maleficCount > beneficCount) {
      reading += `${firstName}, your stars lean **intense** (${maleficCount} malefic, ${beneficCount} benefic, ${mixedCount} mixed). You get tested harder than your friends, in fights you cannot dodge and losses that arrive without warning. `;
      reading += `The upside is nerve: you stay on your feet in situations that freeze other people. Rest before you are exhausted, because you will not feel it coming.\n\n`;
    } else {
      reading += `${firstName}, your stars are **balanced** (${beneficCount} benefic, ${maleficCount} malefic, ${mixedCount} mixed). One area of your life runs lucky while another charges you for it, so read the two kinds separately below, because the same advice will not fit both.\n\n`;
    }

    // Highlight each conjunction
    reading += `### Your Star Conjunctions\n\n`;
    for (const conj of conjunctions) {
      const isRoyal = ROYAL_STARS.includes(conj.star_name);
      const strength = conj.orb <= 0.5 ? 'almost exact' : conj.orb <= 1.0 ? 'tight' : 'wide';
      const planetTheme = PLANET_THEMES[conj.planet] || `the energy of ${conj.planet}`;

      reading += `**${isRoyal ? '★ ' : ''}${conj.star_name}** conjunct **${conj.planet}** (${conj.orb}° orb, ${strength})\n\n`;
      reading += `${conj.meaning}\n\n`;
      reading += `In practice this lands in ${planetTheme}. `;

      if (conj.nature === 'benefic') {
        reading += `${conj.star_name} lifts your ${conj.planet}, so expect luck or recognition here, and use it before it passes.\n\n`;
      } else if (conj.nature === 'malefic') {
        reading += `${conj.star_name} puts pressure on your ${conj.planet}. You handle it by pausing before you react, not by pushing harder.\n\n`;
      } else {
        reading += `${conj.star_name} gives your ${conj.planet} a win and a reversal in the same package. Take the win, then check the exit.\n\n`;
      }
    }

    // Practical guidance
    reading += `### Practical Guidance\n\n`;

    if (tightConjunctions.length > 0) {
      reading += `Your tightest contacts (${tightConjunctions.map(c => `${c.star_name}/${c.planet}`).join(', ')}) are where you feel this most. `;
      reading += `Those are the areas that react first, `;
      reading += `so watch them when a transit lands on them.\n\n`;
    }

    reading += `${firstName}, pick the one star above that made you wince and the one that made you smile. `;
    reading += `Treat the first as a warning you check before big decisions, and the second as a chance you act on this month. `;
    reading += `Stars do not do the work for you; they show where the work is easiest to find and hardest to fake. `;
    reading += `Check the warning against one real decision this week.\n`;

    setAiReading(reading);
    setAiLoading(false);
  }, [conjunctions, profile?.display_name]);

  useEffect(() => {
    if (hasFetchedRef.current) return;
    if (profile?.birth_date && profile?.latitude) {
      hasFetchedRef.current = true;
      fetchChart();
    }
  }, [fetchChart, profile?.birth_date, profile?.latitude]);

  useEffect(() => {
    if (hasTriggeredReadingRef.current) return;
    if (conjunctions.length > 0 && !aiReading && !aiLoading) {
      hasTriggeredReadingRef.current = true;
      handleAiReading();
    }
  }, [conjunctions, aiReading, aiLoading, handleAiReading]);

  if (!profile?.birth_date || !profile?.latitude) {
    return (
      <PaywallGate feature="fixed_stars" fallbackTier="pro">
        <BirthDataPrompt message="Add your birth data to discover your fixed star conjunctions." />
      </PaywallGate>
    );
  }

  return (
    <PaywallGate feature="fixed_stars" fallbackTier="pro">
      <div className="max-w-3xl mx-auto">
        <Link href="/readings" className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary mb-4">
          <ArrowLeft className="w-4 h-4" />
          Back to Readings
        </Link>
        <div className="flex items-center gap-3 mb-6">
          <Sparkles className="w-8 h-8 text-accent-primary" />
          <div>
            <h1 className="text-2xl font-display font-bold text-text-primary">Fixed Stars</h1>
            <p className="text-text-tertiary text-sm">Star-planet conjunctions in your natal chart</p>
          </div>
        </div>

        {showIntro && (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 mb-5 relative">
            <button
              onClick={() => setShowIntro(false)}
              className="absolute top-2 right-3 text-text-muted hover:text-text-primary text-lg leading-none"
              aria-label="Dismiss"
            >&times;</button>
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-text-primary mb-1">Stars on your chart</p>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Some bright stars sit on fixed degrees of the zodiac. When one lands within 2 degrees of a planet in your chart, it colours that part of your life: it lifts a talent, sharpens a problem, or adds a story you keep running into. The tighter the contact, the harder you feel it. <strong>Royal Stars</strong> (Aldebaran, Regulus, Antares, Fomalhaut) bring the biggest rewards and the biggest falls. A <strong>benefic</strong> star hands you something, a <strong>malefic</strong> star charges you up front, and a <strong>mixed</strong> star does both in one package.
                </p>
              </div>
            </div>
          </div>
        )}

        {loading && (
          <div className="card text-center py-12">
            <div className="animate-spin text-4xl mb-4">{'✦'}</div>
            <p className="text-text-tertiary">Scanning the fixed stars...</p>
          </div>
        )}

        {error && chartData === null && !loading && (
          <div className="card text-center py-8">
            <p className="text-red-400 text-sm mb-4">{error}</p>
            <button onClick={fetchChart} className="btn-primary">Retry</button>
          </div>
        )}

        {chartData && !loading && (
          <div className="space-y-4">
            {conjunctions.length === 0 && (
              <div className="card text-center py-12">
                <span className="text-5xl block mb-4 text-text-muted">{'★'}</span>
                <p className="text-text-muted">No fixed star conjunctions found within orb.</p>
              </div>
            )}

            {conjunctions.length > 0 && (
              <>
                <div className="flex items-center gap-3 text-sm text-text-secondary mb-1">
                  <span className="font-semibold text-text-primary">{conjunctions.length}</span> star conjunctions found
                  <span className="text-emerald-400">{conjunctions.filter(c => c.nature === 'benefic').length} benefic</span>
                  <span className="text-red-400">{conjunctions.filter(c => c.nature === 'malefic').length} malefic</span>
                  <span className="text-amber-400">{conjunctions.filter(c => c.nature === 'mixed').length} mixed</span>
                </div>

                <div className="flex gap-2 mb-2">
                  {(['all', 'benefic', 'malefic', 'mixed'] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setNatureFilter(f)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        natureFilter === f
                          ? f === 'benefic' ? 'bg-emerald-500/20 text-emerald-400'
                          : f === 'malefic' ? 'bg-red-500/20 text-red-400'
                          : f === 'mixed' ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-white/10 text-text-primary'
                          : 'bg-white/5 text-text-muted hover:bg-white/10'
                      }`}
                    >
                      {f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                  ))}
                </div>
              </>
            )}

            {aiLoading && (
              <div className="card text-center py-6">
                <div className="animate-spin text-2xl mb-2">{'✦'}</div>
                <p className="text-text-tertiary text-sm">Crafting your reading...</p>
              </div>
            )}

            {aiReading.length > 0 && (
              <div className="rounded-2xl p-6 border border-accent-muted bg-gradient-to-br from-purple-500/10 to-purple-500/[0.02]">
                <h3 className="text-base font-semibold text-accent-secondary mb-3">Personal Fixed Star Reading</h3>
                <RenderMarkdown text={aiReading} />
                <CopyButton text={aiReading} />
              </div>
            )}

            {filteredConjunctions.map((conj, index) => {
              const isRoyal = ROYAL_STARS.includes(conj.star_name);
              const natureColorClass = getNatureColor(conj.nature);
              const natureBgClass = getNatureBg(conj.nature);

              return (
                <div
                  key={`star-${index}`}
                  className={`rounded-2xl p-5 border ${
                    isRoyal
                      ? 'border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-amber-500/[0.02]'
                      : 'border-border-primary bg-gradient-to-br from-white/[0.04] to-transparent'
                  }`}
                >
                  {isRoyal && (
                    <div className="inline-block bg-amber-500/15 rounded px-2 py-0.5 mb-3">
                      <span className="text-xs font-bold text-amber-400 tracking-wider">{'★'} ROYAL STAR</span>
                    </div>
                  )}

                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className={`text-lg font-semibold ${isRoyal ? 'text-amber-400' : 'text-text-primary'}`}>
                        {conj.star_name}
                      </h3>
                      {conj.constellation && (
                        <p className="text-xs text-text-muted mt-0.5">{conj.constellation}</p>
                      )}
                    </div>
                    {conj.magnitude !== undefined && conj.magnitude !== null && (
                      <div className="text-right">
                        <p className="text-xs text-text-tertiary">Mag {conj.magnitude.toFixed(1)}</p>
                        <p className="text-[10px] text-text-muted">{getMagnitudeLabel(conj.magnitude)}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-6 py-2 border-t border-border-primary">
                    <div className="flex-1">
                      <p className="text-xs text-text-muted mb-1">Conjunct</p>
                      <div className="flex items-center gap-1.5">
                        <span className="text-lg text-accent-secondary">
                          {PLANET_GLYPHS[conj.planet] || conj.planet}
                        </span>
                        <span className="text-sm font-medium text-text-primary">{conj.planet}</span>
                      </div>
                    </div>

                    <div className="flex-1">
                      <p className="text-xs text-text-muted mb-1">Orb</p>
                      <p className="text-sm text-text-secondary">{formatDegree(conj.orb)}</p>
                    </div>

                    <div className="flex-1">
                      <p className="text-xs text-text-muted mb-1">Nature</p>
                      <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded ${natureBgClass} ${natureColorClass}`}>
                        {getNatureLabel(conj.nature)}
                      </span>
                    </div>
                  </div>

                  {conj.meaning && (
                    <div className="mt-3 pt-3 border-t border-border-primary">
                      <p className={`text-xs font-bold tracking-wide mb-1.5 ${natureColorClass}`}>{'★'} Star Meaning</p>
                      <div className="flex items-start gap-2">
                        <p className="text-sm text-text-secondary leading-relaxed flex-1">{conj.meaning}</p>
                        <CopyButton text={conj.meaning} />
                      </div>
                    </div>
                  )}

                  <div className="mt-3 p-3 rounded-xl bg-purple-500/[0.06]">
                    <p className="text-xs font-bold tracking-wide mb-1.5 text-accent-primary">{'✨'} What This Means For You</p>
                    <div className="flex items-start gap-2">
                      <p className="text-sm text-text-secondary leading-relaxed flex-1">{getPersonalInterpretation(conj)}</p>
                      <CopyButton text={getPersonalInterpretation(conj)} />
                    </div>
                  </div>

                  {conj.traditional_nature && (
                    <p className="text-xs text-text-muted mt-2 italic">
                      Traditional: {conj.traditional_nature}
                    </p>
                  )}
                </div>
              );
            })}

            <button
              onClick={() => {
                setChartData(null);
                setAiReading('');
                setError('');
                hasFetchedRef.current = false;
                hasTriggeredReadingRef.current = false;
              }}
              className="btn-secondary w-full"
            >
              Recalculate
            </button>
          </div>
        )}
      </div>
    </PaywallGate>
  );
}
