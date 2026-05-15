'use client';

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
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
  'Aldebaran': { longitude: 69.9, nature: 'benefic', magnitude: 0.85, meaning: 'The Eye of the Bull. Royal star of the east, Watcher of the Vernal Equinox. Confers integrity, courage, popularity, and honor through eloquence — but tests moral character relentlessly.' },
  'Regulus': { longitude: 150.1, nature: 'benefic', magnitude: 1.35, meaning: 'The Heart of the Lion. Royal star, Watcher of the North. Bestows kingship, authority, and noble ambition — but warns of downfall through arrogance or revenge.' },
  'Antares': { longitude: 249.9, nature: 'malefic', magnitude: 1.09, meaning: 'The Heart of the Scorpion. Royal star, Watcher of the West. Grants obsessive drive, strategic brilliance, and magnetic intensity — but risks self-destruction through excess.' },
  'Fomalhaut': { longitude: 333.9, nature: 'benefic', magnitude: 1.16, meaning: 'The Mouth of the Southern Fish. Royal star, Watcher of the Winter Solstice. Bestows mystical fame, poetic vision, and spiritual idealism — but only through purity of intention.' },

  // Brightest Stars (20)
  'Sirius': { longitude: 104.1, nature: 'benefic', magnitude: -1.46, meaning: 'The Dog Star, brightest in the heavens. Confers brilliance, ambition, devotion, custodianship, and immortal fame. Its rising heralded the Nile floods and the birth of civilizations.' },
  'Canopus': { longitude: 104.9, nature: 'benefic', magnitude: -0.74, meaning: 'The great celestial navigator. Grants far-reaching wisdom, voyages of discovery, and pathfinding genius. Associated with old age, endurance, and the mastery of knowledge.' },
  'Arcturus': { longitude: 204.2, nature: 'benefic', magnitude: -0.05, meaning: 'The Bear Watcher, guardian of the northern sky. Brings prosperity through bold ventures, innovation, and pioneering exploration. Favors travelers and those who forge new paths.' },
  'Vega': { longitude: 285.4, nature: 'benefic', magnitude: 0.03, meaning: 'The Falling Vulture, the Harp Star of Lyra. Bestows artistic brilliance, magnetic charisma, idealism, and exceptional musical or creative talent. Can indicate fleeting fortune.' },
  'Rigel': { longitude: 76.9, nature: 'benefic', magnitude: 0.12, meaning: 'The Left Foot of Orion. Brings wealth, mechanical genius, inventiveness, and enduring public success. Associated with education, benevolence, and the desire to civilize.' },
  'Procyon': { longitude: 115.7, nature: 'mixed', magnitude: 0.34, meaning: 'Before the Dog, the Lesser Dog Star. Grants quick success and sharp wit, but fortune can be brief. Warns of restlessness, jealousy, petulance, and hasty action that leads to regret.' },
  'Betelgeuse': { longitude: 88.8, nature: 'benefic', magnitude: 0.42, meaning: 'The Shoulder of the Giant, Orion\'s martial arm. Confers fame through athletics, war, or bold achievement. Grants great fortune and everlasting renown, but with a combative spirit.' },
  'Capella': { longitude: 81.8, nature: 'benefic', magnitude: 0.08, meaning: 'The She-Goat, the star of Amalthea who nursed Zeus. Bestows curiosity, love of learning, civic honors, and wealth. Favors public life, oratory, and those who nurture others.' },
  'Altair': { longitude: 301.9, nature: 'mixed', magnitude: 0.77, meaning: 'The Flying Eagle of Aquila. Grants boldness, confidence, and sudden ascent to power. Warns of recklessness, danger from reptiles, and a headstrong nature that courts peril.' },
  'Spica': { longitude: 203.9, nature: 'benefic', magnitude: 0.97, meaning: 'The Wheat Sheaf of Virgo, the most benefic fixed star. Brings harvest, abundance, success in science, art, and commerce. Confers brilliance of mind, refinement, and a gift for research.' },
  'Pollux': { longitude: 113.2, nature: 'malefic', magnitude: 1.14, meaning: 'The Immortal Twin, the Boxing Brother. Brings audacity, cruelty, and a spirited nature prone to conflict. Can indicate athletic prowess and courage, but also rash and violent tendencies.' },
  'Achernar': { longitude: 345.3, nature: 'benefic', magnitude: 0.46, meaning: 'The End of the River Eridanus. Grants success in public office, religious or philosophical leadership. Confers royal happiness, a love of knowledge, and an elevated moral character.' },
  'Deneb': { longitude: 320.2, nature: 'benefic', magnitude: 1.25, meaning: 'The Tail of the Swan, Cygnus. Grants an ingenious, artistic mind with a keen ability to study and learn. Associated with subtle intelligence, idealism, and psychic sensitivity.' },
  'Acrux': { longitude: 192.1, nature: 'benefic', magnitude: 0.76, meaning: 'Alpha of the Southern Cross. Confers a deeply spiritual nature, interest in ceremonial magic and occult matters, and a desire for justice. Grants intuitive perception and gravity of character.' },
  'Mimosa': { longitude: 192.8, nature: 'benefic', magnitude: 1.25, meaning: 'Beta of the Southern Cross. Brings inventive genius, a pioneering spirit, and an interest in astrology or the occult. Grants resourcefulness but can incline to superstition.' },
  'Hadar': { longitude: 203.7, nature: 'benefic', magnitude: 0.61, meaning: 'Beta Centauri, the southern pointer. Confers power, position, and a strong connection to group endeavors. Brings honors through association with influential people and institutions.' },
  'Bellatrix': { longitude: 80.9, nature: 'malefic', magnitude: 1.64, meaning: 'The Female Warrior, Orion\'s left shoulder. Grants quick decision-making, military or organizational prowess, and female ambition. Can bring sudden dishonor after great honor.' },
  'Alnilam': { longitude: 83.6, nature: 'benefic', magnitude: 1.69, meaning: 'The String of Pearls, the central star of Orion\'s Belt. Bestows fleeting public honors and a brief fame. Associated with reckless courage and a dashing, impressive presence.' },
  'Castor': { longitude: 110.2, nature: 'mixed', magnitude: 1.58, meaning: 'The Mortal Twin, the Horseman. Grants intellectual brilliance, skill in law or letters, and sudden fame. Can indicate violence, mischief, and a dual nature that vacillates between extremes.' },
  'Polaris': { longitude: 28.3, nature: 'mixed', magnitude: 1.98, meaning: 'The Pole Star, the Nail of the World. Confers spiritual guidance, a sense of destiny, and inner compass. Warns of illness, troubled fortune, and the burden of being a fixed point for others.' },

  // Important Classical Stars (30)
  'Algol': { longitude: 56.2, nature: 'malefic', magnitude: 2.12, meaning: 'The Demon Star, the Head of Medusa. The most malefic fixed star in tradition. Brings violence, misfortune, and beheading — but also immense passionate intensity and the power to petrify enemies.' },
  'Alcyone': { longitude: 60.0, nature: 'mixed', magnitude: 2.87, meaning: 'The central Pleiad, brightest of the Seven Sisters. Grants ambition, mysticism, inner vision, and ruthless achievement. Associated with something to weep about, yet also eminence.' },
  'Hyades': { longitude: 65.7, nature: 'malefic', magnitude: 3.65, meaning: 'The Rain Stars in the face of the Bull. Bring tears, sudden events, and scandals. Associated with lust, greed, and military command, but also with power through storms of life.' },
  'Praesepe': { longitude: 127.3, nature: 'malefic', magnitude: 3.70, meaning: 'The Beehive Cluster, the Manger in Cancer. Brings adventure, wantonness, and brutality. Associated with mass destiny, disease of the eyes, and periods of blindness both literal and metaphorical.' },
  'Vindemiatrix': { longitude: 190.0, nature: 'malefic', magnitude: 2.83, meaning: 'The Grape Gatherer of Virgo. Brings falsity, disgrace, widowhood, and theft. Can also indicate fierce independence, the ability to stand alone, and sharp analytical power.' },
  'Zuben Elgenubi': { longitude: 225.1, nature: 'malefic', magnitude: 2.75, meaning: 'The Southern Claw of the Scorpion (now in Libra). Brings a negative, unforgiving nature, social upheaval, and malevolence — but also the power to overcome systemic darkness and injustice.' },
  'Zuben Eschamali': { longitude: 229.2, nature: 'benefic', magnitude: 2.61, meaning: 'The Northern Claw of the Scorpion (now in Libra). Confers social reform, high ambition, honors, and lasting riches. The most fortunate of the Scales, granting good fortune and distinction.' },
  'Unukalhai': { longitude: 241.8, nature: 'malefic', magnitude: 2.65, meaning: 'The Serpent\'s Neck in Serpens. Brings immorality, accidents, danger of poison, and violence. Associated with perversion, loss, and the danger of one\'s own cunning turning against them.' },
  'Ras Alhague': { longitude: 262.4, nature: 'mixed', magnitude: 2.08, meaning: 'The Head of the Serpent Bearer. Brings healing power, great wisdom, and fame in medicine or the occult — but also perversion, misuse of drugs, and infractions of societal norms.' },
  'Sabik': { longitude: 257.6, nature: 'mixed', magnitude: 2.43, meaning: 'The Second Star of the Serpent Bearer. Grants wastefulness and lost energy, but also moral courage and sincerity. Associated with hidden matters, secret love affairs, and rehabilitation.' },
  'Nunki': { longitude: 282.3, nature: 'benefic', magnitude: 2.02, meaning: 'The Star of the Proclamation of the Sea in Sagittarius. Brings truthfulness, optimism, a love of travel, and religious or philosophical zeal. Confers good judgment and a noble spirit.' },
  'Deneb Algedi': { longitude: 293.4, nature: 'benefic', magnitude: 2.87, meaning: 'The Tail of the Sea-Goat in Capricorn. Brings justice, legal ability, beneficence, and sorrow turned to wisdom. Grants leadership in times of difficulty and mastery through perseverance.' },
  'Sadalmelik': { longitude: 303.4, nature: 'benefic', magnitude: 2.96, meaning: 'The Lucky Star of the King in Aquarius. Brings persecution but ultimate vindication, occult interests, and a connection to large groups or humanitarian movements.' },
  'Sadalsuud': { longitude: 303.2, nature: 'benefic', magnitude: 2.91, meaning: 'The Luckiest of the Lucky in Aquarius. Brings good fortune, artistic ability, occult interests, and domestic happiness. One of the most fortunate stars for personal joy and fulfillment.' },
  'Markab': { longitude: 353.5, nature: 'mixed', magnitude: 2.49, meaning: 'The Saddle of Pegasus. Brings honors, riches, and a love of learning — but warns of danger from fire, fever, and cuts. Associated with intellectual ambition and literary skill.' },
  'Scheat': { longitude: 349.3, nature: 'malefic', magnitude: 2.42, meaning: 'The Leg of Pegasus. Brings extreme misfortune, drowning, suicide, and murder. Can also indicate an original, free-thinking mind with prophetic ability and love of intellectual freedom.' },
  'Alpheratz': { longitude: 14.3, nature: 'benefic', magnitude: 2.06, meaning: 'The Navel of the Horse, connecting Pegasus and Andromeda. Grants riches, honors, independence of spirit, and freedom. Brings harmony, a love of movement, and personal liberty.' },
  'Mirach': { longitude: 30.4, nature: 'benefic', magnitude: 2.05, meaning: 'The Girdle of Andromeda. Brings happiness in marriage, beauty, a love of the arts, and inspired genius. Confers renown through talent, receptivity, and intuitive brilliance.' },
  'Almach': { longitude: 44.2, nature: 'benefic', magnitude: 2.16, meaning: 'The Foot of Andromeda. Brings eminence, artistic talent, popularity, and honors. One of the most fortunate stars, granting success through personal charm and creative gifts.' },
  'Hamal': { longitude: 7.4, nature: 'malefic', magnitude: 2.00, meaning: 'The Head of the Ram in Aries. Brings cruelty, premeditated crime, and a headstrong nature. Also indicates independence, daring leadership, and the courage to pioneer new paths.' },
  'Sheratan': { longitude: 3.9, nature: 'malefic', magnitude: 2.64, meaning: 'The Horn of the Ram. Brings bodily injuries, unscrupulous dealings, and a defeated nature. Can also grant personal determination, sharp wit, and intellectual daring.' },
  'Menkar': { longitude: 44.3, nature: 'malefic', magnitude: 2.53, meaning: 'The Nose of the Whale in Cetus. Brings disease, disgrace, ruin, and injury from beasts. Associated with collective karmic events, mass upheaval, and the surfacing of deep unconscious forces.' },
  'Mira': { longitude: 11.3, nature: 'mixed', magnitude: 3.04, meaning: 'The Wonderful Star in Cetus, a famous variable star. Brings alternating periods of fortune and obscurity. Associated with dramatic life cycles, resurrection themes, and hidden potential that periodically blazes forth.' },
  'Alnath': { longitude: 82.5, nature: 'mixed', magnitude: 1.65, meaning: 'The Tip of the Northern Horn of Taurus. Brings eminence, fortune, and distinction — but also quarrels, banishment, and danger of violent death. Confers assertiveness and military talent.' },
  'Ain': { longitude: 68.9, nature: 'malefic', magnitude: 3.53, meaning: 'The Eye of the Bull, part of the Hyades cluster. Brings a suspicious, obstinate nature and public disgrace. Associated with the evil eye in folklore but also keen perception and steadfast determination.' },
  'Tejat': { longitude: 63.5, nature: 'mixed', magnitude: 2.88, meaning: 'The Foot of the Western Twin in Gemini. Brings pride, overconfidence, and shamelessness, but also strength and the ability to endure hardship. Associated with protective power and vigor.' },
  'Alhena': { longitude: 99.2, nature: 'benefic', magnitude: 1.93, meaning: 'The Proudly Marching One in Gemini. Brings eminence in art, accidents affecting the feet, and a proud bearing. Confers artistic talent, spiritual orientation, and a love of beauty.' },
  'Wasat': { longitude: 108.5, nature: 'malefic', magnitude: 3.53, meaning: 'The Middle of Gemini. Brings violence, malevolence, and destructive tendencies. Associated with chemical or gas-related dangers and toxic environments, but also profound analytical ability.' },
  'Propus': { longitude: 96.5, nature: 'mixed', magnitude: 3.28, meaning: 'The Forward Foot of Gemini. Brings eminence, but with a forceful, sometimes self-sabotaging nature. Associated with intellectual pride and the pursuit of excellence at personal cost.' },

  // Notable Stars (46)
  'Toliman': { longitude: 209.2, nature: 'benefic', magnitude: -0.01, meaning: 'Alpha Centauri, our nearest stellar neighbor. Brings deep relationships with the feminine principle, enduring friendships, and popularity. Confers a learned and beneficent character.' },
  'Acubens': { longitude: 123.4, nature: 'malefic', magnitude: 4.25, meaning: 'The Claw of the Crab in Cancer. Brings activity, malevolence, and lying. Associated with enforced changes of residence, criminal tendencies, but also shrewdness and resilience in adversity.' },
  'Asellus Borealis': { longitude: 127.1, nature: 'mixed', magnitude: 4.66, meaning: 'The Northern Donkey in Cancer. Brings patience, beneficence through caring, and a charitable nature. Associated with responsibility, a love of community, and the courage to bear burdens.' },
  'Asellus Australis': { longitude: 128.7, nature: 'mixed', magnitude: 3.94, meaning: 'The Southern Donkey in Cancer. Brings a connection to public movements, a charitable disposition, and a burning, aggressive quality. Can indicate military preferment and pugnacious courage.' },
  'Dubhe': { longitude: 135.2, nature: 'malefic', magnitude: 1.79, meaning: 'The Bear\'s Back in Ursa Major. Brings arrogance, psychic power, destruction, and a suspicious nature. Associated with astrology, divination, and a deep attunement to hidden influences.' },
  'Merak': { longitude: 139.5, nature: 'mixed', magnitude: 2.37, meaning: 'The Loins of the Great Bear. Brings command, prudence, and a love of power. Associated with leadership through patience, strategic thinking, and a steady, commanding presence.' },
  'Phecda': { longitude: 140.3, nature: 'malefic', magnitude: 2.44, meaning: 'The Thigh of the Great Bear. Brings a passionate and power-seeking nature. Associated with ruthless ambition, but also deep investigative ability and the drive to uncover hidden truth.' },
  'Megrez': { longitude: 141.3, nature: 'mixed', magnitude: 3.31, meaning: 'The Root of the Bear\'s Tail. Brings cautious, careful energy with an emphasis on precision. Associated with intellectual discernment, quiet authority, and the ability to hold things together.' },
  'Alioth': { longitude: 148.9, nature: 'malefic', magnitude: 1.77, meaning: 'The Tail of the Great Bear. Brings danger, trouble, and destructive tendencies in institutional settings. Associated with mass events, collective suffering, and the power to influence group dynamics.' },
  'Mizar': { longitude: 150.7, nature: 'mixed', magnitude: 2.27, meaning: 'The Girdle of the Great Bear, paired with Alcor. Brings danger from fires, a fiery and martial temperament, and magnetic attraction. Associated with electrifying charisma and intense focus.' },
  'Alkaid': { longitude: 156.9, nature: 'malefic', magnitude: 1.86, meaning: 'The Chief of the Mourners, tip of the Bear\'s Tail. Brings danger of death and destruction. Associated with the mourning process, endings, and the transformative power of grief and loss.' },
  'Cor Caroli': { longitude: 184.5, nature: 'benefic', magnitude: 2.89, meaning: 'The Heart of Charles in Canes Venatici. Brings love of dogs, hunting, and a noble, refined nature. Associated with loyalty, chivalry, and devotion to a worthy cause or leader.' },
  'Denebola': { longitude: 171.5, nature: 'malefic', magnitude: 2.14, meaning: 'The Tail of the Lion. Brings misfortune, disgrace, regret, and public dishonor. Also grants swift judgment, noble ideals, and courage — but warns of taking fortune for granted.' },
  'Algorab': { longitude: 177.8, nature: 'malefic', magnitude: 2.95, meaning: 'The Crow\'s Wing in Corvus. Brings scavenging, destructiveness, malevolence, and repulsiveness. Associated with charlatanism and delay — but also keen resourcefulness and a dark, penetrating wit.' },
  'Gienah': { longitude: 180.4, nature: 'mixed', magnitude: 2.59, meaning: 'The Wing of the Crow. Brings a deceitful, lying nature with a sharp tongue. Also grants agility, adaptability, and the ability to thrive in unstable situations through quick thinking.' },
  'Khambalia': { longitude: 197.1, nature: 'mixed', magnitude: 4.66, meaning: 'The Crooked-Clawed in Virgo. Brings changeability, an unreliable temperament, and deep occult interests. Associated with shifts of fortune, adaptability, and an unconventional life path.' },
  'Foramen': { longitude: 202.1, nature: 'mixed', magnitude: 1.86, meaning: 'Eta Carinae, the volatile star in the Ship\'s Keel. Brings peril at sea, shipwreck, and drowning — but also immense creative power, leadership in crisis, and navigational genius.' },
  'Alphecca': { longitude: 222.1, nature: 'benefic', magnitude: 2.23, meaning: 'The Pearl of the Northern Crown. Brings artistic ability, poetic and creative gifts, and quiet dignity. Confers healing power, love of beauty, and success through refinement and grace.' },
  'Kornephoros': { longitude: 236.2, nature: 'mixed', magnitude: 2.77, meaning: 'The Club Bearer in Hercules. Brings strength, cunning, and a fixed determination. Associated with brute force applied intelligently, a love of combat, and the willingness to endure great labor.' },
  'Yed Prior': { longitude: 243.5, nature: 'malefic', magnitude: 2.74, meaning: 'The Hand of Ophiuchus. Brings immorality, shamelessness, and revolutionary tendencies. Associated with handling dangerous substances, poisons, and medicines — a healer\'s burden and power.' },
  'Han': { longitude: 249.1, nature: 'mixed', magnitude: 2.54, meaning: 'The Knee of the Serpent Bearer. Brings a nature inclined toward extremes, with deep interest in forbidden knowledge. Associated with transformation through crisis and the courage to face darkness.' },
  'Graffias': { longitude: 243.1, nature: 'malefic', magnitude: 2.62, meaning: 'The Crab-like Claw of Scorpius. Brings a malicious, merciless nature, material loss, and reckless character. Associated with the sting of betrayal and the power of ruthless self-defense.' },
  'Dschubba': { longitude: 242.5, nature: 'malefic', magnitude: 2.32, meaning: 'The Forehead of the Scorpion. Brings sudden assaults, malevolence, and immorality. Associated with the power to strike first, strategic ruthlessness, and a penetrating, x-ray perception.' },
  'Shaula': { longitude: 264.6, nature: 'mixed', magnitude: 1.63, meaning: 'The Sting of the Scorpion. Brings danger, desperation, and a keen perception of danger. Associated with animal instinct, the power of final defense, and catalytic events that change everything.' },
  'Sargas': { longitude: 265.6, nature: 'mixed', magnitude: 1.87, meaning: 'Theta Scorpii near the Sting. Brings a penetrating, perceptive nature. Associated with the ability to see through deception, and with writing or speaking that cuts to the bone of truth.' },
  'Kaus Borealis': { longitude: 276.1, nature: 'benefic', magnitude: 2.81, meaning: 'The Northern Bow of the Archer. Brings an idealistic, humane, and generous nature. Confers a love of travel, horses, and adventure. Associated with promotion, honors, and broad vision.' },
  'Kaus Media': { longitude: 274.6, nature: 'benefic', magnitude: 2.70, meaning: 'The Middle Bow of the Archer. Brings a philosophical, prophetic mind with a love of travel and the outdoors. Associated with leadership, mental acuity, and a commanding social presence.' },
  'Kaus Australis': { longitude: 275.0, nature: 'benefic', magnitude: 1.85, meaning: 'The Southern Bow of the Archer. Brings a promoter\'s energy, leadership ability, and keen mental alertness. Associated with idealism in action, the ability to inspire others, and public success.' },
  'Facies': { longitude: 278.4, nature: 'malefic', magnitude: 5.90, meaning: 'The Face of the Archer, a nebula. One of the most difficult degrees. Brings blindness, broken sight, sickness, and accidents. Associated with the warrior\'s gaze — a piercing focus that can be self-destructive.' },
  'Pelagus': { longitude: 282.3, nature: 'benefic', magnitude: 3.17, meaning: 'The Open Sea in Sagittarius. Brings optimism, a love of truth, and a penetrating mental faculty. Associated with voyages, philosophy, and an expansive worldview that seeks distant horizons.' },
  'Rukbat': { longitude: 283.9, nature: 'benefic', magnitude: 3.97, meaning: 'The Knee of the Archer. Brings steadiness, a grounded nature, and quiet determination. Associated with endurance, trustworthiness, and the strength found in a stable foundation.' },
  'Nashira': { longitude: 291.9, nature: 'benefic', magnitude: 3.69, meaning: 'The Fortunate One in Capricorn. Brings success in writing, government, and intellectual pursuits. Confers overcoming of evil, integrity, and the ability to bring order out of chaos.' },
  'Armus': { longitude: 292.4, nature: 'mixed', magnitude: 4.11, meaning: 'The Shoulder of the Sea-Goat. Brings a disagreeable, contemptible nature if afflicted, but also tenacity and grit. Associated with the ability to shoulder heavy burdens with stoic determination.' },
  'Dorsum': { longitude: 293.6, nature: 'mixed', magnitude: 4.07, meaning: 'The Back of the Sea-Goat. Brings a connection to hard labor, endurance, and thankless work. Associated with the virtue of perseverance and the rewards that come only through sustained effort.' },
  'Sham': { longitude: 301.2, nature: 'mixed', magnitude: 4.37, meaning: 'Alpha of the Arrow, Sagitta. Brings danger from weapons, sharp instruments, and sudden violence. Associated with focused aim, precision of purpose, and the power of a well-directed will.' },
  'Tarazed': { longitude: 301.1, nature: 'mixed', magnitude: 2.72, meaning: 'The Beam of the Scale in Aquila. Brings a bold, confident, valiant nature with a love of command. Associated with scandalous behavior, mystery, and the daring to live beyond convention.' },
  'Peacock': { longitude: 323.5, nature: 'mixed', magnitude: 1.94, meaning: 'Alpha Pavonis, the Peacock Star. Brings vanity, pride, and a love of display — but also genuine beauty, talent, and a magnetic personality. Associated with fame through spectacle and self-expression.' },
  'Alnair': { longitude: 325.9, nature: 'benefic', magnitude: 1.74, meaning: 'The Bright One of the Southern Fish in Grus. Brings a keen, active mind, good reputation, and success in legal or literary pursuits. Confers mental alertness and cultural refinement.' },
  'Ankaa': { longitude: 345.5, nature: 'mixed', magnitude: 2.39, meaning: 'Alpha of the Phoenix. Brings transformation through destruction, the ability to rise from ashes, and regenerative power. Associated with karmic turning points and rebirth after loss.' },
  'Baten Kaitos': { longitude: 352.1, nature: 'malefic', magnitude: 3.74, meaning: 'The Belly of the Whale in Cetus. Brings enforced migration, isolation, and shipwreck. Associated with Jonah\'s whale — the descent into the belly of the unconscious before spiritual rebirth.' },
  'Azha': { longitude: 339.0, nature: 'mixed', magnitude: 3.89, meaning: 'The Breeding Place in Eridanus. Brings a contemplative nature and retirement from the world. Associated with incubation periods, gestation of ideas, and the quiet development of inner resources.' },
  'Acamar': { longitude: 343.4, nature: 'benefic', magnitude: 2.88, meaning: 'Theta Eridani, the former end of the River before Achernar. Brings success in public office, ecclesiastical preferment, and a refined moral character. Confers happiness and philosophical depth.' },
  'Phact': { longitude: 104.0, nature: 'benefic', magnitude: 2.64, meaning: 'Alpha of the Dove, Columba. Brings a gentle, peace-loving nature with artistic talent. Associated with messages, communication, hope after the flood, and the olive branch of reconciliation.' },
  'Wezen': { longitude: 109.4, nature: 'mixed', magnitude: 1.84, meaning: 'Delta of the Great Dog, Canis Major. Brings a faithful, devoted nature but with a tendency toward melancholy. Associated with the weight of responsibility and the lonely dignity of loyal service.' },
  'Pleiades': { longitude: 60.1, nature: 'mixed', magnitude: 1.60, meaning: 'The Seven Sisters cluster in Taurus. Brings something to weep about — bereavement, exile, or loss — yet also mystical vision, keen sensitivity, and the stirring of collective memory and longing.' },
  'Agena': { longitude: 203.7, nature: 'benefic', magnitude: 0.61, meaning: 'Beta Centauri (also Hadar), the southern pointer star. Confers position, power, and a refined intellect. Brings success through partnerships, institutional authority, and quiet but formidable influence.' },
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
