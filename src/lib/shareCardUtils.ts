/**
 * Share card utilities — Web Share API, clipboard, and shareable URL generation.
 */

const BASE_URL = 'https://aligncosmic.com';

// ── Web Share API with clipboard fallback ──

export async function shareCard(
  title: string,
  text: string,
  url: string,
): Promise<{ shared: boolean; copied: boolean }> {
  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({ title, text, url });
      return { shared: true, copied: false };
    } catch {
      // User cancelled or API failed — fall through to clipboard
    }
  }

  // Fallback: copy URL to clipboard
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(url);
      return { shared: false, copied: true };
    } catch {
      // Clipboard also failed
    }
  }

  // Last resort: prompt
  if (typeof window !== 'undefined') {
    window.prompt('Copy this link:', url);
  }
  return { shared: false, copied: false };
}

// ── Copy shareable link to clipboard ──

export async function copyShareLink(url: string): Promise<boolean> {
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(url);
      return true;
    } catch {
      return false;
    }
  }
  return false;
}

// ── Generate shareable URL ──

type ShareType = 'big-three' | 'compatibility';

interface BigThreeData {
  sun: string;
  moon: string;
  rising: string;
  name?: string;
}

interface CompatibilityData {
  user1: string;
  user1Sign: string;
  user2: string;
  user2Sign: string;
  percentage: number;
}

export function generateShareUrl(
  type: 'big-three',
  data: BigThreeData,
): string;
export function generateShareUrl(
  type: 'compatibility',
  data: CompatibilityData,
): string;
export function generateShareUrl(
  type: ShareType,
  data: BigThreeData | CompatibilityData,
): string {
  const params = new URLSearchParams();
  params.set('type', type);

  if (type === 'big-three') {
    const d = data as BigThreeData;
    if (d.sun) params.set('sun', d.sun);
    if (d.moon) params.set('moon', d.moon);
    if (d.rising) params.set('rising', d.rising);
    if (d.name) params.set('name', d.name);
  } else {
    const d = data as CompatibilityData;
    params.set('u1', d.user1);
    params.set('s1', d.user1Sign);
    params.set('u2', d.user2);
    params.set('s2', d.user2Sign);
    params.set('pct', String(d.percentage));
  }

  return `${BASE_URL}/share?${params.toString()}`;
}

// ── Download card as image (placeholder for html2canvas integration) ──

export async function downloadCardAsImage(
  elementRef: React.RefObject<HTMLDivElement | null>,
): Promise<boolean> {
  // Dynamically import html2canvas if available (optional dependency).
  // If not installed, gracefully degrade.
  try {
    // @ts-ignore — html2canvas is an optional peer dependency
    const mod = await import(/* webpackIgnore: true */ 'html2canvas');
    const html2canvas = mod.default;
    if (elementRef.current && html2canvas) {
      const canvas = await html2canvas(elementRef.current, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
      });
      const link = document.createElement('a');
      link.download = 'align-card.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
      return true;
    }
  } catch {
    // html2canvas not installed — inform user
    console.info(
      '[Align] html2canvas not installed. Run `npm i html2canvas` to enable card downloads.',
    );
  }
  return false;
}
