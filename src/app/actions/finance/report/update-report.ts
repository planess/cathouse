'use server';

import { ObjectId } from 'mongodb';
import { revalidatePath, revalidateTag } from 'next/cache';

import { DbTables } from '@app/enum/db-tables';
import { toObjectId } from '@app/helpers/to-object-id';
import { getCurrentUser } from '@app/hooks/get-user';
import clientPromise from '@app/ins/mongo-client';

import {
  normalizeText,
  requiresAccount,
  resolveReportCollection,
  toDecimal,
  toDetails,
  toDocuments,
  toOperationDate,
} from '../helpers/common';
import { findReportById, rebuildFinanceSnapshots } from '../helpers/db';

import type { ReportPayload } from '../types/payloads';

export async function updateReport(payload: ReportPayload) {
  const reportIdText = payload.id ?? '';

  if (!ObjectId.isValid(reportIdText)) {
    return { success: false, message: 'Invalid report id.' };
  }

  const description = normalizeText(payload.description);
  const amount = Number(payload.amount ?? 0);
  const categoryId = toObjectId(payload.categoryId);
  const accountId = toObjectId(payload.accountId);
  const operationDate = toOperationDate(payload.operationDate);
  const sender = normalizeText(payload.sender);
  const recipient = normalizeText(payload.recipient);
  const iban = normalizeText(payload.iban);

  if (!Number.isFinite(amount) || amount <= 0) {
    return { success: false, message: 'Amount must be greater than zero.' };
  }

  if (requiresAccount(payload.type) && !accountId) {
    return { success: false, message: 'Account is required.' };
  }

  if (requiresAccount(payload.type) && !operationDate) {
    return { success: false, message: 'Operation date is required.' };
  }

  const dbClient = await clientPromise;
  const db = dbClient.db();

  const reportId = toObjectId(reportIdText);

  if (!reportId) {
    return { success: false, message: 'Report not found.' };
  }

  const existing = await findReportById(db, reportId);

  if (!existing) {
    return { success: false, message: 'Report not found.' };
  }

  if (categoryId) {
    const categoryExists = await db
      .collection(DbTables.financeCategories)
      .findOne({ _id: categoryId });

    if (!categoryExists) {
      return { success: false, message: 'Category not found.' };
    }
  }

  await db
    .collection(resolveReportCollection(existing.type))
    .deleteOne({ _id: reportId });

  const currentUser = await getCurrentUser();

  if (payload.type === 'incoming' && accountId && operationDate) {
    await db.collection(DbTables.financeIncomingReports).insertOne({
      ...(currentUser?.id ? { createdBy: currentUser.id } : {}),
      ...(categoryId ? { linkedTo: categoryId } : {}),
      _id: reportId,
      account: accountId,
      amount: toDecimal(amount),
      balance: toDecimal(0),
      sender,
      description,
      operationDate,
      createdAt: new Date(),
    });
  }

  if (payload.type === 'outgoing' && accountId && operationDate) {
    await db.collection(DbTables.financeOutgoingReports).insertOne({
      ...(currentUser?.id ? { createdBy: currentUser.id } : {}),
      ...(categoryId ? { linkedTo: categoryId } : {}),
      _id: reportId,
      account: accountId,
      amount: toDecimal(amount),
      balance: toDecimal(0),
      recipient,
      iban,
      description,
      operationDate,
      details: toDetails(payload.details),
      withdrawal: [],
      documents: toDocuments(payload.documents),
      createdAt: new Date(),
    });
  }

  if (payload.type === 'debt') {
    await db.collection(DbTables.financeDebtReports).insertOne({
      ...(currentUser?.id ? { createdBy: currentUser.id } : {}),
      ...(categoryId ? { linkedTo: categoryId } : {}),
      _id: reportId,
      amount: toDecimal(amount),
      recipient: recipient || 'unknown',
      description,
      details: toDetails(payload.details),
      documents: toDocuments(payload.documents),
      createdAt: new Date(),
    });
  }

  if (
    existing.type === 'incoming' ||
    existing.type === 'outgoing' ||
    payload.type === 'incoming' ||
    payload.type === 'outgoing'
  ) {
    await rebuildFinanceSnapshots(db);
  }

  revalidatePath('/admin/finance');
  if (existing.type === 'debt' || payload.type === 'debt') {
    revalidateTag('admin-finance-debts', 'max');
  }

  return { success: true, message: 'Report updated.' };
}
