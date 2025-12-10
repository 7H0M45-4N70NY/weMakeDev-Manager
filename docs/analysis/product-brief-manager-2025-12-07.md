---
stepsCompleted: [1, 2, 3, 4, 5]
inputDocuments: ['d:\Thomas\PERSONAL\Projects\webuilddev\project_idea.md']
workflowType: 'product-brief'
lastStep: 5
project_name: 'manager'
user_name: 'Thoma'
date: '2025-12-07'
---
# Product Brief: manager

**Date:** 2025-12-07
**Author:** Thoma

---

<!-- Content will be appended sequentially through collaborative workflow steps -->

## Executive Summary

An AI-powered Personal Chief-of-Staff that continuously organizes your tasks, time, and priorit*workflow-statusies. It turns chaos (ideas, goals, emails) into a simple, realistic plan for today and this week, proactively rescheduling tasks to prevent overwhelm. It is designed for knowledge workers who need execution support, not just another list.

---

## Core Vision

### Problem Statement

Modern knowledge workers face an overwhelming number of inputs—emails, messages, ideas, and tasks—combined with weak execution systems. Todo lists grow forever, and calendars don't reflect actual work. This leads to decision fatigue, where every day starts with "What should I do first?", causing important but non-urgent work to be neglected.

### Problem Impact

Users feel busy but ineffective. Long-term goals and deep work suffer as they drown in daily noise. The default state becomes one of burnout, confusion, and guilt over missed tasks, leading to further avoidance.

### Why Existing Solutions Fall Short

Traditional tools like Notion, Todoist, or Google Calendar require the user to manually manage the system. They are passive containers for tasks. Users often fail to maintain them because the effort to organize the work becomes a job in itself. They lack the active intelligence to reschedule missed tasks or balance daily capacity.

### Proposed Solution

A "Personal Chief-of-Staff" application that:
1.  **Ingests** intentions via Voice, Text, and direct Email integration.
2.  **Structures** chaos into projects and tasks.
3.  **Schedules** realistically based on capacity and energy.
4.  **Negotiates** tradeoffs when overloaded.
5.  **Reflects** insights about your habits and reliability.
6.  **Delivers** value through a "Push-First" interaction model (notifications/popups) backed by a rich PWA for deep planning.

### Key Differentiators

-   **Active Negotiation**: The AI acts as a gatekeeper, forcing you to acknowledge tradeoffs before adding more work.
-   **Energy-Aware Scheduling**: Distinguishes between "Deep Work" (high energy) and "Shallow Work" (low energy) to prevent cognitive fatigue.
-   **Context-Aware Modes**: Includes **Sustainability Mode** (default), **Triage Mode** (overload), and **Sprint Mode** (deadlines).
-   **Hybrid "Invisible" UI**: Primary interaction via smart notifications and popups for quick decisions ("Reply Y to accept"), backed by a comprehensive Progressive Web App (PWA) for visual planning.
-   **Intelligent Email Triage**: Direct integration that categorizes, tags, and extracts tasks from emails to prevent inbox explosion.
-   **Reflective Insights**: The system acts as a mirror, identifying patterns in your energy and reliability to help you improve self-knowledge.

## Target Users

### Primary User: The Overloaded Knowledge Worker
*   **Who:** Students, Software Engineers, Early-stage Founders.
*   **Psychographics:** High ambition, low structure. Loves the *idea* of Notion but hates the *maintenance*.
*   **The "Notion Paradox":** They spend hours building "perfect systems" that they abandon because of manual data entry fatigue.
*   **Goal:** A "Self-Driving" system. They want the visual clarity of a dashboard but want the AI to do the logistics.

### User Journey (The Hybrid Flow)

1.  **Morning (Smart Wake-Up):**
    *   User wakes up and picks up phone.
    *   **Context Detection:** App detects "First Unlock" (user is awake).
    *   **Actionable Notification:** *"Good morning! I moved 'Gym' to Saturday to fit your Deadline. Confirm?"*
    *   User taps **"Confirm"** from the lock screen.

2.  **Deep Work (The "Notion on Steroids" Dashboard):**
    *   User works from the **Web Dashboard**. It visualizes the day as a timeline.
    *   User drags a task; the AI instantly recalculates: *"That conflicts with your meeting. Shall I move the meeting?"*

3.  **The Completion Check (Closing the Loop):**
    *   Time block for "API Design" ends.
    *   **Notification:** *"Time's up for 'API Design'. Did you finish?"*
    *   **User Action:** Taps **"Yes"** (Done) or **"No"** (Reschedule).

4.  **Evening (Reflection):**
    *   User checks the **Weekly View**. System prompts: *"You ignored 'Learning' all week. Schedule a 2-hour block Sunday?"*

## Success Metrics

### User Success
*   **Zero-Friction Capture:** > 80% of tasks entered via Voice/Email/Forwarding (vs Manual Typing).
*   **Plan Adherence:** > 70% of daily scheduled tasks are completed (indicates realistic planning).
*   **Reschedule Acceptance:** > 90% of AI-proposed schedule changes are accepted without edit.

### Business Objectives (Hackathon & Beyond)
*   **Hackathon Win:** Deliver a fully functional "Invisible UI" demo (Voice -> Plan -> Notification) within 1 week.
*   **Open Source Health:** > 5 meaningful PRs/Issues from non-maintainers within 1 month (Community Engagement).
*   **Retention:** > 40% Day-30 retention for initial beta users.
*   **Open Source Purity:** 100% dependency on FOSS tools. Zero paid SaaS dependencies (ensuring accessibility for all developers).

## MVP Scope

### Core Features (Powered by "Sponsor Stones")
1.  **Kestra Orchestration Engine:** The central nervous system.
    *   *Flow 1:* **Ingestion Loop** (Webhook -> Kestra -> LLM Structure -> DB).
    *   *Flow 2:* **Planning Loop** (Daily Trigger -> Kestra -> LLM Schedule -> Notification).
2.  **Intelligence Layer (Together AI/Oumi):**
    *   Uses **Llama 3.1 70B** (via Together AI) for complex reasoning (Scheduling).
    *   Uses **Llama 3.1 8B** for fast tasks (Categorization).
3.  **Command Center PWA (Vercel):**
    *   Next.js App deployed on Vercel.
    *   **Views:** Timeline Day View, Kanban Project View.
    *   **Invisible UI:** Service Worker for Push Notifications.

### Out of Scope
*   Native Mobile Apps (Vercel PWA is sufficient).
*   Complex Local LLM hosting (Together AI is faster/easier for Hackathon).
