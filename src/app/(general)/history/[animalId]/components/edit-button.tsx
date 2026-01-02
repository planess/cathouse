import { PencilIcon } from './icons';

interface EditButtonProps {
  label: string;
  onClick: () => void;
}

export function EditButton({ label, onClick }: EditButtonProps) {
  return (
    <button
      type="button"
      className="inline-flex h-10 w-10 items-center justify-center rounded-full hover:border border-slate-200 text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
      aria-label={label}
      onClick={onClick}
    >
      <PencilIcon />
    </button>
  );
}
