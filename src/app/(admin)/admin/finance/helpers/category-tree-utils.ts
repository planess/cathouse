import { CategoryNode } from '../models/category-node';

export function collectNodeIds(node: CategoryNode): Set<string> {
  const ids = new Set<string>([node.id]);

  node.children.forEach((child) => {
    collectNodeIds(child).forEach((id) => ids.add(id));
  });

  return ids;
}

export function excludeNodesById(
  nodes: CategoryNode[],
  excludedIds: Set<string>,
): CategoryNode[] {
  return nodes
    .filter((node) => !excludedIds.has(node.id))
    .map((node) => ({
      ...node,
      children: excludeNodesById(node.children, excludedIds),
    }));
}

export function findNodeById(
  nodes: CategoryNode[],
  nodeId: string,
): CategoryNode | null {
  for (const node of nodes) {
    if (node.id === nodeId) {
      return node;
    }

    const match = findNodeById(node.children, nodeId);

    if (match) {
      return match;
    }
  }

  return null;
}
