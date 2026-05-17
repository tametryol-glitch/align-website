export default function BookmarksLoading() {
  return (
    <div className="max-w-2xl mx-auto animate-pulse">
      <div className="h-8 bg-bg-tertiary rounded w-36 mb-6" />
      <div className="space-y-3">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="rounded-xl bg-bg-card border border-border-primary p-5 space-y-3">
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-full bg-bg-tertiary" />
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-bg-tertiary rounded w-32" />
                <div className="h-3 bg-bg-tertiary rounded w-20" />
              </div>
            </div>
            <div className="h-4 bg-bg-tertiary rounded w-full" />
            <div className="h-4 bg-bg-tertiary rounded w-2/3" />
          </div>
        ))}
      </div>
    </div>
  );
}
