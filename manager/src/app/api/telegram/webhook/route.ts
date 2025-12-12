import { NextRequest, NextResponse } from 'next/server';
import { webhookCallback } from 'grammy';
import { bot } from '@/lib/telegram/bot';
import { createClient } from '@/lib/supabase/server';

if (!bot) {
  console.warn('Telegram bot not initialized - webhook will not function');
}

// Command handlers
if (bot) {
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
        const priorityMap: Record<string, string> = {
          high: '🔴',
          medium: '🟡',
          low: '🟢',
        };
        const priorityEmoji = priorityMap[task.priority] || '⚪';
        
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
}

// Export webhook handler
export async function POST(request: NextRequest) {
  if (!bot) {
    return NextResponse.json(
      { error: 'Telegram bot not configured' },
      { status: 503 }
    );
  }

  try {
    const handler = webhookCallback(bot, 'std/http');
    return await handler(request);
  } catch (error) {
    console.error('Error in Telegram webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
