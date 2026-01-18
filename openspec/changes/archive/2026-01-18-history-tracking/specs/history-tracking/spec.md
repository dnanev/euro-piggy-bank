# History Tracking Specification

## Implementation Status

### ✅ Completed Features
- **Historical Data Storage**: Automatic snapshot creation on denomination changes
- **History Timeline**: Chronological display with filtering and pagination
- **Data Export**: CSV and JSON export with filtering options
- **Statistics Calculation**: Total saved, averages, streaks, and best days
- **Store Integration**: Full Zustand store integration with persistence
- **Internationalization**: Complete Bulgarian and English support
- **Mobile Responsiveness**: Responsive design for all screen sizes
- **Test Coverage**: Comprehensive unit and integration tests (47 tests passing)

### 🚧 In Progress Features
- **Trend Analysis and Visualization**: Chart components (HistoryChart.tsx)
- **Goal Management**: Goal creation and tracking interface (GoalSettings.tsx)
- **Advanced Filtering**: Enhanced search and filter capabilities
- **Performance Optimization**: Virtual scrolling and lazy loading for large datasets

### 📋 Pending Features
- **Period Comparison**: Side-by-side time range comparison
- **Data Archiving**: Automatic cleanup and archiving of old entries
- **Advanced Analytics**: Web Workers for complex data processing
- **Notification System**: Goal achievement notifications

## ADDED Requirements

### Requirement: Historical Data Storage
The system SHALL provide persistent storage of savings history with automatic timestamp tracking.

#### Scenario: User saves current state
**WHEN** user changes any denomination quantity in the app
**THEN** the system SHALL automatically create a history entry capturing:
- Current total savings in EUR and BGN
- Complete denomination breakdown at that moment
- Timestamp of the change
- Type of entry (automatic snapshot)

#### Scenario: User views history timeline
**WHEN** user navigates to the history tab
**THEN** the system SHALL display:
- Chronological list of all history entries
- Visual timeline with dates and totals
- Filtering options by date range and entry type
- Pagination for efficient navigation through long histories

#### Scenario: User sets savings goal
**WHEN** user creates a new savings goal
**THEN** the system SHALL:
- Store goal with target amount, currency, and deadline
- Calculate and display progress percentage
- Show estimated completion date based on current saving rate
- Send notifications when goal is achieved

#### Scenario: User exports history data
**WHEN** user requests data export
**THEN** the system SHALL provide:
- Export in CSV format with proper headers
- Export in JSON format for data portability
- Include option to export filtered date ranges
- Maintain data privacy with no external server transmission

### Requirement: Trend Analysis and Visualization
The system SHALL provide visual analysis of savings patterns over time.

#### Scenario: User views savings trends
**WHEN** user accesses the trends section
**THEN** the system SHALL display:
- Line chart showing total savings over time
- Bar chart comparing savings by month
- Pie chart showing denomination distribution
- Statistics including average daily savings, best/worst saving days
- Streak tracking for consistent saving behavior

#### Scenario: User compares time periods
**WHEN** user selects two date ranges to compare
**THEN** the system SHALL:
- Display side-by-side comparison of the two periods
- Show percentage change between periods
- Highlight differences in savings patterns
- Provide insights on saving behavior changes

### Requirement: Data Management and Privacy
The system SHALL ensure user data privacy and efficient management.

#### Scenario: User manages large history dataset
**WHEN** history exceeds 10,000 entries
**THEN** the system SHALL:
- Implement data compression automatically
- Use lazy loading for history display
- Provide option to archive old entries
- Maintain performance with virtual scrolling

#### Scenario: User wants to delete history
**WHEN** user requests history deletion
**THEN** the system SHALL:
- Provide selective deletion by date range or entry type
- Show confirmation dialog with impact summary
- Offer option to backup before deletion
- Maintain audit trail of deletions

### Requirement: Integration with Existing Features
The history system SHALL integrate seamlessly with current app functionality.

#### Scenario: History captures denomination changes
**WHEN** any denomination quantity changes
**THEN** the system SHALL:
- Automatically create history entry without user intervention
- Maintain real-time synchronization with current state
- Preserve existing manual entries and goals
- Update all related statistics and trends

#### Scenario: Currency conversion affects history
**WHEN** user toggles between EUR and BGN display
**THEN** the system SHALL:
- Store history entries in both currencies for consistency
- Convert historical amounts when displaying in different currency
- Maintain original currency metadata for accurate conversions
- Update trend calculations to reflect currency preference

### Requirement: Mobile Responsiveness
The history system SHALL provide optimal experience across all device types.

#### Scenario: User views history on mobile device
**WHEN** accessing history on screen width < 768px
**THEN** the system SHALL:
- Display collapsible timeline optimized for touch interaction
- Show simplified charts with mobile-optimized controls
- Provide vertical layout for better mobile usability
- Ensure all interactive elements meet minimum touch target size (44px)

#### Scenario: User interacts with charts on tablet
**WHEN** accessing history on screen width 768px - 1024px
**THEN** the system SHALL:
- Display interactive charts with hover and touch support
- Provide horizontal layout for complex trend analysis
- Show detailed statistics in expandable sections
- Optimize chart rendering for tablet performance

### Requirement: Performance and Efficiency
The system SHALL maintain optimal performance for smooth user experience.

#### Scenario: User has large history dataset
**WHEN** history contains more than 1,000 entries
**THEN** the system SHALL:
- Load data in chunks of 100 entries
- Implement virtual scrolling for history list
- Cache calculated statistics to avoid recalculation
- Use Web Workers for complex data processing

#### Scenario: User performs quick succession of changes
**WHEN** user makes multiple denomination changes within 1 second
**THEN** the system SHALL:
- Debounce history entry creation to avoid performance issues
- Batch multiple changes into single history entry
- Maintain responsive UI during rapid updates
- Preserve battery life on mobile devices

## Technical Implementation Details

### Data Schema
```typescript
interface HistoryEntry {
  id: string;
  timestamp: string;
  totalEur: number; // Stored in cents
  totalBgn: number; // Converted from EUR
  denominations: EuroDenomination[];
  type: 'snapshot' | 'manual-entry';
  title?: string;
  description?: string;
}

interface SavingsGoal {
  id: string;
  title: string;
  targetAmount: number; // Stored in cents
  targetCurrency: 'EUR' | 'BGN';
  deadline: string | null;
  createdAt: string;
  achievedAt: string | null;
}
```

### Storage Architecture
- **Primary Storage**: Zustand store with localStorage persistence
- **Data Format**: JSON serialization with automatic compression for >1000 entries
- **Data Integrity**: Type-safe interfaces with validation
- **Performance**: Lazy loading and caching for large datasets

### Key Components
- **HistoryTab.tsx**: Main UI component with timeline, statistics, and filtering
- **useAppStore.ts**: Extended store with history state management
- **history.ts**: Utility functions for calculations and data processing
- **i18n/**: Complete internationalization support

### Calculation Logic
- **Total Saved**: Based on last history entry (not sum of all entries)
- **Statistics**: Aggregated from history entries with proper unit conversion
- **Currency Conversion**: EUR to BGN at 1.95583 fixed rate
- **Progress Tracking**: Goal progress calculated against current total

### Test Coverage
- **47 tests** covering all major functionality
- **Unit tests**: History utilities, calculations, and data processing
- **Integration tests**: Store behavior and state management
- **Bug verification**: Critical calculation fixes and edge cases
