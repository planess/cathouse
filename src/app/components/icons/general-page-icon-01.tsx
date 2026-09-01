import type { SvgIconProps } from './svg-icon-props';

/** Renders the GeneralPageIcon01 icon. */
export function GeneralPageIcon01(props: SvgIconProps) {
  return (
    <svg {...props}>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
      <circle cx="12" cy="12" r="9" />
    </svg>
  );
}
