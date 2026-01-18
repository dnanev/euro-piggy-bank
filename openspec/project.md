# Project Context

## Purpose
A modern, responsive Euro denomination tracker that helps users monitor their physical savings by inputting quantities of different Euro coins and banknotes. The app provides real-time calculations, currency conversion to local currencies, and insights about savings patterns.

## Tech Stack
- **Frontend Framework**: React with Vite
- **Language**: TypeScript
- **Styling**: TailwindCSS with shadcn/ui components
- **State Management**: Zustand for global state management
- **Internationalization**: react-i18next (Bulgarian as primary language, English as secondary)
- **Currency Conversion**: Hardcoded EUR/BGN rate of 1.95583, optional live API for other currencies
- **Storage**: LocalStorage/IndexedDB for offline use
- **Testing**: Vitest + React Testing Library for unit tests, Playwright for E2E
- **Accessibility**: axe-core for a11y testing
- **Deployment**: Vercel, Netlify, or GitHub Page
- **PWA**: Optional support for offline access

## Project Conventions

### Code Style
- Use TypeScript for type safety
- Follow React functional component patterns with hooks
- Use TailwindCSS for styling with shadcn/ui components as primary choice
- Only create custom components when no equivalent shadcn component exists
- Use Zustand for global state management
- Implement flat, modern design without glass effects or shadows
- Mobile-first responsive design approach
- Use Inter font for typography
- Maintain accessible contrast ratios and touch targets
- Support dark theme with system preference detection and manual toggle

### Architecture Patterns
- Component-based architecture with clear separation of concerns
- Local state management for simplicity, optional global state for complex features
- Modular component structure organized by feature (layout, denominations, totals, ui)
- Progressive enhancement approach for PWA features
- API integration for live currency conversion rates
- Theme management with context or state management for dark/light mode switching
- **Flexbox-first approach**: Prefer flexbox over grid for card layouts to ensure natural wrapping and responsive behavior
- **Mobile-first responsive design**: Cards should adapt seamlessly from single column (mobile) to multi-column (desktop)

### Testing Strategy
- Unit tests for all components using Jest + React Testing Library
- E2E tests for critical user flows using Playwright
- Accessibility testing with axe-core
- Responsive testing across different screen sizes
- Theme testing for both light and dark modes
- Focus on testing user interactions and state management

### Git Workflow
- Feature branch development
- Conventional commit messages
- Regular integration testing before merges
- Semantic versioning for releases

## Domain Context
This is a personal finance tracking application focused on physical Euro currency with Bulgarian localization. Key domain concepts:
- Euro denominations: Coins (1c, 2c, 5c, 10c, 20c, 50c, €1, €2) and Banknotes (€5, €10, €20, €50, €100, €200, €500)
- Currency conversion: Fixed EUR/BGN rate of 1.95583 (1 Euro = 1.95583 Bulgarian Leva), optional live API for other currencies
- Language support: Bulgarian as primary language, English as secondary
- Savings insights: Most saved denomination, top 3 denominations, coin/banknote breakdown
- Data persistence: Local storage for offline functionality

## Important Constraints
- Must work offline as primary use case
- Mobile-first design with touch-friendly interface
- Real-time calculations must be instant and accurate
- Fixed EUR/BGN conversion rate of 1.95583 must be hardcoded and reliable
- Bulgarian language as primary with proper Cyrillic support
- Dark theme support with manual toggle and system preference detection
- Accessible design meeting WCAG standards in both light and dark themes
- Progressive web app capabilities for native-like experience

## External Dependencies
- **Currency API**: Optional exchangerate.host or European Central Bank feed for non-BGN conversion rates
- **Fixed Rate**: Hardcoded EUR/BGN conversion rate of 1.95583 (no external dependency)
- **Optional Cloud Sync**: Firebase or Supabase for multi-device synchronization
- **Optional Auth**: Firebase Auth or similar for cloud features
- **Deployment**: Vercel/Netlify for hosting, GitHub Pages as alternative
