'use client';

import { useTranslations } from 'next-intl';

import type { EditSaveButtonProps } from '../../models/edit-save-button-props';

/**
 * "Edit" button of an editable profile field that turns into "Save" (with
 * "Cancel") in edit mode. Must be placed inside the field's form: "Save"
 * submits it.
 *
 * @param props - Button props.
 * @param props.isEditing - Whether the field is in edit mode.
 * @param props.canSave - Whether the edited value can be saved.
 * @param props.pending - Whether a save request is in progress.
 * @param props.onEdit - Switches the field to edit mode.
 * @param props.onCancel - Discards changes and leaves edit mode.
 */
export default function EditSaveButton({
  isEditing,
  canSave,
  pending,
  onEdit,
  onCancel,
}: EditSaveButtonProps) {
  const t = useTranslations('profilepage.edit');

  if (!isEditing) {
    return (
      <button
        className="shrink-0 rounded-lg px-3 py-1 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50 dark:text-emerald-300 dark:hover:bg-emerald-950/30"
        onClick={onEdit}
        type="button"
      >
        {t('edit')}
      </button>
    );
  }

  return (
    // Vertically centered beside the editor: stacked on mobile, in a row from `sm`
    <div className="flex shrink-0 flex-col gap-2 self-center sm:flex-row">
      <button
        className="rounded-lg px-3 py-1 text-sm font-semibold text-slate-500 transition hover:bg-slate-100 disabled:opacity-50 dark:text-stone-400 dark:hover:bg-stone-800"
        disabled={pending}
        onClick={onCancel}
        type="button"
      >
        {t('cancel')}
      </button>
      <button
        className="rounded-lg bg-emerald-600 px-3 py-1 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50 dark:bg-emerald-500 dark:hover:bg-emerald-600"
        disabled={!canSave || pending}
        type="submit"
      >
        {pending ? t('saving') : t('save')}
      </button>
    </div>
  );
}
