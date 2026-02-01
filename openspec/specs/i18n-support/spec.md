# i18n-support Specification

## Purpose
Comprehensive internationalization support for Bulgarian and English languages with proper formatting and localization.
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

### Requirement: Language Toggle Component
The system SHALL provide a dedicated language toggle component.

#### Scenario: Language toggle interface
- **WHEN** user views language toggle
- **THEN** Bulgarian (БГ) and English (EN) options are displayed
- **AND** current language is highlighted
- **AND** toggle is accessible and keyboard navigable
- **AND** language changes apply immediately

#### Scenario: Language preference persistence
- **WHEN** user switches languages
- **THEN** preference is saved to Firebase
- **AND** preference syncs across devices
- **AND** preference is restored on app load
- **AND** fallback to browser language if no preference

### Requirement: Language Persistence and Sync
The system SHALL remember user's language preference across sessions and devices.

#### Scenario: Cross-device language sync
- **WHEN** user changes language on one device
- **THEN** preference is saved to Firebase
- **AND** other devices update language automatically
- **AND** real-time sync is maintained
- **AND** conflict resolution handles simultaneous changes

#### Scenario: Language preference restoration
- **WHEN** user returns to application
- **THEN** previously selected language is applied
- **AND** language toggle shows correct state
- **AND** Firebase preference is loaded
- **AND** fallback to browser language if needed

