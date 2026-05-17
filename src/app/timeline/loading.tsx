export default function TimelineLoading() {
  return (
    <div className="max-w-2xl mx-auto animate-pulse">
      <div className="h-8 bg-bg-tertiary rounded w-36 mb-6" />
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="w-3 h-3 rounded-full bg-bg-tertiary" />
              <div className="w-0.5 h-16 bg-bg-tertiary" />
            </div>
            <div className="flex-1 rounded-xl bg-bg-card border border-border-primary p-4 space-y-2">
              <div className="h-3 bg-bg-tertiary rounded w-20" />
              <div className="h-4 bg-bg-tertiary rounded w-3/4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
