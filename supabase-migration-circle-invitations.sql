-- The Fifth Circle: invitation + Accept/Decline tracking.
-- Service-role only (RLS on, no policies): all access goes through
-- /api/admin/circle-invite and /api/circle/respond.
create table if not exists public.circle_invitations (
  id uuid primary key default gen_random_uuid(),
  token text not null unique,
  user_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','accepted','declined')),
  sent_at timestamptz not null default now(),
  responded_at timestamptz
);
alter table public.circle_invitations enable row level security;
grant all on public.circle_invitations to service_role;
create index if not exists circle_invitations_user_idx on public.circle_invitations(user_id);
