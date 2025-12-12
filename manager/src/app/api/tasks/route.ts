import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
import { getTasksByUser, createTask } from '@/lib/db/tasks';
import { CreateTaskInput, TaskQueryParams } from '@/types/task';
import { successResponse, errorResponse } from '@/lib/utils/apiResponse';
import { z } from 'zod';

const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title too long'),
  description: z.string().max(1000, 'Description too long').optional(),
  priority: z.number().int().min(0).max(100).optional(),
  deadline: z.string().datetime().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json(errorResponse('Unauthorized'), { status: 401 });
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const params: TaskQueryParams = {
      status: (searchParams.get('status') as any) || undefined,
      priority: searchParams.get('priority')
        ? parseInt(searchParams.get('priority')!)
        : undefined,
      limit: searchParams.get('limit')
        ? parseInt(searchParams.get('limit')!)
        : 100,
      offset: searchParams.get('offset')
        ? parseInt(searchParams.get('offset')!)
        : 0,
    };

    const tasks = await getTasksByUser(user.id, params);
    return NextResponse.json(successResponse(tasks));
  } catch (error) {
    console.error('Error fetching tasks:', error);
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
      return NextResponse.json(errorResponse('Unauthorized'), { status: 401 });
    }

    const body = await request.json();
    const input = createTaskSchema.parse(body);

    const task = await createTask(user.id, input);
    return NextResponse.json(successResponse(task), { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const message = error.issues[0]?.message || 'Validation error';
      return NextResponse.json(errorResponse(message), { status: 400 });
    }
    console.error('Error creating task:', error);
    return NextResponse.json(
      errorResponse('Failed to create task'),
      { status: 500 }
    );
  }
}
