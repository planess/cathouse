import type {
  InventoryEntityRow,
  InventoryTableCategoryNode,
  InventoryTransactionRow,
} from '../../types/inventory.types';

const currencyCompactFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

const currencyPreciseFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function displayValue(value: string): string {
  return value.length > 0 ? value : '-';
}

function toFiniteNumberOrNull(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

export function countCategoryRows(node: InventoryTableCategoryNode): number {
  const childrenCount = node.children.reduce(
    (sum, child) => sum + countCategoryRows(child),
    0,
  );

  return node.items.length + childrenCount;
}

export function entityTitle(entity: InventoryEntityRow): string {
  return entity.kind === 'asset'
    ? displayValue(entity.individualId ?? entity.serialNumber)
    : displayValue(entity.batchNumber);
}

function normalizeText(value: string): string {
  return value
    .replaceAll('_', ' ')
    .replaceAll('-', ' ')
    .trim()
    .replaceAll(/\s+/g, ' ');
}

export function formatConditionLabel(value: string): string {
  const normalized = normalizeText(value);

  if (normalized.length === 0) {
    return '-';
  }

  return normalized
    .split(' ')
    .map(
      (word) => `${word.charAt(0).toUpperCase()}${word.slice(1).toLowerCase()}`,
    )
    .join(' ');
}

export function formatTransactionType(value: string): string {
  const normalized = normalizeText(value);

  return normalized.length > 0 ? normalized.toUpperCase() : '-';
}

function resolveLatestTransaction(
  entity: InventoryEntityRow,
): InventoryTransactionRow | null {
  return entity.transactions.length > 0 ? entity.transactions[0] : null;
}

export function resolveEntityOwner(entity: InventoryEntityRow): string {
  const latestTransaction = resolveLatestTransaction(entity);

  if (!latestTransaction) {
    return '-';
  }

  const destination = latestTransaction.to ?? {};
  const toType = destination.type;
  const toName = destination.name?.trim() ?? '';

  if (toName.length > 0) {
    return `${toType} ${toName}`;
  }

  const toId = destination.id?.trim() ?? '';

  if (toId.length > 0) {
    return `${toType} ${toId}`;
  }

  return '-';
}

export function buildEntityAmount(entity: InventoryEntityRow): string {
  const latestTransaction = resolveLatestTransaction(entity);
  const quantity =
    latestTransaction?.remainingQuantity ??
    latestTransaction?.quantity ??
    (entity.kind === 'asset' ? 1 : null);

  if (quantity === null) {
    return '-';
  }

  const unit = entity.unit.trim();
  const estimatedCost = toFiniteNumberOrNull(latestTransaction?.estimatedCost);

  if (estimatedCost === null) {
    return unit.length > 0 ? `${quantity} ${unit}` : `${quantity}`;
  }

  if (entity.kind === 'consumable' && unit.length > 0 && quantity > 0) {
    const unitPrice = estimatedCost / quantity;

    return `${quantity} (${currencyCompactFormatter.format(estimatedCost)}=>${currencyPreciseFormatter.format(unitPrice)}/${unit})`;
  }

  return `${quantity} (${currencyCompactFormatter.format(estimatedCost)})`;
}
