import { Metadata } from 'next';
import NotificationSettings from '@/features/notifications/NotificationSettings';
import TelegramLinking from '@/features/telegram/TelegramLinking';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Settings - Manager',
  description: 'Manage your notification preferences',
};

export default function SettingsPage() {
  return (
    <div className={styles.container}>
      <h1>Settings</h1>
      
      <div className={styles.section}>
        <NotificationSettings />
      </div>

      <div className={styles.section}>
        <TelegramLinking />
      </div>
    </div>
  );
}
