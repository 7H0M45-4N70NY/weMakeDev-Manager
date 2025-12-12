'use client';

import { useState, useEffect } from 'react';
import styles from './TelegramLinking.module.css';

export default function TelegramLinking() {
  const [linkingCode, setLinkingCode] = useState<string | null>(null);
  const [isLinked, setIsLinked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    checkLinkingStatus();
  }, []);

  async function checkLinkingStatus() {
    try {
      const response = await fetch('/api/telegram/status');
      const data = await response.json();
      setIsLinked(data.isLinked);
    } catch (error) {
      console.error('Error checking Telegram status:', error);
    }
  }

  async function generateLinkingCode() {
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/telegram/link', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to generate linking code');
      }

      const data = await response.json();
      setLinkingCode(data.token);
      setMessage({ 
        type: 'success', 
        text: 'Linking code generated! Send it to the bot.' 
      });
    } catch (error) {
      console.error('Error generating linking code:', error);
      setMessage({ 
        type: 'error', 
        text: 'Failed to generate linking code. Please try again.' 
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function unlinkAccount() {
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/telegram/unlink', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to unlink account');
      }

      setIsLinked(false);
      setLinkingCode(null);
      setMessage({ 
        type: 'success', 
        text: 'Telegram account unlinked successfully.' 
      });
    } catch (error) {
      console.error('Error unlinking account:', error);
      setMessage({ 
        type: 'error', 
        text: 'Failed to unlink account. Please try again.' 
      });
    } finally {
      setIsLoading(false);
    }
  }

  function copyToClipboard() {
    if (linkingCode) {
      navigator.clipboard.writeText(`/start ${linkingCode}`);
      setMessage({ 
        type: 'success', 
        text: 'Command copied to clipboard!' 
      });
    }
  }

  return (
    <div className={styles.container}>
      <h2>Telegram Integration</h2>
      
      <div className={styles.status}>
        <span className={styles.label}>Status:</span>
        <span className={`${styles.badge} ${isLinked ? styles.linked : styles.notLinked}`}>
          {isLinked ? 'Linked' : 'Not Linked'}
        </span>
      </div>

      {message && (
        <div className={`${styles.message} ${styles[message.type]}`}>
          {message.text}
        </div>
      )}

      {!isLinked ? (
        <>
          <p className={styles.description}>
            Link your Telegram account to receive notifications and manage tasks via chat.
          </p>

          {!linkingCode ? (
            <button
              onClick={generateLinkingCode}
              disabled={isLoading}
              className={styles.primaryButton}
            >
              {isLoading ? 'Generating...' : 'Generate Linking Code'}
            </button>
          ) : (
            <div className={styles.linkingInstructions}>
              <h3>Follow these steps:</h3>
              <ol>
                <li>Open Telegram and search for <strong>@YourBotName</strong></li>
                <li>Send this command to the bot:</li>
              </ol>
              
              <div className={styles.codeBlock}>
                <code>/start {linkingCode}</code>
                <button onClick={copyToClipboard} className={styles.copyButton}>
                  Copy
                </button>
              </div>

              <p className={styles.note}>
                This code expires in 10 minutes.
              </p>
            </div>
          )}
        </>
      ) : (
        <>
          <p className={styles.description}>
            Your Telegram account is linked. You can now receive notifications and manage tasks via Telegram.
          </p>

          <div className={styles.features}>
            <h3>Available Commands:</h3>
            <ul>
              <li><code>/add &lt;description&gt;</code> - Add a new task</li>
              <li><code>/list</code> - List your pending tasks</li>
              <li><code>/complete &lt;number&gt;</code> - Mark a task as complete</li>
              <li><code>/help</code> - Show help message</li>
            </ul>
          </div>

          <button
            onClick={unlinkAccount}
            disabled={isLoading}
            className={styles.dangerButton}
          >
            {isLoading ? 'Unlinking...' : 'Unlink Telegram Account'}
          </button>
        </>
      )}
    </div>
  );
}
