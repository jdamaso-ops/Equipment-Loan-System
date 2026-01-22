# Deployment Guide

## Github Pages Deployment (Current)

Your site is automatically deployed to Github Pages when you push to the `main` branch.

**Site URL:** To be added later

## Adding Email Notifications (Future)

### Option 1: Supabase Edge Functions + Resend

```javascript
// Create a cron job in Supabase to check for overdue loans daily
// Use Resend API to send emails to students
```

### Option 2: Simple Webhook

- Set up a free service like Uptime Robot or Make.com
- Trigger daily check for overdue loans
- Send emails via SendGrid API

## Security Notes

- Your Supabase anon is public (intentional for front-end apps)
- Use Row Level Security (RLS) in Supabase for production
- Never commit real credentials to Github
- Use environment variables for sensitive data

## Monitoring

1. Check Supabase dashboard for:
    - Database size
    - API Usage
    - Logs

2. Monitor Github Pages build status in Actions tab
