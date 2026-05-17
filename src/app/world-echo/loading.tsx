export default function WorldEchoLoading() {
  return (
    <div className="max-w-3xl mx-auto animate-pulse">
      <div className="h-8 bg-bg-tertiary rounded w-40 mb-6" />
      <div className="h-48 rounded-2xl bg-bg-tertiary mb-6" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="rounded-xl bg-bg-card border border-border-primary p-5 space-y-3">
            <div className="h-4 bg-bg-tertiary rounded w-3/4" />
            <div className="h-3 bg-bg-tertiary rounded w-full" />
            <div className="h-3 bg-bg-tertiary rounded w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}
