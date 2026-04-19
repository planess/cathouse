import { CategoryNode } from '../category-node';

export type CategoryModalState = {
  name: string;
  inheritsId: string;
  active: boolean;
};

export type CategoryModalOptions = {
  title: string;
  submitLabel: string;
  initialState: CategoryModalState;
  categories: CategoryNode[];
  allowActiveEdit: boolean;
  onSubmit: (state: CategoryModalState) => Promise<void>;
};
