export default function ReadingsLoading() {
  return (
    <div className="max-w-3xl mx-auto animate-pulse">
      <div className="h-8 bg-bg-tertiary rounded w-40 mb-6" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="rounded-xl bg-bg-card border border-border-primary p-5 h-32" />
        ))}
      </div>
    </div>
  );
}
