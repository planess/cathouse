import type { Sex } from '@app/models/sex';

/** Props of the editable sex field. */
export interface SexFieldProps {
  /** Saved sex, or `null` when it was never chosen. */
  sex: Sex | null;
}
