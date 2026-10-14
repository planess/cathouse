import type { SvgIconProps } from '@app/components/icons/svg-icon-props';

/**
 * Renders a shield icon.
 *
 * @param props - SVG element props; override the defaults.
 */
export function ShieldIcon(props: SvgIconProps) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M12 3 5 6v5c0 4.97 2.96 8.86 7 10 4.04-1.14 7-5.03 7-10V6l-7-3Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}
