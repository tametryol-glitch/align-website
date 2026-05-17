export default function CommunitiesLoading() {
  return (
    <div className="max-w-3xl mx-auto animate-pulse">
      <div className="h-8 bg-bg-tertiary rounded w-44 mb-6" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="rounded-xl bg-bg-card border border-border-primary p-5 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-bg-tertiary" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-bg-tertiary rounded w-32" />
                <div className="h-3 bg-bg-tertiary rounded w-20" />
              </div>
            </div>
            <div className="h-3 bg-bg-tertiary rounded w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
