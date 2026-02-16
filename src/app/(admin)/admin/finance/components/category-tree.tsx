import { CategoryNode } from '../models/category-node';

import CategoryTreeNode from './category-tree-node';

export default function CategoryTree({
  nodes,
  onDelete,
}: {
  nodes: CategoryNode[];
  onDelete: (categoryId: string) => void;
}) {
  return (
    <div className="space-y-2">
      {nodes.map((node) => (
        <CategoryTreeNode key={node.id} node={node} onDelete={onDelete} />
      ))}
    </div>
  );
}
