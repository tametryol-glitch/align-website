'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Sparkles, MessageCircle, X } from 'lucide-react';
import type { DatingMatch } from '@/lib/datingDiscoveryService';

interface MatchCelebrationProps {
  match: DatingMatch;
  currentUserName: string;
  currentUserAvatar: string | null;
  onStartChat: () => void;
  onDismiss: () => void;
}

const ZODIAC_GLYPHS: Record<string, string> = {
  Aries: '♈', Taurus: '♉', Gemini: '♊', Cancer: '♋',
  Leo: '♌', Virgo: '♍', Libra: '♎', Scorpio: '♏',
  Sagittarius: '♐', Capricorn: '♑', Aquarius: '♒', Pisces: '♓',
};

export function MatchCelebration({
  match,
  currentUserName,
  currentUserAvatar,
  onStartChat,
  onDismiss,
}: MatchCelebrationProps) {
  const [visible, setVisible] = useState(false);
  const partner = match.partner_profile;

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  const partnerPhoto = partner?.photo_urls?.[0] || partner?.avatar_url;
  const partnerName = partner?.display_name || 'Your Match';
  const score = match.compatibility_score;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center transition-all duration-500"
      style={{
        backgroundColor: 'rgba(0,0,0,0.85)',
        opacity: visible ? 1 : 0,
      }}
    >
      <button
        onClick={onDismiss}
        className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center"
        style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
      >
        <X size={20} color="#fff" />
      </button>

      <div className="text-center px-6 max-w-sm mx-auto" style={{
        transform: visible ? 'scale(1)' : 'scale(0.8)',
        transition: 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}>
        {/* Stars animation placeholder */}
        <div className="flex items-center justify-center gap-1 mb-6">
          <Sparkles size={20} color="#F5A623" className="animate-pulse" />
          <span className="text-gold-primary font-display text-lg">It&apos;s Written in the Stars</span>
          <Sparkles size={20} color="#F5A623" className="animate-pulse" />
        </div>

        {/* Avatars */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full overflow-hidden" style={{
              border: '3px solid #9B6FF6',
              boxShadow: '0 0 20px rgba(155,111,246,0.4)',
            }}>
              {currentUserAvatar ? (
                <Image src={currentUserAvatar} alt="You" fill className="object-cover" unoptimized />
              ) : (
                <div className="w-full h-full bg-accent-muted flex items-center justify-center">
                  <span className="text-2xl text-accent-primary">
                    {currentUserName?.[0]?.toUpperCase() || '✨'}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col items-center">
            <span className="text-3xl">💫</span>
            {score != null && (
              <span className="text-sm font-bold mt-1" style={{
                color: score >= 75 ? '#4ADE80' : score >= 55 ? '#FACC15' : '#FB923C',
              }}>
                {score}%
              </span>
            )}
          </div>

          <div className="relative">
            <div className="w-24 h-24 rounded-full overflow-hidden" style={{
              border: '3px solid #F5A623',
              boxShadow: '0 0 20px rgba(245,166,35,0.4)',
            }}>
              {partnerPhoto ? (
                <Image src={partnerPhoto} alt={partnerName} fill className="object-cover" unoptimized />
              ) : (
                <div className="w-full h-full bg-gold-muted flex items-center justify-center">
                  <span className="text-2xl text-gold-primary">
                    {partnerName[0]?.toUpperCase() || '✨'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Names */}
        <h2 className="text-xl font-bold text-white mb-1">
          {currentUserName} & {partnerName}
        </h2>

        {/* Signs */}
        {partner?.sun_sign && (
          <p className="text-sm text-text-tertiary mb-6">
            {ZODIAC_GLYPHS[partner.sun_sign]} {partner.sun_sign}
            {partner.moon_sign && ` · ☽ ${partner.moon_sign}`}
          </p>
        )}

        {/* CTA */}
        <button
          onClick={onStartChat}
          className="w-full py-3.5 rounded-2xl flex items-center justify-center gap-2 font-semibold transition-transform hover:scale-[1.02]"
          style={{
            background: 'linear-gradient(135deg, #9B6FF6, #7C3AED)',
            color: '#fff',
          }}
        >
          <MessageCircle size={18} />
          Say Hello
        </button>

        <button
          onClick={onDismiss}
          className="mt-3 text-sm text-text-muted hover:text-text-secondary transition-colors"
        >
          Keep Browsing
        </button>
      </div>
    </div>
  );
}
