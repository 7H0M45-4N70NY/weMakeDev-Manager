import { LoginForm } from '@/features/auth/LoginForm';
import styles from './login.module.css';

export const metadata = {
  title: 'Sign In - Manager',
  description: 'Sign in to your Manager account',
};

export default function LoginPage() {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>Manager</h1>
          <p className={styles.subtitle}>Task Management & AI Planning</p>
        </div>
        <LoginForm isSignUp={false} />
      </div>
    </div>
  );
}
