'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { generateCertificate, type CosmicCertificate } from '@/lib/cosmicCertificateService';
import { ArrowLeft, Share2 } from 'lucide-react';
import Link from 'next/link';

const SIGN_GLYPHS: Record<string, string> = {
  Aries: '♈', Taurus: '♉', Gemini: '♊', Cancer: '♋',
  Leo: '♌', Virgo: '♍', Libra: '♎', Scorpio: '♏',
  Sagittarius: '♐', Capricorn: '♑', Aquarius: '♒', Pisces: '♓',
};

export default function CertificatePage() {
  const { matchId } = useParams<{ matchId: string }>();
  const { user, isLoading: authLoading } = useAuthStore();
  const [cert, setCert] = useState<CosmicCertificate | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && user?.id && matchId) {
      generateCertificate(user.id, matchId).then(c => {
        setCert(c);
        setLoading(false);
      });
    }
  }, [authLoading, user?.id, matchId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center" style={{ minHeight: '60vh' }}>
        <div className="w-10 h-10 rounded-full border-2 border-accent-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!cert) {
    return (
      <div className="text-center py-20">
        <p className="text-text-tertiary mb-4">Certificate not available.</p>
        <Link href="/dating/matches" className="text-accent-primary text-sm">Back to Matches</Link>
      </div>
    );
  }

  const matchedDate = new Date(cert.matchedAt).toLocaleDateString(undefined, {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <div className="max-w-lg mx-auto" style={{ minHeight: '100vh' }}>
      <Link href="/dating/matches" className="inline-flex items-center gap-1 text-sm text-accent-primary mb-6">
        <ArrowLeft size={16} /> Back to Matches
      </Link>

      {/* Certificate card */}
      <div
        className="rounded-3xl p-8 text-center relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(30,36,58,0.98), rgba(20,24,38,0.98))',
          border: '2px solid rgba(155,111,246,0.3)',
          boxShadow: '0 0 60px rgba(155,111,246,0.1)',
        }}
      >
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-1" style={{ background: 'linear-gradient(90deg, #9B6FF6, #EC4899, #FACC15)' }} />

        <span className="text-4xl block mb-3">✨</span>
        <h1 className="text-xl font-bold text-white mb-1">Written in the Stars</h1>
        <p className="text-xs text-text-muted mb-6">A cosmic connection certificate</p>

        {/* Two profiles */}
        <div className="flex items-center justify-center gap-6 mb-6">
          <div className="text-center">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-2xl mb-2 mx-auto"
              style={{
                background: 'linear-gradient(135deg, rgba(155,111,246,0.2), rgba(155,111,246,0.05))',
                border: '2px solid rgba(155,111,246,0.4)',
              }}
            >
              {SIGN_GLYPHS[cert.userA.sunSign] || '★'}
            </div>
            <p className="text-sm font-semibold text-white">{cert.userA.name}</p>
            <p className="text-xs text-text-muted">{cert.userA.sunSign}</p>
          </div>

          <div className="flex flex-col items-center gap-1">
            <span className="text-2xl">💫</span>
            {cert.compatibilityScore != null && (
              <span
                className="text-lg font-bold"
                style={{
                  color: cert.compatibilityScore >= 70 ? '#4ADE80' : cert.compatibilityScore >= 50 ? '#FACC15' : '#F87171',
                }}
              >
                {cert.compatibilityScore}%
              </span>
            )}
          </div>

          <div className="text-center">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-2xl mb-2 mx-auto"
              style={{
                background: 'linear-gradient(135deg, rgba(236,72,153,0.2), rgba(236,72,153,0.05))',
                border: '2px solid rgba(236,72,153,0.4)',
              }}
            >
              {SIGN_GLYPHS[cert.userB.sunSign] || '★'}
            </div>
            <p className="text-sm font-semibold text-white">{cert.userB.name}</p>
            <p className="text-xs text-text-muted">{cert.userB.sunSign}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="rounded-xl py-3" style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}>
            <p className="text-lg font-bold text-white">{cert.daysConnected}</p>
            <p className="text-[10px] text-text-muted">Days Connected</p>
          </div>
          <div className="rounded-xl py-3" style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}>
            <p className="text-lg font-bold text-white">{cert.milestoneCount}</p>
            <p className="text-[10px] text-text-muted">Milestones</p>
          </div>
          <div className="rounded-xl py-3" style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}>
            <p className="text-lg font-bold text-white">{matchedDate.split(' ')[0]}</p>
            <p className="text-[10px] text-text-muted">Matched</p>
          </div>
        </div>

        {/* Highlights */}
        {cert.highlights.length > 0 && (
          <div className="space-y-2 mb-6">
            {cert.highlights.map((h, i) => (
              <div
                key={i}
                className="rounded-xl px-4 py-2.5 flex items-center gap-3"
                style={{ backgroundColor: 'rgba(155,111,246,0.06)', border: '1px solid rgba(155,111,246,0.1)' }}
              >
                <span className="text-lg">{h.icon}</span>
                <div className="text-left">
                  <p className="text-xs font-semibold text-white">{h.label}</p>
                  <p className="text-xs text-text-muted">{h.value}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <p className="text-xs text-text-muted italic">
          Connected on {matchedDate}
        </p>

        {/* Bottom decoration */}
        <div className="absolute bottom-0 left-0 w-full h-1" style={{ background: 'linear-gradient(90deg, #FACC15, #EC4899, #9B6FF6)' }} />
      </div>

      {/* Share button */}
      <button
        className="w-full mt-4 py-3.5 rounded-2xl flex items-center justify-center gap-2 font-semibold text-white"
        style={{ background: 'linear-gradient(135deg, #9B6FF6, #7C3AED)' }}
        onClick={() => {
          if (navigator.share) {
            navigator.share({
              title: `${cert.userA.name} & ${cert.userB.name} — Written in the Stars`,
              text: `Our cosmic compatibility: ${cert.compatibilityScore || '?'}% | ${cert.daysConnected} days connected`,
            }).catch(() => {});
          }
        }}
      >
        <Share2 size={16} /> Share Certificate
      </button>
    </div>
  );
}
