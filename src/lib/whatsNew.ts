import whatsNewData from '@/data/whatsNew.json';

export interface WhatsNewEntry {
  version: string;
  title: string;
  items: string[];
}

export const CURRENT_VERSION = '1.5.1';

export function getLatestWhatsNew(): WhatsNewEntry | null {
  if (!whatsNewData || whatsNewData.length === 0) return null;
  return whatsNewData[0] as WhatsNewEntry;
}
