import type { InventoryCategoryDocument } from '../types/inventory-db.types';
import type { InventoryCategoryNode } from '../types/inventory.types';

export function formatDateLabel(value?: Date | string | number): string {
  if (!value) {
    return '';
  }

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toISOString().slice(0, 10);
}

export function buildCategoryTree(
  categories: InventoryCategoryDocument[],
): InventoryCategoryNode[] {
  const nodes = new Map<
    string,
    InventoryCategoryNode & { parentId?: string }
  >();

  categories.forEach((category) => {
    nodes.set(category._id.toString(), {
      id: category._id.toString(),
      name: category.name,
      createdAt: formatDateLabel(category.createdAt),
      parentId: category.inherits?.toString(),
      children: [],
    });
  });

  const roots: InventoryCategoryNode[] = [];

  nodes.forEach((node) => {
    if (node.parentId && nodes.has(node.parentId)) {
      nodes.get(node.parentId)?.children.push(node);
      return;
    }

    roots.push(node);
  });

  return roots;
}
