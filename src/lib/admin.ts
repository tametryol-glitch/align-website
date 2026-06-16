// Platform-admin (founder) gate. Mirrors align-app's isPlatformAdmin
// (services/creatorMonetization.ts). Used to surface moderation actions
// like deleting any user's post. The DB enforces the real permission via
// an RLS policy keyed to the same email — this only controls UI visibility.
const ADMIN_EMAILS = new Set<string>(['tametryol@gmail.com']);

export function isPlatformAdmin(email?: string | null): boolean {
  return !!email && ADMIN_EMAILS.has(email.toLowerCase());
}
