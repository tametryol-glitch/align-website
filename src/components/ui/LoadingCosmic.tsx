'use client';

interface Props {
  label?: string;
}

export function LoadingCosmic({ label }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-2 border-accent-muted animate-ping" />
        <div className="absolute inset-0 rounded-full border-2 border-t-accent-primary border-r-transparent border-b-transparent border-l-transparent animate-spin" />
        <div className="absolute inset-2 rounded-full bg-accent-primary/20 flex items-center justify-center">
          <span className="text-lg">✦</span>
        </div>
      </div>
      {label && <p className="text-text-muted text-sm animate-pulse">{label}</p>}
    </div>
  );
}
