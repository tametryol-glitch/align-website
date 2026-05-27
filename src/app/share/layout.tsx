import type { Metadata } from 'next';

interface Props {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams;
  const type = (params.type as string) || 'big-three';

  if (type === 'big-three') {
    const sun = (params.sun as string) || 'Aries';
    const moon = (params.moon as string) || 'Aries';
    const rising = (params.rising as string) || 'Aries';
    const name = (params.name as string) || 'A Fellow Stargazer';

    const title = `${name}'s Big Three: ${sun} Sun, ${moon} Moon, ${rising} Rising`;
    const description = `Discover ${name}'s cosmic identity on Align — AI-powered astrology, natal charts, and 26+ readings.`;
    const ogImageUrl = `/api/og?type=chart&sun=${encodeURIComponent(sun)}&moon=${encodeURIComponent(moon)}&rising=${encodeURIComponent(rising)}`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images: [{ url: ogImageUrl, width: 1200, height: 630, alt: title }],
        type: 'website',
        siteName: 'Align — AI Astrology',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [ogImageUrl],
      },
    };
  }

  if (type === 'compatibility') {
    const u1 = (params.u1 as string) || 'Person 1';
    const s1 = (params.s1 as string) || 'Aries';
    const u2 = (params.u2 as string) || 'Person 2';
    const s2 = (params.s2 as string) || 'Aries';
    const pct = (params.pct as string) || '75';

    const title = `${u1} & ${u2}: ${pct}% Compatible`;
    const description = `${u1} (${s1}) and ${u2} (${s2}) have ${pct}% cosmic compatibility. Check yours on Align!`;
    const ogImageUrl = `/api/og?type=compat&sign1=${encodeURIComponent(s1)}&sign2=${encodeURIComponent(s2)}&score=${encodeURIComponent(pct)}`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images: [{ url: ogImageUrl, width: 1200, height: 630, alt: title }],
        type: 'website',
        siteName: 'Align — AI Astrology',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [ogImageUrl],
      },
    };
  }

  return {
    title: 'Align — AI Astrology & Cosmic Compatibility',
    description: 'AI-powered astrology, natal charts, and 26+ cosmic readings.',
  };
}

export default function ShareLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
