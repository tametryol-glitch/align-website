'use client';

/**
 * /g/[id] — shared community link landing page. See DeepLinkLanding for behaviour.
 */

import { useParams } from 'next/navigation';
import { DeepLinkLanding } from '@/components/DeepLinkLanding';

export default function SharedCommunityLinkPage() {
  const params = useParams();
  return <DeepLinkLanding kind="community" id={String(params?.id ?? '')} />;
}
