// next.config.ts
import { NextConfig } from 'next';

const config: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/socketio',
        destination: 'http://localhost:3001/api/socketio',
      },
    ];
  },
  webpack: (config) => {
    config.externals = [...(config.externals || []), {
      'utf-8-validate': 'commonjs utf-8-validate',
      'bufferutil': 'commonjs bufferutil',
    }];
    return config;
  },
};

export default config;