'use client';

// Content & feed health — the operating dashboard Instagram and TikTok run on.
// Everything here reads tables that were already being written to and simply
// never reported: post_impressions, reel_views, reactions, comments.

import {
  useAdminSection, AccessDenied, SectionHeader, Loading, Card, Stat, StatGrid,
  BarRow, Table, MigrationNotice, fmt, pct, duration,
} from '../_shared';

interface ContentData {
  content: {
    error?: string;
    posts?: number; comments?: number; reactions?: number; reels?: number; stories?: number;
    impressions?: number; reach?: number; creators?: number; active_users?: number;
    creator_ratio_pct?: number; engagement_rate_pct?: number; impressions_per_reach?: number;
    zero_engagement_posts?: number; zero_engagement_pct?: number;
    content_mix?: { type: string; count: number }[];
  };
  creators: {
    creators?: number; repeat_creators?: number; creator_retention_pct?: number;
    median_minutes_to_first_engagement?: number; posts_never_engaged?: number;
    top_creators?: { user_id: string; name: string; posts: number; engagement: number }[];
  };
  feed: {
    authors_shown?: number; viewers?: number;
    top_author_impression_share_pct?: number; top3_author_impression_share_pct?: number;
    avg_reshow_per_post?: number; avg_distinct_posts_seen?: number;
  };
  reels: {
    reels_created?: number; views?: number; unique_viewers?: number; likes?: number;
    saves?: number; comments?: number; save_rate_pct?: number; like_rate_pct?: number;
    avg_watch_pct?: number | null; completion_rate_pct?: number | null; skip_under_3s_pct?: number | null;
  };
  topPosts: {
    post_id: string; author_name: string; post_type: string; preview: string;
    impressions: number; reach: number; reactions: number; comments: number;
    engagement_rate: number | null;
  }[];
}

export default function ContentAnalyticsPage() {
  const { allowed, data, range, setRange, loading, refreshing, refresh } =
    useAdminSection<ContentData>('content');

  if (!allowed) return <AccessDenied />;

  const c = data?.content || {};
  const cr = data?.creators || {};
  const fq = data?.feed || {};
  const rl = data?.reels || {};
  const mixMax = Math.max(1, ...(c.content_mix || []).map((m) => m.count));

  return (
    <div className="max-w-6xl mx-auto pb-16">
      <SectionHeader
        title="Content & feed health"
        subtitle="Supply, reach and engagement across posts, reels and stories — plus whether the ranking algorithm is producing a varied feed or a monoculture."
        range={range} setRange={setRange} refresh={refresh} refreshing={refreshing}
      />

      {loading && !data ? <Loading /> : (
        <div className="space-y-4">
          {c.error && <MigrationNotice file="supabase-migration-analytics-phase5-product.sql" />}

          <Card title="Supply & demand" hint="Content created versus content consumed over the selected range.">
            <StatGrid>
              <Stat label="Posts" value={fmt(c.posts)} />
              <Stat label="Comments" value={fmt(c.comments)} />
              <Stat label="Reactions" value={fmt(c.reactions)} />
              <Stat label="Reels" value={fmt(c.reels)} />
              <Stat label="Impressions" value={fmt(c.impressions)} />
              <Stat label="Reach (people)" value={fmt(c.reach)} />
              <Stat
                label="Engagement rate"
                value={pct(c.engagement_rate_pct)}
                sub="(reactions + comments) ÷ impressions"
                tone={(c.engagement_rate_pct ?? 0) > 2 ? 'good' : 'default'}
              />
              <Stat
                label="Impressions per person"
                value={c.impressions_per_reach ?? '—'}
                sub="High = feed repeating itself"
                tone={(c.impressions_per_reach ?? 0) > 3 ? 'warn' : 'default'}
              />
            </StatGrid>
          </Card>

          <div className="grid md:grid-cols-2 gap-4">
            <Card
              title="Creator ratio"
              hint="Share of active people who posted, commented or reacted. The classic 1/9/90 health check — if this falls, the feed starves before any other metric moves."
            >
              <StatGrid>
                <Stat
                  label="Creator ratio"
                  value={pct(c.creator_ratio_pct)}
                  tone={(c.creator_ratio_pct ?? 0) < 5 ? 'bad' : (c.creator_ratio_pct ?? 0) < 15 ? 'warn' : 'good'}
                />
                <Stat label="Creators" value={fmt(c.creators)} />
                <Stat label="Active users" value={fmt(c.active_users)} />
                <Stat
                  label="Repeat creators"
                  value={pct(cr.creator_retention_pct)}
                  sub="posted on 2+ days"
                  tone={(cr.creator_retention_pct ?? 0) < 20 ? 'warn' : 'good'}
                />
              </StatGrid>
            </Card>

            <Card
              title="Time to first engagement"
              hint="How long a creator waits for their first reaction or comment. This is the number that decides whether someone posts a second time."
            >
              <StatGrid>
                <Stat
                  label="Median wait"
                  value={duration(cr.median_minutes_to_first_engagement)}
                  tone={(cr.median_minutes_to_first_engagement ?? 0) > 240 ? 'bad' : 'good'}
                />
                <Stat
                  label="Posts with zero engagement"
                  value={fmt(c.zero_engagement_posts)}
                  sub={pct(c.zero_engagement_pct)}
                  tone={(c.zero_engagement_pct ?? 0) > 40 ? 'bad' : 'default'}
                />
              </StatGrid>
            </Card>
          </div>

          <Card
            title="Feed ranking health"
            hint="Author concentration and re-show rate. This is the telemetry the ranking rewrite never had: it answers whether one author is camping the top of everyone's feed."
          >
            <StatGrid>
              <Stat
                label="Top author share"
                value={pct(fq.top_author_impression_share_pct)}
                sub="of all impressions"
                tone={(fq.top_author_impression_share_pct ?? 0) > 25 ? 'bad' : 'good'}
              />
              <Stat
                label="Top 3 authors"
                value={pct(fq.top3_author_impression_share_pct)}
                tone={(fq.top3_author_impression_share_pct ?? 0) > 50 ? 'warn' : 'good'}
              />
              <Stat label="Authors shown" value={fmt(fq.authors_shown)} />
              <Stat
                label="Avg re-shows"
                value={fq.avg_reshow_per_post ?? '—'}
                sub="same post, same person"
                tone={(fq.avg_reshow_per_post ?? 0) > 2.5 ? 'warn' : 'good'}
              />
            </StatGrid>
          </Card>

          <div className="grid md:grid-cols-2 gap-4">
            <Card title="Content mix" hint="What kind of content people actually make.">
              <div className="space-y-2.5">
                {(c.content_mix || []).map((m) => (
                  <BarRow key={m.type} label={m.type} value={m.count} max={mixMax} />
                ))}
                {!(c.content_mix || []).length && (
                  <p className="text-xs text-text-muted py-3 text-center">No posts in range.</p>
                )}
              </div>
            </Card>

            <Card
              title="Reels"
              hint="Watch time, completion and skip rate populate once the player emits reel_progress from the next mobile build."
            >
              <StatGrid>
                <Stat label="Views" value={fmt(rl.views)} />
                <Stat label="Unique viewers" value={fmt(rl.unique_viewers)} />
                <Stat label="Save rate" value={pct(rl.save_rate_pct)} sub="strongest quality signal" />
                <Stat label="Like rate" value={pct(rl.like_rate_pct)} />
                <Stat label="Avg watch" value={rl.avg_watch_pct != null ? `${rl.avg_watch_pct}%` : 'pending'} />
                <Stat label="Completion" value={rl.completion_rate_pct != null ? `${rl.completion_rate_pct}%` : 'pending'} />
                <Stat label="Skip < 3s" value={rl.skip_under_3s_pct != null ? `${rl.skip_under_3s_pct}%` : 'pending'} />
                <Stat label="Reels created" value={fmt(rl.reels_created)} />
              </StatGrid>
            </Card>
          </div>

          <Card title="Top posts" hint="Ranked by total engagement earned in the range.">
            <Table
              headers={['Author', 'Type', 'Preview', 'Impressions', 'Reach', 'Reactions', 'Comments', 'Eng. rate']}
              rows={(data?.topPosts || []).map((p) => [
                p.author_name || '—',
                p.post_type,
                <span key="p" className="text-text-muted">{p.preview || '—'}</span>,
                fmt(p.impressions),
                fmt(p.reach),
                fmt(p.reactions),
                fmt(p.comments),
                p.engagement_rate != null ? `${p.engagement_rate}%` : '—',
              ])}
              empty="No posts with engagement in this range."
            />
          </Card>

          <Card title="Top creators" hint="By engagement earned. These are the accounts worth protecting.">
            <Table
              headers={['Creator', 'Posts', 'Engagement']}
              rows={(data?.creators?.top_creators || []).map((t) => [
                t.name || '—', fmt(t.posts), fmt(t.engagement),
              ])}
            />
          </Card>
        </div>
      )}
    </div>
  );
}
