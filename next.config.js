/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'images.pexels.com',
      'dealertower.app',
      'reel-wheel-api-x92jj.ondigitalocean.app'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  env: {
    NEXT_PUBLIC_API_BASE_URL: 'https://reel-wheel-api-x92jj.ondigitalocean.app',
  },
}

module.exports = nextConfig