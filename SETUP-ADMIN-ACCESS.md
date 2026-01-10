# Admin Access Setup Guide

## Quick Start

To enable admin access for the platform, you need to configure the admin email allowlist in Convex.

---

## Step 1: Set Environment Variable in Convex

1. Go to your Convex dashboard: https://dashboard.convex.dev
2. Select your project
3. Navigate to **Settings** → **Environment Variables**
4. Add a new environment variable:

```
Name: PLATFORM_ADMIN_EMAILS
Value: roblesbraun@gmail.com
```

5. Click **Save**

---

## Step 2: Add More Admins (Optional)

To add multiple admin emails, use a comma-separated list:

```
PLATFORM_ADMIN_EMAILS=roblesbraun@gmail.com,admin2@example.com,admin3@example.com
```

**Important:** 
- No spaces between emails
- Use lowercase emails
- Emails must match exactly with Google OAuth login

---

## Step 3: Test Admin Access

1. Navigate to your app: `http://localhost:3000` (or your deployed URL)
2. Click **Login** or go to `/login`
3. Sign in with Google using an admin email
4. You should be redirected to `/app/admin`

### Troubleshooting

**If you're redirected to `/app/couple` instead:**
- Check that the email in Convex matches your Google account email exactly
- Verify the environment variable is set correctly (no typos, no spaces)
- Try logging out and logging in again

**If you get "Unauthorized" errors:**
- The authorization checks are working correctly
- Verify your email is in the `PLATFORM_ADMIN_EMAILS` list
- Check Convex logs for any errors

---

## Step 4: Access Admin Features

Once logged in as an admin, you can:

### Dashboard (`/app/admin`)
- View platform statistics
- See recent weddings

### Weddings (`/app/admin/weddings`)
- **List all weddings** with search and filters
- **Create new wedding** with template selection
- **Edit wedding** with 6-tab interface:
  - Details (name, status, couple access)
  - Template (template/version assignment)
  - Sections (enable/disable + content editors)
  - Theme (light/dark color customization)
  - Guests (manual add + CSV import)
  - Links (preview + live URLs)

### Templates (`/app/admin/templates`)
- View available templates and versions

### Other Pages (Coming Soon)
- Invoices (Priority 10)
- Messages (Priority 11)
- Settings

---

## Security Notes

### Authorization Enforcement
- All admin operations are protected in **Convex** (backend), not just UI
- Unauthorized users will get errors even if they bypass UI checks
- Platform admin access is separate from wedding-specific access

### Wedding Access Levels
1. **Platform Admin** - Full access to all weddings and platform features
2. **Couple** - Access to their own wedding(s) only
3. **Guest** - RSVP access only (via OTP, coming in Priority 7)

### Email Allowlist
- Stored in Convex environment variables (server-side)
- Not exposed to client
- Can be updated without code changes
- Takes effect immediately after save

---

## Development vs Production

### Development
```bash
# Local development uses Convex dev environment
PLATFORM_ADMIN_EMAILS=roblesbraun@gmail.com
```

### Production
```bash
# Production uses Convex prod environment
# Set the same variable in production environment settings
PLATFORM_ADMIN_EMAILS=roblesbraun@gmail.com,team@braunstudio.com
```

**Important:** Environment variables are separate per Convex environment (dev/prod). Set them in both if needed.

---

## Common Tasks

### Add a New Admin
1. Go to Convex dashboard
2. Edit `PLATFORM_ADMIN_EMAILS`
3. Add new email to comma-separated list
4. Save
5. New admin can log in immediately

### Remove an Admin
1. Go to Convex dashboard
2. Edit `PLATFORM_ADMIN_EMAILS`
3. Remove email from list
4. Save
5. User will lose admin access on next request

### Grant Wedding Access to Non-Admin
Use the wedding editor:
1. Go to `/app/admin/weddings/[id]`
2. Open **Details** tab
3. Add couple email(s)
4. Save
5. User can access that specific wedding at `/app/couple`

---

## Next Steps

After setting up admin access:

1. **Create your first wedding**
   - Go to `/app/admin/weddings`
   - Click "Create Wedding"
   - Fill in details and select template
   - All sections will be enabled by default

2. **Edit wedding content**
   - Click "Edit" on any wedding
   - Use the 6 tabs to configure everything
   - Upload photos, add itinerary items, customize theme

3. **Add guests**
   - Go to Guests tab
   - Add manually or import CSV
   - Guests can RSVP once OTP auth is implemented (Priority 7)

4. **Preview and publish**
   - Use Links tab to get preview URL
   - Share with couple for review
   - Change status to "live" when ready

---

## Support

If you encounter issues:
1. Check Convex logs in dashboard
2. Verify environment variable is set correctly
3. Ensure email matches Google OAuth email exactly
4. Try logging out and back in

For development questions, refer to:
- `PRIORITY-4-IMPLEMENTATION.md` - Full implementation details
- `PROGRESS.md` - Overall project status
- `README.md` - Project overview
