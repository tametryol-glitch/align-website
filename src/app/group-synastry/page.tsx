'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { Users, Search, Plus, X, Flame, Mountain, Wind, Droplets } from 'lucide-react';

interface Member {
  id: string;
  display_name: string;
  avatar_url: string | null;
  sun_sign: string | null;
  moon_sign: string | null;
  rising_sign: string | null;
}

const SIGN_ELEMENTS: Record<string, string> = {
  Aries: 'Fire', Leo: 'Fire', Sagittarius: 'Fire',
  Taurus: 'Earth', Virgo: 'Earth', Capricorn: 'Earth',
  Gemini: 'Air', Libra: 'Air', Aquarius: 'Air',
  Cancer: 'Water', Scorpio: 'Water', Pisces: 'Water',
};

const SIGN_MODALITIES: Record<string, string> = {
  Aries: 'Cardinal', Cancer: 'Cardinal', Libra: 'Cardinal', Capricorn: 'Cardinal',
  Taurus: 'Fixed', Leo: 'Fixed', Scorpio: 'Fixed', Aquarius: 'Fixed',
  Gemini: 'Mutable', Virgo: 'Mutable', Sagittarius: 'Mutable', Pisces: 'Mutable',
};

const ELEMENT_COLORS: Record<string, string> = {
  Fire: 'bg-red-500',
  Earth: 'bg-amber-700',
  Air: 'bg-sky-400',
  Water: 'bg-blue-600',
};

const ELEMENT_ICONS: Record<string, typeof Flame> = {
  Fire: Flame,
  Earth: Mountain,
  Air: Wind,
  Water: Droplets,
};

const GROUP_VIBES: Record<string, string> = {
  Fire: 'This group is a powerhouse of action, passion, and creative inspiration.',
  Earth: 'This group is grounded, practical, and focused on building lasting results.',
  Air: 'This group thrives on communication, ideas, and intellectual connection.',
  Water: 'This group is emotionally deep, intuitive, and profoundly empathetic.',
};

function computeGroupAnalysis(members: Member[]) {
  const elements: Record<string, number> = { Fire: 0, Earth: 0, Air: 0, Water: 0 };
  const modalities: Record<string, number> = { Cardinal: 0, Fixed: 0, Mutable: 0 };

  for (const member of members) {
    const signs = [member.sun_sign, member.moon_sign, member.rising_sign];
    for (const sign of signs) {
      if (sign && SIGN_ELEMENTS[sign]) {
        elements[SIGN_ELEMENTS[sign]]++;
      }
      if (sign && SIGN_MODALITIES[sign]) {
        modalities[SIGN_MODALITIES[sign]]++;
      }
    }
  }

  const totalElements = Object.values(elements).reduce((a, b) => a + b, 0);
  const totalModalities = Object.values(modalities).reduce((a, b) => a + b, 0);

  const dominantElement = Object.entries(elements).sort((a, b) => b[1] - a[1])[0];
  const dominantModality = Object.entries(modalities).sort((a, b) => b[1] - a[1])[0];

  return { elements, modalities, totalElements, totalModalities, dominantElement, dominantModality };
}

export default function GroupSynastryPage() {
  const { user } = useAuthStore();
  const [members, setMembers] = useState<Member[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Member[]>([]);
  const [searching, setSearching] = useState(false);

  async function searchUsers(query: string) {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    const supabase = createClient();
    const { data } = await supabase
      .from('profiles')
      .select('id, display_name, avatar_url, sun_sign, moon_sign, rising_sign')
      .ilike('display_name', `%${query}%`)
      .neq('id', user?.id || '')
      .limit(10);

    if (data) setSearchResults(data as Member[]);
    setSearching(false);
  }

  useEffect(() => {
    const timeout = setTimeout(() => searchUsers(searchQuery), 300);
    return () => clearTimeout(timeout);
  }, [searchQuery]);

  function addMember(member: Member) {
    if (!members.find((m) => m.id === member.id)) {
      setMembers([...members, member]);
    }
    setSearchQuery('');
    setSearchResults([]);
  }

  function removeMember(id: string) {
    setMembers(members.filter((m) => m.id !== id));
  }

  const analysis = members.length >= 2 ? computeGroupAnalysis(members) : null;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Users className="w-8 h-8 text-accent-primary" />
        <div>
          <h1 className="text-2xl font-display font-bold text-text-primary">Group Synastry</h1>
          <p className="text-text-tertiary text-sm">Analyze your group&apos;s cosmic chemistry</p>
        </div>
      </div>

      {/* Search & Add Members */}
      <div className="card mb-6">
        <h2 className="text-sm font-semibold text-text-primary mb-3">Add Members</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search users by name..."
            className="input pl-10 w-full"
          />
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="mt-2 border border-border-primary rounded-xl overflow-hidden">
            {searchResults.map((result) => (
              <button
                key={result.id}
                onClick={() => addMember(result)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-bg-tertiary transition-colors text-left"
              >
                <div className="w-8 h-8 rounded-full bg-bg-tertiary overflow-hidden flex-shrink-0">
                  {result.avatar_url ? (
                    <img src={result.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-text-muted text-xs font-bold">
                      {result.display_name?.[0] || '?'}
                    </div>
                  )}
                </div>
                <span className="text-sm text-text-primary">{result.display_name}</span>
                {result.sun_sign && <span className="text-xs text-accent-primary ml-auto">{result.sun_sign}</span>}
                <Plus className="w-4 h-4 text-text-muted" />
              </button>
            ))}
          </div>
        )}
        {searching && <p className="text-xs text-text-muted mt-2">Searching...</p>}
      </div>

      {/* Member Grid */}
      {members.length > 0 && (
        <div className="card mb-6">
          <h2 className="text-sm font-semibold text-text-primary mb-3">
            Members ({members.length})
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {members.map((member) => (
              <div key={member.id} className="relative bg-bg-tertiary rounded-xl p-3 text-center">
                <button
                  onClick={() => removeMember(member.id)}
                  className="absolute top-1 right-1 p-1 text-text-muted hover:text-red-400 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
                <div className="w-10 h-10 rounded-full bg-bg-secondary mx-auto mb-2 overflow-hidden">
                  {member.avatar_url ? (
                    <img src={member.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-text-muted text-sm font-bold">
                      {member.display_name?.[0] || '?'}
                    </div>
                  )}
                </div>
                <p className="text-xs font-medium text-text-primary truncate">{member.display_name}</p>
                <div className="mt-1 space-y-0.5">
                  {member.sun_sign && (
                    <p className="text-[10px] text-text-muted">Sun: {member.sun_sign}</p>
                  )}
                  {member.moon_sign && (
                    <p className="text-[10px] text-text-muted">Moon: {member.moon_sign}</p>
                  )}
                  {member.rising_sign && (
                    <p className="text-[10px] text-text-muted">Rising: {member.rising_sign}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Analysis Results */}
      {analysis && (
        <div className="space-y-4">
          {/* Group Vibe */}
          <div className="card">
            <h2 className="text-sm font-semibold text-text-primary mb-2">Group Vibe</h2>
            <p className="text-text-secondary text-sm">
              {GROUP_VIBES[analysis.dominantElement[0]]}
            </p>
          </div>

          {/* Element Distribution */}
          <div className="card">
            <h2 className="text-sm font-semibold text-text-primary mb-3">Element Distribution</h2>
            <div className="flex h-6 rounded-full overflow-hidden mb-3">
              {Object.entries(analysis.elements).map(([element, count]) => {
                const pct = analysis.totalElements > 0 ? (count / analysis.totalElements) * 100 : 0;
                if (pct === 0) return null;
                return (
                  <div
                    key={element}
                    className={`${ELEMENT_COLORS[element]} transition-all`}
                    style={{ width: `${pct}%` }}
                    title={`${element}: ${Math.round(pct)}%`}
                  />
                );
              })}
            </div>
            <div className="grid grid-cols-4 gap-2">
              {Object.entries(analysis.elements).map(([element, count]) => {
                const Icon = ELEMENT_ICONS[element];
                return (
                  <div key={element} className="text-center">
                    <Icon className={`w-5 h-5 mx-auto mb-1 ${
                      element === analysis.dominantElement[0] ? 'text-accent-primary' : 'text-text-muted'
                    }`} />
                    <p className="text-xs text-text-primary font-medium">{element}</p>
                    <p className="text-[10px] text-text-muted">{count} placements</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Modality Distribution */}
          <div className="card">
            <h2 className="text-sm font-semibold text-text-primary mb-3">Modality Distribution</h2>
            <div className="space-y-2">
              {Object.entries(analysis.modalities).map(([modality, count]) => {
                const pct = analysis.totalModalities > 0 ? (count / analysis.totalModalities) * 100 : 0;
                const isDominant = modality === analysis.dominantModality[0];
                return (
                  <div key={modality} className="flex items-center gap-3">
                    <span className={`text-xs w-16 ${isDominant ? 'text-text-primary font-semibold' : 'text-text-muted'}`}>
                      {modality}
                    </span>
                    <div className="flex-1 h-2 bg-bg-tertiary rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${isDominant ? 'bg-accent-primary' : 'bg-text-muted/30'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs text-text-muted w-8 text-right">{Math.round(pct)}%</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Dominant Summary */}
          <div className="card bg-bg-tertiary">
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-xs text-text-muted mb-1">Dominant Element</p>
                <p className="text-sm font-semibold text-accent-primary">{analysis.dominantElement[0]}</p>
              </div>
              <div className="w-px h-8 bg-border-primary" />
              <div className="text-center">
                <p className="text-xs text-text-muted mb-1">Dominant Modality</p>
                <p className="text-sm font-semibold text-accent-primary">{analysis.dominantModality[0]}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {members.length < 2 && members.length > 0 && (
        <div className="card text-center py-8">
          <p className="text-text-tertiary text-sm">Add at least 2 members to see group analysis.</p>
        </div>
      )}

      {members.length === 0 && (
        <div className="card text-center py-12">
          <p className="text-text-tertiary">Search and add members above to analyze your group&apos;s cosmic chemistry.</p>
        </div>
      )}
    </div>
  );
}
