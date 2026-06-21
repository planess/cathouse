import { NextRequest, NextResponse } from 'next/server';

import {
  createUser,
  type UserOperationResult,
} from '@app/services/admin-users.service';

export const runtime = 'nodejs';

function json(body: UserOperationResult, status = 200) {
  return NextResponse.json(body, { status });
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const result = await createUser(formData);

    return json(result, result.success ? 201 : 400);
  } catch (error) {
    console.error('Error creating user:', error);

    return json({ success: false, message: 'Failed to create user.' }, 500);
  }
}
