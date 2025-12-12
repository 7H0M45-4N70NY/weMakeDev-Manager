import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendPushNotification, PushPayload } from '@/lib/push/vapid';

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

    const body = await request.json();
    const { userId, payload } = body as {
      userId?: string;
      payload: PushPayload;
    };

    // Use authenticated user's ID if not specified
    const targetUserId = userId || user.id;

    // Fetch user's push subscriptions
    const { data: subscriptions, error: subError } = await supabase
      .from('push_subscriptions')
      .select('endpoint, keys')
      .eq('user_id', targetUserId)
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

    // Send notifications to all subscriptions
    const results = await Promise.allSettled(
      subscriptions.map(sub => 
        sendPushNotification(
          {
            endpoint: sub.endpoint,
            keys: sub.keys as { p256dh: string; auth: string }
          },
          payload
        )
      )
    );

    // Mark expired subscriptions as inactive
    const expiredEndpoints = results
      .map((result, index) => {
        if (
          result.status === 'fulfilled' && 
          result.value.error === 'Subscription expired'
        ) {
          return subscriptions[index].endpoint;
        }
        return null;
      })
      .filter(Boolean);

    if (expiredEndpoints.length > 0) {
      await supabase
        .from('push_subscriptions')
        .update({ active: false })
        .in('endpoint', expiredEndpoints);
    }

    const successful = results.filter(
      r => r.status === 'fulfilled' && r.value.success
    ).length;

    return NextResponse.json({
      success: true,
      sent: successful,
      total: subscriptions.length,
      expired: expiredEndpoints.length,
    });

  } catch (error) {
    console.error('Error in push send endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
