/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'zagato.solus.studio',
      },
    ],
  },
};

export default nextConfig;
