'use client';

import { useState } from 'react';
import { api, buildBirthData } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import Link from 'next/link';
import { DollarSign, ArrowLeft } from 'lucide-react';
import { PaywallGate } from '@/components/ui/PaywallGate';

export default function FinancialPage() {
  const { profile } = useAuthStore();
  const [reading, setReading] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function getReading() {
    if (!profile?.birth_date || !profile?.latitude) {
      setError('Please add your birth data in your profile first.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data = await api.getFinancialReport(buildBirthData(profile));
      setReading(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <PaywallGate feature="financial">
    <div className="max-w-3xl mx-auto">
      <Link href="/readings" className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary mb-4">
        <ArrowLeft className="w-4 h-4" />
        Back to Readings
      </Link>
      <div className="flex items-center gap-3 mb-6">
        <DollarSign className="w-8 h-8 text-accent-primary" />
        <div>
          <h1 className="text-2xl font-display font-bold text-text-primary">Financial Astrology</h1>
          <p className="text-text-tertiary text-sm">Cosmic insights into wealth and resources</p>
        </div>
      </div>

      {!reading && (
        <div className="card text-center py-12">
          <span className="text-5xl block mb-4">$</span>
          <p className="text-text-tertiary mb-4">
            Analyze your 2nd, 8th, and 10th houses for financial patterns and timing.
          </p>
          <button onClick={getReading} disabled={loading} className="btn-primary">
            {loading ? 'Analyzing...' : 'Get Financial Report'}
          </button>
          {error && <p className="text-red-400 text-sm mt-4">{error}</p>}
        </div>
      )}

      {reading && (
        <div className="space-y-4">
          {reading.summary && (
            <div className="bg-gradient-cosmic rounded-2xl p-8 border border-accent-muted">
              <h2 className="text-xl font-display font-bold text-text-primary mb-3">Financial Summary</h2>
              <p className="text-text-secondary">{reading.summary}</p>
            </div>
          )}
          {reading.sections?.map((section: any, i: number) => (
            <div key={i} className="card">
              <h3 className="font-semibold text-text-primary mb-2">{section.title}</h3>
              <p className="text-sm text-text-secondary">{section.content}</p>
            </div>
          ))}
          <button onClick={() => setReading(null)} className="btn-secondary">
            New Report
          </button>
        </div>
      )}
    </div>
    </PaywallGate>
  );
}
