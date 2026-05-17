export default function PollsLoading() {
  return (
    <div className="max-w-2xl mx-auto animate-pulse">
      <div className="h-8 bg-bg-tertiary rounded w-28 mb-6" />
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="rounded-xl bg-bg-card border border-border-primary p-5 space-y-3">
            <div className="h-5 bg-bg-tertiary rounded w-3/4" />
            <div className="space-y-2">
              {[1, 2, 3].map(j => (
                <div key={j} className="h-10 bg-bg-tertiary rounded-lg" />
              ))}
            </div>
            <div className="h-3 bg-bg-tertiary rounded w-24" />
          </div>
        ))}
      </div>
    </div>
  );
}
