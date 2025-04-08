/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'https',
        hostname: 'memos.erduoya.top',
        port: '',
        pathname: '/o/r/**',
      },
    ],
  },
  // 添加静态文件处理
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(png|jpg|jpeg|gif|svg)$/i,
      type: 'asset/resource',
    })
    return config
  },
}

module.exports = nextConfig 