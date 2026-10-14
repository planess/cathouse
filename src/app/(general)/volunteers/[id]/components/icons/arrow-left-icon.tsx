import type { SvgIconProps } from '@app/components/icons/svg-icon-props';

/**
 * Renders a left-pointing arrow icon.
 *
 * @param props - SVG element props; override the defaults.
 */
export function ArrowLeftIcon(props: SvgIconProps) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M19 12H5m0 0 6-6m-6 6 6 6"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}
