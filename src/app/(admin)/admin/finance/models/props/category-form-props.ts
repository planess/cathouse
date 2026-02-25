import { CategoryOption } from '../category-option';

export type CategoryFormState = {
  name: string;
  inheritsId: string;
};

export type CategoryFormProps = {
  options: CategoryOption[];
  onChange: (state: CategoryFormState) => void;
  initialState?: CategoryFormState;
};
