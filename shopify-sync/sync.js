import 'dotenv/config';
import fs from 'fs';
import { parse } from 'csv-parse/sync';
import fetch from 'node-fetch';

const store = process.env.SHOPIFY_STORE;
const token = process.env.SHOPIFY_ADMIN_TOKEN;
const domain = process.env.STOREFRONT_DOMAIN;

const GQL = async (query, variables={}) => {
  const r = await fetch(`https://${store}/admin/api/2024-10/graphql.json`, {
    method: 'POST',
    headers: {
      'X-Shopify-Access-Token': token,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query, variables })
  });
  const j = await r.json();
  if (j.errors) throw new Error(JSON.stringify(j.errors, null, 2));
  return j.data;
};

const readCSV = (p) => parse(fs.readFileSync(p), { columns: true, skip_empty_lines: true });

const getLocationId = async (name) => {
  const q = `query { locations(first: 50) { nodes { id name } } }`;
  const d = await GQL(q);
  const loc = d.locations.nodes.find(x => x.name === name) || d.locations.nodes[0];
  return loc?.id;
};

const upsertProduct = async (p) => {
  const q = `query($h:String!){ productByHandle(handle:$h){ id } }`;
  const d = await GQL(q, { h: p.handle });
  if (d.productByHandle?.id) {
    const m = `mutation($id:ID!,$input:ProductInput!){ productUpdate(input:Object.assign({id:$id},$input)) { product { id handle } userErrors { field message } } }`;
    const input = {
      title: p.title, vendor: p.vendor, productType: p.product_type,
      handle: p.handle, status: p.status?.toUpperCase() === 'ACTIVE' ? 'ACTIVE' : 'DRAFT',
      tags: p.tags?.split(',').map(t=>t.trim()),
      bodyHtml: p.body_html || null,
      seo: { title: p.seo_title || null, description: p.seo_description || null }
    };
    const dd = await GQL(m, { id: d.productByHandle.id, input });
    return dd.productUpdate.product.id;
  } else {
    const m = `mutation($input:ProductInput!){ productCreate(input:$input){ product{ id handle } userErrors { field message } } }`;
    const input = {
      title: p.title, vendor: p.vendor, productType: p.product_type,
      handle: p.handle, status: p.status?.toUpperCase() === 'ACTIVE' ? 'ACTIVE' : 'DRAFT',
      tags: p.tags?.split(',').map(t=>t.trim()),
      bodyHtml: p.body_html || null,
      seo: { title: p.seo_title || null, description: p.seo_description || null },
      options: [{ name: 'Color' }]
    };
    const dd = await GQL(m, { input });
    return dd.productCreate.product.id;
  }
};

const upsertVariants = async (productId, handle, rows) => {
  if (!rows.length) return;
  const m = `mutation($variants:[ProductVariantInput!]!){
    productVariantsBulkCreate(productId:"${productId}", variants:$variants){
      productVariants { id title sku }
      userErrors { field message }
    }
  }`;
  const toCreate = rows.map(v => ({
    productId,
    sku: v.sku || null,
    price: v.price ? String(v.price) : null,
    barcode: v.barcode || null,
    options: [v.option1_value],
    inventoryPolicy: (v.inventory_policy || 'deny').toUpperCase(),
    requiresShipping: (v.requires_shipping || 'true').toLowerCase() === 'true'
  }));
  await GQL(m, { variants: toCreate });
};

const setProductImages = async (productId, mediaRows) => {
  const m = `mutation($input:ProductImageInput!){
    productImageCreate(input:$input){ image { id } userErrors { field message } }
  }`;
  for (const r of mediaRows.sort((a,b)=> +a.position - +b.position)) {
    await GQL(m, { input: { productId, src: r.image_src, altText: r.image_alt || null } });
  }
};

const setMetafields = async (ownerId, mfs) => {
  if (!mfs.length) return;
  const m = `mutation metafieldsSet($metafields:[MetafieldsSetInput!]!){
    metafieldsSet(metafields:$metafields){
      metafields { key namespace type }
      userErrors { field message }
    }
  }`;
  const payload = mfs.map(x => ({
    ownerId,
    namespace: x.namespace || 'custom',
    key: x.key,
    type: x.type,
    value: String(x.value)
  }));
  await GQL(m, { metafields: payload });
};

const getVariantInventoryItems = async (skus) => {
  if (!skus.length) return [];
  const clause = skus.map(s => `sku:${JSON.stringify(s)}`).join(' OR ');
  const q = `query { productVariants(first:250, query: "${clause}") { nodes { id sku inventoryItem { id } } } }`;
  const d = await GQL(q);
  return d.productVariants.nodes || [];
};

const setInventorySingleLocation = async (variantsBySku, locationName) => {
  const locationId = await getLocationId(locationName);
  if (!locationId) return;
  const items = await getVariantInventoryItems(Object.keys(variantsBySku));
  const changes = items.map(n => ({
    inventoryItemId: n.inventoryItem.id,
    locationId, availableDelta: Number(variantsBySku[n.sku] ?? 0)
  }));
  if (!changes.length) return;
  const m = `mutation($changes:[InventoryAdjustItem!]!){
    inventoryAdjustQuantities(input:{ name:SET_AVAILABLE, reason:OTHER, changes:$changes }){
      userErrors { field message }
    }
  }`;
  await GQL(m, { changes });
};

const sectionRefresh = async (handlesToTouch = []) => {
  for (const h of handlesToTouch) {
    try { await fetch(`${domain}/?section_id=main-product&handle=${encodeURIComponent(h)}`); } catch {}
  }
};

const main = async () => {
  const products = readCSV('./products.csv');
  const variants = readCSV('./variants.csv');
  const media = readCSV('./media.csv');
  const metafields = readCSV('./metafields.csv');

  const imagesByHandle = media.reduce((m, r) => ((m[r.handle] ||= []).push(r), m), {});
  const variantsByHandle = variants.reduce((m, r) => ((m[r.handle] ||= []).push(r), m), {});
  const metafieldsByHandle = metafields.reduce((m,r)=>((m[r.handle] ||= []).push(r), m), {});
  const inventoryBySku = variants.reduce((m, r) => (m[r.sku]=Number(r.inventory_quantity||0), m), {});

  const touched = [];
  for (const p of products) {
    const id = await upsertProduct(p);
    const vrows = variantsByHandle[p.handle] || [];
    await upsertVariants(id, p.handle, vrows);
    if (imagesByHandle[p.handle]?.length) await setProductImages(id, imagesByHandle[p.handle]);
    if (metafieldsByHandle[p.handle]?.length) await setMetafields(id, metafieldsByHandle[p.handle]);
    touched.push(p.handle);
  }
  if (Object.keys(inventoryBySku).length) await setInventorySingleLocation(inventoryBySku, process.env.INVENTORY_LOCATION_NAME || 'Primary');
  await sectionRefresh(touched);
  console.log('Sync complete.');
};
main().catch(e => { console.error(e); process.exit(1); });
