## 1. Project Setup
- [x] 1.1 Initialize React + Vite + TypeScript project
- [x] 1.2 Configure TailwindCSS and shadcn/ui
- [x] 1.3 Set up Zustand for state management
- [x] 1.4 Configure react-i18next for Bulgarian/English support
- [x] 1.5 Set up Vitest and React Testing Library
- [x] 1.6 Configure Playwright for E2E testing

## 2. Core Components
- [x] 2.1 Create DenominationRow component with quantity inputs
- [x] 2.2 Create GrandTotalCard component with conversion display
- [x] 2.3 Create TabGroup component for Breakdown/History/Settings
- [x] 2.4 Create ThemeToggle component for dark/light mode
- [x] 2.5 Create LanguageToggle component for BG/EN switching

## 3. State Management
- [x] 3.1 Set up Zustand store for denomination quantities
- [x] 3.2 Implement theme state management
- [x] 3.3 Add language preference state
- [x] 3.4 Create LocalStorage persistence layer
- [x] 3.5 Add BGN display toggle state

## 4. Internationalization
- [x] 4.1 Create Bulgarian translation files
- [x] 4.2 Create English translation files
- [x] 4.3 Implement currency formatting for both languages
- [x] 4.4 Add number localization support
- [x] 4.5 Add missing "cancel" translation key

## 5. Currency Conversion
- [x] 5.1 Implement hardcoded EUR/BGN rate (1.95583)
- [x] 5.2 Create conversion utilities
- [x] 5.3 Add formatted currency display components
- [x] 5.4 Implement fallback for other currencies (optional API)
- [x] 5.5 Add BGN display toggle functionality
- [x] 5.6 Update all Euro displays to show BGN when toggle enabled

## 6. Theme System
- [x] 6.1 Create TailwindCSS dark mode configuration
- [x] 6.2 Implement system preference detection
- [x] 6.3 Create theme context/provider
- [x] 6.4 Add theme persistence to LocalStorage

## 7. Responsive Design
- [x] 7.1 Implement mobile-first layout
- [x] 7.2 Create responsive breakpoints
- [x] 7.3 Optimize touch targets for mobile
- [x] 7.4 Test across different screen sizes
- [x] 7.5 Update to 2-column grid layout for denomination cards

## 8. Testing
- [x] 8.1 Write unit tests for all components
- [x] 8.2 Create integration tests for state management
- [x] 8.3 Add E2E tests for critical user flows
- [x] 8.4 Test theme switching functionality
- [x] 8.5 Test internationalization features

## 9. Accessibility
- [x] 9.1 Implement proper ARIA labels
- [x] 9.2 Ensure keyboard navigation
- [x] 9.3 Test with axe-core for accessibility
- [x] 9.4 Verify color contrast in both themes

## 10. UI/UX Improvements
- [x] 10.1 Integrate increment/decrement buttons into input field
- [x] 10.2 Remove default number input arrows
- [x] 10.3 Align total text with value horizontally
- [x] 10.4 Move BGN toggle to settings page
- [x] 10.5 Replace browser alerts with shadcn confirmation dialog
- [x] 10.6 Update "leva" terminology to "BGN"

## 11. PWA Features (Optional)
- [x] 11.1 Configure service worker for offline access
- [x] 11.2 Add app manifest
- [x] 11.3 Implement install prompt
- [x] 11.4 Test offline functionality
