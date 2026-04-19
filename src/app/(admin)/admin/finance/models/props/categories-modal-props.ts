import { CategoryNode } from '../category-node';
import { CategoryOption } from '../category-option';

export type CategoriesModalProps = {
  categories: CategoryNode[];
  options: CategoryOption[];
  onRefresh: () => void;
};
