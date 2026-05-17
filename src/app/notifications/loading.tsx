export default function NotificationsLoading() {
  return (
    <div className="max-w-2xl mx-auto animate-pulse">
      <div className="h-8 bg-bg-tertiary rounded w-40 mb-6" />
      <div className="space-y-2">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="flex gap-3 p-4 rounded-xl bg-bg-card border border-border-primary">
            <div className="w-10 h-10 rounded-full bg-bg-tertiary shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-bg-tertiary rounded w-3/4" />
              <div className="h-3 bg-bg-tertiary rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
