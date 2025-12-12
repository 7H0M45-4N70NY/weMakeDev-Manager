import { createClient } from '@/lib/supabase/server';
import {
  Task,
  CreateTaskInput,
  UpdateTaskInput,
  TaskQueryParams,
} from '@/types/task';

export async function getTasksByUser(
  userId: string,
  params?: TaskQueryParams
) {
  const supabase = await createClient();

  let query = supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId);

  if (params?.status) {
    query = query.eq('status', params.status);
  }

  if (params?.priority !== undefined) {
    query = query.gte('priority', params.priority);
  }

  const { data, error } = await query
    .order('deadline', { ascending: true, nullsFirst: false })
    .order('priority', { ascending: false })
    .range(params?.offset || 0, (params?.offset || 0) + (params?.limit || 100) - 1);

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
      title: input.title,
      description: input.description || null,
      priority: input.priority || 0,
      deadline: input.deadline || null,
      status: 'pending',
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

export async function getTaskCount(userId: string) {
  const supabase = await createClient();

  const { count, error } = await supabase
    .from('tasks')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  if (error) throw error;
  return count || 0;
}
