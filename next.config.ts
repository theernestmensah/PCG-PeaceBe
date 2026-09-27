import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const mediaUrl = process.env.NEXT_PUBLIC_MEDIA_URL;

const nextConfig: NextConfig = {
  // Pin the project root. A stray lockfile higher up would otherwise be picked up.
  turbopack: {
    root: process.cwd(),
  },
  images: {
    // Images and audio live in R2 and are served from NEXT_PUBLIC_MEDIA_URL.
    remotePatterns: mediaUrl ? [new URL(`${mediaUrl.replace(/\/$/, "")}/**`)] : [],
  },
};

export default nextConfig;

// Makes Cloudflare bindings available to `next dev`.
initOpenNextCloudflareForDev();
