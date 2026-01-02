interface ButtonIconProps {
  onClick: () => void;
}

export function ButtonIcon({
  children,
  onClick,
}: ButtonIconProps & { children: string }) {
  return (
    <button
      type="button"
      className="flex flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
      onClick={onClick}
    >
      {children}
    </button>
  );
}
