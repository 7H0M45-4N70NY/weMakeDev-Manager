# Story 3.3: Telegram Bot Setup & Linking

**Epic:** Epic 3 - Multi-Channel Notifications  
**Story ID:** 3.3  
**Status:** Ready for Development  
**Estimated Effort:** 7-9 hours  
**Priority:** High  
**Depends On:** Story 3.1, Story 3.2

---

## Story

As a User,  
I want to link my Telegram account,  
So that I can receive notifications and manage tasks via chat.

---

## Acceptance Criteria

### AC1: Telegram Bot Creation
**Given** I am setting up the Telegram integration  
**When** I create a bot via BotFather  
**Then** I receive a bot token  
**And** The bot is configured with proper commands

### AC2: Account Linking Flow
**Given** I am on the Settings page  
**When** I click "Link Telegram"  
**Then** I see a unique linking code  
**And** I can send `/start <code>` to the bot  
**And** My account is linked successfully

### AC3: Telegram Notifications
**Given** My Telegram account is linked  
**When** A notification is triggered  
**Then** I receive it via Telegram message  
**And** The message includes action buttons

### AC4: Task Management via Telegram
**Given** My Telegram account is linked  
**When** I send `/add <task description>` to the bot  
**Then** A new task is created  
**And** I receive a confirmation message

---

## Technical Implementation

### Tasks

#### Task 1: Create Telegram Bot
- [ ] Create bot via @BotFather
- [ ] Get bot token
- [ ] Configure bot commands
- [ ] Set bot description and profile picture
- [ ] Add bot token to environment variables

#### Task 2: Install Telegram Bot Library
- [ ] Install `grammy` package: `npm install grammy`
- [ ] Install types: `npm install -D @types/grammy`
- [ ] Configure bot instance

#### Task 3: Implement Telegram Webhook
- [ ] Create `src/app/api/telegram/webhook/route.ts`
- [ ] Set up webhook with Telegram
- [ ] Handle incoming messages
- [ ] Implement command handlers

#### Task 4: Implement Account Linking
- [ ] Add `telegram_chat_id` column to users table
- [ ] Create linking token generation
- [ ] Implement `/start` command handler
- [ ] Create linking UI in settings

#### Task 5: Implement Telegram Notifications
- [ ] Create `src/lib/telegram/notifications.ts`
- [ ] Implement `sendTelegramMessage()` function
- [ ] Add inline keyboard buttons
- [ ] Handle button callbacks

#### Task 6: Implement Task Commands
- [ ] Implement `/add` command handler
- [ ] Implement `/list` command handler
- [ ] Implement `/complete` command handler
- [ ] Add command validation

#### Task 7: Write Tests
- [ ] Test webhook handling
- [ ] Test command parsing
- [ ] Test account linking
- [ ] Test notification sending
- [ ] Test task creation via bot

---

## Implementation Details

### Database Schema Update

```sql
-- Add Telegram chat ID to users table
ALTER TABLE users ADD COLUMN telegram_chat_id BIGINT UNIQUE;
ALTER TABLE users ADD COLUMN telegram_username TEXT;
ALTER TABLE users ADD COLUMN telegram_linked_at TIMESTAMP WITH TIME ZONE;

-- Create linking tokens table
CREATE TABLE telegram_linking_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX idx_telegram_linking_tokens_token ON telegram_linking_tokens(token);
CREATE INDEX idx_telegram_linking_tokens_user_id ON telegram_linking_tokens(user_id);

-- Enable RLS
ALTER TABLE telegram_linking_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own linking tokens"
  ON telegram_linking_tokens
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

### Telegram Bot Configuration (`src/lib/telegram/bot.ts`)

```typescript
import { Bot, Context, InlineKeyboard } from 'grammy';

if (!process.env.TELEGRAM_BOT_TOKEN) {
  throw new Error('TELEGRAM_BOT_TOKEN is not defined');
}

export const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN);

// Configure bot commands
export async function configureBotCommands() {
  await bot.api.setMyCommands([
    { command: 'start', description: 'Start the bot and link your account' },
    { command: 'add', description: 'Add a new task' },
    { command: 'list', description: 'List your tasks' },
    { command: 'complete', description: 'Mark a task as complete' },
    { command: 'help', description: 'Show help message' },
  ]);
}

// Helper to create inline keyboard
export function createInlineKeyboard(buttons: Array<{
  text: string;
  callback_data: string;
}>): InlineKeyboard {
  const keyboard = new InlineKeyboard();
  
  buttons.forEach((button, index) => {
    keyboard.text(button.text, button.callback_data);
    if (index < buttons.length - 1) {
      keyboard.row();
    }
  });
  
  return keyboard;
}

// Helper to send message with retry
export async function sendMessage(
  chatId: number,
  text: string,
  options?: any
): Promise<boolean> {
  try {
    await bot.api.sendMessage(chatId, text, options);
    return true;
  } catch (error) {
    console.error('Error sending Telegram message:', error);
    return false;
  }
}
```

### Telegram Webhook Handler (`src/app/api/telegram/webhook/route.ts`)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { webhookCallback } from 'grammy';
import { bot } from '@/lib/telegram/bot';
import { createClient } from '@/lib/supabase/server';
import { nanoid } from 'nanoid';

// Command handlers
bot.command('start', async (ctx) => {
  const args = ctx.message?.text?.split(' ').slice(1);
  const linkingToken = args?.[0];

  if (!linkingToken) {
    await ctx.reply(
      'Welcome to Manager! 👋\n\n' +
      'To link your account:\n' +
      '1. Go to Settings in the Manager app\n' +
      '2. Click "Link Telegram"\n' +
      '3. Copy the linking code\n' +
      '4. Send /start <code> to this bot'
    );
    return;
  }

  // Verify and link account
  const supabase = await createClient();
  
  const { data: token, error } = await supabase
    .from('telegram_linking_tokens')
    .select('user_id, expires_at, used')
    .eq('token', linkingToken)
    .single();

  if (error || !token) {
    await ctx.reply('❌ Invalid linking code. Please try again.');
    return;
  }

  if (token.used) {
    await ctx.reply('❌ This linking code has already been used.');
    return;
  }

  if (new Date(token.expires_at) < new Date()) {
    await ctx.reply('❌ This linking code has expired. Please generate a new one.');
    return;
  }

  // Link account
  const chatId = ctx.chat?.id;
  const username = ctx.from?.username;

  const { error: updateError } = await supabase
    .from('users')
    .update({
      telegram_chat_id: chatId,
      telegram_username: username,
      telegram_linked_at: new Date().toISOString(),
    })
    .eq('id', token.user_id);

  if (updateError) {
    console.error('Error linking Telegram account:', updateError);
    await ctx.reply('❌ Failed to link account. Please try again.');
    return;
  }

  // Mark token as used
  await supabase
    .from('telegram_linking_tokens')
    .update({ used: true })
    .eq('token', linkingToken);

  await ctx.reply(
    '✅ Account linked successfully!\n\n' +
    'You can now:\n' +
    '• Receive notifications via Telegram\n' +
    '• Add tasks with /add <description>\n' +
    '• List tasks with /list\n' +
    '• Complete tasks with /complete\n\n' +
    'Type /help for more information.'
  );
});

bot.command('add', async (ctx) => {
  const chatId = ctx.chat?.id;
  
  if (!chatId) {
    await ctx.reply('❌ Unable to identify your account.');
    return;
  }

  // Get user from database
  const supabase = await createClient();
  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('telegram_chat_id', chatId)
    .single();

  if (!user) {
    await ctx.reply(
      '❌ Your account is not linked. Please use /start to link your account.'
    );
    return;
  }

  const taskText = ctx.message?.text?.replace('/add', '').trim();
  
  if (!taskText) {
    await ctx.reply('❌ Please provide a task description.\n\nExample: /add Call mom tomorrow');
    return;
  }

  // Create task
  const { data: task, error } = await supabase
    .from('tasks')
    .insert({
      user_id: user.id,
      title: taskText,
      status: 'pending',
      priority: 'medium',
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating task:', error);
    await ctx.reply('❌ Failed to create task. Please try again.');
    return;
  }

  await ctx.reply(
    `✅ Task created successfully!\n\n` +
    `📝 ${task.title}\n` +
    `🔖 Priority: ${task.priority}\n` +
    `📅 Status: ${task.status}`
  );
});

bot.command('list', async (ctx) => {
  const chatId = ctx.chat?.id;
  
  if (!chatId) {
    await ctx.reply('❌ Unable to identify your account.');
    return;
  }

  // Get user from database
  const supabase = await createClient();
  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('telegram_chat_id', chatId)
    .single();

  if (!user) {
    await ctx.reply(
      '❌ Your account is not linked. Please use /start to link your account.'
    );
    return;
  }

  // Fetch tasks
  const { data: tasks, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'pending')
    .order('priority', { ascending: false })
    .order('created_at', { ascending: true })
    .limit(10);

  if (error) {
    console.error('Error fetching tasks:', error);
    await ctx.reply('❌ Failed to fetch tasks. Please try again.');
    return;
  }

  if (!tasks || tasks.length === 0) {
    await ctx.reply('📭 You have no pending tasks. Great job!');
    return;
  }

  const taskList = tasks
    .map((task, index) => {
      const priorityEmoji = {
        high: '🔴',
        medium: '🟡',
        low: '🟢',
      }[task.priority] || '⚪';
      
      return `${index + 1}. ${priorityEmoji} ${task.title}`;
    })
    .join('\n');

  await ctx.reply(
    `📋 Your pending tasks:\n\n${taskList}\n\n` +
    `Use /complete <number> to mark a task as complete.`
  );
});

bot.command('complete', async (ctx) => {
  const chatId = ctx.chat?.id;
  
  if (!chatId) {
    await ctx.reply('❌ Unable to identify your account.');
    return;
  }

  // Get user from database
  const supabase = await createClient();
  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('telegram_chat_id', chatId)
    .single();

  if (!user) {
    await ctx.reply(
      '❌ Your account is not linked. Please use /start to link your account.'
    );
    return;
  }

  const taskNumber = ctx.message?.text?.replace('/complete', '').trim();
  
  if (!taskNumber || isNaN(parseInt(taskNumber))) {
    await ctx.reply('❌ Please provide a task number.\n\nExample: /complete 1');
    return;
  }

  // Fetch tasks
  const { data: tasks } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'pending')
    .order('priority', { ascending: false })
    .order('created_at', { ascending: true });

  if (!tasks || tasks.length === 0) {
    await ctx.reply('📭 You have no pending tasks.');
    return;
  }

  const taskIndex = parseInt(taskNumber) - 1;
  
  if (taskIndex < 0 || taskIndex >= tasks.length) {
    await ctx.reply(`❌ Invalid task number. Please choose between 1 and ${tasks.length}.`);
    return;
  }

  const task = tasks[taskIndex];

  // Mark task as complete
  const { error } = await supabase
    .from('tasks')
    .update({ status: 'completed' })
    .eq('id', task.id);

  if (error) {
    console.error('Error completing task:', error);
    await ctx.reply('❌ Failed to complete task. Please try again.');
    return;
  }

  await ctx.reply(`✅ Task completed!\n\n📝 ${task.title}`);
});

bot.command('help', async (ctx) => {
  await ctx.reply(
    '📚 Manager Bot Commands:\n\n' +
    '/start - Link your account\n' +
    '/add <description> - Add a new task\n' +
    '/list - List your pending tasks\n' +
    '/complete <number> - Mark a task as complete\n' +
    '/help - Show this help message\n\n' +
    'Need more help? Visit the Manager app settings.'
  );
});

// Handle callback queries (button clicks)
bot.on('callback_query:data', async (ctx) => {
  const data = ctx.callbackQuery.data;
  
  // Parse callback data (format: action:taskId)
  const [action, taskId] = data.split(':');

  if (action === 'complete_task') {
    const supabase = await createClient();
    
    const { error } = await supabase
      .from('tasks')
      .update({ status: 'completed' })
      .eq('id', taskId);

    if (error) {
      await ctx.answerCallbackQuery({ text: '❌ Failed to complete task' });
      return;
    }

    await ctx.answerCallbackQuery({ text: '✅ Task completed!' });
    await ctx.editMessageText('✅ Task marked as complete!');
  }
});

// Export webhook handler
export const POST = webhookCallback(bot, 'std/http');
```

### Telegram Notifications Utility (`src/lib/telegram/notifications.ts`)

```typescript
import { createClient } from '@/lib/supabase/server';
import { bot, createInlineKeyboard } from './bot';

export interface TelegramNotificationPayload {
  title: string;
  body: string;
  taskId?: string;
  actions?: Array<{
    text: string;
    action: string;
  }>;
}

export async function sendTelegramNotification(
  userId: string,
  payload: TelegramNotificationPayload
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    
    // Get user's Telegram chat ID
    const { data: user, error } = await supabase
      .from('users')
      .select('telegram_chat_id')
      .eq('id', userId)
      .single();

    if (error || !user?.telegram_chat_id) {
      return { 
        success: false, 
        error: 'User has not linked Telegram account' 
      };
    }

    const message = `*${payload.title}*\n\n${payload.body}`;
    
    // Create inline keyboard if actions are provided
    let keyboard;
    if (payload.actions && payload.actions.length > 0) {
      const buttons = payload.actions.map(action => ({
        text: action.text,
        callback_data: `${action.action}:${payload.taskId || ''}`,
      }));
      keyboard = createInlineKeyboard(buttons);
    }

    await bot.api.sendMessage(user.telegram_chat_id, message, {
      parse_mode: 'Markdown',
      reply_markup: keyboard,
    });

    return { success: true };
  } catch (error: any) {
    console.error('Error sending Telegram notification:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
}

export async function sendBulkTelegramNotifications(
  userIds: string[],
  payload: TelegramNotificationPayload
): Promise<{
  successful: number;
  failed: number;
}> {
  const results = await Promise.allSettled(
    userIds.map(userId => sendTelegramNotification(userId, payload))
  );

  let successful = 0;
  let failed = 0;

  results.forEach(result => {
    if (result.status === 'fulfilled' && result.value.success) {
      successful++;
    } else {
      failed++;
    }
  });

  return { successful, failed };
}
```

### Linking UI Component (`src/features/telegram/TelegramLinking.tsx`)

```typescript
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
```

### Linking API Endpoints

```typescript
// src/app/api/telegram/link/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { nanoid } from 'nanoid';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Generate linking token
    const token = nanoid(10);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const { error } = await supabase
      .from('telegram_linking_tokens')
      .insert({
        user_id: user.id,
        token,
        expires_at: expiresAt.toISOString(),
      });

    if (error) {
      console.error('Error creating linking token:', error);
      return NextResponse.json(
        { error: 'Failed to generate linking code' },
        { status: 500 }
      );
    }

    return NextResponse.json({ token });
  } catch (error) {
    console.error('Error in link endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// src/app/api/telegram/unlink/route.ts
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { error } = await supabase
      .from('users')
      .update({
        telegram_chat_id: null,
        telegram_username: null,
        telegram_linked_at: null,
      })
      .eq('id', user.id);

    if (error) {
      console.error('Error unlinking Telegram:', error);
      return NextResponse.json(
        { error: 'Failed to unlink account' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in unlink endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// src/app/api/telegram/status/route.ts
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('users')
      .select('telegram_chat_id, telegram_username')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error fetching Telegram status:', error);
      return NextResponse.json(
        { error: 'Failed to fetch status' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      isLinked: !!data.telegram_chat_id,
      username: data.telegram_username,
    });
  } catch (error) {
    console.error('Error in status endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

---

## Environment Variables

Add to `.env.local`:

```bash
# Telegram Bot
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_WEBHOOK_URL=https://your-domain.com/api/telegram/webhook
```

---

## Dependencies

```json
{
  "dependencies": {
    "grammy": "^1.21.1",
    "nanoid": "^5.0.4"
  },
  "devDependencies": {
    "@types/grammy": "^1.21.1"
  }
}
```

---

## Setup Instructions

1. **Create Telegram Bot:**
   ```
   1. Open Telegram and search for @BotFather
   2. Send /newbot
   3. Follow instructions to create bot
   4. Copy bot token
   5. Add token to .env.local
   ```

2. **Configure Webhook:**
   ```bash
   curl -X POST https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook \
     -H "Content-Type: application/json" \
     -d '{"url": "https://your-domain.com/api/telegram/webhook"}'
   ```

3. **Set Bot Commands:**
   - The commands will be set automatically when the bot starts
   - Or manually via BotFather: /setcommands

---

## Testing Strategy

### Manual Testing

1. **Test Bot Creation:**
   - Verify bot responds to /start
   - Check commands are configured

2. **Test Account Linking:**
   - Generate linking code
   - Send /start with code to bot
   - Verify account is linked

3. **Test Task Commands:**
   - Send /add command
   - Verify task is created
   - Send /list command
   - Send /complete command

4. **Test Notifications:**
   - Trigger notification from app
   - Verify message received in Telegram
   - Test action buttons

### Unit Tests

```typescript
// src/lib/telegram/notifications.test.ts
import { sendTelegramNotification } from './notifications';

describe('Telegram Notifications', () => {
  it('should send notification to linked user', async () => {
    const result = await sendTelegramNotification('user-id', {
      title: 'Test',
      body: 'Test notification',
    });
    expect(result.success).toBe(true);
  });

  it('should handle unlinked user', async () => {
    const result = await sendTelegramNotification('unlinked-user-id', {
      title: 'Test',
      body: 'Test notification',
    });
    expect(result.success).toBe(false);
    expect(result.error).toContain('not linked');
  });
});
```

---

## Verification Steps

1. **Create and configure bot**
2. **Set up webhook**
3. **Test account linking flow**
4. **Test all bot commands**
5. **Test notification delivery**
6. **Test action buttons**
7. **Test unlinking**

---

## Definition of Done

- [ ] Telegram bot created and configured
- [ ] Webhook handler implemented
- [ ] Account linking working
- [ ] All commands implemented
- [ ] Notification sending working
- [ ] Action buttons working
- [ ] Database schema updated
- [ ] API endpoints implemented
- [ ] UI components created
- [ ] Tests written and passing
- [ ] Documentation updated
- [ ] Code reviewed and merged

---

## Notes

- Bot token must be kept secure
- Webhook requires HTTPS in production
- Test with multiple users
- Consider rate limiting for commands
- Add error logging for debugging

---

## References

- [Telegram Bot API](https://core.telegram.org/bots/api)
- [grammY Documentation](https://grammy.dev/)
- [BotFather Guide](https://core.telegram.org/bots#6-botfather)
