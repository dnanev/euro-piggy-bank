# Troubleshooting Guide

This guide helps you resolve common issues with Euro Piggy Bank's Firebase integration.

## Table of Contents

1. [Authentication Issues](#authentication-issues)
2. [Data Sync Problems](#data-sync-problems)
3. [Migration Issues](#migration-issues)
4. [Offline Mode Problems](#offline-mode-problems)
5. [Performance Issues](#performance-issues)
6. [Browser Compatibility](#browser-compatibility)
7. [Firebase Configuration](#firebase-configuration)
8. [Network Issues](#network-issues)

## Authentication Issues

### Can't Sign In

**Problem:** Login fails with error message

**Solutions:**
1. **Check Credentials:**
   - Verify email and password are correct
   - Check for typos and extra spaces
   - Ensure Caps Lock is off

2. **Reset Password:**
   - Click "Forgot Password?"
   - Enter your email address
   - Check spam folder for reset email

3. **Google Sign-In Issues:**
   - Ensure Google account is accessible
   - Check if pop-ups are blocked
   - Try signing in to Google first

### Account Creation Problems

**Problem:** Can't create new account

**Solutions:**
1. **Email Already in Use:**
   - Try password reset instead
   - Use different email address
   - Check if you already have an account

2. **Password Requirements:**
   - Minimum 6 characters
   - At least one uppercase letter
   - At least one lowercase letter
   - At least one number

3. **Verification Email:**
   - Check spam/junk folder
   - Add noreply@firebase.com to contacts
   - Wait a few minutes for delivery

### Session Issues

**Problem:** Logged out unexpectedly

**Solutions:**
1. **Session Timeout:**
   - Sign in again
   - Check "Remember me" option
   - Clear browser cache

2. **Multiple Tabs:**
   - Sign out from other tabs
   - Use single tab for testing
   - Refresh the page

## Data Sync Problems

### Data Not Syncing

**Problem:** Changes not appearing on other devices

**Solutions:**
1. **Check Connection Status:**
   - Look for connection indicator (green/yellow/red)
   - Ensure internet connection is stable
   - Try manual sync if available

2. **Refresh Data:**
   - Refresh the page (F5/Cmd+R)
   - Sign out and sign back in
   - Check for sync errors

3. **Firebase Rules:**
   - Verify security rules are deployed
   - Check user permissions
   - Test with different user account

### Sync Errors

**Problem:** Error messages about sync failures

**Solutions:**
1. **Network Issues:**
   - Check internet connection
   - Try different network
   - Wait and retry automatically

2. **Permission Errors:**
   - Sign out and sign back in
   - Check account status
   - Verify Firebase configuration

3. **Data Conflicts:**
   - Check conflict resolution UI
   - Choose which data to keep
   - Contact support if needed

### Data Loss

**Problem:** Missing data after sync

**Solutions:**
1. **Check Backup:**
   - Look for migration backup file
   - Restore from backup if available
   - Check other devices for data

2. **Recovery Options:**
   - Use data recovery tools
   - Check audit logs
   - Contact support immediately

## Migration Issues

### Migration Fails

**Problem:** Data migration from localStorage fails

**Solutions:**
1. **Check Data Size:**
   - Large datasets may timeout
   - Try selective migration
   - Clear unnecessary data first

2. **Network Stability:**
   - Ensure stable connection
   - Try migration during off-peak hours
   - Use wired connection if possible

3. **Browser Storage:**
   - Check localStorage permissions
   - Clear browser cache
   - Try different browser

### Partial Migration

**Problem:** Only some data migrated

**Solutions:**
1. **Check Validation:**
   - Review migration logs
   - Identify failed data types
   - Retry migration for specific items

2. **Manual Migration:**
   - Export remaining data manually
   - Use backup file
   - Contact support for assistance

### Backup Issues

**Problem:** Backup file not created

**Solutions:**
1. **Download Permissions:**
   - Check browser download settings
   - Allow downloads from this site
   - Try different browser

2. **File Location:**
   - Check default download folder
   - Search for backup file by date
   - Look in browser download history

## Offline Mode Problems

### Offline Mode Not Working

**Problem:** App doesn't work offline

**Solutions:**
1. **Service Worker:**
   - Check browser supports service workers
   - Enable service workers in settings
   - Clear browser cache and reload

2. **Storage Permissions:**
   - Check localStorage permissions
   - Enable local storage
   - Try different browser

3. **App Cache:**
   - Clear browser cache
   - Reload application
   - Check for updates

### Sync Queue Issues

**Problem:** Changes not syncing when back online

**Solutions:**
1. **Manual Sync:**
   - Click sync button if available
   - Refresh the page
   - Check connection status

2. **Queue Full:**
   - Wait for automatic processing
   - Try manual sync
   - Clear some pending changes

3. **Persistent Errors:**
   - Check individual error messages
   - Retry failed operations
   - Contact support if needed

## Performance Issues

### Slow Loading

**Problem:** App takes too long to load

**Solutions:**
1. **Network Speed:**
   - Check internet connection
   - Try different network
   - Use wired connection

2. **Browser Performance:**
   - Close other tabs
   - Clear browser cache
   - Update browser version

3. **Data Size:**
   - Large history may slow loading
   - Try selective data loading
   - Clear old data if needed

### Memory Issues

**Problem:** App using too much memory

**Solutions:**
1. **Data Management:**
   - Clear old history entries
   - Limit data retention
   - Use data export/cleanup

2. **Browser Optimization:**
   - Restart browser
   - Clear cache and cookies
   - Try different browser

3. **Device Resources:**
   - Close other applications
   - Restart device
   - Check available memory

## Browser Compatibility

### Unsupported Browser

**Problem:** App not working in your browser

**Solutions:**
1. **Update Browser:**
   - Update to latest version
   - Check system requirements
   - Try supported browser

2. **Alternative Browser:**
   - Chrome 90+ (recommended)
   - Firefox 88+
   - Safari 14+
   - Edge 90+

### Mobile Issues

**Problem:** App not working well on mobile

**Solutions:**
1. **Mobile Browser:**
   - Use latest mobile browser
   - Clear mobile cache
   - Update mobile OS

2. **Responsive Design:**
   - Rotate device orientation
   - Check mobile-specific features
   - Report mobile bugs

3. **Touch Interface:**
   - Use touch-friendly gestures
   - Check button sizes
   - Test touch responsiveness

## Firebase Configuration

### Configuration Errors

**Problem:** Firebase not configured properly

**Solutions:**
1. **Environment Variables:**
   - Check `.env` file exists
   - Verify all variables are set
   - Restart development server

2. **API Keys:**
   - Verify Firebase project settings
   - Check API key restrictions
   - Regenerate keys if needed

3. **Project Settings:**
   - Verify project ID matches
   - Check database location
   - Review security rules

### Security Rules Issues

**Problem:** Permission denied errors

**Solutions:**
1. **Rule Deployment:**
   - Publish security rules
   - Check rule syntax
   - Test with Firebase console

2. **User Authentication:**
   - Ensure user is logged in
   - Check user permissions
   - Verify user ID matches

3. **Collection Names:**
   - Check collection naming
   - Verify document structure
   - Review rule paths

## Network Issues

### Connection Problems

**Problem:** Can't connect to Firebase

**Solutions:**
1. **Internet Connection:**
   - Check network connectivity
   - Try different network
   - Check firewall settings

2. **Firebase Status:**
   - Check Firebase status page
   - Look for service outages
   - Monitor Firebase console

3. **DNS Issues:**
   - Try different DNS server
   - Flush DNS cache
   - Check hosts file

### Timeout Issues

**Problem:** Operations timing out

**Solutions:**
1. **Increase Timeout:**
   - Check timeout settings
   - Adjust for slow networks
   - Implement retry logic

2. **Data Size:**
   - Reduce data payload
   - Use pagination
   - Optimize queries

3. **Network Optimization:**
   - Use CDN if available
   - Compress data
   - Optimize request frequency

## Error Messages

### Common Error Codes

**auth/invalid-email:**
- Email format is invalid
- Check email spelling
- Use valid email address

**auth/user-not-found:**
- User account doesn't exist
- Check email address
- Create new account

**auth/wrong-password:**
- Password is incorrect
- Try password reset
- Check keyboard layout

**permission-denied:**
- Access to resource denied
- Check user permissions
- Verify security rules

**unavailable:**
- Service temporarily unavailable
- Try again later
- Check Firebase status

### Debug Information

**Browser Console:**
- Open developer tools (F12)
- Check Console tab for errors
- Look for Firebase error messages
- Note error codes and timestamps

**Network Tab:**
- Check failed requests
- Look for HTTP status codes
- Verify request/response data
- Check timing information

## Getting Help

### Self-Service

1. **Documentation:**
   - Read user guide
   - Check migration guide
   - Review setup instructions

2. **Community:**
   - Search forums for similar issues
   - Ask questions publicly
   - Share experiences

3. **FAQ Section:**
   - Check frequently asked questions
   - Look for known issues
   - Review troubleshooting steps

### Contact Support

**When to Contact:**
- Issues not resolved by troubleshooting
- Data loss or corruption
- Security concerns
- Bug reports with reproduction steps

**Information to Provide:**
- Error messages and codes
- Browser and version
- Operating system
- Steps to reproduce issue
- Screenshots if applicable

### Emergency Procedures

**Data Recovery:**
1. Stop using the app immediately
2. Don't clear browser data
3. Contact support with details
4. Provide backup files if available

**Security Issues:**
1. Change password immediately
2. Sign out from all devices
3. Contact security team
4. Monitor account activity

---

This troubleshooting guide should help resolve most common issues. If you continue to experience problems, don't hesitate to reach out to our support team for assistance.
