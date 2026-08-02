type StatusMessageProps = {
  message: string;
  success: boolean;
};

export function StatusMessage({ message, success }: StatusMessageProps) {
  return (
    <div
      className={`rounded-xl px-4 py-3 text-sm font-medium ${
        success
          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
          : 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300'
      }`}
    >
      {message}
    </div>
  );
}
