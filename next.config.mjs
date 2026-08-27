/** @type {import('next').NextConfig} */
const nextConfig = {
  // Use standalone output for production deployment with custom server
  output: 'standalone',
  
  // Disable the built-in Next.js server — we use a custom Express server
  // that handles /api/* routes and delegates everything else to Next.js
  experimental: {
    // Required for Next.js 15 to work with custom server
  },

  // Ensure the @ alias works the same way as in Vite
  // (Next.js resolves this via tsconfig paths automatically)

  // Image optimization configuration
  images: {
    remotePatterns: [],
  },

  // Suppress the "you are using a custom server" warning in dev
  reactStrictMode: true,
};

export default nextConfig;
