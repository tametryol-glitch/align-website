import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/components/layout/AuthProvider';

export const metadata: Metadata = {
  title: 'Align — Your Personal Astrology Guide',
  description: 'Professional-grade astrology, AI-powered readings, natal charts, transits, compatibility, and more.',
  keywords: ['astrology', 'natal chart', 'horoscope', 'tarot', 'numerology', 'compatibility'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-bg-primary font-sans">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
