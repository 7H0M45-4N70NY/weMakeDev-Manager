# Story 2.3: Kestra Ingestion Flow

Status: Done

## Story

As a User,
I want my tasks to be processed by the backend orchestration,
So that raw inputs can be structured and stored automatically.

## Acceptance Criteria

1. **Given** A raw task input (e.g., "Call mom tomorrow")
   **When** The ingestion flow runs
   **Then** The text is parsed (mocked or simple regex for MVP)
2. **And** A structured task is created in the database

## Tasks / Subtasks

- [x] Task 1: Create Kestra Ingestion Workflow (AC: 1)
  - [x] Subtask 1.1: Create `kestra/ingestion-flow.yaml` workflow file
  - [x] Subtask 1.2: Define workflow inputs (user_id, raw_text)
  - [x] Subtask 1.3: Create task parsing step (regex-based for MVP)
  - [x] Subtask 1.4: Create database insert step
  - [x] Subtask 1.5: Add error handling and logging
- [x] Task 2: Create Webhook Endpoint (AC: 1)
  - [x] Subtask 2.1: Create `src/app/api/ingestion/webhook/route.ts`
  - [x] Subtask 2.2: Validate request body with Zod
  - [x] Subtask 2.3: Extract user_id and raw_text from request
  - [x] Subtask 2.4: Support both local parsing and Kestra workflow
- [x] Task 3: Create Task Parsing Service (AC: 1)
  - [x] Subtask 3.1: Create `src/lib/services/taskParser.ts`
  - [x] Subtask 3.2: Implement regex-based parsing for MVP
  - [x] Subtask 3.3: Extract title, deadline, priority from text
  - [x] Subtask 3.4: Add unit tests for parser (20 tests)
- [x] Task 4: Create Kestra API Client (AC: 1)
  - [x] Subtask 4.1: Create `src/lib/kestra/client.ts`
  - [x] Subtask 4.2: Implement workflow trigger function
  - [x] Subtask 4.3: Handle Kestra API responses
  - [x] Subtask 4.4: Add mock mode for development without Kestra
- [x] Task 5: Create UI Integration (AC: 1)
  - [x] Subtask 5.1: Add Quick Add button to dashboard (Ctrl+K shortcut)
  - [x] Subtask 5.2: Create modal for raw text input
  - [x] Subtask 5.3: Submit to ingestion webhook
  - [x] Subtask 5.4: Show parsing feedback (detected deadline/priority)
- [x] Task 6: Testing (AC: 1, 2)
  - [x] Subtask 6.1: Write tests for task parser (20 tests)
  - [x] Subtask 6.2: Write tests for Kestra client (9 tests)
  - [x] Subtask 6.3: Webhook tested via integration
  - [x] Subtask 6.4: Mock Kestra mode for development

## Dev Notes

### Kestra Workflow Structure

```yaml
# kestra/ingestion-flow.yaml
id: task-ingestion
namespace: manager
description: Ingestion flow for raw task inputs

inputs:
  - id: user_id
    type: STRING
    required: true
  - id: raw_text
    type: STRING
    required: true

tasks:
  - id: parse_task
    type: io.kestra.plugin.scripts.python.Script
    script: |
      import re
      import json
      
      raw_text = "{{ inputs.raw_text }}"
      
      # Simple regex parsing for MVP
      title = raw_text
      deadline = None
      priority = 0
      
      # Check for deadline keywords
      if "tomorrow" in raw_text.lower():
        deadline = "tomorrow"
      elif "today" in raw_text.lower():
        deadline = "today"
      elif "next week" in raw_text.lower():
        deadline = "next_week"
      
      # Check for priority keywords
      if "urgent" in raw_text.lower() or "asap" in raw_text.lower():
        priority = 10
      elif "important" in raw_text.lower():
        priority = 5
      
      result = {
        "title": title,
        "deadline": deadline,
        "priority": priority
      }
      
      print(json.dumps(result))
    outputs:
      - id: parsed_task
        type: JSON

  - id: create_task
    type: io.kestra.plugin.http.Request
    uri: "{{ env.SUPABASE_URL }}/rest/v1/tasks"
    method: POST
    headers:
      Authorization: "Bearer {{ env.SUPABASE_SERVICE_ROLE_KEY }}"
      Content-Type: "application/json"
      Prefer: "return=representation"
    body: |
      {
        "user_id": "{{ inputs.user_id }}",
        "title": "{{ outputs.parse_task.vars.parsed_task.title }}",
        "deadline": "{{ outputs.parse_task.vars.parsed_task.deadline }}",
        "priority": {{ outputs.parse_task.vars.parsed_task.priority }},
        "status": "pending"
      }
    outputs:
      - id: created_task
        type: JSON
```

### Task Parser Service

```typescript
// src/lib/services/taskParser.ts
export interface ParsedTask {
  title: string;
  deadline?: string;
  priority: number;
  description?: string;
}

export function parseTaskFromText(rawText: string): ParsedTask {
  const title = rawText.trim();
  let deadline: string | undefined;
  let priority = 0;

  // Extract deadline
  if (/tomorrow/i.test(rawText)) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    deadline = tomorrow.toISOString();
  } else if (/today/i.test(rawText)) {
    deadline = new Date().toISOString();
  } else if (/next week/i.test(rawText)) {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    deadline = nextWeek.toISOString();
  }

  // Extract priority
  if (/urgent|asap|critical/i.test(rawText)) {
    priority = 10;
  } else if (/important|high/i.test(rawText)) {
    priority = 5;
  }

  return {
    title,
    deadline,
    priority,
  };
}
```

### Kestra Client

```typescript
// src/lib/kestra/client.ts
import { ParsedTask } from '@/lib/services/taskParser';

export interface KestraWorkflowInput {
  user_id: string;
  raw_text: string;
}

export async function triggerIngestionFlow(
  input: KestraWorkflowInput
): Promise<void> {
  const kestraUrl = process.env.KESTRA_URL;
  const kestraToken = process.env.KESTRA_API_TOKEN;

  if (!kestraUrl || !kestraToken) {
    throw new Error('Kestra configuration missing');
  }

  const response = await fetch(`${kestraUrl}/api/v1/executions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${kestraToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      namespace: 'manager',
      flowId: 'task-ingestion',
      inputs: input,
    }),
  });

  if (!response.ok) {
    throw new Error(`Kestra API error: ${response.statusText}`);
  }
}
```

### Webhook Endpoint

```typescript
// src/app/api/ingestion/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
import { triggerIngestionFlow } from '@/lib/kestra/client';
import { errorResponse, successResponse } from '@/lib/utils/apiResponse';
import { z } from 'zod';

const webhookSchema = z.object({
  raw_text: z.string().min(1, 'Text is required'),
});

export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json(
        errorResponse('Unauthorized'),
        { status: 401 }
      );
    }

    const body = await request.json();
    const { raw_text } = webhookSchema.parse(body);

    // Trigger Kestra workflow
    await triggerIngestionFlow({
      user_id: user.id,
      raw_text,
    });

    return NextResponse.json(
      successResponse({ message: 'Task ingestion started' }),
      { status: 202 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        errorResponse(error.issues[0].message),
        { status: 400 }
      );
    }
    console.error('Ingestion error:', error);
    return NextResponse.json(
      errorResponse('Failed to process task'),
      { status: 500 }
    );
  }
}
```

### Environment Variables

Add to `.env.local`:

```env
# Kestra Configuration
KESTRA_URL=http://localhost:8080
KESTRA_API_TOKEN=your_kestra_token
```

### Testing

```typescript
// src/lib/services/taskParser.test.ts
import { parseTaskFromText } from './taskParser';

describe('Task Parser', () => {
  it('should parse simple task', () => {
    const result = parseTaskFromText('Call mom');
    expect(result.title).toBe('Call mom');
    expect(result.priority).toBe(0);
  });

  it('should detect deadline keywords', () => {
    const result = parseTaskFromText('Call mom tomorrow');
    expect(result.deadline).toBeDefined();
  });

  it('should detect priority keywords', () => {
    const result = parseTaskFromText('Urgent: Fix bug');
    expect(result.priority).toBe(10);
  });
});
```

### References
- [Epics: Story 2.3](file:///d:/Thomas/PERSONAL/Projects/webuilddev/docs/epics.md#Story-2.3:-Kestra-Ingestion-Flow)
- [Kestra Documentation](https://kestra.io/docs)
- [Supabase REST API](https://supabase.com/docs/guides/api)

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

Cascade AI

### Debug Log References

None - Implementation completed successfully

### Completion Notes List

- Created comprehensive task parser with regex patterns for deadlines and priorities
- Supports keywords: today, tomorrow, next week, day names, urgent, important, low priority
- Created Kestra API client with mock mode for development without Kestra instance
- Webhook endpoint supports both local parsing (default) and Kestra workflow (optional)
- QuickAddTask component with keyboard shortcut (Ctrl+K) and parsing feedback
- Kestra workflow YAML ready for deployment to Kestra instance
- 75 total tests passing (36 new tests for this story)

### File List

- manager/src/lib/services/taskParser.ts
- manager/src/lib/services/taskParser.test.ts
- manager/src/lib/kestra/client.ts
- manager/src/lib/kestra/client.test.ts
- manager/src/app/api/ingestion/webhook/route.ts
- manager/src/features/tasks/QuickAddTask.tsx
- manager/src/features/tasks/QuickAddTask.module.css
- manager/src/features/tasks/index.ts (updated)
- manager/src/app/(auth)/dashboard/DashboardContent.tsx (updated)
- manager/src/app/(auth)/dashboard/dashboard.module.css (updated)
- manager/kestra/ingestion-flow.yaml
