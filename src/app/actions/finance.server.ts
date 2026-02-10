'use server';

import { ObjectId } from 'mongodb';
import { revalidatePath } from 'next/cache';

import { DbTables } from '@app/enum/db-tables';
import { getCurrentUser } from '@app/hooks/get-user';
import clientPromise from '@app/ins/mongo-client';

type AccountPayload = {
  id?: string;
  name: string;
  iban: string;
};

type CategoryPayload = {
  id?: string;
  name: string;
  inheritsId?: string;
  type: 'incoming' | 'outgoing';
};

type ReportDetailPayload = {
  description: string;
  amount: number;
  categoryId?: string;
};

type ReportPayload = {
  id?: string;
  type: 'incoming' | 'outgoing' | 'debt';
  description: string;
  categoryId?: string;
  accountId?: string;
  amount: number;
  details?: ReportDetailPayload[];
};

function normalizeText(value?: string): string {
  return value?.trim() ?? '';
}

function toObjectId(value?: string): ObjectId | null {
  if (!value) {
    return null;
  }

  return ObjectId.isValid(value) ? new ObjectId(value) : null;
}

function toDetails(details?: ReportDetailPayload[]) {
  if (!details) {
    return [];
  }

  return details
    .filter((detail) => normalizeText(detail.description))
    .map((detail) => {
      const categoryId = toObjectId(detail.categoryId);

      return {
        description: normalizeText(detail.description),
        amount: Number(detail.amount ?? 0),
        ...(categoryId ? { category: categoryId } : {}),
      };
    });
}

function resolveBalanceDelta(type: ReportPayload['type'], amount: number) {
  amount = Math.abs(amount);

  if (type === 'incoming') {
    return amount;
  }

  if (type === 'outgoing') {
    return -amount;
  }

  return 0;
}

function requiresAccount(type: ReportPayload['type']) {
  return type === 'incoming' || type === 'outgoing';
}

async function fetchAccountBalance(accountId: ObjectId): Promise<number> {
  const dbClient = await clientPromise;
  const db = dbClient.db();

  const account = await db
    .collection(DbTables.bankAccounts)
    .findOne<{ balance: number }>({ _id: accountId });

  return account?.balance ?? 0;
}

export async function createAccount(payload: AccountPayload) {
  const name = normalizeText(payload.name);
  const iban = normalizeText(payload.iban);

  if (!name || !iban) {
    return { success: false, message: 'Name and IBAN are required.' };
  }

  const dbClient = await clientPromise;
  const db = dbClient.db();

  const insertResult = await db.collection(DbTables.bankAccounts).insertOne({
    name,
    iban,
    balance: 0,
    isActive: true,
    createdAt: new Date(),
  });

  revalidatePath('/admin/finance');

  return {
    success: true,
    message: 'Account created.',
    accountId: insertResult.insertedId.toString(),
  };
}

export async function updateAccount(payload: AccountPayload) {
  if (!payload.id || !ObjectId.isValid(payload.id)) {
    return { success: false, message: 'Invalid account id.' };
  }

  const name = normalizeText(payload.name);
  const iban = normalizeText(payload.iban);

  if (!name || !iban) {
    return { success: false, message: 'Name and IBAN are required.' };
  }

  const dbClient = await clientPromise;
  const db = dbClient.db();

  await db.collection(DbTables.bankAccounts).updateOne(
    { _id: new ObjectId(payload.id) },
    {
      $set: {
        name,
        iban,
      },
    },
  );

  revalidatePath('/admin/finance');

  return { success: true, message: 'Account updated.' };
}

export async function deactivateAccount(accountId: string) {
  if (!ObjectId.isValid(accountId)) {
    return { success: false, message: 'Invalid account id.' };
  }

  const dbClient = await clientPromise;
  const db = dbClient.db();

  await db
    .collection(DbTables.bankAccounts)
    .updateOne({ _id: new ObjectId(accountId) }, { $set: { isActive: false } });

  revalidatePath('/admin/finance');

  return { success: true, message: 'Account deactivated.' };
}

export async function createCategory(payload: CategoryPayload) {
  const name = normalizeText(payload.name);

  if (!name) {
    return { success: false, message: 'Category name is required.' };
  }

  const inheritsId = toObjectId(payload.inheritsId);
  const table =
    payload.type === 'incoming'
      ? DbTables.financeIncomingCategories
      : DbTables.financeOutgoingCategories;

  const dbClient = await clientPromise;
  const db = dbClient.db();

  await db.collection(table).insertOne({
    name,
    ...(inheritsId ? { inherits: inheritsId } : {}),
    createdAt: new Date(),
  });

  revalidatePath('/admin/finance');

  return { success: true, message: 'Category created.' };
}

export async function deleteCategory(payload: CategoryPayload) {
  if (!payload.id || !ObjectId.isValid(payload.id)) {
    return { success: false, message: 'Invalid category id.' };
  }

  const table =
    payload.type === 'incoming'
      ? DbTables.financeIncomingCategories
      : DbTables.financeOutgoingCategories;

  const dbClient = await clientPromise;
  const db = dbClient.db();

  const categoryId = new ObjectId(payload.id);

  const inUse = await db.collection(DbTables.reportsFinance).findOne({
    $or: [{ category: categoryId }, { 'details.category': categoryId }],
  });

  if (inUse) {
    return {
      success: false,
      message: 'This category has linked reports and cannot be deleted.',
    };
  }

  await db.collection(table).deleteOne({ _id: categoryId });

  revalidatePath('/admin/finance');

  return { success: true, message: 'Category deleted.' };
}

export async function createReport(payload: ReportPayload) {
  const description = normalizeText(payload.description);
  const amount = Number(payload.amount ?? 0);
  const categoryId = toObjectId(payload.categoryId);
  const accountId = toObjectId(payload.accountId);

  if (!categoryId) {
    return { success: false, message: 'Category is required.' };
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    return { success: false, message: 'Amount must be greater than zero.' };
  }

  if (requiresAccount(payload.type) && !accountId) {
    return { success: false, message: 'Account is required.' };
  }

  const dbClient = await clientPromise;
  const db = dbClient.db();
  const currentUser = await getCurrentUser();

  let updatedBalance = 0;

  if (accountId) {
    const delta = resolveBalanceDelta(payload.type, amount);

    if (delta !== 0) {
      await db
        .collection(DbTables.bankAccounts)
        .updateOne({ _id: accountId }, { $inc: { balance: delta } });
    }

    updatedBalance = await fetchAccountBalance(accountId);
  }

  await db.collection(DbTables.reportsFinance).insertOne({
    type: payload.type,
    description,
    category: categoryId,
    amount,
    ...(accountId ? { account: accountId } : {}),
    balance: updatedBalance,
    details: toDetails(payload.details),
    createdAt: new Date(),
    ...(currentUser?.id ? { createdBy: currentUser.id } : {}),
  });

  revalidatePath('/admin/finance');

  return { success: true, message: 'Report created.' };
}

export async function updateReport(payload: ReportPayload) {
  if (!payload.id || !ObjectId.isValid(payload.id)) {
    return { success: false, message: 'Invalid report id.' };
  }

  const description = normalizeText(payload.description);
  const amount = Number(payload.amount ?? 0);
  const categoryId = toObjectId(payload.categoryId);
  const accountId = toObjectId(payload.accountId);

  if (!categoryId) {
    return { success: false, message: 'Category is required.' };
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    return { success: false, message: 'Amount must be greater than zero.' };
  }

  if (requiresAccount(payload.type) && !accountId) {
    return { success: false, message: 'Account is required.' };
  }

  const dbClient = await clientPromise;
  const db = dbClient.db();

  const existing = await db
    .collection(DbTables.reportsFinance)
    .findOne({ _id: new ObjectId(payload.id) });

  if (!existing) {
    return { success: false, message: 'Report not found.' };
  }

  const previousAmount = Number(existing.amount ?? 0);
  const previousType = existing.type as ReportPayload['type'];
  const previousAccountId = existing.account as ObjectId | undefined;

  if (previousAccountId && requiresAccount(previousType)) {
    const reverseDelta = -resolveBalanceDelta(previousType, previousAmount);

    if (reverseDelta !== 0) {
      await db
        .collection(DbTables.bankAccounts)
        .updateOne(
          { _id: previousAccountId },
          { $inc: { balance: reverseDelta } },
        );
    }
  }

  if (accountId && requiresAccount(payload.type)) {
    const nextDelta = resolveBalanceDelta(payload.type, amount);

    if (nextDelta !== 0) {
      await db
        .collection(DbTables.bankAccounts)
        .updateOne({ _id: accountId }, { $inc: { balance: nextDelta } });
    }
  }

  let updatedBalance = 0;

  if (accountId) {
    updatedBalance = await fetchAccountBalance(accountId);
  }

  const update: { $set: Record<string, unknown>; $unset?: Record<string, ''> } =
    {
      $set: {
        type: payload.type,
        description,
        category: categoryId,
        amount,
        balance: updatedBalance,
        details: toDetails(payload.details),
      },
    };

  if (accountId) {
    update.$set.account = accountId;
  } else {
    update.$unset = { account: '' };
  }

  await db
    .collection(DbTables.reportsFinance)
    .updateOne({ _id: new ObjectId(payload.id) }, update);

  revalidatePath('/admin/finance');

  return { success: true, message: 'Report updated.' };
}

export async function deleteReport(reportId: string) {
  if (!ObjectId.isValid(reportId)) {
    return { success: false, message: 'Invalid report id.' };
  }

  const dbClient = await clientPromise;
  const db = dbClient.db();

  const report = await db
    .collection(DbTables.reportsFinance)
    .findOne({ _id: new ObjectId(reportId) });

  if (!report) {
    return { success: false, message: 'Report not found.' };
  }

  const amount = Number(report.amount ?? 0);
  const type = report.type as ReportPayload['type'];
  const accountId = report.account as ObjectId | undefined;

  if (accountId && requiresAccount(type)) {
    const reverseDelta = -resolveBalanceDelta(type, amount);

    if (reverseDelta !== 0) {
      await db
        .collection(DbTables.bankAccounts)
        .updateOne({ _id: accountId }, { $inc: { balance: reverseDelta } });
    }
  }

  await db.collection(DbTables.reportsFinance).deleteOne({
    _id: new ObjectId(reportId),
  });

  revalidatePath('/admin/finance');

  return { success: true, message: 'Report deleted.' };
}
