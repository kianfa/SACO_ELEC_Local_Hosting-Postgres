import { readFileSync } from "node:fs"

const read = (file) => readFileSync(new URL(`../${file}`, import.meta.url), "utf8")
const checks = []
function check(label, condition) {
  checks.push({ label, condition })
  if (!condition) console.error(`FAIL: ${label}`)
}

const migration = read("supabase/migrations/20260606_product_variants.sql")
const publicRepo = read("lib/repositories/products-repository.ts")
const adminRepo = read("lib/repositories/admin-products-repository.ts")
const service = read("lib/services/admin-products-service.ts")
const form = read("components/admin/product-form.tsx")
const rpcAction = read("components/checkout/callback-request-card.tsx")
const cart = read("lib/cart/cart-store.tsx")
const detail = read("components/product-detail/product-info.tsx")
const listing = read("components/product-listing-card.tsx")

check("migration creates product_variants table", migration.includes("create table if not exists public.product_variants"))
check("migration uses product cascade delete", migration.includes("references public.products(id) on delete cascade"))
check("migration creates product index", migration.includes("idx_product_variants_product_id"))
check("migration prevents duplicate normalized labels", migration.includes("lower(btrim(label))"))
check("purchase RPC requires variant for variant products", migration.includes("raise exception 'variant_required'"))
check("purchase RPC rejects inactive or mismatched variants", migration.includes("raise exception 'invalid_or_inactive_variant'"))
check("purchase RPC loads variant price from database", migration.includes("v_unit_price := greatest(0, coalesce(v_variant.price, 0))"))
check("purchase request stores variant snapshot", migration.includes("variant_label"))
check("public product reads variants in joined query", publicRepo.includes("product_variants(id, label, price, sort_order, is_active)"))
check("public product computes minimum active variant price", publicRepo.includes("Math.min(...variants.map((variant) => variant.price))"))
check("admin repository replaces variants", adminRepo.includes("replaceProductVariants"))
check("admin validation rejects duplicate labels", service.includes("seenVariantLabels.has"))
check("admin form has free-form Persian variant section", form.includes("تنوع‌ها و قیمت‌های محصول") && form.includes("عنوان گزینه") && form.includes("افزودن گزینه جدید"))
check("admin form supports reorder and active toggle", form.includes("moveVariant") && form.includes("فعال"))
check("cart stores selected variant id and label", cart.includes("selectedVariantId") && cart.includes("selectedVariantLabel"))
check("cart line identity distinguishes variants", cart.includes("`${productId}:${selectedVariantId}`"))
check("checkout sends selected variant id", rpcAction.includes("variantId: item.selectedVariantId"))
check("detail page requires selection", detail.includes("لطفاً یکی از گزینه‌های محصول را انتخاب کنید"))
check("listing card shows minimum-price wording", listing.includes("شروع قیمت از"))

const failed = checks.filter((item) => !item.condition)
if (failed.length) process.exit(1)
console.log(`All ${checks.length} product-variant checks passed.`)
