import type { SvgIconProps } from '@app/components/icons/svg-icon-props';

/**
 * Renders a check mark in a circle icon.
 *
 * @param props - SVG element props; override the defaults.
 */
export function CheckCircleIcon(props: SvgIconProps) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M9 12.4 11.1 14.5 15.5 9.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}
