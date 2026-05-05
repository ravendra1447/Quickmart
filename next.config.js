/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['13.63.206.97', 'via.placeholder.com', 'lh3.googleusercontent.com'],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://13.63.206.97:5000/api/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
