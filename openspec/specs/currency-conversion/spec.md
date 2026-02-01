# currency-conversion Specification

## Purpose
Real-time currency conversion between Euro and Bulgarian Leva with persistent display preferences and Firebase sync.
## Requirements
### Requirement: EUR/BGN Conversion
The system SHALL convert Euro amounts to Bulgarian Leva using the hardcoded rate of 1.95583.

#### Scenario: Convert Euro total to Leva
- **WHEN** system displays total savings of 100€
- **THEN** equivalent amount of 195.58 BGN is displayed
- **AND** conversion uses exact rate of 1.95583

#### Scenario: Real-time conversion
- **WHEN** user updates any denomination quantity
- **THEN** BGN amount updates immediately
- **AND** maintains precision to 2 decimal places

### Requirement: BGN Toggle Component
The system SHALL provide a dedicated Bulgarian Leva display toggle component.

#### Scenario: BGN toggle interface
- **WHEN** user views BGN toggle
- **THEN** toggle shows current BGN display state
- **AND** toggle is accessible and keyboard navigable
- **AND** changes apply immediately to all currency displays
- **AND** preference is saved to Firebase

#### Scenario: BGN display state persistence
- **WHEN** user toggles BGN display
- **THEN** preference is saved to Firebase
- **AND** preference syncs across devices
- **AND** preference is restored on app load
- **AND** affects all currency displays immediately

#### Scenario: BGN toggle affects all Euro displays
- **WHEN** BGN display is enabled
- **THEN** all Euro amounts throughout the interface display in BGN
- **AND** individual denomination totals show in BGN
- **AND** top 3 denominations list shows values in BGN

### Requirement: Currency Formatting
The system SHALL format currency amounts appropriately for both Euro and Bulgarian Leva.

#### Scenario: Format Euro amounts
- **WHEN** displaying Euro values
- **THEN** amounts use "€" symbol
- **AND** format with 2 decimal places
- **AND** use appropriate thousands separators

#### Scenario: Format BGN amounts
- **WHEN** displaying Bulgarian Leva values
- **THEN** amounts use "лв." symbol
- **AND** format with 2 decimal places
- **AND** use Bulgarian number formatting

### Requirement: Conversion Display
The system SHALL clearly display both original Euro amount and converted BGN amount when BGN display is enabled.

#### Scenario: View conversion breakdown
- **WHEN** user views grand total with BGN display enabled
- **THEN** BGN amount is prominently displayed as primary
- **AND** Euro equivalent is shown below with conversion symbol
- **AND** conversion rate is indicated

### Requirement: Confirmation Dialog
The system SHALL use a modern confirmation dialog instead of browser alerts for destructive actions.

#### Scenario: Reset confirmation dialog
- **WHEN** user clicks reset button
- **THEN** a shadcn confirmation dialog appears
- **AND** dialog shows appropriate title and description
- **AND** provides confirm and cancel buttons
- **AND** uses translated text for all elements

