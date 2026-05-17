export default function SettingsLoading() {
  return (
    <div className="max-w-2xl mx-auto animate-pulse">
      <div className="h-8 bg-bg-tertiary rounded w-32 mb-6" />
      <div className="space-y-3">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="flex items-center gap-3 p-4 rounded-xl bg-bg-card border border-border-primary">
            <div className="w-10 h-10 rounded-lg bg-bg-tertiary" />
            <div className="flex-1">
              <div className="h-4 bg-bg-tertiary rounded w-32 mb-1" />
              <div className="h-3 bg-bg-tertiary rounded w-48" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
