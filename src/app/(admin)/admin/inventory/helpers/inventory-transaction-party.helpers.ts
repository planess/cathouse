import { toObjectId, toText } from './inventory-page-value-helpers';

import type { InventoryTransactionPartyRow } from '../types/inventory.types';

export type TransactionPartyLookupOptions = {
  peopleById: Map<string, string>;
  clinicsById: Map<string, string>;
  volunteersById: Map<string, string>;
  storagesById: Map<string, string>;
};

function resolvePartyReferenceName(
  type: string,
  id: string,
  sourceName: string,
  options: TransactionPartyLookupOptions,
): string {
  if (sourceName.length > 0) {
    return sourceName;
  }

  if (id.length === 0) {
    return '';
  }

  if (type === 'people') {
    return options.peopleById.get(id) ?? '';
  }

  if (type === 'clinic') {
    return options.clinicsById.get(id) ?? '';
  }

  if (type === 'volunteer') {
    return options.volunteersById.get(id) ?? '';
  }

  if (type === 'storage') {
    return options.storagesById.get(id) ?? '';
  }

  return '';
}

export function buildTransactionParty(
  value: Record<string, unknown> | null,
  options: TransactionPartyLookupOptions,
): InventoryTransactionPartyRow {
  const type = toText(value?.type).trim();

  if (type.length === 0) {
    throw new Error('Invalid transaction party type');
  }

  const id = toObjectId(value?.id)?.toString() ?? '';
  const sourceName = toText(value?.name).trim();
  const name = resolvePartyReferenceName(type, id, sourceName, options);

  if (id.length === 0 && name.length === 0) {
    throw new Error('Invalid transaction party reference');
  }

  if (id.length > 0 && name.length > 0) {
    return {
      type,
      id,
      name,
    };
  }

  if (id.length > 0) {
    return {
      type,
      id,
    };
  }

  return {
    type,
    name,
  };
}