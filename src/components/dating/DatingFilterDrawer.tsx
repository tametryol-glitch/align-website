'use client';

import { useState } from 'react';
import { X, SlidersHorizontal } from 'lucide-react';
import {
  PRIMARY_INTENT_OPTIONS,
  RELATIONSHIP_STYLE_OPTIONS,
} from '@/lib/relationshipProfileService';

interface DatingFilters {
  minAge?: number;
  maxAge?: number;
  minCompatibility?: number;
  intentFilter?: string[];
  styleFilter?: string[];
}

interface DatingFilterDrawerProps {
  filters: DatingFilters;
  onApply: (filters: DatingFilters) => void;
  onClose: () => void;
  open: boolean;
}

export function DatingFilterDrawer({ filters, onApply, onClose, open }: DatingFilterDrawerProps) {
  const [local, setLocal] = useState<DatingFilters>({ ...filters });

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      <div className="relative w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6" style={{
        backgroundColor: '#1E2640',
        border: '1px solid rgba(155,111,246,0.2)',
      }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={18} color="#9B6FF6" />
            <h3 className="text-lg font-semibold text-white">Filters</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
            <X size={16} color="#A8B0C0" />
          </button>
        </div>

        {/* Age range */}
        <div className="mb-6">
          <label className="text-sm font-medium text-text-secondary mb-3 block">Age Range</label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min={18}
              max={99}
              placeholder="Min"
              value={local.minAge || ''}
              onChange={(e) => setLocal({ ...local, minAge: e.target.value ? Number(e.target.value) : undefined })}
              className="flex-1 px-3 py-2.5 rounded-xl text-sm text-white placeholder-text-muted outline-none"
              style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(61,71,96,0.5)' }}
            />
            <span className="text-text-muted">to</span>
            <input
              type="number"
              min={18}
              max={99}
              placeholder="Max"
              value={local.maxAge || ''}
              onChange={(e) => setLocal({ ...local, maxAge: e.target.value ? Number(e.target.value) : undefined })}
              className="flex-1 px-3 py-2.5 rounded-xl text-sm text-white placeholder-text-muted outline-none"
              style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(61,71,96,0.5)' }}
            />
          </div>
        </div>

        {/* Minimum compatibility */}
        <div className="mb-8">
          <label className="text-sm font-medium text-text-secondary mb-3 block">
            Minimum Compatibility: {local.minCompatibility || 0}%
          </label>
          <input
            type="range"
            min={0}
            max={90}
            step={5}
            value={local.minCompatibility || 0}
            onChange={(e) => setLocal({ ...local, minCompatibility: Number(e.target.value) || undefined })}
            className="w-full accent-accent-primary"
          />
          <div className="flex justify-between text-xs text-text-muted mt-1">
            <span>Any</span>
            <span>90%+</span>
          </div>
        </div>

        {/* Intent filter */}
        <div className="mb-6">
          <label className="text-sm font-medium text-text-secondary mb-3 block">Relationship Intent</label>
          <div className="flex flex-wrap gap-1.5">
            {PRIMARY_INTENT_OPTIONS.map(opt => {
              const selected = (local.intentFilter || []).includes(opt);
              return (
                <button
                  key={opt}
                  onClick={() => setLocal(prev => ({
                    ...prev,
                    intentFilter: selected
                      ? (prev.intentFilter || []).filter(v => v !== opt)
                      : [...(prev.intentFilter || []), opt],
                  }))}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    selected
                      ? 'bg-accent-primary text-white'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                  style={!selected ? { backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(61,71,96,0.5)' } : undefined}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>

        {/* Style filter */}
        <div className="mb-8">
          <label className="text-sm font-medium text-text-secondary mb-3 block">Relationship Style</label>
          <div className="flex flex-wrap gap-1.5">
            {RELATIONSHIP_STYLE_OPTIONS.filter(o => o !== 'Prefer not to say').map(opt => {
              const selected = (local.styleFilter || []).includes(opt);
              return (
                <button
                  key={opt}
                  onClick={() => setLocal(prev => ({
                    ...prev,
                    styleFilter: selected
                      ? (prev.styleFilter || []).filter(v => v !== opt)
                      : [...(prev.styleFilter || []), opt],
                  }))}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    selected
                      ? 'bg-accent-primary text-white'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                  style={!selected ? { backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(61,71,96,0.5)' } : undefined}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={() => { setLocal({}); onApply({}); }}
            className="flex-1 py-3 rounded-2xl text-sm font-medium text-text-secondary transition-colors"
            style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}
          >
            Reset
          </button>
          <button
            onClick={() => onApply(local)}
            className="flex-1 py-3 rounded-2xl text-sm font-semibold text-white transition-transform hover:scale-[1.02]"
            style={{ background: 'linear-gradient(135deg, #9B6FF6, #7C3AED)' }}
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
}
