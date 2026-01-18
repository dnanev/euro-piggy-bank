# Change: Add Main Euro Piggy Bank Application

## Why
Create a comprehensive Euro denomination tracking application that helps users monitor their physical savings with real-time calculations, currency conversion, and insights about savings patterns.

## What Changes
- Add complete Euro Piggy Bank application with all core features
- Implement denomination tracking for all Euro coins and banknotes
- Add Bulgarian/English internationalization with Bulgarian as primary
- Include hardcoded EUR/BGN conversion rate (1.95583)
- Implement dark/light theme switching with system preference detection
- Add responsive mobile-first design using shadcn/ui components
- Include comprehensive testing with Vitest and Playwright
- Add offline functionality with LocalStorage persistence

## Impact
- Affected specs: New capabilities for euro-denomination-tracker, currency-conversion, theme-management, i18n-support
- Affected code: Core application structure, components, state management, testing setup
- Dependencies: React, Vite, TypeScript, TailwindCSS, shadcn/ui, Zustand, react-i18next, Vitest
