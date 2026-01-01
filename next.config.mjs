/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
   webpack: (config) => {
  config.resolve.fallback = {
    fs: false,
    crypto: false,
    path: false,
  };
  // config.resolve.alias['@vladmandic/human'] = '@vladmandic/human/dist/human.esm.js';

  config.resolve.alias = {
    ...config.resolve.alias,
    '@vladmandic/human': '@vladmandic/human/dist/human.esm.js',
  };

  return config;
},


}


export default nextConfig
