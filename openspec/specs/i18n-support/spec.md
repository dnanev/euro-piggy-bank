# i18n-support Specification

## Purpose
TBD - created by archiving change add-main-app. Update Purpose after archive.
## Requirements
### Requirement: Bulgarian Language Support
The system SHALL provide full Bulgarian language support as the primary language.

#### Scenario: Display Bulgarian interface
- **WHEN** application loads with Bulgarian language
- **THEN** all UI text is displayed in Bulgarian
- **AND** numbers and dates use Bulgarian formatting
- **AND** currency symbols use Bulgarian conventions

#### Scenario: Bulgarian currency display
- **WHEN** displaying Bulgarian Leva amounts
- **THEN** amounts use "лв." symbol
- **AND** follow Bulgarian number formatting rules
- **AND** decimal separator is comma (,) for Bulgarian context

### Requirement: English Language Support
The system SHALL provide English language support as secondary language.

#### Scenario: Display English interface
- **WHEN** user switches to English language
- **THEN** all UI text is displayed in English
- **AND** numbers and dates use English formatting
- **AND** currency symbols use English conventions

#### Scenario: English currency display
- **WHEN** displaying amounts in English
- **THEN** Euro amounts use "€" symbol
- **AND** follow English number formatting rules
- **AND** decimal separator is period (.)

### Requirement: Language Toggle
The system SHALL provide a toggle to switch between Bulgarian and English languages.

#### Scenario: Switch to Bulgarian
- **WHEN** user selects Bulgarian language
- **THEN** interface immediately switches to Bulgarian
- **AND** language preference is saved to LocalStorage
- **AND** all components update text content

#### Scenario: Switch to English
- **WHEN** user selects English language
- **THEN** interface immediately switches to English
- **AND** language preference is saved to LocalStorage
- **AND** all components update text content

### Requirement: Language Persistence
The system SHALL remember user's language preference across sessions.

#### Scenario: Save language preference
- **WHEN** user switches languages
- **THEN** preference is saved to LocalStorage
- **AND** persists across browser sessions

#### Scenario: Restore language on load
- **WHEN** user returns to application
- **THEN** previously selected language is applied
- **AND** language toggle shows correct state

