import {
    NextRequest,
    NextResponse,
  } from 'next/server';
  
  import {
    cookies,
  } from 'next/headers';
  
  import {
    createCsrfToken,
  } from '@/lib/auth/bff-security';
  
  export async function GET(
    _request: NextRequest,
  ) {
    const token =
      createCsrfToken();
  
    const cookieStore =
      await cookies();
  
    cookieStore.set(
      'csrf-token',
      token,
      {
        httpOnly: false,
        secure:
          process.env.NODE_ENV ===
          'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 60 * 60,
      },
    );
  
    return NextResponse.json(
      {
        data: {
          csrfToken: token,
        },
      },
      {
        headers: {
          'cache-control':
            'no-store',
        },
      },
    );
  }