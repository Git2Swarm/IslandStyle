# IslandStyle

IslandStyle is the home of our premium wig shopping experience. This repository tracks three parallel workstreams that come together to power the brand:

1. A marketing website that introduces the brand story, showcases hero styles, and funnels visitors into the AI try-on.
2. The browser-based AI try-on experience that lets shoppers visualize wigs on their own photo in seconds.
3. A Shopify CSV + GraphQL pipeline that keeps the product catalog, variants, and metafields in sync with production.

The `codex/create-ai-try-on-page-for-wigs` spike is being split into **two reviewable pull requests**:

- **Docs + demo extraction (this workstream):** ships documentation, clickable prototypes, and sandbox demos only. No production code paths change, so it can merge safely once reviewers sign off.
- **Gated UI release:** follows later with the production try-on shell behind a kill switch and environment flag. That branch will only touch the front-end package paths called out in `branch-summary.md`.

Always rebase on the latest `main` before opening either PR (`git fetch && git checkout main && git pull --ff-only`) and use path-scoped cherry-picks/restores to keep diffs limited to the directories called out below.

---

## Current status snapshot

- ✅ `main` today contains documentation, CSV tooling, and demo guidance only—no production AI try-on UI has shipped yet.
- 🚧 The forthcoming docs + demo PR extracts sandbox assets without touching runtime bundles so it remains production-neutral.
- 🔒 The gated UI PR will introduce the try-on surface behind a kill switch; do not merge it without verifying the flag defaults to "off" in production.

Keep the README in sync with the actual rollout so reviewers can instantly confirm which assets are live.

---

## 1. Website design & experience blueprint

The marketing site is being built as a modular, content-driven experience that highlights what makes IslandStyle unique and moves visitors into the try-on flow quickly.

### Core page structure

| Page | Primary Goals | Key Modules |
| --- | --- | --- |
| **Landing / Home** | Establish the IslandStyle look & feel, tease the try-on, highlight signature collections | Hero with video/loop, try-on CTA band, featured wig carousel, "Why IslandStyle" value grid, testimonials |
| **Collections** | Browse curated wig families by length, texture, or lifestyle moments | Filterable collection grid powered by Shopify Search & Discovery metafields, highlights for trending colorways |
| **Product Detail (PDP)** | Educate and convert with rich storytelling, trust signals, and a persistent try-on CTA | Gallery with lifestyle + on-scalp renders, fabric/construction callouts, fit & fiber spec table, AI try-on entry button, cross-sell carousel |
| **Consultation / Fit Guide** | Reduce anxiety around selection & care | Interactive cap size guide, haircare tips accordions, booking CTA for stylist consult |
| **AI Try-On Landing** | Explain how the try-on works and set expectations before upload | Step-by-step process cards, privacy assurances, device compatibility checklist |

### Visual system highlights

- **Palette:** sunlit neutrals with bold coral accents for CTAs to align with the IslandStyle brand mood boards.
- **Typography:** pairing of a refined serif for headlines and a modern sans-serif for body copy to balance luxury and approachability.
- **Components:** card-based grids, sticky CTA footers, and section dividers with subtle wave motifs evoke coastal roots.
- **Responsiveness:** mobile-first breakpoints with touch-friendly carousel controls and compressible hero media.

These modules map directly to the product data exposed via the Shopify sync so CMS updates and CSV refreshes show up without code changes.

---

## 2. AI try-on docs, demo workflow & release guardrails

The MVP user journey is documented in [`docs/ai-try-on/requirements.md`](docs/ai-try-on/requirements.md). The doc + demo PR should keep work restricted to the `docs/` folder, UX prototypes, and any Storybook/sandbox environments. Production UI bundles stay untouched.

### Journey overview

1. Shopper enters from the Favorites hub and selects wigs to try.
2. They upload or capture a portrait after acknowledging privacy/consent.
3. Automated checks validate framing, resolution, and background; shoppers fix issues inline if needed.
4. Rendering queues pair selected wigs to the portrait with live status updates (Preparing → Rendering → Finalizing).
5. The preview screen supports zoom, rotate, color toggles, and quick swapping across the favorites carousel.
6. CTA cluster lets shoppers add to bag, save looks, share, and submit feedback for realism scoring.

### Sandbox/demo expectations

- Host prototypes behind a temporary URL or Storybook instance with dummy data — no production API keys.
- Instrument qualitative feedback capture (session recordings or inline surveys) to validate realism before the gated UI ships.
- Document known limitations directly in the README so reviewers understand demo boundaries.

### Release guardrails for the gated UI follow-up

- Wrap the production try-on entry point with a feature flag + emergency kill switch.
- Ship environment variables for flag defaults and document how to toggle in staging vs. production.
- Limit the follow-up PR to front-end package directories listed in `branch-summary.md`; rely on `git restore --source` or targeted cherry-picks to avoid polluting docs-only diffs.
- Maintain the KPI targets from the requirements doc: ≥35% favorites-to-try-on conversion, ≥80% completion rate, ≥15% add-to-bag, P95 latency ≤20s, ≥25% feedback response.

---

## 3. Shopify CSV integration

The `shopify-sync` workspace contains a repeatable importer that pushes catalog updates to Shopify without republishing the theme.

### Folder quick tour

- [`shopify-sync/products.csv`](shopify-sync/products.csv) – product-level attributes (title, body HTML, tags, imagery).
- [`shopify-sync/variants.csv`](shopify-sync/variants.csv) – one row per color variant including SKU, pricing, inventory, and swatch color.
- [`shopify-sync/media.csv`](shopify-sync/media.csv) – ordered gallery imagery.
- [`shopify-sync/metafields.csv`](shopify-sync/metafields.csv) – structured data for filters (fiber, construction, cap size, texture, lengths, etc.).
- [`shopify-sync/collections.csv`](shopify-sync/collections.csv) – optional smart collection rules.
- [`shopify-sync/sync.js`](shopify-sync/sync.js) – Node.js script that calls the Shopify Admin GraphQL API to upsert products, variants, media, metafields, inventory, and triggers optional Section Rendering refreshes.

Additional schema details live in [`docs/products-inventory-design.md`](docs/products-inventory-design.md).

### Running the sync

```bash
cd shopify-sync
cp .env.example .env  # add Shopify Admin API credentials + location
npm install
npm run sync
```

After the run, confirm in Shopify Admin that variants, pricing, imagery, and metafields are populated and that Search & Discovery filters are active. The script currently targets a single inventory location; extend `sync.js` if you need multi-location support.

---

## 4. Repository structure

```
.
├── README.md                      # You are here
├── branch-summary.md              # Living overview of branches and outstanding workstreams
├── docs/
│   ├── ai-try-on/requirements.md  # Detailed AI try-on user journey & KPIs
│   └── products-inventory-design.md
└── shopify-sync/
    ├── README.md                  # Sync-specific quickstart
    ├── *.csv                      # Catalog data seeds
    └── sync.js                    # Importer script
```

---

## 5. Getting started

1. **Clone & install** – `git clone` the repo and run `npm install` inside `shopify-sync` to pull dependencies for the importer.
2. **Review docs** – Start with this README, then read `docs/ai-try-on/requirements.md` and `docs/products-inventory-design.md` to understand product + data expectations.
3. **Prep credentials** – Copy `shopify-sync/.env.example` to `.env` and fill in Shopify Admin API tokens, store URL, and location IDs.
4. **Run sync locally** – Execute `npm run sync` to populate a dev store with catalog data; verify filters and PDP swatches render correctly.
5. **Iterate on UX** – Use the AI try-on requirements and website design modules above to guide design/dev work on the marketing site and try-on front end.
6. **Open PRs** – Keep work scoped per branch summary guidance: crisp PRs with outcomes, loom walkthroughs, and updated docs as flows evolve.

---

## 6. Roadmap snapshot

- ✅ Catalog pipeline MVP with CSV import + Section Rendering refresh.
- 🚧 Marketing site shell & content model (see `codex/build-full-website-and-update-readme`).
- 🚧 AI try-on doc + demo extraction (current work) followed by gated UI with kill switch.
- 📝 Upcoming: top-level `ROADMAP.md`, `.env.example` for Shopify creds, production try-on deployment notes.

Stay aligned by updating `branch-summary.md` when milestones land and keeping documentation current.
