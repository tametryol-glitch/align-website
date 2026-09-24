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

/**
 * Message notifications used to point at /messages/<id>, a path with no page
 * behind it, so every click 404'd. The inbox opens a thread from
 * ?conversation=, so the query form is the only shape that works.
 */
describe('getNotificationLink — messages', () => {
  it('deep-links into the conversation via the query the inbox reads', () => {
    expect(getNotificationLink({ type: 'new_message', data: { conversation_id: 'abc-123' } }))
      .toBe('/messages?conversation=abc-123');
    expect(getNotificationLink({ type: 'message', data: { conversation_id: 'abc-123' } }))
      .toBe('/messages?conversation=abc-123');
  });

  it('falls back to the inbox when the conversation is missing', () => {
    expect(getNotificationLink({ type: 'new_message', data: {} })).toBe('/messages');
  });
});

describe('getNotificationLink — people you follow', () => {
  it('opens the exact post a followed account just shared', () => {
    expect(getNotificationLink({ type: 'new_post', data: { post_id: 'p1' } })).toBe('/feed?postId=p1');
  });

  it('sends a new reel to the reels page', () => {
    expect(getNotificationLink({ type: 'new_post', data: { reel_id: 'r1' } })).toBe('/reels');
  });

  it('opens the stream for a live_started announcement', () => {
    expect(getNotificationLink({ type: 'announcement', data: { kind: 'live_started', session_id: 's1' } }))
      .toBe('/live/s1');
  });

  it('keeps other announcements on settings', () => {
    expect(getNotificationLink({ type: 'announcement', data: {} })).toBe('/settings');
  });
});

/**
 * Story reactions used to share the post branch, which looks for post_id —
 * a story reaction never has one, so it always dropped you on a bare /feed.
 * The feed's story rail opens the frame from ?story=.
 */
describe('getNotificationLink — story reactions', () => {
  it('opens the reacted-to story on the feed', () => {
    expect(getNotificationLink({ type: 'story_reaction', data: { story_id: 's1', emoji: '🔥' } }))
      .toBe('/feed?story=s1');
  });

  it('falls back to the feed when the story id is missing', () => {
    expect(getNotificationLink({ type: 'story_reaction', data: {} })).toBe('/feed');
    expect(getNotificationLink({ type: 'story_reaction' })).toBe('/feed');
  });

  it('ignores a post_id on a story reaction', () => {
    expect(getNotificationLink({ type: 'story_reaction', data: { post_id: 'p1' } })).toBe('/feed');
  });
});
