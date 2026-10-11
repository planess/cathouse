import type { ProfileRowProps } from '../../models/profile-row-props';

/**
 * Labeled line of a profile information list; must be placed inside a `<dl>`.
 *
 * @param props - Row props.
 * @param props.label - Name of the information line.
 * @param props.hint - Optional light explanation shown under the label.
 * @param props.children - Value of the line.
 */
export default function ProfileRow({ label, hint, children }: ProfileRowProps) {
  return (
    <div className="grid gap-1 px-4 py-3 sm:grid-cols-3 sm:gap-4">
      <dt className="text-sm text-slate-500 dark:text-stone-400">
        {label}
        {hint && (
          <p className="mt-0.5 text-xs text-slate-400 dark:text-stone-500">
            {hint}
          </p>
        )}
      </dt>
      <dd className="text-sm sm:col-span-2">{children}</dd>
    </div>
  );
}
