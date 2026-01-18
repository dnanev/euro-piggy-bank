## ADDED Requirements
### Requirement: Euro Denomination Input
The system SHALL provide input fields for all Euro denominations (coins and banknotes) with quantity tracking and automatic total calculation.

#### Scenario: User inputs coin quantities
- **WHEN** user enters quantity for 2€ coins
- **THEN** system displays the total value for that denomination
- **AND** updates the grand total

#### Scenario: User inputs banknote quantities
- **WHEN** user enters quantity for 50€ banknotes
- **THEN** system displays the total value for that denomination
- **AND** updates the grand total

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

### Requirement: Data Persistence
The system SHALL save user data to LocalStorage and provide save/reset functionality.

#### Scenario: Save current state
- **WHEN** user clicks Save button
- **THEN** current denomination quantities are saved to LocalStorage
- **AND** last updated timestamp is recorded

#### Scenario: Reset all data
- **WHEN** user clicks Reset button
- **THEN** all denomination quantities are cleared
- **AND** confirmation prompt is shown
- **AND** LocalStorage is cleared

### Requirement: Tab Navigation
The system SHALL provide tabs for Breakdown, History, and Settings sections.

#### Scenario: Navigate between tabs
- **WHEN** user clicks on History tab
- **THEN** History section is displayed
- **AND** Breakdown section is hidden
- **AND** tab indicator shows active state

#### Scenario: Future History feature
- **WHEN** user accesses History tab
- **THEN** placeholder for future history tracking is shown
- **AND** indicates feature coming soon
