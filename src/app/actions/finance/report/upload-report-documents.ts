'use server';

import { r2Service } from '@app/services/r2.service';

import { normalizeText } from '../helpers/common';

import type { ReportDocumentPayload } from '../types/payloads';

function toKebab(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replaceAll(/[^\da-z]+/g, '-')
    .replaceAll(/^-+|-+$/g, '');
}

function buildDocumentBaseName(
  operationDate: string,
  categoryId: string,
  amount: number,
): string {
  const amountLabel = Number.isFinite(amount) ? String(amount) : '0';

  return [
    toKebab(operationDate || new Date().toISOString()),
    toKebab(categoryId || 'uncategorized'),
    toKebab(amountLabel),
  ]
    .filter(Boolean)
    .join('-');
}

function toNumber(value: FormDataEntryValue | null): number {
  if (typeof value !== 'string') {
    return 0;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : 0;
}

export async function uploadReportDocuments(formData: FormData) {
  const type = normalizeText(formData.get('type')?.toString());

  if (type !== 'outgoing' && type !== 'debt') {
    return {
      success: false,
      message: 'Documents are available only for outgoing and debt reports.',
      documents: [] as ReportDocumentPayload[],
    };
  }

  const files = formData
    .getAll('files')
    .filter((value): value is File => value instanceof File && value.size > 0);

  if (files.length === 0) {
    return {
      success: true,
      message: 'No files selected.',
      documents: [] as ReportDocumentPayload[],
    };
  }

  const baseName = buildDocumentBaseName(
    normalizeText(formData.get('operationDate')?.toString()),
    normalizeText(formData.get('categoryId')?.toString()),
    toNumber(formData.get('amount')),
  );

  let uploadedAssets: Awaited<ReturnType<typeof r2Service.uploadFiles>>;

  try {
    uploadedAssets = await r2Service.uploadFiles(files, {
      folder: 'docs/bills',
      fileNameBase: baseName,
      metadata: {
        section: `finance_${type}_reports`,
      },
    });
  } catch {
    return {
      success: false,
      message: 'Failed to upload documents.',
      documents: [] as ReportDocumentPayload[],
    };
  }

  return {
    success: true,
    message: 'Documents uploaded.',
    documents: uploadedAssets.map((asset) => ({
      key: asset.key,
      url: asset.url,
      size: asset.size,
      mimeType: asset.mimeType,
      originalName: asset.originalName,
      uploadedAt: asset.uploadedAt.toISOString(),
      checksum: asset.checksum ?? '',
      isDeleted: false,
    })),
  };
}
