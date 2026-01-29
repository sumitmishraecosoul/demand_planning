/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Allow cross-origin requests in development (for mobile/network testing)
  experimental: {
    allowedDevOrigins: [
      '192.168.50.29:3000', // Your local network IP
      'localhost:3000',
    ],
  },
  
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:5002/api/:path*',
      },
    ];
  },
}

module.exports = nextConfig
