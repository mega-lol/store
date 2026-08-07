# Osage Brothers — Store

Production frontend for `mega.shop` (GitHub Pages, custom domain). Single-SKU MEGA hat. Black or white. $50.

- 3D R3F preview
- IAM SSO via `id.osagebrothers.com` (cookie scoped to `.osagebrothers.com`)
- Hosted checkout at `pay.osagebrothers.com` via Hanzo Commerce

## Local development

```sh
npm install
npm run dev
```

## Build

```sh
npm run build       # → dist/
npm run preview     # local preview of the production bundle
```

## Environment

| Variable | Default | Notes |
| --- | --- | --- |
| `VITE_BASE_PATH` | `/` | Pass `/megahats/` for the legacy GitHub Pages build. |
| `VITE_HANZO_API_URL` | `https://api.hanzo.ai` | The one Hanzo API origin (commerce, insights, sites). |
| `VITE_HANZO_PK` | _(empty)_ | The `megashop` project publishable `pk-` key. Powers the Insights tag and authenticates checkout. Empty ⇒ analytics inert, checkout falls back to pre-order. |
| `VITE_IAM_URL` | _(empty → `https://hanzo.id` links)_ | Set only when an IAM portal is wired for this domain; unset skips the `/v1/me` probe entirely. |

One key, one origin. The `pk-` key IS the org — commerce resolves it from
the credential, so no org header exists anywhere.

## Auth flow

The store does not run an OIDC client. Login is delegated to the Hanzo IAM
portal (`hanzo.id` by default). Until `VITE_IAM_URL` is set for this domain,
the store never probes `/v1/me` — checkout works without login.

## Checkout flow

1. Cart posts to `POST ${VITE_HANZO_API_URL}/v1/checkout/sessions` with
   `Authorization: Bearer ${VITE_HANZO_PK}`. Server returns
   `{ checkoutUrl, sessionId }`.
2. Browser redirects to `checkoutUrl` (Hanzo Pay, served by the commerce
   binary).
3. After payment, Hanzo Pay redirects back to
   `https://mega.shop/cart?checkout=success` (or `=cancel`).
4. While the backend has no checkout route deployed (404), the cart degrades
   to a pre-order confirmation instead of failing.

No payment-provider keys touch the frontend. Stripe/Square is selected and
called from the commerce backend.

## Analytics

`index.html` carries the Hanzo Insights tag:

```html
<script defer src="https://api.hanzo.ai/v1/event.js" data-key="pk-…"></script>
```

The key is injected at build time from `VITE_HANZO_PK`; with no key the tag is
inert (sends nothing).

## Ops checklist

These are infrastructure prerequisites for a working deployment. The store
itself does not provision them.

### 1. Org registration in `@hanzo/iam`

Register the `osage` org in the Hanzo IAM control plane (`~/work/hanzo/iam`)
with branding pulled from `@hanzo/id` (`~/work/hanzo/id/lib/branding.ts` —
entries for `osagebrothers.com`, `id.osagebrothers.com`,
`pay.osagebrothers.com` already added).

KMS keys must be scoped per-org per the standing rule:
secrets in KMS only, never plaintext.

### 2. Org registration in `@hanzo/commerce`

Register the `osage` org in the Commerce backend
(`~/work/hanzo/commerce`) with:

- Provider routing (Stripe account / Square / etc).
- `returnUrlAllowlist` containing `https://osagebrothers.com/cart` (success +
  cancel parameters).
- Branding (`pay.osagebrothers.com` hostname, served via embedded
  `@hanzoai/pay`).

### 3. DNS

The following A/CNAME records must point at the appropriate ingress:

- `osagebrothers.com` → store ingress (this app).
- `id.osagebrothers.com` → `@hanzo/id` deployment.
- `pay.osagebrothers.com` → `@hanzo/commerce` deployment (which embeds
  `@hanzoai/pay`).

### 4. NPM publish (Hanzo JS packages)

The `@hanzo/iam`, `@hanzo/id`, and `@hanzoai/pay` packages currently flag
`"private": true`. Publishing is a separate release engineering step,
not done by this app. Once published, deployments can pin versions.

This store does not import any of those as runtime npm dependencies — it
only consumes them as deployed services (`id.osagebrothers.com`,
`pay.osagebrothers.com`, `commerce.hanzo.ai`).

## Deployment

Two live targets, one artifact:

- **GitHub Pages** (`mega.shop`): auto on push to main
  (`.github/workflows/deploy.yml`). Var: `HANZO_PK`.
- **Hanzo sites** (`megashop.hanzo.app`): zip `dist/` (exclude `*.map`, stay
  under 4 MiB) → `POST api.hanzo.ai/v1/platform/sites/megashop/deploy` with a
  `hanzo auth token` bearer.

## Stack

- React 18 + TypeScript + Vite
- Three.js / React Three Fiber
- Tailwind + Radix
- Tanstack Query
