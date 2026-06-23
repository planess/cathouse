interface EmptyStateProps {
  message: string;
}

export function EmptyState({ message }: EmptyStateProps) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-800/60 px-4 py-6 text-center text-sm text-slate-500 dark:text-slate-400 transition-colors">
      {message}
    </div>
  );
}
