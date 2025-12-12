import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendPushNotification } from '@/lib/push/vapid';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch user's active subscriptions
    const { data: subscriptions, error: subError } = await supabase
      .from('push_subscriptions')
      .select('endpoint, keys')
      .eq('user_id', user.id)
      .eq('active', true);

    if (subError) {
      console.error('Error fetching subscriptions:', subError);
      return NextResponse.json(
        { error: 'Failed to fetch subscriptions' },
        { status: 500 }
      );
    }

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json(
        { error: 'No active subscriptions found' },
        { status: 404 }
      );
    }

    // Send test notification
    const payload = {
      title: 'Test Notification',
      body: 'This is a test notification from Manager',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      tag: 'test-notification',
      data: {
        url: '/dashboard',
      },
    };

    const results = await Promise.allSettled(
      subscriptions.map(sub =>
        sendPushNotification(
          {
            endpoint: sub.endpoint,
            keys: sub.keys as { p256dh: string; auth: string },
          },
          payload
        )
      )
    );

    const successful = results.filter(
      r => r.status === 'fulfilled' && r.value.success
    ).length;

    if (successful === 0) {
      return NextResponse.json(
        { error: 'Failed to send test notification' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Test notification sent successfully',
      sent: successful,
    });

  } catch (error) {
    console.error('Error in test notification endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
