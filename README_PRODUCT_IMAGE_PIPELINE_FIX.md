# Product image pipeline fix

This update repairs the full product image pipeline after multi-image upload support was introduced.

## What changed

- New image records always save the Storage public URL into both `product_images.url` and `product_images.image_url`.
- Public product queries fetch both URL columns and use `image_url ?? url`.
- Product cards choose the main image first and fall back to the first sorted image.
- Product detail pages map all valid image rows for the gallery.
- Multi-image uploads are normalized so exactly one image is marked as main.
- Development-only logs were added in repository code.

## Supabase verification query

Run this in Supabase SQL Editor after creating a test product:

```sql
select
  id,
  product_id,
  url,
  image_url,
  alt_text,
  sort_order,
  is_main
from public.product_images
order by created_at desc, sort_order asc;
```

For each newly uploaded image, `url` and `image_url` should both contain a full public Storage URL.
