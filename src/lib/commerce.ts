import { HatConfig } from '@/types/hat';

const configuredCommerceUrl = (import.meta.env.VITE_HANZO_COMMERCE_URL as string | undefined)?.trim();
const HANZO_COMMERCE_URL = configuredCommerceUrl && configuredCommerceUrl.length > 0
  ? configuredCommerceUrl
  : '/api/commerce';
const HANZO_TENANT = (import.meta.env.VITE_HANZO_TENANT as string | undefined)?.trim();
const HANZO_ORG = (import.meta.env.VITE_HANZO_ORG as string | undefined)?.trim();
const HANZO_PROJECT = (import.meta.env.VITE_HANZO_PROJECT as string | undefined)?.trim();

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
  tenant?: string;
  org?: string;
  project?: string;
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
  return Boolean(HANZO_COMMERCE_URL && HANZO_COMMERCE_URL.trim().length > 0);
}

export async function createCheckoutSession(
  request: CheckoutSessionRequest,
): Promise<CheckoutSessionResponse> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (HANZO_TENANT) headers['X-Hanzo-Tenant'] = HANZO_TENANT;
  if (HANZO_ORG) headers['X-Hanzo-Org'] = HANZO_ORG;
  if (HANZO_PROJECT) headers['X-Hanzo-Project'] = HANZO_PROJECT;

  const requestBody: CheckoutSessionRequest = {
    ...request,
    tenant: request.tenant || HANZO_TENANT,
    org: request.org || HANZO_ORG,
    project: request.project || HANZO_PROJECT,
  };

  const response = await fetch(`${HANZO_COMMERCE_URL.replace(/\/$/, '')}/checkout/sessions`, {
    method: 'POST',
    headers,
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(body || `Checkout session failed (${response.status})`);
  }

  return (await response.json()) as CheckoutSessionResponse;
}
