import { CategoryNode } from '../category-node';

export type IncomingParentTreeSelectProps = {
  categories: CategoryNode[];
  selectedParentId: string;
  disabled: boolean;
  emptyLabel: string;
  onSelect: (parentId: string) => void;
};

export type TreeItemProps = {
  node: CategoryNode;
  depth: number;
  selectedParentId: string;
  disabled: boolean;
  onSelect: (parentId: string) => void;
};
