import { ImageResponse } from 'next/og';
import type { NextRequest } from 'next/server';

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

    const column = (heading: string, count: string, age: string) => (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '480px' }}>
        <span style={{ fontSize: '18px', letterSpacing: '2px', color: '#7B849A', textTransform: 'uppercase' }}>
          {heading}
        </span>
        <span style={{ fontSize: '68px', fontWeight: 'bold', color: '#FFFFFF', marginTop: '8px' }}>{count}</span>
        <span style={{ fontSize: '26px', color: '#B8A0FA', marginTop: '6px' }}>{age}</span>
      </div>
    );

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
            background: 'linear-gradient(135deg, #1B1436 0%, #131829 60%, #0a0a14 100%)',
            fontFamily: 'sans-serif',
          }}
        >
          <span style={{ fontSize: '20px', letterSpacing: '6px', color: '#9B6FF6', fontWeight: 'bold' }}>
            SOUL AGE CALCULATOR
          </span>
          <span style={{ fontSize: '38px', color: '#FFFFFF', marginTop: '10px' }}>{label}</span>

          <div style={{ display: 'flex', alignItems: 'flex-start', marginTop: '44px' }}>
            {column('Universal Lifetimes', universalCount, universalAge)}
            <div style={{ display: 'flex', width: '1px', height: '150px', background: '#3A2F63' }} />
            {column('Earth Lifetimes', earthCount, earthAge)}
          </div>

          <span style={{ fontSize: '20px', color: '#7B849A', marginTop: '52px' }}>
            AlignCosmic · aligncosmic.com
          </span>
        </div>
      ),
      { width: 1200, height: 630 }
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
