export default function ChartLoading() {
  return (
    <div className="max-w-3xl mx-auto animate-pulse">
      <div className="h-8 bg-bg-tertiary rounded w-32 mb-6" />
      <div className="aspect-square max-w-md mx-auto rounded-full bg-bg-tertiary mb-6" />
      <div className="grid grid-cols-4 gap-2">
        {[1, 2, 3, 4].map(i => <div key={i} className="h-10 bg-bg-tertiary rounded-lg" />)}
      </div>
    </div>
  );
}
