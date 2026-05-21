import { createClient } from '@/lib/supabase';

export interface DatingMilestone {
  id: string;
  match_id: string;
  milestone_type: string;
  achieved_at: string;
  cosmic_snapshot: Record<string, any>;
  notes: string | null;
  created_at: string;
}

export const MILESTONE_CONFIG: Record<string, { label: string; icon: string; description: string }> = {
  first_message: { label: 'First Message', icon: '💬', description: 'Started the conversation' },
  first_call: { label: 'First Call', icon: '📞', description: 'Heard each other\'s voice' },
  first_date: { label: 'First Date', icon: '🌹', description: 'Met in person' },
  one_week: { label: 'One Week', icon: '🌟', description: 'A week of connection' },
  one_month: { label: 'One Month', icon: '🌙', description: 'A full lunar cycle together' },
  three_months: { label: 'Three Months', icon: '✨', description: 'A season of growth' },
  exclusive: { label: 'Exclusive', icon: '💎', description: 'Chose each other' },
  anniversary: { label: 'Anniversary', icon: '🎆', description: 'A year written in the stars' },
  custom: { label: 'Custom Moment', icon: '📝', description: 'A moment worth remembering' },
};

export async function getMilestones(matchId: string): Promise<DatingMilestone[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from('dating_milestones')
    .select('*')
    .eq('match_id', matchId)
    .order('achieved_at', { ascending: true });

  return (data || []) as DatingMilestone[];
}

export async function addMilestone(
  matchId: string,
  type: string,
  notes?: string,
): Promise<DatingMilestone | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('dating_milestones')
    .upsert({
      match_id: matchId,
      milestone_type: type,
      achieved_at: new Date().toISOString(),
      notes: notes || null,
      cosmic_snapshot: {},
    }, { onConflict: 'match_id,milestone_type' })
    .select()
    .single();

  if (error) return null;
  return data as DatingMilestone;
}

export function getNextMilestone(achieved: string[]): string | null {
  const order = [
    'first_message', 'first_call', 'first_date',
    'one_week', 'one_month', 'three_months',
    'exclusive', 'anniversary',
  ];
  for (const m of order) {
    if (!achieved.includes(m)) return m;
  }
  return null;
}

export function getMilestoneProgress(achieved: string[]): number {
  const total = 8;
  const count = achieved.filter(a => a !== 'custom').length;
  return Math.min(100, Math.round((count / total) * 100));
}
