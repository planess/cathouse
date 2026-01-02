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
      className="rounded-full bg-slate-200 px-4 py-2 text-sm font-medium text-neutral-800 transition hover:bg-slate-300 flex items-center gap-2"
      onClick={onClick}
    >
      <PlusIcon /> <span>{children}</span>
    </button>
  );
}
