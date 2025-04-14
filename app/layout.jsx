import dynamic from 'next/dynamic';
import { getDirectories, getAllTags } from '@/lib/api'
import { config } from '@/config/config'
import { ThemeProvider } from 'next-themes'
import Toolbar from '@/app/components/Toolbar'
import Comments from '@/app/components/Comments'
import './styles/globals.css'

// 动态导入侧边栏组件，优化首屏加载
const Sidebar = dynamic(() => import('./components/layout/Sidebar'), {
  ssr: true,
  loading: () => (
    <div className="fixed inset-y-0 left-0 w-64 bg-gray-100 dark:bg-gray-800 animate-pulse"></div>
  )
});

export const metadata = {
  title: config.site.title,
  description: config.site.description,
  alternates: {
    canonical: process.env.NEXT_PUBLIC_BASE_URL,
    types: {
      'application/rss+xml': [
        { url: 'api/rss', title: `${config.site.title} RSS Feed` }
      ]
    }
  }
}

export default async function RootLayout({ children }) {
  // 获取目录和标签数据
  const directories = await getDirectories()
  const tags = await getAllTags()

  return (
    <html lang="zh-CN" suppressHydrationWarning className="h-full">
      <head>
        <link 
          rel="stylesheet" 
          href="https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;500;600;700&display=swap" 
        />
        <link 
          rel="stylesheet" 
          href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github.min.css"
        />
        <link 
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/aplayer/1.10.1/APlayer.min.css"
        />
        <link 
          rel="alternate" 
          type="application/rss+xml" 
          title={`${config.site.title} RSS Feed`} 
          href="/api/rss" 
        />
        <link 
          rel="sitemap" 
          type="application/xml" 
          href="/sitemap.xml" 
        />
        <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js" />
        <script src="https://cdnjs.cloudflare.com/ajax/libs/aplayer/1.10.1/APlayer.min.js" />
        <script 
          src="https://cdn.jsdelivr.net/npm/meting@2.0.1/dist/Meting.min.js"
          defer
        ></script>
      </head>
      <body className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300 h-full">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem={true}
        >
          <div className="min-h-screen">
            <Sidebar 
              tags={tags} 
              directories={directories}
              social={config.social}
              footer={config.footer}
            />
            <main className="relative z-[35] lg:ml-64 flex-1 p-4 lg:p-8 min-h-screen">
              {children}
              <Comments />
            </main>
          </div>
          <Toolbar />
        </ThemeProvider>
      </body>
    </html>
  )
} 