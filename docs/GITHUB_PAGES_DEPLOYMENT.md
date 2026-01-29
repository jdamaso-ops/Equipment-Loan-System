# Equipment Loan System - Deployment Guide

## GitHub Pages Deployment

Your Equipment Loan System is now configured for GitHub Pages deployment.

### Important Notes

1. **Frontend Only**: GitHub Pages serves only static files (HTML, CSS, JavaScript). Your Supabase backend handles all data operations.

2. **Supabase Edge Functions**: These remain in your Supabase project and are NOT deployed to GitHub Pages. They run on Supabase's servers.

3. **What Gets Deployed**:
   - All `.html` files (index.html, login.html, register.html, admin-login.html, etc.)
   - All files in `assets/` folder (JavaScript and CSS)
   - `README.md` and `LICENSE`

4. **What Does NOT Get Deployed**:
   - `supabase/` folder (stays in your Supabase project)
   - `docs/` folder (documentation only)
   - `node_modules/` (if you add any)

### Automatic Deployment

The GitHub Actions workflow (`.github/workflows/deploy.yml`) automatically deploys your application whenever you push to the `main` branch.

### Manual Deployment Steps

1. **Commit your changes**:
   ```bash
   git add .
   git commit -m "Update Equipment Loan System"
   ```

2. **Push to GitHub**:
   ```bash
   git push origin main
   ```

3. **GitHub Pages will automatically deploy** (takes 1-2 minutes)

### Access Your Deployed Site

Once deployed, your app will be available at:
```
https://voidkirin026-tech.github.io/Equipment-Loan-System/
```

### Enable GitHub Pages in Repository Settings

If not already enabled:
1. Go to your GitHub repository
2. Settings → Pages
3. Source: Deploy from a branch
4. Branch: `gh-pages` (should be auto-created)
5. Folder: `/ (root)`
6. Save

### Browser Console CORS Note

Your Supabase credentials (SUPABASE_URL and SUPABASE_KEY) are publicly visible in the browser. This is expected for web applications using Supabase's anonymous authentication. The keys have Row Level Security (RLS) policies that prevent unauthorized data access.

### Troubleshooting

**Issue**: Site returns 404 after deployment
- **Solution**: Make sure GitHub Pages is enabled and the branch is set to `gh-pages`

**Issue**: Supabase API errors
- **Solution**: Verify your SUPABASE_URL and SUPABASE_KEY are correct in the HTML files

**Issue**: Admin login not working
- **Solution**: Ensure localStorage is enabled in your browser settings

## File Structure for GitHub Pages

```
Equipment-Loan-System/
├── index.html                 ← Main entry point
├── login.html                 ← Student login
├── register.html              ← Student registration
├── admin-login.html           ← Admin login
├── admin-dashboard.html       ← Admin panel
├── barcode-scanner.html       ← Equipment scanner
├── student-portal.html        ← Student dashboard
├── reports.html               ← Reports page
├── assets/
│   ├── script.js
│   ├── student-portal.js
│   ├── admin-dashboard.js
│   ├── barcode-scanner.js
│   ├── report.js
│   ├── input.css
│   └── db.js
├── .github/workflows/         ← GitHub Actions (auto-deployment)
└── supabase/                  ← ⚠️ NOT deployed to Pages (stays in Supabase)
```

## Security Notes

1. **Never commit actual Supabase tokens** to `.env` files in GitHub (but your anon keys are meant to be public)
2. **RLS Policies**: Your Supabase tables should have Row Level Security enabled to restrict data access
3. **Admin Credentials**: Change the hardcoded admin password in `admin-login.html` before production use

## Next Steps

1. Verify GitHub Pages is enabled in your repository settings
2. Make a small change and push to test automatic deployment
3. Access your app at `https://voidkirin026-tech.github.io/Equipment-Loan-System/`
4. Test the login flows and equipment checkout functionality
