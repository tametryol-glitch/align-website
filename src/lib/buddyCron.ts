// Relationship Buddy nightly cron: pure helpers (no network), so they can be unit tested.
//
// The pair engine lives in align-api-v2 (Python / Swiss Ephemeris). The cron route only
// asks it to process one page of active pairs at a time.
//
// DRY RUN ONLY. `BUDDY_DRY_RUN` is a constant on purpose, not an env var: turning the Buddy on
// for real must be a reviewed code change, never a stray setting. In dry-run the API computes
// everything and writes NOTHING. It never pushes, in either mode.

export const BUDDY_DRY_RUN = true;
/** Pairs per API call: ~0.5-1 s each, and the API stops a page after 50 s anyway. */
export const BUDDY_PAGE = 25;
/** Hard stop so a runaway loop can never spin: 40 pages = 1,000 pairs per night. */
export const BUDDY_MAX_PAGES = 40;

export interface DispatchPage {
  considered?: number;
  processed?: number;
  skipped?: number;
  failed?: number;
  signals_inserted?: number;
  signals_updated?: number;
  messages?: number;
  blocked?: number;
  pushed?: number;
  failures?: string[];
  next_offset?: number | null;
}

export interface BuddyTotals {
  considered: number;
  processed: number;
  skipped: number;
  failed: number;
  wouldInsertSignals: number;
  wouldUpdateSignals: number;
  wouldWriteMessages: number;
  blocked: number;
  pushed: number;
}

export function emptyTotals(): BuddyTotals {
  return {
    considered: 0, processed: 0, skipped: 0, failed: 0,
    wouldInsertSignals: 0, wouldUpdateSignals: 0, wouldWriteMessages: 0, blocked: 0, pushed: 0,
  };
}

export function dispatchBody(offset: number) {
  return { offset, limit: BUDDY_PAGE, dry_run: BUDDY_DRY_RUN };
}

/** Add one API page to the running totals. Only counters are kept: the API's per-pair preview
 *  (which contains message text) is never copied into this route's response or logs. */
export function addPage(t: BuddyTotals, r: DispatchPage): BuddyTotals {
  return {
    considered: t.considered + (r.considered ?? 0),
    processed: t.processed + (r.processed ?? 0),
    skipped: t.skipped + (r.skipped ?? 0),
    failed: t.failed + (r.failed ?? 0),
    wouldInsertSignals: t.wouldInsertSignals + (r.signals_inserted ?? 0),
    wouldUpdateSignals: t.wouldUpdateSignals + (r.signals_updated ?? 0),
    wouldWriteMessages: t.wouldWriteMessages + (r.messages ?? 0),
    blocked: t.blocked + (r.blocked ?? 0),
    pushed: t.pushed + (r.pushed ?? 0),
  };
}

/** Where to read the next page, or null when done. Never goes backwards or stalls. */
export function nextOffset(current: number, r: DispatchPage): number | null {
  const n = r.next_offset;
  if (n === null || n === undefined) return null;
  return n > current ? n : null;
}
