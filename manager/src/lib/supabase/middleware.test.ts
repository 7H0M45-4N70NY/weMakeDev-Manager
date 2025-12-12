import { NextRequest, NextResponse } from 'next/server';
import { updateSession } from './middleware';

describe('Supabase Middleware', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
  });

  it('should update session on request', async () => {
    const request = new NextRequest('http://localhost:3000/dashboard');
    const response = await updateSession(request);

    expect(response).toBeInstanceOf(NextResponse);
  });

  it('should preserve cookies in response', async () => {
    const request = new NextRequest('http://localhost:3000/dashboard');
    request.cookies.set('test-cookie', 'test-value');

    const response = await updateSession(request);
    expect(response.cookies).toBeDefined();
  });
});
