# Inventory & Sync Overview

This repo includes a lightweight pipeline to import and keep your Shopify catalog fresh without republishing the theme.

**What it does**
- Import/update Products, Variants, Images, and Metafields from CSVs.
- Set inventory for a single location.
- Refresh storefront sections in-place (Section Rendering API).

**Files**
- `shopify-sync/products.csv` – one row per product (style)
- `shopify-sync/variants.csv` – one row per color (variant) per product
- `shopify-sync/media.csv` – product gallery images
- `shopify-sync/metafields.csv` – structured attributes feeding storefront filters
- `shopify-sync/collections.csv` – (optional) smart collection rules
- `shopify-sync/sync.js` – Node script (GraphQL Admin API)

**Filters (Search & Discovery)**
Map these metafields to filters: `custom.fiber`, `custom.construction`, `custom.cap_size`, `custom.texture`, `custom.length_overall` (range).

**Run**
```bash
cd shopify-sync
cp .env.example .env   # fill values
npm i
npm run sync
```

**Validate**
- Admin → Products: variants/pricing/images present
- Admin → Products → Metafields: fiber/cap_size/... populated
- App → Search & Discovery: filters show up
- Storefront: PDP shows variant swatches; brand collection lists items; filters apply
