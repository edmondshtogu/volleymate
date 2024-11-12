import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // output: "export",
  basePath: "/volleyball-bot",
  images: {
    unoptimized: true,
    domains: [
      "images.pexels.com",
      "store.sony.com.au",
      "www.pngmart.com",
      "images.samsung.com",
      "raylo.imgix.net",
      "www.signify.com",
      "www.smartworld.it",
      "www.pngarts.com",
      "5.imimg.com",
      "img.productz.com",
      "venturebeat.com",
    ],
  },
};

export default nextConfig;
