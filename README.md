# Equipment Loan System

A simple, easy-to-deploy equipment checkout and loan tracking system for students.

## Features

- 📋 Equipment checkout form for IT staff
- 📦 Equipment inventory database
- 📅 Active loan tracking with due dates
- ⏰ Automatic overdue status detection
- 🔄 Equipment return functionality
- 📱 Responsive design

## Tech Stack

- **Frontend:** HTML, CSS, Javascript
- **Backend:** Supabase (PostgreSQL)
- **Hosting:** Github Pages
- **Database:** Supabase Free Tier

## Quick Start

1. Create a Supabase account
2. Set up database tables (see `docs/DATABASE_SCHEMA.md`)
3. Add your Supabase credentials to `assets/script.js`
4. Deploy to Github Pages (automatic on push to `main`)

## Usage

**For IT Staff:**

1. Fill out the checkout form with student in"fo and equipment details
2. Equipment status automatically updates to "On Loan"
3. Click "Return" button when equipment is returned

**For Students:**

- View active loans (future feature with login)
- Receive overdue notifications (future feature)

## Project Structure

``` dir
Equipment-Loan-System/
├── index.html              # Main application page
├── assets/
│   ├── style.css          # Styling
│   └── script.js          # Frontend logic
├── docs/
│   ├── DATABASE_SCHEMA. md # Database setup
│   ├── SETUP.md           # Installation guide
│   └── DEPLOYMENT.md      # Deployment details
└── README.md
```

## Deployed Site

Will be added later 👍

## Future Enhancements

- [ ] Automated overdue email notifications
- [ ] Student portal with login
- [ ] Loan history and reports
- [ ] Equipment maintenance tracking
- [ ] SMS notifications
- [ ] Barcode scanning

## License

MIT License - See LICENSE file for details

## Support

For issues or questions, create a Github Issue in this repository.
