import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const maxDuration = 60;

/**
 * POST /api/transcribe — forwards an audio clip to OpenAI Whisper and returns
 * word-level timestamps. The API key never reaches the browser.
 *
 * Body: multipart/form-data with `file` (audio), optional `language`.
 * Returns: { words: [{ word, start, end }], text }.
 */
export async function POST(request: NextRequest) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    return NextResponse.json(
      { error: 'Auto-captions are not configured yet. Add OPENAI_API_KEY to the server environment.' },
      { status: 503 },
    );
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const file = form.get('file');
  if (!(file instanceof Blob)) {
    return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
  }
  // Whisper hard limit is 25MB.
  if (file.size > 25 * 1024 * 1024) {
    return NextResponse.json({ error: 'Audio too large for transcription (max 25MB).' }, { status: 413 });
  }

  const oa = new FormData();
  oa.append('file', file, 'audio.m4a');
  oa.append('model', 'whisper-1');
  oa.append('response_format', 'verbose_json');
  oa.append('timestamp_granularities[]', 'word');
  const language = form.get('language');
  if (typeof language === 'string' && language) oa.append('language', language);

  try {
    const res = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}` },
      body: oa,
      signal: AbortSignal.timeout(55_000),
    });

    if (!res.ok) {
      const detail = (await res.text()).slice(0, 300);
      return NextResponse.json({ error: 'Transcription failed', detail }, { status: 502 });
    }

    const data = await res.json();
    const words = Array.isArray(data.words)
      ? data.words.map((w: { word: string; start: number; end: number }) => ({
          word: w.word,
          start: w.start,
          end: w.end,
        }))
      : [];
    return NextResponse.json({ words, text: data.text ?? '' });
  } catch (e) {
    return NextResponse.json(
      { error: 'Transcription request failed', detail: e instanceof Error ? e.message : 'unknown' },
      { status: 502 },
    );
  }
}
