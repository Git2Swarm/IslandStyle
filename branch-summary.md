# Branch Summary

_Last updated: November 3, 2025_

This document summarizes the purpose and status of the **main** branch and all active feature branches in this repository. It’s intended for quick onboarding and investor/partner due diligence.

---

## main
**Role:** Working baseline. Hosts the Shopify CSV sync pipeline and product/inventory design notes.

**Key folders & files:**
- **Shopify Sync**
  - [`shopify-sync/products.csv`](shopify-sync/products.csv) — product seed data
  - [`shopify-sync/variants.csv`](shopify-sync/variants.csv) — variant/color seed data
  - [`shopify-sync/collections.csv`](shopify-sync/collections.csv) — optional smart collections
  - [`shopify-sync/metafields.csv`](shopify-sync/metafields.csv) — structured attributes for filters
  - [`shopify-sync/sync.js`](shopify-sync/sync.js) — GraphQL Admin API upsert + inventory set + section refresh
  - [`shopify-sync/package.json`](shopify-sync/package.json) — script definition
  - CI: [`.github/workflows/shopify-sync.yml`](.github/workflows/shopify-sync.yml) — runs on CSV/script changes or manual dispatch
- **Docs**
  - [`docs/ai-try-on/requirements.md`](docs/ai-try-on/requirements.md) — early product scope for AI try-on
  - [`docs/products-inventory-design.md`](docs/products-inventory-design.md) — CSV contract for the sync pipeline

**What it does today:**
- Imports/updates products, variants, images, and metafields from CSV.
- Sets inventory at a single location.
- Optionally refreshes storefront sections via Section Rendering API.

**Why it matters:** A repeatable import pipeline lets us stand up real SKUs quickly, A/B test PDPs, and prove conversion lift once the AI try-on lands.

---

## Branches

### codex/build-full-website-and-update-readme
**Intent:** Scaffold a complete marketing site (landing + core pages) and update top-level README with run/deploy notes.
**Outputs you should expect:** site shell, assets structure, and clear setup instructions for contributors.

### codex/create-ai-try-on-page-for-wigs
**Intent:** Spike a browser-based AI try-on MVP (upload/webcam → segmentation/overlay → style selection mapped to SKUs).
**Focus areas:** image capture, face/hair segmentation, overlay alignment, basic UX to choose colors/styles.

### codex/document-user-journey-and-create-wireframes
**Intent:** Document user flows and wireframes for the end‑to‑end funnel (browse → try‑on → add‑to‑cart → consult/checkout).
**Usage:** Aligns PM/design/engineering and informs the landing-page copy and PDP modules we’ll A/B test.

### codex/present-website-creation-plan
**Intent:** Planning doc/roadmap for the initial site build, content map, and deployment approach (staging → prod).
**Value:** Lets contractors and reviewers quickly understand scope, milestones, and acceptance criteria.

### shopify-sync
**Intent:** Working branch to evolve the CSV schema, sync script, and workflow before merging to `main`.
**Notes:** Keep as the sandbox for importer changes; raise small PRs into `main` tied to clear test cases.

---

## Suggested next steps (ops hygiene)
- Open crisp PRs from each `codex/*` branch with 2–3 bullet outcomes and a short Loom.
- Add a top-level `README.md` describing repo purpose, how to run the sync locally, and how to preview the site.
- Pin a lightweight `ROADMAP.md` (MVP store → AI try-on beta → funnel metrics).
- Include `.env.example` for Shopify creds and any try-on service keys.

—
_This file is intentionally concise; edit as branches land or new tracks start._