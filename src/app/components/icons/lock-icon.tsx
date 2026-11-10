import type { SvgIconProps } from './svg-icon-props';

/**
 * Renders a closed padlock icon.
 * @param props - SVG element props forwarded to the root `svg`.
 */
export function LockIcon(props: SvgIconProps) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      viewBox="0 0 24 24"
      {...props}
    >
      <rect height="11" rx="2" ry="2" width="18" x="3" y="11" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}
