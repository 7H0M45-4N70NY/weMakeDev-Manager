import { getUser } from '@/lib/auth';
import styles from './dashboard.module.css';

export const metadata = {
  title: 'Dashboard - Manager',
  description: 'Your task management dashboard',
};

export default async function DashboardPage() {
  const user = await getUser();

  return (
    <div className={styles.container}>
      <div className={styles.welcome}>
        <h1 className={styles.title}>Welcome back, {user?.email?.split('@')[0]}!</h1>
        <p className={styles.subtitle}>
          Your AI-powered task management system is ready to help you organize your day.
        </p>
      </div>

      <div className={styles.grid}>
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>📋 Tasks</h2>
          <p className={styles.cardDescription}>
            View and manage your tasks. Coming soon: Add, edit, and track your daily work.
          </p>
        </div>

        <div className={styles.card}>
          <h2 className={styles.cardTitle}>🤖 AI Planning</h2>
          <p className={styles.cardDescription}>
            Get intelligent daily schedules powered by AI. Coming soon: Automatic task scheduling.
          </p>
        </div>

        <div className={styles.card}>
          <h2 className={styles.cardTitle}>🔔 Notifications</h2>
          <p className={styles.cardDescription}>
            Receive updates across multiple channels. Coming soon: Push notifications and Telegram.
          </p>
        </div>

        <div className={styles.card}>
          <h2 className={styles.cardTitle}>⚙️ Settings</h2>
          <p className={styles.cardDescription}>
            Configure your preferences and integrations. Coming soon: Notification settings.
          </p>
        </div>
      </div>
    </div>
  );
}
