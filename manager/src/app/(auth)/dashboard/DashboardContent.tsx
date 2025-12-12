'use client';

import { useState } from 'react';
import { TaskList, AddTaskForm, QuickAddTask } from '@/features/tasks';
import styles from './dashboard.module.css';

export function DashboardContent() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleTaskAdded = () => {
    setRefreshKey(k => k + 1);
  };

  return (
    <>
      <div className={styles.quickActions}>
        <QuickAddTask onTaskAdded={handleTaskAdded} />
      </div>
      <div className={styles.taskLayout}>
        <aside className={styles.sidebar}>
          <AddTaskForm onTaskAdded={handleTaskAdded} />
        </aside>
        <main className={styles.main}>
          <TaskList refreshKey={refreshKey} />
        </main>
      </div>
    </>
  );
}
