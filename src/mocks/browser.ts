import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

/** MSW worker for the browser (local dev only, gated by VITE_ENABLE_MSW). */
export const worker = setupWorker(...handlers);
