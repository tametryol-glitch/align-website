'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { api, buildBirthData } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import Link from 'next/link';
import { ArrowLeft, Star, ChevronDown, ChevronUp, Copy, Sparkles, Loader2, Info, Search } from 'lucide-react';
import { InlineBold } from '@/components/ui/InlineBold';
import { BirthDataPrompt } from '@/components/ui/BirthDataPrompt';
import { PaywallGate } from '@/components/ui/PaywallGate';
import { getZodiacGlyph } from '@/lib/utils';

const SIGNS = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];

interface ArabicPart {
  name: string;
  sign: string;
  degree: number;
  house: number;
  longitude: number;
  formula: string;
  meaning: string;
}

// Arabic Parts formulas matching AstroEinstein desktop exactly
// [name, ref, body1, body2, nightReverse, formula_desc, meaning]
const ARABIC_PARTS_FORMULAS: Array<[string, string, string, string, boolean, string, string]> = [
  ['Part of Fortune',    'Ascendant', 'Moon',    'Sun',     true,  'ASC + Moon - Sun (day) / ASC + Sun - Moon (night)', 'Material prosperity, worldly success, and where joy flows naturally'],
  ['Part of Spirit',     'Ascendant', 'Sun',     'Moon',    true,  'ASC + Sun - Moon (day) / ASC + Moon - Sun (night)', 'Spiritual purpose, conscious intention, and soul direction'],
  ['Part of Eros (Love)','Ascendant', 'Venus',   'Sun',     true,  'ASC + Venus - Sun', 'Romantic attraction, love style, and what draws love to you'],
  ['Part of Necessity',  'Ascendant', 'Mercury', 'Moon',    true,  'ASC + Mercury - Moon', 'Obligations, necessities, and what must be done'],
  ['Part of Courage',    'Ascendant', 'Mars',    'Moon',    true,  'ASC + Mars - Moon', 'Bravery, willpower, and fighting spirit'],
  ['Part of Victory',    'Ascendant', 'Jupiter', 'Moon',    true,  'ASC + Jupiter - Moon', 'Success, triumph, and overcoming obstacles'],
  ['Part of Nemesis',    'Ascendant', 'Saturn',  'Moon',    true,  'ASC + Saturn - Moon', 'Karmic reckoning, hidden enemies, and the undoing'],
  ['Part of Marriage (F)','Ascendant','Saturn',  'Venus',   false, 'ASC + Saturn - Venus', 'Marriage timing and commitment (feminine)'],
  ['Part of Marriage (M)','Ascendant','Venus',   'Saturn',  false, 'ASC + Venus - Saturn', 'Marriage timing and commitment (masculine)'],
  ['Part of Children',   'Ascendant', 'Jupiter', 'Saturn',  false, 'ASC + Jupiter - Saturn', 'Fertility, children, and creative offspring'],
  ['Part of Father',     'Ascendant', 'Sun',     'Saturn',  false, 'ASC + Sun - Saturn', 'Relationship with father and paternal influence'],
  ['Part of Mother',     'Ascendant', 'Moon',    'Venus',   false, 'ASC + Moon - Venus', 'Relationship with mother and maternal influence'],
  ['Part of Siblings',   'Ascendant', 'Saturn',  'Jupiter', false, 'ASC + Saturn - Jupiter', 'Siblings and family bonds'],
  ['Part of Friends',    'Ascendant', 'Moon',    'Mercury', false, 'ASC + Moon - Mercury', 'Friendships, social networks, and allies'],
  ['Part of Career',     'Ascendant', 'Saturn',  'Sun',     false, 'ASC + Saturn - Sun', 'Career direction and professional calling'],
  ['Part of Commerce',   'Ascendant', 'Mercury', 'Sun',     false, 'ASC + Mercury - Sun', 'Business acumen, trade, and commercial success'],
  ['Part of Death',      'Ascendant', 'Saturn',  'Moon',    true,  'ASC + Saturn - Moon', 'Transformation, endings, and life transitions'],
  ['Part of Illness',    'Ascendant', 'Saturn',  'Mars',    false, 'ASC + Saturn - Mars', 'Health vulnerabilities and illness patterns'],
  ['Part of Passion',    'Ascendant', 'Mars',    'Sun',     false, 'ASC + Mars - Sun', 'Sexual desire, passion, and raw drive'],
  ['Part of Desire',     'Ascendant', 'Venus',   'Mars',    false, 'ASC + Venus - Mars', 'Deep desires and what you crave'],
  ['Part of Faith',      'Ascendant', 'Moon',    'Mercury', true,  'ASC + Moon - Mercury', 'Spiritual beliefs, faith, and devotion'],
  ['Part of Intelligence','Ascendant','Mercury', 'Moon',    false, 'ASC + Mercury - Moon', 'Mental acuity and intellectual gifts'],
  ['Part of Honor',      'Ascendant', 'Sun',     'Jupiter', false, 'ASC + Sun - Jupiter', 'Public honor, respect, and recognition'],
  ['Part of Increase',   'Ascendant', 'Jupiter', 'Sun',     false, 'ASC + Jupiter - Sun', 'Abundance, growth, and expansion'],
  ['Part of Travel',     'Ascendant', 'Saturn',  'Mercury', false, 'ASC + Saturn - Mercury', 'Long-distance travel and foreign connections'],
  ['Part of Catastrophe','Ascendant', 'Saturn',  'Sun',     true,  'ASC + Saturn - Sun', 'Crisis points and major life disruptions'],
  ['Part of Inheritance','Ascendant', 'Saturn',  'Moon',    false, 'ASC + Saturn - Moon', 'Inherited wealth, legacy, and family resources'],
  ['Part of Mastery',    'Ascendant', 'Mars',    'Saturn',  false, 'ASC + Mars - Saturn', 'Skill mastery, discipline, and craft'],
  ['Part of Attraction', 'Ascendant', 'Venus',   'Moon',    false, 'ASC + Venus - Moon', 'What attracts others to you'],
  ['Part of Sexuality',  'Ascendant', 'Venus',   'Sun',     false, 'ASC + Venus - Sun', 'Sexual magnetism and erotic nature'],
];

const KEY_PARTS = ['Part of Fortune', 'Part of Spirit', 'Part of Eros (Love)', 'Part of Marriage (F)', 'Part of Marriage (M)'];

// ─── Complete Arabic Part Interpretations (all 29 parts) ────────────────────

const PART_MEANINGS: Record<string, { general: string; inSign: Record<string, string>; inHouse: Record<number, string> }> = {
  'Part of Fortune': {
    general: 'Your natural prosperity point — where joy, abundance, and material success flow to you most naturally. This is the area of life where the universe wants to reward you.',
    inSign: {
      Aries: 'Fortune comes through bold initiative, pioneering action, and being first. You prosper when you lead, compete, and take decisive action without waiting for permission.',
      Taurus: 'Fortune comes through patience, tangible assets, and building lasting value. You prosper when you invest in quality, develop your senses, and create beautiful, enduring things.',
      Gemini: 'Fortune comes through communication, versatility, and intellectual connections. You prosper when you write, teach, network, and keep multiple channels of income flowing.',
      Cancer: 'Fortune comes through nurturing, emotional intelligence, and creating safety for others. You prosper through real estate, food, family business, and caring professions.',
      Leo: 'Fortune comes through creative self-expression, leadership, and being seen. You prosper when you perform, entertain, inspire, and put your heart into your work.',
      Virgo: 'Fortune comes through service, precision, and practical expertise. You prosper when you analyze, organize, heal, and make systems work better than anyone else.',
      Libra: 'Fortune comes through partnerships, diplomacy, and creating beauty. You prosper through collaboration, art, law, mediation, and making others feel valued.',
      Scorpio: 'Fortune comes through transformation, deep research, and managing shared resources. You prosper through investment, psychology, crisis management, and uncovering hidden value.',
      Sagittarius: 'Fortune comes through expansion, travel, teaching, and philosophical vision. You prosper when you explore new territories, publish ideas, and inspire others with your optimism.',
      Capricorn: 'Fortune comes through discipline, structure, and long-term strategy. You prosper through career building, management, institutional power, and patient ambition.',
      Aquarius: 'Fortune comes through innovation, community, and humanitarian vision. You prosper through technology, group efforts, social movements, and unconventional approaches.',
      Pisces: 'Fortune comes through intuition, compassion, and spiritual connection. You prosper through healing arts, creative expression, empathic service, and trusting the invisible.',
    },
    inHouse: {
      1: 'Fortune flows through self-expression and personal initiative. Your presence itself attracts prosperity. Be visible.',
      2: 'Fortune flows through your own earnings, possessions, and financial skills. You are meant to build wealth directly.',
      3: 'Fortune flows through communication, siblings, local connections, and learning. Words are your currency.',
      4: 'Fortune flows through home, family, real estate, and emotional roots. Your foundation is where wealth grows.',
      5: 'Fortune flows through creativity, romance, children, and speculative ventures. Joy is your business plan.',
      6: 'Fortune flows through service, health, and daily work. The more you serve, the more abundance returns to you.',
      7: 'Fortune flows through partnerships and one-on-one relationships. Your greatest prosperity comes with and through others.',
      8: 'Fortune flows through shared resources, transformation, and other people\'s money. Depth creates wealth.',
      9: 'Fortune flows through higher education, travel, publishing, and philosophical pursuits. Think big, go far.',
      10: 'Fortune flows through career, public reputation, and professional achievement. Your calling is your prosperity.',
      11: 'Fortune flows through networks, communities, and future-oriented projects. Your friends and groups are your wealth.',
      12: 'Fortune flows through spiritual practice, solitude, and behind-the-scenes work. Hidden sources sustain you.',
    },
  },
  'Part of Spirit': {
    general: 'Your soul\'s conscious direction — where you find spiritual purpose and intentional growth. This is the area where your higher self guides you.',
    inSign: {
      Aries: 'Your spirit is activated through courageous action and independent initiative. You grow when you lead with authenticity.',
      Taurus: 'Your spirit is activated through grounding in nature, sensory experience, and cultivating peace. Stillness is your spiritual practice.',
      Gemini: 'Your spirit is activated through learning, communicating truth, and connecting diverse ideas. Teaching is your spiritual act.',
      Cancer: 'Your spirit is activated through emotional depth, nurturing others, and honoring your roots. Compassion is your meditation.',
      Leo: 'Your spirit is activated through creative expression and generous self-giving. Creating from the heart is your prayer.',
      Virgo: 'Your spirit is activated through sacred service, attention to detail, and devotion to craft. Perfecting your work is worship.',
      Libra: 'Your spirit is activated through relationship harmony, justice, and beauty. Creating balance in the world is your calling.',
      Scorpio: 'Your spirit is activated through transformation, depth, and fearless truth-seeking. Rebirth is your spiritual rhythm.',
      Sagittarius: 'Your spirit is activated through philosophical exploration, faith, and expanded consciousness. Seeking truth is your path.',
      Capricorn: 'Your spirit is activated through mastery, discipline, and building lasting structures. Your legacy is your spiritual act.',
      Aquarius: 'Your spirit is activated through liberation, innovation, and service to humanity. Freedom for all is your vision.',
      Pisces: 'Your spirit is activated through mystical experience, surrender, and universal compassion. Dissolving ego is your transcendence.',
    },
    inHouse: {
      1: 'Your spiritual purpose radiates through your identity. You are meant to embody your beliefs visibly.',
      2: 'Your spiritual purpose connects to values and resources. Align your finances with your soul\'s mission.',
      3: 'Your spiritual purpose flows through communication and learning. Spread wisdom through words.',
      4: 'Your spiritual purpose is rooted in home and ancestry. Heal the family line.',
      5: 'Your spiritual purpose expresses through creativity and joy. Create what your soul demands.',
      6: 'Your spiritual purpose is fulfilled through daily service. Sacred ritual is in your routine.',
      7: 'Your spiritual purpose is realized through partnership. Others are your teachers and mirrors.',
      8: 'Your spiritual purpose involves deep transformation. Die to the old self, again and again.',
      9: 'Your spiritual purpose is found through expansion and truth-seeking. The journey is the teaching.',
      10: 'Your spiritual purpose is your public calling. Lead by example from the mountaintop.',
      11: 'Your spiritual purpose serves the collective. Your vision uplifts communities.',
      12: 'Your spiritual purpose lives in the invisible world. Meditation, dreams, and solitude are your temple.',
    },
  },
  'Part of Eros (Love)': {
    general: 'Your love attraction point — how you draw romantic love to you and what sparks your deepest passion.',
    inSign: {
      Aries: 'Love ignites through passion, pursuit, and bold romantic gestures. You attract love by being fearlessly yourself.',
      Taurus: 'Love grows through sensuality, loyalty, and physical affection. You attract love through steadfast devotion and earthy beauty.',
      Gemini: 'Love sparks through intellectual connection and witty conversation. You attract love through your mind and verbal charm.',
      Cancer: 'Love deepens through emotional vulnerability and nurturing. You attract love by creating emotional safety.',
      Leo: 'Love blazes through dramatic gestures, creative expression, and heartfelt generosity. You attract love by shining brightly.',
      Virgo: 'Love manifests through devoted acts of service and thoughtful attention. You attract love through competence and care.',
      Libra: 'Love blossoms through beauty, romance, and harmonious partnership. You attract love through grace and reciprocity.',
      Scorpio: 'Love transforms through intensity, depth, and soul-merging. You attract love through magnetic power and emotional courage.',
      Sagittarius: 'Love adventures through freedom, exploration, and shared philosophy. You attract love through optimism and vision.',
      Capricorn: 'Love endures through commitment, ambition, and building together. You attract love through maturity and reliability.',
      Aquarius: 'Love liberates through friendship, individuality, and shared ideals. You attract love through authenticity and independence.',
      Pisces: 'Love transcends through spiritual connection, sacrifice, and unconditional acceptance. You attract love through compassion and imagination.',
    },
    inHouse: {
      1: 'Love radiates from your very being. Your presence is magnetic and romantic attraction is personal and direct.',
      2: 'Love connects to your values and self-worth. You attract love when you know your value.',
      3: 'Love sparks through communication and local connections. Conversations lead to romance.',
      4: 'Love roots in home and emotional security. Domestic life is where romance flourishes.',
      5: 'Love thrives in the spotlight. Romance, dating, and creative expression are your love languages.',
      6: 'Love grows through shared daily life. Working together builds romantic connection.',
      7: 'Love is the central theme of your partnerships. You are designed for deep one-on-one love.',
      8: 'Love transforms through intimacy, shared vulnerability, and deep bonding. Soul-level connections.',
      9: 'Love expands through travel, learning, and philosophical alignment. Shared beliefs bond you.',
      10: 'Love connects to your public life and career. Power couples and professional partnerships attract you.',
      11: 'Love forms through friendship circles and shared causes. Friends become lovers.',
      12: 'Love is mystical and transcendent. Secret romances, spiritual unions, and past-life connections.',
    },
  },
  'Part of Necessity': {
    general: 'What you must do — the obligations and requirements that your life demands.',
    inSign: { Aries: 'You must act, lead, and pioneer.', Taurus: 'You must build, stabilize, and persist.', Gemini: 'You must learn, communicate, and adapt.', Cancer: 'You must nurture, protect, and feel.', Leo: 'You must create, shine, and inspire.', Virgo: 'You must serve, analyze, and perfect.', Libra: 'You must balance, relate, and harmonize.', Scorpio: 'You must transform, investigate, and empower.', Sagittarius: 'You must explore, teach, and expand.', Capricorn: 'You must structure, achieve, and endure.', Aquarius: 'You must innovate, liberate, and envision.', Pisces: 'You must surrender, imagine, and heal.' },
    inHouse: { 1: 'Obligations center on self-development.', 2: 'Obligations center on finances and values.', 3: 'Obligations center on communication.', 4: 'Obligations center on home and family.', 5: 'Obligations center on creativity and children.', 6: 'Obligations center on health and service.', 7: 'Obligations center on partnerships.', 8: 'Obligations center on shared resources.', 9: 'Obligations center on education and beliefs.', 10: 'Obligations center on career and reputation.', 11: 'Obligations center on community and ideals.', 12: 'Obligations center on spiritual growth.' },
  },
  'Part of Courage': {
    general: 'Your source of bravery and willpower — where you find the fighting spirit to overcome obstacles.',
    inSign: { Aries: 'Courage through direct confrontation and physical bravery.', Taurus: 'Courage through stubborn determination and endurance.', Gemini: 'Courage through intellectual boldness and verbal assertiveness.', Cancer: 'Courage through emotional bravery and protective instinct.', Leo: 'Courage through heart-centered confidence and dramatic stand.', Virgo: 'Courage through methodical preparation and analytical precision.', Libra: 'Courage through diplomatic assertion and standing for fairness.', Scorpio: 'Courage through psychological fearlessness and intensity.', Sagittarius: 'Courage through philosophical conviction and bold optimism.', Capricorn: 'Courage through disciplined resolve and strategic patience.', Aquarius: 'Courage through radical independence and defying convention.', Pisces: 'Courage through compassionate sacrifice and spiritual faith.' },
    inHouse: { 1: 'Courage in self-assertion.', 2: 'Courage in financial risk.', 3: 'Courage in speaking truth.', 4: 'Courage in family matters.', 5: 'Courage in creative expression.', 6: 'Courage in daily challenges.', 7: 'Courage in relationships.', 8: 'Courage in transformation.', 9: 'Courage in exploration.', 10: 'Courage in career pursuit.', 11: 'Courage in social causes.', 12: 'Courage in spiritual surrender.' },
  },
  'Part of Victory': {
    general: 'Where you triumph — the area of life where you can overcome obstacles and achieve lasting success.',
    inSign: { Aries: 'Victory through bold initiative.', Taurus: 'Victory through patient building.', Gemini: 'Victory through clever communication.', Cancer: 'Victory through emotional strategy.', Leo: 'Victory through confident self-expression.', Virgo: 'Victory through meticulous preparation.', Libra: 'Victory through strategic alliances.', Scorpio: 'Victory through relentless transformation.', Sagittarius: 'Victory through expansive vision.', Capricorn: 'Victory through disciplined effort.', Aquarius: 'Victory through innovative disruption.', Pisces: 'Victory through compassion and surrender.' },
    inHouse: { 1: 'Victory in personal identity battles.', 2: 'Victory in financial endeavors.', 3: 'Victory in communication and learning.', 4: 'Victory in family and property matters.', 5: 'Victory in creative and romantic pursuits.', 6: 'Victory in health and work challenges.', 7: 'Victory in partnerships and legal matters.', 8: 'Victory in shared resources and crisis.', 9: 'Victory in education and travel.', 10: 'Victory in career achievements.', 11: 'Victory in community and group leadership.', 12: 'Victory in spiritual and hidden matters.' },
  },
  'Part of Nemesis': {
    general: 'Your karmic reckoning point — where hidden enemies, self-undoing patterns, and consequences manifest.',
    inSign: { Aries: 'Nemesis through impulsive action and anger.', Taurus: 'Nemesis through stubbornness and greed.', Gemini: 'Nemesis through deception and scattered energy.', Cancer: 'Nemesis through emotional manipulation and clinging.', Leo: 'Nemesis through arrogance and ego.', Virgo: 'Nemesis through perfectionism and harsh criticism.', Libra: 'Nemesis through indecision and people-pleasing.', Scorpio: 'Nemesis through obsession and power games.', Sagittarius: 'Nemesis through recklessness and dogmatism.', Capricorn: 'Nemesis through coldness and excessive ambition.', Aquarius: 'Nemesis through detachment and rebellion.', Pisces: 'Nemesis through escapism and martyrdom.' },
    inHouse: { 1: 'Nemesis in self-identity.', 2: 'Nemesis in finances.', 3: 'Nemesis in communication.', 4: 'Nemesis in family.', 5: 'Nemesis in love and creativity.', 6: 'Nemesis in health and work.', 7: 'Nemesis in partnerships.', 8: 'Nemesis in shared power.', 9: 'Nemesis in beliefs.', 10: 'Nemesis in career.', 11: 'Nemesis in community.', 12: 'Nemesis in spiritual life.' },
  },
  'Part of Marriage (F)': {
    general: 'Marriage timing and commitment energy in the feminine expression.',
    inSign: { Aries: 'Marriage energy is passionate and spontaneous.', Taurus: 'Marriage energy is stable and sensual.', Gemini: 'Marriage energy is communicative and versatile.', Cancer: 'Marriage energy is nurturing and family-oriented.', Leo: 'Marriage energy is dramatic and generous.', Virgo: 'Marriage energy is practical and devoted.', Libra: 'Marriage energy is harmonious and balanced.', Scorpio: 'Marriage energy is intense and transformative.', Sagittarius: 'Marriage energy is adventurous and free.', Capricorn: 'Marriage energy is traditional and enduring.', Aquarius: 'Marriage energy is unconventional and friend-based.', Pisces: 'Marriage energy is romantic and spiritual.' },
    inHouse: { 1: 'Marriage shapes your identity.', 2: 'Marriage connects to shared finances.', 3: 'Marriage grows through communication.', 4: 'Marriage is central to home life.', 5: 'Marriage is romantic and creative.', 6: 'Marriage involves daily devotion.', 7: 'Marriage is the defining relationship.', 8: 'Marriage transforms deeply.', 9: 'Marriage expands your world.', 10: 'Marriage is publicly significant.', 11: 'Marriage connects to social circles.', 12: 'Marriage has a spiritual dimension.' },
  },
  'Part of Marriage (M)': {
    general: 'Marriage timing and commitment energy in the masculine expression.',
    inSign: { Aries: 'Marriage energy is assertive and pioneering.', Taurus: 'Marriage energy is loyal and grounded.', Gemini: 'Marriage energy is intellectual and curious.', Cancer: 'Marriage energy is protective and emotional.', Leo: 'Marriage energy is warm and expressive.', Virgo: 'Marriage energy is helpful and detailed.', Libra: 'Marriage energy is graceful and cooperative.', Scorpio: 'Marriage energy is deep and possessive.', Sagittarius: 'Marriage energy is independent and growth-oriented.', Capricorn: 'Marriage energy is committed and ambitious.', Aquarius: 'Marriage energy is progressive and friendship-based.', Pisces: 'Marriage energy is compassionate and dreamy.' },
    inHouse: { 1: 'Marriage defines your self-image.', 2: 'Marriage relates to shared values.', 3: 'Marriage thrives on dialogue.', 4: 'Marriage is rooted in home.', 5: 'Marriage is joyful and playful.', 6: 'Marriage requires daily effort.', 7: 'Marriage is your life partnership.', 8: 'Marriage involves deep merging.', 9: 'Marriage brings expansion.', 10: 'Marriage has public visibility.', 11: 'Marriage is community-integrated.', 12: 'Marriage has karmic significance.' },
  },
  'Part of Children': {
    general: 'Fertility, children, and creative offspring — both literal children and the creative works you birth into the world.',
    inSign: { Aries: 'Creative offspring through bold initiative.', Taurus: 'Creative offspring through patient cultivation.', Gemini: 'Creative offspring through ideas and communication.', Cancer: 'Creative offspring through nurturing care.', Leo: 'Creative offspring through joyful expression.', Virgo: 'Creative offspring through careful craft.', Libra: 'Creative offspring through collaboration.', Scorpio: 'Creative offspring through transformation.', Sagittarius: 'Creative offspring through vision and teaching.', Capricorn: 'Creative offspring through structure and discipline.', Aquarius: 'Creative offspring through innovation.', Pisces: 'Creative offspring through imagination and spirit.' },
    inHouse: { 1: 'Children/creation shape your identity.', 2: 'Children/creation connect to finances.', 3: 'Children/creation involve learning.', 4: 'Children/creation are central to home.', 5: 'Children/creation are your natural domain.', 6: 'Children/creation relate to daily service.', 7: 'Children/creation come through partnership.', 8: 'Children/creation involve transformation.', 9: 'Children/creation expand your horizons.', 10: 'Children/creation affect your career.', 11: 'Children/creation connect to community.', 12: 'Children/creation have spiritual significance.' },
  },
  'Part of Father': {
    general: 'Your relationship with fatherhood and paternal influence.',
    inSign: { Aries: 'Father energy is assertive and pioneering.', Taurus: 'Father energy is stable and providing.', Gemini: 'Father energy is communicative and intellectual.', Cancer: 'Father energy is nurturing and protective.', Leo: 'Father energy is proud and generous.', Virgo: 'Father energy is practical and devoted.', Libra: 'Father energy is diplomatic and fair.', Scorpio: 'Father energy is intense and transformative.', Sagittarius: 'Father energy is philosophical and adventurous.', Capricorn: 'Father energy is traditional and disciplined.', Aquarius: 'Father energy is unconventional and progressive.', Pisces: 'Father energy is compassionate and spiritual.' },
    inHouse: { 1: 'Father shapes your identity.', 2: 'Father influences your values.', 3: 'Father affects your communication.', 4: 'Father defines your roots.', 5: 'Father influences creativity.', 6: 'Father shapes work ethic.', 7: 'Father models partnership.', 8: 'Father involves transformation.', 9: 'Father expands beliefs.', 10: 'Father influences career.', 11: 'Father affects social life.', 12: 'Father has spiritual dimension.' },
  },
  'Part of Mother': {
    general: 'Your relationship with motherhood and maternal influence.',
    inSign: { Aries: 'Mother energy is independent and strong.', Taurus: 'Mother energy is nurturing and stable.', Gemini: 'Mother energy is communicative and curious.', Cancer: 'Mother energy is deeply emotional and protective.', Leo: 'Mother energy is warm and expressive.', Virgo: 'Mother energy is practical and healing.', Libra: 'Mother energy is graceful and harmonious.', Scorpio: 'Mother energy is intense and emotionally deep.', Sagittarius: 'Mother energy is free-spirited and wise.', Capricorn: 'Mother energy is structured and responsible.', Aquarius: 'Mother energy is progressive and freedom-loving.', Pisces: 'Mother energy is compassionate and intuitive.' },
    inHouse: { 1: 'Mother shapes your identity.', 2: 'Mother influences values.', 3: 'Mother affects communication.', 4: 'Mother defines emotional roots.', 5: 'Mother influences creativity.', 6: 'Mother shapes daily care.', 7: 'Mother models relationships.', 8: 'Mother involves deep bonds.', 9: 'Mother expands worldview.', 10: 'Mother influences public life.', 11: 'Mother affects community.', 12: 'Mother has karmic dimension.' },
  },
  'Part of Siblings': {
    general: 'Sibling relationships and family bonds.',
    inSign: { Aries: 'Sibling bonds are competitive and energetic.', Taurus: 'Sibling bonds are loyal and grounded.', Gemini: 'Sibling bonds are communicative and playful.', Cancer: 'Sibling bonds are emotionally deep.', Leo: 'Sibling bonds are warm and dramatic.', Virgo: 'Sibling bonds involve mutual service.', Libra: 'Sibling bonds seek harmony.', Scorpio: 'Sibling bonds are intense.', Sagittarius: 'Sibling bonds involve adventure.', Capricorn: 'Sibling bonds are responsible.', Aquarius: 'Sibling bonds are friendship-like.', Pisces: 'Sibling bonds are compassionate.' },
    inHouse: { 1: 'Siblings shape who you are.', 2: 'Siblings connect to shared resources.', 3: 'Siblings are central to your communication world.', 4: 'Siblings are part of your home foundation.', 5: 'Siblings bring creative energy.', 6: 'Siblings involve daily life.', 7: 'Siblings mirror your partnership needs.', 8: 'Siblings involve deep transformation.', 9: 'Siblings expand your horizons.', 10: 'Siblings affect your public life.', 11: 'Siblings are part of your community.', 12: 'Sibling bonds have a karmic quality.' },
  },
  'Part of Friends': {
    general: 'Your friendship magnetism — how you attract allies and supportive connections.',
    inSign: { Aries: 'You attract bold, action-oriented friends.', Taurus: 'You attract loyal, reliable friends.', Gemini: 'You attract communicative, versatile friends.', Cancer: 'You attract nurturing, emotional friends.', Leo: 'You attract creative, generous friends.', Virgo: 'You attract practical, helpful friends.', Libra: 'You attract harmonious, diplomatic friends.', Scorpio: 'You attract intense, loyal friends.', Sagittarius: 'You attract adventurous, philosophical friends.', Capricorn: 'You attract ambitious, responsible friends.', Aquarius: 'You attract unconventional, visionary friends.', Pisces: 'You attract compassionate, artistic friends.' },
    inHouse: { 1: 'Friendships define your identity.', 2: 'Friendships connect to finances.', 3: 'Friendships center on communication.', 4: 'Friendships feel like family.', 5: 'Friendships are fun and creative.', 6: 'Friendships involve mutual service.', 7: 'Friendships are deep partnerships.', 8: 'Friendships involve transformation.', 9: 'Friendships expand horizons.', 10: 'Friendships support career.', 11: 'Friendships are your natural domain.', 12: 'Friendships have spiritual quality.' },
  },
  'Part of Career': {
    general: 'Your career direction and professional calling.',
    inSign: { Aries: 'Career thrives through leadership and initiative.', Taurus: 'Career thrives through steady building and finance.', Gemini: 'Career thrives through communication and media.', Cancer: 'Career thrives through nurturing and care industries.', Leo: 'Career thrives through creative expression and performance.', Virgo: 'Career thrives through analysis, health, and service.', Libra: 'Career thrives through partnership, law, and art.', Scorpio: 'Career thrives through research, psychology, and transformation.', Sagittarius: 'Career thrives through education, travel, and publishing.', Capricorn: 'Career thrives through management, structure, and tradition.', Aquarius: 'Career thrives through technology and innovation.', Pisces: 'Career thrives through healing, art, and spiritual work.' },
    inHouse: { 1: 'Your career IS your identity.', 2: 'Career drives financial growth.', 3: 'Career involves communication.', 4: 'Career connects to home/property.', 5: 'Career involves creativity.', 6: 'Career is your daily service.', 7: 'Career involves partnerships.', 8: 'Career involves transformation.', 9: 'Career involves education/travel.', 10: 'Career is your public destiny.', 11: 'Career serves community.', 12: 'Career has spiritual dimension.' },
  },
  'Part of Commerce': {
    general: 'Your business acumen and commercial success.',
    inSign: { Aries: 'Commerce through fast action and first-mover advantage.', Taurus: 'Commerce through quality products and tangible value.', Gemini: 'Commerce through information, brokering, and networking.', Cancer: 'Commerce through nurturing customer relationships.', Leo: 'Commerce through branding and personal magnetism.', Virgo: 'Commerce through precision and quality control.', Libra: 'Commerce through partnerships and aesthetics.', Scorpio: 'Commerce through strategic investment.', Sagittarius: 'Commerce through international trade and education.', Capricorn: 'Commerce through institutional deals and structure.', Aquarius: 'Commerce through technology and innovation.', Pisces: 'Commerce through creative and spiritual products.' },
    inHouse: { 1: 'You are your brand.', 2: 'Direct income and sales.', 3: 'Trading through communication.', 4: 'Home-based business.', 5: 'Creative commerce.', 6: 'Service-based business.', 7: 'Partnership business.', 8: 'Investment and shared resources.', 9: 'International commerce.', 10: 'Corporate commerce.', 11: 'Network-based business.', 12: 'Behind-the-scenes enterprise.' },
  },
  'Part of Death': {
    general: 'Transformation, endings, and life transitions — not literal death, but cycles of dying and rebirth.',
    inSign: { Aries: 'Transformation through decisive action.', Taurus: 'Transformation through letting go of attachments.', Gemini: 'Transformation through changing beliefs.', Cancer: 'Transformation through emotional release.', Leo: 'Transformation through ego dissolution.', Virgo: 'Transformation through purification.', Libra: 'Transformation through relational shifts.', Scorpio: 'Transformation through deep psychological work.', Sagittarius: 'Transformation through expanded consciousness.', Capricorn: 'Transformation through structural breakdown.', Aquarius: 'Transformation through radical awakening.', Pisces: 'Transformation through spiritual surrender.' },
    inHouse: { 1: 'Identity transforms cyclically.', 2: 'Values undergo periodic death and rebirth.', 3: 'Communication patterns transform.', 4: 'Home and family undergo deep changes.', 5: 'Creativity and love transform.', 6: 'Health and work undergo transformation.', 7: 'Partnerships transform deeply.', 8: 'Constant regeneration is your theme.', 9: 'Beliefs undergo radical shifts.', 10: 'Career undergoes periodic reinvention.', 11: 'Social circles transform.', 12: 'Spiritual life involves deep letting go.' },
  },
  'Part of Illness': {
    general: 'Health vulnerabilities and illness patterns.',
    inSign: { Aries: 'Watch for head, face, and inflammation issues.', Taurus: 'Watch for throat, thyroid, and metabolic issues.', Gemini: 'Watch for respiratory and nervous system issues.', Cancer: 'Watch for digestive and emotional health issues.', Leo: 'Watch for heart and spine issues.', Virgo: 'Watch for digestive and anxiety issues.', Libra: 'Watch for kidney and hormonal balance.', Scorpio: 'Watch for reproductive and eliminatory issues.', Sagittarius: 'Watch for liver, hips, and overindulgence.', Capricorn: 'Watch for bones, joints, and stress issues.', Aquarius: 'Watch for circulation and nervous system.', Pisces: 'Watch for immune system and feet issues.' },
    inHouse: { 1: 'Health tied to personal habits.', 2: 'Health tied to diet and comfort.', 3: 'Health tied to stress and communication.', 4: 'Health tied to emotional wellbeing.', 5: 'Health tied to pleasure and excess.', 6: 'Health is a primary life theme.', 7: 'Health affected by relationships.', 8: 'Health involves deep healing crises.', 9: 'Health affected by travel and beliefs.', 10: 'Health tied to career stress.', 11: 'Health affected by social life.', 12: 'Health involves hidden or chronic patterns.' },
  },
  'Part of Passion': {
    general: 'Your raw desire and sexual drive.',
    inSign: { Aries: 'Passion is direct and fiery.', Taurus: 'Passion is sensual and enduring.', Gemini: 'Passion is mental and varied.', Cancer: 'Passion is emotional and nurturing.', Leo: 'Passion is dramatic and heartfelt.', Virgo: 'Passion is devoted and attentive.', Libra: 'Passion is romantic and beautiful.', Scorpio: 'Passion is intense and all-consuming.', Sagittarius: 'Passion is adventurous and free.', Capricorn: 'Passion is controlled and powerful.', Aquarius: 'Passion is unconventional and electric.', Pisces: 'Passion is mystical and boundless.' },
    inHouse: { 1: 'Passion defines your identity.', 2: 'Passion connects to values.', 3: 'Passion sparks through words.', 4: 'Passion roots in emotional depth.', 5: 'Passion is your natural expression.', 6: 'Passion drives daily energy.', 7: 'Passion lives in partnership.', 8: 'Passion transforms through intimacy.', 9: 'Passion fuels exploration.', 10: 'Passion drives career ambition.', 11: 'Passion ignites in groups.', 12: 'Passion has a hidden, mystical quality.' },
  },
  'Part of Desire': {
    general: 'What you crave at the deepest level.',
    inSign: { Aries: 'You crave independence and action.', Taurus: 'You crave security and pleasure.', Gemini: 'You crave knowledge and variety.', Cancer: 'You crave emotional safety and belonging.', Leo: 'You crave recognition and love.', Virgo: 'You crave perfection and usefulness.', Libra: 'You crave harmony and partnership.', Scorpio: 'You crave depth and power.', Sagittarius: 'You crave meaning and freedom.', Capricorn: 'You crave mastery and respect.', Aquarius: 'You crave freedom and authenticity.', Pisces: 'You crave transcendence and unity.' },
    inHouse: { 1: 'Desire for self-realization.', 2: 'Desire for material security.', 3: 'Desire for knowledge.', 4: 'Desire for emotional roots.', 5: 'Desire for creative expression.', 6: 'Desire for meaningful work.', 7: 'Desire for partnership.', 8: 'Desire for deep transformation.', 9: 'Desire for truth and exploration.', 10: 'Desire for achievement.', 11: 'Desire for community belonging.', 12: 'Desire for spiritual peace.' },
  },
  'Part of Faith': {
    general: 'Your spiritual beliefs and devotion.',
    inSign: { Aries: 'Faith is active and warrior-like.', Taurus: 'Faith is grounded and nature-based.', Gemini: 'Faith is intellectual and questioning.', Cancer: 'Faith is emotional and devotional.', Leo: 'Faith is heart-centered and creative.', Virgo: 'Faith is practiced through service.', Libra: 'Faith seeks justice and balance.', Scorpio: 'Faith is mystical and transformative.', Sagittarius: 'Faith is expansive and philosophical.', Capricorn: 'Faith is structured and traditional.', Aquarius: 'Faith is progressive and humanitarian.', Pisces: 'Faith is transcendent and mystical.' },
    inHouse: { 1: 'Faith shapes identity.', 2: 'Faith connects to values.', 3: 'Faith expressed through learning.', 4: 'Faith rooted in family tradition.', 5: 'Faith expressed creatively.', 6: 'Faith practiced daily.', 7: 'Faith shared in partnership.', 8: 'Faith transforms through crisis.', 9: 'Faith is your life journey.', 10: 'Faith is publicly expressed.', 11: 'Faith serves community.', 12: 'Faith lives in solitude and prayer.' },
  },
  'Part of Intelligence': {
    general: 'Your mental acuity and intellectual gifts.',
    inSign: { Aries: 'Quick, decisive, pioneering mind.', Taurus: 'Practical, methodical, retentive mind.', Gemini: 'Versatile, quick, multi-faceted mind.', Cancer: 'Intuitive, emotional, retentive mind.', Leo: 'Creative, dramatic, visionary mind.', Virgo: 'Analytical, precise, systematic mind.', Libra: 'Balanced, diplomatic, aesthetic mind.', Scorpio: 'Penetrating, strategic, research-oriented mind.', Sagittarius: 'Philosophical, broad, visionary mind.', Capricorn: 'Structured, strategic, long-term mind.', Aquarius: 'Innovative, independent, original mind.', Pisces: 'Imaginative, intuitive, poetic mind.' },
    inHouse: { 1: 'Intelligence defines your identity.', 2: 'Intelligence applied to finances.', 3: 'Intelligence is your natural domain.', 4: 'Intelligence rooted in emotional knowing.', 5: 'Intelligence expressed creatively.', 6: 'Intelligence applied practically.', 7: 'Intelligence shines in dialogue.', 8: 'Intelligence penetrates mysteries.', 9: 'Intelligence seeks wisdom.', 10: 'Intelligence drives career.', 11: 'Intelligence serves innovation.', 12: 'Intelligence accesses the unconscious.' },
  },
  'Part of Honor': {
    general: 'Your public honor, respect, and recognition.',
    inSign: { Aries: 'Honor through courageous leadership.', Taurus: 'Honor through reliable excellence.', Gemini: 'Honor through intellectual achievement.', Cancer: 'Honor through devoted care.', Leo: 'Honor through creative brilliance.', Virgo: 'Honor through devoted service.', Libra: 'Honor through fairness and beauty.', Scorpio: 'Honor through transformative power.', Sagittarius: 'Honor through wisdom and teaching.', Capricorn: 'Honor through institutional achievement.', Aquarius: 'Honor through humanitarian contribution.', Pisces: 'Honor through compassionate service.' },
    inHouse: { 1: 'Honor through personal character.', 2: 'Honor through wealth building.', 3: 'Honor through communication.', 4: 'Honor through family legacy.', 5: 'Honor through creative work.', 6: 'Honor through dedicated service.', 7: 'Honor through partnerships.', 8: 'Honor through overcoming crisis.', 9: 'Honor through education and wisdom.', 10: 'Honor is your career destiny.', 11: 'Honor through community leadership.', 12: 'Honor through spiritual service.' },
  },
  'Part of Increase': {
    general: 'Abundance, growth, and expansion.',
    inSign: { Aries: 'Increase through bold action.', Taurus: 'Increase through patient investment.', Gemini: 'Increase through ideas and connections.', Cancer: 'Increase through nurturing growth.', Leo: 'Increase through generous creativity.', Virgo: 'Increase through systematic improvement.', Libra: 'Increase through partnerships.', Scorpio: 'Increase through strategic depth.', Sagittarius: 'Increase through expansion and travel.', Capricorn: 'Increase through disciplined building.', Aquarius: 'Increase through innovation.', Pisces: 'Increase through faith and flow.' },
    inHouse: { 1: 'Personal growth multiplies.', 2: 'Finances increase.', 3: 'Knowledge and connections multiply.', 4: 'Property and family grow.', 5: 'Creative output increases.', 6: 'Productivity and health improve.', 7: 'Partnership benefits multiply.', 8: 'Shared resources grow.', 9: 'Wisdom and opportunity expand.', 10: 'Career achievements multiply.', 11: 'Social influence grows.', 12: 'Spiritual depth increases.' },
  },
  'Part of Travel': {
    general: 'Long-distance travel and foreign connections.',
    inSign: { Aries: 'Travel is adventurous and impulsive.', Taurus: 'Travel is luxurious and sensory.', Gemini: 'Travel is frequent and communicative.', Cancer: 'Travel connects to emotional roots.', Leo: 'Travel is dramatic and memorable.', Virgo: 'Travel is well-planned and purposeful.', Libra: 'Travel is romantic and aesthetic.', Scorpio: 'Travel transforms you deeply.', Sagittarius: 'Travel is your natural state.', Capricorn: 'Travel is career-oriented.', Aquarius: 'Travel is unconventional and humanitarian.', Pisces: 'Travel is spiritual and mystical.' },
    inHouse: { 1: 'Travel shapes identity.', 2: 'Travel connects to income.', 3: 'Short trips are frequent.', 4: 'Travel involves homecoming.', 5: 'Travel is for pleasure.', 6: 'Travel for work.', 7: 'Travel with partners.', 8: 'Travel transforms.', 9: 'Travel is your destiny.', 10: 'Travel for career.', 11: 'Travel with groups.', 12: 'Travel for spiritual retreat.' },
  },
  'Part of Catastrophe': {
    general: 'Crisis points and major life disruptions.',
    inSign: { Aries: 'Crisis through impulsive action.', Taurus: 'Crisis through material loss.', Gemini: 'Crisis through information or communication.', Cancer: 'Crisis through emotional upheaval.', Leo: 'Crisis through ego challenges.', Virgo: 'Crisis through health or work.', Libra: 'Crisis through relationship breakdown.', Scorpio: 'Crisis through power loss.', Sagittarius: 'Crisis through belief shattering.', Capricorn: 'Crisis through structural collapse.', Aquarius: 'Crisis through sudden disruption.', Pisces: 'Crisis through disillusionment.' },
    inHouse: { 1: 'Crisis reshapes identity.', 2: 'Crisis in finances.', 3: 'Crisis in communication.', 4: 'Crisis in home/family.', 5: 'Crisis in love/creativity.', 6: 'Crisis in health/work.', 7: 'Crisis in partnerships.', 8: 'Crisis in shared resources.', 9: 'Crisis in beliefs.', 10: 'Crisis in career.', 11: 'Crisis in community.', 12: 'Crisis in spiritual life.' },
  },
  'Part of Inheritance': {
    general: 'Inherited wealth, legacy, and family resources.',
    inSign: { Aries: 'Inheritance of courage and initiative.', Taurus: 'Inheritance of material wealth and stability.', Gemini: 'Inheritance of knowledge and communication skills.', Cancer: 'Inheritance of emotional wisdom and property.', Leo: 'Inheritance of creative talent and leadership.', Virgo: 'Inheritance of practical skills and health awareness.', Libra: 'Inheritance of social grace and partnerships.', Scorpio: 'Inheritance of psychological depth and financial acumen.', Sagittarius: 'Inheritance of philosophical wisdom and optimism.', Capricorn: 'Inheritance of discipline and institutional power.', Aquarius: 'Inheritance of progressive vision and innovation.', Pisces: 'Inheritance of spiritual gifts and intuition.' },
    inHouse: { 1: 'You inherit personal traits.', 2: 'You inherit financial resources.', 3: 'You inherit intellectual gifts.', 4: 'You inherit property and roots.', 5: 'You inherit creative talents.', 6: 'You inherit health patterns.', 7: 'You inherit relational patterns.', 8: 'You directly inherit resources.', 9: 'You inherit beliefs and wisdom.', 10: 'You inherit professional standing.', 11: 'You inherit social connections.', 12: 'You inherit spiritual karma.' },
  },
  'Part of Mastery': {
    general: 'Skill mastery, discipline, and craft.',
    inSign: { Aries: 'Mastery through bold action and competition.', Taurus: 'Mastery through patient persistence.', Gemini: 'Mastery through communication and learning.', Cancer: 'Mastery through emotional intelligence.', Leo: 'Mastery through creative excellence.', Virgo: 'Mastery through precision and detail.', Libra: 'Mastery through harmony and diplomacy.', Scorpio: 'Mastery through depth and intensity.', Sagittarius: 'Mastery through broad knowledge.', Capricorn: 'Mastery through discipline and time.', Aquarius: 'Mastery through innovation.', Pisces: 'Mastery through intuition and flow.' },
    inHouse: { 1: 'Mastery of self.', 2: 'Mastery of finances.', 3: 'Mastery of communication.', 4: 'Mastery of home arts.', 5: 'Mastery of creative expression.', 6: 'Mastery of craft and technique.', 7: 'Mastery of relationships.', 8: 'Mastery of transformation.', 9: 'Mastery of knowledge.', 10: 'Mastery of your profession.', 11: 'Mastery of group dynamics.', 12: 'Mastery of spiritual practice.' },
  },
  'Part of Attraction': {
    general: 'What attracts others to you.',
    inSign: { Aries: 'Others are attracted to your courage and energy.', Taurus: 'Others are attracted to your stability and sensuality.', Gemini: 'Others are attracted to your wit and versatility.', Cancer: 'Others are attracted to your warmth and emotional depth.', Leo: 'Others are attracted to your confidence and generosity.', Virgo: 'Others are attracted to your competence and care.', Libra: 'Others are attracted to your beauty and grace.', Scorpio: 'Others are attracted to your intensity and mystery.', Sagittarius: 'Others are attracted to your optimism and vision.', Capricorn: 'Others are attracted to your authority and maturity.', Aquarius: 'Others are attracted to your originality and independence.', Pisces: 'Others are attracted to your compassion and imagination.' },
    inHouse: { 1: 'Attraction through personal presence.', 2: 'Attraction through material abundance.', 3: 'Attraction through communication.', 4: 'Attraction through emotional warmth.', 5: 'Attraction through creative expression.', 6: 'Attraction through devoted service.', 7: 'Attraction through partnership skills.', 8: 'Attraction through intensity.', 9: 'Attraction through wisdom.', 10: 'Attraction through professional stature.', 11: 'Attraction through social vision.', 12: 'Attraction through mystical presence.' },
  },
  'Part of Sexuality': {
    general: 'Your sexual magnetism and erotic nature.',
    inSign: { Aries: 'Sexual energy is fiery and direct.', Taurus: 'Sexual energy is sensual and indulgent.', Gemini: 'Sexual energy is playful and verbal.', Cancer: 'Sexual energy is emotional and nurturing.', Leo: 'Sexual energy is dramatic and confident.', Virgo: 'Sexual energy is attentive and devoted.', Libra: 'Sexual energy is romantic and aesthetic.', Scorpio: 'Sexual energy is intense and transformative.', Sagittarius: 'Sexual energy is adventurous and free.', Capricorn: 'Sexual energy is controlled and powerful.', Aquarius: 'Sexual energy is experimental and independent.', Pisces: 'Sexual energy is mystical and boundless.' },
    inHouse: { 1: 'Sexuality is core to your identity.', 2: 'Sexuality connects to self-worth.', 3: 'Sexuality is expressed through words.', 4: 'Sexuality is deeply private.', 5: 'Sexuality is joyful and creative.', 6: 'Sexuality is part of daily life.', 7: 'Sexuality lives in partnership.', 8: 'Sexuality is transformative and deep.', 9: 'Sexuality is expansive and explorative.', 10: 'Sexuality has a public dimension.', 11: 'Sexuality connects to social circles.', 12: 'Sexuality has a hidden, spiritual quality.' },
  },
};

// ─── Helper Functions ───────────────────────────────────────────────────────

function getSuffix(n: number): string {
  if (n === 1) return 'st';
  if (n === 2) return 'nd';
  if (n === 3) return 'rd';
  return 'th';
}

function generatePersonalizedPartInterpretation(part: ArabicPart, firstName: string): string {
  const meanings = PART_MEANINGS[part.name];
  if (!meanings) return '';
  const signText = meanings.inSign[part.sign] || '';
  const houseText = part.house ? (meanings.inHouse[part.house] || '') : '';
  return `${firstName}, your ${part.name} in **${part.sign}** in the **${part.house ? part.house + getSuffix(part.house) + ' house' : 'chart'}** means: ${signText} ${houseText}`;
}

function generateLocalArabicPartsReading(parts: ArabicPart[], firstName: string): string {
  let reading = `## ${firstName}'s Arabic Parts Reading\n\n`;
  reading += `${firstName}, your chart contains **${parts.length} Arabic Parts** — ancient mathematical points that reveal hidden dimensions of your unique destiny. Each one is a cosmic equation calculated specifically from your birth chart, unlocking areas of your life that planets and houses alone cannot show.\n\n`;

  const keyPartsList = parts.filter(p => KEY_PARTS.some(kp => p.name.toLowerCase().includes(kp.toLowerCase())));
  const otherPartsList = parts.filter(p => !KEY_PARTS.some(kp => p.name.toLowerCase().includes(kp.toLowerCase())));

  if (keyPartsList.length > 0) {
    reading += `### ${firstName}'s Key Parts\n\n`;
    for (const part of keyPartsList) {
      const meanings = PART_MEANINGS[part.name];
      if (meanings) {
        reading += `**${part.name}** in **${part.sign}** (House ${part.house || '?'})\n\n`;
        reading += `${generatePersonalizedPartInterpretation(part, firstName)}\n\n`;
      }
    }
  }

  const majorPartNames = ['Part of Career', 'Part of Death', 'Part of Illness', 'Part of Travel',
    'Part of Courage', 'Part of Victory', 'Part of Nemesis', 'Part of Children'];
  const majorParts = parts.filter(p => majorPartNames.includes(p.name));

  if (majorParts.length > 0) {
    reading += `### ${firstName}'s Major Life Parts\n\n`;
    for (const part of majorParts) {
      const meanings = PART_MEANINGS[part.name];
      if (meanings) {
        reading += `**${part.name}** in **${part.sign}** (House ${part.house || '?'})\n\n`;
        reading += `${generatePersonalizedPartInterpretation(part, firstName)}\n\n`;
      }
    }
  }

  const signCounts: Record<string, number> = {};
  const houseCounts: Record<number, number> = {};
  for (const part of parts) {
    signCounts[part.sign] = (signCounts[part.sign] || 0) + 1;
    if (part.house) houseCounts[part.house] = (houseCounts[part.house] || 0) + 1;
  }
  const topSign = Object.entries(signCounts).sort((a, b) => b[1] - a[1])[0];
  const topHouse = Object.entries(houseCounts).sort((a, b) => b[1] - a[1])[0];

  reading += `### Patterns in ${firstName}'s Parts\n\n`;
  if (topSign) {
    reading += `${firstName}, **${topSign[0]}** is your most activated sign with ${topSign[1]} Arabic Parts falling there. This means the energy of ${topSign[0]} — its style, its strengths, its challenges — runs through multiple dimensions of your destiny.\n\n`;
  }
  if (topHouse) {
    reading += `**House ${topHouse[0]}** is your most activated house with ${topHouse[1]} Parts concentrated there. This house is a powerhouse in your chart, ${firstName} — pay special attention to the life areas it governs.\n\n`;
  }

  const remaining = otherPartsList.filter(p => !majorPartNames.includes(p.name));
  if (remaining.length > 0) {
    reading += `### Other Notable Parts\n\n`;
    for (const part of remaining.slice(0, 8)) {
      const meanings = PART_MEANINGS[part.name];
      if (meanings) {
        reading += `**${part.name}** in ${part.sign} (House ${part.house || '?'}): ${generatePersonalizedPartInterpretation(part, firstName)}\n\n`;
      }
    }
  }

  reading += `---\n\n`;
  reading += `${firstName}, the Arabic Parts are one of the oldest and most profound tools in astrology. They reveal dimensions of your chart that planets and houses alone cannot show. Revisit this reading as you grow — the meanings will deepen with your own self-knowledge.\n`;

  return reading;
}

// ─── Copy Button ─────────────────────────────────────────────────────────────

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded bg-bg-tertiary text-text-muted hover:text-text-primary transition-colors"
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
    >
      <Copy className="w-3 h-3" />
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
}

// ─── Markdown Renderer ──────────────────────────────────────────────────────

function RenderMarkdown({ text }: { text: string }) {
  const lines = text.split('\n');
  return (
    <div className="space-y-1">
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (trimmed.startsWith('## ')) {
          return <h2 key={i} className="text-lg font-bold text-amber-400 mt-4 mb-2">{trimmed.replace('## ', '')}</h2>;
        } else if (trimmed.startsWith('### ')) {
          return <h3 key={i} className="text-base font-semibold text-text-primary mt-3 mb-1">{trimmed.replace('### ', '')}</h3>;
        } else if (trimmed.startsWith('---')) {
          return <hr key={i} className="border-border-primary my-3" />;
        } else if (trimmed.startsWith('- ')) {
          return (
            <div key={i} className="flex gap-2 pl-2 mb-1">
              <span className="text-amber-400">&bull;</span>
              <InlineBold text={trimmed.slice(2)} className="text-text-secondary text-sm leading-relaxed" />
            </div>
          );
        } else if (trimmed.length > 0) {
          return <p key={i} className="text-text-secondary text-sm leading-relaxed mb-1"><InlineBold text={trimmed} /></p>;
        }
        return <div key={i} className="h-2" />;
      })}
    </div>
  );
}

// ─── Calculation Helpers ────────────────────────────────────────────────────

function getLon(planets: any[], name: string): number | null {
  const p = planets.find((pl: any) => (pl.name || pl.planet) === name);
  return p ? (p.longitude ?? null) : null;
}

function getHouseForLon(lon: number, ascLon: number): number {
  const ascSignIdx = Math.floor(ascLon / 30) % 12;
  const lonSignIdx = Math.floor(lon / 30) % 12;
  return ((lonSignIdx - ascSignIdx + 12) % 12) + 1;
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function ArabicPartsPage() {
  const { profile } = useAuthStore();
  const [chartData, setChartData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expandedPart, setExpandedPart] = useState<string | null>(null);
  const [aiReading, setAiReading] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const hasFetchedRef = useRef(false);
  const hasTriggeredReadingRef = useRef(false);

  const firstName = profile?.display_name?.split(' ')[0] || 'Friend';

  // Calculate Arabic Parts from chart data
  const arabicParts: ArabicPart[] = useMemo(() => {
    if (!chartData) return [];
    const planets = chartData?.planets || chartData?.positions || [];
    if (planets.length === 0) return [];

    const ascLon = getLon(planets, 'Ascendant') ?? getLon(planets, 'ASC');
    if (ascLon === null) return [];

    const sunLon = getLon(planets, 'Sun');
    const sunHouse = sunLon !== null ? getHouseForLon(sunLon, ascLon) : 1;
    const isDayChart = sunHouse >= 7;

    const parts: ArabicPart[] = [];
    for (const [name, refName, body1Name, body2Name, nightReverse, formula, meaning] of ARABIC_PARTS_FORMULAS) {
      const mcLon = getLon(planets, 'MC') ?? getLon(planets, 'Midheaven');
      const ref = refName === 'MC' ? mcLon : ascLon;
      let b1 = getLon(planets, body1Name);
      let b2 = getLon(planets, body2Name);
      if (ref === null || b1 === null || b2 === null) continue;

      if (nightReverse && !isDayChart) {
        const temp = b1;
        b1 = b2;
        b2 = temp;
      }
      const lon = ((ref + b1 - b2) % 360 + 360) % 360;
      const signIdx = Math.floor(lon / 30) % 12;
      const degInSign = lon % 30;
      const house = getHouseForLon(lon, ascLon);

      parts.push({ name, sign: SIGNS[signIdx], degree: degInSign, house, longitude: lon, formula, meaning });
    }
    return parts;
  }, [chartData]);

  // Pattern analysis
  const patterns = useMemo(() => {
    if (arabicParts.length === 0) return null;
    const signCounts: Record<string, number> = {};
    const houseCounts: Record<number, number> = {};
    for (const p of arabicParts) {
      signCounts[p.sign] = (signCounts[p.sign] || 0) + 1;
      houseCounts[p.house] = (houseCounts[p.house] || 0) + 1;
    }
    const topSign = Object.entries(signCounts).sort((a, b) => b[1] - a[1])[0];
    const topHouse = Object.entries(houseCounts).sort((a, b) => b[1] - a[1])[0];
    return { topSign, topHouse };
  }, [arabicParts]);

  const isDayChart = useMemo(() => {
    if (!chartData) return true;
    const planets = chartData?.planets || chartData?.positions || [];
    const ascLon = getLon(planets, 'Ascendant') ?? getLon(planets, 'ASC') ?? 0;
    const sunLon = getLon(planets, 'Sun') ?? 0;
    return getHouseForLon(sunLon, ascLon) >= 7;
  }, [chartData]);

  const keyParts = arabicParts.filter(p => KEY_PARTS.includes(p.name));
  const otherParts = arabicParts.filter(p => !KEY_PARTS.includes(p.name));

  const filteredOtherParts = useMemo(() => {
    if (!searchQuery.trim()) return otherParts;
    const q = searchQuery.toLowerCase();
    return otherParts.filter(p => p.name.toLowerCase().includes(q) || p.sign.toLowerCase().includes(q) || p.meaning.toLowerCase().includes(q));
  }, [otherParts, searchQuery]);

  // Auto-load chart on mount
  const fetchChart = useCallback(async () => {
    if (!profile?.birth_date || !profile?.latitude) return;
    setLoading(true);
    setError('');
    try {
      const data = await api.getNatalChart(buildBirthData(profile));
      setChartData(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load chart');
    } finally {
      setLoading(false);
    }
  }, [profile]);

  useEffect(() => {
    if (hasFetchedRef.current) return;
    if (!profile?.birth_date || !profile?.latitude) return;
    hasFetchedRef.current = true;
    fetchChart();
  }, [fetchChart, profile]);

  // Auto-generate reading once parts are calculated
  useEffect(() => {
    if (hasTriggeredReadingRef.current) return;
    if (arabicParts.length === 0) return;
    hasTriggeredReadingRef.current = true;
    const reading = generateLocalArabicPartsReading(arabicParts, firstName);
    setAiReading(reading);
  }, [arabicParts, firstName]);

  if (!profile?.birth_date || !profile?.latitude) {
    return <PaywallGate feature="arabic_parts" fallbackTier="pro"><BirthDataPrompt message="Add your birth data to calculate your Arabic Parts (Lots)." /></PaywallGate>;
  }

  return (
    <PaywallGate feature="arabic_parts" fallbackTier="pro">
    <div className="max-w-3xl mx-auto">
      <Link href="/readings" className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary mb-4">
        <ArrowLeft className="w-4 h-4" />
        Back to Readings
      </Link>
      <div className="flex items-center gap-3 mb-6">
        <Star className="w-8 h-8 text-accent-primary" />
        <div>
          <h1 className="text-2xl font-display font-bold text-text-primary">Arabic Parts</h1>
          <p className="text-text-tertiary text-sm">29 ancient lots calculated from your birth chart</p>
        </div>
      </div>

      {error && !loading && (
        <div className="card text-center py-12">
          <p className="text-red-400 text-sm mb-4">{error}</p>
          <button onClick={fetchChart} className="btn-primary">Retry</button>
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-accent-primary animate-spin mb-4" />
          <p className="text-text-secondary text-sm">Calculating 29 Arabic Parts...</p>
        </div>
      )}

      {arabicParts.length > 0 && (
        <div className="space-y-5">
          {/* Onboarding intro */}
          {showIntro && (
            <div className="card border border-purple-500/30 bg-purple-500/5 relative">
              <button onClick={() => setShowIntro(false)} className="absolute top-2 right-2 text-text-muted hover:text-text-primary text-lg leading-none">&times;</button>
              <h3 className="text-sm font-semibold text-purple-400 mb-2 flex items-center gap-2">
                <Info className="w-4 h-4" /> What Are Arabic Parts?
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Arabic Parts (Lots) are ancient mathematical points calculated from three components in your chart — typically your Ascendant plus one planet minus another. They reveal hidden dimensions of destiny that planets and houses alone cannot show. The 29 lots below cover everything from fortune and love to career and transformation, with day/night reversal for precise calculation.
              </p>
            </div>
          )}

          {/* Day/Night indicator */}
          <div className="flex items-center justify-center gap-2 text-xs text-text-muted">
            <span>{isDayChart ? '☀️ Day Chart' : '🌙 Night Chart'}</span>
            <span className="text-text-muted/50">|</span>
            <span>{arabicParts.length} parts calculated</span>
          </div>

          {/* Pattern highlights */}
          {patterns && (
            <div className="card bg-gradient-cosmic border-accent-muted">
              <h3 className="text-sm font-semibold text-text-primary mb-2 flex items-center gap-2">
                <span className="text-lg">&#x1F4CA;</span> Patterns
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {patterns.topSign && (
                  <div className="text-center p-3 bg-bg-tertiary rounded-xl">
                    <p className="text-xs text-text-muted">Most Active Sign</p>
                    <p className="text-sm font-semibold text-text-primary">{patterns.topSign[0]}</p>
                    <p className="text-[10px] text-accent-primary">{patterns.topSign[1]} parts</p>
                  </div>
                )}
                {patterns.topHouse && (
                  <div className="text-center p-3 bg-bg-tertiary rounded-xl">
                    <p className="text-xs text-text-muted">Most Active House</p>
                    <p className="text-sm font-semibold text-text-primary">House {patterns.topHouse[0]}</p>
                    <p className="text-[10px] text-accent-primary">{patterns.topHouse[1]} parts</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Key Parts */}
          {keyParts.length > 0 && (
            <div className="card">
              <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
                <span className="text-lg">&#x1F511;</span> Key Parts
              </h3>
              <div className="space-y-2">
                {keyParts.map((part) => (
                  <PartCard key={part.name} part={part} expanded={expandedPart === part.name} onToggle={() => setExpandedPart(expandedPart === part.name ? null : part.name)} isKey firstName={firstName} />
                ))}
              </div>
            </div>
          )}

          {/* Inline AI Reading */}
          {aiReading.length > 0 && (
            <div className="card border border-accent-muted">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-accent-primary font-semibold">
                  <Sparkles className="w-4 h-4 inline mr-1" />
                  Your Personal Reading
                </h3>
                <CopyBtn text={aiReading} />
              </div>
              <RenderMarkdown text={aiReading} />
            </div>
          )}

          {/* Other Parts with search */}
          {otherParts.length > 0 && (
            <div className="card">
              <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
                <span className="text-lg">&#x2728;</span> All Parts ({otherParts.length})
              </h3>
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="text"
                  placeholder="Search parts by name, sign, or meaning..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-bg-tertiary border border-border-primary text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-primary"
                />
              </div>
              <div className="space-y-2">
                {filteredOtherParts.map((part) => (
                  <PartCard key={part.name} part={part} expanded={expandedPart === part.name} onToggle={() => setExpandedPart(expandedPart === part.name ? null : part.name)} firstName={firstName} />
                ))}
                {filteredOtherParts.length === 0 && searchQuery && (
                  <p className="text-center text-text-muted text-sm py-4">No parts match &ldquo;{searchQuery}&rdquo;</p>
                )}
              </div>
            </div>
          )}

          <button onClick={() => { hasFetchedRef.current = false; hasTriggeredReadingRef.current = false; setChartData(null); setExpandedPart(null); setAiReading(''); setSearchQuery(''); fetchChart(); }} className="btn-secondary w-full">
            Recalculate
          </button>
        </div>
      )}
    </div>
    </PaywallGate>
  );
}

// ─── Part Card Component ────────────────────────────────────────────────────

function PartCard({ part, expanded, onToggle, isKey, firstName }: { part: ArabicPart; expanded: boolean; onToggle: () => void; isKey?: boolean; firstName: string }) {
  const meanings = PART_MEANINGS[part.name];
  const signInterp = meanings?.inSign[part.sign] || '';
  const houseInterp = meanings?.inHouse[part.house] || '';

  return (
    <div className={`border rounded-xl overflow-hidden ${isKey ? 'border-accent-muted bg-accent-muted/5' : 'border-border-primary'}`}>
      <button onClick={onToggle} className="w-full p-3 text-left">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isKey && <span className="text-[9px] font-bold text-accent-primary bg-accent-muted px-1.5 py-0.5 rounded">KEY</span>}
            <span className="text-sm font-medium text-text-primary">{part.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-accent-primary font-medium">
              {getZodiacGlyph(part.sign)} {part.degree.toFixed(1)}&deg; {part.sign}
            </span>
            <span className="text-[10px] text-text-muted">H{part.house}</span>
            {expanded ? <ChevronUp className="w-3.5 h-3.5 text-text-muted" /> : <ChevronDown className="w-3.5 h-3.5 text-text-muted" />}
          </div>
        </div>
        <p className="text-[11px] text-text-muted mt-0.5">{part.meaning}</p>
      </button>

      {expanded && (
        <div className="px-3 pb-3 pt-1 border-t border-border-primary space-y-2 animate-in fade-in duration-300">
          {signInterp && (
            <div>
              <p className="text-[10px] uppercase text-text-muted font-semibold mb-0.5">In {part.sign}</p>
              <p className="text-xs text-text-secondary">{signInterp}</p>
            </div>
          )}
          {houseInterp && (
            <div>
              <p className="text-[10px] uppercase text-text-muted font-semibold mb-0.5">House {part.house}</p>
              <p className="text-xs text-text-secondary">{houseInterp}</p>
            </div>
          )}
          {/* Personalized interpretation */}
          {meanings && (
            <div className="bg-purple-500/5 rounded-lg p-2 border border-purple-500/10">
              <p className="text-[10px] uppercase text-accent-primary font-semibold mb-0.5">Personalized</p>
              <p className="text-xs text-text-secondary leading-relaxed"><InlineBold text={generatePersonalizedPartInterpretation(part, firstName)} /></p>
            </div>
          )}
          <div className="bg-bg-tertiary rounded-lg p-2">
            <p className="text-[10px] uppercase text-text-muted font-semibold mb-0.5">Formula</p>
            <p className="text-xs text-text-tertiary font-mono">{part.formula}</p>
          </div>
        </div>
      )}
    </div>
  );
}
