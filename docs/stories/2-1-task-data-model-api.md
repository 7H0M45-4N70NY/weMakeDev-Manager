# Story 2.1: Task Data Model & API

Status: Ready for Development

## Story

As a Developer,
I want to establish the task data model and API endpoints,
So that the frontend and Kestra can manage tasks programmatically.

## Acceptance Criteria

1. **Given** The database is set up
   **When** I query the `tasks` table
   **Then** I can perform CRUD operations respecting RLS
2. **And** The `/api/tasks` endpoints handle GET, POST, PUT, DELETE requests

## Tasks / Subtasks

- [ ] Task 1: Create Task Database Schema (AC: 1)
  - [ ] Subtask 1.1: Create `tasks` table with required columns
  - [ ] Subtask 1.2: Create `task_status` enum type
  - [ ] Subtask 1.3: Enable RLS on tasks table
  - [ ] Subtask 1.4: Create RLS policies for user isolation
- [ ] Task 2: Create TypeScript Types (AC: 1)
  - [ ] Subtask 2.1: Create `src/types/task.ts` with Task interface
  - [ ] Subtask 2.2: Create validation schemas with Zod
  - [ ] Subtask 2.3: Create API response types
- [ ] Task 3: Implement API Routes (AC: 2)
  - [ ] Subtask 3.1: Create `src/app/api/tasks/route.ts` (GET, POST)
  - [ ] Subtask 3.2: Create `src/app/api/tasks/[id]/route.ts` (GET, PUT, DELETE)
  - [ ] Subtask 3.3: Implement error handling and validation
  - [ ] Subtask 3.4: Create `src/lib/utils/apiResponse.ts` for consistent responses
- [ ] Task 4: Create Database Utilities (AC: 1)
  - [ ] Subtask 4.1: Create `src/lib/db/tasks.ts` with database functions
  - [ ] Subtask 4.2: Implement getTasksByUser()
  - [ ] Subtask 4.3: Implement createTask()
  - [ ] Subtask 4.4: Implement updateTask()
  - [ ] Subtask 4.5: Implement deleteTask()
- [ ] Task 5: Testing (AC: 1, 2)
  - [ ] Subtask 5.1: Write tests for database functions
  - [ ] Subtask 5.2: Write tests for API endpoints
  - [ ] Subtask 5.3: Test RLS policies with different users

## Dev Notes

### Database Schema

```sql
-- Create enum for task status
CREATE TYPE task_status AS ENUM ('pending', 'in_progress', 'completed', 'cancelled');

-- Create tasks table
CREATE TABLE public.tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status task_status DEFAULT 'pending',
  priority INTEGER DEFAULT 0 COMMENT 'Higher number = higher priority',
  deadline TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT title_not_empty CHECK (LENGTH(TRIM(title)) > 0)
);

-- Create index for faster queries
CREATE INDEX idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX idx_tasks_status ON public.tasks(status);
CREATE INDEX idx_tasks_deadline ON public.tasks(deadline);

-- Enable RLS
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can read their own tasks
CREATE POLICY "Users can read their own tasks"
  ON public.tasks
  FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Users can create tasks
CREATE POLICY "Users can create tasks"
  ON public.tasks
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can update their own tasks
CREATE POLICY "Users can update their own tasks"
  ON public.tasks
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can delete their own tasks
CREATE POLICY "Users can delete their own tasks"
  ON public.tasks
  FOR DELETE
  USING (auth.uid() = user_id);
```

### Task Type Definition

```typescript
// src/types/task.ts
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: number;
  deadline: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  priority?: number;
  deadline?: string;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: number;
  deadline?: string;
}
```

### API Endpoints

**GET /api/tasks**
- Query Parameters: `status`, `priority`, `limit`, `offset`
- Returns: Array of tasks for authenticated user
- Status: 200 OK, 401 Unauthorized

**POST /api/tasks**
- Body: CreateTaskInput
- Returns: Created task
- Status: 201 Created, 400 Bad Request, 401 Unauthorized

**GET /api/tasks/[id]**
- Returns: Single task
- Status: 200 OK, 404 Not Found, 401 Unauthorized

**PUT /api/tasks/[id]**
- Body: UpdateTaskInput
- Returns: Updated task
- Status: 200 OK, 400 Bad Request, 404 Not Found, 401 Unauthorized

**DELETE /api/tasks/[id]**
- Returns: Success message
- Status: 200 OK, 404 Not Found, 401 Unauthorized

### Response Format

```typescript
// src/lib/utils/apiResponse.ts
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

export function successResponse<T>(data: T): ApiResponse<T> {
  return {
    success: true,
    data,
    timestamp: new Date().toISOString(),
  };
}

export function errorResponse(error: string): ApiResponse<null> {
  return {
    success: false,
    error,
    timestamp: new Date().toISOString(),
  };
}
```

### Database Functions

```typescript
// src/lib/db/tasks.ts
import { createClient } from '@/lib/supabase/server';
import { Task, CreateTaskInput, UpdateTaskInput } from '@/types/task';

export async function getTasksByUser(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .order('deadline', { ascending: true });
  
  if (error) throw error;
  return data as Task[];
}

export async function getTaskById(id: string, userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single();
  
  if (error) throw error;
  return data as Task;
}

export async function createTask(userId: string, input: CreateTaskInput) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('tasks')
    .insert({
      user_id: userId,
      ...input,
    })
    .select()
    .single();
  
  if (error) throw error;
  return data as Task;
}

export async function updateTask(
  id: string,
  userId: string,
  input: UpdateTaskInput
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('tasks')
    .update(input)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();
  
  if (error) throw error;
  return data as Task;
}

export async function deleteTask(id: string, userId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);
  
  if (error) throw error;
}
```

### API Route Example

```typescript
// src/app/api/tasks/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
import { getTasksByUser, createTask } from '@/lib/db/tasks';
import { CreateTaskInput } from '@/types/task';
import { successResponse, errorResponse } from '@/lib/utils/apiResponse';
import { z } from 'zod';

const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  priority: z.number().int().min(0).optional(),
  deadline: z.string().datetime().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json(
        errorResponse('Unauthorized'),
        { status: 401 }
      );
    }

    const tasks = await getTasksByUser(user.id);
    return NextResponse.json(successResponse(tasks));
  } catch (error) {
    return NextResponse.json(
      errorResponse('Failed to fetch tasks'),
      { status: 500 }
    );
  }
}

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
    const input = createTaskSchema.parse(body);

    const task = await createTask(user.id, input);
    return NextResponse.json(successResponse(task), { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        errorResponse(error.issues[0].message),
        { status: 400 }
      );
    }
    return NextResponse.json(
      errorResponse('Failed to create task'),
      { status: 500 }
    );
  }
}
```

### References
- [Epics: Story 2.1](file:///d:/Thomas/PERSONAL/Projects/webuilddev/docs/epics.md#Story-2.1:-Task-Data-Model-&-API)
- [Architecture: Database Design](file:///d:/Thomas/PERSONAL/Projects/webuilddev/docs/architecture.md)
- [Supabase Database Documentation](https://supabase.com/docs/guides/database)
- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

Cascade AI

### Debug Log References

None - Implementation completed successfully

### Completion Notes List

- Created Task TypeScript types and interfaces in `src/types/task.ts`
- Implemented Zod validation schemas for create and update operations
- Created API response utility functions for consistent response formatting
- Implemented database functions in `src/lib/db/tasks.ts` with full CRUD operations
- Created GET and POST endpoints at `/api/tasks` with query parameter support
- Created GET, PUT, DELETE endpoints at `/api/tasks/[id]` for individual task operations
- Implemented proper error handling with HTTP status codes (400, 401, 404, 500)
- Added input validation using Zod with meaningful error messages
- Created unit tests for database functions and API routes
- Implemented RLS-ready database functions (user_id isolation)

### File List

- manager/src/types/task.ts
- manager/src/lib/utils/apiResponse.ts
- manager/src/lib/db/tasks.ts
- manager/src/lib/db/tasks.test.ts
- manager/src/app/api/tasks/route.ts
- manager/src/app/api/tasks/route.test.ts
- manager/src/app/api/tasks/[id]/route.ts
