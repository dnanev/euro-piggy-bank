## MODIFIED Requirements

### Requirement: Data Persistence
The system SHALL save user data to Firebase Firestore and provide save/reset functionality with offline support.

#### Scenario: Save current state
- **WHEN** user clicks Save button
- **THEN** current denomination quantities are saved to Firebase
- **AND** local cache is updated for offline access
- **AND** last updated timestamp is recorded
- **AND** changes are synchronized across all user devices

#### Scenario: Reset all data
- **WHEN** user clicks Reset button
- **THEN** all denomination quantities are cleared
- **AND** confirmation prompt is shown
- **AND** Firebase documents are deleted
- **AND** local cache is cleared

#### Scenario: Auto-save functionality
- **WHEN** user modifies any denomination quantity
- **THEN** changes are automatically saved to Firebase
- **AND** real-time sync updates other connected devices
- **AND** offline changes are queued for synchronization

#### Scenario: Conflict resolution
- **WHEN** same denomination is modified on multiple devices
- **THEN** system uses last-write-wins with timestamp resolution
- **THEN** user is notified of potential data conflicts
- **AND** most recent changes are preserved
