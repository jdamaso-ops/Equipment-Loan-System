# Equipment Loan System Setup Guide

## Prerequisites

- Github account
- Supabase account (free tier works great)

## Local Testing

1. **Clone the repository:**

    ```bash
    git clone https://github.com/voidkirin026-tech/Equipment-Loan-System.git
    cd Equipment-Loan-System
    ```

2. **Create Supabase project and tables** (see DATABASE_SCHEMA.md)
3. **Update API credentials in `assets/script.js`**
4. **Open in browser**
    - Simply open `index.html` in your browser
    - Or use a local server: `python -m http.server 8000`
    - Visit: `https://localhost:8000`

## Deploying to Github Pages

1. **Enable Github Pages:**
    - Go to Settings > Pages
    - Source: Deploy from a branch
    - Branch: `main`, folder: `/(root)`
    - Save
2. **Push your code:**

    ```bash
    git add .
    git commit -m "Initial Equipment Loan System"
    git push origin main
    ```

3. **Access your site:**
    - To be added later

## Features

✅IT staff can check out equipment via form
✅Equipment database tracks all items
✅Active loans displayed in real-time table
✅Return equipment button
✅Overdue status detection
✅Notes for each loan
✅Responsive design

## Next Steps (Future Enhancements)

- [ ] Automated overdue email notifications (Supabase Edge functions)
- [ ] Student login to view their loans
- [ ] Admin dashboard
- [ ] Equipment inventory management
- [ ] Loan history reports
