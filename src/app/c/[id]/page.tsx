'use client';

/**
 * /c/[id] — shared chart link landing page. See DeepLinkLanding for behaviour.
 */

import { useParams } from 'next/navigation';
import { DeepLinkLanding } from '@/components/DeepLinkLanding';

export default function SharedChartLinkPage() {
  const params = useParams();
  return <DeepLinkLanding kind="chart" id={String(params?.id ?? '')} />;
}
