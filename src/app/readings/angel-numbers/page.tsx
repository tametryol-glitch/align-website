'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Copy, Check, Share2 } from 'lucide-react';
import { lookupAngelNumber, type AngelNumberMeaning } from '@/lib/angelNumbers';
import { useAuthStore } from '@/stores/authStore';
import { PaywallGate } from '@/components/ui/PaywallGate';
import { MarkdownText } from '@/components/ui/MarkdownText';

const POPULAR_NUMBERS = ['111', '222', '333', '444', '555', '666', '777', '888', '999', '1111', '11', '22', '33'];

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text).catch(() => {});
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className="p-1.5 rounded-lg hover:bg-white/10 transition-colors flex-shrink-0"
      title={copied ? 'Copied!' : 'Copy'}
    >
      {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-text-muted" />}
    </button>
  );
}

export default function AngelNumbersPage() {
  const { profile } = useAuthStore();
  const firstName = (profile?.display_name || '').split(' ')[0] || 'friend';
  const [searchInput, setSearchInput] = useState('');
  const [result, setResult] = useState<AngelNumberMeaning | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [shareMsg, setShareMsg] = useState('');

  const handleSearch = (input?: string) => {
    const query = input || searchInput;
    if (!query.trim()) return;
    const found = lookupAngelNumber(query.trim());
    if (found) {
      setResult(found);
      setNotFound(false);
    } else {
      setResult(null);
      setNotFound(true);
    }
  };

  const selectPopular = (num: string) => {
    setSearchInput(num);
    const found = lookupAngelNumber(num);
    if (found) {
      setResult(found);
      setNotFound(false);
    }
  };

  const handleShare = async () => {
    if (!result) return;
    const shareText = `Angel Number ${result.number}: ${result.title}\n\n${result.meaning}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: `Angel Number ${result.number}`, text: shareText, url: window.location.href });
        return;
      } catch { /* user cancelled */ }
    }
    try {
      await navigator.clipboard.writeText(shareText);
      setShareMsg('Copied to clipboard!');
      setTimeout(() => setShareMsg(''), 2000);
    } catch {
      window.prompt('Copy this:', shareText);
    }
  };

  return (
    <PaywallGate feature="angel_numbers">
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <Link href="/readings" className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary mb-4">
        <ArrowLeft className="w-4 h-4" />
        Back to Readings
      </Link>

      <h1 className="text-2xl font-display font-bold text-text-primary mb-1">
        {'✨'} Angel Numbers
      </h1>
      <p className="text-text-secondary text-sm mb-6 leading-relaxed">
        Decode the messages the universe is sending you through repeating numbers
      </p>

      {/* Search Input */}
      <div className="card mb-6">
        <label className="text-sm font-semibold text-text-primary mb-2 block">
          What number do you keep seeing?
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value.replace(/[^0-9]/g, ''))}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
            placeholder="Enter a number (e.g. 444, 1111)"
            className="input flex-1 text-center text-lg tracking-widest"
            maxLength={6}
          />
          <button onClick={() => handleSearch()} className="btn-primary whitespace-nowrap px-6">
            Decode
          </button>
        </div>
      </div>

      {/* Popular Numbers */}
      <h3 className="text-sm font-semibold text-text-primary mb-2">Popular Angel Numbers</h3>
      <div className="flex flex-wrap gap-2 mb-6">
        {POPULAR_NUMBERS.map((num) => (
          <button
            key={num}
            onClick={() => selectPopular(num)}
            className={`px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
              searchInput === num
                ? 'border-accent-primary bg-accent-muted text-accent-primary'
                : 'border-border-primary bg-bg-card text-text-secondary hover:border-accent-primary/40'
            }`}
          >
            {num}
          </button>
        ))}
      </div>

      {/* Not Found */}
      {notFound && (
        <div className="card mb-6">
          <p className="text-text-secondary text-sm leading-relaxed">
            I do not have a specific reading for that number yet. Try entering the repeating pattern you are seeing (like 111, 222, 444) or a master number (11, 22, 33).
          </p>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="bg-gradient-cosmic rounded-2xl p-6 md:p-8 border border-accent-muted mb-6">
          {/* Number Display */}
          <div className="text-center mb-6">
            <span className="text-5xl font-display font-extrabold text-accent-secondary tracking-widest">
              {result.number}
            </span>
            <h2 className="text-lg font-display font-bold text-gold-primary mt-2">
              {result.title}
            </h2>
          </div>

          {/* Core Meaning */}
          <p className="text-text-primary italic text-sm mb-3">
            {firstName}, here is why you are seeing this number:
          </p>
          <div className="flex items-start gap-2 mb-6">
            <p className="text-text-secondary text-sm leading-relaxed flex-1">
              <MarkdownText text={result.meaning} />
            </p>
            <CopyBtn text={result.meaning} />
          </div>

          {/* Love Section */}
          <div className="bg-black/20 rounded-xl p-4 mb-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{'♥'}</span>
              <h3 className="text-sm font-semibold text-text-primary">Love & Relationships</h3>
            </div>
            <p className="text-text-secondary text-sm leading-relaxed">
              <MarkdownText text={result.love} />
            </p>
          </div>

          {/* Career Section */}
          <div className="bg-black/20 rounded-xl p-4 mb-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{'★'}</span>
              <h3 className="text-sm font-semibold text-text-primary">Career & Money</h3>
            </div>
            <p className="text-text-secondary text-sm leading-relaxed">
              <MarkdownText text={result.career} />
            </p>
          </div>

          {/* Spiritual Section */}
          <div className="bg-black/20 rounded-xl p-4 mb-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{'✨'}</span>
              <h3 className="text-sm font-semibold text-text-primary">Spiritual Message</h3>
            </div>
            <p className="text-text-secondary text-sm leading-relaxed">
              <MarkdownText text={result.spiritual} />
            </p>
          </div>

          {/* Personal Note */}
          <div className="border-t border-accent-muted pt-4 mt-3">
            <p className="text-text-tertiary text-sm italic leading-relaxed">
              {firstName}, the fact that you keep seeing {result.number} is not random. The universe does not waste a signal. This number found you because you are ready to receive its message. Pay attention to what you were thinking about or doing the moment you saw it — that context is part of the meaning.
            </p>
          </div>

          {/* Share Button */}
          <button
            onClick={handleShare}
            className="w-full mt-4 py-3.5 rounded-xl bg-[#2D1B69] border border-accent-primary/30 text-white text-sm font-semibold flex items-center justify-center gap-2 hover:bg-[#3D2B79] transition-colors"
          >
            <Share2 className="w-4 h-4" />
            Share Reading
          </button>
          {shareMsg && (
            <p className="text-green-400 text-xs text-center mt-2">{shareMsg}</p>
          )}
        </div>
      )}

      {/* Introductory Content (when no result) */}
      {!result && !notFound && (
        <div className="mt-4 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-text-primary mb-2">What Are Angel Numbers?</h3>
            <p className="text-text-secondary text-sm leading-relaxed mb-2">
              Angel numbers are repeating number sequences that carry messages from the spiritual realm. When you see the same number over and over — on clocks, license plates, receipts, phone numbers — it is not a coincidence. It is a form of divine communication.
            </p>
            <p className="text-text-secondary text-sm leading-relaxed">
              Each number carries its own vibration and meaning. By understanding what these numbers represent, you can decode the guidance the universe is constantly sending you.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-text-primary mb-2">How to Use This</h3>
            <p className="text-text-secondary text-sm leading-relaxed">
              Type in the number you keep seeing and tap &quot;Decode&quot; to receive a personalized interpretation covering what it means for your love life, career, and spiritual growth.
            </p>
          </div>
        </div>
      )}
    </div>
    </PaywallGate>
  );
}
