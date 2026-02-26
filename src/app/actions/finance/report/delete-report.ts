'use server';

import { ObjectId } from 'mongodb';
import { revalidatePath, revalidateTag } from 'next/cache';

import { toObjectId } from '@app/helpers/to-object-id';
import clientPromise from '@app/ins/mongo-client';

import { resolveReportCollection } from '../helpers/common';
import { findReportById, rebuildFinanceSnapshots } from '../helpers/db';

export async function deleteReport(reportId: string) {
  if (!ObjectId.isValid(reportId)) {
    return { success: false, message: 'Invalid report id.' };
  }

  const dbClient = await clientPromise;
  const db = dbClient.db();

  const reportIdObject = toObjectId(reportId);

  if (!reportIdObject) {
    return { success: false, message: 'Report not found.' };
  }

  const report = await findReportById(db, reportIdObject);

  if (!report) {
    return { success: false, message: 'Report not found.' };
  }

  await db
    .collection(resolveReportCollection(report.type))
    .deleteOne({ _id: reportIdObject });

  if (report.type === 'incoming' || report.type === 'outgoing') {
    await rebuildFinanceSnapshots(db);
  }

  revalidatePath('/admin/finance');

  if (report.type === 'debt') {
    revalidateTag('admin-finance-debts');
  }

  return { success: true, message: 'Report deleted.' };
}
