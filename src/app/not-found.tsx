import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-5xl mb-4">🔭</div>
        <h1 className="text-2xl font-display font-bold text-text-primary mb-2">
          Lost in Space
        </h1>
        <p className="text-text-tertiary text-sm mb-6">
          This page doesn&apos;t exist in our galaxy — yet.
        </p>
        <Link href="/dashboard" className="btn-primary inline-block">
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
