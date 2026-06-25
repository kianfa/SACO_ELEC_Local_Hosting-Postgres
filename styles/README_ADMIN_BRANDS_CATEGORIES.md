# Admin brand and category media

Brand logos and category images are uploaded through protected server actions and saved directly in the persistent host filesystem.

Configure:

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

New database values are MinIO public URLs such as `https://cdn.example.com/site-media/brands/siemens/logo.webp` and `https://cdn.example.com/site-media/categories/cables/homepage.webp`. Existing `/uploads/...` and Supabase Storage URLs remain readable for backward compatibility.
