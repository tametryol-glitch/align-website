export default function ReelsLoading() {
  return (
    <div className="max-w-4xl mx-auto animate-pulse">
      <div className="h-8 bg-bg-tertiary rounded w-28 mb-6" />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
          <div key={i} className="aspect-[9/16] rounded-xl bg-bg-tertiary" />
        ))}
      </div>
    </div>
  );
}
