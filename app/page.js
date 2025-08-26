export default function Home() {
  return (
    <div>
      <header className="header">
        <nav className="nav">
          <a href="/" className="logo">Clinical to Code</a>
          <div className="nav-menu">
            <a href="#articles">Articles</a>
            <a href="#about">About</a>
            <a href="#contact">Contact</a>
          </div>
        </nav>
      </header>

      <section className="hero">
        <h1>From Bedside to Backend</h1>
        <p>Bridging Clinical Wisdom with IT Innovation</p>
      </section>

      <main className="main-content">
        <div className="article-card">
          <h3>Why Your EHR is Failing Nurses</h3>
          <p>After two decades at the bedside, here's what IT leaders need to understand about nursing workflows.</p>
          <a href="#">Read More →</a>
        </div>

        <div className="article-card">
          <h3>From ER Doctor to Epic Builder</h3>
          <p>How my emergency medicine background revolutionized our hospital's clinical decision support.</p>
          <a href="#">Read More →</a>
        </div>

        <div className="article-card">
          <h3>The Hidden 47 Clicks</h3>
          <p>We shadowed clinicians for 100 hours and counted every click. The disconnect will shock you.</p>
          <a href="#">Read More →</a>
        </div>
      </main>

      <footer className="footer">
        <p>© 2024 Clinical to Code. Where Healthcare Experience Meets IT Innovation</p>
      </footer>

      <style jsx global>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, Arial, sans-serif;
          line-height: 1.6;
        }
        .header {
          background: white;
          padding: 20px;
          border-bottom: 1px solid #e5e7eb;
          position: sticky;
          top: 0;
        }
        .nav {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
        }
        .logo {
          font-size: 24px;
          font-weight: bold;
          color: #0066cc;
          text-decoration: none;
        }
        .nav-menu {
          display: flex;
          gap: 30px;
        }
        .nav-menu a {
          color: #333;
          text-decoration: none;
        }
        .hero {
          background: linear-gradient(135deg, #667eea, #764ba2);
          padding: 80px 20px;
          text-align: center;
          color: white;
        }
        .hero h1 {
          font-size: 48px;
          margin-bottom: 20px;
        }
        .main-content {
          max-width: 1200px;
          margin: 60px auto;
          padding: 0 20px;
        }
        .article-card {
          background: white;
          padding: 25px;
          margin-bottom: 30px;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .article-card h3 {
          color: #0066cc;
          margin-bottom: 10px;
        }
        .footer {
          background: #333;
          color: white;
          padding: 40px;
          text-align: center;
        }
        @media (max-width: 768px) {
          .hero h1 { font-size: 32px; }
          .nav-menu { display: none; }
        }
      `}</style>
    </div>
  )
}
