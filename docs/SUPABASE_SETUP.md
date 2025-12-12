# Supabase Database Setup Guide

**Project:** Manager - Task Management & AI Planning PWA  
**Date:** 2025-12-09

---

## Prerequisites

- Supabase account created
- Project created in Supabase
- API keys obtained and added to `.env.local`

---

## Step 1: Create Task Status Enum

Go to Supabase SQL Editor and run:

```sql
CREATE TYPE public.task_status AS ENUM (
  'pending',
  'in_progress',
  'completed',
  'cancelled'
);
```

---

## Step 2: Create Tasks Table

```sql
CREATE TABLE public.tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status public.task_status DEFAULT 'pending',
  priority INTEGER DEFAULT 0,
  deadline TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT title_not_empty CHECK (LENGTH(TRIM(title)) > 0)
);
```

---

## Step 3: Create Indexes

```sql
CREATE INDEX idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX idx_tasks_status ON public.tasks(status);
CREATE INDEX idx_tasks_deadline ON public.tasks(deadline);
```

---

## Step 4: Enable Row Level Security

```sql
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
```

---

## Step 5: Create RLS Policies

### Read Policy
```sql
CREATE POLICY "Users can read their own tasks"
  ON public.tasks
  FOR SELECT
  USING (auth.uid() = user_id);
```

### Create Policy
```sql
CREATE POLICY "Users can create tasks"
  ON public.tasks
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

### Update Policy
```sql
CREATE POLICY "Users can update their own tasks"
  ON public.tasks
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

### Delete Policy
```sql
CREATE POLICY "Users can delete their own tasks"
  ON public.tasks
  FOR DELETE
  USING (auth.uid() = user_id);
```

---

## Step 6: Verify Setup

Test with this query:

```sql
SELECT * FROM public.tasks LIMIT 1;
```

Should return empty result (no error).

---

## Step 7: Configure Authentication

1. Go to Authentication → Providers
2. Ensure Email is enabled
3. Go to Email Templates
4. Customize if needed

---

## Step 8: Test Application

1. Run `npm run dev`
2. Navigate to http://localhost:3000/signup
3. Create test account
4. Check Supabase Auth → Users for new user
5. Navigate to http://localhost:3000/login
6. Sign in with test account
7. Should see dashboard

---

## Troubleshooting

### "User not found" error
- Check that user was created in Supabase Auth
- Verify email confirmation if required

### "RLS policy violation"
- Ensure RLS policies are created correctly
- Check that user_id matches auth.uid()

### "Table doesn't exist"
- Verify tasks table was created
- Check table is in public schema

---

## Next Steps

After database setup:
1. Test authentication flow
2. Test API endpoints with curl or Postman
3. Create sample tasks via API
4. Proceed to Story 2.2 implementation

---

## SQL Scripts Summary

All SQL scripts are provided above in order. Execute them in the Supabase SQL Editor one by one.

Total steps: 8
Estimated time: 10 minutes
