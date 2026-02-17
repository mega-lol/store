import { HatConfig } from '@/types/hat';

const HANZO_COMMERCE_URL = import.meta.env.VITE_HANZO_COMMERCE_URL as string | undefined;

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
  company: 'ADXYZ Inc';
  providerHint: 'stripe';
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

export function hasCommerceEndpoint(): boolean {
  return Boolean(HANZO_COMMERCE_URL);
}

export async function createCheckoutSession(
  request: CheckoutSessionRequest,
): Promise<CheckoutSessionResponse> {
  if (!HANZO_COMMERCE_URL) {
    throw new Error('Missing VITE_HANZO_COMMERCE_URL');
  }

  const response = await fetch(`${HANZO_COMMERCE_URL.replace(/\/$/, '')}/checkout/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(body || `Checkout session failed (${response.status})`);
  }

  return (await response.json()) as CheckoutSessionResponse;
}
