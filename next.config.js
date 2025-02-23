/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
    dirs: ['pages', 'components'],
  },
};

module.exports = nextConfig;