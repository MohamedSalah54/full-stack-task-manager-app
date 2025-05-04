/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],  // إضافة localhost هنا للسماح بتحميل الصور
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3001',
        pathname: '/static/uploads/**', // مسار صحيح للصور
      },
    ],
  },
};

module.exports = nextConfig;
