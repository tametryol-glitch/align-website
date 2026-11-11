'use client';

// Animated birthday card: drifting balloons, falling confetti, twinkling stars, a
// glowing rotating ring around the celebrant's photo, shimmering title. With no photo
// it shows a soft gradient placeholder with their initial. Pure CSS motion, switched
// off for people who prefer reduced motion.

import { getInitial } from '@/lib/initials';

export interface BirthdayArtProps {
  name: string;
  avatarUrl?: string | null;
  belated?: boolean;
  headline?: string;
  emoji?: string;
  advice?: string;
  action?: string;
  moon?: string;
  /** Hero = full greeting screen (bigger avatar, no advice clamp). */
  hero?: boolean;
}

const CONFETTI = ['#f9a8d4', '#fcd34d', '#a5b4fc', '#6ee7b7', '#fda4af', '#c4b5fd'];
const BALLOONS = [
  { left: '6%', color: '#f472b6', delay: '0s', dur: '9s' },
  { left: '20%', color: '#fbbf24', delay: '2.5s', dur: '11s' },
  { left: '78%', color: '#a78bfa', delay: '1s', dur: '10s' },
  { left: '91%', color: '#34d399', delay: '4s', dur: '12s' },
];

export function BirthdayArt({ name, avatarUrl, belated, headline, emoji, advice, action, moon, hero }: BirthdayArtProps) {
  const first = (name || '').trim().split(/\s+/)[0] || 'Friend';
  const size = hero ? 132 : 92;
  return (
    <div className="bday-card" style={{ position: 'relative', overflow: 'hidden', borderRadius: 20 }}>
      <style>{CSS}</style>

      {/* stars */}
      {Array.from({ length: 14 }).map((_, i) => (
        <span
          key={`s${i}`}
          className="bday-star"
          style={{ left: `${(i * 37 + 11) % 100}%`, top: `${(i * 53 + 7) % 60}%`, animationDelay: `${(i % 5) * 0.6}s` }}
        />
      ))}

      {/* balloons */}
      {BALLOONS.map((b, i) => (
        <span key={`b${i}`} className="bday-balloon" style={{ left: b.left, animationDelay: b.delay, animationDuration: b.dur }}>
          <i style={{ background: b.color }} />
        </span>
      ))}

      {/* confetti */}
      {Array.from({ length: 26 }).map((_, i) => (
        <span
          key={`c${i}`}
          className="bday-confetti"
          style={{
            left: `${(i * 41 + 5) % 100}%`,
            background: CONFETTI[i % CONFETTI.length],
            animationDelay: `${(i % 9) * 0.55}s`,
            animationDuration: `${5 + (i % 5)}s`,
            width: 6 + (i % 3) * 2,
            height: 9 + (i % 4) * 2,
          }}
        />
      ))}

      <div style={{ position: 'relative', zIndex: 2, padding: hero ? '36px 22px 28px' : '26px 18px 20px', textAlign: 'center' }}>
        {/* avatar */}
        <div className="bday-avatar-wrap" style={{ width: size + 18, height: size + 18 }}>
          <span className="bday-ring" />
          <div className="bday-avatar" style={{ width: size, height: size }}>
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
            ) : (
              <span className="bday-initial" style={{ fontSize: size * 0.42 }}>{getInitial(name)}</span>
            )}
          </div>
          <span className="bday-hat" style={{ fontSize: size * 0.34 }}>🎉</span>
        </div>

        <p className="bday-kicker">{belated ? 'Belated' : 'Today'}</p>
        <h3 className="bday-title">Happy Birthday{belated ? '' : '!'}</h3>
        <p className="bday-name">{first}{belated ? ' 💛' : ' 🎂'}</p>

        {(headline || advice) && (
          <div className="bday-advice">
            <p className="bday-advice-head">{emoji || '✨'} Your year ahead: {headline}</p>
            {advice && <p className={hero ? 'bday-advice-body' : 'bday-advice-body bday-clamp'}>{advice}</p>}
            {action && <p className="bday-action">✨ Your move: {action}</p>}
            {hero && moon && <p className="bday-moon">🌙 {moon}</p>}
          </div>
        )}
      </div>
    </div>
  );
}

const CSS = `
.bday-card{background:linear-gradient(160deg,#2a1b4d 0%,#4b2a73 45%,#7a3a78 80%,#b9577a 100%);color:#fff}
.bday-card *{box-sizing:border-box}
.bday-star{position:absolute;width:3px;height:3px;border-radius:50%;background:#fff;opacity:.2;animation:bdayTwinkle 3s ease-in-out infinite}
.bday-balloon{position:absolute;bottom:-70px;width:26px;height:34px;animation:bdayFloat linear infinite;z-index:1;opacity:.85}
.bday-balloon i{display:block;width:100%;height:100%;border-radius:50% 50% 48% 48%;box-shadow:inset -5px -5px 0 rgba(0,0,0,.12),inset 4px 4px 0 rgba(255,255,255,.28)}
.bday-balloon:after{content:'';position:absolute;left:50%;top:100%;width:1px;height:26px;background:rgba(255,255,255,.5)}
.bday-confetti{position:absolute;top:-14px;border-radius:2px;opacity:.9;animation:bdayFall linear infinite;z-index:1}
.bday-avatar-wrap{position:relative;margin:0 auto 6px;display:flex;align-items:center;justify-content:center}
.bday-ring{position:absolute;inset:0;border-radius:50%;background:conic-gradient(from 0deg,#fcd34d,#f472b6,#a78bfa,#34d399,#fcd34d);animation:bdaySpin 6s linear infinite;filter:blur(.4px);box-shadow:0 0 28px rgba(252,211,77,.55)}
.bday-avatar{position:relative;border-radius:50%;background:linear-gradient(135deg,#a78bfa,#f9a8d4);display:flex;align-items:center;justify-content:center;border:4px solid #2a1b4d;overflow:hidden;animation:bdayPulse 3.2s ease-in-out infinite}
.bday-initial{font-weight:800;color:#fff;text-shadow:0 2px 10px rgba(0,0,0,.25)}
.bday-hat{position:absolute;top:-8px;right:-6px;animation:bdayWiggle 2.4s ease-in-out infinite}
.bday-kicker{margin:10px 0 0;font-size:11px;letter-spacing:.22em;text-transform:uppercase;color:#fcd34d;font-weight:700}
.bday-title{margin:2px 0 0;font-size:26px;font-weight:800;line-height:1.1;background:linear-gradient(90deg,#fff 0%,#fde68a 30%,#fbcfe8 60%,#fff 100%);background-size:220% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;animation:bdayShimmer 4s linear infinite}
.bday-name{margin:6px 0 0;font-size:20px;font-weight:700}
.bday-advice{margin:16px auto 0;max-width:430px;text-align:left;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.18);border-radius:14px;padding:12px 14px;backdrop-filter:blur(4px)}
.bday-advice-head{margin:0 0 6px;font-weight:700;font-size:13px;color:#fde68a}
.bday-advice-body{margin:0 0 8px;font-size:13px;line-height:1.5;color:rgba(255,255,255,.92)}
.bday-clamp{display:-webkit-box;-webkit-line-clamp:4;-webkit-box-orient:vertical;overflow:hidden}
.bday-action,.bday-moon{margin:0 0 6px;font-size:13px;line-height:1.5;color:#fff;font-weight:600}
.bday-moon{font-weight:500;color:rgba(255,255,255,.88)}
@keyframes bdayFall{0%{transform:translateY(0) rotate(0)}100%{transform:translateY(420px) rotate(560deg)}}
@keyframes bdayFloat{0%{transform:translateY(0) translateX(0)}50%{transform:translateY(-220px) translateX(10px)}100%{transform:translateY(-480px) translateX(-6px)}}
@keyframes bdaySpin{to{transform:rotate(360deg)}}
@keyframes bdayPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.035)}}
@keyframes bdayWiggle{0%,100%{transform:rotate(-12deg)}50%{transform:rotate(14deg) scale(1.1)}}
@keyframes bdayShimmer{0%{background-position:0% 0}100%{background-position:220% 0}}
@keyframes bdayTwinkle{0%,100%{opacity:.15;transform:scale(1)}50%{opacity:.95;transform:scale(1.8)}}
@media (prefers-reduced-motion:reduce){.bday-card *{animation:none!important}.bday-confetti,.bday-balloon{display:none}}
`;
