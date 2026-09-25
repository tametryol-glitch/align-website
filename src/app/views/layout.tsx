import { AppShell } from '@/components/layout/AppShell';

export default function ViewsLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
