'use client';

/**
 * /u/[id] — shared profile link landing page. See DeepLinkLanding for behaviour.
 */

import { useParams } from 'next/navigation';
import { DeepLinkLanding } from '@/components/DeepLinkLanding';

export default function SharedProfileLinkPage() {
  const params = useParams();
  return <DeepLinkLanding kind="profile" id={String(params?.id ?? '')} />;
}
