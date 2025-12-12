/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { TaskCard } from './TaskCard';
import { AddTaskForm } from './AddTaskForm';
import { TaskList } from './TaskList';
import { Task } from '@/types/task';

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock window.confirm
const mockConfirm = jest.fn();
window.confirm = mockConfirm;

describe('TaskCard', () => {
  const mockTask: Task = {
    id: '1',
    user_id: 'user-1',
    title: 'Test Task',
    description: 'Test description',
    status: 'pending',
    priority: 5,
    deadline: '2025-12-15T17:00:00Z',
    created_at: '2025-12-10T10:00:00Z',
    updated_at: '2025-12-10T10:00:00Z',
  };

  const mockOnUpdate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders task title and description', () => {
    render(<TaskCard task={mockTask} onUpdate={mockOnUpdate} />);
    
    expect(screen.getByText('Test Task')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
  });

  it('renders task status badge', () => {
    render(<TaskCard task={mockTask} onUpdate={mockOnUpdate} />);
    
    expect(screen.getByText('pending')).toBeInTheDocument();
  });

  it('renders deadline when present', () => {
    render(<TaskCard task={mockTask} onUpdate={mockOnUpdate} />);
    
    // Date format depends on locale, just check the date element exists
    expect(screen.getByText(/12\/15\/2025|15\/12\/2025/)).toBeInTheDocument();
  });

  it('renders complete button for non-completed tasks', () => {
    render(<TaskCard task={mockTask} onUpdate={mockOnUpdate} />);
    
    expect(screen.getByRole('button', { name: /complete/i })).toBeInTheDocument();
  });

  it('does not render complete button for completed tasks', () => {
    const completedTask = { ...mockTask, status: 'completed' as const };
    render(<TaskCard task={completedTask} onUpdate={mockOnUpdate} />);
    
    expect(screen.queryByRole('button', { name: /complete/i })).not.toBeInTheDocument();
  });

  it('calls API and onUpdate when marking complete', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: { ...mockTask, status: 'completed' } }),
    });

    render(<TaskCard task={mockTask} onUpdate={mockOnUpdate} />);
    
    const completeButton = screen.getByRole('button', { name: /complete/i });
    act(() => {
      fireEvent.click(completeButton);
    });

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        `/api/tasks/${mockTask.id}`,
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify({ status: 'completed' }),
        })
      );
    });

    await waitFor(() => {
      expect(mockOnUpdate).toHaveBeenCalled();
    });
  });

  it('shows error message on API failure', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Failed to update' }),
    });

    render(<TaskCard task={mockTask} onUpdate={mockOnUpdate} />);
    
    const completeButton = screen.getByRole('button', { name: /complete/i });
    act(() => {
      fireEvent.click(completeButton);
    });

    await waitFor(() => {
      expect(screen.getByText('Failed to update')).toBeInTheDocument();
    });
  });

  it('calls delete API when delete button clicked and confirmed', async () => {
    mockConfirm.mockReturnValue(true);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    render(<TaskCard task={mockTask} onUpdate={mockOnUpdate} />);
    
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    act(() => {
      fireEvent.click(deleteButton);
    });

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        `/api/tasks/${mockTask.id}`,
        expect.objectContaining({ method: 'DELETE' })
      );
    });
  });

  it('does not delete when confirmation cancelled', async () => {
    mockConfirm.mockReturnValue(false);

    render(<TaskCard task={mockTask} onUpdate={mockOnUpdate} />);
    
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    act(() => {
      fireEvent.click(deleteButton);
    });

    expect(mockFetch).not.toHaveBeenCalled();
  });
});

describe('AddTaskForm', () => {
  const mockOnTaskAdded = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders form with title input', () => {
    render(<AddTaskForm onTaskAdded={mockOnTaskAdded} />);
    
    expect(screen.getByLabelText(/task title/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add task/i })).toBeInTheDocument();
  });

  it('shows expand button for additional fields', () => {
    render(<AddTaskForm onTaskAdded={mockOnTaskAdded} />);
    
    expect(screen.getByText(/add details/i)).toBeInTheDocument();
  });

  it('expands to show additional fields when clicked', () => {
    render(<AddTaskForm onTaskAdded={mockOnTaskAdded} />);
    
    act(() => {
      fireEvent.click(screen.getByText(/add details/i));
    });
    
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/priority/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/deadline/i)).toBeInTheDocument();
  });

  it('submits form with title only', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: { id: '1', title: 'New Task' } }),
    });

    render(<AddTaskForm onTaskAdded={mockOnTaskAdded} />);
    
    const titleInput = screen.getByLabelText(/task title/i);
    act(() => {
      fireEvent.change(titleInput, { target: { value: 'New Task' } });
    });
    
    const submitButton = screen.getByRole('button', { name: /add task/i });
    act(() => {
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/tasks',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('New Task'),
        })
      );
    });

    await waitFor(() => {
      expect(mockOnTaskAdded).toHaveBeenCalled();
    });
  });

  it('clears form after successful submission', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: { id: '1', title: 'New Task' } }),
    });

    render(<AddTaskForm onTaskAdded={mockOnTaskAdded} />);
    
    const titleInput = screen.getByLabelText(/task title/i) as HTMLInputElement;
    act(() => {
      fireEvent.change(titleInput, { target: { value: 'New Task' } });
      fireEvent.click(screen.getByRole('button', { name: /add task/i }));
    });

    await waitFor(() => {
      expect(titleInput.value).toBe('');
    });
  });

  it('shows error on API failure', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Title is required' }),
    });

    render(<AddTaskForm onTaskAdded={mockOnTaskAdded} />);
    
    const titleInput = screen.getByLabelText(/task title/i);
    act(() => {
      fireEvent.change(titleInput, { target: { value: 'Test' } });
      fireEvent.click(screen.getByRole('button', { name: /add task/i }));
    });

    await waitFor(() => {
      expect(screen.getByText('Title is required')).toBeInTheDocument();
    });
  });

  it('disables submit button when title is empty', () => {
    render(<AddTaskForm onTaskAdded={mockOnTaskAdded} />);
    
    const submitButton = screen.getByRole('button', { name: /add task/i });
    expect(submitButton).toBeDisabled();
  });
});

describe('TaskList', () => {
  const mockTasks: Task[] = [
    {
      id: 'task-1',
      user_id: 'user-1',
      title: 'Task 1',
      description: null,
      status: 'pending',
      priority: 10,
      deadline: '2025-12-15T17:00:00Z',
      created_at: '2025-12-10T10:00:00Z',
      updated_at: '2025-12-10T10:00:00Z',
    },
    {
      id: 'task-2',
      user_id: 'user-1',
      title: 'Task 2',
      description: null,
      status: 'completed',
      priority: 5,
      deadline: null,
      created_at: '2025-12-10T10:00:00Z',
      updated_at: '2025-12-10T10:00:00Z',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state initially', () => {
    mockFetch.mockImplementation(() => new Promise(() => {})); // Never resolves
    
    render(<TaskList />);
    
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('renders tasks after loading', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: mockTasks }),
    });

    await act(async () => {
      render(<TaskList />);
      await waitFor(() => {
        expect(screen.getByText('Task 1')).toBeInTheDocument();
        expect(screen.getByText('Task 2')).toBeInTheDocument();
      });
    });
  });

  it('renders empty state when no tasks', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: [] }),
    });

    await act(async () => {
      render(<TaskList />);
      await waitFor(() => {
        expect(screen.getByText(/no tasks yet/i)).toBeInTheDocument();
      });
    });
  });

  it('renders error state on fetch failure', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
    });

    await act(async () => {
      render(<TaskList />);
      await waitFor(() => {
        expect(screen.getByText(/failed to fetch/i)).toBeInTheDocument();
      });
    });
  });

  it('renders filter buttons', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: mockTasks }),
    });

    await act(async () => {
      render(<TaskList />);
      await waitFor(() => {
        expect(screen.getByRole('tab', { name: /all/i })).toBeInTheDocument();
        expect(screen.getByRole('tab', { name: /pending/i })).toBeInTheDocument();
        expect(screen.getByRole('tab', { name: /completed/i })).toBeInTheDocument();
      });
    });
  });

  it('filters tasks when filter button clicked', async () => {
    // First fetch returns all tasks
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: mockTasks }),
    });

    await act(async () => {
      render(<TaskList />);
      await waitFor(() => {
        expect(screen.getByText('Task 1')).toBeInTheDocument();
        expect(screen.getByText('Task 2')).toBeInTheDocument();
      });
    });

    // Mock the API call for the "Completed" filter
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: [mockTasks.find(t => t.status === 'completed')],
      }),
    });

    // Click completed filter
    await act(async () => {
      fireEvent.click(screen.getByRole('tab', { name: /completed/i }));
      await waitFor(() => {
        expect(screen.queryByText('Task 1')).not.toBeInTheDocument();
        expect(screen.getByText('Task 2')).toBeInTheDocument();
      });
    });
  });

  it('searches tasks when search form submitted', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: mockTasks }),
    });

    await act(async () => {
      render(<TaskList />);
      await waitFor(() => {
        expect(screen.getByText('Task 1')).toBeInTheDocument();
      });
    });

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: [mockTasks.find(t => t.title === 'Task 2')],
      }),
    });

    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText(/search tasks/i), {
        target: { value: 'Task 2' },
      });
      fireEvent.click(screen.getByRole('button', { name: /search/i }));
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/tasks?search=Task%202&offset=0');
        expect(screen.queryByText('Task 1')).not.toBeInTheDocument();
        expect(screen.getByText('Task 2')).toBeInTheDocument();
      });
    });
  });

  it('loads more tasks when load more button clicked', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: mockTasks }),
    });

    await act(async () => {
      render(<TaskList />);
      await waitFor(() => {
        expect(screen.getByText('Task 1')).toBeInTheDocument();
      });
    });

    const newTask = {
      id: 'task-3',
      title: 'Task 3',
      status: 'pending',
      priority: 1,
      deadline: null,
    };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: [newTask] }),
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /load more/i }));
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/tasks?offset=2');
        expect(screen.getByText('Task 3')).toBeInTheDocument();
      });
    });
  });

  it('shows task count in header', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: mockTasks }),
    });

    await act(async () => {
      render(<TaskList />);
      await waitFor(() => {
        expect(screen.getByText(/2 tasks/i)).toBeInTheDocument();
      });
    });
  });
});
