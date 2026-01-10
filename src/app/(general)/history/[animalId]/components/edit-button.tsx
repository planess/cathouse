import { PencilIcon } from './icons';

type HtmlTag = keyof HTMLElementTagNameMap;
type PropsOf<T extends HtmlTag> = React.ComponentPropsWithoutRef<T>;

const tagAttributes = {
  button: { type: 'button' },
  span: {},
} satisfies Partial<{ [K in HtmlTag]: Partial<PropsOf<K>> }>;

type SupportedTag = keyof typeof tagAttributes;

interface EditButtonProps {
  label: string;
  tag?: SupportedTag;
  onClick: () => void;
}

export function EditButton({
  label,
  onClick,
  tag = 'button',
}: EditButtonProps) {
  const Tag = tag;
  const attrs = (tagAttributes[tag] ?? {}) as PropsOf<typeof Tag>;

  return (
    <Tag
      {...attrs}
      className="inline-flex h-10 w-10 items-center justify-center rounded-full hover:border border-slate-200 text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
      aria-label={label}
      onClick={onClick}
    >
      <PencilIcon />
    </Tag>
  );
}
