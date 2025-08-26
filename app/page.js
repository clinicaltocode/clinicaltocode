import Link from 'next/link'
import { getAllPosts } from '../lib/posts'
import Navigation from '../components/Navigation'
import Hero from '../components/Hero'
import ArticleCard from '../components/ArticleCard'
import Sidebar from '../components/Sidebar'
import Footer from '../components/Footer'
import NewsletterSignup from '../components/NewsletterSignup'

export default async function Home() {
  const posts = await getAllPosts()
  
  return (
    <>
      <Navigation />
      <Hero />
      
      {/* Stats Bar */}
      <section className="stats-bar">
        <div className="stats-container">
          <div className="stat-item">
            <h3>500+</h3>
            <p>Clinical Contributors</p>
          </div>
          <div className="stat-item">
            <h3>15+</h3>
            <p>Years Clinical Experience</p>
          </div>
          <div className="stat-item">
            <h3>Bridge</h3>
            <p>Clinical-IT Gap</p>
          </div>
          <div className="stat-item">
            <h3>Real</h3>
            <p>Frontline Insights</p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="main-content">
        <section className="articles-section">
          <h2>Clinical Perspectives on Healthcare Technology</h2>
          <div className="articles-grid">
            {posts.slice(0, 4).map((post, index) => (
              <ArticleCard key={post.slug} post={post} />
            ))}
            
            {/* Ad Space after 4 articles */}
            <div className="ad-space" id="ad-content-1">
              {/* Google AdSense will be inserted here */}
              <p>Advertisement<br /><small>Premium healthcare IT placement</small></p>
            </div>
            
            {posts.slice(4, 6).map((post, index) => (
              <ArticleCard key={post.slug} post={post} />
            ))}
          </div>
        </section>

        <Sidebar recentPosts={posts.slice(0, 5)} />
      </main>

      <NewsletterSignup />
      <Footer />
    </>
  )
}
