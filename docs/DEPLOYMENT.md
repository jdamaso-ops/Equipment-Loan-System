# Deployment Guide

## Github Pages Deployment (Current)

The frontend is automatically deployed to Github Pages whenever you push to the `main` branch.

**Site URL:** To be added later

## Backend Deployment (Supabase)

This project uses Supabase for:

- PostgreSQL database
- Authentication (students / admins)
- Edge Functions (SMS notifications)

All backend services are deployed and managed via the Supabase Dashboard and CLI.

## SMS Notifications (Vonage)

SMS notifications are handled using Supabase Edge Functions + Vonage (Nexmo).

### Deployed Edge Functions

- `send-sms-notification` — immediate SMS (checkout confirmations, manual triggers)
- `send-reminder-alerts` — due-date reminders
- `send-overdue-alerts` — overdue loan alerts

These functions are deployed using:

```bash
supabase functions deploy <function-name>
```

## Scheduled Jobs (Cron)

Overdue and reminder checks are automated using Supabase Cron Jobs.

### Example: Daily Overdue Check

- **Schedule:** `0 8 * * *` (8:00 AM daily)
- **Function:** `send-overdue-alerts`

This job:

1. Queries overdue loans
2. Sends SMS alerts via Vonage
3. Logs delivery results

## Environment Variables

Sensitive credentials are stored securely using environment variables:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `VONAGE_API_KEY`
- `VONAGE_API_SECRET`
- `VONAGE_BRAND_NAME`

⚠️ Never commit secrets to Github.

## Security Notes

- Supabase anon key is public by design (frontend access)
- Service role key is used only inside Edge Functions
- Enable Row Level Security (RLS) for all production tables
- Validate user roles (admin vs student) in Edge Functions

## Monitoring Logs

### Supabase

- Database size and performance
- Edge Function logs
- Cron jobs execution status
- API Usage

### Github

- Github Pages deployment status
- Build logs under the Actions tab
