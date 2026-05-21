export interface NotificationPayload {
  title: string;
  body: string;
  url: string;
  tag: string;
}

export const NOTIFICATION_TEMPLATES = {
  dailyHoroscope: (sign: string): NotificationPayload => ({
    title: '☀️ Your Daily Horoscope',
    body: `Good morning! Your ${sign} forecast is ready.`,
    url: '/dashboard',
    tag: 'daily-horoscope',
  }),
  transitAlert: (planet: string, sign: string): NotificationPayload => ({
    title: `🪐 ${planet} enters ${sign}`,
    body: `This transit affects your chart. Tap to see how.`,
    url: '/readings/transits',
    tag: 'transit-alert',
  }),
  friendRequest: (name: string): NotificationPayload => ({
    title: '✨ New Cosmic Connection',
    body: `${name} wants to connect with you!`,
    url: '/friends',
    tag: 'friend-request',
  }),
  newMessage: (name: string): NotificationPayload => ({
    title: `💬 Message from ${name}`,
    body: 'Tap to read',
    url: '/messages',
    tag: 'message',
  }),
  streakReminder: (streak: number): NotificationPayload => ({
    title: '🔥 Don\'t break your streak!',
    body: `You have a ${streak}-day streak. Check in today to keep it going!`,
    url: '/dashboard',
    tag: 'streak-reminder',
  }),
  mercuryRetrograde: (): NotificationPayload => ({
    title: '☿️ Mercury Retrograde Begins',
    body: 'Time to slow down. Read your survival guide.',
    url: '/readings/transits',
    tag: 'mercury-retrograde',
  }),
  datingLikeReceived: (name: string): NotificationPayload => ({
    title: '💫 Someone likes you!',
    body: `${name} is cosmically curious about you.`,
    url: '/dating/likes',
    tag: 'dating-like',
  }),
  datingMatch: (name: string): NotificationPayload => ({
    title: '✨ It\'s a Cosmic Match!',
    body: `You and ${name} are written in the stars.`,
    url: '/dating/matches',
    tag: 'dating-match',
  }),
  datingCosmicRose: (name: string): NotificationPayload => ({
    title: '🌹 You received a Cosmic Rose!',
    body: `${name} sent you a Cosmic Rose — they really stand out.`,
    url: '/dating/likes',
    tag: 'dating-rose',
  }),
  datingIcebreaker: (name: string): NotificationPayload => ({
    title: '💬 Icebreaker ready!',
    body: `The stars have a conversation starter for you and ${name}.`,
    url: '/dating/matches',
    tag: 'dating-icebreaker',
  }),
  cosmicTimingAlert: (name: string, insight: string): NotificationPayload => ({
    title: '🌙 Cosmic Timing Alert',
    body: `${insight} — perfect time to connect with ${name}.`,
    url: '/dating/matches',
    tag: 'cosmic-timing',
  }),
};
