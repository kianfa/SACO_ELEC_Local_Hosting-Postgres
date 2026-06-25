function minioRemotePattern() {
  const publicBaseUrl = process.env.MINIO_PUBLIC_BASE_URL?.trim()
  if (!publicBaseUrl || publicBaseUrl.startsWith("/")) return null

  try {
    const url = new URL(publicBaseUrl)
    return {
      protocol: url.protocol.replace(":", ""),
      hostname: url.hostname,
      port: url.port || undefined,
      pathname: `${url.pathname.replace(/\/+$/, "")}/**`,
    }
  } catch {
    return null
  }
}

const minioPattern = minioRemotePattern()

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    cpus: 1,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      ...(minioPattern ? [minioPattern] : []),
    ],
  },
}

export default nextConfig
