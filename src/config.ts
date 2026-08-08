export type BackendStatus = 'not-configured' | 'starting' | 'online' | 'offline';

const localApiUrl = import.meta.env.DEV ? 'http://127.0.0.1:8000' : '';

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || localApiUrl).replace(/\/$/, '');
export const MEDSCRIBE_API_URL = (import.meta.env.VITE_MEDSCRIBE_API_URL || API_BASE_URL).replace(/\/$/, '');
export const PORTFOLIO_DEMO_ENABLED = import.meta.env.VITE_DEMO_MODE !== 'false';
