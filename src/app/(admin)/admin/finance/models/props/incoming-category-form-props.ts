import { CategoryNode } from '../category-node';

export type IncomingCategoryFormState = {
  name: string;
  inheritsId: string;
  active: boolean;
};

export type IncomingCategoryFormProps = {
  categories: CategoryNode[];
  onChange: (state: IncomingCategoryFormState) => void;
  initialState?: IncomingCategoryFormState;
  allowActiveEdit: boolean;
};
