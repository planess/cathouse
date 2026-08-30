import type { OfferNavigationProps } from '@app/models/offer-navigation-props.model';

export default function OfferNavigation({
  title,
  subtitle,
  items,
  children,
}: OfferNavigationProps) {
  return (
    <div className="flex flex-col gap-4 bg-white dark:bg-[#1c2636] p-6 rounded-xl border border-[#e7ebf4] dark:border-[#2d3a52]">
      <div className="mb-2">
        <h3 className="text-base font-bold text-[#256af4]">{title}</h3>

        <p className="text-[#49659c] dark:text-[#a1b2d3] text-xs">{subtitle}</p>
      </div>

      <nav className="flex flex-col gap-1">
        {items.map((item) => (
          <a
            key={item.id}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#253247] text-[#49659c] dark:text-[#a1b2d3] font-medium text-sm transition-colors"
            href={`#${item.id}`}
          >
            {item.icon ? (
              <span className="text-lg size-5">{item.icon}</span>
            ) : (
              <span className="size-2 rounded-full bg-[#256af4]" />
            )}
            <span>{item.label}</span>
          </a>
        ))}
      </nav>

      {children && (
        <div className="border-t border-gray-200 dark:border-zinc-500 pt-4">
          {children}
        </div>
      )}
    </div>
  );
}
