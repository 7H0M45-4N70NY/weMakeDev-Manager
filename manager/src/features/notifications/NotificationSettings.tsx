'use client';

import { useState, useEffect } from 'react';
import { 
  requestNotificationPermission, 
  subscribeToPush, 
  unsubscribeFromPush,
  getSubscriptionStatus 
} from '@/lib/push/subscription';
import styles from './NotificationSettings.module.css';

export default function NotificationSettings() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    checkStatus();
  }, []);

  async function checkStatus() {
    if (!('Notification' in window)) {
      setMessage({ type: 'error', text: 'Notifications not supported in this browser' });
      return;
    }

    setPermission(Notification.permission);
    const status = await getSubscriptionStatus();
    setIsSubscribed(status.isSubscribed);
  }

  async function handleEnableNotifications() {
    setIsLoading(true);
    setMessage(null);

    try {
      // Request permission
      const granted = await requestNotificationPermission();
      
      if (!granted) {
        setMessage({ 
          type: 'error', 
          text: 'Notification permission denied. Please enable in browser settings.' 
        });
        setPermission('denied');
        setIsLoading(false);
        return;
      }

      // Subscribe to push
      const result = await subscribeToPush();
      
      if (result.success) {
        setIsSubscribed(true);
        setPermission('granted');
        setMessage({ type: 'success', text: 'Notifications enabled successfully!' });
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to enable notifications' });
      }
    } catch (error) {
      console.error('Error enabling notifications:', error);
      setMessage({ type: 'error', text: 'An error occurred. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDisableNotifications() {
    setIsLoading(true);
    setMessage(null);

    try {
      const result = await unsubscribeFromPush();
      
      if (result.success) {
        setIsSubscribed(false);
        setMessage({ type: 'success', text: 'Notifications disabled' });
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to disable notifications' });
      }
    } catch (error) {
      console.error('Error disabling notifications:', error);
      setMessage({ type: 'error', text: 'An error occurred. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleTestNotification() {
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/notifications/test', {
        method: 'POST',
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Test notification sent!' });
      } else {
        const data = await response.json();
        setMessage({ type: 'error', text: data.error || 'Failed to send test notification' });
      }
    } catch (error) {
      console.error('Error sending test notification:', error);
      setMessage({ type: 'error', text: 'An error occurred. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  }

  if (!('Notification' in window)) {
    return (
      <div className={styles.container}>
        <h2>Notifications</h2>
        <div className={styles.error}>
          Your browser does not support notifications.
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h2>Notification Settings</h2>
      
      <div className={styles.status}>
        <div className={styles.statusItem}>
          <span className={styles.label}>Browser Permission:</span>
          <span className={`${styles.badge} ${styles[permission]}`}>
            {permission}
          </span>
        </div>
        
        <div className={styles.statusItem}>
          <span className={styles.label}>Subscription Status:</span>
          <span className={`${styles.badge} ${isSubscribed ? styles.active : styles.inactive}`}>
            {isSubscribed ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>

      {message && (
        <div className={`${styles.message} ${styles[message.type]}`}>
          {message.text}
        </div>
      )}

      <div className={styles.actions}>
        {!isSubscribed ? (
          <button
            onClick={handleEnableNotifications}
            disabled={isLoading || permission === 'denied'}
            className={styles.primaryButton}
          >
            {isLoading ? 'Enabling...' : 'Enable Notifications'}
          </button>
        ) : (
          <>
            <button
              onClick={handleTestNotification}
              disabled={isLoading}
              className={styles.secondaryButton}
            >
              {isLoading ? 'Sending...' : 'Send Test Notification'}
            </button>
            
            <button
              onClick={handleDisableNotifications}
              disabled={isLoading}
              className={styles.dangerButton}
            >
              {isLoading ? 'Disabling...' : 'Disable Notifications'}
            </button>
          </>
        )}
      </div>

      {permission === 'denied' && (
        <div className={styles.help}>
          <h3>How to enable notifications:</h3>
          <ol>
            <li>Click the lock icon in your browser&apos;s address bar</li>
            <li>Find &quot;Notifications&quot; in the permissions list</li>
            <li>Change it to &quot;Allow&quot;</li>
            <li>Refresh this page and try again</li>
          </ol>
        </div>
      )}
    </div>
  );
}
