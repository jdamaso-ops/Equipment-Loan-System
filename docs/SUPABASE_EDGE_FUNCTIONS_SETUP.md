# Supabase Edge Functions Setup

## Step 1: Install Supabase CLI

```bash
npm install -g supabase
```

## Step 2: Initialize Functions

```bash
supabase functions new send-overdue-emails
supabase functions new send-notifications
supabase functions new send-reminder-email
```

## Step 3: Create Environment Variables

Create `.env.local` in your project root:

```text
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your_service_key
RESEND_API_KEY=your-resend-api-key
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=your-twilio-number
```

## Step 4: Deploy Functions

```bash
supabase functions deploy send-overdue-emails
supabase functions deploy send-sms-notifications
supabase functions deploy send-reminder-email
```

## Step 5: Set Up Cron Job (for daily overdue checks)

In Supabase Dashboard:

- Go to Database > Cron Jobs
- Create new cron: `0 8 * * *` (8 AM daily)
- Function: `send-overdue-emails`

## Services to Sign Up for

- **Resend** (emails): resend.com
- **Twilio** (SMS): twilio.com
