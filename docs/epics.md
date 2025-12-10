# manager - Epic Breakdown

**Author:** Thoma
**Date:** 2025-12-09
**Project Level:** New Project
**Target Scale:** MVP (Hackathon)

---

## Overview

This document provides the complete epic and story breakdown for manager, decomposing the requirements from the [PRD](./PRD.md) into implementable stories.

**Living Document Notice:** This is the initial version. It will be updated after UX Design and Architecture workflows add interaction and technical details to stories.

The project is broken down into 5 incremental Epics, designed to deliver the "Invisible UI" experience layer by layer:

1.  **Epic 1: Project Foundation & Authentication** - Setup, DB, Auth (The "Keys")
2.  **Epic 2: Task Ingestion & Management** - CRUD, PWA UI (The "List")
3.  **Epic 3: Multi-Channel Notifications** - Push, Telegram (The "Voice")
4.  **Epic 4: AI Planning & Scheduling** - Kestra, LLM (The "Brain")
5.  **Epic 5: System Reliability & User Control** - Troubleshooting, Export (The "Trust")

---

## Functional Requirements Inventory

### Task Management
- **FR1:** Users can add tasks via text input in the PWA
- **FR2:** Users can add tasks via voice input (stretch goal)
- **FR3:** Users can add tasks via Telegram bot with `/add` command
- **FR4:** System can extract structured task data from natural language input
- **FR5:** Users can view their tasks for today in the PWA dashboard
- **FR6:** Users can mark tasks as complete
- **FR7:** Users can edit task details (title, deadline, priority)
- **FR8:** Users can delete tasks
- **FR9:** System can store task version history for undo capability

### AI Scheduling & Planning
- **FR10:** System can generate a daily schedule based on user tasks and priorities
- **FR11:** System can provide reasoning for scheduling decisions
- **FR12:** System can detect overdue tasks and flag them for rescheduling
- **FR13:** System can automatically reschedule missed tasks with explanation
- **FR14:** Users can accept or reject AI-proposed schedule changes
- **FR15:** Users can override any AI scheduling decision manually
- **FR16:** System can distinguish between task types (implied by input)

### Push Notifications
- **FR17:** System can send push notifications to subscribed devices
- **FR18:** Notifications can include action buttons (Yes/No) on Android/Desktop
- **FR19:** Users can tap notifications to open quick-response page on iOS
- **FR20:** Users can respond to notifications without opening the PWA
- **FR21:** System can track notification delivery status
- **FR22:** Users can view notification history and status in settings

### Telegram Bot Integration
- **FR23:** Users can link their Telegram account to Manager
- **FR24:** Users can receive notifications via Telegram as alternative channel
- **FR25:** Users can add tasks via Telegram with inline button confirmation
- **FR26:** Users can respond to schedule proposals via Telegram buttons
- **FR27:** System can sync task state between PWA and Telegram

### User Onboarding & Account
- **FR28:** Users can sign up for a new account
- **FR29:** Users can log in to their account
- **FR30:** Users can grant notification permissions during onboarding
- **FR31:** System can guide new users through initial setup
- **FR32:** Users can configure their preferences (notification timing, etc.)

### Data & Privacy
- **FR33:** Users can export all their data (JSON, ICS, Markdown formats)
- **FR34:** Users can delete their account
- **FR35:** System can display data usage disclosure during onboarding
- **FR36:** Users can view their data storage status

### Troubleshooting & Self-Service
- **FR37:** Users can view push notification subscription status
- **FR38:** Users can troubleshoot notification delivery issues
- **FR39:** Users can resubscribe to push notifications if expired
- **FR40:** System can display service worker status

### Workflow Orchestration (Backend)
- **FR41:** System can execute ingestion flow (input → structured task)
- **FR42:** System can execute planning flow (tasks → scheduled plan)
- **FR43:** System can execute response flow (user action → state update)
- **FR44:** System can log flow execution status for observability
- **FR45:** System can handle LLM unavailability gracefully with fallback message

---

## FR Coverage Map

{{fr_coverage_map}}

---

## Epic 1: Project Foundation & Authentication

**Goal:** Initialize the PWA, set up the Supabase database with RLS, and implement secure user authentication so that users can sign up and log in.
**Value:** Users can securely access their own private workspace.
**Technical Focus:** Next.js setup, Supabase Auth/RLS, Vercel deployment.

### Story 1.1: Project Initialization & PWA Configuration

As a Developer,
I want to initialize the Next.js project with PWA capabilities,
So that we have a solid foundation for the "Invisible UI" application.

**Acceptance Criteria:**

**Given** I have the necessary environment tools (Node.js, npm)
**When** I run the initialization command
**Then** A new Next.js 15 project is created with TypeScript and App Router
**And** The PWA manifest and Service Worker are configured
**And** The application is deployable to Vercel

**Technical Notes:**
- Run: `npx create-next-app@latest manager --typescript --app --eslint --src-dir --no-tailwind --import-alias "@/*"`
- Install `next-pwa` and configure `next.config.js`
- Create `public/manifest.json` with app icons and theme colors
- Set up `public/sw.js` placeholder (will be enhanced later)
- Configure `.eslintrc.json` with project rules

### Story 1.2: Supabase Database & Auth Setup

As a User,
I want to sign up and log in securely,
So that I can access my private task management workspace.

**Acceptance Criteria:**

**Given** I am on the Login page
**When** I enter my email and password
**Then** I am authenticated via Supabase Auth
**And** I am redirected to the Dashboard
**And** My session is persisted via secure cookies

**Technical Notes:**
- Initialize Supabase project
- Create `users` table (managed by Supabase Auth)
- Install `@supabase/supabase-js` and `@supabase/ssr`
- Implement `src/lib/supabase/client.ts` and `server.ts`
- Create `src/middleware.ts` for session management
- Enable RLS on `users` table (users can only see their own data)

### Story 1.3: Authentication UI & Protected Layout

As a User,
I want a clean login interface and a protected dashboard,
So that I can easily access the app and know my data is safe.

**Acceptance Criteria:**

**Given** I am an unauthenticated user
**When** I visit `/dashboard`
**Then** I am redirected to `/login`

**Given** I am on the Login page
**When** I submit valid credentials
**Then** I see the Dashboard layout with a logout button

**Technical Notes:**
- Create `src/app/login/page.tsx` with Email/Password form
- Create `src/app/(auth)/layout.tsx` for protected routes
- Implement `src/features/auth/AuthProvider.tsx`
- Add Logout functionality in the layout header

---

## Epic 2: Task Ingestion & Management

**Goal:** Implement the core "Ingestion Loop" allowing users to create, view, update, and delete tasks via the PWA interface and API.
**Value:** Users can capture tasks and see what needs to be done.
**Technical Focus:** API Routes, Task CRUD, PWA Dashboard, Kestra Ingestion Flow.

### Story 2.1: Task Data Model & API

As a Developer,
I want to establish the task data model and API endpoints,
So that the frontend and Kestra can manage tasks programmatically.

**Acceptance Criteria:**

**Given** The database is set up
**When** I query the `tasks` table
**Then** I can perform CRUD operations respecting RLS
**And** The `/api/tasks` endpoints handle GET, POST, PUT, DELETE requests

**Technical Notes:**
- Create `tasks` table: `id`, `user_id`, `title`, `status`, `deadline`, `priority`, `created_at`
- Enable RLS: `auth.uid() = user_id`
- Implement `src/app/api/tasks/route.ts` (GET, POST)
- Implement `src/app/api/tasks/[id]/route.ts` (PUT, DELETE)
- Use `src/lib/utils/apiResponse.ts` for consistent responses

### Story 2.2: Task Dashboard & Management UI

As a User,
I want to view and manage my daily tasks,
So that I can track my progress and add new items.

**Acceptance Criteria:**

**Given** I am on the Dashboard
**When** I view the task list
**Then** I see my tasks for today sorted by priority
**And** I can add a new task via a text input
**And** I can mark a task as complete

**Technical Notes:**
- Create `src/features/tasks/TaskProvider.tsx` for state
- Create `src/features/tasks/TaskList.tsx` and `TaskCard.tsx`
- Implement `useTaskState` hook
- Use Server Actions or API calls for data mutation
- Ensure optimistic UI updates for "Mark Complete"

### Story 2.3: Kestra Ingestion Flow

As a User,
I want my tasks to be processed by the backend orchestration,
So that raw inputs can be structured and stored automatically.

**Acceptance Criteria:**

**Given** A raw task input (e.g., "Call mom tomorrow")
**When** The ingestion flow runs
**Then** The text is parsed (mocked or simple regex for MVP)
**And** A structured task is created in the database

**Technical Notes:**
- Create `kestra/ingestion-flow.yaml`
- Define inputs: `user_id`, `raw_text`
- Task 1: Parse text (Simple script or LLM placeholder)
- Task 2: Insert into Supabase `tasks` table
- Trigger: Webhook or API call from Next.js

---

## Epic 3: Multi-Channel Notifications (Push & Telegram)

**Goal:** Establish the "Invisible UI" by implementing Web Push notifications and the Telegram bot integration for cross-platform reach.
**Value:** Users receive updates where they are (Phone/Desktop/Telegram) without opening the app.
**Technical Focus:** Service Worker, VAPID, Telegram Bot API, Webhooks.

### Story 3.1: Push Notification Infrastructure

As a Developer,
I want to implement the Web Push infrastructure,
So that the app can send notifications even when closed.

**Acceptance Criteria:**

**Given** The application is running
**When** The Service Worker is registered
**Then** It handles `push` events and displays notifications
**And** It handles `notificationclick` events to open the app or trigger actions
**And** VAPID keys are configured in the environment

**Technical Notes:**
- Generate VAPID keys (`web-push generate-vapid-keys`)
- Implement `public/sw.js` with `self.addEventListener('push', ...)`
- Implement `self.addEventListener('notificationclick', ...)`
- Create `src/lib/push/vapid.ts` for server-side sending

### Story 3.2: Notification Settings & Subscription

As a User,
I want to enable or disable notifications,
So that I can control when I am interrupted.

**Acceptance Criteria:**

**Given** I am on the Settings page
**When** I click "Enable Notifications"
**Then** The browser prompts for permission
**And** If granted, a push subscription is created and saved to the database
**And** I see a success message

**Technical Notes:**
- Create `push_subscriptions` table: `id`, `user_id`, `endpoint`, `keys`
- Implement `src/features/notifications/NotificationPrompt.tsx`
- Implement `src/app/api/notifications/route.ts` (POST to save sub)
- Handle permission denial gracefully

### Story 3.3: Telegram Bot Setup & Linking

As a User,
I want to link my Telegram account,
So that I can receive notifications and manage tasks via chat.

**Acceptance Criteria:**

**Given** I am on the Settings page
**When** I click "Link Telegram"
**Then** I am redirected to the Telegram bot
**And** When I send `/start`, my account is linked
**And** I receive a confirmation message in Telegram

**Technical Notes:**
- Create Telegram Bot via BotFather
- Implement `src/app/api/telegram/webhook/route.ts` using `grammy`
- Add `telegram_chat_id` column to `users` table
- Implement linking logic (generate unique token in app, send to bot)

---

## Epic 4: AI Planning & Scheduling Intelligence

**Goal:** Implement the "Planning Loop" where Kestra and the LLM analyze tasks to generate and propose daily schedules.
**Value:** Users get an intelligent daily plan automatically generated for them.
**Technical Focus:** Kestra Planning Flow, LLM Integration, Scheduling Logic.

### Story 4.1: Kestra Planning Flow & Daily Trigger

As a User,
I want my tasks to be analyzed every morning,
So that I start my day with a plan.

**Acceptance Criteria:**

**Given** It is 7:00 AM (or configured time)
**When** The Kestra planning flow triggers
**Then** It fetches all pending tasks for the user
**And** It prepares the data for the LLM
**And** It triggers the LLM processing task

**Technical Notes:**
- Create `kestra/planning-flow.yaml`
- Use `Schedule` trigger (Cron)
- Task 1: Query Supabase for tasks (status != 'completed')
- Task 2: Format tasks as JSON for LLM context

### Story 4.2: LLM Integration & Scheduling Logic

As a System,
I want to use an LLM to organize tasks into a schedule,
So that the user gets a realistic plan based on priorities.

**Acceptance Criteria:**

**Given** A list of tasks and user context
**When** The LLM processes the input
**Then** It returns a structured JSON schedule
**And** It prioritizes high-priority and overdue items
**And** It provides a short reasoning for the plan

**Technical Notes:**
- Integrate Together AI (Llama 3 70B or 8B)
- Create system prompt: "You are an expert Chief of Staff..."
- Define output schema: `{ schedule: [], reasoning: "" }`
- Implement retry logic for JSON parsing errors

### Story 4.3: Plan Proposal & Notification

As a User,
I want to receive the proposed plan via notification,
So that I can review and confirm it immediately.

**Acceptance Criteria:**

**Given** The LLM has generated a plan
**When** The flow completes
**Then** A push notification is sent: "Your daily plan is ready"
**And** The notification includes the summary and "Accept" action
**And** The plan is saved to the `schedules` table

**Technical Notes:**
- Create `schedules` table: `id`, `user_id`, `date`, `content`, `status`
- Kestra Task: Call `/api/notifications/send` webhook
- Payload includes `notification_type: 'daily_plan'` and action buttons

---

## Epic 5: System Reliability & User Control

**Goal:** Implement the "Response Loop", troubleshooting tools, and data export features to ensure system reliability and user trust.
**Value:** Users can trust the system, fix issues themselves, and own their data.
**Technical Focus:** Response Handling, Troubleshooting UI, Data Export API.

### Story 5.1: Response Handling Loop

As a User,
I want to respond to notifications (Yes/No),
So that the system knows if I completed a task or accepted a plan.

**Acceptance Criteria:**

**Given** I receive a notification with actions
**When** I click "Yes" or "No"
**Then** The action is sent to the backend
**And** The task status is updated (e.g., marked complete)
**And** I receive a confirmation notification (optional)

**Technical Notes:**
- Implement `src/app/api/notifications/action/route.ts`
- Handle `notificationclick` in Service Worker to POST to this endpoint
- Update `tasks` or `schedules` table based on action
- Trigger Kestra "Response Flow" if complex logic is needed

### Story 5.2: Troubleshooting & Status Page

As a User,
I want to see if my notifications are working,
So that I can fix issues if I stop receiving updates.

**Acceptance Criteria:**

**Given** I am on the Settings page
**When** I view the "Notification Status" section
**Then** I see if my browser supports push
**And** I see if I have an active subscription
**And** I can click "Test Notification" to verify delivery

**Technical Notes:**
- Check `Notification.permission` and `serviceWorker.registration`
- Check `push_subscriptions` table for current user
- Implement "Send Test" button calling `/api/notifications/send`

### Story 5.3: Data Export & Ownership

As a User,
I want to export all my data,
So that I am not locked into the platform.

**Acceptance Criteria:**

**Given** I am on the Settings page
**When** I click "Export Data"
**Then** A JSON file is downloaded containing all my tasks and schedules
**And** The file is structured and machine-readable

**Technical Notes:**
- Implement `src/app/api/export/route.ts`
- Query all tables for `user_id`
- Return `Content-Disposition: attachment; filename="manager-export.json"`

---

## FR Coverage Matrix

| FR ID | Description | Covered By |
|-------|-------------|------------|
| **FR1** | Add tasks via text | Story 2.2 |
| **FR2** | Add tasks via voice | *Deferred to Post-MVP* |
| **FR3** | Add tasks via Telegram | Story 3.3 |
| **FR4** | Extract structured data | Story 2.3 |
| **FR5** | View tasks for today | Story 2.2 |
| **FR6** | Mark tasks complete | Story 2.2 |
| **FR7** | Edit task details | Story 2.2 |
| **FR8** | Delete tasks | Story 2.2 |
| **FR9** | Task version history | *Implicit in DB design* |
| **FR10** | Generate daily schedule | Story 4.1, 4.2 |
| **FR11** | Reasoning for decisions | Story 4.2 |
| **FR12** | Detect overdue tasks | Story 4.2 |
| **FR13** | Auto-reschedule | Story 4.2 |
| **FR14** | Accept/Reject schedule | Story 4.3, 5.1 |
| **FR15** | Override decisions | Story 2.2 |
| **FR16** | Distinguish task types | Story 4.2 |
| **FR17** | Send push notifications | Story 3.1 |
| **FR18** | Action buttons | Story 3.1 |
| **FR19** | iOS tap-to-open | Story 3.1 |
| **FR20** | Respond without opening | Story 5.1 |
| **FR21** | Track delivery status | Story 3.1 |
| **FR22** | View notification history | Story 5.2 |
| **FR23** | Link Telegram account | Story 3.3 |
| **FR24** | Telegram notifications | Story 3.3 |
| **FR25** | Telegram add tasks | Story 3.3 |
| **FR26** | Telegram respond | Story 3.3 |
| **FR27** | Sync state | Story 3.3 |
| **FR28** | Sign up | Story 1.2 |
| **FR29** | Log in | Story 1.2 |
| **FR30** | Grant permissions | Story 3.2 |
| **FR31** | Guide new users | Story 1.3 |
| **FR32** | Configure preferences | Story 3.2 |
| **FR33** | Export data | Story 5.3 |
| **FR34** | Delete account | Story 5.3 (addendum) |
| **FR35** | Data usage disclosure | Story 1.2 |
| **FR36** | View storage status | Story 5.3 |
| **FR37** | View subscription status | Story 5.2 |
| **FR38** | Troubleshoot delivery | Story 5.2 |
| **FR39** | Resubscribe | Story 3.2 |
| **FR40** | Service worker status | Story 5.2 |
| **FR41** | Ingestion flow | Story 2.3 |
| **FR42** | Planning flow | Story 4.1 |
| **FR43** | Response flow | Story 5.1 |
| **FR44** | Log execution status | Story 4.1 |
| **FR45** | LLM fallback | Story 4.2 |

---

## Summary

**Total Epics:** 5
**Total Stories:** 15
**FR Coverage:** 44/45 (Voice input deferred)

The breakdown provides a clear path from "Hello World" to a fully functional "Invisible UI" Chief of Staff.
- **Phase 1 (Epics 1-2):** Builds the core PWA and Task Management (The "Body").
- **Phase 2 (Epic 3):** Adds the communication layer (The "Voice").
- **Phase 3 (Epic 4):** Adds the intelligence layer (The "Brain").
- **Phase 4 (Epic 5):** Adds reliability and trust (The "Conscience").

This structure ensures that we always have a working application at the end of each Epic, with value increasing incrementally.

---

_For implementation: Use the `create-story` workflow to generate individual story implementation plans from this epic breakdown._

_This document will be updated after UX Design and Architecture workflows to incorporate interaction details and technical decisions._
