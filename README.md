# Equipment Loan System

A simple, easy-to-deploy equipment checkout and loan tracking system for students.

## Live Site

```link
https://jdamaso-ops.github.io/Equipment-Loan-System

## Features

- 📋 Equipment checkout form for IT staff
- 📦 Equipment inventory database
- 📅 Active loan tracking with due dates
- ⏰ Automatic overdue status detection
- 🔄 Equipment return functionality
- 👨‍💼 Admin dashboard with reports
- 🎓 Student portal (login, active loans, history)
- 📲 SMS notifications via Vonage
- 📷 Barcode scanning support
- 📱 Responsive design

## Tech Stack

- **Frontend:** HTML, Tailwind CSS, Javascript
- **Backend / API:** Supabase (PostgreSQL + Edge Functions)
- **SMS Provider:** Vonage (Nexmo)
- **Hosting:** Github Pages
- **Database:** Supabase Free Tier

## Quick Start

1. Create a Supabase account
2. Set up database tables (see `docs/DATABASE_SCHEMA.md`)
3. Configure environment variables for Supabase + Vonage
4. Add your Supabase credentials to `assets/script.js`
5. Deploy to Github Pages (automatic on push to `main`)

## Usage

**For IT Staff:**

1. Check out equipment via form or barcode scanner
2. Equipment status updates automatically
3. Mark items as returned in admin dashboard

**For Admins:**

- View system overview
- Manage equipment inventory
- Monitor overdue loans
- Generate reports

**For Students:**

- Log in to view active loans
- View loan history
- Receive SMS reminders

## Project Structure

``` dir
Equipment-Loan-System/
├── index.html # Landing / IT checkout page
├── admin-dashboard.html # Admin dashboard (tabs & reports)
├── student-portal.html # Student login & loan view
├── barcode-scanner.html # Barcode-based checkout
├── reports.html # Standalone reports page
│
├── assets/
│ ├── js/
│ │ ├── script.js # Main checkout logic
│ │ ├── admin-dashboard.js # Admin dashboard logic
│ │ ├── student-portal.js # Student auth & dashboard
│ │ ├── barcode-scanner.js # Barcode scanning logic
│ │ └── report.js # Reports & exports
│ └── styles/ # (optional) legacy or custom styles
│
├── supabase/
│ └── functions/
│ ├── send-sms-notification/ # Vonage SMS sender
│ ├── send-overdue-alerts/ # Daily overdue checks
│ └── send-reminder-alerts/ # Due-soon reminders
│
├── docs/
│ ├── DATABASE_SCHEMA.md
│ ├── SUPABASE_EDGE_FUNCTIONS_SETUP.md
│ ├── DEPLOYMENT.md
│ └── SETUP.md
│
├── README.md
└── LICENSE
```

## Notifications (Vonage)

The system uses Vonage SMS API for:

- Overdue alerts
- Due-date reminders
- Checkout confirmations (optional)

All SMS logic lives inside Supabase Edge Functions and runs securely using environment variables

## Deployed Site

Will be added later 👍

## Future Enhancements

None for now 😄

## License

MIT License - See LICENSE file for details

## Support

For issues or questions, create a Github Issue in this repository.
