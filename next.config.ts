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
    if (process.env.NODE_ENV === 'development') {
      return [
        {
          source: '/:path*',
          headers: [
            {
              key: 'Content-Security-Policy',
              value: [
                "default-src 'self'",
                "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
                "style-src 'self' 'unsafe-inline'",
                "img-src 'self' data: https: blob:",
                "font-src 'self' data:",
                // ADD YOUR IP HERE ↓
                "connect-src 'self' http://localhost:* ws://localhost:* http://172.20.10.14:* ws://172.20.10.14:* https://*.alchemy.com https://*.sepolia.io https://*.infura.io wss://*.infura.io https://*.polygonid.me https://*.web3modal.org https://*.walletconnect.com https://*.walletconnect.org wss://*.walletconnect.com wss://*.walletconnect.org https://rpc.walletconnect.com https://*.coinbase.com https://cca-lite.coinbase.com",
                "frame-src 'self'",
                "worker-src 'self' blob:",
              ].join('; '),
            },
          ],
        },
      ];
    }
    return [];
  },
};

module.exports = nextConfig;