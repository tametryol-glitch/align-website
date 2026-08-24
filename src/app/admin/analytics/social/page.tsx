'use client';

// Social graph, messaging and the dating funnel.
// Connection density is the strongest retention predictor in any social
// product — users at zero connections almost never come back.

import {
  useAdminSection, AccessDenied, SectionHeader, Loading, Card, Stat, StatGrid,
  BarRow, MigrationNotice, fmt, pct, duration,
} from '../_shared';

interface SocialData {
  graph: {
    error?: string;
    follows_new?: number; follows_total?: number; mutual_follow_pct?: number;
    friendships?: number; friend_requests_pending?: number; friendships_accepted_in_range?: number;
    members?: number; isolated_users?: number; isolated_pct?: number;
    connection_buckets?: { zero: number; one_to_3: number; four_to_10: number; over_10: number; median: number };
    profile_views?: number; blocks_new?: number;
  };
  messaging: {
    messages?: number; senders?: number; conversations_active?: number; two_sided?: number;
    reply_rate_pct?: number; median_minutes_to_reply?: number;
  };
  dating: {
    dating_enabled?: number; likes?: number; cosmic_roses?: number; passes?: number;
    active_likers?: number; like_rate_pct?: number; matches?: number; match_rate_pct?: number;
    matches_messaged?: number; matches_sustained?: number; sustained_pct?: number;
    unmatches?: number; top_decile_like_share_pct?: number; photo_verified?: number;
  };
}

export default function SocialAnalyticsPage() {
  const { allowed, data, range, setRange, loading, refreshing, refresh } =
    useAdminSection<SocialData>('social');

  if (!allowed) return <AccessDenied />;

  const g = data?.graph || {};
  const m = data?.messaging || {};
  const d = data?.dating || {};
  const b = g.connection_buckets;
  const bucketMax = b ? Math.max(1, b.zero, b.one_to_3, b.four_to_10, b.over_10) : 1;

  return (
    <div className="max-w-6xl mx-auto pb-16">
      <SectionHeader
        title="Social graph & relationships"
        subtitle="Connections, conversations and the dating funnel. Align's differentiator is connection between people — this is where that gets measured."
        range={range} setRange={setRange} refresh={refresh} refreshing={refreshing}
      />

      {loading && !data ? <Loading /> : (
        <div className="space-y-4">
          {g.error && <MigrationNotice file="supabase-migration-analytics-phase5-product.sql" />}

          <Card
            title="Connection density"
            hint="The single highest-leverage number on this page. Users with zero connections almost never retain — if this bar is tall, onboarding should be built around fixing it."
          >
            <div className="grid md:grid-cols-2 gap-5">
              <StatGrid>
                <Stat
                  label="Isolated users"
                  value={fmt(g.isolated_users)}
                  sub={pct(g.isolated_pct)}
                  tone={(g.isolated_pct ?? 0) > 30 ? 'bad' : (g.isolated_pct ?? 0) > 15 ? 'warn' : 'good'}
                />
                <Stat label="Median connections" value={b?.median ?? '—'} />
                <Stat label="Members" value={fmt(g.members)} />
                <Stat label="Mutual follow rate" value={pct(g.mutual_follow_pct)} />
              </StatGrid>
              <div className="space-y-2.5">
                {b ? (
                  <>
                    <BarRow label="0 connections" value={b.zero} max={bucketMax} />
                    <BarRow label="1–3" value={b.one_to_3} max={bucketMax} />
                    <BarRow label="4–10" value={b.four_to_10} max={bucketMax} />
                    <BarRow label="10+" value={b.over_10} max={bucketMax} />
                  </>
                ) : (
                  <p className="text-xs text-text-muted py-3 text-center">No graph data yet.</p>
                )}
              </div>
            </div>
          </Card>

          <div className="grid md:grid-cols-2 gap-4">
            <Card title="Graph growth" hint="New connections formed in the range.">
              <StatGrid>
                <Stat label="New follows" value={fmt(g.follows_new)} />
                <Stat label="Total follows" value={fmt(g.follows_total)} />
                <Stat label="Friendships" value={fmt(g.friendships)} />
                <Stat label="Requests pending" value={fmt(g.friend_requests_pending)} />
                <Stat label="Accepted in range" value={fmt(g.friendships_accepted_in_range)} />
                <Stat label="Profile views" value={fmt(g.profile_views)} />
                <Stat
                  label="New blocks"
                  value={fmt(g.blocks_new)}
                  sub="earliest harassment signal"
                  tone={(g.blocks_new ?? 0) > 0 ? 'warn' : 'default'}
                />
              </StatGrid>
            </Card>

            <Card
              title="Messaging"
              hint="Whether conversations are two-sided or people are shouting into a void."
            >
              <StatGrid>
                <Stat label="Messages" value={fmt(m.messages)} />
                <Stat label="Senders" value={fmt(m.senders)} />
                <Stat label="Active conversations" value={fmt(m.conversations_active)} />
                <Stat
                  label="Reply rate"
                  value={pct(m.reply_rate_pct)}
                  sub="2+ distinct senders"
                  tone={(m.reply_rate_pct ?? 0) < 40 ? 'warn' : 'good'}
                />
                <Stat label="Median time to reply" value={duration(m.median_minutes_to_reply)} />
              </StatGrid>
            </Card>
          </div>

          <Card
            title="Dating funnel"
            hint="Discovery → like → match → message → sustained conversation. Every stage reads a table that already existed."
          >
            <StatGrid>
              <Stat label="Dating enabled" value={fmt(d.dating_enabled)} />
              <Stat label="Likes" value={fmt(d.likes)} sub={`${fmt(d.cosmic_roses)} roses`} />
              <Stat label="Passes" value={fmt(d.passes)} />
              <Stat
                label="Like rate"
                value={pct(d.like_rate_pct)}
                sub="likes ÷ (likes + passes)"
                tone={(d.like_rate_pct ?? 0) > 70 ? 'warn' : 'default'}
              />
              <Stat label="Matches" value={fmt(d.matches)} />
              <Stat label="Match rate" value={pct(d.match_rate_pct)} />
              <Stat label="Matches messaged" value={fmt(d.matches_messaged)} />
              <Stat
                label="Sustained (5+ msgs)"
                value={pct(d.sustained_pct)}
                sub="the honest match-quality test"
                tone={(d.sustained_pct ?? 0) < 15 ? 'bad' : 'good'}
              />
            </StatGrid>
          </Card>

          <Card
            title="Marketplace balance"
            hint="Every dating product dies of imbalance before it dies of anything else: one side over-likes, the other drowns. If the top decile absorbs most of the likes, everyone else sees an empty inbox and leaves."
          >
            <StatGrid>
              <Stat
                label="Top 10% like share"
                value={pct(d.top_decile_like_share_pct)}
                sub="of all likes received"
                tone={(d.top_decile_like_share_pct ?? 0) > 60 ? 'bad' : (d.top_decile_like_share_pct ?? 0) > 40 ? 'warn' : 'good'}
              />
              <Stat label="Active likers" value={fmt(d.active_likers)} />
              <Stat label="Unmatches" value={fmt(d.unmatches)} />
              <Stat label="Photo verified" value={fmt(d.photo_verified)} />
            </StatGrid>
          </Card>
        </div>
      )}
    </div>
  );
}
