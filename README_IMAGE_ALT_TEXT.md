# Image ALT text and safe fallback update

This update adds editable ALT text and polished fallbacks for public images.

## Required Supabase migration

Run the contents of this file in Supabase SQL Editor:

```text
supabase/migrations/20260531_image_alt_text.sql
```

It only adds optional text columns:

- `categories.homepage_image_alt_text`
- `categories.homepage_icon_alt_text`
- `site_banners.image_alt_text`

`product_images.alt_text` already existed and is reused. No RLS policy changes are required for these new columns.

## Admin locations

- Product images: `/admin/products/new` and `/admin/products/[id]/edit`
- Category images/icons: `/admin/content/homepage-categories`
- Hero slider images: `/admin/content/homepage`
- Banner image: `/admin/content/banners`
- Footer trust badge: `/admin/content/settings`

## Backward compatibility

Existing image URLs keep working if ALT text is empty. Public components use descriptive fallback labels based on product/category/banner titles.
