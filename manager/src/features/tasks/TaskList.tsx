'use client';

import { useState, useEffect, useCallback } from 'react';
import { Task, TaskStatus } from '@/types/task';
import { TaskCard } from './TaskCard';
import styles from './TaskList.module.css';

interface TaskListProps {
  filter?: TaskStatus;
  refreshKey?: number;
}

const FILTER_OPTIONS: { value: TaskStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
];

export function TaskList({ filter: initialFilter, refreshKey = 0 }: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<TaskStatus | 'all'>(initialFilter || 'all');

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (activeFilter && activeFilter !== 'all') {
        params.append('status', activeFilter);
      }

      const response = await fetch(`/api/tasks?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }

      const { data } = await response.json();
      
      // Sort by deadline (null last), then by priority (high first)
      const sortedTasks = [...(data || [])].sort((a: Task, b: Task) => {
        // Completed tasks go to bottom
        if (a.status === 'completed' && b.status !== 'completed') return 1;
        if (a.status !== 'completed' && b.status === 'completed') return -1;
        
        // Sort by deadline (null last)
        if (a.deadline && !b.deadline) return -1;
        if (!a.deadline && b.deadline) return 1;
        if (a.deadline && b.deadline) {
          const dateCompare = new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
          if (dateCompare !== 0) return dateCompare;
        }
        
        // Then by priority (high first)
        return b.priority - a.priority;
      });

      setTasks(sortedTasks);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [activeFilter]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks, refreshKey]);

  const filteredTasks = activeFilter === 'all' 
    ? tasks 
    : tasks.filter(task => task.status === activeFilter);

  const taskCounts: Record<TaskStatus | 'all', number> = {
    all: tasks.length,
    pending: tasks.filter(t => t.status === 'pending').length,
    in_progress: tasks.filter(t => t.status === 'in_progress').length,
    completed: tasks.filter(t => t.status === 'completed').length,
    cancelled: tasks.filter(t => t.status === 'cancelled').length,
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.heading}>Your Tasks</h2>
        <span className={styles.count}>{filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''}</span>
      </div>

      <div className={styles.filters} role="tablist" aria-label="Filter tasks">
        {FILTER_OPTIONS.map(option => (
          <button
            key={option.value}
            role="tab"
            aria-selected={activeFilter === option.value}
            onClick={() => setActiveFilter(option.value)}
            className={`${styles.filterButton} ${activeFilter === option.value ? styles.active : ''}`}
          >
            {option.label}
            <span className={styles.badge}>{taskCounts[option.value]}</span>
          </button>
        ))}
      </div>

      {loading && (
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading tasks...</p>
        </div>
      )}

      {error && (
        <div className={styles.error}>
          <p>{error}</p>
          <button onClick={fetchTasks} className={styles.retryButton}>
            Try Again
          </button>
        </div>
      )}

      {!loading && !error && filteredTasks.length === 0 && (
        <div className={styles.empty}>
          <span className={styles.emptyIcon}>📋</span>
          <p className={styles.emptyText}>
            {activeFilter === 'all' 
              ? 'No tasks yet. Create one to get started!'
              : `No ${activeFilter.replace('_', ' ')} tasks.`}
          </p>
        </div>
      )}

      {!loading && !error && filteredTasks.length > 0 && (
        <div className={styles.list}>
          {filteredTasks.map(task => (
            <TaskCard key={task.id} task={task} onUpdate={fetchTasks} />
          ))}
        </div>
      )}
    </div>
  );
}
