export default function ProfileLoading() {
  return (
    <div className="max-w-2xl mx-auto animate-pulse">
      <div className="flex flex-col items-center mb-6">
        <div className="w-24 h-24 rounded-full bg-bg-tertiary mb-4" />
        <div className="h-6 bg-bg-tertiary rounded w-40 mb-2" />
        <div className="h-4 bg-bg-tertiary rounded w-24" />
      </div>
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[1, 2, 3].map(i => <div key={i} className="h-16 bg-bg-tertiary rounded-xl" />)}
      </div>
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-20 rounded-xl bg-bg-card border border-border-primary" />
        ))}
      </div>
    </div>
  );
}
