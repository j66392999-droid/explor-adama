# Testing Setup (Mobile)

This file documents how to run the tests and what helper utilities are included in the tests folder.

Prerequisites
- Node 18+ and pnpm installed.
- From project root:

```bash
cd apps/mobile
pnpm install
```

Install (dev) dependencies used by tests:
```bash
pnpm add -D msw @testing-library/react-native @testing-library/jest-native react-test-renderer @types/jest jest
```

Add to `jest.config.js` or to your project Jest config (if using expo, integrate with jest-expo) the following `setupFilesAfterEnv`:

```json
{
  "setupFilesAfterEnv": ["<rootDir>/__tests__/setup.ts"]
}
```

Utilities added
- `__tests__/mocks/` - MSW handlers and server that mock the API responses.
- `__tests__/utils/renderWithProviders.tsx` - helper to render components under Provider, ThemeProvider and SafeAreaProvider.
- `__tests__/utils/testUtils.tsx` - common testing presets (default preload state).

Notes
- The app uses a base AppConfig.api.baseURL; tests intercept calls to this URL using MSW handlers.
- Ensure `msw` and testing libraries are properly installed for test run success.
