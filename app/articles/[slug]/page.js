import { getPostBySlug, getAllPosts } from '../../../lib/posts'
import Navigation from '../../../components/Navigation'
import Footer from '../../../components/Footer'
import AuthorBox from '../../../components/AuthorBox'
import ShareButtons from '../../../components/ShareButtons'
import RelatedArticles from '../../../components/RelatedArticles'

export async function generateStaticParams() {
  const posts = await getAllPosts()
  return posts.map((post) => ({
    slug: post.slug,
  }))
}

export async function generateMetadata({ params }) {
  const post = await getPostBySlug(params.slug)
  
  return {
    title: `${post.title} | Clinical to Code`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.date,
      authors: [post.author],
      images: [post.featuredImage],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
    },
  }
}

export default async function Article({ params }) {
  const post = await getPostBySlug(params.slug)
  const relatedPosts = await getAllPosts() // In production, filter for related
  
  return (
    <>
      <Navigation />
      
      <article className="article-container">
        <header className="article-header">
          <div className="article-meta">
            <span className="category">{post.category}</span>
            <span className="date">{new Date(post.date).toLocaleDateString()}</span>
            <span className="read-time">{post.readTime} min read</span>
          </div>
          <h1>{post.title}</h1>
          <p className="excerpt">{post.excerpt}</p>
          <AuthorBox author={post.author} />
        </header>

        <div className="article-content">
          <div className="content-body" dangerouslySetInnerHTML={{ __html: post.content }} />
          
          {/* In-article ad placement */}
          <div className="ad-space-article" id="ad-article-1">
            {/* Ad code here */}
          </div>
          
          <ShareButtons url={`https://clinicaltocode.com/articles/${post.slug}`} title={post.title} />
        </div>

        <RelatedArticles posts={relatedPosts.slice(0, 3)} currentSlug={post.slug} />
      </article>
      
      <Footer />
    </>
  )
}
