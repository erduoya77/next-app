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
  // 添加重定向配置
  async redirects() {
    return [
      {
        source: '/rss',
        destination: '/api/rss',
        permanent: true,
      },
      {
        source: '/feed',
        destination: '/api/rss',
        permanent: true,
      },
      {
        source: '/rss.xml',
        destination: '/api/rss',
        permanent: true,
      },
    ]
  },
}

module.exports = nextConfig 