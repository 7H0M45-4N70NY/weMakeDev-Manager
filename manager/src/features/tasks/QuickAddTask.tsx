'use client';

import { useState, useRef, useEffect } from 'react';
import styles from './QuickAddTask.module.css';

interface QuickAddTaskProps {
  onTaskAdded: () => void;
}

interface ParsedInfo {
  detected_deadline: boolean;
  detected_priority: boolean;
}

export function QuickAddTask({ onTaskAdded }: QuickAddTaskProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ message: string; parsed?: ParsedInfo } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Clear success message after 3 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!text.trim()) {
      setError('Please enter a task');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/ingestion/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ raw_text: text.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create task');
      }

      // Success
      setText('');
      setSuccess({
        message: 'Task created!',
        parsed: data.data?.parsed,
      });
      onTaskAdded();
      
      // Keep modal open for another quick add
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create task');
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    setIsOpen(false);
    setText('');
    setError(null);
    setSuccess(null);
  }

  // Handle keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Ctrl/Cmd + K to open quick add
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      // Escape to close
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={styles.triggerButton}
        aria-label="Quick add task"
        title="Quick add task (Ctrl+K)"
      >
        <span className={styles.icon}>⚡</span>
        <span className={styles.label}>Quick Add</span>
        <kbd className={styles.shortcut}>⌘K</kbd>
      </button>

      {isOpen && (
        <div className={styles.overlay} onClick={handleClose}>
          <div 
            className={styles.modal} 
            onClick={e => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="quick-add-title"
          >
            <div className={styles.header}>
              <h2 id="quick-add-title" className={styles.title}>Quick Add Task</h2>
              <button 
                onClick={handleClose} 
                className={styles.closeButton}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.inputWrapper}>
                <input
                  ref={inputRef}
                  type="text"
                  value={text}
                  onChange={e => setText(e.target.value)}
                  placeholder="e.g., Call mom tomorrow urgent"
                  className={styles.input}
                  disabled={loading}
                  autoComplete="off"
                />
                <button
                  type="submit"
                  disabled={loading || !text.trim()}
                  className={styles.submitButton}
                >
                  {loading ? '...' : '→'}
                </button>
              </div>

              {error && <p className={styles.error}>{error}</p>}
              
              {success && (
                <p className={styles.success}>
                  ✓ {success.message}
                  {success.parsed && (
                    <span className={styles.parsedInfo}>
                      {success.parsed.detected_deadline && ' • Deadline detected'}
                      {success.parsed.detected_priority && ' • Priority detected'}
                    </span>
                  )}
                </p>
              )}

              <div className={styles.hints}>
                <p className={styles.hint}>
                  <strong>Tips:</strong> Include keywords for smart parsing:
                </p>
                <ul className={styles.hintList}>
                  <li><code>tomorrow</code>, <code>today</code>, <code>next week</code> → sets deadline</li>
                  <li><code>urgent</code>, <code>important</code>, <code>low priority</code> → sets priority</li>
                </ul>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
