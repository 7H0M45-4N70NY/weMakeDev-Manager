# Story 2.2: Task Dashboard & Management UI

Status: Ready for Development

## Story

As a User,
I want to view and manage my daily tasks,
So that I can track my progress and add new items.

## Acceptance Criteria

1. **Given** I am on the Dashboard
   **When** I view the task list
   **Then** I see my tasks for today sorted by priority
2. **And** I can add a new task via a text input
3. **And** I can mark a task as complete

## Tasks / Subtasks

- [ ] Task 1: Create Task List Component (AC: 1)
  - [ ] Subtask 1.1: Create `src/features/tasks/TaskList.tsx` component
  - [ ] Subtask 1.2: Fetch tasks from `/api/tasks` endpoint
  - [ ] Subtask 1.3: Display tasks sorted by deadline and priority
  - [ ] Subtask 1.4: Create `src/features/tasks/TaskList.module.css` styles
- [ ] Task 2: Create Task Card Component (AC: 1)
  - [ ] Subtask 2.1: Create `src/features/tasks/TaskCard.tsx` component
  - [ ] Subtask 2.2: Display task title, description, deadline, priority
  - [ ] Subtask 2.3: Show task status with visual indicator
  - [ ] Subtask 2.4: Create `src/features/tasks/TaskCard.module.css` styles
- [ ] Task 3: Implement Add Task Form (AC: 2)
  - [ ] Subtask 3.1: Create `src/features/tasks/AddTaskForm.tsx` component
  - [ ] Subtask 3.2: Implement form with title and description inputs
  - [ ] Subtask 3.3: Add deadline and priority selectors
  - [ ] Subtask 3.4: Submit to `/api/tasks` POST endpoint
  - [ ] Subtask 3.5: Clear form and refresh task list on success
  - [ ] Subtask 3.6: Create `src/features/tasks/AddTaskForm.module.css` styles
- [ ] Task 4: Implement Mark Complete (AC: 3)
  - [ ] Subtask 4.1: Add "Mark Complete" button to TaskCard
  - [ ] Subtask 4.2: Call `/api/tasks/:id` PUT endpoint with status=completed
  - [ ] Subtask 4.3: Update UI optimistically
  - [ ] Subtask 4.4: Handle errors gracefully
- [ ] Task 5: Implement Task Filtering (AC: 1)
  - [ ] Subtask 5.1: Add filter buttons (All, Pending, In Progress, Completed)
  - [ ] Subtask 5.2: Update task list based on selected filter
  - [ ] Subtask 5.3: Persist filter selection in URL or state
- [ ] Task 6: Testing (AC: 1, 2, 3)
  - [ ] Subtask 6.1: Write tests for TaskList component
  - [ ] Subtask 6.2: Write tests for TaskCard component
  - [ ] Subtask 6.3: Write tests for AddTaskForm component
  - [ ] Subtask 6.4: Write integration tests for task operations

## Dev Notes

### Component Structure

```
src/features/tasks/
├── TaskList.tsx              # Main task list component
├── TaskList.module.css       # Task list styles
├── TaskCard.tsx              # Individual task card
├── TaskCard.module.css       # Task card styles
├── AddTaskForm.tsx           # Add task form
├── AddTaskForm.module.css    # Form styles
├── useTaskState.ts           # Custom hook for task state
└── tasks.test.tsx            # Component tests
```

### TaskList Component

```typescript
interface TaskListProps {
  filter?: TaskStatus;
}

export function TaskList({ filter }: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTasks();
  }, [filter]);

  async function fetchTasks() {
    try {
      const params = new URLSearchParams();
      if (filter) params.append('status', filter);
      
      const response = await fetch(`/api/tasks?${params}`);
      const { data } = await response.json();
      setTasks(data);
    } catch (err) {
      setError('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div>Loading tasks...</div>;
  if (error) return <div className={styles.error}>{error}</div>;
  if (tasks.length === 0) return <div>No tasks yet. Create one to get started!</div>;

  return (
    <div className={styles.list}>
      {tasks.map(task => (
        <TaskCard key={task.id} task={task} onUpdate={fetchTasks} />
      ))}
    </div>
  );
}
```

### TaskCard Component

```typescript
interface TaskCardProps {
  task: Task;
  onUpdate: () => void;
}

export function TaskCard({ task, onUpdate }: TaskCardProps) {
  const [updating, setUpdating] = useState(false);

  async function handleComplete() {
    setUpdating(true);
    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed' }),
      });
      
      if (response.ok) {
        onUpdate();
      }
    } finally {
      setUpdating(false);
    }
  }

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.title}>{task.title}</h3>
        <span className={`${styles.status} ${styles[task.status]}`}>
          {task.status}
        </span>
      </div>
      
      {task.description && (
        <p className={styles.description}>{task.description}</p>
      )}
      
      <div className={styles.footer}>
        <div className={styles.meta}>
          {task.deadline && (
            <span className={styles.deadline}>
              📅 {new Date(task.deadline).toLocaleDateString()}
            </span>
          )}
          <span className={styles.priority}>
            ⭐ Priority: {task.priority}
          </span>
        </div>
        
        {task.status !== 'completed' && (
          <button
            onClick={handleComplete}
            disabled={updating}
            className={styles.completeButton}
          >
            {updating ? 'Updating...' : 'Mark Complete'}
          </button>
        )}
      </div>
    </div>
  );
}
```

### AddTaskForm Component

```typescript
export function AddTaskForm({ onTaskAdded }: { onTaskAdded: () => void }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState(0);
  const [deadline, setDeadline] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description: description || undefined,
          priority,
          deadline: deadline || undefined,
        }),
      });

      if (!response.ok) {
        const { error: apiError } = await response.json();
        throw new Error(apiError);
      }

      // Reset form
      setTitle('');
      setDescription('');
      setPriority(0);
      setDeadline('');
      
      // Refresh task list
      onTaskAdded();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create task');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <h2 className={styles.title}>Add New Task</h2>
      
      <div className={styles.formGroup}>
        <label htmlFor="title">Task Title *</label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs to be done?"
          required
          disabled={loading}
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add more details (optional)"
          disabled={loading}
          rows={3}
        />
      </div>

      <div className={styles.row}>
        <div className={styles.formGroup}>
          <label htmlFor="priority">Priority</label>
          <select
            id="priority"
            value={priority}
            onChange={(e) => setPriority(Number(e.target.value))}
            disabled={loading}
          >
            <option value={0}>Low (0)</option>
            <option value={5}>Medium (5)</option>
            <option value={10}>High (10)</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="deadline">Deadline</label>
          <input
            id="deadline"
            type="datetime-local"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            disabled={loading}
          />
        </div>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <button type="submit" disabled={loading} className={styles.submitButton}>
        {loading ? 'Creating...' : 'Add Task'}
      </button>
    </form>
  );
}
```

### CSS Module Example

```css
/* TaskCard.module.css */
.card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1rem;
  margin-bottom: 1rem;
  transition: all 0.2s;
}

.card:hover {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border-color: #d1d5db;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 0.75rem;
}

.title {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0;
  flex: 1;
}

.status {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
}

.status.pending {
  background-color: #fef3c7;
  color: #92400e;
}

.status.in_progress {
  background-color: #dbeafe;
  color: #1e40af;
}

.status.completed {
  background-color: #dcfce7;
  color: #166534;
}

.description {
  color: #6b7280;
  margin: 0 0 0.75rem 0;
  font-size: 0.875rem;
}

.footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 0.75rem;
  border-top: 1px solid #f3f4f6;
}

.meta {
  display: flex;
  gap: 1rem;
  font-size: 0.875rem;
  color: #6b7280;
}

.completeButton {
  padding: 0.5rem 1rem;
  background-color: #10b981;
  color: white;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
}

.completeButton:hover:not(:disabled) {
  background-color: #059669;
}

.completeButton:disabled {
  background-color: #d1d5db;
  cursor: not-allowed;
}
```

### Integration with Dashboard

Update `src/app/(auth)/dashboard/page.tsx`:

```typescript
import { TaskList } from '@/features/tasks/TaskList';
import { AddTaskForm } from '@/features/tasks/AddTaskForm';

export default function DashboardPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className={styles.container}>
      <h1>My Tasks</h1>
      
      <div className={styles.grid}>
        <div className={styles.formSection}>
          <AddTaskForm onTaskAdded={() => setRefreshKey(k => k + 1)} />
        </div>
        
        <div className={styles.listSection}>
          <TaskList key={refreshKey} />
        </div>
      </div>
    </div>
  );
}
```

### References
- [Epics: Story 2.2](file:///d:/Thomas/PERSONAL/Projects/webuilddev/docs/epics.md#Story-2.2:-Task-Dashboard-&-Management-UI)
- [API Documentation](file:///d:/Thomas/PERSONAL/Projects/webuilddev/docs/API_DOCUMENTATION.md)
- [Project Context](file:///d:/Thomas/PERSONAL/Projects/webuilddev/docs/project_context.md)

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

To be filled during implementation

### Debug Log References

### Completion Notes List

### File List
