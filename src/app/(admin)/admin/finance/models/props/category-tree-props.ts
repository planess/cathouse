import { CategoryNode } from '../category-node';

export type CategoryTreeProps = {
  nodes: CategoryNode[];
  onEdit: (categoryId: string) => void;
  onDelete: (categoryId: string) => void;
};

export type CategoryTreeNodeProps = {
  node: CategoryNode;
  onEdit: (categoryId: string) => void;
  onDelete: (categoryId: string) => void;
};
