import tzlookup from 'tz-lookup';

const OFFSET_REGEX = /^(UTC)?\s*([+-])(\d{1,2})(?::(\d{2}))?$/i;

export function parseTimezoneOffset(raw: string | null | undefined): number | null {
  if (!raw || typeof raw !== 'string') return null;
  const trimmed = raw.trim();
  if (trimmed === '') return null;
  const match = trimmed.match(OFFSET_REGEX);
  if (!match) return null;
  const sign = match[2] === '-' ? -1 : 1;
  const hours = parseInt(match[3], 10);
  const minutes = match[4] ? parseInt(match[4], 10) : 0;
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
  if (hours > 14 || minutes > 59) return null;
  return sign * (hours + minutes / 60);
}

export function offsetFromLongitude(longitude: number): number {
  if (!Number.isFinite(longitude)) return 0;
  return Math.round(longitude / 15);
}

export function offsetFromIanaForDate(name: string, at: Date): number | null {
  if (!name || typeof name !== 'string') return null;
  if (!at || !(at instanceof Date) || Number.isNaN(at.getTime())) return null;
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: name,
      timeZoneName: 'longOffset',
    }).formatToParts(at);
    const tzPart = parts.find((p) => p.type === 'timeZoneName')?.value;
    if (!tzPart) return null;
    if (/^GMT$/i.test(tzPart.trim())) return 0;
    const m = tzPart.match(/GMT\s*([+-])(\d{1,2})(?::(\d{2}))?/i);
    if (!m) return null;
    const sign = m[1] === '-' ? -1 : 1;
    const hours = parseInt(m[2], 10);
    const minutes = m[3] ? parseInt(m[3], 10) : 0;
    if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
    return sign * (hours + minutes / 60);
  } catch {
    return null;
  }
}

function buildBirthMoment(birthDate: string, birthTime?: string): Date | null {
  if (!birthDate || typeof birthDate !== 'string') return null;
  const dm = birthDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!dm) return null;
  const year = parseInt(dm[1], 10);
  const month = parseInt(dm[2], 10);
  const day = parseInt(dm[3], 10);
  let hour = 12;
  let minute = 0;
  if (birthTime && typeof birthTime === 'string') {
    const tm = birthTime.match(/^(\d{1,2}):(\d{2})/);
    if (tm) {
      hour = parseInt(tm[1], 10);
      minute = parseInt(tm[2], 10);
    }
  }
  const d = new Date(Date.UTC(year, month - 1, day, hour, minute));
  return Number.isNaN(d.getTime()) ? null : d;
}

export function formatOffsetLabel(offsetHours: number): string {
  if (!Number.isFinite(offsetHours)) return 'UTC+00:00';
  const sign = offsetHours >= 0 ? '+' : '-';
  const abs = Math.abs(offsetHours);
  const wholeHours = Math.floor(abs);
  const minutes = Math.round((abs - wholeHours) * 60);
  const finalH = minutes === 60 ? wholeHours + 1 : wholeHours;
  const finalM = minutes === 60 ? 0 : minutes;
  return `UTC${sign}${String(finalH).padStart(2, '0')}:${String(finalM).padStart(2, '0')}`;
}

export function ianaFromCoords(lat: number, lon: number): string | null {
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  if (lat < -90 || lat > 90 || lon < -180 || lon > 180) return null;
  try {
    const name = tzlookup(lat, lon);
    return typeof name === 'string' && name.length > 0 ? name : null;
  } catch {
    return null;
  }
}

export function lookupTimezone(lat: number, lon: number): string {
  const iana = ianaFromCoords(lat, lon);
  if (iana) return iana;
  return formatOffsetLabel(offsetFromLongitude(lon));
}

export function resolveTimezoneOffset(
  timezone: string | null | undefined,
  longitude: number,
  birthDate?: string,
  birthTime?: string,
  latitude?: number,
): { offset: number; label: string } {
  if (
    typeof latitude === 'number' &&
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    birthDate
  ) {
    const iana = ianaFromCoords(latitude, longitude);
    if (iana) {
      const at = buildBirthMoment(birthDate, birthTime);
      if (at) {
        const offset = offsetFromIanaForDate(iana, at);
        if (offset !== null) {
          return { offset, label: formatOffsetLabel(offset) };
        }
      }
    }
  }

  const parsed = parseTimezoneOffset(timezone);
  if (parsed !== null) {
    return { offset: parsed, label: formatOffsetLabel(parsed) };
  }

  if (timezone && birthDate) {
    const at = buildBirthMoment(birthDate, birthTime);
    if (at) {
      const iana = offsetFromIanaForDate(timezone, at);
      if (iana !== null) {
        return { offset: iana, label: formatOffsetLabel(iana) };
      }
    }
  }

  const fallback = offsetFromLongitude(longitude);
  return { offset: fallback, label: formatOffsetLabel(fallback) };
}
