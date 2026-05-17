type GTagEvent = {
  action: string;
  category?: string;
  label?: string;
  value?: number;
};

export function trackEvent({ action, category, label, value }: GTagEvent) {
  if (typeof window === 'undefined' || !(window as any).gtag) return;
  (window as any).gtag('event', action, {
    event_category: category,
    event_label: label,
    value,
  });
}

export const AnalyticsEvents = {
  signup: () => trackEvent({ action: 'sign_up', category: 'auth' }),
  login: () => trackEvent({ action: 'login', category: 'auth' }),
  onboardingComplete: () => trackEvent({ action: 'onboarding_complete', category: 'funnel' }),
  readingStarted: (type: string) => trackEvent({ action: 'reading_started', category: 'engagement', label: type }),
  readingCompleted: (type: string) => trackEvent({ action: 'reading_completed', category: 'engagement', label: type }),
  paywallViewed: (tier: string) => trackEvent({ action: 'paywall_viewed', category: 'monetization', label: tier }),
  subscriptionStarted: (tier: string) => trackEvent({ action: 'purchase', category: 'monetization', label: tier }),
  referralSent: () => trackEvent({ action: 'referral_sent', category: 'growth' }),
  referralConverted: () => trackEvent({ action: 'referral_converted', category: 'growth' }),
  shareChart: (type: string) => trackEvent({ action: 'share_chart', category: 'social', label: type }),
  friendAdded: () => trackEvent({ action: 'friend_added', category: 'social' }),
  postCreated: (type: string) => trackEvent({ action: 'post_created', category: 'social', label: type }),
  matchViewed: () => trackEvent({ action: 'match_viewed', category: 'engagement' }),
  aiChatMessage: () => trackEvent({ action: 'ai_chat_message', category: 'engagement' }),
  streakDay: (days: number) => trackEvent({ action: 'streak_day', category: 'retention', value: days }),
  pageView: (page: string) => trackEvent({ action: 'page_view', category: 'navigation', label: page }),
};
