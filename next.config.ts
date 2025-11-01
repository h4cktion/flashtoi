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
  // Configuration webpack pour Sharp sur Vercel
  webpack: (config: any) => {
    config.externals = [...config.externals, { sharp: 'commonjs sharp' }];
    return config;
  },
};

module.exports = nextConfig;
