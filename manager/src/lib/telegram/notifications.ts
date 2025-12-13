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
  if (!bot) {
    return { 
      success: false, 
      error: 'Telegram bot not configured' 
    };
  }

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
  } catch (error: unknown) {
    const err = error as { message?: string };
    console.error('Error sending Telegram notification:', error);
    return { 
      success: false, 
      error: err.message || 'Unknown error'
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
