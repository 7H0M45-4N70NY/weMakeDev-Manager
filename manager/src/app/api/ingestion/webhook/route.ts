import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
import { parseTaskFromText, isValidParsedTask } from '@/lib/services/taskParser';
import { triggerIngestionFlow, isKestraConfigured } from '@/lib/kestra/client';
import { createTask } from '@/lib/db/tasks';
import { errorResponse, successResponse } from '@/lib/utils/apiResponse';
import { z } from 'zod';

const webhookSchema = z.object({
  raw_text: z.string().min(1, 'Text is required').max(1000, 'Text too long'),
  use_kestra: z.boolean().optional().default(false),
});

/**
 * POST /api/ingestion/webhook
 * 
 * Accepts raw text input and either:
 * 1. Parses locally and creates task directly (default)
 * 2. Triggers Kestra workflow for processing (if use_kestra=true and configured)
 * 
 * @body { raw_text: string, use_kestra?: boolean }
 * @returns { success: boolean, data: { task?: Task, execution_id?: string } }
 */
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
    const { raw_text, use_kestra } = webhookSchema.parse(body);

    // If Kestra is requested and configured, use it
    if (use_kestra && isKestraConfigured()) {
      const execution = await triggerIngestionFlow({
        user_id: user.id,
        raw_text,
      });

      return NextResponse.json(
        successResponse({
          message: 'Task ingestion started',
          execution_id: execution.id,
          mode: 'kestra',
        }),
        { status: 202 }
      );
    }

    // Default: Parse locally and create task directly
    const parsed = parseTaskFromText(raw_text);

    if (!isValidParsedTask(parsed)) {
      return NextResponse.json(
        errorResponse('Could not parse a valid task from the input'),
        { status: 400 }
      );
    }

    // Create task in database
    const task = await createTask(user.id, {
      title: parsed.title,
      description: parsed.description,
      priority: parsed.priority,
      deadline: parsed.deadline,
    });

    return NextResponse.json(
      successResponse({
        task,
        mode: 'local',
        parsed: {
          detected_deadline: !!parsed.deadline,
          detected_priority: parsed.priority > 0,
        },
      }),
      { status: 201 }
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
