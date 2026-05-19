import type { Metadata } from 'next';
import SoulAscensionWebGame from '@/components/soulAscension/SoulAscensionWebGame';

export const metadata: Metadata = {
  title: 'Soul Ascension',
  description: 'Play your natal chart as a reincarnation RPG with karma, purpose paths, soul contracts, relics, and past-life choices.',
};

export default function SoulAscensionPage() {
  return <SoulAscensionWebGame />;
}
