import { createApiClient } from './client';

/** The app's API instance. Set VITE_API_URL to call an API directly instead of through the dev proxy. */
export const api = createApiClient(import.meta.env.VITE_API_URL ?? '/api');

export * from './client';
export * from './types';
