# Admin site content media

Homepage hero images, slider images, promo banners, notices, footer trust badges, brand logos, and category images are written to the persistent host filesystem through protected server actions.

Configure production with:

```env
MEDIA_STORAGE_DRIVER=minio
MINIO_ENDPOINT=http://localhost:9000
MINIO_REGION=us-east-1
MINIO_ACCESS_KEY=
MINIO_SECRET_KEY=
MINIO_BUCKET=saco-media
MINIO_PUBLIC_BASE_URL=http://localhost:9000/saco-media
MINIO_FORCE_PATH_STYLE=true
```

Examples of new public database URLs:

```txt
/uploads/site-media/homepage/hero/hero-main.webp
/uploads/site-media/homepage/hero/hero-mobile.webp
/uploads/site-media/banners/promo-main.webp
/uploads/site-media/footer/trust-badge.webp
```

The MinIO bucket or reverse proxy/CDN must expose uploaded objects through `MINIO_PUBLIC_BASE_URL`. Legacy `/uploads/...` and Supabase Storage URLs remain supported for display.
