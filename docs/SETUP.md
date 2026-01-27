# Equipment Loan System Setup Guide

This guide walks you through setting up the Equipment Loan System locally and deploying it using Github Pages + Supabase.

## Prerequisites

- Github account
- Supabase account (free tier works great)
- Node.js (recommended for Supabase CLI)
- Vonage account (for SMS notifications)

## Step 1: Clone the Repository

```bash
git clone https://github.com/voidkirin026-tech/Equipment-Loan-System.git
cd Equipment-Loan-System
```

## Step 2: Supabase Setup

1. Create a new Supabase project
2. Create database tables using: `docs/DATABASE_SCHEMA.md`
3. Enable Row Level Security (RLS) (recommended)

## Step 3: Environment Variables

Create a `.env.local` file in the project root:

```.env
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
VONAGE_API_KEY=your-vonage-api-key
VONAGE_API_SECRET=your-vonage-api-secret
VONAGE_BRAND_NAME=EquipmentLoanSystem
```

⚠️ Never commit this file to Github

## Step 4: Frontend Configuration

Update Supabase credentials in your frontend Javascript files:

```javascript
const SUPABASE_URL = "https://your-project.supabase.co"
const SUPABASE_ANON_KEY = "your-anon-key"
```

Frontend logic lives in:

```dir
assets/js/
├── script.js
├── admin-dashboard.js
├── student-portal.js
├── barcode-scanner.js
└── report.js
```

## Step 5: Local Testing

You can run the app locally without a build step.

### Option 1: Open Directly

Open `index.html` in your browser

### Option 2: Local Server (recommended)

```bash
python -m http.server 8000
```

Visit:

```bash
http://localhost:8000
```

## Step 6: Supabase Edge Functions (SMS)

SMS notifications are handled by Supabase Edge Functions + Vonage.
Follow the full guide in:

```dir
docs/SUPABASE_EDGE_FUNCTIONS_SETUP.md
```

This includes:

- Creating Edge Functions
- Deploying functions
- Setting up cron jobs for reminders and overdue alerts

## Step 7: Deploying to Github Pages

1. Go to Repository > Settings > Pages
2. Source: Deploy from a branch
3. Branch: `main`
4. Folder: `/(root)`
5. Save

Deploy by pushing to `main`:

```bash
git add .
git commit -m "Deploy Equipment Loan System"
git push origin main
```

## Step 8: Pages Overview

- `index.html` > IT checkout page
- `admin-dashboard.html` > Admin dashboard
- `student-portal.html` > Student login & loans
- `barcode-scanner.html` > Barcode-based checkout
- `reports.html` > Reports & analytics

## Features

✅ Equipment checkout (manual + barcode)
✅ Real-time loan tracking
✅ Admin dashboard with tabs
✅ Student portal
✅ Overdue detection
✅ SMS notifications via Vonage
✅ Responsive UI with Tailwind CSS

## Next Steps (Future Enhancements)
