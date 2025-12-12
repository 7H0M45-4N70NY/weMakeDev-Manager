import { POST } from './route';
import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendPushNotification } from '@/lib/push/vapid';

// Mock dependencies
jest.mock('@/lib/supabase/server');
jest.mock('@/lib/push/vapid');

describe('POST /api/push/send', () => {
  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
  };

  const mockSubscriptions = [
    {
      endpoint: 'https://fcm.googleapis.com/fcm/send/test1',
      keys: {
        p256dh: 'test-key-1',
        auth: 'test-auth-1',
      },
    },
    {
      endpoint: 'https://fcm.googleapis.com/fcm/send/test2',
      keys: {
        p256dh: 'test-key-2',
        auth: 'test-auth-2',
      },
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should require authentication', async () => {
    const mockSupabase = {
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: null },
          error: new Error('Unauthorized'),
        }),
      },
    };

    (createClient as jest.Mock).mockResolvedValue(mockSupabase);

    const request = new NextRequest('http://localhost:3000/api/push/send', {
      method: 'POST',
      body: JSON.stringify({
        payload: {
          title: 'Test',
          body: 'Test notification',
        },
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('should send push notification to authenticated user', async () => {
    const mockSupabase = {
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: mockUser },
          error: null,
        }),
      },
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      update: jest.fn().mockResolvedValue({ error: null }),
      in: jest.fn().mockResolvedValue({ error: null }),
    };

    // Mock the query chain
    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'push_subscriptions') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          update: jest.fn().mockResolvedValue({ error: null }),
          in: jest.fn().mockResolvedValue({ error: null }),
        };
      }
      return mockSupabase;
    });

    // Mock successful subscription fetch
    mockSupabase.select.mockResolvedValue({
      data: mockSubscriptions,
      error: null,
    });

    (createClient as jest.Mock).mockResolvedValue(mockSupabase);
    (sendPushNotification as jest.Mock).mockResolvedValue({ success: true });

    const request = new NextRequest('http://localhost:3000/api/push/send', {
      method: 'POST',
      body: JSON.stringify({
        payload: {
          title: 'Test',
          body: 'Test notification',
        },
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.sent).toBeGreaterThan(0);
  });

  it('should handle no active subscriptions', async () => {
    const mockSupabase = {
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: mockUser },
          error: null,
        }),
      },
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockResolvedValue({
        data: [],
        error: null,
      }),
    };

    (createClient as jest.Mock).mockResolvedValue(mockSupabase);

    const request = new NextRequest('http://localhost:3000/api/push/send', {
      method: 'POST',
      body: JSON.stringify({
        payload: {
          title: 'Test',
          body: 'Test notification',
        },
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe('No active subscriptions found');
  });

  it('should mark expired subscriptions as inactive', async () => {
    const mockSupabase = {
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: mockUser },
          error: null,
        }),
      },
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      update: jest.fn().mockResolvedValue({ error: null }),
      in: jest.fn().mockResolvedValue({ error: null }),
    };

    // Mock subscription fetch
    const selectMock = jest.fn().mockResolvedValue({
      data: mockSubscriptions,
      error: null,
    });

    mockSupabase.select = selectMock;

    (createClient as jest.Mock).mockResolvedValue(mockSupabase);
    
    // Mock one success and one expired
    (sendPushNotification as jest.Mock)
      .mockResolvedValueOnce({ success: true })
      .mockResolvedValueOnce({ success: false, error: 'Subscription expired' });

    const request = new NextRequest('http://localhost:3000/api/push/send', {
      method: 'POST',
      body: JSON.stringify({
        payload: {
          title: 'Test',
          body: 'Test notification',
        },
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.expired).toBe(1);
  });
});
