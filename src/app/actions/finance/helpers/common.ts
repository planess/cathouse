import { Decimal128 } from 'mongodb';

import { DbTables } from '@app/enum/db-tables';
import { toObjectId } from '@app/helpers/to-object-id';

import type {
  ReportDetailPayload,
  ReportDocumentPayload,
  ReportPayload,
} from '../types/payloads';

export function normalizeText(value?: string): string {
  return value?.trim() ?? '';
}

export function resolveReportCollection(type: ReportPayload['type']) {
  if (type === 'incoming') {
    return DbTables.financeIncomingReports;
  }

  if (type === 'outgoing') {
    return DbTables.financeOutgoingReports;
  }

  return DbTables.financeDebtReports;
}

export function toDecimal(value: number | string | Decimal128): Decimal128 {
  if (value instanceof Decimal128) {
    return value;
  }

  return Decimal128.fromString(String(Number(value ?? 0)));
}

export function toOperationDate(value?: string): Date | null {
  if (value === undefined || value === null || value.trim() === '') {
    return null;
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed;
}

export function toDetails(details?: ReportDetailPayload[]) {
  if (!details) {
    return [];
  }

  return details
    .filter((detail) => normalizeText(detail.description))
    .map((detail) => {
      const categoryId = toObjectId(detail.categoryId);

      return {
        description: normalizeText(detail.description),
        amount: Decimal128.fromString(String(Number(detail.amount ?? 0))),
        ...(categoryId ? { category: categoryId } : {}),
      };
    });
}

export function toDocuments(documents?: ReportDocumentPayload[]) {
  if (!documents) {
    return [];
  }

  return documents
    .filter(
      (document) => normalizeText(document.key) && normalizeText(document.url),
    )
    .map((document) => {
      const uploadedAt = toOperationDate(document.uploadedAt) ?? new Date();

      return {
        key: normalizeText(document.key),
        url: normalizeText(document.url),
        size: Number(document.size ?? 0),
        mimeType: normalizeText(document.mimeType),
        originalName: normalizeText(document.originalName),
        uploadedAt,
        checksum: normalizeText(document.checksum),
        isDeleted: document.isDeleted === true,
      };
    });
}

export function requiresAccount(type: ReportPayload['type']) {
  return type === 'incoming' || type === 'outgoing';
}
