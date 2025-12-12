# Epic 3: Quick Start Guide

**Get notifications working in 5 minutes!**

---

## Prerequisites

- Epic 1 & 2 completed (authentication and tasks working)
- Supabase project configured
- Node.js 18+ installed

---

## Step 1: Install Dependencies (1 min)

```bash
cd manager
npm install
```

Dependencies added:
- `web-push` - For push notifications
- `grammy` - For Telegram bot
- `nanoid` - For secure token generation

---

## Step 2: Generate VAPID Keys (1 min)

```bash
npx web-push generate-vapid-keys
```

You'll see output like:
```
Public Key: BG...xyz
Private Key: abc...123
```

---

## Step 3: Configure Environment (1 min)

Create or update `.env.local`:

```bash
# Existing Supabase config...
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key

# Add these new variables:
NEXT_PUBLIC_VAPID_PUBLIC_KEY=<paste_public_key>
VAPID_PRIVATE_KEY=<paste_private_key>
VAPID_SUBJECT=mailto:your-email@example.com

# Optional - for Telegram (skip for now)
# TELEGRAM_BOT_TOKEN=your_bot_token
# TELEGRAM_WEBHOOK_URL=https://your-domain.com/api/telegram/webhook
```

---

## Step 4: Run Database Migrations (1 min)

In Supabase SQL Editor, run these files in order:

### Migration 1: Push Subscriptions
```sql
-- Copy contents from: manager/supabase/migrations/003_push_subscriptions.sql
-- Paste and execute in Supabase SQL Editor
```

### Migration 2: Telegram Integration
```sql
-- Copy contents from: manager/supabase/migrations/004_telegram_integration.sql
-- Paste and execute in Supabase SQL Editor
```

---

## Step 5: Start Development Server (1 min)

```bash
npm run dev
```

Visit: http://localhost:3000

---

## Step 6: Test Push Notifications (2 min)

1. **Login** to your account
2. **Navigate** to `/dashboard/settings`
3. **Click** "Enable Notifications"
4. **Allow** browser permission when prompted
5. **Click** "Send Test Notification"
6. **Verify** notification appears!

✅ **Push notifications working!**

---

## Optional: Setup Telegram Bot (5 min)

### 1. Create Bot
1. Open Telegram
2. Search for `@BotFather`
3. Send `/newbot`
4. Follow instructions
5. Copy bot token

### 2. Add Token to Environment
```bash
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
```

### 3. Restart Server
```bash
npm run dev
```

### 4. Set Webhook (Production Only)
```bash
curl -X POST https://api.telegram.org/bot<YOUR_TOKEN>/setWebhook \
  -H "Content-Type: application/json" \
  -d '{"url": "https://your-domain.com/api/telegram/webhook"}'
```

### 5. Link Your Account
1. Go to `/dashboard/settings`
2. Click "Generate Linking Code"
3. Copy the command
4. Send to your bot in Telegram
5. Done! ✅

---

## Troubleshooting

### Push Notifications Not Working?

**Check 1: Service Worker Registered?**
- Open DevTools → Application → Service Workers
- Should see `/sw.js` registered

**Check 2: VAPID Keys Correct?**
- Verify keys in `.env.local`
- Restart dev server after changes

**Check 3: Browser Permission?**
- Check browser address bar for notification icon
- Try in Chrome/Firefox (best support)

**Check 4: Database Table Exists?**
```sql
SELECT * FROM push_subscriptions LIMIT 1;
```

### Telegram Bot Not Responding?

**Check 1: Token Correct?**
- Verify `TELEGRAM_BOT_TOKEN` in `.env.local`
- Test token: `https://api.telegram.org/bot<TOKEN>/getMe`

**Check 2: Webhook Set?**
- Only needed in production
- Development uses polling automatically

**Check 3: Database Tables?**
```sql
SELECT * FROM users LIMIT 1;
SELECT * FROM telegram_linking_tokens LIMIT 1;
```

---

## Quick Commands Reference

### Push Notifications
```bash
# Generate VAPID keys
npx web-push generate-vapid-keys

# Test notification (in browser console)
fetch('/api/notifications/test', { method: 'POST' })
```

### Telegram Bot
```bash
# Check bot info
curl https://api.telegram.org/bot<TOKEN>/getMe

# Set webhook
curl -X POST https://api.telegram.org/bot<TOKEN>/setWebhook \
  -d "url=https://your-domain.com/api/telegram/webhook"

# Delete webhook (for local dev)
curl -X POST https://api.telegram.org/bot<TOKEN>/deleteWebhook
```

### Database Queries
```sql
-- Check push subscriptions
SELECT user_id, active, created_at FROM push_subscriptions;

-- Check Telegram links
SELECT id, telegram_chat_id, telegram_username FROM users WHERE telegram_chat_id IS NOT NULL;

-- Check linking tokens
SELECT token, expires_at, used FROM telegram_linking_tokens WHERE used = false;
```

---

## Testing Checklist

### Push Notifications ✅
- [ ] Enable notifications in settings
- [ ] Send test notification
- [ ] Notification appears
- [ ] Click notification opens app
- [ ] Disable notifications works

### Telegram Bot ✅
- [ ] Generate linking code
- [ ] Link account via `/start`
- [ ] Add task with `/add`
- [ ] List tasks with `/list`
- [ ] Complete task with `/complete`
- [ ] Help command works

---

## Next Steps

With Epic 3 complete, you now have:
- ✅ Web Push notifications
- ✅ Telegram bot integration
- ✅ Multi-channel communication

**Ready for Epic 4: AI Planning & Scheduling!**

---

## Support

### Documentation
- Full story files in `docs/stories/`
- Implementation summary: `EPIC_3_IMPLEMENTATION_SUMMARY.md`
- API docs: `docs/API_DOCUMENTATION.md`

### Common Issues
- Service Worker not updating? Hard refresh (Ctrl+Shift+R)
- Permission denied? Check browser settings
- Bot not responding? Check token and restart server

---

**Need help?** Check the story files for detailed implementation guides!
