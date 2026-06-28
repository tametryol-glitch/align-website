import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';
import { FounderContent } from '@/components/FounderContent';

export const metadata: Metadata = {
  title: 'Meet the Founder',
  description:
    'Meet Astro Einstein, the Bahamian astrologer, clinical hypnotherapist, and CEO, designer, and developer behind Align.',
  alternates: {
    canonical: 'https://aligncosmic.com/founder',
  },
  openGraph: {
    title: 'Meet the Founder | Align',
    description:
      'Meet Astro Einstein, the Bahamian astrologer and CEO, designer, and developer behind Align.',
    url: 'https://aligncosmic.com/founder',
    siteName: 'Align',
    type: 'profile',
  },
};

export default function FounderPage() {
  return (
    <div className="min-h-screen">
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <Link
          href="/"
          className="text-xl font-display font-bold text-text-primary flex items-center gap-2"
        >
          <Image src="/logo.png" alt="Align logo" width={32} height={32} className="w-8 h-8 rounded-lg" />
          Align
        </Link>
        <Link
          href="/readings"
          className="text-sm text-text-secondary hover:text-text-primary transition-colors flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
      </nav>

      <main className="max-w-2xl mx-auto px-6 pt-6 pb-20">
        <article className="card">
          <FounderContent />
        </article>
      </main>
    </div>
  );
}
