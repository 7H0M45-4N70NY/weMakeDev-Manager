# Story 3.2: Notification Settings & Subscription

**Epic:** Epic 3 - Multi-Channel Notifications  
**Story ID:** 3.2  
**Status:** Ready for Development  
**Estimated Effort:** 5-7 hours  
**Priority:** High  
**Depends On:** Story 3.1

---

## Story

As a User,  
I want to enable or disable notifications,  
So that I can control when I am interrupted.

---

## Acceptance Criteria

### AC1: Notification Permission Request
**Given** I am on the Settings page  
**When** I click "Enable Notifications"  
**Then** The browser prompts for permission  
**And** If granted, a push subscription is created and saved to the database  
**And** I see a success message

### AC2: Subscription Management
**Given** I have enabled notifications  
**When** I view the Settings page  
**Then** I see my subscription status  
**And** I can disable notifications  
**And** The subscription is marked as inactive in the database

### AC3: Permission Denial Handling
**Given** I am prompted for notification permission  
**When** I deny the permission  
**Then** I see a helpful message explaining how to re-enable  
**And** The UI shows the denied state

### AC4: Resubscription Flow
**Given** My subscription has expired  
**When** I visit the Settings page  
**Then** I see a prompt to resubscribe  
**And** I can click to create a new subscription

---

## Technical Implementation

### Tasks

#### Task 1: Create Notification Settings UI
- [ ] Create `src/features/notifications/NotificationSettings.tsx`
- [ ] Add enable/disable notification toggle
- [ ] Show current subscription status
- [ ] Add "Test Notification" button
- [ ] Style with CSS modules

#### Task 2: Implement Subscription Logic
- [ ] Create `src/lib/push/subscription.ts` utility
- [ ] Implement `requestNotificationPermission()` function
- [ ] Implement `subscribeToPush()` function
- [ ] Implement `unsubscribeFromPush()` function
- [ ] Handle browser compatibility checks

#### Task 3: Create Subscription API Endpoints
- [ ] Create `src/app/api/notifications/subscribe/route.ts`
- [ ] Implement POST handler to save subscription
- [ ] Implement DELETE handler to remove subscription
- [ ] Add validation and error handling

#### Task 4: Create Settings Page
- [ ] Create `src/app/dashboard/settings/page.tsx`
- [ ] Add NotificationSettings component
- [ ] Add navigation to settings from dashboard
- [ ] Style settings page layout

#### Task 5: Implement Test Notification
- [ ] Create `src/app/api/notifications/test/route.ts`
- [ ] Send test notification to user
- [ ] Show success/error feedback

#### Task 6: Write Tests
- [ ] Test permission request flow
- [ ] Test subscription creation
- [ ] Test subscription deletion
- [ ] Test error handling
- [ ] Test UI state management

---

## Implementation Details

### Notification Settings Component (`src/features/notifications/NotificationSettings.tsx`)

```typescript
'use client';

import { useState, useEffect } from 'react';
import { 
  requestNotificationPermission, 
  subscribeToPush, 
  unsubscribeFromPush,
  getSubscriptionStatus 
} from '@/lib/push/subscription';
import styles from './NotificationSettings.module.css';

export default function NotificationSettings() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    checkStatus();
  }, []);

  async function checkStatus() {
    if (!('Notification' in window)) {
      setMessage({ type: 'error', text: 'Notifications not supported in this browser' });
      return;
    }

    setPermission(Notification.permission);
    const status = await getSubscriptionStatus();
    setIsSubscribed(status.isSubscribed);
  }

  async function handleEnableNotifications() {
    setIsLoading(true);
    setMessage(null);

    try {
      // Request permission
      const granted = await requestNotificationPermission();
      
      if (!granted) {
        setMessage({ 
          type: 'error', 
          text: 'Notification permission denied. Please enable in browser settings.' 
        });
        setPermission('denied');
        setIsLoading(false);
        return;
      }

      // Subscribe to push
      const result = await subscribeToPush();
      
      if (result.success) {
        setIsSubscribed(true);
        setPermission('granted');
        setMessage({ type: 'success', text: 'Notifications enabled successfully!' });
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to enable notifications' });
      }
    } catch (error) {
      console.error('Error enabling notifications:', error);
      setMessage({ type: 'error', text: 'An error occurred. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDisableNotifications() {
    setIsLoading(true);
    setMessage(null);

    try {
      const result = await unsubscribeFromPush();
      
      if (result.success) {
        setIsSubscribed(false);
        setMessage({ type: 'success', text: 'Notifications disabled' });
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to disable notifications' });
      }
    } catch (error) {
      console.error('Error disabling notifications:', error);
      setMessage({ type: 'error', text: 'An error occurred. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleTestNotification() {
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/notifications/test', {
        method: 'POST',
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Test notification sent!' });
      } else {
        const data = await response.json();
        setMessage({ type: 'error', text: data.error || 'Failed to send test notification' });
      }
    } catch (error) {
      console.error('Error sending test notification:', error);
      setMessage({ type: 'error', text: 'An error occurred. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  }

  if (!('Notification' in window)) {
    return (
      <div className={styles.container}>
        <h2>Notifications</h2>
        <div className={styles.error}>
          Your browser does not support notifications.
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h2>Notification Settings</h2>
      
      <div className={styles.status}>
        <div className={styles.statusItem}>
          <span className={styles.label}>Browser Permission:</span>
          <span className={`${styles.badge} ${styles[permission]}`}>
            {permission}
          </span>
        </div>
        
        <div className={styles.statusItem}>
          <span className={styles.label}>Subscription Status:</span>
          <span className={`${styles.badge} ${isSubscribed ? styles.active : styles.inactive}`}>
            {isSubscribed ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>

      {message && (
        <div className={`${styles.message} ${styles[message.type]}`}>
          {message.text}
        </div>
      )}

      <div className={styles.actions}>
        {!isSubscribed ? (
          <button
            onClick={handleEnableNotifications}
            disabled={isLoading || permission === 'denied'}
            className={styles.primaryButton}
          >
            {isLoading ? 'Enabling...' : 'Enable Notifications'}
          </button>
        ) : (
          <>
            <button
              onClick={handleTestNotification}
              disabled={isLoading}
              className={styles.secondaryButton}
            >
              {isLoading ? 'Sending...' : 'Send Test Notification'}
            </button>
            
            <button
              onClick={handleDisableNotifications}
              disabled={isLoading}
              className={styles.dangerButton}
            >
              {isLoading ? 'Disabling...' : 'Disable Notifications'}
            </button>
          </>
        )}
      </div>

      {permission === 'denied' && (
        <div className={styles.help}>
          <h3>How to enable notifications:</h3>
          <ol>
            <li>Click the lock icon in your browser's address bar</li>
            <li>Find "Notifications" in the permissions list</li>
            <li>Change it to "Allow"</li>
            <li>Refresh this page and try again</li>
          </ol>
        </div>
      )}
    </div>
  );
}
```

### Subscription Utility (`src/lib/push/subscription.ts`)

```typescript
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
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
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
```

### Subscribe API Endpoint (`src/app/api/notifications/subscribe/route.ts`)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

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

    const subscription = await request.json();

    // Validate subscription object
    if (!subscription.endpoint || !subscription.keys) {
      return NextResponse.json(
        { error: 'Invalid subscription object' },
        { status: 400 }
      );
    }

    // Check if subscription already exists
    const { data: existing } = await supabase
      .from('push_subscriptions')
      .select('id')
      .eq('endpoint', subscription.endpoint)
      .single();

    if (existing) {
      // Update existing subscription
      const { error: updateError } = await supabase
        .from('push_subscriptions')
        .update({
          keys: subscription.keys,
          active: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id);

      if (updateError) {
        console.error('Error updating subscription:', updateError);
        return NextResponse.json(
          { error: 'Failed to update subscription' },
          { status: 500 }
        );
      }
    } else {
      // Create new subscription
      const { error: insertError } = await supabase
        .from('push_subscriptions')
        .insert({
          user_id: user.id,
          endpoint: subscription.endpoint,
          keys: subscription.keys,
          active: true,
        });

      if (insertError) {
        console.error('Error creating subscription:', insertError);
        return NextResponse.json(
          { error: 'Failed to create subscription' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Subscription saved successfully',
    });

  } catch (error) {
    console.error('Error in subscribe endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
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

    const { endpoint } = await request.json();

    if (!endpoint) {
      return NextResponse.json(
        { error: 'Endpoint required' },
        { status: 400 }
      );
    }

    // Mark subscription as inactive
    const { error: updateError } = await supabase
      .from('push_subscriptions')
      .update({ active: false })
      .eq('endpoint', endpoint)
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Error removing subscription:', updateError);
      return NextResponse.json(
        { error: 'Failed to remove subscription' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Subscription removed successfully',
    });

  } catch (error) {
    console.error('Error in unsubscribe endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### Test Notification Endpoint (`src/app/api/notifications/test/route.ts`)

```typescript
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
```

### Settings Page (`src/app/dashboard/settings/page.tsx`)

```typescript
import { Metadata } from 'next';
import NotificationSettings from '@/features/notifications/NotificationSettings';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Settings - Manager',
  description: 'Manage your notification preferences',
};

export default function SettingsPage() {
  return (
    <div className={styles.container}>
      <h1>Settings</h1>
      
      <div className={styles.section}>
        <NotificationSettings />
      </div>
      
      {/* Add more settings sections here */}
    </div>
  );
}
```

### CSS Module (`src/features/notifications/NotificationSettings.module.css`)

```css
.container {
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
}

.container h2 {
  margin-bottom: 1.5rem;
  color: #1a1a1a;
}

.status {
  background: #f5f5f5;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1.5rem;
}

.statusItem {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
}

.label {
  font-weight: 500;
  color: #666;
}

.badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 500;
  text-transform: capitalize;
}

.badge.granted,
.badge.active {
  background: #d4edda;
  color: #155724;
}

.badge.denied,
.badge.inactive {
  background: #f8d7da;
  color: #721c24;
}

.badge.default {
  background: #fff3cd;
  color: #856404;
}

.message {
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
}

.message.success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.message.error {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.actions {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.primaryButton,
.secondaryButton,
.dangerButton {
  flex: 1;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.primaryButton {
  background: #007bff;
  color: white;
}

.primaryButton:hover:not(:disabled) {
  background: #0056b3;
}

.secondaryButton {
  background: #6c757d;
  color: white;
}

.secondaryButton:hover:not(:disabled) {
  background: #545b62;
}

.dangerButton {
  background: #dc3545;
  color: white;
}

.dangerButton:hover:not(:disabled) {
  background: #c82333;
}

.primaryButton:disabled,
.secondaryButton:disabled,
.dangerButton:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.help {
  background: #e7f3ff;
  border: 1px solid #b3d9ff;
  border-radius: 8px;
  padding: 1rem;
}

.help h3 {
  margin-top: 0;
  margin-bottom: 0.5rem;
  color: #004085;
}

.help ol {
  margin: 0;
  padding-left: 1.5rem;
  color: #004085;
}

.help li {
  margin-bottom: 0.5rem;
}

.error {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
  border-radius: 8px;
  padding: 1rem;
}
```

---

## Testing Strategy

### Unit Tests

```typescript
// src/lib/push/subscription.test.ts
import { 
  requestNotificationPermission, 
  subscribeToPush, 
  unsubscribeFromPush 
} from './subscription';

describe('Push Subscription', () => {
  beforeEach(() => {
    // Mock browser APIs
    global.Notification = {
      permission: 'default',
      requestPermission: jest.fn().mockResolvedValue('granted'),
    } as any;
  });

  it('should request notification permission', async () => {
    const result = await requestNotificationPermission();
    expect(result).toBe(true);
    expect(Notification.requestPermission).toHaveBeenCalled();
  });

  it('should handle denied permission', async () => {
    (Notification.requestPermission as jest.Mock).mockResolvedValue('denied');
    const result = await requestNotificationPermission();
    expect(result).toBe(false);
  });

  it('should subscribe to push notifications', async () => {
    const result = await subscribeToPush();
    expect(result.success).toBe(true);
  });

  it('should unsubscribe from push notifications', async () => {
    const result = await unsubscribeFromPush();
    expect(result.success).toBe(true);
  });
});
```

### Integration Tests

```typescript
// src/app/api/notifications/subscribe/route.test.ts
import { POST, DELETE } from './route';
import { NextRequest } from 'next/server';

describe('POST /api/notifications/subscribe', () => {
  it('should save subscription', async () => {
    const request = new NextRequest('http://localhost:3000/api/notifications/subscribe', {
      method: 'POST',
      body: JSON.stringify({
        endpoint: 'https://fcm.googleapis.com/fcm/send/test',
        keys: {
          p256dh: 'test-key',
          auth: 'test-auth',
        },
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
  });
});

describe('DELETE /api/notifications/subscribe', () => {
  it('should remove subscription', async () => {
    const request = new NextRequest('http://localhost:3000/api/notifications/subscribe', {
      method: 'DELETE',
      body: JSON.stringify({
        endpoint: 'https://fcm.googleapis.com/fcm/send/test',
      }),
    });

    const response = await DELETE(request);
    expect(response.status).toBe(200);
  });
});
```

---

## Verification Steps

1. **Navigate to Settings:**
   - Go to `/dashboard/settings`
   - Verify page loads correctly

2. **Enable Notifications:**
   - Click "Enable Notifications"
   - Grant permission in browser prompt
   - Verify success message appears
   - Check subscription status shows "Active"

3. **Test Notification:**
   - Click "Send Test Notification"
   - Verify notification appears
   - Click notification to verify app opens

4. **Disable Notifications:**
   - Click "Disable Notifications"
   - Verify subscription status shows "Inactive"

5. **Test Permission Denial:**
   - Reset browser permissions
   - Deny permission when prompted
   - Verify helpful message appears

---

## Definition of Done

- [ ] Notification settings UI implemented
- [ ] Subscription logic working
- [ ] API endpoints implemented
- [ ] Settings page created
- [ ] Test notification working
- [ ] Permission denial handled gracefully
- [ ] Unit tests written and passing
- [ ] Integration tests written and passing
- [ ] CSS styling complete
- [ ] Code reviewed and merged

---

## Notes

- Service Worker must be registered before subscribing
- VAPID public key must be available in environment
- Handle browser compatibility gracefully
- Test on multiple browsers and devices
- Consider adding notification preferences (timing, types)

---

## References

- [Notification API](https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API)
- [Push API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
- [Service Worker Registration](https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerRegistration)
