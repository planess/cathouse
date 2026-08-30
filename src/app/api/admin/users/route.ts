import { NextRequest } from 'next/server';

import { createJsonResponse } from '@app/helpers/create-json-response';
import { createUser } from '@app/services/admin-users.service';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const result = await createUser(formData);

    return createJsonResponse(result, result.success ? 201 : 400);
  } catch (error) {
    console.error('Error creating user:', error);

    return createJsonResponse(
      { success: false, message: 'Failed to create user.' },
      500,
    );
  }
}
