import { Decimal128, ObjectId } from 'mongodb';

export function toTypedArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

export function toRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === 'object' && value !== null
    ? (value as Record<string, unknown>)
    : null;
}

export function toObjectId(value: unknown): ObjectId | null {
  return value instanceof ObjectId ? value : null;
}

export function toText(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

export function toNumberOrNull(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (value instanceof Decimal128) {
    const parsed = Number(value.toString());

    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

export function toDateInput(value: unknown): Date | string | number | undefined {
  if (value instanceof Date) {
    return value;
  }

  if (typeof value === 'string' || typeof value === 'number') {
    return value;
  }

  return undefined;
}