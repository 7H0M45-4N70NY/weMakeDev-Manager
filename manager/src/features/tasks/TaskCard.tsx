'use client';

import { useState } from 'react';
import { Task } from '@/types/task';
import styles from './TaskCard.module.css';

interface TaskCardProps {
  task: Task;
  onUpdate: () => void;
}

export function TaskCard({ task, onUpdate }: TaskCardProps) {
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleComplete() {
    setUpdating(true);
    setError(null);
    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed' }),
      });

      if (!response.ok) {
        const { error: apiError } = await response.json();
        throw new Error(apiError || 'Failed to update task');
      }

      onUpdate();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update task');
    } finally {
      setUpdating(false);
    }
  }

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this task?')) return;
    
    setUpdating(true);
    setError(null);
    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const { error: apiError } = await response.json();
        throw new Error(apiError || 'Failed to delete task');
      }

      onUpdate();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete task');
    } finally {
      setUpdating(false);
    }
  }

  const statusClass = task.status.replace('_', '-');
  const priorityLabel = task.priority >= 8 ? 'High' : task.priority >= 4 ? 'Medium' : 'Low';

  return (
    <article className={`${styles.card} ${task.status === 'completed' ? styles.completed : ''}`}>
      <div className={styles.header}>
        <h3 className={styles.title}>{task.title}</h3>
        <span className={`${styles.status} ${styles[statusClass]}`}>
          {task.status.replace('_', ' ')}
        </span>
      </div>

      {task.description && (
        <p className={styles.description}>{task.description}</p>
      )}

      <div className={styles.meta}>
        {task.deadline && (
          <span className={styles.deadline}>
            <span className={styles.icon}>📅</span>
            {new Date(task.deadline).toLocaleDateString()}
          </span>
        )}
        <span className={`${styles.priority} ${styles[`priority${priorityLabel}`]}`}>
          <span className={styles.icon}>⭐</span>
          {priorityLabel}
        </span>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.actions}>
        {task.status !== 'completed' && (
          <button
            onClick={handleComplete}
            disabled={updating}
            className={styles.completeButton}
            aria-label="Mark task as complete"
          >
            {updating ? 'Updating...' : '✓ Complete'}
          </button>
        )}
        <button
          onClick={handleDelete}
          disabled={updating}
          className={styles.deleteButton}
          aria-label="Delete task"
        >
          🗑️
        </button>
      </div>
    </article>
  );
}
