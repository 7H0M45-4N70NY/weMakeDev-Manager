import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
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
      isLinked: !!data?.telegram_chat_id,
      username: data?.telegram_username,
    });
  } catch (error) {
    console.error('Error in status endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
