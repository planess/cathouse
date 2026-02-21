import { CategoryNode } from '../models/category-node';

import CategoryTreeNode from './category-tree-node';

export default function CategoryTree({
  nodes,
  type,
  onEdit,
  onDelete,
}: {
  nodes: CategoryNode[];
  type: 'incoming' | 'outgoing';
  onEdit: (categoryId: string) => void;
  onDelete: (categoryId: string) => void;
}) {
  return (
    <div className="space-y-2">
      {nodes.map((node) => (
        <CategoryTreeNode
          key={node.id}
          node={node}
          type={type}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
