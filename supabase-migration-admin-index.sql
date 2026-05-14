-- Migration: Admin batch-index for Cosmic Index
-- Run this once in the Supabase SQL Editor to enable admin batch indexing.

-- Admin-only version of upsert_planet_placements.
-- Allows an admin user to upsert placements for ANY user, not just themselves.
CREATE OR REPLACE FUNCTION public.admin_upsert_planet_placements(
  p_target_user_id UUID,
  p_placements JSONB
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller_admin BOOLEAN;
BEGIN
  SELECT is_admin INTO caller_admin
  FROM public.profiles
  WHERE id = auth.uid();

  IF caller_admin IS NOT TRUE THEN
    RAISE EXCEPTION 'admin_upsert_planet_placements: caller is not an admin';
  END IF;

  DELETE FROM public.planet_placement_index WHERE user_id = p_target_user_id;

  INSERT INTO public.planet_placement_index (
    user_id, planet_name, sign_name, sign_number, house_number,
    exact_degree, degree_whole, degree_minute, zodiac_longitude, retrograde
  )
  SELECT
    p_target_user_id,
    (p->>'planet_name'),
    (p->>'sign_name'),
    (p->>'sign_number')::INT,
    (p->>'house_number')::INT,
    (p->>'exact_degree')::NUMERIC(8,4),
    (p->>'degree_whole')::INT,
    (p->>'degree_minute')::INT,
    (p->>'zodiac_longitude')::NUMERIC(8,4),
    COALESCE((p->>'retrograde')::BOOLEAN, false)
  FROM jsonb_array_elements(p_placements) AS p;
END;
$$;

-- Helper: get all user IDs that have birth data but are NOT yet indexed.
CREATE OR REPLACE FUNCTION public.get_unindexed_users_with_birth_data()
RETURNS TABLE(
  id UUID,
  display_name TEXT,
  birth_date DATE,
  birth_time TIME,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  timezone TEXT,
  birth_location TEXT
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    p.id, p.display_name, p.birth_date, p.birth_time,
    p.latitude, p.longitude, p.timezone, p.birth_location
  FROM public.profiles p
  WHERE p.birth_date IS NOT NULL
    AND p.latitude IS NOT NULL
    AND p.longitude IS NOT NULL
    AND NOT EXISTS (
      SELECT 1 FROM public.planet_placement_index ppi
      WHERE ppi.user_id = p.id
    )
  ORDER BY p.created_at DESC;
$$;
