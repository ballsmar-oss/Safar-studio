// صور المنتجات المضمّنة في الموقع (src/assets/products). المنتج يشير لها باسم الملف فقط، مثل "pen-bic.webp".
// الصور اللي ترفعها من لوحة التحكم تنحفظ على السيرفر ويكون رابطها يبدأ بـ /uploads/.
const PRODUCT_IMAGES = import.meta.glob("../assets/products/*.{webp,png,jpg,jpeg}", {
  eager: true,
  import: "default",
});

export function resolveProductImage(c) {
  if (c) {
    if (c.startsWith("/") || c.startsWith("data:")) {
      return c;
    } else {
      return Object.entries(PRODUCT_IMAGES).find(([o]) =>
        o.endsWith(`/${c}`),
      )?.[1];
    }
  } else {
    return undefined;
  }
}
