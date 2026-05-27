export interface CoachmarkStep {
  id: string;
  titleKey: string;
  descriptionKey: string;
  targetSelector: string;
  position: 'top' | 'bottom' | 'left' | 'right';
}

export const FIRST_VISIT_TOUR: CoachmarkStep[] = [
  {
    id: 'daily-brief',
    titleKey: 'coachmarks.dailyBrief.title',
    descriptionKey: 'coachmarks.dailyBrief.description',
    targetSelector: '[data-coachmark="daily-brief"]',
    position: 'bottom',
  },
  {
    id: 'quick-access',
    titleKey: 'coachmarks.quickAccess.title',
    descriptionKey: 'coachmarks.quickAccess.description',
    targetSelector: '[data-coachmark="quick-access"]',
    position: 'top',
  },
  {
    id: 'nav-chart',
    titleKey: 'coachmarks.natalChart.title',
    descriptionKey: 'coachmarks.natalChart.description',
    targetSelector: '[data-coachmark="nav-chart"]',
    position: 'right',
  },
  {
    id: 'nav-feed',
    titleKey: 'coachmarks.feed.title',
    descriptionKey: 'coachmarks.feed.description',
    targetSelector: '[data-coachmark="nav-feed"]',
    position: 'right',
  },
  {
    id: 'nav-ai-astrologer',
    titleKey: 'coachmarks.aiAstrologer.title',
    descriptionKey: 'coachmarks.aiAstrologer.description',
    targetSelector: '[data-coachmark="nav-ai-astrologer"]',
    position: 'right',
  },
  {
    id: 'nav-courses',
    titleKey: 'coachmarks.courses.title',
    descriptionKey: 'coachmarks.courses.description',
    targetSelector: '[data-coachmark="nav-courses"]',
    position: 'right',
  },
];
