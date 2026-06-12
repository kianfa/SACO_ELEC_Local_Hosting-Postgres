# Admin site content media

Homepage hero images, slider images, promo banners, notices, footer trust badges, brand logos, and category images are written to the persistent host filesystem through protected server actions.

Configure production with:

```env
MEDIA_UPLOAD_DIR=/home/USERNAME/public_html/uploads
NEXT_PUBLIC_MEDIA_BASE_URL=/uploads
```

Examples of new public database URLs:

```txt
/uploads/site-media/homepage/hero/hero-main.webp
/uploads/site-media/homepage/hero/hero-mobile.webp
/uploads/site-media/banners/promo-main.webp
/uploads/site-media/footer/trust-badge.webp
```

The Node.js process needs write permission and the web server must expose the configured directory at `/uploads`. Legacy Supabase Storage URLs remain supported for display.
