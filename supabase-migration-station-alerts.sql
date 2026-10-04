-- Station Alerts (Phase 2). Spec: STATION-ALERTS-SPEC.md
-- Run once in the Supabase SQL editor. Idempotent.
--
-- Tables
--   planet_stations     global cycle table (public read, service-role write)
--   station_alerts      one row per personal alert (owner read, service write)
--   station_predictions bold predictions saved per alert, owner marks outcome
--   station_prefs       per-user follow / alert-type / threshold settings
--
-- Push rides the existing path: the service writes a `notifications` row with
-- type 'transit_alert' and data.kind 'station_alert'; the push-v2 DB trigger
-- fans it out. NO new push path.
--
-- New tables need explicit GRANTs (Supabase stops auto-granting after 2026-10-30).

-- ── planet_stations ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.planet_stations (
  cycle_id          text PRIMARY KEY,
  body              text NOT NULL,
  shadow_start      timestamptz,
  retro_station     timestamptz NOT NULL,
  direct_station    timestamptz NOT NULL,
  shadow_end        timestamptz,
  retro_degree      double precision NOT NULL,
  direct_degree     double precision NOT NULL,
  retro_sign        text NOT NULL,
  direct_sign       text NOT NULL,
  retro_duad        text,
  retro_sub_duad    text,
  retro_compendium  text,
  direct_duad       text,
  direct_sub_duad   text,
  direct_compendium text,
  created_at        timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS planet_stations_retro_idx ON public.planet_stations (retro_station);
CREATE INDEX IF NOT EXISTS planet_stations_body_idx  ON public.planet_stations (body, retro_station);

ALTER TABLE public.planet_stations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS planet_stations_read ON public.planet_stations;
CREATE POLICY planet_stations_read ON public.planet_stations FOR SELECT USING (true);
GRANT SELECT ON public.planet_stations TO anon, authenticated;
GRANT ALL    ON public.planet_stations TO service_role;

-- ── station_alerts ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.station_alerts (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cycle_id      text NOT NULL,
  body          text NOT NULL,
  type          text NOT NULL CHECK (type IN
                  ('heads_up','station_retro','station_direct','pass','release','progressed_station')),
  layer         text NOT NULL DEFAULT 'natal' CHECK (layer IN ('natal','progressed')),
  pass_n        integer NOT NULL DEFAULT 0,       -- 0 unless type = 'pass'
  target_label  text NOT NULL DEFAULT '',         -- '' unless type = 'pass'
  score         numeric NOT NULL DEFAULT 0,
  push_eligible boolean NOT NULL DEFAULT false,
  headline      text NOT NULL,
  teaser        text NOT NULL,
  payload       jsonb NOT NULL DEFAULT '{}'::jsonb,   -- full reading (do/avoid, passes, hits)
  fires_on      date NOT NULL,                        -- the day this alert is for
  created_at    timestamptz NOT NULL DEFAULT now(),
  sent_at       timestamptz,
  read_at       timestamptz,
  UNIQUE (user_id, cycle_id, type, layer, pass_n, target_label)
);
CREATE INDEX IF NOT EXISTS station_alerts_user_idx ON public.station_alerts (user_id, fires_on DESC);

ALTER TABLE public.station_alerts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS station_alerts_owner_read ON public.station_alerts;
CREATE POLICY station_alerts_owner_read ON public.station_alerts FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS station_alerts_owner_update ON public.station_alerts;
CREATE POLICY station_alerts_owner_update ON public.station_alerts FOR UPDATE
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
-- The full reading (payload) is premium. Members read it ONLY through the API,
-- which applies the free/premium gate. authenticated gets the non-payload columns.
REVOKE ALL ON public.station_alerts FROM authenticated, anon;
GRANT SELECT (id, user_id, cycle_id, body, type, layer, pass_n, target_label, score,
              push_eligible, headline, teaser, fires_on, created_at, sent_at, read_at)
  ON public.station_alerts TO authenticated;
GRANT UPDATE (read_at) ON public.station_alerts TO authenticated;
GRANT ALL ON public.station_alerts TO service_role;

-- ── station_predictions ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.station_predictions (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_id      uuid NOT NULL REFERENCES public.station_alerts(id) ON DELETE CASCADE,
  user_id       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  text          text NOT NULL,
  window_start  date,
  window_end    date,
  outcome       text CHECK (outcome IN ('yes','partly','no')),
  resolved_at   timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS station_predictions_user_idx ON public.station_predictions (user_id, created_at DESC);

ALTER TABLE public.station_predictions ENABLE ROW LEVEL SECURITY;
-- Prediction text is premium: no direct member access. The API (service role)
-- serves it gated and records the member's outcome.
REVOKE ALL ON public.station_predictions FROM authenticated, anon;
GRANT ALL ON public.station_predictions TO service_role;

-- ── station_prefs ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.station_prefs (
  user_id       uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  enabled       boolean NOT NULL DEFAULT true,
  bodies        text[]  NOT NULL DEFAULT ARRAY['Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto','Juno','Vesta','Chiron'],
  types         text[]  NOT NULL DEFAULT ARRAY['heads_up','station_retro','station_direct','pass','release','progressed_station'],
  push_mode     text    NOT NULL DEFAULT 'tight' CHECK (push_mode IN ('tight','all','off')),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.station_prefs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS station_prefs_owner_all ON public.station_prefs;
CREATE POLICY station_prefs_owner_all ON public.station_prefs FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
GRANT SELECT, INSERT, UPDATE ON public.station_prefs TO authenticated;
GRANT ALL ON public.station_prefs TO service_role;
