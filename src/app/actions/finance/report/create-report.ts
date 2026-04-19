'use server';

import { revalidatePath, revalidateTag } from 'next/cache';

import { DbTables } from '@app/enum/db-tables';
import { toObjectId } from '@app/helpers/to-object-id';
import { getCurrentUser } from '@app/hooks/get-user';
import clientPromise from '@app/ins/mongo-client';

import {
  normalizeText,
  requiresAccount,
  toDecimal,
  toDetails,
  toDocuments,
  toOperationDate,
} from '../helpers/common';
import { rebuildFinanceSnapshots } from '../helpers/db';

import type { ReportPayload } from '../types/payloads';

export async function createReport(payload: ReportPayload) {
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
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return { success: false, message: 'User not authenticated.' };
  }
  if (categoryId) {
    const categoryExists = await db
      .collection(DbTables.financeCategories)
      .findOne({ _id: categoryId, active: { $ne: false } });

    if (!categoryExists) {
      return { success: false, message: 'Category not found.' };
    }
  }

  if (payload.type === 'incoming' && accountId) {
    await db.collection(DbTables.financeIncomingReports).insertOne({
      ...(categoryId ? { linkedTo: categoryId } : {}),
      account: accountId,
      amount: toDecimal(amount),
      balance: toDecimal(0),
      sender,
      description,
      operationDate,
      createdAt: new Date(),
      createdBy: currentUser.id,
    });

    await rebuildFinanceSnapshots(db);
  }

  if (payload.type === 'outgoing' && accountId) {
    await db.collection(DbTables.financeOutgoingReports).insertOne({
      ...(categoryId ? { linkedTo: categoryId } : {}),
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
      createdBy: currentUser.id,
    });

    await rebuildFinanceSnapshots(db);
  }

  if (payload.type === 'debt') {
    await db.collection(DbTables.financeDebtReports).insertOne({
      ...(categoryId ? { linkedTo: categoryId } : {}),
      amount: toDecimal(amount),
      recipient: recipient || 'unknown',
      description,
      details: toDetails(payload.details),
      documents: toDocuments(payload.documents),
      createdAt: new Date(),
      createdBy: currentUser.id,
    });
  }

  revalidatePath('/admin/finance');

  if (payload.type === 'debt') {
    revalidateTag('admin-finance-debts');
  }

  return { success: true, message: 'Report created.' };
}
