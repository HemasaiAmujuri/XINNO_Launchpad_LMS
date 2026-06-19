import jwt, { Secret } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';

const JWT_SECRET: Secret = process.env.JWT_SECRET || 'your-secret-key';

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  name: string;
}

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function getTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  // Check cookie as fallback
  const cookies = request.cookies;
  return cookies.get('token')?.value || null;
}

export function authenticateRequest(request: NextRequest): JWTPayload | null {
  const token = getTokenFromRequest(request);
  if (!token) return null;
  
  return verifyToken(token);
}

export function requireAuth(request: NextRequest, allowedRoles?: string[]) {
  const user = authenticateRequest(request);
  
  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized - Please login' },
      { status: 401 }
    );
  }
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return NextResponse.json(
      { error: 'Forbidden - Insufficient permissions' },
      { status: 403 }
    );
  }
  
  return user;
}

export function successResponse(data: any, message?: string, status = 200) {
  return NextResponse.json(
    {
      success: true,
      message: message || 'Success',
      data,
    },
    { status }
  );
}

export function errorResponse(error: string, status = 400) {
  return NextResponse.json(
    {
      success: false,
      error,
    },
    { status }
  );
}

export function handleApiError(error: any) {
  console.error('API Error:', error);
  
  if (error.code === 'P2002') {
    return errorResponse('Record already exists', 409);
  }
  
  if (error.code === 'P2025') {
    return errorResponse('Record not found', 404);
  }
  
  const message = error.message || 'Internal server error';
  return errorResponse(message, 500);
}
