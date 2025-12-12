import { getUser } from '@/lib/auth';
import { DashboardContent } from './DashboardContent';
import styles from './dashboard.module.css';

export const metadata = {
  title: 'Dashboard - Manager',
  description: 'Your task management dashboard',
};

export default async function DashboardPage() {
  const user = await getUser();
  const userName = user?.email?.split('@')[0] || 'there';

  return (
    <div className={styles.container}>
      <div className={styles.welcome}>
        <h1 className={styles.title}>Welcome back, {userName}!</h1>
        <p className={styles.subtitle}>
          Your AI-powered task management system is ready to help you organize your day.
        </p>
      </div>

      <DashboardContent />
    </div>
  );
}
