'use client'
import './globals.css'

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
          <p>We shadowed clinicians for 100 hours and counted every clic
