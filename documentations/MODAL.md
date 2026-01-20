# Modal system

The modal system lets any client component open a dialog and await the user response. It is powered by `ModalProvider`, loaded globally from `src/app/layout.tsx`, and the `useModal` hook.

## Hook

```tsx
'use client';
import { useModal } from '@app/hooks/use-modal';

export function DeleteButton() {
  const { showModal } = useModal();

  const handleClick = async () => {
    const confirmed = await showModal({
      title: 'Remove treatment record?'
    ,  description: 'This action cannot be undone.',
      actions: [
        { label: 'Cancel', tone: 'ghost' },
        {
          label: 'Remove',
          tone: 'danger',
          onSelect: () => true,
        },
      ],
    });

    if (confirmed) {
      // perform delete
    }
  };

  return (
    <button type="button" onClick={handleClick}>
      Remove
    </button>
  );
}
```

## API

`showModal<T>(options: ModalOptions<T>): Promise<T | undefined>`

- `title`: optional heading text.
- `content`: any React node or a function that returns one. Shown above the action row.
- `description`: lighter text placed under the title when no custom `content` is required.
- `actions`: array of buttons. Each action supports:
  - `label`: button text.
  - `tone`: `primary | secondary | danger | ghost` (defaults to `secondary`).
  - `onSelect`: callback that can return a value or promise. The resolved value is passed back through the promise returned by `showModal`.
  - `value`: fallback value if `onSelect` returns `void`.
  - `autoClose`: set to `false` to keep the modal open after the action completes.
  - `disabled`: disables the button.
- `dismissible`: disables overlay, escape, and close button when set to `false`.
- `dismissLabel`: custom label for the default close button when no `actions` are supplied.
- `size`: `sm | md | lg` width presets (defaults to `md`).

If no actions are provided a single "Close" button is rendered. Dismissing the modal without selecting an action resolves the promise with `undefined`.
