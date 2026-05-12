export default function DashboardLoading() {
  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-pulse">
      <div className="space-y-2">
        <div className="h-4 bg-bg-tertiary rounded w-24" />
        <div className="h-7 bg-bg-tertiary rounded w-48" />
      </div>
      <div className="rounded-2xl bg-bg-tertiary h-40" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-bg-tertiary rounded-xl" />)}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
        {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-20 bg-bg-tertiary rounded-xl" />)}
      </div>
    </div>
  );
}
