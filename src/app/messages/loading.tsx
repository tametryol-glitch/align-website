export default function MessagesLoading() {
  return (
    <div className="max-w-2xl mx-auto animate-pulse">
      <div className="h-8 bg-bg-tertiary rounded w-36 mb-6" />
      <div className="h-10 bg-bg-tertiary rounded-xl mb-4" />
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="flex gap-3 p-4 rounded-xl bg-bg-card border border-border-primary">
            <div className="w-12 h-12 rounded-full bg-bg-tertiary shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-bg-tertiary rounded w-32" />
              <div className="h-3 bg-bg-tertiary rounded w-48" />
            </div>
            <div className="h-3 bg-bg-tertiary rounded w-10" />
          </div>
        ))}
      </div>
    </div>
  );
}
