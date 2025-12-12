'use client';

import { useState } from 'react';
import styles from './AddTaskForm.module.css';

interface AddTaskFormProps {
  onTaskAdded: () => void;
}

export function AddTaskForm({ onTaskAdded }: AddTaskFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState(0);
  const [deadline, setDeadline] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || undefined,
          priority,
          deadline: deadline || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create task');
      }

      // Reset form
      setTitle('');
      setDescription('');
      setPriority(0);
      setDeadline('');
      setExpanded(false);

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
      <h2 className={styles.heading}>Add New Task</h2>

      <div className={styles.formGroup}>
        <label htmlFor="title" className={styles.label}>
          Task Title <span className={styles.required}>*</span>
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs to be done?"
          required
          disabled={loading}
          className={styles.input}
          autoComplete="off"
        />
      </div>

      {!expanded && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className={styles.expandButton}
        >
          + Add details
        </button>
      )}

      {expanded && (
        <>
          <div className={styles.formGroup}>
            <label htmlFor="description" className={styles.label}>
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add more details (optional)"
              disabled={loading}
              rows={3}
              className={styles.textarea}
            />
          </div>

          <div className={styles.row}>
            <div className={styles.formGroup}>
              <label htmlFor="priority" className={styles.label}>
                Priority
              </label>
              <select
                id="priority"
                value={priority}
                onChange={(e) => setPriority(Number(e.target.value))}
                disabled={loading}
                className={styles.select}
              >
                <option value={0}>Low</option>
                <option value={5}>Medium</option>
                <option value={10}>High</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="deadline" className={styles.label}>
                Deadline
              </label>
              <input
                id="deadline"
                type="datetime-local"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                disabled={loading}
                className={styles.input}
              />
            </div>
          </div>
        </>
      )}

      {error && <p className={styles.error}>{error}</p>}

      <button
        type="submit"
        disabled={loading || !title.trim()}
        className={styles.submitButton}
      >
        {loading ? 'Creating...' : 'Add Task'}
      </button>
    </form>
  );
}
