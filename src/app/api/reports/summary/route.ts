import { ObjectId } from 'mongodb';
import { NextResponse } from 'next/server';

import { DbTables } from '@app/enum/db-tables';
import clientPromise from '@app/ins/mongo-client';

const DEFAULT_YEAR = new Date().getFullYear();
const FOUNDATION_START_YEAR = 2025;

type OutgoingCategoryDocument = {
  _id: ObjectId;
  name: string;
};

function getYearRange(year: number) {
  const start = new Date(year, 0, 1);
  const end = new Date(year + 1, 0, 1);

  return { start, end };
}

function buildMonths<T extends { month: number }>(
  totals: T[],
  factory: (month: number) => Omit<T, 'month'>,
): T[] {
  return Array.from({ length: 12 }, (_, index) => {
    const month = index + 1;
    const found = totals.find((item) => item.month === month);

    if (found) {
      return found;
    }

    return { month, ...factory(month) } as T;
  });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const yearParam = Number(searchParams.get('year'));
  const year = Number.isFinite(yearParam) ? yearParam : DEFAULT_YEAR;
  const section = searchParams.get('section');
  const loadImpact = section !== 'finance';
  const loadFinance = section !== 'impact';

  const { start, end } = getYearRange(year);

  const dbClient = await clientPromise;
  const db = dbClient.db();

  let sterilizedTotals: { _id: number; total: number }[] = [];
  let observationTotals: { _id: number; total: number }[] = [];
  let financeTotals: { _id: { month: number; type: string }; total: number }[] =
    [];
  let incomingFinanceTotals: { _id: number; total: number }[] = [];
  let outgoingFinanceTotals: { _id: number; total: number }[] = [];
  let outgoingBreakdownTotals: {
    _id: { month: number; category: ObjectId };
    total: number;
  }[] = [];
  let outgoingCategories: OutgoingCategoryDocument[] = [];

  if (loadImpact) {
    [sterilizedTotals, observationTotals] = await Promise.all([
      db
        .collection(DbTables.animals)
        .aggregate<{ _id: number; total: number }>([
          {
            $match: {
              'vetMarkers.sterilized.date': { $gte: start, $lt: end },
            },
          },
          {
            $project: {
              month: { $month: '$vetMarkers.sterilized.date' },
            },
          },
          {
            $group: {
              _id: '$month',
              total: { $sum: 1 },
            },
          },
        ])
        .toArray(),
      db
        .collection(DbTables.animals)
        .aggregate<{ _id: number; total: number }>([
          { $unwind: '$observations' },
          {
            $match: {
              'observations.date': { $gte: start, $lt: end },
              'observations.location.coordinates.latitude': {
                $type: 'number',
              },
              'observations.location.coordinates.longitude': {
                $type: 'number',
              },
            },
          },
          {
            $project: {
              month: { $month: '$observations.date' },
              lat: {
                $round: ['$observations.location.coordinates.latitude', 4],
              },
              lon: {
                $round: ['$observations.location.coordinates.longitude', 4],
              },
            },
          },
          {
            $group: {
              _id: { month: '$month', lat: '$lat', lon: '$lon' },
            },
          },
          {
            $group: {
              _id: '$_id.month',
              total: { $sum: 1 },
            },
          },
        ])
        .toArray(),
    ]);
  }

  if (loadFinance) {
    [
      incomingFinanceTotals,
      outgoingFinanceTotals,
      outgoingBreakdownTotals,
      outgoingCategories,
    ] = await Promise.all([
      db
        .collection(DbTables.financeIncomingReports)
        .aggregate<{ _id: number; total: number }>([
          {
            $match: {
              operationDate: { $gte: start, $lt: end },
            },
          },
          {
            $project: {
              month: { $month: '$operationDate' },
              amount: { $toDouble: '$amount' },
            },
          },
          {
            $group: {
              _id: '$month',
              total: { $sum: '$amount' },
            },
          },
        ])
        .toArray(),
      db
        .collection(DbTables.financeOutgoingReports)
        .aggregate<{ _id: number; total: number }>([
          {
            $match: {
              operationDate: { $gte: start, $lt: end },
            },
          },
          {
            $project: {
              month: { $month: '$operationDate' },
              amount: { $toDouble: '$amount' },
            },
          },
          {
            $group: {
              _id: '$month',
              total: { $sum: '$amount' },
            },
          },
        ])
        .toArray(),
      db
        .collection(DbTables.financeOutgoingReports)
        .aggregate<{
          _id: { month: number; category: ObjectId };
          total: number;
        }>([
          {
            $match: {
              operationDate: { $gte: start, $lt: end },
            },
          },
          {
            $project: {
              month: { $month: '$operationDate' },
              items: {
                $cond: [
                  { $gt: [{ $size: { $ifNull: ['$details', []] } }, 0] },
                  {
                    $map: {
                      input: '$details',
                      as: 'detail',
                      in: {
                        category: {
                          $ifNull: ['$$detail.category', '$linkedTo'],
                        },
                        amount: { $toDouble: '$$detail.amount' },
                      },
                    },
                  },
                  [
                    {
                      category: '$linkedTo',
                      amount: { $toDouble: '$amount' },
                    },
                  ],
                ],
              },
            },
          },
          { $unwind: '$items' },
          { $match: { 'items.category': { $type: 'objectId' } } },
          {
            $group: {
              _id: { month: '$month', category: '$items.category' },
              total: { $sum: '$items.amount' },
            },
          },
        ])
        .toArray(),
      db
        .collection<OutgoingCategoryDocument>(DbTables.financeCategories)
        .find()
        .toArray(),
    ]);

    financeTotals = [
      ...incomingFinanceTotals.map((entry) => ({
        _id: { month: entry._id, type: 'incoming' },
        total: entry.total,
      })),
      ...outgoingFinanceTotals.map((entry) => ({
        _id: { month: entry._id, type: 'outgoing' },
        total: entry.total,
      })),
    ];
  }

  const sterilizedByMonth = loadImpact
    ? sterilizedTotals.map((item) => ({
        month: item._id,
        sterilized: item.total,
      }))
    : [];

  const observationByMonth = loadImpact
    ? observationTotals.map((item) => ({
        month: item._id,
        locations: item.total,
      }))
    : [];

  const statsMonths = loadImpact
    ? buildMonths(
        sterilizedByMonth.map((item) => ({
          month: item.month,
          sterilized: item.sterilized,
          locations:
            observationByMonth.find((entry) => entry.month === item.month)
              ?.locations ?? 0,
        })),
        (month) => ({
          sterilized: 0,
          locations:
            observationByMonth.find((entry) => entry.month === month)
              ?.locations ?? 0,
        }),
      )
    : [];

  const yearSterilized = loadImpact
    ? statsMonths.reduce((sum, entry) => sum + entry.sterilized, 0)
    : 0;

  const yearLocations = loadImpact
    ? statsMonths.reduce((sum, entry) => sum + entry.locations, 0)
    : 0;

  const financeMap = new Map<number, { incoming: number; outgoing: number }>();
  const outgoingBreakdownByMonth = new Map<
    number,
    { name: string; amount: number }[]
  >();

  if (loadFinance) {
    financeTotals.forEach((entry) => {
      const month = entry._id.month;
      const current = financeMap.get(month) ?? { incoming: 0, outgoing: 0 };

      if (entry._id.type === 'incoming') {
        current.incoming = entry.total;
      }

      if (entry._id.type === 'outgoing') {
        current.outgoing = entry.total;
      }

      financeMap.set(month, current);
    });

    const categoryNameMap = new Map(
      outgoingCategories.map((category) => [
        category._id.toString(),
        category.name,
      ]),
    );

    const monthCategoryTotals = new Map<number, Map<string, number>>();

    outgoingBreakdownTotals.forEach((entry) => {
      const month = entry._id.month;
      const categoryId = entry._id.category?.toString();
      const label = categoryId
        ? (categoryNameMap.get(categoryId) ?? 'Без категорії')
        : 'Без категорії';
      const monthMap =
        monthCategoryTotals.get(month) ?? new Map<string, number>();

      monthMap.set(label, (monthMap.get(label) ?? 0) + entry.total);
      monthCategoryTotals.set(month, monthMap);
    });

    monthCategoryTotals.forEach((entries, month) => {
      const breakdown = [...entries.entries()]
        .map(([name, amount]) => ({ name, amount }))
        .sort((a, b) => b.amount - a.amount);

      outgoingBreakdownByMonth.set(month, breakdown);
    });
  }

  const financeMonths = loadFinance
    ? buildMonths(
        [...financeMap.entries()].map(([month, totals]) => ({
          month,
          incoming: totals.incoming,
          outgoing: totals.outgoing,
          breakdown: outgoingBreakdownByMonth.get(month) ?? [],
        })),
        (month) => ({
          incoming: 0,
          outgoing: 0,
          breakdown: outgoingBreakdownByMonth.get(month) ?? [],
        }),
      )
    : [];

  const yearIncoming = loadFinance
    ? financeMonths.reduce((sum, entry) => sum + entry.incoming, 0)
    : 0;
  const yearOutgoing = loadFinance
    ? financeMonths.reduce((sum, entry) => sum + entry.outgoing, 0)
    : 0;

  const hasPrevious = !(year <= FOUNDATION_START_YEAR);
  // ? false
  // : loadImpact && loadFinance
  //   ? Boolean(previousSterilized ?? previousObservation ?? previousFinance)
  //   : loadImpact
  //     ? Boolean(previousSterilized ?? previousObservation)
  //     : Boolean(previousFinance);

  return NextResponse.json({
    success: true,
    year,
    stats: loadImpact
      ? {
          yearSterilized,
          yearLocations,
          months: statsMonths,
        }
      : undefined,
    finance: loadFinance
      ? {
          yearIncoming,
          yearOutgoing,
          months: financeMonths,
        }
      : undefined,
    hasPrevious,
  });
}
