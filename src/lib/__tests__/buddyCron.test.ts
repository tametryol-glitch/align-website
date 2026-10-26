import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import {
  BUDDY_DRY_RUN, BUDDY_MAX_PAGES, BUDDY_PAGE, addPage, dispatchBody, emptyTotals, nextOffset,
} from '../buddyCron';
import { GET } from '../../app/api/cron/buddy/route';
import vercel from '../../../vercel.json';

describe('buddyCron helpers', () => {
  it('is hard-wired to dry run (turning it on must be a reviewed code change)', () => {
    expect(BUDDY_DRY_RUN).toBe(true);
    expect(dispatchBody(0).dry_run).toBe(true);
    expect(dispatchBody(75)).toEqual({ offset: 75, limit: BUDDY_PAGE, dry_run: true, ai_probe: true });
  });

  it('adds pages into counters and renames them as "would" numbers', () => {
    let t = emptyTotals();
    t = addPage(t, { considered: 25, processed: 24, skipped: 1, signals_inserted: 10, signals_updated: 5, messages: 7, blocked: 0, pushed: 0 });
    t = addPage(t, { considered: 3, processed: 3, failed: 1, signals_inserted: 2, messages: 1 });
    expect(t).toEqual({
      considered: 28, processed: 27, skipped: 1, failed: 1,
      wouldInsertSignals: 12, wouldUpdateSignals: 5, wouldWriteMessages: 8, blocked: 0, pushed: 0,
      aiOk: 0, aiFailed: 0,
    });
  });

  it('counts the model probe', () => {
    const t = addPage(addPage(emptyTotals(), { ai_ok: 2, ai_failed: 1 }), { ai_ok: 1 });
    expect(t.aiOk).toBe(3);
    expect(t.aiFailed).toBe(1);
  });

  it('tolerates missing fields', () => {
    expect(addPage(emptyTotals(), {})).toEqual(emptyTotals());
  });

  it('does not mutate the previous totals', () => {
    const t = emptyTotals();
    addPage(t, { considered: 9 });
    expect(t.considered).toBe(0);
  });

  it('nextOffset stops on null, undefined, a stall, or going backwards', () => {
    expect(nextOffset(0, { next_offset: 25 })).toBe(25);
    expect(nextOffset(25, { next_offset: null })).toBeNull();
    expect(nextOffset(25, {})).toBeNull();
    expect(nextOffset(25, { next_offset: 25 })).toBeNull();
    expect(nextOffset(25, { next_offset: 10 })).toBeNull();
  });
});

describe('vercel.json', () => {
  it('schedules /api/cron/buddy once, daily', () => {
    const entries = (vercel as { crons: { path: string; schedule: string }[] }).crons.filter((c) => c.path === '/api/cron/buddy');
    expect(entries).toHaveLength(1);
    expect(entries[0].schedule).toMatch(/^\d+ \d+ \* \* \*$/);
  });

  it('did not disturb the other crons', () => {
    const paths = (vercel as { crons: { path: string }[] }).crons.map((c) => c.path);
    for (const p of ['/api/cron/stations', '/api/cron/send-emails', '/api/cron/purpose-checkin', '/api/cron/call-sweep']) {
      expect(paths).toContain(p);
    }
    expect(new Set(paths).size).toBe(paths.length);
  });
});

describe('GET /api/cron/buddy', () => {
  const req = (auth?: string) =>
    new NextRequest('http://localhost/api/cron/buddy', { headers: auth ? { authorization: auth } : {} });
  let fetchMock: ReturnType<typeof vi.fn>;
  const OLD = { ...process.env };

  beforeEach(() => {
    process.env.CRON_SECRET = 's3cret';
    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
  });
  afterEach(() => {
    process.env = { ...OLD };
    vi.unstubAllGlobals();
  });

  it('fails closed without a configured secret', async () => {
    delete process.env.CRON_SECRET;
    const r = await GET(req('Bearer anything'));
    expect(r.status).toBe(500);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('rejects a missing or wrong bearer without calling the API', async () => {
    expect((await GET(req())).status).toBe(401);
    expect((await GET(req('Bearer nope'))).status).toBe(401);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('pages through the API with dry_run true and the cron secret header', async () => {
    fetchMock
      .mockResolvedValueOnce(new Response(JSON.stringify({ considered: 25, processed: 25, messages: 4, signals_inserted: 11, next_offset: 25 })))
      .mockResolvedValueOnce(new Response(JSON.stringify({ considered: 10, processed: 9, skipped: 1, messages: 2, signals_inserted: 3, next_offset: null })));
    const res = await GET(req('Bearer s3cret'));
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body).toMatchObject({
      ok: true, dryRun: true, pages: 2, considered: 35, processed: 34, skipped: 1,
      wouldInsertSignals: 14, wouldWriteMessages: 6, pushed: 0,
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    fetchMock.mock.calls.forEach((call, i) => {
      const [url, init] = call as [string, RequestInit];
      expect(url).toMatch(/\/buddy\/dispatch$/);
      expect(init.method).toBe('POST');
      expect((init.headers as Record<string, string>)['X-Cron-Secret']).toBe('s3cret');
      expect(JSON.parse(init.body as string)).toEqual({ offset: i === 0 ? 0 : 25, limit: BUDDY_PAGE, dry_run: true, ai_probe: true });
    });
  });

  it('reports model errors as short codes only', async () => {
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({ considered: 1, ai_ok: 0, ai_failed: 2, ai_errors: ['call failed: RuntimeError'], next_offset: null })));
    const body = await (await GET(req('Bearer s3cret'))).json();
    expect(body.aiFailed).toBe(2);
    expect(body.aiErrors).toEqual(['call failed: RuntimeError']);
  });

  it('never copies per-pair previews (message text, names) into its response', async () => {
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({
      considered: 1, processed: 1, messages: 1, next_offset: null,
      pairs: [{ preview: [{ body: 'PRIVATE TEXT about Alex and Sam' }] }],
    })));
    const text = await (await GET(req('Bearer s3cret'))).text();
    expect(text).not.toContain('PRIVATE TEXT');
    expect(text).not.toContain('Alex');
    expect(text).not.toContain('preview');
  });

  it('stops on a stalled offset instead of looping', async () => {
    fetchMock.mockImplementation(async () => new Response(JSON.stringify({ considered: 1, next_offset: 0 })));
    const body = await (await GET(req('Bearer s3cret'))).json();
    expect(body.pages).toBe(1);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('is capped at BUDDY_MAX_PAGES', async () => {
    let off = 0;
    fetchMock.mockImplementation(async () => new Response(JSON.stringify({ considered: 1, next_offset: (off += 25) })));
    const body = await (await GET(req('Bearer s3cret'))).json();
    expect(body.pages).toBe(BUDDY_MAX_PAGES);
    expect(fetchMock).toHaveBeenCalledTimes(BUDDY_MAX_PAGES);
  });

  it('reports an API failure as a 500 with the status, without leaking the secret', async () => {
    fetchMock.mockResolvedValueOnce(new Response('upstream exploded', { status: 502 }));
    const res = await GET(req('Bearer s3cret'));
    const text = await res.text();
    expect(res.status).toBe(500);
    expect(text).toContain('502');
    expect(text).not.toContain('s3cret');
  });
});
