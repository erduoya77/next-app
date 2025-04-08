const fs = require('fs')
const path = require('path')
const { promisify } = require('util')
const copyFile = promisify(fs.copyFile)
const mkdir = promisify(fs.mkdir)

async function copyImages() {
  const contentPath = path.join(process.cwd(), 'content')
  const publicPath = path.join(process.cwd(), 'public')

  // 递归复制图片文件
  async function copyDir(src, dest) {
    const entries = await fs.promises.readdir(src, { withFileTypes: true })
    
    for (const entry of entries) {
      const srcPath = path.join(src, entry.name)
      const destPath = path.join(dest, entry.name)
      
      if (entry.isDirectory()) {
        await mkdir(destPath, { recursive: true })
        await copyDir(srcPath, destPath)
      } else if (/\.(png|jpg|jpeg|gif|svg)$/i.test(entry.name)) {
        await copyFile(srcPath, destPath)
        
      }
    }
  }

  try {
    // 复制 content/posts 目录到 public/posts
    const postsSrcPath = path.join(contentPath, 'posts')
    const postsDestPath = path.join(publicPath, 'posts')
    await mkdir(postsDestPath, { recursive: true })
    await copyDir(postsSrcPath, postsDestPath)
    
  } catch (error) {
    console.error('Error copying images:', error)
  }
}

copyImages() 