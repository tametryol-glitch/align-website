export const SHARE_URL_BASE = 'https://tametryol-glitch.github.io/align-website';
export const APP_SCHEME = 'align';
export const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.align.astrology';

export type ShareableType = 'reel' | 'post' | 'profile' | 'chart' | 'community' | 'invite';

export interface BuildLinkInput {
  type: ShareableType;
  id?: string;
  meta?: {
    creatorName?: string;
    caption?: string;
    title?: string;
  };
}

export interface ShareLink {
  url: string;
  appSchemeUrl: string;
  message: string;
  title: string;
}

const PATHS: Record<Exclude<ShareableType, 'invite'>, string> = {
  reel: '/r/',
  post: '/p/',
  profile: '/u/',
  chart: '/c/',
  community: '/g/',
};

function sanitizeId(id: string): string {
  return encodeURIComponent(String(id).trim());
}

function buildMessage(input: BuildLinkInput, url: string): { message: string; title: string } {
  const m = input.meta ?? {};
  const byline = m.creatorName ? `${m.creatorName}'s ` : '';

  switch (input.type) {
    case 'reel': {
      const cap = m.caption ? ` "${m.caption.slice(0, 80)}"` : '';
      return { title: 'Align reel', message: `Check out ${byline || 'this '}reel on Align${cap}\n${url}` };
    }
    case 'post': {
      const preview = m.caption ? ` "${m.caption.slice(0, 160)}"` : '';
      return { title: 'Align post', message: `${byline ? `${m.creatorName} on Align:` : 'A post on Align:'}${preview}\n${url}` };
    }
    case 'profile':
      return { title: m.title || 'Align profile', message: `${byline ? `Connect with ${m.creatorName} on Align` : 'Find me on Align'}\n${url}` };
    case 'chart':
      return { title: 'Align chart', message: `${byline}birth chart on Align — ${m.title || 'see the full reading'}\n${url}`.trim() };
    case 'community':
      return { title: m.title || 'Align community', message: `Join ${m.title || 'this community'} on Align\n${url}` };
    case 'invite':
    default:
      return { title: 'Join Align', message: `Join me on Align — the cosmic social app. Connect through the stars.\n${url}` };
  }
}

export function buildShareLink(input: BuildLinkInput): ShareLink {
  let url: string;
  let appSchemeUrl: string;

  if (input.type === 'invite') {
    url = SHARE_URL_BASE;
    appSchemeUrl = `${APP_SCHEME}://`;
  } else {
    const path = PATHS[input.type];
    const id = input.id ? sanitizeId(input.id) : '';
    url = `${SHARE_URL_BASE}${path}${id}`;
    appSchemeUrl = `${APP_SCHEME}:${path}${id}`;
  }

  const { message, title } = buildMessage(input, url);
  return { url, appSchemeUrl, message, title };
}

export function copyShareLink(input: BuildLinkInput): string {
  const link = buildShareLink(input);
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    navigator.clipboard.writeText(link.url).catch(() => {});
  }
  return link.url;
}
