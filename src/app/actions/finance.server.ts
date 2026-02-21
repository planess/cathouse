'use server';

import { Decimal128, ObjectId } from 'mongodb';
import { revalidatePath, revalidateTag } from 'next/cache';

import { DbTables } from '@app/enum/db-tables';
import { getCurrentUser } from '@app/hooks/get-user';
import clientPromise from '@app/ins/mongo-client';

type AccountPayload = {
  id?: string;
  name: string;
  iban: string;
};

type BaseCategoryPayload = {
  id?: string;
  name: string;
  inheritsId?: string;
  active?: boolean;
};

type CategoryPayload = BaseCategoryPayload & {
  type: 'incoming' | 'outgoing';
};

type IncomingCategoryPayload = BaseCategoryPayload & {
  specific: boolean;
};

type OutgoingCategoryPayload = BaseCategoryPayload;

type OutgoingCategoryPayloadExtended = OutgoingCategoryPayload & {
  linkedToId?: string;
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
  if (typeof value !== 'string' || value.trim() === '') {
    return null;
  }

  return ObjectId.isValid(value) ? new ObjectId(value) : null;
}

function resolveCategoryCollection(type: CategoryPayload['type']) {
  return type === 'incoming'
    ? DbTables.financeIncomingGoals
    : DbTables.financeOutgoingPurposes;
}

function hasSpecificFlag(payload: unknown): boolean {
  return (
    typeof payload === 'object' &&
    payload !== null &&
    Object.hasOwn(payload, 'specific')
  );
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
  const accountIdText = payload.id ?? '';

  if (!ObjectId.isValid(accountIdText)) {
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
    { _id: new ObjectId(accountIdText) },
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
  if (payload.type === 'outgoing' && hasSpecificFlag(payload)) {
    return {
      success: false,
      message: '`specific` is supported only for incoming categories.',
    };
  }

  if (payload.type === 'incoming') {
    return createIncomingCategory({
      name: payload.name,
      inheritsId: payload.inheritsId,
      active: true,
      specific: false,
    });
  }

  return createOutgoingCategory({
    name: payload.name,
    inheritsId: payload.inheritsId,
    active: true,
  });
}

export async function createIncomingCategory(payload: IncomingCategoryPayload) {
  const name = normalizeText(payload.name);

  if (!name) {
    return { success: false, message: 'Category name is required.' };
  }

  const inheritsId = toObjectId(payload.inheritsId);

  const dbClient = await clientPromise;
  const db = dbClient.db();

  await db.collection(DbTables.financeIncomingGoals).insertOne({
    ...(inheritsId ? { inherits: inheritsId } : {}),
    name,
    active: true,
    specific: payload.specific,
    balance: Decimal128.fromString('0'),
    createdAt: new Date(),
  });

  revalidatePath('/admin/finance');

  return { success: true, message: 'Category created.' };
}

export async function createOutgoingCategory(
  payload: OutgoingCategoryPayloadExtended,
) {
  if (hasSpecificFlag(payload)) {
    return {
      success: false,
      message: '`specific` is supported only for incoming categories.',
    };
  }

  const name = normalizeText(payload.name);

  if (!name) {
    return { success: false, message: 'Category name is required.' };
  }

  const inheritsId = toObjectId(payload.inheritsId);
  const linkedToId = toObjectId(payload.linkedToId);

  const dbClient = await clientPromise;
  const db = dbClient.db();

  await db.collection(DbTables.financeOutgoingPurposes).insertOne({
    name,
    active: true,
    ...(inheritsId ? { inherits: inheritsId } : {}),
    ...(linkedToId ? { linkedTo: linkedToId } : {}),
    createdAt: new Date(),
  });

  revalidatePath('/admin/finance');

  return { success: true, message: 'Category created.' };
}

export async function updateCategory(
  payload: CategoryPayload,
): Promise<{ success: boolean; message: string }> {
  if (payload.type === 'outgoing' && hasSpecificFlag(payload)) {
    return {
      success: false,
      message: '`specific` is supported only for incoming categories.',
    };
  }

  if (payload.type === 'incoming') {
    return updateIncomingCategory({
      id: payload.id,
      name: payload.name,
      inheritsId: payload.inheritsId,
      active: true,
      specific: false,
    });
  }

  return updateOutgoingCategory({
    id: payload.id,
    name: payload.name,
    inheritsId: payload.inheritsId,
    active: true,
  });
}

export async function updateIncomingCategory(
  payload: IncomingCategoryPayload,
): Promise<{ success: boolean; message: string }> {
  const categoryIdText = payload.id ?? '';

  if (!ObjectId.isValid(categoryIdText)) {
    return { success: false, message: 'Invalid category id.' };
  }

  const name = normalizeText(payload.name);

  if (!name) {
    return { success: false, message: 'Category name is required.' };
  }

  const categoryId = new ObjectId(categoryIdText);
  const inheritsId = toObjectId(payload.inheritsId);

  if (inheritsId?.equals(categoryId) === true) {
    return {
      success: false,
      message: 'Category cannot inherit from itself.',
    };
  }

  const dbClient = await clientPromise;
  const db = dbClient.db();

  const existingCategory = await db
    .collection(DbTables.financeIncomingGoals)
    .findOne({
      _id: categoryId,
    });

  if (!existingCategory) {
    return { success: false, message: 'Category not found.' };
  }

  if (inheritsId) {
    const parentExists = await db
      .collection(DbTables.financeIncomingGoals)
      .findOne({ _id: inheritsId });

    if (!parentExists) {
      return { success: false, message: 'Parent category not found.' };
    }
  }

  const update: { $set: Record<string, unknown>; $unset?: Record<string, ''> } =
    {
      $set: {
        name,
        active: payload.active ?? true,
        specific: payload.specific,
      },
    };

  if (inheritsId) {
    update.$set.inherits = inheritsId;
  } else {
    update.$unset = { inherits: '' };
  }

  await db
    .collection(DbTables.financeIncomingGoals)
    .updateOne({ _id: categoryId }, update);

  revalidatePath('/admin/finance');

  return { success: true, message: 'Category updated.' };
}

export async function updateOutgoingCategory(
  payload: OutgoingCategoryPayloadExtended,
): Promise<{ success: boolean; message: string }> {
  if (hasSpecificFlag(payload)) {
    return {
      success: false,
      message: '`specific` is supported only for incoming categories.',
    };
  }

  const categoryIdText = payload.id ?? '';

  if (!ObjectId.isValid(categoryIdText)) {
    return { success: false, message: 'Invalid category id.' };
  }

  const name = normalizeText(payload.name);

  if (!name) {
    return { success: false, message: 'Category name is required.' };
  }

  const categoryId = new ObjectId(categoryIdText);
  const inheritsId = toObjectId(payload.inheritsId);
  const linkedToId = toObjectId(payload.linkedToId);

  if (inheritsId?.equals(categoryId) === true) {
    return {
      success: false,
      message: 'Category cannot inherit from itself.',
    };
  }

  const dbClient = await clientPromise;
  const db = dbClient.db();

  const existingCategory = await db
    .collection(DbTables.financeOutgoingPurposes)
    .findOne({
      _id: categoryId,
    });

  if (!existingCategory) {
    return { success: false, message: 'Category not found.' };
  }

  if (inheritsId) {
    const parentExists = await db
      .collection(DbTables.financeOutgoingPurposes)
      .findOne({ _id: inheritsId });

    if (!parentExists) {
      return { success: false, message: 'Parent category not found.' };
    }
  }

  if (linkedToId) {
    const linkedIncomingExists = await db
      .collection(DbTables.financeIncomingGoals)
      .findOne({ _id: linkedToId });

    if (!linkedIncomingExists) {
      return { success: false, message: 'Linked incoming category not found.' };
    }
  }

  const update: { $set: Record<string, unknown>; $unset?: Record<string, ''> } =
    {
      $set: {
        name,
        active: payload.active ?? true,
      },
    };

  if (inheritsId) {
    update.$set.inherits = inheritsId;
  } else {
    update.$unset = { inherits: '' };
  }

  if (linkedToId) {
    update.$set.linkedTo = linkedToId;
  } else {
    update.$unset = {
      ...(update.$unset ?? {}),
      linkedTo: '',
    };
  }

  await db
    .collection(DbTables.financeOutgoingPurposes)
    .updateOne({ _id: categoryId }, update);

  revalidatePath('/admin/finance');

  return { success: true, message: 'Category updated.' };
}

export async function deleteCategory(payload: CategoryPayload) {
  const categoryIdText = payload.id ?? '';

  if (!ObjectId.isValid(categoryIdText)) {
    return { success: false, message: 'Invalid category id.' };
  }

  const dbClient = await clientPromise;
  const db = dbClient.db();

  const categoryId = new ObjectId(categoryIdText);

  const collectionName = resolveCategoryCollection(payload.type);

    const categories = await db
      .collection<{ _id: ObjectId; inherits?: ObjectId }>(collectionName)
      .find({}, { projection: { _id: 1, inherits: 1 } })
      .toArray();

    const childrenByParentId = new Map<string, string[]>();

    categories.forEach((category) => {
      const parentId = category.inherits?.toString();

      if (parentId === undefined) {
        return;
      }

      const current = childrenByParentId.get(parentId) ?? [];
      current.push(category._id.toString());
      childrenByParentId.set(parentId, current);
    });

    const idsToDeactivate = new Set<string>();
    const queue = [categoryId.toString()];

    while (queue.length > 0) {
      const currentId = queue.shift();

      if (currentId === undefined || idsToDeactivate.has(currentId)) {
        continue;
      }

      idsToDeactivate.add(currentId);

      const children = childrenByParentId.get(currentId) ?? [];
      children.forEach((childId) => {
        if (!idsToDeactivate.has(childId)) {
          queue.push(childId);
        }
      });
    }

    const objectIds = [...idsToDeactivate]
      .filter((id) => ObjectId.isValid(id))
      .map((id) => new ObjectId(id));

    if (objectIds.length === 0) {
      return { success: false, message: 'Category not found.' };
    }

    await db.collection(collectionName).updateMany(
      { _id: { $in: objectIds } },
      {
        $set: {
          active: false,
        },
      },
    );

    revalidatePath('/admin/finance');

  return { success: true, message: 'Category deactivated.' };
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
  if (payload.type === 'debt') {
    revalidateTag('admin-finance-debts');
  }

  return { success: true, message: 'Report created.' };
}

export async function updateReport(payload: ReportPayload) {
  const reportIdText = payload.id ?? '';

  if (!ObjectId.isValid(reportIdText)) {
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
    .findOne({ _id: new ObjectId(reportIdText) });

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
    .updateOne({ _id: new ObjectId(reportIdText) }, update);

  revalidatePath('/admin/finance');
  if (previousType === 'debt' || payload.type === 'debt') {
    revalidateTag('admin-finance-debts');
  }

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
  if (type === 'debt') {
    revalidateTag('admin-finance-debts');
  }

  return { success: true, message: 'Report deleted.' };
}
