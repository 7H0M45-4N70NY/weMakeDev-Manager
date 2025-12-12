import { Bot, InlineKeyboard } from 'grammy';

if (!process.env.TELEGRAM_BOT_TOKEN) {
  console.warn('TELEGRAM_BOT_TOKEN is not defined - Telegram features will be disabled');
}

export const bot = process.env.TELEGRAM_BOT_TOKEN 
  ? new Bot(process.env.TELEGRAM_BOT_TOKEN)
  : null;

// Configure bot commands
export async function configureBotCommands() {
  if (!bot) {
    console.warn('Bot not initialized - skipping command configuration');
    return;
  }

  try {
    await bot.api.setMyCommands([
      { command: 'start', description: 'Start the bot and link your account' },
      { command: 'add', description: 'Add a new task' },
      { command: 'list', description: 'List your tasks' },
      { command: 'complete', description: 'Mark a task as complete' },
      { command: 'help', description: 'Show help message' },
    ]);
  } catch (error) {
    console.error('Error configuring bot commands:', error);
  }
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
  if (!bot) {
    console.error('Bot not initialized');
    return false;
  }

  try {
    await bot.api.sendMessage(chatId, text, options);
    return true;
  } catch (error) {
    console.error('Error sending Telegram message:', error);
    return false;
  }
}
