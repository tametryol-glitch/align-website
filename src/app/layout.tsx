import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/components/layout/AuthProvider';
import { GlobalCallListener } from '@/components/GlobalCallListener';
import I18nProvider from '@/i18n/I18nProvider';

export const metadata: Metadata = {
  metadataBase: new URL('https://align-web.vercel.app'),
  title: {
    default: 'Align — AI Astrology, Natal Charts & Cosmic Compatibility',
    template: '%s | Align',
  },
  description: 'Professional-grade astrology powered by AI. Natal charts, compatibility, 26+ readings, tarot, numerology, and a cosmic community. Free to start.',
  keywords: ['astrology', 'natal chart', 'horoscope', 'tarot', 'numerology', 'compatibility', 'birth chart', 'synastry', 'zodiac', 'AI astrologer', 'moon phases', 'transits'],
  openGraph: {
    title: 'Align — AI Astrology, Natal Charts & Cosmic Compatibility',
    description: 'Professional-grade astrology powered by AI. Get your natal chart, check compatibility, and explore 26+ readings.',
    url: 'https://align-web.vercel.app',
    siteName: 'Align',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Align — AI Astrology & Cosmic Compatibility',
    description: 'Natal charts, compatibility, 26+ AI readings, and a cosmic community. Free to start.',
  },
  icons: {
    icon: '/favicon.png',
    apple: '/apple-touch-icon.png',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#141826" />
      </head>
      <body className="min-h-screen font-sans">
        <I18nProvider>
          <AuthProvider>
            <GlobalCallListener />
            {children}
          </AuthProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
