/**
 * Base URL for the NestJS API.
 *
 * Locally this is empty so requests stay same-origin and Vite proxies `/api`
 * to the NestJS server. In production (Netlify), set VITE_API_URL to the
 * deployed API origin, e.g. https://your-api.up.railway.app
 */
export const API_BASE_URL = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");

export function apiUrl(path: string): string {
  if (!path.startsWith("/")) {
    return `${API_BASE_URL}/${path}`;
  }
  return `${API_BASE_URL}${path}`;
}
