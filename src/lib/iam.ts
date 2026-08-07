// Hanzo IAM client — first-party SSO via the Hanzo IAM portal.
// Login is delegated to the portal; this code only needs login/logout
// redirects + a /me probe. The probe only runs when an IAM portal is
// explicitly configured for this deployment (VITE_IAM_URL).

const IAM_URL = (
  (import.meta.env.VITE_IAM_URL as string | undefined)?.trim() ||
  'https://hanzo.id'
).replace(/\/$/, '');

const IAM_CONFIGURED = Boolean((import.meta.env.VITE_IAM_URL as string | undefined)?.trim());

import { HANZO } from './commerce';

export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
}

export function loginUrl(returnPath: string = window.location.pathname): string {
  const ret = `${window.location.origin}${returnPath}`;
  return `${IAM_URL}/login?return_url=${encodeURIComponent(ret)}`;
}

export function signupUrl(returnPath: string = window.location.pathname): string {
  const ret = `${window.location.origin}${returnPath}`;
  return `${IAM_URL}/signup?return_url=${encodeURIComponent(ret)}`;
}

export function logoutUrl(returnPath: string = '/'): string {
  const ret = `${window.location.origin}${returnPath}`;
  return `${IAM_URL}/logout?return_url=${encodeURIComponent(ret)}`;
}

export async function fetchCurrentUser(): Promise<User | null> {
  if (!IAM_CONFIGURED) return null;
  const res = await fetch(`${HANZO.apiUrl}/v1/me`, { credentials: 'include' });
  if (res.status === 401 || res.status === 404) return null;
  if (!res.ok) throw new Error(`/v1/me failed (${res.status})`);
  return (await res.json()) as User;
}

export const IAM = { url: IAM_URL };
