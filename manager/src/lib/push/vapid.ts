import webpush from 'web-push';

// Configure web-push with VAPID keys
webpush.setVapidDetails(
  process.env.VAPID_SUBJECT!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: any;
  actions?: Array<{
    action: string;
    title: string;
  }>;
  tag?: string;
  requireInteraction?: boolean;
}

export async function sendPushNotification(
  subscription: PushSubscription,
  payload: PushPayload
): Promise<{ success: boolean; error?: string }> {
  try {
    await webpush.sendNotification(
      subscription,
      JSON.stringify(payload)
    );
    return { success: true };
  } catch (error: any) {
    console.error('Error sending push notification:', error);
    
    // Handle expired subscription
    if (error.statusCode === 410) {
      return { 
        success: false, 
        error: 'Subscription expired' 
      };
    }
    
    return { 
      success: false, 
      error: error.message 
    };
  }
}

export async function sendBulkPushNotifications(
  subscriptions: PushSubscription[],
  payload: PushPayload
): Promise<{
  successful: number;
  failed: number;
  expired: string[];
}> {
  const results = await Promise.allSettled(
    subscriptions.map(sub => sendPushNotification(sub, payload))
  );

  const expired: string[] = [];
  let successful = 0;
  let failed = 0;

  results.forEach((result, index) => {
    if (result.status === 'fulfilled' && result.value.success) {
      successful++;
    } else {
      failed++;
      if (result.status === 'fulfilled' && result.value.error === 'Subscription expired') {
        expired.push(subscriptions[index].endpoint);
      }
    }
  });

  return { successful, failed, expired };
}
