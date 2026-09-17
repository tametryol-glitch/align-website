import { ImageResponse } from 'next/og';
import type { NextRequest } from 'next/server';
import { parseRelationshipSnapshot, synastryBand, SYNASTRY_CATEGORIES } from '@/lib/relationshipShare';

export const runtime = 'edge';

const SIGN_GLYPHS: Record<string, string> = {
  Aries: '♈', Taurus: '♉', Gemini: '♊', Cancer: '♋', Leo: '♌', Virgo: '♍',
  Libra: '♎', Scorpio: '♏', Sagittarius: '♐', Capricorn: '♑', Aquarius: '♒', Pisces: '♓',
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'default';

  if (type === 'compat') {
    const sign1 = searchParams.get('sign1') || 'Aries';
    const sign2 = searchParams.get('sign2') || 'Libra';
    const score = searchParams.get('score') || '78';

    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #0F1F4D 0%, #1E3A8A 50%, #7C3AED 100%)',
            fontFamily: 'sans-serif',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '40px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ fontSize: '72px' }}>{SIGN_GLYPHS[sign1] || '✦'}</span>
              <span style={{ color: '#DEE2EA', fontSize: '24px', marginTop: '8px' }}>{sign1}</span>
            </div>
            <span style={{ fontSize: '36px', color: '#9B6FF6' }}>♥</span>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ fontSize: '72px' }}>{SIGN_GLYPHS[sign2] || '✦'}</span>
              <span style={{ color: '#DEE2EA', fontSize: '24px', marginTop: '8px' }}>{sign2}</span>
            </div>
          </div>
          <span style={{ fontSize: '80px', fontWeight: 'bold', color: 'white' }}>{score}%</span>
          <span style={{ fontSize: '24px', color: '#A8B0C0', marginTop: '8px' }}>Compatible</span>
          <span style={{ fontSize: '18px', color: '#7B849A', marginTop: '32px' }}>align-web.vercel.app</span>
        </div>
      ),
      { width: 1200, height: 630 }
    );
  }

  if (type === 'horoscope') {
    const sign = searchParams.get('sign') || 'Aries';

    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #141826 0%, #1A2035 50%, #252D42 100%)',
            fontFamily: 'sans-serif',
          }}
        >
          <span style={{ fontSize: '120px' }}>{SIGN_GLYPHS[sign] || '✦'}</span>
          <span style={{ fontSize: '48px', fontWeight: 'bold', color: 'white', marginTop: '16px' }}>{sign}</span>
          <span style={{ fontSize: '24px', color: '#9B6FF6', marginTop: '8px' }}>Daily Horoscope</span>
          <span style={{ fontSize: '18px', color: '#7B849A', marginTop: '32px' }}>align-web.vercel.app</span>
        </div>
      ),
      { width: 1200, height: 630 }
    );
  }

  /**
   * Synastry / composite share cards. Params are parsed by the same codec the
   * /share page uses, so only names, scores, signs and aspect names can reach
   * the image — never birth data.
   */
  if (type === 'synastry' || type === 'composite') {
    const snap = parseRelationshipSnapshot((k) => searchParams.get(k));
    if (snap) {
      const logoUrl = new URL('/logo.png', request.url).toString();
      const names = `${snap.person1} & ${snap.person2}`;

      let body;
      if (snap.kind === 'synastry') {
        const band = synastryBand(snap.score);
        const top = SYNASTRY_CATEGORIES
          .map((c) => ({ label: c.label, score: snap.categories[c.key] ?? 0 }))
          .sort((x, y) => y.score - x.score)
          .slice(0, 3);
        body = (
          <div style={{ display: 'flex', alignItems: 'center', gap: '70px', marginTop: '36px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ fontSize: '120px', fontWeight: 'bold', color: 'white', lineHeight: 1 }}>{snap.score}%</span>
              <span style={{ fontSize: '30px', color: band.color, marginTop: '12px' }}>{band.label}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', width: '420px' }}>
              {top.map((c) => (
                <div key={c.label} style={{ display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '22px', color: '#DEE2EA' }}>
                    <span>{c.label}</span>
                    <span>{c.score}%</span>
                  </div>
                  <div style={{ display: 'flex', height: '12px', borderRadius: '6px', background: 'rgba(255,255,255,0.12)', marginTop: '6px' }}>
                    <div style={{ display: 'flex', width: `${c.score}%`, height: '12px', borderRadius: '6px', background: 'linear-gradient(90deg, #7C3AED, #C4B5FD)' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      } else {
        const trio: Array<[string, string | null]> = [['Sun', snap.sun], ['Moon', snap.moon], ['Rising', snap.rising]];
        body = (
          <div style={{ display: 'flex', gap: '80px', marginTop: '40px' }}>
            {trio.filter(([, s]) => s).map(([label, sign]) => (
              <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ fontSize: '96px', color: 'white' }}>{SIGN_GLYPHS[sign as string] || '✦'}</span>
                <span style={{ fontSize: '32px', color: 'white', marginTop: '8px' }}>{sign}</span>
                <span style={{ fontSize: '20px', color: '#9B6FF6', letterSpacing: '3px', textTransform: 'uppercase', marginTop: '4px' }}>{label}</span>
              </div>
            ))}
          </div>
        );
      }

      return new ImageResponse(
        (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, #1B1436 0%, #2D1B69 55%, #0a0a14 100%)',
              fontFamily: 'sans-serif',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={logoUrl} width={56} height={56} style={{ borderRadius: 14 }} alt="Align" />
              <span style={{ fontSize: '24px', letterSpacing: '6px', color: '#9B6FF6', fontWeight: 'bold' }}>
                {snap.kind === 'synastry' ? 'SYNASTRY' : 'COMPOSITE CHART'}
              </span>
            </div>
            <span style={{ fontSize: '56px', color: 'white', fontWeight: 'bold', marginTop: '20px' }}>{names}</span>
            {body}
            <span style={{ fontSize: '20px', color: '#7B849A', marginTop: '44px' }}>aligncosmic.com</span>
          </div>
        ),
        { width: 1200, height: 630 }
      );
    }
  }

  if (type === 'chart') {
    const sun = searchParams.get('sun') || 'Leo';
    const moon = searchParams.get('moon') || '';
    const rising = searchParams.get('rising') || '';

    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #0F1F4D 0%, #1E3A8A 100%)',
            fontFamily: 'sans-serif',
          }}
        >
          <span style={{ fontSize: '96px' }}>{SIGN_GLYPHS[sun] || '✦'}</span>
          <span style={{ fontSize: '40px', fontWeight: 'bold', color: 'white', marginTop: '16px' }}>
            {sun} Sun{moon ? ` · ${moon} Moon` : ''}{rising ? ` · ${rising} Rising` : ''}
          </span>
          <span style={{ fontSize: '24px', color: '#9B6FF6', marginTop: '12px' }}>Birth Chart on Align</span>
          <span style={{ fontSize: '18px', color: '#7B849A', marginTop: '32px' }}>align-web.vercel.app</span>
        </div>
      ),
      { width: 1200, height: 630 }
    );
  }

  /**
   * Soul Age share card (§18).
   *
   * Accepts ONLY the six permitted fields — a display label, the two Soul Ages
   * and their two lifetime counts. Birth date, birth time, birthplace,
   * coordinates and every chart placement are deliberately absent, and must
   * never be added: this URL is shared publicly.
   */
  if (type === 'soul-age') {
    const label = (searchParams.get('label') || 'Anonymous').slice(0, 40);
    const universalAge = (searchParams.get('uAge') || '').slice(0, 40);
    const universalCount = (searchParams.get('uCount') || '0').slice(0, 20);
    const earthAge = (searchParams.get('eAge') || '').slice(0, 40);
    const earthCount = (searchParams.get('eCount') || '0').slice(0, 20);

    // format=story → 1080×1920 portrait for TikTok / Reels / Stories and photo
    // downloads. Default → 1200×630 landscape for link-preview cards.
    const portrait = searchParams.get('format') === 'story';
    const W = portrait ? 1080 : 1200;
    const H = portrait ? 1920 : 630;

    // The Align logo, fetched from the same origin at render time. It is the
    // brand mark on every shared card — keep it prominent.
    const logoUrl = new URL('/logo.png', request.url).toString();
    const logoSize = portrait ? 190 : 96;

    const column = (heading: string, count: string, age: string) => (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: portrait ? '860px' : '480px',
        }}
      >
        <span style={{ fontSize: portrait ? 30 : 18, letterSpacing: '2px', color: '#7B849A', textTransform: 'uppercase' }}>
          {heading}
        </span>
        <span style={{ fontSize: portrait ? 132 : 68, fontWeight: 'bold', color: '#FFFFFF', marginTop: portrait ? 10 : 8 }}>
          {count}
        </span>
        <span style={{ fontSize: portrait ? 42 : 26, color: '#B8A0FA', marginTop: portrait ? 10 : 6 }}>{age}</span>
      </div>
    );

    const divider = portrait
      ? <div style={{ display: 'flex', width: '520px', height: '1px', background: '#3A2F63', margin: '54px 0' }} />
      : <div style={{ display: 'flex', width: '1px', height: '150px', background: '#3A2F63' }} />;

    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: portrait ? 'space-between' : 'center',
            padding: portrait ? '150px 0 120px' : '0',
            background: 'linear-gradient(135deg, #1B1436 0%, #131829 60%, #0a0a14 100%)',
            fontFamily: 'sans-serif',
          }}
        >
          {/* Brand lockup: logo + wordmark */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={logoUrl}
              width={logoSize}
              height={logoSize}
              style={{ borderRadius: portrait ? 44 : 22 }}
              alt="Align"
            />
            <span style={{ fontSize: portrait ? 30 : 20, letterSpacing: '6px', color: '#9B6FF6', fontWeight: 'bold', marginTop: portrait ? 26 : 14 }}>
              SOUL AGE CALCULATOR
            </span>
            <span style={{ fontSize: portrait ? 58 : 38, color: '#FFFFFF', marginTop: portrait ? 16 : 10 }}>{label}</span>
          </div>

          {portrait ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {column('Universal Lifetimes', universalCount, universalAge)}
              {divider}
              {column('Earth Lifetimes', earthCount, earthAge)}
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'flex-start', marginTop: '40px' }}>
              {column('Universal Lifetimes', universalCount, universalAge)}
              {divider}
              {column('Earth Lifetimes', earthCount, earthAge)}
            </div>
          )}

          <span style={{ fontSize: portrait ? 30 : 20, color: '#7B849A', marginTop: portrait ? 0 : 48 }}>
            AlignCosmic · aligncosmic.com
          </span>
        </div>
      ),
      { width: W, height: H }
    );
  }

  // Default OG image
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #141826 0%, #1E3A8A 100%)',
          fontFamily: 'sans-serif',
        }}
      >
        <span style={{ fontSize: '80px', color: '#9B6FF6' }}>✦</span>
        <span style={{ fontSize: '56px', fontWeight: 'bold', color: 'white', marginTop: '16px' }}>Align</span>
        <span style={{ fontSize: '24px', color: '#A8B0C0', marginTop: '12px' }}>AI Astrology & Cosmic Compatibility</span>
        <span style={{ fontSize: '18px', color: '#7B849A', marginTop: '32px' }}>26+ Readings · Natal Charts · Community</span>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
