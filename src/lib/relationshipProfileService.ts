import { createClient } from '@/lib/supabase';

export const GENDER_IDENTITY_OPTIONS = [
  'Male', 'Female', 'Non-binary', 'Trans man', 'Trans woman',
  'Genderfluid', 'Agender', 'Prefer to self-describe', 'Prefer not to say',
] as const;

export const SEXUAL_ORIENTATION_OPTIONS = [
  'Straight', 'Gay', 'Lesbian', 'Bisexual', 'Pansexual', 'Queer',
  'Asexual', 'Demisexual', 'Bicurious', 'Questioning',
  'Prefer to self-describe', 'Prefer not to say',
] as const;

export const INTERESTED_IN_OPTIONS = [
  'Men', 'Women', 'Non-binary people', 'Trans men', 'Trans women',
] as const;

export const PRIMARY_INTENT_OPTIONS = [
  'Long-term relationship', 'Life partner / marriage-minded',
  'Serious but open to pace', 'Dating with intention',
  'Open to seeing where it goes', 'Short-term dating',
  'Casual connection', 'Friends first', 'Spiritual connection',
  'Ethical non-monogamy', 'Open relationship', 'Polyamorous',
  'Still figuring it out',
] as const;

export const SECONDARY_INTENT_OPTIONS = [
  'Marriage-minded', 'Emotional intimacy', 'Fun dates', 'Travel partner',
  'Soul connection', 'Sexual exploration', 'Community / friendship',
  'Healing after breakup', 'Open to surprise',
] as const;

export const RELATIONSHIP_STYLE_OPTIONS = [
  'Monogamous', 'Open to non-monogamy', 'Ethical non-monogamy',
  'Polyamorous', 'Prefer not to say',
] as const;

export const DEALBREAKER_OPTIONS = [
  'Monogamy only', 'Open to ENM', 'Wants children',
  'Does not want children', 'Open to children',
  'Spiritual partner preferred', 'Local only',
  'Open to long-distance', 'Friendship first', 'Slow burn', 'Serious only',
] as const;

export const CONNECTION_TYPE_OPTIONS = [
  'Romance', 'Marriage', 'Sacred union', 'Casual chemistry',
  'Friendship', 'Creative partner', 'Healing connection',
  'Spiritual partnership',
] as const;

export const ENERGETIC_PACE_OPTIONS = [
  'Slow and intentional', 'Moderate', 'Fast chemistry',
  'Let it unfold naturally',
] as const;

export const SPIRITUAL_OPENNESS_OPTIONS = [
  'Very spiritual', 'Somewhat spiritual', 'Open but unsure',
  'Not a focus', 'Prefer not to say',
] as const;

export type FieldVisibility = 'show_on_profile' | 'match_only' | 'hidden';

export const PRIVACY_FIELDS = [
  'sexual_orientation',
  'interested_in_genders',
  'relationship_primary_intent',
  'relationship_style',
  'connection_type_wanted',
  'energetic_pace',
  'spiritual_openness',
] as const;

export const DEFAULT_IDENTITY_PRIVACY: Record<string, FieldVisibility> = {
  sexual_orientation: 'match_only',
  interested_in_genders: 'match_only',
  relationship_primary_intent: 'show_on_profile',
  relationship_style: 'show_on_profile',
  connection_type_wanted: 'show_on_profile',
  energetic_pace: 'show_on_profile',
  spiritual_openness: 'show_on_profile',
};

export interface RelationshipProfile {
  gender_identity: string | null;
  gender_custom_text: string | null;
  sexual_orientation: string[] | null;
  orientation_custom_text: string | null;
  interested_in_genders: string[] | null;
  relationship_primary_intent: string | null;
  relationship_secondary_intents: string[] | null;
  relationship_style: string | null;
  relationship_preferences: string[] | null;
  connection_type_wanted: string | null;
  energetic_pace: string | null;
  spiritual_openness: string | null;
  identity_privacy_settings: Record<string, FieldVisibility> | null;
  updated_relationship_preferences_at: string | null;
}

const RELATIONSHIP_FIELDS = [
  'gender_identity', 'gender_custom_text',
  'sexual_orientation', 'orientation_custom_text',
  'interested_in_genders',
  'relationship_primary_intent', 'relationship_secondary_intents',
  'relationship_style', 'relationship_preferences',
  'connection_type_wanted', 'energetic_pace', 'spiritual_openness',
  'identity_privacy_settings', 'updated_relationship_preferences_at',
] as const;

function getSupabase() {
  return createClient();
}

export async function getRelationshipProfile(userId: string): Promise<RelationshipProfile | null> {
  try {
    if (!userId) return null;

    const { data, error } = await getSupabase()
      .from('profiles')
      .select(RELATIONSHIP_FIELDS.join(', '))
      .eq('id', userId)
      .single();

    if (error || !data) return null;
    return data as unknown as RelationshipProfile;
  } catch {
    return null;
  }
}

export async function saveRelationshipProfile(
  userId: string,
  updates: Partial<RelationshipProfile>,
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!userId) return { success: false, error: 'Not authenticated' };

    const payload: Record<string, any> = {
      ...updates,
      updated_relationship_preferences_at: new Date().toISOString(),
    };

    const { error } = await getSupabase()
      .from('profiles')
      .update(payload)
      .eq('id', userId);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Save failed' };
  }
}

export async function getVisibleRelationshipProfile(
  userId: string,
): Promise<Partial<RelationshipProfile> | null> {
  try {
    const { data, error } = await getSupabase()
      .from('profiles')
      .select(RELATIONSHIP_FIELDS.join(', '))
      .eq('id', userId)
      .single();

    if (error || !data) return null;

    const profile = data as unknown as RelationshipProfile;
    const privacy = profile.identity_privacy_settings || DEFAULT_IDENTITY_PRIVACY;

    const visible: Partial<RelationshipProfile> = {
      gender_identity: profile.gender_identity,
      gender_custom_text: profile.gender_custom_text,
    };

    for (const field of PRIVACY_FIELDS) {
      const level = privacy[field] || DEFAULT_IDENTITY_PRIVACY[field] || 'show_on_profile';
      if (level === 'show_on_profile') {
        (visible as any)[field] = (profile as any)[field];
      }
    }

    return visible;
  } catch {
    return null;
  }
}

export function isGenderCompatible(
  interestedIn: string[] | null,
  targetGender: string | null,
): boolean {
  if (!interestedIn || interestedIn.length === 0) return true;
  if (!targetGender) return true;

  const genderToCategory: Record<string, string> = {
    'Male': 'Men', 'Female': 'Women', 'Non-binary': 'Non-binary people',
    'Trans man': 'Trans men', 'Trans woman': 'Trans women',
    'Genderfluid': 'Non-binary people', 'Agender': 'Non-binary people',
  };

  const category = genderToCategory[targetGender];
  if (!category) return true;
  return interestedIn.includes(category);
}

export function isStyleCompatible(
  styleA: string | null,
  styleB: string | null,
): boolean {
  if (!styleA || !styleB) return true;
  if (styleA === 'Prefer not to say' || styleB === 'Prefer not to say') return true;

  const monoSet = new Set(['Monogamous']);
  const nonMonoSet = new Set(['Open to non-monogamy', 'Ethical non-monogamy', 'Polyamorous']);

  if (monoSet.has(styleA) && nonMonoSet.has(styleB) && styleB !== 'Open to non-monogamy') return false;
  if (monoSet.has(styleB) && nonMonoSet.has(styleA) && styleA !== 'Open to non-monogamy') return false;

  return true;
}
