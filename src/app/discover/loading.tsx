export default function DiscoverLoading() {
  return (
    <div className="max-w-3xl mx-auto animate-pulse">
      <div className="h-8 bg-bg-tertiary rounded w-36 mb-6" />
      <div className="h-12 bg-bg-tertiary rounded-xl mb-6" />
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="rounded-xl bg-bg-card border border-border-primary p-4 space-y-3">
            <div className="w-12 h-12 rounded-full bg-bg-tertiary mx-auto" />
            <div className="h-4 bg-bg-tertiary rounded w-3/4 mx-auto" />
            <div className="h-3 bg-bg-tertiary rounded w-1/2 mx-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}
