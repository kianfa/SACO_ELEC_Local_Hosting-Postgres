# Product multi-image upload

The admin product form supports selecting multiple JPG, PNG or WebP files at once and adding more files before saving.

## Behavior

- Every selected file gets its own preview card and editable ALT text.
- One non-deleted image is normalized as the main image.
- The admin can select another main image or remove images individually.
- Existing edit-page images and newly selected images share the same preview-card UX.
- Files are uploaded to MinIO under `products/{slug}/` with unique safe filenames.
- Each successful upload is inserted immediately into `product_images`, so a later failed file does not silently discard previously saved records.
- Explicitly removed existing images are deleted from Storage and `product_images`.

No database migration is required. The implementation uses the existing `product_images` columns:

- `product_id`
- `url`
- `image_url`
- `alt_text`
- `sort_order`
- `is_main`
