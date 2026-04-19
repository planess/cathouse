import { CategoryTreeProps } from '../models/props/category-tree-props';

import CategoryTreeNode from './category-tree-node';

export default function CategoryTree({
  nodes,
  onEdit,
  onDelete,
}: CategoryTreeProps) {
  return (
    <div className="space-y-2">
      {nodes.map((node) => (
        <CategoryTreeNode
          key={node.id}
          node={node}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
