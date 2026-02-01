# Euro Piggy Bank - User Guide

Welcome to Euro Piggy Bank with Firebase integration! This guide will help you understand and use all the new features.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Authentication](#authentication)
3. [Data Migration](#data-migration)
4. [Using the App](#using-the-app)
5. [Offline Mode](#offline-mode)
6. [User Profile](#user-profile)
7. [Troubleshooting](#troubleshooting)

## Getting Started

### First Time Users

1. Open the Euro Piggy Bank application
2. Click "Sign Up" to create a new account
3. Fill in your email and create a password
4. Click "Create Account"
5. Check your email for verification (if required)
6. Log in with your new credentials

### Existing Users

If you have data stored locally in the app:

1. The app will automatically detect your existing data
2. You'll see a migration wizard on first login
3. Follow the migration steps to move your data to the cloud
4. Your data will be safely backed up before migration

## Authentication

### Creating an Account

1. **Email Sign Up:**
   - Enter your email address
   - Create a strong password (at least 6 characters, with uppercase, lowercase, and numbers)
   - Click "Create Account"

2. **Google Sign Up:**
   - Click "Continue with Google"
   - Choose your Google account
   - Authorize the application

### Signing In

1. **Email Sign In:**
   - Enter your email and password
   - Click "Sign In"
   - Use "Forgot Password?" if needed

2. **Google Sign In:**
   - Click "Continue with Google"
   - Select your Google account

### Password Recovery

1. Click "Forgot Password?" on the login screen
2. Enter your email address
3. Check your email for reset instructions
4. Follow the link to create a new password

### Account Management

Access your profile to:
- Update display name
- Change theme (light/dark)
- Switch language (Bulgarian/English)
- Toggle currency display (EUR/BGN)
- Delete your account (with confirmation)

## Data Migration

### Automatic Migration

When you first log in with Firebase:

1. The app detects existing localStorage data
2. A migration wizard appears
3. Review what will be migrated:
   - Denominations and savings
   - History entries
   - Savings goals
   - User preferences
4. Click "Start Migration"
5. Wait for completion
6. Your data is now synced across devices

### Manual Migration

If you skip migration initially:

1. Go to User Profile
2. Look for migration options
3. Start migration when ready

### Migration Features

- **Automatic Backup:** Creates a backup file before migration
- **Progress Tracking:** Shows migration progress in real-time
- **Error Handling:** Handles errors gracefully with retry options
- **Selective Migration:** Choose what to migrate (optional)

## Using the App

### Main Features

1. **Denomination Tracking:**
   - Add/remove coins and banknotes
   - Real-time synchronization
   - Automatic history recording

2. **History Tracking:**
   - View all past savings snapshots
   - Filter by date range
   - Export data (coming soon)

3. **Savings Goals:**
   - Create savings goals
   - Track progress
   - Set deadlines

4. **Real-time Sync:**
   - Changes sync instantly across devices
   - Offline support with automatic sync
   - Conflict resolution

### Connection Status

Look for the connection indicator:
- 🟢 Green: Online and synced
- 🟡 Yellow: Offline mode
- 🔴 Red: Sync error

Click the indicator to:
- View sync status
- Retry failed operations
- See pending changes

## Offline Mode

### How It Works

- The app works offline automatically
- Changes are saved locally
- Sync resumes when connection is restored
- No data loss during offline periods

### Offline Features

- Add/remove denominations
- View history and goals
- Update preferences
- All data saved locally

### Sync Queue

- Pending changes shown in connection status
- Automatic retry when online
- Manual sync option available
- Conflict resolution if needed

## User Profile

### Accessing Your Profile

1. Click your avatar/name in the app
2. Or navigate to profile section

### Profile Options

**Personal Information:**
- Display name
- Email address (read-only)
- Account creation date

**Preferences:**
- Theme: Light/Dark mode
- Language: Bulgarian/English
- Currency: Show BGN alongside EUR

**Account Management:**
- Sign out
- Delete account (with confirmation)

### Deleting Your Account

⚠️ **Warning:** This action cannot be undone!

1. Go to Profile → Danger Zone
2. Type "DELETE" to confirm
3. Click "Delete Account Permanently"
4. All data will be removed from our servers

## Troubleshooting

### Common Issues

**Can't log in:**
- Check email and password
- Try password reset
- Verify Google account access

**Data not syncing:**
- Check internet connection
- Look at connection status indicator
- Try manual sync
- Restart the app

**Migration issues:**
- Ensure stable internet connection
- Check available storage space
- Try migration again
- Contact support if needed

**Offline mode problems:**
- Check browser storage permissions
- Clear browser cache
- Restart the app

### Error Messages

- **"Authentication failed":** Check credentials or try again
- **"Sync error":** Check connection and retry
- **"Migration failed":** Check internet and restart
- **"Permission denied":** Sign out and sign back in

### Getting Help

1. Check the connection status indicator
2. Review error messages carefully
3. Try refreshing the page
4. Clear browser cache if needed
5. Contact support with error details

### Data Safety

- All data is encrypted in transit
- Regular backups created
- Secure authentication
- Privacy protection
- GDPR compliant

## Tips and Best Practices

1. **Regular Sync:** Keep app online for regular backups
2. **Strong Passwords:** Use unique, strong passwords
3. **Backup Data:** Export important data regularly
4. **Update Profile:** Keep your profile information current
5. **Monitor Storage:** Check available browser storage

## Keyboard Shortcuts

- `Ctrl/Cmd + S`: Save current state
- `Ctrl/Cmd + R`: Refresh and sync
- `Escape`: Close modals/dialogs

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Mobile Support

- Responsive design for all screen sizes
- Touch-friendly interface
- Mobile-optimized features
- Offline support on mobile

---

Thank you for using Euro Piggy Bank! If you have any questions or need help, please don't hesitate to reach out to our support team.
