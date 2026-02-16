'use client';

export function ReportsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="animate-pulse space-y-3">
        <div className="h-6 w-48 rounded-full bg-slate-200" />
        <div className="h-4 w-full rounded-full bg-slate-200" />
        <div className="h-4 w-3/4 rounded-full bg-slate-200" />
      </div>
      <div className="grid gap-4">
        {[0, 1].map((item) => (
          <div
            key={`skeleton-${item}`}
            className="h-4 w-full rounded-full bg-slate-200 animate-pulse"
          />
        ))}
      </div>
    </div>
  );
}
