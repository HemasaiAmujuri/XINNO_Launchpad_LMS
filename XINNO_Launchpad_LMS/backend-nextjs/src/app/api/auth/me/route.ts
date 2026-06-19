import { NextRequest } from 'next/server';
import { authenticateRequest } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/auth';

// GET /api/auth/me
export async function GET(request: NextRequest) {
  try {
    const user = authenticateRequest(request);

    if (!user) {
      return errorResponse('Not authenticated', 401);
    }

    return successResponse(user);
  } catch (error) {
    return errorResponse('Authentication failed', 401);
  }
}
