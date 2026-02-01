import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HistoryTab } from '../HistoryTab';
import { vi } from 'vitest';

// Mock the store
const mockUseAppStoreFirebase = vi.fn();
vi.mock('@/store/useAppStoreFirebase', () => ({
  useAppStoreFirebase: mockUseAppStoreFirebase,
}));

// Default mock implementation
mockUseAppStoreFirebase.mockReturnValue({
  history: [
    {
      id: '1',
      type: 'snapshot',
      timestamp: '2024-01-01T12:00:00Z',
      totalEur: 3000, // 30.00 EUR in cents
      totalBgn: 5867.49,
    },
    {
      id: '2',
      type: 'manual-entry',
      timestamp: '2024-01-02T12:00:00Z',
      title: 'Manual Savings',
      description: 'Added extra savings',
      totalEur: 5000, // 50.00 EUR in cents
      totalBgn: 9779.15,
    },
  ],
  goals: [
    {
      id: 'goal1',
      title: 'Vacation Fund',
      targetAmount: 10000, // 100.00 EUR in cents
      targetCurrency: 'EUR',
      deadline: '2024-06-01T00:00:00Z',
    },
  ],
  language: 'en',
  showBgn: false,
  addHistoryEntry: vi.fn(),
  deleteHistoryEntry: vi.fn(),
  deleteGoal: vi.fn(),
});

// Mock i18n
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

// Mock history utils
vi.mock('@/utils/history', () => ({
  calculateHistoryStatistics: vi.fn(() => ({
    totalSavedEur: 8000,
    averageDailySaving: 400,
    bestSavingDay: 500,
    currentStreak: 5,
  })),
  filterHistoryEntries: vi.fn((history) => history),
  exportHistoryData: vi.fn(() => 'csv,data'),
  calculateGoalProgress: vi.fn(() => 30.0),
  createManualHistoryEntry: vi.fn(() => ({
    id: '3',
    type: 'manual-entry',
    timestamp: new Date().toISOString(),
    title: 'Test Entry',
    totalEur: 1000,
    totalBgn: 1955.83,
  })),
}));

describe('HistoryTab', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders history title correctly', () => {
    render(<HistoryTab />);
    expect(screen.getByText('history.title')).toBeInTheDocument();
  });

  it('displays export and manual entry buttons', () => {
    render(<HistoryTab />);

    expect(screen.getByText('history.export.title')).toBeInTheDocument();
    expect(screen.getByText('history.manualEntry.title')).toBeInTheDocument();
  });

  it('displays history entries', () => {
    render(<HistoryTab />);

    expect(screen.getByText('Manual Savings')).toBeInTheDocument();
    expect(screen.getByText('Added extra savings')).toBeInTheDocument();
    expect(screen.getByText('50.00 €')).toBeInTheDocument();
    expect(screen.getByText('5867.49 BGN')).toBeInTheDocument();
  });

  it('displays statistics summary', () => {
    render(<HistoryTab />);

    expect(screen.getByText('history.statistics.title')).toBeInTheDocument();
    expect(screen.getByText('80.00')).toBeInTheDocument(); // totalSavedEur / 100
    expect(screen.getByText('4.00')).toBeInTheDocument(); // averageDailySaving / 100
    expect(screen.getByText('5.00')).toBeInTheDocument(); // bestSavingDay / 100
    expect(screen.getByText('5')).toBeInTheDocument(); // currentStreak
  });

  it('displays goals section', () => {
    render(<HistoryTab />);

    expect(screen.getByText('history.goals.title')).toBeInTheDocument();
    expect(screen.getByText('Vacation Fund')).toBeInTheDocument();
    expect(screen.getByText('30.0%')).toBeInTheDocument(); // goal progress
  });

  it('shows filters section', () => {
    render(<HistoryTab />);

    expect(screen.getByText('history.filters.dateFrom')).toBeInTheDocument();
    expect(screen.getByText('history.filters.dateTo')).toBeInTheDocument();
    expect(screen.getByText('history.filters.search')).toBeInTheDocument();
    expect(screen.getByText('history.filters.entryTypes')).toBeInTheDocument();
  });

  it('opens export dialog when export button is clicked', async () => {
    const user = userEvent.setup();
    render(<HistoryTab />);

    const exportButton = screen.getByText('history.export.title');
    await user.click(exportButton);

    expect(screen.getByText('history.export.format')).toBeInTheDocument();
    expect(screen.getByText('history.export.includeFilters')).toBeInTheDocument();
    expect(screen.getByText('common.cancel')).toBeInTheDocument();
    expect(screen.getByText('history.export.download')).toBeInTheDocument();
  });

  it('calls addHistoryEntry when manual entry is created', async () => {
    const user = userEvent.setup();
    const mockAddHistoryEntry = vi.fn();
    mockUseAppStoreFirebase.mockReturnValue({
      history: [],
      goals: [],
      language: 'en',
      showBgn: false,
      addHistoryEntry: mockAddHistoryEntry,
      deleteHistoryEntry: vi.fn(),
      deleteGoal: vi.fn(),
    });

    // Mock prompts
    const mockPrompt = vi.fn()
      .mockReturnValueOnce('Test Entry')
      .mockReturnValueOnce('25.50')
      .mockReturnValueOnce('Test Description');
    vi.stubGlobal('prompt', mockPrompt);

    render(<HistoryTab />);

    const manualEntryButton = screen.getByText('history.manualEntry.title');
    await user.click(manualEntryButton);

    expect(mockPrompt).toHaveBeenCalledWith('history.manualEntry.title');
    expect(mockPrompt).toHaveBeenCalledWith('history.manualEntry.amount');
    expect(mockPrompt).toHaveBeenCalledWith('history.manualEntry.description');
    expect(mockAddHistoryEntry).toHaveBeenCalled();
  });

  it('calls deleteHistoryEntry when delete button is clicked', async () => {
    const user = userEvent.setup();
    const mockDeleteHistoryEntry = vi.fn();

    mockUseAppStoreFirebase.mockReturnValue({
      history: [
        {
          id: '1',
          type: 'manual-entry',
          timestamp: '2024-01-01T12:00:00Z',
          title: 'Test Entry',
          totalEur: 1000,
          totalBgn: 1955.83,
        },
      ],
      goals: [],
      language: 'en',
      showBgn: false,
      addHistoryEntry: vi.fn(),
      deleteHistoryEntry: mockDeleteHistoryEntry,
      deleteGoal: vi.fn(),
    });

    render(<HistoryTab />);

    const deleteButton = screen.getByText('history.delete');
    await user.click(deleteButton);

    expect(mockDeleteHistoryEntry).toHaveBeenCalledWith('1');
  });

  it('calls deleteGoal when goal delete button is clicked', async () => {
    const user = userEvent.setup();
    const mockDeleteGoal = vi.fn();

    mockUseAppStoreFirebase.mockReturnValue({
      history: [],
      goals: [
        {
          id: 'goal1',
          title: 'Test Goal',
          targetAmount: 10000,
          targetCurrency: 'EUR',
          deadline: '2024-06-01T00:00:00Z',
        },
      ],
      language: 'en',
      showBgn: false,
      addHistoryEntry: vi.fn(),
      deleteHistoryEntry: vi.fn(),
      deleteGoal: mockDeleteGoal,
    });

    render(<HistoryTab />);

    const deleteButton = screen.getByText('history.goals.delete');
    await user.click(deleteButton);

    expect(mockDeleteGoal).toHaveBeenCalledWith('goal1');
  });

  it('displays no entries message when history is empty', () => {
    mockUseAppStoreFirebase.mockReturnValue({
      history: [],
      goals: [],
      language: 'en',
      showBgn: false,
      addHistoryEntry: vi.fn(),
      deleteHistoryEntry: vi.fn(),
      deleteGoal: vi.fn(),
    });

    render(<HistoryTab />);

    expect(screen.getByText('history.noEntries')).toBeInTheDocument();
  });

  it('displays no goals message when goals are empty', () => {
    mockUseAppStoreFirebase.mockReturnValue({
      history: [],
      goals: [],
      language: 'en',
      showBgn: false,
      addHistoryEntry: vi.fn(),
      deleteHistoryEntry: vi.fn(),
      deleteGoal: vi.fn(),
    });

    render(<HistoryTab />);

    expect(screen.getByText('history.goals.noGoals')).toBeInTheDocument();
    expect(screen.getByText('history.goals.create')).toBeInTheDocument();
  });
});
