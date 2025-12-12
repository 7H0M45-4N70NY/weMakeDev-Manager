import { createClient } from './client';

describe('Supabase Client', () => {
  beforeEach(() => {
    // Set required environment variables for testing
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
  });

  it('should create a Supabase client instance', () => {
    const client = createClient();
    expect(client).toBeDefined();
    expect(client.auth).toBeDefined();
  });

  it('should throw error if environment variables are missing', () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    expect(() => {
      createClient();
    }).toThrow();
  });
});
