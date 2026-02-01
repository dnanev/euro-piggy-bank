# euro-denomination-tracker Specification

## Purpose
Core functionality for tracking Euro denominations with Firebase real-time sync, authentication, and comprehensive savings management.
## Requirements
### Requirement: Firebase Authentication
The system SHALL provide secure user authentication with Google OAuth integration.

#### Scenario: User signs in with Google
- **WHEN** user clicks sign-in button
- **THEN** Google OAuth popup appears
- **AND** user authenticates successfully
- **AND** user profile is displayed in header
- **AND** data syncs to Firebase

#### Scenario: User signs out
- **WHEN** user clicks sign-out button
- **THEN** user session ends
- **AND** local data is cleared
- **AND** Firebase sync is stopped

### Requirement: Real-time Data Synchronization
The system SHALL provide real-time synchronization with Firebase Firestore.

#### Scenario: Multi-device sync
- **WHEN** user updates denominations on one device
- **THEN** changes sync to Firebase immediately
- **AND** other connected devices update in real-time
- **AND** sync status indicator shows connection state

#### Scenario: Offline handling
- **WHEN** network connection is lost
- **THEN** app continues to function with local cache
- **AND** changes queue for sync when connection restored
- **AND** sync status shows offline state

### Requirement: Euro Denomination Input
The system SHALL provide input fields for all Euro denominations (coins and banknotes) with quantity tracking and automatic total calculation.

#### Scenario: User inputs coin quantities
- **WHEN** user enters quantity for 2€ coins
- **THEN** system displays the total value for that denomination
- **AND** updates the grand total
- **AND** changes sync to Firebase in real-time

#### Scenario: User inputs banknote quantities
- **WHEN** user enters quantity for 50€ banknotes
- **THEN** system displays the total value for that denomination
- **AND** updates the grand total
- **AND** changes are saved to Firebase

### Requirement: Grand Total Display
The system SHALL display the total savings in Euros with conversion to Bulgarian Leva using the fixed rate of 1.95583.

#### Scenario: View total savings
- **WHEN** user has entered quantities for multiple denominations
- **THEN** system displays the total in Euros
- **AND** shows equivalent amount in Bulgarian Leva

#### Scenario: Real-time calculation
- **WHEN** user changes any denomination quantity
- **THEN** grand total updates immediately
- **AND** currency conversion recalculates

### Requirement: Savings Insights
The system SHALL provide insights including coin/banknote breakdown, most saved denomination, and top 3 denominations.

#### Scenario: View savings breakdown
- **WHEN** user has entered denomination data
- **THEN** system displays total count of coins
- **AND** shows total count of banknotes
- **AND** identifies most saved denomination
- **AND** lists top 3 denominations by value

### Requirement: Data Persistence and Sync
The system SHALL save user data to Firebase Firestore with real-time sync and local backup.

#### Scenario: Automatic data persistence
- **WHEN** user changes any denomination quantity
- **THEN** data is automatically saved to Firebase
- **AND** local cache is updated
- **AND** last updated timestamp is recorded

#### Scenario: Reset all data
- **WHEN** user clicks Reset button
- **THEN** confirmation dialog appears
- **AND** all denomination quantities are cleared
- **AND** Firebase documents are updated
- **AND** changes sync across all devices

### Requirement: Tab Navigation
The system SHALL provide tabs for Breakdown, History, and Settings sections with full functionality.

#### Scenario: Navigate between tabs
- **WHEN** user clicks on History tab
- **THEN** History section with full functionality is displayed
- **AND** Breakdown section is hidden
- **AND** tab indicator shows active state

#### Scenario: History functionality
- **WHEN** user accesses History tab
- **THEN** complete history tracking is shown
- **AND** manual entries can be created
- **AND** goals can be managed
- **AND** data export is available
- **AND** statistics are displayed

