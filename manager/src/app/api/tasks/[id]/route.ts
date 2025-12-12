import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
import { getTaskById, updateTask, deleteTask } from '@/lib/db/tasks';
import { UpdateTaskInput } from '@/types/task';
import { successResponse, errorResponse } from '@/lib/utils/apiResponse';
import { z } from 'zod';

const updateTaskSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().max(1000).optional(),
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']).optional(),
  priority: z.number().int().min(0).max(100).optional(),
  deadline: z.string().datetime().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json(errorResponse('Unauthorized'), { status: 401 });
    }

    const task = await getTaskById(params.id, user.id);
    return NextResponse.json(successResponse(task));
  } catch (error: any) {
    if (error?.code === 'PGRST116') {
      return NextResponse.json(errorResponse('Task not found'), { status: 404 });
    }
    console.error('Error fetching task:', error);
    return NextResponse.json(
      errorResponse('Failed to fetch task'),
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json(errorResponse('Unauthorized'), { status: 401 });
    }

    const body = await request.json();
    const input = updateTaskSchema.parse(body);

    const task = await updateTask(params.id, user.id, input);
    return NextResponse.json(successResponse(task));
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      const message = error.issues[0]?.message || 'Validation error';
      return NextResponse.json(errorResponse(message), { status: 400 });
    }
    if (error?.code === 'PGRST116') {
      return NextResponse.json(errorResponse('Task not found'), { status: 404 });
    }
    console.error('Error updating task:', error);
    return NextResponse.json(
      errorResponse('Failed to update task'),
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json(errorResponse('Unauthorized'), { status: 401 });
    }

    // Verify task exists and belongs to user
    await getTaskById(params.id, user.id);

    await deleteTask(params.id, user.id);
    return NextResponse.json(
      successResponse({ message: 'Task deleted successfully' })
    );
  } catch (error: any) {
    if (error?.code === 'PGRST116') {
      return NextResponse.json(errorResponse('Task not found'), { status: 404 });
    }
    console.error('Error deleting task:', error);
    return NextResponse.json(
      errorResponse('Failed to delete task'),
      { status: 500 }
    );
  }
}
