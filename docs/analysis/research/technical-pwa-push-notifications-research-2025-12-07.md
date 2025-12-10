---
stepsCompleted: [1]
inputDocuments: []
workflowType: 'research'
lastStep: 1
research_type: 'technical'
research_topic: 'PWA Push Notifications and Service Workers'
research_goals: 'Understand implementation details for Invisible UI'
user_name: 'Thoma'
date: '2025-12-07'
current_year: '2025'
web_research_enabled: true
source_verification: true
---
# Technical Research: PWA Push Notifications and Service Workers

**Date:** 2025-12-07
**Author:** Thoma

---

<!-- Content will be appended sequentially through collaborative workflow steps -->

## Technical Research Scope Confirmation

**Research Topic:** PWA Push Notifications and Service Workers
**Research Goals:** Understand implementation details for Invisible UI

**Technical Research Scope:**

- Architecture Analysis - Service Worker lifecycle, Push API, Notification API
- Implementation Approaches - Vercel/Next.js specific patterns, "Invisible" interaction handling
- Technology Stack - Libraries (e.g., `web-push`), browser support, fallback strategies
- Integration Patterns - Webhooks from Kestra to Push Service
- Performance Considerations - Battery usage, background sync limits

**Research Methodology:**

- Current 2025 web data with rigorous source verification
- Multi-source validation for critical technical claims
- Confidence level framework for uncertain information
- Comprehensive technical coverage with architecture-specific insights

**Scope Confirmed:** 2025-12-07

---

## Technology Stack Analysis

### Core Components Required

PWA Push Notifications require three foundational elements:
1.  **HTTPS Hosting** - Mandatory for Service Workers and secure data transmission.
2.  **Service Worker (`sw.js`)** - Background JavaScript handling push events even when app is closed.
3.  **Web App Manifest (`manifest.json`)** - Enables "Add to Home Screen" and notification permissions.

_Source: [appinstitute.com](https://appinstitute.com) (2025), [mozilla.org](https://developer.mozilla.org) (2025)_

### Programming Languages and Frameworks

| Technology | Role | Notes |
|---|---|---|
| **Next.js** | Frontend Framework | Built-in PWA support via App Router. Ideal for Vercel. |
| **JavaScript/TypeScript** | Service Worker & Frontend | All notification logic is JS. TypeScript recommended. |
| **Node.js** | Backend (API Routes) | Required for `web-push` library to send notifications. |

_Source: [nextjs.org](https://nextjs.org) (2025), [medium.com](https://medium.com) (2025)_

### Key Libraries

| Library | Purpose | Notes |
|---|---|---|
| **`web-push` (npm)** | Backend: Send Push Notifications | Uses VAPID keys. No third-party service required. Open Source. |
| **`next-pwa` (npm)** | Simplify Service Worker setup | Auto-generates `sw.js`. Good for rapid MVP. |
| **Push API (Browser)** | Client: Subscribe to notifications | `PushManager.subscribe()` after user permission. |
| **Notification API (Browser)** | Client: Display notifications | `self.registration.showNotification()` in Service Worker. |

_Source: [github.com/web-push-libs](https://github.com/web-push-libs/web-push) (2025), [web.dev](https://web.dev) (2025)_

### VAPID (Voluntary Application Server Identification)

VAPID is a standard (RFC 8292) for authenticating push message senders.

**How it works:**
1.  **Generate Keys:** A public/private key pair is generated once on the server (e.g., using `web-push generate-vapid-keys`).
2.  **Client Subscribes:** The browser's `PushManager.subscribe()` receives the **public** VAPID key as `applicationServerKey`.
3.  **Server Sends:** The backend uses the **private** VAPID key to sign a JWT for each push message.
4.  **Push Service Verifies:** The push service (e.g., FCM, Mozilla Autopush) verifies the signature using the stored public key.

**Why use VAPID?** It's standards-based, works across Chrome/Firefox/Edge/Safari, and requires no third-party service accounts (unlike FCM's legacy "sender ID" model).

_Source: [pushpad.xyz](https://pushpad.xyz/blog/web-push-vapid-application-server-key) (2025), [ietf.org RFC 8292](https://datatracker.ietf.org/doc/html/rfc8292)_

### Cloud Infrastructure (Vercel)

| Feature | Benefit for MVP |
|---|---|
| **Automatic HTTPS** | Meets mandatory PWA requirement. |
| **Serverless Functions** | API Routes (send notifications) scale automatically. |
| **Environment Variables** | Secure storage for VAPID private key. |
| **Edge Network** | Fast delivery of PWA assets globally. |

_Source: [vercel.com](https://vercel.com) (2025), [upstash.com](https://upstash.com/blog/nextjs-push-notification) (2025)_

---

## Critical Platform Limitation: iOS Action Buttons

> [!CAUTION]
> **iOS Safari does NOT support actionable notification buttons (e.g., "Yes/No") on PWAs as of late 2024/2025.**
> Push notifications on iOS require the PWA to be "Added to Home Screen" first (iOS 16.4+), and even then, action buttons are not supported.

**Impact on "Invisible UI" Concept:**
*   On **Android/Desktop Chrome**, action buttons work as expected.
*   On **iOS**, users can only tap the notification itself (which opens the PWA). They cannot respond directly from the lock screen.

**Workaround for MVP:**
*   Design notifications with a single, clear message and a link to a "respond" page in the PWA.
*   Consider a **Telegram/Discord Bot** as a parallel "Invisible UI" channel for iOS users. Bots have full button support.

_Source: [stackoverflow.com](https://stackoverflow.com/questions/79254987/ios-pwa-push-notifications-interactive-actions-yes-no-buttons-support) (2024)_

---

## Refined Multi-Channel Notification Strategy (User-Defined)

| Platform | Notification Style | Response Mechanism |
|---|---|---|
| **Android/Desktop Chrome** | Rich notifications with **Yes/No action buttons** | Direct response from lock screen |
| **iOS Safari PWA** | Simple notification: "Tap to manage" | Opens PWA to a quick-response page |
| **Telegram Bot (Common)** | Inline button messages | Universal fallback accessible from dashboard |

**Telegram Bot as Universal "Invisible UI":**
*   Users link Telegram account from PWA Settings.
*   Kestra sends notifications to **both** Web Push *and* Telegram Bot.
*   Telegram provides the most reliable button interaction across all devices.
*   Bot commands can also *ingest* tasks (e.g., `/add Buy groceries`).

---

## Integration Patterns: Kestra → Notifications

### Kestra Webhook Trigger

Kestra can be triggered by external systems via HTTP webhooks.

**Use Case:** User submits a voice note in the PWA → PWA sends HTTP POST to Kestra webhook → Kestra ingests and structures the task.

**URL Format:** `https://{kestra_host}/api/v1/executions/webhook/{namespace}/{flowId}/{key}`

**Example Flow (YAML):**
```yaml
id: ingest-voice-note
namespace: manager
tasks:
  - id: parse-voice
    type: io.kestra.plugin.core.http.Request
    uri: "{{ trigger.body.transcription }}"
    # ... LLM processing
triggers:
  - id: voice-webhook
    type: io.kestra.plugin.core.trigger.Webhook
    key: "secret-key-here"
```

_Source: [kestra.io/docs](https://kestra.io/docs/workflow-components/triggers/webhook-trigger) (2025)_

### Kestra HTTP Request Task (For Web Push)

Kestra can make outbound HTTP requests using `io.kestra.plugin.core.http.Request`.

**Use Case:** Kestra flow completes scheduling → Sends HTTP POST to Vercel API Route `/api/send-notification` → Vercel uses `web-push` to notify user.

**Example Flow (YAML):**
```yaml
id: send-push-notification
namespace: manager
tasks:
  - id: notify-via-webpush
    type: io.kestra.plugin.core.http.Request
    uri: "https://your-app.vercel.app/api/send-notification"
    method: POST
    body: |
      {
        "userId": "{{ vars.userId }}",
        "title": "Schedule Updated",
        "body": "I moved Gym to Saturday. Confirm?"
      }
```

_Source: [kestra.io/plugins/core/tasks/io.kestra.plugin.core.http.Request](https://kestra.io/plugins/plugin-core/tasks/io.kestra.plugin.core.http.request) (2025)_

### Kestra Telegram Plugin (Built-in!)

Kestra has a **native Telegram plugin** (`io.kestra.plugin.notifications.telegram.TelegramSend`).

**Use Case:** Kestra flow completes scheduling → Sends Telegram message directly with inline buttons.

**Example Flow (YAML):**
```yaml
id: send-telegram-notification
namespace: manager
tasks:
  - id: notify-via-telegram
    type: io.kestra.plugin.notifications.telegram.TelegramSend
    token: "{{ secret('TELEGRAM_BOT_TOKEN') }}"
    chatId: "{{ vars.telegramChatId }}"
    message: "🚀 *Schedule Updated!*\nI moved Gym to Saturday. Confirm?"
    parseMode: MarkdownV2
```

_Source: [kestra.io/plugins/plugin-notifications/tasks/io.kestra.plugin.notifications.telegram.telegramsend](https://kestra.io/plugins/plugin-notifications/tasks/io.kestra.plugin.notifications.telegram.telegramsend) (2025)_

### Complete Multi-Channel Notification Pattern

Kestra can trigger **both** Web Push and Telegram in parallel from a single flow:

```yaml
id: parallel-notification
namespace: manager
tasks:
  - id: notify-all-channels
    type: io.kestra.plugin.core.flow.Parallel
    tasks:
      - id: web-push
        type: io.kestra.plugin.core.http.Request
        uri: "https://your-app.vercel.app/api/send-notification"
        method: POST
        body: "{{ vars.notificationPayload }}"
      - id: telegram
        type: io.kestra.plugin.notifications.telegram.TelegramSend
        token: "{{ secret('TELEGRAM_BOT_TOKEN') }}"
        chatId: "{{ vars.telegramChatId }}"
        message: "{{ vars.telegramMessage }}"
```

**This achieves the user-defined multi-channel strategy:**
*   Web Push → Android (with buttons) / iOS (tap-to-open)
*   Telegram → Universal fallback with full button support

---

## Architectural Patterns: Service Worker for "Invisible UI"

### Service Worker Lifecycle

The Service Worker has a specific lifecycle that governs when it can handle events:

```
Register → Install → Activate → Idle → Terminate (on inactivity)
                        ↓
              Wakes on 'push' or 'notificationclick' event
```

| Event | When It Fires | What To Do |
|---|---|---|
| `install` | Once, when SW is first registered | Pre-cache critical assets |
| `activate` | After install, when SW takes control | Clear old caches |
| `push` | When backend sends a push message | Display the notification |
| `notificationclick` | When user clicks notification or action button | Route to response handler/API |

_Source: [web.dev/learn/pwa/service-workers](https://web.dev/learn/pwa/service-workers) (2025), [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers) (2025)_

### Next.js + App Router Architecture

**Recommended PWA Structure for Next.js 14+:**

```
/app
  /manifest.ts          # Web App Manifest (built-in support)
  /api
    /send-notification  # API Route: receives from Kestra, calls web-push
    /subscribe          # API Route: stores user PushSubscription
/public
  /sw.js                # Service Worker file (manual or via next-pwa)
  /icons                # PWA icons
/lib
  /push.ts              # web-push helper functions
```

**Key Libraries for MVP:**
*   `next-pwa` - Simplifies SW registration and precaching. Compatible with App Router.
*   `web-push` - Backend library for sending push messages with VAPID.

_Source: [nextjs.org/docs/app/building-your-application/configuring/progressive-web-apps](https://nextjs.org/docs/app/building-your-application/configuring/progressive-web-apps) (2025)_

### Service Worker: Push Event Handler

When Kestra sends a notification, the SW receives a `push` event:

```javascript
// public/sw.js
self.addEventListener('push', (event) => {
  const data = event.data.json();
  
  const options = {
    body: data.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    // ACTION BUTTONS (Android/Desktop only)
    actions: [
      { action: 'confirm', title: '✅ Yes' },
      { action: 'reschedule', title: '📅 Later' }
    ],
    data: { url: data.url, taskId: data.taskId }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});
```

_Source: [web.dev/push-notifications](https://web.dev/push-notifications) (2025)_

### Service Worker: Notification Click Handler

Handle user interaction with the notification or action buttons:

```javascript
// public/sw.js
self.addEventListener('notificationclick', (event) => {
  const action = event.action; // 'confirm', 'reschedule', or '' (body click)
  const taskId = event.notification.data.taskId;

  event.notification.close();

  if (action === 'confirm') {
    // Send confirmation to backend API (Silent, no window open)
    event.waitUntil(
      fetch('/api/task/confirm', {
        method: 'POST',
        body: JSON.stringify({ taskId, response: 'confirm' }),
        headers: { 'Content-Type': 'application/json' }
      })
    );
  } else if (action === 'reschedule') {
    // Open PWA to reschedule page
    event.waitUntil(
      clients.openWindow(`/task/${taskId}/reschedule`)
    );
  } else {
    // Default: Open PWA to task view (for iOS tap-to-open)
    event.waitUntil(
      clients.openWindow(event.notification.data.url || '/')
    );
  }
});
```

**Key Point for "Invisible UI":**
*   `fetch()` inside `notificationclick` allows **silent background actions** without opening the app.
*   This is the "Reply Y to confirm" behavior we discussed!

_Source: [MDN NotificationEvent.action](https://developer.mozilla.org/en-US/docs/Web/API/NotificationEvent/action) (2025)_

### Vercel API Route: Send Notification

The API Route that Kestra calls to trigger Web Push:

```typescript
// app/api/send-notification/route.ts
import webpush from 'web-push';

webpush.setVapidDetails(
  'mailto:you@example.com',
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function POST(request: Request) {
  const { userId, title, body, url, taskId } = await request.json();
  
  // Fetch user's PushSubscription from database
  const subscription = await getSubscription(userId);
  
  await webpush.sendNotification(
    subscription,
    JSON.stringify({ title, body, url, taskId })
  );
  
  return Response.json({ success: true });
}
```

_Source: [web-push npm](https://www.npmjs.com/package/web-push) (2025)_

---

## Implementation Roadmap: Hackathon MVP

### Phase 1: Foundation (Day 1 - 4 hours)

| Task | Details |
|---|---|
| **1. Initialize Next.js 15+** | `npx create-next-app@latest --typescript --tailwind --app` |
| **2. Add PWA Dependencies** | `npm install next-pwa web-push` |
| **3. Create `manifest.ts`** | Name, icons, `display: "standalone"`, theme color |
| **4. Generate VAPID Keys** | `npx web-push generate-vapid-keys` → `.env.local` |
| **5. Deploy to Vercel** | Connect GitHub repo, set environment variables |

**Verification:** `npm run build` succeeds, Lighthouse PWA audit passes.

_Source: [nextjs.org/docs/app/building-your-application/configuring/progressive-web-apps](https://nextjs.org/docs/app/building-your-application/configuring/progressive-web-apps) (2025)_

---

### Phase 2: Notification System (Day 1-2 - 6 hours)

| Task | Details |
|---|---|
| **1. Create `public/sw.js`** | `push` + `notificationclick` handlers (code from Architectural Patterns) |
| **2. Create `/api/subscribe` Route** | Store user `PushSubscription` in database |
| **3. Create `/api/send-notification` Route** | Receive from Kestra, call `web-push.sendNotification()` |
| **4. Client-Side Permission Flow** | Request permission → Subscribe → Send to backend |
| **5. Test End-to-End** | Use Postman/curl to call `/api/send-notification` |

**Verification:** Notification appears on Android/Desktop. iOS shows tap-to-open.

---

### Phase 3: Kestra Integration (Day 2 - 4 hours)

| Task | Details |
|---|---|
| **1. Create Kestra Flow** | `parallel-notification` flow (YAML from Integration Patterns) |
| **2. Configure Telegram Bot** | Create bot via @BotFather, get token, add to Kestra secrets |
| **3. Test Multi-Channel Trigger** | Kestra sends to Web Push AND Telegram simultaneously |
| **4. Webhook for Ingestion** | Create Kestra webhook trigger for voice/text input |

**Verification:** Kestra triggers both notification channels on schedule.

---

### Phase 4: Dashboard UI (Day 3 - 8 hours)

| Task | Details |
|---|---|
| **1. Timeline Day View** | Horizontal timeline with draggable task blocks |
| **2. Kanban Project View** | Columns: Backlog, Today, In Progress, Done |
| **3. Task Quick-Response Page** | `/task/[id]/respond` for iOS users (from notification tap) |
| **4. Telegram Link UI** | Settings page to link Telegram account |

**Verification:** UI renders correctly, task interactions work.

---

### Development Workflow (CI/CD)

```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm ci
      - run: npm run lint
      - run: npm run build
```

**Vercel Auto-Deploys:**
*   `main` branch → Production
*   Pull Requests → Preview URLs

_Source: [vercel.com/docs/deployments](https://vercel.com/docs/deployments) (2025)_

---

### Risk Assessment

| Risk | Mitigation |
|---|---|
| **iOS notification buttons not working** | Already mitigated: Tap-to-open + Telegram fallback |
| **VAPID key exposure** | Store in Vercel env vars, never commit to Git |
| **Push subscription expiry** | Implement re-subscription logic on app load |
| **Kestra self-hosting complexity** | Use Kestra Cloud free tier for hackathon |

---

### Success Metrics for Hackathon Demo

| Metric | Target | How to Demonstrate |
|---|---|---|
| **Demo Clarity** | < 60 seconds to understand value | Live demo: Show notification → tap button → task confirmed |
| **End-to-End Flow** | Working happy path | Voice input → Kestra → LLM → Notification → Confirm |
| **Multi-Channel** | Both Web Push + Telegram | Show both notifications simultaneously |
| **"Invisible UI"** | Minimal app opens required | Count: user opens app 0 times to confirm 3 tasks |

---

## Technical Research Summary

This research demonstrates that the **"Invisible UI"** concept is fully implementable with 2025 web standards:

**✅ Technology Stack:**
*   Next.js 15 + App Router + `next-pwa`
*   `web-push` library with VAPID (no third-party service)
*   Vercel for hosting (auto-HTTPS, Serverless, Edge CDN)

**✅ Platform-Adaptive Strategy:**
*   Android/Desktop: Rich notifications with action buttons
*   iOS: Simple tap-to-open (platform limitation)
*   Telegram: Universal fallback with full button support

**✅ Kestra Integration:**
*   Native Telegram plugin (`TelegramSend`)
*   HTTP Request task for Web Push via Vercel API
*   Parallel notification pattern for multi-channel

**✅ Hackathon Alignment:**
*   All technologies are **open-source** (100% FOSS purity)
*   Mandatory "Sponsor Stones" integrated (Kestra, Together AI, Vercel)

---

_Research Completed: 2025-12-07_
_Research Document:_ `technical-pwa-push-notifications-research-2025-12-07.md`
