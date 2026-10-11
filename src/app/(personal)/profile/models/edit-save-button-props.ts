/** Props of the button that switches a profile field to edit mode and saves it. */
export interface EditSaveButtonProps {
  /** Whether the field is in edit mode. */
  isEditing: boolean;
  /** Whether the edited value can be saved. */
  canSave: boolean;
  /** Whether a save request is in progress. */
  pending: boolean;
  /** Switches the field to edit mode. */
  onEdit: () => void;
  /** Discards changes and leaves edit mode. */
  onCancel: () => void;
}
