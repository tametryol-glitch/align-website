import type { Metadata } from 'next';

/**
 * The embed is a private bootstrap surface for the mobile WebView, not a page
 * anyone should reach from search. It already refuses to mount the globe until
 * the app injects a profile via postMessage (so a drive-by visit never boots
 * Cesium or burns ion tiles) — this keeps it out of the index as well.
 */
export const metadata: Metadata = {
  title: 'Zodisphere 3D',
  robots: { index: false, follow: false, nocache: true },
};

export default function Zodisphere3dEmbedLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
