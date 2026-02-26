import { Decimal128, ObjectId } from 'mongodb';
import { unstable_cache } from 'next/cache';

import { DbTables } from '@app/enum/db-tables';
import clientPromise from '@app/ins/mongo-client';

import {
  FinanceAdminView,
  type FinanceAdminViewProps,
} from './components/finance-admin-view';
import { CategoryNode } from './models/category-node';
import {
  BankAccountDocument,
  CategoryDocument,
  DebtReportDocument,
  FinancePageProps,
  IncomingReportDocument,
  OutgoingReportDocument,
  ReportRange,
  ReportDocumentAsset,
} from './models/finance-page.types';

const DEFAULT_LOCALE = 'en-US';

const getDebtReports = unstable_cache(
  async () => {
    const dbClient = await clientPromise;
    const db = dbClient.db();

    return db
      .collection<DebtReportDocument>(DbTables.financeDebtReports)
      .find()
      .sort({ createdAt: -1 })
      .toArray();
  },
  ['admin-finance-debts'],
  { tags: ['admin-finance-debts'] },
);

function parseMonthParam(param?: string): Date {
  if (typeof param !== 'string' || !/^\d{4}-\d{2}$/.test(param)) {
    return new Date();
  }

  const [yearText, monthText] = param.split('-');
  const year = Number(yearText);
  const month = Number(monthText) - 1;

  if (!Number.isFinite(year) || !Number.isFinite(month)) {
    return new Date();
  }

  return new Date(year, month, 1);
}

function formatMonthParam(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function formatMonthLabel(date: Date) {
  return new Intl.DateTimeFormat(DEFAULT_LOCALE, {
    month: 'long',
    year: 'numeric',
  }).format(date);
}

function formatYearLabel(date: Date) {
  return new Intl.DateTimeFormat(DEFAULT_LOCALE, {
    year: 'numeric',
  }).format(date);
}

function parseReportRange(param?: string): ReportRange {
  if (param === 'year') {
    return 'year';
  }

  return 'month';
}

function formatCreatedAt(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === 'string' || typeof value === 'number') {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? '' : parsed.toISOString();
  }

  return '';
}

function toNumber(value: unknown): number {
  if (value instanceof Decimal128) {
    return Number(value.toString());
  }

  if (typeof value === 'number') {
    return value;
  }

  if (typeof value === 'string') {
    return Number(value);
  }

  return 0;
}

function normalizeDocuments(documents: ReportDocumentAsset[] | undefined) {
  return (
    documents?.map((document) => ({
      key: document.key,
      url: process.env.CLOUDFLARE_R2_ANIMAL_IMAGE_URL + '/' + document.key,
      size: document.size,
      mimeType: document.mimeType,
      originalName: document.originalName,
      uploadedAt: document.uploadedAt.toISOString(),
      checksum: document.checksum,
      isDeleted: document.isDeleted === true,
    })) ?? []
  );
}

function buildCategoryTree(
  categories: CategoryDocument[],
  linkedNameById?: Map<string, string>,
): CategoryNode[] {
  const nodes = new Map<string, CategoryNode & { parentId?: string }>();

  categories.forEach((category) => {
    nodes.set(category._id.toString(), {
      id: category._id.toString(),
      name: category.name,
      active: category.active,
      linkedToName:
        linkedNameById?.get(category.linkedTo?.toString() ?? '') ?? undefined,
      parentId: category.inherits?.toString(),
      children: [],
    });
  });

  const roots: CategoryNode[] = [];

  nodes.forEach((node) => {
    if (typeof node.parentId === 'string' && nodes.has(node.parentId)) {
      nodes.get(node.parentId)?.children.push(node);
      return;
    }

    roots.push(node);
  });

  return roots;
}

export default async function FinancePage({ searchParams }: FinancePageProps) {
  const resolvedSearchParams = await searchParams;
  const selectedMonth = parseMonthParam(resolvedSearchParams?.month);
  const reportRange = parseReportRange(resolvedSearchParams?.range);
  const monthParam = formatMonthParam(selectedMonth);
  const monthStart = new Date(
    selectedMonth.getFullYear(),
    selectedMonth.getMonth(),
    1,
  );
  const monthEnd = new Date(
    selectedMonth.getFullYear(),
    selectedMonth.getMonth() + 1,
    1,
  );
  const yearStart = new Date(selectedMonth.getFullYear(), 0, 1);
  const yearEnd = new Date(selectedMonth.getFullYear() + 1, 0, 1);
  const rangeStart = reportRange === 'year' ? yearStart : monthStart;
  const rangeEnd = reportRange === 'year' ? yearEnd : monthEnd;

  const dbClient = await clientPromise;
  const db = dbClient.db();

  const [
    accounts,
    categories,
    incomingReports,
    outgoingReports,
    debtReports,
    monthIncomingTotals,
    monthOutgoingTotals,
    yearIncomingTotals,
    yearOutgoingTotals,
    monthAccountTotals,
  ] = await Promise.all([
    db
      .collection<BankAccountDocument>(DbTables.bankAccounts)
      .find()
      .sort({ createdAt: 1 })
      .toArray(),
    db
      .collection<CategoryDocument>(DbTables.financeCategories)
      .find()
      .toArray(),
    db
      .collection<IncomingReportDocument>(DbTables.financeIncomingReports)
      .find({ operationDate: { $gte: rangeStart, $lt: rangeEnd } })
      .sort({ operationDate: -1 })
      .toArray(),
    db
      .collection<OutgoingReportDocument>(DbTables.financeOutgoingReports)
      .find({ operationDate: { $gte: rangeStart, $lt: rangeEnd } })
      .sort({ operationDate: -1 })
      .toArray(),
    getDebtReports(),
    db
      .collection<IncomingReportDocument>(DbTables.financeIncomingReports)
      .aggregate<{ total: number }>([
        {
          $match: {
            operationDate: { $gte: monthStart, $lt: monthEnd },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: { $toDouble: '$amount' } },
          },
        },
      ])
      .toArray(),
    db
      .collection<OutgoingReportDocument>(DbTables.financeOutgoingReports)
      .aggregate<{ total: number }>([
        {
          $match: {
            operationDate: { $gte: monthStart, $lt: monthEnd },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: { $toDouble: '$amount' } },
          },
        },
      ])
      .toArray(),
    db
      .collection<IncomingReportDocument>(DbTables.financeIncomingReports)
      .aggregate<{ total: number }>([
        {
          $match: {
            operationDate: { $gte: yearStart, $lt: yearEnd },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: { $toDouble: '$amount' } },
          },
        },
      ])
      .toArray(),
    db
      .collection<OutgoingReportDocument>(DbTables.financeOutgoingReports)
      .aggregate<{ total: number }>([
        {
          $match: {
            operationDate: { $gte: yearStart, $lt: yearEnd },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: { $toDouble: '$amount' } },
          },
        },
      ])
      .toArray(),
    db
      .collection<IncomingReportDocument>(DbTables.financeIncomingReports)
      .aggregate<{ _id: { account: ObjectId; type: string }; total: number }>([
        {
          $match: {
            operationDate: { $gte: monthStart, $lt: monthEnd },
            account: { $type: 'objectId' },
          },
        },
        {
          $group: {
            _id: { account: '$account', type: 'incoming' },
            total: { $sum: { $toDouble: '$amount' } },
          },
        },
      ])
      .toArray(),
  ]);

  const outgoingMonthAccountTotals = await db
    .collection<OutgoingReportDocument>(DbTables.financeOutgoingReports)
    .aggregate<{ _id: { account: ObjectId; type: string }; total: number }>([
      {
        $match: {
          operationDate: { $gte: monthStart, $lt: monthEnd },
          account: { $type: 'objectId' },
        },
      },
      {
        $group: {
          _id: { account: '$account', type: 'outgoing' },
          total: { $sum: { $toDouble: '$amount' } },
        },
      },
    ])
    .toArray();

  monthAccountTotals.push(...outgoingMonthAccountTotals);

  const accountMap = new Map(
    accounts.map((account) => [account._id.toString(), account.name]),
  );

  const categoryMap = new Map(
    categories.map((category) => [category._id.toString(), category.name]),
  );

  const accountMonthTotals = new Map<
    string,
    { incoming: number; outgoing: number }
  >();

  monthAccountTotals.forEach((entry) => {
    const accountId = entry._id.account.toString();
    const current = accountMonthTotals.get(accountId) ?? {
      incoming: 0,
      outgoing: 0,
    };

    if (entry._id.type === 'incoming') {
      current.incoming = entry.total;
    }

    if (entry._id.type === 'outgoing') {
      current.outgoing = entry.total;
    }

    accountMonthTotals.set(accountId, current);
  });

  const normalizedAccounts: FinanceAdminViewProps['accounts'] = accounts.map(
    (account) => {
      const accountId = account._id.toString();
      const monthTotalsByAccount = accountMonthTotals.get(accountId) ?? {
        incoming: 0,
        outgoing: 0,
      };

      return {
        id: accountId,
        name: account.name,
        iban: account.iban,
        active: account.isActive === true,
        balance: toNumber(account.balance),
        thisMonthNet:
          monthTotalsByAccount.incoming - monthTotalsByAccount.outgoing,
        debtTotal: 0,
      };
    },
  );

  const summaryTotals = {
    monthIncoming: monthIncomingTotals[0]?.total ?? 0,
    monthOutgoing: monthOutgoingTotals[0]?.total ?? 0,
    yearIncoming: yearIncomingTotals[0]?.total ?? 0,
    yearOutgoing: yearOutgoingTotals[0]?.total ?? 0,
  };

  const normalizedIncomingReports: FinanceAdminViewProps['reports'] =
    incomingReports.map((report) => {
      const categoryId = report.linkedTo?.toString();
      const accountId = report.account?.toString();
      const categoryBalanceTo = toNumber(report.deposit);
      const categoryBalanceDelta =
        typeof categoryId === 'string' && categoryId.length > 0
          ? toNumber(report.amount)
          : 0;
      const categoryBalanceFrom =
        categoryBalanceDelta > 0
          ? categoryBalanceTo - categoryBalanceDelta
          : undefined;

      return {
        id: report._id.toString(),
        type: 'incoming',
        description: report.description ?? '',
        categoryName: categoryMap.get(categoryId ?? '') ?? '',
        categoryBalanceFrom,
        categoryBalanceTo:
          categoryBalanceDelta > 0 ? categoryBalanceTo : undefined,
        categoryBalanceDelta,
        categoryId,
        accountName:
          typeof accountId === 'string'
            ? (accountMap.get(accountId) ?? '')
            : '',
        accountId,
        sender: report.sender ?? '',
        amount: toNumber(report.amount),
        balance: toNumber(report.balance),
        operationDate: formatCreatedAt(report.operationDate),
        createdAt: formatCreatedAt(report.createdAt),
        details: [],
        documents: [],
      };
    });

  const normalizedOutgoingReports: FinanceAdminViewProps['reports'] =
    outgoingReports.map((report) => {
      const categoryId = report.linkedTo?.toString();
      const accountId = report.account?.toString();
      const categoryWithdrawals =
        report.withdrawal
          ?.map((withdrawalItem) => {
            const to = toNumber(withdrawalItem.balance);
            const from = toNumber(withdrawalItem.previousBalance);
            const delta = toNumber(withdrawalItem.amount);
            const withdrawalCategoryId = withdrawalItem.category?.toString();

            if (delta <= 0) {
              return null;
            }

            return {
              categoryName:
                typeof withdrawalCategoryId === 'string' &&
                withdrawalCategoryId.length > 0
                  ? (categoryMap.get(withdrawalCategoryId) ?? '')
                  : '',
              from,
              to,
              delta,
            };
          })
          .filter((item) => item !== null) ?? [];

      return {
        id: report._id.toString(),
        type: 'outgoing',
        description: report.description ?? '',
        categoryName: categoryMap.get(categoryId ?? '') ?? '',
        categoryWithdrawals,
        categoryId,
        accountName:
          typeof accountId === 'string'
            ? (accountMap.get(accountId) ?? '')
            : '',
        accountId,
        recipient: report.recipient ?? '',
        iban: report.iban ?? '',
        amount: toNumber(report.amount),
        balance: toNumber(report.balance),
        operationDate: formatCreatedAt(report.operationDate),
        createdAt: formatCreatedAt(report.createdAt),
        details:
          report.details?.map((detail) => ({
            description: detail.description,
            amount: toNumber(detail.amount),
            categoryName: detail.category
              ? categoryMap.get(detail.category.toString())
              : undefined,
            categoryId: detail.category?.toString(),
          })) ?? [],
        documents: normalizeDocuments(report.documents),
      };
    });

  const normalizedDebtReports: FinanceAdminViewProps['reports'] =
    debtReports.map((report) => {
      const categoryId = report.linkedTo?.toString();

      return {
        id: report._id.toString(),
        type: 'debt',
        description: report.description ?? '',
        categoryName: categoryMap.get(categoryId ?? '') ?? '',
        categoryId,
        accountName: '',
        recipient: report.recipient ?? '',
        amount: toNumber(report.amount),
        balance: 0,
        operationDate: '',
        createdAt: formatCreatedAt(report.createdAt),
        details:
          report.details?.map((detail) => ({
            description: detail.description,
            amount: toNumber(detail.amount),
            categoryName: detail.category
              ? categoryMap.get(detail.category.toString())
              : undefined,
            categoryId: detail.category?.toString(),
          })) ?? [],
        documents: normalizeDocuments(report.documents),
      };
    });

  const combinedReports: FinanceAdminViewProps['reports'] = [
    ...normalizedDebtReports,
    ...normalizedIncomingReports,
    ...normalizedOutgoingReports,
  ].sort((a, b) => {
    if (a.type === 'debt' && b.type !== 'debt') {
      return -1;
    }

    if (a.type !== 'debt' && b.type === 'debt') {
      return 1;
    }

    const left = new Date(a.operationDate || a.createdAt).getTime();
    const right = new Date(b.operationDate || b.createdAt).getTime();

    return right - left;
  });

  const totalBalance = normalizedAccounts.reduce(
    (sum, account) => sum + account.balance,
    0,
  );

  const financeProps: FinanceAdminViewProps = {
    accounts: normalizedAccounts,
    categories: buildCategoryTree(categories),
    categoryOptions: categories.map((category) => ({
      id: category._id.toString(),
      name: category.name,
      inheritsFrom: category.inherits?.toString() ?? null,
      active: category.active !== false,
      balance: toNumber(category.balance),
    })),
    reports: combinedReports,
    summary: {
      totalBalance,
      monthIncoming: summaryTotals.monthIncoming,
      monthOutgoing: summaryTotals.monthOutgoing,
      yearIncoming: summaryTotals.yearIncoming,
      yearOutgoing: summaryTotals.yearOutgoing,
    },
    monthParam,
    reportRange,
    periodLabel:
      reportRange === 'year'
        ? formatYearLabel(selectedMonth)
        : formatMonthLabel(monthStart),
    currentMonthLabel: formatMonthLabel(new Date()),
  };

  return <FinanceAdminView {...financeProps} />;
}
