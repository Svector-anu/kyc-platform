/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      };
    }
    return config;
  },

  async headers() {
    // CSP disabled in development to allow WalletConnect
    // Re-enable in production with proper domains
    return [];
  },
};

module.exports = nextConfig;