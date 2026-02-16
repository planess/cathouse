import clsx from 'clsx';

interface SectionProps {
  children: React.ReactNode;
  className?: string;
}

export default function Section({ children, className }: SectionProps) {
  return (
    <section
      className={clsx(
        'bg-zinc-50 border border-slate-400 rounded-xl p-6 dark:bg-zinc-700',
        className,
      )}
    >
      {children}
    </section>
  );
}
