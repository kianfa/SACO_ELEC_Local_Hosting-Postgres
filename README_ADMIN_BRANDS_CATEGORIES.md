# Admin brand and category media

Brand logos and category images are uploaded through protected server actions and saved directly in the persistent host filesystem.

Configure:

```env
MEDIA_UPLOAD_DIR=/home/USERNAME/public_html/uploads
NEXT_PUBLIC_MEDIA_BASE_URL=/uploads
```

New database values are public URLs such as `/uploads/site-media/brands/siemens/logo.webp` and `/uploads/site-media/categories/cables/homepage.webp`. Existing Supabase Storage URLs remain readable for backward compatibility.
