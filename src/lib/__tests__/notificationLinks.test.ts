import { describe, it, expect } from 'vitest';
/**
 * Notification deep links for the types that share 'transit_alert'.
 *
 * Several features ride on that one type because it is the only value valid
 * under every version of notifications_type_check, and they are told apart by
 * data.kind. A missing branch does not throw — it silently sends the reader to
 * the wrong page, which is the failure mode worth a test.
 */

import { getNotificationLink } from '../notificationLinks';

describe('getNotificationLink — transit_alert riders', () => {
  it('sends a purpose check-in to the dashboard, where the card lives', () => {
    expect(getNotificationLink({ type: 'transit_alert', data: { kind: 'purpose_checkin' } })).toBe('/dashboard');
  });

  it('still sends a cosmic frequency to its own page', () => {
    expect(getNotificationLink({ type: 'transit_alert', data: { kind: 'cosmic_frequency' } }))
      .toBe('/readings/cosmic-frequencies');
  });

  it('falls back to /readings for a plain transit alert', () => {
    expect(getNotificationLink({ type: 'transit_alert', data: {} })).toBe('/readings');
    expect(getNotificationLink({ type: 'transit_alert' })).toBe('/readings');
  });
});
