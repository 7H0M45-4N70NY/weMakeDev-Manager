---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
inputDocuments:
  - 'd:\Thomas\PERSONAL\Projects\webuilddev\docs\analysis\product-brief-manager-2025-12-07.md'
  - 'd:\Thomas\PERSONAL\Projects\webuilddev\docs\analysis\research\technical-pwa-push-notifications-research-2025-12-07.md'
  - 'd:\Thomas\PERSONAL\Projects\webuilddev\project_idea.md'
workflowType: 'prd'
lastStep: 10
project_name: 'manager'
user_name: 'Thoma'
date: '2025-12-07'
---

# Product Requirements Document - manager

**Author:** Thoma
**Date:** 2025-12-07

---

## Executive Summary

> **Your only job is execution. The AI handles everything else.**

**Manager** is an AI-powered Personal Chief-of-Staff that continuously organizes your tasks, time, and priorities. It transforms chaos (ideas, goals, emails, projects) into a simple, realistic plan for today and this week, while proactively rescheduling tasks to prevent overwhelm.

Built for knowledge workers caught in the **"Notion Paradox"** — spending hours building perfect systems they abandon because the maintenance itself becomes work — Manager flips the paradigm. Where traditional tools are *passive containers for tasks*, Manager is an *active negotiator of your time*.

### What Makes This Special

| Differentiator | Description |
|----------------|-------------|
| **Active Negotiation** | AI acts as a gatekeeper, forcing tradeoff acknowledgment before accepting new commitments |
| **Energy-Aware Scheduling** | Distinguishes Deep Work from Shallow Work — never schedules complex coding after a 3-hour meeting |
| **Context Modes** | Sustainability Mode (default), Triage Mode (overload), Sprint Mode (deadlines) |
| **Proactive Morning Check** | Detects you're awake, adjusts your plan overnight, and proposes changes before you ask |
| **Hybrid "Invisible UI"** | Smart notifications for quick decisions + rich PWA as the power mode for visual planning |
| **Event-Driven Rescheduling** | Reacts to missed tasks automatically — no manual dragging dates |
| **Open-Source Compatible** | Kestra orchestration + Llama models — no vendor lock-in |

### Platform Adaptation

- **Android/Desktop**: Rich notifications with Yes/No action buttons
- **iOS**: Tap-to-open with quick-response page (platform limitation addressed)
- **Telegram Bot**: Universal fallback with full button support

## Project Classification

| Attribute | Value |
|-----------|-------|
| **Technical Type** | Web Application (PWA) |
| **Domain** | AI-Powered Productivity |
| **Complexity** | Medium |
| **Orchestration** | Kestra workflow engine as central brain |

The system leverages:
- **Kestra** for workflow orchestration (ingestion loops, planning loops, event-driven reactions)
- **Together AI / Llama** for intelligence layer (70B for complex reasoning, 8B for fast tasks)
- **Next.js + Vercel** for PWA deployment with push notifications
- **Telegram Bot** as universal interaction fallback

---

## Success Criteria

### User Success

**"Aha!" Moments (Progressive Discovery):**
1. **Morning Wake-Up** — First notification with overnight-adjusted plan
2. **Auto-Reschedule** — First missed task automatically rescheduled without guilt
3. **Weekly Clarity** — First weekly summary that actually makes sense

**"This Was Worth It" Outcomes:**
- "I finally finished my side project"
- "I haven't felt overwhelmed in 2 weeks"
- "I actually know where my time goes now"

**Emotional Success (The Full Spectrum):**

| Emotion | Trigger |
|---------|---------|
| **Calm** | No more "what should I do first?" paralysis |
| **Control** | Active negotiation before accepting new commitments |
| **Momentum** | Visible progress on long-term projects week over week |
| **Relief** | Missed tasks handled automatically, no guilt spiral |

**Measurable User Metrics:**

| Metric | Target | Rationale |
|--------|--------|-----------|
| Zero-Friction Capture | >80% tasks via Voice/Email/Forward | Minimal manual typing |
| Plan Adherence | >70% daily tasks completed | Realistic scheduling |
| AI Trust | >90% schedule changes accepted | Intelligent recommendations |

---

### Business Success

**Hackathon Phase (Week 1):**

| Metric | Target | Demonstration |
|--------|--------|---------------|
| **Demo Clarity** | <60 seconds to understand value | Live: Notification → Tap → Confirmed |
| **End-to-End Flow** | Working happy path | Voice → Kestra → LLM → Notification |
| **Multi-Channel** | Both Web Push + Telegram | Simultaneous notifications |
| **"Invisible UI" Proof** | 0 app opens for 3 confirmations | Count interactions without opening PWA |
| **FOSS Purity** | 100% | Zero paid SaaS dependencies |

**Growth Phase (3 Months Post-Hackathon):**

| Metric | Target |
|--------|--------|
| Active Users | 500 |
| Daily Active Users | 100+ |
| Day-30 Retention | >40% |
| Return Frequency | 50% users active 3+ days/week |
| Task Completion Rate | >70% of scheduled tasks |

**Open-Source Health (3 Months):**

| Metric | Target | Signal |
|--------|--------|--------|
| GitHub Stars | 300 | Visibility / interest |
| Meaningful PRs/Issues | >5 from non-maintainers | Real community contribution |
| Forks with modifications | 20 | Adoption for personal use |
| Discord/Telegram Members | 200 | Community engagement |

**Revenue Model:**
- Phase 1: $0 (pure FOSS, accessibility-first)
- Phase 2: Open to GitHub Sponsors / Open Collective donations

---

### Technical Success

| Metric | Target | Rationale |
|--------|--------|-----------|
| Notification Delivery | >99% within 30 seconds | Real-time experience |
| PWA Lighthouse Score | >90 (Performance, PWA) | Quality baseline |
| Service Worker Uptime | >99.5% | Reliable background processing |
| API Response Time | <500ms for scheduling operations | Responsive feel |
| Build + Deploy | <5 minutes | Fast iteration |

---

## Product Scope

### MVP - Minimum Viable Product (Hackathon Week)

**Core Flows:**
1. **Ingestion Loop** — Voice/Text → Kestra → LLM structuring → Database
2. **Planning Loop** — Daily trigger → Kestra → LLM scheduling → Notification
3. **Response Loop** — Notification action → Backend confirmation → State update

**User-Facing Features:**
- [ ] Voice/text task capture
- [ ] Smart notification with Yes/No actions (Android/Desktop)
- [ ] Tap-to-open quick response (iOS fallback)
- [ ] Telegram bot as universal fallback
- [ ] Basic PWA dashboard (Today view)

**Technical Foundation:**
- [ ] Next.js 15 + PWA setup on Vercel
- [ ] Service Worker with push/notificationclick handlers
- [ ] web-push + VAPID authentication
- [ ] Kestra flows for ingestion + planning
- [ ] Together AI integration (Llama 70B/8B)

### Growth Features (Post-MVP)

- [ ] Weekly review flow with insights
- [ ] Energy-aware scheduling (Deep Work vs Shallow Work)
- [ ] Context Modes (Sustainability / Triage / Sprint)
- [ ] Timeline Day View (draggable blocks)
- [ ] Kanban Project View
- [ ] Google Calendar integration (read events)
- [ ] Email task extraction

### Vision (Future)

- [ ] Full calendar sync (bi-directional)
- [ ] Gmail integration (action items from emails)
- [ ] Team/shared projects
- [ ] Mobile-native apps (if PWA insufficient)
- [ ] Self-hosted Kestra option
- [ ] Local LLM support (privacy mode)

---

## User Journeys

### Journey 1: Raj Patel - The Morning Rescue *(Primary User - Happy Path)*

Raj is a software engineer at a growing startup. He's juggling sprint work, learning Kubernetes for a promotion, and trying to maintain a workout routine. Every morning, he wakes up already anxious — mentally sorting through what didn't get done yesterday, what meetings he has, and whether he'll ever finish that side project.

**Opening Scene:**
Raj wakes up at 7:15 AM and reaches for his phone. Before he can even open his todo app, a notification catches his eye: *"Good morning, Raj! 🌅 I moved 'K8s Chapter 5' to Saturday to fit today's deadline. Your focus today: API refactor + Code review. Confirm?"*

**Rising Action:**
He taps "✅ Yes" directly from the lock screen — no app opened. In the shower, he realizes he doesn't need to mentally plan his day. It's already sorted. By 9 AM, he's in flow on the API refactor, not context-switching between planning and doing.

**Climax:**
At 11:30 AM, his time block for "API refactor" ends. A notification appears: *"Time's up for API refactor. Did you finish?"* He taps "No" — and instantly gets: *"Got it! I've moved it to 4 PM after your meeting. Your next focus: Code review for 45min."*

**Resolution:**
By evening, Raj has completed 4 of 5 scheduled tasks — his best day in weeks. The system handled the missed task automatically. He didn't feel guilty; he felt *supported*. For the first time, he thinks: "This is what having a Chief-of-Staff must feel like."

> **Requirements Revealed:** Morning notification, lock-screen actions, completion check, auto-rescheduling, daily focus list

---

### Journey 2: Priya Sharma - Digging Out of Chaos *(Primary User - Edge Case: Overload)*

Priya is an early-stage founder who just came back from a week of investor meetings. Her inbox has 200+ emails. She has 12 overdue tasks. Her calendar says she has 6 hours of meetings today. She's overwhelmed before breakfast.

**Opening Scene:**
Priya opens Manager expecting her usual morning notification. Instead, she sees: *"🚨 Triage Mode activated. You have 12 overdue tasks and 6 hours of meetings today. Let's negotiate."*

**Rising Action:**
The system presents her with a prioritized list: *"These 3 tasks have hard deadlines this week. The rest can wait. Shall I move non-urgent tasks to the weekend and clear today for just: Investor follow-up + Pitch deck review?"*

She taps "Yes, clear the deck" — and watches 9 tasks automatically redistribute across the week, weighted by deadline and importance.

**Climax:**
Mid-week, she realizes she hasn't thought about "what should I do next" in 3 days. The system has been feeding her one task at a time, checking completion, and adjusting. When she finally has an empty evening, a notification says: *"You've been in Triage mode for 4 days. Tomorrow looks lighter — switch to Sustainability Mode?"*

**Resolution:**
Priya taps "Yes" and feels something she hasn't felt in months: **control**. She didn't organize anything. She just said yes or no. The AI handled the rest.

> **Requirements Revealed:** Triage Mode detection, bulk rescheduling, mode switching, overdue task handling, capacity-aware planning

---

### Journey 3: Aisha Hassan - First Day with Manager *(New User - Onboarding)*

Aisha is a CS student who saw Manager win a hackathon. She's curious but skeptical — she's tried 5 productivity apps this year and abandoned all of them. She downloads the PWA and opens it for the first time.

**Opening Scene:**
The app greets her: *"Hey! I'm Manager, your AI Chief-of-Staff. Let's get you set up in 2 minutes. First: Allow notifications so I can remind you without you opening the app."*

She grants notification permission. The onboarding continues: *"Now, tell me about your week. What do you want to get done?"*

**Rising Action:**
Aisha types: "Finish ML assignment by Friday, study for databases quiz, and maybe go to the gym twice." The AI responds: *"Got it! Here's what I heard: 3 goals, 2 hard deadlines. I'll schedule your ML work across 3 sessions and remind you about gym on low-meeting days. Sound good?"*

She's surprised — it understood her vague input and made it concrete.

**Climax:**
The next morning, she gets her first notification: *"Good morning, Aisha! Today's focus: ML Assignment Part 1 (2 hours). I blocked your afternoon for it. Ready?"*

She taps "Yes" and for the first time, doesn't spend 20 minutes figuring out what to work on.

**Resolution:**
By Friday, she's submitted her ML assignment on time and went to the gym once. The system congratulates her: *"You completed 80% of your planned tasks this week. That's better than most! 🎉"* Aisha thinks: "Okay, this one might actually stick."

> **Requirements Revealed:** Onboarding flow, permission requests, natural language task capture, goal extraction, first-week encouragement

---

### Journey 4: Marcus Chen - The Telegram Power User *(API Consumer - Telegram Bot)*

Marcus is a freelance developer who lives in Telegram. He's part of 30 groups, manages clients via DMs, and hates switching apps. He heard Manager has a Telegram bot and decides to try it.

**Opening Scene:**
Marcus links his Telegram account from Manager's settings page. The bot messages him: *"Hey Marcus! I'm Manager Bot 🤖. Send me tasks anytime with /add. I'll also send you notifications here instead of push."*

**Rising Action:**
During a client call, Marcus thinks of something he needs to do. Without leaving Telegram, he types: `/add Follow up with client about API specs by Thursday`

The bot responds: *"✅ Added: 'Follow up with client about API specs' | Deadline: Thursday | Category: Work. Want me to remind you Wednesday evening?"*

He taps "Yes" inline — no app switch, no context loss.

**Climax:**
Wednesday 6 PM, while scrolling through Telegram groups, a message appears from Manager Bot: *"Hey! Tomorrow is your 'Follow up with client' deadline. Should I schedule 30 min tonight to draft the email?"*

Marcus taps the inline button "Schedule now" and keeps scrolling. The task is handled.

**Resolution:**
At the end of the week, Marcus realizes he added 8 tasks via Telegram and completed 7 without ever opening the PWA. He tells his developer friends: "This is the first productivity tool that works WHERE I already am."

> **Requirements Revealed:** Telegram bot integration, /add command, inline buttons, deadline reminders, cross-platform sync

---

### Journey 5: The Solo Founder Debugging at Midnight *(Support/Troubleshooting)*

It's 11 PM. Raj (from Journey 1) didn't get his morning notification today. He's worried — did his tasks get lost? Is the system broken?

**Opening Scene:**
Raj opens the PWA and navigates to Settings → Notification Status. He sees: *"Last notification sent: Yesterday 7:15 AM. Today: ❌ Push delivery failed."*

**Rising Action:**
He taps "Troubleshoot" and sees a checklist:
- ✅ Notification permission: Granted
- ✅ Service Worker: Active
- ❌ Push subscription: Expired (browser cleared data)

The system says: *"Your push subscription expired. This happens if you clear browser data. Tap to resubscribe."*

**Climax:**
He taps "Resubscribe" — a browser prompt appears, he allows notifications again, and the system confirms: *"✅ Subscribed! I'll resume notifications tomorrow morning."*

**Resolution:**
Raj closes the app relieved. He didn't need to email support or file a bug. The system helped him fix it himself in 60 seconds.

> **Requirements Revealed:** Notification status page, troubleshooting wizard, push resubscription flow, self-service debugging

---

### Journey 6: Admin Dashboard — Monitoring the System *(Admin/Ops)*

*Note: For MVP, this is simplified. Post-MVP, a full admin persona would be developed.*

**Opening Scene:**
The solo developer (Thoma) wants to see if the Kestra flows are running correctly and how many users are active.

**Rising Action:**
You open the Kestra dashboard (self-hosted or cloud) and see:
- Ingestion Loop: 124 executions today ✅
- Planning Loop: 45 executions (daily triggers) ✅
- Failed executions: 2 (notification delivery timeout)

**Climax:**
You click on a failed execution and see the error: "Web push delivery failed — subscription endpoint returned 410 Gone."

You realize: the user's subscription expired. The system is working; the user needs to resubscribe.

**Resolution:**
You add a TODO: "Add automatic resubscription prompt when push fails." The observability gave you the insight you needed.

> **Requirements Revealed:** Kestra observability, execution logs, failure visibility, ops-friendly architecture

---

### Journey Requirements Summary

| Journey | Key Capabilities Required |
|---------|---------------------------|
| **Raj (Happy Path)** | Morning notification, lock-screen actions, completion check, auto-rescheduling |
| **Priya (Overload)** | Triage Mode, bulk rescheduling, mode switching, capacity planning |
| **Aisha (Onboarding)** | Onboarding flow, NL task capture, goal extraction, first-week engagement |
| **Marcus (Telegram)** | Telegram bot, /add command, inline buttons, cross-platform sync |
| **Troubleshooting** | Notification status, troubleshooting wizard, self-service debugging |
| **Admin/Ops** | Kestra observability, execution logs, failure visibility |

---

## Domain-Specific Requirements

### AI-Powered Productivity Domain Overview

Manager operates in the AI-powered personal productivity domain. While not heavily regulated like healthcare or fintech, this domain requires careful attention to user trust, data privacy, and ethical AI practices.

---

### Data Privacy & Ownership

| Requirement | Specification |
|-------------|---------------|
| **Storage** | Supabase (or similar managed database) |
| **Data Export** | Users can export ALL their data (JSON, ICS, Markdown) |
| **Account Deletion** | Users can delete accounts; application may retain anonymized data for improvement |
| **Training Data** | User data MAY be used to improve AI models — clearly disclosed in ToS |

> **Transparency Requirement:** Users must be informed during onboarding that their data may be used to improve the AI. Opt-out should be considered for future versions.

---

### AI Transparency & Trust

| Requirement | Specification |
|-------------|---------------|
| **Decision Explanations** | All AI decisions include reasoning (e.g., "Moved Gym because deadline tomorrow") |
| **Override Capability** | Users can easily reject/modify any AI-proposed change |
| **Version History** | Task states are versioned; users can undo AI actions |
| **Aggressiveness Control** | Single mode for MVP (no user-configurable AI settings) |

---

### Failure Handling & Graceful Degradation

| Scenario | Behavior |
|----------|----------|
| **LLM Unavailable** | Graceful message: "AI is taking a coffee break ☕ — make changes manually for now" |
| **AI Misinterpretation** | User can provide correction/suggestion; system learns |
| **Undo Support** | All AI actions can be undone via version history |
| **Error Visibility** | Failed operations are logged and surfaced in notification status |

---

### Data Portability

| Requirement | Specification |
|-------------|---------------|
| **Export Formats** | JSON (structured), ICS (calendar), Markdown (human-readable) |
| **API Access** | REST API for third-party integrations |
| **No Lock-in** | Users can always extract their complete data |

---

### Attention Ethics

| Principle | Implementation |
|-----------|----------------|
| **Action-Required Only** | Notifications sent ONLY when user input is needed (accept/acknowledge/decide) |
| **Positive Language** | No guilt-tripping ("You failed..."); supportive tone always |
| **Respect Boundaries** | No passive "check-in" notifications without actionable purpose |
| **Vacation Mode** | Not in MVP; consider for future (pause all notifications) |

---

### Domain Principles Summary

1. **Transparency First** — Every AI decision is explainable
2. **User in Control** — Override and undo always available
3. **Data Ownership** — Export everything, delete anytime
4. **Ethical Notifications** — Respect attention, require action
5. **Fail Gracefully** — Humor and fallbacks over error screens

---

## Innovation & Novel Patterns

### Core Innovation: The Philosophy Shift

> **"Your only job is execution. The AI handles everything else."**

Manager represents a fundamental rethinking of personal productivity software. Where traditional tools are **passive containers** for tasks, Manager is an **active Chief-of-Staff** that handles logistics on your behalf.

---

### The Paradigm Difference

| Traditional Approach | Manager Approach |
|---------------------|------------------|
| User organizes tasks | AI organizes tasks |
| User decides priorities | AI proposes priorities, user confirms |
| User notices overload | AI detects and negotiates overload |
| User reschedules missed tasks | AI auto-reschedules with explanation |
| User opens app to check | AI pushes decisions via notification |
| Productivity requires discipline | Productivity requires good systems |

---

### Why Now? (Enabling Factors)

| Factor | Significance |
|--------|--------------|
| **LLM Maturity** | Dynamic, context-aware scheduling only recently feasible with Llama 70B-class models |
| **PWA Push Notifications** | Cross-platform notification support matured in 2023-2024 |
| **Workflow Orchestration** | Kestra enables multi-agent systems without custom infrastructure |
| **FOSS AI Stack** | Together AI + Llama makes this accessible without enterprise costs |

---

### Challenged Assumptions

1. **"Users should organize their own tasks"** → The AI should handle organization
2. **"Productivity requires discipline"** → It requires intelligent systems
3. **"Todo apps help you remember"** → They often add cognitive load
4. **"Scheduling is a one-time activity"** → It's continuous negotiation

---

### Validation Approach

| What We're Testing | Success Metric |
|--------------------|----------------|
| AI scheduling is realistic | >70% task completion rate |
| AI proposals are intelligent | >90% acceptance without edit |
| System creates lasting value | >40% Day-30 retention |
| Invisible UI is preferred | <50% of interactions require app open |

---

### Risk Mitigation

| Risk | Mitigation |
|------|------------|
| AI scheduling feels "wrong" | Transparent reasoning + easy override |
| Users want manual control | Manual mode always available |
| LLM unavailable | Graceful degradation with humor |
| Over-notification fatigue | Action-required only policy |

---

### Market Context

Manager enters a market saturated with passive task managers (Todoist, Things, Notion) and time-blocking tools (Cal.com, Calendly). The differentiation is **active intelligence** — not just storing tasks, but actively managing your time on your behalf.

**Closest competitor concepts:**
- **Reclaim.ai** — Calendar-focused, not task-focused
- **Motion** — Expensive, closed-source, enterprise-oriented
- **Clockwise** — Meeting optimization, not task management

**Manager's uniqueness:** FOSS, task-first, notification-primary, Kestra-powered orchestration.

---

## Web Application Specific Requirements

### Architecture Overview

| Aspect | Specification |
|--------|---------------|
| **Type** | Progressive Web App (PWA) |
| **Architecture** | Single Page Application (SPA) |
| **Framework** | Next.js 15 |
| **Deployment** | Vercel |
| **Offline** | Service Worker with basic offline support |

---

### Browser Support Matrix

| Browser | Version | Priority |
|---------|---------|----------|
| **Chrome (Desktop)** | Latest 2 versions | Primary |
| **Chrome (Android)** | Latest 2 versions | Primary |
| **Safari (Desktop)** | Latest 2 versions | Secondary |
| **Safari (iOS)** | Latest 2 versions | Primary (notification limitations noted) |
| **Firefox (Desktop)** | Latest 2 versions | Secondary |
| **Edge (Desktop)** | Latest 2 versions | Secondary |
| **IE11** | ❌ Not supported | — |

---

### PWA Configuration

| Feature | Specification |
|---------|---------------|
| **Service Worker** | Workbox-based, push subscription management |
| **Manifest** | Full PWA manifest with icons, theme colors |
| **Install Prompt** | Enabled for A2HS (Add to Home Screen) |
| **Offline Mode** | Graceful degradation — view cached data, queue actions |
| **Push Notifications** | VAPID-authenticated, action buttons (Android/Desktop) |

---

### Performance Targets

| Metric | Target | Rationale |
|--------|--------|-----------|
| **Lighthouse Performance** | >90 | Hackathon quality bar |
| **Lighthouse PWA** | >90 | Core product feature |
| **First Contentful Paint** | <1.5s | Fast initial load |
| **Time to Interactive** | <3s | Usable quickly |
| **Bundle Size** | <200KB (gzipped) | Mobile-friendly |

---

### Responsive Design

| Breakpoint | Target Devices |
|------------|----------------|
| **Mobile** (<640px) | Phones — primary interaction via notifications |
| **Tablet** (640-1024px) | iPad — dashboard browsing |
| **Desktop** (>1024px) | Laptop — power user mode |

**Mobile-First Priority:** Notification interactions are primary; PWA dashboard is secondary.

---

### SEO Strategy

| Area | Approach |
|------|----------|
| **MVP/Hackathon** | No SEO focus — app is authenticated only |
| **Post-Launch** | Marketing landing page with proper meta tags |
| **App Routes** | `noindex` — no need to crawl authenticated content |

---

### Accessibility (WCAG 2.1 AA)

| Requirement | Implementation |
|-------------|----------------|
| **Keyboard Navigation** | All interactive elements accessible via keyboard |
| **Color Contrast** | 4.5:1 minimum for text |
| **Screen Reader** | Semantic HTML, ARIA labels where needed |
| **Focus Indicators** | Visible focus states on all interactive elements |
| **Motion** | Respect `prefers-reduced-motion` |

---

### Real-Time Considerations (Future)

| Aspect | Current | Future-Ready |
|--------|---------|--------------|
| **Notifications** | Push-based (not socket) | ✅ |
| **Collaboration** | Not supported | Architecture allows WebSocket layer |
| **Live Updates** | Polling on dashboard refresh | Can add real-time sync |

**Flag:** Architecture designed for easy real-time layer addition post-MVP.

---

## Project Scoping & Phased Development

### MVP Strategy & Philosophy

| Attribute | Specification |
|-----------|---------------|
| **MVP Approach** | Problem-Solving MVP — solve the core problem with minimal features |
| **Core Demo** | Voice/Text → Task → Morning Notification → Tap Yes → Confirmed |
| **Demo Duration** | <60 seconds to understand value |
| **Resources** | Solo developer (Thoma), 1 week hackathon |
| **Stack** | 100% FOSS — no paid dependencies |

---

### Core MVP Loops (Hackathon Week)

**Loop 1: Ingestion**
- Task input (text/voice) → Kestra flow → LLM structuring → Database

**Loop 2: Planning**
- Daily morning trigger → Kestra flow → AI scheduling → Push notification

**Loop 3: Response**
- Notification action (Yes/No) → Backend confirmation → State update

---

### MVP Feature Set (Phase 1)

**Core User Journey Supported:** Raj's Morning Rescue (Happy Path)

| Feature | Status | Notes |
|---------|--------|-------|
| Text task capture | ✅ Must-have | Core input method |
| Voice task capture | 🔄 Stretch goal | Nice for demo, can defer |
| Kestra ingestion flow | ✅ Must-have | Task processing |
| Kestra planning flow | ✅ Must-have | AI scheduling |
| Together AI integration | ✅ Must-have | Intelligence layer |
| Push notifications + actions | ✅ Must-have | The "Invisible UI" |
| Telegram bot | ✅ Must-have | iOS workaround + universal fallback |
| Basic PWA dashboard | ✅ Must-have | Today view only |
| Service Worker + VAPID | ✅ Must-have | Push infrastructure |

---

### Post-MVP Features (Phase 2: Weeks 2-3)

| Feature | Priority |
|---------|----------|
| Voice input polish | High |
| Completion check notifications | High |
| Auto-reschedule on missed tasks | High |
| Weekly review flow | Medium |
| Notification troubleshooting page | Medium |

---

### Growth Features (Phase 3: Month 1-3)

| Feature | Priority |
|---------|----------|
| Energy-aware scheduling | High |
| Context Modes (Triage/Sprint) | High |
| Timeline Day View (draggable) | Medium |
| Kanban Project View | Medium |
| Google Calendar read integration | Medium |
| Email task extraction | Low |

---

### Risk Mitigation Strategy

| Risk Type | Risk | Mitigation |
|-----------|------|------------|
| **Technical** | LLM latency affects notification timing | Use faster 8B model for scheduling, 70B for complex reasoning |
| **Technical** | iOS notification limitations | Telegram bot as parallel channel |
| **Technical** | Push subscription expiry | Self-service resubscription flow |
| **Market** | Users don't trust AI scheduling | Transparent reasoning + easy override |
| **Resource** | Solo dev, limited time | Ruthless MVP scope, defer non-essential |

---

### Scope Decisions Summary

**In MVP:**
- ✅ Core three loops (Ingestion → Planning → Response)
- ✅ Notifications as primary interaction
- ✅ Telegram as universal fallback
- ✅ Basic Today view dashboard

**Deferred to Post-MVP:**
- ❌ Weekly review insights
- ❌ Energy-aware scheduling
- ❌ Context Modes
- ❌ Advanced views (Timeline, Kanban)
- ❌ Calendar integrations

---

## Functional Requirements

### Task Management

- FR1: Users can add tasks via text input in the PWA
- FR2: Users can add tasks via voice input (stretch goal)
- FR3: Users can add tasks via Telegram bot with `/add` command
- FR4: System can extract structured task data from natural language input
- FR5: Users can view their tasks for today in the PWA dashboard
- FR6: Users can mark tasks as complete
- FR7: Users can edit task details (title, deadline, priority)
- FR8: Users can delete tasks
- FR9: System can store task version history for undo capability

### AI Scheduling & Planning

- FR10: System can generate a daily schedule based on user tasks and priorities
- FR11: System can provide reasoning for scheduling decisions
- FR12: System can detect overdue tasks and flag them for rescheduling
- FR13: System can automatically reschedule missed tasks with explanation
- FR14: Users can accept or reject AI-proposed schedule changes
- FR15: Users can override any AI scheduling decision manually
- FR16: System can distinguish between task types (implied by input)

### Push Notifications

- FR17: System can send push notifications to subscribed devices
- FR18: Notifications can include action buttons (Yes/No) on Android/Desktop
- FR19: Users can tap notifications to open quick-response page on iOS
- FR20: Users can respond to notifications without opening the PWA
- FR21: System can track notification delivery status
- FR22: Users can view notification history and status in settings

### Telegram Bot Integration

- FR23: Users can link their Telegram account to Manager
- FR24: Users can receive notifications via Telegram as alternative channel
- FR25: Users can add tasks via Telegram with inline button confirmation
- FR26: Users can respond to schedule proposals via Telegram buttons
- FR27: System can sync task state between PWA and Telegram

### User Onboarding & Account

- FR28: Users can sign up for a new account
- FR29: Users can log in to their account
- FR30: Users can grant notification permissions during onboarding
- FR31: System can guide new users through initial setup
- FR32: Users can configure their preferences (notification timing, etc.)

### Data & Privacy

- FR33: Users can export all their data (JSON, ICS, Markdown formats)
- FR34: Users can delete their account
- FR35: System can display data usage disclosure during onboarding
- FR36: Users can view their data storage status

### Troubleshooting & Self-Service

- FR37: Users can view push notification subscription status
- FR38: Users can troubleshoot notification delivery issues
- FR39: Users can resubscribe to push notifications if expired
- FR40: System can display service worker status

### Workflow Orchestration (Backend)

- FR41: System can execute ingestion flow (input → structured task)
- FR42: System can execute planning flow (tasks → scheduled plan)
- FR43: System can execute response flow (user action → state update)
- FR44: System can log flow execution status for observability
- FR45: System can handle LLM unavailability gracefully with fallback message

---

## Non-Functional Requirements

### Performance

| Requirement | Specification | Rationale |
|-------------|---------------|-----------|
| **Notification Delivery** | >99% within 30 seconds | Core "Invisible UI" experience |
| **API Response Time** | <500ms for scheduling operations | Responsive feel |
| **PWA First Contentful Paint** | <1.5s | Fast initial load |
| **Time to Interactive** | <3s | Usable quickly |
| **Bundle Size** | <200KB (gzipped) | Mobile-friendly |
| **Lighthouse Performance** | >90 | Quality baseline |
| **Lighthouse PWA** | >90 | Core product feature |

### Security

| Requirement | Specification | Rationale |
|-------------|---------------|-----------|
| **Authentication** | Secure session-based auth (Supabase Auth) | User account protection |
| **Data Encryption** | TLS in transit, encrypted at rest | Sensitive task data |
| **VAPID Authentication** | Signed push messages | Prevent notification spoofing |
| **API Authorization** | All endpoints require authentication | Protect user data |
| **Data Access** | Users can only access their own data | Multi-tenant isolation |

### Reliability

| Requirement | Specification | Rationale |
|-------------|---------------|-----------|
| **Service Worker Uptime** | >99.5% | Reliable background processing |
| **Push Subscription Renewal** | Auto-prompt on expiry detection | Prevent notification loss |
| **LLM Fallback** | Graceful degradation message | System usable without AI |
| **Kestra Flow Recovery** | Automatic retry on transient failures | Reliable orchestration |
| **Vercel Uptime** | 99.9% (platform SLA) | Infrastructure reliability |

### Scalability

| Requirement | Specification | Phase |
|-------------|---------------|-------|
| **MVP (Hackathon)** | 10-50 concurrent users | Launch |
| **Post-Hackathon** | 500 active users | 3 months |
| **Growth Target** | 100+ DAU | 3 months |
| **Kestra Flows** | Support 1000+ daily executions | Growth |
| **Database** | Supabase free tier initially, upgrade path clear | MVP → Growth |

### Accessibility

| Requirement | Specification | Standard |
|-------------|---------------|----------|
| **WCAG Level** | 2.1 AA | Public web standard |
| **Keyboard Navigation** | All interactive elements accessible | WCAG |
| **Color Contrast** | 4.5:1 minimum for text | WCAG AA |
| **Screen Reader Support** | Semantic HTML, ARIA labels | WCAG |
| **Focus Indicators** | Visible focus states | WCAG |
| **Motion** | Respect `prefers-reduced-motion` | WCAG |

### Integration

| Requirement | Specification | Integration |
|-------------|---------------|-------------|
| **Telegram Bot API** | Webhook-based, inline buttons | Bot commands |
| **Together AI** | REST API, <2s timeout | LLM inference |
| **Kestra** | REST API for flow triggers | Orchestration |
| **Web Push** | VAPID protocol, FCM/Safari fallbacks | Notifications |
| **Supabase** | PostgreSQL + Auth + Realtime | Database |

