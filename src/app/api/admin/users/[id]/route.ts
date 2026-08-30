import { NextRequest } from 'next/server';

import { createJsonResponse } from '@app/helpers/create-json-response';
import { updateUser } from '@app/services/admin-users.service';

export const runtime = 'nodejs';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const [{ id }, formData] = await Promise.all([params, request.formData()]);

    formData.set('id', id);

    const result = await updateUser(formData);

    return createJsonResponse(result, result.success ? 200 : 400);
  } catch (error) {
    console.error('Error updating user:', error);

    return createJsonResponse(
      { success: false, message: 'Failed to update user.' },
      500,
    );
  }
}
