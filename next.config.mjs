/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
      appDir: true, // Enables the app directory
    },
    webpack: (config) => {
      // Alias for the uploads folder to use in the project
      const path = require('path');
      config.resolve.alias['@uploads'] = path.resolve(__dirname, 'uploads');
      return config;
    },
  };
  
  export default nextConfig;
  