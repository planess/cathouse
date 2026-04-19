import { Decimal128, ObjectId, type Db } from 'mongodb';

import { DbTables } from '@app/enum/db-tables';
import clientPromise from '@app/ins/mongo-client';

import { toDecimal } from './common';

import type {
  DebtReportDocument,
  IncomingReportDocument,
  OutgoingReportDocument,
} from '../types/documents';

type SnapshotIncomingReport = Pick<
  IncomingReportDocument,
  '_id' | 'account' | 'amount' | 'linkedTo' | 'operationDate' | 'createdAt'
>;

type SnapshotOutgoingReport = Pick<
  OutgoingReportDocument,
  '_id' | 'account' | 'amount' | 'linkedTo' | 'operationDate' | 'createdAt'
>;

type FinanceSnapshotEvent =
  | { type: 'incoming'; report: SnapshotIncomingReport }
  | { type: 'outgoing'; report: SnapshotOutgoingReport };

type CategorySnapshotNode = {
  _id: ObjectId;
  inherits?: ObjectId | null;
};

function normalizeDateValue(value?: Date): number {
  if (!value) {
    return 0;
  }

  const timestamp = value.getTime();

  return Number.isFinite(timestamp) ? timestamp : 0;
}

function toReportSortKey(report: { operationDate?: Date; createdAt?: Date }) {
  const operationDate = normalizeDateValue(report.operationDate);
  const createdAt = normalizeDateValue(report.createdAt);

  return {
    operationDate,
    createdAt,
  };
}

function compareSnapshotEvents(left: FinanceSnapshotEvent, right: FinanceSnapshotEvent) {
  const leftSort = toReportSortKey(left.report);
  const rightSort = toReportSortKey(right.report);

  if (leftSort.operationDate !== rightSort.operationDate) {
    return leftSort.operationDate - rightSort.operationDate;
  }

  if (leftSort.createdAt !== rightSort.createdAt) {
    return leftSort.createdAt - rightSort.createdAt;
  }

  return left.report._id.toString().localeCompare(right.report._id.toString());
}

function buildCategoryWithdrawal(
  categoryBalances: Map<string, number>,
  categoryNodes: Map<string, CategorySnapshotNode>,
  categoryId: ObjectId,
  amount: number,
): OutgoingWithdrawalRecord[] {
  const withdrawals: OutgoingWithdrawalRecord[] = [];
  const visited = new Set<string>();
  let remaining = amount;
  let currentId: ObjectId | null = categoryId;

  while (currentId && remaining > 0) {
    const currentKey = currentId.toString();

    if (visited.has(currentKey)) {
      break;
    }

    visited.add(currentKey);

    const categoryNode = categoryNodes.get(currentKey);

    if (!categoryNode) {
      break;
    }

    const previousBalance = Math.max(0, categoryBalances.get(currentKey) ?? 0);
    const withdrawnAmount = Math.min(previousBalance, remaining);
    const nextBalance = previousBalance - withdrawnAmount;

    categoryBalances.set(currentKey, nextBalance);

    if (withdrawnAmount > 0) {
      withdrawals.push({
        category: categoryNode._id,
        amount: toDecimal(withdrawnAmount),
        previousBalance: toDecimal(previousBalance),
        balance: toDecimal(nextBalance),
      });
    }

    remaining -= withdrawnAmount;
    currentId = categoryNode.inherits ?? null;
  }

  return withdrawals;
}

export async function rebuildFinanceSnapshots(db: Db) {
  const [incomingReports, outgoingReports, categories, accounts] =
    await Promise.all([
      db
        .collection<SnapshotIncomingReport>(DbTables.financeIncomingReports)
        .find(
          {},
          {
            projection: {
              _id: 1,
              account: 1,
              amount: 1,
              linkedTo: 1,
              operationDate: 1,
              createdAt: 1,
            },
          },
        )
        .toArray(),
      db
        .collection<SnapshotOutgoingReport>(DbTables.financeOutgoingReports)
        .find(
          {},
          {
            projection: {
              _id: 1,
              account: 1,
              amount: 1,
              linkedTo: 1,
              operationDate: 1,
              createdAt: 1,
            },
          },
        )
        .toArray(),
      db
        .collection<CategorySnapshotNode>(DbTables.financeCategories)
        .find({}, { projection: { _id: 1, inherits: 1 } })
        .toArray(),
      db
        .collection<{ _id: ObjectId }>(DbTables.bankAccounts)
        .find({}, { projection: { _id: 1 } })
        .toArray(),
    ]);

  const accountBalances = new Map<string, number>();

  for (const account of accounts) {
    accountBalances.set(account._id.toString(), 0);
  }

  const categoryNodes = new Map<string, CategorySnapshotNode>();
  const categoryBalances = new Map<string, number>();

  for (const category of categories) {
    const categoryKey = category._id.toString();
    categoryNodes.set(categoryKey, category);
    categoryBalances.set(categoryKey, 0);
  }

  const events: FinanceSnapshotEvent[] = [
    ...incomingReports.map((report) => ({
      type: 'incoming' as const,
      report,
    })),
    ...outgoingReports.map((report) => ({
      type: 'outgoing' as const,
      report,
    })),
  ].sort(compareSnapshotEvents);

  const incomingUpdates: Array<{
    updateOne: {
      filter: { _id: ObjectId };
      update: {
        $set: { balance: Decimal128; deposit?: Decimal128 };
        $unset?: { deposit: '' };
      };
    };
  }> = [];

  const outgoingUpdates: Array<{
    updateOne: {
      filter: { _id: ObjectId };
      update: { $set: { balance: Decimal128; withdrawal: OutgoingWithdrawalRecord[] } };
    };
  }> = [];

  for (const event of events) {
    const report = event.report;
    const accountKey = report.account.toString();
    const amount = Math.max(0, decimalToNumber(report.amount));
    const currentAccountBalance = accountBalances.get(accountKey) ?? 0;

    if (event.type === 'incoming') {
      const nextAccountBalance = currentAccountBalance + amount;
      accountBalances.set(accountKey, nextAccountBalance);

      const setPayload: { balance: Decimal128; deposit?: Decimal128 } = {
        balance: toDecimal(nextAccountBalance),
      };

      const updatePayload: {
        $set: { balance: Decimal128; deposit?: Decimal128 };
        $unset?: { deposit: '' };
      } = {
        $set: setPayload,
      };

      if (report.linkedTo) {
        const categoryKey = report.linkedTo.toString();
        const nextCategoryBalance =
          (categoryBalances.get(categoryKey) ?? 0) + amount;
        categoryBalances.set(categoryKey, nextCategoryBalance);
        setPayload.deposit = toDecimal(nextCategoryBalance);
      } else {
        updatePayload.$unset = { deposit: '' };
      }

      incomingUpdates.push({
        updateOne: {
          filter: { _id: report._id },
          update: updatePayload,
        },
      });

      continue;
    }

    const nextAccountBalance = currentAccountBalance - amount;
    accountBalances.set(accountKey, nextAccountBalance);

    const withdrawal = report.linkedTo
      ? buildCategoryWithdrawal(categoryBalances, categoryNodes, report.linkedTo, amount)
      : [];

    outgoingUpdates.push({
      updateOne: {
        filter: { _id: report._id },
        update: {
          $set: {
            balance: toDecimal(nextAccountBalance),
            withdrawal,
          },
        },
      },
    });
  }

  if (incomingUpdates.length > 0) {
    await db
      .collection(DbTables.financeIncomingReports)
      .bulkWrite(incomingUpdates, { ordered: true });
  }

  if (outgoingUpdates.length > 0) {
    await db
      .collection(DbTables.financeOutgoingReports)
      .bulkWrite(outgoingUpdates, { ordered: true });
  }

  const accountUpdates = [...accountBalances.entries()].map(([accountId, balance]) => ({
    updateOne: {
      filter: { _id: new ObjectId(accountId) },
      update: { $set: { balance: toDecimal(balance) } },
    },
  }));

  if (accountUpdates.length > 0) {
    await db.collection(DbTables.bankAccounts).bulkWrite(accountUpdates, { ordered: true });
  }

  const categoryUpdates = [...categoryBalances.entries()].map(
    ([categoryId, balance]) => ({
      updateOne: {
        filter: { _id: new ObjectId(categoryId) },
        update: { $set: { balance: toDecimal(balance) } },
      },
    }),
  );

  if (categoryUpdates.length > 0) {
    await db
      .collection(DbTables.financeCategories)
      .bulkWrite(categoryUpdates, { ordered: true });
  }
}

export async function recalculateAccountBalance(db: Db, accountId: ObjectId) {
  const [incoming, outgoing] = await Promise.all([
    db
      .collection<IncomingReportDocument>(DbTables.financeIncomingReports)
      .aggregate<{ total: number }>([
        { $match: { account: accountId } },
        { $group: { _id: null, total: { $sum: { $toDouble: '$amount' } } } },
      ])
      .toArray(),
    db
      .collection<OutgoingReportDocument>(DbTables.financeOutgoingReports)
      .aggregate<{ total: number }>([
        { $match: { account: accountId } },
        { $group: { _id: null, total: { $sum: { $toDouble: '$amount' } } } },
      ])
      .toArray(),
  ]);

  // todo: optimize by storing balance in account document and updating with each report change
  const incomingTotal = incoming[0]?.total ?? 0;
  const outgoingTotal = outgoing[0]?.total ?? 0;
  const balance = toDecimal(incomingTotal - outgoingTotal);

  await db
    .collection(DbTables.bankAccounts)
    .updateOne({ _id: accountId }, { $set: { balance } });

  return balance;
}

function decimalToNumber(value: unknown): number {
  if (value instanceof Decimal128) {
    return Number(value.toString());
  }

  if (typeof value === 'number') {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

async function readCategoryBalance(db: Db, categoryId: ObjectId) {
  const category = await db
    .collection<{ balance?: Decimal128 | number }>(DbTables.financeCategories)
    .findOne({ _id: categoryId }, { projection: { balance: 1 } });

  return decimalToNumber(category?.balance);
}

export async function applyCategoryDelta(
  db: Db,
  categoryId: ObjectId,
  delta: number,
) {
  const currentBalance = await readCategoryBalance(db, categoryId);
  const nextBalance = currentBalance + delta;

  await db.collection(DbTables.financeCategories).updateOne(
    { _id: categoryId },
    {
      $set: {
        balance: toDecimal(nextBalance),
      },
    },
  );

  return { previousBalance: currentBalance, nextBalance };
}

export async function applyIncomingCategoryEffect(
  db: Db,
  categoryId: ObjectId | null,
  amount: number,
) {
  if (!categoryId || !Number.isFinite(amount) || amount === 0) {
    return;
  }

  const { nextBalance } = await applyCategoryDelta(db, categoryId, amount);

  return nextBalance;
}

export type OutgoingWithdrawalRecord = {
  category: ObjectId;
  amount: Decimal128;
  balance: Decimal128;
  previousBalance: Decimal128;
};

export async function applyOutgoingCategoryWithdrawal(
  db: Db,
  categoryId: ObjectId | null,
  amount: number,
): Promise<OutgoingWithdrawalRecord[]> {
  if (!categoryId || !Number.isFinite(amount) || amount <= 0) {
    return [];
  }

  const withdrawals: OutgoingWithdrawalRecord[] = [];
  const visited = new Set<string>();
  let remaining = amount;
  let currentId: ObjectId | null = categoryId;

  type FinanceCategoryNode = {
    _id: ObjectId;
    inherits?: ObjectId | null;
    balance?: Decimal128 | number;
  };

  while (currentId && remaining > 0) {
    const currentKey = currentId.toString();

    if (visited.has(currentKey)) {
      break;
    }

    visited.add(currentKey);

    const categoryDoc: FinanceCategoryNode | null = await db
      .collection<FinanceCategoryNode>(DbTables.financeCategories)
      .findOne(
        { _id: currentId },
        { projection: { _id: 1, inherits: 1, balance: 1 } },
      );

    if (!categoryDoc) {
      break;
    }

    const previousBalance = Math.max(0, decimalToNumber(categoryDoc.balance));
    const withdrawnAmount = Math.min(previousBalance, remaining);
    const nextBalance = previousBalance - withdrawnAmount;

    await db.collection(DbTables.financeCategories).updateOne(
      { _id: categoryDoc._id },
      {
        $set: {
          balance: toDecimal(nextBalance),
        },
      },
    );

    withdrawals.push({
      category: categoryDoc._id,
      amount: toDecimal(withdrawnAmount),
      previousBalance: toDecimal(previousBalance),
      balance: toDecimal(nextBalance),
    });

    remaining -= withdrawnAmount;
    currentId = categoryDoc.inherits ?? null;
  }

  return withdrawals;
}

export async function revertOutgoingCategoryWithdrawal(
  db: Db,
  withdrawals: Array<{ category?: ObjectId; amount?: Decimal128 | number }>,
) {
  for (const withdrawal of withdrawals) {
    if (!withdrawal.category) {
      continue;
    }

    const amount = decimalToNumber(withdrawal.amount);

    if (!Number.isFinite(amount) || amount <= 0) {
      continue;
    }

    await applyCategoryDelta(db, withdrawal.category, amount);
  }
}

export async function findReportById(db: Db, reportId: ObjectId) {
  const [incoming, outgoing, debt] = await Promise.all([
    db
      .collection<IncomingReportDocument>(DbTables.financeIncomingReports)
      .findOne({ _id: reportId }),
    db
      .collection<OutgoingReportDocument>(DbTables.financeOutgoingReports)
      .findOne({ _id: reportId }),
    db
      .collection<DebtReportDocument>(DbTables.financeDebtReports)
      .findOne({ _id: reportId }),
  ]);

  if (incoming) {
    return { type: 'incoming' as const, report: incoming };
  }

  if (outgoing) {
    return { type: 'outgoing' as const, report: outgoing };
  }

  if (debt) {
    return { type: 'debt' as const, report: debt };
  }

  return null;
}

export async function fetchAccountBalance(
  accountId: ObjectId,
): Promise<number> {
  const dbClient = await clientPromise;
  const db = dbClient.db();

  const account = await db
    .collection(DbTables.bankAccounts)
    .findOne<{ balance: number }>({ _id: accountId });

  return account?.balance ?? 0;
}
