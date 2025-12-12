import { redirect } from 'next/navigation';
import { getUser } from '@/lib/auth';
import styles from './auth.module.css';

export const metadata = {
  title: 'Dashboard - Manager',
  description: 'Manage your tasks with AI planning',
};

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.logo}>Manager</h1>
          <div className={styles.userSection}>
            <span className={styles.userEmail}>{user.email}</span>
            <a href="/api/auth/logout" className={styles.logoutButton}>
              Logout
            </a>
          </div>
        </div>
      </header>
      <main className={styles.main}>{children}</main>
    </div>
  );
}
