import type { SvgIconProps } from './svg-icon-props';

/** Renders a plus icon. */
export function PlusIcon(props: SvgIconProps) {
  return (
    <svg {...props}>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  );
}
