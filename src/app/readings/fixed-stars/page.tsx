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
  'Antares': { longitude: 249.9, nature: 'malefic', magnitude: 1.09, meaning: 'When you want something you stop at nothing, and the focus is frightening to the people around you. You plan three moves ahead and you do not let go. The cost is that you push past the point where it still pays, and you burn your health, your savings or a relationship to prove you can win.' },
  'Fomalhaut': { longitude: 333.9, nature: 'benefic', magnitude: 1.16, meaning: 'You have an imagination other people notice, and a chance at real recognition for it. The catch is that it only holds while your motives are clean. The year you start doing it for the applause, or cut a corner to get ahead, the recognition drains away.' },

  // Brightest Stars (20)
  'Sirius': { longitude: 104.1, nature: 'benefic', magnitude: -1.46, meaning: 'You are driven to be seen and remembered, and you will work for years toward that. People hand you responsibility because you take it seriously and stay loyal to what you commit to. The risk is that the hunger for a name makes you burn through people on the way up.' },
  'Canopus': { longitude: 104.9, nature: 'benefic', magnitude: -0.74, meaning: 'You find the route others missed, whether that is a move abroad, a career nobody mapped or a research problem everyone gave up on. People come to you to ask which way to go. You often hit your stride late, and it takes patience with a path that looks slow at the start.' },
  'Arcturus': { longitude: 204.2, nature: 'benefic', magnitude: -0.05, meaning: 'You make money and progress by trying the thing nobody else will try. You leave the safe job, take the trip or start the business, and it works more often than it should. Travel and moving around are part of how you earn your luck, so staying put too long costs you.' },
  'Vega': { longitude: 285.4, nature: 'benefic', magnitude: 0.03, meaning: 'You can make people feel something with a song, a voice, a photo or a well-placed sentence, and they remember you for it. Charm opens doors for you before you have done anything. The luck is real but it does not wait, so you have to use the opening while it is there.' },
  'Rigel': { longitude: 76.9, nature: 'benefic', magnitude: 0.12, meaning: 'You build things that work. You fix, invent or improve a system, and you tend to make good money doing it. People look to you for how to do something properly, and you enjoy teaching it once you have figured it out.' },
  'Procyon': { longitude: 115.7, nature: 'mixed', magnitude: 0.34, meaning: 'Success comes to you quickly, and you can lose it just as quickly. You are sharp, you act fast and you win early. Then you get restless or jealous or snap at the wrong person, and you spend the next year paying for one rushed decision.' },
  'Betelgeuse': { longitude: 88.8, nature: 'benefic', magnitude: 0.42, meaning: 'You are at your best in a fight, a competition or a high-stakes push where nothing is guaranteed. Others see the nerve and remember you for it. You also pick fights you did not need to pick, because being in motion feels better than being at peace.' },
  'Capella': { longitude: 81.8, nature: 'benefic', magnitude: 0.08, meaning: 'You are curious about everything and you collect knowledge the way other people collect hobbies. That curiosity turns into a platform, a title or a paycheck when you share it in public. You do better when you are looking after people or teaching them than when you work alone.' },
  'Altair': { longitude: 301.9, nature: 'mixed', magnitude: 0.77, meaning: 'You jump first. You take the leap into the new job, the dangerous sport or the big stage, and you land higher than people expected. The same nerve gets you hurt when you ignore a warning because you are sure you will be fine.' },
  'Spica': { longitude: 203.9, nature: 'benefic', magnitude: 0.97, meaning: 'Your skills pay off, and the payoff is usually larger than you expected. You are good at research, craft and the finer points of your work, and you get rewarded for being precise. Money and recognition arrive as a result of the quality of what you make.' },
  'Pollux': { longitude: 113.2, nature: 'malefic', magnitude: 1.14, meaning: 'You are brave and you hit hard. In sport, an argument or a crisis you do not back down. The shadow is that your temper goes from zero to cruel in a sentence, and you say the thing you cannot take back.' },
  'Achernar': { longitude: 345.3, nature: 'benefic', magnitude: 0.46, meaning: 'People give you responsibility for a group, a congregation or a cause, because you seem to know what matters. You like learning and you hold yourself to a high standard. The cost is that you judge yourself harshly when you fall short of it.' },
  'Deneb': { longitude: 320.2, nature: 'benefic', magnitude: 1.25, meaning: 'You pick up skills quickly and you have a mind that is both inventive and artistic. You notice things in people and places that others walk past, and sometimes you know something before you can explain how. Your ideals are high, which makes ordinary disappointments hit you harder.' },
  'Acrux': { longitude: 192.1, nature: 'benefic', magnitude: 0.76, meaning: 'You take the serious side of life seriously: justice, ritual, the unseen, what is fair. You read people and rooms accurately, and you do not like being talked down to. Other people feel the weight in you, which can make you seem intense at parties.' },
  'Mimosa': { longitude: 192.8, nature: 'benefic', magnitude: 1.25, meaning: 'You invent your way out of problems and you love working with unusual systems, astrology and the unseen among them. You are resourceful and start things without waiting for permission. The cost is a tendency to believe too fast in signs, omens and theories that nobody has checked.' },
  'Hadar': { longitude: 203.7, nature: 'benefic', magnitude: 0.61, meaning: 'You rise through groups. A team, a firm, a congregation or a circle of well-connected friends lifts you, and you are good at being the person they trust. Your honors come through who you know and who vouches for you, so you need to keep your name clean with the people in your circle.' },
  'Bellatrix': { longitude: 80.9, nature: 'malefic', magnitude: 1.64, meaning: 'You decide fast and you act on it, and in an organization or a crisis you become the one who gets things moving. Women with this are often noticed for their drive. The pattern to watch is a high point followed by a sudden drop, usually after a decision made too quickly.' },
  'Alnilam': { longitude: 83.6, nature: 'benefic', magnitude: 1.69, meaning: 'You make a strong first impression, and you get a moment of public attention that surprises you. You take a bold risk and it looks great. The fame does not last by itself, so you have to do something with the moment before it passes.' },
  'Castor': { longitude: 110.2, nature: 'mixed', magnitude: 1.58, meaning: 'You are sharp with words, good at law, writing or negotiating, and success can show up overnight. Your mind runs two tracks at once, and you can swing from generous to mischievous or harsh without warning. People around you never fully know which one they will get.' },
  'Polaris': { longitude: 28.3, nature: 'mixed', magnitude: 1.98, meaning: 'People steer by you. Friends, a team or a family treats you as the one who knows where north is, even when you do not feel sure. It gives you a strong sense of purpose and costs you rest, because you cannot be the one who falls apart.' },

  // Important Classical Stars (30)
  'Algol': { longitude: 56.2, nature: 'malefic', magnitude: 2.12, meaning: 'You carry a lot of intensity, and it comes out in rage, in a hard stare or in a moment you lose control. Many people with this learn early what happens when they lose their temper. When you master it, the same force becomes the power to face down people others are scared of.' },
  'Alcyone': { longitude: 60.0, nature: 'mixed', magnitude: 2.87, meaning: 'You have a big appetite for achievement and an inner sense that you see more than you say. You work hard and sometimes ruthlessly to get where you are going. There is also grief in the picture, so the winning is mixed with a loss you do not talk about.' },
  'Hyades': { longitude: 65.7, nature: 'malefic', magnitude: 3.65, meaning: 'Your life has sudden turns, and some of them include tears, scandal or a crisis that nobody saw coming. You can be greedy or rash in desire. You also learn to hold power in the middle of the storm when others fall apart.' },
  'Praesepe': { longitude: 127.3, nature: 'malefic', magnitude: 3.70, meaning: 'You live for adventure and you go further than people around you consider reasonable. You can get blunt, rough or reckless along the way. Eye trouble or a blind spot about something obvious is a recurring theme, so ask a friend what you are not seeing.' },
  'Vindemiatrix': { longitude: 190.0, nature: 'malefic', magnitude: 2.83, meaning: 'You do things on your own terms and you are used to standing alone. Your analytical mind finds flaws quickly. The cost is that you can lose a partner, get cheated, or fall out with people when you refuse to bend.' },
  'Zuben Elgenubi': { longitude: 225.1, nature: 'malefic', magnitude: 2.75, meaning: 'You hold onto grudges and you hold other people to what they promised. Disruption around you pushes you into fights about fairness. When you aim that anger at a real injustice instead of a person, you are the one who changes the system.' },
  'Zuben Eschamali': { longitude: 229.2, nature: 'benefic', magnitude: 2.61, meaning: 'You are ambitious in a way that tends to help other people too, and you are drawn to reform, fairness and fixing what is broken. Honors and money come to you more easily than to most. Your luck holds when you keep working on something bigger than yourself.' },
  'Unukalhai': { longitude: 241.8, nature: 'malefic', magnitude: 2.65, meaning: 'Your cleverness can turn on you. You take a shortcut, play both sides or poke at something dangerous, and it bites back. Accidents, poison and gossip are the routes by which it happens, so be straight with people and careful with substances.' },
  'Ras Alhague': { longitude: 262.4, nature: 'mixed', magnitude: 2.08, meaning: 'You are drawn to healing, medicine and the hidden side of things, and you are good at it. People bring their troubles to you. The risk is in how you cope: drugs, bending rules and secrets can become a part of your own story.' },
  'Sabik': { longitude: 257.6, nature: 'mixed', magnitude: 2.43, meaning: 'You let energy leak. You spend on the wrong person, hide a secret love, or waste months on something you will not admit is not working. You also have a real streak of honesty, and you recover by telling the truth about it.' },
  'Nunki': { longitude: 282.3, nature: 'benefic', magnitude: 2.02, meaning: 'You say what you think and people believe you. You are optimistic, you enjoy travel and big ideas, and you judge situations well. Others follow you because you act from conviction instead of calculation.' },
  'Deneb Algedi': { longitude: 293.4, nature: 'benefic', magnitude: 2.87, meaning: 'You have a sense of justice and a head for law, rules and contracts. A hard stretch early in life turns into wisdom you use on other people later. You get put in charge when things are difficult, because you do not quit.' },
  'Sadalmelik': { longitude: 303.4, nature: 'benefic', magnitude: 2.96, meaning: 'You are drawn to groups, causes and the unseen. You can be attacked or misunderstood for what you believe, and later proven right. The long game works for you if you stay with it.' },
  'Sadalsuud': { longitude: 303.2, nature: 'benefic', magnitude: 2.91, meaning: 'Luck tends to land on you, especially in home life, creativity and the small joys. You have an artistic side that makes ordinary days better. Many people with this are simply happy more often than they expect to be.' },
  'Markab': { longitude: 353.5, nature: 'mixed', magnitude: 2.49, meaning: 'You love learning and you win honors and money through your mind. You write, speak or study well. Fire, fever and cuts are the physical warnings, so slow down around stoves, tools and a body that is running hot.' },
  'Scheat': { longitude: 349.3, nature: 'malefic', magnitude: 2.42, meaning: 'You think for yourself and you often see things before other people do. You value freedom of thought more than comfort. Life can hit hard in the form of water, despair or violence, so you need people who can pull you back when your mood turns dark.' },
  'Alpheratz': { longitude: 14.3, nature: 'benefic', magnitude: 2.06, meaning: 'You need freedom and you get it. Money and honors come, but they come through movement and independence, not through being tied down. You feel best when you are travelling or free to change course.' },
  'Mirach': { longitude: 30.4, nature: 'benefic', magnitude: 2.05, meaning: 'You are gifted, and love is a big part of how your life goes. A happy marriage or a partnership with a creative person is common. Your talent is intuitive, and you do your best work when you trust it.' },
  'Almach': { longitude: 44.2, nature: 'benefic', magnitude: 2.16, meaning: 'You are popular and you know it. You can charm a room and you put your creative gifts to use. Recognition and honors find you, mostly because people enjoy being around you.' },
  'Hamal': { longitude: 7.4, nature: 'malefic', magnitude: 2.00, meaning: 'You lead from the front and you do not wait for approval. You are independent to the point of being rough on those who slow you down. The darker version is a plan made in cold blood or a harshness you later regret.' },
  'Sheratan': { longitude: 3.9, nature: 'malefic', magnitude: 2.64, meaning: 'You are quick-witted and determined, and you take risks with your mind. Your body takes hits, usually from rushing. You also make deals that look better than they are, so read the fine print.' },
  'Menkar': { longitude: 44.3, nature: 'malefic', magnitude: 2.53, meaning: 'You go through events that feel bigger than you, such as illness, public embarrassment or a collapse you did not cause. Things buried deep in you come up at inconvenient times. You come out of it with a stronger sense of who you are than you had before.' },
  'Mira': { longitude: 11.3, nature: 'mixed', magnitude: 3.04, meaning: 'Your life goes in cycles of shine and shadow. You disappear for a while, then show up and get noticed. The quiet years are not wasted, because what you build in them is what comes out later.' },
  'Alnath': { longitude: 82.5, nature: 'mixed', magnitude: 1.65, meaning: 'You are assertive and good at fighting for your position, and you earn distinction because of it. You also pick quarrels, and you can get exiled from a group when you push too far. Hold your temper in a dispute, because it is a real danger in your life.' },
  'Ain': { longitude: 68.9, nature: 'malefic', magnitude: 3.53, meaning: 'You see clearly and you do not let go. You are suspicious by instinct and stubborn about it. You can end up embarrassed in public when the suspicion turns out to be wrong.' },
  'Tejat': { longitude: 63.5, nature: 'mixed', magnitude: 2.88, meaning: 'You are proud and sure of yourself, and sometimes you do not care how it comes across. You also endure a lot, and you keep going through hard stretches that would stop other people. Protect your pride from getting you into trouble you did not need.' },
  'Alhena': { longitude: 99.2, nature: 'benefic', magnitude: 1.93, meaning: 'You walk into a room like you belong in it. You have an eye for art and beauty and a spiritual side you take seriously. Your feet and ankles are the weak point, so watch where you step.' },
  'Wasat': { longitude: 108.5, nature: 'malefic', magnitude: 3.53, meaning: 'You can be harsh, and you hurt people in ways you do not always intend. You have a sharp analytical mind. Gas, fumes and chemicals are the physical dangers, so take safety seriously around them.' },
  'Propus': { longitude: 96.5, nature: 'mixed', magnitude: 3.28, meaning: 'You push yourself hard, and you succeed. The problem is that you push too hard, and your own pride gets in the way. Eminence comes to you, and so does the price: you pay for excellence with your health or your relationships.' },

  // Notable Stars (46)
  'Toliman': { longitude: 209.2, nature: 'benefic', magnitude: -0.01, meaning: 'You make friends who stay for decades, and women in your life matter more than usual. You are popular and learned. People feel looked after around you.' },
  'Acubens': { longitude: 123.4, nature: 'malefic', magnitude: 4.25, meaning: 'You are shrewd and you can survive nearly anything. You also stretch the truth and move house more often than most. The darker side is a willingness to bend the rules when you are cornered.' },
  'Asellus Borealis': { longitude: 127.1, nature: 'mixed', magnitude: 4.66, meaning: 'You carry other people\'s burdens and you do it patiently. You work for the community, give to charity and take on the unglamorous duties. The cost is being the one who always says yes.' },
  'Asellus Australis': { longitude: 128.7, nature: 'mixed', magnitude: 3.94, meaning: 'You get involved in public causes, you give, and you also have a burning temper. You fight for what you believe and you are physically brave. Some people with this end up in the military or in public disputes.' },
  'Dubhe': { longitude: 135.2, nature: 'malefic', magnitude: 1.79, meaning: 'You are intuitive to an uncomfortable degree, and you sense what is going on beneath the surface. You are proud and suspicious, and you break things when you feel threatened. Astrology, tarot or other divination comes naturally to you.' },
  'Merak': { longitude: 139.5, nature: 'mixed', magnitude: 2.37, meaning: 'You are patient and you plan carefully. You like power, and you get it by outlasting people instead of by shouting. Others experience you as steady and in command.' },
  'Phecda': { longitude: 140.3, nature: 'malefic', magnitude: 2.44, meaning: 'You want power and you will dig for what you want. You investigate, uncover and refuse to leave a secret alone. The cost is that your ambition can turn ruthless.' },
  'Megrez': { longitude: 141.3, nature: 'mixed', magnitude: 3.31, meaning: 'You are careful, precise and quietly authoritative. You hold a team or a family together without making a fuss. You notice details that other people miss.' },
  'Alioth': { longitude: 148.9, nature: 'malefic', magnitude: 1.77, meaning: 'You influence groups, for good or for harm. Trouble arrives in institutions, such as schools, workplaces and governments. You feel the pain of a crowd, and you are tempted to use the power you have over it.' },
  'Mizar': { longitude: 150.7, nature: 'mixed', magnitude: 2.27, meaning: 'You have a magnetic, high-voltage presence and people watch you when you speak. Your focus is intense and your temper is quick. Fire and accidents are the warning signs, so keep your cool around anything hot.' },
  'Alkaid': { longitude: 156.9, nature: 'malefic', magnitude: 1.86, meaning: 'You deal with endings, funerals and loss more than most. Grief changes you, and you become the person others lean on during it. Death and destruction are part of your story, so make peace with that early.' },
  'Cor Caroli': { longitude: 184.5, nature: 'benefic', magnitude: 2.89, meaning: 'You are loyal and refined, and you are devoted to a person or cause you think is worth it. You like dogs, the outdoors and old-fashioned manners. You give your word and keep it.' },
  'Denebola': { longitude: 171.5, nature: 'malefic', magnitude: 2.14, meaning: 'You judge quickly and have high ideals. Disgrace can come out of nowhere, and regret follows. You take good fortune for granted and then wonder why it left.' },
  'Algorab': { longitude: 177.8, nature: 'malefic', magnitude: 2.95, meaning: 'You are resourceful and sharp-tongued, and you find use in what others throw away. You can be bitter and delay what you know you should do. People find your wit dark but accurate.' },
  'Gienah': { longitude: 180.4, nature: 'mixed', magnitude: 2.59, meaning: 'You are quick with words and agile in unstable situations. You can also lie, and you cut people with your tongue. You thrive in chaos where others freeze.' },
  'Khambalia': { longitude: 197.1, nature: 'mixed', magnitude: 4.66, meaning: 'Your life path is unconventional, and your fortunes shift often. You are adaptable and drawn to the occult. People find you hard to rely on because your plans keep changing.' },
  'Foramen': { longitude: 202.1, nature: 'mixed', magnitude: 1.86, meaning: 'You are most useful in a crisis and you lead well when things go wrong. You also have a creative force that can be dangerous, and you have a history with water, such as boats, floods or drowning feelings. Plan for the rough seas and you will get through them.' },
  'Alphecca': { longitude: 222.1, nature: 'benefic', magnitude: 2.23, meaning: 'You are artistic and quietly dignified. You have a gift for healing and for making things graceful. Success comes to you through refinement, not through force.' },
  'Kornephoros': { longitude: 236.2, nature: 'mixed', magnitude: 2.77, meaning: 'You work harder than the people around you and you do it with cunning. You fight when you have to, and you endure long labour. Stubbornness is your gift and your problem.' },
  'Yed Prior': { longitude: 243.5, nature: 'malefic', magnitude: 2.74, meaning: 'You break rules and you do not feel ashamed about it. You handle dangerous things, such as chemicals, medicines or revolutionary ideas. Healing is in your hands, and so is the risk.' },
  'Han': { longitude: 249.1, nature: 'mixed', magnitude: 2.54, meaning: 'You go to extremes and you are curious about what is forbidden. A crisis changes you, and you come out the other side braver. You are not afraid of the dark parts of life.' },
  'Graffias': { longitude: 243.1, nature: 'malefic', magnitude: 2.62, meaning: 'You are merciless when you are betrayed, and you hit back hard. You lose money or things through recklessness. Your self-defense is effective, and it also costs you relationships.' },
  'Dschubba': { longitude: 242.5, nature: 'malefic', magnitude: 2.32, meaning: 'You strike first. You read people with x-ray accuracy and act before they do. The danger is that you attack someone who was not a threat.' },
  'Shaula': { longitude: 264.6, nature: 'mixed', magnitude: 1.63, meaning: 'You sense danger before it arrives, and you act on instinct. Events in your life come suddenly and change everything. You are tough in a final stand.' },
  'Sargas': { longitude: 265.6, nature: 'mixed', magnitude: 1.87, meaning: 'You see through lies and you say so. Your writing or speech cuts straight to the truth. People either respect you for it or avoid you.' },
  'Kaus Borealis': { longitude: 276.1, nature: 'benefic', magnitude: 2.81, meaning: 'You are generous and idealistic, and you love travel, horses and adventure. You get promoted and honored for your wide vision. You help people without keeping score.' },
  'Kaus Media': { longitude: 274.6, nature: 'benefic', magnitude: 2.70, meaning: 'You think big, speak your mind and love being outdoors. People look to you for leadership because you are mentally sharp. You make a strong impression in social settings.' },
  'Kaus Australis': { longitude: 275.0, nature: 'benefic', magnitude: 1.85, meaning: 'You promote ideas and get others to act on them. You are alert and you lead in public life. People follow because you believe in what you say.' },
  'Facies': { longitude: 278.4, nature: 'malefic', magnitude: 5.90, meaning: 'Your eyes and your focus are the story here. You aim at a target with such intensity that you stop seeing everything else. Sight problems and accidents are a real warning, so get your eyes checked and slow down when you are tired.' },
  'Pelagus': { longitude: 282.3, nature: 'benefic', magnitude: 3.17, meaning: 'You love truth and you chase it across countries and ideas. You are optimistic and mentally sharp. A small life will not satisfy you.' },
  'Rukbat': { longitude: 283.9, nature: 'benefic', magnitude: 3.97, meaning: 'You are steady, grounded and hard to move. People trust you because you do not flake. Your strength comes from a stable base that you build slowly.' },
  'Nashira': { longitude: 291.9, nature: 'benefic', magnitude: 3.69, meaning: 'You bring order to chaos and you do well in writing, government and intellectual work. You overcome the bad things that happen to you. People count on your integrity.' },
  'Armus': { longitude: 292.4, nature: 'mixed', magnitude: 4.11, meaning: 'You carry heavy burdens without complaining. You are tough and gritty, and you can be disagreeable when you are under strain. Your tenacity wins in the end.' },
  'Dorsum': { longitude: 293.6, nature: 'mixed', magnitude: 4.07, meaning: 'You do the hard, thankless work and you keep doing it. Perseverance pays off for you only after a long wait. You trust effort more than luck.' },
  'Sham': { longitude: 301.2, nature: 'mixed', magnitude: 4.37, meaning: 'You aim with precision and you hit the target. You also risk sharp objects, weapons and sudden violence. Your will is well-directed when you pick one goal.' },
  'Tarazed': { longitude: 301.1, nature: 'mixed', magnitude: 2.72, meaning: 'You are bold, you like to give orders, and you break convention. Scandal and mystery follow you. You live by your own rules and you take the heat for it.' },
  'Peacock': { longitude: 323.5, nature: 'mixed', magnitude: 1.94, meaning: 'You like to be seen and you make a show of yourself. You have real beauty and talent behind the display. Fame through performance is possible, and vanity is the price.' },
  'Alnair': { longitude: 325.9, nature: 'benefic', magnitude: 1.74, meaning: 'Your mind is quick and your reputation is good. You do well in law, writing and culture. Others see you as refined and well-informed.' },
  'Ankaa': { longitude: 345.5, nature: 'mixed', magnitude: 2.39, meaning: 'You rebuild after a collapse. Something burns down, and you start again stronger. Your life has clear turning points, and each one leaves you changed.' },
  'Baten Kaitos': { longitude: 352.1, nature: 'malefic', magnitude: 3.74, meaning: 'You go through periods of isolation, forced moves and feeling swallowed by your own mind. It is a descent, and it is not permanent. You come out with a different sense of what matters.' },
  'Azha': { longitude: 339.0, nature: 'mixed', magnitude: 3.89, meaning: 'You need quiet time to let your ideas grow. You withdraw from the world to think, and people sometimes read it as disinterest. What you build in private is worth the wait.' },
  'Acamar': { longitude: 343.4, nature: 'benefic', magnitude: 2.88, meaning: 'You do well in public roles, in church or in institutions, and your moral character holds up. You are happy and philosophical. Others see you as someone with depth.' },
  'Phact': { longitude: 104.0, nature: 'benefic', magnitude: 2.64, meaning: 'You are gentle and peace-loving, and you have an artistic streak. You bring messages and hope to people who need them. You are the one who offers the olive branch after a fight.' },
  'Wezen': { longitude: 109.4, nature: 'mixed', magnitude: 1.84, meaning: 'You are loyal and dutiful, and you carry a quiet melancholy. You serve others faithfully, often without thanks. The loneliness of responsibility is familiar to you.' },
  'Pleiades': { longitude: 60.1, nature: 'mixed', magnitude: 1.60, meaning: 'You see and feel more than you let on, and you know loss. Bereavement, exile or a long goodbye is part of your story. You also have a deep sensitivity and a vision that touches other people.' },
  'Agena': { longitude: 203.7, nature: 'benefic', magnitude: 0.61, meaning: 'You gain position and power through partnerships and institutions. Your intellect is refined, and your influence is quiet but strong. You rise because others back you.' },
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
    const firstName = (profile?.display_name || '').split(' ')[0] || 'You';
    const starName = conj.star_name;
    const nature = conj.nature;
    const orb = conj.orb;

    const planetData = chartPositions.find((p: any) => p.name === conj.planet);
    const sign = planetData?.sign || '';
    const house = planetData?.house || 0;

    const strength = orb <= 0.5 ? 'extremely powerful' : orb <= 1.0 ? 'very strong' : 'notable';
    const houseArea = HOUSE_THEMES[house] || 'life';

    let interp = `${firstName}, this is a ${strength} conjunction that directly shapes ${planetTheme}. `;

    if (nature === 'benefic') {
      interp += `${starName} amplifies the best qualities of your ${conj.planet} in ${sign}${house ? ` (House ${house} — ${houseArea})` : ''}. This star brings natural talent, magnetism, and a sense of destiny to this area of your life. People may feel drawn to you because of the quality this star infuses into your presence. `;
      interp += `Lean into the gifts of ${starName} — they are not earned but inherited from the stars. Use them with awareness and gratitude.`;
    } else if (nature === 'malefic') {
      interp += `${starName} adds intensity and challenge to your ${conj.planet} in ${sign}${house ? ` (House ${house} — ${houseArea})` : ''}. This is not a curse — it is a crucible. The pressure this star brings forces you to develop extraordinary strength in this area. `;
      interp += `The key is awareness: when ${houseArea} feels overwhelming or fated, recognize that ${starName} is activating a deeper process. Channel this intensity into mastery rather than letting it control you.`;
    } else {
      interp += `${starName} brings a complex, double-edged influence to your ${conj.planet} in ${sign}${house ? ` (House ${house} — ${houseArea})` : ''}. At its best, this conjunction delivers exceptional ability and recognition. At its most challenging, it can create restlessness or sudden reversals. `;
      interp += `The secret is timing — when you feel this star's energy surge in matters of ${houseArea}, act with intention and you will find the gift hidden inside the complexity.`;
    }

    return interp;
  };

  const handleAiReading = useCallback(() => {
    if (conjunctions.length === 0) return;
    setAiLoading(true);
    setAiReading('');

    const firstName = (profile?.display_name || '').split(' ')[0] || 'you';
    const beneficCount = conjunctions.filter(c => c.nature === 'benefic').length;
    const maleficCount = conjunctions.filter(c => c.nature === 'malefic').length;
    const mixedCount = conjunctions.filter(c => c.nature === 'mixed').length;
    const royalConjunctions = conjunctions.filter(c => ROYAL_STARS.includes(c.star_name));
    const tightConjunctions = conjunctions.filter(c => c.orb <= 1.0);

    let reading = `## Your Fixed Star Reading\n\n`;
    reading += `${firstName}, you have **${conjunctions.length}** fixed star conjunctions in your natal chart. `;

    if (royalConjunctions.length > 0) {
      reading += `Most notably, you carry the influence of ${royalConjunctions.length === 1 ? 'a Royal Star' : `${royalConjunctions.length} Royal Stars`} — `;
      reading += `${royalConjunctions.map(c => `**${c.star_name}** conjunct your ${c.planet}`).join(', ')}. `;
      reading += `Royal Stars mark individuals with extraordinary potential and a sense of destiny. Throughout history, these stars have been associated with kingship, spiritual authority, and world-shaping influence. You carry this energy in your chart.\n\n`;
    } else {
      reading += `While you do not have Royal Star conjunctions, your stellar signature is rich and meaningful.\n\n`;
    }

    // Overall signature
    reading += `### Your Stellar Signature\n\n`;
    if (beneficCount > maleficCount) {
      reading += `${firstName}, your chart carries a **predominantly benefic** stellar signature (${beneficCount} benefic, ${maleficCount} malefic, ${mixedCount} mixed). The stars have gifted you with natural talents, magnetism, and a certain cosmic favor. `;
      reading += `People may feel drawn to you without fully understanding why — the fixed stars in your chart radiate a frequency that others sense on an instinctive level.\n\n`;
    } else if (maleficCount > beneficCount) {
      reading += `${firstName}, your chart carries an **intense** stellar signature (${maleficCount} malefic, ${beneficCount} benefic, ${mixedCount} mixed). This is not a curse — it is a crucible. The stars in your chart demand more from you, but they also forge more from you. `;
      reading += `The greatest leaders, artists, and transformers in history often carried heavy malefic star energy. It is the fire that refines gold.\n\n`;
    } else {
      reading += `${firstName}, your chart carries a **balanced** stellar signature (${beneficCount} benefic, ${maleficCount} malefic, ${mixedCount} mixed). You have access to both the gifts and the intensity of the fixed stars, giving you a complex and layered cosmic identity.\n\n`;
    }

    // Highlight each conjunction
    reading += `### Your Star Conjunctions\n\n`;
    for (const conj of conjunctions) {
      const isRoyal = ROYAL_STARS.includes(conj.star_name);
      const strength = conj.orb <= 0.5 ? 'extremely powerful' : conj.orb <= 1.0 ? 'very strong' : 'notable';
      const planetTheme = PLANET_THEMES[conj.planet] || `the energy of ${conj.planet}`;

      reading += `**${isRoyal ? '★ ' : ''}${conj.star_name}** conjunct **${conj.planet}** (${conj.orb}° orb — ${strength})\n\n`;
      reading += `${conj.meaning}\n\n`;
      reading += `For you specifically, this star activates ${planetTheme}. `;

      if (conj.nature === 'benefic') {
        reading += `This is a gift — ${conj.star_name} amplifies the best qualities of your ${conj.planet}, bringing natural talent and a sense of destiny to this area of your life.\n\n`;
      } else if (conj.nature === 'malefic') {
        reading += `This star adds intensity and challenge to your ${conj.planet}. The pressure it brings forces extraordinary strength — the key is channeling this energy into mastery rather than letting it control you.\n\n`;
      } else {
        reading += `This star brings a complex, double-edged influence. At its best, it delivers exceptional ability. At its most challenging, it creates sudden reversals. Awareness is your greatest tool.\n\n`;
      }
    }

    // Practical guidance
    reading += `### Practical Guidance\n\n`;

    if (tightConjunctions.length > 0) {
      reading += `Your tightest conjunctions (${tightConjunctions.map(c => `${c.star_name}/${c.planet}`).join(', ')}) are where the stellar energy is most potent. `;
      reading += `These are the areas of your life where you feel the influence of the fixed stars most strongly — `;
      reading += `pay special attention to them during important transits.\n\n`;
    }

    reading += `${firstName}, the fixed stars in your chart are ancient — they have been shaping human destiny for thousands of years. `;
    reading += `You carry their energy in your bones, in your instincts, and in the way you move through the world. `;
    reading += `The more you understand this energy, the more consciously you can direct it. `;
    reading += `These stars chose you. Honor what they have given you by living at the level they demand.\n`;

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
                <p className="text-sm font-semibold text-text-primary mb-1">What are Fixed Stars?</p>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Fixed stars are the bright, named stars of the night sky that ancient astrologers observed sitting at specific degrees of the zodiac. When a fixed star closely conjuncts one of your natal planets (within 2 degrees), it infuses that planet with the star's unique mythology, power, and fate. <strong>Royal Stars</strong> (Aldebaran, Regulus, Antares, Fomalhaut) mark individuals with extraordinary destiny. Stars are classified as <strong>benefic</strong> (gifts), <strong>malefic</strong> (intensity/challenge), or <strong>mixed</strong> (double-edged).
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
