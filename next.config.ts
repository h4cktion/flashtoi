// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   /* config options here */
// };

// export default nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "d7zmbymnvbmu2.cloudfront.net",
        pathname: "/**",
      },
    ],
  },
  // Sharp est géré nativement par Next.js 15 (pas de config webpack nécessaire)
};

module.exports = nextConfig;
