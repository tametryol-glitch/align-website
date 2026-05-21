import { createClient } from '@/lib/supabase';

export interface DatingEvent {
  id: string;
  title: string;
  description: string | null;
  event_type: 'mixer' | 'speed_dating' | 'element_night' | 'planetary_hour' | 'custom';
  theme: Record<string, any>;
  element_filter: string | null;
  max_participants: number;
  starts_at: string;
  ends_at: string;
  status: 'upcoming' | 'active' | 'completed' | 'cancelled';
  created_by: string | null;
  participant_count?: number;
  is_registered?: boolean;
}

export interface EventParticipant {
  id: string;
  event_id: string;
  user_id: string;
  status: 'registered' | 'checked_in' | 'cancelled';
  registered_at: string;
}

export async function getUpcomingEvents(userId?: string): Promise<DatingEvent[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from('dating_events')
    .select('*')
    .in('status', ['upcoming', 'active'])
    .gte('ends_at', new Date().toISOString())
    .order('starts_at', { ascending: true });

  if (!data) return [];

  const events = data as DatingEvent[];

  if (userId) {
    const { data: registrations } = await supabase
      .from('dating_event_participants')
      .select('event_id')
      .eq('user_id', userId)
      .eq('status', 'registered');

    const registeredIds = new Set((registrations || []).map((r: any) => r.event_id));

    for (const event of events) {
      event.is_registered = registeredIds.has(event.id);
    }
  }

  return events;
}

export async function registerForEvent(
  userId: string,
  eventId: string,
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();

  const { data: event } = await supabase
    .from('dating_events')
    .select('id, max_participants, status')
    .eq('id', eventId)
    .single();

  if (!event || event.status === 'cancelled' || event.status === 'completed') {
    return { success: false, error: 'Event is not available' };
  }

  const { count } = await supabase
    .from('dating_event_participants')
    .select('*', { count: 'exact', head: true })
    .eq('event_id', eventId)
    .eq('status', 'registered');

  if (count != null && count >= event.max_participants) {
    return { success: false, error: 'Event is full' };
  }

  const { error } = await supabase
    .from('dating_event_participants')
    .upsert({
      event_id: eventId,
      user_id: userId,
      status: 'registered',
    }, { onConflict: 'event_id,user_id' });

  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function cancelRegistration(
  userId: string,
  eventId: string,
): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase
    .from('dating_event_participants')
    .update({ status: 'cancelled' })
    .eq('event_id', eventId)
    .eq('user_id', userId);

  return !error;
}

export async function getMyEvents(userId: string): Promise<DatingEvent[]> {
  const supabase = createClient();
  const { data: registrations } = await supabase
    .from('dating_event_participants')
    .select('event_id')
    .eq('user_id', userId)
    .eq('status', 'registered');

  if (!registrations || registrations.length === 0) return [];

  const eventIds = registrations.map((r: any) => r.event_id);

  const { data } = await supabase
    .from('dating_events')
    .select('*')
    .in('id', eventIds)
    .order('starts_at', { ascending: true });

  return ((data || []) as DatingEvent[]).map(e => ({ ...e, is_registered: true }));
}

export const EVENT_TYPE_CONFIG: Record<string, { label: string; icon: string; color: string }> = {
  mixer: { label: 'Cosmic Mixer', icon: '🌌', color: '#8B5CF6' },
  speed_dating: { label: 'Speed Dating', icon: '⚡', color: '#F59E0B' },
  element_night: { label: 'Element Night', icon: '🔥', color: '#EF4444' },
  planetary_hour: { label: 'Planetary Hour', icon: '🪐', color: '#3B82F6' },
  custom: { label: 'Special Event', icon: '✨', color: '#EC4899' },
};
