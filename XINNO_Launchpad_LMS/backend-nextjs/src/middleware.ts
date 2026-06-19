import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Get the origin from the request
  const origin = request.headers.get('origin');
  
  // Allow requests from your frontend
  const allowedOrigins = [
    'http://localhost:4200',
    'http://127.0.0.1:4200',
    process.env.FRONTEND_URL || 'http://localhost:4200'
  ];

  // Handle preflight requests (OPTIONS)
  if (request.method === 'OPTIONS') {
    const response = new NextResponse(null, { status: 200 });
    
    if (origin && allowedOrigins.includes(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin);
    } else {
      response.headers.set('Access-Control-Allow-Origin', '*');
    }
    
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    response.headers.set(
      'Access-Control-Allow-Headers',
      'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
    );
    response.headers.set('Access-Control-Expose-Headers', 'Content-Disposition, Content-Type');
    response.headers.set('Access-Control-Max-Age', '86400'); // 24 hours
    
    return response;
  }

  // Handle actual requests
  const response = NextResponse.next();
  
  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
  } else {
    response.headers.set('Access-Control-Allow-Origin', '*');
  }
  
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  response.headers.set(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );
  response.headers.set('Access-Control-Expose-Headers', 'Content-Disposition, Content-Type');
  
  return response;
}

// Configure which routes should use this middleware
export const config = {
  matcher: '/api/:path*',
};
