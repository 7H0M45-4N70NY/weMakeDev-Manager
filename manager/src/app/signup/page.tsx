import { LoginForm } from '@/features/auth/LoginForm';
import styles from './signup.module.css';

export const metadata = {
  title: 'Sign Up - Manager',
  description: 'Create a new Manager account',
};

export default function SignUpPage() {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>Manager</h1>
          <p className={styles.subtitle}>Task Management & AI Planning</p>
        </div>
        <LoginForm isSignUp={true} />
      </div>
    </div>
  );
}
