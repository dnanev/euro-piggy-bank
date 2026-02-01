# Data Migration Guide

This guide explains how data migration works from localStorage to Firebase in Euro Piggy Bank.

## Overview

The migration process transfers your existing savings data from browser localStorage to Firebase cloud storage, enabling:
- Cross-device synchronization
- Data backup and recovery
- Real-time collaboration
- Offline support with automatic sync

## What Gets Migrated

### Data Types

1. **Denominations & Savings**
   - All coin and banknote quantities
   - Current total amounts
   - Last updated timestamp

2. **History Entries**
   - All past savings snapshots
   - Timestamps and totals
   - Denomination breakdowns

3. **Savings Goals**
   - Goal titles and targets
   - Deadlines and progress
   - Creation and achievement dates

4. **User Preferences**
   - Theme settings (light/dark)
   - Language preferences (BG/EN)
   - Currency display settings (EUR/BGN)

### Data Structure

**Before Migration (localStorage):**
```javascript
{
  denominations: [...],
  theme: 'light',
  language: 'bg',
  showBgn: true,
  lastUpdated: '2024-01-15T10:30:00Z',
  history: [...],
  goals: [...],
  statistics: null
}
```

**After Migration (Firebase):**
```javascript
{
  userProfile: {
    uid: 'user-id',
    email: 'user@example.com',
    preferences: {
      theme: 'light',
      currency: 'BGN',
      updatedAt: '2024-01-15T10:30:00Z'
    }
  },
  savings: {
    denominations: [...],
    totalEur: 500,
    totalBgn: 977.92,
    updatedAt: '2024-01-15T10:30:00Z'
  },
  history: [...],
  goals: [...]
}
```

## Migration Process

### Step 1: Detection

The app automatically detects localStorage data when:
- User first logs in with Firebase
- App loads with authenticated user
- localStorage contains app data

### Step 2: Validation

Before migration, the system:
- Validates data structure and integrity
- Checks for corrupted or invalid entries
- Cleans and normalizes data
- Calculates migration statistics

### Step 3: Backup

A backup is automatically created:
- JSON format with all data
- Downloaded to user's device
- Timestamped filename
- Includes migration metadata

### Step 4: Transformation

Data is transformed for Firebase:
- localStorage → Firebase format
- Denominations → savings document
- History → history collection
- Goals → goals collection
- Preferences → user profile

### Step 5: Upload

Transformed data is uploaded to Firebase:
- User profile created/updated
- Savings data stored
- History entries added
- Goals created
- All operations logged

### Step 6: Verification

After upload, the system:
- Verifies data integrity
- Confirms successful upload
- Clears localStorage (optional)
- Updates app state

## Migration Wizard

### User Interface

The migration wizard provides:
- **Summary Screen:** Shows what will be migrated
- **Progress Tracking:** Real-time migration status
- **Error Handling:** Clear error messages and retry options
- **Backup Download:** Automatic backup creation
- **Confirmation:** Final verification before completion

### Migration Steps

1. **Welcome Screen**
   - Explains migration process
   - Shows data summary
   - User can proceed or skip

2. **Validation**
   - Checks data integrity
   - Shows any issues found
   - Allows user to continue or fix

3. **Backup Creation**
   - Creates local backup file
   - Shows backup location
   - Confirms backup success

4. **Data Upload**
   - Progress bar for upload status
   - Shows current operation
   - Handles network issues gracefully

5. **Completion**
   - Success confirmation
   - Data verification
   - Next steps guidance

## Selective Migration

Users can choose what to migrate:

### Options Available

- **Denominations:** Coin and banknote data
- **History:** Past savings records
- **Goals:** Savings objectives
- **Preferences:** Settings and customization

### Use Cases

- **Partial Migration:** Migrate only essential data
- **Testing:** Migrate specific data types first
- **Privacy:** Skip sensitive information
- **Storage:** Limit data transferred

## Error Handling

### Common Issues

1. **Network Problems**
   - Automatic retry mechanism
   - Offline queue for later sync
   - User notification of issues

2. **Data Corruption**
   - Data cleaning and validation
   - Skip corrupted entries
   - Log issues for review

3. **Storage Limits**
   - Check available space
   - Compress data if needed
   - Warn user about limits

4. **Authentication Issues**
   - Verify user is logged in
   - Check permissions
   - Re-authenticate if needed

### Error Recovery

- **Retry Mechanism:** Automatic retry with exponential backoff
- **Partial Recovery:** Migrate successful portions
- **Manual Intervention:** User can fix issues and retry
- **Rollback Option:** Restore from backup if needed

## Data Security

### During Migration

- **Encryption:** Data encrypted in transit
- **Authentication:** User verification required
- **Validation:** Input sanitization and checks
- **Logging:** Audit trail of all operations

### After Migration

- **Access Control:** User-specific data access
- **Security Rules:** Firestore security enforcement
- **Backup:** Regular cloud backups
- **Monitoring:** Access and change logging

## Performance Considerations

### Optimization

- **Batch Operations:** Group multiple writes
- **Compression:** Reduce data size
- **Progressive Upload:** Large data in chunks
- **Background Processing:** Non-blocking operations

### Timing

- **Initial Detection:** Quick check on app load
- **Validation:** Fast data integrity checks
- **Upload:** Optimized for network conditions
- **Cleanup:** Efficient localStorage clearing

## Troubleshooting

### Migration Fails

1. **Check Internet Connection**
   - Ensure stable connection
   - Try again when connection improves

2. **Verify Browser Storage**
   - Check localStorage permissions
   - Clear browser cache if needed

3. **Review Error Messages**
   - Note specific error details
   - Follow suggested solutions

4. **Manual Migration**
   - Export data manually
   - Contact support for assistance

### Data Issues

1. **Missing Data**
   - Check backup file
   - Verify original localStorage
   - Re-run migration if needed

2. **Incorrect Values**
   - Review data transformation
   - Check for rounding errors
   - Validate calculations

3. **Sync Problems**
   - Check Firebase rules
   - Verify user permissions
   - Test connection status

## Best Practices

### Before Migration

1. **Backup Data**
   - Export important data manually
   - Save backup files securely
   - Document current state

2. **Stable Connection**
   - Use reliable internet
   - Avoid interruptions
   - Allow sufficient time

3. **Browser Preparation**
   - Update browser to latest version
   - Clear unnecessary data
   - Ensure sufficient storage

### After Migration

1. **Verify Data**
   - Check all data migrated correctly
   - Test app functionality
   - Confirm calculations match

2. **Test Sync**
   - Try on multiple devices
   - Test offline functionality
   - Verify real-time updates

3. **Clean Up**
   - Remove old localStorage if desired
   - Update bookmarks
   - Share new features with team

## Support

### Getting Help

1. **Check Documentation**
   - Review this guide
   - Read user guide
   - Check FAQ section

2. **Contact Support**
   - Provide error details
   - Share backup files
   - Describe steps taken

3. **Community Forum**
   - Ask questions publicly
   - Share experiences
   - Help others with similar issues

## Technical Details

### Migration Algorithm

```javascript
async function migrateData(localStorageData, userId) {
  // 1. Validate data
  const validatedData = validateAndCleanData(localStorageData)
  
  // 2. Create backup
  await createBackup(validatedData)
  
  // 3. Transform for Firebase
  const firebaseData = transformToFirebaseFormat(validatedData, userId)
  
  // 4. Upload to Firebase
  await uploadToFirebase(firebaseData)
  
  // 5. Verify success
  await verifyMigration(firebaseData)
  
  // 6. Clean up
  await cleanupLocalStorage()
}
```

### Data Mapping

| localStorage | Firebase | Notes |
|-------------|----------|-------|
| denominations | savings.denominations | Direct mapping |
| theme | userProfile.preferences.theme | Preference mapping |
| language | userProfile.preferences.currency | BG→BGN, EN→EUR |
| history | history collection | Individual documents |
| goals | goals collection | Individual documents |
| lastUpdated | savings.updatedAt | Timestamp mapping |

## Future Enhancements

### Planned Features

- **Incremental Migration:** Migrate changes only
- **Multiple Accounts:** Support for multiple users
- **Cloud Backup:** Additional cloud storage options
- **Data Analytics:** Migration statistics and insights

### API Extensions

- **Custom Transformers:** User-defined data mapping
- **Plugin System:** Extensible migration logic
- **Webhooks:** Migration event notifications
- **REST API:** External migration tools

---

This migration guide ensures a smooth transition from localStorage to Firebase while maintaining data integrity and providing a great user experience.
