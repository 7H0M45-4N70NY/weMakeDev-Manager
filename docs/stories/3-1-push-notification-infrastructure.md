# Story 3.1: Push Notification Infrastructure

**Epic:** Epic 3 - Multi-Channel Notifications  
**Story ID:** 3.1  
**Status:** Ready for Development  
**Estimated Effort:** 6-8 hours  
**Priority:** High

---

## Story

As a Developer,  
I want to implement the Web Push infrastructure,  
So that the app can send notifications even when closed.

---

## Acceptance Criteria

### AC1: Service Worker Registration
**Given** The application is running  
**When** The Service Worker is registered  
**Then** It handles `push` events and displays notifications  
**And** It handles `notificationclick` events to open the app or trigger actions  
**And** VAPID keys are configured in the environment

### AC2: Push Event Handling
**Given** A push notification is sent from the server  
**When** The Service Worker receives the push event  
**Then** It displays a notification with title, body, and icon  
**And** The notification includes action buttons when applicable

### AC3: Notification Click Handling
**Given** A notification is displayed  
**When** The user clicks the notification  
**Then** The app opens to the relevant page  
**And** The notification is dismissed

### AC4: VAPID Configuration
**Given** VAPID keys are generated  
**When** The server sends push notifications  
**Then** The keys are used for authentication  
**And** The keys are stored securely in environment variables

---

## Technical Implementation

### Tasks

#### Task 1: Generate VAPID Keys
- [ ] Install `web-push` package: `npm install web-push`
- [ ] Generate VAPID keys: `npx web-push generate-vapid-keys`
- [ ] Add keys to `.env.local`:
  ```
  NEXT_PUBLIC_VAPID_PUBLIC_KEY=<public_key>
  VAPID_PRIVATE_KEY=<private_key>
  VAPID_SUBJECT=mailto:your-email@example.com
  ```
- [ ] Update `.env.local.example` with placeholder values

#### Task 2: Implement Service Worker
- [ ] Create `public/sw.js` with push event listener
- [ ] Implement `push` event handler to display notifications
- [ ] Implement `notificationclick` event handler
- [ ] Add notification action handling (Yes/No buttons)
- [ ] Test Service Worker registration in browser

#### Task 3: Create VAPID Server Utility
- [ ] Create `src/lib/push/vapid.ts`
- [ ] Implement `sendPushNotification(subscription, payload)` function
- [ ] Add error handling for expired subscriptions
- [ ] Add retry logic for failed sends

#### Task 4: Create Push API Endpoint
- [ ] Create `src/app/api/push/send/route.ts`
- [ ] Implement POST handler to send push notifications
- [ ] Validate request payload
- [ ] Return appropriate status codes
- [ ] Add authentication middleware

#### Task 5: Update Next.js Configuration
- [ ] Update `next.config.mjs` to serve Service Worker
- [ ] Configure PWA settings for push notifications
- [ ] Add Service Worker to build output

#### Task 6: Write Tests
- [ ] Test VAPID key configuration
- [ ] Test push notification sending
- [ ] Test Service Worker registration
- [ ] Mock push events for testing

---

## Implementation Details

### Service Worker (`public/sw.js`)

```javascript
// Service Worker for Push Notifications
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(clients.claim());
});

self.addEventListener('push', (event) => {
  console.log('Push event received:', event);
  
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'Manager Notification';
  const options = {
    body: data.body || 'You have a new notification',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    data: data.data || {},
    actions: data.actions || [],
    tag: data.tag || 'default',
    requireInteraction: data.requireInteraction || false,
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  event.notification.close();

  const action = event.action;
  const data = event.notification.data;

  if (action === 'yes' || action === 'no') {
    // Send action to server
    event.waitUntil(
      fetch('/api/notifications/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          notificationId: data.notificationId,
          taskId: data.taskId,
        }),
      })
    );
  }

  // Open the app
  const urlToOpen = data.url || '/dashboard';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if app is already open
        for (const client of clientList) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        // Open new window
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});
```

### VAPID Utility (`src/lib/push/vapid.ts`)

```typescript
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
```

### Push API Endpoint (`src/app/api/push/send/route.ts`)

```typescript
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
```

### Next.js Configuration Update (`next.config.mjs`)

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Existing config...
  
  // Ensure Service Worker is served correctly
  async headers() {
    return [
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Service-Worker-Allowed',
            value: '/',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
```

---

## Database Schema

### `push_subscriptions` Table

```sql
CREATE TABLE push_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL UNIQUE,
  keys JSONB NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own subscriptions
CREATE POLICY "Users can manage their own push subscriptions"
  ON push_subscriptions
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Index for faster lookups
CREATE INDEX idx_push_subscriptions_user_id ON push_subscriptions(user_id);
CREATE INDEX idx_push_subscriptions_active ON push_subscriptions(active);
```

---

## Testing Strategy

### Unit Tests

```typescript
// src/lib/push/vapid.test.ts
import { sendPushNotification, sendBulkPushNotifications } from './vapid';

describe('VAPID Push Notifications', () => {
  const mockSubscription = {
    endpoint: 'https://fcm.googleapis.com/fcm/send/test',
    keys: {
      p256dh: 'test-p256dh-key',
      auth: 'test-auth-key',
    },
  };

  const mockPayload = {
    title: 'Test Notification',
    body: 'This is a test',
  };

  it('should send push notification successfully', async () => {
    const result = await sendPushNotification(mockSubscription, mockPayload);
    expect(result.success).toBe(true);
  });

  it('should handle expired subscriptions', async () => {
    // Mock expired subscription
    const result = await sendPushNotification(
      { ...mockSubscription, endpoint: 'expired' },
      mockPayload
    );
    expect(result.success).toBe(false);
    expect(result.error).toBe('Subscription expired');
  });

  it('should send bulk notifications', async () => {
    const subscriptions = [mockSubscription, mockSubscription];
    const result = await sendBulkPushNotifications(subscriptions, mockPayload);
    expect(result.successful).toBeGreaterThan(0);
  });
});
```

### Integration Tests

```typescript
// src/app/api/push/send/route.test.ts
import { POST } from './route';
import { NextRequest } from 'next/server';

describe('POST /api/push/send', () => {
  it('should require authentication', async () => {
    const request = new NextRequest('http://localhost:3000/api/push/send', {
      method: 'POST',
    });
    const response = await POST(request);
    expect(response.status).toBe(401);
  });

  it('should send push notification to authenticated user', async () => {
    // Mock authenticated request
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
    expect(response.status).toBe(200);
  });
});
```

---

## Environment Variables

Add to `.env.local`:

```bash
# VAPID Keys for Web Push
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_public_key_here
VAPID_PRIVATE_KEY=your_private_key_here
VAPID_SUBJECT=mailto:your-email@example.com
```

---

## Dependencies

```json
{
  "dependencies": {
    "web-push": "^3.6.7"
  },
  "devDependencies": {
    "@types/web-push": "^3.6.3"
  }
}
```

---

## Verification Steps

1. **Generate VAPID keys:**
   ```bash
   npx web-push generate-vapid-keys
   ```

2. **Add keys to environment:**
   - Copy keys to `.env.local`
   - Restart dev server

3. **Test Service Worker registration:**
   - Open browser DevTools → Application → Service Workers
   - Verify Service Worker is registered

4. **Test push notification:**
   - Call `/api/push/send` endpoint
   - Verify notification appears in browser

5. **Test notification click:**
   - Click notification
   - Verify app opens to correct page

---

## Definition of Done

- [ ] VAPID keys generated and configured
- [ ] Service Worker handles push events
- [ ] Service Worker handles notification clicks
- [ ] Push API endpoint implemented
- [ ] Database table created with RLS
- [ ] Unit tests written and passing
- [ ] Integration tests written and passing
- [ ] Documentation updated
- [ ] Code reviewed and merged

---

## Notes

- Service Worker must be served from root path (`/sw.js`)
- VAPID keys must be kept secure and not committed to git
- Push notifications require HTTPS in production
- Test on multiple browsers (Chrome, Firefox, Edge)
- iOS Safari has limited push notification support

---

## References

- [Web Push Protocol](https://datatracker.ietf.org/doc/html/rfc8030)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [web-push library](https://github.com/web-push-libs/web-push)
- [Next.js PWA Guide](https://nextjs.org/docs/app/building-your-application/configuring/progressive-web-apps)
