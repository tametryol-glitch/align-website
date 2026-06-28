// Branded "official" content accounts that the founder/admin posts as into the
// social feed (manually via the admin panel, or automatically via the daily
// cron). These are real profiles in the DB — all inserts under these ids must
// go through the service-role admin client (RLS posts_insert requires
// auth.uid() = user_id).

export const OFFICIAL_ACCOUNTS = [
  { id: 'b15846d4-48db-42b2-bdfd-04abe3ff15d6', name: 'Align Daily', handle: 'align_daily' },
  { id: '806ba1be-51a2-4c77-9f3a-a5e703310852', name: 'Cosmic Weather', handle: 'cosmic_weather' },
] as const;

export type OfficialAccount = (typeof OFFICIAL_ACCOUNTS)[number];

const OFFICIAL_ACCOUNT_IDS = new Set<string>(OFFICIAL_ACCOUNTS.map((a) => a.id));

/** Whether the given profile id belongs to one of the official content accounts. */
export function isOfficialAccountId(id: string): boolean {
  return OFFICIAL_ACCOUNT_IDS.has(id);
}
