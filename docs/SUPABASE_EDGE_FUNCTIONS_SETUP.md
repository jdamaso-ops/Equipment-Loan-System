# Supabase Edge Functions Setup (Vonage)

This guide explains how to set up Supabase Edge Functions for SMS notifications using Vonage (Nexmo).

## Prerequisites

- Node.js (LTS)
- Supabase account
- Vonage account with SMS enabled

## Step 1: Install Supabase CLI

```bash
npm install -g supabase
```

Login:

```bash
supabase login
```

## Step 2: Initialize Supabase Functions

From your project root:

```bash
supabase init
```

Create the required Edge Functions:

```bash
supabase functions new send-overdue-emails
supabase functions new send-notifications
supabase functions new send-reminder-email
```

This creates:

```dir
supabase/
└── functions/
├── send-sms-notification/
├── send-overdue-alerts/
└── send-reminder-alerts/
```

## Step 3: Create Environment Variables

Create `.env.local` in your project root:

```.env
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your_service_key
RESEND_API_KEY=your-resend-api-key
VONAGE_API_KEY=your-vonage-api-key
VONAGE_API_SECRET=your-vonage-api-secret
VONAGE_BRAND_NAME=EquipmentLoanSystem
```

⚠️ Never commit `.env.local` to Github

## Step 4: Vonage SMS Notes

- SMS messages are sent using the Vonage Messages API
- Phone numbers must be in E.164 format (e.g. `+63XXXXXXXXX`)
- The `VONAGE_BRAND_NAME` is the sender name displayed on SMS

## Step 5: Deploy Edge Functions

Deploy each function individually:

```bash
supabase functions deploy send-sms-notifications
supabase functions deploy send-overdue-alerts
supabase functions deploy send-reminder-alerts
```

After deployment, Supabase will give you public function URLs.

## Step 6: Scheduled Jobs (Overdue Checks)

In the Supabase Dashboard:

1. Go to Database > Cron Jobs
2. Create a new cron job
3. Schedule: ```0 8 * * *```
4. Select function: ```send-overdue-alerts```

This runs daily at 8:00 AM to send overdue SMS alerts.

## Step 7: Calling Functions from the Frontend

Use `fetch` from your frontend JS:

```javascript
await fetch("https://PROJECT_ID.functions.supabase.co/send-sms-notifications", {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify({
        phone: "+639XXXXXXXXX",
        message: "Your equipment loan is due tomorrow."
    })
})
```

## Step 8: Recommended SMS Triggers

- ✅ Checkout confirmation
- ⏰ Due-date reminder (1-2 days before)
- ❗ Overdue alert

All logic should live in Edge Functions, not frontend JS.

## Step 9: Services Used

- **Supabase:** Database, Auth, Edge Functions
- **Vonage (Nexmo):** SMS delivery

## Troubleshooting

- Ensure phone numbers include country code
- Check Supabase functions logs
- Verify Vonage balance and SMS permissions
