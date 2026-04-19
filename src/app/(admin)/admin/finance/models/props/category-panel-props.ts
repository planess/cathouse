import { CategoryNode } from '../category-node';
import { CategoryOption } from '../category-option';

export type CategoryPanelProps = {
  title: string;
  categories: CategoryNode[];
  options: CategoryOption[];
  onRefresh: () => void;
};
