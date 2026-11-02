// One source of truth for navigation, shared by the desktop Sidebar and the
// phone "More" sheet. Items are grouped into pillars so a new user can tell
// where things live instead of scanning one flat list of ~25 links.

import type { LucideIcon } from 'lucide-react';
import {
  Home, Star, BookOpen, MessageCircle, CreditCard, Sparkles, Globe, Compass,
  Search, Users, Bell, Mail, Zap, Video, Heart, MessagesSquare, Bookmark,
  BarChart3, Palette, Orbit, DollarSign, Eye,
} from 'lucide-react';

export interface NavItem {
  href: string;
  labelKey: string;
  icon: LucideIcon;
  /** Guided-tour anchor (data-coachmark); keep in step with useCoachmarks. */
  coachmark?: string;
}

export interface NavSection {
  id: string;
  labelKey: string;
  defaultLabel: string;
  items: NavItem[];
}

export const NAV_SECTIONS: NavSection[] = [
  {
    id: 'today',
    labelKey: 'components.sidebar.sectionToday',
    defaultLabel: 'Today',
    items: [
      { href: '/dashboard', labelKey: 'components.sidebar.home', icon: Home },
      { href: '/cosmic-alerts', labelKey: 'components.sidebar.cosmicWeather', icon: Zap },
      { href: '/world-echo', labelKey: 'components.sidebar.worldEcho', icon: Compass },
    ],
  },
  {
    id: 'chart',
    labelKey: 'components.sidebar.sectionChart',
    defaultLabel: 'Chart & Readings',
    items: [
      { href: '/chart', labelKey: 'components.sidebar.chart', icon: Star, coachmark: 'nav-chart' },
      { href: '/readings', labelKey: 'components.sidebar.readings', icon: Sparkles, coachmark: 'nav-readings' },
      { href: '/ai', labelKey: 'components.sidebar.aiAstrologer', icon: MessageCircle, coachmark: 'nav-ai-astrologer' },
      { href: '/zodisphere', labelKey: 'components.sidebar.zodisphere', icon: Orbit },
      { href: '/global-intelligence', labelKey: 'components.sidebar.globalIntelligence', icon: Globe },
    ],
  },
  {
    id: 'social',
    labelKey: 'components.sidebar.sectionSocial',
    defaultLabel: 'Community',
    items: [
      { href: '/feed', labelKey: 'components.sidebar.cosmicFeed', icon: Globe, coachmark: 'nav-feed' },
      { href: '/messages', labelKey: 'components.sidebar.messages', icon: Mail },
      { href: '/friends', labelKey: 'components.sidebar.friends', icon: Users },
      { href: '/communities', labelKey: 'components.sidebar.communities', icon: MessagesSquare },
      { href: '/dating', labelKey: 'components.sidebar.dating', icon: Heart },
      { href: '/discover', labelKey: 'components.sidebar.discover', icon: Search },
      { href: '/search', labelKey: 'components.sidebar.search', icon: Search },
      { href: '/polls', labelKey: 'components.sidebar.polls', icon: BarChart3 },
      { href: '/notifications', labelKey: 'components.sidebar.notifications', icon: Bell },
      { href: '/views', labelKey: 'views.nav', icon: Eye },
      { href: '/bookmarks', labelKey: 'components.sidebar.bookmarks', icon: Bookmark },
    ],
  },
  {
    id: 'create',
    labelKey: 'components.sidebar.sectionCreate',
    defaultLabel: 'Create & Learn',
    items: [
      { href: '/cosmic-video', labelKey: 'components.sidebar.videoCreator', icon: Video },
      { href: '/creator-studio', labelKey: 'components.sidebar.creatorStudio', icon: Palette },
      { href: '/courses', labelKey: 'components.sidebar.learn', icon: BookOpen, coachmark: 'nav-courses' },
    ],
  },
  {
    id: 'plans',
    labelKey: 'components.sidebar.sectionPlans',
    defaultLabel: 'Plans & Earning',
    items: [
      { href: '/pricing', labelKey: 'components.sidebar.pricing', icon: CreditCard },
      { href: '/affiliates', labelKey: 'components.sidebar.affiliates', icon: DollarSign },
    ],
  },
];

export function isActivePath(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(href + '/');
}
