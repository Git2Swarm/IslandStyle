# Products & Inventory Design

This document defines the spreadsheet (CSV) contract used by `shopify-sync/sync.js` to upsert the catalog.

## CSVs and required columns

### products.csv (one row per style)
- `handle` *(slug, unique)*
- `title`
- `vendor` *(brand)*
- `product_type` *(e.g., Wig)*
- `body_html` *(rich HTML)*
- `tags` *(comma list: brand:Envy, fiber:Synthetic, construction:Lace Front, length:Medium, texture:Straight, cap_size:Average)*
- `status` *(active|draft)*
- `seo_title`, `seo_description`
- `featured_image_src` *(URL)*

### variants.csv (one row per color variant)
- `handle` *(ties to product)*
- `option1_name` = `Color`
- `option1_value` *(e.g., Almond Breeze)*
- `sku` *(unique)*
- `price`, `compare_at_price`
- `inventory_quantity` *(on-hand)*
- `inventory_policy` *(deny|continue)*
- `requires_shipping` *(TRUE|FALSE)*
- `image_src` *(URL)*
- `color_hex` *(#RRGGBB for swatch)*

### media.csv
- `handle`
- `image_src` *(URL)*
- `image_alt`
- `position` *(1..n)*

### metafields.csv
- `handle`
- `namespace` = `custom`
- `key` in {fiber, construction, cap_size, texture, length_overall, bangs_length, nape_length, weight_grams, video_url}
- `type` *(Shopify type, e.g., single_line_text_field, number_integer, number_decimal, url)*
- `value`

### collections.csv (optional smart rules)
- `collection_handle`
- `title`
- `sort_order`
- `rules` *(comma list, e.g., product_tag=brand:Envy)*

## Data rules
- `handle` is immutable—don’t change after publishing.
- Use public image URLs; Shopify will download and attach. Prefer Shopify Files.
- Keep one brand per product; expose via `vendor` and `brand:*` tag.
- Use `color_hex` to render swatches cleanly across themes.

## Filters (Search & Discovery)
Enable filters for: custom.fiber, custom.construction, custom.cap_size, custom.texture, and range for custom.length_overall.

## Inventory model
- This pipeline sets inventory at a single location from variants.csv.
- Multi-location can be added by extending the script to iterate locations per-SKU.

## Section Rendering (live refresh)
- PDP: /?section_id=main-product&handle=<handle>
- (Optional) Collection grid: /?section_id=main-collection-product-grid&collection_handle=<handle>

## Minimal example rows
products.csv
handle,title,vendor,product_type,body_html,tags,status,seo_title,seo_description,featured_image_src
alan-eaton-envy-marsha-1172,Marsha by Envy (Alan Eaton),Envy,Wig,"<p>Classic bob with soft layers and a natural lace front.</p>","brand:Envy, fiber:Synthetic, construction:Lace Front, length:Medium, texture:Straight, cap_size:Average",active,Marsha by Envy – Lace Front Synthetic Bob,Lightweight medium-length bob,https://example.com/images/marsha/main.jpg

variants.csv
handle,option1_name,option1_value,sku,price,compare_at_price,inventory_quantity,inventory_policy,requires_shipping,image_src,color_hex
alan-eaton-envy-marsha-1172,Color,Almond Breeze,ENVY-MARSHA-ALMBRZ-1172,229.00,279.00,10,deny,TRUE,https://example.com/images/marsha/almond-breeze.jpg,#B69C84
alan-eaton-envy-marsha-1172,Color,Dark Chocolate,ENVY-MARSHA-DKCHOC-1172,229.00,279.00,7,deny,TRUE,https://example.com/images/marsha/dark-chocolate.jpg,#4A2E25
