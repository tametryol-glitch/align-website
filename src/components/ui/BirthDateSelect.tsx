'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Minimum age to hold an Align account. Enforced in the year list (years newer
 * than `currentYear - MIN_BIRTH_AGE + 1` are never offered) and again on the
 * exact date, so a birthday that hasn't happened yet still blocks.
 */
export const MIN_BIRTH_AGE = 18;
export const MIN_BIRTH_YEAR = 1900;

function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

function pad(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

/** Splits a 'YYYY-MM-DD' string into parts. Returns empty strings for anything unparseable. */
function splitValue(value: string): { m: string; d: string; y: string } {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value || '');
  if (!match) return { m: '', d: '', y: '' };
  return { y: match[1], m: String(Number(match[2])), d: String(Number(match[3])) };
}

/** True only for a real calendar date — rejects Feb 30, month 13, etc. */
export function isRealDate(year: number, month: number, day: number): boolean {
  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) return false;
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > daysInMonth(year, month)) return false;
  return true;
}

/** Age in whole years on `on`, or null if the string isn't a real date. */
export function ageFromBirthDate(value: string, on: Date = new Date()): number | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value || '');
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (!isRealDate(year, month, day)) return null;

  let age = on.getFullYear() - year;
  const beforeBirthday =
    on.getMonth() + 1 < month || (on.getMonth() + 1 === month && on.getDate() < day);
  if (beforeBirthday) age -= 1;
  return age;
}

/**
 * The single gate every birth-date entry point should use. Rejects malformed
 * dates, dates before 1900, future dates, and anyone under `minAge`.
 */
export function isValidBirthDate(value: string, minAge: number = MIN_BIRTH_AGE): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value || '');
  if (!match) return false;
  const year = Number(match[1]);
  if (year < MIN_BIRTH_YEAR) return false;
  const age = ageFromBirthDate(value);
  return age !== null && age >= minAge;
}

interface BirthDateSelectProps {
  /** 'YYYY-MM-DD', or '' when incomplete. */
  value: string;
  /** Fires with a complete 'YYYY-MM-DD' string, or '' while the date is incomplete. */
  onChange: (value: string) => void;
  minAge?: number;
  minYear?: number;
  /** Shows the "Pick the month, the day, then the year" line above the selects. */
  showHelper?: boolean;
  className?: string;
}

export function BirthDateSelect({
  value,
  onChange,
  minAge = MIN_BIRTH_AGE,
  minYear = MIN_BIRTH_YEAR,
  showHelper = true,
  className = '',
}: BirthDateSelectProps) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language || 'en';

  const [parts, setParts] = useState(() => splitValue(value));

  // Re-sync only when the parent hands us a value we didn't produce (profile
  // load, reset). Partial selections survive because both sides read as ''.
  useEffect(() => {
    const current =
      parts.y && parts.m && parts.d
        ? `${parts.y}-${pad(Number(parts.m))}-${pad(Number(parts.d))}`
        : '';
    if (value !== current) setParts(splitValue(value));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const monthNames = useMemo(() => {
    const fmt = new Intl.DateTimeFormat(locale, { month: 'long' });
    return Array.from({ length: 12 }, (_, i) => fmt.format(new Date(2000, i, 1)));
  }, [locale]);

  // Newest birth year anyone `minAge` or older could have. At minAge 18 in 2026
  // this is 2009 — the current year is simply not in the list.
  const maxYear = new Date().getFullYear() - minAge + 1;

  const years = useMemo(() => {
    const list: number[] = [];
    for (let y = maxYear; y >= minYear; y--) list.push(y);
    // A legacy profile may hold a year outside the range; keep it selectable so
    // the field shows what's actually stored instead of silently blanking it.
    const stored = Number(parts.y);
    if (stored && !list.includes(stored)) {
      list.push(stored);
      list.sort((a, b) => b - a);
    }
    return list;
  }, [maxYear, minYear, parts.y]);

  const dayCount = parts.m
    ? daysInMonth(Number(parts.y) || 2000, Number(parts.m))
    : 31;

  const days = useMemo(
    () => Array.from({ length: dayCount }, (_, i) => i + 1),
    [dayCount]
  );

  function emit(next: { m: string; d: string; y: string }) {
    setParts(next);
    if (next.m && next.d && next.y) {
      const y = Number(next.y);
      const m = Number(next.m);
      const d = Number(next.d);
      onChange(isRealDate(y, m, d) ? `${y}-${pad(m)}-${pad(d)}` : '');
    } else {
      onChange('');
    }
  }

  function handleMonth(m: string) {
    const next = { ...parts, m };
    // Feb 29 -> Feb after switching to a non-leap year, Apr 31, etc.
    if (next.d && m && Number(next.d) > daysInMonth(Number(next.y) || 2000, Number(m))) {
      next.d = '';
    }
    emit(next);
  }

  function handleDay(d: string) {
    emit({ ...parts, d });
  }

  function handleYear(y: string) {
    const next = { ...parts, y };
    if (next.d && next.m && y && Number(next.d) > daysInMonth(Number(y), Number(next.m))) {
      next.d = '';
    }
    emit(next);
  }

  const complete = Boolean(parts.m && parts.d && parts.y);
  const age = complete
    ? ageFromBirthDate(`${parts.y}-${pad(Number(parts.m))}-${pad(Number(parts.d))}`)
    : null;
  const tooYoung = age !== null && age < minAge;

  const formatted =
    complete && age !== null
      ? new Date(Number(parts.y), Number(parts.m) - 1, Number(parts.d)).toLocaleDateString(
          locale,
          { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }
        )
      : '';

  const selectClass =
    'input w-full appearance-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed';

  return (
    <div className={className}>
      {showHelper && (
        <p className="text-xs text-text-muted mb-3">{t('birthDateSelect.helper')}</p>
      )}

      <div className="grid grid-cols-[1.35fr_0.85fr_1fr] gap-2 text-left">
        <label className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">
          {t('birthDateSelect.month')}
          <select
            value={parts.m}
            onChange={(e) => handleMonth(e.target.value)}
            className={`${selectClass} mt-1`}
            aria-label={t('birthDateSelect.month')}
          >
            <option value="">{t('birthDateSelect.month')}</option>
            {monthNames.map((name, i) => (
              <option key={name} value={String(i + 1)}>
                {name}
              </option>
            ))}
          </select>
        </label>

        <label className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">
          {t('birthDateSelect.day')}
          <select
            value={parts.d}
            onChange={(e) => handleDay(e.target.value)}
            disabled={!parts.m}
            className={`${selectClass} mt-1`}
            aria-label={t('birthDateSelect.day')}
          >
            <option value="">{t('birthDateSelect.day')}</option>
            {days.map((d) => (
              <option key={d} value={String(d)}>
                {d}
              </option>
            ))}
          </select>
        </label>

        <label className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">
          {t('birthDateSelect.year')}
          <select
            value={parts.y}
            onChange={(e) => handleYear(e.target.value)}
            disabled={!parts.m || !parts.d}
            className={`${selectClass} mt-1`}
            aria-label={t('birthDateSelect.year')}
          >
            <option value="">{t('birthDateSelect.year')}</option>
            {years.map((y) => (
              <option key={y} value={String(y)}>
                {y}
              </option>
            ))}
          </select>
        </label>
      </div>

      {complete && tooYoung && (
        <p className="text-sm font-medium text-red-400 mt-3" role="alert">
          {t('birthDateSelect.tooYoung', { age: minAge })}
        </p>
      )}

      {complete && !tooYoung && (
        <p className="text-sm font-medium text-accent-primary mt-3">
          {formatted}
          <span className="block text-xs font-normal text-text-muted mt-0.5">
            {t('birthDateSelect.ageLabel', { age })}
          </span>
        </p>
      )}
    </div>
  );
}
