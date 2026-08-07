import { HatConfig } from '@/types/hat';

// One API origin (api.hanzo.ai), one publishable key. The key IS the org:
// commerce resolves it from the credential, so no org header exists.
const API_URL = (
  (import.meta.env.VITE_HANZO_API_URL as string | undefined)?.trim() ||
  'https://api.hanzo.ai'
).replace(/\/$/, '');

const PUBLISHABLE_KEY = (import.meta.env.VITE_HANZO_PK as string | undefined)?.trim() || '';

export interface CheckoutCustomer {
  fullName: string;
  email: string;
  address: string;
  city: string;
  zip: string;
}

export interface CheckoutItem {
  id: string;
  quantity: number;
  unitPrice: number;
  hat: HatConfig;
}

export interface CheckoutSessionRequest {
  currency: string;
  customer: CheckoutCustomer;
  items: CheckoutItem[];
  successUrl: string;
  cancelUrl: string;
}

export interface CheckoutSessionResponse {
  checkoutUrl: string;
  sessionId: string;
}

export async function createCheckoutSession(
  request: CheckoutSessionRequest,
): Promise<CheckoutSessionResponse> {
  const response = await fetch(`${API_URL}/v1/checkout/sessions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(PUBLISHABLE_KEY ? { Authorization: `Bearer ${PUBLISHABLE_KEY}` } : {}),
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(body || `Checkout session failed (${response.status})`);
  }

  return (await response.json()) as CheckoutSessionResponse;
}

export const HANZO = { apiUrl: API_URL, publishableKey: PUBLISHABLE_KEY };
