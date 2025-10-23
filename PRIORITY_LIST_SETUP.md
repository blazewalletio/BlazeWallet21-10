# BLAZE Priority List Setup met Supabase

## Stap 1: Supabase Project Setup

1. Ga naar je Supabase project
2. Ga naar **SQL Editor**
3. Voer het bestand `supabase-schema.sql` uit

## Stap 2: Environment Variables

Voeg deze toe aan `.env.local`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Resend Email API (already configured)
RESEND_API_KEY=re_GSrnNH5V_NDNNHf7dDeFjEqJ2xR6CZeSx

# Telegram Bot (optional - voor later)
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_PRIORITY_GROUP_ID=your_telegram_group_id

# Admin Configuration
ADMIN_EMAILS=info@blazewallet.io
```

## Stap 3: Supabase Settings

### API Settings:
- Ga naar **Settings** → **API**
- Kopieer:
  - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
  - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Row Level Security (RLS):
De RLS policies zijn al in de schema. Dit zorgt voor:
- Public kan registreren
- Public kan eigen registratie lezen
- Alleen admins kunnen alles zien/bewerken

## Stap 4: Features Geïmplementeerd

### ✅ Backend Database (Supabase)
- PostgreSQL database
- Automatic position numbering
- Email verification system
- Referral tracking
- Early bird detection (eerste 500)
- Admin dashboard queries

### ✅ Email Verification
- Verification tokens met 24h expiry
- Email verification endpoints
- Verified badge in UI

### ✅ Admin Dashboard
- View all registrations
- Filter by verified/unverified
- Search by wallet/email
- Export to CSV
- Referral leaderboard
- Real-time stats

### ✅ Referral Rewards System
- Unique referral codes per user
- Track who referred who
- Leaderboard met top referrers
- Referral count in user dashboard

### ✅ Early Bird Bonus
- Eerste 500 registraties krijgen "Early Bird" badge
- Special messaging in emails
- Highlighted in dashboard

### ✅ Countdown Widget
- Embeddable countdown timer
- Share via social media
- Live updates

### ✅ Telegram Bot Setup
- Auto-invite priority members
- Notifications via Telegram
- Exclusive group access

### ✅ UI/UX Improvements
- Success animations
- Live validation
- Progressive forms
- Loading skeletons
- Better error messages

## Stap 5: Database Schema

Tabellen:
- `priority_list_registrations` - Main registrations
- `email_verification_tokens` - Email verification
- `admin_actions` - Admin activity log

Views:
- `priority_list_stats` - Real-time statistics
- `referral_leaderboard` - Top referrers

## Stap 6: API Endpoints

- `GET /api/priority-list` - Get stats & user data
- `POST /api/priority-list` - Register
- `GET /api/priority-list/verify` - Verify email
- `GET /api/priority-list/leaderboard` - Get leaderboard
- `GET /api/priority-list/admin` - Admin dashboard (protected)

## Stap 7: Admin Access

Admin emails configureren in `.env.local`:
```
ADMIN_EMAILS=info@blazewallet.io,admin@blazewallet.io
```

Admin dashboard: `/admin/priority-list`

## Volgende Stappen

1. ✅ Voer SQL schema uit in Supabase
2. ⏳ Voeg environment variables toe
3. ⏳ Test registratie flow
4. ⏳ Test email verificatie
5. ⏳ Test referral systeem
6. ⏳ Setup Telegram bot (optioneel)

## Telegram Bot Setup (Optioneel)

1. Maak bot via @BotFather
2. Krijg bot token
3. Maak private group
4. Voeg bot toe als admin
5. Get group ID via bot
6. Configureer in .env.local

Bot commando's:
- `/start` - Check priority list status
- `/referrals` - View your referrals
- `/leaderboard` - View top referrers

## Support

Bij problemen:
- Check Supabase logs in dashboard
- Check browser console
- Check server logs
- Verify environment variables

