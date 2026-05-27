/**
 * Aura Mirror — Pattern Detection Service (Phase 4)
 *
 * Analyzes aura journal history to detect recurring patterns:
 *   - Dominant color trends over time
 *   - Mood <-> color correlations
 *   - Chakra focus frequency
 *   - Moon sign sensitivity
 *   - Color stability vs. volatility
 *
 * Uses ONLY existing aura_sessions data — no new APIs.
 * Pro-tier feature.
 */

import { createClient } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { AURA_COLORS } from '@/lib/auraColors';
import type { AuraColorName, MoodOption, ChakraName } from '@/types/aura';

// ── Pattern Result Types ──────────────────────────────────────────

export interface AuraPatternResult {
  /** Total scans analyzed */
  totalScans: number;
  /** Date range covered */
  dateRange: { from: string; to: string };
  /** Most common outer aura color */
  dominantColor: AuraColorName;
  /** How often the dominant color appears (0–1) */
  dominantColorFrequency: number;
  /** Top 3 outer colors with frequency */
  topColors: Array<{ color: AuraColorName; count: number; percent: number }>;
  /** Color stability: low = changes often, high = consistent */
  colorStability: number;
  /** Mood -> color correlations found */
  moodCorrelations: AuraMoodCorrelation[];
  /** Chakra patterns */
  chakraPatterns: AuraChakraPattern[];
  /** Moon sign sensitivity */
  moonSensitivity: AuraMoonSensitivity[];
  /** Narrative insights (pre-built text for UI) */
  insights: AuraPatternInsight[];
}

export interface AuraMoodCorrelation {
  mood: MoodOption;
  dominantColor: AuraColorName;
  occurrences: number;
  /** How strong the correlation is (0–1) */
  strength: number;
}

export interface AuraChakraPattern {
  chakra: ChakraName;
  frequency: number; // 0–1 how often this was the focus
  label: string;
}

export interface AuraMoonSensitivity {
  moonSign: string;
  dominantColor: AuraColorName;
  scansInSign: number;
}

export interface AuraPatternInsight {
  icon: string;
  title: string;
  description: string;
  type: 'dominant' | 'mood' | 'chakra' | 'moon' | 'stability' | 'trend';
}

// ── Chakra Labels ─────────────────────────────────────────────────

const CHAKRA_LABELS: Record<string, string> = {
  root: 'Root Chakra',
  sacral: 'Sacral Chakra',
  solar_plexus: 'Solar Plexus',
  heart: 'Heart Chakra',
  throat: 'Throat Chakra',
  third_eye: 'Third Eye',
  crown: 'Crown Chakra',
};

// ── Core Pattern Analysis ─────────────────────────────────────────

/**
 * Analyze the current user's aura journal history for patterns.
 * Requires at least 3 scans to produce meaningful results.
 * Returns null if insufficient data.
 */
export async function analyzeAuraPatterns(
  maxEntries: number = 50,
): Promise<AuraPatternResult | null> {
  const userId = useAuthStore.getState().user?.id;
  if (!userId) return null;

  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('aura_sessions')
      .select('outer_aura_color, inner_aura_color, emotional_core_color, chakra_focus, mood, moon_sign, scan_date')
      .eq('user_id', userId)
      .order('scan_date', { ascending: false })
      .limit(maxEntries);

    if (error || !data || data.length < 3) return null;

    const scans = data as Array<{
      outer_aura_color: AuraColorName;
      inner_aura_color: AuraColorName;
      emotional_core_color: AuraColorName;
      chakra_focus: ChakraName | null;
      mood: MoodOption | null;
      moon_sign: string | null;
      scan_date: string;
    }>;

    const totalScans = scans.length;
    const dateRange = {
      from: scans[scans.length - 1].scan_date,
      to: scans[0].scan_date,
    };

    // ── Color Frequency ──
    const colorCounts: Record<string, number> = {};
    for (const scan of scans) {
      const c = scan.outer_aura_color;
      colorCounts[c] = (colorCounts[c] || 0) + 1;
    }
    const sortedColors = Object.entries(colorCounts)
      .sort((a, b) => b[1] - a[1]);
    const dominantColor = (sortedColors[0]?.[0] || 'blue') as AuraColorName;
    const dominantColorFrequency = (sortedColors[0]?.[1] || 0) / totalScans;

    const topColors = sortedColors.slice(0, 3).map(([color, count]) => ({
      color: color as AuraColorName,
      count,
      percent: Math.round((count / totalScans) * 100),
    }));

    // ── Color Stability ──
    // How often consecutive scans share the same outer color
    let sameCount = 0;
    for (let i = 1; i < scans.length; i++) {
      if (scans[i].outer_aura_color === scans[i - 1].outer_aura_color) sameCount++;
    }
    const colorStability = scans.length > 1 ? sameCount / (scans.length - 1) : 1;

    // ── Mood → Color Correlations ──
    const moodColorMap: Record<string, Record<string, number>> = {};
    for (const scan of scans) {
      if (!scan.mood) continue;
      if (!moodColorMap[scan.mood]) moodColorMap[scan.mood] = {};
      const c = scan.outer_aura_color;
      moodColorMap[scan.mood][c] = (moodColorMap[scan.mood][c] || 0) + 1;
    }
    const moodCorrelations: AuraMoodCorrelation[] = [];
    for (const [mood, colors] of Object.entries(moodColorMap)) {
      const sorted = Object.entries(colors).sort((a, b) => b[1] - a[1]);
      if (sorted[0]) {
        const moodScans = Object.values(colors).reduce((a, b) => a + b, 0);
        moodCorrelations.push({
          mood: mood as MoodOption,
          dominantColor: sorted[0][0] as AuraColorName,
          occurrences: sorted[0][1],
          strength: sorted[0][1] / moodScans,
        });
      }
    }
    moodCorrelations.sort((a, b) => b.strength - a.strength);

    // ── Chakra Patterns ──
    const chakraCounts: Record<string, number> = {};
    for (const scan of scans) {
      if (!scan.chakra_focus) continue;
      chakraCounts[scan.chakra_focus] = (chakraCounts[scan.chakra_focus] || 0) + 1;
    }
    const totalChakraScans = Object.values(chakraCounts).reduce((a, b) => a + b, 0) || 1;
    const chakraPatterns: AuraChakraPattern[] = Object.entries(chakraCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([chakra, count]) => ({
        chakra: chakra as ChakraName,
        frequency: count / totalChakraScans,
        label: CHAKRA_LABELS[chakra] || chakra,
      }));

    // ── Moon Sign Sensitivity ──
    const moonColorMap: Record<string, Record<string, number>> = {};
    for (const scan of scans) {
      if (!scan.moon_sign) continue;
      if (!moonColorMap[scan.moon_sign]) moonColorMap[scan.moon_sign] = {};
      const c = scan.outer_aura_color;
      moonColorMap[scan.moon_sign][c] = (moonColorMap[scan.moon_sign][c] || 0) + 1;
    }
    const moonSensitivity: AuraMoonSensitivity[] = [];
    for (const [sign, colors] of Object.entries(moonColorMap)) {
      const sorted = Object.entries(colors).sort((a, b) => b[1] - a[1]);
      if (sorted[0]) {
        moonSensitivity.push({
          moonSign: sign,
          dominantColor: sorted[0][0] as AuraColorName,
          scansInSign: Object.values(colors).reduce((a, b) => a + b, 0),
        });
      }
    }
    moonSensitivity.sort((a, b) => b.scansInSign - a.scansInSign);

    // ── Build Insights ──
    const insights = buildInsights(
      dominantColor, dominantColorFrequency, colorStability,
      topColors, moodCorrelations, chakraPatterns, moonSensitivity,
      totalScans,
    );

    return {
      totalScans,
      dateRange,
      dominantColor,
      dominantColorFrequency,
      topColors,
      colorStability,
      moodCorrelations,
      chakraPatterns,
      moonSensitivity,
      insights,
    };
  } catch (err) {
    console.warn('[AuraPattern] Analysis failed:', err);
    return null;
  }
}

// ── Insight Generation ────────────────────────────────────────────

function buildInsights(
  dominantColor: AuraColorName,
  dominantFreq: number,
  stability: number,
  topColors: Array<{ color: AuraColorName; count: number; percent: number }>,
  moodCorrelations: AuraMoodCorrelation[],
  chakraPatterns: AuraChakraPattern[],
  moonSensitivity: AuraMoonSensitivity[],
  totalScans: number,
): AuraPatternInsight[] {
  const insights: AuraPatternInsight[] = [];
  const colorDef = AURA_COLORS[dominantColor];

  // Dominant color insight
  insights.push({
    icon: '🎨',
    title: `Your Signature Aura: ${colorDef.label}`,
    description: dominantFreq > 0.5
      ? `${colorDef.label} appears in ${Math.round(dominantFreq * 100)}% of your scans. This is your energetic baseline — the color you return to most naturally. Its themes of ${colorDef.keywords.slice(0, 2).join(' and ')} are deeply woven into your energy field.`
      : `${colorDef.label} is your most frequent color at ${Math.round(dominantFreq * 100)}% of scans, though your aura shows variety. You cycle through multiple energetic states.`,
    type: 'dominant',
  });

  // Stability insight
  insights.push({
    icon: stability > 0.5 ? '🏔' : '🌊',
    title: stability > 0.5 ? 'Steady Energy Pattern' : 'Dynamic Energy Pattern',
    description: stability > 0.7
      ? 'Your aura is remarkably consistent between scans. You carry a stable energetic foundation that others likely sense as groundedness or reliability.'
      : stability > 0.4
      ? 'Your aura shows moderate consistency with healthy variation. You maintain a center while still responding to life shifts.'
      : 'Your aura shifts frequently between scans. You are highly responsive to your environment, emotions, and cosmic weather. This sensitivity is a gift — it means your energy field is active and alive.',
    type: 'stability',
  });

  // Top mood correlation
  if (moodCorrelations.length > 0 && moodCorrelations[0].strength > 0.4) {
    const mc = moodCorrelations[0];
    const moodLabel = mc.mood.replace('_', ' ');
    const mcColor = AURA_COLORS[mc.dominantColor];
    insights.push({
      icon: '💭',
      title: `When You Feel ${moodLabel.charAt(0).toUpperCase() + moodLabel.slice(1)}`,
      description: `Your aura tends toward ${mcColor.label.toLowerCase()} when you report feeling ${moodLabel}. This appeared in ${mc.occurrences} of your scans. Your emotional state and energy field are closely linked in this pattern.`,
      type: 'mood',
    });
  }

  // Top chakra pattern
  if (chakraPatterns.length > 0 && chakraPatterns[0].frequency > 0.25) {
    const cp = chakraPatterns[0];
    insights.push({
      icon: '🧘',
      title: `${cp.label} Focus`,
      description: `Your ${cp.label.toLowerCase()} comes up as the focus in ${Math.round(cp.frequency * 100)}% of your readings. This energy center is consistently active for you — it may be where you process the most or where you hold the most power.`,
      type: 'chakra',
    });
  }

  // Moon sensitivity
  if (moonSensitivity.length > 0 && moonSensitivity[0].scansInSign >= 2) {
    const ms = moonSensitivity[0];
    const msColor = AURA_COLORS[ms.dominantColor];
    insights.push({
      icon: '🌙',
      title: `Moon in ${ms.moonSign} Influence`,
      description: `When the Moon transits ${ms.moonSign}, your aura gravitates toward ${msColor.label.toLowerCase()} energy. You had ${ms.scansInSign} scans during Moon in ${ms.moonSign}. You may be especially sensitive to this lunar placement.`,
      type: 'moon',
    });
  }

  // Color variety trend
  if (topColors.length >= 3) {
    const c2 = AURA_COLORS[topColors[1].color];
    const c3 = AURA_COLORS[topColors[2].color];
    insights.push({
      icon: '🌈',
      title: 'Your Color Palette',
      description: `Beyond your dominant color, ${c2.label.toLowerCase()} (${topColors[1].percent}%) and ${c3.label.toLowerCase()} (${topColors[2].percent}%) round out your palette. These secondary colors carry themes you explore regularly — they are part of your energetic range.`,
      type: 'trend',
    });
  }

  return insights;
}
