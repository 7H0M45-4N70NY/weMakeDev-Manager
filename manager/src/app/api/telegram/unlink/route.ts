import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST() {
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
