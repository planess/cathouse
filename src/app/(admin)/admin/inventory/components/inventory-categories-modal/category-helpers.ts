import type {
  InventoryCategoryNode,
  InventoryCategoryOption,
  InventoryCategoryRow,
} from '../../types/inventory.types';

export function buildCategoryRows(
  categories: InventoryCategoryNode[],
  options: InventoryCategoryOption[],
): InventoryCategoryRow[] {
  const categoryNameMap = new Map(options.map((option) => [option.id, option.name]));
  const inheritsMap = new Map(options.map((option) => [option.id, option.inheritsFrom]));

  const flattened: InventoryCategoryRow[] = [];

  const walk = (node: InventoryCategoryNode, depth: number) => {
    const inheritsFrom = inheritsMap.get(node.id) ?? null;
    const parentName =
      typeof inheritsFrom === 'string' && inheritsFrom.length > 0
        ? (categoryNameMap.get(inheritsFrom) ?? '')
        : '';

    flattened.push({
      id: node.id,
      name: node.name,
      createdAt: node.createdAt,
      parentName,
      depth,
      hasChildren: node.children.length > 0,
    });

    node.children.forEach((child) => walk(child, depth + 1));
  };

  categories.forEach((category) => walk(category, 0));

  return flattened;
}

export function collectDescendantIds(
  categories: InventoryCategoryNode[],
  rootId: string,
) {
  const ids = new Set<string>();

  const findNode = (
    nodes: InventoryCategoryNode[],
  ): InventoryCategoryNode | null => {
    for (const node of nodes) {
      if (node.id === rootId) {
        return node;
      }

      const match = findNode(node.children);
      if (match) {
        return match;
      }
    }

    return null;
  };

  const walk = (node: InventoryCategoryNode) => {
    ids.add(node.id);
    node.children.forEach(walk);
  };

  const root = findNode(categories);
  if (root) {
    walk(root);
  }

  return ids;
}
