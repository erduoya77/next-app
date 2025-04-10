import Sidebar from './components/Sidebar'
import ViewImage from './components/ViewImage'
import { getDirectories, getAllTags } from '@/lib/api'
import { config } from '@/config/config'
import { ThemeProvider } from 'next-themes'
import Toolbar from '@/app/components/Toolbar'
import Comments from '@/app/components/Comments'
import './styles/globals.css'

export const metadata = {
  title: config.site.title,
  description: config.site.description,
}

export default async function RootLayout({ children }) {
  // 获取目录和标签数据
  const directories = await getDirectories()
  const tags = await getAllTags()

  return (
    <html lang="zh-CN" suppressHydrationWarning>
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
        <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js" />
        <script src="https://cdnjs.cloudflare.com/ajax/libs/aplayer/1.10.1/APlayer.min.js" />
        <script 
          src="https://cdn.jsdelivr.net/npm/meting@2.0.1/dist/Meting.min.js"
          defer
        ></script>
      </head>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem={true}
          disableTransitionOnChange
        >
          <div className="min-h-screen bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100">
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
          <ViewImage />
          <Toolbar />
        </ThemeProvider>
      </body>
    </html>
  )
} 