import type { AuthCardProps } from '../../models/auth-card-props';

/**
 * Card hosting a guest (auth) form: a white sheet on mobile, a bordered card on wide screens.
 *
 * @param props - Card props.
 * @param props.title - Card heading.
 * @param props.children - Card content.
 */
export default function AuthCard({ title, children }: AuthCardProps) {
  return (
    <div className="flex grow flex-col gap-[18px] lg:grow-0 lg:gap-5 rounded-t-3xl lg:rounded-2xl bg-white dark:bg-stone-900 px-6 pt-7 pb-6 lg:p-8 lg:border lg:border-slate-200 lg:dark:border-stone-700 lg:shadow-xs">
      <h2 className="m-0 text-2xl leading-[30px] lg:text-3xl lg:leading-9 font-extrabold">
        {title}
      </h2>

      {children}
    </div>
  );
}
