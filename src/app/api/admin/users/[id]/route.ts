import { NextRequest, NextResponse } from 'next/server';

import {
  type UserOperationResult,
  updateUser,
} from '@app/services/admin-users.service';

export const runtime = 'nodejs';

function json(body: UserOperationResult, status = 200) {
  return NextResponse.json(body, { status });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const [{ id }, formData] = await Promise.all([params, request.formData()]);

    formData.set('id', id);

    const result = await updateUser(formData);

    return json(result, result.success ? 200 : 400);
  } catch (error) {
    console.error('Error updating user:', error);

    return json({ success: false, message: 'Failed to update user.' }, 500);
  }
}
