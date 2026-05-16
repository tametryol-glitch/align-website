'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CosmicNotificationSettingsRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace('/settings/notifications'); }, [router]);
  return null;
}
