export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.error('Notifications not supported');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission === 'denied') {
    return false;
  }

  const permission = await Notification.requestPermission();
  return permission === 'granted';
}

export async function subscribeToPush(): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    // Check if Service Worker is supported
    if (!('serviceWorker' in navigator)) {
      return { success: false, error: 'Service Workers not supported' };
    }

    // Register Service Worker if not already registered
    let registration = await navigator.serviceWorker.getRegistration();
    
    if (!registration) {
      registration = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;
    }

    // Check if Push API is supported
    if (!('PushManager' in window)) {
      return { success: false, error: 'Push notifications not supported' };
    }

    // Get existing subscription or create new one
    let subscription = await registration.pushManager.getSubscription();
    
    if (!subscription) {
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      
      if (!vapidPublicKey) {
        return { success: false, error: 'VAPID public key not configured' };
      }

      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        // PushManager expects a BufferSource; pass the Uint8Array and assert to BufferSource for TS.
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as BufferSource,
      });
    }

    // Save subscription to server
    const response = await fetch('/api/notifications/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subscription.toJSON()),
    });

    if (!response.ok) {
      const data = await response.json();
      return { success: false, error: data.error || 'Failed to save subscription' };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error subscribing to push:', error);
    return { success: false, error: error.message };
  }
}

export async function unsubscribeFromPush(): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const registration = await navigator.serviceWorker.getRegistration();
    
    if (!registration) {
      return { success: true }; // Already unsubscribed
    }

    const subscription = await registration.pushManager.getSubscription();
    
    if (!subscription) {
      return { success: true }; // Already unsubscribed
    }

    // Unsubscribe from push
    await subscription.unsubscribe();

    // Remove from server
    const response = await fetch('/api/notifications/subscribe', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ endpoint: subscription.endpoint }),
    });

    if (!response.ok) {
      const data = await response.json();
      return { success: false, error: data.error || 'Failed to remove subscription' };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error unsubscribing from push:', error);
    return { success: false, error: error.message };
  }
}

export async function getSubscriptionStatus(): Promise<{
  isSubscribed: boolean;
  subscription?: PushSubscription;
}> {
  try {
    const registration = await navigator.serviceWorker.getRegistration();
    
    if (!registration) {
      return { isSubscribed: false };
    }

    const subscription = await registration.pushManager.getSubscription();
    
    return {
      isSubscribed: !!subscription,
      subscription: subscription || undefined,
    };
  } catch (error) {
    console.error('Error checking subscription status:', error);
    return { isSubscribed: false };
  }
}

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}
