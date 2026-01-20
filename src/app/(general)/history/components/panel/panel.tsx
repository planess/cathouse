import { ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

export default function Panel({ children }: Props) {
  return (
    <div className="py-3 px-4 bg-zinc-100 text-zinc-900 dark:bg-gray-700 dark:border-gray-500 dark:text-slate-200 transition-colors">
      {children}
    </div>
  );
}
