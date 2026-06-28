export function FounderContent() {
  return (
    <div className="space-y-6">
      {/* Photo */}
      <div className="flex justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://wxzwdvlbcsmnkhjmkgkx.supabase.co/storage/v1/object/public/post-media/founder.jpg"
          alt="Astro Einstein, founder of Align"
          className="w-full max-w-[360px] rounded-2xl border border-border-primary object-cover"
        />
      </div>

      {/* Heading + identity */}
      <div className="text-center space-y-1">
        <h1 className="text-2xl sm:text-3xl font-display font-bold text-text-primary">
          Meet the Founder
        </h1>
        <p className="text-xl font-display font-bold text-text-primary pt-2">
          Astro Einstein
        </p>
        <p className="text-base font-bold text-text-primary">
          CEO, Designer &amp; Developer of Align
        </p>
        <p className="text-sm text-text-muted">Nassau, The Bahamas</p>
      </div>

      {/* Paragraphs */}
      <div className="space-y-5">
        <p className="text-text-secondary leading-relaxed text-[15px]">
          Align was created by Astro Einstein, a Bahamian astrologer, clinical hypnotherapist,
          designer, and technology developer with decades of experience studying astrology, human
          behavior, personal transformation, and spiritual development.
        </p>
        <p className="text-text-secondary leading-relaxed text-[15px]">
          As the CEO, designer, and developer of Align, Astro has been personally involved in
          shaping the app&rsquo;s vision, features, interpretation systems, and overall user
          experience. His goal is to create a space where astrology is not treated as entertainment
          alone, but as a meaningful tool for self-understanding, relationships, timing, healing, and
          personal direction.
        </p>
        <p className="text-text-secondary leading-relaxed text-[15px]">
          Align was built with care, privacy, inclusion, and accuracy in mind. Every feature is
          designed to help users understand themselves more deeply while feeling respected,
          supported, and safe throughout their experience.
        </p>
        <p className="text-text-secondary leading-relaxed text-[15px]">
          Astro&rsquo;s work is rooted in the belief that technology should feel human, spiritual
          guidance should be responsible, and every person deserves access to insight that empowers
          rather than frightens or controls them.
        </p>
      </div>

      {/* Quote */}
      <blockquote className="border-l-4 border-accent-primary bg-bg-card rounded-r-2xl px-6 py-5 space-y-3">
        <p className="text-text-primary font-bold leading-relaxed text-[15px]">
          &ldquo;I created Align to give people a trustworthy space where they can explore who they
          are, understand the patterns shaping their lives, and receive guidance that feels personal,
          respectful, and meaningful.&rdquo;
        </p>
        <p className="text-text-secondary text-sm">
          &mdash; <span className="font-bold text-text-primary">Astro Einstein</span>
        </p>
      </blockquote>
    </div>
  );
}
