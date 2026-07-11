import '@testing-library/jest-dom/vitest';
import { afterAll, afterEach, beforeAll } from 'vitest';
import { cleanup } from '@testing-library/react';
import { server } from '@/mocks/server';
import { mockStore } from '@/mocks/handlers';

/**
 * Global test setup. Starts the MSW node server for all tests and resets the
 * in-memory review store between tests so cases stay isolated and deterministic.
 */
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

afterEach(() => {
  cleanup();
  server.resetHandlers();
  mockStore.reset();
});

afterAll(() => server.close());

// jsdom lacks matchMedia (used by MUI useMediaQuery). Provide a stub.
if (typeof window !== 'undefined' && !window.matchMedia) {
  window.matchMedia = (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  });
}
