# MEGA Hat Store

3D hat customizer + pre-order flow.

- Current GitHub Pages: `https://zeekay.github.io/megahats/`
- Target production IA:
  - `https://ad.xyz/mega` -> MEGA storefront/designer (this app)
  - `https://ad.xyz/docs` -> ADXYZ docs (served by docs app)

## Local Development

```sh
npm install
npm run dev
```

Optional local path-base test:

```sh
VITE_BASE_PATH=/mega/ npm run build
```

## Env Vars

Frontend build-time variables:

- `VITE_BASE_PATH` (default prod: `/megahats/`, k8s/paas should use `/mega/`)
- `VITE_HANZO_COMMERCE_URL` (Hanzo Commerce API base URL)
- `VITE_ADXYZ_HOME_URL` (tiny bottom-left link on main page, default `https://ad.xyz`)

## Payments

This app does not call Stripe directly. Checkout goes through Hanzo Commerce:

- client posts to `${VITE_HANZO_COMMERCE_URL}/checkout/sessions`
- commerce backend handles provider routing (`stripe` hint) and payment processing

## Deployment

### 1) GitHub Pages (existing)

Workflow: `.github/workflows/deploy.yml`

- deploys this app to `zeekay.github.io/megahats`

### 2) Hanzo k8s (ad.xyz/mega)

Workflow: `.github/workflows/deploy-k8s.yml`

- builds image from `Dockerfile`
- pushes to `ghcr.io/<owner>/mega-store`
- applies `k8s/overlays/ad-xyz`
- expects ingress paths:
  - `/mega` -> this app
  - `/docs` -> `adxyz-docs` service
  - `/` -> redirect to `/mega`

Required GitHub secrets:

- `HANZO_K8S_KUBECONFIG_B64` (base64 kubeconfig for `hanzo-k8s`)

Recommended GitHub vars:

- `HANZO_COMMERCE_URL` (e.g. `https://commerce.ad.xyz`)
- `ADXYZ_HOME_URL` (e.g. `https://ad.xyz`)

### 3) Hanzo PaaS deployment (optional)

Workflow: `.github/workflows/deploy-paas.yml`

- builds/pushes image to GHCR
- authenticates to Hanzo PaaS API
- upserts container image under org slug `adxyz`

Required GitHub secrets:

- `PAAS_EMAIL`
- `PAAS_PASSWORD`

Optional GitHub vars:

- `PAAS_API_URL` (default `https://platform.hanzo.ai`)
- `HANZO_COMMERCE_URL`
- `ADXYZ_HOME_URL`

## Migrate Repo to ad-xyz org

If/when repo is created in ad-xyz org:

```sh
git remote rename origin zeekay
git remote add origin https://github.com/ad-xyz/megahats.git
git push -u origin main
```

## Stack

- React + TypeScript + Vite
- Three.js / React Three Fiber
- Tailwind CSS
