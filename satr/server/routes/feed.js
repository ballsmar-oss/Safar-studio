import { Router } from "express";
import { categories, getSettings, listProducts } from "../db.js";
import { getConfig } from "../integrations/index.js";
import { baseUrl } from "./helpers.js";

export const feedRouter = Router();

const xml = (s) => String(s ?? "").replace(/[<>&'"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[c]);

// ملف المنتجات بصيغة Google Merchant (RSS 2.0) — يقبله Google وMeta وتيك توك وسناب
feedRouter.get("/products.xml", (req, res) => {
  if (!getConfig("feed").enabled) return res.status(404).send("Feed disabled");
  const base = baseUrl(req);
  const settings = getSettings();
  const imageUrl = (image) => (image.startsWith("/") ? `${base}${image}` : `${base}/catalog-images/${image}`);
  const items = listProducts()
    .filter((p) => p.image && !p.image.startsWith("data:"))
    .map((p) => {
      const category = categories.find((c) => c.id === p.category)?.name ?? "";
      return `    <item>
      <g:id>${xml(p.id)}</g:id>
      <g:title>${xml(p.name)}</g:title>
      <g:description>${xml(p.description || p.name)}</g:description>
      <g:link>${xml(`${base}/#/product/${encodeURIComponent(p.id)}`)}</g:link>
      <g:image_link>${xml(imageUrl(p.image))}</g:image_link>
      <g:availability>${p.stock > 0 ? "in_stock" : "out_of_stock"}</g:availability>
      <g:price>${(p.oldPrice ?? p.price).toFixed(2)} SAR</g:price>${p.oldPrice ? `\n      <g:sale_price>${p.price.toFixed(2)} SAR</g:sale_price>` : ""}
      <g:condition>new</g:condition>
      <g:brand>${xml(p.brand || settings.storeName)}</g:brand>
      <g:identifier_exists>no</g:identifier_exists>
      <g:product_type>${xml(category)}</g:product_type>
      <g:google_product_category>Office Supplies</g:google_product_category>
    </item>`;
    });
  res.type("application/xml").send(`<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>${xml(settings.storeName)}</title>
    <link>${xml(base)}</link>
    <description>${xml(`منتجات ${settings.storeName}`)}</description>
${items.join("\n")}
  </channel>
</rss>
`);
});
