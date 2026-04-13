import type {
  InventoryAdminViewProps,
  InventoryItemRow,
  InventoryTableCategoryNode,
} from '../types/inventory.types';

export function mapCategoryForTable(
  category: InventoryAdminViewProps['categories'][number],
  itemsByCategoryId: Map<string, InventoryItemRow[]>,
): InventoryTableCategoryNode {
  return {
    id: category.id,
    name: category.name,
    children: category.children.map((child) =>
      mapCategoryForTable(child, itemsByCategoryId),
    ),
    items: itemsByCategoryId.get(category.id) ?? [],
  };
}