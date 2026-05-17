export default function FriendsLoading() {
  return (
    <div className="max-w-2xl mx-auto animate-pulse">
      <div className="h-8 bg-bg-tertiary rounded w-32 mb-6" />
      <div className="flex gap-2 mb-6">
        {[1, 2, 3].map(i => <div key={i} className="h-9 bg-bg-tertiary rounded-full w-24" />)}
      </div>
      <div className="space-y-3">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="flex items-center gap-3 p-4 rounded-xl bg-bg-card border border-border-primary">
            <div className="w-12 h-12 rounded-full bg-bg-tertiary" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-bg-tertiary rounded w-28" />
              <div className="h-3 bg-bg-tertiary rounded w-20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
