import { PublicOrAppShell } from '@/components/layout/PublicOrAppShell';

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return <PublicOrAppShell>{children}</PublicOrAppShell>;
}
