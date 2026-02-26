import { AccountRow } from '../account-row';
import { CategoryNode } from '../category-node';
import { CategoryOption } from '../category-option';
import { ReportFormState } from '../report-form-state';

export type ReportFormProps = {
  accounts: AccountRow[];
  categories: CategoryNode[];
  categoryOptions: CategoryOption[];
  initialState: ReportFormState;
  onPendingFilesChange: (files: File[]) => void;
  onChange: (state: ReportFormState) => void;
  onValidityChange: (isValid: boolean) => void;
};
