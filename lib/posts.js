import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { remark } from 'remark'
import html from 'remark-html'

const postsDirectory = path.join(process.cwd(), 'content/articles')

export async function getAllPosts() {
  // Create directory if it doesn't exist
  if (!fs.existsSync(postsDirectory)) {
    fs.mkdirSync(postsDirectory, { recursive: true })
  }
  
  const fileNames = fs.readdirSync(postsDirectory)
  const allPostsData = await Promise.all(fileNames.map(async (fileName) => {
    const slug = fileName.replace(/\.md$/, '')
    const fullPath = path.join(postsDirectory, fileName)
    const fileContents = fs.readFileSync(fullPath, 'utf8')
    const { data, content } = matter(fileContents)
    
    // Calculate read time
    const wordsPerMinute = 200
    const wordCount = content.split(/\s+/).length
    const readTime = Math.ceil(wordCount / wordsPerMinute)
    
    return {
      slug,
      ...data,
      readTime,
    }
  }))
  
  // Sort posts by date
  return allPostsData.sort((a, b) => {
    if (a.date < b.date) return 1
    else return -1
  })
}

export async function getPostBySlug(slug) {
  const fullPath = path.join(postsDirectory, `${slug}.md`)
  const fileContents = fs.readFileSync(fullPath, 'utf8')
  const { data, content } = matter(fileContents)
  
  // Convert markdown to HTML
  const processedContent = await remark()
    .use(html)
    .process(content)
  const contentHtml = processedContent.toString()
  
  // Calculate read time
  const wordsPerMinute = 200
  const wordCount = content.split(/\s+/).length
  const readTime = Math.ceil(wordCount / wordsPerMinute)
  
  return {
    slug,
    content: contentHtml,
    readTime,
    ...data,
  }
}
