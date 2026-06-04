/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      { source: '/super-admin', destination: '/admin/users', permanent: true },
      { source: '/super-admin/users', destination: '/admin/users', permanent: true },
      { source: '/super-admin/audit', destination: '/admin/audit', permanent: true },
      { source: '/super-admin/system-health', destination: '/admin/system-health', permanent: true },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.API_URL ?? 'http://localhost:3001'}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
