import { PlusIcon } from './icons';

export default function Btn({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick?: () => void | Promise<void>;
}) {
  return (
    <button
      type="button"
      className="rounded-full bg-slate-200 px-4 py-2 text-sm font-medium text-neutral-800 transition-colors hover:bg-slate-300 flex items-center gap-2 dark:bg-sky-600 dark:text-slate-100 dark:hover:bg-sky-700"
      onClick={onClick}
    >
      <PlusIcon /> <span>{children}</span>
    </button>
  );
}
