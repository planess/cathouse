import { ObjectId } from 'mongodb';

import { DbTables } from '@app/enum/db-tables';
import clientPromise from '@app/ins/mongo-client';

import {
  FinanceAdminView,
  type FinanceAdminViewProps,
} from './components/finance-admin-view';

type BankAccountDocument = {
  _id: ObjectId;
  name: string;
  iban: string;
  balance?: number;
  isActive?: boolean;
  createdAt?: Date;
};

type CategoryDocument = {
  _id: ObjectId;
  name: string;
  inherits?: ObjectId;
};

type ReportDetailDocument = {
  description: string;
  amount: number;
  category?: ObjectId;
};

type ReportDocument = {
  _id: ObjectId;
  type: 'incoming' | 'outgoing' | 'debt';
  description?: string;
  category?: ObjectId;
  account?: ObjectId;
  amount: number;
  balance?: number;
  details?: ReportDetailDocument[];
  createdAt?: Date;
};

type SearchParams = {
  month?: string;
};

type CategoryNode = {
  id: string;
  name: string;
  children: CategoryNode[];
};

const DEFAULT_LOCALE = 'en-US';

function parseMonthParam(param?: string): Date {
  if (!param || !/^\d{4}-\d{2}$/.test(param)) {
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

function buildCategoryTree(categories: CategoryDocument[]): CategoryNode[] {
  const nodes = new Map<string, CategoryNode & { parentId?: string }>();

  categories.forEach((category) => {
    nodes.set(category._id.toString(), {
      id: category._id.toString(),
      name: category.name,
      parentId: category.inherits?.toString(),
      children: [],
    });
  });

  const roots: CategoryNode[] = [];

  nodes.forEach((node) => {
    if (node.parentId && nodes.has(node.parentId)) {
      nodes.get(node.parentId)?.children.push(node);
      return;
    }

    roots.push(node);
  });

  return roots;
}

export default async function FinancePage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const resolvedSearchParams = await searchParams;
  const selectedMonth = parseMonthParam(resolvedSearchParams?.month);
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

  const dbClient = await clientPromise;
  const db = dbClient.db();

  const [
    accounts,
    incomingCategories,
    outgoingCategories,
    reports,
    monthTotals,
    yearTotals,
    monthAccountTotals,
    debtTotals,
  ] = await Promise.all([
    db
      .collection<BankAccountDocument>(DbTables.bankAccounts)
      .find({ isActive: { $ne: false } })
      .sort({ createdAt: 1 })
      .toArray(),
    db
      .collection<CategoryDocument>(DbTables.financeIncomingCategories)
      .find({})
      .toArray(),
    db
      .collection<CategoryDocument>(DbTables.financeOutgoingCategories)
      .find({})
      .toArray(),
    db
      .collection<ReportDocument>(DbTables.reportsFinance)
      .find({ createdAt: { $gte: monthStart, $lt: monthEnd } })
      .sort({ createdAt: -1 })
      .toArray(),
    db
      .collection<ReportDocument>(DbTables.reportsFinance)
      .aggregate<{ _id: string; total: number }>([
        {
          $match: {
            createdAt: { $gte: monthStart, $lt: monthEnd },
            type: { $in: ['incoming', 'outgoing'] },
          },
        },
        {
          $group: {
            _id: '$type',
            total: { $sum: '$amount' },
          },
        },
      ])
      .toArray(),
    db
      .collection<ReportDocument>(DbTables.reportsFinance)
      .aggregate<{ _id: string; total: number }>([
        {
          $match: {
            createdAt: { $gte: yearStart, $lt: yearEnd },
            type: { $in: ['incoming', 'outgoing'] },
          },
        },
        {
          $group: {
            _id: '$type',
            total: { $sum: '$amount' },
          },
        },
      ])
      .toArray(),
    db
      .collection<ReportDocument>(DbTables.reportsFinance)
      .aggregate<{ _id: { account: ObjectId; type: string }; total: number }>([
        {
          $match: {
            createdAt: { $gte: monthStart, $lt: monthEnd },
            type: { $in: ['incoming', 'outgoing'] },
            account: { $type: 'objectId' },
          },
        },
        {
          $group: {
            _id: { account: '$account', type: '$type' },
            total: { $sum: '$amount' },
          },
        },
      ])
      .toArray(),
    db
      .collection<ReportDocument>(DbTables.reportsFinance)
      .aggregate<{ _id: ObjectId; total: number }>([
        {
          $match: {
            type: 'debt',
            account: { $type: 'objectId' },
          },
        },
        {
          $group: {
            _id: '$account',
            total: { $sum: '$amount' },
          },
        },
      ])
      .toArray(),
  ]);

  const accountMap = new Map(
    accounts.map((account) => [account._id.toString(), account.name]),
  );

  const incomingCategoryMap = new Map(
    incomingCategories.map((category) => [
      category._id.toString(),
      category.name,
    ]),
  );

  const outgoingCategoryMap = new Map(
    outgoingCategories.map((category) => [
      category._id.toString(),
      category.name,
    ]),
  );

  const allCategoryMap = new Map([
    ...incomingCategoryMap.entries(),
    ...outgoingCategoryMap.entries(),
  ]);

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

  const debtTotalsByAccount = new Map(
    debtTotals.map((entry) => [entry._id.toString(), entry.total]),
  );

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
        balance: account.balance ?? 0,
        thisMonthNet:
          monthTotalsByAccount.incoming - monthTotalsByAccount.outgoing,
        debtTotal: debtTotalsByAccount.get(accountId) ?? 0,
      };
    },
  );

  const summaryTotals = {
    monthIncoming: 0,
    monthOutgoing: 0,
    yearIncoming: 0,
    yearOutgoing: 0,
  };

  monthTotals.forEach((entry) => {
    if (entry._id === 'incoming') {
      summaryTotals.monthIncoming = entry.total;
    }

    if (entry._id === 'outgoing') {
      summaryTotals.monthOutgoing = entry.total;
    }
  });

  yearTotals.forEach((entry) => {
    if (entry._id === 'incoming') {
      summaryTotals.yearIncoming = entry.total;
    }

    if (entry._id === 'outgoing') {
      summaryTotals.yearOutgoing = entry.total;
    }
  });

  const normalizedReports: FinanceAdminViewProps['reports'] = reports.map(
    (report) => {
      const categoryId = report.category?.toString();
      const accountId = report.account?.toString();
      const categoryName =
        (report.type === 'incoming'
          ? incomingCategoryMap.get(categoryId ?? '')
          : outgoingCategoryMap.get(categoryId ?? '')) ??
        allCategoryMap.get(categoryId ?? '') ??
        '';

      return {
        id: report._id.toString(),
        type: report.type,
        description: report.description ?? '',
        categoryName,
        categoryId,
        accountName: accountId ? (accountMap.get(accountId) ?? '') : '',
        accountId,
        amount: report.amount ?? 0,
        balance: report.balance ?? 0,
        createdAt: report.createdAt ? report.createdAt.toISOString() : '',
        details:
          report.details?.map((detail) => ({
            description: detail.description,
            amount: detail.amount ?? 0,
            categoryName: detail.category
              ? allCategoryMap.get(detail.category.toString())
              : undefined,
            categoryId: detail.category?.toString(),
          })) ?? [],
      };
    },
  );

  const totalBalance = normalizedAccounts.reduce(
    (sum, account) => sum + account.balance,
    0,
  );

  const financeProps: FinanceAdminViewProps = {
    accounts: normalizedAccounts,
    incomingCategories: buildCategoryTree(incomingCategories),
    outgoingCategories: buildCategoryTree(outgoingCategories),
    incomingCategoryOptions: incomingCategories.map((category) => ({
      id: category._id.toString(),
      name: category.name,
      inheritsFrom: category.inherits?.toString() ?? null,
    })),
    outgoingCategoryOptions: outgoingCategories.map((category) => ({
      id: category._id.toString(),
      name: category.name,
      inheritsFrom: category.inherits?.toString() ?? null,
    })),
    reports: normalizedReports,
    summary: {
      totalBalance,
      monthIncoming: summaryTotals.monthIncoming,
      monthOutgoing: summaryTotals.monthOutgoing,
      yearIncoming: summaryTotals.yearIncoming,
      yearOutgoing: summaryTotals.yearOutgoing,
    },
    monthLabel: formatMonthLabel(monthStart),
    monthParam,
    currentMonthLabel: formatMonthLabel(new Date()),
  };

  return <FinanceAdminView {...financeProps} />;
}
