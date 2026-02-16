interface EmptyStateProps {
  message: string;
}

export function EmptyState({ message }: EmptyStateProps) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-white/60 px-4 py-6 text-center text-sm text-slate-500">
      {message}
    </div>
  );
}
