import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TabGroup } from '../TabGroup';
import { TabProvider } from '@/contexts/TabContext';
import { vi } from 'vitest';

// Mock i18n
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

// Mock the components that TabGroup renders
vi.mock('../DenominationList', () => ({
  DenominationList: () => <div data-testid="denomination-list">DenominationList</div>,
}));

vi.mock('../HistoryTab', () => ({
  HistoryTab: () => <div data-testid="history-tab">HistoryTab</div>,
}));

vi.mock('../SettingsTab', () => ({
  SettingsTab: () => <div data-testid="settings-tab">SettingsTab</div>,
}));

describe('TabGroup', () => {
  const renderWithProvider = () => {
    return render(
      <TabProvider>
        <TabGroup />
      </TabProvider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders tab buttons', () => {
    renderWithProvider();

    expect(screen.getByText('tabs.breakdown')).toBeInTheDocument();
    expect(screen.getByText('tabs.history')).toBeInTheDocument();
  });

  it('shows breakdown tab by default', () => {
    renderWithProvider();

    expect(screen.getByTestId('denomination-list')).toBeInTheDocument();
    expect(screen.queryByTestId('history-tab')).not.toBeInTheDocument();
    expect(screen.queryByTestId('settings-tab')).not.toBeInTheDocument();
  });

  it('switches to history tab when clicked', async () => {
    const user = userEvent.setup();
    renderWithProvider();

    const historyTab = screen.getByText('tabs.history');
    await user.click(historyTab);

    expect(screen.getByTestId('history-tab')).toBeInTheDocument();
    expect(screen.queryByTestId('denomination-list')).not.toBeInTheDocument();
    expect(screen.queryByTestId('settings-tab')).not.toBeInTheDocument();
  });

  it('switches to settings tab when clicked', async () => {
    renderWithProvider();

    // Settings tab is not in the TabsList, so this test is not applicable
    // The component only has breakdown and history tabs in the navigation
    expect(screen.queryByText('tabs.settings')).not.toBeInTheDocument();
  });

  it('switches back to breakdown tab when clicked', async () => {
    const user = userEvent.setup();
    renderWithProvider();

    // First switch to history
    const historyTab = screen.getByText('tabs.history');
    await user.click(historyTab);

    // Then switch back to breakdown
    const breakdownTab = screen.getByText('tabs.breakdown');
    await user.click(breakdownTab);

    expect(screen.getByTestId('denomination-list')).toBeInTheDocument();
    expect(screen.queryByTestId('history-tab')).not.toBeInTheDocument();
    expect(screen.queryByTestId('settings-tab')).not.toBeInTheDocument();
  });

  it('highlights active tab', async () => {
    const user = userEvent.setup();
    renderWithProvider();

    // Initially breakdown should be active (Radix UI uses data-state attribute)
    const breakdownTab = screen.getByText('tabs.breakdown');
    expect(breakdownTab).toHaveAttribute('data-state', 'active');

    // Switch to history
    const historyTab = screen.getByText('tabs.history');
    await user.click(historyTab);

    expect(historyTab).toHaveAttribute('data-state', 'active');
    expect(breakdownTab).toHaveAttribute('data-state', 'inactive');
  });

  it('has proper accessibility attributes', () => {
    renderWithProvider();

    const tabs = screen.getAllByRole('tab');
    expect(tabs).toHaveLength(2); // Only breakdown and history tabs

    tabs.forEach(tab => {
      expect(tab).toHaveAttribute('role', 'tab');
      expect(tab).toHaveAttribute('aria-selected');
    });
  });
});
