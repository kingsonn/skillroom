/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // Enable standalone mode for Cloud Run
  experimental: {
    serverActions: true,
  },
  images: {
    domains: ['lh3.googleusercontent.com'], // Add any image domains you're using
  },
}

module.exports = nextConfig
