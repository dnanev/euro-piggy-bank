## ADDED Requirements
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

### Requirement: Currency Display Toggle
The system SHALL provide a toggle to show/hide Bulgarian Leva conversion.

#### Scenario: Toggle BGN display visibility
- **WHEN** user enables BGN display toggle in settings
- **THEN** BGN equivalent amounts are shown throughout the interface
- **AND** toggle state is persisted across sessions

#### Scenario: Hide BGN display
- **WHEN** user disables BGN display toggle in settings
- **THEN** BGN amounts are hidden from the interface
- **AND** only Euro amounts are displayed

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
